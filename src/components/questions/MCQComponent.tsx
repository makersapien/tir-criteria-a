// src/components/questions/MCQComponent.tsx - Enhanced for better feedback integration
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MCQQuestion } from '../../types/questionBlock';

interface MCQComponentProps {
  question: MCQQuestion;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  showFeedback?: boolean;
  disabled?: boolean; // 🎯 NEW: Disable during feedback display
}

const MCQComponent: React.FC<MCQComponentProps> = ({
  question,
  onAnswer,
  showFeedback = false, // 🎯 Default to false - QuestionBlock handles feedback
  disabled = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    if (hasAnswered || disabled) return;
    
    setSelectedOption(optionId);
    setHasAnswered(true);

    const selectedOpt = question.options.find(opt => opt.id === optionId);
    const isCorrect = selectedOpt?.isCorrect || false;
    
    // Calculate score based on partial credit system
    let score = 0;
    if (isCorrect) {
      score = question.level; // Full points for correct answer
    } else if (selectedOpt?.level) {
      score = selectedOpt.level; // Partial credit for "partially correct" answers
    }

    // 🎯 Call answer handler immediately - QuestionBlock will manage feedback timing
    onAnswer(question.id, optionId, isCorrect, score);
  };

  // 🎯 Enhanced option styling for better visual feedback
  const getOptionColor = (option: any) => {
    if (disabled && hasAnswered) {
      // 🎯 Show selection state during feedback review
      if (selectedOption === option.id) {
        return 'bg-purple-200 border-purple-500 text-purple-800 ring-2 ring-purple-300';
      }
      return 'bg-gray-100 border-gray-300 text-gray-600';
    }

    if (!hasAnswered) {
      return selectedOption === option.id 
        ? 'bg-purple-100 border-purple-500 text-purple-700 ring-2 ring-purple-200'
        : 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200';
    }

    // Answered but not disabled (shouldn't normally happen with new flow)
    return 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed';
  };

  const getOptionIcon = (option: any) => {
    if (!hasAnswered || !disabled) {
      return selectedOption === option.id ? '●' : '○';
    }

    // During feedback review, show selection state
    if (selectedOption === option.id) {
      return '👆'; // Selected by user
    }
    return '○';
  };

  // 🎯 Enhanced animations for better engagement
  const getOptionAnimation = (index: number) => ({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: index * 0.1, duration: 0.3 },
    whileHover: !hasAnswered && !disabled ? { scale: 1.02, x: 5 } : {},
    whileTap: !hasAnswered && !disabled ? { scale: 0.98 } : {}
  });

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question}
      </h4>

      {/* 🎯 Enhanced instruction text for better UX */}
      {!hasAnswered && !disabled && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            🎯 <strong>Choose the best answer:</strong> Click on your selected option below.
          </p>
        </div>
      )}

      {/* 🎯 Feedback state indicator */}
      {disabled && hasAnswered && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700 flex items-center gap-2">
            📝 <strong>Your selection:</strong> Review your answer and the feedback below.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.div
            key={option.id}
            {...getOptionAnimation(index)}
            onClick={() => handleOptionSelect(option.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${getOptionColor(option)} ${
              hasAnswered || disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">
                {getOptionIcon(option)}
              </span>
              <span className="flex-1">{option.text}</span>
              
              {/* 🎯 Enhanced option indicators */}
              {selectedOption === option.id && hasAnswered && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  Your Answer
                </span>
              )}
              
              {option.level && option.level !== question.level && (
                <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  Partial Credit: Level {option.level}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🎯 Enhanced Progress Indicator */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 px-2 py-1 rounded">Level {question.level}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{question.points || question.level} points</span>
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
            {question.concept}
          </span>
        </div>
        
        {hasAnswered && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              ✅ Answered
            </span>
          </div>
        )}
      </div>

      {/* 🎯 Learning Path Indicator - Enhanced */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            📚 <strong>Path:</strong> {question.learningPath}
          </span>
          <span className="flex items-center gap-1">
            🎯 <strong>Strand:</strong> {question.strand}
          </span>
          {question.keywords && question.keywords.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="flex items-center gap-1">
                🏷️ <strong>Keywords:</strong>
              </span>
              {question.keywords.slice(0, 3).map((keyword, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                  {keyword}
                </span>
              ))}
              {question.keywords.length > 3 && (
                <span className="text-gray-500">+{question.keywords.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🎯 Question Type Help - Only show before answering */}
      {!hasAnswered && !disabled && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h6 className="font-semibold text-green-800 mb-1 flex items-center gap-2">
            <span>💡</span>
            Multiple Choice Tips:
          </h6>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Read all options carefully before selecting</li>
            <li>• Look for key scientific terms and concepts</li>
            <li>• Eliminate obviously incorrect answers first</li>
            <li>• Consider the specific level and context of the question</li>
          </ul>
        </div>
      )}

      {/* 🎯 Accessibility Enhancement */}
      <div className="sr-only" aria-live="polite">
        {hasAnswered && (
          <span>
            Multiple choice question answered. Selected option: {
              question.options.find(opt => opt.id === selectedOption)?.text || 'Unknown'
            }
          </span>
        )}
      </div>
    </div>
  );
};

export default MCQComponent;