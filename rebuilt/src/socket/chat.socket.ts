// join session
// send message
// leave session
// disconnect

import type { Server,Socket } from "socket.io";
import { createChat } from "../services/chat.services.js";
import { ChatType } from "@prisma/client";

export const registerChatEvent=(io:Server,socket:Socket)=>{
    // join a particular session
    socket.on("join-session",(sessionId:string)=>{
        const room=`session-${sessionId}`;
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${sessionId}`);

        socket.emit(
            "joined-room",
            {
                sessionId,
                message:"Joined room successfully"
            }
        );
    });

    // leave a particular session
    socket.on("leave-session",(sessionId:string)=>{
        const room=`session-${sessionId}`;
        socket.leave(room);
        console.log(`User ${socket.id} left room: ${sessionId}`);

        socket.emit(
            "left-room",
            {
                sessionId,
                message:"Left room successfully"
            }
        );
    });

    // send message
    socket.on("send-message",async (data:{
        sessionId:string;
        message:string;
        type?:ChatType;
    })=>{
        try{
        const {sessionId,message,type=ChatType.TEXT} = data;
        if(!sessionId || !message?.trim()){
            socket.emit("error",{
                message:"Session ID and message are required"
            });
            return;
        }
        const userId=socket.data.user.id;
       const chat = await createChat(
          userId,
          sessionId,
          message,
          type
        );
        const room=`session-${sessionId}`;
        // Send message to everyone inside this session
        io.to(room).emit("new-message", chat);
        }catch(error){
            console.error("Error sending message:", error);
            socket.emit("error",{
                message:"Failed to send message"
            });
        }
    });
    
}
