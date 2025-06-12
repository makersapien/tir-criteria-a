// ===== FULLY PATCHED: YourResponseSection - All Type Issues Resolved =====
// src/components/YourResponse/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ✅ Import contexts and hooks (existing)
import { useStrandContext } from '../../contexts/StrandContext';
import { useQuestionSystem } from '../../contexts/questionSystemContext';
import { generateStrandData } from '../../utils/integrationFixes';
import { useQuestionStrandSync } from '../../hooks/useQuestionStrandSync';

// ✅ FIXED: Import the modular QuestionBlock (not QuestionBlockComponent)
import QuestionBlock from '../questions/QuestionBlock';
import type { QuestionBlock as QuestionBlockType } from '../questions/QuestionBlockModule/types';

// ✅ Import data (existing)
import questionData from '../../data/questionData.json';
import strandTips from '../../data/strandTips.json';
import suggestions from '../../data/suggestions.json';

// ✅ Import modular components (existing)
import YourResponseHeader from './Header/YourResponseHeader';
import LevelSelector from './LevelSelection/LevelSelector';
import { StrandTips, Suggestions } from './Tips';

// ✅ FIXED: Correct rendering mode type aligned with YourResponseHeader
type RenderingMode = 'standard' | 'universal' | 'hybrid';

// ✅ Enhanced performance insights type (matching YourResponseHeader)
interface PerformanceInsights {
  averageScore: number;
  completedLevels: number;
  universalUsage: number;
  trend: 'excellent' | 'good' | 'needs-improvement';
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  learningVelocity: 'fast' | 'steady' | 'methodical';
}

// ✅ Enhanced validation result type (matching LevelSelector)
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  score?: number;
}

// ✅ Enhanced props interface
interface YourResponseSectionProps {
  currentStrand: number;
  experimentChoice: 'critical-angle' | 'fiber-optics';
  currentStudentId: string;
  sessionCode: string;
  onProgressUpdate: (strand: number, level: number, score: number) => void;
  useUniversalRenderer?: boolean;
  enableEnhancedValidation?: boolean;
  showPerformanceAnalytics?: boolean;
  autoSyncEnabled?: boolean;
  debugMode?: boolean;
}

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

