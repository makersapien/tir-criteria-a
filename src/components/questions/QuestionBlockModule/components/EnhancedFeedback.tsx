// src/components/questions/QuestionBlock/components/EnhancedFeedback.tsx
// 💬 ENHANCED FEEDBACK - Extracted UI Component (120 LOC → Standalone)

import React from 'react';
import { motion } from 'framer-motion';
import { Question, QuestionResponse } from '../types/questionBlock';

interface EnhancedFeedbackProps {
  currentResponse: QuestionResponse | null;
  currentQuestion: Question;
  showFeedback: boolean;
  isLastQuestion: boolean;  // ✅ Should be boolean, not function
  onContinue: () => void;
  disabled?: boolean;
}

export const EnhancedFeedback: React.FC<EnhancedFeedbackProps> = ({
  currentResponse,
  currentQuestion,
  showFeedback,
  isLastQuestion,
  onContinue,
  disabled = false
}) => {
  // Don't render if no feedback to show
  if (!showFeedback || !currentResponse) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = (score: number, isCorrect: boolean) => {
    if (isCorrect) {
      if (score >= 7) return { text: 'Outstanding!', emoji: '🏆' };
      if (score >= 5) return { text: 'Great job!', emoji: '🎯' };
      return { text: 'Well done!', emoji: '✅' };
    } else {
      if (score >= 3) return { text: 'Good attempt!', emoji: '💪' };
      return { text: 'Keep trying!', emoji: '📚' };
    }
  };

  const performance = getPerformanceMessage(currentResponse.score, currentResponse.isCorrect);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={`mt-4 p-4 rounded-lg border-2 ${
        currentResponse.isCorrect
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {/* Feedback Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{performance.emoji}</span>
          <div>
            <span className="font-semibold text-lg">
              {performance.text}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`font-bold ${getScoreColor(currentResponse.score)}`}>
                Score: {currentResponse.score}/{currentQuestion.level || currentQuestion.points || 8}
              </span>
              {currentResponse.timeSpent && (
                <span className="text-sm opacity-75">
                  • {Math.round(currentResponse.timeSpent / 1000)}s
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          currentResponse.isCorrect 
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {currentResponse.isCorrect ? 'Correct' : 'Incorrect'}
        </div>
      </div>

      {/* Feedback Content */}
      <div className="mb-4">
        {/* Main Feedback Message */}
        {currentResponse.feedback && (
          <p className="mb-3 leading-relaxed">
            {currentResponse.feedback}
          </p>
        )}

        {/* Explanation */}
        {(currentQuestion as any).explanation && (
          <div className="bg-white/50 p-3 rounded-lg border border-current border-opacity-20">
            <h5 className="font-medium mb-2 flex items-center gap-1">
              💡 Explanation
            </h5>
            <p className="text-sm opacity-90 leading-relaxed">
              {(currentQuestion as any).explanation}
            </p>
          </div>
        )}

        {/* Incorrect Answer Analysis */}
        {!currentResponse.isCorrect && currentQuestion.type === 'mcq' && (
          <div className="mt-3 bg-white/50 p-3 rounded-lg border border-current border-opacity-20">
            <h5 className="font-medium mb-2 flex items-center gap-1">
              🔍 Your Answer Analysis
            </h5>
            <p className="text-sm opacity-90">
              You selected: <strong>{currentResponse.answer}</strong>
              <br />
              {/* Note: correctAnswer property may not exist on all question types */}
              <span className="text-xs opacity-75">Check the explanation above for the correct approach</span>
            </p>
          </div>
        )}

        {/* Learning Tip */}
        {(currentQuestion as any).hint && !currentResponse.isCorrect && (
          <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h5 className="font-medium mb-2 text-blue-800 flex items-center gap-1">
              💭 Learning Tip
            </h5>
            <p className="text-sm text-blue-700 leading-relaxed">
              {(currentQuestion as any).hint}
            </p>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm opacity-75">
          <span>Progress:</span>
          <div className="w-20 h-1 bg-white/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current rounded-full transition-all duration-500"
              style={{ width: `${currentResponse.isCorrect ? 100 : 50}%` }}
            />
          </div>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            currentResponse.isCorrect
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLastQuestion ? (
            <>🎉 Complete Level</>
          ) : (
            <>Next Question →</>
          )}
        </motion.button>
      </div>

      {/* Accessibility Announcement */}
      <div className="sr-only" aria-live="polite">
        {currentResponse.isCorrect ? 'Answer correct' : 'Answer incorrect'}. 
        Score: {currentResponse.score} out of {currentQuestion.level || currentQuestion.points || 8}.
        {currentResponse.feedback}
      </div>
    </motion.div>
  );
};