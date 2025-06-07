// src/components/questions/QuestionRenderers.tsx
// Central hub for importing and exporting all question components - ENHANCED VERSION
import React from 'react';
import MCQComponent from './MCQComponent';
import FillBlankComponent from './FillBlankComponent';
import MatchClickComponent from './MatchClickComponent';
import ShortAnswerComponent from './ShortAnswerComponent';
import { Question, QuestionResponse } from '../../types/questionBlock';

// ✅ ENHANCED: Dual interface support for backward compatibility
export interface QuestionRendererProps {
  question: Question;
  onAnswer: (response: QuestionResponse) => void;
  showFeedback?: boolean;
}

// ✅ NEW: Enhanced interface for YourResponseSection compatibility
export interface EnhancedQuestionRendererProps {
  question: Question;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  showFeedback?: boolean;
}

// ✅ ENHANCED: Adapter function to convert between interfaces
const createQuestionResponseAdapter = (
  enhancedOnAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void
) => {
  return (response: QuestionResponse) => {
    enhancedOnAnswer(response.questionId, response.answer, response.isCorrect, response.score);
  };
};

// ✅ ENHANCED: Individual component wrappers with dual interface support
export const MCQRenderer: React.FC<QuestionRendererProps | EnhancedQuestionRendererProps> = (props) => {
  const { question, showFeedback = true } = props;
  
  // ✅ Type guard to determine which interface is being used
  const isEnhancedProps = 'onAnswer' in props && typeof props.onAnswer === 'function' && props.onAnswer.length === 4;
  
  if (isEnhancedProps) {
    const enhancedProps = props as EnhancedQuestionRendererProps;
    return (
      <MCQComponent
        question={question}
        onAnswer={enhancedProps.onAnswer}
        showFeedback={showFeedback}
      />
    );
  } else {
    const standardProps = props as QuestionRendererProps;
    const adaptedOnAnswer = (questionId: string, answer: any, isCorrect: boolean, score: number) => {
      const response: QuestionResponse = {
        questionId,
        type: question.type,
        answer,
        isCorrect,
        score,
        feedback: isCorrect ? 'Correct!' : 'Try again!',
        timestamp: new Date()
      };
      standardProps.onAnswer(response);
    };
    
    return (
      <MCQComponent
        question={question}
        onAnswer={adaptedOnAnswer}
        showFeedback={showFeedback}
      />
    );
  }
};

export const FillBlankRenderer: React.FC<QuestionRendererProps | EnhancedQuestionRendererProps> = (props) => {
  const { question, showFeedback = true } = props;
  
  const isEnhancedProps = 'onAnswer' in props && typeof props.onAnswer === 'function' && props.onAnswer.length === 4;
  
  if (isEnhancedProps) {
    const enhancedProps = props as EnhancedQuestionRendererProps;
    return (
      <FillBlankComponent
        question={question}
        onAnswer={enhancedProps.onAnswer}
        showFeedback={showFeedback}
      />
    );
  } else {
    const standardProps = props as QuestionRendererProps;
    const adaptedOnAnswer = (questionId: string, answer: any, isCorrect: boolean, score: number) => {
      const response: QuestionResponse = {
        questionId,
        type: question.type,
        answer,
        isCorrect,
        score,
        feedback: isCorrect ? 'Great work!' : 'Good effort!',
        timestamp: new Date()
      };
      standardProps.onAnswer(response);
    };
    
    return (
      <FillBlankComponent
        question={question}
        onAnswer={adaptedOnAnswer}
        showFeedback={showFeedback}
      />
    );
  }
};

export const MatchClickRenderer: React.FC<QuestionRendererProps | EnhancedQuestionRendererProps> = (props) => {
  const { question, showFeedback = true } = props;
  
  const isEnhancedProps = 'onAnswer' in props && typeof props.onAnswer === 'function' && props.onAnswer.length === 4;
  
  if (isEnhancedProps) {
    const enhancedProps = props as EnhancedQuestionRendererProps;
    return (
      <MatchClickComponent
        question={question}
        onAnswer={enhancedProps.onAnswer}
        showFeedback={showFeedback}
      />
    );
  } else {
    const standardProps = props as QuestionRendererProps;
    const adaptedOnAnswer = (questionId: string, answer: any, isCorrect: boolean, score: number) => {
      const response: QuestionResponse = {
        questionId,
        type: question.type,
        answer,
        isCorrect,
        score,
        feedback: isCorrect ? 'Excellent matching!' : 'Good attempt!',
        timestamp: new Date()
      };
      standardProps.onAnswer(response);
    };
    
    return (
      <MatchClickComponent
        question={question}
        onAnswer={adaptedOnAnswer}
        showFeedback={showFeedback}
      />
    );
  }
};

