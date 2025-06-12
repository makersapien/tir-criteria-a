import { useState, useReducer, useMemo } from 'react';
import { QuestionResponse } from '../types/questionBlock';

// 🎯 State shape - consolidated from 15+ useState hooks
interface QuestionBlockState {
  // Core flow
  currentQuestionIndex: number;
  responses: QuestionResponse[];
  showFeedback: boolean;
  attempts: number;
  isCompleted: boolean;
  
  // Timing
  startTime: Date | null;
  questionStartTime: Date | null;
  
  // Enhanced feedback flow (absorbed from original)
  feedbackAcknowledged: boolean;
  canContinue: boolean;
  showContinueButton: boolean;
  currentResponse: QuestionResponse | null;
  learningQuote: string;
  
  // Rendering (absorbed from UniversalQuestionRenderer)
  renderingMode: 'individual' | 'universal' | 'error';
  validationResult: any;
}

// 🎯 Action types for reducer
type QuestionBlockAction = 
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'ADD_RESPONSE'; payload: QuestionResponse }
  | { type: 'SET_FEEDBACK'; payload: { show: boolean; response?: QuestionResponse | null } }
  | { type: 'SET_CONTINUE_STATE'; payload: { canContinue: boolean; showButton: boolean } }
  | { type: 'SET_COMPLETION'; payload: boolean }
  | { type: 'RESET_BLOCK' }
  | { type: 'SET_RENDERING_MODE'; payload: 'individual' | 'universal' | 'error' };

// 🎯 Reducer for complex state management
const questionBlockReducer = (state: QuestionBlockState, action: QuestionBlockAction): QuestionBlockState => {
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
        questionStartTime: new Date()
      };
      
    case 'ADD_RESPONSE':
      const updatedResponses = [...state.responses];
      updatedResponses[state.currentQuestionIndex] = action.payload;
      return {
        ...state,
        responses: updatedResponses,
        currentResponse: action.payload,
        showFeedback: true,
        attempts: action.payload.isCorrect ? state.attempts : state.attempts + 1
      };
      
    case 'SET_FEEDBACK':
      return {
        ...state,
        showFeedback: action.payload.show,
        currentResponse: action.payload.response || state.currentResponse
      };
      
    case 'SET_CONTINUE_STATE':
      return {
        ...state,
        canContinue: action.payload.canContinue,
        showContinueButton: action.payload.showButton
      };
      
    case 'SET_COMPLETION':
      return { ...state, isCompleted: action.payload };
      
    case 'SET_RENDERING_MODE':
      return { ...state, renderingMode: action.payload };
      
    case 'RESET_BLOCK':
      return {
        ...state,
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
        learningQuote: ''
      };
      
    default:
      return state;
  }
};

// 🎯 Initial state
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
  validationResult: null
};

// 🎯 Main hook - replaces 15+ useState hooks
export const useQuestionBlockState = () => {
  const [state, dispatch] = useReducer(questionBlockReducer, initialState);
  
  // 🎯 Memoized selectors for performance
  const selectors = useMemo(() => ({
    currentQuestion: (questions: any[]) => questions[state.currentQuestionIndex],
    isLastQuestion: (totalQuestions: number) => state.currentQuestionIndex === totalQuestions - 1,
    completionRate: (totalQuestions: number) => 
      (state.responses.filter(r => r).length / totalQuestions) * 100,
    averageScore: () => {
      const validResponses = state.responses.filter(r => r);
      return validResponses.length > 0 
        ? validResponses.reduce((sum, r) => sum + r.score, 0) / validResponses.length 
        : 0;
    }
  }), [state.currentQuestionIndex, state.responses]);
  
  return {
    state,
    dispatch,
    selectors
  };
};