// src/components/YourResponse/Header/YourResponseHeader.tsx
import React, { useState } from 'react';
import PerformanceInsights from './PerformanceInsights';

// ✅ FIXED: Define the performance insights type properly
interface PerformanceInsightsType {
  averageScore: number;
  completedLevels: number;
  universalUsage: number;
  trend: 'excellent' | 'good' | 'needs-improvement';
}

interface YourResponseHeaderProps {
  currentStrand: number;
  experimentChoice: 'critical-angle' | 'fiber-optics';
  overallProgress: number;
  useUniversalRenderer?: boolean;
  renderingMode: 'standard' | 'universal' | 'hybrid';
  syncStatus: 'saving' | 'success' | 'error' | 'idle';
  enableEnhancedValidation?: boolean;
  showPerformanceAnalytics?: boolean;
  performanceInsights?: PerformanceInsightsType | null;
  debugMode?: boolean;
}

const YourResponseHeader: React.FC<YourResponseHeaderProps> = ({
  currentStrand,
  experimentChoice,
  overallProgress,
  useUniversalRenderer = false,
  renderingMode,
  syncStatus,
  enableEnhancedValidation = false,
  showPerformanceAnalytics = false,
  performanceInsights,
  debugMode = false
}) => {
  const [showInsights, setShowInsights] = useState(false);

  const getExperimentDescription = () => {
    return experimentChoice === 'critical-angle' 
      ? 'Master critical angle principles and total internal reflection'
      : 'Explore fiber optics and light transmission technology';
  };

  const getLearningPathName = () => {
    return experimentChoice === 'critical-angle' ? 'Critical Angles' : 'Fiber Optics';
  };

  const getSyncStatusDisplay = () => {
    const statusConfig = {
      saving: { icon: '💾', text: 'Saving...', className: 'bg-yellow-100 text-yellow-800' },
      success: { icon: '✅', text: 'Synced', className: 'bg-green-100 text-green-800' },
      error: { icon: '❌', text: 'Error', className: 'bg-red-100 text-red-800' },
      idle: { icon: '💤', text: 'Ready', className: 'bg-gray-100 text-gray-600' }
    };
    
    return statusConfig[syncStatus] || statusConfig.idle;
  };

  const syncDisplay = getSyncStatusDisplay();

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm border-2 border-purple-200 p-6">
      {/* Debug panel */}
      {debugMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-bold text-blue-800 mb-1">🔧 HEADER MODULE DEBUG:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Current Strand: {currentStrand}</div>
            <div>Overall Progress: {overallProgress}/8</div>
            <div>Sync Status: {syncStatus}</div>
            <div>Rendering Mode: {renderingMode}</div>
            <div>Universal Renderer: {useUniversalRenderer ? 'Enabled' : 'Disabled'}</div>
            <div>Enhanced Validation: {enableEnhancedValidation ? 'On' : 'Off'}</div>
            <div>Performance Tracking: {showPerformanceAnalytics ? 'On' : 'Off'}</div>
            <div>Module Status: ✅ Extracted</div>
          </div>
          {performanceInsights && (
            <div className="mt-2 pt-2 border-t border-blue-300">
              <strong>Performance:</strong> Avg Score: {performanceInsights.averageScore}, 
              Levels: {performanceInsights.completedLevels}, 
              Universal Usage: {performanceInsights.universalUsage}/{performanceInsights.completedLevels}
            </div>
          )}
        </div>
      )}

      {/* Main header content */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-purple-800">
            Strand {currentStrand} Interactive Questions
            {useUniversalRenderer && (
              <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ✨ Enhanced
              </span>
            )}
          </h3>
          
          <p className="text-purple-600 mt-2 text-lg">
            {getExperimentDescription()}
          </p>
          
          <div className="mt-2 flex items-center gap-4 text-sm flex-wrap">
            <span className="text-purple-700">
              Learning Path: <strong>{getLearningPathName()}</strong>
            </span>
            
            <span className={`px-2 py-1 rounded ${syncDisplay.className}`}>
              {syncDisplay.icon} {syncDisplay.text}
            </span>
            
            {renderingMode === 'universal' && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                🚀 Universal Renderer
              </span>
            )}
            
            {enableEnhancedValidation && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                ✓ Validated
              </span>
            )}
          </div>
        </div>

        {/* Right side - Progress score */}
        <div className="text-right">
          <div className="text-4xl font-bold text-purple-600">{overallProgress}/8</div>
          <div className="text-sm text-purple-500 font-medium">Overall Score</div>
          {performanceInsights && (
            <div className="text-xs text-purple-400 mt-1">
              Trend: {performanceInsights.trend}
            </div>
          )}
          
          {/* Performance insights toggle button */}
          {showPerformanceAnalytics && performanceInsights && (
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="mt-2 px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors flex items-center gap-1"
              title={showInsights ? 'Hide performance insights' : 'Show performance insights'}
            >
              📊 Analytics {showInsights ? '▼' : '▶'}
            </button>
          )}
        </div>
      </div>

      {/* Performance insights panel */}
      {showPerformanceAnalytics && performanceInsights && showInsights && (
        <PerformanceInsights
          currentStrand={currentStrand}
          experimentChoice={experimentChoice}
          sessionCode="demo"
          currentStudentId="demo-student"
        />
      )}
    </div>
  );
};

export default YourResponseHeader;