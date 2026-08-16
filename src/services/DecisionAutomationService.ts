/**
 * DecisionAutomationService.ts
 * Handles automation for decision follow-ups at 30/90/180/365 days
 * - Generate follow-up reminders
 * - Track pending follow-ups
 * - Send notifications
 * - Generate reflection prompts
 * - Analyze decision outcomes
 */

import { supabase } from './supabase-service';
import type { Decision, FollowUp, FollowUpDays } from '../types/decision';

export interface FollowUpReminder {
  decisionId: string;
  userId: string;
  followUp: FollowUp;
  decision: Decision;
  daysRemaining: number;
  isOverdue: boolean;
}

export interface ReflectionPrompt {
  followUpDay: FollowUpDays;
  prompt: string;
  suggestedQuestions: string[];
}

export interface DecisionOutcomeAnalysis {
  decisionId: string;
  successRate: number; // 0-100
  consistency: number; // How well outcome aligned with confidence
  learnings: string[];
  recommendations: string[];
}

/**
 * Generate reflection prompts for each follow-up day
 */
export function generateReflectionPrompt(
  decision: Decision,
  followUpDay: FollowUpDays
): ReflectionPrompt {
  const prompts: Record<FollowUpDays, ReflectionPrompt> = {
    30: {
      followUpDay: 30,
      prompt: `You made the decision to "${decision.title}" about 30 days ago. How has it played out so far?`,
      suggestedQuestions: [
        'What changes have you noticed since making this decision?',
        'Are you more or less confident than when you made it?',
        'Any unexpected challenges or surprises?',
        'How is this decision impacting your daily life?',
      ],
    },
    90: {
      followUpDay: 90,
      prompt: `Three months in: How is your decision about "${decision.title}" shaping up? Time to assess progress.`,
      suggestedQuestions: [
        'What patterns are you seeing?',
        'Is this decision taking you toward or away from your goals?',
        'What have you learned about yourself through this?',
        'Would you make the same decision today?',
      ],
    },
    180: {
      followUpDay: 180,
      prompt: `Six months later: Deep reflection on "${decision.title}". This is where long-term impact becomes clear.`,
      suggestedQuestions: [
        'Looking back, what was the turning point?',
        'How has this decision compounded over time?',
        'What trade-offs have become apparent?',
        'What would you do differently if starting over?',
      ],
    },
    365: {
      followUpDay: 365,
      prompt: `One year reflection: "${decision.title}" - a full year of living with this decision.`,
      suggestedQuestions: [
        'On a scale of 0-100, how well did this decision work out?',
        'What is the biggest lesson from this year?',
        'How has this decision shaped who you are now?',
        'What would you tell your past self about this decision?',
      ],
    },
  };

  return prompts[followUpDay] || prompts[30];
}

/**
 * Get all pending follow-ups for a user (overdue or due soon)
 */
