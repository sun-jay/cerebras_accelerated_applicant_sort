'use client';

import { TournamentState } from '@/types/tournament';

interface TournamentHistoryProps {
  tournamentState: TournamentState;
}

export function TournamentHistory({ tournamentState }: TournamentHistoryProps) {
  if (tournamentState.eliminationTree.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Tournament History
      </h3>
      <div className="space-y-6">
        {[...tournamentState.eliminationTree].reverse().map((round) => (
          <div key={round.round} className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Round {round.round} ({round.matches.length} matches, {round.total_batches} batches)
              {round.round === tournamentState.eliminationTree.length && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Latest
                </span>
              )}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {round.matches.map((match, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {match.candidate1.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">vs</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {match.candidate2.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">
                        Winner: {match.winner.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Batch {match.batch}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 