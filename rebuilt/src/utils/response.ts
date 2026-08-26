import type { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};

export const sendError = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(data !== undefined && { data }),
  });
};

export const sendCreated = <T>(
  res: Response,
  message: string,
  data?: T
) => {
  return sendSuccess(res, 201, message, data);
};

export const sendOk = <T>(
  res: Response,
  message: string,
  data?: T
) => {
  return sendSuccess(res, 200, message, data);
};