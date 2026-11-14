import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import requestIdMiddleware from "./middleware/request-id.middeware.js";
import { loggingMiddleware } from "./middleware/logging.middleware.js";
import { globalrateLimiter, authRatelimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import initializeSocket from "./socket/socket.js";
import subscriptionCron from "./cron/subscription.cron.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import planRoutes from "./routes/plans.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import sessionRoutes from "./routes/sessions.routes.js";
import recordingRoutes from "./routes/recordings.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import webinarRoutes from "./routes/webinar.routes.js";
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendUrls = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URI,
    process.env.BASE_URI,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4412",
].filter((url) => Boolean(url));
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(requestIdMiddleware);
app.use(loggingMiddleware);
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors({
    origin: frontendUrls,
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(globalrateLimiter);
subscriptionCron();
const server = http.createServer(app);
const io = initializeSocket(server);
app.locals.io = io;
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Podcast backend is running",
        timestamp: new Date().toISOString(),
    });
});
app.use("/health", healthRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/v1/auth", authRatelimiter, authRoutes);
app.use("/api/v1/users", authRatelimiter, userRoutes);
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
server.listen(PORT, () => {
    console.log(`Podcast backend running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map