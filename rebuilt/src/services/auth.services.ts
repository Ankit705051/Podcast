import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { hassedPassword } from "../utils/password.js";
import { generateAccessToken, generateVerificationToken } from "../utils/token.js";
import type { RegisterUserInput } from "../validation/user.validation.js";

export const registerUser = async (data: RegisterUserInput) => {
  const { name, email, password, location, bio } = data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400, "EMAIL_ALREADY_EXISTS");
    }

    const hashedPassword = await hassedPassword(password);
    const verificationToken = generateVerificationToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location: location || null,
        bio: bio || null,
        verificationToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        bio: true,
        verificationToken: true,
      },
    });

    const token = generateAccessToken(user.id);

    return {
      user,
      token,
      verificationToken: user.verificationToken,
    };
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Registration failed due to database error", 500, "DATABASE_ERROR");
  }
};
