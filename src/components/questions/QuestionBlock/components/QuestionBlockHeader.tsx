// src/components/questions/QuestionBlock/components/QuestionBlockHeader.tsx
// 🎯 QUESTION BLOCK HEADER - Extracted UI Component (60 LOC → Standalone)

import React from 'react';
import { motion } from 'framer-motion';
import { QuestionBlock } from '../types/questionBlock';
import { QuestionResponse } from '../types/questionBlock';

interface QuestionBlockHeaderProps {
  block: QuestionBlock;
  currentQuestionIndex: number;
  responses: QuestionResponse[];
  startTime: Date | null;
  renderingMode: 'individual' | 'universal' | 'error';
  syncStatus?: 'idle' | 'saving' | 'success' | 'error';
  experimentChoice?: string;
  getCurrentAverageScore: () => number;
  getCompletionRate: () => number;
  onModeToggle?: () => void;
  enableDevControls?: boolean;
}

export const QuestionBlockHeader: React.FC<QuestionBlockHeaderProps> = ({
  block,
  currentQuestionIndex,
  responses,
  startTime,
  renderingMode,
  syncStatus = 'idle',
  experimentChoice,
  getCurrentAverageScore,
  getCompletionRate,
  onModeToggle,
  enableDevControls = false
}) => {
  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'saving': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '💾';
    }
  };

  const getSyncText = () => {
    switch (syncStatus) {
      case 'saving': return 'Saving...';
      case 'success': return 'Synced';
      case 'error': return 'Sync Error';
      default: return 'Auto-sync';
    }
  };

  const elapsedTime = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0;

  return (
    <div className="p-6 pb-4">
      {/* Main Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Level {block.level} Questions
              {/* Rendering Mode Badge */}
              <span className={`text-xs px-2 py-1 rounded-full text-white/90 ${
                renderingMode === 'universal' ? 'bg-green-400/30' :
                renderingMode === 'individual' ? 'bg-blue-400/30' :
                'bg-red-400/30'
              }`}>
                {renderingMode === 'universal' ? '✨ Enhanced' :
                 renderingMode === 'individual' ? '⚡ Individual' :
                 '🔧 Error Mode'}
              </span>
            </h2>
            <div className="text-white/70 text-sm">
              Level {block.level} Challenge • {experimentChoice || 'Interactive Learning'}
            </div>
          </div>
        </div>

        {/* Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Sync Status */}
          <div className="flex items-center gap-1 text-white/80 text-sm">
            <span>{getSyncIcon()}</span>
            <span className="hidden sm:inline">{getSyncText()}</span>
          </div>

          {/* Dev Mode Toggle */}
          {enableDevControls && onModeToggle && (
            <button
              onClick={onModeToggle}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition backdrop-blur-sm"
              title="Toggle rendering mode (dev only)"
            >
              🔄 Mode
            </button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        {/* Question Progress */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/90 text-sm font-medium">
            Question {currentQuestionIndex + 1} of {block.questions.length}
          </span>
          <span className="text-white/70 text-sm">
            {Math.round(getCompletionRate())}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / block.questions.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-white/60 rounded-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Current Score */}
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm text-center">
          <div className="text-white text-sm font-bold">
            {getCurrentAverageScore().toFixed(1)}
          </div>
          <div className="text-white/70 text-xs">Avg Score</div>
        </div>

        {/* Completed Questions */}
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm text-center">
          <div className="text-white text-sm font-bold">
            {responses.filter(r => r).length}/{block.questions.length}
          </div>
          <div className="text-white/70 text-xs">Answered</div>
        </div>

        {/* Time Elapsed */}
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm text-center">
          <div className="text-white text-sm font-bold">
            {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-white/70 text-xs">Time</div>
        </div>
      </div>

      {/* Achievement Preview */}
      {getCurrentAverageScore() > 0 && (
        <div className="mt-3 text-center">
          <div className="text-white/60 text-xs">
            {getCurrentAverageScore() >= 7 ? '🏆 Excellent performance!' :
             getCurrentAverageScore() >= 6 ? '🎯 On track to unlock next level' :
             getCurrentAverageScore() >= 4 ? '📈 Good progress, keep going!' :
             '💪 Practice makes perfect!'}
          </div>
        </div>
      )}
    </div>
  );
};