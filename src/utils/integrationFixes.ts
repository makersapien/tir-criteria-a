// src/utils/integrationFixes.ts - DEBUG VERSION to find the actual issue

// ✅ TEMPORARY: Let's hardcode the data directly to bypass import issues
const HARDCODED_DATA = {
  "critical-angle": {
    "strand1": {
      "level2": [
        {
          "id": "ca_s1_l2_mcq1",
          "type": "mcq",
          "level": 2,
          "points": 2,
          "question": "What happens when light travels from a dense medium to a less dense medium?",
          "learningPath": "critical-angle",
          "strand": 1,
          "concept": "basic light behavior",
          "keywords": ["refraction", "medium", "light"],
          "options": [
            {
              "id": "a",
              "text": "Light always reflects back",
              "isCorrect": false
            },
            {
              "id": "b", 
              "text": "Light bends away from the normal",
              "isCorrect": true
            },
            {
              "id": "c",
              "text": "Light travels in a straight line",
              "isCorrect": false
            },
            {
              "id": "d",
              "text": "Light disappears",
              "isCorrect": false
            }
          ],
          "explanation": "When light travels from a dense medium (like glass) to a less dense medium (like air), it bends away from the normal according to Snell's law."
        },
        {
          "id": "ca_s1_l2_fill1",
          "type": "fill-blank",
          "level": 2,
          "points": 2,
          "question": "Fill in the blanks about light behavior:",
          "learningPath": "critical-angle",
          "strand": 1,
          "concept": "refraction basics",
          "keywords": ["refraction", "normal", "angle"],
          "text": "When light changes direction as it passes from one medium to another, this process is called {blank}. The imaginary line perpendicular to the surface is called the {blank}.",
          "blanks": [
            {
              "id": "blank1",
              "correctAnswers": ["refraction"],
              "caseSensitive": false,
              "hints": ["Think about light bending"]
            },
            {
              "id": "blank2", 
              "correctAnswers": ["normal"],
              "caseSensitive": false,
              "hints": ["Perpendicular line to surface"]
            }
          ],
          "explanation": "Refraction is the bending of light when it passes between different media. The normal is the reference line used to measure angles of incidence and refraction."
        }
      ],
      "level4": [
        {
          "id": "ca_s1_l4_mcq1",
          "type": "mcq",
          "level": 4,
          "points": 4,
          "question": "The critical angle is the angle of incidence at which:",
          "learningPath": "critical-angle",
          "strand": 1,
          "concept": "critical angle definition",
          "keywords": ["critical angle", "total internal reflection", "angle of refraction"],
          "options": [
            {
              "id": "a",
              "text": "Light is completely absorbed",
              "isCorrect": false
            },
            {
              "id": "b",
              "text": "The angle of refraction is 90°",
              "isCorrect": true
            },
            {
              "id": "c",
              "text": "Light travels parallel to the surface",
              "isCorrect": false,
              "level": 3
            },
            {
              "id": "d",
              "text": "Refraction stops completely",
              "isCorrect": false
            }
          ],
          "explanation": "The critical angle is defined as the angle of incidence for which the angle of refraction is exactly 90°. Beyond this angle, total internal reflection occurs."
        }
      ],
      "level6": [
        {
          "id": "ca_s1_l6_mcq1",
          "type": "mcq",
          "level": 6,
          "points": 6,
          "question": "Calculate the critical angle for glass (n=1.5) to air (n=1.0):",
          "learningPath": "critical-angle",
          "strand": 1,
          "concept": "critical angle calculation",
          "keywords": ["critical angle", "calculation", "sin"],
          "options": [
            {
              "id": "a",
              "text": "30°",
              "isCorrect": false
            },
            {
              "id": "b",
              "text": "41.8°",
              "isCorrect": true
            },
            {
              "id": "c",
              "text": "45°",
              "isCorrect": false
            },
            {
              "id": "d",
              "text": "60°",
              "isCorrect": false
            }
          ],
          "explanation": "Using sin(θc) = n₂/n₁ = 1.0/1.5 = 0.667, so θc = sin⁻¹(0.667) = 41.8°"
        }
      ],
      "level8": [
        {
          "id": "ca_s1_l8_short1",
          "type": "short-answer",
          "level": 8,
          "points": 8,
          "question": "Explain why diamonds sparkle using total internal reflection principles.",
          "learningPath": "critical-angle",
          "strand": 1,
          "concept": "advanced TIR applications",
          "keywords": ["diamond", "brilliance", "critical angle", "total internal reflection"],
          "minWords": 30,
          "maxWords": 80,
          "sampleAnswer": "Diamond has a very high refractive index (2.42), creating a small critical angle of about 24°. This means light entering the diamond is easily trapped through multiple total internal reflections, bouncing around inside before emerging with brilliant sparkle.",
          "evaluationCriteria": {
            "requiredKeywords": ["high refractive index", "small critical angle", "total internal reflection", "trapped"],
            "requiredConcepts": ["light trapping", "multiple reflections", "brilliance"]
          }
        }
      ]
    },
    "strand2": {
      "level2": [
        {
          "id": "ca_s2_l2_mcq1",
          "type": "mcq",
          "level": 2,
          "points": 2,
          "question": "When does total internal reflection occur?",
          "learningPath": "critical-angle",
          "strand": 2,
          "concept": "TIR conditions",
          "keywords": ["total internal reflection", "critical angle"],
          "options": [
            {
              "id": "a",
              "text": "When light hits any surface",
              "isCorrect": false
            },
            {
              "id": "b", 
              "text": "When the incident angle exceeds the critical angle",
              "isCorrect": true
            },
            {
              "id": "c",
              "text": "When light travels very fast",
              "isCorrect": false
            },
            {
              "id": "d",
              "text": "When surfaces are very smooth",
              "isCorrect": false
            }
          ],
          "explanation": "TIR occurs when light from a denser medium hits the interface at an angle greater than the critical angle."
        }
      ],
      "level4": [],
      "level6": [],
      "level8": []
    }
  },
  "fiber-optics": {
    "strand1": {
      "level2": [
        {
          "id": "fo_s1_l2_mcq1",
          "type": "mcq",
          "level": 2,
          "points": 2,
          "question": "What principle allows optical fibers to work?",
          "learningPath": "fiber-optics",
          "strand": 1,
          "concept": "fiber basics",
          "keywords": ["optical fiber", "total internal reflection"],
          "options": [
            {
              "id": "a",
              "text": "Light amplification",
              "isCorrect": false
            },
            {
              "id": "b",
              "text": "Total internal reflection",
              "isCorrect": true
            },
            {
              "id": "c",
              "text": "Light absorption",
              "isCorrect": false
            },
            {
              "id": "d",
              "text": "Light diffraction",
              "isCorrect": false
            }
          ],
          "explanation": "Optical fibers use total internal reflection to guide light along the core."
        }
      ],
      "level4": [],
      "level6": [],
      "level8": []
    }
  }
};

