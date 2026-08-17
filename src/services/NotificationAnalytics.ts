/**
 * NotificationAnalytics Service
 *
 * Tracks engagement metrics for notifications
 * - Sent, read, clicked events
 * - A/B test performance comparison
 * - User engagement patterns
 * - Decision outcome tracking
 * - Analytics dashboard data
 */

import { supabase } from '../lib/supabase/client';

export interface NotificationEngagement {
  notificationId: string;
  userId: string;
  sent: boolean;
  read: boolean;
  clicked: boolean;
  sentAt?: string;
  readAt?: string;
  clickedAt?: string;
  variant?: string;
  type: string;
}

export interface EngagementMetrics {
  totalSent: number;
  totalRead: number;
  totalClicked: number;
  readRate: number; // percentage
  clickRate: number; // percentage
  avgTimeToRead: number; // milliseconds
  avgTimeToClick: number; // milliseconds
}

export interface VariantPerformance {
  variant: string;
  sent: number;
  read: number;
  clicked: number;
  readRate: number;
  clickRate: number;
  winner?: boolean;
}

export interface DecisionOutcomeData {
  decisionId: string;
  userId: string;
  twinId: string;
  decisionText: string;
  outcome: 'positive' | 'neutral' | 'negative';
  recordedAt: string;
  followUpDay?: number; // which follow-up (1, 7, 30)
  notes?: string;
}

/**
 * Track notification sent event
 */
