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

  const handleNoteCreated = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
    setIsCreateDialogOpen(false);
  };

  const handleNoteDeleted = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleNoteDeleted}
              onUpdate={handleNoteUpdated}
            />
          ))}
        </div>
      )}

      <CreateNoteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onNoteCreated={handleNoteCreated}
      />
    </div>
  );
} 