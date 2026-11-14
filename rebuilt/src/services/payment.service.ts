import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import paymentService, {
  type PaymentServiceResponse,
} from "../config/payment.service.js";
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
  if (!payload || typeof payload !== "object") return "";
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

  return "";
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

export const getPaymentHistory = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    include: paymentInclude,
    orderBy: { paymentDate: "desc" },
  });
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
  try {
    transactionStatus = await paymentService.getTransactionStatus(transactionId);
  } catch (error) {
    console.error(
      "Payment service status lookup failed:",
      error instanceof Error ? error.message : error
    );
  }

  return { payment, transactionStatus };
};

export const getAllPayments = async () => {
  return prisma.payment.findMany({
    include: userPaymentInclude,
    orderBy: { paymentDate: "desc" },
  });
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
      paymentGateway: "payment-service",
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
      paymentGateway: "payment-service",
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
      paymentStatus: "COMPLETED",
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
