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
  const [userInputs, setUserInputs] = useState<UserInputs>({
    strand1: { level2: '', level4: '', level6: '', level8: '' },
    strand2: { level2: '', level4: '', level6: '', level8: '' },
    strand3: { level2: '', level4: '', level6: '', level8: '' },
    strand4: { level2: '', level4: '', level6: '', level8: '' },
    strand5: { level2: '', level4: '', level6: '', level8: '' },
  });

  const [strandProgress, setStrandProgress] = useState<number[]>([0, 0, 0, 0, 0]);
  const [points, setPoints] = useState<number>(0);
  const [strandStatus, setStrandStatus] = useState<string[]>([
    'in progress', 'not started', 'not started', 'not started', 'not started',
  ]);
  const [earnedBadges, setEarnedBadges] = useState({
    dataWizard: false,
    analysisAce: false,
    hypothesisHero: false,
    methodMaster: false,
    innovationInnovator: false,
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
