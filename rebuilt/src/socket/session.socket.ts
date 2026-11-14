import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedSocketUser } from "./socket.auth.js";

type SocketRole = "host" | "speaker" | "listener" | "moderator";

interface RuntimeUser {
  role: SocketRole;
  sockets: Set<string>;
  name: string;
}

interface RuntimeSession {
  hostId: string;
  users: Map<string, RuntimeUser>;
  handRaised: Set<string>;
}

const runtimeSessions = new Map<string, RuntimeSession>();

const roomName = (sessionId: string) => `session_${sessionId}`;
const getUser = (socket: Socket): AuthenticatedSocketUser | undefined =>
  socket.data.user as AuthenticatedSocketUser | undefined;
const getJoinedSessions = (socket: Socket): Set<string> => {
  if (!(socket.data.sessions instanceof Set)) {
    socket.data.sessions = new Set<string>();
  }
  return socket.data.sessions as Set<string>;
};

const normalizeJoinPayload = (
  data: string | { sessionId?: string; role?: string }
): { sessionId: string; requestedRole: SocketRole | undefined } | null => {
  const sessionId = typeof data === "string" ? data : data?.sessionId;
  if (!sessionId) return null;

  const requestedRole =
    typeof data === "object" && data.role
      ? (data.role.toLowerCase() as SocketRole)
      : undefined;

  return { sessionId, requestedRole };
};

const getRuntimeSession = (sessionId: string): RuntimeSession => {
  let runtime = runtimeSessions.get(sessionId);
  if (!runtime) {
    runtime = {
      hostId: "",
      users: new Map(),
      handRaised: new Set(),
    };
    runtimeSessions.set(sessionId, runtime);
  }
  return runtime;
};

const publicState = (runtime: RuntimeSession) => {
  const speakers: string[] = [];
  const listeners: string[] = [];
  const moderators: string[] = [];

  runtime.users.forEach((user, userId) => {
    if (user.role === "host" || user.role === "speaker") speakers.push(userId);
    if (user.role === "moderator") moderators.push(userId);
    if (user.role === "listener") listeners.push(userId);
  });

  return {
    host: runtime.hostId,
    speakers,
    listeners,
    moderators,
    handRaised: Array.from(runtime.handRaised),
  };
};

const resolveRole = async (
  sessionId: string,
  hostId: string,
  userId: string,
  requestedRole?: SocketRole
): Promise<SocketRole> => {
  if (hostId === userId) return "host";
  if (requestedRole === "speaker" || requestedRole === "moderator") {
    return requestedRole;
  }

  const participant = await prisma.sessionParticipant.findUnique({
    where: {
      sessionId_userId: { sessionId, userId },
    },
    select: { role: true },
  });

  if (participant?.role === "SPEAKER") return "speaker";
  if (participant?.role === "MODERATOR") return "moderator";
  return "listener";
};

const addSocketToSession = async (
  io: Server,
  socket: Socket,
  sessionId: string
) => {
  const user = getUser(socket);
  if (!user) {
    socket.emit("error", { message: "Authentication required" });
    return false;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      hostId: true,
      status: true,
      participants: {
        where: { userId: user.id, leftAt: null },
        select: { userId: true, role: true },
      },
    },
  });

  if (!session || session.status === "CANCELLED") {
    socket.emit("error", { message: "Session not found" });
    return false;
  }

  const isHost = session.hostId === user.id;
  const isParticipant = session.participants.some((p) => p.userId === user.id);
  if (!isHost && !isParticipant) {
    socket.emit("error", { message: "Not authorized to join this session" });
    return false;
  }

  const runtime = getRuntimeSession(sessionId);
  runtime.hostId = session.hostId;
  const existing = runtime.users.get(user.id);
  const isNewUser = !existing;

  if (!existing) {
    const requestedRole = normalizeJoinPayload(
      (socket.data.pendingJoin as { sessionId: string; role?: string }) || sessionId
    )?.requestedRole;
    const role = await resolveRole(sessionId, session.hostId, user.id, requestedRole);
    runtime.users.set(user.id, {
      role,
      sockets: new Set([socket.id]),
      name: user.name || user.userName || user.email,
    });
  } else {
    existing.sockets.add(socket.id);
  }

  socket.join(roomName(sessionId));
  getJoinedSessions(socket).add(sessionId);

  socket.emit("session-state", publicState(runtime));

  if (isNewUser) {
    socket.to(roomName(sessionId)).emit("user-joined", {
      userId: user.id,
      userName: user.name || user.userName || user.email,
      role: runtime.users.get(user.id)?.role,
      timestamp: new Date(),
    });
  }

  return true;
};

const removeSocketFromSession = (
  io: Server,
  socket: Socket,
  sessionId: string,
  emitLeft = true
) => {
  const runtime = runtimeSessions.get(sessionId);
  const user = getUser(socket);
  const joined = getJoinedSessions(socket);

  if (runtime && user) {
    const runtimeUser = runtime.users.get(user.id);
    if (runtimeUser) {
      runtimeUser.sockets.delete(socket.id);
      if (runtimeUser.sockets.size === 0) {
        runtime.users.delete(user.id);
        runtime.handRaised.delete(user.id);

        if (emitLeft) {
          io.to(roomName(sessionId)).emit("user-left", {
            userId: user.id,
            userName: user.name || user.userName || user.email,
            timestamp: new Date(),
          });
        }
      }
    }
  }

  socket.leave(roomName(sessionId));
  joined.delete(sessionId);

  if (runtime && runtime.users.size === 0) {
    runtimeSessions.delete(sessionId);
  }
};

