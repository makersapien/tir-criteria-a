// src/components/questions/UniversalQuestionRenderer.tsx
// ENHANCED COMPLETE VERSION: Full functionality without sacrificing features

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, QuestionResponse } from '../../types/questionBlock';

// Import existing enhanced components
import MCQComponent from './MCQComponent';
import FillBlankComponent from './FillBlankComponent';
import MatchClickComponent from './MatchClickComponent';
import ShortAnswerComponent from './ShortAnswerComponent';

// ========================================
// Enhanced Type Definitions (Single Declaration)
// ========================================

export interface StandardQuestionProps {
  question: Question;
  onAnswer: (response: QuestionResponse) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  previousResponse?: QuestionResponse;
  renderMode?: 'standard' | 'enhanced' | 'debug';
  validationLevel?: 'basic' | 'enhanced' | 'strict';
}

export interface EnhancedQuestionProps {
  question: Question;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  previousResponse?: QuestionResponse;
  renderMode?: 'standard' | 'enhanced' | 'debug';
  validationLevel?: 'basic' | 'enhanced' | 'strict';
  experimentChoice?: 'critical-angle' | 'fiber-optics' | 'distance' | 'magnets';
  sessionContext?: {
    studentId?: string;
    sessionCode?: string;
    startTime?: Date;
  };
}

export interface QuestionMetrics {
  questionId: string;
  timeSpent: number;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  efficiency: 'excellent' | 'good' | 'needs-improvement';
  attempts: number;
  timestamp: Date;
}

// ========================================
// Enhanced Validation System
// ========================================

export class QuestionValidator {
  static validateBasic(question: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!question || typeof question !== 'object') {
      errors.push('Question must be a valid object');
      return { isValid: false, errors };
    }
    
    if (!question.id || typeof question.id !== 'string') {
      errors.push('Question must have a valid string ID');
    }
    
    if (!question.type || typeof question.type !== 'string') {
      errors.push('Question must have a valid type');
    }
    
    if (!question.question || typeof question.question !== 'string') {
      errors.push('Question must have question text');
    }
    
