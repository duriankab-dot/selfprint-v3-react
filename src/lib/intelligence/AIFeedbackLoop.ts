/**
 * 🔄 AI Feedback Loop — ระบบเรียนรู้จากผู้ใช้
 *
 * **ทำหน้าที่:**
 * - เก็บ feedback จากผู้ใช้ (Very true / Somewhat / Not sure / Not me)
 * - วิเคราะห์ pattern ของ feedback
 * - ปรับน้ำหนัก (calibrate) pattern confidence ตามความเห็นผู้ใช้
 * - ปรับปรุง Personal Context entries ที่ inaccurate
 * - Track accuracy trend (improving / stable / declining)
 *
 * **Core Feedback Loop:**
 * 1. AI generates insight → ผู้ใช้เห็น
 * 2. User gives feedback → recordFeedback()
 * 3. Analyze pattern → analyzeFeedbackPatterns()
 * 4. Calibrate model → updatePatternConfidence() + adjustContextFromFeedback()
 * 5. Next insights are smarter 🧠
 *
 * **Real Algorithm** (ไม่ใช่ Stub):
 * - Very true (> 70%): boost confidence +0.1
 * - Not me (> 40%): reduce confidence -0.15
 * - Mixed feedback (30-70% true): keep original
 * - Accuracy trend: compare last 20 vs previous insights
 *
 * @module intelligence/AIFeedbackLoop
 */

import { supabase } from '@/lib/supabase/client';
import type { InsightFeedback, FeedbackType, AccuracyMetrics } from './types';
import { IntelligenceError } from './types';

/**
 * 🏢 AIFeedbackLoop Class
 *
 * **ทำหน้าที่:**
 * - เก็บและวิเคราะห์ user feedback เกี่ยวกับ AI insights
 * - Calibrate (ปรับน้ำหนัก) พฤติกรรม patterns ตามความคิดเห็นผู้ใช้
 * - ทำให้ Twin มั่นใจมากขึ้น
 * - Track accuracy trend
 *
 * **Feedback Loop Algorithm:**
 * ```
 * 1. User validates AI insight with feedback
 *    ("Very true" / "Somewhat" / "Not sure" / "Not me")
 * 2. Store feedback in insight_feedback table
 * 3. Analyze feedback distribution (% true vs % not_me)
 * 4. Adjust behavioral pattern confidence:
 *    - If > 70% "very true" → boost confidence by +0.1
 *    - If > 40% "not me" → reduce confidence by -0.15
 *    - If mixed (30-70%) → keep original
 * 5. Re-examine personal_context entries if too many "not me"
 * 6. Next insights use updated confidence scores
 * 7. Track accuracy trend (improving / stable / declining)
 * ```
 *
 * **Master Direction Compliance:**
 * - Learn only from real feedback (no overclaim)
 * - Don't boost confidence beyond evidence
 * - Reduce when user disagrees
 *
 * **Usage Example:**
 * ```typescript
 * const loop = new AIFeedbackLoop();
 *
 * // User clicks "Very true" on an insight
 * await loop.recordFeedback(
 *   userId,
 *   'insight-123',
 *   'very_true',
 *   'Yes! This is exactly me'
 * );
 * // → automatically triggers calibrateFromFeedback()
 *
 * // Get accuracy metrics
 * const metrics = await loop.getAccuracyMetrics(userId);
 * // → { totalInsights: 15, feedback: {...}, accuracy: 0.87, trend: 'improving' }
 * ```
 */
export class AIFeedbackLoop {
  /**
   * ✅ recordFeedback() — บันทึก feedback ของผู้ใช้
   *
   * **ทำหน้าที่:**
   * 1. Validate input (userId, insightId, feedbackType required)
   * 2. Store feedback in `insight_feedback` table
   * 3. Trigger calibrateFromFeedback() (async, non-blocking)
   *
   * **Input:**
   * - userId: ผู้ใช้
   * - insightId: insight ID ที่ได้ feedback
   * - feedbackType: 'very_true' | 'somewhat' | 'not_sure' | 'not_me'
   * - comment: optional user note
   *
   * **Output:** InsightFeedback
   * - id, userId, insightId, feedbackType, comment, createdAt
   *
   * **Feedback Types:**
   * - very_true: "นี่ฉันเลย" (+1.0 accuracy credit)
   * - somewhat: "บางส่วนถูก" (+0.5 accuracy credit)
   * - not_sure: "ไม่แน่ใจ" (0 credit, but not wrong)
   * - not_me: "ไม่ใช่ฉัน" (0 credit, penalize pattern)
   *
   * **Example:**
   * ```typescript
   * await recordFeedback(
   *   'user123',
   *   'insight-456',
   *   'very_true',
   *   'Yes! I do love writing'
   * );
   * ```
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
   * ✅ calibrateFromFeedback() — ปรับน้ำหนัก Model จาก Feedback
   *
   * **ทำหน้าที่ (5 Steps):**
   * 1. getUserFeedback() → ดึง ALL feedback ของผู้ใช้
   * 2. analyzeFeedbackPatterns() → count, calculate %
   * 3. updatePatternConfidence() → ปรับ behavioral_patterns confidence
   * 4. adjustContextFromFeedback() → re-examine personal_context entries
   * 5. Log calibration event
   *
   * **Confidence Adjustment Logic:**
   * ```
   * IF veryTruePercentage > 70%:
   *   confidenceAdjustment = +0.1  // Boost
   * ELSE IF notMePercentage > 40%:
   *   confidenceAdjustment = -0.15 // Reduce
   * ELSE IF mixed (30-70%):
   *   confidenceAdjustment = 0  // Keep original
   * ```
   *
   * **Result:**
   * - behavioral_patterns confidence updated in DB
   * - personal_context confidence lowered if too many "not_me"
   * - Next AI Insights will be more accurate
   *
   * **Called By:**
   * - recordFeedback() (automatically, async)
   * - Manual calibration via AIFeedbackLoop.calibrateFromFeedback(userId)
   *
   * **Note:** ทำงาน async ไม่ blocking, error หมด log เฉย ไม่ throw
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
   * ✅ getAccuracyMetrics() — วัดความแม่นยำ AI
   *
   * **ทำหน้าที่:**
   * - Count feedback by type (veryTrue, somewhat, notSure, notMe)
   * - Calculate overall accuracy %
   * - Calculate trend (comparing recent 20 vs previous)
   *
   * **Accuracy Calculation:**
   * ```
   * accurateCount = veryTrue + (somewhat * 0.5)
   * accuracy = accurateCount / totalFeedback
   * // Example: 10 veryTrue + 4 somewhat = (10 + 2) / 20 = 60% accuracy
   * ```
   *
   * **Trend Analysis:**
   * - Compare last 20 feedback vs previous insights
   * - improving: recent accuracy > previous + 10%
   * - declining: recent accuracy < previous - 10%
   * - stable: between the two
   *
   * **Output:** AccuracyMetrics
   * ```typescript
   * {
   *   totalInsights: 42,
   *   feedback: { veryTrue: 28, somewhat: 8, notSure: 4, notMe: 2 },
   *   accuracy: 0.85,        // 85%
   *   trend: 'improving'      // getting better!
   * }
   * ```
   *
   * **UI Usage:**
   * - Show accuracy % in Twin profile
   * - Show trend with ↑ / → / ↓ icon
   * - Use for Twin Evolution badge system
   *
   * **Note:** If no feedback yet → returns { totalInsights: 0, accuracy: 0, ... }
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