const findSocketsForUser = async (
  io: Server,
  sessionId: string,
  userId: string
) => {
  const sockets = await io.in(roomName(sessionId)).fetchSockets();
  return sockets.filter((remote) => {
    const remoteUser = remote.data.user as AuthenticatedSocketUser | undefined;
    return remoteUser?.id === userId;
  });
};

const displayName = (user?: AuthenticatedSocketUser) =>
  user?.name || user?.userName || user?.email || "User";

const isHost = (socket: Socket, sessionId: string) => {
  const user = getUser(socket);
  const runtime = runtimeSessions.get(sessionId);
  return Boolean(user && runtime?.hostId === user.id);
};

const isHostOrSpeaker = (socket: Socket, sessionId: string) => {
  const user = getUser(socket);
  const runtime = runtimeSessions.get(sessionId);
  const role = user ? runtime?.users.get(user.id)?.role : undefined;
  return role === "host" || role === "speaker";
};

export const registerSessionEvents = (io: Server, socket: Socket) => {
  socket.on(
    "join-session",
    async (data: string | { sessionId?: string; role?: string; token?: string }) => {
      try {
        const normalized = normalizeJoinPayload(data);
        if (!normalized) {
          socket.emit("error", { message: "Session ID is required" });
          return;
        }

        socket.data.pendingJoin = data;
        await addSocketToSession(io, socket, normalized.sessionId);
      } catch (error) {
        console.error("Join session socket error:", error);
        socket.emit("error", { message: "Failed to join session" });
      }
    }
  );

  socket.on(
    "leave-session",
    (data: string | { sessionId?: string }) => {
      const sessionId = typeof data === "string" ? data : data?.sessionId;
      if (!sessionId) return;
      removeSocketFromSession(io, socket, sessionId);
    }
  );

  socket.on(
    "webrtc-offer",
    async (data: { sessionId: string; targetUserId: string; offer: unknown }) => {
      const targets = await findSocketsForUser(io, data.sessionId, data.targetUserId);
      targets.forEach((target) =>
        target.emit("webrtc-offer", {
          sessionId: data.sessionId,
          fromUserId: getUser(socket)?.id,
          fromUserName: displayName(getUser(socket)),
          offer: data.offer,
        })
      );
    }
  );

  socket.on(
    "webrtc-answer",
    async (data: { sessionId: string; targetUserId: string; answer: unknown }) => {
      const targets = await findSocketsForUser(io, data.sessionId, data.targetUserId);
      targets.forEach((target) =>
        target.emit("webrtc-answer", {
          sessionId: data.sessionId,
          fromUserId: getUser(socket)?.id,
          fromUserName: displayName(getUser(socket)),
          answer: data.answer,
        })
      );
    }
  );

  socket.on(
    "webrtc-ice-candidate",
    async (data: { sessionId: string; targetUserId: string; candidate: unknown }) => {
      const targets = await findSocketsForUser(io, data.sessionId, data.targetUserId);
      targets.forEach((target) =>
        target.emit("webrtc-ice-candidate", {
          sessionId: data.sessionId,
          fromUserId: getUser(socket)?.id,
          candidate: data.candidate,
        })
      );
    }
  );

  socket.on("raise-hand", ({ sessionId }: { sessionId: string }) => {
    const runtime = runtimeSessions.get(sessionId);
    const user = getUser(socket);
    if (!runtime || !user || !getJoinedSessions(socket).has(sessionId)) return;

    runtime.handRaised.add(user.id);
    io.to(roomName(sessionId)).emit("hand-raised", {
      userId: user.id,
      userName: user.name || user.userName || user.email,
    });
  });

  socket.on("lower-hand", ({ sessionId }: { sessionId: string }) => {
    const runtime = runtimeSessions.get(sessionId);
    const user = getUser(socket);
    if (!runtime || !user) return;

    runtime.handRaised.delete(user.id);
    io.to(roomName(sessionId)).emit("hand-lowered", { userId: user.id });
  });

  socket.on(
    "approve-hand-raise",
    ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      const runtime = runtimeSessions.get(sessionId);
      const user = getUser(socket);
      if (!runtime || !user || runtime.hostId !== user.id) {
        socket.emit("error", { message: "Only host can approve hand raises" });
        return;
      }

      const promoted = runtime.users.get(userId);
      if (promoted) promoted.role = "speaker";
      runtime.handRaised.delete(userId);

      io.to(roomName(sessionId)).emit("user-promoted-to-speaker", { userId });
      io.to(roomName(sessionId)).emit("session-state", publicState(runtime));
    }
  );

  socket.on(
    "toggle-mute",
    ({
      sessionId,
      targetUserId,
      isMuted,
    }: { sessionId: string; targetUserId: string; isMuted: boolean }) => {
      const user = getUser(socket);
      if (!user) return;
      if (!isHost(socket, sessionId) && user.id !== targetUserId) {
        socket.emit("error", { message: "Only host can mute others" });
        return;
      }

      io.to(roomName(sessionId)).emit("user-muted", {
        userId: targetUserId,
        isMuted,
      });
    }
  );

  socket.on("start-screen-share", ({ sessionId }: { sessionId: string }) => {
    const user = getUser(socket);
    if (!user || !isHostOrSpeaker(socket, sessionId)) {
      socket.emit("error", { message: "Only speakers can share screen" });
      return;
    }

    io.to(roomName(sessionId)).emit("screen-share-started", {
      userId: user.id,
      userName: user.name || user.userName || user.email,
    });
  });

  socket.on("stop-screen-share", ({ sessionId }: { sessionId: string }) => {
    const user = getUser(socket);
    if (!user) return;
    io.to(roomName(sessionId)).emit("screen-share-stopped", { userId: user.id });
  });

  socket.on("disconnect", () => {
    Array.from(getJoinedSessions(socket)).forEach((sessionId) => {
      removeSocketFromSession(io, socket, sessionId, false);
    });
  });
};
