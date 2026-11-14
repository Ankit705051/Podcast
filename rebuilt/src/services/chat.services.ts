import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { ChatType, Prisma } from "@prisma/client";

const chatUserSelect = {
  id: true,
  userName: true,
  name: true,
  avatar: true,
} satisfies Prisma.UserSelect;

const chatInclude = {
  user: { select: chatUserSelect },
} satisfies Prisma.ChatInclude;

export type ChatWithUser = Prisma.ChatGetPayload<{ include: typeof chatInclude }>;


export const serializeChat = (chat: ChatWithUser) => {
  const { user, ...rest } = chat;
  return {
    ...rest,
    _id: rest.id,
    user_id: rest.userId,

    userName: user?.name ?? user?.userName,
    userAvatar: user?.avatar,
    type: rest.type.toLowerCase(),
    timestamp: rest.createdAt,
    created_at: rest.createdAt,
    updated_at: rest.updatedAt,
    deleted_at: rest.deletedAt,
    user: user ? { ...user, _id: user.id } : undefined,
  };
};

export const createChat = async (
  userId: string,
  sessionId: string,
  message: string,
  type: ChatType = ChatType.TEXT
) => {
  const chat = await prisma.chat.create({
    data: {
      userId,
      sessionId,
      message,
      type,
    },
    include: chatInclude,
  });
  return serializeChat(chat);
};

export const getChatHistory = async (sessionId: string) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });
  if (!session) throw new AppError("Session not found", 404);

  const messages = await prisma.chat.findMany({
    where: { sessionId, deleted: false },
    include: chatInclude,
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return messages.map(serializeChat);
};

export const saveMessage = async (
  userId: string,
  sessionId: string,
  message: string,
  type: ChatType = ChatType.TEXT
) => {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new AppError("Message cannot be empty", 400);
  }
  if (trimmed.length > 1000) {
    throw new AppError("Message cannot exceed 1000 characters", 400);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });
  if (!session) throw new AppError("Session not found", 404);

  return createChat(userId, sessionId, trimmed, type);
};

export const deleteMessage = async (messageId: string, userId: string) => {
  const message = await prisma.chat.findUnique({
    where: { id: messageId },
    include: { session: { select: { hostId: true } } },
  });
  if (!message) throw new AppError("Message not found", 404);

  const isAuthor = message.userId === userId;
  const isHost = message.session.hostId === userId;
  if (!isAuthor && !isHost) {
    throw new AppError("Not authorized to delete this message", 403);
  }

  await prisma.chat.update({
    where: { id: messageId },
    data: { deleted: true, deletedAt: new Date() },
  });
};
