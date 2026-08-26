import { z } from "zod";
declare const userValidationSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
        admin: "admin";
        host: "host";
        user: "user";
    }>>;
}, z.core.$strip>;
export type RegisterUserInput = z.infer<typeof userValidationSchema>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
        admin: "admin";
        host: "host";
        user: "user";
    }>>;
}, z.core.$strip>;
export {};
//# sourceMappingURL=user.validation.d.ts.map