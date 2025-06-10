// src/components/YourResponse/LevelSelection/LevelSelector.tsx
// 🎯 DUAL MODE LEVEL SELECTION - Compact & Normal versions with toggle

import React from 'react';
import { motion } from 'framer-motion';
import LevelCard from './LevelCard';

interface LevelSelectorProps {
  currentStrand: number;
  strandQuestionData: any;
  enableEnhancedValidation?: boolean;
  validationResults: Record<string, { isValid: boolean; errors: string[]; warnings?: string[]; }>;
  onStartQuestionBlock: (level: number) => void;
  getBlockStatus: (level: number) => 'completed' | 'available';
  debugMode?: boolean;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentStrand,
  strandQuestionData,
  enableEnhancedValidation = false,
  validationResults,
  onStartQuestionBlock,
  getBlockStatus,
  debugMode = false
}) => {
  const [showDebugInfo, setShowDebugInfo] = React.useState(false);
  const [isCompactCards, setIsCompactCards] = React.useState(false); // ✅ NEW: Card view toggle

  // ✅ Enhanced color scheme for different levels (visual hierarchy)
  const levelColors = {
    2: {
      base: 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200',
      hover: 'hover:bg-emerald-600 hover:shadow-emerald-300',
      completed: 'bg-emerald-600 border-emerald-700 shadow-emerald-300'
    },
    4: {
      base: 'bg-blue-500 border-blue-600 text-white shadow-blue-200',
      hover: 'hover:bg-blue-600 hover:shadow-blue-300',
      completed: 'bg-blue-600 border-blue-700 shadow-blue-300'
    },
    6: {
      base: 'bg-purple-500 border-purple-600 text-white shadow-purple-200',
      hover: 'hover:bg-purple-600 hover:shadow-purple-300',
      completed: 'bg-purple-600 border-purple-700 shadow-purple-300'
    },
    8: {
      base: 'bg-rose-500 border-rose-600 text-white shadow-rose-200',
      hover: 'hover:bg-rose-600 hover:shadow-rose-300',
      completed: 'bg-rose-600 border-rose-700 shadow-rose-300'
    }
  };

  // ✅ Enhanced level descriptions
  const levelDescriptions = {
    2: "Basic recall and simple understanding",
    4: "Application in familiar contexts", 
    6: "Analysis and evaluation in new contexts",
    8: "Synthesis and creation of understanding"
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-200 overflow-hidden">
      {/* ✅ Enhanced header with card view toggle */}
      <div className="px-6 py-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-purple-900 leading-tight mb-1">
              🎯 Select Your Challenge Level
            </h2>
            <p className="text-base text-purple-700 font-medium">
              Choose a difficulty level and start practicing
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-md text-sm font-semibold border border-green-200">
              All Levels Unlocked
            </span>
            {enableEnhancedValidation && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-sm font-semibold border border-blue-200">
                Quality Assured
              </span>
            )}
            
            {/* ✅ NEW: Card view toggle */}
            <button
              onClick={() => setIsCompactCards(!isCompactCards)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-md text-sm font-medium border border-purple-200 transition-colors flex items-center gap-1"
              title={isCompactCards ? 'Switch to normal cards' : 'Switch to compact cards'}
            >
              {isCompactCards ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Normal
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Compact
                </>
              )}
            </button>
            
            {/* Debug toggle for level selector */}
            {debugMode && (
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 transition-colors"
                title={showDebugInfo ? 'Hide debug info' : 'Show debug info'}
              >
                🔧 {showDebugInfo ? '▼' : '▶'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* ✅ Dynamic level buttons grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6`}>
          {([2, 4, 6, 8] as const).map(level => {
            const status = getBlockStatus(level);
            const block = strandQuestionData.blocks?.find((b: any) => b.level === level);
            const totalQuestions = block?.questions?.length || 0;
            const validQuestions = enableEnhancedValidation ? 
              block?.questions?.filter((q: any) => validationResults[q.id]?.isValid !== false)?.length || 0 :
              totalQuestions;
            
            const colors = levelColors[level];
            const isCompleted = status === 'completed';
            
            return (
              <LevelCard
                key={level}
                level={level}
                colors={colors}
                isCompleted={isCompleted}
                validQuestions={validQuestions}
                totalQuestions={totalQuestions}
                enableEnhancedValidation={enableEnhancedValidation}
                onClick={() => onStartQuestionBlock(level)}
                isCompact={isCompactCards} // ✅ Pass compact mode
              />
            );
          })}
        </div>
        
        {/* ✅ Enhanced level descriptions - Show/hide based on card mode */}
        {!isCompactCards && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Understanding MYP Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(levelDescriptions).map(([level, description]) => {
                const levelNum = parseInt(level) as keyof typeof levelColors;
                const colorClass = levelColors[levelNum].base.split(' ')[0]; // Extract bg color
                
                return (
                  <div key={level} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${colorClass} flex-shrink-0`}></div>
                    <span className="text-gray-700">
                      <span className="font-semibold text-gray-900">Level {level}:</span> {description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ✅ Compact descriptions for compact mode */}
        {isCompactCards && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Foundation</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Application</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span>Mastery</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* ✅ Enhanced debug info (collapsible) */}
      {debugMode && showDebugInfo && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">🔧 Level Selection Debug</h3>
              <button
                onClick={() => setShowDebugInfo(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Close debug panel"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">Module Status</div>
                <div className="text-green-700 font-medium">✅ Extracted</div>
                <div className="text-gray-700">Mode: {isCompactCards ? 'Compact' : 'Normal'}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">Questions</div>
                <div className="text-gray-700">
                  Total: {strandQuestionData.blocks?.reduce((sum: number, block: any) => sum + (block.questions?.length || 0), 0) || 0}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">Validation</div>
                <div className="text-gray-700">
                  Valid: {Object.values(validationResults).filter(v => v.isValid).length}/{Object.keys(validationResults).length}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">Colors Applied</div>
                <div className="text-green-700 font-medium">✅ Working</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelector;