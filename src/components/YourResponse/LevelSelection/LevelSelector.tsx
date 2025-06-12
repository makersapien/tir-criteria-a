// src/components/YourResponse/LevelSelection/LevelSelector.tsx
// 🎯 FULLY PATCHED: Compatible with index.tsx and LevelCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import LevelCard from './LevelCard';

// ✅ FIXED: Updated interface to match index.tsx expectations
interface LevelSelectorProps {
  currentStrand: number;
  strandQuestionData: any;
  enableEnhancedValidation?: boolean;
  validationResults: Record<string, { isValid: boolean; errors: string[]; warnings?: string[]; }>;
  onStartQuestionBlock: (level: number) => void;
  getBlockStatus: (level: number) => 'completed' | 'available';
  debugMode?: boolean;
  activeLevel?: number | null; // ✅ ADDED: Support for active level tracking
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentStrand,
  strandQuestionData,
  enableEnhancedValidation = false,
  validationResults,
  onStartQuestionBlock,
  getBlockStatus,
  debugMode = false,
  activeLevel = null // ✅ ADDED: Active level with default
}) => {
  const [showDebugInfo, setShowDebugInfo] = React.useState(false);
  const [isCompactCards, setIsCompactCards] = React.useState(false);

  // ✅ Enhanced color scheme for different levels (visual hierarchy)
  const levelColors = {
    2: {
      base: 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200',
      hover: 'hover:bg-emerald-600 hover:shadow-emerald-300',
      completed: 'bg-emerald-600 border-emerald-700 shadow-emerald-300',
      active: 'ring-4 ring-emerald-300 ring-opacity-50' // ✅ ADDED: Active state styling
    },
    4: {
      base: 'bg-blue-500 border-blue-600 text-white shadow-blue-200',
      hover: 'hover:bg-blue-600 hover:shadow-blue-300',
      completed: 'bg-blue-600 border-blue-700 shadow-blue-300',
      active: 'ring-4 ring-blue-300 ring-opacity-50' // ✅ ADDED: Active state styling
    },
    6: {
      base: 'bg-purple-500 border-purple-600 text-white shadow-purple-200',
      hover: 'hover:bg-purple-600 hover:shadow-purple-300',
      completed: 'bg-purple-600 border-purple-700 shadow-purple-300',
      active: 'ring-4 ring-purple-300 ring-opacity-50' // ✅ ADDED: Active state styling
    },
    8: {
      base: 'bg-rose-500 border-rose-600 text-white shadow-rose-200',
      hover: 'hover:bg-rose-600 hover:shadow-rose-300',
      completed: 'bg-rose-600 border-rose-700 shadow-rose-300',
      active: 'ring-4 ring-rose-300 ring-opacity-50' // ✅ ADDED: Active state styling
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
              {activeLevel && (
                <span className="ml-2 px-2 py-1 bg-purple-200 text-purple-800 rounded-md text-sm font-semibold">
                  Currently on Level {activeLevel}
                </span>
              )}
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
            
            {/* ✅ Card view toggle */}
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
        {/* ✅ FIXED: Dynamic level buttons grid with active level support */}
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
            const isActive = activeLevel === level; // ✅ ADDED: Check if this level is active
            
            return (
              <div key={level} className={`relative ${isActive ? colors.active : ''} rounded-xl`}>
                <LevelCard
                  level={level}
                  colors={colors}
                  isCompleted={isCompleted}
                  isActive={isActive} // ✅ ADDED: Pass active state to LevelCard
                  validQuestions={validQuestions}
                  totalQuestions={totalQuestions}
                  enableEnhancedValidation={enableEnhancedValidation}
                  onClick={() => onStartQuestionBlock(level)}
                  isCompact={isCompactCards}
                />
                
                {/* ✅ ADDED: Active level indicator overlay */}
                {isActive && (
                  <div className="absolute -top-2 -left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    Active
                  </div>
                )}
              </div>
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
                const isCurrentlyActive = activeLevel === levelNum;
                
                return (
                  <div key={level} className={`flex items-center gap-3 ${isCurrentlyActive ? 'bg-purple-50 p-2 rounded-lg border border-purple-200' : ''}`}>
                    <div className={`w-4 h-4 rounded-full ${colorClass} flex-shrink-0 ${isCurrentlyActive ? 'ring-2 ring-purple-400' : ''}`}></div>
                    <span className="text-gray-700">
                      <span className={`font-semibold ${isCurrentlyActive ? 'text-purple-900' : 'text-gray-900'}`}>
                        Level {level}:
                      </span> {description}
                      {isCurrentlyActive && (
                        <span className="ml-2 text-purple-600 font-bold text-xs">← Currently Active</span>
                      )}
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
              <div className={`flex items-center gap-1 ${activeLevel === 2 ? 'font-bold text-purple-700' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Foundation</span>
                {activeLevel === 2 && <span className="text-purple-600">●</span>}
              </div>
              <div className={`flex items-center gap-1 ${activeLevel === 4 ? 'font-bold text-purple-700' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Application</span>
                {activeLevel === 4 && <span className="text-purple-600">●</span>}
              </div>
              <div className={`flex items-center gap-1 ${activeLevel === 6 ? 'font-bold text-purple-700' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Analysis</span>
                {activeLevel === 6 && <span className="text-purple-600">●</span>}
              </div>
              <div className={`flex items-center gap-1 ${activeLevel === 8 ? 'font-bold text-purple-700' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span>Mastery</span>
                {activeLevel === 8 && <span className="text-purple-600">●</span>}
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
                <div className="text-gray-700">Active Level: {activeLevel || 'None'}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">Questions</div>
                <div className="text-gray-700">
                  Total: {strandQuestionData.blocks?.reduce((sum: number, block: any) => sum + (block.questions?.length || 0), 0) || 0}
                </div>
                <div className="text-gray-700">
                  Valid: {Object.values(validationResults).filter(v => v.isValid).length}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">Validation</div>
                <div className="text-gray-700">
                  Enabled: {enableEnhancedValidation ? 'Yes' : 'No'}
                </div>
                <div className="text-gray-700">
                  Results: {Object.keys(validationResults).length} checked
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">Features</div>
                <div className="text-green-700 font-medium">✅ Active Level Support</div>
                <div className="text-green-700 font-medium">✅ Compact Mode</div>
              </div>
            </div>
            
            {/* ✅ ADDED: Active level debug info */}
            {activeLevel && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="font-semibold text-purple-900 mb-2">Active Level Details</div>
                <div className="text-sm text-purple-700">
                  Current Level: <span className="font-bold">{activeLevel}</span> 
                  <span className="ml-2">({levelDescriptions[activeLevel as keyof typeof levelDescriptions]})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelector;