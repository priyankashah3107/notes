"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Note } from "@/app/types";
import ShareNoteDialog from "./ShareNoteDialog";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (note: Note) => void;
}

export default function NoteCard({ note, onDelete, onUpdate }: NoteCardProps) {
  const router = useRouter();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");
      onDelete(note.id);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/notes/${note.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link
            href={`/notes/${note.id}`}
            className="text-xl font-semibold text-gray-900 hover:text-indigo-600"
          >
            {note.title}
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            Category: {note.category || "Personal"}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="text-gray-600 hover:text-indigo-600"
          >
            Edit
          </button>
          <button
            onClick={() => setIsShareDialogOpen(true)}
            className="text-gray-600 hover:text-indigo-600"
          >
            Share
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-600 hover:text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-gray-700 flex-grow whitespace-pre-wrap">
        {note.content}
      </p>

      <div className="mt-4 text-sm text-gray-500">
        {note.author?.name && <p>Created by: {note.author.name}</p>}
        {note.sharedWith && note.sharedWith.length > 0 && (
          <p className="mt-1">
            Shared with:{" "}
            {note.sharedWith
              .map((s) => s.user?.name || s.user?.email || "Unknown user")
              .join(", ")}
          </p>
        )}
      </div>

      {isShareDialogOpen && (
        <ShareNoteDialog
          note={note}
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
        />
      )}
    </div>
  );
} 