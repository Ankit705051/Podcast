import "dotenv/config";
import express from "express";
import http from "http";
import path from "node:path";
import cookieParser from "cookie-parser";
import { globalrateLimiter } from "./middleware/rateLimiter.js";
import { securityMiddleare } from "./middleware/security.js";
import requestIdMiddleware from "./middleware/request-id.middeware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import userRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";
import planRoutes from "./routes/plans.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import sessionRoutes from "./routes/sessions.routes.js";
import recordingRoutes from "./routes/recordings.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import webinarRoutes from "./routes/webinar.routes.js";
import { prisma } from "./lib/prisma.js";
import { initializeDefaultAdmin } from "./services/auth.services.js";
import { ensureDefaultPlans } from "./services/plan.service.js";
import { initializeSocket } from "./socket/socket.js";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(requestIdMiddleware);
securityMiddleare(app);
app.use(globalrateLimiter);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/plans", planRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/recordings", recordingRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/interview", interviewRoutes);
app.use("/api/v1/webinar", webinarRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initializeSocket(server);

async function testDatabaseConnection(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
      return;
    } catch (error) {
      console.error(
        `Database connection failed (attempt ${attempt}/${retries}):`,
        error
      );
      if (attempt === retries) {
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testDatabaseConnection();
  try {
    await initializeDefaultAdmin();
    await ensureDefaultPlans();
  } catch (error) {
    console.error("Admin initialization skipped:", error);
  }
  console.log("Socket.io initialized");
});
