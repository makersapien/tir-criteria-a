// src/components/YourResponse/LevelSelection/LevelCard.tsx
// 🎯 FULLY PATCHED: Added isActive support for level tracking

import React from 'react';
import { motion } from 'framer-motion';

interface LevelCardProps {
  level: 2 | 4 | 6 | 8;
  colors: {
    base: string;
    hover: string;
    completed: string;
    active?: string; // ✅ ADDED: Optional active state styling
  };
  isCompleted: boolean;
  isActive?: boolean; // ✅ ADDED: Active state prop
  validQuestions: number;
  totalQuestions: number;
  enableEnhancedValidation?: boolean;
  onClick: () => void;
  isCompact?: boolean;
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  colors,
  isCompleted,
  isActive = false, // ✅ ADDED: Default to false
  validQuestions,
  totalQuestions,
  enableEnhancedValidation = false,
  onClick,
  isCompact = false
}) => {
  // ✅ Enhanced icon system for levels
  const getLevelIcon = () => {
    if (isCompleted) return '🏆';
    if (isActive) return '⚡'; // ✅ ADDED: Special icon for active level
    
    const icons = {
      2: '🟢', // Green circle for basic
      4: '🔵', // Blue circle for intermediate  
      6: '🟣', // Purple circle for advanced
      8: '🔴'  // Red circle for expert
    };
    
    return icons[level];
  };

  // ✅ Enhanced status text with active state
  const getStatusText = () => {
    if (isActive) return 'Currently Active'; // ✅ ADDED: Active status
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

  // ✅ ENHANCED: Dynamic styling based on state
  const getCardStyling = () => {
    if (validQuestions === 0) {
      return 'opacity-50 cursor-not-allowed';
    }
    
    if (isActive) {
      return `${colors.base} ${colors.hover} shadow-xl border-4 transform scale-105`; // ✅ ADDED: Active styling
    }
    
    if (isCompleted) {
      return `${colors.completed} shadow-lg`;
    }
    
    return `${colors.base} ${colors.hover} cursor-pointer shadow-md hover:shadow-lg`;
  };

  // ✅ SUPER COMPACT VERSION with active state support
  if (isCompact) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: isActive ? 1.03 : 1.02 }} // ✅ Enhanced hover for active
        whileTap={{ scale: 0.98 }}
        className={`
          relative px-3 py-2 rounded-lg border-2 font-bold transition-all duration-300 text-left
          ${getCardStyling()}
        `}
        disabled={validQuestions === 0}
      >
        {/* Compact horizontal layout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`text-lg font-extrabold ${isActive ? 'animate-pulse' : ''}`}>
              Level {level}
            </div>
            <div className="text-xs opacity-90 font-medium">
              {getLevelName()}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`text-xs opacity-95 font-medium ${isActive ? 'text-yellow-200' : ''}`}>
              {getStatusText()}
            </div>
            <div className={`text-xl ${isActive ? 'animate-bounce' : ''}`}>
              {getLevelIcon()}
            </div>
          </div>
        </div>
        
        {/* ✅ ENHANCED: Active level indicator */}
        {isActive && (
          <div className="absolute inset-0 bg-yellow-300 bg-opacity-20 rounded-lg pointer-events-none animate-pulse" />
        )}
        
        {/* Compact validation indicator */}
        {enableEnhancedValidation && validQuestions !== totalQuestions && totalQuestions > 0 && (
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white shadow-sm" 
            title={`${totalQuestions - validQuestions} questions filtered`}
          />
        )}
        
        {/* Compact completion indicator */}
        {isCompleted && !isActive && (
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

  // ✅ NORMAL (EXPANDED) VERSION with enhanced active state
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: isActive ? 1.05 : 1.03, y: -2 }} // ✅ Enhanced hover for active
      whileTap={{ scale: 0.97 }}
      className={`
        relative p-4 rounded-xl border-2 font-bold transition-all duration-300 text-left
        ${getCardStyling()}
      `}
      disabled={validQuestions === 0}
    >
      {/* ✅ ENHANCED: Active level glow effect */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-xl pointer-events-none animate-pulse" />
      )}
      
      {/* Enhanced layout with better typography */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          {/* Left side - Enhanced level info */}
          <div className="text-left flex-1">
            <div className={`text-xl font-extrabold leading-tight ${isActive ? 'animate-pulse' : ''}`}>
              Level {level}
            </div>
            <div className={`text-xs opacity-90 font-semibold mt-0.5 ${isActive ? 'text-yellow-200' : ''}`}>
              {getLevelName()}
            </div>
          </div>
          
          {/* Right side - Enhanced icon */}
          <div className={`text-3xl ml-2 ${isActive ? 'animate-bounce' : ''}`}>
            {getLevelIcon()}
          </div>
        </div>
        
        {/* Enhanced status information */}
        <div className={`text-sm opacity-95 font-medium ${isActive ? 'text-yellow-200' : ''}`}>
          {getStatusText()}
        </div>
        
        {/* ✅ ADDED: Active level badge */}
        {isActive && (
          <div className="mt-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold inline-block">
            ⚡ In Progress
          </div>
        )}
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
      
      {/* Enhanced completion indicator - only show if not active */}
      {isCompleted && !isActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-md flex items-center justify-center">
          <span className="text-sm font-bold text-yellow-800">✓</span>
        </div>
      )}
      
      {/* ✅ ENHANCED: Active level indicator - priority over completion */}
      {isActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full border-2 border-white shadow-md flex items-center justify-center animate-pulse">
          <span className="text-sm font-bold text-orange-900">⚡</span>
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
      
      {/* Enhanced hover effect overlay - different for active */}
      {validQuestions > 0 && !isCompleted && (
        <div className={`absolute inset-0 ${isActive ? 'bg-yellow-300' : 'bg-white'} bg-opacity-0 hover:bg-opacity-10 rounded-xl transition-all duration-300 pointer-events-none`} />
      )}
    </motion.button>
  );
};

export default LevelCard;