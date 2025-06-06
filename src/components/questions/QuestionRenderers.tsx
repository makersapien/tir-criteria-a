// src/components/questions/QuestionRenderers.tsx
// Central hub for importing and exporting all question components
import React from 'react';
import MCQComponent from './MCQComponent';
import FillBlankComponent from './FillBlankComponent';
import MatchClickComponent from './MatchClickComponent';
import ShortAnswerComponent from './ShortAnswerComponent';
import { Question, QuestionResponse } from '../../types/questionBlock';

// Base interface for all question renderer props
export interface QuestionRendererProps {
  question: Question;
  onAnswer: (response: QuestionResponse) => void;
  showFeedback?: boolean;
}

// Re-export all individual components
export {
  MCQComponent as MCQRenderer,
  FillBlankComponent as FillBlankRenderer,
  MatchClickComponent as MatchClickRenderer,
  ShortAnswerComponent as ShortAnswerRenderer
};

// Additional question types that could be added later
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

// Helper function to get the appropriate renderer for a question type
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

// Universal Question Renderer Component
export const UniversalQuestionRenderer: React.FC<{
  question: Question;
  onAnswer: (response: QuestionResponse) => void;
  showFeedback?: boolean;
}> = ({ question, onAnswer, showFeedback = false }) => {
  const RendererComponent = getRendererForQuestionType(question.type);
  
  return (
    <RendererComponent
      question={question}
      onAnswer={onAnswer}
      showFeedback={showFeedback}
    />
  );
};

// Validation helper for question data
export const validateQuestionData = (question: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Basic required fields
  if (!question.id) errors.push('Question must have an id');
  if (!question.type) errors.push('Question must have a type');
  if (!question.question) errors.push('Question must have a question text');
  if (!question.level) errors.push('Question must have a level');
  
  // Type-specific validation
  switch (question.type) {
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

// Performance monitoring for question interactions
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
  console.log('Question Performance:', performanceData);
  return performanceData;
};

// Accessibility helpers
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

// Question difficulty calculator
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

// Question randomization utilities
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

// Score calculation utilities
export const calculatePartialCredit = (userAnswer: any, correctAnswer: any, questionType: string): number => {
  switch (questionType) {
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

// Export utility functions as a single object
export const QuestionUtils = {
  validateQuestionData,
  trackQuestionPerformance,
  getAriaLabel,
  calculateQuestionDifficulty,
  shuffleOptions,
  calculatePartialCredit,
  getRendererForQuestionType
};

// Default export with all renderers and utilities
export default {
  // Core renderers
  MCQRenderer: MCQComponent,
  FillBlankRenderer: FillBlankComponent,
  MatchClickRenderer: MatchClickComponent,
  ShortAnswerRenderer: ShortAnswerComponent,
  
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
  calculatePartialCredit
};