import { randomUUID } from "node:crypto";
const requestIdMiddleware = (req, res, next) => {
    const requestId = randomUUID();
    res.setHeader("X-Request-ID", requestId);
    req.requestId = requestId;
    next();
};
export default requestIdMiddleware;
//# sourceMappingURL=request-id.middeware.js.map