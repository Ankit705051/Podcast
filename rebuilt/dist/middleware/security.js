import helmet from "helmet";
import cors from "cors";
import express from "express";
import "dotenv/config";
export const securityMiddleare = (app) => {
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
    app.use(cors({
        origin: process.env.BASE_URL,
        credentials: true,
    }));
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));
};
//# sourceMappingURL=security.js.map