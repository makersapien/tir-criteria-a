// src/components/questions/QuestionBlock/components/QuestionContainer.tsx
// 🧠 QUESTION CONTAINER - FIXED TYPE ISSUES

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ MODULAR: Import types from the updated QuestionBlockModule types (now includes explanation)
import { 
  Question, 
  QuestionResponse,
  MCQQuestion,
  FillBlankQuestion,
  MatchClickQuestion,
  ShortAnswerQuestion
} from '../types/questionBlock'; // Use the updated modular types with explanation

// ✅ FIXED: Import individual question components with correct paths
import MCQComponent from '../../MCQComponent';
import FillBlankComponent from '../../FillBlankComponent';
import MatchClickComponent from '../../MatchClickComponent';
import ShortAnswerComponent from '../../ShortAnswerComponent';

interface QuestionContainerProps {
  question: Question;
  questionIndex: number;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  previousResponse?: QuestionResponse;
  disabled?: boolean;
  showFeedback?: boolean;
  renderingMode: 'standard' | 'universal' | 'error';
  useUniversalRenderer?: boolean;
  enableEnhancedValidation?: boolean;
  fallbackToIndividual?: boolean;
  onRenderingModeChange?: (mode: 'standard' | 'universal' | 'error') => void;
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
  // ✅ ENHANCED: Type guards to ensure proper typing
  const isMCQQuestion = (q: Question): q is MCQQuestion => {
    return q.type === 'mcq' && 'options' in q && Array.isArray((q as any).options);
  };

  const isFillBlankQuestion = (q: Question): q is FillBlankQuestion => {
    return q.type === 'fill-blank' && ('text' in q || 'blanks' in q);
  };

  const isMatchClickQuestion = (q: Question): q is MatchClickQuestion => {
    return q.type === 'match-click' && ('leftItems' in q && 'rightItems' in q);
  };

  const isShortAnswerQuestion = (q: Question): q is ShortAnswerQuestion => {
    return q.type === 'short-answer' && 'evaluationCriteria' in q;
  };

  // ✅ ENHANCED: Individual component renderer with better type casting and error handling
  const renderIndividualQuestion = () => {
    const baseProps = {
      onAnswer,
      showFeedback,
      disabled,
      previousResponse
    };

    try {
      switch (question.type) {
        case 'mcq':
          if (isMCQQuestion(question)) {
            return (
              <MCQComponent 
                {...baseProps}
                question={question} // Now properly typed as MCQQuestion with explanation
              />
            );
          } else {
            return renderQuestionTypeError('MCQ', 'options array');
          }

        case 'fill-blank':
          if (isFillBlankQuestion(question)) {
            return (
              <FillBlankComponent 
                {...baseProps}
                question={question} // Now properly typed as FillBlankQuestion with explanation
              />
            );
          } else {
            return renderQuestionTypeError('Fill-in-the-blank', 'text and blanks');
          }

        case 'match-click':
          if (isMatchClickQuestion(question)) {
            return (
              <MatchClickComponent 
                {...baseProps}
                question={question} // Now properly typed as MatchClickQuestion with explanation
              />
            );
          } else {
            return renderQuestionTypeError('Match-click', 'leftItems and rightItems arrays');
          }

        case 'short-answer':
          if (isShortAnswerQuestion(question)) {
            return (
              <ShortAnswerComponent 
                {...baseProps}
                question={question} // Now properly typed as ShortAnswerQuestion with explanation
              />
            );
          } else {
            return renderQuestionTypeError('Short answer', 'evaluationCriteria');
          }

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
    } catch (error) {
      console.error('Error rendering individual question:', error);
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">⚠️ Rendering Error</h4>
          <p className="text-red-700 text-sm mb-3">
            Failed to render question component: {(error as Error).message}
          </p>
          <div className="text-xs text-red-600 bg-red-100 p-2 rounded font-mono">
            Question ID: {question.id}<br/>
            Type: {question.type}<br/>
            Available properties: {Object.keys(question).join(', ')}
          </div>
        </div>
      );
    }
  };

