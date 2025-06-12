// src/components/questions/QuestionBlock/components/CompletionScreen.tsx
// 🎉 COMPLETION SCREEN - Extracted UI Component (80 LOC → Standalone)

import React from 'react';
import { motion } from 'framer-motion';
import { QuestionBlock } from '../types/questionBlock';
import { QuestionResponse } from '../types/questionBlock';

interface CompletionScreenProps {
  block: QuestionBlock;
  responses: QuestionResponse[];
  startTime: Date | null;
  renderingMode: 'individual' | 'universal' | 'error';
  getLevelColor: (level: number) => string;
  getLevelBorderColor: (level: number) => string;
  getScoreColor: (score: number) => string;
  onReset?: () => void;
  onNext?: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  block,
  responses,
  startTime,
  renderingMode,
  getLevelColor,
  getLevelBorderColor,
  getScoreColor,
  onReset,
  onNext
}) => {
  // Calculate completion stats
  const averageScore = responses.reduce((sum, r) => sum + (r?.score || 0), 0) / responses.length;
  const correctCount = responses.filter(r => r?.isCorrect).length;
  const totalTime = startTime ? (new Date().getTime() - startTime.getTime()) / 1000 : 0;
  const totalQuestions = responses.length;

  // Performance tier
  const getPerformanceTier = (score: number) => {
    if (score >= 7) return { tier: 'Excellent', emoji: '🏆', color: 'text-yellow-600' };
    if (score >= 5) return { tier: 'Good', emoji: '🎯', color: 'text-blue-600' };
    if (score >= 3) return { tier: 'Fair', emoji: '📈', color: 'text-green-600' };
    return { tier: 'Needs Practice', emoji: '💪', color: 'text-orange-600' };
  };

  const performance = getPerformanceTier(averageScore);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`p-6 rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} text-white border-2 ${getLevelBorderColor(block.level)}`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎉</span>
          <div>
            <h3 className="text-xl font-bold">Level {block.level} Completed!</h3>
            <p className="text-white/80 text-sm">Great work on finishing this level</p>
            
            {/* Rendering Mode Indicator */}
            <p className="text-white/60 text-xs mt-1">
              {renderingMode === 'universal' ? '✨ Enhanced renderer' : 
               renderingMode === 'individual' ? '⚡ Individual components' : 
               '🔧 Error recovery mode'}
            </p>
          </div>
        </div>
        
        {/* Performance Badge */}
        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm text-center">
          <div className="text-2xl mb-1">{performance.emoji}</div>
          <div className="text-white text-sm font-medium">{performance.tier}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Score */}
        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm text-center">
          <div className={`text-lg font-bold ${getScoreColor(averageScore)}`}>
            {averageScore.toFixed(1)}
          </div>
          <div className="text-white/80 text-xs">Average Score</div>
        </div>

        {/* Accuracy */}
        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm text-center">
          <div className="text-lg font-bold text-white">
            {Math.round((correctCount / totalQuestions) * 100)}%
          </div>
          <div className="text-white/80 text-xs">Accuracy</div>
        </div>

        {/* Questions */}
        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm text-center">
          <div className="text-lg font-bold text-white">
            {correctCount}/{totalQuestions}
          </div>
          <div className="text-white/80 text-xs">Correct</div>
        </div>

        {/* Time */}
        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm text-center">
          <div className="text-lg font-bold text-white">
            {Math.round(totalTime)}s
          </div>
          <div className="text-white/80 text-xs">Total Time</div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="mb-6">
        <div className="flex justify-between text-white/80 text-sm mb-2">
          <span>Question Progress</span>
          <span>{totalQuestions}/{totalQuestions} Complete</span>
        </div>
        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-white/60 rounded-full"
          />
        </div>
      </div>

      {/* Achievement Message */}
      <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm mb-6">
        <div className="text-center">
          <div className="text-lg font-medium text-white mb-2">
            {averageScore >= 7 ? '🌟 Outstanding Achievement!' :
             averageScore >= 5 ? '🎯 Great Progress Made!' :
             averageScore >= 3 ? '📈 Good Effort!' :
             '💪 Keep Practicing!'}
          </div>
          <p className="text-white/80 text-sm">
            {averageScore >= 6 ? 
              'You\'ve unlocked the next level! Continue your learning journey.' :
              'Try again to improve your score and unlock the next level.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {onReset && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm text-sm font-medium"
          >
            🔄 Try Again
          </motion.button>
        )}
        
        {onNext && averageScore >= 6 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-colors text-sm font-medium"
          >
            ➡️ Next Level
          </motion.button>
        )}
      </div>

      {/* Level Progression Hint */}
      <div className="mt-4 text-center">
        <p className="text-white/60 text-xs">
          {averageScore >= 6 ? 
            `🎉 Level ${block.level + 2} is now available!` :
            `Score ≥ 6 to unlock Level ${block.level + 2}`}
        </p>
      </div>
    </motion.div>
  );
};