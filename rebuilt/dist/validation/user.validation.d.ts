import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    userName: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        user: "user";
        host: "host";
    }>>;
}, z.core.$strip>;
export type RegisterUserInput = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    userName: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginUserInput = z.infer<typeof loginSchema>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export declare const resetPasswordSchema: z.ZodObject<{
    password: z.ZodString;
    confPassword: z.ZodString;
}, z.core.$strip>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    userName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodString]>>;
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
//# sourceMappingURL=user.validation.d.ts.map