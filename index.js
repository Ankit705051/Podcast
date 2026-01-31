import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import connectDb from "./database/db.js";
import userRoutes from "./routes/users.routes.js";
dotenv.config();

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
app.listen(PORT,()=>
    console.log(`Server running on port ${PORT}`)
);
