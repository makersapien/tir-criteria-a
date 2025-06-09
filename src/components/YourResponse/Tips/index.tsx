// src/components/YourResponse/Tips/types.ts
export interface StrandTipsProps {
    currentStrand: number;
    experimentChoice: 'critical-angle' | 'fiber-optics';
    currentLevel?: 2 | 4 | 6 | 8;
    collapsed?: boolean;
    onToggleCollapsed?: (collapsed: boolean) => void;
  }
  
  export interface SuggestionsProps {
    currentStrand: number;
    experimentChoice: 'critical-angle' | 'fiber-optics';
    suggestions: string[];
    collapsed?: boolean;
    onToggleCollapsed?: (collapsed: boolean) => void;
  }
  
  // src/components/YourResponse/Tips/StrandTips.tsx
  // ✅ FIXED VERSION - No TypeScript errors
  import React, { useState } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { StrandTipsProps } from '../LevelSelection/types';
  
  // Import the actual tips data
  import strandTips from '../../../data/strandTips.json';
  
  const StrandTips: React.FC<StrandTipsProps> = ({
    currentStrand,
    experimentChoice,
    currentLevel,
    collapsed = true,
    onToggleCollapsed
  }) => {
    const [localCollapsed, setLocalCollapsed] = useState(collapsed);
  
    const isCollapsed = onToggleCollapsed ? collapsed : localCollapsed;
    const toggleCollapsed = onToggleCollapsed || setLocalCollapsed;
  
    // ✅ FIXED: Get tips exactly like in YourResponseSection
    const getCurrentTips = () => {
      try {
        const strandKey = `strand${currentStrand}`;
        return strandTips[experimentChoice]?.[strandKey] || {};
      } catch (error) {
        console.error('❌ Error loading tips:', error);
        return {};
      }
    };
  
    const tips = getCurrentTips();
  
    // ✅ Convert tips object to array for easier rendering
    const tipLevels = [2, 4, 6, 8].filter(level => {
      const levelKey = `level${level}`;
      return tips[levelKey] && (!currentLevel || level <= currentLevel);
    });
  
    if (tipLevels.length === 0) {
      return null;
    }
  
    const getTipColor = (level: number) => {
      const colors: Record<number, string> = {
        2: 'bg-green-50 border-green-200 text-green-800',
        4: 'bg-blue-50 border-blue-200 text-blue-800',
        6: 'bg-purple-50 border-purple-200 text-purple-800',
        8: 'bg-rose-50 border-rose-200 text-rose-800'
      };
      return colors[level] || 'bg-gray-50 border-gray-200 text-gray-800';
    };
  
    const getLevelIcon = (level: number) => {
      const icons: Record<number, string> = {
        2: '🌱', // Basic/Foundation
        4: '🔧', // Application/Tools
        6: '⚗️', // Analysis/Complex
        8: '🏆'  // Mastery/Expert
      };
      return icons[level] || '💡';
    };
  
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* ✅ Header */}
        <div 
          className="p-4 border-b border-gray-100 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
          onClick={() => toggleCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              💡
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Tips & Guidance - Strand {currentStrand}
              </h3>
              <p className="text-sm text-gray-600">
                {tipLevels.length} level{tipLevels.length !== 1 ? 's' : ''} of guidance available
                {currentLevel && ` (Level ${currentLevel} and below)`}
              </p>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            ▼
          </motion.div>
        </div>
  
        {/* ✅ Tips Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {tipLevels.map((level, index) => {
                  const levelKey = `level${level}`;
                  const tipData = tips[levelKey] as any;
                  
                  if (!tipData) return null;
  
                  return (
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${getTipColor(level)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getLevelIcon(level)}</span>
                        
                        <div className="flex-1">
                          {/* ✅ Level header */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-sm">Level {level}</span>
                            <span className="text-xs bg-white/50 px-2 py-1 rounded">
                              {level === 2 ? 'Foundation' : level === 4 ? 'Application' : level === 6 ? 'Analysis' : 'Mastery'}
                            </span>
                          </div>
  
                          {/* ✅ Main tip content */}
                          {tipData.tip && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">Key Guidance:</p>
                              <div 
                                className="text-sm opacity-90"
                                dangerouslySetInnerHTML={{ __html: tipData.tip }}
                              />
                            </div>
                          )}
  
                          {/* ✅ Command terms */}
                          {tipData.commandTerms && Array.isArray(tipData.commandTerms) && tipData.commandTerms.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1">Command Terms:</p>
                              <div className="flex flex-wrap gap-1">
                                {tipData.commandTerms.map((term: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-white/60 rounded text-xs font-medium"
                                  >
                                    {term}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
  
                          {/* ✅ Additional guidance */}
                          {tipData.guidance && (
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1">Strategy:</p>
                              <p className="text-xs opacity-80">{tipData.guidance}</p>
                            </div>
                          )}
  
                          {/* ✅ Examples */}
                          {tipData.examples && Array.isArray(tipData.examples) && tipData.examples.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1">Examples:</p>
                              <ul className="list-disc list-inside text-xs opacity-80 space-y-1">
                                {tipData.examples.slice(0, 2).map((example: string, idx: number) => (
                                  <li key={idx}>{example}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
  
              {/* ✅ Footer stats */}
              <div className="px-4 pb-4">
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      {tipLevels.length} level{tipLevels.length !== 1 ? 's' : ''} of guidance
                    </span>
                    <span>
                      Experiment: {experimentChoice === 'critical-angle' ? 'Critical Angle' : 'Fiber Optics'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  export default StrandTips;
