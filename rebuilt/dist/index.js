import express from "express";
import { globalrateLimiter } from "./middleware/rateLimiter.js";
import { securityMiddleare } from "./middleware/security.js";
import requestIdMiddleware from "./middleware/request-id.middeware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { prisma } from "./lib/prisma.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);
securityMiddleare(app);
app.use(globalrateLimiter);
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});
app.get("/ankit", (req, res) => {
    res.json({ message: "hello ankit " });
});
// routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");
        // Test a simple query to ensure the connection is working
        try {
            await prisma.$queryRaw `SELECT 1`;
            console.log("✅ Database query test successful");
        }
        catch (queryError) {
            console.warn("⚠️ Database query test failed, but connection succeeded:", queryError);
        }
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await testDatabaseConnection();
});
//# sourceMappingURL=index.js.map