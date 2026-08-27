import "dotenv/config";
import express from "express";
import { globalrateLimiter } from "./middleware/rateLimiter.js";
import { securityMiddleare } from "./middleware/security.js";
import requestIdMiddleware from "./middleware/request-id.middeware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { prisma } from "./lib/prisma.js";
import { initializeDefaultAdmin } from "./services/auth.services.js";
import { createAdmin } from "./services/auth.services.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);
securityMiddleare(app);
app.use(globalrateLimiter);
// routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", createAdmin);
app.use(notFoundHandler);
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await testDatabaseConnection();
    await initializeDefaultAdmin();
});
//# sourceMappingURL=index.js.map