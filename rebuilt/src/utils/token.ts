import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import dotenv from "dotenv";
dotenv.config();
export const generateAccessToken=(userId:string)=>{
    return jwt.sign(
        {id:userId},
        process.env.JWT_SECRET!,
        {expiresIn:"15m"}
    );
};

export const generateRefreshToken=(userId:string)=>{
    return jwt.sign(
        {id:userId},
        process.env.JWT_SECRET!,
        {expiresIn:"7d"}
    );
};
export const generateVerificationToken=()=>{
    return randomBytes(32).toString("hex");
};

export const generateResetToken=()=>{
    return randomBytes(32).toString("hex");
};

export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 
};
