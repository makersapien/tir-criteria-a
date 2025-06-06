// src/screens/ResultsScreen.tsx
import React, { useRef } from 'react';
import { useStrandContext } from '../contexts/StrandContext';
import { generatePDF } from '../utils/generatePDF';

interface Props {
  studentName: string;
  learningPathChoice: 'critical-angle' | 'fiber-optics' | null; // ✅ Updated prop name
  learningPathData: any; // ✅ Updated prop name
  setScreen: React.Dispatch<React.SetStateAction<'welcome' | 'main' | 'results'>>;
  setStudentName: (name: string) => void;
  setLearningPathChoice: (path: 'critical-angle' | 'fiber-optics' | null) => void; // ✅ Updated
  setCurrentStrand: (strand: number) => void;
  pdfDataUrl: string;
  setPdfDataUrl: (url: string) => void;
  isPdfGenerating: boolean;
  setIsPdfGenerating: (gen: boolean) => void;
  onReset: () => void; // ✅ Added reset function
}

const ResultsScreen: React.FC<Props> = ({
  studentName,
  learningPathChoice, // ✅ Updated prop name
  learningPathData, // ✅ Updated prop name
  setScreen,
  setStudentName,
  setLearningPathChoice, // ✅ Updated
  setCurrentStrand,
  pdfDataUrl,
  setPdfDataUrl,
  isPdfGenerating,
  setIsPdfGenerating,
  onReset
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
        experimentTitle: learningPathData[learningPathChoice]?.title || 'TIR Learning Path', // ✅ Updated
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
    setLearningPathChoice(null); // ✅ Updated
    setCurrentStrand(1);
    setStrandProgress([0, 0, 0, 0]); // ✅ Updated to 4 strands
    setUserInputs({
      strand1: { level2: '', level4: '', level6: '', level8: '' },
      strand2: { level2: '', level4: '', level6: '', level8: '' },
      strand3: { level2: '', level4: '', level6: '', level8: '' },
      strand4: { level2: '', level4: '', level6: '', level8: '' } // ✅ Updated to 4 strands
    });
    setEarnedBadges({
      principlePioneer: false,    // ✅ Updated badge names
      conceptCrusader: false,
      applicationAce: false,
      analysisArchitect: false
    });
    setPoints(0);
    setStrandStatus(['in progress', 'not started', 'not started', 'not started']); // ✅ Updated to 4 strands
    setPdfDataUrl('');
    setIsPdfGenerating(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-4">
        🌟 Well Done, {studentName}! 💎
      </h1>
      <p className="text-center text-lg mb-6">
        You completed the <strong>{learningPathData[learningPathChoice]?.title}</strong> learning journey.
      </p>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-800">Total Score</p>
          <p className="text-3xl font-bold text-purple-800">{totalScore}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-800">Points</p>
          <p className="text-3xl font-bold text-purple-800">{points}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-800">Badges</p>
          <p className="text-3xl font-bold text-purple-800">{totalBadges}/4</p> {/* ✅ Updated to 4 badges */}
        </div>
      </div>

      {/* Learning Path Summary */}
      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          🎯 Learning Path: {learningPathChoice === 'critical-angle' ? 'Discovering Critical Angles' : 'How Fibre Optics Work'}
        </h3>
        <p className="text-purple-700">
          {learningPathChoice === 'critical-angle' 
            ? 'You explored the physics behind total internal reflection and discovered the critical angle where this phenomenon begins.'
            : 'You investigated how light travels through glass fibers to enable modern communication and medical technologies.'
          }
        </p>
      </div>

      {/* Preview Section - Updated to 4 strands */}
      {Array.from({ length: 4 }).map((_, i) => {
        const html = userInputs[`strand${i + 1}`]?.level8 || '';
        const strandNames = [
          'TIR Principles & Laws',
          'Understanding TIR Phenomena', 
          'Real-World Applications',
          'Analysis & Problem Solving'
        ];
        
        return (
          <div key={i} className="border border-purple-200 p-4 rounded bg-white mb-4">
            <h3 className="text-lg font-semibold text-purple-700">
              Strand {i + 1}: {strandNames[i]}
            </h3>
            <p className="text-sm text-gray-500 mb-2">Level: {strandProgress[i] || 0}/8</p>
            <div
              className="prose max-w-none text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        );
      })}

      {/* Badge Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">🏆 Badges Earned</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'principlePioneer', label: 'Principle Pioneer', icon: '🔬', description: 'TIR laws mastered' },
            { key: 'conceptCrusader', label: 'Concept Crusader', icon: '🧠', description: 'Deep understanding' },
            { key: 'applicationAce', label: 'Application Ace', icon: '⚡', description: 'Real-world connections' },
            { key: 'analysisArchitect', label: 'Analysis Architect', icon: '📊', description: 'Problem solving' }
          ].map((badge) => (
            <div
              key={badge.key}
              className={`p-3 rounded-lg text-center text-sm transition ${
                earnedBadges[badge.key]
                  ? 'bg-purple-100 border-2 border-purple-400 text-purple-800'
                  : 'bg-gray-100 border-2 border-gray-300 text-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="font-medium">{badge.label}</div>
              <div className="text-xs">{badge.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <button
          onClick={handleGeneratePdf}
          disabled={isPdfGenerating}
          className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          {isPdfGenerating ? 'Generating PDF...' : '📄 Generate PDF Report'}
        </button>

        {pdfDataUrl && (
          <a
            href={pdfDataUrl}
            download={`TIR_Report_${studentName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition"
          >
            📥 View & Download PDF
          </a>
        )}

        <button
          onClick={onReset || handleReset}
          className="bg-purple-400 text-white py-3 rounded-lg hover:bg-purple-500 transition"
        >
          🔄 Try a Different Learning Path
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;