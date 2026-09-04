import { Router } from "express";
import { createChatController } from "../controllers/chat.controllers.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  chatValidationSchema,
  chatParamsSchema,
} from "../validation/chat.validation.js";

const router = Router();

router.post(
  "/createChat/:sessionId",
  validate(chatParamsSchema, "params"),
  validate(chatValidationSchema, "body"),
  createChatController
);

export default router;