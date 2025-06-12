export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
  }
  
  export interface ValidationConfig {
    level: 'basic' | 'enhanced' | 'strict';
    checkAnswers?: boolean;
    validateStructure?: boolean;
    enforceTypes?: boolean;
  }