import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import type { JwtUser } from "../types/auth.js";
import {
  createWebinar,
  getWebinar,
  createPoll,
  voteOnPoll,
  endPoll,
  getPollResults,
  submitQuestion,
  upvoteQuestion,
  answerQuestion,
  getQuestions,
  addModerator,
  removeModerator,
} from "../services/webinar.services.js";

const getUser = (req: Request): JwtUser => req.user as JwtUser;

const getUserName = (user: JwtUser): string =>
  user.userName || user.name || user.email;

// Webinar initialization

export const createWebinarController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };

    const webinar = await createWebinar(sessionId);

    res.json({ success: true, data: webinar });
  }
);

export const getWebinarController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };

    const webinar = await getWebinar(sessionId);

    if (!webinar) {
      throw new AppError("Webinar not found", 404);
    }

    res.json({ success: true, data: webinar });
  }
);

// Poll controllers

export const createPollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { question, options, expiresAt } = req.body;
    const userId = getUser(req).id;

    const poll = await createPoll(
      sessionId,
      { question, options, ...(expiresAt ? { expiresAt } : {}) },
      userId
    );

    res.json({ success: true, data: poll });
  }
);

export const voteOnPollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, pollId } = req.params as {
      sessionId: string;
      pollId: string;
    };
    const { optionId } = req.body;
    const userId = getUser(req).id;

    const result = await voteOnPoll(sessionId, pollId, optionId, userId);

    res.json({ success: true, data: result });
  }
);

export const endPollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, pollId } = req.params as {
      sessionId: string;
      pollId: string;
    };
    const userId = getUser(req).id;

    const results = await endPoll(sessionId, pollId, userId);

    res.json({ success: true, data: results });
  }
);

export const getPollResultsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, pollId } = req.params as {
      sessionId: string;
      pollId: string;
    };

    const results = await getPollResults(sessionId, pollId);

    res.json({ success: true, data: results });
  }
);

// Q&A controllers

export const submitQuestionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { question } = req.body;
    const user = getUser(req);

    const newQuestion = await submitQuestion(
      sessionId,
      question,
      user.id,
      getUserName(user)
    );

    res.json({ success: true, data: newQuestion });
  }
);

export const upvoteQuestionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, questionId } = req.params as {
      sessionId: string;
      questionId: string;
    };
    const userId = getUser(req).id;

    const result = await upvoteQuestion(sessionId, questionId, userId);

    res.json({ success: true, data: result });
  }
);

export const answerQuestionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, questionId } = req.params as {
      sessionId: string;
      questionId: string;
    };
    const { answer } = req.body;
    const userId = getUser(req).id;

    const result = await answerQuestion(sessionId, questionId, answer, userId);

    res.json({ success: true, data: result });
  }
);

export const getQuestionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { answered } = req.query as { answered?: string };

    const questions = await getQuestions(sessionId, answered === "true");

    res.json({ success: true, data: questions });
  }
);

// Moderator controllers

export const addModeratorController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { userId } = req.body;
    const requesterId = getUser(req).id;

    const result = await addModerator(sessionId, userId, requesterId);

    res.json({ success: true, data: result });
  }
);

export const removeModeratorController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId: string };
    const { userId } = req.body;
    const requesterId = getUser(req).id;

    const result = await removeModerator(sessionId, userId, requesterId);

    res.json({ success: true, data: result });
  }
);
