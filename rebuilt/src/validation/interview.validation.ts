import { z } from "zod";

export const sessionParamsSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const elementParamsSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  elementId: z.string().min(1, "Element ID is required"),
});

export const addElementSchema = z.object({
  element: z.record(z.string(), z.unknown()),
});

export const updateElementSchema = z.object({
  updates: z.record(z.string(), z.unknown()),
});

export const setToolSchema = z.object({
  tool: z.string().trim().min(1, "Tool is required"),
});

export const setColorSchema = z.object({
  color: z.string().trim().min(1, "Color is required"),
});

export const setSizeSchema = z.object({
  size: z.number().int().min(1, "Size must be a positive integer"),
});

export const createCodeEditorSchema = z.object({
  language: z.string().trim().min(1).optional(),
});

export const updateCodeSchema = z.object({
  code: z.string(),
});

export const changeLanguageSchema = z.object({
  language: z.string().trim().min(1, "Language is required"),
});

export type SessionParams = z.infer<typeof sessionParamsSchema>;
export type ElementParams = z.infer<typeof elementParamsSchema>;
