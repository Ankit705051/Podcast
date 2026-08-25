import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = randomUUID();

  res.setHeader("X-Request-ID", requestId);

  req.requestId = requestId;

  next();
};

export default requestIdMiddleware;