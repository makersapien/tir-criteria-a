// src/components/YourResponse/LevelSelection/LevelCard.tsx
// 🎯 DUAL MODE LEVEL CARD - Compact & Normal versions

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
  isCompact?: boolean; // ✅ NEW: Compact mode prop
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  colors,
  isCompleted,
  validQuestions,
  totalQuestions,
  enableEnhancedValidation = false,
  onClick,
  isCompact = false // ✅ NEW: Default to normal mode
}) => {
  // ✅ Enhanced icon system for levels
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

  // ✅ Enhanced status text
  const getStatusText = () => {
    if (isCompleted) return 'Completed ✓';
    if (validQuestions > 0) return `${validQuestions} question${validQuestions !== 1 ? 's' : ''}`;
    return 'No questions';
  };

  // ✅ Get level name for better UX
  const getLevelName = () => {
    const names = {
      2: 'Foundation',
      4: 'Application', 
      6: 'Analysis',
      8: 'Mastery'
    };
    return names[level];
  };

  // ✅ SUPER COMPACT VERSION (50% height reduction)
  if (isCompact) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative px-3 py-2 rounded-lg border-2 font-bold transition-all duration-300 text-left
          ${isCompleted ? colors.completed : `${colors.base} ${colors.hover}`}
          ${validQuestions === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-md hover:shadow-lg'}
        `}
        disabled={validQuestions === 0}
      >
        {/* Compact horizontal layout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-lg font-extrabold">Level {level}</div>
            <div className="text-xs opacity-90 font-medium">
              {getLevelName()}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs opacity-95 font-medium">
              {getStatusText()}
            </div>
            <div className="text-xl">
              {getLevelIcon()}
            </div>
          </div>
        </div>
        
        {/* Compact validation indicator */}
        {enableEnhancedValidation && validQuestions !== totalQuestions && totalQuestions > 0 && (
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white shadow-sm" 
            title={`${totalQuestions - validQuestions} questions filtered`}
          />
        )}
        
        {/* Compact completion indicator */}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border border-white shadow-sm flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-800">✓</span>
          </div>
        )}
        
        {/* Compact disabled overlay */}
        {validQuestions === 0 && (
          <div className="absolute inset-0 bg-gray-600 bg-opacity-60 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">No Questions</span>
          </div>
        )}
      </motion.button>
    );
  }

  // ✅ NORMAL (EXPANDED) VERSION - Current design
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative p-4 rounded-xl border-2 font-bold transition-all duration-300 text-left
        ${isCompleted ? colors.completed : `${colors.base} ${colors.hover}`}
        ${validQuestions === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-xl'}
      `}
      disabled={validQuestions === 0}
    >
      {/* Enhanced layout with better typography */}
      <div className="flex items-center justify-between mb-3">
        {/* Left side - Enhanced level info */}
        <div className="text-left flex-1">
          <div className="text-xl font-extrabold leading-tight">Level {level}</div>
          <div className="text-xs opacity-90 font-semibold mt-0.5">
            {getLevelName()}
          </div>
        </div>
        
        {/* Right side - Enhanced icon */}
        <div className="text-3xl ml-2">
          {getLevelIcon()}
        </div>
      </div>
      
      {/* Enhanced status information */}
      <div className="text-sm opacity-95 font-medium">
        {getStatusText()}
      </div>
      
      {/* Enhanced validation indicator */}
      {enableEnhancedValidation && validQuestions !== totalQuestions && totalQuestions > 0 && (
        <div 
          className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-md flex items-center justify-center" 
          title={`${totalQuestions - validQuestions} questions filtered`}
        >
          <span className="text-xs font-bold text-yellow-800">!</span>
        </div>
      )}
      
      {/* Enhanced completion indicator */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-md flex items-center justify-center">
          <span className="text-sm font-bold text-yellow-800">✓</span>
        </div>
      )}
      
      {/* Enhanced disabled overlay */}
      {validQuestions === 0 && (
        <div className="absolute inset-0 bg-gray-600 bg-opacity-60 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-sm font-bold mb-1">No Questions</div>
            <div className="text-white text-xs opacity-90">Available Soon</div>
          </div>
        </div>
      )}
      
      {/* Enhanced hover effect overlay */}
      {validQuestions > 0 && !isCompleted && (
        <div className="absolute inset-0 bg-white bg-opacity-0 hover:bg-opacity-10 rounded-xl transition-all duration-300 pointer-events-none" />
      )}
    </motion.button>
  );
};

export default LevelCard;