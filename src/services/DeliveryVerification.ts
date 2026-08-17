/**
 * DeliveryVerification Service
 *
 * Tracks notification delivery status and implements retry logic
 * - Monitors delivery success/failure
 * - Retries failed notifications
 * - Logs delivery events for analytics
 * - Manages delivery queue
 */

import { supabase } from '../lib/supabase/client';

export interface DeliveryEvent {
  notificationId: string;
  userId: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  deliveryMethod: 'in-app' | 'email' | 'push' | 'sms';
  deliveredAt?: string;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
}

export interface DeliveryStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number; // 0-100
  averageDeliveryTime: number; // milliseconds
  failureReasons: Record<string, number>;
}

/**
 * Track delivery status of a notification
 */
export async function trackDeliveryStatus(
  notificationId: string,
  status: 'sent' | 'delivered' | 'failed',
  failureReason?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const timestamp = new Date().toISOString();

    // Update notification_queue status
    const { error: updateError } = await supabase
      .from('notification_queue')
      .update({
        status,
        deliveredAt: status === 'delivered' ? timestamp : null,
        metadata: {
          failureReason,
          lastStatusCheck: timestamp,
        },
      })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Error updating notification status:', updateError);
      return { success: false, error: updateError.message };
    }

    // Log delivery event
    await logDeliveryEvent({
      notificationId,
      userId: '', // Will be fetched from notification record
      status,
      deliveryMethod: 'in-app',
      deliveredAt: status === 'delivered' ? timestamp : undefined,
      failureReason,
      retryCount: 0,
      maxRetries: 3,
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking delivery status:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Retry failed notifications
 */
export async function retryFailedNotifications(
  maxRetries: number = 3,
  maxAge: number = 86400000 // 24 hours in milliseconds
): Promise<{ success: boolean; retriedCount: number; error?: string }> {
  if (!supabase) {
    return { success: false, retriedCount: 0, error: 'Supabase not initialized' };
  }

  try {
    const cutoffTime = new Date(Date.now() - maxAge).toISOString();

    // Get failed notifications within age window
    const { data: failedNotifs, error: fetchError } = await supabase
      .from('notification_queue')
      .select('id, userId, title, message, metadata')
      .eq('status', 'failed')
      .gte('createdAt', cutoffTime);

    if (fetchError) {
      console.error('Error fetching failed notifications:', fetchError);
      return { success: false, retriedCount: 0, error: fetchError.message };
    }

    if (!failedNotifs || failedNotifs.length === 0) {
      return { success: true, retriedCount: 0 };
    }

    let retriedCount = 0;

    // Retry each failed notification
    for (const notif of failedNotifs) {
      const metadata = notif.metadata || {};
      const currentRetries = metadata.retryCount || 0;

      if (currentRetries < maxRetries) {
        // Update notification for retry
        const { error: retryError } = await supabase
          .from('notification_queue')
          .update({
            status: 'pending', // Re-queue for delivery
            metadata: {
              ...metadata,
              retryCount: currentRetries + 1,
              lastRetryAt: new Date().toISOString(),
            },
          })
          .eq('id', notif.id);

        if (!retryError) {
          retriedCount++;

          // Log retry event
          await logDeliveryEvent({
            notificationId: notif.id,
            userId: notif.userId,
            status: 'pending',
            deliveryMethod: 'in-app',
            retryCount: currentRetries + 1,
            maxRetries,
            metadata: { isRetry: true },
          });
        }
      }
    }

    return { success: true, retriedCount };
  } catch (error) {
    console.error('Error retrying failed notifications:', error);
    return { success: false, retriedCount: 0, error: String(error) };
  }
}

/**
 * Log delivery event for analytics
 */
export async function logDeliveryEvent(event: DeliveryEvent): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const { error: insertError } = await supabase
      .from('notification_analytics')
      .insert({
        notification_id: event.notificationId,
        user_id: event.userId,
        event_type: 'delivery',
        event_status: event.status,
        delivery_method: event.deliveryMethod,
        delivered_at: event.deliveredAt,
        retry_count: event.retryCount,
        failure_reason: event.failureReason,
        metadata: event.metadata,
      });

    if (insertError) {
      console.error('Error logging delivery event:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in logDeliveryEvent:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get delivery statistics for user
 */
export async function getDeliveryStats(
  userId: string,
  days: number = 30
): Promise<{ success: boolean; stats?: DeliveryStats; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get delivery analytics
    const { data: deliveryData, error: fetchError } = await supabase
      .from('notification_analytics')
      .select('event_status, failure_reason, delivered_at, created_at')
      .eq('user_id', userId)
      .eq('event_type', 'delivery')
      .gte('created_at', cutoffDate.toISOString());

    if (fetchError) {
      console.error('Error fetching delivery stats:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!deliveryData || deliveryData.length === 0) {
      return {
        success: true,
        stats: {
          totalSent: 0,
          totalDelivered: 0,
          totalFailed: 0,
          deliveryRate: 0,
          averageDeliveryTime: 0,
          failureReasons: {},
        },
      };
    }

    // Calculate stats
    const totalSent = deliveryData.length;
    const totalDelivered = deliveryData.filter((d) => d.event_status === 'delivered').length;
    const totalFailed = deliveryData.filter((d) => d.event_status === 'failed').length;

    // Failure reasons breakdown
    const failureReasons: Record<string, number> = {};
    deliveryData
      .filter((d) => d.event_status === 'failed')
      .forEach((d) => {
        const reason = d.failure_reason || 'unknown';
        failureReasons[reason] = (failureReasons[reason] || 0) + 1;
      });

    // Average delivery time
    const deliveredNotifs = deliveryData.filter(
      (d) => d.event_status === 'delivered' && d.delivered_at && d.created_at
    );
    const avgDeliveryTime =
      deliveredNotifs.length > 0
        ? deliveredNotifs.reduce((sum, d) => {
            const created = new Date(d.created_at).getTime();
            const delivered = new Date(d.delivered_at).getTime();
            return sum + (delivered - created);
          }, 0) / deliveredNotifs.length
        : 0;

    const stats: DeliveryStats = {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      averageDeliveryTime: Math.round(avgDeliveryTime),
      failureReasons,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error calculating delivery stats:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Clean up old delivery logs (maintenance)
 */
export async function cleanupOldDeliveryLogs(daysToKeep: number = 90): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (!supabase) {
    return { success: false, deletedCount: 0, error: 'Supabase not initialized' };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error: deleteError, count } = await supabase
      .from('notification_analytics')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (deleteError) {
      console.error('Error cleaning up delivery logs:', deleteError);
      return { success: false, deletedCount: 0, error: deleteError.message };
    }

    return { success: true, deletedCount: count || 0 };
  } catch (error) {
    console.error('Error in cleanupOldDeliveryLogs:', error);
    return { success: false, deletedCount: 0, error: String(error) };
  }
}

export default {
  trackDeliveryStatus,
  retryFailedNotifications,
  logDeliveryEvent,
  getDeliveryStats,
  cleanupOldDeliveryLogs,
};