export async function getPendingFollowUpsForUser(
  userId: string
): Promise<FollowUpReminder[]> {
  if (!supabase) return [];

  try {
    const { data: decisions, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !decisions) {
      console.error('Error fetching decisions for pending follow-ups:', error);
      return [];
    }

    const reminders: FollowUpReminder[] = [];
    const today = new Date();

    decisions.forEach((decision: any) => {
      const followUps = decision.followUps || [];
      followUps.forEach((followUp: FollowUp) => {
        if (!followUp.completed) {
          const scheduledDate = new Date(followUp.scheduledDate);
          const daysRemaining = Math.ceil(
            (scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          const isOverdue = scheduledDate < today;

          // Include follow-ups that are overdue or due within 7 days
          if (isOverdue || daysRemaining <= 7) {
            reminders.push({
              decisionId: decision.id,
              userId: decision.user_id,
              followUp,
              decision,
              daysRemaining,
              isOverdue,
            });
          }
        }
      });
    });

    return reminders.sort((a, b) => {
      // Overdue first, then by scheduled date
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      return (
        new Date(a.followUp.scheduledDate).getTime() -
        new Date(b.followUp.scheduledDate).getTime()
      );
    });
  } catch (err) {
    console.error('Error getting pending follow-ups:', err);
    return [];
  }
}

/**
 * Mark follow-up as notified (notification sent)
 */
export async function markFollowUpAsNotified(
  decisionId: string,
  followUpId: string
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: decisions, error: fetchError } = await supabase
      .from('decisions')
      .select('*')
      .eq('id', decisionId);

    if (fetchError || !decisions || decisions.length === 0) {
      console.error('Decision not found:', decisionId);
      return false;
    }

    const decision = decisions[0];
    const updatedFollowUps = decision.followUps.map((f: FollowUp) => {
      if (f.id === followUpId) {
        return {
          ...f,
          notificationSent: true,
          sentAt: new Date().toISOString(),
        };
      }
      return f;
    });

    const { error: updateError } = await supabase
      .from('decisions')
      .update({ followUps: updatedFollowUps })
      .eq('id', decisionId);

    if (updateError) {
      console.error('Error marking notification:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in markFollowUpAsNotified:', err);
    return false;
  }
}

/**
 * Analyze decision outcome based on follow-up results
 */
export function analyzeDecisionOutcome(
  decision: Decision
): DecisionOutcomeAnalysis {
  const completedFollowUps = decision.followUps.filter((f) => f.completed && f.resultScore !== undefined);

  if (completedFollowUps.length === 0) {
    return {
      decisionId: decision.id,
      successRate: 0,
      consistency: 0,
      learnings: ['No completed follow-ups yet'],
      recommendations: ['Complete your follow-ups to see outcome analysis'],
    };
  }

  // Calculate success rate
  const resultScores = completedFollowUps.map((f) => f.resultScore!);
  const successRate = Math.round(resultScores.reduce((a, b) => a + b, 0) / resultScores.length);

  // Calculate consistency (how well actualOutcome matched expectation)
  const confidence = decision.confidence || 50;
  const consistency = Math.abs(successRate - confidence) <= 20 ? 80 : Math.max(0, 100 - Math.abs(successRate - confidence));

  // Extract learnings from reflections
  const learnings: string[] = [];
  completedFollowUps.forEach((fu) => {
    if (fu.reflection) {
      // Simple extraction of key phrases
      if (fu.reflection.includes('challenge') || fu.reflection.includes('difficult')) {
        learnings.push('Faced unexpected challenges');
      }
      if (fu.reflection.includes('positive') || fu.reflection.includes('better')) {
        learnings.push('Achieved better outcomes than expected');
      }
      if (fu.reflection.includes('learn') || fu.reflection.includes('lesson')) {
        learnings.push('Significant personal growth');
      }
    }
  });

  // Generate recommendations
  const recommendations: string[] = [];
  if (successRate >= 80) {
    recommendations.push('This decision was successful - trust this decision-making pattern');
  } else if (successRate >= 50) {
    recommendations.push('Mixed results - analyze what worked and what did not work');
  } else {
    recommendations.push('This decision did not work out as expected - reflect on alternatives');
  }

  if (consistency < 50) {
    recommendations.push('Your confidence level was significantly different from outcome — calibrate expectations');
  }

  return {
    decisionId: decision.id,
    successRate,
    consistency,
    learnings: learnings.length > 0 ? learnings : ['Decision completed'],
    recommendations,
  };
}

/**
 * Trigger automation: Find all pending follow-ups and send reminders
 * Called periodically (e.g., daily via cron)
 */
export async function triggerFollowUpAutomation(userId?: string): Promise<{
  processed: number;
  notified: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let notified = 0;

  try {
    if (!supabase) {
      errors.push('Supabase not configured');
      return { processed, notified, errors };
    }

    // Get all users if not specified
    let userIds: string[] = [];
    if (userId) {
      userIds = [userId];
    } else {
      // Get all users with pending follow-ups
      const { data: allDecisions, error: fetchError } = await supabase
        .from('decisions')
        .select('user_id')
        .order('user_id');

      if (fetchError || !allDecisions) {
        errors.push('Failed to fetch decisions');
        return { processed, notified, errors };
      }

      userIds = Array.from(new Set(allDecisions.map((d: any) => d.user_id)));
    }

    // Process each user
    for (const uid of userIds) {
      const reminders = await getPendingFollowUpsForUser(uid);
      processed += reminders.length;

      // Simulate sending notification (in production, use email/push service)
      for (const reminder of reminders) {
        try {
          // Mark as notified
          const marked = await markFollowUpAsNotified(
            reminder.decisionId,
            reminder.followUp.id
          );

          if (marked) {
            notified++;
            console.log(`[Decision Automation] Notified ${uid} for "${reminder.decision.title}" (${reminder.followUp.days}-day follow-up)`);
          }
        } catch (err) {
          errors.push(`Failed to notify follow-up ${reminder.followUp.id}: ${err}`);
        }
      }
    }

    return { processed, notified, errors };
  } catch (err) {
    errors.push(`Automation error: ${err}`);
    return { processed, notified, errors };
  }
}
