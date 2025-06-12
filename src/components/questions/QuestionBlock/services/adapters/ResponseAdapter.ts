import { Question, QuestionResponse } from '../../types/questionBlock';

export type StandardAnswerHandler = (response: QuestionResponse) => void;
export type EnhancedAnswerHandler = (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
export type UniversalAnswerHandler = StandardAnswerHandler | EnhancedAnswerHandler;

export class ResponseAdapter {
  // 🎯 Smart interface detection (absorbed and enhanced)
  static detectInterface(onAnswerFunction: Function): 'standard' | 'enhanced' | 'unknown' {
    if (!onAnswerFunction || typeof onAnswerFunction !== 'function') {
      return 'unknown';
    }
    
    // Check function length (number of parameters)
    if (onAnswerFunction.length === 4) {
      return 'enhanced'; // (questionId, answer, isCorrect, score)
    } else if (onAnswerFunction.length === 1) {
      return 'standard'; // (response: QuestionResponse)
    }
    
    return 'unknown';
  }

  // 🎯 Universal adapter (absorbed and improved)
  static createUniversalAdapter(
    onAnswerFunction: UniversalAnswerHandler, 
    question: Question
  ): EnhancedAnswerHandler {
    const interfaceType = this.detectInterface(onAnswerFunction);
    
    return (questionId: string, answer: any, isCorrect: boolean, score: number) => {
      try {
        if (interfaceType === 'standard') {
          const response: QuestionResponse = {
            questionId,
            type: question.type,
            answer,
            isCorrect,
            score,
            feedback: this.generateFeedback(isCorrect, score, question.level || 1),
            timestamp: new Date(),
            timeSpent: 0
          };
          (onAnswerFunction as StandardAnswerHandler)(response);
        } else {
          // Enhanced or unknown - try enhanced first
          (onAnswerFunction as EnhancedAnswerHandler)(questionId, answer, isCorrect, score);
        }
      } catch (error) {
        console.error('Response adapter error:', error);
        // Fallback to enhanced interface
        (onAnswerFunction as EnhancedAnswerHandler)(questionId, answer, isCorrect, score);
      }
    };
  }

  // 🎯 Smart feedback generation
  private static generateFeedback(isCorrect: boolean, score: number, level: number): string {
    if (isCorrect) {
      const excellent = [
        'Outstanding work! You truly understand this concept.',
        'Brilliant! Your mastery of this topic is impressive.',
        'Perfect! You\'ve demonstrated deep understanding.'
      ];
      const good = [
        'Great job! You\'re doing well with this material.',
        'Nice work! You\'re building solid understanding.',
        'Well done! Keep practicing and you\'ll master this.'
      ];
      
      return score >= level * 0.85 
        ? excellent[Math.floor(Math.random() * excellent.length)]
        : good[Math.floor(Math.random() * good.length)];
    } else {
      const encouraging = [
        'Good attempt! Learning takes practice - keep going.',
        'Nice try! Review the concepts and try again.',
        'Keep working on it! You\'re building understanding.'
      ];
      return encouraging[Math.floor(Math.random() * encouraging.length)];
    }
  }
}