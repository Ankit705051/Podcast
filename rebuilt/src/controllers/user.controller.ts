
import  asyncHandler from "../utils/asyncHandler.js";
import { registerUser } from "../services/auth.services.js";
import { sendCreated } from "../utils/response.js";
import type { Request, Response } from "express";

export const registerController = asyncHandler(async (req:Request, res:Response) => {
  const result =await registerUser(req.body);
  return sendCreated(
    res,
    "User registered successfully",
    result
  )
});