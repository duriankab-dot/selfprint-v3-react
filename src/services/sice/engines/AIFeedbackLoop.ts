/**
 * SICE #4: AIFeedbackLoop
 * Processes user feedback and adjusts engine confidence scores
 * Implements continuous improvement through feedback incorporation
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput } from '../../../types/sice';

export interface FeedbackData {
  engineId: number;
  userId: string;
  feedbackScore: number; // 0-100: user satisfaction
  feedbackType: 'helpful' | 'not-helpful' | 'inaccurate' | 'valuable';
  context?: string;
}

export interface FeedbackAnalysis {
  totalFeedbackCount: number;
  averageScore: number; // Average feedback across all engines
  engineAccuracy: Map<number, number>; // engine_id -> avg score
  improvements: string[];
  warnings: string[];
}

export class AIFeedbackLoop extends SICEBase {
  constructor() {
    super(
      4,
      'AIFeedbackLoop',
      'Processes feedback and improves engine accuracy over time'
    );
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return {
          feedbackCount: 0,
          averageScore: 50,
          improvements: [],
          warnings: ['No valid user data'],
        };
      }

      try {
        const userId = input.userId;

        // Fetch recent feedback from database
        const feedbackAnalysis = await this.analyzeFeedback(userId);

        // Generate insights based on feedback patterns
        const improvements = this.generateImprovements(feedbackAnalysis);
        const warnings = this.identifyProblems(feedbackAnalysis);

        return {
          feedbackCount: feedbackAnalysis.totalFeedbackCount,
          averageScore: Math.round(feedbackAnalysis.averageScore),
          engineAccuracy: Array.from(feedbackAnalysis.engineAccuracy.entries()).map(
            ([id, score]) => ({ engineId: id, accuracy: score })
          ),
          improvements,
          warnings,
          lastUpdated: new Date().toISOString(),
        };
      } catch (err) {
        console.error('Feedback loop error:', err);
        return {
          feedbackCount: 0,
          averageScore: 50,
          improvements: [],
          warnings: ['Error processing feedback'],
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    // Confidence based on feedback volume and consistency
    const confidence = Math.min(100, 40 + (result as any).feedbackCount * 5);

    return this.createResult(result, confidence, executionTime);
  }

  /**
   * Analyze feedback from Supabase
   */
  private async analyzeFeedback(userId: string): Promise<FeedbackAnalysis> {
    try {
      if (!supabase) {
        return {
          totalFeedbackCount: 0,
          averageScore: 50,
          engineAccuracy: new Map(),
          improvements: [],
          warnings: ['Supabase unavailable'],
        };
      }

      // Query recent feedback (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: feedbackData, error } = await supabase
        .from('sice_feedback')
        .select('engine_id, feedback_score, created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo)
        .limit(100);

      if (error || !feedbackData) {
        this.log('No feedback history available');
        return {
          totalFeedbackCount: 0,
          averageScore: 50,
          engineAccuracy: new Map(),
          improvements: [],
          warnings: [],
        };
      }

      // Aggregate feedback by engine
      const engineScores = new Map<number, number[]>();
      feedbackData.forEach((fb: any) => {
        if (!engineScores.has(fb.engine_id)) {
          engineScores.set(fb.engine_id, []);
        }
        const scores = engineScores.get(fb.engine_id);
        if (scores) scores.push(fb.feedback_score);
      });

      // Calculate averages
      const engineAccuracy = new Map<number, number>();
      let totalScore = 0;
      let totalCount = 0;

      engineScores.forEach((scores, engineId) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        engineAccuracy.set(engineId, Math.round(avg));
        totalScore += scores.reduce((a, b) => a + b, 0);
        totalCount += scores.length;
      });

      const averageScore = totalCount > 0 ? totalScore / totalCount : 50;

      return {
        totalFeedbackCount: totalCount,
        averageScore,
        engineAccuracy,
        improvements: [],
        warnings: [],
      };
    } catch (err) {
      console.error('Feedback analysis error:', err);
      return {
        totalFeedbackCount: 0,
        averageScore: 50,
        engineAccuracy: new Map(),
        improvements: [],
        warnings: ['Error analyzing feedback'],
      };
    }
  }

  /**
   * Generate improvement recommendations based on feedback
   */
  private generateImprovements(analysis: FeedbackAnalysis): string[] {
    const improvements: string[] = [];

    // Find high-performing engines
    const highPerformers = Array.from(analysis.engineAccuracy.entries())
      .filter(([_, score]) => score >= 70)
      .map(([id]) => id);

    if (highPerformers.length > 0) {
      improvements.push(
        `Engines ${highPerformers.join(', ')} are performing well (70%+ accuracy)`
      );
    }

    // Identify patterns in feedback
    if (analysis.averageScore > 65) {
      improvements.push('Overall engine performance is strong - maintain current approach');
    } else if (analysis.averageScore >= 50) {
      improvements.push('Average performance acceptable - focus on edge cases');
    }

    // Recommendation based on volume
    if (analysis.totalFeedbackCount > 20) {
      improvements.push('Sufficient feedback volume for reliable adjustments');
    } else if (analysis.totalFeedbackCount > 0) {
      improvements.push('Collect more feedback for better calibration');
    }

    return improvements.slice(0, 3);
  }

  /**
   * Identify problems from feedback patterns
   */
  private identifyProblems(analysis: FeedbackAnalysis): string[] {
    const warnings: string[] = [];

    // Find low-performing engines
    const poorPerformers = Array.from(analysis.engineAccuracy.entries())
      .filter(([_, score]) => score < 40)
      .map(([id, score]) => `Engine ${id} (${score}%)`);

    if (poorPerformers.length > 0) {
      warnings.push(`Low accuracy detected: ${poorPerformers.join(', ')}`);
    }

    // Detect consistency issues
    if (analysis.averageScore < 45) {
      warnings.push('Overall performance below threshold - review engine outputs');
    }

    return warnings.slice(0, 2);
  }

  /**
   * Record feedback for an engine (to be called after Twin response)
   */
  async recordFeedback(feedback: FeedbackData): Promise<boolean> {
    try {
      if (!supabase) return false;

      const { error } = await supabase.from('sice_feedback').insert([
        {
          user_id: feedback.userId,
          engine_id: feedback.engineId,
          feedback_score: Math.max(0, Math.min(100, feedback.feedbackScore)),
          feedback_type: feedback.feedbackType,
          context: feedback.context,
          created_at: new Date().toISOString(),
        },
      ]);

      return !error;
    } catch (err) {
      console.error('Failed to record feedback:', err);
      return false;
    }
  }
}
