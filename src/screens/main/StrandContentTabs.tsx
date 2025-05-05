// src/screens/main/StrandContentTabs.tsx
import React, { useState, useEffect } from 'react';
import { useStrandContext } from '../../contexts/StrandContext';
import GuidedExamplePanel from './GuidedExamplePanel';
import RichEditor from '../../components/RichEditor';
import HighlightText from '../../utils/highlightText';
import { evaluateStrand } from '../../utils/evaluateStrand';
import strandTips from '../../data/strandTips.json';
import MagnetFieldSimulator from '../../components/MagnetFieldSimulator'; // ✅ new import

interface StrandContentTabsProps {
  currentStrand: number;
  experimentChoice: 'distance' | 'magnets';
  onNext: () => void;
  onPrevious: () => void;
}

const defaultFeedback = {
  matchedKeywords: [],
  matchedConcepts: [],
  level: 0,
  suggestions: [],
};

const StrandContentTabs: React.FC<StrandContentTabsProps> = ({
  currentStrand,
  experimentChoice,
  onNext,
  onPrevious,
}) => {
  const strandKey = `strand${currentStrand}`;
  const {
    userInputs,
    setUserInputs,
    strandProgress,
    setStrandProgress,
  } = useStrandContext();

  const [activeTab, setActiveTab] = useState<'guided' | 'your' | 'sim'>('your');
  const [feedbackByStrand, setFeedbackByStrand] = useState<Record<string, typeof defaultFeedback>>({});

  const raw = userInputs[strandKey]?.level8 || '';
  const feedback = feedbackByStrand[strandKey] || defaultFeedback;

  useEffect(() => {
    const evaluate = async () => {
      const result = await evaluateStrand(raw, experimentChoice, strandKey);
      setFeedbackByStrand((prev) => ({ ...prev, [strandKey]: result }));
      const updatedProgress = [...strandProgress];
      updatedProgress[currentStrand - 1] = result.level;
      setStrandProgress(updatedProgress);
    };

    if (raw.trim()) {
      evaluate();
    }
  }, [raw, experimentChoice, strandKey]);

  const handleEditorChange = (newContent: string) => {
    setUserInputs((prev) => ({
      ...prev,
      [strandKey]: {
        ...prev[strandKey],
        level8: newContent,
      },
    }));
  };

  const levelColor = (level: number) => {
    if (level >= 7) return 'bg-green-100 text-green-800';
    if (level >= 5) return 'bg-blue-100 text-blue-800';
    if (level >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="strand-content-tabs p-4 border rounded-md shadow-sm bg-white">
      <h2 className="font-semibold text-lg mb-2">Strand {currentStrand}</h2>
      <p className="text-sm mb-4 text-gray-700">
        Navigate through tabs to explore examples, try simulations, and write your response.
      </p>

      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'guided' ? 'border-b-2 border-blue-500 text-blue-600' : ''
          }`}
          onClick={() => setActiveTab('guided')}
        >
          Guided Example
        </button>
        <button
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'sim' ? 'border-b-2 border-blue-500 text-blue-600' : ''
          }`}
          onClick={() => setActiveTab('sim')}
        >
          Simulation
        </button>
        <button
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'your' ? 'border-b-2 border-blue-500 text-blue-600' : ''
          }`}
          onClick={() => setActiveTab('your')}
        >
          Your Experiment
        </button>
      </div>

      {activeTab === 'guided' && (
        <div className="mt-4">
          <GuidedExamplePanel currentStrand={currentStrand} />
        </div>
      )}

      {activeTab === 'sim' && (
        <div className="mt-4">
          <MagnetFieldSimulator />
        </div>
      )}

      {activeTab === 'your' && (
        <div className="mt-4">
          <label className="block mb-2 font-medium text-sm">
            Your Response for Strand {currentStrand}
          </label>

          {/* Tips Section */}
          <div className="bg-yellow-50 p-3 mb-3 rounded border border-yellow-200 text-sm">
            <h4 className="font-semibold text-sm mb-1">💡 Tips to Reach Level 8:</h4>
            {Object.entries(strandTips?.[experimentChoice]?.[strandKey] || {}).map(([level, tip]) => (
              <p key={level} className="text-gray-700 mb-1">
                <strong>{level.toUpperCase()}:</strong> {String(tip)}
              </p>
            ))}
          </div>

          <RichEditor key={strandKey} content={raw} onChange={handleEditorChange} />

          {/* Live Feedback */}
          <div className={`mt-4 p-4 rounded-md border ${levelColor(feedback.level)}`}>
            <h4 className="font-semibold text-sm mb-2">🔍 Live Evaluation:</h4>
            <p className="text-sm mb-1">
              <strong>Level:</strong> {feedback.level} / 8
            </p>

            <p className="text-sm font-semibold mt-2 mb-1">🟨 Detected Keywords:</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {feedback.matchedKeywords.map((kw, i) => (
                <span key={i} className={`px-2 py-1 text-xs rounded ${levelColor(kw.level)}`}>
                  {kw.label}
                </span>
              ))}
            </div>

            <p className="text-sm font-semibold mb-1">📘 Concepts Matched:</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {feedback.matchedConcepts.map((cpt, i) => (
                <span key={i} className={`px-2 py-1 text-xs rounded ${levelColor(cpt.level)}`}>
                  {cpt.label}
                </span>
              ))}
            </div>

            {feedback.suggestions.length > 0 && (
              <>
                <p className="text-sm font-semibold mb-1">💬 Suggestions:</p>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {feedback.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button onClick={onPrevious} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
          ◀ Previous Strand
        </button>
        <button onClick={onNext} className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Next Strand ▶
        </button>
      </div>
    </div>
  );
};

export default StrandContentTabs;
