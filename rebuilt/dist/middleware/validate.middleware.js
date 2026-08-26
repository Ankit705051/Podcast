import { ZodError } from "zod";
import { sendError } from "../utils/response.js";
export const validate = (schema, target = "body") => {
    return (req, res, next) => {
        try {
            const dataToValidate = req[target];
            const validatedData = schema.parse(dataToValidate);
            if (target === "body") {
                req.body = validatedData;
            }
            else if (target === "params") {
                req.params = validatedData;
            }
            else if (target === "query") {
                req.query = validatedData;
            }
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