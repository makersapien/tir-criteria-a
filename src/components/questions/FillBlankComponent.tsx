// src/components/questions/FillBlankComponent.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FillBlankQuestion, QuestionResponse } from '../../types/questionBlock';

interface FillBlankComponentProps {
  question: FillBlankQuestion;
  onAnswer: (response: QuestionResponse) => void;
  showFeedback: boolean;
}

const FillBlankComponent: React.FC<FillBlankComponentProps> = ({
  question,
  onAnswer,
  showFeedback
}) => {
  const [answers, setAnswers] = useState<{ [blankId: string]: string }>({});
  const [hasAnswered, setHasAnswered] = useState(false);
  const [results, setResults] = useState<{ [blankId: string]: boolean }>({});

  // Initialize empty answers
  useEffect(() => {
    const initialAnswers: { [blankId: string]: string } = {};
    question.blanks.forEach(blank => {
      initialAnswers[blank.id] = '';
    });
    setAnswers(initialAnswers);
  }, [question]);

  const handleInputChange = (blankId: string, value: string) => {
    if (hasAnswered) return;
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    if (hasAnswered) return;
    
    setHasAnswered(true);
    
    // Evaluate each blank
    const blankResults: { [blankId: string]: boolean } = {};
    let correctCount = 0;
    
    question.blanks.forEach(blank => {
      const userAnswer = answers[blank.id]?.trim().toLowerCase() || '';
      const isCorrect = blank.correctAnswers.some(correct => 
        blank.caseSensitive 
          ? correct === answers[blank.id]?.trim()
          : correct.toLowerCase() === userAnswer
      );
      
      blankResults[blank.id] = isCorrect;
      if (isCorrect) correctCount++;
    });
    
    setResults(blankResults);
    
    // Calculate score based on percentage correct
    const percentage = correctCount / question.blanks.length;
    let score = 0;
    if (percentage >= 0.9) score = question.level;
    else if (percentage >= 0.7) score = Math.max(question.level - 1, 0);
    else if (percentage >= 0.5) score = Math.max(question.level - 2, 0);
    else if (percentage >= 0.3) score = Math.max(question.level - 3, 0);
    
    const isCorrect = percentage >= 0.7; // 70% threshold for "correct"
    
    const response: QuestionResponse = {
      questionId: question.id,
      type: 'fill-blank',
      answer: Object.values(answers),
      isCorrect,
      score,
      feedback: isCorrect 
        ? `Great work! ${question.explanation}`
        : `Good effort. ${question.explanation}`,
      timestamp: new Date()
    };

    onAnswer(response);
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
        const isCorrect = results[blank.id];
        const showResult = showFeedback && hasAnswered;
        
        let inputClass = 'mx-2 px-3 py-1 border-b-2 bg-transparent focus:outline-none focus:border-purple-500 min-w-[100px] text-center font-medium';
        
        if (showResult) {
          inputClass += isCorrect 
            ? ' border-green-500 bg-green-50 text-green-700'
            : ' border-red-500 bg-red-50 text-red-700';
        } else {
          inputClass += ' border-gray-400';
        }

        elements.push(
          <div key={`blank-${blankIndex}`} className="inline-block relative">
            <input
              type="text"
              value={answers[blank.id] || ''}
              onChange={(e) => handleInputChange(blank.id, e.target.value)}
              disabled={hasAnswered}
              className={inputClass}
              placeholder="___"
            />
            {showResult && (
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                {isCorrect ? '✅' : '❌'}
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

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        Fill in the blanks:
      </h4>

      <div className="text-lg leading-relaxed mb-6 p-4 bg-gray-50 rounded-lg">
        {renderTextWithBlanks()}
      </div>

      {!hasAnswered && (
        <div className="flex justify-center mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!allFieldsFilled}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              allFieldsFilled
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Answers
          </motion.button>
        </div>
      )}

      {showFeedback && hasAnswered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          {/* Correct answers */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <h5 className="font-semibold text-blue-800 mb-2">💡 Correct Answers:</h5>
            <div className="space-y-2">
              {question.blanks.map((blank, index) => (
                <div key={blank.id} className="text-sm">
                  <span className="text-blue-700 font-medium">Blank {index + 1}: </span>
                  <span className="text-blue-600">
                    {blank.correctAnswers.join(' or ')}
                  </span>
                  {blank.hints && (
                    <div className="text-xs text-blue-500 mt-1 ml-4">
                      Hint: {blank.hints.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-green-500 text-lg">✨</span>
              <div>
                <h5 className="font-semibold text-green-800 mb-1">Explanation:</h5>
                <p className="text-green-700 text-sm">{question.explanation}</p>
              </div>
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

export default FillBlankComponent;