import { ZodError } from "zod";
import { sendError } from "../utils/response.js";
export const validate = (schema, target) => {
    return (req, res, next) => {
        try {
            req[target] = schema.parse(req[target]);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 400, "Validation failed", error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                })));
            }
            next(error);
        }
    };
};
//# sourceMappingURL=validate.middleware.js.map