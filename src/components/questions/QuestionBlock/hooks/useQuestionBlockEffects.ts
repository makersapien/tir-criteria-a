import { useEffect } from 'react';
import { QuestionValidator } from '../types/QuestionValidator';

interface UseQuestionBlockEffectsProps {
  useUniversalRenderer?: boolean;
  enableEnhancedValidation?: boolean;
  fallbackToIndividual?: boolean;
  currentQuestion?: any;
}

export const useQuestionBlockEffects = (
  state: any,
  dispatch: any,
  props: UseQuestionBlockEffectsProps
) => {
  // 🎯 Initialize timing and rendering mode (absorbed from original)
  useEffect(() => {
    // Set initial timing
    const now = new Date();
    dispatch({ type: 'SET_TIMING', payload: { startTime: now, questionStartTime: now } });
    
    // 🎯 Determine rendering mode (absorbed from UniversalQuestionRenderer)
    if (props.useUniversalRenderer) {
      if (props.enableEnhancedValidation && props.currentQuestion) {
        const validation = QuestionValidator.validateEnhanced(props.currentQuestion);
        if (validation.isValid) {
          dispatch({ type: 'SET_RENDERING_MODE', payload: 'universal' });
        } else if (props.fallbackToIndividual) {
          console.warn(`Question ${props.currentQuestion.id} failed validation, falling back to individual components`);
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
  }, [props.useUniversalRenderer, props.enableEnhancedValidation, props.fallbackToIndividual]);

  // 🎯 Reset state for new questions (absorbed from original)
  useEffect(() => {
    dispatch({ type: 'SET_TIMING', payload: { questionStartTime: new Date() } });
    dispatch({ type: 'SET_FEEDBACK', payload: { show: false } });
    dispatch({ type: 'SET_CONTINUE_STATE', payload: { canContinue: false, showButton: false } });
  }, [state.currentQuestionIndex]);

  // 🎯 Validation effect (NEW enhancement)
  useEffect(() => {
    if (props.currentQuestion && props.enableEnhancedValidation) {
      const validation = QuestionValidator.validateEnhanced(props.currentQuestion);
      dispatch({ type: 'SET_VALIDATION', payload: validation });
    }
  }, [props.currentQuestion, props.enableEnhancedValidation]);
};