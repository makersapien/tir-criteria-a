// src/components/YourResponseSection.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Leverage existing systems
import { useStrandContext } from '../contexts/StrandContext';
import { useQuestionSystem } from '../contexts/questionSystemContext';
import { generateStrandData } from '../utils/integrationFixes';
import { useQuestionStrandSync } from '../hooks/useQuestionStrandSync';
import QuestionBlockComponent from './questions/QuestionBlock';

// Import existing types - fix naming conflict
import type { QuestionBlock as QuestionBlockType } from '../types/questionBlock';
// Use a more generic context type or create a simple interface
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

// Import existing data
import questionData from '../data/questionData.json';
import strandTips from '../data/strandTips.json';
import suggestions from '../data/suggestions.json';

interface YourResponseSectionProps {
  currentStrand: number;
  experimentChoice: 'critical-angle' | 'fiber-optics';
  currentStudentId: string;
  sessionCode: string;
  onProgressUpdate: (strand: number, level: number, score: number) => void;
}

const YourResponseSection: React.FC<YourResponseSectionProps> = ({
  currentStrand,
  experimentChoice,
  currentStudentId,
  sessionCode,
  onProgressUpdate
}) => {
  // Use existing contexts
  const { strandProgress, setStrandProgress } = useStrandContext();
  const questionSystemContext = useQuestionSystem() as QuestionSystemContextType;

  // Local state - minimal
  const [activeQuestionBlock, setActiveQuestionBlock] = useState<QuestionBlockType | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [strandQuestionData, setStrandQuestionData] = useState<any>(null);

  // Use existing sync hook
  const { syncStatus, saveResponse, loadResponses } = useQuestionStrandSync({
    studentId: currentStudentId,
    experiment: experimentChoice,
    sessionCode,
    strandhoot: 'criteria-a-tir',
    currentStrand,
  });

  // Load strand data using existing utility
  useEffect(() => {
    const loadStrandData = async () => {
      try {
        // Use existing generateStrandData utility with all required arguments
        const data = generateStrandData(
          currentStrand, 
          experimentChoice, 
          questionData[experimentChoice] || {}
        );
        
        setStrandQuestionData(data);
        console.log('✅ Loaded strand data using existing system:', data);
      } catch (error) {
        console.error('❌ Failed to load strand data:', error);
        // Fallback to questionData.json
        const fallbackData = questionData[experimentChoice]?.[`strand${currentStrand}`];
        setStrandQuestionData(fallbackData);
      }
    };

    loadStrandData();
  }, [currentStrand, experimentChoice]);

  // Handle question block completion using existing evaluation
  const handleBlockCompletion = async (blockId: string, responses: any[]) => {
    try {
      // Simple evaluation logic for now - can be enhanced later
      const totalScore = responses.reduce((sum, response) => sum + (response.score || 0), 0);
      const averageScore = responses.length > 0 ? totalScore / responses.length : 0;
      const level = parseInt(blockId.split('level')[1]) || 2;
      
      // Update progress using existing context
      if (questionSystemContext?.updateQuestionProgress) {
        questionSystemContext.updateQuestionProgress(currentStrand, blockId, averageScore);
      }
      
      // Sync to parent component
      onProgressUpdate(currentStrand, level, averageScore);
      
      // Celebration based on score
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

      console.log('✅ Block completion handled:', { blockId, score: averageScore });
      
    } catch (error) {
      console.error('❌ Block completion error:', error);
    }
  };

  // Start a question block
  const startQuestionBlock = (level: number) => {
    if (!strandQuestionData) return;
    
    const blockData = strandQuestionData.blocks?.find((block: any) => block.level === level);
    if (!blockData) {
      console.warn('⚠️ No question block found for level:', level);
      return;
    }

    // Create a complete QuestionBlock object with all required properties
    const completeBlockData: QuestionBlockType = {
      id: blockData.id || `strand${currentStrand}_level${level}`,
      level: level as 2 | 4 | 6 | 8,
      questions: blockData.questions || [],
      completed: blockData.completed || false, // Required property
      score: blockData.score || 0,
      unlocked: true, // All levels are unlocked in this implementation
      attempts: blockData.attempts || 0,
      maxAttempts: blockData.maxAttempts || 3,
      completedQuestions: blockData.completedQuestions || 0,
      totalQuestions: blockData.questions?.length || 0
    };

    setActiveQuestionBlock(completeBlockData);
    setShowResults(false);
    console.log('🚀 Started question block:', { level, questions: completeBlockData.questions.length });
  };

  // Get existing tips and suggestions for current strand
  const getCurrentTips = () => {
    return strandTips[experimentChoice]?.[`strand${currentStrand}`] || {};
  };

  const getCurrentSuggestions = () => {
    return suggestions[experimentChoice]?.[`strand${currentStrand}`] || [];
  };

  // Calculate overall progress using existing system
  const calculateOverallProgress = (): number => {
    const strandData = questionSystemContext?.questionSystem?.strands?.[currentStrand];
    if (!strandData) return 0;
    
    const completedBlocks = Object.values(strandData.questionBlocks || {})
      .filter((block: any) => block.completed);
    
    if (completedBlocks.length === 0) return 0;
    
    const maxScore = Math.max(...completedBlocks.map((block: any) => block.score || 0));
    return Math.min(8, maxScore);
  };

  // Get block status using existing system
  const getBlockStatus = (level: number) => {
    const blockId = `strand${currentStrand}_level${level}`;
    const strandData = questionSystemContext?.questionSystem?.strands?.[currentStrand];
    const blockData = strandData?.questionBlocks?.[blockId];
    return blockData?.completed ? 'completed' : 'available';
  };

  // Loading state
  if (!strandQuestionData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-purple-600 font-medium">Loading interactive questions...</span>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const tips = getCurrentTips();
  const currentSuggestions = getCurrentSuggestions();

  return (
    <div className="space-y-6">
      {/* Development debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-bold text-blue-800 mb-1">🔧 QUESTION SYSTEM DEBUG:</div>
          <div>Current Strand: {currentStrand}</div>
          <div>Overall Progress: {overallProgress}/8</div>
          <div>Sync Status: {syncStatus}</div>
          <div>Available Tips: {Object.keys(tips).length}</div>
          <div>Suggestions: {currentSuggestions.length}</div>
        </div>
      )}

      {/* Header with tips integration */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm border-2 border-purple-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-purple-800">
              Strand {currentStrand} Interactive Questions
            </h3>
            <p className="text-purple-600 mt-2 text-lg">
              {experimentChoice === 'critical-angle' 
                ? 'Master critical angle principles and total internal reflection'
                : 'Explore fiber optics and light transmission technology'
              }
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm">
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
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600">{overallProgress}/8</div>
            <div className="text-sm text-purple-500 font-medium">Overall Score</div>
          </div>
        </div>

        {/* Tips Section - using existing data */}
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

        {/* Level selection using existing block system */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h4 className="font-bold text-purple-700 mb-3 flex items-center">
            🎯 Select Question Level 
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Progressive Unlocking
            </span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {([2, 4, 6, 8] as const).map(level => {
              const status = getBlockStatus(level);
              const block = strandQuestionData.blocks?.find((b: any) => b.level === level);
              const isLocked = level > 2 && getBlockStatus((level - 2) as 2 | 4 | 6 | 8) !== 'completed';
              
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
                    ) : block && block.questions?.length > 0 ? (
                      <div>{block.questions.length} questions</div>
                    ) : (
                      <div className="text-xs opacity-80">No questions available</div>
                    )}
                  </div>
                  <div className="text-3xl mt-2">
                    {isLocked ? '🔒' : status === 'completed' ? '🏆' : '🎯'}
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {/* Level descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-600">
            <div><strong>Level 2:</strong> Basic recall and simple understanding</div>
            <div><strong>Level 4:</strong> Application in familiar contexts</div>
            <div><strong>Level 6:</strong> Analysis and evaluation in new contexts</div>
            <div><strong>Level 8:</strong> Synthesis and creation of understanding</div>
          </div>
        </div>
      </div>

      {/* Active Question Block - using existing QuestionBlock component */}
      <AnimatePresence mode="wait">
        {activeQuestionBlock && (
          <motion.div
            key={`block-${activeQuestionBlock.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="relative">
              {/* Close button */}
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
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results section */}
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

      {/* Suggestions section - using existing data */}
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

      {/* Progress summary using existing system */}
      {questionSystemContext?.questionSystem?.strands?.[currentStrand] && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Your Progress Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(questionSystemContext.questionSystem.strands[currentStrand].questionBlocks || {}).map(([blockId, blockData]: [string, any]) => {
              const level = parseInt(blockId.split('level')[1]);
              return (
                <div key={blockId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">Level {level}</div>
                  <div className="text-2xl font-bold text-gray-800">{blockData.score || 0}/8</div>
                  <div className="text-sm text-gray-600">
                    {blockData.completed ? 'Completed' : 'In Progress'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${((blockData.score || 0) / 8) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Help section */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="text-lg font-bold text-blue-800 mb-3">📚 How This Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h5 className="font-semibold mb-2">🎯 Progressive Learning</h5>
            <ul className="space-y-1">
              <li>• Start with Level 2 foundations</li>
              <li>• Unlock higher levels by completing previous ones</li>
              <li>• Each level builds on the previous</li>
              <li>• Retake levels to improve your score</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">🏆 Scoring & Feedback</h5>
            <ul className="space-y-1">
              <li>• Real-time evaluation and feedback</li>
              <li>• Hints available to guide your learning</li>
              <li>• Progress automatically synced</li>
              <li>• Suggestions based on your performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourResponseSection;