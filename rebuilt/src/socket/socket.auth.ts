import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import type { Role } from "../types/auth.js";

export interface AuthenticatedSocketUser {
  id: string;
  email: string;
  userName: string | null;
  name: string | null;
  role: Role;
  avatar: string | null;
}

interface JwtPayload {
  id: string;
}

const authenticateSocket = async (
  socket: Socket,
  next: (error?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        userName: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.data.user = user;
    socket.data.sessions = new Set<string>();
    next();
  } catch {
    next(new Error("Authentication error: Invalid token"));
  }
};

export { authenticateSocket };
