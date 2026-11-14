import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import type { JwtUser } from "../types/auth.js";
import {
  getChatHistory,
  saveMessage,
  deleteMessage,
} from "../services/chat.services.js";
import type { ChatType } from "@prisma/client";

const currentUser = (req: Request): JwtUser => req.user as JwtUser;

export const getChatHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const messages = await getChatHistory(req.params.sessionId as string);
    return res.status(200).json({
      success: true,
      data: {
        messages,
        total: messages.length,
      },
    });
  }
);

export const saveMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, message, type } = req.body as {
      sessionId: string;
      message: string;
      type?: ChatType;
    };
    const saved = await saveMessage(
      currentUser(req).id,
      sessionId,
      message,
      type
    );
    return res.status(201).json({
      success: true,
      data: saved,
    });
  }
);

export const deleteMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteMessage(req.params.messageId as string, currentUser(req).id);
    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  }
);
