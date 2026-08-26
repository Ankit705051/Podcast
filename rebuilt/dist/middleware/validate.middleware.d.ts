import type { Request, Response, NextFunction } from "express";
import { type ZodType } from "zod";
type ValidationTarget = "body" | "params" | "query";
export declare const validate: (schema: ZodType, target?: ValidationTarget) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map