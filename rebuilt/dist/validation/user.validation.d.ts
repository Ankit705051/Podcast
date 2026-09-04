import { z } from "zod";
declare const userValidationSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
        user: "user";
        admin: "admin";
        host: "host";
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
        user: "user";
        admin: "admin";
        host: "host";
    }>>;
}, z.core.$strip>;
declare const loginValidationSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginUserInput = z.infer<typeof loginValidationSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.core.$strip>;
export {};
//# sourceMappingURL=user.validation.d.ts.map