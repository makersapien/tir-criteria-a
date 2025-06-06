// src/components/questions/ShortAnswerComponent.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShortAnswerQuestion, QuestionResponse } from '../../types/questionBlock';
import { evaluateStrand } from '../../utils/evaluateStrand';

interface ShortAnswerComponentProps {
  question: ShortAnswerQuestion;
  onAnswer: (response: QuestionResponse) => void;
  showFeedback: boolean;
}

const ShortAnswerComponent: React.FC<ShortAnswerComponentProps> = ({
  question,
  onAnswer,
  showFeedback
}) => {
  const [answer, setAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  const handleSubmit = async () => {
    if (hasAnswered || !answer.trim()) return;
    
    setHasAnswered(true);
    
    // Use existing evaluation system
    try {
      const evaluation = await evaluateStrand(answer, 'critical-angle', 'strand1');
      setEvaluation(evaluation);
      
      // Calculate score based on evaluation level
      const score = evaluation.level;
      const isCorrect = score >= Math.max(question.level - 2, 4); // Accept answers within 2 levels
      
      const response: QuestionResponse = {
        questionId: question.id,
        type: 'short-answer',
        answer: answer,
        isCorrect,
        score,
        feedback: evaluation.suggestions.length > 0 
          ? evaluation.suggestions.join(' ') 
          : 'Good response!',
        timestamp: new Date()
      };

      onAnswer(response);
    } catch (error) {
      console.error('Evaluation error:', error);
      
      // Fallback evaluation
      const basicScore = calculateBasicScore(answer);
      const response: QuestionResponse = {
        questionId: question.id,
        type: 'short-answer',
        answer: answer,
        isCorrect: basicScore >= Math.max(question.level - 2, 4),
        score: basicScore,
        feedback: 'Response submitted successfully.',
        timestamp: new Date()
      };

      onAnswer(response);
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
    const keywordScore = (foundKeywords.length / question.evaluationCriteria.requiredKeywords.length) * 4;
    const conceptScore = (foundConcepts.length / question.evaluationCriteria.requiredConcepts.length) * 3;
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

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question}
      </h4>

      {/* Word count requirements */}
      {(question.minWords || question.maxWords) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Word requirement: 
            {question.minWords && ` At least ${question.minWords} words`}
            {question.minWords && question.maxWords && ` • `}
            {question.maxWords && ` Maximum ${question.maxWords} words`}
          </p>
        </div>
      )}

      {/* Text Area */}
      <div className="mb-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={hasAnswered}
          placeholder="Type your answer here..."
          className={`w-full h-32 p-4 border-2 rounded-lg resize-none focus:outline-none transition ${
            hasAnswered 
              ? 'bg-gray-100 cursor-not-allowed border-gray-300'
              : 'border-gray-300 focus:border-purple-500'
          }`}
        />
        
        {/* Word count indicator */}
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className={getWordCountColor()}>
            {wordCount} words
            {!isValidLength() && (
              <span className="ml-2 text-red-500">
                {question.minWords && wordCount < question.minWords && `(need ${question.minWords - wordCount} more)`}
                {question.maxWords && wordCount > question.maxWords && `(${wordCount - question.maxWords} over limit)`}
              </span>
            )}
          </span>
          
          {hasAnswered && evaluation && (
            <span className={`font-medium ${getScoreColor(evaluation.level)}`}>
              Score: {evaluation.level}/8
            </span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {!hasAnswered && (
        <div className="flex justify-center mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!answer.trim() || !isValidLength()}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              answer.trim() && isValidLength()
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </motion.button>
        </div>
      )}

      {/* Live Feedback (like in original system) */}
      {showFeedback && hasAnswered && evaluation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          {/* Evaluation Results */}
          <div className={`p-4 rounded-lg border mb-4 ${
            evaluation.level >= 7 ? 'bg-green-50 border-green-200' :
            evaluation.level >= 5 ? 'bg-blue-50 border-blue-200' :
            evaluation.level >= 3 ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <h5 className="font-semibold mb-2">🔍 Evaluation Results:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Keywords Found:</p>
                <div className="flex flex-wrap gap-1">
                  {evaluation.matchedKeywords.map((kw: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {kw.label}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium mb-1">Concepts Matched:</p>
                <div className="flex flex-wrap gap-1">
                  {evaluation.matchedConcepts.map((cpt: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {cpt.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {evaluation.suggestions.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
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

export default ShortAnswerComponent;