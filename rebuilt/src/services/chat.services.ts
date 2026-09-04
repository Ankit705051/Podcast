import { prisma } from "../lib/prisma.js";
import { ChatType } from "@prisma/client";

export const createChat = async (
    userId: string,
    sessionId: string,
    message: string,
    type: ChatType = ChatType.TEXT
) => {
    return await prisma.chat.create({
        data: {
            userId,
            sessionId,
            message,
            type,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    });
};