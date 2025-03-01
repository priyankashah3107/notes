"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Note } from "@/app/types";
import { ShareNoteDialog } from "./ShareNoteDialog";
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const router = useRouter();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const randomRotation = Math.random() > 0.5 ? 'rotate-1' : '-rotate-1';
  const colors = ['#FF90E8', '#98FF98', '#FDFFA8', 'white'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");
      
      onDelete(note.id);
      router.refresh();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    // Open in new tab
    window.open(`/notes/${note.id}`, '_blank');
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  return (
    <>
      <div 
        className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
          transform hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
        style={{ backgroundColor: randomColor }}
      >
        <div className="flex justify-between items-start mb-4">
          <Link href={`/notes/${note.id}`}>
            <h3 className="text-xl font-bold hover:underline">{note.title}</h3>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="bg-black text-white px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm font-bold"
            >
              Edit
            </button>
            <button
              onClick={handleShare}
              className="bg-[#98FF98] px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm font-bold"
            >
              Share
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-[#FF90E8] px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm font-bold
                disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="line-clamp-3">{note.content}</p>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="font-bold">
            {note.category || 'Personal'}
          </div>
          <div className="text-gray-600">
            Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </div>
        </div>

        {note.sharedWith && note.sharedWith.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-black">
            <p className="text-sm font-bold">
              Shared with: {note.sharedWith.map(s => s.user?.name || s.user?.email).join(', ')}
            </p>
          </div>
        )}
      </div>

      {isShareDialogOpen && (
        <ShareNoteDialog
          note={note}
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          onShare={async (email) => {
            try {
              const response = await fetch(`/api/notes/${note.id}/share`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
              });
              if (!response.ok) throw new Error('Failed to share note');
              router.refresh();
            } catch (error) {
              console.error('Error sharing note:', error);
              throw error;
            }
          }}
        />
      )}
    </>
  );
}  