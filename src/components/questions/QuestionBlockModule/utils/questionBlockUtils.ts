import { QuestionResponse } from '../types/questionBlock';

export const questionBlockUtils = {
  // 🎯 Level styling (absorbed from original)
  getLevelColor: (level: number) => {
    const colors = {
      2: 'from-purple-200 to-purple-300',
      4: 'from-purple-300 to-purple-400', 
      6: 'from-purple-400 to-purple-500',
      8: 'from-purple-500 to-purple-600'
    };
    return colors[level as keyof typeof colors] || 'from-gray-200 to-gray-300';
  },

  getLevelBorderColor: (level: number) => {
    const colors = {
      2: 'border-purple-300',
      4: 'border-purple-400', 
      6: 'border-purple-500',
      8: 'border-purple-600'
    };
    return colors[level as keyof typeof colors] || 'border-gray-300';
  },

  // 🎯 Score utilities (absorbed and enhanced)
  getScoreColor: (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  },

  getScoreIcon: (score: number) => {
    if (score >= 7) return '🌟';
    if (score >= 5) return '⭐';
    if (score >= 3) return '✨';
    return '💫';
  },

  // 🎯 Progress calculations (absorbed from original)
  getCompletionRate: (responses: QuestionResponse[], totalQuestions: number) => {
    const completed = responses.filter(r => r).length;
    return (completed / totalQuestions) * 100;
  },

  getCurrentAverageScore: (responses: QuestionResponse[]) => {
    const validResponses = responses.filter(r => r);
    if (validResponses.length === 0) return 0;
    return validResponses.reduce((sum, r) => sum + r.score, 0) / validResponses.length;
  },

  // 🎯 NEW: Advanced analytics
  getPerformanceTrend: (responses: QuestionResponse[]) => {
    if (responses.length < 3) return 'insufficient-data';
    
    const recent = responses.slice(-3);
    const earlier = responses.slice(0, -3);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
    const earlierAvg = earlier.length > 0 
      ? earlier.reduce((sum, r) => sum + r.score, 0) / earlier.length 
      : recentAvg;
    
    if (recentAvg > earlierAvg + 1) return 'improving';
    if (recentAvg < earlierAvg - 1) return 'declining';
    return 'stable';
  },

  // 🎯 NEW: Difficulty assessment
  estimateQuestionDifficulty: (responses: QuestionResponse[], questionId: string) => {
    const questionResponses = responses.filter(r => r.questionId === questionId);
    if (questionResponses.length === 0) return 'unknown';
    
    const averageScore = questionResponses.reduce((sum, r) => sum + r.score, 0) / questionResponses.length;
    const averageTime = questionResponses.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / questionResponses.length;
    
    if (averageScore >= 6 && averageTime < 15000) return 'easy';
    if (averageScore >= 4 && averageTime < 30000) return 'medium';
    if (averageScore >= 2) return 'hard';
    return 'very-hard';
  },

  // 🎯 NEW: Learning recommendations
  generateRecommendations: (responses: QuestionResponse[]) => {
    const recommendations: string[] = [];
    const averageScore = questionBlockUtils.getCurrentAverageScore(responses);
    const trend = questionBlockUtils.getPerformanceTrend(responses);
    
    if (averageScore >= 7) {
      recommendations.push('🚀 Try advancing to the next level');
      recommendations.push('🎯 Focus on speed and efficiency');
    } else if (averageScore >= 5) {
      recommendations.push('📚 Review concepts before moving forward');
      recommendations.push('💪 Practice similar questions for mastery');
    } else {
      recommendations.push('🔄 Retry this level after reviewing fundamentals');
      recommendations.push('👨‍🏫 Consider seeking additional help or resources');
    }
    
    if (trend === 'improving') {
      recommendations.push('📈 Great progress! Keep up the momentum');
    } else if (trend === 'declining') {
      recommendations.push('⚠️ Take a break and return refreshed');
    }
    
    return recommendations;
  }
};
