import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import paymentService, {
  type PaymentServiceResponse,
} from "../config/payment.service.js";
import { getStripeClient } from "./stripe.service.js";
import { createPaymentAttempt } from "./paymentAttempt.services.js";
import type { JwtUser } from "../types/auth.js";
import type {
  CreatePaymentInput,
  ProcessSubscriptionPaymentInput,
} from "../validation/payment.validation.js";
import type { Prisma } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

const paymentInclude = {
  plan: { select: { id: true, name: true, price: true, duration: true } },
  subscription: { select: { id: true, status: true, endDate: true } },
  attempts: {
    select: {
      id: true,
      gateway: true,
      status: true,
      attemptNumber: true,
      providerPaymentId: true,
    },
  },
} as const satisfies Prisma.PaymentInclude;

const userPaymentInclude = {
  ...paymentInclude,
  user: {
    select: { id: true, email: true, userName: true, name: true, role: true },
  },
} as const satisfies Prisma.PaymentInclude;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const extractRemoteStatus = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "INITIATED";
  const obj = payload as Record<string, unknown>;

  for (const key of ["status", "state", "paymentStatus", "payment_status"]) {
    const value = obj[key];
    if (typeof value === "string") return value;
  }

  for (const key of ["transaction", "data", "payment"]) {
    const nested = obj[key];
    if (nested && typeof nested === "object") {
      const nestedStatus = extractRemoteStatus(nested);
      if (nestedStatus) return nestedStatus;
    }
  }

  return "INITIATED";
};

const isPaidStatus = (status: string): boolean => {
  const normalized = status.toLowerCase();
  return [
    "success",
    "succeeded",
    "completed",
    "complete",
    "paid",
    "active",
  ].includes(normalized);
};

const syncUserSubscription = async (
  userId: string,
  planPrice: number,
  endDate: Date | null
) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscription_type: planPrice > 0 ? "premium" : "free",
      subscription_status: "active",
      subscription_end_date: endDate,
    },
  });
};

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

interface PaymentHistoryOptions{
  page?:number;
  limit?:number;
}

export const getPaymentHistory = async (userId: string,{page = 1, limit = 10}: PaymentHistoryOptions = {}) => {
  const skip=(page-1)*limit;
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      include: paymentInclude,
      orderBy: { paymentDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: { userId } }),
  ]);
  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPaymentStatus = async (
  transactionId: string,
  requester: JwtUser
) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: paymentInclude,
  });

  if (!payment) {
    throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
  }

  if (requester.role !== "admin" && payment.userId !== requester.id) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  let transactionStatus: PaymentServiceResponse | null = null;
  const lastAttempt = payment.attempts[0];
  if(lastAttempt?.providerPaymentId){
    try {
      transactionStatus = await paymentService.getTransactionStatus(
        lastAttempt.providerPaymentId
      );
    } catch (error) {
      console.error(
        "Payment service status lookup failed:",
        error instanceof Error ? error.message : error
      );
    }
  }

  return { payment, transactionStatus };
};

export const getAllPayments = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      include: userPaymentInclude,
      orderBy: { paymentDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count(),
  ]);
  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ---------------------------------------------------------------------------
// Create / process payments
// ---------------------------------------------------------------------------

export const createPayment = async (
  userId: string,
  data: CreatePaymentInput
) => {
  if (data.planId) {
    const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
    if (!plan) {
      throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
    }
  }

  if (data.subscriptionId) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: data.subscriptionId },
    });
    if (!subscription) {
      throw new AppError("Subscription not found", 404, "SUBSCRIPTION_NOT_FOUND");
    }
    if (subscription.userId !== userId) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }
  }

  const paymentResult = await paymentService.createPaymentTransaction({
    userId,
    amount: data.amount,
    paymentMethod: data.paymentMethod ?? "card",
    metadata: {
      purpose: data.purpose,
      ...(data.planId ? { planId: data.planId } : {}),
      ...(data.subscriptionId ? { subscriptionId: data.subscriptionId } : {}),
    },
  });

  const transactionId = paymentResult.transactionId;
  if (!transactionId) {
    throw new AppError(
      "Failed to create payment transaction",
      502,
      "PAYMENT_TRANSACTION_FAILED"
    );
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      planId: data.planId ?? null,
      subscriptionId: data.subscriptionId ?? null,
      amount: data.amount,
      currency: data.currency ?? "usd",
      paymentStatus: "PENDING",
      transactionId,
      paymentDate: new Date(),
      purpose: data.purpose,
    },
    include: paymentInclude,
  });

  return { transactionId, payment };
};

