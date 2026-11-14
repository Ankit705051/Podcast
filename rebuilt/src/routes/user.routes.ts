import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "../validation/user.validation.js";
import {
  registerController,
  verifyUserController,
  loginController,
  logoutController,
  getUserController,
  forgotPasswordController,
  resetPasswordController,
  updateUserController,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/register", validate(registerSchema, "body"), registerController);
router.get("/verify/:verificationToken", verifyUserController);
router.post("/login", validate(loginSchema, "body"), loginController);
router.post("/logout", logoutController);
router.get("/user", authenticateUser, getUserController);
router.get("/me", authenticateUser, getUserController);
router.post(
  "/forget-password",
  validate(forgotPasswordSchema, "body"),
  forgotPasswordController
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema, "body"),
  resetPasswordController
);
router.put(
  "/update-user",
  authenticateUser,
  uploadAvatar,
  validate(updateUserSchema, "body"),
  updateUserController
);

export default router;
