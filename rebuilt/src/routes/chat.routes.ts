import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  chatValidationSchema,
  chatHistoryParamsSchema,
  chatMessageParamsSchema,
} from "../validation/chat.validation.js";
import {
  getChatHistoryController,
  saveMessageController,
  deleteMessageController,
} from "../controllers/chat.controllers.js";

const router = Router();

router.get(
  "/session/:sessionId/history",
  authenticateUser,
  validate(chatHistoryParamsSchema, "params"),
  getChatHistoryController
);

router.post(
  "/save",
  authenticateUser,
  validate(chatValidationSchema, "body"),
  saveMessageController
);

router.delete(
  "/message/:messageId",
  authenticateUser,
  validate(chatMessageParamsSchema, "params"),
  deleteMessageController
);

export default router;
