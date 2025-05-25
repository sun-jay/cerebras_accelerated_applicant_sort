'use client';

import { useState } from 'react';
import { Candidate } from '@/types/tournament';

interface CandidateCardProps {
  candidate: Candidate;
  onUpdate: (updatedCandidate: Candidate) => void;
  isEdited?: boolean;
  onMarkEdited?: (candidateName: string) => void;
}

export function CandidateCard({ candidate, onUpdate, isEdited = false, onMarkEdited }: CandidateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(candidate.name);
  const [editedIntro, setEditedIntro] = useState(candidate.intro);

  const handleSave = () => {
    const updatedCandidate = {
      name: editedName.trim(),
      intro: editedIntro.trim()
    };
    onUpdate(updatedCandidate);
    onMarkEdited?.(candidate.name);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(candidate.name);
    setEditedIntro(candidate.intro);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 p-4 rounded-lg">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Candidate name"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Introduction
          </label>
          <textarea
            value={editedIntro}
            onChange={(e) => setEditedIntro(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm resize-none"
            placeholder="Candidate introduction and background"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!editedName.trim() || !editedIntro.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-3 rounded text-sm transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer transition-colors group ${
        isEdited 
          ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30' 
          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
      }`}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {candidate.name}
          </h4>
          {isEdited && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              Modified
            </span>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
        {candidate.intro}
      </p>
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Click to edit
        </p>
      </div>
    </div>
  );
} 