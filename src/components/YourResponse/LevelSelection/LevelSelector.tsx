// src/components/YourResponse/LevelSelection/LevelSelector.tsx
// 🎯 EXTRACTED LEVEL SELECTION MODULE - Compact, colorful level buttons

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
  // ✅ Color scheme for different levels (visual hierarchy)
  const levelColors = {
    2: {
      base: 'bg-emerald-500 border-emerald-600 text-white',
      hover: 'hover:bg-emerald-600',
      completed: 'bg-emerald-600 border-emerald-700'
    },
    4: {
      base: 'bg-blue-500 border-blue-600 text-white',
      hover: 'hover:bg-blue-600',
      completed: 'bg-blue-600 border-blue-700'
    },
    6: {
      base: 'bg-purple-500 border-purple-600 text-white',
      hover: 'hover:bg-purple-600',
      completed: 'bg-purple-600 border-purple-700'
    },
    8: {
      base: 'bg-rose-500 border-rose-600 text-white',
      hover: 'hover:bg-rose-600',
      completed: 'bg-rose-600 border-rose-700'
    }
  };

  // ✅ Level descriptions (concise)
  const levelDescriptions = {
    2: "Basic recall and simple understanding",
    4: "Application in familiar contexts", 
    6: "Analysis and evaluation in new contexts",
    8: "Synthesis and creation of understanding"
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-purple-200">
      {/* ✅ Compact header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-purple-700 flex items-center gap-2">
          🎯 Select Question Level
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
            All Levels Unlocked
          </span>
          {enableEnhancedValidation && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Quality Assured
            </span>
          )}
        </div>
      </div>

      {/* ✅ Compact level buttons grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
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
            />
          );
        })}
      </div>
      
      {/* ✅ Compact level descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 border-t border-gray-200 pt-3">
        {Object.entries(levelDescriptions).map(([level, description]) => (
          <div key={level} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${levelColors[parseInt(level) as keyof typeof levelColors].base.split(' ')[0]}`}></span>
            <span><strong>Level {level}:</strong> {description}</span>
          </div>
        ))}
      </div>
      
      {/* ✅ Debug info (compact) */}
      {debugMode && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <strong>Level Selection Module:</strong> ✅ Extracted | 
          Questions: {strandQuestionData.blocks?.reduce((sum: number, block: any) => sum + (block.questions?.length || 0), 0) || 0} | 
          Validated: {Object.values(validationResults).filter(v => v.isValid).length}/{Object.keys(validationResults).length}
        </div>
      )}
    </div>
  );
};

export default LevelSelector;