import { z } from "zod";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,228}$/;
const userValidationScheam = z.object({
    name: z.string().min(3, "name must be at least 3 characters").trim().max(50, "name must be at most 50 characters"),
    email: z.string().regex(emailRegex).trim().email("please enter a valid email"),
    password: z.string().regex(passwordRegex).trim().min(8, "password must be at least 8 characters ").max(228, "password must be at most 228 characters"),
    location: z.string().trim().max(100),
    bio: z.string().trim().max(500).optional(),
});
export default userValidationScheam;
//# sourceMappingURL=user.validation.js.map