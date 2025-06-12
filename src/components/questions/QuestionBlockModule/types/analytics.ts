export interface QuestionMetrics {
    questionId: string;
    timeSpent: number;
    isCorrect: boolean;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    efficiency: 'excellent' | 'good' | 'needs-improvement';
    attempts: number;
    timestamp: Date;
  }
  
  export interface LearningInsights {
    averageTime: number;
    successRate: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    masteryLevel: number;
  }