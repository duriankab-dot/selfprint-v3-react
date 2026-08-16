/**
 * DecisionService.ts
 * CRUD and follow-up management for decisions
 */

import type {
  Decision,
  FollowUp,
  DecisionStats,
  FollowUpDays,
} from '../types/decision';
import {
  getFollowUpDueDate,
  calculateSuccessRate,
  getPendingFollowUps,
} from '../types/decision';

/**
 * Create new decision and auto-schedule 30/90/180/365 follow-ups
 */
export async function createDecision(
  userId: string,
  decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt' | 'followUps'>
): Promise<{ success: boolean; decision?: Decision; message: string }> {
  try {
    if (!userId || !decision.title) {
      return { success: false, message: 'User ID and decision title required' };
    }

    const now = new Date().toISOString();
    const decisionId = `dec_${Date.now()}`;

    // Auto-create 4 follow-ups at 30, 90, 180, 365 days
    const followUpDays: FollowUpDays[] = [30, 90, 180, 365];
    const followUps: FollowUp[] = followUpDays.map((days) => ({
      id: `fu_${decisionId}_${days}`,
      decisionId,
      days,
      scheduledDate: getFollowUpDueDate(decision.decisionDate, days),
      completed: false,
      notificationSent: false,
    }));

    const newDecision: Decision = {
      ...decision,
      id: decisionId,
      userId,
      followUps,
      createdAt: now,
      updatedAt: now,
    };

    // TODO: Insert into Supabase decisions + follow_ups tables

    return {
      success: true,
      decision: newDecision,
      message: `Decision "${decision.title}" created with 4 auto-scheduled follow-ups`,
    };
  } catch (error) {
    console.error('Error creating decision:', error);
    return {
      success: false,
      message: `Creation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get all decisions for user
 */
export async function getDecisions(userId: string): Promise<Decision[]> {
  try {
    if (!userId) return [];

    // TODO: Query Supabase
    // SELECT * FROM decisions WHERE user_id = userId
    // LEFT JOIN follow_ups ...

    return [];
  } catch (error) {
    console.error('Error fetching decisions:', error);
    return [];
  }
}

/**
 * Update decision
 */
export async function updateDecision(
  decisionId: string,
  _updates: Partial<Decision>
): Promise<{ success: boolean; message: string }> {
  try {
    if (!decisionId) {
      return { success: false, message: 'Decision ID required' };
    }

    // TODO: Update Supabase decisions table

    return {
      success: true,
      message: 'Decision updated',
    };
  } catch (error) {
    console.error('Error updating decision:', error);
    return {
      success: false,
      message: 'Update failed',
    };
  }
}

/**
 * Delete decision
 */
export async function deleteDecision(decisionId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!decisionId) {
      return { success: false, message: 'Decision ID required' };
    }

    // TODO: Delete from Supabase (cascade to follow_ups)

    return {
      success: true,
      message: 'Decision deleted',
    };
  } catch (error) {
    console.error('Error deleting decision:', error);
    return {
      success: false,
      message: 'Delete failed',
    };
  }
}

/**
 * Complete a follow-up with reflection and score
 */
export async function completeFollowUp(
  followUpId: string,
  _reflection: string,
  resultScore: number
): Promise<{ success: boolean; milestone?: boolean; message: string }> {
  try {
    if (!followUpId || resultScore === undefined) {
      return { success: false, message: 'Follow-up ID and result score required' };
    }

    // TODO: Update Supabase follow_ups
    // - Set completed = true, completed_at = now
    // - Set reflection, result_score

    // Check if all follow-ups completed (milestone)
    const allCompleted = false; // TODO: query

    return {
      success: true,
      milestone: allCompleted,
      message: 'Follow-up completed',
    };
  } catch (error) {
    console.error('Error completing follow-up:', error);
    return {
      success: false,
      message: 'Completion failed',
    };
  }
}

/**
 * Get pending follow-ups for user
 */
export async function getPendingFollowUpsForUser(userId: string): Promise<FollowUp[]> {
  try {
    if (!userId) return [];

    const decisions = await getDecisions(userId);
    return getPendingFollowUps(decisions);
  } catch (error) {
    console.error('Error fetching pending follow-ups:', error);
    return [];
  }
}

/**
 * Calculate decision statistics
 */
export async function getDecisionStats(userId: string): Promise<DecisionStats> {
  try {
    if (!userId) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        pendingFollowUps: 0,
        averageConfidence: 0,
        successRate: 0,
        averageOutcome: 0,
      };
    }

    const decisions = await getDecisions(userId);
    const pending = getPendingFollowUps(decisions);

    const completed = decisions.filter((d) =>
      d.followUps?.every((f) => f.completed)
    ).length;

    const avgConfidence =
      decisions.length > 0
        ? Math.round(decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length)
        : 0;

    const successRate = calculateSuccessRate(decisions);

    const avgOutcome =
      decisions.length > 0
        ? Math.round(
            decisions.reduce((sum, d) => {
              const scores = d.followUps
                ?.filter((f) => f.resultScore !== undefined)
                .map((f) => f.resultScore || 0) || [];
              return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
            }, 0) / decisions.length
          )
        : 0;

    return {
      total: decisions.length,
      completed,
      pending: decisions.length - completed,
      pendingFollowUps: pending.length,
      averageConfidence: avgConfidence,
      successRate,
      averageOutcome: avgOutcome,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      total: 0,
      completed: 0,
      pending: 0,
      pendingFollowUps: 0,
      averageConfidence: 0,
      successRate: 0,
      averageOutcome: 0,
    };
  }
}