  // ✅ ENHANCED: Helper function for type mismatch errors
  const renderQuestionTypeError = (expectedType: string, missingProperty: string) => {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-yellow-800 font-semibold mb-2">⚠️ Question Type Mismatch</h4>
        <p className="text-yellow-700 text-sm mb-3">
          This question is marked as "{expectedType}" but is missing or has invalid property: {missingProperty}
        </p>
        <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded font-mono">
          Question ID: {question.id}<br/>
          Type: {question.type}<br/>
          Available properties: {Object.keys(question).join(', ')}<br/>
          Has explanation: {'explanation' in question ? '✓' : '✗'}
        </div>
        {enableEnhancedValidation && (
          <div className="mt-2 text-xs text-yellow-700">
            💡 This suggests a type system mismatch. Check that all question interfaces include required properties.
          </div>
        )}
      </div>
    );
  };

  // ✅ ENHANCED: Universal renderer with better fallback
  const renderUniversalQuestion = () => {
    try {
      return (
        <div className="relative">
          {/* Visual indicator for universal renderer */}
          <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg z-10">
            ✨ Enhanced
          </div>
          
          {/* ✅ ENHANCED: Fallback to individual components with notification */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-blue-600 text-lg">ℹ️</span>
              <div>
                <h4 className="text-blue-800 font-semibold mb-1">Universal Renderer</h4>
                <p className="text-blue-700 text-sm">
                  Enhanced rendering with type-safe individual components using questionSystem types.
                </p>
              </div>
            </div>
            
            {/* Render the individual component within the universal container */}
            <div className="bg-white rounded p-4 border">
              {renderIndividualQuestion()}
            </div>
            
            {/* ✅ ADDED: Debug info for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                Debug: Using questionSystem types | Has explanation: {'explanation' in question ? '✓' : '✗'}
              </div>
            )}
            
            {/* ✅ ADDED: Fallback button */}
            <div className="mt-3 text-center">
              <button
                onClick={() => onRenderingModeChange?.('standard')}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition"
              >
                Switch to Standard Mode
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Universal renderer failed:', error);
      
      // Auto-fallback to individual components
      if (fallbackToIndividual) {
        onRenderingModeChange?.('standard');
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
        <div className="text-xs text-red-600 bg-red-100 p-2 rounded font-mono mb-3">
          Question validation failed. Expected properties may be missing.
        </div>
        <button
          onClick={() => onRenderingModeChange?.('standard')}
          className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition"
        >
          Try Standard Renderer
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

    // Individual components (default/standard)
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
            
            {/* ✅ ENHANCED: Rendering mode indicator */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              renderingMode === 'universal' ? 'bg-green-100 text-green-700' :
              renderingMode === 'standard' ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-700'
            }`}>
              {renderingMode === 'universal' ? '✨ Enhanced' :
               renderingMode === 'standard' ? '⚡ Standard' :
               '⚠ Error'}
            </span>
            
            {/* Type validation indicator */}
            {enableEnhancedValidation && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                (question.type === 'mcq' && isMCQQuestion(question)) ||
                (question.type === 'fill-blank' && isFillBlankQuestion(question)) ||
                (question.type === 'match-click' && isMatchClickQuestion(question)) ||
                (question.type === 'short-answer' && isShortAnswerQuestion(question))
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {(question.type === 'mcq' && isMCQQuestion(question)) ||
                 (question.type === 'fill-blank' && isFillBlankQuestion(question)) ||
                 (question.type === 'match-click' && isMatchClickQuestion(question)) ||
                 (question.type === 'short-answer' && isShortAnswerQuestion(question))
                  ? '✓ Valid Type' : '⚠ Type Mismatch'}
              </span>
            )}

            {/* ✅ NEW: Explanation property indicator */}
            {enableEnhancedValidation && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                'explanation' in question ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {'explanation' in question ? '✓ Has Explanation' : '⚠ Missing Explanation'}
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
                  const newMode = renderingMode === 'universal' ? 'standard' : 'universal';
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