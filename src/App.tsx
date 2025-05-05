// src/App.tsx
import React, { useState } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';
import ResultsScreen from './screens/ResultsScreen';
import { StrandProvider } from './contexts/StrandContext';

const App = () => {
  const [screen, setScreen] = useState<'welcome' | 'main' | 'results'>('welcome');
  const [studentName, setStudentName] = useState('');
  const [experimentChoice, setExperimentChoice] = useState<'distance' | 'magnets' | null>(null);

  const [experimentTitle, setExperimentTitle] = useState('');
  const [points, setPoints] = useState(0);
  const [strandStatus, setStrandStatus] = useState([
    'in progress', 'not started', 'not started', 'not started', 'not started'
  ]);
  const [earnedBadges, setEarnedBadges] = useState({
    dataWizard: false,
    analysisAce: false,
    hypothesisHero: false,
    methodMaster: false,
    innovationInnovator: false
  });
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [currentStrand, setCurrentStrand] = useState(1);

  const handleStart = (name: string, experiment: string) => {
    setStudentName(name);
    setExperimentChoice(experiment);
    setExperimentTitle(
      experiment === 'distance'
        ? "Distance's Effect on Magnetic Strength"
        : "Multiple Magnets' Effect on Strength"
    );
    setScreen('main');
  };

  return (
    <StrandProvider>
      {screen === 'welcome' && <WelcomeScreen onStart={handleStart} />}
      {screen === 'main' && (
        <MainScreen
          experimentTitle={experimentTitle}
          experimentData={{
            distance: { title: "Distance's Effect on Magnetic Strength" },
            magnets: { title: "Multiple Magnets' Effect on Strength" },
          }}
          experimentChoice={experimentChoice}
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
            experimentChoice={experimentChoice}
            experimentData={{
              distance: { title: "Distance's Effect on Magnetic Strength" },
              magnets: { title: "Multiple Magnets' Effect on Strength" },
            }}
            setScreen={setScreen}
            setStudentName={setStudentName}
            setExperimentChoice={setExperimentChoice}
            setCurrentStrand={setCurrentStrand}
            pdfDataUrl={pdfDataUrl}
            setPdfDataUrl={setPdfDataUrl}
            isPdfGenerating={isPdfGenerating}
            setIsPdfGenerating={setIsPdfGenerating}
          />
        )}
    </StrandProvider>
  );
};

export default App;
