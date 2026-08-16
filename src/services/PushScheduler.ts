/**
 * PushScheduler Service
 *
 * Manages notification scheduling:
 * - Cron-based scheduling (daily, weekly, on-event)
 * - Queue management (pending → sent → delivered)
 * - Timezone-aware timing
 * - User preferences (notification settings)
 *
 * Notifications triggered by:
 * - User actions (decisions, messages, milestones)
 * - Time-based events (daily check-in, weekly review)
 * - Twin evolution (stage up)
 * - Patterns detected (insights)
 */

import { supabase } from '../lib/supabase/client';

export interface NotificationSchedule {
  id?: string;
  userId: string;
  twinId: string;
  notificationType:
    | 'daily-checkin'
    | 'decision-reminder'
    | 'twin-guidance'
    | 'evolution-milestone'
    | 'pattern-insight'
    | 'world-nudge';
  title: string;
  message: string;
  scheduledFor: string; // ISO datetime
  timezone: string; // user's timezone
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface NotificationQueue {
  id: string;
  userId: string;
  twinId?: string;
  type: string;
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  deliveredAt?: string;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Schedule a notification for future delivery
 */
export async function scheduleNotification(
  notification: NotificationSchedule
): Promise<{ success: boolean; notificationId?: string; message: string }> {
  try {
    if (!notification.userId || !notification.scheduledFor) {
      return { success: false, message: 'Missing required fields' };
    }

    const { data, error } = await supabase
      .from('notification_schedule')
      .insert({
        user_id: notification.userId,
        twin_id: notification.twinId,
        notification_type: notification.notificationType,
        title: notification.title,
        message: notification.message,
        scheduled_for: notification.scheduledFor,
        timezone: notification.timezone,
        metadata: notification.metadata,
        created_at: new Date().toISOString(),
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    return {
      success: true,
      notificationId: data.id,
      message: `Notification scheduled for ${notification.scheduledFor}`,
    };
  } catch (error) {
    console.error('Schedule notification error:', error);
    return { success: false, message: 'Failed to schedule notification' };
  }
}

/**
 * Get pending notifications (due to send now)
 */
export async function getPendingNotifications(): Promise<NotificationSchedule[]> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('notification_schedule')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      twinId: row.twin_id,
      notificationType: row.notification_type,
      title: row.title,
      message: row.message,
      scheduledFor: row.scheduled_for,
      timezone: row.timezone,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Get pending notifications error:', error);
    return [];
  }
}

/**
 * Enqueue notification for delivery
 */
export async function enqueueNotification(
  userId: string,
  twinId: string | null,
  type: string,
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; queueId?: string }> {
  try {
    const { data, error } = await supabase
      .from('notification_queue')
      .insert({
        user_id: userId,
        twin_id: twinId,
        type,
        title,
        message,
        status: 'pending',
        metadata,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, queueId: data.id };
  } catch (error) {
    console.error('Enqueue notification error:', error);
    return { success: false };
  }
}

/**
 * Get user's notification queue (unread)
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 20
): Promise<NotificationQueue[]> {
  try {
    const { data, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'delivered')
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      twinId: row.twin_id,
      type: row.type,
      title: row.title,
      message: row.message,
      status: row.status,
      deliveredAt: row.delivered_at,
      readAt: row.read_at,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Get user notifications error:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('notification_queue')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    return { success: false };
  }
}

/**
 * Process notifications (send to queue)
 * Called by cron job or background task
 */
export async function processScheduledNotifications(): Promise<{
  processed: number;
  failed: number;
}> {
  try {
    const pendingNotifications = await getPendingNotifications();

    let processed = 0;
    let failed = 0;

    for (const notification of pendingNotifications) {
      try {
        const result = await enqueueNotification(
          notification.userId,
          notification.twinId || null,
          notification.notificationType,
          notification.title,
          notification.message,
          notification.metadata
        );

        if (result.success) {
          // Mark as sent
          await supabase
            .from('notification_schedule')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', notification.id!);

          processed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
        failed++;
      }
    }

    return { processed, failed };
  } catch (error) {
    console.error('Process scheduled notifications error:', error);
    return { processed: 0, failed: 0 };
  }
}

/**
 * Get notification statistics for user
 */
export async function getNotificationStats(userId: string): Promise<{
  unread: number;
  delivered: number;
  scheduled: number;
}> {
  try {
    const [unreadResult, deliveredResult, scheduledResult] = await Promise.all([
      supabase
        .from('notification_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'delivered')
        .is('read_at', null),

      supabase
        .from('notification_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'delivered'),

      supabase
        .from('notification_schedule')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending'),
    ]);

    return {
      unread: unreadResult.count || 0,
      delivered: deliveredResult.count || 0,
      scheduled: scheduledResult.count || 0,
    };
  } catch (error) {
    console.error('Get notification stats error:', error);
    return { unread: 0, delivered: 0, scheduled: 0 };
  }
}
