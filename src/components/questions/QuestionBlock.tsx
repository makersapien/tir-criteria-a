// =====================================
// 📁 src/components/questions/QuestionBlock.tsx
// REPLACE YOUR EXISTING FILE WITH THIS
// =====================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Import from your QuestionBlock/index.ts
import { 
  useQuestionBlockState, 
  useQuestionBlockLogic, 
  useQuestionBlockEffects,
  questionBlockUtils,
  getRandomLearningQuote,
  type QuestionBlock as QuestionBlockType,
  type QuestionResponse
} from './QuestionBlock/';

// ✅ Import your existing individual components (these stay where they are)
import MCQComponent from './MCQComponent';
import FillBlankComponent from './FillBlankComponent';
import MatchClickComponent from './MatchClickComponent';
import ShortAnswerComponent from './ShortAnswerComponent';

// 🎯 Props Interface (maintains backward compatibility)
export interface QuestionBlockProps {
  block: QuestionBlockType;
  onComplete: (blockId: string, responses: QuestionResponse[], averageScore: number) => void;
  onUnlock?: (nextLevel: number) => void;
  showSuggestions?: boolean;
  onProgressUpdate?: (blockId: string, currentQuestion: number, totalQuestions: number, currentScore: number) => void;
  
  // Session props
  currentStudentId?: string;
  sessionCode?: string;
  experimentChoice?: 'critical-angle' | 'fiber-optics' | 'distance' | 'magnets';
  syncStatus?: 'idle' | 'saving' | 'success' | 'error';
  
  // Rendering options
  useUniversalRenderer?: boolean;
  fallbackToIndividual?: boolean;
  enableEnhancedValidation?: boolean;
  debugMode?: boolean;
}

