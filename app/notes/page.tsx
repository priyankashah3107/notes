"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/app/types";
import NoteCard from "@/app/components/NoteCard";
import CreateNoteDialog from "@/app/components/CreateNoteDialog";

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (note: { title: string; content: string; category: string }) => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });

      if (!response.ok) throw new Error("Failed to create note");
      
      const createdNote = await response.json();
      setNotes((prev) => [createdNote, ...prev]);
      setIsCreateDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating note:", error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  const handleNoteDeleted = async (noteId: string) => {
    try {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      router.refresh();
    } catch (error) {
      console.error("Error handling note deletion:", error);
    }
  };

  const handleNoteUpdated = async (updatedNote: Note) => {
    try {
      const response = await fetch(`/api/notes/${updatedNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) throw new Error("Failed to update note");
      const savedNote = await response.json();
      
      setNotes((prev) =>
        prev.map((note) => (note.id === savedNote.id ? savedNote : note))
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="px-6 py-3 bg-[#FDFFA8] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
        >
          Create Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white p-8 border-4 border-black inline-block transform rotate-1">
            <p className="font-bold text-lg">No notes yet. Create your first note!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleNoteDeleted}
              onEdit={handleNoteUpdated}
            />
          ))}
        </div>
      )}

      <CreateNoteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateNote}
      />
    </div>
  );
} 