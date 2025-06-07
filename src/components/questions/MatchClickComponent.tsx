// src/components/questions/MatchClickComponent.tsx - Enhanced for YourResponseSection
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MatchClickQuestion } from '../../types/questionBlock';

interface MatchClickComponentProps {
  question: MatchClickQuestion;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void; // ✅ Fixed signature
  showFeedback?: boolean;
}

const MatchClickComponent: React.FC<MatchClickComponentProps> = ({
  question,
  onAnswer,
  showFeedback = true
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [results, setResults] = useState<{ leftId: string; rightId: string; isCorrect: boolean }[]>([]);
  const [feedback, setFeedback] = useState<string>('');

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
    
    const feedbackText = isCorrect 
      ? `Excellent matching! ${question.explanation}`
      : `Good attempt. ${question.explanation}`;
    
    setFeedback(feedbackText);

    // ✅ Call with correct signature
    onAnswer(question.id, finalMatches, isCorrect, score);
  };

  const handleReset = () => {
    if (hasAnswered) return;
    setMatches([]);
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleSubmitNow = () => {
    if (matches.length > 0) {
      handleSubmit(matches);
    }
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
      baseClass += 'bg-purple-200 border-purple-600 text-purple-800 transform scale-105 shadow-md';
    } else {
      baseClass += 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50 transform hover:scale-105';
    }
    
    return baseClass;
  };

  const getItemIcon = (itemId: string, side: 'left' | 'right', isMatched: boolean) => {
    if (hasAnswered) {
      if (side === 'left') {
        const match = matches.find(m => m.leftId === itemId);
        if (match) {
          const result = getMatchResult(itemId, match.rightId);
          return result?.isCorrect ? '✅' : '❌';
        }
        return '○';
      } else {
        const match = matches.find(m => m.rightId === itemId);
        if (match) {
          const result = getMatchResult(match.leftId, itemId);
          return result?.isCorrect ? '✅' : '❌';
        }
        return '○';
      }
    }
    
    if (isMatched) return '🔗';
    if ((side === 'left' && selectedLeft === itemId) || (side === 'right' && selectedRight === itemId)) return '👆';
    return '○';
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question}
      </h4>
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-sm text-blue-700 flex items-center gap-2">
          🎯 <strong>Instructions:</strong> Click items on the left, then click their match on the right to connect them.
          {selectedLeft && (
            <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
              Now click a match on the right →
            </span>
          )}
        </p>
      </div>

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
                  <span className="flex-1">{item.text}</span>
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
                  <span className="flex-1">{item.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Matches Display */}
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
              const result = getMatchResult(match.leftId, match.rightId);
              
              return (
                <div key={index} className={`flex items-center gap-2 text-sm p-2 rounded ${
                  showFeedback && result 
                    ? result.isCorrect 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                    : 'bg-white border border-gray-200'
                }`}>
                  <span className="truncate max-w-[120px]">{leftItem?.text}</span>
                  <span className="text-purple-500">↔</span>
                  <span className="truncate max-w-[120px]">{rightItem?.text}</span>
                  {showFeedback && result && (
                    <span className="ml-auto">
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
      {!hasAnswered && (
        <div className="flex justify-center gap-3 mb-4">
          {matches.length > 0 && matches.length < question.leftItems.length && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                🔄 Reset All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitNow}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                📤 Submit Now ({matches.length}/{question.leftItems.length})
              </motion.button>
            </>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      {!hasAnswered && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(matches.length / question.leftItems.length) * 100}%` }}
          />
        </div>
      )}

      {/* Feedback */}
      {showFeedback && hasAnswered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-4"
        >
          {/* Results Summary */}
          <div className={`p-4 rounded-lg border ${
            results.filter(r => r.isCorrect).length / question.correctMatches.length >= 0.7
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h5 className="font-semibold mb-2 flex items-center gap-2">
              📊 Results: {results.filter(r => r.isCorrect).length}/{question.correctMatches.length} correct
              <span className="text-sm text-gray-600">
                ({Math.round((results.filter(r => r.isCorrect).length / question.correctMatches.length) * 100)}%)
              </span>
            </h5>
          </div>

          {/* Correct matches */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-3">💡 Correct Matches:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {question.correctMatches.map((match, index) => {
                const leftItem = question.leftItems.find(item => item.id === match.leftId);
                const rightItem = question.rightItems.find(item => item.id === match.rightId);
                
                return (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-700 p-2 bg-white rounded border border-blue-200">
                    <span className="truncate max-w-[120px]">{leftItem?.text}</span>
                    <span className="text-blue-500">↔</span>
                    <span className="truncate max-w-[120px]">{rightItem?.text}</span>
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

      {/* Enhanced Progress Indicator */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <span>Level {question.level}</span>
          <span>•</span>
          <span>{question.points} points</span>
          <span>•</span>
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {question.concept}
          </span>
        </div>
        
        {hasAnswered && (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              results.filter(r => r.isCorrect).length / question.correctMatches.length >= 0.7
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {results.filter(r => r.isCorrect).length}/{question.correctMatches.length} matches
            </span>
          </div>
        )}
      </div>

      {/* Learning Path Indicator */}
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <span>📚 Learning Path: {question.learningPath}</span>
        <span>•</span>
        <span>🎯 Strand: {question.strand}</span>
        {question.keywords && question.keywords.length > 0 && (
          <>
            <span>•</span>
            <span>🏷️ Keywords: {question.keywords.join(', ')}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchClickComponent;