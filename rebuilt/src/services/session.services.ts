import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { Prisma, SessionStatus, type ParticipantRole } from "@prisma/client";
import type {
  CreateSessionInput,
  UpdateSessionInput,
  SessionQueryInput,
} from "../types/session.js";



const userSelect = {
  id: true,
  userName: true,
  name: true,
  avatar: true,
} satisfies Prisma.UserSelect;

const sessionInclude = {
  host: { select: userSelect },
  participants: {
    include: { user: { select: userSelect } },
    orderBy: { joinedAt: "asc" as const },
  },
} satisfies Prisma.SessionInclude;

export type SessionWithRelations = Prisma.SessionGetPayload<{
  include: typeof sessionInclude;
}>;

const serializeUser = <T extends { id: string }>(user: T) => ({
  ...user,
  _id: user.id,
});

const serializeParticipant = (p: SessionWithRelations["participants"][number]) => ({
  ...p,
  _id: p.id,
  user_id: p.userId,
  role: p.role.toLowerCase(),
  joined_at: p.joinedAt,
  left_at: p.leftAt,
  user: p.user ? serializeUser(p.user) : undefined,
});

const ACCESS_LEVEL_LEGACY: Record<string, string> = {
  PUBLIC: "public",
  PRIVATE: "private",
  INVITE_ONLY: "invite_only",
};

const lower = (value: string) => value.toLowerCase();

export const serializeSession = (session: SessionWithRelations) => {
  const { host, participants, ...rest } = session;
  return {
    ...rest,
    _id: rest.id,
    scheduled_start: rest.scheduledStart,
    scheduled_end: rest.scheduledEnd,
    stream_platform: lower(rest.streamPlatform),
    stream_url: rest.streamUrl,
    thumbnail_url: rest.thumbnailUrl,
    recording_url: rest.recordingUrl,
    host_id: rest.hostId,
    is_live: rest.status === SessionStatus.ACTIVE,
    is_cancelled: rest.status === SessionStatus.CANCELLED,
    is_recorded: rest.isRecorded,
    actual_start_time: rest.actualStartTime,
    actual_end_time: rest.actualEndTime,
    access_level: ACCESS_LEVEL_LEGACY[rest.accessLevel] ?? lower(rest.accessLevel),
    category: lower(rest.category),
    max_participants: rest.maxParticipants,
    requires_registration: rest.requiresRegistration,
    chat_enabled: rest.chatEnabled,
    recording_enabled: rest.recordingEnabled,
    allow_questions: rest.allowQuestions,
    allow_screen_share: rest.allowScreenShare,
    auto_record: rest.autoRecord,
    leave_session_message: rest.leaveSessionMessage,
    media_provider: lower(rest.mediaProvider),
    viewer_count: rest.viewerCount,
    registration_count: rest.registrationCount,
    monetization_enabled: rest.monetizationEnabled,
    host: host ? serializeUser(host) : undefined,
    participants: participants.map(serializeParticipant),
  };
};

const activeParticipantCount = (participants: { leftAt: Date | null }[]) =>
  participants.filter((p) => p.leftAt === null).length;

const findSessionOrThrow = async (id: string) => {
  const session = await prisma.session.findUnique({
    where: { id },
    include: sessionInclude,
  });
  if (!session) throw new AppError("Session not found", 404);
  return session;
};

const assertHost = (session: SessionWithRelations, userId: string) => {
  if (session.hostId !== userId) {
    throw new AppError("Only the host can perform this action", 403);
  }
};

// ---------- Queries ----------

