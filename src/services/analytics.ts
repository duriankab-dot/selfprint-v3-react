/**
 * analytics.ts
 *
 * Phase 5.7: Analytics Events — hub transitions, mood changes, feedback
 * (👍/👎), archetype accuracy. เขียนลงตาราง analytics_events (แยกจาก
 * decision_log/chat_messages, ดู supabase/migrations/007_analytics_events.sql)
 *
 * ใช้ client เดียวกับ supabase-service.ts (ต้อง login จริงเพื่อผ่าน RLS —
 * `user_id = auth.uid()`) เขียนแบบ fire-and-forget เสมอ ไม่ throw ไม่ block UI
 * — event ที่หายไปเพราะเน็ตหลุดไม่ควรทำให้ฟีเจอร์หลักพัง
 *
 * ไม่ log ถ้าไม่มี userId จริง (เคยพลาดจุดนี้มาก่อนกับ decision_log — ดู
 * docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md หัวข้อ userId ผี)
 */

import { supabase } from './supabase-service';

export type AnalyticsEventType =
  | 'hub_transition'
  | 'mood_change'
  | 'feedback'
  | 'archetype_accuracy';

export async function logEvent(
  userId: string | null | undefined,
  eventType: AnalyticsEventType,
  eventData: Record<string, unknown> = {}
): Promise<boolean> {
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
    });

    if (error) {
      console.warn('[analytics] insert failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[analytics] insert threw:', err);
    return false;
  }
}

// ---------------------------------------------------------------------
// getAnalyticsSummary (follow-up to 5.7) — query + aggregate the events
// logged above, for the user's own Dashboard. RLS already restricts this
// to `user_id = auth.uid()` rows, so this is always a personal summary,
// never cross-user — there's no admin-wide analytics view in scope here.
// ---------------------------------------------------------------------

interface RawAnalyticsEvent {
  event_type: AnalyticsEventType;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  hubVisitCounts: Record<string, number>;
  topHub: string | null;
  moodChangeCount: number;
  feedback: { helpful: number; unhelpful: number };
  /** ค่า accuracy ล่าสุดที่บันทึกไว้ (จาก archetype_accuracy event ล่าสุดตามเวลา) — null ถ้ายังไม่เคยมี */
  latestArchetypeAccuracy: number | null;
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  totalEvents: 0,
  hubVisitCounts: {},
  topHub: null,
  moodChangeCount: 0,
  feedback: { helpful: 0, unhelpful: 0 },
  latestArchetypeAccuracy: null,
};

export async function getAnalyticsSummary(
  userId: string | null | undefined
): Promise<AnalyticsSummary | null> {
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, event_data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[analytics] getAnalyticsSummary failed:', error.message);
      return null;
    }

    const rows = (data || []) as RawAnalyticsEvent[];
    if (rows.length === 0) return EMPTY_SUMMARY;

    const hubVisitCounts: Record<string, number> = {};
    let moodChangeCount = 0;
    const feedback = { helpful: 0, unhelpful: 0 };
    let latestArchetypeAccuracy: number | null = null;

    for (const row of rows) {
      const d = row.event_data || {};
      switch (row.event_type) {
        case 'hub_transition':
          if (typeof d.to === 'string') {
            hubVisitCounts[d.to] = (hubVisitCounts[d.to] || 0) + 1;
          }
          break;
        case 'mood_change':
          moodChangeCount++;
          break;
        case 'feedback':
          if (d.type === 'helpful' || d.type === 'unhelpful') {
            feedback[d.type]++;
          }
          break;
        case 'archetype_accuracy':
          // rows คือ ascending by created_at อยู่แล้ว — ตัวสุดท้ายที่เจอ = ล่าสุดจริง
          if (typeof d.accuracyLevel === 'number') {
            latestArchetypeAccuracy = d.accuracyLevel;
          }
          break;
      }
    }

    const topHub =
      Object.entries(hubVisitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      totalEvents: rows.length,
      hubVisitCounts,
      topHub,
      moodChangeCount,
      feedback,
      latestArchetypeAccuracy,
    };
  } catch (err) {
    console.warn('[analytics] getAnalyticsSummary threw:', err);
    return null;
  }
}
