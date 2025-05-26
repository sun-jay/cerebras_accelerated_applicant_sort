'use client';

import { Candidate } from '@/types/tournament';

interface TournamentSettingsProps {
  settings: {
    candidateCount: number;
    batchSize: number;
    role: string;
  };
  onSettingsChange: (newSettings: any) => void;
  allCandidates: Candidate[];
  onStartTournament: () => void;
}

export function TournamentSettings({ 
  settings, 
  onSettingsChange, 
  allCandidates, 
  onStartTournament 
}: TournamentSettingsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Tournament Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Candidates
          </label>
          <select
            value={settings.candidateCount}
            onChange={(e) => onSettingsChange({ ...settings, candidateCount: parseInt(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {[4, 8, 16, 32].map(count => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <select
            value={settings.role}
            onChange={(e) => onSettingsChange({ ...settings, role: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="software engineering">Software Engineering</option>
            <option value="data science">Data Science</option>
            <option value="product management">Product Management</option>
            <option value="research">Research</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {allCandidates.length > 0 && (
            <span>
              Using first {settings.candidateCount} of {allCandidates.length} candidates
            </span>
          )}
        </div>
        <button
          onClick={onStartTournament}
          disabled={allCandidates.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Start Tournament
        </button>
      </div>
    </div>
  );
} 