import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  recordingSessionParamsSchema,
  recordingIdParamsSchema,
  stopRecordingSchema,
} from "../validation/recording.validation.js";
import {
  startRecordingController,
  stopRecordingController,
  getSessionRecordingsController,
  getUserRecordingsController,
  deleteRecordingController,
  downloadRecordingController,
} from "../controllers/recording.controllers.js";

const router = Router();

router.post(
  "/start/:sessionId",
  authenticateUser,
  validate(recordingSessionParamsSchema, "params"),
  startRecordingController
);

router.post(
  "/stop/:sessionId",
  authenticateUser,
  validate(recordingSessionParamsSchema, "params"),
  validate(stopRecordingSchema, "body"),
  stopRecordingController
);

router.get(
  "/session/:sessionId",
  validate(recordingSessionParamsSchema, "params"),
  getSessionRecordingsController
);

router.get("/user", authenticateUser, getUserRecordingsController);

router.delete(
  "/:recordingId",
  authenticateUser,
  validate(recordingIdParamsSchema, "params"),
  deleteRecordingController
);

router.get(
  "/download/:recordingId",
  authenticateUser,
  validate(recordingIdParamsSchema, "params"),
  downloadRecordingController
);

export default router;
