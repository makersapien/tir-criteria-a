// QuestionBlock/types/questionBlock.ts
// 🎯 MODULAR TYPES - Self-contained and compatible with all components

export type QuestionType = 'mcq' | 'fill-blank' | 'match-click' | 'short-answer';
export type QuestionLevel = 2 | 4 | 6 | 8;

// ✅ FIXED: Complete Question Types with explanation property
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
  explanation: string; // ✅ ADDED: This was missing and causing the error
  timeSpent?: number; // ✅ ADDED: Optional tracking (for compatibility with questionSystem.ts)
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    level?: number; // For partial credit
  }[];
  // explanation is inherited from BaseQuestion
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
  // explanation is inherited from BaseQuestion
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
  // explanation is inherited from BaseQuestion
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer';
  minWords?: number;
  maxWords?: number;
  sampleAnswer: string;
  evaluationCriteria: {
    requiredKeywords: string[];
    requiredConcepts: string[];
    levelDescriptors: { // ✅ FIXED: Made required (not optional) to match questionSystem.ts
      level: number;
      description: string;
      keywords: string[];
    }[];
  };
  // explanation is inherited from BaseQuestion
}

export type Question = MCQQuestion | FillBlankQuestion | MatchClickQuestion | ShortAnswerQuestion;

// ✅ QuestionResponse (enhanced for better compatibility)
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
  score: number; // 0-8 based on performance
  attempts: number;
  maxAttempts: number;
  completedQuestions: number;
  totalQuestions: number;
}

// ✅ Additional types for the modular system
export interface StrandData {
  strand: number;
  learningPath: 'critical-angle' | 'fiber-optics';
  title: string;
  description: string;
  blocks: QuestionBlock[];
}

// ✅ ENHANCED: Additional types for better modular functionality
export interface EvaluationResult<T = any> {
  isCorrect: boolean;
  score: number;
  feedback: string;
  partialCredit?: number;
  hints?: string[];
  explanation?: string;
  detailedAnalysis?: T;
}

// ✅ ValidationResult is imported from validation.ts - no need to redefine here

// ✅ Progress tracking types
export interface QuestionBlockProgress {
  blockId: string;
  progress: number; // 0-100
  timeSpent: number; // in minutes
  attempts: number;
  lastAccessed: Date;
  bestScore: number;
}

export interface StrandProgress {
  strandNumber: number;
  overallProgress: number;
  blocks: QuestionBlockProgress[];
  badges: string[];
  totalTimeSpent: number;
  averageScore: number;
}

// ✅ Rendering and configuration types
export type RenderingMode = 'standard' | 'universal' | 'hybrid';
export type SyncStatus = 'idle' | 'saving' | 'success' | 'error';
export type ExperimentType = 'critical-angle' | 'fiber-optics' | 'distance' | 'magnets';

// ✅ Component prop interfaces for better type safety
export interface QuestionComponentProps {
  question: Question;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  previousResponse?: QuestionResponse;
}

export interface MCQComponentProps extends QuestionComponentProps {
  question: MCQQuestion;
}

export interface FillBlankComponentProps extends QuestionComponentProps {
  question: FillBlankQuestion;
}

export interface MatchClickComponentProps extends QuestionComponentProps {
  question: MatchClickQuestion;
}

export interface ShortAnswerComponentProps extends QuestionComponentProps {
  question: ShortAnswerQuestion;
}

// ✅ Utility types for filtering and searching
export type QuestionFilter = {
  type?: QuestionType;
  level?: QuestionLevel;
  strand?: number;
  learningPath?: 'critical-angle' | 'fiber-optics';
  concept?: string;
};

export interface QuestionSearchResult {
  questions: Question[];
  total: number;
  filtered: number;
}

// ✅ Configuration interfaces
export interface QuestionBlockConfig {
  id: string;
  level: QuestionLevel;
  maxAttempts: number;
  unlockConditions?: {
    minimumScore?: number;
    requiredQuestions?: string[];
    prerequisiteBlocks?: string[];
  };
}

export interface ModularQuestionSystemConfig {
  experimentType: ExperimentType;
  currentStrand: number;
  renderingMode: RenderingMode;
  enableValidation: boolean;
  autoSave: boolean;
  debugMode: boolean;
}