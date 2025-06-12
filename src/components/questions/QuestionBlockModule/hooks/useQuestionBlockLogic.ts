// =====================================
// 📁 src/components/questions/QuestionBlock/hooks/useQuestionBlockLogic.ts
// =====================================
import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { QuestionResponse } from '../types/questionBlock';
import { QuestionBlockState, QuestionBlockAction } from './useQuestionBlockState';

interface UseQuestionBlockLogicProps {
  block: any;
  onComplete: (blockId: string, responses: QuestionResponse[], averageScore: number) => void;
  onUnlock?: (nextLevel: number) => void;
  onProgressUpdate?: (blockId: string, currentQuestion: number, totalQuestions: number, currentScore: number) => void;
}

// ✅ Local feedback generator to replace external dependencies
const generateFeedback = (isCorrect: boolean, score: number, level: number): string => {
  if (isCorrect) {
    const excellent = [
      'Outstanding work! You truly understand this concept.',
      'Brilliant! Your mastery of this topic is impressive.',
      'Exceptional performance! Keep up the excellent work.',
      'Perfect! You\'ve demonstrated deep understanding.',
      'Excellent! Your analytical skills are sharp.'
    ];
    
    const good = [
      'Great job! You\'re doing well with this material.',
      'Nice work! You\'re building solid understanding.',
      'Good effort! You\'re on the right track.',
      'Well done! Keep practicing and you\'ll master this.',
      'Solid work! Your progress is encouraging.'
    ];
    
    if (score >= level * 0.85) {
      return excellent[Math.floor(Math.random() * excellent.length)];
    } else {
      return good[Math.floor(Math.random() * good.length)];
    }
  } else {
    const encouraging = [
      'Good attempt! Learning takes practice - keep going.',
      'Nice try! Review the concepts and try again.',
      'Keep working on it! You\'re building understanding.',
      'Good effort! Consider reviewing the key concepts.',
      'Don\'t give up! Learning is a process.'
    ];
    
    return encouraging[Math.floor(Math.random() * encouraging.length)];
  }
};

export const useQuestionBlockLogic = (
  state: QuestionBlockState,
  actions: any,
  selectors: any,
  props: UseQuestionBlockLogicProps
) => {
  const currentQuestion = selectors.currentQuestion(props.block.questions);
  const isLastQuestion = selectors.isLastQuestion(props.block.questions.length);

  // 🎯 Enhanced response handler with performance tracking
  const handleQuestionResponse = useCallback((
    questionId: string, 
    answer: any, 
    isCorrect: boolean, 
    score: number
  ) => {
    const endTime = Date.now();
    const startTime = state.questionStartTime?.getTime() || endTime - 1000;
    
    // 🎯 Create response object with enhanced feedback
    const response: QuestionResponse = {
      questionId,
      type: currentQuestion.type,
      answer,
      isCorrect,
      score,
      feedback: generateFeedback(isCorrect, score, currentQuestion.level || 8),
      timestamp: new Date(),
      timeSpent: endTime - startTime
    };

    // 🎯 Update state through actions
    actions.addResponse(response);

    // 🎯 Celebration system with different effects based on performance
    if (isCorrect) {
      if (score >= 7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      } else if (score >= 5) {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa', '#93c5fd']
        });
      }
    }

    // 🎯 Progress tracking - notify parent component
    const currentScore = selectors.averageScore();
    props.onProgressUpdate?.(
      props.block.id, 
      state.currentQuestionIndex + 1, 
      props.block.questions.length, 
      currentScore
    );
  }, [state, actions, selectors, currentQuestion, props]);

  // 🎯 Continue handler with completion logic
  const handleContinue = useCallback(() => {
    if (!state.canContinue) return;

    // Reset feedback state
    actions.setFeedback(false);
    actions.setContinueState(false, false);

    if (isLastQuestion) {
      // Calculate final scores
      const validResponses = state.responses.filter(r => r);
      const totalScore = validResponses.reduce((sum, r) => sum + r.score, 0);
      const averageScore = validResponses.length > 0 ? totalScore / validResponses.length : 0;
      
      // Mark as completed
      actions.setCompletion(true);
      props.onComplete(props.block.id, state.responses, averageScore);
      
      // 🎯 Completion celebration with enhanced effects
      if (averageScore >= 7) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#d97706']
        });
      }
      
      // 🎯 Level unlocking logic
      if (averageScore >= 6 && props.onUnlock) {
        const nextLevel = props.block.level === 2 ? 4 : 
                         props.block.level === 4 ? 6 : 
                         props.block.level === 6 ? 8 : null;
        if (nextLevel) props.onUnlock(nextLevel);
      }
    } else {
      // Move to next question
      actions.setCurrentQuestion(state.currentQuestionIndex + 1);
    }
  }, [state, actions, isLastQuestion, selectors, props]);

  // 🎯 Reset handler - completely reset the block
  const handleReset = useCallback(() => {
    actions.resetBlock();
  }, [actions]);

  // 🎯 Rendering mode toggle handler (for development/testing)
  const handleRenderingModeToggle = useCallback(() => {
    const currentMode = state.renderingMode || 'individual';
    const newMode = currentMode === 'universal' ? 'individual' : 'universal';
    actions.setRenderingMode(newMode);
  }, [state.renderingMode, actions]);

  // 🎯 Next level handler (for completion screen)
  const handleNext = useCallback(() => {
    if (props.onUnlock) {
      const nextLevel = props.block.level === 2 ? 4 : 
                       props.block.level === 4 ? 6 : 
                       props.block.level === 6 ? 8 : null;
      if (nextLevel) props.onUnlock(nextLevel);
    }
  }, [props]);

  // 🎯 Advanced navigation helpers
  const handlePreviousQuestion = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      actions.setCurrentQuestion(state.currentQuestionIndex - 1);
      actions.setFeedback(false);
      actions.setContinueState(false, false);
    }
  }, [state.currentQuestionIndex, actions]);

  const handleJumpToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < props.block.questions.length) {
      actions.setCurrentQuestion(index);
      actions.setFeedback(false);
      actions.setContinueState(false, false);
    }
  }, [props.block.questions.length, actions]);

  // 🎯 Performance analysis helpers
  const getPerformanceSummary = useCallback(() => {
    const validResponses = state.responses.filter(r => r);
    const correctCount = validResponses.filter(r => r.isCorrect).length;
    const totalTime = validResponses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    
    return {
      questionsAnswered: validResponses.length,
      correctAnswers: correctCount,
      accuracy: validResponses.length > 0 ? (correctCount / validResponses.length) * 100 : 0,
      averageScore: selectors.averageScore(),
      totalTime,
      averageTimePerQuestion: validResponses.length > 0 ? totalTime / validResponses.length : 0
    };
  }, [state.responses, selectors]);

  return {
    // Core handlers
    handleQuestionResponse,
    handleContinue,
    handleReset,
    handleRenderingModeToggle,
    handleNext,
    
    // Navigation helpers
    handlePreviousQuestion,
    handleJumpToQuestion,
    
    // Current state
    currentQuestion,
    isLastQuestion,
    
    // Performance analysis
    getPerformanceSummary
  };
};