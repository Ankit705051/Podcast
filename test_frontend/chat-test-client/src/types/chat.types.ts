export type ChatType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO";

export interface ChatUser {
  id: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  type: ChatType;
  createdAt: string;
  user?: ChatUser;
}