import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import type { JwtUser } from "../types/auth.js";
import {
  createWhiteboard,
  getWhiteboard,
  addElement,
  updateElement,
  deleteElement,
  clearWhiteboard,
  setCurrentTool,
  setCurrentColor,
  setCurrentSize,
} from "../services/whiteboard.services.js";
import {
  createCodeEditor,
  getCodeEditor,
  updateCode,
  changeLanguage,
  executeCode,
  clearOutput,
  getSupportedLanguages,
} from "../services/codeEditor.services.js";

const getUser = (req: Request): JwtUser => req.user as JwtUser;

export const createWhiteboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const whiteboard = await createWhiteboard(sessionId);

    res.json({ success: true, data: whiteboard });
  }
);

export const getWhiteboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const whiteboard = await getWhiteboard(sessionId);

    if (!whiteboard) {
      throw new AppError("Whiteboard not found", 404);
    }

    res.json({ success: true, data: whiteboard });
  }
);

export const addElementController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { element } = req.body;
    const userId = getUser(req).id;

    const newElement = await addElement(sessionId, element, userId);

    res.json({ success: true, data: newElement });
  }
);

export const updateElementController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, elementId } = req.params as {
      sessionId: string;
      elementId: string;
    };
    const { updates } = req.body;

    const updatedElement = await updateElement(
      sessionId,
      elementId,
      updates
    );

    res.json({ success: true, data: updatedElement });
  }
);

export const deleteElementController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, elementId } = req.params as {
      sessionId: string;
      elementId: string;
    };

    await deleteElement(sessionId, elementId);

    res.json({ success: true, message: "Element deleted successfully" });
  }
);

export const clearWhiteboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };

    await clearWhiteboard(sessionId);

    res.json({ success: true, message: "Whiteboard cleared successfully" });
  }
);

export const setCurrentToolController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { tool } = req.body;

    const result = await setCurrentTool(sessionId, tool);

    res.json({ success: true, data: result });
  }
);

export const setCurrentColorController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { color } = req.body;

    const result = await setCurrentColor(sessionId, color);

    res.json({ success: true, data: result });
  }
);

export const setCurrentSizeController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { size } = req.body;

    const result = await setCurrentSize(sessionId, size);

    res.json({ success: true, data: result });
  }
);

// Code editor controllers

export const createCodeEditorController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { language } = req.body;

    const codeEditor = await createCodeEditor(sessionId, language);

    res.json({ success: true, data: codeEditor });
  }
);

export const getCodeEditorController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };

    const codeEditor = await getCodeEditor(sessionId);

    if (!codeEditor) {
      throw new AppError("Code editor not found", 404);
    }

    res.json({ success: true, data: codeEditor });
  }
);

export const updateCodeController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { code } = req.body;

    const result = await updateCode(sessionId, code);

    res.json({ success: true, data: result });
  }
);

export const changeLanguageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { language } = req.body;

    const result = await changeLanguage(sessionId, language);

    res.json({ success: true, data: result });
  }
);

export const executeCodeController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };

    const result = await executeCode(sessionId);

    res.json({ success: true, data: result });
  }
);

export const clearOutputController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };

    await clearOutput(sessionId);

    res.json({ success: true, message: "Output cleared successfully" });
  }
);

export const getSupportedLanguagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const languages = getSupportedLanguages();

    res.json({ success: true, data: languages });
  }
);
