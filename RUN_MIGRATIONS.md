# วิธี Run Supabase Migrations — วิธีที่ง่ายที่สุด

## วิธีที่ 1: SQL Editor (แนะนำ — ง่ายที่สุด)

### Step 1: เปิด SQL Editor

1. ไปที่: **https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh/sql**
2. คลิก **"New Query"**

### Step 2: Copy & Run ทุก Migration File

**Migration files มี 33 ไฟล์** (หลัง cleanup) — ต้อง run เรียงลำดับ (001 → 037)

#### Method A: Copy ทุกไฟล์แล้ว paste พร้อมกัน (เร็วที่สุด)

1. เปิด File Explorer ที่ `D:\selfprint-v3-react\supabase\migrations`
2. Ctrl+A เลือกทุกไฟล์ → Ctrl+C Copy
3. ไปที่ SQL Editor → New Query
4. Ctrl+V Paste (ทุก content รวมกัน)
5. คลิก **"Run"**

**ข้อควรระวัง:**
- บาง migration อาจ error ถ้า run พร้อมกัน (dependency issues)
- ถ้า error ให้แยก run ทีละไฟล์

#### Method B: Run ทีละไฟล์ (ปลอดภัยกว่า)

สำหรับแต่ละไฟล์ (001 → 037):

```powershell
# Example: Run 001_decision_log_autonomy_tracking.sql
# 1. เปิดไฟล์: D:\selfprint-v3-react\supabase\migrations\001_decision_log_autonomy_tracking.sql
# 2. Copy ทุก content
# 3. ไปที่ SQL Editor → New Query
# 4. Paste → Run
# 5. ทำซ้ำสำหรับไฟล์ถัดไป
```

### Step 3: Verify Tables

หลัง run ครบแล้ว ตรวจสอบว่า tables สร้างแล้ว:

```sql
-- Check tables in public schema
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

## วิธีที่ 2: Supabase CLI (ถ้า Docker Running)

```powershell
# Install supabase-cli
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref vkjwqrjflxztcctmyzgh

