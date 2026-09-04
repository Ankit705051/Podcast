
import { z } from "zod";

export const chatValidationSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  message: z.string().trim().min(1, "Message is required"),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO"]).optional(),
});
export const chatParamsSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
});

export type CreateChatSchema = z.infer<typeof chatValidationSchema>;
export const createChatSchema = chatValidationSchema;
export type ChatParamsSchema = z.infer<typeof chatParamsSchema>;
export const chatParams = chatParamsSchema;
