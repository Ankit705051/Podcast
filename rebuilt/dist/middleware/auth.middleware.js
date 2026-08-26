import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError } from "../utils/response.js";
const authenticateUser = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return sendError(res, 401, "Unauthorized - No token provided");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return sendError(res, 401, "Unauthorized - Invalid token");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
});
export default authenticateUser;
//# sourceMappingURL=auth.middleware.js.map