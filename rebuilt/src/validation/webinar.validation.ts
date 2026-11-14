import { z } from "zod";

export const webinarParamsSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const pollParamsSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  pollId: z.string().min(1, "Poll ID is required"),
});

export const questionParamsSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
});

export const createPollSchema = z.object({
  question: z.string().trim().min(1, "Poll question is required"),
  options: z
    .array(z.string().trim().min(1, "Option text is required"))
    .min(2, "At least two options are required"),
  expiresAt: z.coerce.date().optional(),
});

export const votePollSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
});

export const submitQuestionSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
});

export const answerQuestionSchema = z.object({
  answer: z.string().trim().min(1, "Answer is required"),
});

export const addModeratorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().trim().min(1).optional(),
});

export const removeModeratorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const questionsQuerySchema = z.object({
  answered: z.enum(["true", "false"]).optional(),
});

export type WebinarParams = z.infer<typeof webinarParamsSchema>;
export type PollParams = z.infer<typeof pollParamsSchema>;
export type QuestionParams = z.infer<typeof questionParamsSchema>;
