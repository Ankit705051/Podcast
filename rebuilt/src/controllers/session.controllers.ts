import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import type { JwtUser } from "../types/auth.js";
import {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  joinSession,
  startSession,
  endSession,
  leaveSession,
  toggleRecording,
  toggleScreenShare,
} from "../services/session.services.js";
import type {
  CreateSessionInput,
  UpdateSessionInput,
  SessionQueryInput,
} from "../types/session.js";
import type { ParticipantRole } from "@prisma/client";

const currentUser = (req: Request): JwtUser => req.user as JwtUser;
const isAdmin = (req: Request): boolean => currentUser(req).role === "admin";

export const getAllSessionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getAllSessions(req.query as unknown as SessionQueryInput);
    return res.status(200).json({
      success: true,
      sessions: result.sessions,
      pagination: result.pagination,
    });
  }
);

export const getSessionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await getSessionById(req.params.id as string);
    return res.status(200).json({ success: true, session });
  }
);

export const createSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await createSession(
      req.body as CreateSessionInput,
      currentUser(req).id
    );
    return res.status(201).json({
      success: true,
      message: "Session created successfully",
      session,
    });
  }
);

export const updateSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await updateSession(
      req.params.id as string,
      req.body as UpdateSessionInput,
      currentUser(req).id,
      isAdmin(req)
    );
    return res.status(200).json({
      success: true,
      message: "Session updated successfully",
      session,
    });
  }
);

export const deleteSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteSession(
      req.params.id as string,
      currentUser(req).id,
      isAdmin(req)
    );
    return res.status(200).json({
      success: true,
      message: "Session cancelled successfully",
    });
  }
);

export const joinSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { role } = req.body as { role: ParticipantRole };
    const session = await joinSession(
      req.params.id as string,
      currentUser(req).id,
      role
    );
    return res.status(200).json({
      success: true,
      message: "Joined session successfully",
      session,
    });
  }
);

export const startSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await startSession(
      req.params.id as string,
      currentUser(req).id,
      isAdmin(req)
    );
    return res.status(200).json({
      success: true,
      message: "Session started successfully",
      session,
    });
  }
);

export const endSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await endSession(
      req.params.id as string,
      currentUser(req).id,
      isAdmin(req)
    );
    return res.status(200).json({
      success: true,
      message: "Session ended successfully",
      session,
    });
  }
);

export const leaveSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { session, hostLeft } = await leaveSession(
      req.params.id as string,
      currentUser(req).id
    );
    return res.status(200).json({
      success: true,
      message: hostLeft
        ? "Host left. Session ended successfully."
        : "Left session successfully",
      session,
    });
  }
);

export const toggleRecordingController = asyncHandler(
  async (req: Request, res: Response) => {
    const { enabled } = req.body as { enabled: boolean };
    const session = await toggleRecording(
      req.params.id as string,
      currentUser(req).id,
      enabled,
      isAdmin(req)
    );
    return res.status(200).json({
      success: true,
      message: `Recording ${enabled ? "started" : "stopped"}`,
      session,
    });
  }
);

export const toggleScreenShareController = asyncHandler(
  async (req: Request, res: Response) => {
    const { enabled } = req.body as { enabled: boolean };
    const session = await toggleScreenShare(
      req.params.id as string,
      currentUser(req).id,
      enabled,
      isAdmin(req)
    );
    return res.status(200).json({
      success: true,
      message: `Screen sharing ${enabled ? "enabled" : "disabled"}`,
      session,
    });
  }
);
