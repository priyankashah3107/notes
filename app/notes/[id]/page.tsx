"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Note } from "@/app/types";
import { useSocket } from "@/app/hooks/useSocket";
import { debounce } from "lodash";

export default function NotePage() {
  const router = useRouter();
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const handleNoteUpdated = useCallback((updatedNote: Note) => {
    setNote(updatedNote);
    setEditedContent(updatedNote.content);
  }, []);

  const handleUserTyping = useCallback((userId: string) => {
    setTypingUsers((prev) => [...new Set([...prev, userId])]);
  }, []);

  const handleUserStoppedTyping = useCallback((userId: string) => {
    setTypingUsers((prev) => prev.filter((id) => id !== userId));
  }, []);

  const { emitNoteUpdate, emitTyping, emitStoppedTyping } = useSocket(
    id as string,
    handleNoteUpdated,
    handleUserTyping,
    handleUserStoppedTyping
  );

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      if (!note) return;

      try {
        setIsSaving(true);
        const response = await fetch(`/api/notes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...note,
            content,
          }),
        });

        if (!response.ok) throw new Error("Failed to update note");

        const updatedNote = await response.json();
        setNote(updatedNote);
        emitNoteUpdate(updatedNote);
      } catch (error) {
        console.error("Error auto-saving note:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [note, id, emitNoteUpdate]
  );

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`);
        if (!response.ok) throw new Error("Failed to fetch note");
        const data = await response.json();
        setNote(data);
        setEditedContent(data.content);
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("Failed to load note");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    emitTyping();
    debouncedSave(newContent);
  };

  const handleSave = async () => {
    if (!note) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...note,
          content: editedContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to update note");

      const updatedNote = await response.json();
      setNote(updatedNote);
      emitNoteUpdate(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      setError("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/notes");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Note not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-indigo-600"
          >
            ← Back to Notes
          </button>
          <div className="text-sm text-gray-500">
            {isSaving ? "Saving..." : "All changes saved"}
            {typingUsers.length > 0 && (
              <span className="ml-2 text-indigo-600">
                {typingUsers.length} user{typingUsers.length > 1 ? "s" : ""}{" "}
                typing...
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
            <p className="text-sm text-gray-500">
              Category: {note.category || "Personal"}
            </p>
          </div>

          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={handleContentChange}
              onBlur={() => emitStoppedTyping()}
              rows={10}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Start typing..."
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <p>Created by: {note.author?.name}</p>
              {note.sharedWith && note.sharedWith.length > 0 && (
                <p>
                  Shared with:{" "}
                  {note.sharedWith
                    .map((s) => s.user?.name || s.user?.email || "Unknown user")
                    .join(", ")}
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 