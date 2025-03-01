"use client";

import { useState } from "react";
import { Note } from "@/app/types";
import Dialog from "./Dialog";

interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (note: { title: string; content: string; category: string }) => Promise<void>;
}

export default function CreateNoteDialog({
  isOpen,
  onClose,
  onCreate,
}: CreateNoteDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await onCreate({
        title: title.trim(),
        content: content.trim(),
        category,
      });
      handleClose();
    } catch (error) {
      console.error("Error creating note:", error);
      setError("Failed to create note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setCategory("Personal");
    setError("");
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Create New Note">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-bold"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full p-3 bg-white border-4 border-black focus:ring-0 focus:outline-none
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
              hover:translate-x-[2px] hover:translate-y-[2px]"
            placeholder="Enter note title..."
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-bold"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full p-3 bg-white border-4 border-black focus:ring-0 focus:outline-none
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
              hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Study">Study</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-bold"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="mt-1 block w-full p-3 bg-white border-4 border-black focus:ring-0 focus:outline-none
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
              hover:translate-x-[2px] hover:translate-y-[2px]"
            placeholder="Enter note content..."
          />
        </div>

        {error && (
          <div className="bg-[#FF90E8] p-4 border-4 border-black">
            <p className="font-bold">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !content.trim()}
            className="px-6 py-3 bg-[#FDFFA8] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Note"}
          </button>
        </div>
      </form>
    </Dialog>
  );
} 