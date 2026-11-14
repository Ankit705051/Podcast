import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import type { JwtUser } from "../types/auth.js";
import {
  startRecording,
  stopRecording,
  getSessionRecordings,
  getUserRecordings,
  deleteRecording,
  downloadRecording,
} from "../services/recording.services.js";

const currentUser = (req: Request): JwtUser => req.user as JwtUser;

export const startRecordingController = asyncHandler(
  async (req: Request, res: Response) => {
    const recording = await startRecording(
      req.params.sessionId as string,
      currentUser(req).id
    );
    return res.status(201).json({
      success: true,
      message: "Recording started successfully",
      recording,
    });
  }
);

export const stopRecordingController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as {
      fileUrl?: string;
      fileType?: string;
      fileSize?: number;
      duration?: number;
      thumbnailUrl?: string;
      file_url?: string;
      file_type?: string;
      file_size?: number;
      thumbnail_url?: string;
    };
    // Accept both snake_case and camelCase request fields
    const input = {
      fileUrl: body.fileUrl ?? body.file_url,
      fileType: body.fileType ?? body.file_type,
      fileSize: body.fileSize ?? body.file_size,
      duration: body.duration,
      thumbnailUrl: body.thumbnailUrl ?? body.thumbnail_url,
    };
    const recording = await stopRecording(
      req.params.sessionId as string,
      currentUser(req).id,
      input
    );
    return res.status(200).json({
      success: true,
      message: "Recording saved successfully",
      recording,
    });
  }
);

export const getSessionRecordingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const recordings = await getSessionRecordings(
      req.params.sessionId as string
    );
    return res.status(200).json({ success: true, recordings });
  }
);

export const getUserRecordingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const recordings = await getUserRecordings(currentUser(req).id);
    return res.status(200).json({ success: true, recordings });
  }
);

export const deleteRecordingController = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteRecording(
      req.params.recordingId as string,
      currentUser(req).id
    );
    return res.status(200).json({
      success: true,
      message: "Recording deleted successfully",
    });
  }
);

export const downloadRecordingController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await downloadRecording(req.params.recordingId as string);
    return res.status(200).json({ success: true, ...result });
  }
);