export const processSubscriptionPayment = async (
  userId: string,
  data: ProcessSubscriptionPaymentInput
) => {
  const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
  if (!plan) {
    throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
  }

  const paymentResult = await paymentService.createPaymentTransaction({
    userId,
    amount: plan.price,
    paymentMethod: data.paymentMethod ?? "card",
    metadata: { purpose: "subscription", planId: plan.id },
  });

  const transactionId = paymentResult.transactionId;
  if (!transactionId) {
    throw new AppError(
      "Failed to create payment transaction",
      502,
      "PAYMENT_TRANSACTION_FAILED"
    );
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      planId: plan.id,
      amount: plan.price,
      currency: "usd",
      paymentStatus: "PENDING",
      transactionId,
      paymentDate: new Date(),
      purpose: "subscription",
    },
    include: paymentInclude,
  });


  let remoteStatus = "";
  try {
    const remote = await paymentService.getTransactionStatus(transactionId);
    remoteStatus = extractRemoteStatus(remote);
  } catch (error) {
    console.error(
      "Payment service status lookup failed:",
      error instanceof Error ? error.message : error
    );
  }

  if (!isPaidStatus(remoteStatus)) {
    return {
      transactionId,
      status: remoteStatus || "pending",
      payment,
      subscription: null,
    };
  }


  const endDate = new Date(Date.now() + plan.duration * DAY_MS);

  const existing = await prisma.subscription.findFirst({ where: { userId } });

  const activated = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId: plan.id,
          status: "ACTIVE",
          isActive: true,
          startDate: new Date(),
          endDate,
          amount: plan.price,
          payment_service_transaction_id: transactionId,
        },
        include: { plan: true },
      })
    : await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: "ACTIVE",
          isActive: true,
          startDate: new Date(),
          endDate,
          amount: plan.price,
          payment_service_transaction_id: transactionId,
        },
        include: { plan: true },
      });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paymentStatus: "SUCCEEDED",
      paidAt: new Date(),
      subscriptionId: activated.id,
    },
  });

  await syncUserSubscription(userId, plan.price, endDate);

  return {
    transactionId,
    status: "completed",
    payment: { ...payment, paymentStatus: "COMPLETED" as const },
    subscription: activated,
  };
};

// ---------------------------------------------------------------------------
// Stripe Checkout (real payment gateway)
// ---------------------------------------------------------------------------

export const createStripeCheckoutForPlan = async (
  userId: string,
  planId: string
) => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
  }
  if (plan.price <= 0) {
    throw new AppError(
      "Free plans do not require a payment checkout",
      400,
      "FREE_PLAN"
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  // Local PENDING payment row; transactionId is a placeholder until Stripe
  // confirms (webhook replaces it with the real session/payment id).
  const payment = await prisma.payment.create({
    data: {
      userId,
      planId: plan.id,
      amount: plan.price,
      currency: "usd",
      paymentStatus: "PENDING",
      transactionId: `pending_${randomUUID()}`,
      paymentDate: new Date(),
      purpose: "subscription",
    },
  });

  const baseUrl =
    process.env.FRONTEND_URL || process.env.BASE_URL || "http://localhost:3001";

  const session = await getStripeClient().checkout.sessions.create({
    mode: "payment",
    ...(user?.email ? { customer_email: user.email } : {}),
    line_items: [
      {
        price_data: {
          currency: "usd",
          // plan.price is stored in major units (dollars); Stripe wants cents.
          unit_amount: plan.price * 100,
          product_data: {
            name: `${plan.name} Subscription`,
            description: `${plan.duration}-day ${plan.name} plan`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      paymentId: payment.id,
      userId,
      planId: plan.id,
    },
    success_url: `${baseUrl}/subscription?payment=success`,
    cancel_url: `${baseUrl}/subscription?payment=cancelled`,
  });

  await createPaymentAttempt({
    paymentId: payment.id,
    gateway: "STRIPE",
    idempotencyKey: payment.id,
    checkoutSessionId: session.id,
    providerPaymentId: session.id,
  });

  return {
    url: session.url,
    sessionId: session.id,
    paymentId: payment.id,
    amount: plan.price,
    planName: plan.name,
  };
};

// Called by the Stripe webhook once checkout.session.completed arrives.
// Marks the payment SUCCEEDED and activates/renews the subscription.
export const fulfillStripePayment = async (session: Stripe.Checkout.Session) => {
  const paymentId = session.metadata?.paymentId;
  if (!paymentId) {
    console.warn("Stripe session missing paymentId metadata:", session.id);
    return;
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { plan: true },
  });
  if (!payment) {
    console.warn("Stripe webhook: payment not found", paymentId);
    return;
  }
  if (payment.paymentStatus === "SUCCEEDED") {
    return; // idempotent � Stripe may retry webhooks
  }

  const plan = payment.plan;
  if (!plan) {
    throw new AppError("Payment has no plan", 400, "PLAN_NOT_FOUND");
  }

  const endDate = new Date(Date.now() + plan.duration * DAY_MS);
  const existing = await prisma.subscription.findFirst({
    where: { userId: payment.userId },
  });

  const activated = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId: plan.id,
          status: "ACTIVE",
          isActive: true,
          startDate: new Date(),
          endDate,
          amount: plan.price,
          payment_service_transaction_id: session.id,
        },
        include: { plan: true },
      })
    : await prisma.subscription.create({
        data: {
          userId: payment.userId,
          planId: plan.id,
          status: "ACTIVE",
          isActive: true,
          startDate: new Date(),
          endDate,
          amount: plan.price,
          payment_service_transaction_id: session.id,
        },
        include: { plan: true },
      });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paymentStatus: "SUCCEEDED",
      paidAt: new Date(),
      subscriptionId: activated.id,
      transactionId: session.payment_intent
        ? String(session.payment_intent)
        : session.id,
    },
  });

  await syncUserSubscription(payment.userId, plan.price, endDate);

  // Mark the attempt succeeded too
  await prisma.paymentAttempt.updateMany({
    where: { paymentId: payment.id, gateway: "STRIPE" },
    data: {
      status: "SUCCEEDED",
      providerPaymentId: session.payment_intent
        ? String(session.payment_intent)
        : session.id,
    },
  });
};
