-- SELFPRINT Supabase Schema
-- Tables for Twin persistence + decision tracking + worlds

-- Twin Profiles Table
CREATE TABLE IF NOT EXISTS twins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  primary_archetype text,
  secondary_archetype text,
  maturity_score integer DEFAULT 30 CHECK (maturity_score >= 0 AND maturity_score <= 100),
  evolution_stage integer DEFAULT 1 CHECK (evolution_stage >= 1 AND evolution_stage <= 5),
  system_prompt text, -- Twin's system prompt with learned patterns (P0 #3)
  awakened_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id) -- One Twin per user
);

-- Twin Memories (conversation history)
CREATE TABLE IF NOT EXISTS twin_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id uuid NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world_id text, -- 'self', 'mind', 'relationship', etc.
  role text NOT NULL CHECK (role IN ('user', 'twin', 'system')),
  content text NOT NULL,
  metadata jsonb, -- Store world context, mood, etc.
  created_at timestamp DEFAULT now()
);

-- Decisions Table
CREATE TABLE IF NOT EXISTS decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id uuid NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world_id text, -- Which world decision relates to
  title text NOT NULL,
  description text,
  options jsonb NOT NULL, -- Array of decision options
  chosen_option text,
  context jsonb, -- Background context when decision was made
  confidence integer CHECK (confidence >= 0 AND confidence <= 100),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Decision Follow-ups (legacy name)
CREATE TABLE IF NOT EXISTS decision_follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  follow_up_type text NOT NULL CHECK (follow_up_type IN ('30-day', '90-day', '180-day', '365-day')),
  scheduled_at timestamp NOT NULL,
  completed_at timestamp,
  outcome text, -- 'worked', 'didn\'t work', 'modified'
  notes text,
  created_at timestamp DEFAULT now()
);

-- Follow-up Schedule (P0 #2: Tracks 30/90/180/365 day follow-ups per decision)
CREATE TABLE IF NOT EXISTS follow_up_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid NOT NULL UNIQUE REFERENCES decisions(id) ON DELETE CASCADE,
  day30_due timestamp,
  day30_completed boolean DEFAULT false,
  day30_sent_at timestamp,
  day90_due timestamp,
  day90_completed boolean DEFAULT false,
  day90_sent_at timestamp,
  day180_due timestamp,
  day180_completed boolean DEFAULT false,
  day180_sent_at timestamp,
  day365_due timestamp,
  day365_completed boolean DEFAULT false,
  day365_sent_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Twin SICE Scores (track contribution of each intelligence engine)
CREATE TABLE IF NOT EXISTS twin_sice_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id uuid NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  sice_name text NOT NULL, -- identity, cognitive, emotional, behavioral, social, career, financial, health, decision, growth, purpose, future
  contribution_score integer DEFAULT 0 CHECK (contribution_score >= 0 AND contribution_score <= 100),
  last_active timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(twin_id, sice_name)
);

-- world_preferences and analytics_events INTENTIONALLY SKIPPED HERE.
-- 2026-08-22 SCHEMA COLLISION FOUND: both names already exist in production
-- with a different, actively-used, user_id-keyed schema:
--   world_preferences  <- supabase/migrations/20260816_world_preferences.sql
--                          (id, user_id, world_id, is_favorite, last_accessed,
--                           engagement_score) — used live by WorldContext.tsx
--                           and WorldRoutingService.ts
--   analytics_events    <- supabase/migrations/007_analytics_events.sql
--                          (id, user_id, event_type, event_data, created_at)
--                          — used live by src/services/analytics.ts and
--                           TwinEvolutionService.ts
-- The twin_id-keyed versions originally defined here were never applied
-- (CREATE TABLE IF NOT EXISTS silently no-ops against the real tables), and
-- the CREATE INDEX / RLS statements below that assumed a twin_id column on
-- these two tables would fail with "column twin_id does not exist" against
-- the real, already-live tables. Do NOT re-add twin_id-keyed versions of
-- these two names — if Twin-scoped world/analytics data is ever needed,
-- give it a distinct table name instead of colliding with these.

