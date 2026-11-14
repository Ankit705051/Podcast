import { z } from "zod";
const CHAT_TYPES = ["TEXT", "IMAGE", "FILE", "SYSTEM"] as const;
const upperEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    z.enum(values)
  );
export const chatValidationSchema = z.object({
  sessionId: z.uuid("Invalid session ID"),
  message: z.string().trim().min(1, "Message cannot be empty").max(1000),
  type: upperEnum(CHAT_TYPES).optional().default("TEXT"),
});
export type ChatValidationSchema = z.infer<typeof chatValidationSchema>;
export const createChatSchema = chatValidationSchema;

export const chatParamsSchema = z.object({
  sessionId: z.uuid("Invalid session ID"),
});
export type ChatParamsSchema = z.infer<typeof chatParamsSchema>;

export const chatHistoryParamsSchema = z.object({
  sessionId: z.uuid("Invalid session ID"),
});

export const chatMessageParamsSchema = z.object({
  messageId: z.uuid("Invalid message ID"),
});
export type ChatMessageParams = z.infer<typeof chatMessageParamsSchema>;
