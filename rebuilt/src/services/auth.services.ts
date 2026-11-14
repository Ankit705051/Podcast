import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { hassedPassword, comparePassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateVerificationToken,
  generateResetToken,
} from "../utils/token.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/mail.js";
import type { Prisma } from "@prisma/client";
import type {
  RegisterUserInput,
  LoginUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateUserInput,
} from "../validation/user.validation.js";
import "dotenv/config";

const DAY_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const publicUserSelect = {
  id: true,
  email: true,
  userName: true,
  name: true,
  role: true,
  avatar: true,
  bio: true,
  location: true,
  settings: true,
  verified: true,
  createdAt: true,
  last_login: true,
  subscription_type: true,
  subscription_status: true,
  subscription_end_date: true,
  storage_quota_mb: true,
  storage_used_mb: true,
} as const satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

/** Adds the legacy `_id` alias used by the old backend responses. */
export const toLegacyUser = <T extends { id: string }>(user: T) => ({
  ...user,
  _id: user.id,
});

interface SubscriptionSummary {
  planName: string;
  planPrice: number;
  planFeatures: string[];
  status: string;
  endDate: Date | null;
  daysRemaining: number;
}

const getActiveSubscriptionSummary = async (
  userId: string
): Promise<SubscriptionSummary | null> => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, isActive: true, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription || !subscription.plan) return null;

    const endDate = subscription.endDate;
    return {
      planName: subscription.plan.name,
      planPrice: subscription.plan.price,
      planFeatures: subscription.plan.features,
      status: subscription.status,
      endDate,
      daysRemaining: endDate
        ? Math.ceil((endDate.getTime() - Date.now()) / DAY_MS)
        : 0,
    };
  } catch (error) {
    console.error("Error fetching subscription summary:", error);
    return null;
  }
};

const sha256 = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

// ---------------------------------------------------------------------------
// Register / verify
// ---------------------------------------------------------------------------

export const registerUser = async (data: RegisterUserInput) => {
  const { userName, name, email, password, role } = data;

  // Delete or reject unverified duplicates (legacy behaviour)
  const existingEmailUser = await prisma.user.findUnique({ where: { email } });
  if (existingEmailUser) {
    if (existingEmailUser.verified) {
      throw new AppError(
        "User already exists with this email and is verified",
        400,
        "EMAIL_TAKEN"
      );
    }
    await prisma.user.delete({ where: { id: existingEmailUser.id } });
  }

  if (userName) {
    const existingUsernameUser = await prisma.user.findUnique({
      where: { userName },
    });
    if (existingUsernameUser) {
      if (existingUsernameUser.verified) {
        throw new AppError("Username is already taken", 400, "USERNAME_TAKEN");
      }
      await prisma.user.delete({ where: { id: existingUsernameUser.id } });
    }
  }

  const hashedPassword = await hassedPassword(password);
  const verificationToken = generateVerificationToken();

  const user = await prisma.user.create({
    data: {
      userName,
      name,
      email,
      password: hashedPassword,
      role: role ?? "user",
      verificationToken,
    },
    select: publicUserSelect,
  });

  // Best-effort verification email (skipped when MAIL_* env vars are missing)
  await sendVerificationEmail(email, name, verificationToken);

  const token = generateAccessToken(user.id);

  return { user, token, verificationToken };
};

export const verifyUserByToken = async (verificationToken: string) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken },
  });

  if (!user) {
    throw new AppError("Invalid token", 404, "INVALID_TOKEN");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true, verificationToken: null },
  });

  return { verified: true };
};

// ---------------------------------------------------------------------------
// Login / logout
// ---------------------------------------------------------------------------

export const loginUser = async (data: LoginUserInput) => {
  const { email, userName, password } = data;

  if (!password || (!email && !userName)) {
    throw new AppError(
      "Please provide password and either email or username",
      400,
      "MISSING_CREDENTIALS"
    );
  }

  const orConditions: Prisma.UserWhereInput[] = [];
  if (email) orConditions.push({ email });
  if (userName) orConditions.push({ userName });

  const user = await prisma.user.findFirst({
    where: { OR: orConditions },
    select: {
      ...publicUserSelect,
      password: true,
      last_logout: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401, "INVALID_PASSWORD");
  }

  // Legacy login token lifetime: 7 days
  const token = generateAccessToken(user.id, "7d");

  await prisma.user.update({
    where: { id: user.id },
    data: { last_login: new Date() },
  });

  const currentSubscription = await getActiveSubscriptionSummary(user.id);

  const { password: _password, last_logout: _lastLogout, ...safeUser } = user;

  return {
    token,
    user: {
      ...safeUser,
      _id: safeUser.id,
      currentSubscription,
    },
  };
};

export const logoutUser = async () => {
  return { success: true };
};

// ---------------------------------------------------------------------------
// Get current user
// ---------------------------------------------------------------------------

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const currentSubscription = await getActiveSubscriptionSummary(userId);

  return {
    ...user,
    _id: user.id,
    currentSubscription,
  };
};

