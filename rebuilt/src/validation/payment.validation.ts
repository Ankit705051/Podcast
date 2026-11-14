import { z } from "zod";

export const createPaymentSchema = z.object({
  planId: z.string().optional(),
  subscriptionId: z.string().optional(),
  amount: z.number().int().min(0, "Amount must be zero or greater"),
  currency: z.string().trim().length(3).optional(),
  purpose: z.string().trim().min(1, "purpose is required").max(100),
  paymentMethod: z.string().trim().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const processSubscriptionPaymentSchema = z.object({
  planId: z.string().min(1, "planId is required"),
  paymentMethod: z.string().trim().optional(),
});

export type ProcessSubscriptionPaymentInput = z.infer<
  typeof processSubscriptionPaymentSchema
>;