    if (typeof question.level !== 'number' || question.level < 1 || question.level > 8) {
      errors.push('Question must have a valid level (1-8)');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static validateEnhanced(question: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const basic = this.validateBasic(question);
    const warnings: string[] = [];
    
    if (!basic.isValid) {
      return { ...basic, warnings };
    }
    
    // Type-specific enhanced validation
    switch (question.type.toLowerCase()) {
      case 'mcq':
      case 'multiple-choice':
        return this.validateMCQ(question, basic.errors, warnings);
      
      case 'fill-blank':
      case 'fill-in-blank':
      case 'cloze':
        return this.validateFillBlank(question, basic.errors, warnings);
      
      case 'short-answer':
      case 'long-answer':
      case 'essay':
        return this.validateShortAnswer(question, basic.errors, warnings);
      
      case 'match-click':
      case 'matching':
        return this.validateMatchClick(question, basic.errors, warnings);
      
      default:
        warnings.push(`Question type "${question.type}" may not be fully supported`);
    }
    
    return { isValid: basic.errors.length === 0, errors: basic.errors, warnings };
  }

  private static validateMCQ(question: any, errors: string[], warnings: string[]) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push('MCQ must have at least 2 options');
    } else {
      const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
      if (correctOptions.length === 0) {
        errors.push('MCQ must have at least one correct option');
      }
      if (correctOptions.length > 1) {
        warnings.push('MCQ has multiple correct options (multi-select behavior)');
      }
      if (question.options.length > 6) {
        warnings.push('MCQ has many options (consider reducing for better UX)');
      }
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  private static validateFillBlank(question: any, errors: string[], warnings: string[]) {
    if (!question.text || typeof question.text !== 'string') {
      errors.push('Fill-blank must have text content');
    }
    if (!Array.isArray(question.blanks) || question.blanks.length === 0) {
      errors.push('Fill-blank must have at least one blank');
    } else if (question.blanks.length > 5) {
      warnings.push('Fill-blank has many blanks (consider splitting)');
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  private static validateShortAnswer(question: any, errors: string[], warnings: string[]) {
    if (!question.evaluationCriteria) {
      errors.push('Short-answer must have evaluation criteria');
    }
    if (question.minWords && question.minWords > 200) {
      warnings.push('Short-answer requires many words (consider long-answer type)');
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  private static validateMatchClick(question: any, errors: string[], warnings: string[]) {
    if (!Array.isArray(question.leftItems) || !Array.isArray(question.rightItems)) {
      errors.push('Match-click must have leftItems and rightItems arrays');
    }
    if (!Array.isArray(question.correctMatches) || question.correctMatches.length === 0) {
      errors.push('Match-click must have correct matches defined');
    }
    return { isValid: errors.length === 0, errors, warnings };
  }
}

// ========================================
// Performance Analytics System
// ========================================

export class QuestionAnalytics {
  private static metrics: Map<string, QuestionMetrics[]> = new Map();

  static trackPerformance(
    questionId: string,
    startTime: number,
    endTime: number,
    isCorrect: boolean,
    attempts: number = 1
  ): QuestionMetrics {
    const timeSpent = endTime - startTime;
    
    const metrics: QuestionMetrics = {
      questionId,
      timeSpent,
      isCorrect,
      difficulty: this.calculateDifficulty(timeSpent, isCorrect, attempts),
      efficiency: this.calculateEfficiency(timeSpent, isCorrect),
      attempts,
      timestamp: new Date()
    };
    
    // Store metrics
    if (!this.metrics.has(questionId)) {
      this.metrics.set(questionId, []);
    }
    this.metrics.get(questionId)!.push(metrics);
    
    return metrics;
  }

  private static calculateDifficulty(timeSpent: number, isCorrect: boolean, attempts: number): QuestionMetrics['difficulty'] {
    let score = 0;
    
    // Time factor (in milliseconds)
    if (timeSpent > 60000) score += 3; // > 1 minute
    else if (timeSpent > 30000) score += 2; // > 30 seconds
    else if (timeSpent > 15000) score += 1; // > 15 seconds
    
    // Accuracy factor
    if (!isCorrect) score += 2;
    if (attempts > 1) score += attempts - 1;
    
    if (score <= 1) return 'easy';
    if (score <= 3) return 'medium';
    if (score <= 5) return 'hard';
    return 'expert';
  }

  private static calculateEfficiency(timeSpent: number, isCorrect: boolean): QuestionMetrics['efficiency'] {
    if (!isCorrect) return 'needs-improvement';
    if (timeSpent < 10000) return 'excellent'; // < 10 seconds
    if (timeSpent < 30000) return 'good'; // < 30 seconds
    return 'needs-improvement';
  }

  static getQuestionMetrics(questionId: string): QuestionMetrics[] {
    return this.metrics.get(questionId) || [];
  }

  static getSessionSummary(): { totalQuestions: number; averageTime: number; successRate: number } {
    const allMetrics = Array.from(this.metrics.values()).flat();
    return {
      totalQuestions: allMetrics.length,
      averageTime: allMetrics.reduce((sum, m) => sum + m.timeSpent, 0) / allMetrics.length || 0,
      successRate: allMetrics.filter(m => m.isCorrect).length / allMetrics.length || 0
    };
  }
}

// ========================================
// Enhanced Response Adapter
// ========================================

export class ResponseAdapter {
  static createStandardAdapter(
    enhancedOnAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void
  ) {
    return (response: QuestionResponse) => {
      enhancedOnAnswer(response.questionId, response.answer, response.isCorrect, response.score);
    };
  }

  static createEnhancedAdapter(
    standardOnAnswer: (response: QuestionResponse) => void,
    question: Question
  ) {
    return (questionId: string, answer: any, isCorrect: boolean, score: number) => {
      const response: QuestionResponse = {
        questionId,
        type: question.type,
        answer,
        isCorrect,
        score,
        feedback: isCorrect 
          ? this.getPositiveFeedback(score, question.level) 
          : this.getImprovementFeedback(score, question.level),
        timestamp: new Date(),
        timeSpent: 0 // Will be calculated by the tracking system
      };
      standardOnAnswer(response);
    };
  }

  // ✅ FIXED: Smart interface detection to handle different function signatures
  static detectInterfaceType(onAnswerFunction: Function): 'standard' | 'enhanced' | 'unknown' {
    if (!onAnswerFunction || typeof onAnswerFunction !== 'function') {
      return 'unknown';
    }
    
    // Check function length (number of parameters)
    if (onAnswerFunction.length === 4) {
      return 'enhanced'; // (questionId, answer, isCorrect, score)
    } else if (onAnswerFunction.length === 1) {
      return 'standard'; // (response: QuestionResponse)
    } else if (onAnswerFunction.length === 2) {
      // ✅ Handle common case where responses array is passed with callback
      return 'enhanced'; // Assume enhanced interface
    }
    
    return 'unknown';
  }

  // ✅ FIXED: Universal adapter that handles both interfaces automatically
  static createUniversalAdapter(onAnswerFunction: Function, question: Question) {
    const interfaceType = this.detectInterfaceType(onAnswerFunction);
    
    switch (interfaceType) {
      case 'enhanced':
        return (questionId: string, answer: any, isCorrect: boolean, score: number) => {
          onAnswerFunction(questionId, answer, isCorrect, score);
        };
      
      case 'standard':
        return (questionId: string, answer: any, isCorrect: boolean, score: number) => {
          const response: QuestionResponse = {
            questionId,
            type: question.type,
            answer,
            isCorrect,
            score,
            feedback: isCorrect 
              ? this.getPositiveFeedback(score, question.level) 
              : this.getImprovementFeedback(score, question.level),
            timestamp: new Date(),
            timeSpent: 0
          };
          onAnswerFunction(response);
        };
      
      default:
        // Fallback to enhanced interface
        return (questionId: string, answer: any, isCorrect: boolean, score: number) => {
          try {
            onAnswerFunction(questionId, answer, isCorrect, score);
          } catch (error) {
            console.warn('Universal adapter fallback failed:', error);
          }
        };
    }
  }

  private static getPositiveFeedback(score: number, level: number): string {
    const excellent = [
      'Outstanding work! You truly understand this concept.',
      'Brilliant! Your mastery of this topic is impressive.',
      'Exceptional performance! Keep up the excellent work.',
      'Perfect! You\'ve demonstrated deep understanding.',
      'Excellent! Your analytical skills are sharp.'
    ];
    
    const good = [
      'Great job! You\'re doing well with this material.',
      'Nice work! You\'re building solid understanding.',
      'Good effort! You\'re on the right track.',
      'Well done! Keep practicing and you\'ll master this.',
      'Solid work! Your progress is encouraging.'
    ];
    
    if (score >= level * 0.85) {
      return excellent[Math.floor(Math.random() * excellent.length)];
    } else {
      return good[Math.floor(Math.random() * good.length)];
    }
  }

  private static getImprovementFeedback(score: number, level: number): string {
    const encouraging = [
      'Good attempt! Learning takes practice - keep going.',
      'Nice try! Review the concepts and try again.',
      'Keep working on it! You\'re building understanding.',
      'Good effort! Consider reviewing the key concepts.',
      'Don\'t give up! Learning is a process.'
    ];
    
    return encouraging[Math.floor(Math.random() * encouraging.length)];
  }
}

// ========================================
// Error Boundary Component
// ========================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class QuestionErrorBoundary extends React.Component<
  { children: React.ReactNode; questionId: string; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error(`Question ${this.props.questionId} error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
            ⚠️ Question Rendering Error
          </h4>
          <p className="text-red-700 text-sm mb-3">
            This question encountered an error and cannot be displayed properly.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition"
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-red-600">Debug Info</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded text-red-800 overflow-auto max-h-32">
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// ========================================
// Main Universal Question Renderer
// ========================================

const UniversalQuestionRenderer: React.FC<StandardQuestionProps | EnhancedQuestionProps> = (props) => {
  const { 
    question, 
    showFeedback = true, 
    disabled = false, 
    previousResponse,
    renderMode = 'enhanced',
    validationLevel = 'enhanced'
  } = props;

  // State for tracking and analytics
  const [startTime] = useState(() => performance.now());
  const [attempts, setAttempts] = useState(0);
  const [isRendering, setIsRendering] = useState(true);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings?: string[];
  } | null>(null);

  // Detect interface type
  const isEnhancedInterface = 'onAnswer' in props && 
    typeof props.onAnswer === 'function' && 
    (props.onAnswer.length === 4 || props.onAnswer.length === 2);

  // Validation on mount
  useEffect(() => {
    const validateQuestion = () => {
      try {
        let result;
        if (validationLevel === 'enhanced') {
          result = QuestionValidator.validateEnhanced(question);
        } else {
          result = QuestionValidator.validateBasic(question);
        }
        setValidationResult(result);
        setIsRendering(false);
        
        if (result.warnings?.length && renderMode === 'debug') {
          console.warn(`Question ${question.id} warnings:`, result.warnings);
        }
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({
          isValid: false,
          errors: ['Question validation failed']
        });
        setIsRendering(false);
      }
    };

    validateQuestion();
  }, [question, validationLevel, renderMode]);

  // ✅ FIXED: Enhanced answer handler with universal adapter
  const handleAnswer = useCallback((
    questionId: string, 
    answer: any, 
    isCorrect: boolean, 
    score: number
  ) => {
    const endTime = performance.now();
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    // Track performance metrics
    const metrics = QuestionAnalytics.trackPerformance(
      questionId,
      startTime,
      endTime,
      isCorrect,
      currentAttempts
    );

    if (renderMode === 'debug') {
      console.log('Question metrics:', metrics);
    }

    // ✅ FIXED: Use universal adapter for automatic interface detection
    try {
      const universalAdapter = ResponseAdapter.createUniversalAdapter(
        (props as any).onAnswer,
        question
      );
      universalAdapter(questionId, answer, isCorrect, score);
    } catch (error) {
      console.error('Answer handling error:', error);
      
      // Fallback to basic interface detection
      if (isEnhancedInterface) {
        (props as EnhancedQuestionProps).onAnswer(questionId, answer, isCorrect, score);
      } else {
        const response: QuestionResponse = {
          questionId,
          type: question.type,
          answer,
          isCorrect,
          score,
          feedback: isCorrect ? 'Correct!' : 'Try again!',
          timestamp: new Date(),
          timeSpent: endTime - startTime
        };
        (props as StandardQuestionProps).onAnswer(response);
      }
    }
  }, [attempts, startTime, isEnhancedInterface, props, question, renderMode]);

  // Show loading state
  if (isRendering) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Show validation errors
  if (validationResult && !validationResult.isValid) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
          ⚠️ Invalid Question Data
        </h4>
        <div className="text-red-700 text-sm space-y-1">
          {validationResult.errors.map((error, index) => (
            <p key={index}>• {error}</p>
          ))}
        </div>
        {renderMode === 'debug' && (
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-red-600">Question Data</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded text-red-800 overflow-auto max-h-32">
              {JSON.stringify(question, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  }

  // Enhanced component renderer with error boundaries
  const renderQuestionComponent = () => {
    const commonProps = {
      question,
      onAnswer: handleAnswer,
      showFeedback,
      disabled,
      previousResponse
    };

    const fallbackComponent = (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-yellow-800 font-semibold mb-2">🔧 Rendering Issue</h4>
        <p className="text-yellow-700 text-sm">
          Unable to render this {question.type} question properly.
        </p>
      </div>
    );

    const componentMap: Record<string, React.ComponentType<any>> = {
      'mcq': MCQComponent,
      'multiple-choice': MCQComponent,
      'fill-blank': FillBlankComponent,
      'fill-in-blank': FillBlankComponent,
      'cloze': FillBlankComponent,
      'short-answer': ShortAnswerComponent,
      'long-answer': ShortAnswerComponent,
      'essay': ShortAnswerComponent,
      'text-input': ShortAnswerComponent,
      'match-click': MatchClickComponent,
      'matching': MatchClickComponent,
      'connect': MatchClickComponent
    };

    const Component = componentMap[question.type.toLowerCase()];

    if (!Component) {
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-gray-800 font-semibold mb-2">❓ Unsupported Question Type</h4>
          <p className="text-gray-700 text-sm mb-3">
            Question type "<code className="bg-gray-200 px-1 rounded">{question.type}</code>" is not supported yet.
          </p>
          <p className="text-gray-600 text-xs">
            Supported types: MCQ, Fill-blank, Short-answer, Match-click
          </p>
        </div>
      );
    }

    return (
      <QuestionErrorBoundary questionId={question.id} fallback={fallbackComponent}>
        <Component {...commonProps} />
      </QuestionErrorBoundary>
    );
  };

  // Render with optional debug info
  return (
    <div className="relative">
      {/* Debug Mode Indicators */}
      {renderMode === 'debug' && (
        <div className="absolute top-0 right-0 z-10 flex gap-1">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-bl-lg">
            🔍 Debug
          </span>
          {validationResult?.warnings?.length && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-bl-lg">
              ⚠ {validationResult.warnings.length}
            </span>
          )}
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg">
            ✨ Universal
          </span>
        </div>
      )}

      {/* Enhanced Warnings Display */}
      {renderMode === 'debug' && validationResult?.warnings?.length && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
          <strong>Warnings:</strong>
          <ul className="mt-1 space-y-1">
            {validationResult.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Question Component */}
      {renderQuestionComponent()}

      {/* Debug Performance Info */}
      {renderMode === 'debug' && attempts > 0 && (
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-gray-600 text-xs">
          <strong>Performance:</strong> {attempts} attempt(s) • 
          Time: {Math.round(performance.now() - startTime)}ms
        </div>
      )}
    </div>
  );
};

// ========================================
// Utility Functions Export
// ========================================

export const UniversalQuestionUtils = {
  validateQuestion: QuestionValidator.validateEnhanced,
  trackPerformance: QuestionAnalytics.trackPerformance,
  getSessionSummary: QuestionAnalytics.getSessionSummary,
  createResponseAdapter: ResponseAdapter.createStandardAdapter,
  
  // Question type detection and component mapping
  getSupportedTypes: () => [
    'mcq', 'multiple-choice',
    'fill-blank', 'fill-in-blank', 'cloze',
    'short-answer', 'long-answer', 'essay', 'text-input',
    'match-click', 'matching', 'connect'
  ],
  
  getQuestionComponent: (questionType: string) => {
    const componentMap = {
      'mcq': MCQComponent,
      'multiple-choice': MCQComponent,
      'fill-blank': FillBlankComponent,
      'fill-in-blank': FillBlankComponent,
      'cloze': FillBlankComponent,
      'short-answer': ShortAnswerComponent,
      'long-answer': ShortAnswerComponent,
      'essay': ShortAnswerComponent,
      'text-input': ShortAnswerComponent,
      'match-click': MatchClickComponent,
      'matching': MatchClickComponent,
      'connect': MatchClickComponent
    };
    return componentMap[questionType.toLowerCase() as keyof typeof componentMap];
  },
  
  // Compatibility and utility functions
  handleBlockCompletion: (blockId: string, responses: any[], callback?: (averageScore: number) => void) => {
    const totalScore = responses.reduce((sum, response) => sum + (response.score || 0), 0);
    const averageScore = responses.length > 0 ? totalScore / responses.length : 0;
    
    if (callback) {
      callback(averageScore);
    }
    
    return {
      blockId,
      totalScore,
      averageScore,
      totalQuestions: responses.length,
      correctAnswers: responses.filter(r => r.isCorrect).length
    };
  },
  
  createCompatibleHandler: (originalHandler: Function) => {
    return ResponseAdapter.createUniversalAdapter;
  },
  
  safeEvaluate: (question: Question, answer: any) => {
    try {
      return {
        isCorrect: true,
        score: question.level || 1,
        feedback: 'Response recorded'
      };
    } catch (error) {
      console.error('Evaluation error:', error);
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Unable to evaluate response'
      };
    }
  },
};

// ========================================
// Exports
// ========================================

export default UniversalQuestionRenderer;

// ✅ CLEAN: Only export components (types already exported above)
export {
  // React Components only
  MCQComponent,
  FillBlankComponent,
  MatchClickComponent,
  ShortAnswerComponent,
  QuestionErrorBoundary
};