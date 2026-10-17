import type { Server } from "socket.io";
import type { Socket } from "socket.io";

export const registerVideoEvents = (io: Server, socket: Socket) => {
  socket.on("video:join", (sessionId: string) => {
    socket.join(`session-${sessionId}`);

    socket.to(`session-${sessionId}`).emit("user-joined", {
      userId: socket.id,
      sessionId,
    });
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });
  socket.on("video:offer", (data: { sessionId: string; offer: string }) => {
    socket.to(`session-${data.sessionId}`).emit("video:offer", {
      sessionId: data.sessionId,
      offer: data.offer,
      senderId: socket.id,
    });
  });
  socket.on("video:answer", (data: { sessionId: string; answer: string }) => {
    socket.to(`session-${data.sessionId}`).emit("video:answer", {
      sessionId: data.sessionId,
      answer: data.answer,
      senderId: socket.id,
    });
  });

  socket.on("video:ice-candidate", (data: { sessionId: string; candidate: string }) => {
    socket.to(`session-${data.sessionId}`).emit("video:ice-candidate", {
      sessionId: data.sessionId,
      candidate: data.candidate,
      senderId: socket.id,
    });
  });

  socket.on("video:leave", (sessionId: string) => {
    socket.leave(`session-${sessionId}`);
    socket.to(`session-${sessionId}`).emit("user-left", {
      userId: socket.id,
      sessionId,
    });
    console.log(`User ${socket.id} left session ${sessionId}`);
  });

  socket.on("disconnect", () => {
    const rooms = socket.rooms;
    rooms.forEach((room) => {
      if (room.startsWith("session-")) {
        socket.to(room).emit("user-left", {
          userId: socket.id,
          sessionId: room.replace("session-", ""),
        });
      }
    });
    console.log(`User ${socket.id} disconnected`);
  });
};