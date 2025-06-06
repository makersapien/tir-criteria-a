// src/components/questions/MCQComponent.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MCQQuestion, QuestionResponse } from '../../types/questionBlock';

interface MCQComponentProps {
  question: MCQQuestion;
  onAnswer: (response: QuestionResponse) => void;
  showFeedback: boolean;
}

const MCQComponent: React.FC<MCQComponentProps> = ({
  question,
  onAnswer,
  showFeedback
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    if (hasAnswered) return;
    
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

    const response: QuestionResponse = {
      questionId: question.id,
      type: 'mcq',
      answer: optionId,
      isCorrect,
      score,
      feedback: isCorrect 
        ? `Excellent! ${question.explanation}`
        : `Not quite. ${question.explanation}`,
      timestamp: new Date()
    };

    onAnswer(response);
  };

  const getOptionColor = (option: any) => {
    if (!showFeedback) {
      return selectedOption === option.id 
        ? 'bg-purple-100 border-purple-500 text-purple-700'
        : 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50';
    }

    if (option.isCorrect) {
      return 'bg-green-100 border-green-500 text-green-700';
    }
    
    if (selectedOption === option.id && !option.isCorrect) {
      return 'bg-red-100 border-red-500 text-red-700';
    }

    return 'bg-gray-100 border-gray-300 text-gray-600';
  };

  const getOptionIcon = (option: any) => {
    if (!showFeedback) {
      return selectedOption === option.id ? '●' : '○';
    }

    if (option.isCorrect) return '✅';
    if (selectedOption === option.id && !option.isCorrect) return '❌';
    return '○';
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question}
      </h4>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleOptionSelect(option.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getOptionColor(option)} ${
              hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer transform hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">
                {getOptionIcon(option)}
              </span>
              <span className="flex-1">{option.text}</span>
              {showFeedback && option.level && !option.isCorrect && (
                <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  Level {option.level}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <span className="text-blue-500 text-lg">💡</span>
            <div>
              <h5 className="font-semibold text-blue-800 mb-1">Explanation:</h5>
              <p className="text-blue-700 text-sm">{question.explanation}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>Level {question.level} • {question.points} points</span>
        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {question.concept}
        </span>
      </div>
    </div>
  );
};

export default MCQComponent;