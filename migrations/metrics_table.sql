-- Create performance_metrics table in selfprint schema
-- Persists performance metrics from PerformanceMonitor.ts

CREATE TABLE IF NOT EXISTS selfprint.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  rating VARCHAR(20) CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Web Vitals summary (nullable, may be null for non-vital metrics)
  fcp_ms NUMERIC,
  lcp_ms NUMERIC,
  inp_ms NUMERIC,
  cls_value NUMERIC,
  ttfb_ms NUMERIC,

  -- Index for queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_performance_metrics_user_id ON selfprint.performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_created_at ON selfprint.performance_metrics(created_at DESC);
CREATE INDEX idx_performance_metrics_metric_name ON selfprint.performance_metrics(metric_name);

-- Row Level Security (RLS)
ALTER TABLE selfprint.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own metrics
CREATE POLICY "Users can see own metrics"
  ON selfprint.performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Users cannot directly insert (server-side only)
CREATE POLICY "Service role inserts metrics"
  ON selfprint.performance_metrics FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA selfprint TO anon, authenticated, service_role;
GRANT SELECT ON selfprint.performance_metrics TO authenticated, anon;
GRANT INSERT, SELECT ON selfprint.performance_metrics TO service_role;
