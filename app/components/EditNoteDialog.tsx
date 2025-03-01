"use client";

import { useState, useEffect } from "react";
import { Note } from "@/app/types";
import { Dialog } from '@headlessui/react';

interface EditNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  note: Note;
}

export default function EditNoteDialog({
  isOpen,
  onClose,
  onSave,
  note,
}: EditNoteDialogProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState(note.category || "Personal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || "Personal");
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      const updatedNote = await response.json();
      onSave(updatedNote);
      handleClose();
    } catch (error) {
      console.error("Error updating note:", error);
      setError("Failed to update note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  // Real-time update function
  const handleChange = async (
    field: 'title' | 'content' | 'category',
    value: string
  ) => {
    const updatedValue = { [field]: value };
    
    // Update local state immediately
    if (field === 'title') setTitle(value);
    if (field === 'content') setContent(value);
    if (field === 'category') setCategory(value);

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...note,
          ...updatedValue,
        }),
      });

      if (!response.ok) throw new Error(`Failed to update ${field}`);
      const updatedNote = await response.json();
      onSave(updatedNote);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setError(`Failed to update ${field}. Changes will not be saved.`);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#FDFFA8] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
          max-w-2xl w-full transform rotate-1">
          <Dialog.Title className="text-2xl font-bold mb-6">
            <span className="bg-[#FF90E8] px-4 py-2 border-4 border-black inline-block transform -rotate-2">
              Edit Note
            </span>
          </Dialog.Title>

          {error && (
            <div className="mb-6 p-4 bg-white border-4 border-black text-red-600 font-bold transform -rotate-1">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                className="w-full p-3 border-4 border-black focus:ring-0 focus:outline-none
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
                  hover:translate-x-[2px] hover:translate-y-[2px] bg-white"
                placeholder="Enter note title"
              />
            </div>

            <div>
              <label className="block font-bold mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full p-3 border-4 border-black focus:ring-0 focus:outline-none
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
                  hover:translate-x-[2px] hover:translate-y-[2px] bg-white"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2" htmlFor="content">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => handleChange('content', e.target.value)}
                required
                rows={6}
                className="w-full p-3 border-4 border-black focus:ring-0 focus:outline-none
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
                  hover:translate-x-[2px] hover:translate-y-[2px] bg-white"
                placeholder="Enter note content"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="bg-white px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#98FF98] px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold
                  disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 