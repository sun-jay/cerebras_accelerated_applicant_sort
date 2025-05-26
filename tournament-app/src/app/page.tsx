'use client';

import { useState, useEffect, useCallback } from 'react';
import { tournamentAPI } from '@/lib/tournament-api';
import { Candidate, TournamentState, RoundData } from '@/types/tournament';
import { TournamentSettings } from '@/components/TournamentSettings';
import { TournamentProgress } from '@/components/TournamentProgress';
// Removed unused ChampionDisplay import
import { CandidateGrid } from '@/components/CandidateGrid';
import { TournamentHistory } from '@/components/TournamentHistory';
import { TabSystem } from '@/components/TabSystem';
import { AnimatedTournamentBracket } from '@/components/AnimatedTournamentBracket';
import { HowItWorksButton } from '@/components/HowItWorksModal';

export default function Home() {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [tournamentState, setTournamentState] = useState<TournamentState>({
    currentRound: 0,
    currentCandidates: [],
    eliminationTree: [],
    isComplete: false,
  });
  const [editedCandidates, setEditedCandidates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('candidates');
  const [settings, setSettings] = useState({
    candidateCount: 8,
    batchSize: 8,
    role: 'software engineering',
  });

  // Load candidates on mount
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const { candidates } = await tournamentAPI.getCandidates();
        setAllCandidates(candidates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidates');
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
    if (settings.candidateCount % 2 !== 0) {
      setError('Number of candidates must be even');
      return;
    }
    
    // Use the first N candidates as selected, but shuffle them for tournament fairness
    const selectedCandidates = allCandidates.slice(0, settings.candidateCount);
    const shuffledCandidates = shuffleArray(selectedCandidates);
    setTournamentState({
      currentRound: 1,
      currentCandidates: shuffledCandidates,
      eliminationTree: [],
      isComplete: false,
    });
    setError(null);
  };

  const runNextRound = async () => {
    if (tournamentState.currentCandidates.length <= 1) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await tournamentAPI.runRound({
        candidates: tournamentState.currentCandidates,
        batchSize: settings.batchSize,
        role: settings.role,
      });

      const roundData: RoundData = {
        round: tournamentState.currentRound,
        matches: response.matches,
        total_batches: response.totalBatches,
      };

      const newEliminationTree = [...tournamentState.eliminationTree, roundData];
      const isComplete = response.winners.length === 1;

      setTournamentState({
        currentRound: tournamentState.currentRound + 1,
        currentCandidates: response.winners,
        eliminationTree: newEliminationTree,
        isComplete,
        champion: isComplete ? response.winners[0] : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run round');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run tournament rounds
  useEffect(() => {
    if (tournamentState.currentRound > 0 && 
        tournamentState.currentCandidates.length > 1 && 
        !tournamentState.isComplete && 
        !isLoading && 
        !error &&
        !isPaused) {
      // Add a small delay between rounds for better UX
      const timer = setTimeout(() => {
        runNextRound();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [tournamentState.currentRound, tournamentState.currentCandidates.length, tournamentState.isComplete, isLoading, error, isPaused, runNextRound]);

  const resetTournament = () => {
    setTournamentState({
      currentRound: 0,
      currentCandidates: [],
      eliminationTree: [],
      isComplete: false,
    });
    setEditedCandidates(new Set());
    setError(null);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-1">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-2">
          <div className="flex justify-center items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              🧠 Cerebras-Accelerated Binary Reduction Candidate Sorter
            </h1>
            <HowItWorksButton />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Efficiently process millions of resumes with binary reduction and Cerebras accelerated inference
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
            {error}
          </div>
        )}

        {/* Processing Settings */}
        {tournamentState.currentRound === 0 && (
          <TournamentSettings
            settings={settings}
            onSettingsChange={(newSettings) => setSettings({ ...newSettings, batchSize: 8 })}
            allCandidates={allCandidates}
            onStartTournament={startTournament}
          />
        )}

        {/* Processing Progress */}
        <TournamentProgress
          tournamentState={tournamentState}
          editedCandidates={editedCandidates}
          isLoading={isLoading}
          isPaused={isPaused}
          onPauseToggle={() => setIsPaused(!isPaused)}
          onReset={resetTournament}
        />



        {/* Tournament Views */}
        {allCandidates.length > 0 && (
          <TabSystem
            tabs={[
              {
                id: 'candidates',
                label: 'Candidates',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                id: 'bracket',
                label: 'Binary Reduction Tree',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {activeTab === 'candidates' && (
              <CandidateGrid
                allCandidates={allCandidates}
                tournamentState={tournamentState}
                settings={settings}
                editedCandidates={editedCandidates}
                onCandidateUpdate={(updatedCandidate: Candidate, index: number) => {
                  // Update in allCandidates
                  const newAllCandidates = [...allCandidates];
                  const allIndex = allCandidates.findIndex(c => c.name === (tournamentState.currentRound === 0 ? allCandidates[index].name : tournamentState.currentCandidates[index].name));
                  if (allIndex !== -1) {
                    newAllCandidates[allIndex] = updatedCandidate;
                    setAllCandidates(newAllCandidates);
                  }
                  
                  // Update in currentCandidates if tournament is running
                  if (tournamentState.currentRound > 0) {
                    const newCurrentCandidates = [...tournamentState.currentCandidates];
                    newCurrentCandidates[index] = updatedCandidate;
                    setTournamentState({
                      ...tournamentState,
                      currentCandidates: newCurrentCandidates
                    });
                  }
                }}
                onMarkEdited={(candidateName: string) => {
                  setEditedCandidates(prev => new Set(prev).add(candidateName));
                }}
              />
            )}
            
            {activeTab === 'bracket' && (
              <AnimatedTournamentBracket
                tournamentTree={(() => {
                  // Convert processing state to the format expected by AnimatedTournamentBracket
                  const tree: Candidate[][] = [];
                  
                  if (tournamentState.currentRound > 0) {
                    // Reconstruct the starting candidates from the first round matches
                    if (tournamentState.eliminationTree.length > 0) {
                      const firstRound = tournamentState.eliminationTree[0];
                      const startingCandidates: Candidate[] = [];
                      firstRound.matches.forEach(match => {
                        startingCandidates.push(match.candidate1, match.candidate2);
                      });
                      tree.push(startingCandidates);
                    } else {
                      // If no rounds completed yet, use current candidates
                      tree.push([...tournamentState.currentCandidates]);
                    }
                    
                    // Add each completed round's winners
                    tournamentState.eliminationTree.forEach(roundData => {
                      const winners: Candidate[] = [];
                      roundData.matches.forEach(match => {
                        winners.push(match.winner);
                      });
                      tree.push(winners);
                    });
                  }
                  
                  return tree;
                })()}
                autoMode={false}
              />
            )}
          </TabSystem>
        )}

        {/* Processing History */}
        <TournamentHistory tournamentState={tournamentState} />
      </div>
    </div>
  );
}
