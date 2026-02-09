import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import connectDb from "./database/db.js";

import userRoutes from "./routes/users.routes.js";
import planRoutes from "./routes/plans.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import sessionRoutes from "./routes/sessions.routes.js";

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(cors({
    origin:process.env.BASE_URL,
    credentials:true
}));

connectDb();
const PORT=process.env.PORT || 3000;
app.get("/",(req,res)=>{
    res.send("Podcast Server");
})
app.use("/api/v1/users",userRoutes);
app.use("/api/v1/plans", planRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.listen(PORT,()=>
    console.log(`Server running on port ${PORT}`)
);

