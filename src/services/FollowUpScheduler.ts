/**
 * FollowUpScheduler.ts
 * Phase E Step 2B: Follow-up Automation Service
 *
 * Manages follow-up scheduling and triggering at 30/90/180/365 days.
 * Runs daily to find overdue follow-ups and notify users.
 */

import { supabase } from './supabase-service';
import type { Decision } from '../types/decision';

/**
 * Get all follow-ups due today for a Twin user
 */
export async function getOverdueFollowUps(twinId: string): Promise<Decision[]> {
  if (!supabase) return [];

  try {
    const now = new Date();

    // Query follow-up_schedule for overdue items
    const { data: schedules, error } = await supabase
      .from('follow_up_schedule')
      .select('decision_id, day30_due, day30_completed, day90_due, day90_completed, day180_due, day180_completed, day365_due, day365_completed')
      .or(
        `and(day30_due.lte.${now.toISOString()},day30_completed.is.false),` +
        `and(day90_due.lte.${now.toISOString()},day90_completed.is.false),` +
        `and(day180_due.lte.${now.toISOString()},day180_completed.is.false),` +
        `and(day365_due.lte.${now.toISOString()},day365_completed.is.false)`
      );

    if (error) {
      console.error('Error fetching overdue follow-ups:', error);
      return [];
    }

    if (!schedules || schedules.length === 0) {
      return [];
    }

    // Get the actual decisions for these schedules
    const decisionIds = schedules.map(s => s.decision_id);
    const { data: decisions, error: decisionsError } = await supabase
      .from('decision_log')
      .select('*')
      .eq('twin_id', twinId)
      .in('id', decisionIds);

    if (decisionsError) {
      console.error('Error fetching decisions:', decisionsError);
      return [];
    }

    // Map database rows to Decision type
    return decisions
      ? decisions.map(row => ({
          id: row.id,
          twinId: row.twin_id,
          world: row.world,
          question: row.question,
          options: row.options,
          twinRecommendation: row.twin_recommendation,
          userChoice: row.user_choice,
          chosenAt: row.created_at,
          context: row.context,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }))
      : [];
  } catch (err) {
    console.error('Error getting overdue follow-ups:', err);
    return [];
  }
}

/**
 * Get next follow-up milestone for a decision
 * Returns which day (30, 90, 180, 365) is next for follow-up
 */
export async function getNextFollowUpDay(decisionId: string): Promise<number | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('follow_up_schedule')
      .select('day30_completed, day90_completed, day180_completed, day365_completed')
      .eq('decision_id', decisionId)
      .single();

    if (error) {
      console.error('Error fetching follow-up schedule:', error);
      return null;
    }

    if (!data) return null;

    // Check in order: 30 → 90 → 180 → 365
    if (!data.day30_completed) return 30;
    if (!data.day90_completed) return 90;
    if (!data.day180_completed) return 180;
    if (!data.day365_completed) return 365;

    return null; // All follow-ups complete
  } catch (err) {
    console.error('Error determining next follow-up:', err);
    return null;
  }
}

/**
 * Trigger a follow-up notification for a decision
 * Called when a follow-up is due and ready to send
 * P0 #2 FIX: Send both in-app + browser push notifications
 */
export async function triggerFollowUp(decisionId: string): Promise<void> {
  if (!supabase) return;

  try {
    // Get the decision
    const { data: decision, error: decisionError } = await supabase
      .from('decision_log')
      .select('*')
      .eq('id', decisionId)
      .single();

    if (decisionError || !decision) {
      console.error('Error fetching decision for follow-up:', decisionError);
      return;
    }

    // Get the next follow-up day
    const nextDay = await getNextFollowUpDay(decisionId);
    if (!nextDay) {
      console.log(`Decision ${decisionId} has no pending follow-ups`);
      return;
    }

    const userId = decision.user_id;
    const title = `ติดตามการตัดสินใจ (Day ${nextDay})`;
    const message = `ถึงเวลาติดตามการตัดสินใจ: "${decision.question}" (${nextDay} วัน)`;

    // P0 #2 FIX: Create in-app notification
    const { error: notifError } = await supabase
      .from('notification_queue')
      .insert({
        user_id: userId,
        twin_id: decision.twin_id,
        type: 'decision_follow_up',
        title,
        message,
        status: 'delivered', // Mark as delivered (in-app available immediately)
        delivered_at: new Date().toISOString(),
        metadata: { decision_id: decisionId, day: nextDay },
      });

    if (notifError) {
      console.error('Error creating in-app notification:', notifError);
    } else {
      console.log(`In-app notification created for decision ${decisionId} on day ${nextDay}`);
    }

    // P0 #2 FIX: Send browser push notification (if user has permission)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          // Send push notification immediately
          new Notification(title, {
            body: message,
            tag: `decision-followup-${decisionId}-day${nextDay}`,
            requireInteraction: false,
            badge: '/icons/badge.png',
          });
          console.log(`Browser push notification sent for decision ${decisionId}`);
        } else if (Notification.permission !== 'denied') {
          // Request permission if not yet decided
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification(title, {
              body: message,
              tag: `decision-followup-${decisionId}-day${nextDay}`,
              requireInteraction: false,
            });
          }
        }
      } catch (pushError) {
        console.warn('Browser push notification failed (non-blocking):', pushError);
      }
    }

    // Update follow-up schedule status for audit trail
    const dayKey = `day${nextDay}_sent_at` as any;
    try {
      await supabase
        .from('follow_up_schedule')
        .update({ [dayKey]: new Date().toISOString() })
        .eq('decision_id', decisionId);
    } catch (err) {
      console.warn('Could not update follow-up sent timestamp:', err);
    }

    console.log(`✅ Follow-up dispatched for decision ${decisionId} (day ${nextDay})`);
  } catch (err) {
    console.error('Error triggering follow-up:', err);
  }
}

/**
 * Complete a follow-up and mark it as done
 * Called when user provides feedback after follow-up
 */
export async function completeFollowUp(
  decisionId: string,
  dayOffset: number
): Promise<boolean> {
  if (!supabase) return false;

  try {
    // Determine which day field to update
    const dayKey = `day${dayOffset}_completed` as
      | 'day30_completed'
      | 'day90_completed'
      | 'day180_completed'
      | 'day365_completed';

    const { error } = await supabase
      .from('follow_up_schedule')
      .update({ [dayKey]: true })
      .eq('decision_id', decisionId);

    if (error) {
      console.error(`Error completing day${dayOffset} follow-up:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error completing follow-up:', err);
    return false;
  }
}

/**
 * Get all pending follow-ups across all Twin users
 * Used by daily scheduler task
 * (Admin/system function - not for regular users)
 */
export async function getAllPendingFollowUps(): Promise<
  Array<{ decisionId: string; twinId: string; day: number }>
> {
  if (!supabase) return [];

  try {
    const now = new Date();

    // Find all schedules with incomplete follow-ups that are due
    const { data: schedules, error } = await supabase
      .from('follow_up_schedule')
      .select('decision_id, day30_due, day30_completed, day90_due, day90_completed, day180_due, day180_completed, day365_due, day365_completed')
      .or(
        `and(day30_due.lte.${now.toISOString()},day30_completed.is.false),` +
        `and(day90_due.lte.${now.toISOString()},day90_completed.is.false),` +
        `and(day180_due.lte.${now.toISOString()},day180_completed.is.false),` +
        `and(day365_due.lte.${now.toISOString()},day365_completed.is.false)`
      );

    if (error) {
      console.error('Error fetching all pending follow-ups:', error);
      return [];
    }

    if (!schedules || schedules.length === 0) {
      return [];
    }

    // Get the decision/twin info for these schedules
    const decisionIds = schedules.map(s => s.decision_id);
    const { data: decisions, error: decisionsError } = await supabase
      .from('decision_log')
      .select('id, twin_id')
      .in('id', decisionIds);

    if (decisionsError) {
      console.error('Error fetching decisions:', decisionsError);
      return [];
    }

    if (!decisions) return [];

    // Build result with which day each is pending
    const result: Array<{ decisionId: string; twinId: string; day: number }> = [];
    decisions.forEach(decision => {
      const schedule = schedules.find(s => s.decision_id === decision.id);
      if (!schedule) return;

      // Check which day is pending (not completed)
      if (schedule.day30_due && !schedule.day30_completed) {
        result.push({ decisionId: decision.id, twinId: decision.twin_id, day: 30 });
      }
      if (schedule.day90_due && !schedule.day90_completed) {
        result.push({ decisionId: decision.id, twinId: decision.twin_id, day: 90 });
      }
      if (schedule.day180_due && !schedule.day180_completed) {
        result.push({ decisionId: decision.id, twinId: decision.twin_id, day: 180 });
      }
      if (schedule.day365_due && !schedule.day365_completed) {
        result.push({ decisionId: decision.id, twinId: decision.twin_id, day: 365 });
      }
    });

    return result;
  } catch (err) {
    console.error('Error getting all pending follow-ups:', err);
    return [];
  }
}

/**
 * Daily scheduled task - runs once per day to process overdue follow-ups
 * Should be called by a cron job or serverless function
 *
 * Example: Using a scheduled task library or backend job queue
 * Every 24 hours at 08:00 UTC:
 *   const pending = await getAllPendingFollowUps();
 *   for (const item of pending) {
 *     await triggerFollowUp(item.decisionId);
 *   }
 */
export async function runDailyFollowUpTask(): Promise<{
  processed: number;
  triggered: number;
  errors: number;
}> {
  const stats = { processed: 0, triggered: 0, errors: 0 };

  try {
    const pending = await getAllPendingFollowUps();
    stats.processed = pending.length;

    for (const item of pending) {
      try {
        await triggerFollowUp(item.decisionId);
        stats.triggered++;
      } catch (err) {
        console.error(`Failed to trigger follow-up for ${item.decisionId}:`, err);
        stats.errors++;
      }
    }

    console.log(`Daily follow-up task complete: ${stats.triggered}/${stats.processed} triggered`);
    return stats;
  } catch (err) {
    console.error('Daily follow-up task failed:', err);
    stats.errors++;
    return stats;
  }
}
