import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";
import { sendError } from "../utils/response.js";

type ValidationTarget = "body" | "params" | "query";

export const validate = (
  schema: ZodType,
  target: ValidationTarget = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);

      Object.defineProperty(req, target, {
        value: validatedData,
        writable: true,
        configurable: true,
        enumerable: true,
      });

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