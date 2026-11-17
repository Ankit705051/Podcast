import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";
export const errorHandler = (err, req, res, next) => {
    console.error(err);
    // custom apperror
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.code && { code: err.code }),
        });
    }
    // malformed JSON / body-parser errors
    const bodyErr = err;
    if (bodyErr.type === "entity.parse.failed" ||
        bodyErr.type === "entity.too.large") {
        return res.status(bodyErr.statusCode ?? 400).json({
            success: false,
            message: bodyErr.type === "entity.too.large"
                ? "Request body too large"
                : "Invalid JSON body",
            code: "INVALID_BODY",
        });
    }
    // transient database connectivity issues (e.g. Neon cold start / timeout)
    const errName = err instanceof Error ? err.name : "";
    const errMessage = err instanceof Error ? err.message : "";
    if (errName === "PrismaClientUnknownRequestError" ||
        errName === "PrismaClientInitializationError" ||
        /ETIMEDOUT|P1001|Can't reach database server/i.test(errMessage)) {
        return res.status(503).json({
            success: false,
            message: "Database temporarily unavailable, please try again",
            code: "DATABASE_UNAVAILABLE",
        });
    }
    // zod validation Error
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            code: "VALIDATION_ERROR",
            errors: err.flatten().fieldErrors,
        });
    }
    // preisma known error 
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                return res.status(409).json({
                    success: false,
                    message: "A record with this value already exists",
                    code: "DUPLICATE_RECORD",
                });
            case "P2003":
                return res.status(400).json({
                    success: false,
                    message: "Related record does not exist",
                    code: "FOREIGN_KEY_ERROR",
                });
            case "P2025":
                return res.status(404).json({
                    success: false,
                    message: "Requested record was not found",
                    code: "RECORD_NOT_FOUND",
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: "Database operation failed",
                    code: "DATABASE_ERROR",
                });
        }
    }
    if (err instanceof Error && err.name === "MulterError") {
        const multerError = err;
        return res.status(400).json({
            success: false,
            message: multerError.code === "LIMIT_FILE_SIZE"
                ? "File size exceeds the 10MB limit"
                : multerError.message,
            code: "UPLOAD_ERROR",
        });
    }
    // unknown error 
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? "Internal server error"
            : err instanceof Error ? err.message : "Unknown error",
        code: "INTERNAL_SERVER_ERROR",
    });
};
//# sourceMappingURL=error.middleware.js.map