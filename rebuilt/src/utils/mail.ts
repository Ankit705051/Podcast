import nodemailer from "nodemailer";
import "dotenv/config";

const mailConfigured = (): boolean =>
  Boolean(
    process.env.MAIL_HOST &&
      process.env.MAIL_PORT &&
      process.env.MAIL_USERNAME &&
      process.env.MAIL_PASSWORD
  );

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587", 10),
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD?.replace(/\s/g, ""),
    },
  });

const baseUri = (): string =>
  process.env.BASE_URI || process.env.FRONTEND_URL || "http://localhost:3001";

const sendMail = async (options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> => {
  if (!mailConfigured()) {
    console.warn(`MAIL_* env vars not configured; skipping email: ${options.subject}`);
    return false;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Support" <${process.env.MAIL_USERNAME}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send email "${options.subject}":`, error);
    return false;
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string | null | undefined,
  verificationToken: string
): Promise<void> => {
  const verifyUrl = `${baseUri()}/api/v1/users/verify/${verificationToken}`;
  await sendMail({
    to: email,
    subject: "Verify your PodcastHub account",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Welcome to PodcastHub!</h2>
        <p style="color: #666;">Hi ${name || "User"},</p>
        <p style="color: #666;">Thank you for registering! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #666;">Or copy and paste this link in your browser:</p>
        <p style="color: #999; word-break: break-all;">${verifyUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string | null | undefined,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${baseUri()}/reset-password?token=${resetToken}`;
  await sendMail({
    to: email,
    subject: "Reset Password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666;">Hi ${name || "User"},</p>
        <p style="color: #666;">You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666;">Or copy and paste this link in your browser:</p>
        <p style="color: #999; word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This link will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};
