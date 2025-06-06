// src/contexts/StrandContext.tsx
import React, { createContext, useContext, useState } from 'react';

export type UserInputs = {
  [key: string]: {
    level2?: string;
    level4?: string;
    level6?: string;
    level8?: string;
  };
};

interface StrandContextType {
  userInputs: UserInputs;
  setUserInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  strandProgress: number[];
  setStrandProgress: React.Dispatch<React.SetStateAction<number[]>>;
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  strandStatus: string[];
  setStrandStatus: React.Dispatch<React.SetStateAction<string[]>>;
  earnedBadges: any;
  setEarnedBadges: React.Dispatch<React.SetStateAction<any>>;
}

export const StrandContext = createContext<StrandContextType | null>(null);

export const StrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ✅ Updated to 4 strands for TIR structure
  const [userInputs, setUserInputs] = useState<UserInputs>({
    strand1: { level2: '', level4: '', level6: '', level8: '' },
    strand2: { level2: '', level4: '', level6: '', level8: '' },
    strand3: { level2: '', level4: '', level6: '', level8: '' },
    strand4: { level2: '', level4: '', level6: '', level8: '' },
  });

  // ✅ Updated to 4 strands (0-8 levels each)
  const [strandProgress, setStrandProgress] = useState<number[]>([0, 0, 0, 0]);
  const [points, setPoints] = useState<number>(0);
  
  // ✅ Updated to 4 strand statuses
  const [strandStatus, setStrandStatus] = useState<string[]>([
    'in progress', 'not started', 'not started', 'not started',
  ]);
  
  // ✅ Updated badge names for TIR theme
  const [earnedBadges, setEarnedBadges] = useState({
    principlePioneer: false,    // 🔬 Master TIR laws and principles
    conceptCrusader: false,     // 🧠 Understand TIR phenomena deeply  
    applicationAce: false,      // ⚡ Connect TIR to real-world uses
    analysisArchitect: false,   // 📊 Analyze and solve TIR problems
  });

  return (
    <StrandContext.Provider value={{
      userInputs, setUserInputs,
      strandProgress, setStrandProgress,
      points, setPoints,
      strandStatus, setStrandStatus,
      earnedBadges, setEarnedBadges
    }}>
      {children}
    </StrandContext.Provider>
  );
};

export const useStrandContext = () => {
  const context = useContext(StrandContext);
  if (!context) throw new Error('useStrandContext must be used within a StrandProvider');
  return context;
};