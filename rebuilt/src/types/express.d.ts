import type { JwtPayload } from "jsonwebtoken";
import type { JwtUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: string | JwtPayload | JwtUser;
    }
  }
}

export {};
