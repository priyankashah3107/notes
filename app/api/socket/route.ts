import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-note', (noteId: string) => {
    socket.join(`note:${noteId}`);
    console.log(`User ${socket.id} joined note: ${noteId}`);
    socket.to(`note:${noteId}`).emit('user:joined', socket.id);
  });

  socket.on('leave-note', (noteId: string) => {
    socket.leave(`note:${noteId}`);
    console.log(`User ${socket.id} left note: ${noteId}`);
    socket.to(`note:${noteId}`).emit('user:left', socket.id);
  });

  socket.on('note:content-change', ({ noteId, content }) => {
    console.log(`Content change from ${socket.id} for note ${noteId}`);
    socket.to(`note:${noteId}`).emit('note:content-change', content);
  });

  socket.on('note:title-change', ({ noteId, title }) => {
    console.log(`Title change from ${socket.id} for note ${noteId}`);
    socket.to(`note:${noteId}`).emit('note:title-change', title);
  });

  socket.on('note:category-change', ({ noteId, category }) => {
    console.log(`Category change from ${socket.id} for note ${noteId}`);
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

const port = parseInt(process.env.SOCKET_PORT || '3001', 10);
httpServer.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
}); 