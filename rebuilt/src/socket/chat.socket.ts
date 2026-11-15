import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.js";
import { createChat } from "../services/chat.services.js";
import { ChatType } from "@prisma/client";
import type { AuthenticatedSocketUser } from "./socket.auth.js";

const getSocketUser = (socket: Socket): AuthenticatedSocketUser | undefined =>
  socket.data.user as AuthenticatedSocketUser | undefined;

const sessionRoom = (sessionId: string) => `session_${sessionId}`;

const getJoinedSessions = (socket: Socket): Set<string> => {
  if (!(socket.data.sessions instanceof Set)) {
    socket.data.sessions = new Set<string>();
  }
  return socket.data.sessions as Set<string>;
};

const ensureSessionMembership = async (
  io: Server,
  socket: Socket,
  sessionId: string
): Promise<boolean> => {
  const user = getSocketUser(socket);
  if (!user) return false;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      hostId: true,
      status: true,
      participants: {
        where: { userId: user.id, leftAt: null },
        select: { userId: true },
      },
    },
  });

  if (
    !session ||
    session.status === "CANCELLED" ||
    (session.hostId !== user.id && session.participants.length === 0)
  ) {
    return false;
  }

  socket.join(sessionRoom(sessionId));
  getJoinedSessions(socket).add(sessionId);
  return true;
};

const normalizeChatType = (type: unknown): ChatType => {
  const value = String(type ?? "text").toUpperCase();
  if (value === "IMAGE" || value === "FILE" || value === "SYSTEM") {
    return value;
  }
  return ChatType.TEXT;
};

export const registerChatEvent = (io: Server, socket: Socket) => {
  socket.on(
    "send-message",
    async (data: { sessionId?: string; message?: string; type?: unknown }) => {
      try {
        const user = getSocketUser(socket);
        const sessionId = data.sessionId;
        const message = data.message?.trim();

        if (!user || !sessionId || !message) {
          socket.emit("error", {
            message: "Session ID and message are required",
          });
          return;
        }

        let joined = socket.data.sessions?.has(sessionId) ?? false;
        if (!joined) {
          joined = await ensureSessionMembership(io, socket, sessionId);
        }
        if (!joined) {
          socket.emit("error", {
            message: "Join the session before sending messages",
          });
          return;
        }

        const chat = await createChat(
          user.id,
          sessionId,
          message.slice(0, 1000),
          normalizeChatType(data.type)
        );

        const payload = {
          ...chat,
          _id: chat.id,
          userId: {
            id: chat.user?.id ?? user.id,
            _id: chat.user?.id ?? user.id,
            name: chat.user?.name ?? user.name,
            avatar: chat.user?.avatar ?? user.avatar,
          },
          timestamp: chat.createdAt,
        };
        const room = `session_${sessionId}`;

        io.to(room).emit("new-message", payload);
        io.to(room).emit("receive-message", payload);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );

  const emitTyping = (sessionId: string, isTyping: boolean) => {
    const user = getSocketUser(socket);
    if (!user || !socket.data.sessions?.has(sessionId)) return;

    const payload = {
      sessionId,
      userId: user.id,
      userName: user.name || user.userName || user.email,
      isTyping,
    };
    const room = `session_${sessionId}`;

    socket.to(room).emit("user-typing", payload);
    socket.to(room).emit("typing-start", payload);
    if (!isTyping) {
      socket.to(room).emit("typing-stop", payload);
    }
  };

  socket.on("typing-start", (sessionId: string) => emitTyping(sessionId, true));
  socket.on("typing-stop", (sessionId: string) => emitTyping(sessionId, false));
};
