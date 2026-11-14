import helmet from "helmet"
import cors from "cors";
import express from "express";
import type { Express } from "express";
import "dotenv/config"
export const securityMiddleare=(app:Express)=>{
    app.use(
        helmet({
            contentSecurityPolicy:false,
        })
    );
    const allowedOrigins = [
        process.env.BASE_URL,
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URI,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ].filter((origin): origin is string => Boolean(origin));

    app.use(
        cors({
            origin: (origin, callback) => {
                // Allow same-origin/non-browser requests and known dev origins
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            },
            credentials: true,
        })
    );

    app.use(express.json({limit:"10kb"}));
    app.use(express.urlencoded({extended:true,limit:"10kb"}));

}
