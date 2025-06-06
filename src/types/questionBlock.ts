// src/types/questionBlock.ts

export type QuestionType = 'mcq' | 'fill-blank' | 'match-click' | 'short-answer';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  level: 2 | 4 | 6 | 8;
  points: number;
  question: string;
  learningPath: 'critical-angle' | 'fiber-optics';
  strand: 1 | 2 | 3 | 4;
  concept: string;
  keywords: string[];
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    level?: number; // For partial credit
  }[];
  explanation: string;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  text: string; // Text with {blank} placeholders
  blanks: {
    id: string;
    correctAnswers: string[];
    caseSensitive: boolean;
    hints?: string[];
  }[];
  explanation: string;
}

export interface MatchClickQuestion extends BaseQuestion {
  type: 'match-click';
  leftItems: {
    id: string;
    text: string;
    image?: string;
  }[];
  rightItems: {
    id: string;
    text: string;
    image?: string;
  }[];
  correctMatches: {
    leftId: string;
    rightId: string;
  }[];
  explanation: string;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer';
  minWords?: number;
  maxWords?: number;
  sampleAnswer: string;
  evaluationCriteria: {
    requiredKeywords: string[];
    requiredConcepts: string[];
    levelDescriptors: {
      level: number;
      description: string;
      keywords: string[];
    }[];
  };
}

export type Question = MCQQuestion | FillBlankQuestion | MatchClickQuestion | ShortAnswerQuestion;

export interface QuestionBlock {
  id: string;
  level: 2 | 4 | 6 | 8;
  questions: Question[];
  unlocked: boolean;
  completed: boolean;
  score: number; // 0-8 based on performance
  attempts: number;
  maxAttempts: number;
  completedQuestions: number;
  totalQuestions: number;
}

export interface QuestionResponse {
  questionId: string;
  type: QuestionType;
  answer: any;
  isCorrect: boolean;
  score: number;
  feedback: string;
  timestamp: Date;
}

export interface StrandQuestionData {
  strand: number;
  learningPath: 'critical-angle' | 'fiber-optics';
  title: string;
  description: string;
  blocks: QuestionBlock[];
}