import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError } from "../utils/response.js";
import type { Role, JwtUser } from "../types/auth.js";

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as JwtUser;

      if (!user) {
        return sendError(res, 404, "User not found");
      }

      if (!allowedRoles.includes(user.role)) {
        return sendError(
          res,
          403,
          "Forbidden - Insufficient permissions"
        );
      }

      next();
    }
  );
};
