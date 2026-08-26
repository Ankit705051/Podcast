import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";
import { sendError } from "../utils/response.js";

export const validate = (
  schema: ZodType,
  target: "body" | "params" | "query"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req[target] = schema.parse(req[target]);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(
          res,
          400,
          "Validation failed",
          error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }))
        );
      }

      next(error);
    }
  };
};