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