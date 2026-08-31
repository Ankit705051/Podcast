import asyncHandler from "../utils/asyncHandler.js";
import { registerUser, initializeDefaultAdmin, createAdmin, loginUser, logoutUser } from "../services/auth.services.js";
import { sendCreated } from "../utils/response.js";
export const initializeAdminController = asyncHandler(async (_req, res) => {
    const result = await initializeDefaultAdmin();
    return sendCreated(res, "Admin initialized successfully", result);
});
export const registerController = asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);
    return sendCreated(res, "User registered successfully", result);
});
export const createAdminController = asyncHandler(async (req, res) => {
    const result = await createAdmin(req.body);
    return sendCreated(res, "Admin created successfully", result);
});
export const loginController = asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);
    return sendCreated(res, "User logged in successfully", result);
});
export const logoutController = asyncHandler(async (_req, res) => {
    const result = await logoutUser();
    return sendCreated(res, "User logged out successfully", result);
});
//# sourceMappingURL=user.controller.js.map