// src/components/questions/ShortAnswerComponent.tsx - Enhanced for YourResponseSection
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShortAnswerQuestion } from '../../types/questionBlock';
import { evaluateStrand } from '../../utils/evaluateStrand';

interface ShortAnswerComponentProps {
  question: ShortAnswerQuestion;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void; // ✅ Fixed signature
  showFeedback?: boolean;
}

const ShortAnswerComponent: React.FC<ShortAnswerComponentProps> = ({
  question,
  onAnswer,
  showFeedback = true
}) => {
  const [answer, setAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  const handleSubmit = async () => {
    if (hasAnswered || !answer.trim() || !isValidLength()) return;
    
    setHasAnswered(true);
    setIsEvaluating(true);
    
    // Use existing evaluation system with fallback
    try {
      const evaluationResult = await evaluateStrand(answer, 'critical-angle', 'strand1');
      setEvaluation(evaluationResult);
      
      // Calculate score based on evaluation level
      const score = Math.min(8, evaluationResult.level);
      const isCorrect = score >= Math.max(question.level - 2, 4); // Accept answers within 2 levels
      
      // ✅ Call with correct signature
      onAnswer(question.id, answer, isCorrect, score);
      
    } catch (error) {
      console.error('Evaluation error:', error);
      
      // Fallback evaluation
      const basicScore = calculateBasicScore(answer);
      const isCorrect = basicScore >= Math.max(question.level - 2, 4);
      
      setEvaluation({
        level: basicScore,
        matchedKeywords: [],
        matchedConcepts: [],
        suggestions: ['Response evaluated using basic scoring system.']
      });
      
      // ✅ Call with correct signature
      onAnswer(question.id, answer, isCorrect, basicScore);
    } finally {
      setIsEvaluating(false);
    }
  };

  const calculateBasicScore = (text: string): number => {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    // Check for required keywords
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
    
    // Calculate score based on criteria
    const keywordScore = (foundKeywords.length / Math.max(question.evaluationCriteria.requiredKeywords.length, 1)) * 4;
    const conceptScore = (foundConcepts.length / Math.max(question.evaluationCriteria.requiredConcepts.length, 1)) * 3;
    const lengthScore = (hasMinWords && withinMaxWords) ? 1 : 0;
    
    score = Math.min(8, keywordScore + conceptScore + lengthScore);
    
    return Math.round(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWordCountColor = () => {
    if (question.minWords && wordCount < question.minWords) return 'text-red-500';
    if (question.maxWords && wordCount > question.maxWords) return 'text-red-500';
    return 'text-green-500';
  };

  const isValidLength = () => {
    if (question.minWords && wordCount < question.minWords) return false;
    if (question.maxWords && wordCount > question.maxWords) return false;
    return true;
  };

  const getSubmitButtonText = () => {
    if (isEvaluating) return '🔄 Evaluating...';
    if (!answer.trim()) return 'Enter your answer';
    if (!isValidLength()) return 'Check word count';
    return 'Submit Answer';
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question}
      </h4>

      {/* Word count requirements */}
      {(question.minWords || question.maxWords) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            📝 Word requirement: 
            {question.minWords && ` At least ${question.minWords} words`}
            {question.minWords && question.maxWords && ` • `}
            {question.maxWords && ` Maximum ${question.maxWords} words`}
            <span className="ml-auto text-xs text-gray-500">
              Current: <span className={getWordCountColor()}>{wordCount}</span>
            </span>
          </p>
        </div>
      )}

      {/* Text Area */}
      <div className="mb-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={hasAnswered}
          placeholder="Type your answer here... Be detailed and use scientific terminology."
          className={`w-full h-32 p-4 border-2 rounded-lg resize-none focus:outline-none transition-all duration-200 ${
            hasAnswered 
              ? 'bg-gray-100 cursor-not-allowed border-gray-300'
              : 'border-gray-300 focus:border-purple-500 hover:border-purple-300'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey && !hasAnswered && answer.trim() && isValidLength()) {
              handleSubmit();
            }
          }}
        />
        
        {/* Word count and score indicator */}
        <div className="flex justify-between items-center mt-2 text-sm">
          <div className="flex items-center gap-4">
            <span className={getWordCountColor()}>
              {wordCount} words
              {!isValidLength() && (
                <span className="ml-2 text-red-500">
                  {question.minWords && wordCount < question.minWords && `(need ${question.minWords - wordCount} more)`}
                  {question.maxWords && wordCount > question.maxWords && `(${wordCount - question.maxWords} over limit)`}
                </span>
              )}
            </span>
            
            {!hasAnswered && answer.trim() && (
              <span className="text-xs text-gray-500">
                Ctrl+Enter to submit
              </span>
            )}
          </div>
          
          {hasAnswered && evaluation && (
            <span className={`font-medium ${getScoreColor(evaluation.level)} flex items-center gap-1`}>
              <span>Score: {evaluation.level}/8</span>
              {evaluation.level >= 7 && <span>🌟</span>}
            </span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {!hasAnswered && (
        <div className="flex justify-center mb-4">
          <motion.button
            whileHover={{ scale: (answer.trim() && isValidLength() && !isEvaluating) ? 1.05 : 1 }}
            whileTap={{ scale: (answer.trim() && isValidLength() && !isEvaluating) ? 0.95 : 1 }}
            onClick={handleSubmit}
            disabled={!answer.trim() || !isValidLength() || isEvaluating}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              answer.trim() && isValidLength() && !isEvaluating
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isEvaluating && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
            {getSubmitButtonText()}
          </motion.button>
        </div>
      )}

      {/* Live Feedback (enhanced evaluation results) */}
      {showFeedback && hasAnswered && evaluation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-4"
        >
          {/* Evaluation Results */}
          <div className={`p-4 rounded-lg border ${
            evaluation.level >= 7 ? 'bg-green-50 border-green-200' :
            evaluation.level >= 5 ? 'bg-blue-50 border-blue-200' :
            evaluation.level >= 3 ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <h5 className="font-semibold mb-3 flex items-center gap-2">
              🔍 Evaluation Results
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(evaluation.level)}`}>
                Level {evaluation.level}/8
              </span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Keywords Found:</p>
                <div className="flex flex-wrap gap-1">
                  {evaluation.matchedKeywords && evaluation.matchedKeywords.length > 0 ? (
                    evaluation.matchedKeywords.map((kw: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {kw.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">None found</span>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium mb-1">Concepts Matched:</p>
                <div className="flex flex-wrap gap-1">
                  {evaluation.matchedConcepts && evaluation.matchedConcepts.length > 0 ? (
                    evaluation.matchedConcepts.map((cpt: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {cpt.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">None found</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {evaluation.suggestions && evaluation.suggestions.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-2">💡 Suggestions for Improvement:</h5>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                {evaluation.suggestions.map((suggestion: string, i: number) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sample Answer */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-semibold text-green-800 mb-2">✨ Sample Answer:</h5>
            <p className="text-green-700 text-sm italic">{question.sampleAnswer}</p>
          </div>

          {/* Required Keywords/Concepts Guide */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h5 className="font-semibold text-purple-800 mb-2">🎯 What we're looking for:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-purple-700 mb-1">Key Terms:</p>
                <div className="flex flex-wrap gap-1">
                  {question.evaluationCriteria.requiredKeywords.map((keyword, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-purple-700 mb-1">Concepts:</p>
                <div className="flex flex-wrap gap-1">
                  {question.evaluationCriteria.requiredConcepts.map((concept, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">
                      {concept}
                    </span>
                  ))}
                </div>
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
        
        {hasAnswered && evaluation && (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              evaluation.level >= Math.max(question.level - 2, 4)
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {evaluation.level >= Math.max(question.level - 2, 4) ? 'Good Answer!' : 'Try Again!'}
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

export default ShortAnswerComponent;