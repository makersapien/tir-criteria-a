// integrationFixes.ts - Pure TypeScript utilities (NO JSX)

// Core Types
export interface BaseQuestion {
    id: string;
    type: QuestionType;
    level: 2 | 4 | 6 | 8;
    points: number;
    question: string;
    learningPath: 'critical-angle' | 'fiber-optics';
    strand: 1 | 2 | 3 | 4;
    concept: string;
    keywords: string[];
  }
  
  export type QuestionType = 'mcq' | 'fill-blank' | 'match-click' | 'short-answer';
  
  export interface MCQOption {
    id: string;
    text: string;
    isCorrect: boolean;
    level?: number;
  }
  
  export interface MCQQuestion extends BaseQuestion {
    type: 'mcq';
    options: MCQOption[];
    explanation: string;
  }
  
  export interface FillBlankQuestion extends BaseQuestion {
    type: 'fill-blank';
    text: string;
    blanks: {
      id: string;
      correctAnswers: string[];
      caseSensitive: boolean;
      hints?: string[];
    }[];
    explanation: string;
  }
  
  export interface MatchClickQuestion extends BaseQuestion {
    type: 'match-click';
    leftItems: { id: string; text: string; image?: string; }[];
    rightItems: { id: string; text: string; image?: string; }[];
    correctMatches: { leftId: string; rightId: string; }[];
    explanation: string;
  }
  
  export interface ShortAnswerQuestion extends BaseQuestion {
    type: 'short-answer';
    minWords?: number;
    maxWords?: number;
    sampleAnswer: string;
    evaluationCriteria: {
      requiredKeywords: string[];
      requiredConcepts: string[];
    };
  }
  
  export type Question = MCQQuestion | FillBlankQuestion | MatchClickQuestion | ShortAnswerQuestion;
  
  export interface QuestionResponse {
    questionId: string;
    type: QuestionType;
    answer: any;
    isCorrect: boolean;
    score: number;
    feedback: string;
    timestamp: Date;
    timeSpent?: number;
  }
  
  export interface QuestionBlock {
    id: string;
    level: 2 | 4 | 6 | 8;
    questions: Question[];
    unlocked: boolean;
    completed: boolean;
    score: number;
    attempts: number;
    maxAttempts: number;
    completedQuestions: number;
    totalQuestions: number;
  }
  
  export interface StrandData {
    strand: number;
    learningPath: 'critical-angle' | 'fiber-optics';
    title: string;
    description: string;
    blocks: QuestionBlock[];
  }
  
  // Strand Generation Utilities
  export const generateStrandData = (
    strandNumber: number,
    learningPath: 'critical-angle' | 'fiber-optics',
    questionData: any
  ): StrandData => {
    const strandKey = `strand${strandNumber}`;
    const pathData = questionData[learningPath]?.[strandKey];
    
    if (!pathData) {
      return createEmptyStrand(strandNumber, learningPath);
    }
    
    const blocks: QuestionBlock[] = [2, 4, 6, 8].map(level => {
      const questions = pathData[`level${level}`] || [];
      return {
        id: `${strandKey}_level${level}`,
        level: level as 2 | 4 | 6 | 8,
        questions,
        unlocked: true, // All levels unlocked for Criteria A
        completed: false,
        score: 0,
        attempts: 0,
        maxAttempts: 5,
        completedQuestions: 0,
        totalQuestions: questions.length
      };
    });
    
    return {
      strand: strandNumber,
      learningPath,
      title: getStrandTitle(strandNumber, learningPath),
      description: getStrandDescription(strandNumber, learningPath),
      blocks
    };
  };
  
  export const createEmptyStrand = (
    strandNumber: number,
    learningPath: 'critical-angle' | 'fiber-optics'
  ): StrandData => ({
    strand: strandNumber,
    learningPath,
    title: getStrandTitle(strandNumber, learningPath),
    description: getStrandDescription(strandNumber, learningPath),
    blocks: []
  });
  
  export const getStrandTitle = (
    strand: number,
    learningPath: 'critical-angle' | 'fiber-optics'
  ): string => {
    const titles = {
      'critical-angle': {
        1: 'TIR Principles & Laws',
        2: 'Understanding TIR Phenomena',
        3: 'Real-World Applications',
        4: 'Analysis & Problem Solving'
      },
      'fiber-optics': {
        1: 'Fiber Optic Principles',
        2: 'Fiber Optic Technology',
        3: 'Applications & Impact',
        4: 'Design & Innovation'
      }
    };
    
    return titles[learningPath]?.[strand as keyof typeof titles[typeof learningPath]] 
      || `Strand ${strand}`;
  };
  
  export const getStrandDescription = (
    strand: number,
    learningPath: 'critical-angle' | 'fiber-optics'
  ): string => {
    const descriptions = {
      'critical-angle': {
        1: 'Master the fundamental principles and laws governing total internal reflection',
        2: 'Understand the phenomena and conditions required for TIR to occur',
        3: 'Explore real-world applications of TIR in technology and nature',
        4: 'Analyze and solve complex problems involving TIR calculations'
      },
      'fiber-optics': {
        1: 'Understanding how light travels through optical fibers',
        2: 'Exploring the engineering and physics behind fiber optic systems',
        3: 'Examining fiber optic applications and their societal impact',
        4: 'Applying fiber optic principles to solve design challenges'
      }
    };
    
    return descriptions[learningPath]?.[strand as keyof typeof descriptions[typeof learningPath]]
      || `Strand ${strand} content`;
  };
  
  // Question Evaluation Utilities
  export const evaluateMCQ = (
    question: MCQQuestion,
    selectedOptionId: string
  ): { isCorrect: boolean; score: number; feedback: string } => {
    const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
    
    if (!selectedOption) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'No option selected.'
      };
    }
    
    const isCorrect = selectedOption.isCorrect;
    const score = isCorrect ? question.level : (selectedOption.level || 0);
    const feedback = isCorrect 
      ? `Correct! ${question.explanation}`
      : `Not quite. ${question.explanation}`;
    
    return { isCorrect, score, feedback };
  };
  
  export const evaluateFillBlank = (
    question: FillBlankQuestion,
    answers: Record<string, string>
  ): { isCorrect: boolean; score: number; feedback: string } => {
    let correctCount = 0;
    const totalBlanks = question.blanks.length;
    
    question.blanks.forEach(blank => {
      const userAnswer = (answers[blank.id] || '').trim();
      const isCorrect = blank.correctAnswers.some(correct =>
        blank.caseSensitive
          ? correct === userAnswer
          : correct.toLowerCase() === userAnswer.toLowerCase()
      );
      if (isCorrect) correctCount++;
    });
    
    const percentage = correctCount / totalBlanks;
    let score = 0;
    
    if (percentage >= 0.9) score = question.level;
    else if (percentage >= 0.7) score = Math.max(question.level - 1, 0);
    else if (percentage >= 0.5) score = Math.max(question.level - 2, 0);
    else if (percentage >= 0.3) score = Math.max(question.level - 3, 0);
    
    const isCorrect = percentage >= 0.7;
    const feedback = isCorrect
      ? `Great work! ${question.explanation}`
      : `Good effort. ${question.explanation}`;
    
    return { isCorrect, score, feedback };
  };
  
  export const evaluateMatchClick = (
    question: MatchClickQuestion,
    matches: Array<{ leftId: string; rightId: string }>
  ): { isCorrect: boolean; score: number; feedback: string } => {
    let correctCount = 0;
    
    matches.forEach(match => {
      const isCorrect = question.correctMatches.some(
        correct => correct.leftId === match.leftId && correct.rightId === match.rightId
      );
      if (isCorrect) correctCount++;
    });
    
    const percentage = correctCount / question.correctMatches.length;
    let score = 0;
    
    if (percentage >= 0.9) score = question.level;
    else if (percentage >= 0.7) score = Math.max(question.level - 1, 0);
    else if (percentage >= 0.5) score = Math.max(question.level - 2, 0);
    else if (percentage >= 0.3) score = Math.max(question.level - 3, 0);
    
    const isCorrect = percentage >= 0.7;
    const feedback = isCorrect
      ? `Excellent matching! ${question.explanation}`
      : `Good attempt. ${question.explanation}`;
    
    return { isCorrect, score, feedback };
  };
  
  export const evaluateShortAnswer = async (
    question: ShortAnswerQuestion,
    answer: string
  ): Promise<{ isCorrect: boolean; score: number; feedback: string }> => {
    const words = answer.trim().split(/\s+/).length;
    const lowerAnswer = answer.toLowerCase();
    
    // Check word count requirements
    if (question.minWords && words < question.minWords) {
      return {
        isCorrect: false,
        score: 0,
        feedback: `Answer too short. Minimum ${question.minWords} words required.`
      };
    }
    
    if (question.maxWords && words > question.maxWords) {
      return {
        isCorrect: false,
        score: Math.max(question.level - 2, 0),
        feedback: `Answer too long. Maximum ${question.maxWords} words allowed.`
      };
    }
    
    // Basic keyword matching
    const keywordMatches = question.evaluationCriteria.requiredKeywords.filter(
      keyword => lowerAnswer.includes(keyword.toLowerCase())
    ).length;
    
    const conceptMatches = question.evaluationCriteria.requiredConcepts.filter(
      concept => lowerAnswer.includes(concept.toLowerCase())
    ).length;
    
    const keywordScore = (keywordMatches / Math.max(question.evaluationCriteria.requiredKeywords.length, 1)) * 0.6;
    const conceptScore = (conceptMatches / Math.max(question.evaluationCriteria.requiredConcepts.length, 1)) * 0.4;
    
    const totalScore = Math.round((keywordScore + conceptScore) * question.level);
    const isCorrect = totalScore >= Math.max(question.level - 2, 4);
    
    const feedback = isCorrect
      ? 'Good response! You addressed the key concepts.'
      : 'Consider including more scientific terminology and key concepts.';
    
    return { isCorrect, score: totalScore, feedback };
  };
  
  // Progress Calculation Utilities
  export const calculateStrandProgress = (responses: QuestionResponse[]): number => {
    if (responses.length === 0) return 0;
    
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    const averageScore = totalScore / responses.length;
    
    return Math.min(8, Math.round(averageScore));
  };
  
  export const calculateOverallProgress = (strandProgresses: number[]): number => {
    const totalProgress = strandProgresses.reduce((sum, progress) => sum + progress, 0);
    const maxProgress = strandProgresses.length * 8;
    
    return Math.round((totalProgress / maxProgress) * 100);
  };
  
  // Badge System
  export const checkBadgeEarned = (
    strandNumber: number,
    level: number,
    badgeType: 'principlePioneer' | 'conceptCrusader' | 'applicationAce' | 'analysisArchitect'
  ): boolean => {
    const badgeRequirements = {
      principlePioneer: 1,
      conceptCrusader: 2,
      applicationAce: 3,
      analysisArchitect: 4
    };
    
    return strandNumber === badgeRequirements[badgeType] && level >= 8;
  };
  
  // Error Handling
  export class QuestionSystemError extends Error {
    constructor(
      message: string,
      public code: string,
      public details?: any
    ) {
      super(message);
      this.name = 'QuestionSystemError';
    }
  }
  
  export const handleQuestionError = (error: unknown, context: string): QuestionSystemError => {
    if (error instanceof QuestionSystemError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new QuestionSystemError(
        `${context}: ${error.message}`,
        'SYSTEM_ERROR',
        { originalError: error }
      );
    }
    
    return new QuestionSystemError(
      `Unknown error in ${context}`,
      'UNKNOWN_ERROR',
      { error }
    );
  };
  
  // Validation Utilities
  export const validateQuestion = (question: Question): boolean => {
    if (!question.id || !question.type || !question.level || !question.question) {
      return false;
    }
    
    switch (question.type) {
      case 'mcq':
        return (question as MCQQuestion).options.length >= 2 &&
               (question as MCQQuestion).options.some(opt => opt.isCorrect);
      
      case 'fill-blank':
        return (question as FillBlankQuestion).blanks.length > 0 &&
               (question as FillBlankQuestion).blanks.every(blank => blank.correctAnswers.length > 0);
      
      case 'match-click':
        return (question as MatchClickQuestion).leftItems.length > 0 &&
               (question as MatchClickQuestion).rightItems.length > 0 &&
               (question as MatchClickQuestion).correctMatches.length > 0;
      
      case 'short-answer':
        return (question as ShortAnswerQuestion).evaluationCriteria.requiredKeywords.length > 0;
      
      default:
        return false;
    }
  };
  
  export const validateQuestionResponse = (response: QuestionResponse): boolean => {
    return !!(
      response.questionId &&
      response.type &&
      response.timestamp &&
      typeof response.isCorrect === 'boolean' &&
      typeof response.score === 'number'
    );
  };
  
  // Session Management Utilities
  export const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  export const createProgressSnapshot = (
    strandProgresses: number[],
    responses: QuestionResponse[]
  ): object => {
    return {
      timestamp: new Date().toISOString(),
      strandProgresses,
      totalResponses: responses.length,
      correctResponses: responses.filter(r => r.isCorrect).length,
      averageScore: responses.length > 0 
        ? responses.reduce((sum, r) => sum + r.score, 0) / responses.length 
        : 0
    };
  };