const YourResponseSection: React.FC<YourResponseSectionProps> = ({
  currentStrand,
  experimentChoice,
  currentStudentId,
  sessionCode,
  onProgressUpdate,
  useUniversalRenderer = false,
  enableEnhancedValidation = true,
  showPerformanceAnalytics = false,
  autoSyncEnabled = true,
  debugMode = process.env.NODE_ENV === 'development'
}) => {
  // ✅ FIXED: State with corrected rendering mode type
  const { setStrandProgress } = useStrandContext();
  const questionSystemContext = useQuestionSystem() as QuestionSystemContextType;

  const [activeQuestionBlock, setActiveQuestionBlock] = useState<QuestionBlockType | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [strandQuestionData, setStrandQuestionData] = useState<any>(null);
  const [renderingMode, setRenderingMode] = useState<RenderingMode>('standard'); // ✅ FIXED: Use 'standard' instead of 'individual'
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // ✅ UI state for collapsible sections
  const [tipsCollapsed, setTipsCollapsed] = useState(false);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(true);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);

  // ✅ Enhanced sync hook with error handling
  const { syncStatus, saveResponse, loadResponses } = useQuestionStrandSync({
    studentId: currentStudentId,
    experiment: experimentChoice,
    sessionCode,
    strandhoot: 'criteria-a-tir',
    currentStrand,
  });

  // ✅ ENHANCED: Simple but effective question validation
  const validateQuestion = useCallback((question: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!question.id) errors.push('Missing question ID');
    if (!question.type) errors.push('Missing question type');
    if (!question.question) errors.push('Missing question text');
    if (!question.level && !question.points) warnings.push('No scoring level specified');
    
    // Type-specific validation
    if (question.type === 'mcq' && (!question.options || question.options.length < 2)) {
      errors.push('MCQ must have at least 2 options');
    }
    
    if (question.type === 'fill-blank' && !question.blanks) {
      errors.push('Fill-blank question missing blanks array');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? (warnings.length === 0 ? 10 : 8) : 0
    };
  }, []);

  // ✅ ENHANCED: Data loading with better error handling and validation
  useEffect(() => {
    const loadStrandData = async () => {
      try {
        setLoadingError(null);
        
        const data = generateStrandData(
          currentStrand, 
          experimentChoice, 
          questionData[experimentChoice] || {}
        );
        
        // ✅ FIXED: Use our simple validation instead of missing UniversalQuestionUtils
        if (enableEnhancedValidation) {
          const validationResults: Record<string, ValidationResult> = {};
          
          data.blocks?.forEach((block: any) => {
            block.questions?.forEach((question: any) => {
              const validationResult = validateQuestion(question);
              validationResults[question.id] = validationResult;
              
              // Log validation issues in development
              if (debugMode && (!validationResult.isValid || validationResult.warnings?.length > 0)) {
                console.warn(`Question ${question.id} validation:`, validationResult);
              }
            });
          });
          
          setValidationResults(validationResults);
        }
        
        setStrandQuestionData(data);
        // ✅ FIXED: Use 'standard' instead of 'individual'
        setRenderingMode(useUniversalRenderer ? 'universal' : 'standard');
        
      } catch (error) {
        console.error('❌ Failed to load strand data:', error);
        setLoadingError(`Failed to load questions: ${error.message}`);
        
        // Fallback to basic data
        const fallbackData = questionData[experimentChoice]?.[`strand${currentStrand}`];
        if (fallbackData) {
          setStrandQuestionData(fallbackData);
          setRenderingMode('standard'); // ✅ FIXED: Use 'standard' instead of 'individual'
        }
      }
    };

    loadStrandData();
  }, [currentStrand, experimentChoice, useUniversalRenderer, enableEnhancedValidation, validateQuestion, debugMode]);

  // ✅ ENHANCED: Block completion handler with better performance tracking
  const handleBlockCompletion = useCallback(async (blockId: string, responses: any[], averageScore: number) => {
    try {
      const level = parseInt(blockId.split('level')[1]) || 2;
      
      // Update question system context
      if (questionSystemContext?.updateQuestionProgress) {
        questionSystemContext.updateQuestionProgress(currentStrand, blockId, averageScore);
      }
      
      // Update parent component
      onProgressUpdate(currentStrand, level, averageScore);
      
      // ✅ ENHANCED: Performance tracking with detailed metrics
      const completionData = {
        blockId,
        level,
        strand: currentStrand,
        averageScore,
        totalQuestions: responses.length,
        correctAnswers: responses.filter(r => r.isCorrect).length,
        totalTime: responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0),
        renderingMode,
        timestamp: new Date().toISOString()
      };
      
      setPerformanceData(prev => [...prev, completionData]);
      
      // ✅ ENHANCED: Celebration system based on performance
      if (averageScore >= 7) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b']
        });
      } else if (averageScore >= 5) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa', '#93c5fd']
        });
      }
  
      // ✅ ENHANCED: Individual response saving with better error handling
      if (autoSyncEnabled) {
        for (const response of responses) {
          try {
            const questionResponse = {
              questionId: response.questionId || `${blockId}_${response.id || 'question'}`,
              type: response.type || 'unknown',
              answer: response.answer,
              isCorrect: response.isCorrect || false,
              score: response.score || 0,
              feedback: response.feedback || '',
              timestamp: response.timestamp || new Date(),
              timeSpent: response.timeSpent || 0
            };
            
            await saveResponse(questionResponse);
          } catch (responseError) {
            console.error(`❌ Failed to save response ${response.questionId}:`, responseError);
            // Continue with other responses even if one fails
          }
        }
      }
      
      // Auto-unlock next level if performance is good
      if (averageScore >= 6) {
        setActiveLevel(level + 2 <= 8 ? level + 2 : null);
      }
      
      // Show results for a moment, then hide
      setShowResults(true);
      setTimeout(() => {
        setShowResults(false);
        setActiveQuestionBlock(null);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Block completion error:', error);
      // Still allow progression even if tracking fails
      setActiveQuestionBlock(null);
    }
  }, [questionSystemContext, onProgressUpdate, currentStrand, renderingMode, autoSyncEnabled, saveResponse]);

  // ✅ ENHANCED: Level unlocking handler for the modular QuestionBlock
  const handleLevelUnlock = useCallback((nextLevel: number) => {
    if (nextLevel <= 8) {
      setActiveLevel(nextLevel);
      // Optional: Show a notification about unlocked level
      if (debugMode) {
        console.log(`🔓 Level ${nextLevel} unlocked!`);
      }
    }
  }, [debugMode]);

  // ✅ ENHANCED: Progress update handler for real-time feedback
  const handleProgressUpdate = useCallback((blockId: string, currentQuestion: number, totalQuestions: number, currentScore: number) => {
    // Update strand progress in real-time
    const progressPercentage = (currentQuestion / totalQuestions) * 100;
    
    if (debugMode) {
      console.log(`Progress: ${blockId} - ${currentQuestion}/${totalQuestions} (${Math.round(progressPercentage)}%) - Score: ${currentScore.toFixed(1)}`);
    }
    
    // You could update a progress bar or send analytics here
  }, [debugMode]);

  // ✅ ENHANCED: Start question block with validation filtering
  const startQuestionBlock = useCallback((level: number) => {
    if (!strandQuestionData) return;
    
    const blockData = strandQuestionData.blocks?.find((block: any) => block.level === level);
    if (!blockData) {
      console.error(`No block data found for level ${level}`);
      return;
    }

    let validQuestions = blockData.questions || [];
    
    // Filter out invalid questions if validation is enabled
    if (enableEnhancedValidation) {
      const originalCount = validQuestions.length;
      validQuestions = validQuestions.filter((q: any) => {
        const validation = validationResults[q.id];
        return !validation || validation.isValid;
      });
      
      if (debugMode && validQuestions.length !== originalCount) {
        console.warn(`Filtered ${originalCount - validQuestions.length} invalid questions from level ${level}`);
      }
    }

    if (validQuestions.length === 0) {
      console.error(`No valid questions available for level ${level}`);
      return;
    }

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
    setActiveLevel(level);
    setShowResults(false);
  }, [strandQuestionData, enableEnhancedValidation, validationResults, currentStrand, debugMode]);

  // ✅ Enhanced helper functions
  const getBlockStatus = useCallback((level: number) => {
    const blockId = `strand${currentStrand}_level${level}`;
    const strandData = questionSystemContext?.questionSystem?.strands?.[currentStrand];
    const blockData = strandData?.questionBlocks?.[blockId];
    return blockData?.completed ? 'completed' : 'available';
  }, [currentStrand, questionSystemContext]);

  const calculateOverallProgress = useCallback((): number => {
    const strandData = questionSystemContext?.questionSystem?.strands?.[currentStrand];
    if (!strandData) return 0;
    
    const completedBlocks = Object.values(strandData.questionBlocks || {})
      .filter((block: any) => block.completed);
    
    if (completedBlocks.length === 0) return 0;
    
    const maxScore = Math.max(...completedBlocks.map((block: any) => block.score || 0));
    return Math.min(8, maxScore);
  }, [currentStrand, questionSystemContext]);

  // ✅ Enhanced data getters
  const getCurrentTips = useCallback(() => {
    try {
      const strandKey = `strand${currentStrand}`;
      return strandTips[experimentChoice]?.[strandKey] || {};
    } catch (error) {
      console.error('❌ Error loading tips:', error);
      return {};
    }
  }, [currentStrand, experimentChoice]);

  const getCurrentSuggestions = useCallback(() => {
    try {
      return suggestions[experimentChoice]?.[`strand${currentStrand}`] || [];
    } catch (error) {
      console.error('❌ Error loading suggestions:', error);
      return [];
    }
  }, [currentStrand, experimentChoice]);

  // ✅ ENHANCED: Performance insights with detailed metrics
  const getPerformanceInsights = useCallback((): PerformanceInsights | null => {
    if (performanceData.length === 0) return null;
    
    const avgScore = performanceData.reduce((sum, p) => sum + p.averageScore, 0) / performanceData.length;
    const totalTime = performanceData.reduce((sum, p) => sum + p.totalTime, 0);
    const avgTimePerQuestion = totalTime / performanceData.reduce((sum, p) => sum + p.totalQuestions, 0);
    
    return {
      averageScore: Math.round(avgScore * 10) / 10,
      completedLevels: performanceData.length,
      universalUsage: performanceData.filter(p => p.renderingMode === 'universal').length,
      totalQuestions: performanceData.reduce((sum, p) => sum + p.totalQuestions, 0),
      correctAnswers: performanceData.reduce((sum, p) => sum + p.correctAnswers, 0),
      timeSpent: totalTime,
      trend: avgScore > 6 ? 'excellent' : avgScore > 4 ? 'good' : 'needs-improvement',
      learningVelocity: avgTimePerQuestion < 30000 ? 'fast' : avgTimePerQuestion < 60000 ? 'steady' : 'methodical'
    };
  }, [performanceData]);

  // ✅ Loading states
  if (loadingError) {
    return (
      <div className="flex justify-center items-center h-64 bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <div className="text-red-800 font-medium">{loadingError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
      {/* ✅ FIXED: Modular Header Component with correct props */}
      <YourResponseHeader
        currentStrand={currentStrand}
        experimentChoice={experimentChoice}
        overallProgress={overallProgress}
        useUniversalRenderer={useUniversalRenderer}
        renderingMode={renderingMode} // ✅ FIXED: Now using correct type 'standard' | 'universal' | 'hybrid'
        syncStatus={syncStatus}
        enableEnhancedValidation={enableEnhancedValidation}
        showPerformanceAnalytics={showPerformanceAnalytics}
        performanceInsights={insights}
        debugMode={debugMode}
      />

      {/* ✅ Modular Tips Component (using real data) */}
      {Object.keys(tips).length > 0 && (
        <StrandTips
          currentStrand={currentStrand}
          experimentChoice={experimentChoice}
          collapsed={tipsCollapsed}
          onToggleCollapsed={setTipsCollapsed}
        />
      )}

      {/* ✅ FIXED: Modular Level Selector Component with activeLevel */}
      <LevelSelector
        currentStrand={currentStrand}
        strandQuestionData={strandQuestionData}
        enableEnhancedValidation={enableEnhancedValidation}
        validationResults={validationResults}
        onStartQuestionBlock={startQuestionBlock}
        getBlockStatus={getBlockStatus}
        debugMode={debugMode}
        activeLevel={activeLevel} // ✅ FIXED: Now properly supported in LevelSelector
      />

      {/* ✅ Modular Suggestions Component (using real data) */}
      {currentSuggestions.length > 0 && (
        <Suggestions
          currentStrand={currentStrand}
          experimentChoice={experimentChoice}
          suggestions={currentSuggestions}
          collapsed={suggestionsCollapsed}
          onToggleCollapsed={setSuggestionsCollapsed}
        />
      )}

      {/* ✅ ENHANCED: Active Question Block using modular QuestionBlock */}
      <AnimatePresence mode="wait">
        {activeQuestionBlock && (
          <motion.div
            key={`block-${activeQuestionBlock.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            {/* Enhanced close button */}
            <button
              onClick={() => setActiveQuestionBlock(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 hover:text-red-800 transition-colors shadow-md"
              title="Close questions"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* ✅ ENHANCED: Student Focus Area with modular QuestionBlock */}
            <div className="bg-white rounded-xl border-4 border-purple-300 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  🎯 Level {activeQuestionBlock.level} Questions - Active Learning Zone
                  {renderingMode === 'universal' && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">✨ Enhanced</span>
                  )}
                </h3>
                <p className="text-purple-100 text-sm">
                  Complete the questions below to improve your understanding
                </p>
              </div>
              
              {/* ✅ FIXED: Using the modular QuestionBlock with proper props */}
              <QuestionBlock
                block={activeQuestionBlock}
                onComplete={handleBlockCompletion}
                onUnlock={handleLevelUnlock}
                onProgressUpdate={handleProgressUpdate}
                currentStudentId={currentStudentId}
                sessionCode={sessionCode}
                experimentChoice={experimentChoice}
                syncStatus={syncStatus}
                useUniversalRenderer={renderingMode === 'universal'}
                fallbackToIndividual={true}
                enableEnhancedValidation={enableEnhancedValidation}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ ENHANCED: Results Section with detailed insights */}
      {showResults && insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 rounded-lg p-6 border border-green-200"
        >
          <h4 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
            🌟 Excellent Progress!
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{insights.averageScore}</div>
              <div className="text-sm text-green-700">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{insights.correctAnswers}/{insights.totalQuestions}</div>
              <div className="text-sm text-green-700">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(insights.timeSpent / 1000)}s</div>
              <div className="text-sm text-green-700">Time Spent</div>
            </div>
          </div>
          <p className="text-green-700 mb-4">
            Great work! You can try the next level or retry this one for an even better score.
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

      {/* ✅ DEBUG INFO - Enhanced with modular system details */}
      {debugMode && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 p-2 bg-gray-50 rounded">
            🔧 Developer Debug Information
          </summary>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 font-mono mt-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>✅ Modular QuestionBlock: Active</div>
              <div>✅ Type Compatibility: Fixed</div>
              <div>✅ Enhanced Validation: {Object.keys(validationResults).length} questions checked</div>
              <div>✅ Performance Tracking: {performanceData.length} completed</div>
              <div>✅ Auto-save: {autoSyncEnabled ? 'Enabled' : 'Disabled'}</div>
              <div>Current Strand: {currentStrand}</div>
              <div>Active Level: {activeLevel || 'None'}</div>
              <div>Overall Progress: {overallProgress}/8</div>
              <div>Sync Status: {syncStatus}</div>
              <div>Rendering Mode: {renderingMode}</div>
              <div>Universal Renderer: {useUniversalRenderer ? 'Enabled' : 'Disabled'}</div>
              <div>Tips Available: {Object.keys(tips).length > 0 ? 'Yes' : 'No'}</div>
              <div>Suggestions: {currentSuggestions.length} items</div>
            </div>
            {insights && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <div className="font-semibold mb-1">Performance Insights:</div>
                <div>Trend: {insights.trend} | Velocity: {insights.learningVelocity}</div>
                <div>Universal Usage: {insights.universalUsage}/{insights.completedLevels} levels</div>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
};

export default YourResponseSection;