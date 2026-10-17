
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { registerChatEvent } from "./chat.socket.js";
import { registerVideoEvents } from "./vidoe.socket.js";

export const initializingSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Allow all origins for testing
            methods: ["GET", "POST"],
        },
    });
     
    io.on("connection",(socket)=>{
        console.log("User connected:", socket.id);

         registerChatEvent(io, socket);
         registerVideoEvents(io, socket);
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    })
    return io;
};