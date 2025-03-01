"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { debounce } from "lodash";

export function useSocket(
  noteId: string,
  onNoteUpdated: (note: any) => void,
  onContentChange?: (content: string) => void,
  onUserTyping?: (userId: string) => void,
  onUserStoppedTyping?: (userId: string) => void
) {
  const socketRef = useRef<Socket | null>(null);

  const emitContentChange = useCallback((content: string) => {
    if (socketRef.current) {
      socketRef.current.emit("content-change", { noteId, content });
    }
  }, [noteId]);

  const emitTyping = useCallback(
    debounce(() => {
      if (socketRef.current) {
        socketRef.current.emit("typing", { noteId });
      }
    }, 1000),
    [noteId]
  );

  const emitStoppedTyping = useCallback(
    debounce(() => {
      if (socketRef.current) {
        socketRef.current.emit("stopped-typing", { noteId });
      }
    }, 1000),
    [noteId]
  );

  useEffect(() => {
    const socket = io({
      path: "/api/socket",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-note", noteId);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("note-updated", onNoteUpdated);

    if (onContentChange) {
      socket.on("content-change", ({ content }) => {
        onContentChange(content);
      });
    }

    if (onUserTyping) {
      socket.on("user-typing", ({ userId }) => {
        onUserTyping(userId);
      });
    }

    if (onUserStoppedTyping) {
      socket.on("user-stopped-typing", ({ userId }) => {
        onUserStoppedTyping(userId);
      });
    }

    socketRef.current = socket;

    return () => {
      if (socket) {
        socket.emit("leave-note", noteId);
        socket.disconnect();
      }
    };
  }, [noteId, onNoteUpdated, onContentChange, onUserTyping, onUserStoppedTyping]);

  const emitNoteUpdate = useCallback((note: any) => {
    if (socketRef.current) {
      socketRef.current.emit("note-updated", { noteId, note });
    }
  }, [noteId]);

  return {
    emitNoteUpdate,
    emitContentChange,
    emitTyping,
    emitStoppedTyping,
  };
} 