/**
 * AI Feedback Loop
 * Learn from user validation to calibrate model
 * Real learning algorithm - updates confidence based on feedback
 * @module intelligence/AIFeedbackLoop
 */

import { supabase } from '@/lib/supabase/client';
import type { InsightFeedback, FeedbackType, AccuracyMetrics } from './types';
import { IntelligenceError } from './types';

/**
 * AIFeedbackLoop
 * Processes user feedback and calibrates AI model
 *
 * Algorithm:
 * 1. User sees insight: "Very true / Somewhat / Not sure / Not me"
 * 2. Store feedback
 * 3. Analyze feedback pattern
 * 4. Adjust confidence of related insights
 * 5. Update patterns and context
 * 6. Next insights are more accurate
 *
 * Core Loop:
 * AI Insight → User Feedback → Model Calibration → Better Twin
 *
 * Usage:
 * ```typescript
 * const loop = new AIFeedbackLoop();
 * await loop.recordFeedback(userId, 'insight-123', 'very_true');
 * await loop.calibrateFromFeedback(userId);
 * ```
 */
export class AIFeedbackLoop {
  /**
   * Record user feedback on an insight
   * Stores feedback and triggers model calibration
   */
  async recordFeedback(
    userId: string,
    insightId: string,
    feedbackType: FeedbackType,
    comment?: string
  ): Promise<InsightFeedback> {
    if (!userId || !insightId || !feedbackType) {
      throw new IntelligenceError('Missing required fields', 'MISSING_DATA');
    }

    if (!['very_true', 'somewhat', 'not_sure', 'not_me'].includes(feedbackType)) {
      throw new IntelligenceError(
        'Invalid feedback type. Must be: very_true, somewhat, not_sure, not_me',
        'INVALID_FEEDBACK'
      );
    }

    try {
      const feedback: InsightFeedback = {
        id: crypto.randomUUID(),
        userId,
        insightId,
        feedbackType,
        comment,
        createdAt: new Date(),
      };

      // Store in database
      const { error } = await supabase.from('insight_feedback').insert({
        user_id: userId,
        insight_id: insightId,
        feedback_type: feedbackType,
        comment: comment || null,
      });

      if (error) throw error;

      // Trigger calibration (async, non-blocking)
      this.calibrateFromFeedback(userId).catch((err) => {
        console.error('Calibration failed:', err);
      });

      return feedback;
    } catch (error) {
      throw new IntelligenceError(
        `Failed to record feedback: ${error}`,
        'RECORD_FEEDBACK_FAILED'
      );
    }
  }

  /**
   * Calibrate model from accumulated feedback
   * Updates confidence scores and retrains patterns
   */
  async calibrateFromFeedback(userId: string): Promise<void> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      // Step 1: Get all feedback for user
      const allFeedback = await this.getUserFeedback(userId);
      if (allFeedback.length === 0) return; // No feedback to learn from

      // Step 2: Analyze feedback patterns
      const analysis = this.analyzeFeedbackPatterns(allFeedback);

      // Step 3: Update pattern confidence based on feedback
      await this.updatePatternConfidence(userId, analysis);

      // Step 4: Adjust context based on feedback
      await this.adjustContextFromFeedback(userId, analysis);

