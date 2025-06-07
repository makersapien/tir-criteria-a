// questionSystemContext.tsx - React Context Provider (WITH JSX)

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Question,
  QuestionResponse,
  QuestionBlock,
  StrandData,
  QuestionSystemError,
  generateStrandData,
  calculateStrandProgress,
  calculateOverallProgress,
  checkBadgeEarned,
  handleQuestionError,
  validateQuestionResponse
} from '../utils/integrationFixes';

// Context Types
interface QuestionSystemState {
  currentStrand: number;
  strandData: Record<number, StrandData>;
  responses: Record<string, QuestionResponse>;
  strandProgresses: number[];
  badges: {
    principlePioneer: boolean;
    conceptCrusader: boolean;
    applicationAce: boolean;
    analysisArchitect: boolean;
  };
  loading: boolean;
  error: QuestionSystemError | null;
}

interface QuestionSystemActions {
  setCurrentStrand: (strand: number) => void;
  submitQuestionResponse: (response: QuestionResponse) => Promise<void>;
  loadStrandData: (strand: number, learningPath: 'critical-angle' | 'fiber-optics') => Promise<void>;
  resetProgress: () => void;
  clearError: () => void;
  updateProgress: (strand: number, level: number, score: number) => void;
}

interface QuestionSystemContextType extends QuestionSystemState, QuestionSystemActions {}

const QuestionSystemContext = createContext<QuestionSystemContextType | null>(null);

// Initial State
const initialState: QuestionSystemState = {
  currentStrand: 1,
  strandData: {},
  responses: {},
  strandProgresses: [0, 0, 0, 0],
  badges: {
    principlePioneer: false,
    conceptCrusader: false,
    applicationAce: false,
    analysisArchitect: false,
  },
  loading: false,
  error: null,
};

// Context Provider
export const QuestionSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QuestionSystemState>(initialState);

  // Update progress handler with badge checking
  const updateProgress = useCallback((strand: number, level: number, score: number) => {
    setState(prev => {
      const newProgresses = [...prev.strandProgresses];
      const arrayIndex = strand - 1;
      
      // Ensure valid strand index (0-3 for 4 strands)
      if (arrayIndex >= 0 && arrayIndex < 4) {
        const currentScore = newProgresses[arrayIndex] || 0;
        const newScore = Math.max(currentScore, Math.min(8, Math.max(0, score)));
        newProgresses[arrayIndex] = newScore;
        
        // Check for badge awards
        const newBadges = { ...prev.badges };
        if (checkBadgeEarned(strand, newScore, 'principlePioneer')) {
          newBadges.principlePioneer = true;
        }
        if (checkBadgeEarned(strand, newScore, 'conceptCrusader')) {
          newBadges.conceptCrusader = true;
        }
        if (checkBadgeEarned(strand, newScore, 'applicationAce')) {
          newBadges.applicationAce = true;
        }
        if (checkBadgeEarned(strand, newScore, 'analysisArchitect')) {
          newBadges.analysisArchitect = true;
        }
        
        console.log('📊 CONTEXT PROGRESS UPDATE:', {
          strand,
          oldScore: currentScore,
          newScore,
          fullProgress: newProgresses,
          badges: newBadges
        });
        
        return {
          ...prev,
          strandProgresses: newProgresses,
          badges: newBadges
        };
      } else {
        console.warn('⚠️ Invalid strand index in context:', arrayIndex);
        return prev;
      }
    });
  }, []);

  // Set current strand
  const setCurrentStrand = useCallback((strand: number) => {
    if (strand >= 1 && strand <= 4) {
      setState(prev => ({ ...prev, currentStrand: strand }));
    }
  }, []);

  // Submit question response
  const submitQuestionResponse = useCallback(async (response: QuestionResponse) => {
    try {
      // Validate response
      if (!validateQuestionResponse(response)) {
        throw new QuestionSystemError('Invalid question response', 'VALIDATION_ERROR');
      }

      setState(prev => {
        const newResponses = { ...prev.responses, [response.questionId]: response };
        
        // Calculate strand progress from all responses for this strand
        const strandResponses = Object.values(newResponses).filter(r => 
          r.questionId.includes(`strand${prev.currentStrand}`)
        );
        
        const strandProgress = calculateStrandProgress(strandResponses);
        const newProgresses = [...prev.strandProgresses];
        newProgresses[prev.currentStrand - 1] = strandProgress;
        
        // Check for badge awards
        const newBadges = { ...prev.badges };
        if (checkBadgeEarned(prev.currentStrand, strandProgress, 'principlePioneer')) {
          newBadges.principlePioneer = true;
        }
        if (checkBadgeEarned(prev.currentStrand, strandProgress, 'conceptCrusader')) {
          newBadges.conceptCrusader = true;
        }
        if (checkBadgeEarned(prev.currentStrand, strandProgress, 'applicationAce')) {
          newBadges.applicationAce = true;
        }
        if (checkBadgeEarned(prev.currentStrand, strandProgress, 'analysisArchitect')) {
          newBadges.analysisArchitect = true;
        }
        
        console.log('✅ RESPONSE SUBMITTED:', {
          questionId: response.questionId,
          isCorrect: response.isCorrect,
          score: response.score,
          strandProgress,
          newBadges
        });
        
        return {
          ...prev,
          responses: newResponses,
          strandProgresses: newProgresses,
          badges: newBadges,
          error: null
        };
      });

      // TODO: Save to Supabase here
      // await saveQuestionResponse(response);

    } catch (error) {
      const systemError = handleQuestionError(error, 'submitQuestionResponse');
      setState(prev => ({ ...prev, error: systemError }));
      throw systemError;
    }
  }, []);

  // Load strand data
  const loadStrandData = useCallback(async (strand: number, learningPath: 'critical-angle' | 'fiber-optics') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // TODO: Load from actual question data source
      // For now, create empty strand data
      const strandInfo = generateStrandData(strand, learningPath, {});
      
      setState(prev => ({
        ...prev,
        strandData: { ...prev.strandData, [strand]: strandInfo },
        loading: false
      }));
      
      console.log('📚 STRAND DATA LOADED:', { strand, learningPath, blocks: strandInfo.blocks.length });
      
    } catch (error) {
      const systemError = handleQuestionError(error, 'loadStrandData');
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: systemError 
      }));
    }
  }, []);

  // Reset progress
  const resetProgress = useCallback(() => {
    setState(initialState);
    console.log('🔄 PROGRESS RESET');
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Log state changes in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 CONTEXT STATE CHANGED:', {
        currentStrand: state.currentStrand,
        responses: Object.keys(state.responses).length,
        progresses: state.strandProgresses,
        badges: Object.values(state.badges).filter(Boolean).length,
        loading: state.loading,
        error: state.error?.message
      });
    }
  }, [state]);

  const contextValue: QuestionSystemContextType = {
    ...state,
    setCurrentStrand,
    submitQuestionResponse,
    loadStrandData,
    resetProgress,
    clearError,
    updateProgress,
  };

  return (
    <QuestionSystemContext.Provider value={contextValue}>
      {children}
    </QuestionSystemContext.Provider>
  );
};

