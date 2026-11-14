import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().min(1, "Description is required"),
  price: z.number().int().min(0, "Price must be zero or greater"),
  duration: z.number().int().positive().default(30),
  features: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  storage_quota_mb: z.number().int().min(0).default(100),
  maxPodcasts: z.number().int().min(0).default(0),
  stripePriceId: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial();

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
