'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Candidate } from '@/types/tournament';



interface AnimatedTournamentBracketProps {
  tournamentTree: Candidate[][];
  autoMode: boolean;
}



export function AnimatedTournamentBracket({ tournamentTree, autoMode }: AnimatedTournamentBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatingLevels, setAnimatingLevels] = useState<Set<number>>(new Set());
  const [activatingWinners, setActivatingWinners] = useState<Set<string>>(new Set());
  const [spawningChampion, setSpawningChampion] = useState(false);
  const [hoveredCandidate, setHoveredCandidate] = useState<{candidate: Candidate, x: number, y: number} | null>(null);
  const previousTreeLengthRef = useRef(0);

  // Track when new rounds are added and mark them for animation
  useLayoutEffect(() => {
    if (tournamentTree.length > previousTreeLengthRef.current) {
      // Mark new levels for animation
      const newLevels = new Set<number>();
      for (let i = previousTreeLengthRef.current; i < tournamentTree.length; i++) {
        newLevels.add(i);
      }
      setAnimatingLevels(newLevels);
      
      // Mark newly activated winners for pulse animation
      if (previousTreeLengthRef.current > 0) {
        const newWinners = new Set<string>();
        const previousLevel = previousTreeLengthRef.current - 1;
        if (tournamentTree[previousLevel]) {
          tournamentTree[previousLevel].forEach(candidate => {
            if (isWinner(candidate, previousLevel)) {
              newWinners.add(`${previousLevel}-${candidate.name}`);
            }
          });
        }
        setActivatingWinners(newWinners);
        
        // Clear winner activation after animation
        setTimeout(() => {
          setActivatingWinners(new Set());
        }, 1000);
      }
      
      // Check if we have a new champion (final level with one candidate)
      const finalLevel = tournamentTree.length - 1;
      if (finalLevel >= 0 && tournamentTree[finalLevel]?.length === 1 && 
          finalLevel >= previousTreeLengthRef.current - 1) {
        setSpawningChampion(true);
        
        // Clear champion spawn after animation
        setTimeout(() => {
          setSpawningChampion(false);
        }, 1000);
      }
      
      // Clear animation flags after animation completes
      const maxDelay = Math.max(...Array.from(newLevels).map(level => 
        tournamentTree[level] ? (tournamentTree[level].length - 1) * 150 + 800 : 800
      ));
      
      setTimeout(() => {
        setAnimatingLevels(new Set());
      }, maxDelay + 100);
    }
    
    previousTreeLengthRef.current = tournamentTree.length;
  }, [tournamentTree.length]);



  // Calculate positions for bracket layout - always render full tree structure
  const getBracketLayout = () => {
    const levelHeight = 80; // Height between levels (reduced from 100)
    const baseSpacing = 85; // Base spacing between nodes (increased from 70)
    
    // Calculate maximum possible levels based on tournament size
    const maxLevels = tournamentTree.length > 0 ? 
      Math.ceil(Math.log2(tournamentTree[0]?.length || 8)) + 1 : 4;
    
    const levels = [];
    
    for (let levelIndex = 0; levelIndex < maxLevels; levelIndex++) {
      const actualRound = tournamentTree[levelIndex];
      const numCandidates = levelIndex === 0 ? 
        (tournamentTree[0]?.length || 8) : 
        Math.max(1, Math.floor((tournamentTree[0]?.length || 8) / Math.pow(2, levelIndex)));
      
      const spacing = baseSpacing * Math.pow(2, levelIndex);
      const totalWidth = (numCandidates - 1) * spacing;
      const startX = -totalWidth / 2;
      
      const candidates = [];
      for (let positionIndex = 0; positionIndex < numCandidates; positionIndex++) {
        const actualCandidate = actualRound?.[positionIndex];
        candidates.push({
          candidate: actualCandidate || { name: 'TBD', intro: 'To be determined' },
          x: startX + positionIndex * spacing,
          y: levelIndex * levelHeight,
          id: `${levelIndex}-${positionIndex}-${actualCandidate?.name || 'tbd'}`,
          isVisible: !!actualCandidate
        });
      }
      
      levels.push({
        level: levelIndex,
        y: levelIndex * levelHeight,
        candidates
      });
    }

    // Calculate container dimensions based on full tree
    const maxWidth = Math.max(...levels.map(level => {
      if (level.candidates.length === 0) return 150;
      const positions = level.candidates.map(c => c.x);
      return Math.max(...positions) - Math.min(...positions) + 150; // Reduced margin from 200 to 150
    }));
    
    const maxHeight = levels.length * levelHeight + 80; // Reduced margin from 100 to 80

    return { levels, maxWidth, maxHeight };
  };

  const { levels, maxWidth, maxHeight } = getBracketLayout();

  // Helper function to check if a candidate is a winner (appears in next round)
  const isWinner = (candidate: Candidate, currentLevel: number) => {
    if (!candidate || currentLevel >= tournamentTree.length - 1) return false;
    const nextRound = tournamentTree[currentLevel + 1];
    return nextRound?.some(nextCandidate => nextCandidate.name === candidate.name) || false;
  };

  // Determine circle size based on tournament size
  const initialTournamentSize = tournamentTree.length > 0 ? tournamentTree[0]?.length || 8 : 8;
  const isSmallTournament = initialTournamentSize <= 8;
  const circleSize = isSmallTournament ? 60 : 50; // Increased from 50/40 to 60/50

  if (tournamentTree.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Binary Reduction Tree
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start processing to see the binary reduction tree
        </p>
      </div>
    );
  }

      return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
      <style dangerouslySetInnerHTML={{
        __html: `
          .tournament-node {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          
          .tournament-node.invisible {
            opacity: 0;
            pointer-events: none;
          }
          
          .tournament-node.animating {
            opacity: 0;
            transform: translateY(-10px) scale(0.9);
            animation: tournamentFadeIn 0.8s ease-out forwards;
          }
          
          .tournament-node.winner {
            background: linear-gradient(135deg, #10b981, #059669) !important;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.7), 0 0 50px rgba(16, 185, 129, 0.4);
          }
          
          .tournament-node.winner-activating {
            background: linear-gradient(135deg, #10b981, #059669) !important;
            animation: winnerActivation 1s ease-out forwards;
          }
          
          @keyframes winnerActivation {
            0% {
              box-shadow: 0 0 10px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.2);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 40px rgba(16, 185, 129, 1), 0 0 80px rgba(16, 185, 129, 0.8);
              transform: scale(1.1);
            }
            100% {
              box-shadow: 0 0 25px rgba(16, 185, 129, 0.7), 0 0 50px rgba(16, 185, 129, 0.4);
              transform: scale(1);
            }
          }
          
          .tournament-node.champion {
            background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4);
            animation: championSparkle 3s ease-in-out infinite;
            position: relative;
          }
          
          .tournament-node.champion-spawning {
            background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
            animation: championFadeIn 1s ease-out forwards;
            position: relative;
          }
          
          .tournament-node.champion::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24, #f59e0b);
            border-radius: 50%;
            z-index: -1;
            animation: championRotate 4s linear infinite;
          }
          

          
          @keyframes championSparkle {
            0%, 100% {
              box-shadow: 0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4);
              transform: scale(1);
            }
            25% {
              box-shadow: 0 0 40px rgba(251, 191, 36, 1), 0 0 80px rgba(251, 191, 36, 0.6);
              transform: scale(1.08);
            }
            50% {
              box-shadow: 0 0 35px rgba(251, 191, 36, 0.9), 0 0 70px rgba(251, 191, 36, 0.5);
              transform: scale(1.05);
            }
            75% {
              box-shadow: 0 0 45px rgba(251, 191, 36, 1), 0 0 90px rgba(251, 191, 36, 0.7);
              transform: scale(1.1);
            }
          }
          
          @keyframes championRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes championFadeIn {
            0% {
              opacity: 0;
              box-shadow: 0 0 0 rgba(251, 191, 36, 0);
            }
            100% {
              opacity: 1;
              box-shadow: 0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4);
            }
          }
          
          .trophy-spawn {
            animation: trophyFadeIn 1s ease-out forwards;
            opacity: 0;
          }
          
          @keyframes trophyFadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          

          
          @keyframes tournamentFadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .tournament-line {
            opacity: 1;
            transform: scaleY(1);
          }
          
          .tournament-line.invisible {
            opacity: 0;
            pointer-events: none;
          }
          
          .tournament-line.animating {
            opacity: 0;
            transform: scaleY(0);
            transform-origin: top;
            animation: tournamentFadeInLine 0.6s ease-out forwards;
          }
          
          @keyframes tournamentFadeInLine {
            from {
              opacity: 0;
              transform: scaleY(0);
            }
            to {
              opacity: 1;
              transform: scaleY(1);
            }
          }
        `
      }} />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
        Binary Reduction Tree
      </h3>
      
      <div 
        ref={containerRef}
        className="relative overflow-x-auto"
        style={{ minHeight: `${maxHeight}px` }}
      >
        <div 
          className="relative"
          style={{ 
            width: `${maxWidth}px`,
            height: `${maxHeight}px`,
            margin: '0 auto',
            transform: `translateX(${maxWidth / 2}px)` // Center the tree
          }}
        >
          {/* Render connection lines first (behind circles) */}
          {levels.map((level, levelIndex) => (
            levelIndex < levels.length - 1 && (
              <div key={`lines-${levelIndex}`}>
                {level.candidates.map((item, candidateIndex) => {
                  const nextLevel = levels[levelIndex + 1];
                  const parentIndex = Math.floor(candidateIndex / 2);
                  const parent = nextLevel.candidates[parentIndex];
                  
                  if (!parent) return null;
                  
                  return (
                    <div key={`line-${item.id}`}>
                      {/* Line from candidate to parent */}
                      <svg
                        className={`tournament-line absolute pointer-events-none ${
                          !parent.isVisible ? 'invisible' :
                          animatingLevels.has(levelIndex + 1) ? 'animating' : ''
                        }`}
                         style={{
                           left: `${Math.min(item.x, parent.x) - circleSize/2}px`,
                           top: `${item.y + 20}px`,
                           width: `${Math.abs(parent.x - item.x) + circleSize}px`,
                           height: `${parent.y - item.y + circleSize}px`,
                           animationDelay: animatingLevels.has(levelIndex + 1) ? `${candidateIndex * 100 + 400}ms` : '0ms'
                         }}
                      >
                        <line
                          x1={item.x < parent.x ? circleSize/2 : Math.abs(parent.x - item.x) + circleSize/2}
                          y1={circleSize/2}
                          x2={parent.x < item.x ? circleSize/2 : Math.abs(parent.x - item.x) + circleSize/2}
                          y2={parent.y - item.y + circleSize/2}
                          stroke="#6B7280"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            )
          ))}

          {/* Render bracket levels */}
          {levels.map((level, levelIndex) => (
            <div key={levelIndex} className="absolute w-full">
              {/* Level label */}
              <div 
                className="absolute text-sm font-medium text-gray-600 dark:text-gray-400"
                style={{ 
                  top: `${level.y + 35}px`, 
                  left: `${-maxWidth / 2 - 80}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                {levelIndex === 0 ? 'Round 1' : 
                 levelIndex === levels.length - 1 ? 'Champion' :
                 `Round ${levelIndex + 1}`}
              </div>

              {/* Candidate circles */}
              {level.candidates.map((item, candidateIndex) => (
                <div key={item.id}>
                  {/* Candidate circle */}
                  <div
                    className={`tournament-node absolute rounded-full flex items-center justify-center text-white font-bold shadow-lg transform transition-all hover:scale-110 cursor-pointer ${
                      levelIndex === levels.length - 1 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    } ${!item.isVisible ? 'invisible' : 
                         animatingLevels.has(levelIndex) ? 'animating' : ''} ${
                      item.isVisible && levelIndex === levels.length - 1 ? 
                        (spawningChampion ? 'champion-spawning' : 'champion') :
                      item.isVisible && isWinner(item.candidate, levelIndex) ? 
                        (activatingWinners.has(`${levelIndex}-${item.candidate.name}`) ? 'winner-activating' : 'winner') : ''
                    }`}
                    style={{
                      left: `${item.x - circleSize/2}px`,
                      top: `${item.y + 20}px`,
                      width: `${circleSize}px`,
                      height: `${circleSize}px`,
                      animationDelay: animatingLevels.has(levelIndex) ? `${candidateIndex * 150}ms` : '0ms'
                    }}
                    onMouseEnter={(e) => {
                      if (item.isVisible) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const containerRect = containerRef.current?.getBoundingClientRect();
                        if (containerRect) {
                          // Account for horizontal scroll offset
                          const scrollLeft = containerRef.current?.scrollLeft || 0;
                          setHoveredCandidate({
                            candidate: item.candidate,
                            x: rect.left - containerRect.left + rect.width / 2 + scrollLeft,
                            y: rect.top - containerRect.top
                          });
                        }
                      }
                    }}
                    onMouseLeave={() => setHoveredCandidate(null)}
                  >
                    <span className={isSmallTournament ? "text-sm" : "text-xs"}>
                      {item.isVisible ? 
                        item.candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2) :
                        '?'
                      }
                    </span>
                    {levelIndex === levels.length - 1 && item.isVisible && (
                      <div className={`absolute -top-8 text-2xl ${spawningChampion ? 'trophy-spawn' : ''}`}>🏆</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Floating Candidate Tooltip */}
        {hoveredCandidate && (
          <div
            className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${hoveredCandidate.x}px`,
              top: `${hoveredCandidate.y - 10}px`,
              maxWidth: '300px',
              minWidth: '250px'
            }}
          >
            <div className="text-center">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {hoveredCandidate.candidate.name}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {hoveredCandidate.candidate.intro}
              </p>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-200 dark:border-t-gray-600"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-7 border-r-7 border-t-7 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>

      {/* Tournament Progress */}
      <div className="mt-2 text-center">
        <div className="inline-flex items-center gap-4 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Progress:
          </div>
          {levels.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index < levels.length ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {levels.length > 0 && levels[levels.length - 1].candidates.length === 1 ? 'Complete!' : 'In Progress'}
          </div>
        </div>
      </div>
    </div>
  );
} 