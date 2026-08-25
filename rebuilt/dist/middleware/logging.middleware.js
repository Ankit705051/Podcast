import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";
import { logger } from "../config/logger.js";
export const loggingMiddleware = pinoHttp({
    logger,
    genReqId: (req) => {
        return req.requestId || randomUUID();
    },
});
//# sourceMappingURL=logging.middleware.js.map