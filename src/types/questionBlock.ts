// src/types/questionBlock.ts
// Re-export everything from the integrated question system

// Re-export from question implementations
export * from '../components/questions/questionImplementations';

// Re-export from question system context
export * from '../contexts/questionSystemContext';

// Re-export from utils (evaluation functions)
export * from '../utils/integrationFixes';

// Core types that tie everything together
export type QuestionLevel = 2 | 4 | 6 | 8;
export type ExperimentType = 'critical-angle' | 'fiber-optics' | 'distance' | 'magnets';

export interface StrandData {
  strand: number;
  title: string;
  description: string;
  blocks: QuestionBlock[];
}

export interface QuestionBlock {
  id: string;
  level: QuestionLevel;
  questions: Question[];
  completed: boolean;
  score: number;
  unlocked: boolean;
  attempts: number;
  maxAttempts: number;
  completedQuestions: number;
  totalQuestions: number;
}