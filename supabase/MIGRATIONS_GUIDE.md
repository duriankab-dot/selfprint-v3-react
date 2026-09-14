# Supabase Migrations Guide — SELFPRINT V3 Staging

## Overview

This document explains how to run Supabase migrations for the staging environment.

## Current Status

- **Supabase Project:** `selfprint-staging` (`vkjwqrjflxztcctmyzgh`)
- **Region:** Northeast Asia (Seoul) | `ap-northeast-2`
- **Database Status:** Migrations 001-020 applied, 021-035 need re-run after fixes
- **Migration Files:** 33 SQL files in `supabase/migrations/`

## Prerequisites

1. **Supabase CLI installed:**
   ```powershell
   # Windows (winget)
   winget install --id Supabase.supabase

   # Or download from: https://supabase.com/docs/guides/cli
   ```

2. **Environment variables set:**
   ```powershell
   $env:SUPABASE_URL="https://vkjwqrjflxztcctmyzgh.supabase.co"
   $env:SUPABASE_SECRET_KEY="<your_service_role_key>"
   $env:SUPABASE_PROJECT_REF="vkjwqrjflxztcctmyzgh"
   ```

3. **Login to Supabase:**
   ```powershell
   supabase login
   supabase link --project-ref vkjwqrjflxztcctmyzgh
   ```

## Method 1: Run All Migrations (Recommended)

### Option A: Using Automation Script

```powershell
node run-migrations.cjs
```

This script:
- Reads all `.sql` files from `supabase/migrations/`
- Sorts them alphabetically (001_..., 002_..., etc.)
- Runs each migration using `supabase db push`
- Reports success/failure for each file

### Option B: Manual CLI Commands

Run migrations one by one in order:

```powershell
supabase db push --project-ref vkjwqrjflxztcctmyzgh --file supabase/migrations/021_world_preferences.sql
supabase db push --project-ref vkjwqrjflxztcctmyzgh --file supabase/migrations/031_world_stats_fixes.sql
supabase db push --project-ref vkjwqrjflxztcctmyzgh --file supabase/migrations/035_forensic_consolidation_2026-09-03.sql
# ... continue for remaining files
```

## Method 2: SQL Editor (Manual)

### Step 1: Open SQL Editor

1. Go to: https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh/sql
2. Click "New Query"

### Step 2: Copy Migration Content

For each migration file:
1. Open `supabase/migrations/021_world_preferences.sql` (fixed version)
2. Copy the entire content
3. Paste into SQL Editor
4. Click "Run"

### Step 3: Repeat for All Files

Continue with remaining files in numerical order.

**Important:** Run migrations in **numerical order** (001 → 037) to ensure dependencies are met.

## Migration File Order (Current)

After cleanup and reordering (Session 2026-09-13):

