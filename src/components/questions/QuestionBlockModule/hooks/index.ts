// =====================================
// 📁 src/components/questions/QuestionBlock/hooks/index.ts
// 📦 HOOKS BARREL EXPORT - FIXED VERSION
// =====================================

// ✅ Export all hooks
export { useQuestionBlockState } from './useQuestionBlockState';
export { useQuestionBlockLogic } from './useQuestionBlockLogic';
export { useQuestionBlockEffects } from './useQuestionBlockEffects';

// ✅ Export hook-related types
export type {
  QuestionBlockState,
  QuestionBlockAction,
} from './useQuestionBlockState';

// ✅ Export props interfaces (if needed elsewhere)
export interface UseQuestionBlockProps {
  block: any;
  onComplete: (blockId: string, responses: any[], averageScore: number) => void;
  onUnlock?: (nextLevel: number) => void;
  onProgressUpdate?: (blockId: string, currentQuestion: number, totalQuestions: number, currentScore: number) => void;
  useUniversalRenderer?: boolean;
  enableEnhancedValidation?: boolean;
  fallbackToIndividual?: boolean;
}