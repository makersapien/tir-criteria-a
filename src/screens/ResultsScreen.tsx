// src/screens/ResultsScreen.tsx
import React, { useRef } from 'react';
import { useStrandContext } from '../contexts/StrandContext';
import { generatePDF } from '../utils/generatePDF';

interface Props {
  studentName: string;
  experimentChoice: string;
  experimentData: any;
  setScreen: React.Dispatch<React.SetStateAction<'welcome' | 'main' | 'results'>>;
  setStudentName: (name: string) => void;
  setExperimentChoice: (exp: string | null) => void;
  setCurrentStrand: (strand: number) => void;
  pdfDataUrl: string;
  setPdfDataUrl: (url: string) => void;
  isPdfGenerating: boolean;
  setIsPdfGenerating: (gen: boolean) => void;
}

const ResultsScreen: React.FC<Props> = ({
  studentName,
  experimentChoice,
  experimentData,
  setScreen,
  setStudentName,
  setExperimentChoice,
  setCurrentStrand,
  pdfDataUrl,
  setPdfDataUrl,
  isPdfGenerating,
  setIsPdfGenerating
}) => {
  const {
    strandProgress,
    userInputs,
    setStrandProgress,
    setUserInputs,
    earnedBadges,
    setEarnedBadges,
    points,
    setPoints,
    strandStatus,
    setStrandStatus,
  } = useStrandContext();

  const totalScore = strandProgress.reduce((sum, val) => sum + val, 0);
  const totalBadges = Object.values(earnedBadges ?? {}).filter(Boolean).length;
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

  const handleGeneratePdf = async () => {
    try {
      setIsPdfGenerating(true);
      const blob = await generatePDF({
        studentName,
        experimentTitle: experimentData[experimentChoice]?.title,
        strandProgress,
        userInputs,
        points,
        earnedBadges,
      });
  
      const url = URL.createObjectURL(blob);
      setPdfDataUrl(url);
    } catch (e) {
      alert('Failed to generate PDF');
      console.error(e);
    } finally {
      setIsPdfGenerating(false);
    }
  };
  const handleReset = () => {
    setScreen('welcome');
    setStudentName('');
    setExperimentChoice(null);
    setCurrentStrand(1);
    setStrandProgress([0, 0, 0, 0, 0]);
    setUserInputs({
      strand1: { level2: '', level4: '', level6: '', level8: '' },
      strand2: { level2: '', level4: '', level6: '', level8: '' },
      strand3: { level2: '', level4: '', level6: '', level8: '' },
      strand4: { level2: '', level4: '', level6: '', level8: '' },
      strand5: { level2: '', level4: '', level6: '', level8: '' }
    });
    setEarnedBadges({
      dataWizard: false,
      analysisAce: false,
      hypothesisHero: false,
      methodMaster: false,
      innovationInnovator: false
    });
    setPoints(0);
    setStrandStatus(['in progress', 'not started', 'not started', 'not started', 'not started']);
    setPdfDataUrl('');
    setIsPdfGenerating(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-4">
        Well Done, {studentName}!
      </h1>
      <p className="text-center text-lg mb-6">
        You completed the <strong>{experimentData[experimentChoice]?.title}</strong> investigation.
      </p>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Total Score</p>
          <p className="text-3xl font-bold text-blue-800">{totalScore}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Points</p>
          <p className="text-3xl font-bold text-blue-800">{points}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Badges</p>
          <p className="text-3xl font-bold text-blue-800">{totalBadges}/5</p>
        </div>
      </div>

      {/* Preview Section */}
      {Array.from({ length: 5 }).map((_, i) => {
        const html = userInputs[`strand${i + 1}`]?.level8 || '';
        return (
          <div key={i} className="border p-4 rounded bg-white mb-4">
            <h3 className="text-lg font-semibold text-blue-700">Strand {i + 1}</h3>
            <p className="text-sm text-gray-500 mb-2">Level: {strandProgress[i] || 0}/8</p>
            <div
              className="prose max-w-none text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        );
      })}

      <div className="flex flex-col gap-4 mt-6">
        <button
          onClick={handleGeneratePdf}

          disabled={isPdfGenerating}
          className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          {isPdfGenerating ? 'Generating PDF...' : 'Generate PDF Report'}
        </button>

        {pdfDataUrl && (
          <a
            href={pdfDataUrl}
            download={`Lab_Report_${studentName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
          >
            View & Download PDF
          </a>
        )}

        <button
          onClick={handleReset}
          className="bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500"
        >
          Try a Different Experiment
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
