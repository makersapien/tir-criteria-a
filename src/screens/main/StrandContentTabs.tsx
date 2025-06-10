// ===== WORLD-CLASS UI: Dual-Mode StrandContentTabs =====
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
  const [isCompactView, setIsCompactView] = useState(false);

  const raw = userInputs[strandKey]?.level8 || '';
  const feedback = feedbackByStrand[strandKey] || defaultFeedback;

  // Enhanced progress update handler with immediate state sync
  const handleProgressUpdate = useCallback((strand: number, level: number, score: number) => {
    console.log('🎯 PROGRESS UPDATE RECEIVED:', { strand, level, score, currentStrand });
    
    setStrandProgress(prevProgress => {
      const newProgress = [...prevProgress];
      const arrayIndex = strand - 1;
      
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

  // Enhanced evaluation with proper error handling
  const performEvaluation = useCallback(async (content: string) => {
    if (!content.trim()) {
      setFeedbackByStrand(prev => ({ 
        ...prev, 
        [strandKey]: defaultFeedback 
      }));
      
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

      setFeedbackByStrand(prev => ({ 
        ...prev, 
        [strandKey]: result 
      }));

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

  // Debounced evaluation with cleanup
  useEffect(() => {
    if (evaluationTimeout) {
      clearTimeout(evaluationTimeout);
    }

    const newTimeout = setTimeout(() => {
      performEvaluation(raw);
    }, 1500);

    setEvaluationTimeout(newTimeout);

    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [raw, performEvaluation]);

  // Load saved content from Supabase
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

  const getTipsForCurrentStrand = () => {
    try {
      return (strandTips as any)?.[learningPathChoice]?.[strandKey] || {};
    } catch (error) {
      console.error('❌ Error loading tips:', error);
      return {};
    }
  };

  const currentTips = getTipsForCurrentStrand();

  // Toggle between compact and expanded view
  const toggleView = () => {
    setIsCompactView(!isCompactView);
  };

  // Get tab configuration based on view mode
  const getTabConfig = () => {
    const tabs = [
      { 
        key: 'questions', 
        label: 'Interactive Questions', 
        icon: '✍️', 
        shortLabel: 'Questions',
        description: 'Practice with guided questions'
      },
      { 
        key: 'guided', 
        label: 'Guided Example', 
        icon: '📚', 
        shortLabel: 'Example',
        description: 'See worked examples'
      },
      { 
        key: 'sim', 
        label: 'Simulation', 
        icon: '🔬', 
        shortLabel: 'Sim',
        description: 'Interactive experiments'
      },
      { 
        key: 'your', 
        label: 'Your Response', 
        icon: '📝', 
        shortLabel: 'Response',
        description: 'Write your answers'
      }
    ];
    
    return tabs;
  };

  const tabs = getTabConfig();

  return (
    <div className="strand-content-tabs bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* 🎯 HEADER WITH TOGGLE */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold text-lg text-purple-800">
                Strand {currentStrand}
                {isCompactView && (
                  <span className="ml-2 text-sm font-normal text-purple-600">
                    • {tabs.find(t => t.key === activeTab)?.shortLabel}
                  </span>
                )}
              </h2>
              {!isCompactView && (
                <p className="text-sm text-gray-600">
                  Navigate through tabs to explore examples, try simulations, and complete interactive questions.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Current progress indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Progress:</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${
                  feedback.level >= 7 ? 'text-green-600' : 
                  feedback.level >= 5 ? 'text-blue-600' : 
                  feedback.level >= 3 ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {feedback.level}/8
                </span>
                {isEvaluating && (
                  <span className="animate-spin text-purple-500">⏳</span>
                )}
              </div>
            </div>
            
            {/* View toggle button */}
            <button
              onClick={toggleView}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-purple-200 hover:border-purple-300 rounded-md transition-all hover:shadow-sm"
              title={isCompactView ? "Switch to expanded view" : "Switch to compact view"}
            >
              {isCompactView ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Expand
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Compact
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🎯 SUPER COMPACT VIEW */}
      {isCompactView && (
        <div className="px-4 py-3">
          {/* Ultra-compact tab selector */}
          <div className="flex gap-1 mb-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === tab.key
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <span className="block">{tab.icon}</span>
                <span className="block text-xs mt-0.5">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
          
          {/* Compact content area */}
          <div className="min-h-[200px] bg-gray-50 rounded-lg p-3">
            {activeTab === 'guided' && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">📚 Guided Example</h4>
                <GuidedExamplePanel 
                  currentStrand={currentStrand} 
                  learningPathChoice={learningPathChoice}
                />
              </div>
            )}

            {activeTab === 'sim' && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">🔬 Simulation</h4>
                <MagnetFieldSimulator />
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">✍️ Interactive Questions</h4>
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
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">📝 Your Response</h4>
                
                {/* Compact editor */}
                <RichEditor
                  key={strandKey}
                  content={raw}
                  onChange={handleEditorChange}
                  currentStudentId={currentStudentId}
                  currentStrand={currentStrand}
                  currentExperimentChoice={learningPathChoice}
                  sessionCode={sessionCode}
                />
                
                {/* Mini feedback panel */}
                {(feedback.level > 0 || raw.length > 0) && (
                  <div className={`mt-2 p-2 rounded border text-xs ${levelColor(feedback.level)}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Live Evaluation</span>
                      <span className="font-bold">{feedback.level}/8</span>
                    </div>
                    {feedback.matchedKeywords.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs">Keywords: </span>
                        {feedback.matchedKeywords.slice(0, 3).map((kw, i) => (
                          <span key={i} className="inline-block bg-white bg-opacity-50 px-1 rounded mr-1 text-xs">
                            {kw.label}
                          </span>
                        ))}
                        {feedback.matchedKeywords.length > 3 && (
                          <span className="text-xs">+{feedback.matchedKeywords.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎯 EXPANDED VIEW - Enhanced sleek design */}
      {!isCompactView && (
        <div className="p-4">
          {/* Modern tab navigation */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`flex-1 px-4 py-3 font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-purple-700 shadow-sm border border-purple-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm font-medium">{tab.label}</span>
                  <span className="text-xs text-gray-500">{tab.description}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Enhanced content areas */}
          <div className="min-h-[400px]">
            {activeTab === 'guided' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📚</span>
                  <h3 className="font-semibold text-blue-900">Guided Example</h3>
                </div>
                <GuidedExamplePanel 
                  currentStrand={currentStrand} 
                  learningPathChoice={learningPathChoice}
                />
              </div>
            )}

            {activeTab === 'sim' && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🔬</span>
                  <h3 className="font-semibold text-green-900">Interactive Simulation</h3>
                </div>
                <MagnetFieldSimulator />
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">✍️</span>
                  <h3 className="font-semibold text-purple-900">Interactive Questions</h3>
                </div>
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
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📝</span>
                  <h3 className="font-semibold text-yellow-900">Your Response for Strand {currentStrand}</h3>
                </div>

                {/* Enhanced tips section */}
                {Object.keys(currentTips).length > 0 && (
                  <div className="bg-yellow-100 p-4 mb-4 rounded-lg border border-yellow-300">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      💡 Tips for Success
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Focus on using scientific vocabulary and explaining concepts clearly. 
                      Include specific examples and detailed explanations to improve your evaluation score.
                    </p>
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

                {/* Enhanced Live Feedback Panel */}
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
          </div>
        </div>
      )}

      {/* 🎯 NAVIGATION FOOTER */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <button 
            onClick={onPrevious} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
            disabled={currentStrand === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous Strand
          </button>
          
          <div className="text-center">
            <div className="text-xs text-gray-500">Strand Progress</div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4].map((strand) => (
                <div
                  key={strand}
                  className={`w-2 h-2 rounded-full ${
                    strand === currentStrand
                      ? 'bg-purple-500'
                      : strand < currentStrand
                      ? 'bg-green-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button 
            onClick={onNext} 
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
          >
            {currentStrand === 4 ? 'Complete Assessment' : 'Next Strand'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 🎯 DEBUG INFO - Completely hidden in production, collapsible in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mx-4 mb-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 py-2">
            🔧 Developer Debug Information
          </summary>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>Current Progress: {JSON.stringify(strandProgress)}</div>
              <div>Current Strand: {currentStrand}</div>
              <div>Feedback Level: {feedback.level}</div>
              <div>Is Evaluating: {isEvaluating ? 'Yes' : 'No'}</div>
              <div>Content Length: {raw.length}</div>
              <div>Active Tab: {activeTab}</div>
              <div>View Mode: {isCompactView ? 'Compact' : 'Expanded'}</div>
              <div>Session Code: {sessionCode}</div>
            </div>
          </div>
        </details>
      )}
    </div>
  );
};

export default StrandContentTabs;