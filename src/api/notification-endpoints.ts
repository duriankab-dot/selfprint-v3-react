/**
 * Notification API Endpoints
 *
 * POST   /api/notifications?action=schedule
 * GET    /api/notifications?action=list
 * POST   /api/notifications?action=mark-read
 * POST   /api/notifications?action=record-outcome
 */

import { supabase } from '../lib/supabase/client';
import { scheduleNotification } from '../services/PushScheduler';
import { scheduleDecisionFollowUps } from '../services/DecisionFollowUpNotifier';
import { trackNotificationSent, trackNotificationRead, trackDecisionOutcome } from '../services/NotificationAnalytics';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * GET /api/notifications?action=list
 * List user's notifications
 */
async function handleListNotifications(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: 'userId parameter required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Verify auth
    if (!supabase) {
      return Response.json(
        { success: false, error: 'Database not initialized' } as ApiResponse,
        { status: 500 }
      );
    }

    // Get notifications from queue
    const { data: notifications, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return Response.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }

    const unread = notifications?.filter((n) => !n.readAt)?.length || 0;

    return Response.json({
      success: true,
      data: {
        notifications: notifications || [],
        total: notifications?.length || 0,
        unread,
      },
      message: `Found ${notifications?.length || 0} notifications`,
    } as ApiResponse);
  } catch (error) {
    console.error('Error in handleListNotifications:', error);
    return Response.json(
      { success: false, error: String(error) } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications?action=schedule
 * Schedule a new notification
 */
async function handleScheduleNotification(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { userId, twinId, type, title, message, scheduledFor, timezone } = body;

    // Validate required fields
    if (!userId || !type) {
      return Response.json(
        { success: false, error: 'userId and type are required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Schedule notification
    const result = await scheduleNotification({
      userId,
      twinId,
      notificationType: type as any,
      title: title || 'Notification',
      message: message || '',
      scheduledFor: scheduledFor || new Date().toISOString(),
      timezone: timezone || 'UTC',
    });

    if (!result.notificationId) {
      return Response.json(
        { success: false, error: 'Failed to schedule notification' } as ApiResponse,
        { status: 500 }
      );
    }

    // Track sent event
    await trackNotificationSent(result.notificationId, userId, type);

    return Response.json({
      success: true,
      data: {
        notificationId: result.notificationId,
        status: 'scheduled',
      },
      message: 'Notification scheduled successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error in handleScheduleNotification:', error);
    return Response.json(
      { success: false, error: String(error) } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications?action=mark-read
 * Mark notification as read
 */
async function handleMarkRead(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { notificationId, userId } = body;

    if (!notificationId) {
      return Response.json(
        { success: false, error: 'notificationId is required' } as ApiResponse,
        { status: 400 }
      );
    }

    if (!supabase) {
      return Response.json(
        { success: false, error: 'Database not initialized' } as ApiResponse,
        { status: 500 }
      );
    }

    // Update read status
    const { error } = await supabase
      .from('notification_queue')
      .update({ readAt: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('userId', userId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return Response.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 500 }
      );
    }

    // Track read event
    if (userId) {
      await trackNotificationRead(notificationId, userId);
    }

    return Response.json({
      success: true,
      message: 'Notification marked as read',
    } as ApiResponse);
  } catch (error) {
    console.error('Error in handleMarkRead:', error);
    return Response.json(
      { success: false, error: String(error) } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications?action=record-outcome
 * Record decision outcome and trigger follow-ups
 */
async function handleRecordOutcome(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { decisionId, userId, twinId, decisionText, outcome, followUpDay, notes, timezone } = body;

    // Validate required fields
    if (!decisionId || !userId || !outcome || !['positive', 'neutral', 'negative'].includes(outcome)) {
      return Response.json(
        { success: false, error: 'decisionId, userId, and valid outcome are required' } as ApiResponse,
        { status: 400 }
      );
    }

    if (!supabase) {
      return Response.json(
        { success: false, error: 'Database not initialized' } as ApiResponse,
        { status: 500 }
      );
    }

    // Record the outcome
    const { error: insertError } = await supabase.from('decision_outcomes').insert({
      decision_id: decisionId,
      user_id: userId,
      twin_id: twinId,
      outcome,
      decision_text: decisionText || '',
      follow_up_day: followUpDay,
      notes,
      recorded_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error recording decision outcome:', insertError);
      return Response.json(
        { success: false, error: insertError.message } as ApiResponse,
        { status: 500 }
      );
    }

    // Track analytics
    if (twinId) {
      await trackDecisionOutcome(decisionId, userId, twinId, outcome as any, decisionText || '', followUpDay, notes);
    }

    // If this is the initial decision (not a follow-up), schedule follow-ups
    if (!followUpDay) {
      const followUpResult = await scheduleDecisionFollowUps(decisionId, userId, twinId || '', decisionText || '', timezone || 'UTC');

      if (!followUpResult.success) {
        console.warn('Failed to schedule decision follow-ups');
      }
    }

    // Analyze patterns (simplified)
    const patterns = await analyzeDecisionPatterns(userId);

    return Response.json({
      success: true,
      data: {
        outcomeRecorded: true,
        patterns: patterns || [],
      },
      message: `Decision outcome recorded as ${outcome}`,
    } as ApiResponse);
  } catch (error) {
    console.error('Error in handleRecordOutcome:', error);
    return Response.json(
      { success: false, error: String(error) } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * Analyze user's decision patterns
 */
async function analyzeDecisionPatterns(userId: string): Promise<Array<{ pattern: string; frequency: number; insight: string }> | null> {
  if (!supabase) return null;

  try {
    const { data: outcomes } = await supabase
      .from('decision_outcomes')
      .select('outcome, decision_text')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!outcomes || outcomes.length === 0) {
      return [];
    }

    // Group by outcome
    const positives = outcomes.filter((o) => o.outcome === 'positive').length;
    const negatives = outcomes.filter((o) => o.outcome === 'negative').length;

    const patterns = [];

    if (positives > 0) {
      patterns.push({
        pattern: 'Positive outcomes',
        frequency: positives,
        insight: `You've had ${positives} positive outcomes. Keep doing what works!`,
      });
    }

    if (negatives > 0) {
      patterns.push({
        pattern: 'Negative outcomes',
        frequency: negatives,
        insight: `You've had ${negatives} challenging outcomes. Consider what you learned.`,
      });
    }

    if (positives > negatives && outcomes.length >= 3) {
      patterns.push({
        pattern: 'Decision success rate',
        frequency: Math.round((positives / outcomes.length) * 100),
        insight: `Your success rate is ${Math.round((positives / outcomes.length) * 100)}%. You're on the right track!`,
      });
    }

    return patterns;
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    return null;
  }
}

/**
 * Main API handler
 */
export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'schedule':
      return handleScheduleNotification(request);
    case 'mark-read':
      return handleMarkRead(request);
    case 'record-outcome':
      return handleRecordOutcome(request);
    default:
      return Response.json(
        { success: false, error: `Unknown action: ${action}` } as ApiResponse,
        { status: 400 }
      );
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'list':
      return handleListNotifications(request);
    default:
      return Response.json(
        { success: false, error: `Unknown action: ${action}` } as ApiResponse,
        { status: 400 }
      );
  }
}

export default {
  POST,
  GET,
};
