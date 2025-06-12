// QuestionBlock/hooks/index.ts
// 📦 HOOKS BARREL EXPORT

export { useQuestionBlockState } from './useQuestionBlockState';
export { useQuestionBlockLogic } from './useQuestionBlockLogic';
export { useQuestionBlockEffects } from './useQuestionBlockEffects';

// Export hook-related types (if they exist in the hook files)
export type {
  QuestionBlockState,
  QuestionBlockAction,
} from './useQuestionBlockState';