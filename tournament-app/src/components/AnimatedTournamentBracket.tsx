'use client';

import { useEffect, useRef, useState } from 'react';
import { Candidate } from '@/types/tournament';

// Dynamic import for anime.js to work with Next.js
let anime: any;

interface AnimatedTournamentBracketProps {
  tournamentTree: Candidate[][];
  autoMode: boolean;
}

interface BracketNode {
  candidate: Candidate;
  level: number;
  position: number;
  id: string;
}

export function AnimatedTournamentBracket({ tournamentTree, autoMode }: AnimatedTournamentBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [previousTreeLength, setPreviousTreeLength] = useState(0);
  const [bracketNodes, setBracketNodes] = useState<BracketNode[]>([]);
  const [animeLoaded, setAnimeLoaded] = useState(false);

  // Load anime.js dynamically
  useEffect(() => {
    const loadAnime = async () => {
      try {
        const animeModule = await import('animejs');
        anime = animeModule;
        setAnimeLoaded(true);
      } catch (error) {
        console.error('Failed to load anime.js:', error);
      }
    };
    loadAnime();
  }, []);

  // Convert tournament tree to bracket nodes
  useEffect(() => {
    if (tournamentTree.length === 0) {
      setBracketNodes([]);
      setPreviousTreeLength(0);
      return;
    }

    const nodes: BracketNode[] = [];
    
    tournamentTree.forEach((round, levelIndex) => {
      round.forEach((candidate, positionIndex) => {
        nodes.push({
          candidate,
          level: levelIndex,
          position: positionIndex,
          id: `${levelIndex}-${positionIndex}-${candidate.name}`
        });
      });
    });

    setBracketNodes(nodes);
  }, [tournamentTree]);

  // Animate new round when tree length changes
  useEffect(() => {
    if (tournamentTree.length > previousTreeLength && previousTreeLength > 0 && animeLoaded) {
      animateNewRound();
    }
    setPreviousTreeLength(tournamentTree.length);
  }, [tournamentTree.length, previousTreeLength, animeLoaded]);

  const animateNewRound = () => {
    if (!anime || !animeLoaded) return;
    
    const newLevel = tournamentTree.length - 1;
    
    // First, expand the container
    if (containerRef.current) {
      const animeFunc = anime.default || anime;
      animeFunc({
        targets: containerRef.current,
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => {
          // Then animate in the new nodes
          animateNewNodes(newLevel);
        }
      });
    } else {
      animateNewNodes(newLevel);
    }
  };

  const animateNewNodes = (level: number) => {
    if (!anime || !animeLoaded) return;
    
    const animeFunc = anime.default || anime;
    
    // Animate new candidate nodes
    const newNodeSelectors = `.bracket-node-${level}`;
    animeFunc({
      targets: newNodeSelectors,
      opacity: [0, 1],
      translateY: [-20, 0],
      scale: [0.8, 1],
      duration: 600,
      delay: (animeFunc.stagger || anime.stagger)(100),
      easing: 'easeOutElastic(1, .8)'
    });

    // Animate connection lines
    const newLineSelectors = `.connection-line-${level}`;
    animeFunc({
      targets: newLineSelectors,
      opacity: [0, 1],
      scaleX: [0, 1],
      duration: 400,
      delay: 200,
      easing: 'easeOutQuad'
    });
  };

  // Calculate positions for bracket layout
  const getBracketLayout = () => {
    if (tournamentTree.length === 0) return { levels: [], maxWidth: 0 };

    const levels = tournamentTree.map((round, levelIndex) => {
      const levelHeight = 120; // Height per level
      const nodeSpacing = 220; // Spacing between nodes (increased for better visibility)
      
      return {
        level: levelIndex,
        y: levelIndex * levelHeight,
        candidates: round.map((candidate, positionIndex) => ({
          candidate,
          x: positionIndex * nodeSpacing,
          y: levelIndex * levelHeight,
          id: `${levelIndex}-${positionIndex}-${candidate.name}`
        }))
      };
    });

    const maxWidth = Math.max(...levels.map(level => 
      level.candidates.length > 0 ? (level.candidates.length - 1) * 220 + 400 : 400
    ));

    return { levels, maxWidth };
  };

  const { levels, maxWidth } = getBracketLayout();

  if (tournamentTree.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Animated Tournament Bracket
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start a tournament to see the animated bracket
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
        Tournament Bracket
      </h3>
      
      <div 
        ref={containerRef}
        className="relative overflow-x-auto"
        style={{ minHeight: `${levels.length * 120 + 100}px` }}
      >
        <div 
          className="relative"
          style={{ 
            width: `${maxWidth}px`,
            height: `${levels.length * 120 + 100}px`,
            margin: '0 auto'
          }}
        >
          {/* Render bracket levels */}
          {levels.map((level, levelIndex) => (
            <div key={levelIndex} className="absolute w-full">
              {/* Level label */}
              <div 
                className="absolute left-0 text-sm font-medium text-gray-600 dark:text-gray-400"
                style={{ top: `${level.y + 35}px`, left: '-80px' }}
              >
                {levelIndex === 0 ? 'Round 1' : 
                 levelIndex === levels.length - 1 ? 'Champion' :
                 `Round ${levelIndex + 1}`}
              </div>

              {/* Candidate nodes */}
              {level.candidates.map((item, candidateIndex) => (
                <div key={item.id}>
                  {/* Candidate node */}
                  <div
                    className={`bracket-node-${levelIndex} absolute bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-3 shadow-lg transform transition-all hover:scale-105 ${
                      levelIndex === levels.length - 1 ? 'from-yellow-400 to-orange-500' : ''
                    }`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y + 20}px`,
                      width: '180px',
                      opacity: 1 // Make all nodes visible by default
                    }}
                  >
                    <div className="font-semibold text-sm truncate">
                      {item.candidate.name}
                    </div>
                    <div className="text-xs opacity-90 truncate mt-1">
                      {item.candidate.intro.slice(0, 50)}...
                    </div>
                    {levelIndex === levels.length - 1 && (
                      <div className="text-center mt-2">🏆</div>
                    )}
                  </div>

                  {/* Connection lines to next level */}
                  {levelIndex < levels.length - 1 && candidateIndex % 2 === 0 && candidateIndex + 1 < level.candidates.length && (
                    <>
                      {/* Horizontal line connecting pair */}
                      <div
                        className={`connection-line-${levelIndex + 1} absolute bg-gray-400 dark:bg-gray-600`}
                        style={{
                          left: `${item.x + 180}px`,
                          top: `${item.y + 45}px`,
                          width: `${level.candidates[candidateIndex + 1].x - item.x - 180}px`,
                          height: '2px',
                          opacity: 1 // Make lines visible
                        }}
                      />
                      
                      {/* Vertical line to next level */}
                      <div
                        className={`connection-line-${levelIndex + 1} absolute bg-gray-400 dark:bg-gray-600`}
                        style={{
                          left: `${(item.x + level.candidates[candidateIndex + 1].x) / 2 + 90}px`,
                          top: `${item.y + 45}px`,
                          width: '2px',
                          height: '75px',
                          opacity: 1 // Make lines visible
                        }}
                      />
                      
                      {/* Horizontal line to winner position */}
                      <div
                        className={`connection-line-${levelIndex + 1} absolute bg-gray-400 dark:bg-gray-600`}
                        style={{
                          left: `${(item.x + level.candidates[candidateIndex + 1].x) / 2 + 90}px`,
                          top: `${item.y + 120}px`,
                          width: `${Math.floor(candidateIndex / 2) * 100 - (item.x + level.candidates[candidateIndex + 1].x) / 2 - 90}px`,
                          height: '2px',
                          opacity: 1 // Make lines visible
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tournament Progress */}
      <div className="mt-6 text-center">
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