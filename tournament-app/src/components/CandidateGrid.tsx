'use client';

import { Candidate, TournamentState } from '@/types/tournament';
import { CandidateCard } from './CandidateCard';

interface CandidateGridProps {
  allCandidates: Candidate[];
  tournamentState: TournamentState;
  settings: {
    candidateCount: number;
  };
  editedCandidates: Set<string>;
  onCandidateUpdate: (candidate: Candidate, index: number) => void;
  onMarkEdited: (candidateName: string) => void;
}

export function CandidateGrid({
  allCandidates,
  tournamentState,
  settings,
  editedCandidates,
  onCandidateUpdate,
  onMarkEdited
}: CandidateGridProps) {
  if (allCandidates.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {tournamentState.currentRound === 0 
            ? `All Candidates (${settings.candidateCount} selected)`
            : `Current Candidates (${tournamentState.currentCandidates.length})`
          }
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click to edit candidate profiles
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(tournamentState.currentRound === 0 ? allCandidates : tournamentState.currentCandidates).map((candidate, index) => {
          const isInTournament = tournamentState.currentRound === 0 
            ? index < settings.candidateCount 
            : true;
          
          return (
            <div
              key={`${candidate.name}-${index}`}
              className={`transition-all duration-300 ${
                !isInTournament ? 'opacity-40 scale-95' : ''
              }`}
            >
              <CandidateCard
                candidate={candidate}
                isEdited={editedCandidates.has(candidate.name)}
                onUpdate={(updatedCandidate) => onCandidateUpdate(updatedCandidate, index)}
                onMarkEdited={onMarkEdited}
              />
              {!isInTournament && (
                <div className="text-center mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    Not in tournament
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 