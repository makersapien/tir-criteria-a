 // =====================================
// 📁 src/components/questions/QuestionBlock/hooks/useQuestionBlockEffects.ts
// =====================================
import { useEffect } from 'react';
import { QuestionBlockState, QuestionBlockAction } from './useQuestionBlockState';

interface UseQuestionBlockEffectsProps {
  useUniversalRenderer?: boolean;
  enableEnhancedValidation?: boolean;
  fallbackToIndividual?: boolean;
  currentQuestion?: any;
  block?: any;
}

export const useQuestionBlockEffects = (
  state: QuestionBlockState,
  actions: any,
  dispatch: React.Dispatch<QuestionBlockAction>, // ✅ FIXED: Properly typed dispatch
  props: UseQuestionBlockEffectsProps
) => {
  // 🎯 Initialize timing and rendering mode on mount
  useEffect(() => {
    const now = new Date();
    dispatch({ 
      type: 'SET_TIMING', 
      payload: { 
        startTime: now, 
        questionStartTime: now 
      }
    });
    
    // 🎯 Determine rendering mode based on props
    if (props.useUniversalRenderer) {
      if (props.enableEnhancedValidation && props.currentQuestion) {
        // ✅ FIXED: Simple validation check to avoid missing QuestionValidator
        const isValidQuestion = props.currentQuestion && 
                               props.currentQuestion.id && 
                               props.currentQuestion.type &&
                               props.currentQuestion.question;
        
        if (isValidQuestion) {
          dispatch({ type: 'SET_RENDERING_MODE', payload: 'universal' });
        } else if (props.fallbackToIndividual) {
          console.warn(`Question ${props.currentQuestion?.id || 'unknown'} failed validation, falling back to individual components`);
          dispatch({ type: 'SET_RENDERING_MODE', payload: 'individual' });
        } else {
          dispatch({ type: 'SET_RENDERING_MODE', payload: 'error' });
        }
      } else {
        dispatch({ type: 'SET_RENDERING_MODE', payload: 'universal' });
      }
    } else {
      dispatch({ type: 'SET_RENDERING_MODE', payload: 'individual' });
    }
  }, [dispatch, props.useUniversalRenderer, props.enableEnhancedValidation, props.fallbackToIndividual, props.currentQuestion]);

  // 🎯 Reset question-specific state when question changes
  useEffect(() => {
    dispatch({ 
      type: 'SET_TIMING', 
      payload: { questionStartTime: new Date() } 
    });
    
    dispatch({ 
      type: 'SET_FEEDBACK', 
      payload: { show: false } 
    });
    
    dispatch({ 
      type: 'SET_CONTINUE_STATE', 
      payload: { canContinue: false, showButton: false } 
    });
  }, [state.currentQuestionIndex, dispatch]);

  // 🎯 Auto-continue logic based on feedback state
  useEffect(() => {
    if (state.showFeedback && state.currentResponse) {
      const minimumReadTime = state.currentResponse.isCorrect ? 3000 : 5000;
      
      const timer = setTimeout(() => {
        actions.setContinueState(true, true);
      }, minimumReadTime);

      return () => clearTimeout(timer);
    }
  }, [state.showFeedback, state.currentResponse, actions]);

  // 🎯 Enhanced validation effect (if validation is enabled)
  useEffect(() => {
    if (props.currentQuestion && props.enableEnhancedValidation) {
      // ✅ FIXED: Simple validation without external dependencies
      const validation = {
        isValid: !!(props.currentQuestion.id && props.currentQuestion.type && props.currentQuestion.question),
        errors: [],
        warnings: []
      };
      
      if (!props.currentQuestion.id) validation.errors.push('Missing question ID');
      if (!props.currentQuestion.type) validation.errors.push('Missing question type');
      if (!props.currentQuestion.question) validation.errors.push('Missing question text');
      
      dispatch({ type: 'SET_VALIDATION', payload: validation });
    }
  }, [props.currentQuestion, props.enableEnhancedValidation, dispatch]);

  // 🎯 Performance metrics tracking
  useEffect(() => {
    if (state.startTime) {
      const sessionTime = Date.now() - state.startTime.getTime();
      dispatch({
        type: 'UPDATE_METRICS',
        payload: {
          totalTime: sessionTime
        }
      });
    }
  }, [state.currentQuestionIndex, state.startTime, dispatch]);

  // 🎯 Clean up timers on unmount
  useEffect(() => {
    return () => {
      // Clean up any pending timers
      // This effect runs on unmount
    };
  }, []);
};