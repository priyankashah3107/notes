const { createServer } = require('http');
const { Server } = require('socket.io');
const { parse } = require('url');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-note', (noteId) => {
    socket.join(`note:${noteId}`);
    console.log(`User ${socket.id} joined note: ${noteId}`);
    socket.to(`note:${noteId}`).emit('user:joined', socket.id);
  });

  socket.on('leave-note', (noteId) => {
    socket.leave(`note:${noteId}`);
    console.log(`User ${socket.id} left note: ${noteId}`);
    socket.to(`note:${noteId}`).emit('user:left', socket.id);
  });

  socket.on('note:content-change', ({ noteId, content }) => {
    console.log(`Content change from ${socket.id} for note ${noteId}:`, content);
    socket.to(`note:${noteId}`).emit('note:content-change', content);
  });

  socket.on('note:title-change', ({ noteId, title }) => {
    console.log(`Title change from ${socket.id} for note ${noteId}:`, title);
    socket.to(`note:${noteId}`).emit('note:title-change', title);
  });

  socket.on('note:category-change', ({ noteId, category }) => {
    console.log(`Category change from ${socket.id} for note ${noteId}:`, category);
    socket.to(`note:${noteId}`).emit('note:category-change', category);
  });

  socket.on('user:typing', ({ noteId }) => {
    socket.to(`note:${noteId}`).emit('user:typing', socket.id);
  });

  socket.on('user:stopped-typing', ({ noteId }) => {
    socket.to(`note:${noteId}`).emit('user:stopped-typing', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 