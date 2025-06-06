// src/components/questions/QuestionBlock.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, QuestionResponse, QuestionBlock as QuestionBlockType } from '../../types/questionBlock';
import MCQComponent from './MCQComponent';
import FillBlankComponent from './FillBlankComponent';
import MatchClickComponent from './MatchClickComponent';
import ShortAnswerComponent from './ShortAnswerComponent';

interface QuestionBlockProps {
  block: QuestionBlockType;
  onComplete: (blockId: string, responses: QuestionResponse[], averageScore: number) => void;
  onUnlock?: (nextLevel: number) => void;
  showSuggestions?: boolean;
}

const QuestionBlock: React.FC<QuestionBlockProps> = ({
  block,
  onComplete,
  onUnlock,
  showSuggestions = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = block.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === block.questions.length - 1;

  const handleQuestionResponse = (response: QuestionResponse) => {
    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex] = response;
    setResponses(updatedResponses);
    setShowFeedback(true);

    if (!response.isCorrect) {
      setAttempts(prev => prev + 1);
    }

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (isLastQuestion) {
        // Calculate average score and complete block
        const averageScore = updatedResponses.reduce((sum, r) => sum + r.score, 0) / updatedResponses.length;
        setIsCompleted(true);
        onComplete(block.id, updatedResponses, averageScore);
        
        // Unlock next level if score >= 6
        if (averageScore >= 6 && onUnlock) {
          const nextLevel = block.level === 2 ? 4 : block.level === 4 ? 6 : block.level === 6 ? 8 : null;
          if (nextLevel) onUnlock(nextLevel);
        }
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowFeedback(false);
      }
    }, 2000);
  };

  const getLevelColor = (level: number) => {
    const colors = {
      2: 'from-purple-200 to-purple-300',
      4: 'from-purple-300 to-purple-400', 
      6: 'from-purple-400 to-purple-500',
      8: 'from-purple-500 to-purple-600'
    };
    return colors[level as keyof typeof colors];
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!block.unlocked) {
    return (
      <motion.div
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 0.5, scale: 0.95 }}
        className="relative"
      >
        <div className={`p-6 rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} opacity-50`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <span className="text-2xl">🔒</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Level {block.level} Questions</h3>
          <p className="text-white/80">Complete Level {block.level - 2} to unlock</p>
        </div>
      </motion.div>
    );
  }

  if (isCompleted) {
    const averageScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`p-6 rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} text-white`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Level {block.level} Completed! 🎉</h3>
          <span className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
            {averageScore.toFixed(1)}/8
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Correct: {responses.filter(r => r.isCorrect).length}/{responses.length}</div>
          <div>Attempts: {attempts}</div>
        </div>
        <button
          onClick={() => {
            setCurrentQuestionIndex(0);
            setResponses([]);
            setShowFeedback(false);
            setAttempts(0);
            setIsCompleted(false);
          }}
          className="mt-4 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition"
        >
          Retry Level
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg bg-gradient-to-r ${getLevelColor(block.level)} text-white`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Level {block.level} Questions</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {currentQuestionIndex + 1}/{block.questions.length}
          </span>
          {attempts > 0 && (
            <span className="text-sm bg-white/20 px-2 py-1 rounded">
              Attempts: {attempts}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-2 mb-6">
        <div
          className="bg-white h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / block.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Component */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-lg p-4 text-gray-800"
        >
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
        </motion.div>
      </AnimatePresence>

      {/* Suggestions after 2 incorrect attempts */}
      {attempts >= 2 && showSuggestions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg"
        >
          <h4 className="font-semibold mb-1">💡 Hint:</h4>
          <p className="text-sm">
            Think about the key concepts: {currentQuestion.concept}. 
            Focus on: {currentQuestion.keywords.join(', ')}.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionBlock;