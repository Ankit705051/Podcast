
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { authenticateSocket } from "./socket.auth.js";
import { registerChatEvent } from "./chat.socket.js";

export const initializingSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });
     
    io.use(authenticateSocket);
    io.on("connection",(socket)=>{
        console.log("User connected:", socket.id);

         registerChatEvent(io, socket);
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    })
    return io;
};