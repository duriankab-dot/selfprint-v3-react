-- Migration: Privacy Center consent columns (Phase 6 — PDPA)
-- Adds optional consent flags to personal_context table
-- Used by PrivacyCenter.tsx consent toggles

ALTER TABLE personal_context
  ADD COLUMN IF NOT EXISTS consent_analytics       BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS consent_personalization BOOLEAN DEFAULT true;

-- Index for quick lookup (optional, low cardinality but useful for analytics queries)
CREATE INDEX IF NOT EXISTS idx_personal_context_consent_analytics
  ON personal_context (consent_analytics)
  WHERE consent_analytics = false;
