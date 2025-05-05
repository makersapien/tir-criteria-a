// src/components/ProgressBarSection.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface ProgressBarSectionProps {
  userInputs: any;
  currentStrand: number;
  strandProgress: number[];
  setCurrentStrand: (strand: number) => void;
  earnedBadges: {
    dataDynamo: boolean;
    aceAnalyzer: boolean;
    hypothesisHero: boolean;
    methodMaster: boolean;
    innovationInnovator: boolean;
  };
  experimentTitle: string;
}

const strands = [
  'Data Collection & Presentation',
  'Data Analysis',
  'Hypothesis Evaluation',
  'Methodology Evaluation',
  'Suggestion & Improvement'
];

const ProgressBarSection: React.FC<ProgressBarSectionProps> = ({
  userInputs,
  currentStrand,
  strandProgress,
  setCurrentStrand,
  earnedBadges,
  experimentTitle,
}) => {
  const prevLevels = useRef<number[]>([0, 0, 0, 0, 0]);
  const [transitionState, setTransitionState] = useState(0);

  useEffect(() => {
    strandProgress.forEach((level, idx) => {
      const prev = prevLevels.current[idx];
      if (level > prev) {
        if (level >= 7) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        } else {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
      }
    });

    prevLevels.current = [...strandProgress];
    setTransitionState((prev) => prev + 1);
  }, [strandProgress]);

  const getProgressPercent = (level: number) => {
    const capped = Math.min(level, 8);
    return Math.floor((capped / 8) * 100);
  };

  const withViewTransition = (fn: () => void) => {
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(fn);
    } else {
      fn();
    }
  };

  return (
    <div className="progress-bar-section p-4 border rounded-md shadow-sm">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-lg">Lab Report Progress</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Experiment:</p>
          <p className="font-medium">{experimentTitle || 'Not selected'}</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-blue-300">
        {strands.map((strand, idx) => {
          const percent = getProgressPercent(strandProgress[idx]);
          const level = strandProgress[idx] || 0;

          const isLevel8 = level === 8;
          const glowingClass = isLevel8 ? 'glow-border' : '';

          return (
            <div
              key={idx}
              onClick={() => withViewTransition(() => setCurrentStrand(idx + 1))}
              className={`min-w-[250px] flex-shrink-0 cursor-pointer border rounded-lg p-3 transition transform hover:scale-[1.02] ${
                currentStrand - 1 === idx ? 'bg-blue-50 border-blue-400' : 'bg-white'
              } ${glowingClass}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div>
                  <p className="font-medium">{strand}</p>
                  <p className="text-xs text-gray-500">Level {level}</p>
                </div>
                <p className="text-sm text-gray-600">{percent}%</p>
              </div>

              <div className="bg-gray-200 h-3 w-full rounded-full overflow-hidden">
                <motion.div
                  className="bg-blue-600 h-full rounded-full"
                  key={`${transitionState}-${idx}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="mt-6 mb-2 font-semibold text-sm text-gray-700">🎖️ Badges Earned</h3>
      <div className="flex overflow-x-auto gap-3 pb-1">
        {[
          { key: 'dataDynamo', label: 'Data Dynamo', icon: '📊' },
          { key: 'aceAnalyzer', label: 'Ace Analyzer', icon: '🧠' },
          { key: 'hypothesisHero', label: 'Hypothesis Hero', icon: '🎯' },
          { key: 'methodMaster', label: 'Method Master', icon: '🧪' },
          { key: 'innovationInnovator', label: 'Innovation Innovator', icon: '💡' }
        ].map((badge) => (
          <div
            key={badge.key}
            className={`min-w-[140px] flex-shrink-0 border rounded-lg p-2 text-center text-xs md:text-sm font-medium transition ${
              earnedBadges[badge.key]
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <div className="text-lg md:text-xl mb-1">{badge.icon}</div>
            {badge.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBarSection;
