import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  sessionParamsSchema,
  elementParamsSchema,
  addElementSchema,
  updateElementSchema,
  setToolSchema,
  setColorSchema,
  setSizeSchema,
  createCodeEditorSchema,
  updateCodeSchema,
  changeLanguageSchema,
} from "../validation/interview.validation.js";
import {
  createWhiteboardController,
  getWhiteboardController,
  addElementController,
  updateElementController,
  deleteElementController,
  clearWhiteboardController,
  setCurrentToolController,
  setCurrentColorController,
  setCurrentSizeController,
  createCodeEditorController,
  getCodeEditorController,
  updateCodeController,
  changeLanguageController,
  executeCodeController,
  clearOutputController,
  getSupportedLanguagesController,
} from "../controllers/interview.controllers.js";

const router = Router();

// Static routes first to avoid being captured by /:sessionId params
router.get("/languages", authenticateUser, getSupportedLanguagesController);
router.get(
  "/code-editor/languages",
  authenticateUser,
  getSupportedLanguagesController
);

// Whiteboard routes (mounted under /api/v1/interview)
router.post(
  "/:sessionId/whiteboard",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  createWhiteboardController
);
router.get(
  "/:sessionId/whiteboard",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  getWhiteboardController
);
router.post(
  "/:sessionId/element",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(addElementSchema, "body"),
  addElementController
);
router.put(
  "/:sessionId/element/:elementId",
  authenticateUser,
  validate(elementParamsSchema, "params"),
  validate(updateElementSchema, "body"),
  updateElementController
);
router.delete(
  "/:sessionId/element/:elementId",
  authenticateUser,
  validate(elementParamsSchema, "params"),
  deleteElementController
);
router.post(
  "/:sessionId/clear",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  clearWhiteboardController
);
router.post(
  "/:sessionId/tool",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(setToolSchema, "body"),
  setCurrentToolController
);
router.post(
  "/:sessionId/color",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(setColorSchema, "body"),
  setCurrentColorController
);
router.post(
  "/:sessionId/size",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(setSizeSchema, "body"),
  setCurrentSizeController
);

// Code editor routes
router.post(
  "/:sessionId/code-editor",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(createCodeEditorSchema, "body"),
  createCodeEditorController
);
router.get(
  "/:sessionId/code-editor",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  getCodeEditorController
);
router.put(
  "/:sessionId/code-editor/code",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(updateCodeSchema, "body"),
  updateCodeController
);
router.post(
  "/:sessionId/code-editor/language",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(changeLanguageSchema, "body"),
  changeLanguageController
);
router.post(
  "/:sessionId/code-editor/execute",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  executeCodeController
);
router.post(
  "/:sessionId/code-editor/clear-output",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  clearOutputController
);

// Legacy route aliases matching the old backend paths
// (/api/v1/interview/whiteboard/:sessionId, /api/v1/interview/code-editor/:sessionId)
router.post(
  "/whiteboard/:sessionId",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  createWhiteboardController
);
router.get(
  "/whiteboard/:sessionId",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  getWhiteboardController
);
router.post(
  "/whiteboard/:sessionId/element",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(addElementSchema, "body"),
  addElementController
);
router.put(
  "/whiteboard/:sessionId/element/:elementId",
  authenticateUser,
  validate(elementParamsSchema, "params"),
  validate(updateElementSchema, "body"),
  updateElementController
);
router.delete(
  "/whiteboard/:sessionId/element/:elementId",
  authenticateUser,
  validate(elementParamsSchema, "params"),
  deleteElementController
);
router.post(
  "/whiteboard/:sessionId/clear",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  clearWhiteboardController
);
router.post(
  "/whiteboard/:sessionId/tool",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(setToolSchema, "body"),
  setCurrentToolController
);
router.post(
  "/whiteboard/:sessionId/color",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(setColorSchema, "body"),
  setCurrentColorController
);
router.post(
  "/whiteboard/:sessionId/size",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(setSizeSchema, "body"),
  setCurrentSizeController
);

router.post(
  "/code-editor/:sessionId",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(createCodeEditorSchema, "body"),
  createCodeEditorController
);
router.get(
  "/code-editor/:sessionId",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  getCodeEditorController
);
router.put(
  "/code-editor/:sessionId/code",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(updateCodeSchema, "body"),
  updateCodeController
);
router.post(
  "/code-editor/:sessionId/language",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  validate(changeLanguageSchema, "body"),
  changeLanguageController
);
router.post(
  "/code-editor/:sessionId/execute",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  executeCodeController
);
router.post(
  "/code-editor/:sessionId/clear-output",
  authenticateUser,
  validate(sessionParamsSchema, "params"),
  clearOutputController
);

export default router;