export const ShortAnswerRenderer: React.FC<QuestionRendererProps | EnhancedQuestionRendererProps> = (props) => {
  const { question, showFeedback = true } = props;
  
  const isEnhancedProps = 'onAnswer' in props && typeof props.onAnswer === 'function' && props.onAnswer.length === 4;
  
  if (isEnhancedProps) {
    const enhancedProps = props as EnhancedQuestionRendererProps;
    return (
      <ShortAnswerComponent
        question={question}
        onAnswer={enhancedProps.onAnswer}
        showFeedback={showFeedback}
      />
    );
  } else {
    const standardProps = props as QuestionRendererProps;
    const adaptedOnAnswer = (questionId: string, answer: any, isCorrect: boolean, score: number) => {
      const response: QuestionResponse = {
        questionId,
        type: question.type,
        answer,
        isCorrect,
        score,
        feedback: isCorrect ? 'Good response!' : 'Consider expanding your answer.',
        timestamp: new Date()
      };
      standardProps.onAnswer(response);
    };
    
    return (
      <ShortAnswerComponent
        question={question}
        onAnswer={adaptedOnAnswer}
        showFeedback={showFeedback}
      />
    );
  }
};

// ✅ MAINTAINED: Additional question types that could be added later
export const TrueFalseRenderer: React.FC<QuestionRendererProps> = ({ question, onAnswer, showFeedback = false }) => {
  // Simple true/false component - can be expanded later
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-gray-600">True/False questions coming soon...</p>
    </div>
  );
};

export const DragDropRenderer: React.FC<QuestionRendererProps> = ({ question, onAnswer, showFeedback = false }) => {
  // Drag and drop component - can be expanded later
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-gray-600">Drag & Drop questions coming soon...</p>
    </div>
  );
};

export const OrderingRenderer: React.FC<QuestionRendererProps> = ({ question, onAnswer, showFeedback = false }) => {
  // Ordering/sequence component - can be expanded later
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-gray-600">Ordering questions coming soon...</p>
    </div>
  );
};

export const HotspotRenderer: React.FC<QuestionRendererProps> = ({ question, onAnswer, showFeedback = false }) => {
  // Image hotspot component - can be expanded later
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-gray-600">Hotspot questions coming soon...</p>
    </div>
  );
};

// ✅ MAINTAINED: Helper function to get the appropriate renderer for a question type
export const getRendererForQuestionType = (questionType: string) => {
  const rendererMap = {
    'mcq': MCQComponent,
    'multiple-choice': MCQComponent,
    'fill-blank': FillBlankComponent,
    'fill-in-blank': FillBlankComponent,
    'short-answer': ShortAnswerComponent,
    'long-answer': ShortAnswerComponent,
    'match-click': MatchClickComponent,
    'matching': MatchClickComponent,
    'true-false': TrueFalseRenderer,
    'boolean': TrueFalseRenderer,
    'drag-drop': DragDropRenderer,
    'drag-and-drop': DragDropRenderer,
    'ordering': OrderingRenderer,
    'sequence': OrderingRenderer,
    'hotspot': HotspotRenderer,
    'image-click': HotspotRenderer,
    'click-image': HotspotRenderer
  };

  return rendererMap[questionType.toLowerCase()] || MCQComponent;
};

