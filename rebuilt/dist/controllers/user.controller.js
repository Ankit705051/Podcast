import asyncHandler from "../utils/asyncHandler.js";
import { registerUser } from "../services/auth.services.js";
import { sendCreated } from "../utils/response.js";
export const registerController = asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);
    return sendCreated(res, "User registered successfully", result);
});
//# sourceMappingURL=user.controller.js.map