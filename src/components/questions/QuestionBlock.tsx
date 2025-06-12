// src/components/questions/QuestionBlock.tsx
// 🎯 RESTORED: Clean Orchestrator Component with FIXED modular hooks

import React from 'react';
import { motion } from 'framer-motion';

// ✅ Restored: Modular Hooks & Services - WITH FIXES
import { 
  useQuestionBlockState,
  useQuestionBlockLogic, 
  useQuestionBlockEffects
} from './QuestionBlockModule/hooks';

// ✅ Restored: Extracted UI Components
import {
  LockedBlockDisplay,
  CompletionScreen,
  QuestionBlockHeader,
  QuestionContainer,
  EnhancedFeedback
} from './QuestionBlockModule/components';

// ✅ Restored: Types
import { QuestionBlock as QuestionBlockType } from './QuestionBlockModule/types';

interface QuestionBlockProps {
  block: QuestionBlockType;
  onComplete: (blockId: string, responses: any[], averageScore: number) => void;
  onUnlock?: (nextLevel: number) => void;
  showSuggestions?: boolean;
  onProgressUpdate?: (blockId: string, currentQuestion: number, totalQuestions: number, currentScore: number) => void;
  currentStudentId?: string;
  sessionCode?: string;
  experimentChoice?: 'critical-angle' | 'fiber-optics' | 'distance' | 'magnets';
  syncStatus?: 'idle' | 'saving' | 'success' | 'error';
  useUniversalRenderer?: boolean;
  fallbackToIndividual?: boolean;
  enableEnhancedValidation?: boolean;
}

const QuestionBlock: React.FC<QuestionBlockProps> = (props) => {
  const { block } = props;

  // ✅ FIXED: State Management with proper dispatch handling
  const { state, actions, selectors, dispatch } = useQuestionBlockState();
  
  // ✅ FIXED: Business Logic with dispatch passed correctly  
  const logic = useQuestionBlockLogic(state, actions, selectors, props);
  
  // ✅ FIXED: Side Effects with dispatch passed correctly
  useQuestionBlockEffects(state, actions, dispatch, props);

  // ✅ Helper Functions (restored for component communication)
  const getLevelColor = (level: number) => {
    const colors = {
      2: 'from-purple-200 to-purple-300',
      4: 'from-purple-300 to-purple-400', 
      6: 'from-purple-400 to-purple-500',
      8: 'from-purple-500 to-purple-600'
    };
    return colors[level as keyof typeof colors] || 'from-gray-200 to-gray-300';
  };

  const getLevelBorderColor = (level: number) => {
    const colors = {
      2: 'border-purple-300',
      4: 'border-purple-400', 
      6: 'border-purple-500',
      8: 'border-purple-600'
    };
    return colors[level as keyof typeof colors] || 'border-gray-300';
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // ✅ FIXED: Create wrapper functions that call the selector functions with proper arguments
  const getCurrentAverageScore = () => selectors.averageScore();
  const getCompletionRate = () => selectors.completionRate(block.questions.length);
  const isLastQuestion = selectors.isLastQuestion(block.questions.length);

  // ✅ RESTORED: Clean Component Orchestration
  
  // 🔒 Locked State
  if (!block.unlocked) {
    return (
      <LockedBlockDisplay 
        block={block}
        getLevelColor={getLevelColor}
        getLevelBorderColor={getLevelBorderColor}
      />
    );
  }

  // 🎉 Completion State  
  if (state.isCompleted) {
    return (
      <CompletionScreen
        block={block}
        responses={state.responses}
        startTime={state.startTime}
        renderingMode={state.renderingMode}
        getLevelColor={getLevelColor}
        getLevelBorderColor={getLevelBorderColor}
        getScoreColor={getScoreColor}
        onReset={logic.handleReset}
        onNext={logic.handleNext}
      />
    );
  }

  // 🎯 Active Question State
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} shadow-xl border-2 ${getLevelBorderColor(block.level)} overflow-hidden`}
    >
      {/* 📊 Header Section */}
      <QuestionBlockHeader
        block={block}
        currentQuestionIndex={state.currentQuestionIndex}
        responses={state.responses}
        startTime={state.startTime}
        renderingMode={state.renderingMode}
        syncStatus={props.syncStatus}
        experimentChoice={props.experimentChoice}
        getCurrentAverageScore={getCurrentAverageScore}
        getCompletionRate={getCompletionRate}
        onModeToggle={logic.handleRenderingModeToggle}
        enableDevControls={process.env.NODE_ENV === 'development'}
      />

      {/* 🧠 Question Section */}
      <QuestionContainer
        question={logic.currentQuestion}
        questionIndex={state.currentQuestionIndex}
        onAnswer={logic.handleQuestionResponse}
        previousResponse={state.responses[state.currentQuestionIndex]}
        disabled={state.showFeedback}
        showFeedback={state.showFeedback}
        renderingMode={state.renderingMode}
        useUniversalRenderer={props.useUniversalRenderer}
        enableEnhancedValidation={props.enableEnhancedValidation}
        fallbackToIndividual={props.fallbackToIndividual}
        onRenderingModeChange={actions.setRenderingMode}
      />

      {/* 💬 Feedback Section */}
      <EnhancedFeedback
        currentResponse={state.responses[state.currentQuestionIndex]}
        currentQuestion={logic.currentQuestion}
        showFeedback={state.showFeedback}
        isLastQuestion={isLastQuestion}
        onContinue={logic.handleContinue}
        disabled={false}
      />

      {/* 🎯 Accessibility Progress Announcement */}
      <div className="sr-only" aria-live="polite">
        {state.showFeedback && state.responses[state.currentQuestionIndex] && (
          <span>
            Question {state.currentQuestionIndex + 1} of {block.questions.length} {state.responses[state.currentQuestionIndex].isCorrect ? 'answered correctly' : 'answered incorrectly'}. 
            {!isLastQuestion ? 'Moving to next question.' : 'Completing level.'}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionBlock;