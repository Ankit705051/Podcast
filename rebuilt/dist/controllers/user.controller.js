import asyncHandler from "../utils/asyncHandler.js";
import { registerUser, verifyUserByToken, loginUser, logoutUser, getCurrentUser, forgotPassword, resetPassword, updateUser, initializeDefaultAdmin, createAdmin, } from "../services/auth.services.js";
import "dotenv/config";
const currentUserId = (req) => {
    const user = req.user;
    return user.id;
};
// Cookie options matching the legacy backend login behaviour
const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
export const initializeAdminController = asyncHandler(async (_req, res) => {
    const result = await initializeDefaultAdmin();
    return res.status(200).json({
        success: true,
        message: "Admin initialized successfully",
        ...(result !== undefined && { result }),
    });
});
export const registerController = asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);
    return res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email to verify your account.",
        user: { ...result.user, _id: result.user.id },
        token: result.token,
    });
});
export const verifyUserController = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
    if (!verificationToken) {
        return res.status(400).json({ message: "Invalid token" });
    }
    await verifyUserByToken(verificationToken);
    return res.status(200).json({
        success: true,
        message: "User is verified successfully",
    });
});
export const createAdminController = asyncHandler(async (req, res) => {
    const result = await createAdmin(req.body);
    return res.status(201).json({
        success: true,
        message: "Admin created successfully",
        admin: result,
    });
});
export const loginController = asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);
    res.cookie("token", result.token, authCookieOptions);
    return res.status(200).json({
        success: true,
        token: result.token,
        user: result.user,
        message: "User logged in successfully",
    });
});
export const logoutController = asyncHandler(async (_req, res) => {
    await logoutUser();
    res.clearCookie("token");
    return res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });
});
export const getUserController = asyncHandler(async (req, res) => {
    const user = await getCurrentUser(currentUserId(req));
    return res.status(200).json({
        success: true,
        user,
    });
});
export const forgotPasswordController = asyncHandler(async (req, res) => {
    await forgotPassword(req.body);
    return res.status(200).json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent.",
    });
});
export const resetPasswordController = asyncHandler(async (req, res) => {
    const { token } = req.params;
    await resetPassword(token, req.body);
    return res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});
export const updateUserController = asyncHandler(async (req, res) => {
    const avatarPath = req.file
        ? `/uploads/avatars/${req.file.filename}`
        : undefined;
    const user = await updateUser(currentUserId(req), req.body, avatarPath);
    return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user,
    });
});
//# sourceMappingURL=user.controller.js.map