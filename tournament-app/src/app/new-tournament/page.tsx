'use client';

import { useState, useEffect } from 'react';
import { AnimatedTournamentBracket } from '@/components/AnimatedTournamentBracket';
import { Candidate } from '@/types/tournament';
import { tournamentAPI } from '@/lib/tournament-api';




export default function NewTournamentPage() {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [tournamentTree, setTournamentTree] = useState<Candidate[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [tournamentSize, setTournamentSize] = useState(8);

  // Load candidates on mount
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const { candidates } = await tournamentAPI.getCandidates();
        setAllCandidates(candidates);
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    };
    loadCandidates();
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startTournament = () => {
    if (allCandidates.length === 0) return;
    
    // Get first N candidates and shuffle them
    const selectedCandidates = allCandidates.slice(0, tournamentSize);
    const shuffledCandidates = shuffleArray(selectedCandidates);
    
    // Initialize tournament tree with first round
    setTournamentTree([shuffledCandidates]);
  };

  const advanceRound = () => {
    if (tournamentTree.length === 0) return;
    
    const currentRound = tournamentTree[tournamentTree.length - 1];
    if (currentRound.length <= 1) return; // Tournament complete
    
    setIsLoading(true);
    
    // Simulate processing delay
    setTimeout(() => {
      let nextRound: Candidate[];
      
      if (autoMode) {
        // Randomly select half the candidates
        nextRound = [];
        for (let i = 0; i < currentRound.length; i += 2) {
          const winner = Math.random() < 0.5 ? currentRound[i] : currentRound[i + 1];
          nextRound.push(winner);
        }
      } else {
        // In future, this will be injected from external state
        nextRound = currentRound.slice(0, Math.floor(currentRound.length / 2));
      }
      
      setTournamentTree(prev => [...prev, nextRound]);
      setIsLoading(false);
    }, 1000);
  };

  const resetTournament = () => {
    setTournamentTree([]);
    setIsLoading(false);
  };

  const isComplete = tournamentTree.length > 0 && 
                    tournamentTree[tournamentTree.length - 1].length === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 Animated Tournament Bracket
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Watch the tournament unfold with smooth animations
          </p>
        </header>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tournament Size
              </label>
              <select
                value={tournamentSize}
                onChange={(e) => setTournamentSize(parseInt(e.target.value))}
                disabled={tournamentTree.length > 0}
                className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              >
                {[4, 8, 16, 32].map(size => (
                  <option key={size} value={size}>{size} candidates</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoMode"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoMode" className="text-sm text-gray-700 dark:text-gray-300">
                Auto mode (random winners)
              </label>
            </div>

            <div className="flex gap-2 ml-auto">
              {tournamentTree.length === 0 ? (
                <button
                  onClick={startTournament}
                  disabled={allCandidates.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Start Tournament
                </button>
              ) : (
                <>
                  {!isComplete && (
                    <button
                      onClick={advanceRound}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {isLoading ? 'Processing...' : 'Next Round'}
                    </button>
                  )}
                  <button
                    onClick={resetTournament}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tournament Status */}
          {tournamentTree.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {tournamentTree.length}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Rounds Completed
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {tournamentTree[tournamentTree.length - 1]?.length || 0}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    Remaining Candidates
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {isComplete ? '🏆' : '⏳'}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {isComplete ? 'Complete!' : 'In Progress'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Animated Tournament Bracket */}
        <AnimatedTournamentBracket 
          tournamentTree={tournamentTree}
          autoMode={autoMode}
        />

        {/* Champion Display */}
        {isComplete && tournamentTree.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-8 text-center text-white mt-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-2">Tournament Champion!</h2>
            <div className="text-xl font-semibold">
              {tournamentTree[tournamentTree.length - 1][0].name}
            </div>
            <div className="text-lg opacity-90 mt-2">
              {tournamentTree[tournamentTree.length - 1][0].intro}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 