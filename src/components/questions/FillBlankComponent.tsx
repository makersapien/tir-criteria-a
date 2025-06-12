// src/components/questions/FillBlankComponent.tsx - Enhanced for better feedback integration
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FillBlankQuestion } from '../../types/questionBlock';

interface FillBlankComponentProps {
  question: FillBlankQuestion;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  showFeedback?: boolean;
  disabled?: boolean; // 🎯 NEW: Disable during feedback display
}

const FillBlankComponent: React.FC<FillBlankComponentProps> = ({
  question,
  onAnswer,
  showFeedback = false, // 🎯 Default to false - QuestionBlock handles feedback
  disabled = false
}) => {
  const [answers, setAnswers] = useState<{ [blankId: string]: string }>({});
  const [hasAnswered, setHasAnswered] = useState(false);

  // Initialize empty answers
  useEffect(() => {
    const initialAnswers: { [blankId: string]: string } = {};
    question.blanks.forEach(blank => {
      initialAnswers[blank.id] = '';
    });
    setAnswers(initialAnswers);
  }, [question]);

  const handleInputChange = (blankId: string, value: string) => {
    if (hasAnswered || disabled) return;
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    if (hasAnswered || disabled) return;
    
    setHasAnswered(true);
    
    // Evaluate each blank
    let correctCount = 0;
    
    question.blanks.forEach(blank => {
      const userAnswer = answers[blank.id]?.trim().toLowerCase() || '';
      const isCorrect = blank.correctAnswers.some(correct => 
        blank.caseSensitive 
          ? correct === answers[blank.id]?.trim()
          : correct.toLowerCase() === userAnswer
      );
      
      if (isCorrect) correctCount++;
    });
    
    // Calculate score based on percentage correct
    const percentage = correctCount / question.blanks.length;
    let score = 0;
    if (percentage >= 0.9) score = question.level;
    else if (percentage >= 0.7) score = Math.max(question.level - 1, 0);
    else if (percentage >= 0.5) score = Math.max(question.level - 2, 0);
    else if (percentage >= 0.3) score = Math.max(question.level - 3, 0);
    
    const isCorrect = percentage >= 0.7; // 70% threshold for "correct"

    // 🎯 Call answer handler immediately - QuestionBlock will manage feedback timing
    onAnswer(question.id, answers, isCorrect, score);
  };

  // 🎯 Enhanced input styling for better visual feedback
  const getInputStyle = (blankId: string) => {
    let baseClass = 'mx-2 px-3 py-2 border-2 bg-white focus:outline-none min-w-[120px] text-center font-medium transition-all duration-200 rounded-lg';
    
    if (disabled && hasAnswered) {
      // Show current answer state during feedback review
      baseClass += ' border-purple-500 bg-purple-50 text-purple-800';
    } else if (hasAnswered) {
      baseClass += ' border-gray-400 bg-gray-100 text-gray-600 cursor-not-allowed';
    } else {
      baseClass += ' border-gray-400 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200';
    }
    
    return baseClass;
  };

  // Split text and create input fields
  const renderTextWithBlanks = () => {
    const parts = question.text.split(/{blank}/g);
    const elements: React.ReactNode[] = [];
    let blankIndex = 0;

    parts.forEach((part, index) => {
      // Add text part
      if (part) {
        elements.push(
          <span key={`text-${index}`} className="text-gray-800">
            {part}
          </span>
        );
      }

      // Add blank input (except after the last part)
      if (index < parts.length - 1 && blankIndex < question.blanks.length) {
        const blank = question.blanks[blankIndex];
        
        elements.push(
          <div key={`blank-${blankIndex}`} className="inline-block relative">
            <input
              type="text"
              value={answers[blank.id] || ''}
              onChange={(e) => handleInputChange(blank.id, e.target.value)}
              disabled={hasAnswered || disabled}
              className={getInputStyle(blank.id)}
              placeholder={`Blank ${blankIndex + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !hasAnswered && !disabled && allFieldsFilled) {
                  handleSubmit();
                }
              }}
            />
            {/* 🎯 Enhanced blank indicator */}
            {disabled && hasAnswered && (
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                Your Answer
              </span>
            )}
          </div>
        );
        blankIndex++;
      }
    });

    return elements;
  };

  const allFieldsFilled = question.blanks.every(blank => 
    answers[blank.id]?.trim().length > 0
  );

  const getFilledCount = () => {
    return question.blanks.filter(blank => answers[blank.id]?.trim().length > 0).length;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        Fill in the blanks:
      </h4>

      {/* 🎯 Enhanced instruction panel */}
      {!hasAnswered && !disabled && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              🎯 <strong>Instructions:</strong> Complete each blank with the appropriate term or phrase.
            </p>
            <div className="text-sm text-blue-600 bg-white px-3 py-1 rounded-full">
              {getFilledCount()}/{question.blanks.length} completed
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Feedback state indicator */}
      {disabled && hasAnswered && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700 flex items-center gap-2">
            📝 <strong>Your answers:</strong> Review your responses and the feedback below.
          </p>
        </div>
      )}

      {/* 🎯 Enhanced text with blanks */}
      <div className="text-lg leading-relaxed mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
        {renderTextWithBlanks()}
      </div>

      {/* 🎯 Hints section - Enhanced */}
      {question.blanks.some(blank => blank.hints && blank.hints.length > 0) && !hasAnswered && !disabled && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <h5 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            💡 Hints:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.blanks.map((blank, index) => (
              blank.hints && blank.hints.length > 0 && (
                <div key={blank.id} className="text-sm">
                  <span className="font-medium text-yellow-700">Blank {index + 1}: </span>
                  <span className="text-yellow-600">{blank.hints.join(', ')}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* 🎯 Progress indicator */}
      {!hasAnswered && !disabled && (
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{getFilledCount()}/{question.blanks.length} blanks filled</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getFilledCount() / question.blanks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 🎯 Submit Button */}
      {!hasAnswered && !disabled && (
        <div className="flex justify-center mb-4">
          <motion.button
            whileHover={{ scale: allFieldsFilled ? 1.05 : 1 }}
            whileTap={{ scale: allFieldsFilled ? 0.95 : 1 }}
            onClick={handleSubmit}
            disabled={!allFieldsFilled}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg ${
              allFieldsFilled
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allFieldsFilled ? (
              <span className="flex items-center gap-2">
                Submit Answers <span>📤</span>
              </span>
            ) : (
              `Fill all ${question.blanks.length} blanks`
            )}
          </motion.button>
        </div>
      )}

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

      {/* 🎯 Fill-in-blank Tips - Only show before answering */}
      {!hasAnswered && !disabled && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h6 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <span>💡</span>
            Fill-in-the-Blank Tips:
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <ul className="space-y-1">
              <li>• Read the entire sentence first</li>
              <li>• Consider the context and meaning</li>
              <li>• Use proper scientific terminology</li>
            </ul>
            <ul className="space-y-1">
              <li>• Check spelling and capitalization</li>
              <li>• Use hints when available</li>
              <li>• Press Enter to submit when ready</li>
            </ul>
          </div>
        </div>
      )}

      {/* 🎯 Accessibility Enhancement */}
      <div className="sr-only" aria-live="polite">
        {hasAnswered && (
          <span>
            Fill-in-the-blank question completed. {getFilledCount()} out of {question.blanks.length} blanks filled.
          </span>
        )}
      </div>
    </div>
  );
};

export default FillBlankComponent;