// 🎯 MAIN COMPONENT - Dramatically Reduced from 900+ LOC
const QuestionBlock: React.FC<QuestionBlockProps> = (props) => {
  // 🎯 Clean hook usage (replaces 15+ useState hooks)
  const { state, actions, selectors, utilities } = useQuestionBlockState();
  
  // 🎯 Business logic (replaces 200+ lines of inline logic)
  const logic = useQuestionBlockLogic(state, actions, selectors, props);
  
  // 🎯 Side effects (replaces scattered useEffect hooks)
  useQuestionBlockEffects(state, actions, {
    useUniversalRenderer: props.useUniversalRenderer,
    enableEnhancedValidation: props.enableEnhancedValidation,
    fallbackToIndividual: props.fallbackToIndividual,
    currentQuestion: logic.currentQuestion
  });

  // 🎯 Set learning quote for incorrect answers
  React.useEffect(() => {
    if (state.currentResponse && !state.currentResponse.isCorrect && !state.learningQuote) {
      actions.setLearningQuote(getRandomLearningQuote());
    }
  }, [state.currentResponse, state.learningQuote, actions]);

  // 🎯 Early return: Locked block
  if (!props.block.unlocked) {
    return (
      <motion.div
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 0.5, scale: 0.95 }}
        whileHover={{ scale: 0.97, opacity: 0.6 }}
        className="relative"
      >
        <div className={`p-6 rounded-lg bg-gradient-to-r ${questionBlockUtils.getLevelColor(props.block.level)} opacity-50 border-2 ${questionBlockUtils.getLevelBorderColor(props.block.level)}`}>
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <span className="text-2xl">🔒</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Level {props.block.level} Questions</h3>
          <p className="text-white/80 text-sm">Complete Level {props.block.level - 2} with score ≥ 6 to unlock</p>
          <div className="mt-3 flex items-center gap-2 text-white/70 text-xs">
            <span>🎯 {props.block.questions.length} questions</span>
            <span>•</span>
            <span>⭐ {props.block.level} points each</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // 🎯 Early return: Completion screen
  if (state.isCompleted) {
    const summary = selectors.sessionSummary();
    const correctCount = selectors.correctAnswers();
    const totalTime = utilities.getTotalSessionTime() / 1000; // Convert to seconds
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`p-6 rounded-lg bg-gradient-to-r ${questionBlockUtils.getLevelColor(props.block.level)} text-white border-2 ${questionBlockUtils.getLevelBorderColor(props.block.level)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="text-lg font-bold">Level {props.block.level} Completed!</h3>
              <p className="text-white/80 text-sm">Great work on finishing this level</p>
              <p className="text-white/60 text-xs mt-1">
                {state.renderingMode === 'universal' ? '✨ Enhanced renderer' : 
                 state.renderingMode === 'individual' ? '⚡ Individual components' : 
                 '🔧 Mixed rendering'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${questionBlockUtils.getScoreColor(summary.averageScore)}`}>
              {summary.averageScore.toFixed(1)}/8
            </div>
            <div className="text-xs text-white/70">Average Score</div>
          </div>
        </div>

        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{correctCount}/{summary.totalQuestions}</div>
            <div className="text-xs text-white/70">Correct</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{state.attempts}</div>
            <div className="text-xs text-white/70">Total Attempts</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{Math.round(totalTime)}s</div>
            <div className="text-xs text-white/70">Time Taken</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{Math.round(summary.successRate * 100)}%</div>
            <div className="text-xs text-white/70">Success Rate</div>
          </div>
        </div>

        {/* Performance Feedback */}
        <div className="mb-4 p-3 bg-white/10 rounded-lg">
          {summary.averageScore >= 7 && (
            <p className="text-sm text-white/90">
              🌟 <strong>Excellent!</strong> You've mastered this level. Ready for the next challenge?
            </p>
          )}
          {summary.averageScore >= 5 && summary.averageScore < 7 && (
            <p className="text-sm text-white/90">
              👍 <strong>Good work!</strong> You understand the concepts well. Practice a bit more to perfect your skills.
            </p>
          )}
          {summary.averageScore >= 3 && summary.averageScore < 5 && (
            <p className="text-sm text-white/90">
              📚 <strong>Keep learning!</strong> Review the concepts and try again. You're making progress!
            </p>
          )}
          {summary.averageScore < 3 && (
            <p className="text-sm text-white/90">
              💪 <strong>Don't give up!</strong> Learning takes time. Review the material and try again.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={actions.resetBlock}
            className="flex-1 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
          >
            🔄 Retry Level
          </button>
          
          {summary.averageScore >= 6 && (
            <button
              onClick={() => {
                const nextLevel = props.block.level === 2 ? 4 : 
                                props.block.level === 4 ? 6 : 
                                props.block.level === 6 ? 8 : null;
                if (nextLevel && props.onUnlock) {
                  props.onUnlock(nextLevel);
                }
              }}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              🚀 Next Level
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // 🎯 Main active question display
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg bg-gradient-to-r ${questionBlockUtils.getLevelColor(props.block.level)} text-white border-2 ${questionBlockUtils.getLevelBorderColor(props.block.level)} overflow-hidden`}
    >
      {/* 🎯 Enhanced Header with Integration Status */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-lg font-bold">Level {props.block.level} Questions</h3>
              <p className="text-white/80 text-sm">
                {props.block.questions.length} questions • {props.block.level} points each
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-white/70">Question</div>
              {/* Enhanced Status Indicators */}
              {props.syncStatus && (
                <span className={`px-2 py-1 rounded text-xs transition-all duration-200 ${
                  props.syncStatus === 'saving' ? 'bg-yellow-300 text-yellow-800 animate-pulse' :
                  props.syncStatus === 'success' ? 'bg-green-300 text-green-800' :
                  props.syncStatus === 'error' ? 'bg-red-300 text-red-800 animate-bounce' :
                  'bg-white/20 text-white'
                }`}>
                  {props.syncStatus === 'saving' ? '💾 Saving' :
                   props.syncStatus === 'success' ? '✅ Synced' :
                   props.syncStatus === 'error' ? '❌ Error' : '💤 Idle'}
                </span>
              )}
            </div>
            <div className="text-xl font-bold">
              {state.currentQuestionIndex + 1}/{props.block.questions.length}
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-white/70">
            <span>Progress</span>
            <span>{Math.round(selectors.completionRate(props.block.questions.length))}% complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-white h-3 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${((state.currentQuestionIndex + 1) / props.block.questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Enhanced Live Stats */}
        <div className="flex justify-between items-center mt-3 text-xs">
          <div className="flex items-center gap-4">
            {selectors.averageScore() > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded">
                Avg: {selectors.averageScore().toFixed(1)}/8
              </span>
            )}
            {state.attempts > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded">
                Attempts: {state.attempts}
              </span>
            )}
            {/* Rendering Mode Indicator */}
            <span className={`px-2 py-1 rounded ${
              state.renderingMode === 'universal' ? 'bg-green-400/30' :
              state.renderingMode === 'individual' ? 'bg-blue-400/30' :
              'bg-red-400/30'
            }`}>
              {state.renderingMode === 'universal' ? '✨ Enhanced' :
               state.renderingMode === 'individual' ? '⚡ Individual' :
               '🔧 Error Mode'}
            </span>
          </div>
          <div className="text-white/70">
            Level {props.block.level} Challenge
          </div>
        </div>
      </div>

      {/* 🎯 Enhanced Question Component Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white mx-6 mb-6 rounded-lg p-6 text-gray-800 shadow-lg"
        >
          {/* Question Number and Type Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                Question {state.currentQuestionIndex + 1}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {logic.currentQuestion?.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              {/* Enhanced validation indicator */}
              {props.enableEnhancedValidation && logic.currentQuestion && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  ✓ Validated
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{logic.currentQuestion?.points || logic.currentQuestion?.level} points</span>
              {/* Rendering mode toggle (development feature) */}
              {process.env.NODE_ENV === 'development' && props.useUniversalRenderer && (
                <button
                  onClick={() => {
                    actions.setRenderingMode(
                      state.renderingMode === 'universal' ? 'individual' : 'universal'
                    );
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
                  title="Toggle rendering mode (dev only)"
                >
                  🔄
                </button>
              )}
            </div>
          </div>

          {/* 🎯 Question Renderer - Using your existing components */}
          {logic.currentQuestion && logic.currentQuestion.type === 'mcq' && (
            <MCQComponent
              question={logic.currentQuestion}
              onAnswer={logic.handleQuestionResponse}
              showFeedback={false}
              disabled={state.showFeedback}
            />
          )}
          {logic.currentQuestion && logic.currentQuestion.type === 'fill-blank' && (
            <FillBlankComponent
              question={logic.currentQuestion}
              onAnswer={logic.handleQuestionResponse}
              showFeedback={false}
              disabled={state.showFeedback}
            />
          )}
          {logic.currentQuestion && logic.currentQuestion.type === 'match-click' && (
            <MatchClickComponent
              question={logic.currentQuestion}
              onAnswer={logic.handleQuestionResponse}
              showFeedback={false}
              disabled={state.showFeedback}
            />
          )}
          {logic.currentQuestion && logic.currentQuestion.type === 'short-answer' && (
            <ShortAnswerComponent
              question={logic.currentQuestion}
              onAnswer={logic.handleQuestionResponse}
              showFeedback={false}
              disabled={state.showFeedback}
            />
          )}

          {/* 🎯 Enhanced feedback display with continue button flow */}
          {state.showFeedback && state.currentResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-4 p-6 rounded-lg border-2 ${
                state.currentResponse.isCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              } space-y-4`}
            >
              {/* Header with result */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {state.currentResponse.isCorrect ? '✅' : '❌'}
                  </span>
                  <div>
                    <h5 className={`font-bold text-lg ${
                      state.currentResponse.isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {state.currentResponse.isCorrect ? '🎉 Excellent Work!' : '💪 Good Attempt!'}
                    </h5>
                    <p className={`text-sm ${
                      state.currentResponse.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Score: {state.currentResponse.score}/{logic.currentQuestion?.level} points
                    </p>
                  </div>
                </div>
                {!state.currentResponse.isCorrect && state.learningQuote && (
                  <div className="text-right">
                    <p className="text-sm italic text-gray-600 bg-yellow-100 px-3 py-2 rounded-lg">
                      {state.learningQuote}
                    </p>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div className={`p-4 rounded-lg ${
                state.currentResponse.isCorrect ? 'bg-green-100 border-green-200' : 'bg-blue-50 border-blue-200'
              } border`}>
                <div className="flex items-start gap-2">
                  <span className={`text-lg ${
                    state.currentResponse.isCorrect ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    {state.currentResponse.isCorrect ? '🌟' : '📚'}
                  </span>
                  <div className="flex-1">
                    <h6 className={`font-semibold mb-2 ${
                      state.currentResponse.isCorrect ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {state.currentResponse.isCorrect ? 'Why this is correct:' : 'Understanding the concept:'}
                    </h6>
                    <p className={`text-sm ${
                      state.currentResponse.isCorrect ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {logic.currentQuestion?.explanation || state.currentResponse.feedback}
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue button with timing enforcement */}
              <div className="flex justify-center pt-4">
                {!state.showContinueButton ? (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                    <span>
                      {state.currentResponse.isCorrect 
                        ? "Great! Take a moment to understand why this was correct..."
                        : "Take time to understand the correct answer..."
                      }
                    </span>
                  </div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logic.handleContinue}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                      state.currentResponse.isCorrect 
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {logic.isLastQuestion ? '🏁 Complete Level' : '➡️ Continue to Next Question'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Suggestions (keeping your excellent hint system) */}
      {state.attempts >= 2 && props.showSuggestions && !state.showFeedback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mx-6 mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200"
        >
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            💡 Need a hint?
          </h4>
          <div className="text-sm space-y-1">
            <p><strong>Key concept:</strong> {(logic.currentQuestion as any)?.concept}</p>
            {(logic.currentQuestion as any)?.keywords && (logic.currentQuestion as any).keywords.length > 0 && (
              <p><strong>Important terms:</strong> {(logic.currentQuestion as any).keywords.join(', ')}</p>
            )}
            <p className="text-yellow-700 mt-2">
              Take your time and think about the fundamental principles involved.
            </p>
            {/* Enhanced hint: suggest trying different renderer */}
            {props.useUniversalRenderer && state.renderingMode === 'individual' && (
              <p className="text-yellow-600 text-xs mt-2">
                💡 Try switching to the enhanced renderer for additional help features.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Debug Info (Development Mode) */}
      {props.debugMode && (
        <div className="mx-6 mb-6 p-3 bg-gray-900 text-white rounded text-xs">
          <strong>Debug Info:</strong>
          <pre className="mt-1 overflow-auto max-h-32">
            {JSON.stringify({
              currentIndex: state.currentQuestionIndex,
              renderingMode: state.renderingMode,
              canContinue: state.canContinue,
              sessionMetrics: state.sessionMetrics,
              performance: utilities.getPerformanceTrend(),
              validationResult: state.validationResult
            }, null, 2)}
          </pre>
        </div>
      )}

      {/* Accessibility Progress Announcement */}
      <div className="sr-only" aria-live="polite">
        {state.showFeedback && state.currentResponse && (
          <span>
            Question {state.currentQuestionIndex + 1} of {props.block.questions.length} {state.currentResponse.isCorrect ? 'answered correctly' : 'answered incorrectly'}. 
            {!logic.isLastQuestion ? 'Review feedback before continuing.' : 'Review feedback before completing level.'}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionBlock;