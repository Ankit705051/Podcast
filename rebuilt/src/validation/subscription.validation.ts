import { z } from "zod";

export const checkoutSessionSchema = z.object({
  planId: z.string().min(1, "planId is required"),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;

export const renewSubscriptionSchema = z.object({
  newEndDate: z.coerce.date().optional(),
});

export type RenewSubscriptionInput = z.infer<typeof renewSubscriptionSchema>;

export const upgradeSubscriptionSchema = z.object({
  newPlanId: z.string().min(1, "newPlanId is required"),
});

export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>;

const subscriptionStatusSchema = z.enum([
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "PENDING",
  "active",
  "expired",
  "cancelled",
  "pending",
]);

export const updateSubscriptionSchema = z.object({
  status: subscriptionStatusSchema.optional(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional(),
  endDate: z.coerce.date().nullable().optional(),
  autoRenew: z.boolean().optional(),
  auto_renew: z.boolean().optional(),
  amount: z.number().int().min(0).optional(),
  planId: z.string().optional(),
  expiryMessage: z.string().optional(),
});

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
