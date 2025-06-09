// src/components/YourResponse/Header/PerformanceInsights.tsx
// 🎯 EXTRACTED PERFORMANCE INSIGHTS MODULE - Analytics and performance tracking

import React from 'react';

interface PerformanceInsightsProps {
  insights: {
    averageScore: number;
    completedLevels: number;
    universalUsage: number;
    trend: 'excellent' | 'good' | 'needs-improvement';
  };
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ insights }) => {
  // ✅ Helper function to get trend icon and color
  const getTrendDisplay = (trend: string) => {
    const trendConfig = {
      excellent: { icon: '🌟', color: 'text-green-600' },
      good: { icon: '👍', color: 'text-blue-600' },
      'needs-improvement': { icon: '📚', color: 'text-yellow-600' }
    };
    
    return trendConfig[trend as keyof typeof trendConfig] || trendConfig.good;
  };

  const trendDisplay = getTrendDisplay(insights.trend);

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
      <h4 className="font-bold text-blue-800 mb-2 flex items-center">
        📊 Performance Insights
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {/* ✅ Average Score Card */}
        <div className="bg-white p-3 rounded text-center">
          <div className="text-lg font-bold text-blue-600">{insights.averageScore}</div>
          <div className="text-blue-700">Avg Score</div>
        </div>
        
        {/* ✅ Completed Levels Card */}
        <div className="bg-white p-3 rounded text-center">
          <div className="text-lg font-bold text-green-600">{insights.completedLevels}</div>
          <div className="text-green-700">Completed</div>
        </div>
        
        {/* ✅ Enhanced Usage Card */}
        <div className="bg-white p-3 rounded text-center">
          <div className="text-lg font-bold text-purple-600">{insights.universalUsage}</div>
          <div className="text-purple-700">Enhanced</div>
        </div>
        
        {/* ✅ Trend Card */}
        <div className="bg-white p-3 rounded text-center">
          <div className={`text-lg font-bold ${trendDisplay.color}`}>
            {trendDisplay.icon}
          </div>
          <div className="text-gray-700 capitalize">{insights.trend.replace('-', ' ')}</div>
        </div>
      </div>
      
      {/* ✅ Additional insights text */}
      <div className="mt-3 text-xs text-blue-600">
        {insights.trend === 'excellent' && (
          <span>🎉 Outstanding performance! You're mastering the concepts.</span>
        )}
        {insights.trend === 'good' && (
          <span>👏 Good progress! Keep building on your understanding.</span>
        )}
        {insights.trend === 'needs-improvement' && (
          <span>💪 Focus on reviewing concepts and trying different levels.</span>
        )}
      </div>
    </div>
  );
};

export default PerformanceInsights;