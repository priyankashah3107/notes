"use client";

import { useState } from "react";
import { Note } from "@/app/types";
import Dialog from "./Dialog";

interface ShareNoteDialogProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareNoteDialog({
  note,
  isOpen,
  onClose,
}: ShareNoteDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/notes/${note.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to share note");
      }

      setEmail("");
      onClose();
    } catch (error) {
      console.error("Error sharing note:", error);
      setError(error instanceof Error ? error.message : "Failed to share note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (email: string) => {
    try {
      const response = await fetch(`/api/notes/${note.id}/share`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove share");
      }

      // Refresh the note data
      window.location.reload();
    } catch (error) {
      console.error("Error removing share:", error);
      alert("Failed to remove share. Please try again.");
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Share Note">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Share with (email)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="user@example.com"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Sharing..." : "Share"}
          </button>
        </div>
      </form>

      {note.sharedWith.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">Shared with</h4>
          <ul className="mt-3 space-y-2">
            {note.sharedWith.map((share) => (
              <li
                key={share.id}
                className="flex items-center justify-between text-sm text-gray-600"
              >
                <span>{share.user.email}</span>
                <button
                  onClick={() => handleRemoveShare(share.user.email)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Dialog>
  );
} 