// =====================================
// 📁 src/components/questions/QuestionBlock/hooks/useQuestionBlockState.ts
// =====================================
import { useState, useReducer, useMemo, useCallback } from 'react';
import { QuestionResponse } from '../types/questionBlock';

// 🎯 Complete State Interface
export interface QuestionBlockState {
  // Core question flow
  currentQuestionIndex: number;
  responses: QuestionResponse[];
  showFeedback: boolean;
  attempts: number;
  isCompleted: boolean;
  
  // Timing management
  startTime: Date | null;
  questionStartTime: Date | null;
  
  // Enhanced feedback flow (absorbed from original QuestionBlock)
  feedbackAcknowledged: boolean;
  canContinue: boolean;
  showContinueButton: boolean;
  currentResponse: QuestionResponse | null;
  learningQuote: string;
  
  // Rendering system (absorbed from UniversalQuestionRenderer)
  renderingMode: 'individual' | 'universal' | 'error';
  validationResult: any;
  
  // Performance tracking (NEW enhancement)
  sessionMetrics: {
    questionsAttempted: number;
    totalTime: number;
    averageResponseTime: number;
  };
}

// 🎯 Action Types for Reducer
export type QuestionBlockAction = 
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'ADD_RESPONSE'; payload: QuestionResponse }
  | { type: 'SET_FEEDBACK'; payload: { show: boolean; response?: QuestionResponse | null } }
  | { type: 'SET_CONTINUE_STATE'; payload: { canContinue: boolean; showButton: boolean } }
  | { type: 'SET_LEARNING_QUOTE'; payload: string }
  | { type: 'SET_COMPLETION'; payload: boolean }
  | { type: 'SET_RENDERING_MODE'; payload: 'individual' | 'universal' | 'error' }
  | { type: 'SET_VALIDATION'; payload: any }
  | { type: 'SET_TIMING'; payload: { startTime?: Date; questionStartTime?: Date } }
  | { type: 'UPDATE_METRICS'; payload: Partial<QuestionBlockState['sessionMetrics']> }
  | { type: 'RESET_BLOCK' };

// 🎯 Advanced Reducer (replaces 15+ useState hooks)
const questionBlockReducer = (
  state: QuestionBlockState, 
  action: QuestionBlockAction
): QuestionBlockState => {
  switch (action.type) {
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: action.payload,
        showFeedback: false,
        feedbackAcknowledged: false,
        canContinue: false,
        showContinueButton: false,
        currentResponse: null,
        learningQuote: '',
        questionStartTime: new Date()
      };
      
    case 'ADD_RESPONSE':
      const updatedResponses = [...state.responses];
      updatedResponses[state.currentQuestionIndex] = action.payload;
      
      // Update session metrics
      const newMetrics = {
        ...state.sessionMetrics,
        questionsAttempted: state.sessionMetrics.questionsAttempted + 1,
        totalTime: state.sessionMetrics.totalTime + (action.payload.timeSpent || 0),
        averageResponseTime: state.sessionMetrics.questionsAttempted > 0 
          ? (state.sessionMetrics.totalTime + (action.payload.timeSpent || 0)) / (state.sessionMetrics.questionsAttempted + 1)
          : (action.payload.timeSpent || 0)
      };
      
      return {
        ...state,
        responses: updatedResponses,
        currentResponse: action.payload,
        showFeedback: true,
        attempts: action.payload.isCorrect ? state.attempts : state.attempts + 1,
        sessionMetrics: newMetrics
      };
      
    case 'SET_FEEDBACK':
      return {
        ...state,
        showFeedback: action.payload.show,
        currentResponse: action.payload.response !== undefined ? action.payload.response : state.currentResponse,
        feedbackAcknowledged: !action.payload.show
      };
      
    case 'SET_CONTINUE_STATE':
      return {
        ...state,
        canContinue: action.payload.canContinue,
        showContinueButton: action.payload.showButton
      };
      
    case 'SET_LEARNING_QUOTE':
      return {
        ...state,
        learningQuote: action.payload
      };
      
    case 'SET_COMPLETION':
      return { 
        ...state, 
        isCompleted: action.payload 
      };
      
    case 'SET_RENDERING_MODE':
      return { 
        ...state, 
        renderingMode: action.payload 
      };
      
    case 'SET_VALIDATION':
      return {
        ...state,
        validationResult: action.payload
      };
      
    case 'SET_TIMING':
      return {
        ...state,
        startTime: action.payload.startTime || state.startTime,
        questionStartTime: action.payload.questionStartTime || state.questionStartTime
      };
      
    case 'UPDATE_METRICS':
      return {
        ...state,
        sessionMetrics: {
          ...state.sessionMetrics,
          ...action.payload
        }
      };
      
    case 'RESET_BLOCK':
      return {
        ...initialState,
        startTime: new Date(),
        questionStartTime: new Date(),
        sessionMetrics: {
          questionsAttempted: 0,
          totalTime: 0,
          averageResponseTime: 0
        }
      };
      
    default:
      return state;
  }
};

// 🎯 Initial State
const initialState: QuestionBlockState = {
  currentQuestionIndex: 0,
  responses: [],
  showFeedback: false,
  attempts: 0,
  isCompleted: false,
  startTime: new Date(),
  questionStartTime: new Date(),
  feedbackAcknowledged: false,
  canContinue: false,
  showContinueButton: false,
  currentResponse: null,
  learningQuote: '',
  renderingMode: 'individual',
  validationResult: null,
  sessionMetrics: {
    questionsAttempted: 0,
    totalTime: 0,
    averageResponseTime: 0
  }
};

