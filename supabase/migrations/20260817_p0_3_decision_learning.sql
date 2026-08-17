-- P0 #3: Decision Learning Loop Migration
-- Adds Twin system prompt + decision patterns table
-- Date: 2026-08-17

-- 1. Add system_prompt column to twins table (for learned patterns)
ALTER TABLE twins
ADD COLUMN IF NOT EXISTS system_prompt text;

COMMENT ON COLUMN twins.system_prompt IS 'Twin\'s system prompt with learned decision patterns (P0 #3)';

-- 2. Create decision_patterns table (track learned patterns)
CREATE TABLE IF NOT EXISTS decision_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id uuid NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world text NOT NULL,
  pattern text NOT NULL,
  success_rate numeric(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  sample_size integer DEFAULT 0 CHECK (sample_size >= 0),
  confidence numeric(5,2) DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  identified_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(twin_id, world)
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_decision_patterns_twin_id ON decision_patterns(twin_id);
CREATE INDEX IF NOT EXISTS idx_decision_patterns_world ON decision_patterns(world);

-- 4. Enable RLS and create policies
ALTER TABLE decision_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own patterns" ON decision_patterns
  FOR ALL USING (
    twin_id IN (
      SELECT id FROM twins WHERE user_id = auth.uid()
    )
  );

-- 5. Add comments
COMMENT ON TABLE decision_patterns IS 'Learned decision patterns per Twin/World (P0 #3)';
COMMENT ON COLUMN decision_patterns.world IS 'World ID where pattern was detected';
COMMENT ON COLUMN decision_patterns.pattern IS 'Human-readable pattern description';
COMMENT ON COLUMN decision_patterns.success_rate IS 'Success rate of decisions matching this pattern (0-100)';
COMMENT ON COLUMN decision_patterns.sample_size IS 'Number of decisions used to identify this pattern';
COMMENT ON COLUMN decision_patterns.confidence IS 'Confidence in this pattern (0-100)';
