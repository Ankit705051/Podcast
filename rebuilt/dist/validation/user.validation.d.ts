import { z } from "zod";
declare const userValidationScheam: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    location: z.ZodString;
    bio: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export default userValidationScheam;
//# sourceMappingURL=user.validation.d.ts.map