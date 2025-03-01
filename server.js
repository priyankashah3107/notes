// const { createServer } = require('http');
// const { Server } = require('socket.io');
// const { parse } = require('url');

// const httpServer = createServer();
// const io = new Server(httpServer, {
//   cors: {
//     origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   allowEIO3: true
// });

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('join-note', (noteId) => {
//     socket.join(`note:${noteId}`);
//     console.log(`User ${socket.id} joined note: ${noteId}`);
//     socket.to(`note:${noteId}`).emit('user:joined', socket.id);
//   });

//   socket.on('leave-note', (noteId) => {
//     socket.leave(`note:${noteId}`);
//     console.log(`User ${socket.id} left note: ${noteId}`);
//     socket.to(`note:${noteId}`).emit('user:left', socket.id);
//   });

//   socket.on('note:content-change', ({ noteId, content }) => {
//     console.log(`Content change from ${socket.id} for note ${noteId}:`, content);
//     socket.to(`note:${noteId}`).emit('note:content-change', content);
//   });

//   socket.on('note:title-change', ({ noteId, title }) => {
//     console.log(`Title change from ${socket.id} for note ${noteId}:`, title);
//     socket.to(`note:${noteId}`).emit('note:title-change', title);
//   });

//   socket.on('note:category-change', ({ noteId, category }) => {
//     console.log(`Category change from ${socket.id} for note ${noteId}:`, category);
//     socket.to(`note:${noteId}`).emit('note:category-change', category);
//   });

//   socket.on('user:typing', ({ noteId }) => {
//     socket.to(`note:${noteId}`).emit('user:typing', socket.id);
//   });

//   socket.on('user:stopped-typing', ({ noteId }) => {
//     socket.to(`note:${noteId}`).emit('user:stopped-typing', socket.id);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// const PORT = process.env.SOCKET_PORT || 3001;
// httpServer.listen(PORT, () => {
//   console.log(`Socket.IO server running on port ${PORT}`);
// }); 


const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

const isDev = process.env.NODE_ENV !== 'production';
const CORS_ORIGIN = isDev ? 'http://localhost:3000' : process.env.VERCEL_URL;

// Enable CORS
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket']
});

// Track connected users
const connectedUsers = new Map();

// ✅ Middleware
app.use(express.json());

// ✅ API Route for Testing (Optional)
app.get("/", (req, res) => {
  res.send("🚀 Socket.IO Server is running!");
});

// ✅ Socket.IO Event Handling
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  connectedUsers.set(socket.id, { currentNote: null });

  socket.on("join-note", (noteId) => {
    const roomName = `note:${noteId}`;
    socket.join(roomName);
    console.log(`User ${socket.id} joined note: ${noteId}`);
    
    // Update user's current note
    connectedUsers.get(socket.id).currentNote = noteId;
    
    // Notify others in the room
    socket.to(roomName).emit("user:joined", socket.id);
  });

  socket.on("leave-note", (noteId) => {
    const roomName = `note:${noteId}`;
    socket.leave(roomName);
    console.log(`User ${socket.id} left note: ${noteId}`);
    
    // Clear user's current note
    if (connectedUsers.has(socket.id)) {
      connectedUsers.get(socket.id).currentNote = null;
    }
    
    // Notify others in the room
    socket.to(roomName).emit("user:left", socket.id);
  });

  socket.on("note:content-change", ({ noteId, content }) => {
    const roomName = `note:${noteId}`;
    socket.to(roomName).emit("note:content-change", content);
  });

  socket.on("note:title-change", ({ noteId, title }) => {
    const roomName = `note:${noteId}`;
    socket.to(roomName).emit("note:title-change", title);
  });

  socket.on("note:category-change", ({ noteId, category }) => {
    const roomName = `note:${noteId}`;
    socket.to(roomName).emit("note:category-change", category);
  });

  socket.on("note:update", ({ noteId, note }) => {
    const roomName = `note:${noteId}`;
    socket.to(roomName).emit("note:updated", note);
  });

  socket.on("user:typing", ({ noteId }) => {
    const roomName = `note:${noteId}`;
    socket.to(roomName).emit("user:typing", socket.id);
  });

  socket.on("user:stopped-typing", ({ noteId }) => {
    const roomName = `note:${noteId}`;
    socket.to(roomName).emit("user:stopped-typing", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    
    // Get the note room the user was in
    const userData = connectedUsers.get(socket.id);
    if (userData && userData.currentNote) {
      const roomName = `note:${userData.currentNote}`;
      socket.to(roomName).emit("user:left", socket.id);
    }
    
    // Remove user from tracking
    connectedUsers.delete(socket.id);
  });
});

// ✅ Start the Server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
