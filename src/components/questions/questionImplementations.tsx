// questionImplementations.tsx - React Components (WITH JSX)

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Question,
  MCQQuestion,
  FillBlankQuestion,
  MatchClickQuestion,
  ShortAnswerQuestion,
  QuestionResponse,
  QuestionBlock,
  evaluateMCQ,
  evaluateFillBlank,
  evaluateMatchClick,
  evaluateShortAnswer,
  validateQuestion
} from '../../utils/integrationFixes';

// Enhanced Question Renderer Props
interface QuestionRendererProps {
  question: Question;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  previousResponse?: QuestionResponse;
}

// MCQ Component
export const MCQComponent: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  showFeedback = true,
  disabled = false,
  previousResponse
}) => {
  const mcqQuestion = question as MCQQuestion;
  const [selectedOption, setSelectedOption] = useState<string | null>(
    previousResponse?.answer || null
  );
  const [hasAnswered, setHasAnswered] = useState(!!previousResponse);
  const [evaluation, setEvaluation] = useState<ReturnType<typeof evaluateMCQ> | null>(
    previousResponse ? {
      isCorrect: previousResponse.isCorrect,
      score: previousResponse.score,
      feedback: previousResponse.feedback
    } : null
  );

  const handleOptionSelect = useCallback((optionId: string) => {
    if (hasAnswered || disabled) return;
    
    setSelectedOption(optionId);
    setHasAnswered(true);
    
    const result = evaluateMCQ(mcqQuestion, optionId);
    setEvaluation(result);
    
    onAnswer(question.id, optionId, result.isCorrect, result.score);
  }, [hasAnswered, disabled, mcqQuestion, question.id, onAnswer]);

  const getOptionColor = (option: any) => {
    if (!showFeedback || !hasAnswered) {
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
    if (!showFeedback || !hasAnswered) {
      return selectedOption === option.id ? '●' : '○';
    }

    if (option.isCorrect) return '✅';
    if (selectedOption === option.id && !option.isCorrect) return '❌';
    return '○';
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {mcqQuestion.question}
      </h4>

      <div className="space-y-3">
        {mcqQuestion.options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleOptionSelect(option.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getOptionColor(option)} ${
              hasAnswered || disabled ? 'cursor-not-allowed' : 'cursor-pointer transform hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">
                {getOptionIcon(option)}
              </span>
              <span className="flex-1">{option.text}</span>
              {showFeedback && hasAnswered && option.level && !option.isCorrect && (
                <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  Level {option.level}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {showFeedback && hasAnswered && evaluation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <span className="text-blue-500 text-lg">💡</span>
            <div>
              <h5 className="font-semibold text-blue-800 mb-1">Explanation:</h5>
              <p className="text-blue-700 text-sm">{evaluation.feedback}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Fill Blank Component
export const FillBlankComponent: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  showFeedback = true,
  disabled = false,
  previousResponse
}) => {
  const fillBlankQuestion = question as FillBlankQuestion;
  const [answers, setAnswers] = useState<Record<string, string>>(
    previousResponse?.answer || {}
  );
  const [hasAnswered, setHasAnswered] = useState(!!previousResponse);
  const [evaluation, setEvaluation] = useState<ReturnType<typeof evaluateFillBlank> | null>(
    previousResponse ? {
      isCorrect: previousResponse.isCorrect,
      score: previousResponse.score,
      feedback: previousResponse.feedback
    } : null
  );

  // Initialize empty answers
  useEffect(() => {
    if (!previousResponse) {
      const initialAnswers: Record<string, string> = {};
      fillBlankQuestion.blanks.forEach(blank => {
        initialAnswers[blank.id] = '';
      });
      setAnswers(initialAnswers);
    }
  }, [fillBlankQuestion, previousResponse]);

  const handleInputChange = useCallback((blankId: string, value: string) => {
    if (hasAnswered || disabled) return;
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  }, [hasAnswered, disabled]);

  const handleSubmit = useCallback(() => {
    if (hasAnswered || disabled) return;
    
    setHasAnswered(true);
    const result = evaluateFillBlank(fillBlankQuestion, answers);
    setEvaluation(result);
    
    onAnswer(question.id, answers, result.isCorrect, result.score);
  }, [hasAnswered, disabled, fillBlankQuestion, answers, question.id, onAnswer]);

  const allFieldsFilled = fillBlankQuestion.blanks.every(blank => 
    answers[blank.id]?.trim().length > 0
  );

  // Split text and create input fields
  const renderTextWithBlanks = () => {
    const parts = fillBlankQuestion.text.split(/{blank}/g);
    const elements: React.ReactNode[] = [];
    let blankIndex = 0;

    parts.forEach((part, index) => {
      if (part) {
        elements.push(
          <span key={`text-${index}`} className="text-gray-800">
            {part}
          </span>
        );
      }

      if (index < parts.length - 1 && blankIndex < fillBlankQuestion.blanks.length) {
        const blank = fillBlankQuestion.blanks[blankIndex];
        
        let inputClass = 'mx-2 px-3 py-1 border-b-2 bg-transparent focus:outline-none focus:border-purple-500 min-w-[100px] text-center font-medium transition-all duration-200';
        
        if (hasAnswered && showFeedback) {
          const userAnswer = answers[blank.id]?.trim().toLowerCase() || '';
          const isCorrect = blank.correctAnswers.some(correct =>
            blank.caseSensitive
              ? correct === answers[blank.id]?.trim()
              : correct.toLowerCase() === userAnswer
          );
          inputClass += isCorrect 
            ? ' border-green-500 bg-green-50 text-green-700'
            : ' border-red-500 bg-red-50 text-red-700';
        } else {
          inputClass += ' border-gray-400 hover:border-purple-400';
        }

        elements.push(
          <input
            key={`blank-${blankIndex}`}
            type="text"
            value={answers[blank.id] || ''}
            onChange={(e) => handleInputChange(blank.id, e.target.value)}
            disabled={hasAnswered || disabled}
            className={inputClass}
            placeholder={`Blank ${blankIndex + 1}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !hasAnswered && allFieldsFilled) {
                handleSubmit();
              }
            }}
          />
        );
        blankIndex++;
      }
    });

    return elements;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        Fill in the blanks:
      </h4>

      <div className="text-lg leading-relaxed mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {renderTextWithBlanks()}
      </div>

      {!hasAnswered && (
        <div className="flex justify-center mb-4">
          <motion.button
            whileHover={{ scale: allFieldsFilled ? 1.05 : 1 }}
            whileTap={{ scale: allFieldsFilled ? 0.95 : 1 }}
            onClick={handleSubmit}
            disabled={!allFieldsFilled || disabled}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              allFieldsFilled && !disabled
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allFieldsFilled ? 'Submit Answers' : `Fill all ${fillBlankQuestion.blanks.length} blanks`}
          </motion.button>
        </div>
      )}

      {showFeedback && hasAnswered && evaluation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <span className="text-blue-500 text-lg">✨</span>
            <div>
              <h5 className="font-semibold text-blue-800 mb-1">Explanation:</h5>
              <p className="text-blue-700 text-sm">{evaluation.feedback}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Match Click Component
export const MatchClickComponent: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  showFeedback = true,
  disabled = false,
  previousResponse
}) => {
  const matchQuestion = question as MatchClickQuestion;
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Array<{ leftId: string; rightId: string }>>(
    previousResponse?.answer || []
  );
  const [hasAnswered, setHasAnswered] = useState(!!previousResponse);
  const [evaluation, setEvaluation] = useState<ReturnType<typeof evaluateMatchClick> | null>(
    previousResponse ? {
      isCorrect: previousResponse.isCorrect,
      score: previousResponse.score,
      feedback: previousResponse.feedback
    } : null
  );

  const handleLeftClick = useCallback((leftId: string) => {
    if (hasAnswered || disabled) return;
    if (matches.some(match => match.leftId === leftId)) return;
    
    setSelectedLeft(leftId);
    setSelectedRight(null);
  }, [hasAnswered, disabled, matches]);

  const handleRightClick = useCallback((rightId: string) => {
    if (hasAnswered || disabled || !selectedLeft) return;
    if (matches.some(match => match.rightId === rightId)) return;
    
    setSelectedRight(rightId);
    
    const newMatch = { leftId: selectedLeft, rightId };
    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    
    setSelectedLeft(null);
    setSelectedRight(null);
    
    if (updatedMatches.length === matchQuestion.leftItems.length) {
      handleSubmit(updatedMatches);
    }
  }, [hasAnswered, disabled, selectedLeft, matches, matchQuestion.leftItems.length]);

  const handleSubmit = useCallback((finalMatches: Array<{ leftId: string; rightId: string }>) => {
    if (hasAnswered || disabled) return;
    
    setHasAnswered(true);
    const result = evaluateMatchClick(matchQuestion, finalMatches);
    setEvaluation(result);
    
    onAnswer(question.id, finalMatches, result.isCorrect, result.score);
  }, [hasAnswered, disabled, matchQuestion, question.id, onAnswer]);

  const isLeftMatched = (leftId: string) => 
    matches.some(match => match.leftId === leftId);
  
  const isRightMatched = (rightId: string) => 
    matches.some(match => match.rightId === rightId);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {matchQuestion.question}
      </h4>
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-sm text-blue-700 flex items-center gap-2">
          🎯 <strong>Instructions:</strong> Click items on the left, then click their match on the right.
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
            {matchQuestion.leftItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleLeftClick(item.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isLeftMatched(item.id)
                    ? 'bg-purple-100 border-purple-500 text-purple-700 cursor-not-allowed'
                    : selectedLeft === item.id
                    ? 'bg-purple-200 border-purple-600 text-purple-800 transform scale-105'
                    : 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                }`}
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
          <h5 className="font-medium text-gray-700 mb-3 text-center bg-gray-100 py-2 rounded">
            🎯 Then Click to Match
          </h5>
          <div className="space-y-3">
            {matchQuestion.rightItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleRightClick(item.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isRightMatched(item.id)
                    ? 'bg-purple-100 border-purple-500 text-purple-700 cursor-not-allowed'
                    : 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {isRightMatched(item.id) ? '🔗' : '○'}
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

      {showFeedback && hasAnswered && evaluation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <span className="text-blue-500 text-lg">✨</span>
            <div>
              <h5 className="font-semibold text-blue-800 mb-1">Results:</h5>
              <p className="text-blue-700 text-sm">{evaluation.feedback}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Short Answer Component
export const ShortAnswerComponent: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  showFeedback = true,
  disabled = false,
  previousResponse
}) => {
  const shortQuestion = question as ShortAnswerQuestion;
  const [answer, setAnswer] = useState(previousResponse?.answer || '');
  const [hasAnswered, setHasAnswered] = useState(!!previousResponse);
  const [evaluation, setEvaluation] = useState<any>(
    previousResponse ? {
      isCorrect: previousResponse.isCorrect,
      score: previousResponse.score,
      feedback: previousResponse.feedback
    } : null
  );
  const [wordCount, setWordCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  const handleSubmit = useCallback(async () => {
    if (hasAnswered || disabled || !answer.trim()) return;
    
    setHasAnswered(true);
    setIsEvaluating(true);
    
    try {
      const result = await evaluateShortAnswer(shortQuestion, answer);
      setEvaluation(result);
      onAnswer(question.id, answer, result.isCorrect, result.score);
    } catch (error) {
      console.error('Evaluation error:', error);
      const fallbackResult = {
        isCorrect: false,
        score: 0,
        feedback: 'Evaluation temporarily unavailable.'
      };
      setEvaluation(fallbackResult);
      onAnswer(question.id, answer, false, 0);
    } finally {
      setIsEvaluating(false);
    }
  }, [hasAnswered, disabled, answer, shortQuestion, question.id, onAnswer]);

  const isValidLength = () => {
    if (shortQuestion.minWords && wordCount < shortQuestion.minWords) return false;
    if (shortQuestion.maxWords && wordCount > shortQuestion.maxWords) return false;
    return true;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">
        {shortQuestion.question}
      </h4>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={hasAnswered || disabled}
        placeholder="Type your answer here... Be detailed and use scientific terminology."
        className={`w-full h-32 p-4 border-2 rounded-lg resize-none focus:outline-none transition-all duration-200 ${
          hasAnswered || disabled
            ? 'bg-gray-100 cursor-not-allowed border-gray-300'
            : 'border-gray-300 focus:border-purple-500 hover:border-purple-300'
        }`}
      />
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{wordCount} words</span>
        {(shortQuestion.minWords || shortQuestion.maxWords) && (
          <span className="text-gray-500">
            {shortQuestion.minWords && `Min: ${shortQuestion.minWords}`}
            {shortQuestion.minWords && shortQuestion.maxWords && ' • '}
            {shortQuestion.maxWords && `Max: ${shortQuestion.maxWords}`}
          </span>
        )}
      </div>

      {!hasAnswered && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: (answer.trim() && isValidLength() && !isEvaluating) ? 1.05 : 1 }}
            whileTap={{ scale: (answer.trim() && isValidLength() && !isEvaluating) ? 0.95 : 1 }}
            onClick={handleSubmit}
            disabled={!answer.trim() || !isValidLength() || isEvaluating || disabled}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              answer.trim() && isValidLength() && !isEvaluating && !disabled
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isEvaluating && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
            {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
          </motion.button>
        </div>
      )}

      {showFeedback && hasAnswered && evaluation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <span className="text-blue-500 text-lg">✨</span>
            <div>
              <h5 className="font-semibold text-blue-800 mb-1">
                Score: {evaluation.score}/{shortQuestion.level}
              </h5>
              <p className="text-blue-700 text-sm">{evaluation.feedback}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Universal Question Renderer
export const UniversalQuestionRenderer: React.FC<QuestionRendererProps> = (props) => {
  const { question } = props;

  // Validate question before rendering
  if (!validateQuestion(question)) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-red-800 font-semibold mb-2">⚠️ Invalid Question</h4>
        <p className="text-red-700 text-sm">
          This question has invalid data and cannot be displayed.
        </p>
      </div>
    );
  }

  // Render appropriate component based on question type
  switch (question.type) {
    case 'mcq':
      return <MCQComponent {...props} />;
    case 'fill-blank':
      return <FillBlankComponent {...props} />;
    case 'match-click':
      return <MatchClickComponent {...props} />;
    case 'short-answer':
      return <ShortAnswerComponent {...props} />;
    default:
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-yellow-800 font-semibold mb-2">🔧 Unknown Question Type</h4>
          <p className="text-yellow-700 text-sm">
            Question type "{question.type}" is not supported yet.
          </p>
        </div>
      );
  }
};

// Question Block Component
interface QuestionBlockProps {
  block: QuestionBlock;
  onQuestionAnswer: (questionId: string, answer: any, isCorrect: boolean, score: number) => void;
  responses: Record<string, QuestionResponse>;
  currentQuestionIndex?: number;
  onComplete?: () => void;
}

export const QuestionBlockComponent: React.FC<QuestionBlockProps> = ({
  block,
  onQuestionAnswer,
  responses,
  currentQuestionIndex = 0,
  onComplete
}) => {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(currentQuestionIndex);
  
  const currentQuestion = block.questions[activeQuestionIndex];
  const isLastQuestion = activeQuestionIndex === block.questions.length - 1;
  
  const handleQuestionAnswer = useCallback((
    questionId: string,
    answer: any,
    isCorrect: boolean,
    score: number
  ) => {
    onQuestionAnswer(questionId, answer, isCorrect, score);
    
    // Auto-advance to next question after a delay
    setTimeout(() => {
      if (isLastQuestion) {
        onComplete?.();
      } else {
        setActiveQuestionIndex(prev => prev + 1);
      }
    }, 2000);
  }, [onQuestionAnswer, isLastQuestion, onComplete]);

  if (!currentQuestion) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600 text-center">No questions available in this block.</p>
      </div>
    );
  }

  const previousResponse = responses[currentQuestion.id];
  const progress = ((activeQuestionIndex + 1) / block.questions.length) * 100;

  return (
    <div className="question-block bg-white rounded-lg shadow-lg border border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Level {block.level} Questions</h3>
          <span className="text-sm bg-white/20 px-2 py-1 rounded">
            {activeQuestionIndex + 1} of {block.questions.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div
            className="bg-white h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UniversalQuestionRenderer
              question={currentQuestion}
              onAnswer={handleQuestionAnswer}
              showFeedback={true}
              previousResponse={previousResponse}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
          disabled={activeQuestionIndex === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        
        <div className="text-sm text-gray-600">
          Question {activeQuestionIndex + 1} of {block.questions.length}
        </div>
        
        <button
          onClick={() => setActiveQuestionIndex(Math.min(block.questions.length - 1, activeQuestionIndex + 1))}
          disabled={activeQuestionIndex === block.questions.length - 1}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
};