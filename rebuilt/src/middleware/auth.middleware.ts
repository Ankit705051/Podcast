import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError } from "../utils/response.js";
import { prisma } from "../lib/prisma.js";
import type { JwtUser } from "../types/auth.js";

interface AccessTokenPayload {
  id: string;
}

const authenticateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.token;

    if (!token) {
      return sendError(res, 401, "Unauthorized - No token provided");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
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
        return sendError(res, 404, "User not found");
      }

      req.user = user as JwtUser;
      next();
    } catch {
      return sendError(res, 401, "Unauthorized - Invalid token");
    }
  }
);

export default authenticateUser;
