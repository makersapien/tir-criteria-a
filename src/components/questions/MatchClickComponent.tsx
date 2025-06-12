// src/components/questions/MatchClickComponent.tsx - Enhanced for better feedback integration
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MatchClickQuestion } from '../../types/questionBlock';

interface MatchClickComponentProps {
  question: MatchClickQuestion;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  showFeedback?: boolean;
  disabled?: boolean; // 🎯 NEW: Disable during feedback display
}

const MatchClickComponent: React.FC<MatchClickComponentProps> = ({
  question,
  onAnswer,
  showFeedback = false, // 🎯 Default to false - QuestionBlock handles feedback
  disabled = false
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleLeftClick = (leftId: string) => {
    if (hasAnswered || disabled) return;
    
    // If already matched, don't allow reselection
    if (matches.some(match => match.leftId === leftId)) return;
    
    setSelectedLeft(leftId);
    setSelectedRight(null); // Reset right selection
  };

  const handleRightClick = (rightId: string) => {
    if (hasAnswered || disabled || !selectedLeft) return;
    
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
    if (hasAnswered || disabled) return;
    
    setHasAnswered(true);
    
    // Evaluate matches
    const correctCount = finalMatches.filter(match =>
      question.correctMatches.some(
        correct => correct.leftId === match.leftId && correct.rightId === match.rightId
      )
    ).length;
    
    const percentage = correctCount / question.correctMatches.length;
    
    let score = 0;
    if (percentage >= 0.9) score = question.level;
    else if (percentage >= 0.7) score = Math.max(question.level - 1, 0);
    else if (percentage >= 0.5) score = Math.max(question.level - 2, 0);
    else if (percentage >= 0.3) score = Math.max(question.level - 3, 0);
    
    const isCorrect = percentage >= 0.7;

    // 🎯 Call answer handler immediately - QuestionBlock will manage feedback timing
    onAnswer(question.id, finalMatches, isCorrect, score);
  };

  const handleReset = () => {
    if (hasAnswered || disabled) return;
    setMatches([]);
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleSubmitNow = () => {
    if (matches.length > 0 && !hasAnswered && !disabled) {
      handleSubmit(matches);
    }
  };

  const isLeftMatched = (leftId: string) => 
    matches.some(match => match.leftId === leftId);
  
  const isRightMatched = (rightId: string) => 
    matches.some(match => match.rightId === rightId);

  // 🎯 Enhanced item styling for better visual feedback
  const getItemStyle = (itemId: string, side: 'left' | 'right', isMatched: boolean) => {
    let baseClass = 'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ';
    
    if (disabled && hasAnswered) {
      // Show current match state during feedback review
      baseClass += isMatched 
        ? 'bg-purple-100 border-purple-500 text-purple-700'
        : 'bg-gray-100 border-gray-300 text-gray-600';
      baseClass += ' cursor-not-allowed';
    } else if (hasAnswered) {
      baseClass += 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed';
    } else if (isMatched) {
      baseClass += 'bg-purple-100 border-purple-500 text-purple-700 cursor-not-allowed';
    } else if (
      (side === 'left' && selectedLeft === itemId) ||
      (side === 'right' && selectedRight === itemId)
    ) {
      baseClass += 'bg-purple-200 border-purple-600 text-purple-800 transform scale-105 shadow-lg ring-2 ring-purple-300';
    } else {
      baseClass += 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50 transform hover:scale-102';
    }
    
    return baseClass;
  };

  const getItemIcon = (itemId: string, side: 'left' | 'right', isMatched: boolean) => {
    if (disabled && hasAnswered) {
      // Show match state during feedback review
      return isMatched ? '🔗' : '○';
    }
    
    if (isMatched) return '🔗';
    if ((side === 'left' && selectedLeft === itemId) || (side === 'right' && selectedRight === itemId)) return '👆';
    return '○';
  };

  const getMatchedItemText = (itemId: string, side: 'left' | 'right') => {
    if (side === 'left') {
      const match = matches.find(m => m.leftId === itemId);
      const rightItem = question.rightItems.find(item => item.id === match?.rightId);
      return rightItem?.text;
    } else {
      const match = matches.find(m => m.rightId === itemId);
      const leftItem = question.leftItems.find(item => item.id === match?.leftId);
      return leftItem?.text;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question}
      </h4>
      
      {/* 🎯 Enhanced instruction panel */}
      {!hasAnswered && !disabled && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              🎯 <strong>Instructions:</strong> Click items on the left, then click their match on the right to connect them.
            </p>
            <div className="text-sm text-blue-600 bg-white px-3 py-1 rounded-full">
              {matches.length}/{question.leftItems.length} matched
            </div>
          </div>
          {selectedLeft && (
            <div className="mt-2 p-2 bg-white border border-blue-300 rounded text-sm text-blue-800">
              <span className="font-medium">Selected:</span> {question.leftItems.find(item => item.id === selectedLeft)?.text}
              <span className="ml-2 text-blue-600">→ Now click a match on the right</span>
            </div>
          )}
        </div>
      )}

      {/* 🎯 Feedback state indicator */}
      {disabled && hasAnswered && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700 flex items-center gap-2">
            📝 <strong>Your matches:</strong> Review your connections and the feedback below.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div>
          <h5 className="font-medium text-gray-700 mb-3 text-center bg-gray-100 py-2 rounded">
            🔍 Click to Select
          </h5>
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
                    {getItemIcon(item.id, 'left', isLeftMatched(item.id))}
                  </span>
                  {item.image && (
                    <img src={item.image} alt="" className="w-8 h-8 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{item.text}</div>
                    {isLeftMatched(item.id) && (
                      <div className="text-xs text-purple-600 mt-1">
                        → {getMatchedItemText(item.id, 'left')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h5 className="font-medium text-gray-700 mb-3 text-center bg-gray-100 py-2 rounded">
            🎯 Then Click to Match
          </h5>
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
                    {getItemIcon(item.id, 'right', isRightMatched(item.id))}
                  </span>
                  {item.image && (
                    <img src={item.image} alt="" className="w-8 h-8 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{item.text}</div>
                    {isRightMatched(item.id) && (
                      <div className="text-xs text-purple-600 mt-1">
                        ← {getMatchedItemText(item.id, 'right')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 🎯 Current Matches Display - Enhanced */}
      {matches.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            🔗 Current Matches 
            <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded">
              {matches.length}/{question.leftItems.length}
            </span>
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {matches.map((match, index) => {
              const leftItem = question.leftItems.find(item => item.id === match.leftId);
              const rightItem = question.rightItems.find(item => item.id === match.rightId);
              
              return (
                <div key={index} className="flex items-center gap-2 text-sm p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="truncate max-w-[120px] font-medium">{leftItem?.text}</span>
                  <span className="text-purple-500 text-lg">↔</span>
                  <span className="truncate max-w-[120px] font-medium">{rightItem?.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🎯 Progress indicator */}
      {!hasAnswered && !disabled && (
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>Matching Progress</span>
            <span>{matches.length}/{question.leftItems.length} pairs created</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(matches.length / question.leftItems.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 🎯 Control Buttons */}
      {!hasAnswered && !disabled && (
        <div className="flex justify-center gap-3 mb-4">
          {matches.length > 0 && matches.length < question.leftItems.length && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                🔄 Reset All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitNow}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                📤 Submit Now ({matches.length}/{question.leftItems.length})
              </motion.button>
            </>
          )}
          {matches.length === question.leftItems.length && (
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">🎉 All pairs matched! Submitting automatically...</p>
            </div>
          )}
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

      {/* 🎯 Matching Tips - Only show before answering */}
      {!hasAnswered && !disabled && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h6 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <span>💡</span>
            Matching Tips:
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <ul className="space-y-1">
              <li>• Read all options before matching</li>
              <li>• Look for key relationships and patterns</li>
              <li>• Consider scientific principles and concepts</li>
            </ul>
            <ul className="space-y-1">
              <li>• Start with matches you're most confident about</li>
              <li>• Use process of elimination</li>
              <li>• You can reset and try again if needed</li>
            </ul>
          </div>
        </div>
      )}

      {/* 🎯 Accessibility Enhancement */}
      <div className="sr-only" aria-live="polite">
        {selectedLeft && (
          <span>
            Selected {question.leftItems.find(item => item.id === selectedLeft)?.text}. Now select a match from the right column.
          </span>
        )}
        {hasAnswered && (
          <span>
            Matching question completed. {matches.length} out of {question.leftItems.length} pairs matched.
          </span>
        )}
      </div>
    </div>
  );
};

export default MatchClickComponent;