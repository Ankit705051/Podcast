import asyncHandler from "../utils/asyncHandler.js";
import { sendError } from "../utils/response.js";
export const authorizeRoles = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        const user = req.user;
        if (!user) {
            return sendError(res, 404, "User not found");
        }
        if (!allowedRoles.includes(user.role)) {
            return sendError(res, 403, "Forbidden - Insufficient permissions");
        }
        next();
    });
};
//# sourceMappingURL=authorize.middleware.js.map