import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,228}$/;

const userValidationSchema = z.object({
  name: z.string().min(3, "name must be at least 3 characters").trim().max(50, "name must be at most 50 characters"),
  email: z.string().regex(emailRegex, "please enter a valid email").trim().email("please enter a valid email"),
  password: z.string().regex(passwordRegex, "password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-228 characters long").trim(),
  location: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  role: z.enum(["user", "admin", "host"]).default("user"),
});

export type RegisterUserInput = z.infer<typeof userValidationSchema>;
export const registerSchema = userValidationSchema;