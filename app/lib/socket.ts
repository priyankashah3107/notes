import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";
import { Note } from "@/app/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface CustomServer extends NetServer {
  io?: SocketIOServer;
}

interface SocketResponse extends NextApiResponse {
  socket: {
    server: CustomServer;
  };
}

export default function SocketHandler(res: SocketResponse) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ['websocket'],
    });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("join-note", (noteId: string) => {
        socket.join(`note:${noteId}`);
        console.log(`User ${socket.id} joined note: ${noteId}`);
        // Notify others that a new user joined
        socket.to(`note:${noteId}`).emit("user:joined", socket.id);
      });

      socket.on("leave-note", (noteId: string) => {
        socket.leave(`note:${noteId}`);
        console.log(`User ${socket.id} left note: ${noteId}`);
        // Notify others that a user left
        socket.to(`note:${noteId}`).emit("user:left", socket.id);
      });

      socket.on("note:update", ({ noteId, note }: { noteId: string; note: Note }) => {
        console.log(`Note update from ${socket.id} for note ${noteId}:`, note);
        socket.to(`note:${noteId}`).emit("note:updated", note);
      });

      socket.on("note:content-change", ({ noteId, content }: { noteId: string; content: string }) => {
        console.log(`Content change from ${socket.id} for note ${noteId}:`, content);
        socket.to(`note:${noteId}`).emit("note:content-change", content);
      });

      socket.on("note:title-change", ({ noteId, title }: { noteId: string; title: string }) => {
        console.log(`Title change from ${socket.id} for note ${noteId}:`, title);
        socket.to(`note:${noteId}`).emit("note:title-change", title);
      });

      socket.on("note:category-change", ({ noteId, category }: { noteId: string; category: string }) => {
        console.log(`Category change from ${socket.id} for note ${noteId}:`, category);
        socket.to(`note:${noteId}`).emit("note:category-change", category);
      });

      socket.on("user:typing", ({ noteId }: { noteId: string }) => {
        socket.to(`note:${noteId}`).emit("user:typing", socket.id);
      });

      socket.on("user:stopped-typing", ({ noteId }: { noteId: string }) => {
        socket.to(`note:${noteId}`).emit("user:stopped-typing", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        // Notify all rooms this user was in that they've disconnected
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.to(room).emit("user:left", socket.id);
          }
        });
      });
    });

    res.socket.server.io = io;
    console.log('Socket.io server initialized');
  }

  res.end();
} 