-- Awakening Essence (Twin birth seed data - P0 #1 fix)
CREATE TABLE IF NOT EXISTS awakening_essence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_intelligence jsonb NOT NULL,
  sice_results jsonb NOT NULL,
  synthesis jsonb,
  execution_time integer, -- milliseconds
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used')),
  twin_id uuid REFERENCES twins(id) ON DELETE SET NULL,
  used_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Personal Context (from onboarding, stored for initialization - P0 #1 fix)
CREATE TABLE IF NOT EXISTS personal_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awakening_essence_id uuid REFERENCES awakening_essence(id) ON DELETE CASCADE,
  context_data jsonb NOT NULL, -- PersonalContext object from PersonalContextInitializer
  initialized_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Decision Patterns (P0 #3: Twin learns from decision outcomes)
CREATE TABLE IF NOT EXISTS decision_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id uuid NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world text NOT NULL, -- World ID where pattern was detected
  pattern text NOT NULL, -- Human-readable pattern description
  success_rate numeric(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  sample_size integer DEFAULT 0 CHECK (sample_size >= 0),
  confidence numeric(5,2) DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  identified_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(twin_id, world) -- One pattern per world per twin
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_twins_user_id ON twins(user_id);
CREATE INDEX IF NOT EXISTS idx_twin_memories_twin_id ON twin_memories(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_memories_world ON twin_memories(world_id);
CREATE INDEX IF NOT EXISTS idx_decisions_twin_id ON decisions(twin_id);
CREATE INDEX IF NOT EXISTS idx_decision_follow_ups_decision ON decision_follow_ups(decision_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedule_decision ON follow_up_schedule(decision_id);
CREATE INDEX IF NOT EXISTS idx_twin_sice_twin_id ON twin_sice_scores(twin_id);
CREATE INDEX IF NOT EXISTS idx_awakening_essence_user_id ON awakening_essence(user_id);
CREATE INDEX IF NOT EXISTS idx_awakening_essence_status ON awakening_essence(status);
CREATE INDEX IF NOT EXISTS idx_personal_contexts_user_id ON personal_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_contexts_essence ON personal_contexts(awakening_essence_id);
CREATE INDEX IF NOT EXISTS idx_decision_patterns_twin_id ON decision_patterns(twin_id);
CREATE INDEX IF NOT EXISTS idx_decision_patterns_world ON decision_patterns(world);

-- Row Level Security (RLS) Policies
ALTER TABLE twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_sice_scores ENABLE ROW LEVEL SECURITY;
-- world_preferences / analytics_events RLS already set by their real
-- migrations (see the skip note above) — not touched here.
ALTER TABLE awakening_essence ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_patterns ENABLE ROW LEVEL SECURITY;

-- Users can only access their own Twin
CREATE POLICY "Twin access policy" ON twins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Twin memories access" ON twin_memories
  FOR ALL USING (
    twin_id IN (
      SELECT id FROM twins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Decisions access" ON decisions
  FOR ALL USING (
    twin_id IN (
      SELECT id FROM twins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Follow-ups access" ON decision_follow_ups
  FOR ALL USING (
    decision_id IN (
      SELECT id FROM decisions WHERE twin_id IN (
        SELECT id FROM twins WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "SICE scores access" ON twin_sice_scores
  FOR ALL USING (
    twin_id IN (
      SELECT id FROM twins WHERE user_id = auth.uid()
    )
  );

-- RLS for awakening_essence (P0 #1)
CREATE POLICY "Users can access own essence" ON awakening_essence
  FOR ALL USING (auth.uid() = user_id);

-- RLS for personal_contexts (P0 #1)
CREATE POLICY "Users can access own context" ON personal_contexts
  FOR ALL USING (auth.uid() = user_id);

-- RLS for follow_up_schedule (P0 #2)
CREATE POLICY "Users can access own follow-ups" ON follow_up_schedule
  FOR ALL USING (
    decision_id IN (
      SELECT id FROM decisions WHERE twin_id IN (
        SELECT id FROM twins WHERE user_id = auth.uid()
      )
    )
  );

-- RLS for decision_patterns (P0 #3)
CREATE POLICY "Users can access own patterns" ON decision_patterns
  FOR ALL USING (
    twin_id IN (
      SELECT id FROM twins WHERE user_id = auth.uid()
    )
  );
