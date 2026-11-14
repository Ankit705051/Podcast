import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { sendError } from "../utils/response.js";
import { prisma } from "../lib/prisma.js";
const authenticateUser = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "") ||
        req.cookies?.token;
    if (!token) {
        return sendError(res, 401, "Unauthorized - No token provided");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                userName: true,
                name: true,
                role: true,
                avatar: true,
            },
        });
        if (!user) {
            return sendError(res, 404, "User not found");
        }
        req.user = user;
        next();
    }
    catch {
        return sendError(res, 401, "Unauthorized - Invalid token");
    }
});
export default authenticateUser;
//# sourceMappingURL=auth.middleware.js.map