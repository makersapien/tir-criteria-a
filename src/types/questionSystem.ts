// ===== PHASE 1: FOUNDATION - Base Type System & Question Registry =====

// 1. Enhanced Base Types (src/types/questionSystem.ts)
// ========================================

export type QuestionType = 'mcq' | 'fill-blank' | 'match-click' | 'short-answer';
export type ExperimentType = 'critical-angle' | 'fiber-optics';
export type QuestionLevel = 2 | 4 | 6 | 8;
export type StrandNumber = 1 | 2 | 3 | 4;

// Base interfaces with proper inheritance
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  level: QuestionLevel;
  points: number;
  question: string;
  learningPath: ExperimentType;
  strand: StrandNumber;
  concept: string;
  keywords: string[];
  explanation: string;
  timeSpent?: number; // Optional tracking
}

// Specific question type interfaces
export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    level?: number; // For partial credit
  }[];
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  text: string; // Text with {blank} placeholders
  blanks: {
    id: string;
    correctAnswers: string[];
    caseSensitive: boolean;
    hints?: string[];
  }[];
}

export interface MatchClickQuestion extends BaseQuestion {
  type: 'match-click';
  leftItems: {
    id: string;
    text: string;
    image?: string;
  }[];
  rightItems: {
    id: string;
    text: string;
    image?: string;
  }[];
  correctMatches: {
    leftId: string;
    rightId: string;
  }[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer';
  minWords?: number;
  maxWords?: number;
  sampleAnswer: string;
  evaluationCriteria: {
    requiredKeywords: string[];
    requiredConcepts: string[];
    levelDescriptors: {
      level: number;
      description: string;
      keywords: string[];
    }[];
  };
}

export type Question = MCQQuestion | FillBlankQuestion | MatchClickQuestion | ShortAnswerQuestion;

// Response interfaces
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

// Evaluation interfaces
export interface EvaluationResult<T = any> {
  isCorrect: boolean;
  score: number;
  feedback: string;
  partialCredit?: number;
  hints?: string[];
  explanation?: string;
  detailedAnalysis?: T;
}

// Question Block interfaces
export interface QuestionBlock {
  id: string;
  level: QuestionLevel;
  questions: Question[];
  unlocked: boolean;
  completed: boolean;
  score: number; // 0-8 based on performance
  attempts: number;
  maxAttempts: number;
  completedQuestions: number;
  totalQuestions: number;
}

export interface StrandQuestionData {
  strand: StrandNumber;
  learningPath: ExperimentType;
  title: string;
  description: string;
  blocks: QuestionBlock[];
}

// ========================================
// 2. Question Evaluator Interfaces
// ========================================

export interface QuestionEvaluator<T extends BaseQuestion> {
  evaluate(question: T, answer: any): Promise<EvaluationResult> | EvaluationResult;
  validateAnswer(question: T, answer: any): boolean;
  calculateScore(question: T, answer: any, isCorrect: boolean): number;
  generateHints(question: T, answer: any): string[];
}

export interface QuestionStrategy<T extends BaseQuestion> {
  canHandle(questionType: string): boolean;
  render(question: T, onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void): React.ReactElement;
  getDefaultAnswer(question: T): any;
}

export interface ScoringStrategy<T extends BaseQuestion> {
  calculateScore(question: T, response: any, isCorrect: boolean): number;
  calculatePartialCredit(question: T, response: any): number;
}

// ========================================
// 3. Question Registry System
// ========================================

export class QuestionTypeRegistry {
  private evaluators = new Map<QuestionType, QuestionEvaluator<any>>();
  private strategies = new Map<QuestionType, QuestionStrategy<any>>();
  private scorers = new Map<QuestionType, ScoringStrategy<any>>();

  // Register components for a question type
  register<T extends BaseQuestion>(
    type: QuestionType,
    evaluator: QuestionEvaluator<T>,
    strategy: QuestionStrategy<T>,
    scorer: ScoringStrategy<T>
  ): void {
    this.evaluators.set(type, evaluator);
    this.strategies.set(type, strategy);
    this.scorers.set(type, scorer);
  }

  // Get components for a question type
  getEvaluator<T extends BaseQuestion>(type: QuestionType): QuestionEvaluator<T> | null {
    return this.evaluators.get(type) || null;
  }

  getStrategy<T extends BaseQuestion>(type: QuestionType): QuestionStrategy<T> | null {
    return this.strategies.get(type) || null;
  }

  getScorer<T extends BaseQuestion>(type: QuestionType): ScoringStrategy<T> | null {
    return this.scorers.get(type) || null;
  }

  // Check if type is supported
  isSupported(type: QuestionType): boolean {
    return this.evaluators.has(type) && this.strategies.has(type) && this.scorers.has(type);
  }

  // Get all supported types
  getSupportedTypes(): QuestionType[] {
    return Array.from(this.evaluators.keys());
  }

  // Validate question data
  validateQuestion(question: Question): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation
    if (!question.id) errors.push('Question must have an id');
    if (!question.type) errors.push('Question must have a type');
    if (!question.question) errors.push('Question must have question text');
    if (!question.level) errors.push('Question must have a level');
    
