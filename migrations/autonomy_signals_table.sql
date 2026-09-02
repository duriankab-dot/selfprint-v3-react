-- Create autonomy_signals table in selfprint schema
-- Persists autonomy levels from Twin decision-making

CREATE TABLE IF NOT EXISTS selfprint.autonomy_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES selfprint.twins(id) ON DELETE CASCADE,
  autonomy_level NUMERIC(3,1) NOT NULL CHECK (autonomy_level >= 0 AND autonomy_level <= 100),

  -- Decision context
  decision_context TEXT,
  world VARCHAR(100),
  decision_type VARCHAR(100),

  -- Twin response info
  response_summary TEXT,
  confidence_score NUMERIC(3,2),

  -- Recording timestamp
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_autonomy_signals_user_id ON selfprint.autonomy_signals(user_id);
CREATE INDEX idx_autonomy_signals_twin_id ON selfprint.autonomy_signals(twin_id);
CREATE INDEX idx_autonomy_signals_created_at ON selfprint.autonomy_signals(created_at DESC);
CREATE INDEX idx_autonomy_signals_world ON selfprint.autonomy_signals(world);

-- Row Level Security (RLS)
ALTER TABLE selfprint.autonomy_signals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own autonomy signals
CREATE POLICY "Users can see own autonomy signals"
  ON selfprint.autonomy_signals FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (server-side only)
CREATE POLICY "Service role inserts autonomy signals"
  ON selfprint.autonomy_signals FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA selfprint TO anon, authenticated, service_role;
GRANT SELECT ON selfprint.autonomy_signals TO authenticated, anon;
GRANT INSERT, SELECT ON selfprint.autonomy_signals TO service_role;
