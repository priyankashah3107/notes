"use client";

import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { debounce } from 'lodash';
import { Note } from '@/app/types';

export function useSocket(
  noteId: string,
  onNoteUpdated: (note: Note) => void,
  onContentChange: (content: string) => void,
  onTitleChange: (title: string) => void,
  onCategoryChange: (category: string) => void,
  onUserTyping: (userId: string) => void,
  onUserStoppedTyping: (userId: string) => void,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Always create a new socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    console.log('Connecting to socket server at:', socketUrl);
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      // Join the note room after connection
      socket.emit('join-note', noteId);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Set up event listeners
    socket.on('note:updated', (data: Note) => {
      console.log('Received note update:', data);
      onNoteUpdated(data);
    });

    socket.on('note:content-change', (content: string) => {
      console.log('Received content change:', content);
      onContentChange(content);
    });

    socket.on('note:title-change', (title: string) => {
      console.log('Received title change:', title);
      onTitleChange(title);
    });

    socket.on('note:category-change', (category: string) => {
      console.log('Received category change:', category);
      onCategoryChange(category);
    });

    socket.on('user:typing', onUserTyping);
    socket.on('user:stopped-typing', onUserStoppedTyping);

    // Cleanup function
    return () => {
      if (socket) {
        socket.emit('leave-note', noteId);
        socket.disconnect();
      }
    };
  }, [noteId, onNoteUpdated, onContentChange, onTitleChange, onCategoryChange, onUserTyping, onUserStoppedTyping]);

  const emitNoteUpdate = useCallback((note: Note) => {
    if (!socketRef.current?.connected) return;
    console.log('Emitting note update:', note);
    socketRef.current.emit('note:update', { noteId, note });
  }, [noteId]);

  const emitContentChange = useCallback((content: string) => {
    if (!socketRef.current?.connected) return;
    console.log('Emitting content change:', content);
    socketRef.current.emit('note:content-change', { noteId, content });
  }, [noteId]);

  const emitTitleChange = useCallback((title: string) => {
    if (!socketRef.current?.connected) return;
    console.log('Emitting title change:', title);
    socketRef.current.emit('note:title-change', { noteId, title });
  }, [noteId]);

  const emitCategoryChange = useCallback((category: string) => {
    if (!socketRef.current?.connected) return;
    console.log('Emitting category change:', category);
    socketRef.current.emit('note:category-change', { noteId, category });
  }, [noteId]);

  const emitTyping = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('user:typing', { noteId });
  }, [noteId]);

  const emitStoppedTyping = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('user:stopped-typing', { noteId });
  }, [noteId]);

  return {
    emitNoteUpdate,
    emitContentChange,
    emitTitleChange,
    emitCategoryChange,
    emitTyping,
    emitStoppedTyping,
  };
} 