import { z } from "zod";

export const recordingSessionParamsSchema = z.object({
  sessionId: z.uuid("Invalid session ID"),
});

export const recordingIdParamsSchema = z.object({
  recordingId: z.uuid("Invalid recording ID"),
});

export const stopRecordingSchema = z.object({
  file_url: z.string().trim().optional(),
  fileUrl: z.string().trim().optional(),
  file_type: z.string().trim().optional(),
  fileType: z.string().trim().optional(),
  file_size: z.coerce.number().int().min(0).optional(),
  fileSize: z.coerce.number().int().min(0).optional(),
  duration: z.coerce.number().min(0).optional(),
  thumbnail_url: z.string().trim().optional(),
  thumbnailUrl: z.string().trim().optional(),
});

export type StopRecordingSchema = z.infer<typeof stopRecordingSchema>;
