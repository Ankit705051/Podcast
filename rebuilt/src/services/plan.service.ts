import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CreatePlanInput, UpdatePlanInput } from "../validation/plan.validation.js";
import type { Plan } from "@prisma/client";


const serializePlan = (plan: Plan) => ({
  ...plan,
  _id: plan.id,
  max_podcasts: plan.maxPodcasts,
  stripe_price_id: plan.stripePriceId,
});


export const ensureDefaultPlans = async () => {
  const freePlan = await prisma.plan.findFirst({
    where: { name: { equals: "Free", mode: "insensitive" } },
  });
  if (freePlan) return;

  await prisma.plan.create({
    data: {
      name: "Free",
      description: "Free plan with basic features",
      price: 0,
      duration: 30,
      features: ["Basic sessions", "Community support"],
      benefits: ["Join sessions", "Chat"],
      storage_quota_mb: 100,
      maxPodcasts: 5,
      isActive: true,
    },
  });
  console.log("Default Free plan created");
};

export const getAllPlans = async () => {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
  return plans.map(serializePlan);
};

export const getPlanById = async (id: string) => {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
  }
  return serializePlan(plan);
};

export const createPlan = async (data: CreatePlanInput) => {
  const existing = await prisma.plan.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new AppError("Plan with this name already exists", 400, "PLAN_EXISTS");
  }

  const plan = await prisma.plan.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      features: data.features,
      benefits: data.benefits,
      storage_quota_mb: data.storage_quota_mb,
      maxPodcasts: data.maxPodcasts,
      ...(data.stripePriceId !== undefined
        ? { stripePriceId: data.stripePriceId }
        : {}),
      isActive: data.isActive,
    },
  });
  return serializePlan(plan);
};

export const updatePlan = async (id: string, data: UpdatePlanInput) => {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
  }

  if (data.name && data.name !== plan.name) {
    const existing = await prisma.plan.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError("Plan with this name already exists", 400, "PLAN_EXISTS");
    }
  }

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.features !== undefined ? { features: data.features } : {}),
      ...(data.benefits !== undefined ? { benefits: data.benefits } : {}),
      ...(data.storage_quota_mb !== undefined
        ? { storage_quota_mb: data.storage_quota_mb }
        : {}),
      ...(data.maxPodcasts !== undefined ? { maxPodcasts: data.maxPodcasts } : {}),
      ...(data.stripePriceId !== undefined
        ? { stripePriceId: data.stripePriceId }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
  return serializePlan(updated);
};

export const deletePlan = async (id: string) => {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");
  }

  await prisma.plan.update({
    where: { id },
    data: { isActive: false },
  });

  return { deleted: true };
};
