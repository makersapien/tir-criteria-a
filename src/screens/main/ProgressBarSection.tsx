// ===== WORLD-CLASS UI: Compact & Clean ProgressBarSection =====
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
  const [isCompactView, setIsCompactView] = useState(false);

  // Enhanced progress change detection with celebrations
  useEffect(() => {
    let hasChanges = false;
    
    strandProgress.forEach((level, idx) => {
      const prev = prevLevels.current[idx] || 0;
      const current = level || 0;
      
      if (current > prev) {
        hasChanges = true;
        
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
    const safeLevel = Math.min(Math.max(level || 0, 0), 8);
    return Math.floor((safeLevel / 8) * 100);
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

  // Toggle between compact and expanded view
  const toggleView = () => {
    setIsCompactView(!isCompactView);
  };

  return (
    <div className="progress-bar-section bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* 🎯 HEADER WITH TOGGLE */}
      <div className="px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold text-sm text-purple-800">Knowledge Progress</h2>
              <p className="text-xs text-gray-500">{experimentTitle || 'Critical Angles - Total Internal Reflection'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 🎯 COMPACT OVERALL PROGRESS */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">{totalProgress}/{maxProgress}</span>
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-purple-700">{overallPercent}%</span>
            </div>
            
            {/* 🎯 VIEW TOGGLE BUTTON */}
            <button
              onClick={toggleView}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-purple-200 hover:border-purple-300 rounded-md transition-all hover:shadow-sm"
              title={isCompactView ? "Switch to expanded view" : "Switch to compact view"}
            >
              {isCompactView ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Expand
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Compact
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🎯 SUPER NARROW VIEW */}
      {isCompactView && (
        <div className="px-4 py-2">
          {/* Ultra-compact strand indicators */}
          <div className="flex gap-2 items-center">
            {strands.map((strand, idx) => {
              const level = strandProgress[idx] || 0;
              const percent = getProgressPercent(level);
              const isCurrentStrand = currentStrand - 1 === idx;
              const isLevel8 = level === 8;
              
              return (
                <div
                  key={idx}
                  onClick={() => withViewTransition(() => setCurrentStrand(idx + 1))}
                  className={`flex-1 cursor-pointer group`}
                >
                  {/* Strand name with current indicator */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium transition-colors ${
                      isCurrentStrand ? 'text-purple-700' : 'text-gray-600'
                    }`}>
                      S{idx + 1}
                      {isCurrentStrand && <span className="ml-1 text-purple-500">●</span>}
                    </span>
                    <span className={`text-xs font-bold ${
                      isLevel8 ? 'text-yellow-600' : 
                      level >= 6 ? 'text-green-600' : 
                      level >= 4 ? 'text-blue-600' : 
                      level >= 2 ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                      {level}
                    </span>
                  </div>
                  
                  {/* Ultra-slim progress bar */}
                  <div className={`bg-gray-200 h-1 w-full rounded-full overflow-hidden border ${
                    isCurrentStrand ? 'border-purple-300' : 'border-transparent'
                  }`}>
                    <motion.div
                      className={`bg-gradient-to-r ${getProgressColor(level)} h-1 rounded-full`}
                      key={`${transitionState}-${idx}-compact`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Compact badges row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex gap-1">
              {[
                { key: 'principlePioneer', icon: '🔬', strand: 1 },
                { key: 'conceptCrusader', icon: '🧠', strand: 2 },
                { key: 'applicationAce', icon: '⚡', strand: 3 },
                { key: 'analysisArchitect', icon: '📊', strand: 4 }
              ].map((badge) => {
                const isEarned = earnedBadges[badge.key as keyof typeof earnedBadges];
                
                return (
                  <span
                    key={badge.key}
                    className={`text-sm transition-all ${
                      isEarned ? 'grayscale-0 opacity-100' : 'grayscale opacity-40'
                    }`}
                    title={badge.key}
                  >
                    {badge.icon}
                  </span>
                );
              })}
            </div>
            
            <span className="text-xs text-gray-500">
              {Object.values(earnedBadges).filter(Boolean).length}/4 badges
            </span>
          </div>
        </div>
      )}

      {/* 🎯 EXPANDED VIEW - Original detailed view */}
      {!isCompactView && (
        <div className="p-3">
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-purple-300">
            {strands.map((strand, idx) => {
              const level = strandProgress[idx] || 0;
              const percent = getProgressPercent(level);
              const isCurrentStrand = currentStrand - 1 === idx;
              const isLevel8 = level === 8;
              
              return (
                <div
                  key={idx}
                  onClick={() => withViewTransition(() => setCurrentStrand(idx + 1))}
                  className={`min-w-[220px] flex-shrink-0 cursor-pointer border rounded-lg p-3 transition-all transform hover:scale-[1.01] ${
                    isCurrentStrand 
                      ? 'bg-purple-50 border-purple-400 ring-1 ring-purple-200 shadow-sm' 
                      : 'bg-white border-gray-200 hover:border-purple-300'
                  } ${isLevel8 ? 'ring-1 ring-yellow-300 bg-yellow-50' : ''}`}
                >
                  {/* Compact strand header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-xs leading-tight">{strand}</p>
                      <p className="text-xs text-gray-500">Strand {idx + 1}</p>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-bold text-purple-600">{level}/8</div>
                    </div>
                  </div>

                  {/* Slim progress bar */}
                  <div className="mb-2">
                    <div className="bg-gray-200 h-1.5 w-full rounded-full overflow-hidden">
                      <motion.div
                        className={`bg-gradient-to-r ${getProgressColor(level)} h-1.5 rounded-full`}
                        key={`${transitionState}-${idx}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Compact level indicators */}
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

                  {/* Compact achievement indicators */}
                  <div className="mt-2 flex justify-center gap-1">
                    {isLevel8 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                        🏆 Mastered
                      </span>
                    )}
                    {isCurrentStrand && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        📍 Current
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🎯 COMPACT BADGE SECTION - Significantly reduced vertical space */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-xs text-gray-700 flex items-center gap-1">
                🎖️ Achievement Badges
              </h3>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                {Object.values(earnedBadges).filter(Boolean).length}/4
              </span>
            </div>
            
            {/* Horizontal compact badges */}
            <div className="flex gap-2 overflow-x-auto pb-1">
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
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                      isEarned
                        ? 'bg-purple-50 border-purple-300 text-purple-800'
                        : isClose
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    <span className="text-sm">{badge.icon}</span>
                    <span className="font-medium whitespace-nowrap">{badge.label}</span>
                    {isEarned ? (
                      <span className="text-green-600 font-bold">✅</span>
                    ) : isClose ? (
                      <span className="text-yellow-600">🔥</span>
                    ) : (
                      <span className="text-gray-400">{strandLevel}/8</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🎯 DEBUG INFO - Only in development, completely hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2 mx-4 mb-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            🔧 Developer Debug Info
          </summary>
          <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
            <div>Progress: [{strandProgress.map(p => p || 0).join(', ')}]</div>
            <div>Current: {currentStrand} | Total: {totalProgress}/{maxProgress}</div>
            <div>Badges: {Object.values(earnedBadges).filter(Boolean).length}/4</div>
          </div>
        </details>
      )}
    </div>
  );
};

export default ProgressBarSection;