# Push migrations (ต้องเปิด Docker Desktop ก่อน)
supabase db push
```

**หมายเหตุ:** วิธีนี้ต้องการ Docker Desktop running — ถ้าไม่ได้เปิด ให้ใช้วิธีที่ 1

## Migration Files ที่ต้อง Run (เรียงลำดับ — Updated 2026-09-14)

| # | Filename | Status |
|---|----------|--------|
| 1 | `001_decision_log_autonomy_tracking.sql` | ✅ Idempotent |
| 2 | `002_profiles_blueprints.sql` | ✅ Idempotent |
| 3 | ~~`003_core_awakening_ceremony.sql`~~ | ❌ Deleted (replaced by 029) |
| 4 | `004_share_links.sql` | ✅ Idempotent |
| 5 | `005_blueprint_prototype_core.sql` | ✅ No changes |
| 6 | ~~`006_twin_evolution.sql`~~ | ❌ Deleted (replaced by 030) |
| 7 | `007_analytics_events.sql` | ✅ Idempotent |
| 8 | ~~`008_notifications.sql`~~ | ❌ Deleted (replaced by 030) |
| 9 | `010_intelligence_core_schema.sql` | ✅ Idempotent |
| 10 | `011_chat_messages.sql` | ✅ Idempotent |
| 11 | `012_create_user_credentials.sql` | ✅ Idempotent |
| 12 | `013_journal_queue.sql` | ✅ Idempotent |
| 13 | `014_privacy_consent_columns.sql` | ✅ No changes |
| 14 | `015_push_subscriptions.sql` | ✅ Idempotent |
| 15 | `016_subscriptions.sql` | ✅ Idempotent |
| 16 | `017_auth_rate_limits.sql` | ✅ No changes |
| 17 | `018_create_passkey_challenges.sql` | ✅ Idempotent |
| 18 | `019_daily_briefs.sql` | ✅ Idempotent |
| 19 | `020_create_decision_tables.sql` | ✅ Idempotent |
| 20 | `021_world_preferences.sql` | ✅ **FIXED** (v2026-09-14) |
| 21 | `022_p0_3_decision_learning.sql` | ⚠️ No-op |
| 22 | `024_create_twins_table.sql` | ✅ Idempotent |
| 23 | `025_create_awakening_essence.sql` | ✅ Idempotent |
| 24 | `026_consolidate_phase_a_schema.sql` | ✅ Idempotent |
| 25 | `027_optimize_twin_creation.sql` | ✅ No changes |
| 26 | `028_create_twin_complete_function.sql` | ✅ No changes |
| 27 | `029_phase_a_core_schema.sql` | ✅ Idempotent |
| 28 | `030_phase_a_extended_schema.sql` | ✅ **FIXED** (v2026-09-14) |
| 29 | `031_world_stats_fixes.sql` | ✅ **FIXED** (v2026-09-14) |
| 30 | `032_twin_learning_profiles.sql` | ✅ Idempotent |
| 31 | `033_community_insights.sql` | ✅ Idempotent |
| 32 | `033_create_user_lifecycle_table.sql` | ✅ **FIXED** (v2026-09-14) |
| 33 | `034_twin_full_analysis.sql` | ✅ No changes |
| 34 | `035_forensic_consolidation_2026-09-03.sql` | ✅ Verified |
| 35 | `036_twin_visual_dna.sql` | ✅ Idempotent |
| 36 | `037_onboarding_checkpoints.sql` | ✅ Idempotent |

### Deleted Files (NO-OP / Deprecated)
- ~~`003_core_awakening_ceremony.sql`~~ — Replaced by 029_phase_a_core_schema.sql
- ~~`006_twin_evolution.sql`~~ — Replaced by 030_phase_a_extended_schema.sql
- ~~`008_notifications.sql`~~ — Replaced by 030_phase_a_extended_schema.sql
- ~~`20260812000002_fix_decision_logs_uuid.sql`~~ — Empty file
- ~~`033_add_lifecycle_state.sql`~~ — Deprecated
- ~~`034_create_user_lifecycle_table.sql`~~ — Replaced by 033_create_user_lifecycle_table.sql

## Troubleshooting

### "relation already exists" (Index)

**Cause:** Index ถูกสร้างใน partial run ก่อนหน้า แล้ว DROP ล้มเหลว

**Fix:** Migration 021 ถูกแก้ไขให้ idempotent แล้ว (v2026-09-14) หากยัง error:
```sql
-- รันใน SQL Editor ก่อน:
DROP INDEX IF EXISTS public.idx_world_preferences_user_id;
DROP INDEX IF EXISTS public.idx_world_preferences_user_favorite;
DROP INDEX IF EXISTS public.idx_world_preferences_last_accessed;
```

### "column already exists"

**Cause:** Column ถูกเพิ่มนอก migration (เช่น SQL Editor manual)

**Fix:** Migration 031 ใช้ DO block guard แล้ว (v2026-09-14) — ปลอดภัยที่จะ run ซ้ำ

### "policy already exists"

**Cause:** Policy ถูกสร้างโดย migration ก่อนหน้าหรือ manual execution

**Fix:** ทุก migration ใช้ `DROP POLICY IF EXISTS` ก่อน `CREATE POLICY` — ปลอดภัยที่จะ run ซ้ำ

### "schema selfprint does not exist"

**Cause:** Migration 002 สร้าง schema `selfprint` — ต้อง run 002 ก่อน migration ที่ใช้ `selfprint.*`

**Fix:** Run migrations เรียงลำดับ (001 → 037)

### "relation does not exist"

**Cause:** Migration อ้างอิง table ที่ยังไม่มี

**Fix:** Run migrations เรียงลำดับ

### "trigger already exists"

**Cause:** Trigger ถูกสร้างใน partial run ก่อนหน้า แล้ว CREATE TRIGGER ล้มเหลว

**Fix:** Migration 030 และ 033 ถูกแก้ไขให้ใช้ `DROP TRIGGER IF EXISTS` ก่อน `CREATE TRIGGER` (v2026-09-14) ปลอดภัยที่จะ run ซ้ำ

## หลัง Run Migrations เสร็จ

1. **Seed test users:**
   ```powershell
   npm run seed:test-users
   ```

2. **Redeploy staging (ถ้าจำเป็น):**
   - Cloudflare Pages: https://dash.cloudflare.com/to/xxx/pages/projects/selfprint-staging
   - Settings → Deployments → Trigger new deployment

3. **Run smoke test:**
   ```powershell
   cd D:\selfprint-v3-react
   node loadtests/smoke-test.cjs
   ```

## References

- Supabase SQL Editor: https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh/sql
- Migrations Guide: `supabase/MIGRATIONS_GUIDE.md`
- Cloudflare Pages: https://dash.cloudflare.com/to/xxx/pages/projects/selfprint-staging
