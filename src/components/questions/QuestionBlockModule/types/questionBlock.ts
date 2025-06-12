// QuestionBlock/types/questionBlock.ts
// 🎯 MODULAR TYPES - Self-contained and compatible

export type QuestionType = 'mcq' | 'fill-blank' | 'match-click' | 'short-answer';
export type QuestionLevel = 2 | 4 | 6 | 8;

// ✅ Complete Question Types (matching integrationFixes structure)
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  level: QuestionLevel;
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
    level?: number;
  }[];
  explanation: string;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  text: string;
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
  // ✅ Add missing properties
  learningPath: 'critical-angle' | 'fiber-optics';
  strand: 1 | 2 | 3 | 4;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer';
  minWords?: number;
  maxWords?: number;
  sampleAnswer: string;
  evaluationCriteria: {
    requiredKeywords: string[];
    requiredConcepts: string[];
    levelDescriptors?: {
      level: number;
      description: string;
      keywords: string[];
    }[];
  };
}

export type Question = MCQQuestion | FillBlankQuestion | MatchClickQuestion | ShortAnswerQuestion;

// ✅ QuestionResponse (matching integrationFixes structure)
export interface QuestionResponse {
  questionId: string;
  type: QuestionType;
  answer: any;
  isCorrect: boolean;
  score: number;
  feedback: string;
  timestamp: Date;
  timeSpent?: number;
}

// ✅ QuestionBlock (matching integrationFixes structure exactly)
export interface QuestionBlock {
  id: string;
  level: QuestionLevel;
  questions: Question[];
  unlocked: boolean;
  completed: boolean;
  score: number;
  attempts: number;
  maxAttempts: number;
  completedQuestions: number;
  totalQuestions: number;
}

// ✅ Additional types for the module
export interface StrandData {
  strand: number;
  learningPath: 'critical-angle' | 'fiber-optics';
  title: string;
  description: string;
  blocks: QuestionBlock[];
}