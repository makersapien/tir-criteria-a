// src/screens/MainScreen.tsx
'use client';

import React from 'react';
import ProgressBarSection from './main/ProgressBarSection';
import StrandContentTabs from './main/StrandContentTabs';
import { useStrandContext } from '../contexts/StrandContext';
import { useLocation } from 'react-router-dom';

interface MainScreenProps {
  currentStrand: number;
  setCurrentStrand: (strand: number) => void;
  onNext: () => void;
  onBack: () => void;
  points: number;
  setPoints: (points: number) => void;
  strandStatus: string[];
  setStrandStatus: (status: string[]) => void;
  earnedBadges: any;
  setEarnedBadges: (badges: any) => void;
  learningPathData: any; // ✅ Updated prop name
  learningPathChoice: 'critical-angle' | 'fiber-optics'; // ✅ Updated prop name
  experimentTitle: string;
}

const MainScreen: React.FC<MainScreenProps> = ({
  currentStrand,
  setCurrentStrand,
  onNext,
  points,
  setPoints,
  strandStatus,
  setStrandStatus,
  earnedBadges,
  setEarnedBadges,
  learningPathData, // ✅ Updated prop name
  learningPathChoice, // ✅ Updated prop name
  experimentTitle,
}) => {
  const { userInputs, strandProgress } = useStrandContext();

  // ✅ Extract student name from URL (e.g., ?name=Maya)
  const location = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const studentName = searchParams.get('name') ?? 'unknown_student';
  const studentId = searchParams.get('studentId') ?? null;
  const sessionCode = searchParams.get('sessionCode');

  return (
    <div className="main-screen px-6 py-4 space-y-6">
      <div className="flex justify-between items-center px-4 py-3 bg-purple-600 text-white rounded-md shadow-md">
        <h1 className="text-lg md:text-xl font-semibold">
          🌟 Total Internal Reflection Explorer - MYP Criteria A 💎
        </h1>
        <div className="text-sm md:text-base font-medium">
          🏆 {points} POINTS / 100
        </div>
      </div>

      <ProgressBarSection
        strandProgress={strandProgress}
        currentStrand={currentStrand}
        userInputs={userInputs}
        setCurrentStrand={setCurrentStrand}
        earnedBadges={earnedBadges}
        experimentTitle={experimentTitle}
      />

      <StrandContentTabs
        currentStrand={currentStrand}
        learningPathChoice={learningPathChoice} // ✅ Updated prop name
        currentStudentId={studentId}
        sessionCode={sessionCode}
        onNext={() => {
          if (currentStrand < 4) setCurrentStrand(currentStrand + 1); // ✅ Updated to 4 strands
          else onNext();
        }}
        onPrevious={() => {
          if (currentStrand > 1) setCurrentStrand(currentStrand - 1);
        }}
      />
    </div>
  );
};

export default MainScreen;