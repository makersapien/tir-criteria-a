// src/components/questions/ShortAnswerComponent.tsx - Enhanced for better feedback integration
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShortAnswerQuestion } from '../../types/questionBlock';
import { evaluateStrand } from '../../utils/evaluateStrand';

interface ShortAnswerComponentProps {
  question: ShortAnswerQuestion;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  showFeedback?: boolean;
  disabled?: boolean; // 🎯 NEW: Disable during feedback display
}

const ShortAnswerComponent: React.FC<ShortAnswerComponentProps> = ({
  question,
  onAnswer,
  showFeedback = false, // 🎯 Default to false - QuestionBlock handles feedback
  disabled = false
}) => {
  const [answer, setAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  const handleSubmit = async () => {
    if (hasAnswered || !answer.trim() || !isValidLength() || isEvaluating || disabled) return;
    
    setHasAnswered(true);
    setIsEvaluating(true);
    
    // 🎯 Enhanced evaluation with better error handling
    try {
      const evaluationResult = await evaluateStrand(answer, 'critical-angle', 'strand1');
      
      // Calculate score based on evaluation level
      const score = Math.min(8, evaluationResult.level);
      const isCorrect = score >= Math.max(question.level - 2, 4); // Accept answers within 2 levels
      
      // 🎯 Call answer handler immediately - QuestionBlock will manage feedback timing
      onAnswer(question.id, answer, isCorrect, score);
      
    } catch (error) {
      console.error('Evaluation error:', error);
      
      // 🎯 Enhanced fallback evaluation with better scoring
      const basicScore = calculateEnhancedBasicScore(answer);
      const isCorrect = basicScore >= Math.max(question.level - 2, 4);
      
      // 🎯 Call answer handler with fallback score
      onAnswer(question.id, answer, isCorrect, basicScore);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 🎯 Enhanced basic scoring algorithm
  const calculateEnhancedBasicScore = (text: string): number => {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    // Check for required keywords (weighted more heavily)
    const foundKeywords = question.evaluationCriteria.requiredKeywords.filter(
      keyword => lowerText.includes(keyword.toLowerCase())
    );
    
    // Check for required concepts
    const foundConcepts = question.evaluationCriteria.requiredConcepts.filter(
      concept => lowerText.includes(concept.toLowerCase())
    );
    
    // Word count factor
    const wordCount = text.trim().split(/\s+/).length;
    const hasMinWords = !question.minWords || wordCount >= question.minWords;
    const withinMaxWords = !question.maxWords || wordCount <= question.maxWords;
    
    // Enhanced scoring algorithm
    const keywordPercentage = foundKeywords.length / Math.max(question.evaluationCriteria.requiredKeywords.length, 1);
    const conceptPercentage = foundConcepts.length / Math.max(question.evaluationCriteria.requiredConcepts.length, 1);
    
    // Base scoring
    const keywordScore = keywordPercentage * 4; // Up to 4 points for keywords
    const conceptScore = conceptPercentage * 3; // Up to 3 points for concepts
    const lengthScore = (hasMinWords && withinMaxWords) ? 1 : 0; // 1 point for proper length
    
    // Bonus for comprehensive answers
    if (keywordPercentage > 0.8 && conceptPercentage > 0.8) {
      score += 0.5; // Bonus for comprehensive coverage
    }
    
    score = keywordScore + conceptScore + lengthScore;
    
    // Quality indicators
    if (wordCount > (question.minWords || 20) * 1.5) {
      score += 0.5; // Bonus for detailed responses
    }
    
    return Math.min(8, Math.round(score * 10) / 10); // Round to 1 decimal place
  };

  const getWordCountColor = () => {
    if (question.minWords && wordCount < question.minWords) return 'text-red-500';
    if (question.maxWords && wordCount > question.maxWords) return 'text-red-500';
    if (wordCount > 0) return 'text-green-500';
    return 'text-gray-500';
  };

  const isValidLength = () => {
    if (question.minWords && wordCount < question.minWords) return false;
    if (question.maxWords && wordCount > question.maxWords) return false;
    return true;
  };

  const getSubmitButtonText = () => {
    if (isEvaluating) return '🔄 Evaluating...';
    if (!answer.trim()) return 'Enter your answer';
    if (!isValidLength()) {
      if (question.minWords && wordCount < question.minWords) {
        return `Need ${question.minWords - wordCount} more words`;
      }
      if (question.maxWords && wordCount > question.maxWords) {
        return `Remove ${wordCount - question.maxWords} words`;
      }
    }
    return 'Submit Answer';
  };

  // 🎯 Get placeholder text based on question level
  const getPlaceholderText = () => {
    const basePlaceholder = "Type your answer here...";
    if (question.level >= 6) {
      return `${basePlaceholder} Use detailed explanations and scientific terminology.`;
    } else if (question.level >= 4) {
      return `${basePlaceholder} Include key concepts and examples.`;
    }
    return `${basePlaceholder} Be clear and concise.`;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question}
      </h4>

      {/* 🎯 Enhanced instruction panel */}
      {!hasAnswered && !disabled && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h6 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <span>📝</span>
            Writing Guidelines:
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p className="font-medium mb-1">Include Key Terms:</p>
              <div className="flex flex-wrap gap-1">
                {question.evaluationCriteria.requiredKeywords.slice(0, 4).map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    {keyword}
                  </span>
                ))}
                {question.evaluationCriteria.requiredKeywords.length > 4 && (
                  <span className="text-blue-600 text-xs">+{question.evaluationCriteria.requiredKeywords.length - 4} more</span>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium mb-1">Address Concepts:</p>
              <div className="flex flex-wrap gap-1">
                {question.evaluationCriteria.requiredConcepts.slice(0, 3).map((concept, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">
                    {concept}
                  </span>
                ))}
                {question.evaluationCriteria.requiredConcepts.length > 3 && (
                  <span className="text-purple-600 text-xs">+{question.evaluationCriteria.requiredConcepts.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Word count requirements */}
      {(question.minWords || question.maxWords) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              📏 <strong>Word requirement:</strong>
              {question.minWords && ` At least ${question.minWords} words`}
              {question.minWords && question.maxWords && ` • `}
              {question.maxWords && ` Maximum ${question.maxWords} words`}
            </div>
            <div className="text-sm">
              Current: <span className={`font-medium ${getWordCountColor()}`}>{wordCount}</span>
              {!isValidLength() && (
                <span className="ml-2 text-red-500 text-xs">
                  {question.minWords && wordCount < question.minWords && `(need ${question.minWords - wordCount} more)`}
                  {question.maxWords && wordCount > question.maxWords && `(${wordCount - question.maxWords} over limit)`}
                </span>
              )}
            </div>
          </div>
          {/* Progress bar for word count */}
          {question.minWords && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  wordCount >= question.minWords ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (wordCount / question.minWords) * 100)}%` 
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 🎯 Feedback state indicator */}
      {disabled && hasAnswered && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700 flex items-center gap-2">
            📝 <strong>Your response:</strong> Review your answer and the feedback below.
          </p>
        </div>
      )}

      {/* 🎯 Enhanced Text Area */}
      <div className="mb-4">
        <textarea
          value={answer}
          onChange={(e) => !hasAnswered && !disabled && setAnswer(e.target.value)}
          disabled={hasAnswered || disabled}
          placeholder={getPlaceholderText()}
          className={`w-full h-40 p-4 border-2 rounded-lg resize-none focus:outline-none transition-all duration-200 ${
            hasAnswered || disabled
              ? 'bg-gray-100 cursor-not-allowed border-gray-300'
              : 'border-gray-300 focus:border-purple-500 hover:border-purple-300'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey && !hasAnswered && !disabled && answer.trim() && isValidLength()) {
              handleSubmit();
            }
          }}
        />
        
        {/* Word count and keyboard shortcut */}
        <div className="flex justify-between items-center mt-2 text-sm">
          <div className="flex items-center gap-4">
            <span className={getWordCountColor()}>
              {wordCount} words
            </span>
            
            {!hasAnswered && !disabled && answer.trim() && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Ctrl+Enter to submit
              </span>
            )}
          </div>
          
          {hasAnswered && (
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
              ✅ Submitted
            </span>
          )}
        </div>
      </div>

      {/* 🎯 Submit Button */}
      {!hasAnswered && !disabled && (
        <div className="flex justify-center mb-4">
          <motion.button
            whileHover={{ scale: (answer.trim() && isValidLength() && !isEvaluating) ? 1.05 : 1 }}
            whileTap={{ scale: (answer.trim() && isValidLength() && !isEvaluating) ? 0.95 : 1 }}
            onClick={handleSubmit}
            disabled={!answer.trim() || !isValidLength() || isEvaluating}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 shadow-lg ${
              answer.trim() && isValidLength() && !isEvaluating
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isEvaluating && <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />}
            <span>{getSubmitButtonText()}</span>
            {answer.trim() && isValidLength() && !isEvaluating && (
              <span className="text-purple-200">📤</span>
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

      {/* 🎯 Writing Tips - Only show before answering */}
      {!hasAnswered && !disabled && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h6 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <span>💡</span>
            Short Answer Tips:
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <ul className="space-y-1">
              <li>• Use specific scientific terminology</li>
              <li>• Provide clear explanations and examples</li>
              <li>• Address all parts of the question</li>
            </ul>
            <ul className="space-y-1">
              <li>• Support your points with evidence</li>
              <li>• Be concise but comprehensive</li>
              <li>• Check spelling and grammar</li>
            </ul>
          </div>
        </div>
      )}

      {/* 🎯 Accessibility Enhancement */}
      <div className="sr-only" aria-live="polite">
        {hasAnswered && (
          <span>
            Short answer question submitted with {wordCount} words.
          </span>
        )}
        {isEvaluating && (
          <span>
            Evaluating your response, please wait.
          </span>
        )}
      </div>
    </div>
  );
};

export default ShortAnswerComponent;