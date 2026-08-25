import rateLimit from "express-rate-limit";
const Rate_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const Rate_LIMIT_MAX = Number(process.env.GLOBAL_RATE_LIMIT_MAX) || 100;
const Rate_LIMIT_AUTH_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;
export const globalrateLimiter = rateLimit({
    windowMs: Rate_LIMIT_WINDOW,
    max: Rate_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
});
export const authRatelimiter = rateLimit({
    windowMs: Rate_LIMIT_WINDOW,
    max: Rate_LIMIT_AUTH_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
});
//# sourceMappingURL=rateLimiter.js.map