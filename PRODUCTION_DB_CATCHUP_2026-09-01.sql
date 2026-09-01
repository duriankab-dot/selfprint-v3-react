-- ============================================================================
-- PRODUCTION DB CATCH-UP — รัน 1 ครั้งใน Supabase Dashboard > SQL Editor
-- สร้างเมื่อ: 1 ก.ย. 2569
--
-- สาเหตุ: เทียบ `SELECT schemaname, tablename FROM pg_tables` จาก production
-- จริง กับตารางที่โค้ดต้องใช้ พบว่า migration 5 ไฟล์ต่อไปนี้ถูกเขียนและทดสอบบน
-- staging แล้ว แต่ไม่เคยถูกรันกับ production เลย — นี่คือสาเหตุหลักของ error
-- 404/PGRST205 เกือบทั้งหมดที่เจอในคอนโซล (world_stats ผิด schema แก้แยกแล้ว
-- ในโค้ด ไม่เกี่ยวกับไฟล์นี้)
--
-- ไฟล์นี้ = ต่อกันของ (เรียงตามลำดับ, ทุกตารางใช้ IF NOT EXISTS ปลอดภัย รันซ้ำได้):
--   013_journal_queue.sql
--   020_create_decision_tables.sql        (decision_outcomes, follow_up_schedule, decision_patterns)
--   029_phase_a_core_schema.sql           (twin_state, twin_personality, twin_memory, twin_capabilities,
--                                          conversations, messages, conversation_settings, conversation_memory
--                                          — twin_state/twin_personality มีอยู่แล้วใน prod, IF NOT EXISTS จะข้ามเฉยๆ)
--   030_phase_a_extended_schema.sql       (twin_evolution_history/progress, notification_schedule/queue/analytics)
--   033_community_insights.sql            (community_insights, community_insight_likes)
--
-- ไม่รวม: 011_chat_messages.sql (ตั้งใจไม่ใช้แล้ว — TwinChat ย้ายไปใช้ twin_memories
-- ที่มีอยู่จริงแทน), 012/017/019/032 (สร้างตารางที่โค้ดปัจจุบันไม่ได้เรียกใช้เลย —
-- ไม่กระทบอะไรถ้าไม่รัน), 20260825_004_twin_visual_dna.sql (โค้ดแก้ให้ใช้
-- twin_state แทนแล้ว ไม่จำเป็นต้องมีตารางนี้อีก)
--
-- วิธีใช้: copy ทั้งไฟล์ → วางใน Supabase Dashboard → SQL Editor → Run
-- ============================================================================

-- § 37 Offline Journal Queue
-- Local message queue สำหรับ sync เมื่อ online
-- ============================================================

CREATE TABLE IF NOT EXISTS public.journal_queue (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           TEXT        NOT NULL,
  hub               TEXT,      -- Hub context when saved
  mood              TEXT,      -- Mood context when saved
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at         TIMESTAMPTZ,
  sync_error        TEXT,
  sync_attempts     INT         DEFAULT 0,
  metadata          JSONB       DEFAULT '{}' -- Extra context (e.g., thread_id)
);

-- Index: fast lookup for unsynced messages
CREATE INDEX IF NOT EXISTS idx_journal_queue_unsync
  ON public.journal_queue (user_id, synced_at)
  WHERE synced_at IS NULL;

-- Index: lookup by user
CREATE INDEX IF NOT EXISTS idx_journal_queue_user
  ON public.journal_queue (user_id, created_at DESC);

-- RLS: users can only access their own queue
ALTER TABLE public.journal_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journal_queue"
  ON public.journal_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal_queue"
  ON public.journal_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal_queue"
  ON public.journal_queue FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role (via supabaseAdmin in api/journal-sync.ts) can write
-- No explicit policy needed — service role bypasses RLS
-- Phase E: Decision Intelligence Database Schema
-- Created: 2026-08-16
-- NOTE: decision_log already created by 001_decision_log_autonomy_tracking.sql
-- This migration creates supporting tables for decision tracking

