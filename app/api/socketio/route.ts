import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let io: SocketIOServer | null = null;

export async function GET(req: Request) {
  try {
    if (!io) {
      const res = new NextResponse();
      // Access server from request instead of response
      const server = (req as any).socket.server as NetServer;
      
      io = new SocketIOServer(server, {
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
          socket.to(`note:${noteId}`).emit("user:joined", socket.id);
        });

        socket.on("leave-note", (noteId: string) => {
          socket.leave(`note:${noteId}`);
          console.log(`User ${socket.id} left note: ${noteId}`);
          socket.to(`note:${noteId}`).emit("user:left", socket.id);
        });

        socket.on("note:content-change", ({ noteId, content }) => {
          console.log(`Content change from ${socket.id} for note ${noteId}`);
          socket.to(`note:${noteId}`).emit("note:content-change", content);
        });

        socket.on("note:title-change", ({ noteId, title }) => {
          console.log(`Title change from ${socket.id} for note ${noteId}`);
          socket.to(`note:${noteId}`).emit("note:title-change", title);
        });

        socket.on("note:category-change", ({ noteId, category }) => {
          console.log(`Category change from ${socket.id} for note ${noteId}`);
          socket.to(`note:${noteId}`).emit("note:category-change", category);
        });

        socket.on("user:typing", ({ noteId }) => {
          socket.to(`note:${noteId}`).emit("user:typing", socket.id);
        });

        socket.on("user:stopped-typing", ({ noteId }) => {
          socket.to(`note:${noteId}`).emit("user:stopped-typing", socket.id);
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected:", socket.id);
          socket.rooms.forEach((room) => {
            if (room !== socket.id) {
              socket.to(room).emit("user:left", socket.id);
            }
          });
        });
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Socket initialization error:", error);
    return new NextResponse(null, { status: 500 });
  }
} 