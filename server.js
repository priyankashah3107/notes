const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-note", (noteId) => {
      socket.join(`note-${noteId}`);
      console.log(`Socket ${socket.id} joined note-${noteId}`);
    });

    socket.on("leave-note", (noteId) => {
      socket.leave(`note-${noteId}`);
      console.log(`Socket ${socket.id} left note-${noteId}`);
    });

    socket.on("content-change", ({ noteId, content }) => {
      // Broadcast content changes to all clients in the room except sender
      socket.to(`note-${noteId}`).emit("content-change", { content });
    });

    socket.on("note-updated", (data) => {
      socket.to(`note-${data.noteId}`).emit("note-updated", data.note);
    });

    socket.on("typing", ({ noteId }) => {
      socket.to(`note-${noteId}`).emit("user-typing", { userId: socket.id });
    });

    socket.on("stopped-typing", ({ noteId }) => {
      socket.to(`note-${noteId}`).emit("user-stopped-typing", { userId: socket.id });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
}); 