| # | Filename | Status | Notes |
|---|----------|--------|-------|
| 1 | `001_decision_log_autonomy_tracking.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 2 | `002_profiles_blueprints.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 3 | `004_share_links.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 4 | `005_blueprint_prototype_core.sql` | ✅ No changes needed | |
| 5 | `007_analytics_events.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 6 | `010_intelligence_core_schema.sql` | ✅ Idempotent | Index + policies fixed |
| 7 | `011_chat_messages.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 8 | `012_create_user_credentials.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 9 | `013_journal_queue.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 10 | `014_privacy_consent_columns.sql` | ✅ No changes needed | ALTER TABLE only |
| 11 | `015_push_subscriptions.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 12 | `016_subscriptions.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 13 | `017_auth_rate_limits.sql` | ✅ No changes needed | DISABLE RLS |
| 14 | `018_create_passkey_challenges.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 15 | `019_daily_briefs.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 16 | `020_create_decision_tables.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 17 | `021_world_preferences.sql` | ✅ FIXED | Fully idempotent rewrite (v2026-09-14) |
| 18 | `022_p0_3_decision_learning.sql` | ⚠️ No-op | Creates empty table |
| 19 | `024_create_twins_table.sql` | ✅ Idempotent | CREATE TABLE IF NOT EXISTS |
| 20 | `025_create_awakening_essence.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 21 | `026_consolidate_phase_a_schema.sql` | ✅ Idempotent | DO blocks for safety |
| 22 | `027_optimize_twin_creation.sql` | ✅ No changes needed | Function creation |
| 23 | `028_create_twin_complete_function.sql` | ✅ No changes needed | Function creation |
| 24 | `029_phase_a_core_schema.sql` | ✅ Idempotent | Transaction wrapped |
| 25 | `030_phase_a_extended_schema.sql` | ✅ FIXED | ADD DROP TRIGGER IF EXISTS (v2026-09-14) |
| 26 | `031_world_stats_fixes.sql` | ✅ FIXED | DO block guards (v2026-09-14) |
| 27 | `032_twin_learning_profiles.sql` | ✅ FIXED | ADD DROP INDEX IF EXISTS (v2026-09-14) |
| 28 | `033_community_insights.sql` | ✅ Idempotent | DO blocks for safety |
| 29 | `033_create_user_lifecycle_table.sql` | ✅ FIXED | ADD DROP TRIGGER IF EXISTS (v2026-09-14) |
| 30 | `034_twin_full_analysis.sql` | ✅ No changes needed | ALTER TABLE only |
| 31 | `035_forensic_consolidation_2026-09-03.sql` | ✅ VERIFIED | DO block guards present |
| 32 | `036_twin_visual_dna.sql` | ✅ Idempotent | DROP POLICY before CREATE |
| 33 | `037_onboarding_checkpoints.sql` | ✅ Idempotent | DROP POLICY before CREATE |

### Deleted Files (NO-OP / Deprecated)
- ~~`003_core_awakening_ceremony.sql`~~ — Replaced by 029
- ~~`006_twin_evolution.sql`~~ — Replaced by 030
- ~~`008_notifications.sql`~~ — Replaced by 030
- ~~`20260812000002_fix_decision_logs_uuid.sql`~~ — Empty file
- ~~`033_add_lifecycle_state.sql`~~ — Deprecated
- ~~`034_create_user_lifecycle_table.sql`~~ — Replaced by 033_create_user_lifecycle_table.sql

## Verification

After running migrations, verify tables exist:

```sql
-- Check all tables in public schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check tables in selfprint schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'selfprint'
ORDER BY table_name;
```

Expected tables (partial list):
- `public.decision_log`
- `public.world_preferences`
- `public.world_stats`
- `public.twins`
- `public.conversations`
- `public.messages`
- `selfprint.share_links`
- `selfprint.users_profiles`

## Troubleshooting

### Error: "trigger already exists"

**Cause:** Trigger was created in a previous partial run, then CREATE TRIGGER fails.

**Fix:** File 030 and 033 now have `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`. Safe to re-run.

### Error: "relation already exists" (Index)

**Cause:** Index was created in a previous partial run, then DROP failed.

**Fix:** Migration 021 is now fully idempotent. If you still see this error:
1. Run manually in SQL Editor:
   ```sql
   DROP INDEX IF EXISTS public.idx_world_preferences_user_id;
   DROP INDEX IF EXISTS public.idx_world_preferences_user_favorite;
   DROP INDEX IF EXISTS public.idx_world_preferences_last_accessed;
   ```
2. Then run the full migration file again

### Error: "column already exists"

**Cause:** Column was added outside of migrations (e.g., manual SQL Editor).

**Fix:** Migration 031 now uses DO block guard. Safe to re-run.

### Error: "policy already exists"

**Cause:** Policy was created by earlier migration or manual execution.

**Fix:** All migrations use `DROP POLICY IF EXISTS` before `CREATE POLICY`. Migration 035 wraps everything in DO blocks. Should be safe to re-run.

### Error: "schema selfprint does not exist"

**Cause:** Migration 002 creates the `selfprint` schema, but later migrations expect it to exist.

**Fix:** Run migrations in order starting from 002.

### Error: "relation does not exist"

**Cause:** A migration references a table that hasn't been created yet.

**Fix:** Ensure you're running migrations in numerical order (001 → 037).

## Post-Migration Steps

After all migrations are applied:

1. **Seed test users:**
   ```powershell
   npm run seed:test-users
   ```

2. **Redeploy staging:**
   - Go to: https://dash.cloudflare.com/to/xxx/pages/projects/selfprint-staging
   - Settings → Deployments → Trigger a new deployment

3. **Verify API endpoints:**
   ```powershell
   Invoke-WebRequest -Uri "https://selfprint-staging.pages.dev/api/profile" -UseBasicParsing
   # Expected: 200 OK (with valid auth) or 401 (without auth)
   ```

4. **Run smoke test:**
   ```powershell
   cd D:\selfprint-v3-react
   node loadtests/smoke-test.cjs
   ```

## Notes

- All migration files are **idempotent** — they use `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `DROP INDEX IF EXISTS`, and `DROP TRIGGER IF EXISTS`
- Migration 021 (world_preferences) was **rewritten** on 2026-09-14 to be fully idempotent
- Migration 030 (phase_a_extended_schema) was **fixed** on 2026-09-14 with `DROP TRIGGER IF EXISTS`
- Migration 031 (world_stats_fixes) was **updated** on 2026-09-14 with DO block guards
- Migration 033 (user_lifecycle_table) was **fixed** on 2026-09-14 with `DROP TRIGGER IF EXISTS`
- Migration 035 (forensic_consolidation) was **verified** — already had DO block guards
- Migration 035 is a safety net that creates any missing tables and fixes FK relationships
- Never run `DROP TABLE` or `TRUNCATE` — these migrations are designed to be safe to re-run
- Always backup before running migrations on production (not applicable to staging)
- Migration 035 is a safety net that creates any missing tables and fixes FK relationships
- Never run `DROP TABLE` or `TRUNCATE` — these migrations are designed to be safe to re-run
- Always backup before running migrations on production (not applicable to staging)

## References

- Supabase CLI: https://supabase.com/docs/guides/cli
- SQL Editor: https://supabase.com/docs/guides/getting-started/quick-starts/sql-editor
- Migration best practices: https://supabase.com/docs/guides/database/database-migrations
