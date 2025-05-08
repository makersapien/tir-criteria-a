// src/types/graph.ts

// Runtime-safe constant object holding the allowed trend types
export const TrendTypes = {
    NONE: 'none',
    LINEAR: 'linear',
    PROPORTIONAL: 'proportional',
    INVERSE: 'inverse',
    POLYNOMIAL: 'polynomial',
  } as const;
  
  // This creates a union type from the values of TrendTypes, e.g. 'none' | 'linear' | ...
  export type TrendType = (typeof TrendTypes)[keyof typeof TrendTypes];
  