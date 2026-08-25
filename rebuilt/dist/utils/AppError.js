export class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=AppError.js.map