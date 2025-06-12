// 📁 src/components/questions/QuestionBlock/services/validation/QuestionValidator.ts
// =====================================
// Absorbed from UniversalQuestionRenderer.tsx
import { Question } from './questionBlock';
import { ValidationResult, ValidationConfig } from './validation';

export class QuestionValidator {
  // 🎯 Basic validation (absorbed from multiple files)
  static validateBasic(question: any): ValidationResult {
    const errors: string[] = [];
    
    if (!question || typeof question !== 'object') {
      errors.push('Question must be a valid object');
      return { isValid: false, errors };
    }
    
    if (!question.id) errors.push('Question must have an id');
    if (!question.type) errors.push('Question must have a type');
    if (!question.question) errors.push('Question must have question text');
    if (!question.level || question.level < 1 || question.level > 8) {
      errors.push('Question must have a valid level (1-8)');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // 🎯 Enhanced validation (absorbed from UniversalQuestionRenderer)
  static validateEnhanced(question: any, config: ValidationConfig = { level: 'enhanced' }): ValidationResult {
    const basic = this.validateBasic(question);
    const warnings: string[] = [];
    
    if (!basic.isValid) {
      return { ...basic, warnings };
    }
    
    // Type-specific validation
    switch (question.type.toLowerCase()) {
      case 'mcq':
        return this.validateMCQ(question, basic.errors, warnings);
      case 'fill-blank':
        return this.validateFillBlank(question, basic.errors, warnings);
      case 'short-answer':
        return this.validateShortAnswer(question, basic.errors, warnings);
      case 'match-click':
        return this.validateMatchClick(question, basic.errors, warnings);
      default:
        warnings.push(`Question type "${question.type}" may not be fully supported`);
    }
    
    return { isValid: basic.errors.length === 0, errors: basic.errors, warnings };
  }

  // 🎯 Type-specific validators
  private static validateMCQ(question: any, errors: string[], warnings: string[]) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push('MCQ must have at least 2 options');
    } else {
      const correctOptions = question.options.filter((opt: any) => opt.isCorrect);
      if (correctOptions.length === 0) {
        errors.push('MCQ must have at least one correct option');
      }
      if (question.options.length > 6) {
        warnings.push('MCQ has many options (consider reducing for better UX)');
      }
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  private static validateFillBlank(question: any, errors: string[], warnings: string[]) {
    if (!question.text) errors.push('Fill-blank must have text content');
    if (!Array.isArray(question.blanks) || question.blanks.length === 0) {
      errors.push('Fill-blank must have at least one blank');
    } else if (question.blanks.length > 5) {
      warnings.push('Fill-blank has many blanks (consider splitting)');
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  private static validateShortAnswer(question: any, errors: string[], warnings: string[]) {
    if (!question.evaluationCriteria) {
      errors.push('Short-answer must have evaluation criteria');
    }
    if (question.minWords && question.minWords > 200) {
      warnings.push('Short-answer requires many words (consider long-answer type)');
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  private static validateMatchClick(question: any, errors: string[], warnings: string[]) {
    if (!Array.isArray(question.leftItems) || !Array.isArray(question.rightItems)) {
      errors.push('Match-click must have leftItems and rightItems arrays');
    }
    if (!Array.isArray(question.correctMatches) || question.correctMatches.length === 0) {
      errors.push('Match-click must have correct matches defined');
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  // 🎯 Batch validation for question blocks
  static validateQuestionBlock(questions: any[]): { 
    isValid: boolean; 
    questionResults: Map<string, ValidationResult>;
    overallErrors: string[];
  } {
    const questionResults = new Map<string, ValidationResult>();
    const overallErrors: string[] = [];
    let hasInvalidQuestions = false;

    questions.forEach((question, index) => {
      const result = this.validateEnhanced(question);
      questionResults.set(question.id || `question_${index}`, result);
      
      if (!result.isValid) {
        hasInvalidQuestions = true;
        overallErrors.push(`Question ${index + 1}: ${result.errors.join(', ')}`);
      }
    });

    return {
      isValid: !hasInvalidQuestions,
      questionResults,
      overallErrors
    };
  }
}
