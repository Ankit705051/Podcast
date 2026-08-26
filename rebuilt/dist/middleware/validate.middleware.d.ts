import type { Request, Response, NextFunction } from "express";
import { type ZodType } from "zod";
export declare const validate: (schema: ZodType, target: "body" | "params" | "query") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validate.middleware.d.ts.map