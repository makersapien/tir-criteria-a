// 📁 src/components/questions/QuestionBlock/index.ts
// =====================================
// Main exports for the QuestionBlock module

// 🎯 Hooks
export { useQuestionBlockState } from './hooks/useQuestionBlockState';
export { useQuestionBlockLogic } from './hooks/useQuestionBlockLogic';
export { useQuestionBlockEffects } from './hooks/useQuestionBlockEffects';

// 🎯 Services
export { QuestionValidator } from './types/QuestionValidator';
export { ResponseAdapter } from './services/adapters/ResponseAdapter';
export { PerformanceTracker } from './services/analytics/PerformanceTracker';

// 🎯 Utilities
export { questionBlockUtils } from './utils/questionBlockUtils';
export { LEARNING_QUOTES, getRandomLearningQuote } from './constants/learningQuotes';

// 🎯 Types
export type { Question, QuestionResponse, QuestionBlock } from './types/questionBlock';
export type { ValidationResult, ValidationConfig } from './types/validation';
export type { QuestionMetrics, LearningInsights } from './types/analytics';
