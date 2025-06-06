// src/components/questions/MatchClickComponent.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MatchClickQuestion, QuestionResponse } from '../../types/questionBlock';

interface MatchClickComponentProps {
  question: MatchClickQuestion;
  onAnswer: (response: QuestionResponse) => void;
  showFeedback: boolean;
}

const MatchClickComponent: React.FC<MatchClickComponentProps> = ({
  question,
  onAnswer,
  showFeedback
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [results, setResults] = useState<{ leftId: string; rightId: string; isCorrect: boolean }[]>([]);

  const handleLeftClick = (leftId: string) => {
    if (hasAnswered) return;
    
    // If already matched, don't allow reselection
    if (matches.some(match => match.leftId === leftId)) return;
    
    setSelectedLeft(leftId);
    setSelectedRight(null); // Reset right selection
  };

  const handleRightClick = (rightId: string) => {
    if (hasAnswered || !selectedLeft) return;
    
    // If already matched, don't allow reselection  
    if (matches.some(match => match.rightId === rightId)) return;
    
    setSelectedRight(rightId);
    
    // Create match
    const newMatch = { leftId: selectedLeft, rightId };
    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    
    // Reset selections
    setSelectedLeft(null);
    setSelectedRight(null);
    
    // Check if all items are matched
    if (updatedMatches.length === question.leftItems.length) {
      handleSubmit(updatedMatches);
    }
  };

  const handleSubmit = (finalMatches: { leftId: string; rightId: string }[]) => {
    if (hasAnswered) return;
    
    setHasAnswered(true);
    
    // Evaluate matches
    const matchResults = finalMatches.map(match => {
      const isCorrect = question.correctMatches.some(
        correct => correct.leftId === match.leftId && correct.rightId === match.rightId
      );
      return { ...match, isCorrect };
    });
    
    setResults(matchResults);
    
    // Calculate score
    const correctCount = matchResults.filter(r => r.isCorrect).length;
    const percentage = correctCount / question.correctMatches.length;
    
    let score = 0;
    if (percentage >= 0.9) score = question.level;
    else if (percentage >= 0.7) score = Math.max(question.level - 1, 0);
    else if (percentage >= 0.5) score = Math.max(question.level - 2, 0);
    else if (percentage >= 0.3) score = Math.max(question.level - 3, 0);
    
    const isCorrect = percentage >= 0.7;
    
    const response: QuestionResponse = {
      questionId: question.id,
      type: 'match-click',
      answer: finalMatches,
      isCorrect,
      score,
      feedback: isCorrect 
        ? `Excellent matching! ${question.explanation}`
        : `Good attempt. ${question.explanation}`,
      timestamp: new Date()
    };

    onAnswer(response);
  };

  const handleReset = () => {
    setMatches([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setResults([]);
    setHasAnswered(false);
  };

  const isLeftMatched = (leftId: string) => 
    matches.some(match => match.leftId === leftId);
  
  const isRightMatched = (rightId: string) => 
    matches.some(match => match.rightId === rightId);

  const getMatchResult = (leftId: string, rightId: string) => 
    results.find(r => r.leftId === leftId && r.rightId === rightId);

  const getItemStyle = (itemId: string, side: 'left' | 'right', isMatched: boolean) => {
    let baseClass = 'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ';
    
    if (hasAnswered) {
      if (side === 'left') {
        const match = matches.find(m => m.leftId === itemId);
        if (match) {
          const result = getMatchResult(itemId, match.rightId);
          baseClass += result?.isCorrect 
            ? 'bg-green-100 border-green-500 text-green-700'
            : 'bg-red-100 border-red-500 text-red-700';
        } else {
          baseClass += 'bg-gray-100 border-gray-300 text-gray-600';
        }
      } else {
        const match = matches.find(m => m.rightId === itemId);
        if (match) {
          const result = getMatchResult(match.leftId, itemId);
          baseClass += result?.isCorrect 
            ? 'bg-green-100 border-green-500 text-green-700'
            : 'bg-red-100 border-red-500 text-red-700';
        } else {
          baseClass += 'bg-gray-100 border-gray-300 text-gray-600';
        }
      }
      baseClass += ' cursor-not-allowed';
    } else if (isMatched) {
      baseClass += 'bg-purple-100 border-purple-500 text-purple-700 cursor-not-allowed';
    } else if (
      (side === 'left' && selectedLeft === itemId) ||
      (side === 'right' && selectedRight === itemId)
    ) {
      baseClass += 'bg-purple-200 border-purple-600 text-purple-800 transform scale-105';
    } else {
      baseClass += 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50 transform hover:scale-105';
    }
    
    return baseClass;
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question}
      </h4>
      
      <p className="text-sm text-gray-600 mb-4">
        Click items on the left, then click their match on the right to connect them.
      </p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div>
          <h5 className="font-medium text-gray-700 mb-3 text-center">Click to Select</h5>
          <div className="space-y-3">
            {question.leftItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleLeftClick(item.id)}
                className={getItemStyle(item.id, 'left', isLeftMatched(item.id))}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {isLeftMatched(item.id) ? '🔗' : selectedLeft === item.id ? '👆' : '○'}
                  </span>
                  {item.image && (
                    <img src={item.image} alt="" className="w-8 h-8 object-cover rounded" />
                  )}
                  <span className="flex-1">{item.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h5 className="font-medium text-gray-700 mb-3 text-center">Then Click to Match</h5>
          <div className="space-y-3">
            {question.rightItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleRightClick(item.id)}
                className={getItemStyle(item.id, 'right', isRightMatched(item.id))}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {isRightMatched(item.id) ? '🔗' : selectedRight === item.id ? '👆' : '○'}
                  </span>
                  {item.image && (
                    <img src={item.image} alt="" className="w-8 h-8 object-cover rounded" />
                  )}
                  <span className="flex-1">{item.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Matches Display */}
      {matches.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-700 mb-2">Current Matches:</h5>
          <div className="space-y-1">
            {matches.map((match, index) => {
              const leftItem = question.leftItems.find(item => item.id === match.leftId);
              const rightItem = question.rightItems.find(item => item.id === match.rightId);
              const result = getMatchResult(match.leftId, match.rightId);
              
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span>{leftItem?.text}</span>
                  <span className="text-purple-500">↔</span>
                  <span>{rightItem?.text}</span>
                  {showFeedback && result && (
                    <span className="ml-2">
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      {!hasAnswered && matches.length > 0 && matches.length < question.leftItems.length && (
        <div className="flex justify-center gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Reset Matches
          </motion.button>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && hasAnswered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          {/* Correct matches */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <h5 className="font-semibold text-blue-800 mb-2">💡 Correct Matches:</h5>
            <div className="space-y-1">
              {question.correctMatches.map((match, index) => {
                const leftItem = question.leftItems.find(item => item.id === match.leftId);
                const rightItem = question.rightItems.find(item => item.id === match.rightId);
                
                return (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-700">
                    <span>{leftItem?.text}</span>
                    <span className="text-blue-500">↔</span>
                    <span>{rightItem?.text}</span>
                  </div>
                );
              })}
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

export default MatchClickComponent;