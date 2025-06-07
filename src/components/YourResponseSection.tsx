// src/components/YourResponseSection.tsx - COMPLETE ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQuestionStrandSync } from '../hooks/useQuestionStrandSync';
import { QuestionBlock as QuestionBlockType, QuestionResponse, StrandQuestionData, Question } from '../types/questionBlock';
import questionData from '../data/questionData.json';
import { MCQRenderer, FillBlankRenderer, ShortAnswerRenderer, MatchClickRenderer } from './questions/QuestionRenderers';

interface YourResponseSectionProps {
  currentStrand: number;
  experimentChoice: 'critical-angle' | 'fiber-optics';
  currentStudentId: string;
  sessionCode: string;
  onProgressUpdate: (strand: number, level: number, score: number) => void; // ✅ CRITICAL: Progress callback
}

const YourResponseSection: React.FC<YourResponseSectionProps> = ({
  currentStrand,
  experimentChoice,
  currentStudentId,
  sessionCode,
  onProgressUpdate // ✅ CRITICAL: Progress callback
}) => {
  const [strandData, setStrandData] = useState<StrandQuestionData | null>(null);
  const [completedBlocks, setCompletedBlocks] = useState<{ [blockId: string]: { score: number; responses: QuestionResponse[] } }>({});
  const [currentBlock, setCurrentBlock] = useState<QuestionBlockType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});

  // Use the question strand sync hook
  const { syncStatus, saveResponse, loadResponses } = useQuestionStrandSync({
    studentId: currentStudentId,
    experiment: experimentChoice,
    sessionCode,
    strandhoot: 'criteria-a-tir',
    currentStrand,
  });

  // ✅ CRITICAL FIX: Enhanced progress calculation and immediate callback
  const calculateAndUpdateProgress = (blockId: string, blockResponses: QuestionResponse[]) => {
    if (blockResponses.length === 0) return 0;

    // Calculate average score for this block
    const totalScore = blockResponses.reduce((sum, resp) => sum + resp.score, 0);
    const averageScore = totalScore / blockResponses.length;
    
    // Convert to 0-8 scale (question scores are typically 0-level, where level is 2,4,6,8)
    const level = parseInt(blockId.split('level')[1]) || 2;
    const normalizedScore = Math.min(8, Math.round(averageScore));
    
    console.log('🎯 QUESTION PROGRESS CALCULATION:', {
      blockId,
      responses: blockResponses.length,
      totalScore,
      averageScore,
      level,
      normalizedScore,
      strand: currentStrand
    });

    // ✅ CRITICAL: Immediately call progress update
    onProgressUpdate(currentStrand, level, normalizedScore);
    
    return normalizedScore;
  };

  // ✅ CRITICAL FIX: Load question data with better error handling
  useEffect(() => {
    const loadQuestionData = () => {
      try {
        console.log('📚 LOADING QUESTION DATA:', { experimentChoice, currentStrand });
        
        const data = (questionData as any)[experimentChoice]?.[`strand${currentStrand}`];
        
        if (data) {
          const blocks: QuestionBlockType[] = [2, 4, 6, 8].map(level => {
            const questions = data[`level${level}`] || [];
            return {
              id: `strand${currentStrand}_level${level}`,
              level: level as 2 | 4 | 6 | 8,
              questions,
              unlocked: true, // ALL LEVELS ALWAYS UNLOCKED
              completed: false,
              score: 0,
              attempts: 0,
              maxAttempts: 5,
              completedQuestions: 0,
              totalQuestions: questions.length
            };
          });

          const strandInfo: StrandQuestionData = {
            strand: currentStrand,
            learningPath: experimentChoice,
            title: `Strand ${currentStrand} Interactive Questions`,
            description: getStrandDescription(currentStrand),
            blocks
          };

          console.log('✅ QUESTION DATA LOADED:', { blocks: blocks.length, totalQuestions: blocks.reduce((sum, b) => sum + b.totalQuestions, 0) });
          setStrandData(strandInfo);
        } else {
          console.warn('⚠️ NO QUESTION DATA FOUND for:', experimentChoice, `strand${currentStrand}`);
          // Create fallback data
          setStrandData({
            strand: currentStrand,
            learningPath: experimentChoice,
            title: `Strand ${currentStrand} Interactive Questions`,
            description: getStrandDescription(currentStrand),
            blocks: []
          });
        }
      } catch (error) {
        console.error('💥 ERROR LOADING QUESTION DATA:', error);
        setStrandData(null);
      }
    };

    loadQuestionData();
  }, [currentStrand, experimentChoice]);

  // ✅ CRITICAL FIX: Load saved responses and update progress immediately
  useEffect(() => {
    const loadSavedResponses = async () => {
      if (!currentStudentId || !sessionCode || !strandData) return;

      try {
        console.log('📥 LOADING SAVED RESPONSES for strand:', currentStrand);
        const savedResponses = await loadResponses();
        setResponses(savedResponses);
        
        // Update completed blocks and trigger progress updates
        const updatedCompletedBlocks: { [blockId: string]: { score: number; responses: QuestionResponse[] } } = {};
        
        strandData.blocks.forEach(block => {
          const blockResponses = Object.values(savedResponses).filter(
            response => response.questionId.startsWith(block.id)
          );
          
          if (blockResponses.length > 0) {
            console.log('🔄 RESTORING BLOCK PROGRESS:', block.id, blockResponses.length, 'responses');
            const blockScore = calculateAndUpdateProgress(block.id, blockResponses);
            
            updatedCompletedBlocks[block.id] = {
              score: blockScore,
              responses: blockResponses
            };
          }
        });
        
        setCompletedBlocks(updatedCompletedBlocks);
        console.log('✅ SAVED RESPONSES LOADED:', Object.keys(savedResponses).length, 'responses');
        
      } catch (error) {
        console.error('💥 ERROR LOADING SAVED RESPONSES:', error);
      }
    };

    loadSavedResponses();
  }, [currentStudentId, sessionCode, strandData, currentStrand, loadResponses]);

  const getStrandDescription = (strand: number): string => {
    const descriptions = {
      1: "Master the fundamental principles and laws governing total internal reflection",
      2: "Understand the phenomena and conditions required for TIR to occur", 
      3: "Explore real-world applications of TIR in technology and nature",
      4: "Analyze and solve complex problems involving TIR calculations"
    };
    return descriptions[strand as keyof typeof descriptions] || "";
  };

  const startLevel = (level: number) => {
    if (!strandData) return;
    
    const block = strandData.blocks.find(b => b.level === level);
    if (block && block.questions.length > 0) {
      console.log('🚀 STARTING LEVEL:', level, 'with', block.questions.length, 'questions');
      setCurrentBlock(block);
      setCurrentQuestionIndex(0);
      setShowResults(false);
    } else {
      console.warn('⚠️ NO QUESTIONS FOUND FOR LEVEL:', level);
    }
  };

  // ✅ ENHANCED: Handle question responses with immediate progress update
  const handleAnswer = async (questionId: string, answer: any, isCorrect: boolean, score: number) => {
    if (!currentBlock) return;

    console.log('📝 QUESTION ANSWERED:', { questionId, isCorrect, score, currentStrand });

    const response: QuestionResponse = {
      questionId,
      type: currentBlock.questions[currentQuestionIndex].type,
      answer,
      isCorrect,
      score,
      feedback: isCorrect ? 'Excellent work!' : 'Good attempt! Try again or move to the next question.',
      timestamp: new Date()
    };

    // Save response to Supabase
    await saveResponse(response);

    // Update local responses
    setResponses(prev => ({ ...prev, [questionId]: response }));

    // Update completed blocks immediately
    setCompletedBlocks(prev => {
      const allBlockResponses = [...(prev[currentBlock.id]?.responses || []), response];
      const blockScore = calculateAndUpdateProgress(currentBlock.id, allBlockResponses);
      
      return {
        ...prev,
        [currentBlock.id]: {
          score: blockScore,
          responses: allBlockResponses
        }
      };
    });

    // Move to next question or finish block
    if (currentQuestionIndex < currentBlock.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Block completed
      setCurrentBlock(null);
      setShowResults(true);
      
      // Celebration for block completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#a855f7', '#c084fc', '#ddd6fe']
      });
    }
  };

  // Calculate overall progress for this strand
  const calculateOverallProgress = (): number => {
    if (!strandData || Object.keys(completedBlocks).length === 0) return 0;
    
    // Get the highest level completed
    const completedLevels = Object.keys(completedBlocks).map(blockId => {
      const level = parseInt(blockId.split('level')[1]);
      const score = completedBlocks[blockId].score;
      return { level, score };
    });
    
    if (completedLevels.length === 0) return 0;
    
    // Return the highest score achieved
    const maxScore = Math.max(...completedLevels.map(cl => cl.score));
    return Math.min(8, maxScore);
  };

  const getLevelStatus = (level: number) => {
    const blockId = `strand${currentStrand}_level${level}`;
    return completedBlocks[blockId] ? 'completed' : 'available';
  };

  const getLevelColor = (level: number) => {
    const status = getLevelStatus(level);
    if (status === 'completed') return 'bg-green-500 text-white border-green-600';
    return 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600';
  };

  const renderCurrentQuestion = () => {
    if (!currentBlock || !currentBlock.questions[currentQuestionIndex]) return null;

    const question = currentBlock.questions[currentQuestionIndex];

    return (
      <motion.div
        key={`${currentBlock.id}-${currentQuestionIndex}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-lg p-6 shadow-lg border-2 border-purple-200"
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold text-purple-800">
            Level {currentBlock.level} - Question {currentQuestionIndex + 1}/{currentBlock.questions.length}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{question.points} points</span>
            <span className={`px-2 py-1 rounded text-xs ${
              syncStatus === 'saving' ? 'bg-yellow-100 text-yellow-800' :
              syncStatus === 'success' ? 'bg-green-100 text-green-800' :
              syncStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {syncStatus === 'saving' ? '💾' :
               syncStatus === 'success' ? '✅' :
               syncStatus === 'error' ? '❌' : '💤'}
            </span>
          </div>
        </div>

        {question.type === 'mcq' && (
          <MCQRenderer question={question} onAnswer={handleAnswer} />
        )}
        {question.type === 'fill-blank' && (
          <FillBlankRenderer question={question} onAnswer={handleAnswer} />
        )}
        {question.type === 'short-answer' && (
          <ShortAnswerRenderer question={question} onAnswer={handleAnswer} />
        )}
        {question.type === 'match-click' && (
          <MatchClickRenderer question={question} onAnswer={handleAnswer} />
        )}

        {/* Progress within block */}
        <div className="mt-4 pt-4 border-t border-purple-100">
          <div className="flex justify-between items-center text-sm text-purple-600">
            <span>Question Progress</span>
            <span>{currentQuestionIndex + 1} of {currentBlock.questions.length}</span>
          </div>
          <div className="w-full bg-purple-100 rounded-full h-2 mt-1">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentBlock.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  if (!strandData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-purple-600 font-medium">Loading questions...</span>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      {/* ✅ Development debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-bold text-blue-800 mb-1">🔧 QUESTION SYSTEM DEBUG:</div>
          <div>Current Strand: {currentStrand}</div>
          <div>Overall Progress: {overallProgress}/8</div>
          <div>Completed Blocks: {Object.keys(completedBlocks).length}</div>
          <div>Total Responses: {Object.keys(responses).length}</div>
          <div>Sync Status: {syncStatus}</div>
        </div>
      )}

      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm border-2 border-purple-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-purple-800">{strandData.title}</h3>
            <p className="text-purple-600 mt-2 text-lg">{strandData.description}</p>
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

        {/* Level Selection - All Levels Available */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h4 className="font-bold text-purple-700 mb-3 flex items-center">
            🎯 Select Question Level 
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              All Levels Unlocked!
            </span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[2, 4, 6, 8].map(level => {
              const status = getLevelStatus(level);
              const blockId = `strand${currentStrand}_level${level}`;
              const completedBlock = completedBlocks[blockId];
              
              return (
                <motion.button
                  key={level}
                  onClick={() => startLevel(level)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg border-2 font-bold transition-all duration-300 relative ${getLevelColor(level)}`}
                >
                  <div className="text-2xl font-bold">Level {level}</div>
                  <div className="text-sm mt-1">
                    {status === 'completed' ? (
                      <>
                        <div>Score: {completedBlock?.score}/8</div>
                        <div className="text-xs opacity-80">
                          {completedBlock?.responses.length} questions completed
                        </div>
                      </>
                    ) : (
                      <div>Ready to attempt!</div>
                    )}
                  </div>
                  <div className="text-3xl mt-2">
                    {status === 'completed' ? '🏆' : '🎯'}
                  </div>
                  
                  {/* Available pulse animation for uncompleted levels */}
                  {status !== 'completed' && (
                    <motion.div
                      className="absolute inset-0 border-2 border-purple-300 rounded-lg"
                      animate={{ 
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
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

      {/* Current Question Display */}
      <AnimatePresence mode="wait">
        {currentBlock && renderCurrentQuestion()}
      </AnimatePresence>

      {/* Results Summary */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200"
        >
          <h4 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            🎉 Level Completed!
            <span className="ml-3 text-lg">🌟</span>
          </h4>
          <p className="text-green-700 mb-4 text-lg">
            Excellent work! You can try another level or retry this one for an even better score.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResults(false)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Continue Learning
            </button>
            <button
              onClick={() => {
                setShowResults(false);
                if (currentBlock) startLevel(currentBlock.level);
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Retry Level
            </button>
          </div>
        </motion.div>
      )}

      {/* Enhanced Progress Summary */}
      {Object.keys(completedBlocks).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200"
        >
          <h4 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
            📊 Your Progress Summary
            <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {Object.keys(completedBlocks).length}/4 Levels Completed
            </span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {Object.keys(completedBlocks).length}
              </div>
              <div className="text-sm text-gray-600">Levels Completed</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {Object.values(completedBlocks).reduce((sum, block) => sum + block.responses.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {Object.values(completedBlocks).reduce((sum, block) => 
                  sum + block.responses.filter(r => r.isCorrect).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">{overallProgress}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="flex flex-wrap gap-3 mb-4">
            {overallProgress >= 8 && (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                🏆 Perfect Score Achiever!
              </span>
            )}
            {Object.keys(completedBlocks).length === 4 && (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                ✅ All Levels Mastered!
              </span>
            )}
            {Object.values(completedBlocks).some(block => block.score >= 7) && (
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                🌟 High Achiever!
              </span>
            )}
            {Object.values(completedBlocks).reduce((sum, block) => sum + block.responses.length, 0) >= 12 && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                📚 Knowledge Seeker!
              </span>
            )}
          </div>

          {/* Detailed breakdown */}
          <div className="pt-4 border-t border-purple-200">
            <h5 className="font-semibold text-purple-700 mb-3">Level Breakdown:</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[2, 4, 6, 8].map(level => {
                const blockId = `strand${currentStrand}_level${level}`;
                const block = completedBlocks[blockId];
                return (
                  <div key={level} className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-medium text-gray-800">Level {level}</div>
                    <div className={`text-lg font-bold ${
                      block ? (
                        block.score >= 6 ? 'text-green-600' :
                        block.score >= 4 ? 'text-yellow-600' :
                        'text-orange-600'
                      ) : 'text-gray-400'
                    }`}>
                      {block ? `${block.score}/8` : 'Not attempted'}
                    </div>
                    {block && (
                      <div className="text-xs text-gray-500">
                        {block.responses.length} questions
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          💡 How This Works
        </h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• <strong>All levels are unlocked</strong> - you can attempt any level at any time</li>
          <li>• <strong>Higher levels = more points</strong> - Level 8 questions are worth more than Level 2</li>
          <li>• <strong>Your progress is automatically saved</strong> - come back anytime to continue</li>
          <li>• <strong>You can retry levels</strong> - improve your score by attempting levels multiple times</li>
          <li>• <strong>Questions adapt to your learning path</strong> - content matches your chosen experiment</li>
        </ul>
      </div>
    </div>
  );
};

export default YourResponseSection;