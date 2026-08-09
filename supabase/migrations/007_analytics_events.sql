/**
 * Migration: Analytics Events (Phase 5.7)
 *
 * บันทึก event เชิงพฤติกรรมแยกจาก decision_log (ซึ่งเน้น autonomy/confidence
 * ต่อการสนทนา) และ chat_messages (เนื้อหาการสนทนา) — event ที่เก็บ:
 * hub_transition, mood_change, feedback (👍/👎), archetype_accuracy
 *
 * ใช้ schema เดียวกับ public (ตาม decision_log/chat_messages ที่มีอยู่แล้ว
 * ไม่ใช้ selfprint schema แบบ profile/blueprint/share_links — ดูเหตุผลใน
 * docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md: โปรเจกต์นี้มี schema ผสมอยู่แล้ว
 * ระหว่าง public กับ selfprint สองแบบ เลือกตามตาราง "พี่น้อง" ที่ใกล้กันที่สุด
 * — analytics_events ใกล้เคียง decision_log มากกว่า profile/blueprint)
 *
 * Run this in Supabase SQL Editor เหมือน migration อื่น ๆ
 */

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert own analytics events" ON analytics_events;

CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON analytics_events TO authenticated, service_role;

SELECT 'Migration complete ✅ (analytics_events)' as status;
