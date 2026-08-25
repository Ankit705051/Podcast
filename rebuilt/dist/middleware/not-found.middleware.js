import { AppError } from "../utils/AppError.js";
export const notFoundHandler = (req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND"));
};
//# sourceMappingURL=not-found.middleware.js.map