// Keep all your existing types...
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

// ✅ FIXED: Use hardcoded data to eliminate import issues
export const generateStrandData = (
  strandNumber: number,
  learningPath: 'critical-angle' | 'fiber-optics',
  questionData?: any
): StrandData => {
  const strandKey = `strand${strandNumber}`;
  
  // ✅ Use hardcoded data - this WILL work
  const dataSource = HARDCODED_DATA;
  const pathData = dataSource[learningPath]?.[strandKey];
  
  console.log('🔍 GENERATING STRAND DATA V3 (HARDCODED):', {
    strandNumber,
    learningPath,
    strandKey,
    hasDataSource: !!dataSource,
    hasLearningPath: !!dataSource[learningPath],
    hasPathData: !!pathData,
    availableLevels: pathData ? Object.keys(pathData) : [],
    dataSourceKeys: Object.keys(dataSource),
    learningPathKeys: dataSource[learningPath] ? Object.keys(dataSource[learningPath]) : [],
    fullDataStructure: {
      criticalAngleKeys: Object.keys(dataSource['critical-angle']),
      strand1Keys: dataSource['critical-angle']['strand1'] ? Object.keys(dataSource['critical-angle']['strand1']) : [],
      level2Questions: dataSource['critical-angle']['strand1']?.['level2']?.length || 0
    }
  });
  
  if (!pathData) {
    console.warn(`❌ No question data found for ${learningPath} ${strandKey}`);
    return createEmptyStrand(strandNumber, learningPath);
  }
  
  // ✅ Create blocks with the hardcoded questions
  const blocks: QuestionBlock[] = [2, 4, 6, 8].map(level => {
    const levelKey = `level${level}`;
    const questions = pathData[levelKey] || [];
    
    console.log(`📊 Loading ${learningPath} ${strandKey} ${levelKey}:`, {
      questionCount: questions.length,
      firstQuestionId: questions[0]?.id,
      questionTypes: questions.map((q: any) => q.type),
      sampleQuestion: questions[0] ? {
        id: questions[0].id,
        type: questions[0].type,
        question: questions[0].question?.substring(0, 50) + '...'
      } : 'none'
    });
    
    return {
      id: `${strandKey}_level${level}`,
      level: level as 2 | 4 | 6 | 8,
      questions,
      unlocked: true,
      completed: false,
      score: 0,
      attempts: 0,
      maxAttempts: 5,
      completedQuestions: 0,
      totalQuestions: questions.length
    };
  });
  
  const result = {
    strand: strandNumber,
    learningPath,
    title: getStrandTitle(strandNumber, learningPath),
    description: getStrandDescription(strandNumber, learningPath),
    blocks
  };
  
  console.log('✅ Generated strand data V3:', {
    strand: result.strand,
    title: result.title,
    totalBlocks: result.blocks.length,
    totalQuestions: result.blocks.reduce((sum, block) => sum + block.totalQuestions, 0),
    questionsPerLevel: result.blocks.map(block => ({
      level: block.level,
      count: block.totalQuestions,
      firstQuestionId: block.questions[0]?.id
    }))
  });
  
  return result;
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
      1: 'Understanding the fundamental laws governing total internal reflection',
      2: 'Comprehending why and when total internal reflection occurs',
      3: 'Exploring practical uses of total internal reflection in technology and nature',
      4: 'Applying mathematical and analytical skills to solve TIR problems'
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

// Keep all your existing evaluation functions exactly as they are...
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

// Keep all other utility functions...
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