-- decision_outcomes: Track follow-up results
CREATE TABLE IF NOT EXISTS decision_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decision_log(id) ON DELETE CASCADE,
  follow_up_day INT NOT NULL,       -- 30, 90, 180, 365
  feedback TEXT,
  impact VARCHAR(20),               -- "positive", "neutral", "negative"
  lessons TEXT,
  twin_confidence FLOAT DEFAULT 50, -- 0-100
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- follow_up_schedule: Manage when to follow up
CREATE TABLE IF NOT EXISTS follow_up_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decision_log(id) ON DELETE CASCADE,
  day30_due TIMESTAMP,
  day90_due TIMESTAMP,
  day180_due TIMESTAMP,
  day365_due TIMESTAMP,
  day30_completed BOOLEAN DEFAULT FALSE,
  day90_completed BOOLEAN DEFAULT FALSE,
  day180_completed BOOLEAN DEFAULT FALSE,
  day365_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- decision_patterns: Store learned patterns
CREATE TABLE IF NOT EXISTS decision_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world VARCHAR(50),
  pattern TEXT,
  success_rate FLOAT DEFAULT 50,    -- 0-100
  sample_size INT DEFAULT 0,
  confidence FLOAT DEFAULT 0,       -- 0-100
  identified_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
-- NOTE: decision_log indexes already created in 001_decision_log_autonomy_tracking.sql
CREATE INDEX IF NOT EXISTS idx_decision_outcomes_decision_id ON decision_outcomes(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_outcomes_follow_up_day ON decision_outcomes(follow_up_day);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedule_decision_id ON follow_up_schedule(decision_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedule_day30 ON follow_up_schedule(day30_due, day30_completed);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedule_day90 ON follow_up_schedule(day90_due, day90_completed);
CREATE INDEX IF NOT EXISTS idx_decision_patterns_twin_world ON decision_patterns(twin_id, world);

-- Row Level Security (RLS)
ALTER TABLE decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
-- NOTE: decision_log RLS policies already created in 001_decision_log_autonomy_tracking.sql
-- These policies would override them if uncommented
-- CREATE POLICY "Users can view own decisions" ON decision_log
--   FOR SELECT USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert own decisions" ON decision_log
--   FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can update own decisions" ON decision_log
--   FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own outcomes" ON decision_outcomes
  FOR SELECT USING (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own outcomes" ON decision_outcomes
  FOR INSERT WITH CHECK (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can view own follow-ups" ON follow_up_schedule
  FOR SELECT USING (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own follow-ups" ON follow_up_schedule
  FOR UPDATE USING (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can view own patterns" ON decision_patterns
  FOR SELECT USING (auth.uid() = twin_id);
-- Phase A Core Schema Tables (from 003_core_awakening_ceremony.sql)
-- Rescheduled to run AFTER twins table is created
-- Purpose: All dependent tables for Twin creation flow
-- Date: 2026-08-25

BEGIN TRANSACTION;

-- ============================================================================
-- Table: twin_state
-- Stores Twin's consciousness state and capabilities at each stage
-- ============================================================================
CREATE TABLE IF NOT EXISTS twin_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL UNIQUE REFERENCES twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_stage TEXT NOT NULL CHECK (current_stage IN ('seed', 'awakening', 'growing', 'advanced', 'complete')),
  consciousness_level INTEGER NOT NULL DEFAULT 1 CHECK (consciousness_level BETWEEN 1 AND 5),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: twin_personality
-- Stores Twin's personality, tone, communication style
-- ============================================================================
CREATE TABLE IF NOT EXISTS twin_personality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL UNIQUE REFERENCES twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_personality TEXT NOT NULL,
  communication_style TEXT NOT NULL DEFAULT 'thoughtful-curious',
  tone TEXT NOT NULL DEFAULT 'warm-authentic',
  expertise_areas JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NOTE: world_preferences already created by 021_world_preferences.sql
-- Skipping duplicate table definition
-- ============================================================================

-- ============================================================================
-- Table: twin_memory
-- Stores Twin's memories and experiences
-- NOTE: App expects plural "twin_memories" but this uses "twin_memory"
-- Consolidation migration (20260825_001) will handle rename
-- ============================================================================
CREATE TABLE IF NOT EXISTS twin_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: twin_capabilities
-- Tracks which features are unlocked at each Twin Evolution stage
-- ============================================================================
CREATE TABLE IF NOT EXISTS twin_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL UNIQUE REFERENCES twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('seed', 'awakening', 'growing', 'advanced', 'complete')),
  unlocked_features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  locked_features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: conversations
-- Stores conversations between user and Twin
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world TEXT NOT NULL DEFAULT 'SELF' CHECK (world IN (
    'SELF', 'MIND', 'RELATIONSHIP', 'LOVE', 'CAREER', 'WEALTH',
    'LIFE', 'GROWTH', 'DECISION', 'PURPOSE', 'WELLBEING', 'FUTURE'
  )),
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: messages
-- Stores individual messages in conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'twin')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: conversation_settings
-- Stores user-customized settings for each conversation
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  tone TEXT NOT NULL DEFAULT 'warm-curious',
  response_length TEXT NOT NULL DEFAULT 'medium',
  include_follow_up_questions BOOLEAN DEFAULT TRUE,
  include_references BOOLEAN DEFAULT FALSE,
  max_tokens_per_message INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: conversation_memory
-- Stores memory/context about each conversation
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  key_themes TEXT[] DEFAULT ARRAY[]::TEXT[],
  user_context JSONB DEFAULT '{}'::jsonb,
  twin_context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_twin_state_twin_id ON twin_state(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_state_user_id ON twin_state(user_id);
-- INDEX removed: world_preferences already created with different schema in 021
CREATE INDEX IF NOT EXISTS idx_twin_memory_type ON twin_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_conversations_twin_user ON conversations(twin_id, user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_world ON conversations(world);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE twin_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_personality ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_memory ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: Users can only see their own Twin's data
-- ============================================================================
CREATE POLICY "users_view_own_twin_state" ON twin_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_twin_state" ON twin_state
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_view_own_twin_personality" ON twin_personality
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy removed: world_preferences already has policies from 021

CREATE POLICY "users_view_own_twin_memory" ON twin_memory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_view_own_conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_view_own_messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE twin_state IS 'Stores Twin consciousness state, stage, and capabilities';
COMMENT ON TABLE twin_personality IS 'Stores Twin personality, communication style, and expertise';
COMMENT ON TABLE world_preferences IS 'Stores Twin expertise for each of 12 Intelligence Worlds';
COMMENT ON TABLE conversations IS 'Stores Twin-user conversations per world';
COMMENT ON TABLE messages IS 'Stores individual messages in conversations';

COMMIT;

SELECT 'Phase A Core Schema complete ✅' as status;
-- Phase A Extended Schema (Evolution, Notifications, Decision Learning)
-- Consolidated from 006, 007, 20260817 (all rescheduled to run AFTER twins)
-- Date: 2026-08-25

BEGIN TRANSACTION;

-- ============================================================================
-- SECTION 1: Twin Evolution System (from 006_twin_evolution.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS twin_evolution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  previous_stage INT NOT NULL CHECK (previous_stage >= 1 AND previous_stage <= 5),
  new_stage INT NOT NULL CHECK (new_stage >= 1 AND new_stage <= 5),
  evolved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metrics_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_evolution CHECK (new_stage > previous_stage)
);

CREATE TABLE IF NOT EXISTS twin_evolution_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  current_stage INT NOT NULL CHECK (current_stage >= 1 AND current_stage <= 5),
  days_since_awakening INT DEFAULT 0,
  message_count INT DEFAULT 0,
  pattern_count INT DEFAULT 0,
  memory_count INT DEFAULT 0,
  feedback_count INT DEFAULT 0,
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(twin_id)
);

CREATE INDEX IF NOT EXISTS idx_twin_evolution_user_id ON twin_evolution_history(user_id);
CREATE INDEX IF NOT EXISTS idx_twin_evolution_twin_id ON twin_evolution_history(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_evolution_evolved_at ON twin_evolution_history(evolved_at DESC);
CREATE INDEX IF NOT EXISTS idx_evolution_progress_twin_id ON twin_evolution_progress(twin_id);

ALTER TABLE twin_evolution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_evolution_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY evolution_history_rls ON twin_evolution_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY evolution_history_insert_rls ON twin_evolution_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY evolution_progress_rls ON twin_evolution_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY evolution_progress_update_rls ON twin_evolution_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION update_evolution_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evolution_progress_update_timestamp
  BEFORE UPDATE ON twin_evolution_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_evolution_progress_timestamp();

COMMENT ON TABLE twin_evolution_history IS 'Immutable log of all Twin evolution events';
COMMENT ON TABLE twin_evolution_progress IS 'Cached current progress towards next stage';

-- ============================================================================
-- SECTION 2: Notifications System (from 007_notifications.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID REFERENCES twins(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  metadata JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID REFERENCES twins(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOTE: decision_follow_ups and decision_outcomes already created by 020_create_decision_tables.sql
-- Skipping duplicate table definitions

CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'read', 'clicked', 'dismissed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_schedule_user ON notification_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedule_status ON notification_schedule(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_read ON notification_queue(user_id, read_at);
-- Indexes removed: decision_follow_ups and decision_outcomes already created with different schema in 020
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user ON notification_analytics(user_id);

ALTER TABLE notification_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
-- RLS removed for decision_follow_ups and decision_outcomes (already handled in 020)
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY schedule_rls ON notification_schedule
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY schedule_insert_rls ON notification_schedule
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY queue_rls ON notification_queue
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY queue_update_rls ON notification_queue
  FOR UPDATE USING (user_id = auth.uid());

-- Policies removed: decision_follow_ups and decision_outcomes already handled in 020

CREATE POLICY analytics_rls ON notification_analytics
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 3: Decision Learning (from 20260817_p0_3_decision_learning.sql)
-- ============================================================================

-- Add system_prompt to twins table
ALTER TABLE twins
ADD COLUMN IF NOT EXISTS system_prompt TEXT;

CREATE TABLE IF NOT EXISTS decision_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world TEXT NOT NULL,
  pattern TEXT NOT NULL,
  success_rate NUMERIC(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  sample_size INTEGER DEFAULT 0 CHECK (sample_size >= 0),
  confidence NUMERIC(5,2) DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  identified_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(twin_id, world)
);

CREATE INDEX IF NOT EXISTS idx_decision_patterns_twin_id ON decision_patterns(twin_id);
CREATE INDEX IF NOT EXISTS idx_decision_patterns_world ON decision_patterns(world);

ALTER TABLE decision_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY decision_patterns_rls ON decision_patterns
  FOR ALL USING (
    twin_id IN (
      SELECT id FROM twins WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE twin_evolution_history IS 'Immutable log of all Twin evolution events';
COMMENT ON TABLE twin_evolution_progress IS 'Cached current progress towards next stage';
COMMENT ON TABLE decision_patterns IS 'Learned decision patterns per Twin/World (P0 #3)';
COMMENT ON COLUMN twins.system_prompt IS 'Twin system prompt with learned decision patterns';

COMMIT;

SELECT 'Phase A Extended Schema complete ✅' as status;
-- Phase B.1: Community Insight Feed
-- "กระทู้แบ่งปันประสบการณ์" — user-authored excerpts shared publicly.
--
-- Privacy design decision (data minimization, per SELFPRINT senior-dev rules):
-- We do NOT auto-share raw Blueprint/SICE data (blind_spots, decision_style,
-- etc). A community insight is a short, user-WRITTEN excerpt the user chooses
-- to publish — never an automatic dump of their private analysis. This keeps
-- sensitive psychological profiling data out of the public feed by default.

CREATE TABLE IF NOT EXISTS public.community_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 500),
  world TEXT, -- optional tag: one of the 12 world ids, nullable
  display_name TEXT NOT NULL DEFAULT 'Anonymous Twin', -- user-chosen, never auto-filled from real name

  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_insights_feed
  ON public.community_insights(created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_community_insights_user_id
  ON public.community_insights(user_id);

ALTER TABLE public.community_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read published insights"
  ON public.community_insights FOR SELECT
  TO authenticated
  USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Users can post their own insights"
  ON public.community_insights FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own insights"
  ON public.community_insights FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.community_insights TO authenticated;

-- ============================================
-- public.community_insight_likes
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_insight_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES public.community_insights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (insight_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_insight_likes_insight_id
  ON public.community_insight_likes(insight_id);

ALTER TABLE public.community_insight_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read likes"
  ON public.community_insight_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like as themselves"
  ON public.community_insight_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike their own like"
  ON public.community_insight_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.community_insight_likes TO authenticated;

SELECT 'Migration complete ✅ (community_insights + community_insight_likes)' as status;

-- ============================================================================
-- DECISIONS-USERID-001 FIX (เพิ่มเอง 1 ก.ย. 2569, ไม่ได้มาจาก migration ไฟล์เดิม)
--
-- สาเหตุ: error จริงจาก production console: "column decisions.user_id does
-- not exist" (Postgres 42703). ตาราง decisions ที่มีอยู่จริง (สร้างนอกไฟล์
-- migration) มีแค่ twin_id ไม่มี user_id — แต่ src/services/sice/engines/
-- InsightEngine.ts และ PatternDetector.ts query โดย .eq('user_id', userId)
-- เพราะ SICE engines รู้จัก userId ไม่รู้จัก twinId โดยตรง
--
-- เพิ่มคอลัมน์ user_id (nullable, backfill จาก twins.user_id ผ่าน twin_id,
-- + trigger auto-fill ตอน insert ใหม่ ไม่ต้องแก้ WorldDecisionRouter.ts ที่
-- insert อยู่แล้วโดยไม่ส่ง user_id มา) แทนที่จะไปแก้ query 5 จุดให้ join twins
-- ทุกครั้ง (ช้ากว่าและเสี่ยงกว่า)
-- ============================================================================

ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

UPDATE public.decisions d
SET user_id = t.user_id
FROM public.twins t
WHERE d.twin_id = t.id AND d.user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON public.decisions(user_id);

CREATE OR REPLACE FUNCTION public.decisions_autofill_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL AND NEW.twin_id IS NOT NULL THEN
    SELECT user_id INTO NEW.user_id FROM public.twins WHERE id = NEW.twin_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decisions_autofill_user_id ON public.decisions;
CREATE TRIGGER trg_decisions_autofill_user_id
  BEFORE INSERT ON public.decisions
  FOR EACH ROW
  EXECUTE FUNCTION public.decisions_autofill_user_id();

SELECT 'DECISIONS-USERID-001 complete ✅ (user_id column + backfill + auto-fill trigger)' as status;

-- ============================================================================
-- USERPROFILES-GOALS-001 FIX (เพิ่มเอง, ไม่ได้มาจาก migration ไฟล์เดิม)
--
-- สาเหตุ: error จริง "user_profiles?select=goals_json,focus_areas" 400 Bad
-- Request — คอลัมน์นี้ไม่เคยถูกสร้างเลยในทุก migration (เช็คแล้ว) แต่
-- FutureSelfEngine.ts และ PersonalContextBuilder.ts (2 SICE engines) query
-- คอลัมน์นี้จาก user_profiles ทุกครั้งที่วิเคราะห์ — เป็นฟีเจอร์ที่ตั้งใจสร้าง
-- (มี null-guard รองรับอยู่แล้วในโค้ดทั้งคู่) แต่ยังไม่เคยมี migration จริง
-- เพิ่มคอลัมน์ nullable ให้ตรงกับที่โค้ดคาดหวัง
-- ============================================================================

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS goals_json JSONB;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS focus_areas JSONB;

SELECT 'USERPROFILES-GOALS-001 complete ✅ (goals_json + focus_areas columns)' as status;

-- ============================================================================
-- SICEFEEDBACK-001 FIX (เพิ่มเอง, ไม่ได้มาจาก migration ไฟล์เดิม)
--
-- สาเหตุ: 'sice_feedback' ไม่มีในตารางจริงเลย ไม่มี migration ไฟล์ไหนสร้างไว้
-- ด้วย — src/services/sice/engines/AIFeedbackLoop.ts มี graceful-degradation
-- อยู่แล้ว (ไม่ crash แค่ log "No feedback history available") แต่ทำให้เกิด
-- 404 รบกวน console ทุกครั้งที่วิเคราะห์ เพิ่มตารางเพื่อให้ฟีเจอร์นี้ทำงานได้จริง
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sice_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engine_id INTEGER NOT NULL,
  feedback_score INTEGER NOT NULL CHECK (feedback_score >= 0 AND feedback_score <= 100),
  feedback_type TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sice_feedback_user_id ON public.sice_feedback(user_id, created_at DESC);

ALTER TABLE public.sice_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sice feedback" ON public.sice_feedback;
CREATE POLICY "Users can view own sice feedback"
  ON public.sice_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own sice feedback" ON public.sice_feedback;
CREATE POLICY "Users can insert own sice feedback"
  ON public.sice_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON public.sice_feedback TO authenticated;

SELECT 'SICEFEEDBACK-001 complete ✅ (sice_feedback table)' as status;