// ✅ ENHANCED: Universal Question Renderer Component with dual interface support
export const UniversalQuestionRenderer: React.FC<QuestionRendererProps | EnhancedQuestionRendererProps> = (props) => {
  const { question, showFeedback = false } = props;
  
  // ✅ Determine which renderer to use
  switch (question.type.toLowerCase()) {
    case 'mcq':
    case 'multiple-choice':
      return <MCQRenderer {...props} />;
    
    case 'fill-blank':
    case 'fill-in-blank':
      return <FillBlankRenderer {...props} />;
    
    case 'short-answer':
    case 'long-answer':
      return <ShortAnswerRenderer {...props} />;
    
    case 'match-click':
    case 'matching':
      return <MatchClickRenderer {...props} />;
    
    case 'true-false':
    case 'boolean':
      return <TrueFalseRenderer question={question} onAnswer={(props as QuestionRendererProps).onAnswer} showFeedback={showFeedback} />;
    
    case 'drag-drop':
    case 'drag-and-drop':
      return <DragDropRenderer question={question} onAnswer={(props as QuestionRendererProps).onAnswer} showFeedback={showFeedback} />;
    
    case 'ordering':
    case 'sequence':
      return <OrderingRenderer question={question} onAnswer={(props as QuestionRendererProps).onAnswer} showFeedback={showFeedback} />;
    
    case 'hotspot':
    case 'image-click':
    case 'click-image':
      return <HotspotRenderer question={question} onAnswer={(props as QuestionRendererProps).onAnswer} showFeedback={showFeedback} />;
    
    default:
      console.error('Unknown question type:', question.type);
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">⚠️ Unknown Question Type</h4>
          <p className="text-red-700 text-sm">
            Question type "{question.type}" is not supported.
          </p>
          <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
            <strong>Question Data:</strong>
            <pre className="mt-1 text-gray-600 max-h-32 overflow-auto">{JSON.stringify(question, null, 2)}</pre>
          </div>
        </div>
      );
  }
};

