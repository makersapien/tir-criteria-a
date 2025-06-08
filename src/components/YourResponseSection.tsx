// src/components/YourResponseSection.tsx
// FULLY INTEGRATED VERSION: Combining your existing excellent system with UniversalQuestionRenderer

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ✅ Import your existing systems (keeping all your excellent functionality)
import { useStrandContext } from '../contexts/StrandContext';
import { useQuestionSystem } from '../contexts/questionSystemContext';
import { generateStrandData } from '../utils/integrationFixes';
import { useQuestionStrandSync } from '../hooks/useQuestionStrandSync';

// ✅ Import your existing question components (primary system)
import QuestionBlockComponent from './questions/QuestionBlock';

// ✅ Import the UniversalQuestionRenderer (as enhancement option)
import UniversalQuestionRenderer, { UniversalQuestionUtils } from './questions/UniversalQuestionRenderer';

// ✅ Import existing types
import type { QuestionBlock as QuestionBlockType } from '../types/questionBlock';

// ✅ Simple interface to avoid context conflicts
interface QuestionSystemContextType {
  questionSystem?: {
    strands: {
      [key: number]: {
        questionBlocks: {
          [key: string]: {
            completed: boolean;
            score: number;
          };
        };
      };
    };
  };
  updateQuestionProgress?: (strand: number, blockId: string, score: number) => void;
}

// ✅ Import your existing data (keeping your current system)
import questionData from '../data/questionData.json';
import strandTips from '../data/strandTips.json';
import suggestions from '../data/suggestions.json';

interface YourResponseSectionProps {
  currentStrand: number;
  experimentChoice: 'critical-angle' | 'fiber-optics';
  currentStudentId: string;
  sessionCode: string;
  onProgressUpdate: (strand: number, level: number, score: number) => void;
  
  // ✅ NEW: Enhanced integration options
  useUniversalRenderer?: boolean; // Toggle enhanced rendering
  enableEnhancedValidation?: boolean; // Enhanced question validation
  showPerformanceAnalytics?: boolean; // Performance insights
  autoSyncEnabled?: boolean; // Automatic syncing
  debugMode?: boolean; // Development debugging
}

