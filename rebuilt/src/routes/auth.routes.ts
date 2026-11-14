import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validation/user.validation.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import {
  registerController,
  createAdminController,
  loginController,
  logoutController,
} from "../controllers/user.controller.js";

// NOTE: this router is not mounted by index.ts (which uses users.routes.ts).
// Kept for compatibility; mirrors the legacy auth endpoints.
const router = Router();

router.post("/register", validate(registerSchema, "body"), registerController);
router.post(
  "/admin",
  authenticateUser,
  authorizeRoles("admin"),
  validate(registerSchema, "body"),
  createAdminController
);
router.post("/login", loginController);
router.post("/logout", logoutController);

export default router;
