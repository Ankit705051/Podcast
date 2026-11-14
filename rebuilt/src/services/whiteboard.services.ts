import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export interface WhiteboardElement {
  id: string;
  [key: string]: unknown;
}

const toElements = (value: Prisma.JsonValue): WhiteboardElement[] => {
  return Array.isArray(value)
    ? (value as unknown as WhiteboardElement[])
    : [];
};

const serializeWhiteboard = (whiteboard: {
  sessionId: string;
  elements: Prisma.JsonValue;
  currentTool: string;
  currentColor: string;
  currentSize: number;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}) => ({
  sessionId: whiteboard.sessionId,
  elements: whiteboard.elements,
  currentTool: whiteboard.currentTool,
  currentColor: whiteboard.currentColor,
  currentSize: whiteboard.currentSize,
  collaborators: whiteboard.collaborators,
  createdAt: whiteboard.createdAt,
  updatedAt: whiteboard.updatedAt,
});

const getSessionOrThrow = async (sessionId: string) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw new AppError("Session not found", 404);
  }
  return session;
};

const getWhiteboardOrThrow = async (sessionId: string) => {
  const whiteboard = await prisma.whiteboard.findUnique({
    where: { sessionId },
  });
  if (!whiteboard) {
    throw new AppError("Whiteboard not found", 404);
  }
  return whiteboard;
};

const saveElements = async (
  sessionId: string,
  elements: WhiteboardElement[]
) => {
  await prisma.whiteboard.update({
    where: { sessionId },
    data: {
      elements: elements as unknown as Prisma.InputJsonValue,
    },
  });
};

export const createWhiteboard = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);

  const whiteboard = await prisma.whiteboard.upsert({
    where: { sessionId },
    update: {},
    create: {
      sessionId,
      elements: [],
      currentTool: "pen",
      currentColor: "#000000",
      currentSize: 2,
      collaborators: [],
    },
  });

  return serializeWhiteboard(whiteboard);
};

export const getWhiteboard = async (sessionId: string) => {
  const whiteboard = await prisma.whiteboard.findUnique({
    where: { sessionId },
  });
  return whiteboard ? serializeWhiteboard(whiteboard) : null;
};

export const addElement = async (
  sessionId: string,
  element: Record<string, unknown>,
  userId: string
) => {
  const whiteboard = await getWhiteboardOrThrow(sessionId);
  const elements = toElements(whiteboard.elements);

  const newElement: WhiteboardElement = {
    id: `element_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    ...element,
    createdAt: Date.now(),
    createdBy: userId,
  };

  await saveElements(sessionId, [...elements, newElement]);
  return newElement;
};

export const updateElement = async (
  sessionId: string,
  elementId: string,
  updates: Record<string, unknown>
) => {
  const whiteboard = await getWhiteboardOrThrow(sessionId);
  const elements = toElements(whiteboard.elements);

  const elementIndex = elements.findIndex((el) => el.id === elementId);
  if (elementIndex === -1) {
    throw new AppError("Element not found", 404);
  }

  const updatedElement: WhiteboardElement = {
    ...elements[elementIndex]!,
    ...updates,
    updatedAt: Date.now(),
  };

  const nextElements = [...elements];
  nextElements[elementIndex] = updatedElement;
  await saveElements(sessionId, nextElements);

  return updatedElement;
};

export const deleteElement = async (sessionId: string, elementId: string) => {
  const whiteboard = await getWhiteboardOrThrow(sessionId);
  const elements = toElements(whiteboard.elements);

  await saveElements(
    sessionId,
    elements.filter((el) => el.id !== elementId)
  );

  return { success: true };
};

export const clearWhiteboard = async (sessionId: string) => {
  await getWhiteboardOrThrow(sessionId);
  await saveElements(sessionId, []);
  return { success: true };
};

export const setCurrentTool = async (sessionId: string, tool: string) => {
  await getWhiteboardOrThrow(sessionId);
  await prisma.whiteboard.update({
    where: { sessionId },
    data: { currentTool: tool },
  });
  return { success: true, tool };
};

export const setCurrentColor = async (sessionId: string, color: string) => {
  await getWhiteboardOrThrow(sessionId);
  await prisma.whiteboard.update({
    where: { sessionId },
    data: { currentColor: color },
  });
  return { success: true, color };
};

export const setCurrentSize = async (sessionId: string, size: number) => {
  await getWhiteboardOrThrow(sessionId);
  await prisma.whiteboard.update({
    where: { sessionId },
    data: { currentSize: size },
  });
  return { success: true, size };
};
