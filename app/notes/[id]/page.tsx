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
  const [editedTitle, setEditedTitle] = useState("");
  const [editedCategory, setEditedCategory] = useState("Personal");
  const [isSaving, setIsSaving] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const handleNoteUpdated = useCallback((updatedNote: Note) => {
    setNote(updatedNote);
    setEditedTitle(updatedNote.title);
    setEditedContent(updatedNote.content);
    setEditedCategory(updatedNote.category || "Personal");
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setEditedContent(content);
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setEditedTitle(title);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setEditedCategory(category);
  }, []);

  const handleUserTyping = useCallback((userId: string) => {
    setTypingUsers((prev) => [...new Set([...prev, userId])]);
  }, []);

  const handleUserStoppedTyping = useCallback((userId: string) => {
    setTypingUsers((prev) => prev.filter((id) => id !== userId));
  }, []);

  const { 
    emitNoteUpdate, 
    emitContentChange, 
    emitTitleChange,
    emitCategoryChange,
    emitTyping, 
    emitStoppedTyping 
  } = useSocket(
    id as string,
    handleNoteUpdated,
    handleContentChange,
    handleTitleChange,
    handleCategoryChange,
    handleUserTyping,
    handleUserStoppedTyping
  );

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (updates: Partial<Note>) => {
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
            ...updates,
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
    }, 500), // Reduced debounce time for more responsive saves
    [note, id, emitNoteUpdate]
  );

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`);
        if (!response.ok) throw new Error("Failed to fetch note");
        const data = await response.json();
        setNote(data);
        setEditedTitle(data.title);
        setEditedContent(data.content);
        setEditedCategory(data.category || "Personal");
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("Failed to load note");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleChange = (field: 'title' | 'content' | 'category', value: string) => {
    if (field === 'title') {
      setEditedTitle(value);
      emitTitleChange(value);
    }
    if (field === 'content') {
      setEditedContent(value);
      emitContentChange(value);
    }
    if (field === 'category') {
      setEditedCategory(value);
      emitCategoryChange(value);
    }

    emitTyping();
    debouncedSave({ [field]: value });
  };

  const handleBack = () => {
    router.push("/notes");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-500">{error}</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold">Note not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="bg-white px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
          >
            ← Back to Notes
          </button>
          <div className="text-sm font-bold">
            <span className={`${isSaving ? 'text-yellow-600' : 'text-green-600'}`}>
              {isSaving ? "Saving..." : "All changes saved"}
            </span>
            {typingUsers.length > 0 && (
              <span className="ml-2 bg-[#FF90E8] px-3 py-1 border-2 border-black">
                {typingUsers.length} user{typingUsers.length > 1 ? "s" : ""} typing...
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#FDFFA8] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
          <div className="mb-6">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => emitStoppedTyping()}
              className="w-full p-3 text-2xl font-bold bg-white border-4 border-black focus:ring-0 focus:outline-none
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
                hover:translate-x-[2px] hover:translate-y-[2px]"
            />
            <div className="mt-4">
              <select
                value={editedCategory}
                onChange={(e) => handleChange('category', e.target.value)}
                onBlur={() => emitStoppedTyping()}
                className="p-3 border-4 border-black focus:ring-0 focus:outline-none
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
                  hover:translate-x-[2px] hover:translate-y-[2px] bg-white"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <textarea
              value={editedContent}
              onChange={(e) => handleChange('content', e.target.value)}
              onBlur={() => emitStoppedTyping()}
              rows={10}
              className="w-full p-3 bg-white border-4 border-black focus:ring-0 focus:outline-none
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
                hover:translate-x-[2px] hover:translate-y-[2px]"
              placeholder="Start typing..."
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="bg-white p-4 border-4 border-black transform -rotate-1">
              <p className="font-bold">Created by: {note?.author?.name}</p>
              {note.sharedWith && note.sharedWith.length > 0 && (
                <p className="mt-2">
                  Shared with:{" "}
                  {note.sharedWith
                    .map((s) => s.user?.name || s.user?.email || "Unknown user")
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 