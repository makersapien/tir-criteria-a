// src/components/YourResponse/index.tsx
// 🎯 FIXED MODULAR VERSION - No TypeScript errors

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ✅ Import contexts and hooks (existing)
import { useStrandContext } from '../../contexts/StrandContext';
import { useQuestionSystem } from '../../contexts/questionSystemContext';
import { generateStrandData } from '../../utils/integrationFixes';
import { useQuestionStrandSync } from '../../hooks/useQuestionStrandSync';

// ✅ Import question components (existing)
import QuestionBlockComponent from '../questions/QuestionBlock';
import { UniversalQuestionUtils } from '../questions/UniversalQuestionRenderer';
import type { QuestionBlock as QuestionBlockType } from '../../types/questionBlock';

// ✅ Import data (existing)
import questionData from '../../data/questionData.json';
import strandTips from '../../data/strandTips.json';
import suggestions from '../../data/suggestions.json';

// ✅ Import modular components - FIXED
import YourResponseHeader from './Header/YourResponseHeader';
import LevelSelector from './LevelSelection/LevelSelector';
import { StrandTips, Suggestions } from './Tips';

// ✅ FIXED: Define performance insights type properly
interface PerformanceInsights {
  averageScore: number;
  completedLevels: number;
  universalUsage: number;
  trend: 'excellent' | 'good' | 'needs-improvement';
}

