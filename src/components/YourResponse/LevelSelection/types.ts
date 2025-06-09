// src/components/YourResponse/LevelSelection/types.ts
// 🎯 LEVEL SELECTION TYPES - Clean type definitions

export type MYPLevel = 2 | 4 | 6 | 8;

export type LevelStatus = 'completed' | 'available' | 'locked';

export interface LevelColors {
  base: string;
  hover: string;
  completed: string;
}

export interface LevelData {
  level: MYPLevel;
  questions: any[];
  completed: boolean;
  score: number;
  unlocked: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface LevelSelectorData {
  blocks: LevelData[];
  tips: Record<string, any>;
  suggestions: string[];
}