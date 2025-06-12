import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { QuestionResponse } from '../types/questionBlock';
import { ResponseAdapter } from '../services/adapters/ResponseAdapter';
import { PerformanceTracker } from '../services/analytics/PerformanceTracker';

interface UseQuestionBlockLogicProps {
  block: any;
  onComplete: (blockId: string, responses: QuestionResponse[], averageScore: number) => void;
  onUnlock?: (nextLevel: number) => void;
  onProgressUpdate?: (blockId: string, currentQuestion: number, totalQuestions: number, currentScore: number) => void;
}

export const useQuestionBlockLogic = (
  state: any,
  dispatch: any,
  selectors: any,
  props: UseQuestionBlockLogicProps
) => {
  const currentQuestion = selectors.currentQuestion(props.block.questions);
  const isLastQuestion = selectors.isLastQuestion(props.block.questions.length);

  // 🎯 Enhanced response handler (absorbed best practices)
  const handleQuestionResponse = useCallback((
    questionId: string, 
    answer: any, 
    isCorrect: boolean, 
    score: number
  ) => {
    const endTime = performance.now();
    const startTime = state.questionStartTime?.getTime() || endTime - 1000;
    
    // 🎯 Track performance metrics
    const metrics = PerformanceTracker.trackPerformance(
      questionId,
      startTime,
      endTime,
      isCorrect,
      state.attempts + 1
    );

    // 🎯 Create response object
    const response: QuestionResponse = {
      questionId,
      type: currentQuestion.type,
      answer,
      isCorrect,
      score,
      feedback: ResponseAdapter.generateFeedback(isCorrect, score, currentQuestion.level),
      timestamp: new Date(),
      timeSpent: endTime - startTime
    };

    // 🎯 Update state through reducer
    dispatch({ type: 'ADD_RESPONSE', payload: response });

    // 🎯 Celebration system (absorbed from original)
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

    // 🎯 Progress tracking
    const currentScore = selectors.averageScore();
    props.onProgressUpdate?.(
      props.block.id, 
      state.currentQuestionIndex + 1, 
      props.block.questions.length, 
      currentScore
    );

    // 🎯 Continue button timing (absorbed from original)
    const minimumReadTime = isCorrect ? 3000 : 5000;
    setTimeout(() => {
      dispatch({ 
        type: 'SET_CONTINUE_STATE', 
        payload: { canContinue: true, showButton: true } 
      });
    }, minimumReadTime);
  }, [state, dispatch, selectors, currentQuestion, props]);

  // 🎯 Continue handler (absorbed and enhanced)
  const handleContinue = useCallback(() => {
    if (!state.canContinue) return;

    dispatch({ type: 'SET_FEEDBACK', payload: { show: false } });
    dispatch({ type: 'SET_CONTINUE_STATE', payload: { canContinue: false, showButton: false } });

    if (isLastQuestion) {
      const totalScore = state.responses.reduce((sum: number, r: QuestionResponse) => 
        sum + (r?.score || 0), 0);
      const averageScore = totalScore / state.responses.length;
      
      dispatch({ type: 'SET_COMPLETION', payload: true });
      props.onComplete(props.block.id, state.responses, averageScore);
      
      // 🎯 Completion celebration
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
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: state.currentQuestionIndex + 1 });
    }
  }, [state, dispatch, isLastQuestion, props]);

  // 🎯 Reset handler
  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET_BLOCK' });
  }, [dispatch]);

  return {
    handleQuestionResponse,
    handleContinue,
    handleReset,
    currentQuestion,
    isLastQuestion
  };
};
