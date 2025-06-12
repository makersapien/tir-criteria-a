// QuestionBlock/index.ts
// 📦 MAIN BARREL EXPORT - QuestionBlock Module

// ✅ Export hooks (must be exported for external use)
export * from './hooks';

// ✅ Export components (must be exported for external use)
export * from './components';

// ✅ Export types (must be exported for external use)
export * from './types';

// ✅ Export services (if needed externally)
export * from './services';

// ✅ Export utils (if needed externally)  
export * from './utils';

// ✅ Export constants (if needed externally)
export * from './constants';

// ✅ Specific exports that might be needed
export { useQuestionBlockState } from './hooks/useQuestionBlockState';
export { useQuestionBlockLogic } from './hooks/useQuestionBlockLogic';
export { useQuestionBlockEffects } from './hooks/useQuestionBlockEffects';

// ✅ Component exports (make sure these match your component files)
export { LockedBlockDisplay } from './components/LockedBlockDisplay';
export { CompletionScreen } from './components/CompletionScreen';
export { QuestionBlockHeader } from './components/QuestionBlockHeader';
export { QuestionContainer } from './components/QuestionContainer';
export { EnhancedFeedback } from './components/EnhancedFeedback';

// ✅ Type exports
export type { QuestionBlock } from './types/questionBlock';