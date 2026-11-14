import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createSessionSchema,
  updateSessionSchema,
  joinSessionSchema,
  toggleSessionSchema,
  sessionParamsSchema,
  sessionQuerySchema,
} from "../validation/session.validation.js";
import {
  getAllSessionsController,
  getSessionByIdController,
  createSessionController,
  updateSessionController,
  deleteSessionController,
  joinSessionController,
  startSessionController,
  endSessionController,
  leaveSessionController,
  toggleRecordingController,
  toggleScreenShareController,
} from "../controllers/session.controllers.js";

const router = Router();

router.post(
  "/create",
  authenticateUser,
  authorizeRoles("host", "admin"),
  validate(createSessionSchema, "body"),
  createSessionController
);

router.get("/", validate(sessionQuerySchema, "query"), getAllSessionsController);

router.get(
  "/:id",
  validate(sessionParamsSchema, "params"),
  getSessionByIdController
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("host", "admin"),
  validate(sessionParamsSchema, "params"),
  validate(updateSessionSchema, "body"),
  updateSessionController
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("host", "admin"),
  validate(sessionParamsSchema, "params"),
  deleteSessionController
);

router.post(
  "/:id/join",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(joinSessionSchema, "body"),
  joinSessionController
);

router.post(
  "/:id/start",
  authenticateUser,
  authorizeRoles("host", "admin"),
  validate(sessionParamsSchema, "params"),
  startSessionController
);

router.post(
  "/:id/end",
  authenticateUser,
  authorizeRoles("host", "admin"),
  validate(sessionParamsSchema, "params"),
  endSessionController
);

router.post(
  "/:id/leave",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  leaveSessionController
);

router.post(
  "/:id/toggle-recording",
  authenticateUser,
  authorizeRoles("host", "admin"),
  validate(sessionParamsSchema, "params"),
  validate(toggleSessionSchema, "body"),
  toggleRecordingController
);

router.post(
  "/:id/toggle-screen-share",
  authenticateUser,
  authorizeRoles("host", "admin"),
  validate(sessionParamsSchema, "params"),
  validate(toggleSessionSchema, "body"),
  toggleScreenShareController
);

export default router;
