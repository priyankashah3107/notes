"use client";

import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { debounce } from 'lodash';
import { Note } from '@/app/types';

let socket: Socket | null = null;

export function useSocket(
  noteId: string,
  onNoteUpdated: (note: Note) => void,
  onContentChange: (content: string) => void,
  onTitleChange: (title: string) => void,
  onCategoryChange: (category: string) => void,
  onUserTyping: (userId: string) => void,
  onUserStoppedTyping: (userId: string) => void,
) {
  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
      console.log('Connecting to socket server at:', socketUrl);
      
      socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 10,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
        if (socket) {
          socket.emit('join-note', noteId);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    // Ensure we're in the right room even if socket exists
    if (socket.connected) {
      socket.emit('join-note', noteId);
    }

    // Listen for note updates
    socket.on('note:updated', (data) => {
      console.log('Received note update:', data);
      onNoteUpdated(data);
    });

    socket.on('note:content-change', (data) => {
      console.log('Received content change:', data);
      onContentChange(data);
    });

    socket.on('note:title-change', (data) => {
      console.log('Received title change:', data);
      onTitleChange(data);
    });

    socket.on('note:category-change', (data) => {
      console.log('Received category change:', data);
      onCategoryChange(data);
    });

    socket.on('user:typing', onUserTyping);
    socket.on('user:stopped-typing', onUserStoppedTyping);

    // Clean up function
    return () => {
      if (socket) {
        socket.emit('leave-note', noteId);
        socket.off('note:updated');
        socket.off('note:content-change');
        socket.off('note:title-change');
        socket.off('note:category-change');
        socket.off('user:typing');
        socket.off('user:stopped-typing');
      }
    };
  }, [noteId, onNoteUpdated, onContentChange, onTitleChange, onCategoryChange, onUserTyping, onUserStoppedTyping]);

  const emitNoteUpdate = useCallback((note: Note) => {
    console.log('Emitting note update:', note);
    socket?.emit('note:update', { noteId, note });
  }, [noteId]);

  const emitContentChange = useCallback((content: string) => {
    console.log('Emitting content change:', content);
    socket?.emit('note:content-change', { noteId, content });
  }, [noteId]);

  const emitTitleChange = useCallback((title: string) => {
    console.log('Emitting title change:', title);
    socket?.emit('note:title-change', { noteId, title });
  }, [noteId]);

  const emitCategoryChange = useCallback((category: string) => {
    console.log('Emitting category change:', category);
    socket?.emit('note:category-change', { noteId, category });
  }, [noteId]);

  const emitTyping = debounce(() => {
    socket?.emit('user:typing', { noteId });
  }, 100);

  const emitStoppedTyping = debounce(() => {
    socket?.emit('user:stopped-typing', { noteId });
  }, 500);

  return {
    emitNoteUpdate,
    emitContentChange,
    emitTitleChange,
    emitCategoryChange,
    emitTyping,
    emitStoppedTyping,
  };
} 