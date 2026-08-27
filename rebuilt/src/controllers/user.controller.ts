
import  asyncHandler from "../utils/asyncHandler.js";
import { registerUser, initializeDefaultAdmin,createAdmin } from "../services/auth.services.js";
import { sendCreated } from "../utils/response.js";
import type { Request, Response } from "express";


export const initializeAdminController = asyncHandler(async (_req:Request, res:Response) => {
  const result = await initializeDefaultAdmin();
  return sendCreated(
    res,
    "Admin initialized successfully",
    result
  )
});

export const registerController = asyncHandler(async (req:Request, res:Response) => {
  const result =await registerUser(req.body);
  return sendCreated(
    res,
    "User registered successfully",
    result
  )
});
export const createAdminController = asyncHandler(async (req:Request, res:Response) => {
  const result =await createAdmin(req.body);
  return sendCreated(
    res,
    "Admin created successfully",
    result
  )
});
