# AUDIT DOCUMENT 7: Data Migration Plan

**Database schema changes + historical data handling**

---

## NEW SUPABASE TABLES

### Table 1: analysis_history
```sql
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('initial', 'refined', 'journal_pattern', 'decision')),
  
  -- Full response from Astrovera
  data JSONB NOT NULL,
  
  -- Source: psychology, numerology, pattern, etc.
  sources TEXT[] NOT NULL,
  
  -- Confidence scores
  confidence FLOAT DEFAULT 0.85,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  ttl_days INT DEFAULT 365
);

CREATE INDEX analysis_history_user_created ON analysis_history(user_id, created_at DESC);
```

### Table 2: pattern_insights
```sql
CREATE TABLE pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  pattern TEXT NOT NULL, -- e.g., "stress → avoidance"
  pattern_category TEXT, -- "emotional", "behavioral", "decision"
  
  first_detected TIMESTAMP,
  last_seen TIMESTAMP,
  frequency INT DEFAULT 1, -- How many times detected
  
  confidence FLOAT DEFAULT 0.75,
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX pattern_insights_user ON pattern_insights(user_id, created_at DESC);
```

### Table 3: session_logs
```sql
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  action TEXT NOT NULL, -- "analyze", "pattern_detect", "decide"
  request_size INT, -- bytes
  response_size INT,
  latency_ms INT,
  
  status TEXT CHECK (status IN ('success', 'fallback', 'error')),
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX session_logs_user ON session_logs(user_id, created_at DESC);
```

---

## SCHEMA CHANGES TO EXISTING TABLES

### auth.users (extend profile)
```json
{
  "id": "...",
  "email": "...",
  "metadata": {
    "astrovera_context": {
      "last_analysis_id": "...",
      "pattern_count": 5,
      "analysis_count": 23
    }
  }
}
```

### profiles (if exists)
- Add column: `last_analysis_at TIMESTAMP`
- Add column: `analysis_count INT DEFAULT 0`

---

## MIGRATION SCRIPT

```sql
-- 1. Create new tables
CREATE TABLE analysis_history (...);
CREATE TABLE pattern_insights (...);
CREATE TABLE session_logs (...);

-- 2. No data migration needed (fresh start)
-- Previous /api/nova calls weren't stored

-- 3. Create indexes
CREATE INDEX ... (see above)

-- 4. Set up RLS (Row Level Security)
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_analysis ON analysis_history
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE pattern_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_patterns ON pattern_insights
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_logs ON session_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Vacuum + analyze
VACUUM ANALYZE;
```

---

## CACHING STRATEGY

### Analysis Cache (24h TTL)
- Cache key: `sha256(userId + mood + birthDate + finetuneAnswers)`
- Value: Full analysis response
- TTL: 24 hours
- Storage: Supabase

### Pattern Cache (7d TTL)
- Patterns cached in `pattern_insights` table
- Refreshed weekly
- TTL: 7 days

---

## HISTORICAL DATA

**No migration needed** — Selfprint started fresh in Phase 4

If future integration needed:
1. Export `/api/nova` call history (if logged)
2. Reformat to `analysis_history` schema
3. Import via `INSERT ... ON CONFLICT`

---

## RETENTION POLICY

- **Analysis data:** 365 days (configurable)
- **Pattern insights:** Permanent (valuable)
- **Session logs:** 90 days (audit only)
- **User request:** Can request deletion (GDPR)

---

## DEPLOYMENT

1. Run migration script on production
2. Verify indexes created
3. Test RLS policies
4. Monitor for performance impact
5. Keep backups (standard Supabase practice)

---

**Document Complete** ✅
