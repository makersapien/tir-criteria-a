// Absorbed from UniversalQuestionRenderer.tsx
import { QuestionMetrics, LearningInsights } from '../../types/analytics';

export class PerformanceTracker {
  private static metrics: Map<string, QuestionMetrics[]> = new Map();

  // 🎯 Track question performance (absorbed and enhanced)
  static trackPerformance(
    questionId: string,
    startTime: number,
    endTime: number,
    isCorrect: boolean,
    attempts: number = 1
  ): QuestionMetrics {
    const timeSpent = endTime - startTime;
    
    const metrics: QuestionMetrics = {
      questionId,
      timeSpent,
      isCorrect,
      difficulty: this.calculateDifficulty(timeSpent, isCorrect, attempts),
      efficiency: this.calculateEfficiency(timeSpent, isCorrect),
      attempts,
      timestamp: new Date()
    };
    
    // Store metrics
    if (!this.metrics.has(questionId)) {
      this.metrics.set(questionId, []);
    }
    this.metrics.get(questionId)!.push(metrics);
    
    return metrics;
  }

  // 🎯 Calculate difficulty level
  private static calculateDifficulty(
    timeSpent: number, 
    isCorrect: boolean, 
    attempts: number
  ): QuestionMetrics['difficulty'] {
    let score = 0;
    
    // Time factor (in milliseconds)
    if (timeSpent > 60000) score += 3; // > 1 minute
    else if (timeSpent > 30000) score += 2; // > 30 seconds
    else if (timeSpent > 15000) score += 1; // > 15 seconds
    
    // Accuracy factor
    if (!isCorrect) score += 2;
    if (attempts > 1) score += attempts - 1;
    
    if (score <= 1) return 'easy';
    if (score <= 3) return 'medium';
    if (score <= 5) return 'hard';
    return 'expert';
  }

  // 🎯 Calculate efficiency
  private static calculateEfficiency(
    timeSpent: number, 
    isCorrect: boolean
  ): QuestionMetrics['efficiency'] {
    if (!isCorrect) return 'needs-improvement';
    if (timeSpent < 10000) return 'excellent'; // < 10 seconds
    if (timeSpent < 30000) return 'good'; // < 30 seconds
    return 'needs-improvement';
  }

  // 🎯 Generate learning insights (NEW enhancement)
  static generateLearningInsights(questionId: string): LearningInsights {
    const questionMetrics = this.metrics.get(questionId) || [];
    
    if (questionMetrics.length === 0) {
      return {
        averageTime: 0,
        successRate: 0,
        strengths: [],
        weaknesses: [],
        recommendations: ['Complete more questions for insights'],
        masteryLevel: 0
      };
    }

    const successRate = questionMetrics.filter(m => m.isCorrect).length / questionMetrics.length;
    const averageTime = questionMetrics.reduce((sum, m) => sum + m.timeSpent, 0) / questionMetrics.length;
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze performance patterns
    if (successRate >= 0.8) {
      strengths.push('High accuracy rate');
      recommendations.push('Try more challenging questions');
    } else if (successRate >= 0.6) {
      strengths.push('Good understanding of concepts');
      recommendations.push('Practice more to improve consistency');
    } else {
      weaknesses.push('Low accuracy rate');
      recommendations.push('Review fundamental concepts');
    }
    
    if (averageTime < 15000) {
      strengths.push('Quick response time');
    } else if (averageTime > 45000) {
      weaknesses.push('Slow response time');
      recommendations.push('Practice to improve speed');
    }
    
    const masteryLevel = Math.min(10, Math.floor(successRate * 10 + (averageTime < 30000 ? 2 : 0)));
    
    return {
      averageTime,
      successRate,
      strengths,
      weaknesses,
      recommendations,
      masteryLevel
    };
  }

  // 🎯 Get session summary
  static getSessionSummary(): { 
    totalQuestions: number; 
    averageTime: number; 
    successRate: number;
    insights: LearningInsights;
  } {
    const allMetrics = Array.from(this.metrics.values()).flat();
    
    if (allMetrics.length === 0) {
      return {
        totalQuestions: 0,
        averageTime: 0,
        successRate: 0,
        insights: {
          averageTime: 0,
          successRate: 0,
          strengths: [],
          weaknesses: [],
          recommendations: ['Start answering questions for insights'],
          masteryLevel: 0
        }
      };
    }

    const successRate = allMetrics.filter(m => m.isCorrect).length / allMetrics.length;
    const averageTime = allMetrics.reduce((sum, m) => sum + m.timeSpent, 0) / allMetrics.length;

    return {
      totalQuestions: allMetrics.length,
      averageTime,
      successRate,
      insights: {
        averageTime,
        successRate,
        strengths: successRate > 0.7 ? ['Good overall performance'] : [],
        weaknesses: successRate < 0.5 ? ['Needs improvement'] : [],
        recommendations: successRate > 0.8 ? ['Try advanced topics'] : ['Continue practicing'],
        masteryLevel: Math.floor(successRate * 10)
      }
    };
  }
}
