// src/components/questions/QuestionBlock.tsx - ENHANCED VERSION WITH NEW SYSTEM INTEGRATION
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ✅ Import from the new integrated system
import { 
  Question, 
  QuestionResponse, 
  QuestionBlock as QuestionBlockType 
} from '../../types/questionBlock';

// ✅ Import the Universal Question Renderer from the new system
import { UniversalQuestionRenderer } from './questionImplementations';

// ✅ Import individual components as fallback
import MCQComponent from './MCQComponent';
import FillBlankComponent from './FillBlankComponent';
import MatchClickComponent from './MatchClickComponent';
import ShortAnswerComponent from './ShortAnswerComponent';

interface QuestionBlockProps {
  block: QuestionBlockType;
  onComplete: (blockId: string, responses: QuestionResponse[], averageScore: number) => void;
  onUnlock?: (nextLevel: number) => void;
  showSuggestions?: boolean;
  onProgressUpdate?: (blockId: string, currentQuestion: number, totalQuestions: number, currentScore: number) => void;
  // ✅ Additional props for new system integration
  currentStudentId?: string;
  sessionCode?: string;
  experimentChoice?: 'critical-angle' | 'fiber-optics';
  syncStatus?: 'idle' | 'saving' | 'success' | 'error';
  useUniversalRenderer?: boolean; // Option to use new system or fall back to individual components
}

