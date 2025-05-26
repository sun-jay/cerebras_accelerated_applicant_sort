'use client';

import { Candidate, TournamentState } from '@/types/tournament';

interface TournamentBracketProps {
  tournamentState: TournamentState;
  settings: {
    candidateCount: number;
  };
  allCandidates: Candidate[];
}

// Removed unused BracketNode interface

export function TournamentBracket({ tournamentState, settings, allCandidates }: TournamentBracketProps) {
  // Calculate the number of rounds needed
  const totalRounds = Math.log2(settings.candidateCount);
  
  // Get the initial tournament candidates (shuffled order from when tournament started)
  const getInitialCandidates = () => {
    if (tournamentState.currentRound === 0) {
      return allCandidates.slice(0, settings.candidateCount);
    }
    
    // Reconstruct the initial order from the first round matches
    const firstRound = tournamentState.eliminationTree[0];
    if (!firstRound) return allCandidates.slice(0, settings.candidateCount);
    
    const initialOrder: Candidate[] = [];
    firstRound.matches.forEach(match => {
      initialOrder.push(match.candidate1, match.candidate2);
    });
    return initialOrder;
  };

  const initialCandidates = getInitialCandidates();
  
  // Build bracket levels from bottom to top
  const buildBracketLevels = () => {
    const levels: Candidate[][] = [];
    
    // Level 0: All initial candidates
    levels[0] = initialCandidates;
    
    // Subsequent levels: Winners from each round
    for (let round = 0; round < tournamentState.eliminationTree.length; round++) {
      const roundData = tournamentState.eliminationTree[round];
      levels[round + 1] = roundData.matches.map(match => match.winner);
    }
    
    return levels;
  };

  const bracketLevels = buildBracketLevels();
  
  // Determine which candidates advanced to which round
  const getCandidateStatus = (candidate: Candidate) => {
    let maxRound = 0;
    
    // Check each round to see how far this candidate got
    for (let round = 0; round < tournamentState.eliminationTree.length; round++) {
      const roundData = tournamentState.eliminationTree[round];
      const participatedInRound = roundData.matches.some(match => 
        match.candidate1.name === candidate.name || match.candidate2.name === candidate.name
      );
      
      if (participatedInRound) {
        const wonRound = roundData.matches.some(match => match.winner.name === candidate.name);
        if (wonRound) {
          maxRound = round + 1;
        }
      }
    }
    
    return {
      roundsWon: maxRound,
      isChampion: tournamentState.isComplete && maxRound === totalRounds,
      isActive: bracketLevels[maxRound]?.some(c => c.name === candidate.name) || false
    };
  };

  if (tournamentState.currentRound === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Tournament Bracket
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start the tournament to see the bracket visualization
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Tournament Bracket - Bottom to Top */}
        <div className="flex flex-col-reverse gap-8">
          {bracketLevels.map((level, levelIndex) => (
            <div key={levelIndex} className="flex flex-col items-center">
              {/* Level Header */}
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {levelIndex === 0 ? 'Starting Candidates' : 
                   levelIndex === totalRounds ? 'Champion' :
                   `Round ${levelIndex} Winners`}
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {level.length} candidate{level.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {/* Candidates in this level */}
              <div className="flex flex-wrap justify-center gap-4 max-w-6xl">
                {level.map((candidate, candidateIndex) => {
                  const status = getCandidateStatus(candidate);
                  
                  return (
                    <div
                      key={`${candidate.name}-${levelIndex}-${candidateIndex}`}
                      className={`p-3 rounded-lg border-2 transition-all min-w-[160px] text-center ${
                        status.isChampion
                          ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-400'
                          : status.roundsWon > levelIndex
                            ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-400'
                            : levelIndex === 0
                              ? 'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                              : 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-600'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {candidate.name}
                      </div>
                      
                      {status.isChampion && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1">
                          🏆 Champion
                        </div>
                      )}
                      
                      {status.roundsWon > levelIndex && !status.isChampion && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                          ✓ Advanced
                        </div>
                      )}
                      
                      {levelIndex === 0 && status.roundsWon === 0 && tournamentState.eliminationTree.length > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                          Eliminated R1
                        </div>
                      )}
                      
                      {levelIndex > 0 && status.roundsWon === levelIndex && !status.isChampion && tournamentState.eliminationTree.length > levelIndex && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                          Eliminated R{levelIndex + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Connection lines indicator */}
              {levelIndex < bracketLevels.length - 1 && bracketLevels[levelIndex + 1].length > 0 && (
                <div className="mt-4 mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                    <span>advances to</span>
                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Tournament Stats */}
        {tournamentState.eliminationTree.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {tournamentState.eliminationTree.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Rounds Completed
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {tournamentState.eliminationTree.reduce((sum, round) => sum + round.matches.length, 0)}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Total Matches
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {settings.candidateCount - tournamentState.currentCandidates.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Eliminated
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 