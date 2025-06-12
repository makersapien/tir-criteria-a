export interface Question {
    id: string;
    type: 'mcq' | 'fill-blank' | 'match-click' | 'short-answer';
    level: 2 | 4 | 6 | 8;
    question: string;
    points?: number;
    explanation?: string;
    keywords?: string[];
    concept?: string;
  }
  
  export interface QuestionResponse {
    questionId: string;
    type: string;
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