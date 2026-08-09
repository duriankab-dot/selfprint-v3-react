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
