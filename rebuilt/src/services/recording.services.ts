import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { Prisma, RecordingStatus } from "@prisma/client";

const ACTIVE_RECORDING_STATUSES = [
  RecordingStatus.PENDING,
  RecordingStatus.RECORDING,
] as const;

const recordingInclude = {
  session: {
    select: {
      id: true,
      title: true,
      scheduledStart: true,
      hostId: true,
    },
  },
} satisfies Prisma.RecordingSessionInclude;

export type RecordingWithSession = Prisma.RecordingSessionGetPayload<{
  include: typeof recordingInclude;
}>;


const PROCESSING_STATUS_LEGACY: Record<RecordingStatus, string> = {
  [RecordingStatus.PENDING]: "processing",
  [RecordingStatus.RECORDING]: "processing",
  [RecordingStatus.COMPLETED]: "completed",
  [RecordingStatus.FAILED]: "failed",
};

const serializeRecording = (recording: RecordingWithSession) => {
  const { session, ...rest } = recording;
  return {
    ...rest,
    _id: rest.id,
    session_id: rest.sessionId,
    host_id: session?.hostId ?? rest.userId,
    processingStatus: PROCESSING_STATUS_LEGACY[rest.status] ?? "processing",
    processing_status: PROCESSING_STATUS_LEGACY[rest.status] ?? "processing",
    startTime: rest.startedAt,
    endTime: rest.endedAt,
    session: session
      ? {
          ...session,
          _id: session.id,
          scheduled_start: session.scheduledStart,
          host_id: session.hostId,
        }
      : undefined,
  };
};

const findSessionOrThrow = async (sessionId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new AppError("Session not found", 404);
  return session;
};

const assertHost = (hostId: string, userId: string) => {
  if (hostId !== userId) {
    throw new AppError("Only the host can perform this action", 403);
  }
};

export const startRecording = async (sessionId: string, userId: string) => {
  const session = await findSessionOrThrow(sessionId);
  assertHost(session.hostId, userId);

  const existing = await prisma.recordingSession.findFirst({
    where: {
      sessionId,
      status: { in: [...ACTIVE_RECORDING_STATUSES] },
    },
  });
  if (existing) {
    throw new AppError("Recording already exists for this session", 400);
  }

  const recording = await prisma.recordingSession.create({
    data: {
      sessionId,
      userId: session.hostId,
      title: `${session.title} - Recording`,
      status: RecordingStatus.RECORDING,
      startedAt: new Date(),
    },
    include: recordingInclude,
  });

  return serializeRecording(recording);
};

export const stopRecording = async (
  sessionId: string,
  userId: string,
  input: {
    fileUrl?: string | undefined;
    fileType?: string | undefined;
    fileSize?: number | undefined;
    duration?: number | undefined;
    thumbnailUrl?: string | undefined;
  }
) => {
  await findSessionOrThrow(sessionId);

  const recording = await prisma.recordingSession.findFirst({
    where: {
      sessionId,
      status: { in: [...ACTIVE_RECORDING_STATUSES] },
    },
    orderBy: { startedAt: "desc" },
  });
  if (!recording) {
    throw new AppError("No active recording found for this session", 404);
  }

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  assertHost(session!.hostId, userId);

  const data: Prisma.RecordingSessionUpdateInput = {
    status: RecordingStatus.COMPLETED,
    endedAt: new Date(),
    isDownloadable: true,
  };
  if (input.fileUrl !== undefined) data.fileUrl = input.fileUrl;
  if (input.fileType !== undefined) data.fileType = input.fileType;
  if (input.fileSize !== undefined) data.fileSize = input.fileSize;
  if (input.duration !== undefined) data.duration = input.duration;
  if (input.thumbnailUrl !== undefined) data.thumbnailUrl = input.thumbnailUrl;

  const updated = await prisma.recordingSession.update({
    where: { id: recording.id },
    data,
    include: recordingInclude,
  });

  return serializeRecording(updated);
};

export const getSessionRecordings = async (sessionId: string) => {
  await findSessionOrThrow(sessionId);

  const recordings = await prisma.recordingSession.findMany({
    where: { sessionId },
    include: recordingInclude,
    orderBy: { createdAt: "desc" },
  });

  return recordings.map(serializeRecording);
};

export const getUserRecordings = async (userId: string) => {
  const sessions = await prisma.session.findMany({
    where: { hostId: userId },
    select: { id: true },
  });
  const sessionIds = sessions.map((s) => s.id);

  const recordings = await prisma.recordingSession.findMany({
    where: {
      sessionId: { in: sessionIds },
      status: RecordingStatus.COMPLETED,
    },
    include: recordingInclude,
    orderBy: { createdAt: "desc" },
  });

  return recordings.map(serializeRecording);
};

export const deleteRecording = async (recordingId: string, userId: string) => {
  const recording = await prisma.recordingSession.findUnique({
    where: { id: recordingId },
    include: { session: { select: { hostId: true } } },
  });
  if (!recording) throw new AppError("Recording not found", 404);

  assertHost(recording.session.hostId, userId);

  await prisma.recordingSession.delete({ where: { id: recordingId } });
};

export const downloadRecording = async (recordingId: string) => {
  const recording = await prisma.recordingSession.findUnique({
    where: { id: recordingId },
  });
  if (!recording) throw new AppError("Recording not found", 404);
  if (!recording.isDownloadable || !recording.fileUrl) {
    throw new AppError("Recording is not available for download", 403);
  }

  const ext = recording.fileType
    ? recording.fileType.includes("/")
      ? recording.fileType.split("/").pop()
      : recording.fileType
    : "mp4";

  return {
    downloadUrl: recording.fileUrl,
    fileName: `${recording.title}.${ext}`,
  };
};