// Hook to use the context
export const useQuestionSystem = (): QuestionSystemContextType => {
  const context = useContext(QuestionSystemContext);
  if (!context) {
    throw new Error('useQuestionSystem must be used within a QuestionSystemProvider');
  }
  return context;
};

// Hook for strand-specific data
export const useCurrentStrand = () => {
  const { currentStrand, strandData, strandProgresses } = useQuestionSystem();
  
  return {
    strand: currentStrand,
    data: strandData[currentStrand],
    progress: strandProgresses[currentStrand - 1] || 0,
    isLoaded: !!strandData[currentStrand]
  };
};

// Hook for progress tracking
export const useProgressTracking = () => {
  const { strandProgresses, badges, responses } = useQuestionSystem();
  
  const totalProgress = calculateOverallProgress(strandProgresses);
  const totalBadges = Object.values(badges).filter(Boolean).length;
  const totalResponses = Object.keys(responses).length;
  const correctResponses = Object.values(responses).filter(r => r.isCorrect).length;
  
  return {
    strandProgresses,
    totalProgress,
    badges,
    totalBadges,
    totalResponses,
    correctResponses,
    accuracy: totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0
  };
};

// Hook for question responses
export const useQuestionResponses = () => {
  const { responses, submitQuestionResponse } = useQuestionSystem();
  
  const getResponse = useCallback((questionId: string): QuestionResponse | undefined => {
    return responses[questionId];
  }, [responses]);
  
  const hasResponse = useCallback((questionId: string): boolean => {
    return questionId in responses;
  }, [responses]);
  
  const getStrandResponses = useCallback((strand: number): QuestionResponse[] => {
    return Object.values(responses).filter(r => 
      r.questionId.includes(`strand${strand}`)
    );
  }, [responses]);
  
  return {
    responses,
    getResponse,
    hasResponse,
    getStrandResponses,
    submitResponse: submitQuestionResponse
  };
};

// Error boundary hook
export const useQuestionSystemError = () => {
  const { error, clearError } = useQuestionSystem();
  
  return {
    error,
    hasError: !!error,
    clearError,
    errorMessage: error?.message,
    errorCode: error?.code
  };
};
