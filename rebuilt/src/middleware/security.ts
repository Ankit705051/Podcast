import helmet from "helmet"
import cors from "cors";
import express from "express";
import type { Express } from "express";

export const securityMiddleare=(app:Express)=>{
    app.use(
        helmet({
            contentSecurityPolicy:false,
        })
    );
    app.use(
        cors({
            origin:process.env.BASE_URL,
            credentials:true,
        })
    );

    app.use(express.json({limit:"10kb"}));
    app.use(express.urlencoded({extended:true,limit:"10kb"}));

}
