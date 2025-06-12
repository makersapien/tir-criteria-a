// src/types/questionBlock.ts - MINIMAL FIX
import type {
  Question,
  QuestionBlock as SystemQuestionBlock,
  QuestionResponse,
  QuestionLevel,
} from './questionSystem';

// Re-export core types
export type { Question, QuestionResponse, QuestionLevel };
export type ExperimentType = 'critical-angle' | 'fiber-optics' | 'distance' | 'magnets';

// Main interfaces
export interface QuestionBlock extends SystemQuestionBlock {}

export interface StrandData {
  strand: number;
  title: string;
  description: string;
  blocks: QuestionBlock[];
}

// App-specific types
export type RenderingMode = 'standard' | 'universal' | 'hybrid';
export type SyncStatus = 'idle' | 'saving' | 'success' | 'error';