const YourResponseSection: React.FC<YourResponseSectionProps> = ({
  currentStrand,
  experimentChoice,
  currentStudentId,
  sessionCode,
  onProgressUpdate,
  useUniversalRenderer = false, // Default to your existing system
  enableEnhancedValidation = true,
  showPerformanceAnalytics = true,
  autoSyncEnabled = true,
  debugMode = process.env.NODE_ENV === 'development'
}) => {
  // ✅ Use your existing contexts (keeping all functionality)
  const { strandProgress, setStrandProgress } = useStrandContext();
  const questionSystemContext = useQuestionSystem() as QuestionSystemContextType;

  // ✅ Enhanced state management (adding to your existing system)
  const [activeQuestionBlock, setActiveQuestionBlock] = useState<QuestionBlockType | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [strandQuestionData, setStrandQuestionData] = useState<any>(null);
  const [renderingMode, setRenderingMode] = useState<'standard' | 'universal' | 'hybrid'>('standard');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});

  // ✅ Use your existing sync hook (keeping all your sync functionality)
  const { syncStatus, saveResponse, loadResponses } = useQuestionStrandSync({
    studentId: currentStudentId,
    experiment: experimentChoice,
    sessionCode,
    strandhoot: 'criteria-a-tir',
    currentStrand,
  });

  // ✅ Enhanced data loading (using your existing system + validation)
  useEffect(() => {
    const loadStrandData = async () => {
      try {
        // ✅ Use your existing generateStrandData utility
        const data = generateStrandData(
          currentStrand, 
          experimentChoice, 
          questionData[experimentChoice] || {}
        );
        
        // ✅ Enhanced validation if enabled
        if (enableEnhancedValidation && useUniversalRenderer) {
          const validationResults: Record<string, boolean> = {};
          
          // Validate all questions in all blocks
          data.blocks?.forEach((block: any) => {
            block.questions?.forEach((question: any) => {
              const isValid = UniversalQuestionUtils.validateQuestion(question);
              validationResults[question.id] = isValid;
              
              if (!isValid && debugMode) {
                console.warn(`⚠️ Question validation failed:`, question.id, question);
              }
            });
          });
          
          setValidationResults(validationResults);
          console.log(`✅ Validated ${Object.keys(validationResults).length} questions`);
        }
        
        setStrandQuestionData(data);
        console.log('✅ Loaded strand data using existing system:', data);
        
        // ✅ Determine optimal rendering mode
        if (useUniversalRenderer) {
          const hasValidQuestions = data.blocks?.some((block: any) => 
            block.questions?.some((q: any) => 
              enableEnhancedValidation ? validationResults[q.id] !== false : true
            )
          );
          setRenderingMode(hasValidQuestions ? 'universal' : 'standard');
        } else {
          setRenderingMode('standard');
        }
        
      } catch (error) {
        console.error('❌ Failed to load strand data:', error);
        // ✅ Fallback to your existing questionData.json
        const fallbackData = questionData[experimentChoice]?.[`strand${currentStrand}`];
        setStrandQuestionData(fallbackData);
        setRenderingMode('standard'); // Use standard mode for fallback
      }
    };

    loadStrandData();
  }, [currentStrand, experimentChoice, useUniversalRenderer, enableEnhancedValidation]);

  // ✅ Enhanced completion handler (keeping your existing logic + performance tracking)
  const handleBlockCompletion = async (blockId: string, responses: any[]) => {
    try {
      // ✅ Your existing evaluation logic
      const totalScore = responses.reduce((sum, response) => sum + (response.score || 0), 0);
      const averageScore = responses.length > 0 ? totalScore / responses.length : 0;
      const level = parseInt(blockId.split('level')[1]) || 2;
      
      // ✅ Enhanced performance tracking
      if (showPerformanceAnalytics) {
        const performanceEntry = {
          blockId,
          level,
          score: averageScore,
          responses: responses.length,
          timestamp: new Date(),
          renderingMode
        };
        setPerformanceData(prev => [...prev, performanceEntry]);
        
        // ✅ Track with UniversalQuestionUtils if available
        if (useUniversalRenderer) {
          responses.forEach(response => {
            if (response.timeSpent) {
              UniversalQuestionUtils.trackQuestionPerformance(
                response.questionId,
                Date.now() - response.timeSpent,
                Date.now(),
                response.isCorrect
              );
            }
          });
        }
      }
      
      // ✅ Update progress using your existing context
      if (questionSystemContext?.updateQuestionProgress) {
        questionSystemContext.updateQuestionProgress(currentStrand, blockId, averageScore);
      }
      
      // ✅ Sync to parent component (your existing system)
      onProgressUpdate(currentStrand, level, averageScore);
      
      // ✅ Enhanced celebration system
      if (averageScore >= 7) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      } else if (averageScore >= 5) {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa']
        });
      }

      console.log('✅ Block completion handled:', { 
        blockId, 
        score: averageScore, 
        renderingMode,
        performanceTracked: showPerformanceAnalytics 
      });
      
      // ✅ Auto-sync if enabled
      if (autoSyncEnabled) {
        await saveResponse(blockId, { responses, score: averageScore });
      }
      
    } catch (error) {
      console.error('❌ Block completion error:', error);
    }
  };

  // ✅ Enhanced question block starter (with rendering mode selection)
  const startQuestionBlock = (level: number) => {
    if (!strandQuestionData) return;
    
    const blockData = strandQuestionData.blocks?.find((block: any) => block.level === level);
    if (!blockData) {
      console.warn('⚠️ No question block found for level:', level);
      return;
    }

    // ✅ Validate questions if enhanced mode is enabled
    let validQuestions = blockData.questions || [];
    if (enableEnhancedValidation && useUniversalRenderer) {
      validQuestions = validQuestions.filter((q: any) => validationResults[q.id] !== false);
      
      if (validQuestions.length < (blockData.questions?.length || 0)) {
        console.warn(`⚠️ ${(blockData.questions?.length || 0) - validQuestions.length} questions filtered out due to validation`);
      }
    }

    // ✅ Create complete QuestionBlock object (your existing structure)
    const completeBlockData: QuestionBlockType = {
      id: blockData.id || `strand${currentStrand}_level${level}`,
      level: level as 2 | 4 | 6 | 8,
      questions: validQuestions,
      completed: blockData.completed || false,
      score: blockData.score || 0,
      unlocked: true,
      attempts: blockData.attempts || 0,
      maxAttempts: blockData.maxAttempts || 3,
      completedQuestions: blockData.completedQuestions || 0,
      totalQuestions: validQuestions.length
    };

    setActiveQuestionBlock(completeBlockData);
    setShowResults(false);
    console.log('🚀 Started question block:', { 
      level, 
      questions: completeBlockData.questions.length,
      renderingMode,
      validated: enableEnhancedValidation 
    });
  };

  // ✅ Your existing helper functions (keeping all functionality)
  const getCurrentTips = () => {
    return strandTips[experimentChoice]?.[`strand${currentStrand}`] || {};
  };

  const getCurrentSuggestions = () => {
    return suggestions[experimentChoice]?.[`strand${currentStrand}`] || [];
  };

  const calculateOverallProgress = (): number => {
    const strandData = questionSystemContext?.questionSystem?.strands?.[currentStrand];
    if (!strandData) return 0;
    
    const completedBlocks = Object.values(strandData.questionBlocks || {})
      .filter((block: any) => block.completed);
    
    if (completedBlocks.length === 0) return 0;
    
    const maxScore = Math.max(...completedBlocks.map((block: any) => block.score || 0));
    return Math.min(8, maxScore);
  };

  const getBlockStatus = (level: number) => {
    const blockId = `strand${currentStrand}_level${level}`;
    const strandData = questionSystemContext?.questionSystem?.strands?.[currentStrand];
    const blockData = strandData?.questionBlocks?.[blockId];
    return blockData?.completed ? 'completed' : 'available';
  };

  // ✅ Enhanced performance insights
  const getPerformanceInsights = () => {
    if (performanceData.length === 0) return null;
    
    const avgScore = performanceData.reduce((sum, p) => sum + p.score, 0) / performanceData.length;
    const completedLevels = performanceData.length;
    const universalUsage = performanceData.filter(p => p.renderingMode === 'universal').length;
    
    return {
      averageScore: Math.round(avgScore * 10) / 10,
      completedLevels,
      universalUsage,
      trend: avgScore > 6 ? 'excellent' : avgScore > 4 ? 'good' : 'needs-improvement'
    };
  };

  // ✅ Loading state (keeping your existing design)
  if (!strandQuestionData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-purple-600 font-medium">
          Loading interactive questions...
          {useUniversalRenderer && <span className="text-xs block text-purple-500">✨ Enhanced mode</span>}
        </span>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const tips = getCurrentTips();
  const currentSuggestions = getCurrentSuggestions();
  const insights = getPerformanceInsights();

  return (
    <div className="space-y-6">
      {/* ✅ Enhanced debug info (keeping your existing + new features) */}
      {debugMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-bold text-blue-800 mb-1">🔧 ENHANCED QUESTION SYSTEM DEBUG:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Current Strand: {currentStrand}</div>
            <div>Overall Progress: {overallProgress}/8</div>
            <div>Sync Status: {syncStatus}</div>
            <div>Rendering Mode: {renderingMode}</div>
            <div>Universal Renderer: {useUniversalRenderer ? 'Enabled' : 'Disabled'}</div>
            <div>Enhanced Validation: {enableEnhancedValidation ? 'On' : 'Off'}</div>
            <div>Performance Tracking: {showPerformanceAnalytics ? 'On' : 'Off'}</div>
            <div>Validated Questions: {Object.keys(validationResults).length}</div>
          </div>
          {insights && (
            <div className="mt-2 pt-2 border-t border-blue-300">
              <strong>Performance:</strong> Avg Score: {insights.averageScore}, 
              Levels: {insights.completedLevels}, 
              Universal Usage: {insights.universalUsage}/{insights.completedLevels}
            </div>
          )}
        </div>
      )}

      {/* ✅ Enhanced header (keeping your design + new features) */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm border-2 border-purple-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-purple-800">
              Strand {currentStrand} Interactive Questions
              {useUniversalRenderer && (
                <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ✨ Enhanced
                </span>
              )}
            </h3>
            <p className="text-purple-600 mt-2 text-lg">
              {experimentChoice === 'critical-angle' 
                ? 'Master critical angle principles and total internal reflection'
                : 'Explore fiber optics and light transmission technology'
              }
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm flex-wrap">
              <span className="text-purple-700">
                Learning Path: <strong>{experimentChoice === 'critical-angle' ? 'Critical Angles' : 'Fiber Optics'}</strong>
              </span>
              <span className={`px-2 py-1 rounded ${
                syncStatus === 'saving' ? 'bg-yellow-100 text-yellow-800' :
                syncStatus === 'success' ? 'bg-green-100 text-green-800' :
                syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {syncStatus === 'saving' ? '💾 Saving...' :
                 syncStatus === 'success' ? '✅ Synced' :
                 syncStatus === 'error' ? '❌ Error' :
                 '💤 Ready'}
              </span>
              {renderingMode === 'universal' && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                  🚀 Universal Renderer
                </span>
              )}
              {enableEnhancedValidation && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  ✓ Validated
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600">{overallProgress}/8</div>
            <div className="text-sm text-purple-500 font-medium">Overall Score</div>
            {insights && (
              <div className="text-xs text-purple-400 mt-1">
                Trend: {insights.trend}
              </div>
            )}
          </div>
        </div>

        {/* ✅ Performance insights panel (new feature) */}
        {showPerformanceAnalytics && insights && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center">
              📊 Performance Insights
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded text-center">
                <div className="text-lg font-bold text-blue-600">{insights.averageScore}</div>
                <div className="text-blue-700">Avg Score</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="text-lg font-bold text-green-600">{insights.completedLevels}</div>
                <div className="text-green-700">Completed</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="text-lg font-bold text-purple-600">{insights.universalUsage}</div>
                <div className="text-purple-700">Enhanced</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className={`text-lg font-bold ${
                  insights.trend === 'excellent' ? 'text-green-600' :
                  insights.trend === 'good' ? 'text-blue-600' : 'text-yellow-600'
                }`}>
                  {insights.trend === 'excellent' ? '🌟' :
                   insights.trend === 'good' ? '👍' : '📚'}
                </div>
                <div className="text-gray-700 capitalize">{insights.trend}</div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Tips section (keeping your existing system) */}
        {Object.keys(tips).length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
            <h4 className="font-bold text-yellow-800 mb-2 flex items-center">
              💡 Tips for Success
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-700">
              {Object.entries(tips).map(([level, tip]) => (
                <div key={level}>
                  <strong>{level.replace('-', '-')}:</strong> {String(tip)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Enhanced level selection (keeping your design + validation info) */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h4 className="font-bold text-purple-700 mb-3 flex items-center">
            🎯 Select Question Level 
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Progressive Unlocking
            </span>
            {enableEnhancedValidation && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Quality Assured
              </span>
            )}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {([2, 4, 6, 8] as const).map(level => {
              const status = getBlockStatus(level);
              const block = strandQuestionData.blocks?.find((b: any) => b.level === level);
              const isLocked = level > 2 && getBlockStatus((level - 2) as 2 | 4 | 6 | 8) !== 'completed';
              
              // ✅ Enhanced validation info
              const totalQuestions = block?.questions?.length || 0;
              const validQuestions = enableEnhancedValidation ? 
                block?.questions?.filter((q: any) => validationResults[q.id] !== false)?.length || 0 :
                totalQuestions;
              
              return (
                <motion.button
                  key={level}
                  onClick={() => !isLocked && startQuestionBlock(level)}
                  whileHover={!isLocked ? { scale: 1.05 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  className={`p-4 rounded-lg border-2 font-bold transition-all duration-300 relative ${
                    isLocked 
                      ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                      : status === 'completed' 
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600'
                  }`}
                  disabled={isLocked}
                >
                  <div className="text-2xl font-bold">Level {level}</div>
                  <div className="text-sm mt-1">
                    {isLocked ? (
                      <div className="text-xs opacity-80">🔒 Complete Level {level - 2} first</div>
                    ) : status === 'completed' ? (
                      <div>✅ Completed</div>
                    ) : validQuestions > 0 ? (
                      <div>
                        {validQuestions} questions
                        {enableEnhancedValidation && validQuestions !== totalQuestions && (
                          <div className="text-xs opacity-80">({totalQuestions} total)</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs opacity-80">No questions available</div>
                    )}
                  </div>
                  <div className="text-3xl mt-2">
                    {isLocked ? '🔒' : status === 'completed' ? '🏆' : '🎯'}
                  </div>
                  
                  {/* ✅ Validation indicator */}
                  {enableEnhancedValidation && validQuestions !== totalQuestions && !isLocked && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full" 
                         title={`${totalQuestions - validQuestions} questions filtered`}>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
          
          {/* ✅ Enhanced level descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-600">
            <div><strong>Level 2:</strong> Basic recall and simple understanding</div>
            <div><strong>Level 4:</strong> Application in familiar contexts</div>
            <div><strong>Level 6:</strong> Analysis and evaluation in new contexts</div>
            <div><strong>Level 8:</strong> Synthesis and creation of understanding</div>
          </div>
          
          {/* ✅ Rendering mode toggle (development feature) */}
          {debugMode && useUniversalRenderer && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-purple-700 font-medium">Rendering Mode:</span>
                <button
                  onClick={() => setRenderingMode(prev => 
                    prev === 'universal' ? 'standard' : 'universal'
                  )}
                  className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition"
                >
                  {renderingMode === 'universal' ? '✨ Universal' : '⚡ Standard'} (Click to toggle)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Enhanced Active Question Block (supporting both rendering modes) */}
      <AnimatePresence mode="wait">
        {activeQuestionBlock && (
          <motion.div
            key={`block-${activeQuestionBlock.id}-${renderingMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="relative">
              {/* ✅ Enhanced close button with mode indicator */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {renderingMode === 'universal' && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                    ✨ Enhanced
                  </span>
                )}
                <button
                  onClick={() => setActiveQuestionBlock(null)}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* ✅ Render with your existing QuestionBlock component + enhanced options */}
              <QuestionBlockComponent
                block={activeQuestionBlock}
                onComplete={handleBlockCompletion}
                currentStudentId={currentStudentId}
                sessionCode={sessionCode}
                experimentChoice={experimentChoice}
                syncStatus={syncStatus}
                // ✅ NEW: Enhanced options
                useUniversalRenderer={renderingMode === 'universal'}
                fallbackToIndividual={true}
                enableEnhancedValidation={enableEnhancedValidation}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Results section (keeping your existing design) */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200"
        >
          <h4 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            🎉 Level Completed! <span className="ml-3 text-lg">🌟</span>
          </h4>
          <p className="text-green-700 mb-4 text-lg">
            Excellent work! You can try the next level or retry this one for an even better score.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResults(false)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Continue Learning
            </button>
          </div>
        </motion.div>
      )}

      {/* ✅ Suggestions section (keeping your existing system) */}
      {currentSuggestions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h4 className="text-lg font-bold text-blue-800 mb-3">💬 Helpful Suggestions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentSuggestions.map((suggestion: string, index: number) => (
              <div key={index} className="p-3 bg-white rounded border border-blue-200">
                <p className="text-sm text-blue-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Enhanced progress summary (keeping your design + new insights) */}
      {questionSystemContext?.questionSystem?.strands?.[currentStrand] && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Your Progress Summary
            {showPerformanceAnalytics && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Enhanced Analytics
              </span>
            )}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(questionSystemContext.questionSystem.strands[currentStrand].questionBlocks || {}).map(([blockId, blockData]: [string, any]) => {
              const level = parseInt(blockId.split('level')[1]);
              const performanceEntry = performanceData.find(p => p.blockId === blockId);
              
              return (
                <div key={blockId} className="p-4 bg-gray-50 rounded-lg relative">
                  <div className="text-lg font-bold text-purple-600">Level {level}</div>
                  <div className="text-2xl font-bold text-gray-800">{blockData.score || 0}/8</div>
                  <div className="text-sm text-gray-600">
                    {blockData.completed ? 'Completed' : 'In Progress'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((blockData.score || 0) / 8) * 100}%` }}
                    />
                  </div>
                  
                  {/* ✅ Enhanced performance indicators */}
                  {performanceEntry && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      {performanceEntry.renderingMode === 'universal' && (
                        <span className="bg-green-100 text-green-700 px-1 py-0.5 rounded">✨</span>
                      )}
                      <span className="text-gray-500">
                        {performanceEntry.responses} responses
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* ✅ Performance trends */}
          {performanceData.length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-semibold text-gray-700 mb-2">Performance Trend</h5>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Standard Renderer: {performanceData.filter(p => p.renderingMode === 'standard').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Universal Renderer: {performanceData.filter(p => p.renderingMode === 'universal').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Latest Score: {performanceData[performanceData.length - 1]?.score.toFixed(1) || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Enhanced help section (keeping your design + new features) */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="text-lg font-bold text-blue-800 mb-3">📚 How This Enhanced System Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h5 className="font-semibold mb-2">🎯 Progressive Learning</h5>
            <ul className="space-y-1">
              <li>• Start with Level 2 foundations</li>
              <li>• Unlock higher levels by completing previous ones</li>
              <li>• Each level builds on the previous</li>
              <li>• Retake levels to improve your score</li>
              {useUniversalRenderer && (
                <li>• ✨ Enhanced question validation and feedback</li>
              )}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">🏆 Scoring & Feedback</h5>
            <ul className="space-y-1">
              <li>• Real-time evaluation and feedback</li>
              <li>• Hints available to guide your learning</li>
              <li>• Progress automatically synced</li>
              <li>• Suggestions based on your performance</li>
              {showPerformanceAnalytics && (
                <li>• 📊 Advanced performance analytics</li>
              )}
            </ul>
          </div>
          {useUniversalRenderer && (
            <div className="md:col-span-2">
              <h5 className="font-semibold mb-2">✨ Enhanced Features</h5>
              <ul className="space-y-1">
                <li>• Universal question renderer with improved error handling</li>
                <li>• Enhanced question validation and quality assurance</li>
                <li>• Advanced performance tracking and insights</li>
                <li>• Automatic fallback to ensure questions always work</li>
                <li>• Future-proof architecture for new question types</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* ✅ Feature toggles (development mode) */}
        {debugMode && (
          <div className="mt-4 pt-4 border-t border-blue-300">
            <h5 className="font-semibold text-blue-800 mb-2">🔧 Developer Controls</h5>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setRenderingMode(prev => 
                  prev === 'universal' ? 'standard' : 'universal'
                )}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded transition"
              >
                Toggle Renderer: {renderingMode}
              </button>
              <div className="text-xs text-blue-600">
                Current: {renderingMode === 'universal' ? '✨ Universal' : '⚡ Standard'} | 
                Validated: {Object.values(validationResults).filter(Boolean).length}/{Object.keys(validationResults).length} | 
                Performance Entries: {performanceData.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Integration status panel (development mode) */}
      {debugMode && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-bold text-gray-800 mb-3">🔗 Integration Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="font-semibold text-gray-700">System Status</div>
              <div className="text-green-600">✅ Fully Integrated</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Question Validation</div>
              <div className={enableEnhancedValidation ? 'text-green-600' : 'text-gray-500'}>
                {enableEnhancedValidation ? '✅ Enhanced' : '⚡ Standard'}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Sync System</div>
              <div className="text-green-600">✅ {syncStatus}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Performance Analytics</div>
              <div className={showPerformanceAnalytics ? 'text-green-600' : 'text-gray-500'}>
                {showPerformanceAnalytics ? '✅ Active' : '⚡ Basic'}
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="text-xs text-gray-600">
              <strong>Integration Benefits:</strong> Enhanced error handling, better validation, 
              improved performance tracking, universal question support, automatic fallbacks, 
              future-proof architecture.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourResponseSection;