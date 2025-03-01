"use client";

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { Note } from '@/app/types';

interface ShareNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (email: string) => Promise<void>;
  note: Note;
}

export function ShareNoteDialog({ isOpen, onClose, onShare, note }: ShareNoteDialogProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await onShare(email);
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Error sharing note:', error);
      setError('Failed to share note. Please check the email and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#FDFFA8] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
          max-w-xl w-full transform rotate-1">
          <Dialog.Title className="text-2xl font-bold mb-6">
            <span className="bg-[#FF90E8] px-4 py-2 border-4 border-black inline-block transform -rotate-2">
              Share Note
            </span>
          </Dialog.Title>

          <div className="mb-6">
            <h3 className="font-bold mb-2">Note Details:</h3>
            <div className="bg-white p-4 border-4 border-black">
              <p className="font-bold">{note.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                Category: {note.category || 'Personal'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-2" htmlFor="email">
                Share with (email):
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border-4 border-black focus:ring-0 focus:outline-none
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
                  hover:translate-x-[2px] hover:translate-y-[2px]"
                placeholder="Enter email address"
              />
            </div>

            {error && (
              <p className="text-red-600 font-bold bg-white p-2 border-4 border-black">
                {error}
              </p>
            )}

            {note.sharedWith && note.sharedWith.length > 0 && (
              <div className="bg-white p-4 border-4 border-black">
                <h4 className="font-bold mb-2">Currently shared with:</h4>
                <ul className="list-disc list-inside">
                  {note.sharedWith.map((share, index) => (
                    <li key={index} className="text-sm">
                      {/* {share.user?.email} */}
                      {share.user?.name}


                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-white px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#98FF98] px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold
                  disabled:opacity-50"
              >
                {isSubmitting ? 'Sharing...' : 'Share Note'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 