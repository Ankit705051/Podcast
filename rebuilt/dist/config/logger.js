import pino from "pino";
const loggerOptions = {
    level: process.env.LOG_LEVEL || "info",
};
if (process.env.NODE_ENV && process.env.NODE_ENV !== "production") {
    loggerOptions.transport = {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
        },
    };
}
export const logger = pino(loggerOptions);
//# sourceMappingURL=logger.js.map