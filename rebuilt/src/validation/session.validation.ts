import { z } from "zod";
const toSnakeKey = (key: string) =>
  key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

const normalizeKeys = (body: unknown) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const src = body as Record<string, unknown>;
  const out: Record<string, unknown> = { ...src };
  for (const key of Object.keys(src)) {
    if (/[A-Z]/.test(key)) {
      const snake = toSnakeKey(key);
      if (out[snake] === undefined) out[snake] = src[key];
    }
  }
  return out;
};

const upperEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    z.enum(values)
  );

const STREAM_PLATFORMS = [
  "YOUTUBE",
  "TWITCH",
  "DISCORD",
  "OTHER",
  "ZOOM",
  "TEAMS",
] as const;

const SESSION_CATEGORIES = [
  "PODCAST",
  "INTERVIEW",
  "PANEL",
  "WORKSHOP",
  "QNA",
  "OTHER",
  "EVENT",
  "EDUCATION",
] as const;

const ACCESS_LEVELS = ["PUBLIC", "PRIVATE", "INVITE_ONLY"] as const;

const PARTICIPANT_ROLES = ["SPEAKER", "LISTENER", "MODERATOR"] as const;

const boolLike = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => (typeof v === "boolean" ? v : v === "true"));

const splitTags = (v: string[] | string | undefined) => {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v;
  return v
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const tagsField = z
  .union([z.array(z.string().trim().min(1)), z.string()])
  .optional()
  .transform((v) => splitTags(v) ?? []);


const tagsFieldOptional = z
  .union([z.array(z.string().trim().min(1)), z.string()])
  .optional()
  .transform(splitTags);


export const sessionParamsSchema = z.object({
  id: z.uuid("Invalid session ID"),
});
export type SessionParams = z.infer<typeof sessionParamsSchema>;


const createSessionBody = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required"),
  scheduled_start: z.coerce.date(),
  scheduled_end: z.coerce.date(),
  stream_platform: upperEnum(STREAM_PLATFORMS),
  stream_url: z.string().trim().min(1, "stream_url is required"),
  thumbnail_url: z.string().trim().min(1, "thumbnail_url is required"),
  category: upperEnum(SESSION_CATEGORIES).default("PODCAST"),
  tags: tagsField,
  access_level: upperEnum(ACCESS_LEVELS).default("PUBLIC"),
  max_participants: z.coerce
    .number()
    .int()
    .min(1)
    .max(100000)
    .default(100),
  requires_registration: boolLike.optional().default(false),
});

export const createSessionSchema = z
  .preprocess(normalizeKeys, createSessionBody)
  .transform((d) => ({
    title: d.title,
    description: d.description,
    scheduledStart: d.scheduled_start,
    scheduledEnd: d.scheduled_end,
    streamPlatform: d.stream_platform,
    streamUrl: d.stream_url,
    thumbnailUrl: d.thumbnail_url,
    category: d.category,
    tags: d.tags,
    accessLevel: d.access_level,
    maxParticipants: d.max_participants,
    requiresRegistration: d.requires_registration,
  }));
export type CreateSessionSchema = z.infer<typeof createSessionSchema>;

const updateSessionBody = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).optional(),
  scheduled_start: z.coerce.date().optional(),
  scheduled_end: z.coerce.date().optional(),
  stream_platform: upperEnum(STREAM_PLATFORMS).optional(),
  stream_url: z.string().trim().min(1).optional(),
  thumbnail_url: z.string().trim().min(1).optional(),
  recording_url: z.string().trim().optional(),
  category: upperEnum(SESSION_CATEGORIES).optional(),
  tags: tagsFieldOptional,
  access_level: upperEnum(ACCESS_LEVELS).optional(),
  max_participants: z.coerce.number().int().min(1).max(100000).optional(),
  requires_registration: boolLike.optional(),
  chat_enabled: boolLike.optional(),
  recording_enabled: boolLike.optional(),
  allow_questions: boolLike.optional(),
  allow_screen_share: boolLike.optional(),
  auto_record: boolLike.optional(),
  leave_session_message: z.string().trim().max(500).optional(),
});

export const updateSessionSchema = z
  .preprocess(normalizeKeys, updateSessionBody)
  .transform((d) => {
    const out: Record<string, unknown> = {};
    if (d.title !== undefined) out.title = d.title;
    if (d.description !== undefined) out.description = d.description;
    if (d.scheduled_start !== undefined) out.scheduledStart = d.scheduled_start;
    if (d.scheduled_end !== undefined) out.scheduledEnd = d.scheduled_end;
    if (d.stream_platform !== undefined) out.streamPlatform = d.stream_platform;
    if (d.stream_url !== undefined) out.streamUrl = d.stream_url;
    if (d.thumbnail_url !== undefined) out.thumbnailUrl = d.thumbnail_url;
    if (d.recording_url !== undefined) out.recordingUrl = d.recording_url;
    if (d.category !== undefined) out.category = d.category;
    if (d.tags !== undefined) out.tags = d.tags;
    if (d.access_level !== undefined) out.accessLevel = d.access_level;
    if (d.max_participants !== undefined) out.maxParticipants = d.max_participants;
    if (d.requires_registration !== undefined) out.requiresRegistration = d.requires_registration;
    if (d.chat_enabled !== undefined) out.chatEnabled = d.chat_enabled;
    if (d.recording_enabled !== undefined) out.recordingEnabled = d.recording_enabled;
    if (d.allow_questions !== undefined) out.allowQuestions = d.allow_questions;
    if (d.allow_screen_share !== undefined) out.allowScreenShare = d.allow_screen_share;
    if (d.auto_record !== undefined) out.autoRecord = d.auto_record;
    if (d.leave_session_message !== undefined) out.leaveSessionMessage = d.leave_session_message;
    return out;
  });
export type UpdateSessionSchema = z.infer<typeof updateSessionSchema>;
const joinSessionBody = z
  .object({
    participant_role: upperEnum(PARTICIPANT_ROLES).optional(),
    role: upperEnum(PARTICIPANT_ROLES).optional(),
  })
  .transform((d) => ({
    role: d.participant_role ?? d.role ?? ("LISTENER" as const),
  }));

export const joinSessionSchema = z.preprocess(
  normalizeKeys,
  joinSessionBody.optional().default({ role: "LISTENER" as const })
);
export type JoinSessionSchema = z.infer<typeof joinSessionSchema>;


export const toggleSessionSchema = z.object({
  enabled: boolLike,
});
export type ToggleSessionSchema = z.infer<typeof toggleSessionSchema>;


export const sessionQuerySchema = z
  .object({
    category: upperEnum(SESSION_CATEGORIES).optional(),
    access_level: upperEnum(ACCESS_LEVELS).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(200).optional(),
    upcoming_only: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .optional()
      .transform((v) => v === true || v === "true"),
  })
  .transform((d) => ({
    category: d.category,
    accessLevel: d.access_level,
    page: d.page,
    limit: d.limit,
    search: d.search,
    upcomingOnly: d.upcoming_only,
  }));
export type SessionQuerySchema = z.infer<typeof sessionQuerySchema>;
