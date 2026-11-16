import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import paymentService from "../config/payment.service.js";
import type { JwtUser } from "../types/auth.js";
import type { UpdateSubscriptionInput } from "../validation/subscription.validation.js";
import type { Prisma } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

type PlanRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.plan.findUnique>>
>;
type SubscriptionRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.subscription.findUnique>>
>;

const subscriptionInclude = {
  plan: true,
  user: {
    select: {
      id: true,
      email: true,
      userName: true,
      name: true,
      role: true,
      avatar: true,
    },
  },
} as const satisfies Prisma.SubscriptionInclude;


interface SerializablePlan {
  id: string;
  maxPodcasts: number;
  stripePriceId: string | null;
  [key: string]: unknown;
}

const serializePlan = (plan: SerializablePlan | null | undefined) =>
  plan
    ? {
        ...plan,
        _id: plan.id,
        max_podcasts: plan.maxPodcasts,
        stripe_price_id: plan.stripePriceId,
      }
    : plan;

interface SerializableSubscription {
  id: string;
  status: string;
  isActive: boolean;
  expiryMessage: string | null;
  plan?: SerializablePlan | null;
  user?: { id: string; [key: string]: unknown } | null;
  [key: string]: unknown;
}

const serializeSubscription = (subscription: SerializableSubscription) => {
  const { plan, user, ...rest } = subscription;
  return {
    ...rest,
    _id: rest.id,
    status: rest.status.toLowerCase(),
    is_active: rest.isActive,
    expiry_message: rest.expiryMessage,
    plan: serializePlan(plan),
    user: user ? { ...user, _id: user.id } : undefined,
  };
};


const syncUserSubscription = async (
  userId: string,
  plan: PlanRecord | null,
  endDate: Date | null,
  status: "active" | "expired" | "cancelled"
) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscription_type: plan && plan.price > 0 ? "premium" : "free",
      subscription_status: status,
      subscription_end_date: endDate,
    },
  });
};

const getSubscriptionOrThrow = async (
  subscriptionId: string,
  requester: JwtUser
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  if (!subscription) {
    throw new AppError("Subscription not found", 404, "SUBSCRIPTION_NOT_FOUND");
  }


  if (requester.role !== "admin" && subscription.userId !== requester.id) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  return subscription;
};

const mapStatus = (status: string): "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING" => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "ACTIVE";
    case "EXPIRED":
      return "EXPIRED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "PENDING";
  }
};



export const createFreeSubscription = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const freePlan = await prisma.plan.findFirst({
    where: { name: { equals: "Free", mode: "insensitive" } },
  });

  if (!freePlan) {
    throw new AppError("Free plan not found", 404, "PLAN_NOT_FOUND");
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId },
  });
  if (existingSubscription) {
    throw new AppError("User already has a subscription", 400, "SUBSCRIPTION_EXISTS");
  }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * DAY_MS); // 7 days

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId: freePlan.id,
      startDate,
      endDate,
      status: "ACTIVE",
      isActive: true,
      amount: 0,
    },
    include: { plan: true },
  });

  await syncUserSubscription(userId, freePlan, endDate, "active");

  return serializeSubscription(subscription);
};



export const getUserSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    throw new AppError("No subscription found", 404, "SUBSCRIPTION_NOT_FOUND");
  }

  return serializeSubscription(subscription);
};

export const getAllSubscriptions = async () => {
  const subscriptions = await prisma.subscription.findMany({
    include: subscriptionInclude,
    orderBy: { createdAt: "desc" },
  });
  return subscriptions.map(serializeSubscription);
};

export const getSubscriptionById = async (
  subscriptionId: string,
  requester: JwtUser
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: subscriptionInclude,
  });

  if (!subscription) {
    throw new AppError("Subscription not found", 404, "SUBSCRIPTION_NOT_FOUND");
  }

  if (requester.role !== "admin" && subscription.userId !== requester.id) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  return serializeSubscription(subscription);
};



export const updateSubscription = async (
  subscriptionId: string,
  data: UpdateSubscriptionInput,
  requester: JwtUser
) => {
  await getSubscriptionOrThrow(subscriptionId, requester);

  const updateData: Prisma.SubscriptionUpdateInput = {};

  if (data.status !== undefined) {
    updateData.status = mapStatus(data.status);
  }
  const isActive = data.isActive ?? data.is_active;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (data.endDate !== undefined) updateData.endDate = data.endDate;
  const autoRenew = data.autoRenew ?? data.auto_renew;
  if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.expiryMessage !== undefined) updateData.expiryMessage = data.expiryMessage;
  if (data.planId !== undefined) {
    const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
    if (!plan) {
      throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
    }
    updateData.plan = { connect: { id: data.planId } };
  }

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: updateData,
    include: { plan: true },
  });
  return serializeSubscription(updated);
};

