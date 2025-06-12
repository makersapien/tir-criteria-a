// QuestionBlock/types/index.ts  
// ✅ FIXED: Use export * for questionBlock since ValidationResult was removed from it
export * from './questionBlock';

// ✅ FIXED: Explicit exports from validation to ensure clean imports
export type {
  ValidationResult,
  ValidationConfig
} from './validation';

// Export everything else
export * from './analytics';
export * from './QuestionValidator';

// DON'T export from useQuestionBlockState.ts here
// Let hooks/index.ts handle those exports