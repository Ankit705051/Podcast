import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

const getSessionOrThrow = async (sessionId: string) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw new AppError("Session not found", 404);
  }
  return session;
};

const getWebinarOrThrow = async (sessionId: string) => {
  const webinar = await prisma.webinarState.findUnique({
    where: { sessionId },
  });
  if (!webinar) {
    throw new AppError("Webinar not found", 404);
  }
  return webinar;
};

const assertHost = (
  session: { hostId: string },
  userId: string,
  message = "Only host can perform this action"
) => {
  if (session.hostId !== userId) {
    throw new AppError(message, 403);
  }
};



export const createWebinar = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);

  return prisma.webinarState.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId, moderators: [] },
  });
};

export const getWebinar = async (sessionId: string) => {
  return prisma.webinarState.findUnique({ where: { sessionId } });
};



export interface CreatePollData {
  question: string;
  options: string[];
  expiresAt?: Date;
}

export const createPoll = async (
  sessionId: string,
  pollData: CreatePollData,
  userId: string
) => {
  const session = await getSessionOrThrow(sessionId);
  if (session.hostId !== userId) {
    throw new AppError("Only host can create polls", 403);
  }

  const webinar = await prisma.webinarState.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId, moderators: [] },
  });

  const poll = await prisma.poll.create({
    data: {
      sessionId,
      webinarId: webinar.id,
      question: pollData.question,
      createdById: userId,
      ...(pollData.expiresAt ? { expiresAt: pollData.expiresAt } : {}),
      options: {
        create: pollData.options.map((text, index) => ({
          text,
          order: index,
        })),
      },
    },
    include: {
      options: { orderBy: { order: "asc" } },
    },
  });

  await prisma.webinarState.update({
    where: { id: webinar.id },
    data: { activePollId: poll.id },
  });

  return poll;
};

export const voteOnPoll = async (
  sessionId: string,
  pollId: string,
  optionId: string,
  userId: string
) => {
  await getSessionOrThrow(sessionId);

  const poll = await prisma.poll.findFirst({
    where: { id: pollId, sessionId },
    include: { options: true },
  });
  if (!poll) {
    throw new AppError("Poll not found", 404);
  }
  if (!poll.isActive) {
    throw new AppError("Poll is not active", 400);
  }

  const option = poll.options.find((o: { id: string }) => o.id === optionId);
  if (!option) {
    throw new AppError("Option not found", 404);
  }

  const existingVote = await prisma.pollVote.findUnique({
    where: { pollId_userId: { pollId, userId } },
  });
  if (existingVote) {
    throw new AppError("You have already voted in this poll", 409);
  }

  let votes = 0;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.pollVote.create({
        data: { pollId, optionId, userId },
      });
      const updatedOption = await tx.pollOption.update({
        where: { id: optionId },
        data: { votes: { increment: 1 } },
        select: { votes: true },
      });
      votes = updatedOption.votes;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("You have already voted in this poll", 409);
    }
    throw error;
  }

  return { success: true, votes };
};

export const endPoll = async (
  sessionId: string,
  pollId: string,
  userId: string
) => {
  const session = await getSessionOrThrow(sessionId);
  assertHost(session, userId, "Only host can end polls");

  const poll = await prisma.poll.findFirst({
    where: { id: pollId, sessionId },
  });
  if (!poll) {
    throw new AppError("Poll not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.poll.update({
      where: { id: poll.id },
      data: { isActive: false, endedAt: new Date() },
    });
    await tx.webinarState.updateMany({
      where: { sessionId, activePollId: pollId },
      data: { activePollId: null },
    });
  });

  const options = await prisma.pollOption.findMany({
    where: { pollId },
    orderBy: { order: "asc" },
  });

  return { success: true, results: options };
};

export const getPollResults = async (sessionId: string, pollId: string) => {
  await getSessionOrThrow(sessionId);

  const poll = await prisma.poll.findFirst({
    where: { id: pollId, sessionId },
    include: { options: { orderBy: { order: "asc" } } },
  });
  if (!poll) {
    throw new AppError("Poll not found", 404);
  }

  const totalVotes = poll.options.reduce(
    (sum: number, opt: { votes: number }) => sum + opt.votes,
    0
  );
  const results = poll.options.map(
    (opt: { id: string; text: string; votes: number; order: number }) => ({
    id: opt.id,
    text: opt.text,
    votes: opt.votes,
    order: opt.order,
    percentage:
      totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(2) : 0,
  }));

  return {
    pollId: poll.id,
    question: poll.question,
    results,
    totalVotes,
    isActive: poll.isActive,
  };
};

// Q&A

export const submitQuestion = async (
  sessionId: string,
  question: string,
  userId: string,
  userName: string
) => {
  await getSessionOrThrow(sessionId);
  const webinar = await getWebinarOrThrow(sessionId);

  return prisma.question.create({
    data: {
      sessionId,
      webinarId: webinar.id,
      userId,
      userName,
      question,
    },
  });
};

export const upvoteQuestion = async (
  sessionId: string,
  questionId: string,
  userId: string
) => {
  await getSessionOrThrow(sessionId);

  const question = await prisma.question.findFirst({
    where: { id: questionId, sessionId },
  });
  if (!question) {
    throw new AppError("Question not found", 404);
  }
  if (question.answered) {
    throw new AppError("Question has already been answered", 400);
  }

  const updated = await prisma.question.update({
    where: { id: question.id },
    data: { upvotes: { increment: 1 } },
    select: { upvotes: true },
  });

  return { success: true, upvotes: updated.upvotes };
};

export const answerQuestion = async (
  sessionId: string,
  questionId: string,
  answer: string,
  userId: string
) => {
  const session = await getSessionOrThrow(sessionId);
  const webinar = await getWebinarOrThrow(sessionId);

  const isHost = session.hostId === userId;
  const isModerator = webinar.moderators.includes(userId);
  if (!isHost && !isModerator) {
    throw new AppError(
      "Only host or moderators can answer questions",
      403
    );
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, sessionId },
  });
  if (!question) {
    throw new AppError("Question not found", 404);
  }

  await prisma.question.update({
    where: { id: question.id },
    data: {
      answered: true,
      answer,
      answeredById: userId,
      answeredAt: new Date(),
    },
  });

  return { success: true };
};

export const getQuestions = async (sessionId: string, answered = false) => {
  await getSessionOrThrow(sessionId);
  await getWebinarOrThrow(sessionId);

  return prisma.question.findMany({
    where: { sessionId, answered },
    orderBy: { upvotes: "desc" },
  });
};

// Moderators

export const addModerator = async (
  sessionId: string,
  targetUserId: string,
  requesterId: string
) => {
  const session = await getSessionOrThrow(sessionId);
  assertHost(session, requesterId, "Only host can add moderators");
  const webinar = await getWebinarOrThrow(sessionId);

  if (!webinar.moderators.includes(targetUserId)) {
    await prisma.webinarState.update({
      where: { id: webinar.id },
      data: { moderators: { push: targetUserId } },
    });
  }

  return { success: true };
};

export const removeModerator = async (
  sessionId: string,
  targetUserId: string,
  requesterId: string
) => {
  const session = await getSessionOrThrow(sessionId);
  assertHost(session, requesterId, "Only host can remove moderators");
  const webinar = await getWebinarOrThrow(sessionId);

  await prisma.webinarState.update({
    where: { id: webinar.id },
    data: {
      moderators: webinar.moderators.filter((id: string) => id !== targetUserId),
    },
  });

  return { success: true };
};
