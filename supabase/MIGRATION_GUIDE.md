# Supabase Migration Guide — Phase 6 Setup

## 🎯 Overview

This guide helps you set up Supabase for autonomy tracking (Phase 6).

## ✅ Quick Setup

### Step 1: Run the Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project
2. Click **SQL Editor** → **New Query**
3. Copy the contents of `migrations/003_decision_log_autonomy_tracking.sql`
4. Paste into the SQL editor and click **Run**

### Step 2: Verify Table Created

1. Go to **Database** → **Tables**
2. Look for `decision_log` table
3. Verify columns:
   - `id` (UUID)
   - `user_id` (VARCHAR)
   - `hub` (VARCHAR)
   - `mood` (VARCHAR)
   - `autonomy_level` (INTEGER, 0-100)
   - `confidence` (DECIMAL, 0-1)
   - `hesitation` (DECIMAL, 0-1)
   - `response_time_ms` (INTEGER)
   - `message_length` (INTEGER)
   - `response_length` (INTEGER)
   - `created_at` (TIMESTAMP)

### Step 3: Check RLS Policies

1. Go to **Authentication** → **Policies**
2. Verify these policies exist on `decision_log`:
   - ✅ `Users can view own decision log`
   - ✅ `Users can insert own decision log`

### Step 4: Verify Analytics View

1. Go to **Database** → **Views**
2. Look for `autonomy_analytics` view
3. This provides pre-aggregated data for Dashboard (Phase 7)

## 🚀 What's Next?

### Frontend Integration

The following functions are now available:

```typescript
// In useChat hook
await axios.post(`${apiUrl}/api/autonomy-log`, {
  user_id: userId,
  hub: currentHub,
  mood: currentMood,
  autonomy_level: autonomyLevel,
  confidence,
  hesitation,
  response_time_ms: responseTime,
  message_length: userMessage.length,
  response_length: response.data.content.length,
});
```

### Supabase Service

```typescript
// In src/services/supabase-service.ts
export async function saveAutonomyLog(
  userId: string,
  hub: string,
  mood: string,
  autonomyLevel: number,
  confidence: number,
  hesitation: number,
  responseTimeMs: number,
  messageLength?: number,
  responseLength?: number
): Promise<boolean>
```

## 📊 Viewing Data

### View Raw Decision Log

```sql
SELECT *
FROM decision_log
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 20;
```

### View Autonomy Analytics

```sql
SELECT *
FROM autonomy_analytics
WHERE user_id = 'your-user-id';
```

### Query by Hub & Mood

```sql
SELECT
  hub,
  mood,
  COUNT(*) as interactions,
  AVG(autonomy_level) as avg_autonomy,
  AVG(confidence) as avg_confidence,
  AVG(response_time_ms) as avg_response_time
FROM decision_log
WHERE user_id = 'your-user-id'
GROUP BY hub, mood
ORDER BY interactions DESC;
```

## 🔧 Troubleshooting

### Error: Table doesn't exist

→ Run the migration SQL again. Check for errors in the output.

### Error: RLS policy not found

→ You might have anon/authenticated issues. Verify:
```sql
SELECT * FROM pg_policies WHERE tablename = 'decision_log';
```

### Error: No permissions

→ Make sure you're running as the Supabase admin user (default: postgres)

### Can't see data in analytics view

→ Make sure at least one autonomy log entry exists:
```sql
SELECT COUNT(*) FROM decision_log;
```

## 📝 Next Steps (Phase 7)

- Build Dashboard with autonomy trends
- Query `autonomy_analytics` view for performance
- Create charts showing autonomy trends over time
- Export decision log data as CSV/JSON

---

**Need Help?**
- Check Supabase Docs: https://supabase.com/docs
- Review migration file: `supabase/migrations/003_decision_log_autonomy_tracking.sql`
