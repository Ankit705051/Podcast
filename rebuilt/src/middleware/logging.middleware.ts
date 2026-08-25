import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";
import { logger } from "../config/logger.js";
import type { Request } from "express";

export const loggingMiddleware = pinoHttp({
  logger,

  genReqId: (req: Request) => {
    return req.requestId || randomUUID();
  },
});



