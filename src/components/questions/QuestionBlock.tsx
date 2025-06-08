// src/components/questions/QuestionBlock.tsx 
// FIXED VERSION: Resolving import and type issues

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import { 
  Question, 
  QuestionResponse, 
  QuestionBlock as QuestionBlockType 
} from '../../types/questionBlock';

// ✅ Import your existing individual components (keeping them as primary)
import MCQComponent from './MCQComponent';
import FillBlankComponent from './FillBlankComponent';
import MatchClickComponent from './MatchClickComponent';
import ShortAnswerComponent from './ShortAnswerComponent';

// ✅ FIXED: Import the Universal Renderer properly
import UniversalQuestionRenderer, { UniversalQuestionUtils } from './UniversalQuestionRenderer';

interface QuestionBlockProps {
  block: QuestionBlockType;
  onComplete: (blockId: string, responses: QuestionResponse[], averageScore: number) => void;
  onUnlock?: (nextLevel: number) => void;
  showSuggestions?: boolean;
  onProgressUpdate?: (blockId: string, currentQuestion: number, totalQuestions: number, currentScore: number) => void;
  
  // ✅ Your existing props
  currentStudentId?: string;
  sessionCode?: string;
  experimentChoice?: 'critical-angle' | 'fiber-optics' | 'distance' | 'magnets';
  syncStatus?: 'idle' | 'saving' | 'success' | 'error';
  
  // ✅ NEW: Optional Universal Renderer integration
  useUniversalRenderer?: boolean; // Toggle between systems
  fallbackToIndividual?: boolean; // Fallback strategy
  enableEnhancedValidation?: boolean; // Enhanced question validation
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
  useUniversalRenderer = false, // Default to your existing system
  fallbackToIndividual = true,
  enableEnhancedValidation = true
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [renderingMode, setRenderingMode] = useState<'individual' | 'universal' | 'error'>('individual');

  const currentQuestion = block.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === block.questions.length - 1;