// ✅ Keep existing interface
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
  // ✅ Keep existing state
  const { setStrandProgress } = useStrandContext();
  const questionSystemContext = useQuestionSystem() as QuestionSystemContextType;

  const [activeQuestionBlock, setActiveQuestionBlock] = useState<QuestionBlockType | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [strandQuestionData, setStrandQuestionData] = useState<any>(null);
  const [renderingMode, setRenderingMode] = useState<'standard' | 'universal' | 'hybrid'>('standard');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, { isValid: boolean; errors: string[]; warnings?: string[]; }>>({});

  // ✅ UI state for collapsible sections
  const [tipsCollapsed, setTipsCollapsed] = useState(true);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(true);

  // ✅ Keep existing sync hook
  const { syncStatus, saveResponse, loadResponses } = useQuestionStrandSync({
    studentId: currentStudentId,
    experiment: experimentChoice,
    sessionCode,
    strandhoot: 'criteria-a-tir',
    currentStrand,
  });

  // ✅ Keep existing data loading logic
  useEffect(() => {
    const loadStrandData = async () => {
      try {
        const data = generateStrandData(
          currentStrand, 
          experimentChoice, 
          questionData[experimentChoice] || {}
        );
        
        if (enableEnhancedValidation && useUniversalRenderer) {
          const validationResults: Record<string, { isValid: boolean; errors: string[]; warnings?: string[]; }> = {};
          
          data.blocks?.forEach((block: any) => {
            block.questions?.forEach((question: any) => {
              const validationResult = UniversalQuestionUtils.validateQuestion(question);
              validationResults[question.id] = validationResult;
            });
          });
          
          setValidationResults(validationResults);
        }
        
        setStrandQuestionData(data);
        setRenderingMode(useUniversalRenderer ? 'universal' : 'standard');
        
      } catch (error) {
        console.error('❌ Failed to load strand data:', error);
        const fallbackData = questionData[experimentChoice]?.[`strand${currentStrand}`];
        setStrandQuestionData(fallbackData);
        setRenderingMode('standard');
      }
    };

    loadStrandData();
  }, [currentStrand, experimentChoice, useUniversalRenderer, enableEnhancedValidation]);

  // ✅ Keep existing handlers
  // ✅ FIXED: Correct handler signature for QuestionBlock.tsx component
  const handleBlockCompletion = async (blockId: string, responses: any[], averageScore: number) => {
    try {
      const level = parseInt(blockId.split('level')[1]) || 2;
      
      if (questionSystemContext?.updateQuestionProgress) {
        questionSystemContext.updateQuestionProgress(currentStrand, blockId, averageScore);
      }
      
      onProgressUpdate(currentStrand, level, averageScore);
      
      if (averageScore >= 7) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      }

      if (autoSyncEnabled) {
        await saveResponse(blockId, { responses, score: averageScore, level, timestamp: new Date() });
      }
      
    } catch (error) {
      console.error('❌ Block completion error:', error);
    }
  };

  const startQuestionBlock = (level: number) => {
    if (!strandQuestionData) return;
    
    const blockData = strandQuestionData.blocks?.find((block: any) => block.level === level);
    if (!blockData) return;

    let validQuestions = blockData.questions || [];
    if (enableEnhancedValidation && useUniversalRenderer) {
      validQuestions = validQuestions.filter((q: any) => validationResults[q.id]?.isValid !== false);
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
    setShowResults(false);
  };

  // ✅ Keep existing helper functions
  const getBlockStatus = (level: number) => {
    const blockId = `strand${currentStrand}_level${level}`;
    const strandData = questionSystemContext?.questionSystem?.strands?.[currentStrand];
    const blockData = strandData?.questionBlocks?.[blockId];
    return blockData?.completed ? 'completed' : 'available';
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

  // ✅ Get data for modular components (exactly like original)
  const getCurrentTips = () => {
    try {
      const strandKey = `strand${currentStrand}`;
      return strandTips[experimentChoice]?.[strandKey] || {};
    } catch (error) {
      console.error('❌ Error loading tips:', error);
      return {};
    }
  };

  const getCurrentSuggestions = () => {
    try {
      return suggestions[experimentChoice]?.[`strand${currentStrand}`] || [];
    } catch (error) {
      console.error('❌ Error loading suggestions:', error);
      return [];
    }
  };

  // ✅ FIXED: Properly typed performance insights function
  const getPerformanceInsights = (): PerformanceInsights | null => {
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

  // ✅ Loading state
  if (!strandQuestionData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-purple-600 font-medium">Loading questions...</span>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const tips = getCurrentTips();
  const currentSuggestions = getCurrentSuggestions();
  const insights = getPerformanceInsights();

  return (
    <div className="space-y-6">
      {/* ✅ Debug info (modular) */}
      {debugMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-bold text-blue-800 mb-1">🔧 MODULAR VERSION STATUS:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>✅ Header Module: Extracted</div>
            <div>✅ Level Selector: Extracted</div>
            <div>✅ Tips Module: Using real data</div>
            <div>✅ Suggestions: Using real data</div>
            <div>Progress: {overallProgress}/8</div>
            <div>Mode: {renderingMode}</div>
            <div>Sync: {syncStatus}</div>
            <div>Tips Available: {Object.keys(tips).length > 0 ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      {/* ✅ Modular Header Component */}
      <YourResponseHeader
        currentStrand={currentStrand}
        experimentChoice={experimentChoice}
        overallProgress={overallProgress}
        useUniversalRenderer={useUniversalRenderer}
        renderingMode={renderingMode}
        syncStatus={syncStatus}
        enableEnhancedValidation={enableEnhancedValidation}
        showPerformanceAnalytics={showPerformanceAnalytics}
        performanceInsights={insights}
        debugMode={debugMode}
      />

      {/* ✅ Modular Level Selector Component */}
      <LevelSelector
        currentStrand={currentStrand}
        strandQuestionData={strandQuestionData}
        enableEnhancedValidation={enableEnhancedValidation}
        validationResults={validationResults}
        onStartQuestionBlock={startQuestionBlock}
        getBlockStatus={getBlockStatus}
        debugMode={debugMode}
      />

      {/* ✅ Modular Tips Component (using real data) */}
      {Object.keys(tips).length > 0 && (
        <StrandTips
          currentStrand={currentStrand}
          experimentChoice={experimentChoice}
          collapsed={tipsCollapsed}
          onToggleCollapsed={(collapsed: boolean) => setTipsCollapsed(collapsed)}
        />
      )}

      {/* ✅ Modular Suggestions Component (using real data) */}
      {currentSuggestions.length > 0 && (
        <Suggestions
          currentStrand={currentStrand}
          experimentChoice={experimentChoice}
          suggestions={currentSuggestions}
          collapsed={suggestionsCollapsed}
          onToggleCollapsed={(collapsed: boolean) => setSuggestionsCollapsed(collapsed)}
        />
      )}

      {/* ✅ Active Question Block (keep existing logic) */}
      <AnimatePresence mode="wait">
        {activeQuestionBlock && (
          <motion.div
            key={`block-${activeQuestionBlock.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="relative">
              <button
                onClick={() => setActiveQuestionBlock(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>
              
              <QuestionBlockComponent
                block={activeQuestionBlock}
                onComplete={handleBlockCompletion}
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

      {/* ✅ Results Section (if needed) */}
      {showResults && insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 rounded-lg p-6 border border-green-200"
        >
          <h4 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
            🌟 Excellent Progress!
            <span className="ml-3 text-lg">🌟</span>
          </h4>
          <p className="text-green-700 mb-4 text-lg">
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
    </div>
  );
};

export default YourResponseSection;