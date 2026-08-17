-- ============================================
-- SELFPRINT SUPABASE DATABASE SETUP
-- Copy-paste ทั้งหมดนี้ลงใน SQL Editor ของ Supabase
-- ============================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  autonomy_level INT DEFAULT 50,
  current_hub TEXT DEFAULT 'identity',
  science_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hub TEXT NOT NULL,
  mood TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  autonomy_at_time INT DEFAULT 50,
  tokens_used INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. User Insights Table
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hub TEXT NOT NULL,
  insight_text TEXT,
  confidence FLOAT DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. Decision Log Table
CREATE TABLE IF NOT EXISTS decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hub TEXT,
  decision_text TEXT NOT NULL,
  context TEXT,
  recorded_at TIMESTAMP DEFAULT now(),
  outcome TEXT,
  outcome_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- INDEXES (เร่งความเร็ว query)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_hub ON chat_messages(hub);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_insights_user ON user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_user ON decision_log(user_id);

-- ============================================
-- SUCCESS ✅
-- ถ้ากด Run แล้วไม่มี error → Tables สร้างสำเร็จ!
-- ============================================