export async function trackNotificationSent(
  notificationId: string,
  userId: string,
  type: string,
  variant?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const { error } = await supabase.from('notification_analytics').insert({
      notification_id: notificationId,
      user_id: userId,
      event_type: 'sent',
      notification_type: type,
      variant: variant || 'default',
      event_timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Error tracking sent notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in trackNotificationSent:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Track notification read event
 */
export async function trackNotificationRead(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    // Record read event
    const { error: recordError } = await supabase.from('notification_analytics').insert({
      notification_id: notificationId,
      user_id: userId,
      event_type: 'read',
      event_timestamp: new Date().toISOString(),
    });

    if (recordError) {
      console.error('Error recording read event:', recordError);
      return { success: false, error: recordError.message };
    }

    // Update notification_queue readAt timestamp
    const { error: updateError } = await supabase
      .from('notification_queue')
      .update({
        readAt: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Error updating read timestamp:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in trackNotificationRead:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Track notification clicked event
 */
export async function trackNotificationClicked(
  notificationId: string,
  userId: string,
  actionType?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const { error } = await supabase.from('notification_analytics').insert({
      notification_id: notificationId,
      user_id: userId,
      event_type: 'clicked',
      action_type: actionType,
      event_timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Error tracking clicked notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in trackNotificationClicked:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Track decision outcome
 */
export async function trackDecisionOutcome(
  decisionId: string,
  userId: string,
  twinId: string,
  outcome: 'positive' | 'neutral' | 'negative',
  decisionText: string,
  followUpDay?: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    // Record in decision_outcomes table
    const { error: recordError } = await supabase.from('decision_outcomes').insert({
      decision_id: decisionId,
      user_id: userId,
      twin_id: twinId,
      outcome,
      decision_text: decisionText,
      follow_up_day: followUpDay,
      notes,
      recorded_at: new Date().toISOString(),
    });

    if (recordError) {
      console.error('Error recording decision outcome:', recordError);
      return { success: false, error: recordError.message };
    }

    // Log analytics event
    const { error: analyticsError } = await supabase.from('notification_analytics').insert({
      event_type: 'decision_outcome',
      user_id: userId,
      metadata: {
        decisionId,
        outcome,
        followUpDay,
      },
      event_timestamp: new Date().toISOString(),
    });

    if (analyticsError) {
      console.error('Error logging analytics event:', analyticsError);
      // Don't fail if analytics logging fails
    }

    return { success: true };
  } catch (error) {
    console.error('Error in trackDecisionOutcome:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get engagement metrics for user
 */
export async function getEngagementMetrics(
  userId: string,
  days: number = 30
): Promise<{ success: boolean; metrics?: EngagementMetrics; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get all notification events
    const { data: events, error: fetchError } = await supabase
      .from('notification_analytics')
      .select('event_type, event_timestamp, created_at')
      .eq('user_id', userId)
      .in('event_type', ['sent', 'read', 'clicked'])
      .gte('created_at', cutoffDate.toISOString());

    if (fetchError) {
      console.error('Error fetching engagement metrics:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!events || events.length === 0) {
      return {
        success: true,
        metrics: {
          totalSent: 0,
          totalRead: 0,
          totalClicked: 0,
          readRate: 0,
          clickRate: 0,
          avgTimeToRead: 0,
          avgTimeToClick: 0,
        },
      };
    }

    // Group events by notification
    const eventsByNotif: Record<string, any> = {};

    // Get full event data with notification info
    const { data: detailedEvents } = await supabase
      .from('notification_analytics')
      .select('notification_id, event_type, event_timestamp, created_at')
      .eq('user_id', userId)
      .in('event_type', ['sent', 'read', 'clicked'])
      .gte('created_at', cutoffDate.toISOString());

    if (detailedEvents) {
      detailedEvents.forEach((event) => {
        const notifId = event.notification_id || 'unknown';
        if (!eventsByNotif[notifId]) {
          eventsByNotif[notifId] = {};
        }
        eventsByNotif[notifId][event.event_type] = event;
      });
    }

    // Calculate metrics
    const totalSent = Object.keys(eventsByNotif).length;
    let totalRead = 0;
    let totalClicked = 0;
    let totalTimeToRead = 0;
    let totalTimeToClick = 0;
    let readCount = 0;
    let clickCount = 0;

    Object.values(eventsByNotif).forEach((notif: any) => {
      if (notif.sent) {
        const sentTime = new Date(notif.sent.event_timestamp || notif.sent.created_at || notif.sent.created_At).getTime();

        if (notif.read) {
          totalRead++;
          readCount++;
          const readTime = new Date(notif.read.event_timestamp || notif.read.created_at || notif.read.created_At).getTime();
          totalTimeToRead += readTime - sentTime;
        }

        if (notif.clicked) {
          totalClicked++;
          clickCount++;
          const clickTime = new Date(notif.clicked.event_timestamp || notif.clicked.created_at || notif.clicked.created_At).getTime();
          totalTimeToClick += clickTime - sentTime;
        }
      }
    });

    const metrics: EngagementMetrics = {
      totalSent,
      totalRead,
      totalClicked,
      readRate: totalSent > 0 ? (totalRead / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      avgTimeToRead: readCount > 0 ? totalTimeToRead / readCount : 0,
      avgTimeToClick: clickCount > 0 ? totalTimeToClick / clickCount : 0,
    };

    return { success: true, metrics };
  } catch (error) {
    console.error('Error in getEngagementMetrics:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Compare performance of notification variants (A/B testing)
 */
export async function compareVariantPerformance(
  variantA: string,
  variantB: string,
  days: number = 30
): Promise<{ success: boolean; comparison?: VariantPerformance[]; winner?: string; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const variants = [variantA, variantB];
    const results: VariantPerformance[] = [];

    for (const variant of variants) {
      // Get events for this variant
      const { data: events, error: fetchError } = await supabase
        .from('notification_analytics')
        .select('notification_id, event_type')
        .eq('variant', variant)
        .in('event_type', ['sent', 'read', 'clicked'])
        .gte('created_at', cutoffDate.toISOString());

      if (fetchError) {
        console.error(`Error fetching events for variant ${variant}:`, fetchError);
        continue;
      }

      if (!events) {
        continue;
      }

      const sentSet = new Set(events.filter((e) => e.event_type === 'sent').map((e) => e.notification_id));
      const readSet = new Set(events.filter((e) => e.event_type === 'read').map((e) => e.notification_id));
      const clickedSet = new Set(events.filter((e) => e.event_type === 'clicked').map((e) => e.notification_id));

      const sent = sentSet.size;
      const read = readSet.size;
      const clicked = clickedSet.size;

      results.push({
        variant,
        sent,
        read,
        clicked,
        readRate: sent > 0 ? (read / sent) * 100 : 0,
        clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
      });
    }

    // Determine winner (higher click rate is better)
    if (results.length === 2) {
      if (results[0].clickRate > results[1].clickRate) {
        results[0].winner = true;
      } else if (results[1].clickRate > results[0].clickRate) {
        results[1].winner = true;
      }
    }

    return { success: true, comparison: results, winner: results.find((r) => r.winner)?.variant };
  } catch (error) {
    console.error('Error in compareVariantPerformance:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get analytics dashboard data for user
 */
export async function getAnalyticsDashboard(
  userId: string
): Promise<{
  success: boolean;
  data?: {
    engagement: EngagementMetrics;
    decisionOutcomes: Array<{ outcome: string; count: number }>;
    topNotificationType: string;
    weeklyTrend: Array<{ date: string; sent: number; read: number }>;
  };
  error?: string;
}> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    // Get engagement metrics
    const { metrics } = await getEngagementMetrics(userId, 30);

    // Get decision outcomes summary
    const { data: outcomes } = await supabase
      .from('decision_outcomes')
      .select('outcome')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const outcomesSummary = [
      { outcome: 'positive', count: outcomes?.filter((o) => o.outcome === 'positive').length || 0 },
      { outcome: 'neutral', count: outcomes?.filter((o) => o.outcome === 'neutral').length || 0 },
      { outcome: 'negative', count: outcomes?.filter((o) => o.outcome === 'negative').length || 0 },
    ];

    // Get top notification type
    const { data: topTypes } = await supabase
      .from('notification_analytics')
      .select('notification_type, created_at')
      .eq('user_id', userId)
      .eq('event_type', 'sent')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const typeFreq: Record<string, number> = {};
    topTypes?.forEach((t: any) => {
      const notifType = t.notification_type;
      if (notifType) {
        typeFreq[notifType] = (typeFreq[notifType] || 0) + 1;
      }
    });

    const topType = Object.entries(typeFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'daily-checkin';

    // Get weekly trend (simplified)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const sent = topTypes?.filter((t) => t.created_at?.startsWith(dateStr)).length || 0;
      weeklyTrend.push({
        date: dateStr,
        sent,
        read: Math.round(sent * (metrics?.readRate || 0) / 100),
      });
    }

    return {
      success: true,
      data: {
        engagement: metrics || {
          totalSent: 0,
          totalRead: 0,
          totalClicked: 0,
          readRate: 0,
          clickRate: 0,
          avgTimeToRead: 0,
          avgTimeToClick: 0,
        },
        decisionOutcomes: outcomesSummary,
        topNotificationType: topType,
        weeklyTrend,
      },
    };
  } catch (error) {
    console.error('Error in getAnalyticsDashboard:', error);
    return { success: false, error: String(error) };
  }
}

export default {
  trackNotificationSent,
  trackNotificationRead,
  trackNotificationClicked,
  trackDecisionOutcome,
  getEngagementMetrics,
  compareVariantPerformance,
  getAnalyticsDashboard,
};
