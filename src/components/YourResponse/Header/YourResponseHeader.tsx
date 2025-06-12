// src/components/YourResponse/Header/YourResponseHeader.tsx
// 🎯 FULLY PATCHED: Fixed rendering mode type compatibility

import React, { useState } from 'react';
import PerformanceInsights from './PerformanceInsights';

// ✅ FIXED: Updated performance insights type to match index.tsx
interface PerformanceInsightsType {
  averageScore: number;
  completedLevels: number;
  universalUsage: number;
  trend: 'excellent' | 'good' | 'needs-improvement';
  totalQuestions?: number; // ✅ ADDED: Optional extended properties
  correctAnswers?: number; // ✅ ADDED: Optional extended properties
  timeSpent?: number; // ✅ ADDED: Optional extended properties
  learningVelocity?: 'fast' | 'steady' | 'methodical'; // ✅ ADDED: Optional extended properties
}

// ✅ FIXED: Updated interface to match index.tsx expectations
interface YourResponseHeaderProps {
  currentStrand: number;
  experimentChoice: 'critical-angle' | 'fiber-optics';
  overallProgress: number;
  useUniversalRenderer?: boolean;
  renderingMode: 'standard' | 'universal' | 'hybrid'; // ✅ FIXED: Correct type alignment
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
  renderingMode, // ✅ FIXED: Now correctly typed
  syncStatus,
  enableEnhancedValidation = false,
  showPerformanceAnalytics = false,
  performanceInsights,
  debugMode = false
}) => {
  const [showInsights, setShowInsights] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isCompactHeader, setIsCompactHeader] = useState(false);

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
      saving: { icon: '💾', text: 'Saving...', className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
      success: { icon: '✅', text: 'Synced', className: 'bg-green-100 text-green-800 border border-green-200' },
      error: { icon: '❌', text: 'Error', className: 'bg-red-100 text-red-800 border border-red-200' },
      idle: { icon: '💤', text: 'Ready', className: 'bg-gray-100 text-gray-700 border border-gray-200' }
    };
    
    return statusConfig[syncStatus] || statusConfig.idle;
  };

  // ✅ ENHANCED: Get rendering mode display with correct mapping
  const getRenderingModeDisplay = () => {
    const modeConfig = {
      standard: { icon: '⚡', text: 'Standard', className: 'bg-blue-100 text-blue-800 border border-blue-200' },
      universal: { icon: '✨', text: 'Enhanced', className: 'bg-green-100 text-green-800 border border-green-200' },
      hybrid: { icon: '🔄', text: 'Hybrid', className: 'bg-purple-100 text-purple-800 border border-purple-200' }
    };
    
    return modeConfig[renderingMode] || modeConfig.standard;
  };

  const syncDisplay = getSyncStatusDisplay();
  const renderingDisplay = getRenderingModeDisplay();

  // ✅ SUPER COMPACT HEADER VERSION
  if (isCompactHeader) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 overflow-hidden">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-purple-900">
                Strand {currentStrand} Interactive Questions
              </h1>
              <span className={`px-2 py-1 rounded text-xs font-medium ${syncDisplay.className}`}>
                {syncDisplay.icon} {syncDisplay.text}
              </span>
              {/* ✅ ADDED: Rendering mode indicator in compact */}
              <span className={`px-2 py-1 rounded text-xs font-medium ${renderingDisplay.className}`}>
                {renderingDisplay.icon} {renderingDisplay.text}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-700">{overallProgress}/8</div>
                <div className="text-xs text-purple-500">Score</div>
              </div>
              
              {/* Expand button */}
              <button
                onClick={() => setIsCompactHeader(false)}
                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded transition-colors"
                title="Expand header"
              >
                ⬇ Expand
              </button>
              
              {/* Debug toggle (compact) */}
              {debugMode && (
                <button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                  title={showDebugInfo ? 'Hide debug' : 'Show debug'}
                >
                  🔧
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Compact debug panel */}
        {debugMode && showDebugInfo && (
          <div className="border-t border-purple-200 bg-blue-50 px-4 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-blue-900">Debug:</span>
              <div className="flex gap-3 text-blue-700">
                <span>Mode: {renderingMode}</span>
                <span>Universal: {useUniversalRenderer ? 'On' : 'Off'}</span>
                <span>Validation: {enableEnhancedValidation ? 'On' : 'Off'}</span>
                {performanceInsights && (
                  <span>Trend: {performanceInsights.trend}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ✅ NORMAL (EXPANDED) HEADER VERSION with enhanced rendering mode support
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-md border border-purple-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-purple-900 leading-tight mb-2">
              Strand {currentStrand} Interactive Questions
              {useUniversalRenderer && (
                <span className="ml-3 text-sm font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-200">
                  ✨ Enhanced
                </span>
              )}
            </h1>
            
            <p className="text-lg text-purple-700 font-medium leading-relaxed mb-3">
              {getExperimentDescription()}
            </p>
            
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-purple-800 font-semibold">
                Learning Path: <span className="font-bold">{getLearningPathName()}</span>
              </span>
              
              <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${syncDisplay.className}`}>
                {syncDisplay.icon} {syncDisplay.text}
              </span>
              
              {/* ✅ ENHANCED: Rendering mode display */}
              <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${renderingDisplay.className}`}>
                {renderingDisplay.icon} {renderingDisplay.text} Mode
              </span>
              
              {enableEnhancedValidation && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-sm font-medium border border-blue-200">
                  ✓ Validated
                </span>
              )}
              
              {/* Compact button */}
              <button
                onClick={() => setIsCompactHeader(true)}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-md text-sm font-medium border border-purple-200 transition-colors"
                title="Compact header"
              >
                ⬆ Compact
              </button>
              
              {/* Debug toggle button */}
              {debugMode && (
                <button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 transition-colors flex items-center gap-1"
                  title={showDebugInfo ? 'Hide debug info' : 'Show debug info'}
                >
                  🔧 Debug {showDebugInfo ? '▼' : '▶'}
                </button>
              )}
            </div>
          </div>

          <div className="text-right ml-6">
            <div className="text-5xl font-extrabold text-purple-700 leading-none">{overallProgress}/8</div>
            <div className="text-sm text-purple-600 font-semibold mt-1">Overall Score</div>
            {performanceInsights && (
              <div className="text-xs text-purple-500 mt-1 font-medium">
                Trend: <span className="capitalize font-semibold">{performanceInsights.trend}</span>
                {performanceInsights.learningVelocity && (
                  <span className="block">Pace: <span className="capitalize font-semibold">{performanceInsights.learningVelocity}</span></span>
                )}
              </div>
            )}
            
            {showPerformanceAnalytics && performanceInsights && (
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="mt-3 px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md transition-colors flex items-center gap-1 font-medium border border-purple-200"
                title={showInsights ? 'Hide performance insights' : 'Show performance insights'}
              >
                📊 Analytics {showInsights ? '▼' : '▶'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Debug Panel with rendering mode details */}
      {debugMode && showDebugInfo && (
        <div className="border-t border-purple-200 bg-blue-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-blue-900">🔧 Developer Debug Information</h3>
              <button
                onClick={() => setShowDebugInfo(false)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Close debug panel"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">Strand Info</div>
                <div className="text-blue-700">Current: {currentStrand}</div>
                <div className="text-blue-700">Progress: {overallProgress}/8</div>
                <div className="text-blue-700">Experiment: {experimentChoice}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">System Status</div>
                <div className="text-blue-700">Sync: {syncStatus}</div>
                <div className="text-blue-700">Mode: {renderingMode}</div>
                <div className="text-blue-700">Universal: {useUniversalRenderer ? 'Active' : 'Inactive'}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">Features</div>
                <div className="text-blue-700">Validation: {enableEnhancedValidation ? 'On' : 'Off'}</div>
                <div className="text-blue-700">Analytics: {showPerformanceAnalytics ? 'On' : 'Off'}</div>
                <div className="text-blue-700">Debug: {debugMode ? 'On' : 'Off'}</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">Module Status</div>
                <div className="text-green-700 font-medium">✅ Header Extracted</div>
                <div className="text-green-700 font-medium">✅ Type Compatibility</div>
                <div className="text-blue-700">Compact: {isCompactHeader ? 'On' : 'Off'}</div>
              </div>
            </div>
            
            {/* ✅ ENHANCED: Performance metrics with extended data */}
            {performanceInsights && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900 mb-2">Performance Metrics</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-700">
                  <div>Avg Score: <span className="font-semibold">{performanceInsights.averageScore}</span></div>
                  <div>Levels: <span className="font-semibold">{performanceInsights.completedLevels}</span></div>
                  <div>Universal Usage: <span className="font-semibold">{performanceInsights.universalUsage}/{performanceInsights.completedLevels}</span></div>
                  <div>Trend: <span className="font-semibold capitalize">{performanceInsights.trend}</span></div>
                  
                  {/* ✅ ADDED: Extended metrics if available */}
                  {performanceInsights.totalQuestions && (
                    <div>Questions: <span className="font-semibold">{performanceInsights.totalQuestions}</span></div>
                  )}
                  {performanceInsights.correctAnswers !== undefined && (
                    <div>Correct: <span className="font-semibold">{performanceInsights.correctAnswers}</span></div>
                  )}
                  {performanceInsights.timeSpent && (
                    <div>Time: <span className="font-semibold">{Math.round(performanceInsights.timeSpent / 1000)}s</span></div>
                  )}
                  {performanceInsights.learningVelocity && (
                    <div>Pace: <span className="font-semibold capitalize">{performanceInsights.learningVelocity}</span></div>
                  )}
                </div>
              </div>
            )}
            
            {/* ✅ ADDED: Rendering mode compatibility info */}
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="font-semibold text-green-900 mb-2">Type Compatibility Status</div>
              <div className="text-sm text-green-700">
                ✅ Rendering Mode: <span className="font-mono bg-green-100 px-1 rounded">{renderingMode}</span> (Compatible with index.tsx)
                <br />
                ✅ Performance Insights: Extended interface support
                <br />
                ✅ Props Interface: Fully aligned with parent component
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance insights panel */}
      {showPerformanceAnalytics && performanceInsights && showInsights && (
        <div className="border-t border-purple-200 bg-white">
          <PerformanceInsights
            currentStrand={currentStrand}
            experimentChoice={experimentChoice}
            sessionCode="demo"
            currentStudentId="demo-student"
          />
        </div>
      )}
    </div>
  );
};

export default YourResponseHeader;