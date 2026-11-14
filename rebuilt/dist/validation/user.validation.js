import { z } from "zod";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ---------------------------------------------------------------------------
// Register (legacy compatible: userName, name, email, password, role user|host)
// ---------------------------------------------------------------------------
export const registerSchema = z.object({
    userName: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username must be at most 30 characters"),
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .regex(emailRegex, "Please enter a valid email")
        .email("Please enter a valid email"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password cannot exceed 100 characters"),
    role: z.enum(["user", "host"]).optional(),
});
// ---------------------------------------------------------------------------
// Login (email OR userName + password)
// ---------------------------------------------------------------------------
export const loginSchema = z
    .object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address")
        .optional(),
    userName: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .optional(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password cannot exceed 100 characters"),
})
    .refine((data) => Boolean(data.email || data.userName), {
    message: "Please provide password and either email or username",
});
// ---------------------------------------------------------------------------
// Forgot / reset password
// ---------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .regex(emailRegex, "Invalid email format")
        .email("Invalid email format"),
});
export const resetPasswordSchema = z
    .object({
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password cannot exceed 100 characters"),
    confPassword: z
        .string()
        .min(6, "Confirm password must be at least 6 characters long")
        .max(100, "Confirm password cannot exceed 100 characters"),
})
    .refine((data) => data.password === data.confPassword, {
    message: "Password and confirm password must be same",
    path: ["confPassword"],
});
// ---------------------------------------------------------------------------
// Update profile (multipart: fields + optional avatar file)
// ---------------------------------------------------------------------------
export const updateUserSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    userName: z.string().trim().min(3).max(30).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    bio: z.string().trim().max(1000).optional(),
    location: z.string().trim().max(100).optional(),
    // settings may arrive as a JSON string when sent via multipart/form-data
    settings: z
        .union([z.record(z.string(), z.unknown()), z.string()])
        .optional(),
    currentPassword: z.string().optional(),
    newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters long")
        .max(100)
        .optional(),
});
//# sourceMappingURL=user.validation.js.map