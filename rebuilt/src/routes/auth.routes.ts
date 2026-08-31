import { Router } from "express";
import { registerController, createAdminController, loginController, logoutController } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validation/user.validation.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
const router = Router();

router.post("/register", validate(registerSchema, "body"), registerController);
router.post("/admin", authorizeRoles("admin"),validate(registerSchema, "body"), createAdminController);
router.post("/login", validate(loginSchema, "body"), loginController);
router.post("/logout", logoutController);

export default router;