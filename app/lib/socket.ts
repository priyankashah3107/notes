import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export function initSocket(res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("join-note", (noteId: string) => {
        socket.join(`note-${noteId}`);
        console.log(`Socket ${socket.id} joined note-${noteId}`);
      });

      socket.on("leave-note", (noteId: string) => {
        socket.leave(`note-${noteId}`);
        console.log(`Socket ${socket.id} left note-${noteId}`);
      });

      socket.on("note-updated", (data: { noteId: string; note: any }) => {
        socket.to(`note-${data.noteId}`).emit("note-updated", data.note);
      });

      socket.on("typing", ({ noteId }: { noteId: string }) => {
        socket
          .to(`note-${noteId}`)
          .emit("user-typing", { userId: socket.id });
      });

      socket.on("stopped-typing", ({ noteId }: { noteId: string }) => {
        socket
          .to(`note-${noteId}`)
          .emit("user-stopped-typing", { userId: socket.id });
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  return res.socket.server.io;
} 