    // Type-specific validation
    switch (question.type) {
      case 'mcq':
        const mcq = question as MCQQuestion;
        if (!mcq.options || mcq.options.length < 2) {
          errors.push('MCQ must have at least 2 options');
        }
        if (!mcq.options.some(opt => opt.isCorrect)) {
          errors.push('MCQ must have at least one correct option');
        }
        break;
        
      case 'fill-blank':
        const fillBlank = question as FillBlankQuestion;
        if (!fillBlank.text) errors.push('Fill-blank must have text');
        if (!fillBlank.blanks || fillBlank.blanks.length === 0) {
          errors.push('Fill-blank must have blanks');
        }
        break;
        
      case 'match-click':
        const match = question as MatchClickQuestion;
        if (!match.leftItems || !match.rightItems) {
          errors.push('Match-click must have left and right items');
        }
        if (!match.correctMatches || match.correctMatches.length === 0) {
          errors.push('Match-click must have correct matches');
        }
        break;
        
      case 'short-answer':
        const shortAnswer = question as ShortAnswerQuestion;
        if (!shortAnswer.evaluationCriteria) {
          errors.push('Short-answer must have evaluation criteria');
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create global registry instance
export const questionRegistry = new QuestionTypeRegistry();

// ========================================
// 4. Enhanced Question Block Interface
// ========================================

export interface QuestionBlockConfig<T extends BaseQuestion> {
  content: T[];
  evaluator: QuestionEvaluator<T>;
  strategy: QuestionStrategy<T>;
  scorer: ScoringStrategy<T>;
  unlockConditions?: {
    minimumScore?: number;
    requiredQuestions?: string[];
    prerequisiteBlocks?: string[];
  };
}

export class EnhancedQuestionBlock<T extends BaseQuestion> {
  public readonly id: string;
  public readonly level: QuestionLevel;
  public readonly questions: T[];
  private readonly evaluator: QuestionEvaluator<T>;
  private readonly strategy: QuestionStrategy<T>;
  private readonly scorer: ScoringStrategy<T>;
  
  public responses: Map<string, QuestionResponse> = new Map();
  public attempts: number = 0;
  public isUnlocked: boolean = false;
  public isCompleted: boolean = false;

  constructor(
    id: string,
    level: QuestionLevel,
    config: QuestionBlockConfig<T>
  ) {
    this.id = id;
    this.level = level;
    this.questions = config.content;
    this.evaluator = config.evaluator;
    this.strategy = config.strategy;
    this.scorer = config.scorer;
  }

  // Evaluate a question response
  async evaluateResponse(questionId: string, answer: any): Promise<EvaluationResult> {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found in block ${this.id}`);
    }

    return this.evaluator.evaluate(question, answer);
  }

  // Calculate overall block score
  calculateBlockScore(): number {
    const responses = Array.from(this.responses.values());
    if (responses.length === 0) return 0;
    
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    return Math.round(totalScore / responses.length);
  }

  // Check if block is completed
  checkCompletion(): boolean {
    return this.responses.size === this.questions.length;
  }

  // Get progress percentage
  getProgress(): number {
    return Math.round((this.responses.size / this.questions.length) * 100);
  }

  // Record a response
  recordResponse(response: QuestionResponse): void {
    this.responses.set(response.questionId, response);
    this.isCompleted = this.checkCompletion();
  }

  // Get summary statistics
  getSummary(): {
    completed: number;
    total: number;
    score: number;
    correct: number;
    attempts: number;
  } {
    const responses = Array.from(this.responses.values());
    return {
      completed: responses.length,
      total: this.questions.length,
      score: this.calculateBlockScore(),
      correct: responses.filter(r => r.isCorrect).length,
      attempts: this.attempts
    };
  }
}

// ========================================
// 5. Context and Provider Interfaces
// ========================================

export interface QuestionSystemContext {
  registry: QuestionTypeRegistry;
  currentStrand: StrandNumber;
  currentExperiment: ExperimentType;
  progress: Map<string, QuestionResponse>;
  updateProgress: (response: QuestionResponse) => void;
  resetProgress: () => void;
}

export interface QuestionSystemProviderProps {
  children: React.ReactNode;
  initialStrand?: StrandNumber;
  initialExperiment?: ExperimentType;
  onProgressUpdate?: (strand: number, level: number, score: number) => void;
}

// ========================================
// 6. Utility Types and Helpers
// ========================================

export type QuestionFilter = {
  type?: QuestionType;
  level?: QuestionLevel;
  strand?: StrandNumber;
  learningPath?: ExperimentType;
  concept?: string;
};

export interface QuestionSearchResult {
  questions: Question[];
  total: number;
  filtered: number;
}

export class QuestionUtils {
  static filterQuestions(questions: Question[], filter: QuestionFilter): Question[] {
    return questions.filter(question => {
      if (filter.type && question.type !== filter.type) return false;
      if (filter.level && question.level !== filter.level) return false;
      if (filter.strand && question.strand !== filter.strand) return false;
      if (filter.learningPath && question.learningPath !== filter.learningPath) return false;
      if (filter.concept && !question.concept.toLowerCase().includes(filter.concept.toLowerCase())) return false;
      return true;
    });
  }

  static groupQuestionsByLevel(questions: Question[]): Map<QuestionLevel, Question[]> {
    const groups = new Map<QuestionLevel, Question[]>();
    questions.forEach(question => {
      if (!groups.has(question.level)) {
        groups.set(question.level, []);
      }
      groups.get(question.level)!.push(question);
    });
    return groups;
  }

  static validateQuestionData(question: any): { isValid: boolean; errors: string[] } {
    return questionRegistry.validateQuestion(question);
  }

  static generateQuestionId(
    learningPath: ExperimentType, 
    strand: StrandNumber, 
    level: QuestionLevel, 
    type: QuestionType, 
    index: number
  ): string {
    return `${learningPath}_s${strand}_l${level}_${type}${index}`;
  }
}

// Export everything for use in other modules
export default {
  questionRegistry,
  QuestionUtils,
  EnhancedQuestionBlock
};