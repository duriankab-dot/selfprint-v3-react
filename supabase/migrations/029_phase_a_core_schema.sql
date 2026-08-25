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
