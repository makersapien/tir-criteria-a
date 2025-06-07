// ===== CRITICAL FIX 2: ProgressBarSection.tsx - Enhanced Progress Display =====
// src/screens/main/ProgressBarSection.tsx

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface ProgressBarSectionProps {
  userInputs: any;
  currentStrand: number;
  strandProgress: number[];
  setCurrentStrand: (strand: number) => void;
  earnedBadges: {
    principlePioneer: boolean;
    conceptCrusader: boolean;
    applicationAce: boolean;
    analysisArchitect: boolean;
  };
  experimentTitle: string;
}

const strands = [
  'TIR Principles & Laws',
  'Understanding TIR Phenomena', 
  'Real-World Applications',
  'Analysis & Problem Solving'
];

const ProgressBarSection: React.FC<ProgressBarSectionProps> = ({
  userInputs,
  currentStrand,
  strandProgress,
  setCurrentStrand,
  earnedBadges,
  experimentTitle,
}) => {
  const prevLevels = useRef<number[]>([0, 0, 0, 0]);
  const [transitionState, setTransitionState] = useState(0);

  // ✅ CRITICAL FIX: Enhanced progress change detection
  useEffect(() => {
    console.log('📊 PROGRESS BAR UPDATE:', {
      previous: prevLevels.current,
      current: strandProgress,
      changed: strandProgress.some((level, idx) => level !== prevLevels.current[idx])
    });
    
    let hasChanges = false;
    
    strandProgress.forEach((level, idx) => {
      const prev = prevLevels.current[idx] || 0;
      const current = level || 0;
      
      if (current > prev) {
        hasChanges = true;
        console.log(`🎉 PROGRESS IMPROVED: Strand ${idx + 1}: ${prev} → ${current}`);
        
        // Trigger celebration based on achievement level
        if (current >= 8) {
          confetti({ 
            particleCount: 200, 
            spread: 90, 
            origin: { y: 0.6 },
            colors: ['#ffd700', '#ffed4e', '#fbbf24', '#f59e0b']
          });
        } else if (current >= 6) {
          confetti({ 
            particleCount: 100, 
            spread: 70, 
            origin: { y: 0.6 },
            colors: ['#9333ea', '#a855f7', '#c084fc']
          });
        } else if (current >= 4) {
          confetti({ 
            particleCount: 50, 
            spread: 50, 
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#60a5fa']
          });
        }
      }
    });

    if (hasChanges) {
      prevLevels.current = [...strandProgress];
      setTransitionState(prev => prev + 1);
    }
  }, [strandProgress]);

  const getProgressPercent = (level: number) => {
    const safeLeval = Math.min(Math.max(level || 0, 0), 8);
    return Math.floor((safeLeval / 8) * 100);
  };

  const getProgressColor = (level: number) => {
    if (level >= 8) return 'from-yellow-400 to-yellow-500'; // Gold for perfect
    if (level >= 6) return 'from-green-400 to-green-500';   // Green for strong
    if (level >= 4) return 'from-blue-400 to-blue-500';     // Blue for good
    if (level >= 2) return 'from-purple-400 to-purple-500'; // Purple for basic
    return 'from-gray-300 to-gray-400';                     // Gray for minimal
  };

  const withViewTransition = (fn: () => void) => {
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(fn);
    } else {
      fn();
    }
  };

  // Calculate overall progress
  const totalProgress = strandProgress.reduce((sum, level) => sum + (level || 0), 0);
  const maxProgress = 32; // 4 strands × 8 levels each
  const overallPercent = Math.round((totalProgress / maxProgress) * 100);

  return (
    <div className="progress-bar-section p-4 border rounded-md shadow-sm bg-white">
      {/* Header with overall progress */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-semibold text-lg text-purple-800">Knowledge Progress</h2>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>Overall: {totalProgress}/{maxProgress}</span>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <span className="font-medium">{overallPercent}%</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Learning Path:</p>
          <p className="font-medium text-purple-700">{experimentTitle || 'Not selected'}</p>
        </div>
      </div>

      {/* Individual strand progress */}
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-purple-300">
        {strands.map((strand, idx) => {
          const level = strandProgress[idx] || 0;
          const percent = getProgressPercent(level);
          const isCurrentStrand = currentStrand - 1 === idx;
          const isLevel8 = level === 8;
          
          return (
            <div
              key={idx}
              onClick={() => withViewTransition(() => setCurrentStrand(idx + 1))}
              className={`min-w-[280px] flex-shrink-0 cursor-pointer border-2 rounded-lg p-4 transition-all transform hover:scale-[1.02] ${
                isCurrentStrand 
                  ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200 shadow-md' 
                  : 'bg-white border-gray-200 hover:border-purple-300 shadow-sm'
              } ${isLevel8 ? 'glow-border-purple' : ''}`}
            >
              {/* Strand header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{strand}</p>
                  <p className="text-xs text-gray-500 mt-1">Strand {idx + 1}</p>
                </div>
                <div className="text-right ml-2">
                  <div className="text-lg font-bold text-purple-600">{level}/8</div>
                  <div className="text-xs text-gray-500">{percent}%</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="bg-gray-200 h-3 w-full rounded-full overflow-hidden">
                  <motion.div
                    className={`bg-gradient-to-r ${getProgressColor(level)} h-full rounded-full`}
                    key={`${transitionState}-${idx}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Level indicators */}
              <div className="flex justify-between text-xs">
                <span className={`transition-colors ${level >= 2 ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                  Basic
                </span>
                <span className={`transition-colors ${level >= 4 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  Good
                </span>
                <span className={`transition-colors ${level >= 6 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                  Strong
                </span>
                <span className={`transition-colors ${level >= 8 ? 'text-yellow-600 font-bold' : 'text-gray-400'}`}>
                  Perfect
                </span>
              </div>

              {/* Achievement indicator */}
              {isLevel8 && (
                <div className="mt-2 text-center">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    🏆 Mastered!
                  </span>
                </div>
              )}

              {/* Current strand indicator */}
              {isCurrentStrand && (
                <div className="mt-2 text-center">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    📍 Current
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Badge section */}
      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-sm text-gray-700 flex items-center">
          🎖️ Achievement Badges
          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
            {Object.values(earnedBadges).filter(Boolean).length}/4 Earned
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'principlePioneer', label: 'Principle Pioneer', icon: '🔬', strand: 1 },
            { key: 'conceptCrusader', label: 'Concept Crusader', icon: '🧠', strand: 2 },
            { key: 'applicationAce', label: 'Application Ace', icon: '⚡', strand: 3 },
            { key: 'analysisArchitect', label: 'Analysis Architect', icon: '📊', strand: 4 }
          ].map((badge) => {
            const isEarned = earnedBadges[badge.key as keyof typeof earnedBadges];
            const strandLevel = strandProgress[badge.strand - 1] || 0;
            const isClose = strandLevel >= 6 && !isEarned;
            
            return (
              <div
                key={badge.key}
                className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                  isEarned
                    ? 'bg-purple-50 border-purple-400 text-purple-800 shadow-sm'
                    : isClose
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="font-semibold text-xs">{badge.label}</div>
                <div className="text-xs mt-1">
                  {isEarned ? (
                    <span className="text-green-600 font-bold">✅ Earned!</span>
                  ) : isClose ? (
                    <span className="text-yellow-600">🔥 Almost there!</span>
                  ) : (
                    <span className="text-gray-500">Level {strandLevel}/8</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Development debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <div className="font-bold mb-1">🔧 DEBUG INFO:</div>
          <div>Progress Array: [{strandProgress.map(p => p || 0).join(', ')}]</div>
          <div>Current Strand: {currentStrand}</div>
          <div>Total Progress: {totalProgress}/{maxProgress} ({overallPercent}%)</div>
          <div>Transition State: {transitionState}</div>
          <div>Badges: {JSON.stringify(earnedBadges)}</div>
        </div>
      )}
    </div>
  );
};

export default ProgressBarSection;