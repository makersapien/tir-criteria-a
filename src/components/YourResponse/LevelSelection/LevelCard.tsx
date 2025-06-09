// src/components/YourResponse/LevelSelection/LevelCard.tsx
// 🎯 INDIVIDUAL LEVEL CARD - Compact, colorful level button

import React from 'react';
import { motion } from 'framer-motion';

interface LevelCardProps {
  level: 2 | 4 | 6 | 8;
  colors: {
    base: string;
    hover: string;
    completed: string;
  };
  isCompleted: boolean;
  validQuestions: number;
  totalQuestions: number;
  enableEnhancedValidation?: boolean;
  onClick: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  colors,
  isCompleted,
  validQuestions,
  totalQuestions,
  enableEnhancedValidation = false,
  onClick
}) => {
  // ✅ Get appropriate icon for level
  const getLevelIcon = () => {
    if (isCompleted) return '🏆';
    
    const icons = {
      2: '🟢', // Green circle for basic
      4: '🔵', // Blue circle for intermediate  
      6: '🟣', // Purple circle for advanced
      8: '🔴'  // Red circle for expert
    };
    
    return icons[level];
  };

  // ✅ Get status text
  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (validQuestions > 0) return `${validQuestions} questions`;
    return 'No questions';
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-3 rounded-lg border-2 font-bold transition-all duration-300
        ${isCompleted ? colors.completed : `${colors.base} ${colors.hover}`}
      `}
      disabled={validQuestions === 0}
    >
      {/* ✅ Compact content - much shorter than before */}
      <div className="flex items-center justify-between">
        {/* ✅ Left side - Level info */}
        <div className="text-left">
          <div className="text-lg font-bold">Level {level}</div>
          <div className="text-xs opacity-90">
            {getStatusText()}
          </div>
        </div>
        
        {/* ✅ Right side - Icon */}
        <div className="text-2xl">
          {getLevelIcon()}
        </div>
      </div>
      
      {/* ✅ Validation indicator (small dot) */}
      {enableEnhancedValidation && validQuestions !== totalQuestions && totalQuestions > 0 && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" 
          title={`${totalQuestions - validQuestions} questions filtered`}
        />
      )}
      
      {/* ✅ Disabled overlay for empty questions */}
      {validQuestions === 0 && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">No Questions</span>
        </div>
      )}
    </motion.button>
  );
};

export default LevelCard;