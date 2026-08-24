-- CRITICAL FIX: Create twins table (missing foundation)
-- This must run FIRST before any migration references twins(id)

CREATE TABLE IF NOT EXISTS twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  personality_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_twins_user_id ON twins(user_id);

ALTER TABLE twins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Twin" ON twins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Twin" ON twins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Twin" ON twins
  FOR UPDATE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON twins TO authenticated, service_role;

-- Success
SELECT 'twins table created ✅' as status;
