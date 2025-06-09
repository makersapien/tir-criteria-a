// src/components/YourResponse/Header/PerformanceInsights.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PerformanceInsightsProps {
  currentStrand: number;
  experimentChoice?: 'critical-angle' | 'fiber-optics';
  sessionCode?: string;
  currentStudentId?: string;
}

interface PerformanceData {
  questionsAttempted: number;
  questionsCompleted: number;
  averageScore: number;
  timeSpent: number;
  strongestLevel: number;
  weakestLevel: number;
  totalAttempts: number;
  successRate: number;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({
  currentStrand,
  experimentChoice,
  sessionCode,
  currentStudentId
}) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    questionsAttempted: 0,
    questionsCompleted: 0,
    averageScore: 0,
    timeSpent: 0,
    strongestLevel: 2,
    weakestLevel: 2,
    totalAttempts: 0,
    successRate: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading performance data
    const timer = setTimeout(() => {
      // Mock data - in real app would fetch from context/API
      setPerformanceData({
        questionsAttempted: 12,
        questionsCompleted: 8,
        averageScore: 6.2,
        timeSpent: 18.5, // minutes
        strongestLevel: 6,
        weakestLevel: 4,
        totalAttempts: 15,
        successRate: 73.3
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentStrand, experimentChoice, currentStudentId]);

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-sm">Loading performance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">
          📊 Performance Insights - Strand {currentStrand}
        </h3>
        <p className="text-xs text-gray-600">
          Real-time analytics for {experimentChoice} experiment
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Questions Progress */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-blue-600 font-medium mb-1">Questions</div>
          <div className="text-lg font-bold text-blue-700">
            {performanceData.questionsCompleted}/{performanceData.questionsAttempted}
          </div>
          <div className="text-xs text-blue-600">
            {Math.round((performanceData.questionsCompleted / performanceData.questionsAttempted) * 100)}% complete
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-green-600 font-medium mb-1">Avg Score</div>
          <div className={`text-lg font-bold ${getScoreColor(performanceData.averageScore)}`}>
            {performanceData.averageScore.toFixed(1)}/8
          </div>
          <div className="text-xs text-green-600">
            {performanceData.averageScore >= 6 ? '✨ Great!' : '📚 Keep going!'}
          </div>
        </div>

        {/* Time Spent */}
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-xs text-purple-600 font-medium mb-1">Time Spent</div>
          <div className="text-lg font-bold text-purple-700">
            {Math.floor(performanceData.timeSpent)}m
          </div>
          <div className="text-xs text-purple-600">
            {performanceData.timeSpent < 20 ? '⚡ Efficient' : '🕐 Thorough'}
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-xs text-yellow-600 font-medium mb-1">Success Rate</div>
          <div className={`text-lg font-bold ${getSuccessRateColor(performanceData.successRate)}`}>
            {performanceData.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-yellow-600">
            {performanceData.totalAttempts} attempts
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">💡 Quick Insights</h4>
        <div className="space-y-1 text-xs text-gray-600">
          {performanceData.averageScore < 5 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚠️</span>
              <span>Consider reviewing the guided examples before continuing</span>
            </div>
          )}
          {performanceData.strongestLevel > performanceData.weakestLevel && (
            <div className="flex items-center gap-2">
              <span className="text-green-500">💪</span>
              <span>Strongest at Level {performanceData.strongestLevel}, focus on Level {performanceData.weakestLevel}</span>
            </div>
          )}
          {performanceData.successRate > 80 && (
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🎯</span>
              <span>Excellent consistency! Ready for next strand</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;