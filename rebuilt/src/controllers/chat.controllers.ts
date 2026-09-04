import { createChat } from "../services/chat.services.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendCreated } from "../utils/response.js";
import type { Request, Response } from "express";

export const createChatController = asyncHandler(async (req: Request, res: Response) => {
   const{message,type,userId}=req.body;
   const {sessionId}=req.params;
  
   if(!sessionId || Array.isArray(sessionId)){
    throw new Error("Invalid session ID");
   }

   const chat=await createChat(
    userId,
    sessionId,
    message,
    type
   );
   
   return  res.status(201).json({
    success: true,
    message: "Chat created successfully",
    data: chat
   });
});