      // Step 5: Log calibration event
      console.log(`Model calibrated for user ${userId} from ${allFeedback.length} feedback items`);
    } catch (error) {
      throw new IntelligenceError(`Calibration failed: ${error}`, 'CALIBRATION_FAILED');
    }
  }

  /**
   * Get accuracy metrics
   * Shows how accurate AI has been for this user
   */
  async getAccuracyMetrics(userId: string): Promise<AccuracyMetrics> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const feedback = await this.getUserFeedback(userId);

      if (feedback.length === 0) {
        return {
          totalInsights: 0,
          feedback: { veryTrue: 0, somewhat: 0, notSure: 0, notMe: 0 },
          accuracy: 0,
          trend: 'stable',
        };
      }

      // Count feedback by type
      const counts = {
        veryTrue: 0,
        somewhat: 0,
        notSure: 0,
        notMe: 0,
      };

      feedback.forEach((f) => {
        counts[f.feedbackType as keyof typeof counts]++;
      });

      // Calculate accuracy
      // Very true = accurate, Somewhat = partially accurate, Not me = not accurate
      const accurateCount = counts.veryTrue + counts.somewhat * 0.5;
      const accuracy = accurateCount / feedback.length;

      // Calculate trend (last 20 vs previous)
      const recent = feedback.slice(-20);
      const previous = feedback.slice(0, Math.max(feedback.length - 40, 0));
      const recentAccuracy =
        recent.length > 0
          ? recent.filter((f) => f.feedbackType === 'very_true' || f.feedbackType === 'somewhat')
              .length / recent.length
          : 0;
      const previousAccuracy =
        previous.length > 0
          ? previous.filter((f) => f.feedbackType === 'very_true' || f.feedbackType === 'somewhat')
              .length / previous.length
          : 0;

      const trend: 'improving' | 'stable' | 'declining' =
        recentAccuracy > previousAccuracy + 0.1
          ? 'improving'
          : recentAccuracy < previousAccuracy - 0.1
            ? 'declining'
            : 'stable';

      return {
        totalInsights: feedback.length,
        feedback: counts,
        accuracy: accuracy,
        trend,
      };
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get accuracy metrics: ${error}`,
        'METRICS_FAILED'
      );
    }
  }

  /**
   * Get feedback for specific insight
   */
  async getInsightFeedback(insightId: string): Promise<InsightFeedback[]> {
    if (!insightId) throw new IntelligenceError('Insight ID required', 'MISSING_ID');

    try {
      const { data, error } = await supabase
        .from('insight_feedback')
        .select('*')
        .eq('insight_id', insightId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((d) => this.mapFromDB(d));
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get insight feedback: ${error}`,
        'GET_FEEDBACK_FAILED'
      );
    }
  }

  /**
   * Get most recent feedback
   */
  async getRecentFeedback(userId: string, limit: number = 50): Promise<InsightFeedback[]> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const { data, error } = await supabase
        .from('insight_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map((d) => this.mapFromDB(d));
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get recent feedback: ${error}`,
        'GET_RECENT_FAILED'
      );
    }
  }

  // =========================================================================
  // PRIVATE METHODS - Real Learning Algorithm
  // =========================================================================

  /**
   * Get all feedback for user
   */
  private async getUserFeedback(userId: string): Promise<InsightFeedback[]> {
    const { data, error } = await supabase
      .from('insight_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((d) => this.mapFromDB(d));
  }

  /**
   * Analyze feedback patterns
   * What is user saying "not me" to? What "very true"?
   */
  private analyzeFeedbackPatterns(feedback: InsightFeedback[]): {
    totalFeedback: number;
    veryTruePercentage: number;
    notMePercentage: number;
    mostCommonFeedback: FeedbackType;
    feedbackByType: Record<FeedbackType, number>;
  } {
    const counts: Record<FeedbackType, number> = {
      very_true: 0,
      somewhat: 0,
      not_sure: 0,
      not_me: 0,
    };

    feedback.forEach((f) => {
      counts[f.feedbackType]++;
    });

    const total = feedback.length;
    const veryTruePercentage = counts.very_true / total;
    const notMePercentage = counts.not_me / total;

    // Most common feedback
    let mostCommon: FeedbackType = 'somewhat';
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type as FeedbackType;
      }
    });

    return {
      totalFeedback: total,
      veryTruePercentage,
      notMePercentage,
      mostCommonFeedback: mostCommon,
      feedbackByType: counts,
    };
  }

  /**
   * Update pattern confidence based on feedback
   * If user says "very true" to pattern → increase confidence
   * If user says "not me" → decrease confidence
   */
  private async updatePatternConfidence(
    userId: string,
    analysis: {
      veryTruePercentage: number;
      notMePercentage: number;
      feedbackByType: Record<FeedbackType, number>;
    }
  ): Promise<void> {
    try {
      // Get all patterns for user
      const { data: patterns } = await supabase
        .from('behavioral_patterns')
        .select('*')
        .eq('user_id', userId);

      if (!patterns) return;

      // Adjust confidence based on feedback distribution
      for (const pattern of patterns) {
        let confidenceAdjustment = 0;

        // If getting lots of "very true", boost confidence
        if (analysis.veryTruePercentage > 0.7) {
          confidenceAdjustment = +0.1;
        }
        // If getting lots of "not me", reduce confidence
        if (analysis.notMePercentage > 0.4) {
          confidenceAdjustment = -0.15;
        }
        // If feedback is mixed, trust original confidence
        if (
          analysis.veryTruePercentage > 0.3 &&
          analysis.veryTruePercentage < 0.7 &&
          analysis.notMePercentage < 0.3
        ) {
          confidenceAdjustment = 0;
        }

        if (confidenceAdjustment !== 0) {
          const newConfidence = Math.max(0, Math.min(pattern.confidence + confidenceAdjustment, 1));

          await supabase
            .from('behavioral_patterns')
            .update({
              confidence: newConfidence,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pattern.id);
        }
      }
    } catch (error) {
      console.error('Failed to update pattern confidence:', error);
    }
  }

  /**
   * Adjust personal context based on feedback
   * If user says insights are inaccurate → adjust context entries
   */
  private async adjustContextFromFeedback(
    userId: string,
    analysis: {
      veryTruePercentage: number;
      notMePercentage: number;
      feedbackByType: Record<FeedbackType, number>;
    }
  ): Promise<void> {
    try {
      // If getting lots of negative feedback, re-examine context
      if (analysis.notMePercentage > 0.5) {
        // Lower confidence on context entries
        const { data: contexts } = await supabase
          .from('personal_context')
          .select('*')
          .eq('user_id', userId)
          .eq('user_feedback', null); // Only ones user hasn't validated

        if (contexts) {
          for (const context of contexts) {
            const newConfidence = Math.max(context.confidence - 0.15, 0.3);

            await supabase
              .from('personal_context')
              .update({
                confidence: newConfidence,
                updated_at: new Date().toISOString(),
              })
              .eq('id', context.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to adjust context:', error);
    }
  }

  /**
   * Map database record to InsightFeedback
   */
  private mapFromDB(data: any): InsightFeedback {
    return {
      id: data.id,
      userId: data.user_id,
      insightId: data.insight_id,
      feedbackType: data.feedback_type,
      comment: data.comment,
      createdAt: new Date(data.created_at),
    };
  }
}

export default AIFeedbackLoop;