// ---------------------------------------------------------------------------
// Forgot / reset password
// ---------------------------------------------------------------------------

export const forgotPassword = async (data: ForgotPasswordInput) => {
  const { email } = data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always report success to prevent email enumeration
  if (!user) {
    return;
  }

  const resetToken = generateResetToken();
  const hashedToken = sha256(resetToken);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  await sendPasswordResetEmail(user.email, user.name, resetToken);
};

export const resetPassword = async (
  token: string,
  data: ResetPasswordInput
) => {
  const { password, confPassword } = data;

  if (!password || !confPassword) {
    throw new AppError(
      "Password and confirm password are required",
      400,
      "MISSING_PASSWORD"
    );
  }

  if (password !== confPassword) {
    throw new AppError(
      "Password and confirm password must be same",
      400,
      "PASSWORD_MISMATCH"
    );
  }

  const hashedToken = sha256(token);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400, "INVALID_TOKEN");
  }

  const hashedPassword = await hassedPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    },
  });
};

// ---------------------------------------------------------------------------
// Update profile / password / avatar
// ---------------------------------------------------------------------------

export const updateUser = async (
  userId: string,
  data: UpdateUserInput,
  avatarPath?: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const updateData: Prisma.UserUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.userName !== undefined) updateData.userName = data.userName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.location !== undefined) updateData.location = data.location;

  if (data.settings !== undefined) {
    let settingsValue: unknown = data.settings;
    if (typeof settingsValue === "string") {
      try {
        settingsValue = JSON.parse(settingsValue);
      } catch {
        throw new AppError("Invalid settings format", 400, "INVALID_SETTINGS");
      }
    }
    const existing =
      user.settings && typeof user.settings === "object"
        ? (user.settings as Record<string, unknown>)
        : {};
    updateData.settings = {
      ...existing,
      ...(settingsValue as Record<string, unknown>),
    } as Prisma.InputJsonValue;
  }

  if (data.currentPassword && data.newPassword) {
    const isCurrentPasswordValid = await comparePassword(
      data.currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400, "INVALID_PASSWORD");
    }
    updateData.password = await hassedPassword(data.newPassword);
  }

  if (avatarPath) {
    updateData.avatar = avatarPath;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: publicUserSelect,
  });

  return { ...updated, _id: updated.id };
};

// ---------------------------------------------------------------------------
// Admin helpers (kept for auth.routes.ts admin creation / initialization)
// ---------------------------------------------------------------------------

export const initializeDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "Admin email or password not found in environment variables"
    );
    return;
  }

  try {
    const existAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existAdmin) {
      console.log("Admin already exists");
      return { created: false, admin: existAdmin };
    }

    const hashedPassword = await hassedPassword(adminPassword);
    const defaultAdmin = await prisma.user.create({
      data: {
        name: "JudgeX",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        verified: true,
      },
    });
    console.log("Default admin created:", defaultAdmin.id);
    return { created: true, admin: defaultAdmin };
  } catch (error) {
    console.error("Error initializing admin:", error);
    throw error;
  }
};

export const createAdmin = async (data: RegisterUserInput) => {
  const { name, email, password, userName } = data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("User already exists", 400, "USER_EXISTS");
    }

    if (userName) {
      const existingName = await prisma.user.findUnique({ where: { userName } });
      if (existingName) {
        throw new AppError("Username is already taken", 400, "USERNAME_TAKEN");
      }
    }

    const hashedPassword = await hassedPassword(password);
    const admin = await prisma.user.create({
      data: {
        userName: userName ?? null,
        name: name ?? null,
        email,
        password: hashedPassword,
        role: "admin",
        verified: true,
      },
      select: publicUserSelect,
    });
    return admin;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};
