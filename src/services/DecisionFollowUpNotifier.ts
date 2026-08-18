/**
 * DecisionFollowUpNotifier Service
 *
 * Sends follow-up notifications for decisions:
 * - Check-in reminders (24h, 7d, 30d after decision)
 * - Update prompts (how did it go?)
 * - Outcome tracking
 * - Pattern learning (extract insights from outcomes)
 */

import { supabase } from '../lib/supabase/client.js';
import { scheduleNotification } from './PushScheduler.js';

export interface DecisionFollowUp {
  decisionId: string;
  userId: string;
  twinId: string;
  decisionTitle: string;
  nextFollowUpAt: string; // ISO datetime
  followUpStage: 'initial' | '1-day' | '7-day' | '30-day' | 'complete';
  timezone: string;
}

/**
 * Schedule follow-up reminders for a decision
 * Creates 3 follow-ups: 1 day, 7 days, 30 days
 */
export async function scheduleDecisionFollowUps(
  decisionId: string,
  userId: string,
  twinId: string,
  decisionTitle: string,
  timezone: string = 'UTC'
): Promise<{ success: boolean; followUpsCreated?: number }> {
  try {
    const now = new Date();
    const followUpDays = [1, 7, 30];
    let created = 0;

    for (const days of followUpDays) {
      const followUpDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const result = await scheduleNotification({
        userId,
        twinId,
        notificationType: 'decision-reminder',
        title: `Check-in: ${decisionTitle}`,
        message: `It's been ${days} day${days > 1 ? 's' : ''} since your decision. How's it going?`,
        scheduledFor: followUpDate.toISOString(),
        timezone,
        metadata: {
          decisionId,
          followUpDays: days,
          stage: days === 1 ? '1-day' : days === 7 ? '7-day' : '30-day',
        },
      });

      if (result.success) {
        created++;
      }
    }

    // Store follow-up tracking record
    if (created > 0) {
      await supabase.from('decision_follow_ups').insert({
        decision_id: decisionId,
        user_id: userId,
        twin_id: twinId,
        follow_up_status: '1-day-scheduled',
        created_at: new Date().toISOString(),
      });
    }

    return {
      success: created > 0,
      followUpsCreated: created,
    };
  } catch (error) {
    console.error('Schedule decision follow-ups error:', error);
    return { success: false };
  }
}

/**
 * Get pending decision follow-ups for user
 */
export async function getPendingDecisionFollowUps(userId: string): Promise<DecisionFollowUp[]> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('notification_schedule')
      .select(
        `
        *,
        decisions (
          id,
          title
        )
      `
      )
      .eq('user_id', userId)
      .eq('notification_type', 'decision-reminder')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      decisionId: row.metadata?.decisionId,
      userId: row.user_id,
      twinId: row.twin_id,
      decisionTitle: row.title,
      nextFollowUpAt: row.scheduled_for,
      followUpStage: row.metadata?.stage || 'initial',
      timezone: row.timezone,
    }));
  } catch (error) {
    console.error('Get pending follow-ups error:', error);
    return [];
  }
}

/**
 * Record decision outcome after follow-up
 */
export async function recordDecisionOutcome(
  decisionId: string,
  userId: string,
  outcome: 'positive' | 'neutral' | 'negative',
  notes: string
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase.from('decision_outcomes').insert({
      decision_id: decisionId,
      user_id: userId,
      outcome,
      notes,
      recorded_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Update decision follow-up status
    await supabase
      .from('decision_follow_ups')
      .update({ follow_up_status: 'complete', completed_at: new Date().toISOString() })
      .eq('decision_id', decisionId)
      .eq('user_id', userId);

    return { success: true };
  } catch (error) {
    console.error('Record outcome error:', error);
    return { success: false };
  }
}

/**
 * Analyze decision outcomes to extract patterns
 */
export async function analyzeDecisionPatterns(userId: string): Promise<{
  successRate: number;
  commonPatterns: Array<{
    pattern: string;
    frequency: number;
    positiveOutcomeRate: number;
  }>;
}> {
  try {
    // Get recent decisions with outcomes
    const { data: outcomes, error } = await supabase
      .from('decision_outcomes')
      .select(
        `
        decision_id,
        outcome,
        decisions (
          title,
          context,
          category
        )
      `
      )
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!outcomes || outcomes.length === 0) {
      return {
        successRate: 0,
        commonPatterns: [],
      };
    }

    // Calculate success rate
    const positiveCount = outcomes.filter(o => o.outcome === 'positive').length;
    const successRate = Math.round((positiveCount / outcomes.length) * 100);

    // Extract patterns from categories
    const patternMap = new Map<string, { count: number; positive: number }>();

    outcomes.forEach(o => {
      const category = o.decisions?.[0]?.category || 'unknown';
      if (!patternMap.has(category)) {
        patternMap.set(category, { count: 0, positive: 0 });
      }

      const pattern = patternMap.get(category)!;
      pattern.count++;
      if (o.outcome === 'positive') {
        pattern.positive++;
      }
    });

    // Convert to array and sort
    const commonPatterns = Array.from(patternMap.entries())
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.count,
        positiveOutcomeRate: Math.round((data.positive / data.count) * 100),
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    return {
      successRate,
      commonPatterns,
    };
  } catch (error) {
    console.error('Analyze patterns error:', error);
    return {
      successRate: 0,
      commonPatterns: [],
    };
  }
}

/**
 * Suggest Twin guidance based on decision outcomes
 */
export async function suggestTwinGuidance(
  userId: string,
  _twinId: string
): Promise<{
  success: boolean;
  suggestions?: string[];
}> {
  try {
    const patterns = await analyzeDecisionPatterns(userId);

    if (patterns.successRate < 50) {
      // Low success rate — recommend reflection
      return {
        success: true,
        suggestions: [
          'Let\'s reflect on recent decisions. There may be patterns we can learn from.',
          'I notice your success rate could improve. Shall we explore what\'s holding you back?',
        ],
      };
    } else if (patterns.successRate > 80) {
      // High success rate — reinforce
      return {
        success: true,
        suggestions: [
          'Your decision-making is getting stronger! Keep trusting your instincts.',
          'You\'re making excellent decisions. Let\'s keep building on this momentum.',
        ],
      };
    }

    // Average — encourage analysis
    return {
      success: true,
      suggestions: [
        'Your decisions are balanced. Let\'s deepen our understanding of what works best for you.',
        'Let\'s explore the nuances in your decision-making to unlock more growth.',
      ],
    };
  } catch (error) {
    console.error('Suggest guidance error:', error);
    return { success: false };
  }
}