// ✅ MAINTAINED: Validation helper for question data
export const validateQuestionData = (question: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Basic required fields
  if (!question.id) errors.push('Question must have an id');
  if (!question.type) errors.push('Question must have a type');
  if (!question.question) errors.push('Question must have a question text');
  if (!question.level) errors.push('Question must have a level');
  
  // Type-specific validation
  switch (question.type.toLowerCase()) {
    case 'mcq':
    case 'multiple-choice':
      if (!question.options || !Array.isArray(question.options)) {
        errors.push('MCQ questions must have options array');
      } else {
        if (question.options.length < 2) errors.push('MCQ must have at least 2 options');
        if (!question.options.some((opt: any) => opt.isCorrect)) {
          errors.push('MCQ must have at least one correct option');
        }
      }
      break;
      
    case 'fill-blank':
    case 'fill-in-blank':
      if (!question.text) errors.push('Fill-blank questions must have text property');
      if (!question.blanks || !Array.isArray(question.blanks)) {
        errors.push('Fill-blank questions must have blanks array');
      }
      break;
      
    case 'short-answer':
    case 'long-answer':
      if (!question.evaluationCriteria) {
        errors.push('Short-answer questions must have evaluationCriteria');
      }
      break;
      
    case 'match-click':
    case 'matching':
      if (!question.leftItems || !question.rightItems) {
        errors.push('Matching questions must have leftItems and rightItems');
      }
      if (!question.correctMatches) {
        errors.push('Matching questions must have correctMatches');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ✅ MAINTAINED: Performance monitoring for question interactions
export const trackQuestionPerformance = (questionId: string, startTime: number, endTime: number, isCorrect: boolean) => {
  const timeSpent = endTime - startTime;
  const performanceData = {
    questionId,
    timeSpent,
    isCorrect,
    timestamp: new Date(),
    difficulty: timeSpent > 30000 ? 'hard' : timeSpent > 15000 ? 'medium' : 'easy'
  };
  
  // You can send this to analytics service
  console.log('📊 Question Performance:', performanceData);
  return performanceData;
};

// ✅ MAINTAINED: Accessibility helpers
export const getAriaLabel = (questionType: string, questionNumber: number, totalQuestions: number): string => {
  const typeLabels = {
    'mcq': 'Multiple choice question',
    'fill-blank': 'Fill in the blanks question',
    'short-answer': 'Short answer question',
    'match-click': 'Matching question',
    'true-false': 'True or false question',
    'drag-drop': 'Drag and drop question',
    'ordering': 'Ordering question',
    'hotspot': 'Image hotspot question'
  };
  
  const typeLabel = typeLabels[questionType as keyof typeof typeLabels] || 'Question';
  return `${typeLabel} ${questionNumber} of ${totalQuestions}`;
};

// ✅ MAINTAINED: Question difficulty calculator
export const calculateQuestionDifficulty = (question: any): 'easy' | 'medium' | 'hard' | 'expert' => {
  let difficultyScore = 0;
  
  // Base difficulty by type
  const typeDifficulty = {
    'mcq': 1,
    'true-false': 1,
    'fill-blank': 2,
    'match-click': 2,
    'short-answer': 3,
    'drag-drop': 3,
    'ordering': 3,
    'hotspot': 4
  };
  
  difficultyScore += typeDifficulty[question.type as keyof typeof typeDifficulty] || 2;
  
  // Adjust based on level
  if (question.level) {
    difficultyScore += Math.floor(question.level / 2);
  }
  
  // Adjust based on content complexity
  if (question.options && question.options.length > 4) difficultyScore += 1;
  if (question.blanks && question.blanks.length > 3) difficultyScore += 1;
  if (question.minWords && question.minWords > 50) difficultyScore += 1;
  
  // Return difficulty level
  if (difficultyScore <= 2) return 'easy';
  if (difficultyScore <= 4) return 'medium';
  if (difficultyScore <= 6) return 'hard';
  return 'expert';
};

// ✅ MAINTAINED: Question randomization utilities
export const shuffleOptions = (question: any): any => {
  if (question.type === 'mcq' && question.options) {
    const shuffled = [...question.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return { ...question, options: shuffled };
  }
  return question;
};

// ✅ MAINTAINED: Score calculation utilities
export const calculatePartialCredit = (userAnswer: any, correctAnswer: any, questionType: string): number => {
  switch (questionType.toLowerCase()) {
    case 'fill-blank':
      if (Array.isArray(correctAnswer) && typeof userAnswer === 'object') {
        const correctCount = Object.keys(userAnswer).filter(key => 
          correctAnswer.some((correct: any) => 
            correct.id === key && correct.correctAnswers.includes(userAnswer[key])
          )
        ).length;
        return correctCount / correctAnswer.length;
      }
      break;
      
    case 'match-click':
      if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
        const correctMatches = userAnswer.filter(match =>
          correctAnswer.some((correct: any) =>
            correct.leftId === match.leftId && correct.rightId === match.rightId
          )
        ).length;
        return correctMatches / correctAnswer.length;
      }
      break;
      
    case 'short-answer':
      // This would typically involve more sophisticated NLP analysis
      // For now, return basic keyword matching score
      if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
        const userWords = userAnswer.toLowerCase().split(/\s+/);
        const correctWords = correctAnswer.toLowerCase().split(/\s+/);
        const matchedWords = userWords.filter(word => correctWords.includes(word));
        return Math.min(1, matchedWords.length / (correctWords.length * 0.6));
      }
      break;
      
    default:
      return userAnswer === correctAnswer ? 1 : 0;
  }
  
  return 0;
};

// ✅ ENHANCED: Question Analytics and Insights
export const generateQuestionInsights = (responses: QuestionResponse[]): {
  averageTime: number;
  successRate: number;
  commonMistakes: string[];
  recommendations: string[];
} => {
  if (responses.length === 0) {
    return {
      averageTime: 0,
      successRate: 0,
      commonMistakes: [],
      recommendations: ['Complete some questions to see insights']
    };
  }

  const correctResponses = responses.filter(r => r.isCorrect);
  const successRate = correctResponses.length / responses.length;
  
  const recommendations: string[] = [];
  if (successRate < 0.5) {
    recommendations.push('Review the fundamental concepts');
    recommendations.push('Try easier questions first');
  } else if (successRate < 0.8) {
    recommendations.push('Focus on understanding common mistakes');
    recommendations.push('Practice more questions at this level');
  } else {
    recommendations.push('Try more challenging questions');
    recommendations.push('Help others with similar topics');
  }

  return {
    averageTime: 0, // Would calculate from timestamp differences
    successRate,
    commonMistakes: [], // Would analyze from incorrect responses
    recommendations
  };
};

// ✅ ENHANCED: Export utility functions as a single object
export const QuestionUtils = {
  validateQuestionData,
  trackQuestionPerformance,
  getAriaLabel,
  calculateQuestionDifficulty,
  shuffleOptions,
  calculatePartialCredit,
  getRendererForQuestionType,
  generateQuestionInsights,
  createQuestionResponseAdapter
};

// ✅ ENHANCED: Default export with all renderers and utilities
export default {
  // Core renderers (with dual interface support)
  MCQRenderer,
  FillBlankRenderer,
  MatchClickRenderer,
  ShortAnswerRenderer,
  
  // Future renderers
  TrueFalseRenderer,
  DragDropRenderer,
  OrderingRenderer,
  HotspotRenderer,
  
  // Universal renderer
  UniversalQuestionRenderer,
  
  // Utilities
  QuestionUtils,
  
  // Helper functions
  getRendererForQuestionType,
  validateQuestionData,
  calculateQuestionDifficulty,
  shuffleOptions,
  calculatePartialCredit,
  trackQuestionPerformance,
  getAriaLabel,
  generateQuestionInsights,
  
  // Interface adapters
  createQuestionResponseAdapter
};