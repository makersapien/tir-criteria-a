export interface StrandTipsProps {
    currentStrand: number;
    experimentChoice: 'critical-angle' | 'fiber-optics';
    currentLevel?: 2 | 4 | 6 | 8;
    collapsed?: boolean;
    onToggleCollapsed?: (collapsed: boolean) => void;
  }
  
  export interface SuggestionsProps {
    currentStrand: number;
    experimentChoice: 'critical-angle' | 'fiber-optics';
    suggestions: string[];
    collapsed?: boolean;
    onToggleCollapsed?: (collapsed: boolean) => void;
  }