// src/components/questions/QuestionBlock/components/QuestionContainer.tsx
// 🧠 QUESTION CONTAINER - Extracted UI Component (110 LOC → Standalone)

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, QuestionResponse } from '../../../../utils/integrationFixes';

// Import individual question components (adjust paths as needed)
import { MCQComponent, FillBlankComponent, MatchClickComponent, ShortAnswerComponent } from '../../questionImplementations';

// Import Universal Renderer (adjust path as needed)
// import UniversalQuestionRenderer, { UniversalQuestionUtils } from '../../UniversalQuestionRenderer';

interface QuestionContainerProps {
  question: Question;
  questionIndex: number;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  previousResponse?: QuestionResponse;
  disabled?: boolean;
  showFeedback?: boolean;
  renderingMode: 'individual' | 'universal' | 'error';
  useUniversalRenderer?: boolean;
  enableEnhancedValidation?: boolean;
  fallbackToIndividual?: boolean;
  onRenderingModeChange?: (mode: 'individual' | 'universal' | 'error') => void;
}

export const QuestionContainer: React.FC<QuestionContainerProps> = ({
  question,
  questionIndex,
  onAnswer,
  previousResponse,
  disabled = false,
  showFeedback = true,
  renderingMode,
  useUniversalRenderer = false,
  enableEnhancedValidation = false,
  fallbackToIndividual = true,
  onRenderingModeChange
}) => {
  // Individual component renderer
  const renderIndividualQuestion = () => {
    const commonProps = {
      question,
      onAnswer,
      showFeedback,
      disabled,
      previousResponse
    };

    switch (question.type) {
      case 'mcq':
        return <MCQComponent {...commonProps} />;
      case 'fill-blank':
        return <FillBlankComponent {...commonProps} />;
      case 'match-click':
        return <MatchClickComponent {...commonProps} />;
      case 'short-answer':
        return <ShortAnswerComponent {...commonProps} />;
      default:
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-gray-800 font-semibold mb-2">❓ Unsupported Question Type</h4>
            <p className="text-gray-700 text-sm">
              Question type "{(question as any).type || 'unknown'}" is not supported by individual components.
            </p>
            {useUniversalRenderer && (
              <button
                onClick={() => onRenderingModeChange?.('universal')}
                className="mt-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded transition"
              >
                Try Universal Renderer
              </button>
            )}
          </div>
        );
    }
  };

  // Universal renderer with error handling
  const renderUniversalQuestion = () => {
    try {
      return (
        <div className="relative">
          {/* Visual indicator for universal renderer */}
          <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg z-10">
            ✨ Enhanced
          </div>
          
          {/* Note: UniversalQuestionRenderer would be imported when available */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Universal renderer is being prepared. Using individual components for now.
            </p>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Universal renderer failed:', error);
      
      // Auto-fallback to individual components
      if (fallbackToIndividual) {
        onRenderingModeChange?.('individual');
        return renderIndividualQuestion();
      } else {
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-yellow-800 font-semibold mb-2">🔧 Rendering Error</h4>
            <p className="text-yellow-700 text-sm">
              Universal renderer failed. Please try refreshing the page.
            </p>
          </div>
        );
      }
    }
  };

  // Error state renderer
  const renderErrorState = () => {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-red-800 font-semibold mb-2">⚠️ Question Error</h4>
        <p className="text-red-700 text-sm mb-3">
          This question has invalid data and cannot be displayed.
        </p>
        <button
          onClick={() => onRenderingModeChange?.('individual')}
          className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition"
        >
          Try Individual Renderer
        </button>
      </div>
    );
  };

  // Main renderer logic
  const renderQuestion = () => {
    if (!question) {
      return (
        <div className="p-4 text-center text-gray-500">
          No question available to display.
        </div>
      );
    }

    // Error state
    if (renderingMode === 'error') {
      return renderErrorState();
    }

    // Universal renderer
    if (renderingMode === 'universal') {
      return renderUniversalQuestion();
    }

    // Individual components (default)
    return renderIndividualQuestion();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white mx-6 mb-6 rounded-lg p-6 text-gray-800 shadow-lg"
      >
        {/* Question Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Question Number */}
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              Question {questionIndex + 1}
            </span>
            
            {/* Question Type */}
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            
            {/* Validation Indicator */}
            {enableEnhancedValidation && useUniversalRenderer && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                question.id ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {question.id ? '✓ Valid' : '⚠ Invalid'}
              </span>
            )}
          </div>
          
          {/* Question Info */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{question.points || question.level} points</span>
            
            {/* Dev Mode Toggle */}
            {process.env.NODE_ENV === 'development' && useUniversalRenderer && onRenderingModeChange && (
              <button
                onClick={() => {
                  const newMode = renderingMode === 'universal' ? 'individual' : 'universal';
                  onRenderingModeChange(newMode);
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
                title="Toggle rendering mode (dev only)"
              >
                🔄
              </button>
            )}
          </div>
        </div>

        {/* Question Content */}
        {renderQuestion()}

        {/* Accessibility Label */}
        <div className="sr-only" aria-live="polite">
          Question {questionIndex + 1}: {question.question}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};