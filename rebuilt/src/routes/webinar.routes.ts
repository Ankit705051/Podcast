import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  webinarParamsSchema,
  pollParamsSchema,
  questionParamsSchema,
  createPollSchema,
  votePollSchema,
  submitQuestionSchema,
  answerQuestionSchema,
  addModeratorSchema,
  removeModeratorSchema,
  questionsQuerySchema,
} from "../validation/webinar.validation.js";
import {
  createWebinarController,
  getWebinarController,
  createPollController,
  voteOnPollController,
  endPollController,
  getPollResultsController,
  submitQuestionController,
  upvoteQuestionController,
  answerQuestionController,
  getQuestionsController,
  addModeratorController,
  removeModeratorController,
} from "../controllers/webinar.controllers.js";

const sessionRoutes = Router();

// Webinar initialization
sessionRoutes.post(
  "/:sessionId/webinar",
  authenticateUser,
  validate(webinarParamsSchema, "params"),
  createWebinarController
);
sessionRoutes.get(
  "/:sessionId/webinar",
  authenticateUser,
  validate(webinarParamsSchema, "params"),
  getWebinarController
);

// Poll routes
sessionRoutes.post(
  "/:sessionId/poll",
  authenticateUser,
  validate(webinarParamsSchema, "params"),
  validate(createPollSchema, "body"),
  createPollController
);
sessionRoutes.post(
  "/:sessionId/poll/:pollId/vote",
  authenticateUser,
  validate(pollParamsSchema, "params"),
  validate(votePollSchema, "body"),
  voteOnPollController
);
sessionRoutes.post(
  "/:sessionId/poll/:pollId/end",
  authenticateUser,
  validate(pollParamsSchema, "params"),
  endPollController
);
sessionRoutes.get(
  "/:sessionId/poll/:pollId/results",
  authenticateUser,
  validate(pollParamsSchema, "params"),
  getPollResultsController
);

// Q&A routes
sessionRoutes.post(
  "/:sessionId/question",
  authenticateUser,
  validate(webinarParamsSchema, "params"),
  validate(submitQuestionSchema, "body"),
  submitQuestionController
);
sessionRoutes.post(
  "/:sessionId/question/:questionId/upvote",
  authenticateUser,
  validate(questionParamsSchema, "params"),
  upvoteQuestionController
);
sessionRoutes.post(
  "/:sessionId/question/:questionId/answer",
  authenticateUser,
  validate(questionParamsSchema, "params"),
  validate(answerQuestionSchema, "body"),
  answerQuestionController
);
sessionRoutes.get(
  "/:sessionId/questions",
  authenticateUser,
  validate(webinarParamsSchema, "params"),
  validate(questionsQuerySchema, "query"),
  getQuestionsController
);

// Moderator routes
sessionRoutes.post(
  "/:sessionId/moderator",
  authenticateUser,
  validate(webinarParamsSchema, "params"),
  validate(addModeratorSchema, "body"),
  addModeratorController
);
sessionRoutes.delete(
  "/:sessionId/moderator",
  authenticateUser,
  validate(webinarParamsSchema, "params"),
  validate(removeModeratorSchema, "body"),
  removeModeratorController
);

// The rebuilt API uses /:sessionId/... while the legacy backend used
// /webinar/:sessionId/...; expose both under /api/v1/webinar.
const router = Router();
router.use("/", sessionRoutes);
router.use("/webinar", sessionRoutes);

export default router;
