'use client';

import { TournamentState } from '@/types/tournament';

interface TournamentProgressProps {
  tournamentState: TournamentState;
  editedCandidates: Set<string>;
  isLoading: boolean;
  isPaused: boolean;
  onPauseToggle: () => void;
  onReset: () => void;
}

export function TournamentProgress({
  tournamentState,
  editedCandidates,
  isLoading,
  isPaused,
  onPauseToggle,
  onReset
}: TournamentProgressProps) {
  if (tournamentState.currentRound === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 mb-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tournament Progress
        </h2>
        <div className="flex gap-2">
          {!tournamentState.isComplete && tournamentState.currentCandidates.length > 1 && (
            <button
              onClick={onPauseToggle}
              disabled={isLoading}
              className={`font-medium py-1 px-3 text-sm rounded transition-colors ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              } disabled:bg-gray-400`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
          <button
            onClick={onReset}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 text-sm rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-300">
            Round {tournamentState.eliminationTree.length + 1}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-300">Current Round</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-2 rounded text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-300">
            {tournamentState.currentCandidates.length}
          </div>
          <div className="text-xs text-green-600 dark:text-green-300">Candidates Remaining</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-2 rounded text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-300">
            {tournamentState.eliminationTree.reduce((sum, round) => sum + round.matches.length, 0)}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-300">Total Matches</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900 p-2 rounded text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-300">
            {editedCandidates.size}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-300">Modified Profiles</div>
        </div>
      </div>

      {!tournamentState.isComplete && (
        <div className={`border rounded-lg p-4 ${
          isPaused 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
        }`}>
          <div className="flex items-center gap-3">
            {isPaused ? (
              <>
                <div className="h-5 w-5 bg-yellow-600 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Tournament Paused
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-300">
                    Click Resume to continue Round {tournamentState.eliminationTree.length + 1}
                  </div>
                </div>
              </>
            ) : isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <div className="font-semibold text-blue-900 dark:text-blue-100">
                    Running Round {tournamentState.eliminationTree.length + 1}...
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    Processing {Math.ceil(tournamentState.currentCandidates.length / 2)} matches
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="animate-pulse h-5 w-5 bg-blue-600 rounded-full"></div>
                <div>
                  <div className="font-semibold text-blue-900 dark:text-blue-100">
                    Preparing Round {tournamentState.eliminationTree.length + 1}...
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    Starting in a moment
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 