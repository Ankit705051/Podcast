import type { Response } from "express";
export declare const sendSuccess: <T>(res: Response, statusCode: number, message: string, data?: T) => Response<any, Record<string, any>>;
export declare const sendCreated: <T>(res: Response, message: string, data?: T) => Response<any, Record<string, any>>;
export declare const sendOk: <T>(res: Response, message: string, data?: T) => Response<any, Record<string, any>>;
//# sourceMappingURL=response.d.ts.map