import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { authenticateSocket } from "./socket.auth.js";
import { registerChatEvent } from "./chat.socket.js";
import { registerSessionEvents } from "./session.socket.js";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URI,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4412",
].filter((origin): origin is string => Boolean(origin));

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const user = socket.data.user as
      | { id: string; name?: string | null; email?: string }
      | undefined;

    if (user?.id) {
      socket.join(`user_${user.id}`);
    }

    registerSessionEvents(io, socket);
    registerChatEvent(io, socket);

    socket.on("error", (error: Error) => {
      console.error("Socket error:", error.message);
    });
  });

  return io;
};

export default initializeSocket;