export const getAllSessions = async (query: SessionQueryInput) => {
  const where: Prisma.SessionWhereInput = {
    status: { not: SessionStatus.CANCELLED },
  };

  if (query.category) where.category = query.category;
  if (query.accessLevel) where.accessLevel = query.accessLevel;
  if (query.upcomingOnly) where.scheduledStart = { gte: new Date() };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { tags: { has: query.search } },
    ];
  }

  const [total, sessions] = await Promise.all([
    prisma.session.count({ where }),
    prisma.session.findMany({
      where,
      include: sessionInclude,
      orderBy: { scheduledStart: "asc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    sessions: sessions.map(serializeSession),
    pagination: {
      currentPage: query.page,
      totalPages: Math.ceil(total / query.limit),
      totalSessions: total,
    },
  };
};

export const getSessionById = async (id: string) => {
  const session = await findSessionOrThrow(id);
  return serializeSession(session);
};



export const createSession = async (
  input: CreateSessionInput,
  hostId: string
) => {
  if (input.scheduledStart >= input.scheduledEnd) {
    throw new AppError("End time must be after start time", 400);
  }
  if (input.scheduledStart <= new Date()) {
    throw new AppError("Start time must be in the future", 400);
  }

  const session = await prisma.session.create({
    data: {
      title: input.title,
      description: input.description,
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd,
      streamPlatform: input.streamPlatform,
      streamUrl: input.streamUrl,
      thumbnailUrl: input.thumbnailUrl,
      hostId,
      category: input.category,
      tags: input.tags,
      accessLevel: input.accessLevel,
      maxParticipants: input.maxParticipants,
      requiresRegistration: input.requiresRegistration,
      status: SessionStatus.SCHEDULED,
    },
    include: sessionInclude,
  });

  return serializeSession(session);
};

export const updateSession = async (
  id: string,
  updates: UpdateSessionInput,
  userId: string
) => {
  const session = await findSessionOrThrow(id);
  assertHost(session, userId);

 
  const data: Prisma.SessionUpdateInput = { ...updates };
  if (session.status === SessionStatus.ACTIVE) {
    delete data.scheduledStart;
    delete data.scheduledEnd;
    delete data.streamPlatform;
  }

  const updated = await prisma.session.update({
    where: { id },
    data,
    include: sessionInclude,
  });

  return serializeSession(updated);
};

export const deleteSession = async (id: string, userId: string) => {
  const session = await findSessionOrThrow(id);
  assertHost(session, userId);

  if (session.status === SessionStatus.ACTIVE) {
    throw new AppError("Cannot delete a live session", 400);
  }

  await prisma.session.update({
    where: { id },
    data: { status: SessionStatus.CANCELLED },
  });
};

export const joinSession = async (
  id: string,
  userId: string,
  role: ParticipantRole
) => {
  const session = await findSessionOrThrow(id);

  if (session.status === SessionStatus.CANCELLED) {
    throw new AppError("Cannot join a cancelled session", 400);
  }

  const existing = session.participants.find((p) => p.userId === userId);
  const activeCount = activeParticipantCount(session.participants);

  if (existing && existing.leftAt === null) {

    const current = await findSessionOrThrow(id);
    return serializeSession(current);
  }

  if (!existing && activeCount >= session.maxParticipants) {
    throw new AppError("Session is full", 400);
  }

  if (existing) {
    
    await prisma.sessionParticipant.update({
      where: { id: existing.id },
      data: { leftAt: null, joinedAt: new Date(), role },
    });
  } else {
    await prisma.sessionParticipant.create({
      data: { sessionId: id, userId, role },
    });
  }

  const updated = await findSessionOrThrow(id);
  return serializeSession(updated);
};

const endActiveSession = async (session: SessionWithRelations) => {
  const endTime = new Date();
  const duration = session.actualStartTime
    ? Math.round((endTime.getTime() - session.actualStartTime.getTime()) / 60000)
    : 0;

  return prisma.session.update({
    where: { id: session.id },
    data: {
      status: SessionStatus.ENDED,
      actualEndTime: endTime,
      duration,
      viewerCount: 0,
    },
    include: sessionInclude,
  });
};

export const startSession = async (id: string, userId: string) => {
  const session = await findSessionOrThrow(id);
  assertHost(session, userId);

  if (session.status === SessionStatus.ACTIVE) {
    throw new AppError("Session is already live", 400);
  }
  if (session.status === SessionStatus.ENDED || session.status === SessionStatus.CANCELLED) {
    throw new AppError("Cannot start a session that has ended or been cancelled", 400);
  }

  const updated = await prisma.session.update({
    where: { id },
    data: {
      status: SessionStatus.ACTIVE,
      actualStartTime: new Date(),
      isRecorded: false,
      duration: 0,
      viewerCount: activeParticipantCount(session.participants) + 1,
    },
    include: sessionInclude,
  });

  return serializeSession(updated);
};

export const endSession = async (id: string, userId: string) => {
  const session = await findSessionOrThrow(id);
  assertHost(session, userId);

  if (session.status !== SessionStatus.ACTIVE) {
    throw new AppError("Session is not live", 400);
  }

  return serializeSession(await endActiveSession(session));
};

export const leaveSession = async (id: string, userId: string) => {
  const session = await findSessionOrThrow(id);

  if (session.hostId === userId) {
    if (session.status === SessionStatus.ACTIVE) {
      return {
        session: serializeSession(await endActiveSession(session)),
        hostLeft: true,
      };
    }
    return { session: serializeSession(session), hostLeft: true };
  }

  const participant = session.participants.find((p) => p.userId === userId);
  if (!participant || participant.leftAt !== null) {
    throw new AppError("You are not a participant in this session", 400);
  }

  await prisma.sessionParticipant.update({
    where: { id: participant.id },
    data: { leftAt: new Date() },
  });

  const updated = await findSessionOrThrow(id);
  return { session: serializeSession(updated), hostLeft: false };
};

const toggleSessionFlag = async (
  id: string,
  userId: string,
  field: "isRecorded" | "allowScreenShare",
  enabled: boolean
) => {
  const session = await findSessionOrThrow(id);
  assertHost(session, userId);

  if (session.status !== SessionStatus.ACTIVE) {
    throw new AppError(
      `Cannot toggle ${field === "isRecorded" ? "recording" : "screen sharing"} on a session that is not live`,
      400
    );
  }

  const updated = await prisma.session.update({
    where: { id },
    data: field === "isRecorded" ? { isRecorded: enabled } : { allowScreenShare: enabled },
    include: sessionInclude,
  });

  return serializeSession(updated);
};

export const toggleRecording = (
  id: string,
  userId: string,
  enabled: boolean
) => toggleSessionFlag(id, userId, "isRecorded", enabled);

export const toggleScreenShare = (
  id: string,
  userId: string,
  enabled: boolean
) => toggleSessionFlag(id, userId, "allowScreenShare", enabled);