  // ✅ Enhanced initialization with validation
  useEffect(() => {
    setStartTime(new Date());
    setQuestionStartTime(new Date());
    
    // ✅ Determine rendering mode
    if (useUniversalRenderer) {
      // Validate questions if enhanced validation is enabled
      if (enableEnhancedValidation && currentQuestion) {
        const isValid = UniversalQuestionUtils.validateQuestion(currentQuestion);
        if (isValid) {
          setRenderingMode('universal');
        } else if (fallbackToIndividual) {
          console.warn(`Question ${currentQuestion.id} failed validation, falling back to individual components`);
          setRenderingMode('individual');
        } else {
          setRenderingMode('error');
        }
      } else {
        setRenderingMode('universal');
      }
    } else {
      setRenderingMode('individual');
    }
  }, [useUniversalRenderer, enableEnhancedValidation, fallbackToIndividual, currentQuestion]);

  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentQuestionIndex]);

  // ✅ ENHANCED: Your existing response handler with optional universal integration
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
        : `Good attempt. ${currentQuestion.explanation || 'Keep learning!'}`,
      timestamp: endTime,
      timeSpent
    };

    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex] = response;
    setResponses(updatedResponses);
    setShowFeedback(true);

    // ✅ Optional enhanced analytics (only if using universal renderer)
    if (useUniversalRenderer && questionStartTime) {
      UniversalQuestionUtils.trackQuestionPerformance(
        questionId,
        questionStartTime.getTime(),
        endTime.getTime(),
        isCorrect
      );
    }

    if (!isCorrect) {
      setAttempts(prev => prev + 1);
    }

    // ✅ Your existing progress calculation
    const currentScore = updatedResponses.reduce((sum, r) => sum + (r?.score || 0), 0) / Math.max(updatedResponses.filter(r => r).length, 1);
    onProgressUpdate?.(block.id, currentQuestionIndex + 1, block.questions.length, currentScore);

    // ✅ Your existing celebration system
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

    // ✅ Your existing auto-advance logic
    setTimeout(() => {
      if (isLastQuestion) {
        const totalScore = updatedResponses.reduce((sum, r) => sum + (r?.score || 0), 0);
        const averageScore = totalScore / updatedResponses.length;
        setIsCompleted(true);
        onComplete(block.id, updatedResponses, averageScore);
        
        if (averageScore >= 7) {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#d97706']
          });
        }
        
        if (averageScore >= 6 && onUnlock) {
          const nextLevel = block.level === 2 ? 4 : block.level === 4 ? 6 : block.level === 6 ? 8 : null;
          if (nextLevel) onUnlock(nextLevel);
        }
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowFeedback(false);
      }
    }, 2500);
  };

  // ✅ Enhanced question renderer with fallback system
  const renderQuestion = () => {
    if (!currentQuestion) {
      return (
        <div className="p-4 text-center text-gray-500">
          No questions available in this block.
        </div>
      );
    }

    // ✅ Error state rendering
    if (renderingMode === 'error') {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">⚠️ Question Error</h4>
          <p className="text-red-700 text-sm mb-3">
            This question has invalid data and cannot be displayed.
          </p>
          <button
            onClick={() => setRenderingMode('individual')}
            className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition"
          >
            Try Individual Renderer
          </button>
        </div>
      );
    }

    // ✅ Universal Renderer (new enhanced system)
    if (renderingMode === 'universal') {
      try {
        return (
          <div className="relative">
            {/* ✅ Visual indicator for universal renderer */}
            <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg z-10">
              ✨ Enhanced
            </div>
            
            {/* ✅ FIXED: Proper props for UniversalQuestionRenderer */}
            <UniversalQuestionRenderer
              question={currentQuestion}
              onAnswer={handleQuestionResponse}
              showFeedback={showFeedback}
              disabled={false}
              previousResponse={responses[currentQuestionIndex]}
            />
          </div>
        );
      } catch (error) {
        console.error('Universal renderer failed:', error);
        
        // ✅ Auto-fallback to individual components
        if (fallbackToIndividual) {
          setRenderingMode('individual');
          return renderIndividualQuestion();
        } else {
          return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-yellow-800 font-semibold mb-2">🔧 Rendering Error</h4>
              <p className="text-yellow-700 text-sm">
                Universal renderer failed. Please try refreshing the page.
              </p>
            </div>
          );
        }
      }
    }

    // ✅ Individual Components (your existing excellent system)
    return renderIndividualQuestion();
  };

  // ✅ Your existing individual component rendering (keeping all your excellent features)
  const renderIndividualQuestion = () => {
    return (
      <div className="relative">
        {/* ✅ Visual indicator for individual renderer */}
        {useUniversalRenderer && (
          <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-bl-lg z-10">
            ⚡ Individual
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
        
        {/* ✅ Fallback for unknown question types */}
        {!['mcq', 'fill-blank', 'match-click', 'short-answer'].includes(currentQuestion.type) && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-gray-800 font-semibold mb-2">❓ Unsupported Question Type</h4>
            <p className="text-gray-700 text-sm">
              Question type "{currentQuestion.type}" is not supported by individual components.
            </p>
            {useUniversalRenderer && (
              <button
                onClick={() => setRenderingMode('universal')}
                className="mt-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded transition"
              >
                Try Universal Renderer
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ✅ Your existing styling functions (keeping all your excellent design)
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

  // ✅ ENHANCED: Unlocked check (keeping your excellent visual feedback)
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

  // ✅ ENHANCED: Completion screen (keeping your excellent detailed stats)
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
              {/* ✅ Show rendering mode used */}
              <p className="text-white/60 text-xs mt-1">
                {renderingMode === 'universal' ? '✨ Enhanced renderer' : 
                 renderingMode === 'individual' ? '⚡ Individual components' : 
                 '🔧 Mixed rendering'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}/8
            </div>
            <div className="text-xs text-white/70">Average Score</div>
          </div>
        </div>

        {/* ✅ Enhanced Statistics Grid */}
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

  // ✅ ENHANCED: Active question block (keeping your excellent UI + new integration features)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} text-white border-2 ${getLevelBorderColor(block.level)} overflow-hidden`}
    >
      {/* ✅ Enhanced Header with Integration Status */}
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
              {/* ✅ Enhanced Status Indicators */}
              {syncStatus && (
                <span className={`px-2 py-1 rounded text-xs transition-all duration-200 ${
                  syncStatus === 'saving' ? 'bg-yellow-300 text-yellow-800 animate-pulse' :
                  syncStatus === 'success' ? 'bg-green-300 text-green-800' :
                  syncStatus === 'error' ? 'bg-red-300 text-red-800 animate-bounce' :
                  'bg-white/20 text-white'
                }`}>
                  {syncStatus === 'saving' ? '💾 Saving' :
                   syncStatus === 'success' ? '✅ Synced' :
                   syncStatus === 'error' ? '❌ Error' : '💤 Idle'}
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
              className="bg-white h-3 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / block.questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ✅ Enhanced Live Stats */}
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
            {/* ✅ Rendering Mode Indicator */}
            <span className={`px-2 py-1 rounded ${
              renderingMode === 'universal' ? 'bg-green-400/30' :
              renderingMode === 'individual' ? 'bg-blue-400/30' :
              'bg-red-400/30'
            }`}>
              {renderingMode === 'universal' ? '✨ Enhanced' :
               renderingMode === 'individual' ? '⚡ Individual' :
               '🔧 Error Mode'}
            </span>
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
              {/* ✅ Enhanced validation indicator */}
              {enableEnhancedValidation && useUniversalRenderer && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  UniversalQuestionUtils.validateQuestion(currentQuestion) 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {UniversalQuestionUtils.validateQuestion(currentQuestion) ? '✓ Valid' : '⚠ Invalid'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{currentQuestion.points || currentQuestion.level} points</span>
              {/* ✅ Rendering mode toggle (development feature) */}
              {process.env.NODE_ENV === 'development' && useUniversalRenderer && (
                <button
                  onClick={() => {
                    setRenderingMode(prev => 
                      prev === 'universal' ? 'individual' : 'universal'
                    );
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
                  title="Toggle rendering mode (dev only)"
                >
                  🔄
                </button>
              )}
            </div>
          </div>

          {/* ✅ Enhanced Question Renderer */}
          {renderQuestion()}

          {/* ✅ Question Feedback Display (keeping your excellent feedback system) */}
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

      {/* ✅ Enhanced Suggestions (keeping your excellent hint system) */}
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
            {/* ✅ Enhanced hint: suggest trying different renderer */}
            {useUniversalRenderer && renderingMode === 'individual' && (
              <p className="text-yellow-600 text-xs mt-2">
                💡 Try switching to the enhanced renderer for additional help features.
              </p>
            )}
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