// src/components/questions/QuestionBlock/components/LockedBlockDisplay.tsx
// 🔒 LOCKED BLOCK DISPLAY - Extracted UI Component (35 LOC → Standalone)

import React from 'react';
import { motion } from 'framer-motion';
import { QuestionBlock } from '../types/questionBlock';

interface LockedBlockDisplayProps {
  block: QuestionBlock;
  getLevelColor: (level: number) => string;
  getLevelBorderColor: (level: number) => string;
}

export const LockedBlockDisplay: React.FC<LockedBlockDisplayProps> = ({
  block,
  getLevelColor,
  getLevelBorderColor
}) => {
  return (
    <motion.div
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 0.5, scale: 0.95 }}
      whileHover={{ scale: 0.97, opacity: 0.6 }}
      className="relative"
    >
      <div className={`p-6 rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} opacity-50 border-2 ${getLevelBorderColor(block.level)} border-dashed`}>
        {/* Lock Icon */}
        <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow-md">
          <svg 
            className="w-5 h-5 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>

        {/* Level Header */}
        <div className="text-white/90 mb-3">
          <h3 className="text-lg font-bold">Level {block.level} Questions</h3>
          <p className="text-sm text-white/70">
            {block.totalQuestions} questions available
          </p>
        </div>

        {/* Lock Message */}
        <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/90 font-medium">🔒 Locked</span>
          </div>
          <p className="text-white/80 text-sm">
            Complete Level {block.level - 2} to unlock this challenge
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 flex items-center gap-2 text-white/70 text-xs">
          <div className="w-3 h-3 border-2 border-white/50 rounded-full"></div>
          <span>Requires previous level completion</span>
        </div>
      </div>
    </motion.div>
  );
};