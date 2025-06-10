import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StrandTipsProps } from './types';
import strandTips from '../../../data/strandTips.json';

const StrandTips: React.FC<StrandTipsProps> = ({
  currentStrand,
  experimentChoice,
  currentLevel,
  collapsed = false, // Default to expanded for better UX
  onToggleCollapsed
}) => {
  const [localCollapsed, setLocalCollapsed] = useState(collapsed);
  const [activeTipLevel, setActiveTipLevel] = useState<2 | 4 | 6 | 8>(2);

  const isCollapsed = onToggleCollapsed ? collapsed : localCollapsed;
  const toggleCollapsed = onToggleCollapsed || setLocalCollapsed;

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

  const tipLevels = [2, 4, 6, 8].filter(level => {
    const levelKey = `level${level}`;
    return tips[levelKey] && (!currentLevel || level <= currentLevel);
  }) as (2 | 4 | 6 | 8)[];

  if (tipLevels.length === 0) {
    return null;
  }

  // ✅ NEW: Get level colors for consistent theming
  const getLevelColors = (level: 2 | 4 | 6 | 8) => {
    const colorMap = {
      2: { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-300' },
      4: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-300' },
      6: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-300' },
      8: { bg: 'bg-rose-500', text: 'text-rose-700', light: 'bg-rose-50', border: 'border-rose-300' }
    };
    return colorMap[level];
  };

  // Set default active level to first available
  React.useEffect(() => {
    if (tipLevels.length > 0 && !tipLevels.includes(activeTipLevel)) {
      setActiveTipLevel(tipLevels[0]);
    }
  }, [tipLevels, activeTipLevel]);

  const activeTipData = tips[`level${activeTipLevel}`] as any;

  return (
    <div className="bg-white rounded-lg border border-yellow-200 shadow-sm mb-6">
      {/* ✅ NEW: Header with horizontal tabs */}
      <div className="px-4 py-3 border-b border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="font-semibold text-yellow-800">Tips for Success</h3>
          </div>
          
          {/* Optional collapse toggle */}
          <button
            onClick={() => toggleCollapsed(!isCollapsed)}
            className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded transition-colors"
          >
            {isCollapsed ? 'Show Tips' : 'Hide Tips'}
          </button>
        </div>
        
        {/* ✅ NEW: Horizontal Tabs */}
        {!isCollapsed && (
          <div className="flex gap-1">
            {tipLevels.map((level) => {
              const colors = getLevelColors(level);
              const isActive = activeTipLevel === level;
              
              return (
                <button
                  key={level}
                  onClick={() => setActiveTipLevel(level)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isActive 
                      ? `${colors.bg} text-white shadow-sm` 
                      : `bg-white text-gray-600 hover:${colors.light} hover:${colors.text} border border-gray-200`
                  }`}
                >
                  Level {level}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ NEW: Single Active Tip Content Panel */}
      <AnimatePresence>
        {!isCollapsed && activeTipData && (
          <motion.div
            key={activeTipLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <div className={`p-4 rounded-lg ${getLevelColors(activeTipLevel).light} ${getLevelColors(activeTipLevel).border} border`}>
              {/* Level header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">
                  {activeTipLevel === 2 ? '🌱' : activeTipLevel === 4 ? '🔧' : activeTipLevel === 6 ? '⚗️' : '🏆'}
                </span>
                <div>
                  <span className={`font-bold text-sm ${getLevelColors(activeTipLevel).text}`}>
                    Level {activeTipLevel}
                  </span>
                  <span className="ml-2 text-xs bg-white/60 px-2 py-1 rounded">
                    {activeTipLevel === 2 ? 'Foundation' : 
                     activeTipLevel === 4 ? 'Application' : 
                     activeTipLevel === 6 ? 'Analysis' : 'Mastery'}
                  </span>
                </div>
              </div>

              {/* Tip content */}
              {activeTipData.tip && (
                <div className="mb-3">
                  <p className={`text-sm font-medium mb-2 ${getLevelColors(activeTipLevel).text}`}>
                    Key Guidance:
                  </p>
                  <div 
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activeTipData.tip }}
                  />
                </div>
              )}

              {/* Command terms */}
              {activeTipData.commandTerms && Array.isArray(activeTipData.commandTerms) && activeTipData.commandTerms.length > 0 && (
                <div className="mb-3">
                  <p className={`text-xs font-medium mb-2 ${getLevelColors(activeTipLevel).text}`}>
                    Command Terms:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeTipData.commandTerms.map((term: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white rounded text-xs font-medium border"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy */}
              {activeTipData.guidance && (
                <div className="mb-3">
                  <p className={`text-xs font-medium mb-2 ${getLevelColors(activeTipLevel).text}`}>
                    Strategy:
                  </p>
                  <p className="text-xs text-gray-600">{activeTipData.guidance}</p>
                </div>
              )}

              {/* Examples */}
              {activeTipData.examples && Array.isArray(activeTipData.examples) && activeTipData.examples.length > 0 && (
                <div>
                  <p className={`text-xs font-medium mb-2 ${getLevelColors(activeTipLevel).text}`}>
                    Examples:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {activeTipData.examples.slice(0, 2).map((example: string, idx: number) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ KEEP: Footer info (when expanded) */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {tipLevels.length} level{tipLevels.length !== 1 ? 's' : ''} of guidance
              </span>
              <span>
                {experimentChoice === 'critical-angle' ? 'Critical Angle' : 'Fiber Optics'} • Strand {currentStrand}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrandTips;