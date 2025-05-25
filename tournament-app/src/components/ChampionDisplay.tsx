'use client';

import { TournamentState } from '@/types/tournament';

interface ChampionDisplayProps {
  tournamentState: TournamentState;
}

export function ChampionDisplay({ tournamentState }: ChampionDisplayProps) {
  if (!tournamentState.isComplete || !tournamentState.champion) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        🏆 Tournament Champion! 🏆
      </h2>
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {tournamentState.champion.name}
        </h3>
        <p className="text-gray-700">{tournamentState.champion.intro}</p>
      </div>
    </div>
  );
} 