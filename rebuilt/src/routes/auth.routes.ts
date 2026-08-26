import { Router } from "express";
import { registerController } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validation/user.validation.js";

const router = Router();

router.post("/register", validate(registerSchema, "body"), registerController);

export default router;