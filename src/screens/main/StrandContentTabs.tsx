// ===== CRITICAL FIX 1: StrandContentTabs.tsx - Progress & Evaluation =====
// src/screens/main/StrandContentTabs.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useStrandContext } from '../../contexts/StrandContext';
import GuidedExamplePanel from './GuidedExamplePanel';
import RichEditor from '../../components/RichEditor';
import { evaluateStrand } from '../../utils/evaluateStrand';
import strandTips from '../../data/strandTips.json';
import MagnetFieldSimulator from './TIRsimulation';
import YourResponseSection from '../../components/YourResponse';
import { supabase } from '../../lib/supabaseClient';

interface StrandContentTabsProps {
  currentStrand: number;
  learningPathChoice: 'critical-angle' | 'fiber-optics';
  currentStudentId: string;
  sessionCode: string;
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
  learningPathChoice,
  currentStudentId,
  sessionCode,
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

  const [activeTab, setActiveTab] = useState<'guided' | 'your' | 'sim' | 'questions'>('questions');
  const [feedbackByStrand, setFeedbackByStrand] = useState<Record<string, typeof defaultFeedback>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationTimeout, setEvaluationTimeout] = useState<NodeJS.Timeout | null>(null);

  const raw = userInputs[strandKey]?.level8 || '';
  const feedback = feedbackByStrand[strandKey] || defaultFeedback;

  // ✅ CRITICAL FIX: Progress update handler with immediate state sync
  const handleProgressUpdate = useCallback((strand: number, level: number, score: number) => {
    console.log('🎯 PROGRESS UPDATE RECEIVED:', { strand, level, score, currentStrand });
    
    // Immediate state update with bounds checking
    setStrandProgress(prevProgress => {
      const newProgress = [...prevProgress];
      const arrayIndex = strand - 1;
      
      // Ensure valid strand index (0-3 for 4 strands)
      if (arrayIndex >= 0 && arrayIndex < 4) {
        const currentScore = newProgress[arrayIndex] || 0;
        const newScore = Math.max(currentScore, Math.min(8, Math.max(0, score)));
        newProgress[arrayIndex] = newScore;
        
        console.log('📊 PROGRESS UPDATED:', {
          strand,
          oldScore: currentScore,
          newScore,
          fullProgress: newProgress
        });
        
        return newProgress;
      } else {
        console.warn('⚠️ Invalid strand index:', arrayIndex);
        return prevProgress;
      }
    });
  }, [setStrandProgress]);

  // ✅ CRITICAL FIX: Enhanced evaluation with proper error handling
  const performEvaluation = useCallback(async (content: string) => {
    if (!content.trim()) {
      setFeedbackByStrand(prev => ({ 
        ...prev, 
        [strandKey]: defaultFeedback 
      }));
      
      // Update progress to 0 for empty content
      setStrandProgress(prev => {
        const newProgress = [...prev];
        newProgress[currentStrand - 1] = 0;
        return newProgress;
      });
      
      return;
    }

    setIsEvaluating(true);
    console.log('🔍 STARTING EVALUATION:', { strandKey, learningPathChoice, contentLength: content.length });

    try {
      const result = await evaluateStrand(content, learningPathChoice, strandKey);
      
      console.log('✅ EVALUATION COMPLETE:', {
        level: result.level,
        keywords: result.matchedKeywords.length,
        concepts: result.matchedConcepts.length,
        suggestions: result.suggestions.length
      });

      // Update feedback
      setFeedbackByStrand(prev => ({ 
        ...prev, 
        [strandKey]: result 
      }));

      // Update progress immediately
      setStrandProgress(prev => {
        const newProgress = [...prev];
        newProgress[currentStrand - 1] = result.level;
        console.log('📈 EVALUATION PROGRESS UPDATE:', {
          strand: currentStrand,
          newLevel: result.level,
          fullProgress: newProgress
        });
        return newProgress;
      });

    } catch (error) {
      console.error('💥 EVALUATION ERROR:', error);
      
      setFeedbackByStrand(prev => ({ 
        ...prev, 
        [strandKey]: {
          ...defaultFeedback,
          suggestions: ['Evaluation temporarily unavailable. Content saved successfully.']
        }
      }));
    } finally {
      setIsEvaluating(false);
    }
  }, [learningPathChoice, strandKey, currentStrand, setStrandProgress]);

  // ✅ CRITICAL FIX: Debounced evaluation with cleanup
  useEffect(() => {
    // Clear existing timeout
    if (evaluationTimeout) {
      clearTimeout(evaluationTimeout);
    }

    // Set new timeout for evaluation
    const newTimeout = setTimeout(() => {
      performEvaluation(raw);
    }, 1500); // 1.5 second debounce

    setEvaluationTimeout(newTimeout);

    // Cleanup on unmount or dependency change
    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [raw, performEvaluation]);

  // ✅ Load saved content from Supabase
  useEffect(() => {
    const fetchStrands = async () => {
      if (!currentStudentId || !learningPathChoice || !sessionCode) return;
      
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('strand1, strand2, strand3, strand4')
          .eq('student_id', currentStudentId)
          .eq('experiment', learningPathChoice)
          .eq('session_code', sessionCode)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching strand data:', error);
          return;
        }

        if (data) {
          console.log('📥 LOADING SAVED DATA:', data);
          setUserInputs({
            strand1: { level8: data.strand1 || '' },
            strand2: { level8: data.strand2 || '' },
            strand3: { level8: data.strand3 || '' },
            strand4: { level8: data.strand4 || '' },
          });
        }
      } catch (error) {
        console.error('💥 Error in fetchStrands:', error);
      }
    };

    fetchStrands();
  }, [currentStudentId, learningPathChoice, sessionCode, setUserInputs]);

  const handleEditorChange = useCallback((newContent: string) => {
    console.log('✏️ EDITOR CONTENT CHANGED:', { length: newContent.length, strand: currentStrand });
    setUserInputs(prev => ({
      ...prev,
      [strandKey]: {
        ...prev[strandKey],
        level8: newContent,
      },
    }));
  }, [strandKey, setUserInputs, currentStrand]);

  const levelColor = (level: number) => {
    if (level >= 7) return 'bg-green-100 text-green-800 border-green-300';
    if (level >= 5) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (level >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Get tips (simplified for now)
  const getTipsForCurrentStrand = () => {
    try {
      return (strandTips as any)?.[learningPathChoice]?.[strandKey] || {};
    } catch (error) {
      console.error('❌ Error loading tips:', error);
      return {};
    }
  };

  const currentTips = getTipsForCurrentStrand();

  return (
    <div className="strand-content-tabs p-4 border rounded-md shadow-sm bg-white">
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-bold text-blue-800">DEBUG INFO:</div>
          <div>Current Progress: {JSON.stringify(strandProgress)}</div>
          <div>Current Strand: {currentStrand}</div>
          <div>Feedback Level: {feedback.level}</div>
          <div>Is Evaluating: {isEvaluating ? 'Yes' : 'No'}</div>
          <div>Content Length: {raw.length}</div>
        </div>
      )}

      <h2 className="font-semibold text-lg mb-2">Strand {currentStrand}</h2>
      <p className="text-sm mb-4 text-gray-700">
        Navigate through tabs to explore examples, try simulations, and complete interactive questions.
      </p>

      <div className="flex border-b mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            activeTab === 'guided' ? 'border-b-2 border-purple-500 text-purple-600' : ''
          }`}
          onClick={() => setActiveTab('guided')}
        >
          📚 Guided Example
        </button>
        <button
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            activeTab === 'sim' ? 'border-b-2 border-purple-500 text-purple-600' : ''
          }`}
          onClick={() => setActiveTab('sim')}
        >
          🔬 Simulation
        </button>
        <button
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            activeTab === 'questions' ? 'border-b-2 border-purple-500 text-purple-600' : ''
          }`}
          onClick={() => setActiveTab('questions')}
        >
          ✍️ Interactive Questions
        </button>
        <button
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            activeTab === 'your' ? 'border-b-2 border-purple-500 text-purple-600' : ''
          }`}
          onClick={() => setActiveTab('your')}
        >
          📝 Your Response
        </button>
      </div>

      {activeTab === 'guided' && (
        <div className="mt-4">
          <GuidedExamplePanel 
            currentStrand={currentStrand} 
            learningPathChoice={learningPathChoice}
          />
        </div>
      )}

      {activeTab === 'sim' && (
        <div className="mt-4">
          <MagnetFieldSimulator />
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="mt-4">
          <YourResponseSection
            currentStrand={currentStrand}
            experimentChoice={learningPathChoice}
            currentStudentId={currentStudentId}
            sessionCode={sessionCode}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>
      )}

      {activeTab === 'your' && (
        <div className="mt-4">
          <label className="block mb-2 font-medium text-sm">
            Your Response for Strand {currentStrand}
          </label>

          {/* Basic tips section */}
          {Object.keys(currentTips).length > 0 && (
            <div className="bg-yellow-50 p-3 mb-3 rounded border border-yellow-200 text-sm">
              <h4 className="font-semibold text-sm mb-1">💡 Tips:</h4>
              <p className="text-gray-700">Focus on using scientific vocabulary and explaining concepts clearly.</p>
            </div>
          )}

          <RichEditor
            key={strandKey}
            content={raw}
            onChange={handleEditorChange}
            currentStudentId={currentStudentId}
            currentStrand={currentStrand}
            currentExperimentChoice={learningPathChoice}
            sessionCode={sessionCode}
          />

          {/* ✅ CRITICAL FIX: Enhanced Live Feedback */}
          <div className={`mt-4 p-4 rounded-lg border-2 transition-all duration-300 ${levelColor(feedback.level)}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm flex items-center">
                🔍 Live Evaluation
                {isEvaluating && (
                  <span className="ml-2 animate-spin text-blue-500">⏳</span>
                )}
              </h4>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {feedback.level}/8
                </span>
                <div className="text-xs text-gray-600">
                  {feedback.level >= 7 ? 'Excellent' : 
                   feedback.level >= 5 ? 'Good' : 
                   feedback.level >= 3 ? 'Adequate' : 
                   feedback.level > 0 ? 'Developing' : 'Start Writing'}
                </div>
              </div>
            </div>

            {/* Progress bar for current level */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress to Level 8</span>
                <span>{Math.round((feedback.level / 8) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(feedback.level / 8) * 100}%` }}
                />
              </div>
            </div>

            {feedback.matchedKeywords.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold mb-2">🎯 Scientific Terms Found ({feedback.matchedKeywords.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.matchedKeywords.slice(0, 8).map((kw, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-300">
                      {kw.label}
                    </span>
                  ))}
                  {feedback.matchedKeywords.length > 8 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      +{feedback.matchedKeywords.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {feedback.matchedConcepts.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold mb-2">🧠 Concepts Identified ({feedback.matchedConcepts.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.matchedConcepts.slice(0, 6).map((cpt, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      {cpt.label}
                    </span>
                  ))}
                  {feedback.matchedConcepts.length > 6 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      +{feedback.matchedConcepts.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {feedback.suggestions.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2">💬 Suggestions for Improvement:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {feedback.suggestions.slice(0, 3).map((sug, i) => (
                    <li key={i} className="text-gray-700">{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.level === 0 && raw.length > 0 && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                💭 Keep writing! Add scientific vocabulary and detailed explanations to improve your score.
              </div>
            )}

            {raw.length === 0 && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border text-center">
                ✏️ Start typing your response to see live evaluation feedback
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button 
          onClick={onPrevious} 
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          disabled={currentStrand === 1}
        >
          ◀ Previous Strand
        </button>
        <button 
          onClick={onNext} 
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
        >
          {currentStrand === 4 ? 'Complete Assessment ▶' : 'Next Strand ▶'}
        </button>
      </div>
    </div>
  );
};

export default StrandContentTabs;