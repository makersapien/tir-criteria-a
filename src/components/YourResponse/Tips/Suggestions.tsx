import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuggestionsProps } from './types';

const Suggestions: React.FC<SuggestionsProps> = ({
  currentStrand,
  experimentChoice,
  suggestions,
  collapsed = true,
  onToggleCollapsed
}) => {
  const [localCollapsed, setLocalCollapsed] = useState(collapsed);

  const isCollapsed = onToggleCollapsed ? collapsed : localCollapsed;
  const toggleCollapsed = onToggleCollapsed || setLocalCollapsed;

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div 
        className="p-4 border-b border-gray-100 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => toggleCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            💬
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Helpful Suggestions
            </h3>
            <p className="text-sm text-gray-600">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} for improvement
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

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map((suggestion: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">💡</span>
                      <p className="text-sm text-blue-700 flex-1">{suggestion}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-600 text-center">
                  Tips tailored for {experimentChoice === 'critical-angle' ? 'Critical Angle' : 'Fiber Optics'} • Strand {currentStrand}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Suggestions;