const QuestionBlock: React.FC<QuestionBlockProps> = ({
  block,
  onComplete,
  onUnlock,
  showSuggestions = false,
  onProgressUpdate,
  currentStudentId,
  sessionCode,
  experimentChoice,
  syncStatus = 'idle',
  useUniversalRenderer = true // Default to new system
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);

  const currentQuestion = block.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === block.questions.length - 1;

  // ✅ Initialize timing
  useEffect(() => {
    setStartTime(new Date());
    setQuestionStartTime(new Date());
  }, []);

  // ✅ Update question start time when question changes
  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentQuestionIndex]);

  // ✅ ENHANCED: Handle question response with new signature
  const handleQuestionResponse = (questionId: string, answer: any, isCorrect: boolean, score: number) => {
    const endTime = new Date();
    const timeSpent = questionStartTime ? endTime.getTime() - questionStartTime.getTime() : 0;

    const response: QuestionResponse = {
      questionId,
      type: currentQuestion.type,
      answer,
      isCorrect,
      score,
      feedback: isCorrect 
        ? `Excellent! ${currentQuestion.explanation || 'Well done!'}` 
        : `Good attempt. ${currentQuestion.explanation || 'Keep trying!'}`,
      timestamp: endTime,
      timeSpent
    };

    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex] = response;
    setResponses(updatedResponses);
    setShowFeedback(true);

    if (!isCorrect) {
      setAttempts(prev => prev + 1);
    }

    // ✅ Update progress
    const currentScore = updatedResponses.reduce((sum, r) => sum + (r?.score || 0), 0) / Math.max(updatedResponses.filter(r => r).length, 1);
    onProgressUpdate?.(block.id, currentQuestionIndex + 1, block.questions.length, currentScore);

    // ✅ Celebration for correct answers
    if (isCorrect) {
      if (score >= 7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      } else if (score >= 5) {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa', '#93c5fd']
        });
      }
    }

    // ✅ Auto-advance after showing feedback
    setTimeout(() => {
      if (isLastQuestion) {
        // Calculate average score and complete block
        const totalScore = updatedResponses.reduce((sum, r) => sum + (r?.score || 0), 0);
        const averageScore = totalScore / updatedResponses.length;
        setIsCompleted(true);
        onComplete(block.id, updatedResponses, averageScore);
        
        // ✅ Enhanced celebration for block completion
        if (averageScore >= 7) {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#d97706']
          });
        }
        
        // Unlock next level if score >= 6
        if (averageScore >= 6 && onUnlock) {
          const nextLevel = block.level === 2 ? 4 : block.level === 4 ? 6 : block.level === 6 ? 8 : null;
          if (nextLevel) onUnlock(nextLevel);
        }
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowFeedback(false);
      }
    }, 2500); // Slightly longer to read feedback
  };

  const getLevelColor = (level: number) => {
    const colors = {
      2: 'from-purple-200 to-purple-300',
      4: 'from-purple-300 to-purple-400', 
      6: 'from-purple-400 to-purple-500',
      8: 'from-purple-500 to-purple-600'
    };
    return colors[level as keyof typeof colors] || 'from-gray-200 to-gray-300';
  };

  const getLevelBorderColor = (level: number) => {
    const colors = {
      2: 'border-purple-300',
      4: 'border-purple-400', 
      6: 'border-purple-500',
      8: 'border-purple-600'
    };
    return colors[level as keyof typeof colors] || 'border-gray-300';
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionRate = () => {
    const completed = responses.filter(r => r).length;
    return (completed / block.questions.length) * 100;
  };

  const getCurrentAverageScore = () => {
    const validResponses = responses.filter(r => r);
    if (validResponses.length === 0) return 0;
    return validResponses.reduce((sum, r) => sum + r.score, 0) / validResponses.length;
  };

  // ✅ ENHANCED: Unlocked check with better visual feedback
  if (!block.unlocked) {
    return (
      <motion.div
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 0.5, scale: 0.95 }}
        whileHover={{ scale: 0.97, opacity: 0.6 }}
        className="relative"
      >
        <div className={`p-6 rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} opacity-50 border-2 ${getLevelBorderColor(block.level)}`}>
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <span className="text-2xl">🔒</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Level {block.level} Questions</h3>
          <p className="text-white/80 text-sm">Complete Level {block.level - 2} with score ≥ 6 to unlock</p>
          <div className="mt-3 flex items-center gap-2 text-white/70 text-xs">
            <span>🎯 {block.questions.length} questions</span>
            <span>•</span>
            <span>⭐ {block.level} points each</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ✅ ENHANCED: Completion screen with detailed stats
  if (isCompleted) {
    const averageScore = responses.reduce((sum, r) => sum + (r?.score || 0), 0) / responses.length;
    const correctCount = responses.filter(r => r?.isCorrect).length;
    const totalTime = startTime ? (new Date().getTime() - startTime.getTime()) / 1000 : 0;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`p-6 rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} text-white border-2 ${getLevelBorderColor(block.level)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="text-lg font-bold">Level {block.level} Completed!</h3>
              <p className="text-white/80 text-sm">Great work on finishing this level</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}/8
            </div>
            <div className="text-xs text-white/70">Average Score</div>
          </div>
        </div>

        {/* ✅ Detailed Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{correctCount}/{responses.length}</div>
            <div className="text-xs text-white/70">Correct</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{attempts}</div>
            <div className="text-xs text-white/70">Total Attempts</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{Math.round(totalTime)}s</div>
            <div className="text-xs text-white/70">Time Taken</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{Math.round((correctCount / responses.length) * 100)}%</div>
            <div className="text-xs text-white/70">Success Rate</div>
          </div>
        </div>

        {/* ✅ Performance Feedback */}
        <div className="mb-4 p-3 bg-white/10 rounded-lg">
          {averageScore >= 7 && (
            <p className="text-sm text-white/90">
              🌟 <strong>Excellent!</strong> You've mastered this level. Ready for the next challenge?
            </p>
          )}
          {averageScore >= 5 && averageScore < 7 && (
            <p className="text-sm text-white/90">
              👍 <strong>Good work!</strong> You understand the concepts well. Practice a bit more to perfect your skills.
            </p>
          )}
          {averageScore >= 3 && averageScore < 5 && (
            <p className="text-sm text-white/90">
              📚 <strong>Keep learning!</strong> Review the concepts and try again. You're making progress!
            </p>
          )}
          {averageScore < 3 && (
            <p className="text-sm text-white/90">
              💪 <strong>Don't give up!</strong> Learning takes time. Review the material and try again.
            </p>
          )}
        </div>

        {/* ✅ Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setCurrentQuestionIndex(0);
              setResponses([]);
              setShowFeedback(false);
              setAttempts(0);
              setIsCompleted(false);
              setStartTime(new Date());
              setQuestionStartTime(new Date());
            }}
            className="flex-1 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
          >
            🔄 Retry Level
          </button>
          
          {averageScore >= 6 && (
            <button
              onClick={() => {
                const nextLevel = block.level === 2 ? 4 : block.level === 4 ? 6 : block.level === 6 ? 8 : null;
                if (nextLevel && onUnlock) {
                  onUnlock(nextLevel);
                }
              }}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              🚀 Next Level
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // ✅ NEW: Enhanced question renderer with integration system support
  const renderQuestion = () => {
    if (!currentQuestion) {
      return (
        <div className="p-4 text-center text-gray-500">
          No questions available in this block.
        </div>
      );
    }

    const previousResponse = responses[currentQuestionIndex];

    // ✅ Try to use the Universal Question Renderer from new system first
    if (useUniversalRenderer) {
      try {
        return (
          <div className="relative">
            {/* New System Indicator */}
            <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg">
              ✨ Enhanced
            </div>
            <UniversalQuestionRenderer
              question={currentQuestion}
              onAnswer={handleQuestionResponse}
              showFeedback={showFeedback}
              previousResponse={previousResponse}
            />
          </div>
        );
      } catch (error) {
        console.warn('Universal renderer failed, falling back to individual components:', error);
        // Fall through to individual components
      }
    }

    // ✅ Fallback to individual components (your original system)
    return (
      <div className="relative">
        {!useUniversalRenderer && (
          <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-bl-lg">
            ⚡ Legacy
          </div>
        )}
        
        {currentQuestion.type === 'mcq' && (
          <MCQComponent
            question={currentQuestion}
            onAnswer={handleQuestionResponse}
            showFeedback={showFeedback}
          />
        )}
        {currentQuestion.type === 'fill-blank' && (
          <FillBlankComponent
            question={currentQuestion}
            onAnswer={handleQuestionResponse}
            showFeedback={showFeedback}
          />
        )}
        {currentQuestion.type === 'match-click' && (
          <MatchClickComponent
            question={currentQuestion}
            onAnswer={handleQuestionResponse}
            showFeedback={showFeedback}
          />
        )}
        {currentQuestion.type === 'short-answer' && (
          <ShortAnswerComponent
            question={currentQuestion}
            onAnswer={handleQuestionResponse}
            showFeedback={showFeedback}
          />
        )}
      </div>
    );
  };

  // ✅ ENHANCED: Active question block with improved UI and sync status
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} text-white border-2 ${getLevelBorderColor(block.level)} overflow-hidden`}
    >
      {/* ✅ Enhanced Header with Sync Status */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-lg font-bold">Level {block.level} Questions</h3>
              <p className="text-white/80 text-sm">
                {block.questions.length} questions • {block.level} points each
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-white/70">Question</div>
              {/* ✅ Sync Status Indicator */}
              {syncStatus && (
                <span className={`px-2 py-1 rounded text-xs ${
                  syncStatus === 'saving' ? 'bg-yellow-300 text-yellow-800' :
                  syncStatus === 'success' ? 'bg-green-300 text-green-800' :
                  syncStatus === 'error' ? 'bg-red-300 text-red-800' :
                  'bg-white/20 text-white'
                }`}>
                  {syncStatus === 'saving' ? '💾' :
                   syncStatus === 'success' ? '✅' :
                   syncStatus === 'error' ? '❌' : '💤'}
                </span>
              )}
            </div>
            <div className="text-xl font-bold">
              {currentQuestionIndex + 1}/{block.questions.length}
            </div>
          </div>
        </div>

        {/* ✅ Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-white/70">
            <span>Progress</span>
            <span>{Math.round(getCompletionRate())}% complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-white h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / block.questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ✅ Live Stats */}
        <div className="flex justify-between items-center mt-3 text-xs">
          <div className="flex items-center gap-4">
            {responses.filter(r => r).length > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded">
                Avg: {getCurrentAverageScore().toFixed(1)}/8
              </span>
            )}
            {attempts > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded">
                Attempts: {attempts}
              </span>
            )}
            {useUniversalRenderer && (
              <span className="bg-green-400/30 px-2 py-1 rounded">
                Enhanced Mode
              </span>
            )}
          </div>
          <div className="text-white/70">
            Level {block.level} Challenge
          </div>
        </div>
      </div>

      {/* ✅ Enhanced Question Component Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white mx-6 mb-6 rounded-lg p-6 text-gray-800 shadow-lg"
        >
          {/* ✅ Question Number and Type Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {currentQuestion.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {currentQuestion.points || currentQuestion.level} points
            </div>
          </div>

          {/* ✅ Render question using new integrated system or fallback */}
          {renderQuestion()}

          {/* ✅ Question Feedback Display */}
          {showFeedback && responses[currentQuestionIndex] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-4 p-4 rounded-lg border-2 ${
                responses[currentQuestionIndex].isCorrect
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {responses[currentQuestionIndex].isCorrect ? '✅' : '❌'}
                </span>
                <span className="font-semibold">
                  {responses[currentQuestionIndex].isCorrect ? 'Correct!' : 'Not quite right'}
                </span>
                <span className="ml-auto text-sm">
                  Score: {responses[currentQuestionIndex].score}/{currentQuestion.level}
                </span>
              </div>
              <p className="text-sm">{responses[currentQuestionIndex].feedback}</p>
              
              {!isLastQuestion && (
                <div className="mt-2 text-xs text-gray-600">
                  Moving to next question in a moment...
                </div>
              )}
              {isLastQuestion && (
                <div className="mt-2 text-xs text-gray-600">
                  Calculating your final score...
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ✅ Enhanced Suggestions after multiple incorrect attempts */}
      {attempts >= 2 && showSuggestions && !showFeedback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mx-6 mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200"
        >
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            💡 Need a hint?
          </h4>
          <div className="text-sm space-y-1">
            <p><strong>Key concept:</strong> {(currentQuestion as any).concept}</p>
            {(currentQuestion as any).keywords && (currentQuestion as any).keywords.length > 0 && (
              <p><strong>Important terms:</strong> {(currentQuestion as any).keywords.join(', ')}</p>
            )}
            <p className="text-yellow-700 mt-2">
              Take your time and think about the fundamental principles involved.
            </p>
          </div>
        </motion.div>
      )}

      {/* ✅ Accessibility Progress Announcement */}
      <div className="sr-only" aria-live="polite">
        {showFeedback && responses[currentQuestionIndex] && (
          <span>
            Question {currentQuestionIndex + 1} of {block.questions.length} {responses[currentQuestionIndex].isCorrect ? 'answered correctly' : 'answered incorrectly'}. 
            {!isLastQuestion ? 'Moving to next question.' : 'Completing level.'}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionBlock;