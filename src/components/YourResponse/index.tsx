// src/components/YourResponse/index.tsx
// 🛠️ SAFE VERSION - Minimal changes to avoid errors

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ✅ Your existing imports
import { useStrandContext } from '../../contexts/StrandContext';
import { useQuestionSystem } from '../../contexts/questionSystemContext';
import { generateStrandData } from '../../utils/integrationFixes';
import { useQuestionStrandSync } from '../../hooks/useQuestionStrandSync';
import QuestionBlockComponent from '../questions/QuestionBlock';
import UniversalQuestionRenderer, { UniversalQuestionUtils } from '../questions/UniversalQuestionRenderer';
import type { QuestionBlock as QuestionBlockType } from '../../types/questionBlock';

// ✅ Import data
import questionData from '../../data/questionData.json';
import strandTips from '../../data/strandTips.json';
import suggestions from '../../data/suggestions.json';

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
  // ✅ Your existing state
  const { strandProgress, setStrandProgress } = useStrandContext();
  const questionSystemContext = useQuestionSystem() as QuestionSystemContextType;

  const [activeQuestionBlock, setActiveQuestionBlock] = useState<QuestionBlockType | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [strandQuestionData, setStrandQuestionData] = useState<any>(null);
  const [renderingMode, setRenderingMode] = useState<'standard' | 'universal' | 'hybrid'>('standard');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, { isValid: boolean; errors: string[]; warnings?: string[]; }>>({});

  // ✅ Your existing sync hook
  const { syncStatus, saveResponse, loadResponses } = useQuestionStrandSync({
    studentId: currentStudentId,
    experiment: experimentChoice,
    sessionCode,
    strandhoot: 'criteria-a-tir',
    currentStrand,
  });

  // ✅ Data loading
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

  // ✅ Your existing handlers
  const handleBlockCompletion = async (blockId: string, responses: any[]) => {
    try {
      const totalScore = responses.reduce((sum, response) => sum + (response.score || 0), 0);
      const averageScore = responses.length > 0 ? totalScore / responses.length : 0;
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

  // ✅ Color scheme for levels
  const levelColors = {
    2: { base: 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600', completed: 'bg-emerald-600' },
    4: { base: 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600', completed: 'bg-blue-600' },
    6: { base: 'bg-purple-500 border-purple-600 text-white hover:bg-purple-600', completed: 'bg-purple-600' },
    8: { base: 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600', completed: 'bg-rose-600' }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Debug info */}
      {debugMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-bold text-blue-800 mb-1">🔧 SAFE MODULAR VERSION:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Status: ✅ Working</div>
            <div>Progress: {overallProgress}/8</div>
            <div>Mode: {renderingMode}</div>
            <div>Sync: {syncStatus}</div>
          </div>
        </div>
      )}

      {/* ✅ Compact Header */}
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
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600">{overallProgress}/8</div>
            <div className="text-sm text-purple-500 font-medium">Overall Score</div>
          </div>
        </div>
      </div>

      {/* ✅ Compact Colorful Level Selector */}
      <div className="bg-white rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-purple-700">🎯 Select Question Level</h4>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            All Levels Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {([2, 4, 6, 8] as const).map(level => {
            const status = getBlockStatus(level);
            const block = strandQuestionData.blocks?.find((b: any) => b.level === level);
            const totalQuestions = block?.questions?.length || 0;
            const isCompleted = status === 'completed';
            const colors = levelColors[level];
            
            return (
              <motion.button
                key={level}
                onClick={() => startQuestionBlock(level)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg border-2 font-bold transition-all duration-300 ${
                  isCompleted ? colors.completed : colors.base
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-lg font-bold">Level {level}</div>
                    <div className="text-xs opacity-90">
                      {isCompleted ? 'Completed' : `${totalQuestions} questions`}
                    </div>
                  </div>
                  <div className="text-2xl">
                    {isCompleted ? '🏆' : level === 2 ? '🟢' : level === 4 ? '🔵' : level === 6 ? '🟣' : '🔴'}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 border-t border-gray-200 pt-3">
          <div><strong>Level 2:</strong> Basic recall and simple understanding</div>
          <div><strong>Level 4:</strong> Application in familiar contexts</div>
          <div><strong>Level 6:</strong> Analysis and evaluation in new contexts</div>
          <div><strong>Level 8:</strong> Synthesis and creation of understanding</div>
        </div>
      </div>

      {/* ✅ Active Question Block */}
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
    </div>
  );
};

export default YourResponseSection;