// ---------------------------------------------------------------------------
// Cancel / renew / activate / deactivate
// ---------------------------------------------------------------------------

export const cancelSubscription = async (
  subscriptionId: string,
  requester: JwtUser
) => {
  const subscription = await getSubscriptionOrThrow(subscriptionId, requester);

 
  if (subscription.payment_service_subscription_id) {
    try {
      await paymentService.cancelSubscription(
        subscription.payment_service_subscription_id
      );
    } catch (serviceError) {
      console.error(
        "Payment service cancellation error:",
        serviceError instanceof Error ? serviceError.message : serviceError
      );
    }
  }

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "CANCELLED",
      isActive: false,
      autoRenew: false,
    },
    include: { plan: true },
  });

  await syncUserSubscription(
    subscription.userId,
    updated.plan,
    subscription.endDate,
    "cancelled"
  );

  return serializeSubscription(updated);
};

export const renewSubscription = async (
  subscriptionId: string,
  requester: JwtUser,
  newEndDate?: Date
) => {
  const subscription = await getSubscriptionOrThrow(subscriptionId, requester);

  const endDate =
    newEndDate ?? new Date(Date.now() + 30 * DAY_MS); // default +30 days

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "ACTIVE",
      isActive: true,
      endDate,
    },
    include: { plan: true },
  });

  await syncUserSubscription(subscription.userId, updated.plan, endDate, "active");

  return serializeSubscription(updated);
};

export const activateSubscription = async (
  subscriptionId: string,
  requester: JwtUser
) => {
  const subscription = await getSubscriptionOrThrow(subscriptionId, requester);

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "ACTIVE",
      isActive: true,
    },
    include: { plan: true },
  });

  await syncUserSubscription(
    subscription.userId,
    updated.plan,
    updated.endDate,
    "active"
  );

  return serializeSubscription(updated);
};

export const deactivateSubscription = async (
  subscriptionId: string,
  requester: JwtUser
) => {
  const subscription = await getSubscriptionOrThrow(subscriptionId, requester);

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "EXPIRED",
      isActive: false,
    },
    include: { plan: true },
  });

  await syncUserSubscription(
    subscription.userId,
    updated.plan,
    updated.endDate,
    "expired"
  );

  return serializeSubscription(updated);
};



export const createCheckoutSession = async (userId: string, planId: string) => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
  }

  const paymentResult = await paymentService.createPaymentTransaction({
    userId,
    amount: plan.price,
    paymentMethod: "card",
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

  await prisma.payment.create({
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
  });

  return {
    transactionId,
    amount: plan.price,
    planName: plan.name,
  };
};

export const upgradeSubscription = async (userId: string, newPlanId: string) => {
  const newPlan = await prisma.plan.findUnique({ where: { id: newPlanId } });
  if (!newPlan) {
    throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId },
    include: { plan: true },
  });
  if (!existingSubscription) {
    throw new AppError("No existing subscription found", 404, "SUBSCRIPTION_NOT_FOUND");
  }


  let finalAmount = newPlan.price;
  let refundAmount = 0;

  if (existingSubscription.plan && existingSubscription.endDate) {
    const remainingDays = Math.max(
      0,
      Math.ceil(
        (existingSubscription.endDate.getTime() - Date.now()) / DAY_MS
      )
    );
    refundAmount = (existingSubscription.plan.price / 30) * remainingDays;
    finalAmount = Math.max(0, newPlan.price - refundAmount);
  }

  const paymentResult = await paymentService.createPaymentTransaction({
    userId,
    amount: finalAmount,
    paymentMethod: "card",
    metadata: {
      purpose: "subscription_upgrade",
      subscriptionId: existingSubscription.id,
      planId: newPlan.id,
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

  await prisma.payment.create({
    data: {
      userId,
      planId: newPlan.id,
      subscriptionId: existingSubscription.id,
      amount: finalAmount,
      currency: "usd",
      paymentStatus: "PENDING",
      transactionId,
      paymentDate: new Date(),
      purpose: "subscription_upgrade",
    },
  });

  // Subscription switches to the new plan once payment completes
  const subscription = await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      planId: newPlan.id,
      status: "PENDING",
      amount: newPlan.price,
      payment_service_transaction_id: transactionId,
    },
    include: { plan: true },
  });

  return {
    subscription: serializeSubscription(subscription),
    payment: {
      transactionId,
      amount: finalAmount,
      refundAmount,
      planName: newPlan.name,
    },
  };
};