// 🎯 Main Hook - Replaces 15+ useState hooks
export const useQuestionBlockState = () => {
  const [state, dispatch] = useReducer(questionBlockReducer, initialState);
  
  // 🎯 Memoized selectors for performance optimization
  const selectors = useMemo(() => ({
    // Question navigation
    currentQuestion: (questions: any[]) => questions[state.currentQuestionIndex],
    isLastQuestion: (totalQuestions: number) => state.currentQuestionIndex === totalQuestions - 1,
    isFirstQuestion: () => state.currentQuestionIndex === 0,
    
    // Progress calculations
    completionRate: (totalQuestions: number) => {
      const completed = state.responses.filter(r => r).length;
      return totalQuestions > 0 ? (completed / totalQuestions) * 100 : 0;
    },
    
    // Score calculations
    averageScore: () => {
      const validResponses = state.responses.filter(r => r);
      return validResponses.length > 0 
        ? validResponses.reduce((sum, r) => sum + r.score, 0) / validResponses.length 
        : 0;
    },
    
    totalScore: () => {
      return state.responses.reduce((sum, r) => sum + (r?.score || 0), 0);
    },
    
    correctAnswers: () => {
      return state.responses.filter(r => r?.isCorrect).length;
    },
    
    // Performance metrics
    sessionSummary: () => ({
      questionsCompleted: state.responses.filter(r => r).length,
      totalQuestions: state.responses.length,
      averageScore: selectors.averageScore(),
      totalTime: state.sessionMetrics.totalTime,
      averageResponseTime: state.sessionMetrics.averageResponseTime,
      successRate: state.responses.length > 0 
        ? state.responses.filter(r => r?.isCorrect).length / state.responses.filter(r => r).length 
        : 0
    }),
    
    // State flags
    canProceed: () => state.canContinue && state.showContinueButton,
    hasValidationErrors: () => state.validationResult && !state.validationResult.isValid,
    isInProgress: () => state.responses.filter(r => r).length > 0 && !state.isCompleted
  }), [state]);
  
  // 🎯 Optimized action creators
  const actions = useMemo(() => ({
    setCurrentQuestion: (index: number) => 
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: index }),
    
    addResponse: (response: QuestionResponse) =>
      dispatch({ type: 'ADD_RESPONSE', payload: response }),
    
    setFeedback: (show: boolean, response?: QuestionResponse | null) =>
      dispatch({ type: 'SET_FEEDBACK', payload: { show, response } }),
    
    setContinueState: (canContinue: boolean, showButton: boolean) =>
      dispatch({ type: 'SET_CONTINUE_STATE', payload: { canContinue, showButton } }),
    
    setLearningQuote: (quote: string) =>
      dispatch({ type: 'SET_LEARNING_QUOTE', payload: quote }),
    
    setCompletion: (completed: boolean) =>
      dispatch({ type: 'SET_COMPLETION', payload: completed }),
    
    setRenderingMode: (mode: 'individual' | 'universal' | 'error') =>
      dispatch({ type: 'SET_RENDERING_MODE', payload: mode }),
    
    setValidation: (result: any) =>
      dispatch({ type: 'SET_VALIDATION', payload: result }),
    
    updateTiming: (timing: { startTime?: Date; questionStartTime?: Date }) =>
      dispatch({ type: 'SET_TIMING', payload: timing }),
    
    updateMetrics: (metrics: Partial<QuestionBlockState['sessionMetrics']>) =>
      dispatch({ type: 'UPDATE_METRICS', payload: metrics }),
    
    resetBlock: () =>
      dispatch({ type: 'RESET_BLOCK' })
  }), []);
  
  // 🎯 Advanced state utilities
  const utilities = useMemo(() => ({
    // Navigation helpers
    canGoNext: (totalQuestions: number) => 
      state.currentQuestionIndex < totalQuestions - 1,
    
    canGoPrevious: () => 
      state.currentQuestionIndex > 0,
    
    // Progress helpers
    getQuestionStatus: (questionIndex: number) => {
      if (questionIndex > state.currentQuestionIndex) return 'upcoming';
      if (questionIndex === state.currentQuestionIndex) return 'current';
      if (state.responses[questionIndex]) return 'completed';
      return 'skipped';
    },
    
    // Performance analysis
    getPerformanceTrend: () => {
      if (state.responses.length < 3) return 'insufficient-data';
      
      const recent = state.responses.slice(-3).filter(r => r);
      const earlier = state.responses.slice(0, -3).filter(r => r);
      
      if (recent.length === 0 || earlier.length === 0) return 'insufficient-data';
      
      const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, r) => sum + r.score, 0) / earlier.length;
      
      if (recentAvg > earlierAvg + 1) return 'improving';
      if (recentAvg < earlierAvg - 1) return 'declining';
      return 'stable';
    },
    
    // Time management
    getTimeSpentOnCurrentQuestion: () => {
      if (!state.questionStartTime) return 0;
      return Date.now() - state.questionStartTime.getTime();
    },
    
    getTotalSessionTime: () => {
      if (!state.startTime) return 0;
      return Date.now() - state.startTime.getTime();
    }
  }), [state]);
  
  return {
    state,
    dispatch,
    selectors,
    actions,
    utilities
  };
};

// 🎯 Hook for question-specific state
export const useQuestionState = (questionIndex: number) => {
  const { state, selectors } = useQuestionBlockState();
  
  return useMemo(() => ({
    response: state.responses[questionIndex],
    isCompleted: !!state.responses[questionIndex],
    isCurrent: state.currentQuestionIndex === questionIndex,
    isPast: questionIndex < state.currentQuestionIndex,
    isFuture: questionIndex > state.currentQuestionIndex,
    status: questionIndex > state.currentQuestionIndex ? 'upcoming' :
            questionIndex === state.currentQuestionIndex ? 'current' :
            state.responses[questionIndex] ? 'completed' : 'skipped'
  }), [state, questionIndex]);
};