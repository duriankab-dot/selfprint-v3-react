-- Notifications System Migration
-- Date: 2026-08-16
-- Manages push notifications, scheduling, queue, and analytics

-- Table: notification_schedule
-- Stores scheduled notifications
CREATE TABLE IF NOT EXISTS notification_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID REFERENCES twins(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: notification_queue
-- Notification queue for delivery tracking
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
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: decision_follow_ups
-- Tracks follow-up reminders for decisions
CREATE TABLE IF NOT EXISTS decision_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID REFERENCES twins(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL,
  follow_up_status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: decision_outcomes
-- Records outcomes of decisions (positive/neutral/negative)
CREATE TABLE IF NOT EXISTS decision_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL,
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('positive', 'neutral', 'negative')),
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: notification_analytics
-- Analytics tracking for notifications
CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'read', 'clicked', 'dismissed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_schedule_user ON notification_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedule_status ON notification_schedule(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_read ON notification_queue(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_decision_follow_ups_user ON decision_follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_outcomes_user ON decision_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user ON notification_analytics(user_id);

-- Row Level Security (RLS)
ALTER TABLE notification_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY schedule_rls ON notification_schedule
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY schedule_insert_rls ON notification_schedule
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY queue_rls ON notification_queue
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY queue_update_rls ON notification_queue
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY follow_ups_rls ON decision_follow_ups
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY outcomes_rls ON decision_outcomes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY outcomes_insert_rls ON decision_outcomes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY analytics_rls ON notification_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY analytics_insert_rls ON notification_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_queue_timestamp
  BEFORE UPDATE ON notification_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_timestamp();

-- Documentation
COMMENT ON TABLE notification_schedule IS 'Scheduled notifications awaiting delivery';
COMMENT ON TABLE notification_queue IS 'Delivered notifications for user access';
COMMENT ON TABLE decision_follow_ups IS 'Follow-up reminders for decisions';
COMMENT ON TABLE notification_analytics IS 'Engagement tracking for notifications';
