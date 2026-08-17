/**
 * useNotificationEngagement.ts
 *
 * Master Direction §27 — Smart Push Timing
 *
 * Learning loop that tracks notification engagement and adjusts:
 *   - Timing (best time of day to send)
 *   - Frequency (how often)
 *   - Type preference (reflection / pattern / journey / milestone)
 *
 * Data stored in Supabase user_metadata to persist across sessions.
 * All tracking is opt-in (only runs if push is subscribed).
 *
 * Rule: never use localStorage for userId or auth — use useAuth()
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'reflection' | 'pattern' | 'journey' | 'milestone';

export interface NotificationEvent {
  type: NotificationType;
  sentAt: string;    // ISO
  openedAt?: string; // ISO — null = ignored
  respondedAt?: string; // ISO — null = dismissed
}

export interface EngagementProfile {
  events: NotificationEvent[];
  bestHour: number | null;   // 0-23
  bestDayOfWeek: number | null; // 0=Sun … 6=Sat
  preferredTypes: NotificationType[];
  averageResponseMs: number | null;
  totalSent: number;
  totalOpened: number;
  totalIgnored: number;
}

const EMPTY_PROFILE: EngagementProfile = {
  events: [],
  bestHour: null,
  bestDayOfWeek: null,
  preferredTypes: [],
  averageResponseMs: null,
  totalSent: 0,
  totalOpened: 0,
  totalIgnored: 0,
};

// ============================================================================
// Helpers
// ============================================================================

function computeBestHour(events: NotificationEvent[]): number | null {
  const opened = events.filter((e) => e.openedAt);
  if (opened.length < 3) return null;
  const hourCounts: Record<number, number> = {};
  for (const e of opened) {
    const h = new Date(e.openedAt!).getHours();
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  }
  let best = -1, bestCount = 0;
  for (const [h, count] of Object.entries(hourCounts)) {
    if (count > bestCount) { bestCount = count; best = Number(h); }
  }
  return best >= 0 ? best : null;
}

function computeBestDay(events: NotificationEvent[]): number | null {
  const opened = events.filter((e) => e.openedAt);
  if (opened.length < 5) return null;
  const dayCounts: Record<number, number> = {};
  for (const e of opened) {
    const d = new Date(e.openedAt!).getDay();
    dayCounts[d] = (dayCounts[d] ?? 0) + 1;
  }
  let best = -1, bestCount = 0;
  for (const [d, count] of Object.entries(dayCounts)) {
    if (count > bestCount) { bestCount = count; best = Number(d); }
  }
  return best >= 0 ? best : null;
}

function computePreferredTypes(events: NotificationEvent[]): NotificationType[] {
  const opened = events.filter((e) => e.openedAt);
  if (opened.length < 3) return [];
  const typeCounts: Partial<Record<NotificationType, number>> = {};
  for (const e of opened) {
    typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
  }
  return (Object.entries(typeCounts) as [NotificationType, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
}

function computeAvgResponse(events: NotificationEvent[]): number | null {
  const resp = events.filter((e) => e.openedAt && e.respondedAt);
  if (resp.length < 2) return null;
  const total = resp.reduce((s, e) => {
    return s + (new Date(e.respondedAt!).getTime() - new Date(e.openedAt!).getTime());
  }, 0);
  return Math.round(total / resp.length);
}

// ============================================================================
// Hook
// ============================================================================

export function useNotificationEngagement() {
  // ── Read profile from user_metadata ───────────────────────────────────────
  const readProfile = useCallback(async (): Promise<EngagementProfile> => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.user_metadata?.notif_engagement ?? EMPTY_PROFILE;
  }, []);

  // ── Write profile back to user_metadata ───────────────────────────────────
  const writeProfile = useCallback(async (profile: EngagementProfile) => {
    await supabase.auth.updateUser({ data: { notif_engagement: profile } });
  }, []);

  // ── Track sent notification ────────────────────────────────────────────────
  const trackSent = useCallback(async (type: NotificationType) => {
    const profile = await readProfile();
    profile.events.push({ type, sentAt: new Date().toISOString() });
    profile.totalSent += 1;
    // Keep last 200 events to avoid unbounded growth
    if (profile.events.length > 200) profile.events = profile.events.slice(-200);
    await writeProfile(profile);
  }, [readProfile, writeProfile]);

  // ── Track notification opened ──────────────────────────────────────────────
  const trackOpened = useCallback(async (type: NotificationType) => {
    const profile = await readProfile();
    // Find most recent sent event of this type without an openedAt
    const idx = [...profile.events]
      .reverse()
      .findIndex((e) => e.type === type && !e.openedAt);
    if (idx >= 0) {
      const realIdx = profile.events.length - 1 - idx;
      profile.events[realIdx].openedAt = new Date().toISOString();
    }
    profile.totalOpened += 1;
    // Recompute learning signals
    profile.bestHour = computeBestHour(profile.events);
    profile.bestDayOfWeek = computeBestDay(profile.events);
    profile.preferredTypes = computePreferredTypes(profile.events);
    profile.averageResponseMs = computeAvgResponse(profile.events);
    await writeProfile(profile);
  }, [readProfile, writeProfile]);

  // ── Track notification ignored (not opened within window) ─────────────────
  const trackIgnored = useCallback(async (_type: NotificationType) => {
    const profile = await readProfile();
    profile.totalIgnored += 1;
    await writeProfile(profile);
  }, [readProfile, writeProfile]);

  // ── Get current send recommendation ───────────────────────────────────────
  const getRecommendation = useCallback(async (): Promise<{
    suggestedHour: number;
    suggestedDay: number | null;
    preferredType: NotificationType;
    frequencyDays: number; // how many days between notifications
  }> => {
    const profile = await readProfile();
    const openRate = profile.totalSent > 0
      ? profile.totalOpened / profile.totalSent
      : 0;

    return {
      suggestedHour: profile.bestHour ?? 9, // default: 9am
      suggestedDay: profile.bestDayOfWeek,
      preferredType: profile.preferredTypes[0] ?? 'reflection',
      // If open rate < 20%, reduce frequency; if > 60%, increase
      frequencyDays: openRate < 0.2 ? 5 : openRate > 0.6 ? 2 : 3,
    };
  }, [readProfile]);

  return { trackSent, trackOpened, trackIgnored, getRecommendation, readProfile };
}
