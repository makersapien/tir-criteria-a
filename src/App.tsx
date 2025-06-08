// src/App.tsx
import React, { useState } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';
import ResultsScreen from './screens/ResultsScreen';
import { StrandProvider } from './contexts/StrandContext';
import { QuestionSystemProvider } from './contexts/questionSystemContext';

const App = () => {
  const [screen, setScreen] = useState<'welcome' | 'main' | 'results'>('welcome');
  const [studentName, setStudentName] = useState('');
  const [learningPathChoice, setLearningPathChoice] = useState<'critical-angle' | 'fiber-optics' | null>(null); // ✅ Updated

  const [experimentTitle, setExperimentTitle] = useState('');
  const [points, setPoints] = useState(0);
  const [strandStatus, setStrandStatus] = useState([
    'in progress', 'not started', 'not started', 'not started' // ✅ Updated to 4 strands
  ]);
  const [earnedBadges, setEarnedBadges] = useState({
    principlePioneer: false,   // ✅ Updated badge names for TIR
    conceptCrusader: false,
    applicationAce: false,
    analysisArchitect: false
  });
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [currentStrand, setCurrentStrand] = useState(1);

  const handleStart = (name: string, learningPath: string) => {
    setStudentName(name);
    setLearningPathChoice(learningPath as 'critical-angle' | 'fiber-optics');
    
    // ✅ Set appropriate titles for each learning path
    setExperimentTitle(
      learningPath === 'critical-angle'
        ? "Discovering Critical Angles - Total Internal Reflection"
        : "How Fibre Optics Work - Light Transmission Technology"
    );
    setScreen('main');
  };

  const resetApp = () => {
    setScreen('welcome');
    setStudentName('');
    setLearningPathChoice(null);
    setCurrentStrand(1);
    setStrandStatus(['in progress', 'not started', 'not started', 'not started']); // ✅ 4 strands
    setEarnedBadges({
      principlePioneer: false,
      conceptCrusader: false, 
      applicationAce: false,
      analysisArchitect: false
    });
    setPoints(0);
    setPdfDataUrl('');
    setIsPdfGenerating(false);
  };

  return (
    <QuestionSystemProvider>
      <StrandProvider>
        {screen === 'welcome' && <WelcomeScreen onStart={handleStart} />}
        
        {screen === 'main' && (
          <MainScreen
            experimentTitle={experimentTitle}
            learningPathData={{
              'critical-angle': { title: "Discovering Critical Angles - Total Internal Reflection" },
              'fiber-optics': { title: "How Fibre Optics Work - Light Transmission Technology" },
            }}
            learningPathChoice={learningPathChoice} // ✅ Updated prop name
            currentStrand={currentStrand}
            setCurrentStrand={setCurrentStrand}
            points={points}
            setPoints={setPoints}
            strandStatus={strandStatus}
            setStrandStatus={setStrandStatus}
            earnedBadges={earnedBadges}
            setEarnedBadges={setEarnedBadges}
            onNext={() => setScreen('results')}
            onBack={() => setScreen('welcome')}
          />
        )}
        
        {screen === 'results' && (
          <ResultsScreen
            studentName={studentName}
            learningPathChoice={learningPathChoice} // ✅ Updated prop name
            learningPathData={{
              'critical-angle': { title: "Discovering Critical Angles - Total Internal Reflection" },
              'fiber-optics': { title: "How Fibre Optics Work - Light Transmission Technology" },
            }}
            setScreen={setScreen}
            setStudentName={setStudentName}
            setLearningPathChoice={setLearningPathChoice} // ✅ Updated
            setCurrentStrand={setCurrentStrand}
            pdfDataUrl={pdfDataUrl}
            setPdfDataUrl={setPdfDataUrl}
            isPdfGenerating={isPdfGenerating}
            setIsPdfGenerating={setIsPdfGenerating}
            onReset={resetApp} // ✅ Added reset function
          />
        )}
      </StrandProvider>
    </QuestionSystemProvider>
  );
};

export default App;