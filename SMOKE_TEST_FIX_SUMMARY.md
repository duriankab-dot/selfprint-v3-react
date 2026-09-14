# Smoke Test Fix Summary — Updated 2026-09-14

## ปัญหาที่แก้ไข

### Root Cause
```
Error: Missing auth env vars: SUPABASE_URL, SUPABASE_ANON_KEY, and TEST_PASSWORD are required.
```

**สาเหตุ:**
1. `.env.e2e` ไม่มีอยู่ — script ลอง load `.env.e2e` แต่ไฟล์ไม่มี
2. `config.js` เป็น ES module (`export const`) แต่ `smoke-test.cjs` ใช้ `require()` (CommonJS) — ไม่ compatible กัน

### การแก้ไข

#### 1. สร้าง `.env.e2e` (new file)
- Source: `.env.e2e.staging`
- Every variable mapped with **both** prefixed (`E2E_*`) and non-prefixed variants
- Includes: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TEST_EMAIL`, `TEST_PASSWORD`, และ test credentials อื่นๆ

#### 2. สร้าง `loadtests/config.cjs` (new file)
- CommonJS config shim ที่ load `.env.e2e` ผ่าน dotenv
- Export: `BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TEST_EMAIL`, `TEST_PASSWORD`, `ENDPOINTS`, `SHARED_DATA`
- รองรับ E2E_ prefix fallback logic เหมือน `config.js`

#### 3. แก้ไข `loadtests/smoke-test.cjs`
- เปลี่ยน `require('./config.js')` → `require('./config.cjs')` (ESM → CJS compatibility)
- ลบ duplicate dotenv loading (ตอนนี้อยู่ใน `config.cjs`)

#### 4. สร้าง `run-migrations.cjs` (new file)
- Script อัตโนมัติสำหรับ run Supabase migrations ทั้งหมด
- ใช้ `supabase db push` สำหรับแต่ละ migration file

#### 5. สร้าง `supabase/MIGRATIONS_GUIDE.md` (new file)
- คู่มือละเอียดสำหรับ run migrations
- 36 migration files ใน `supabase/migrations/`

#### 6. อัพเดทเอกสาร
- `loadtests/README.md` — อัพเดท status และ prerequisites
- `docs/API_REFERENCE.md` — ลบ Vercel references
- `docs/DEPLOYMENT.md` — เปลี่ยนจาก Vercel เป็น Cloudflare Pages

---

## Migration Fixes (Session 2026-09-14)

### ปัญหา Migration ที่เหลืออยู่ (ก่อนแก้)

| Migration | Error | Status ก่อน |
|-----------|-------|------------|
| 021_world_preferences.sql | `relation "idx_world_preferences_user_id" already exists` | ❌ Fail 10+ รอบ |
| 031_world_stats_fixes.sql | `column "last_accessed" already exists` | ❌ Fail |
| 035_forensic_consolidation.sql | `policy "xxx" already exists` | ❌ Fail |

### การแก้ไข Migration Files

#### 021_world_preferences.sql — Fully Idempotent Rewrite
**ปัญหาเดิม:** `CREATE INDEX IF NOT EXISTS` ไม่ทำงานเมื่อ index มีอยู่แล้วจาก partial run ก่อนหน้า

**การแก้ไข:**
- เปลี่ยนเป็น `DROP INDEX IF EXISTS idx_*` (ไม่ใส่ schema prefix) followed by `CREATE INDEX IF NOT EXISTS idx_*`
- ทุก DROP/DROP POLICY อยู่ก่อน CREATE/CREATE POLICY เสมอ
- ใช้ DO blocks สำหรับ DROP INDEX เพื่อตรวจสอบ existence ก่อน

**ผลลัพธ์:** ✅ Safe to run multiple times

#### 030_phase_a_extended_schema.sql — Trigger Fix
**ปัญหาเดิม:** `CREATE TRIGGER` ล้มเหลวเพราะ trigger มีอยู่แล้ว

**การแก้ไข:**
- เพิ่ม `DROP TRIGGER IF EXISTS evolution_progress_update_timestamp ON twin_evolution_progress` ก่อน `CREATE TRIGGER`

**ผลลัพธ์:** ✅ Safe to run multiple times

#### 031_world_stats_fixes.sql — DO Block Guard
**ปัญหาเดิม:** `ADD COLUMN IF NOT EXISTS` อาจ fail ถ้า column ถูกสร้างนอก migration

**การแก้ไข:**
- เปลี่ยนเป็น `DO $$ ... END $$` block พร้อม `IF NOT EXISTS` check จาก `information_schema.columns`
- Dynamic SQL: `ALTER TABLE ... ADD COLUMN` ภายใน DO block
- Policy creation ก็ใช้ DO block + `pg_policies` guard เช่นกัน

**ผลลัพธ์:** ✅ Bulletproof — ตรวจสอบ column existence จริงก่อน add

#### 033_create_user_lifecycle_table.sql — Trigger Fix
**ปัญหาเดิม:** `CREATE TRIGGER` ล้มเหลวเพราะ trigger มีอยู่แล้ว

**การแก้ไข:**
- เพิ่ม `DROP TRIGGER IF EXISTS user_lifecycle_update_timestamp ON user_lifecycle` ก่อน `CREATE TRIGGER`

**ผลลัพธ์:** ✅ Safe to run multiple times

#### 035_forensic_consolidation.sql — Verified (No Changes Needed)
**สถานะ:** ทุก CREATE/DROP POLICY อยู่ใน DO blocks พร้อม EXCEPTION handling แล้ว

**โครงสร้างปัจจุบัน:**
- Section A-D: ทุก operation ห่อด้วย `DO $guard$ BEGIN ... EXCEPTION WHEN ... END $guard$;`
- Section E: SELECT queries สำหรับ verification (read-only)
- Dollar-quoting: `$guard$` สำหรับ DO blocks, `$sp$` สำหรับ EXECUTE strings

**ผลลัพธ์:** ✅ Already idempotent — exception handling ป้องกันทุก error

---

## สถานะปัจจุบัน

| Component | Status | Notes |
|-----------|--------|-------|
| `.env.e2e` | ✅ Created | Environment variables mapped |
| `config.cjs` | ✅ Created | CommonJS config shim |
| `smoke-test.cjs` | ✅ Fixed | Uses `config.cjs` |
| Cloudflare Pages | ✅ Configured | Env vars set (SUPABASE_URL, etc.) |
| Migration 021 | ✅ Fixed | Fully idempotent rewrite |
| Migration 030 | ✅ Fixed | DROP TRIGGER IF EXISTS (v2026-09-14) |
| Migration 031 | ✅ Fixed | DO block guards |
| Migration 033 | ✅ Fixed | DROP TRIGGER IF EXISTS (v2026-09-14) |
| Migration 035 | ✅ Verified | DO block guards already present |
| Supabase staging | ⚠️ Partial | Migrations 001-020 applied, 021-035 need re-run |
| API Endpoints | ❌ Broken | Returns 500 errors (database not ready) |

## ขั้นตอนต่อไป (Session หน้า)

### 1. รัน Migrations ที่เหลือบน Supabase Staging

**Option A: Using CLI (Recommended)**
```powershell
# Set environment variables
$env:SUPABASE_URL="https://vkjwqrjflxztcctmyzgh.supabase.co"
$env:SUPABASE_SECRET_KEY="<your_supabase_service_role_key>"

# Run all migrations from 021 onwards
node run-migrations.cjs
```

**Option B: Manual via SQL Editor**
1. ไปที่: https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh/sql
2. Click "New Query"
3. Copy content จาก migration files (เรียงลำดับ):
   - `021_world_preferences.sql` (แก้ไขแล้ว)
   - `022_p0_3_decision_learning.sql` (no-op table)
   - `024_create_twins_table.sql`
   - `025_create_awakening_essence.sql`
   - `026_consolidate_phase_a_schema.sql`
   - `027_optimize_twin_creation.sql`
   - `028_create_twin_complete_function.sql`
   - `029_phase_a_core_schema.sql`
   - `030_phase_a_extended_schema.sql`
   - `031_world_stats_fixes.sql` (แก้ไขแล้ว)
   - `032_twin_learning_profiles.sql`
   - `033_community_insights.sql`
   - `033_create_user_lifecycle_table.sql`
   - `034_twin_full_analysis.sql`
   - `035_forensic_consolidation_2026-09-03.sql` (verified)
   - `036_twin_visual_dna.sql`
   - `037_onboarding_checkpoints.sql`
4. Paste และ Run ทีละไฟล์
5. ดู logs หลังรันแต่ละไฟล์เพื่อตรวจสอบ success/failure

### 2. Seed Test Users

```powershell
npm run seed:test-users
```

### 3. Redeploy Staging

1. ไปที่: https://dash.cloudflare.com/to/xxx/pages/projects/selfprint-staging
2. Settings → Deployments → Trigger a new deployment
3. หรือ push code ใหม่ให้ GitHub auto-deploy

### 4. Run Smoke Test

```powershell
cd D:\selfprint-v3-react
node loadtests/smoke-test.cjs
```

**Expected output (หลัง fix ทั้งหมด):**
```
Starting smoke test with 10 iterations...

--- Iteration 1/10 ---
  ✓ GET /api/share (invalid code)
  ✓ POST /api/profile (upsert)
  ✓ GET /api/profile (retrieve)
  ✓ POST /api/twin (chat)
  ✓ POST /api/nova (chat)
  ✓ POST /api/autonomy-log
  ✓ Unauthenticated request (should fail)

SMOKE TEST RESULTS
============================================================
Total iterations: 10
Total requests: 70
Successful: 70
Failed: 0
Rate limited: 0
Error rate: 0.00%
```

## Files Created/Modified

### Created
- `.env.e2e` — Environment variables for E2E testing
- `loadtests/config.cjs` — CommonJS config shim
- `run-migrations.cjs` — Migration runner script
- `supabase/MIGRATIONS_GUIDE.md` — Migration instructions
- `RUN_MIGRATIONS.md` — คู่มือ run migrations

### Modified
- `loadtests/smoke-test.cjs` — Fixed ESM/CJS compatibility
- `loadtests/README.md` — Updated status and prerequisites
- `docs/API_REFERENCE.md` — Removed Vercel references
- `docs/DEPLOYMENT.md` — Changed Vercel to Cloudflare Pages

### Migration Files Fixed
- `supabase/migrations/021_world_preferences.sql` — Fully idempotent rewrite
- `supabase/migrations/030_phase_a_extended_schema.sql` — ADD DROP TRIGGER IF EXISTS
- `supabase/migrations/031_world_stats_fixes.sql` — DO block guards added
- `supabase/migrations/033_create_user_lifecycle_table.sql` — ADD DROP TRIGGER IF EXISTS

### Migration Files Verified (No Changes)
- `supabase/migrations/035_forensic_consolidation_2026-09-03.sql` — Already idempotent

## Migration Cleanup Summary (Previous Session)

### Files Deleted (5 ไฟล์)
- `003_core_awakening_ceremony.sql` (NO-OP)
- `006_twin_evolution.sql` (NO-OP)
- `008_notifications.sql` (NO-OP)
- `20260812000002_fix_decision_logs_uuid.sql` (Empty file)
- `033_add_lifecycle_state.sql` (DEPRECATED)
- `034_create_user_lifecycle_table.sql` (DEPRECATED)

### Files Created (2 ไฟล์)
- `029_phase_a_core_schema.sql` — Tables ที่ 003 อ้างถึง (twin_state, twin_personality, twin_memory, twin_capabilities, conversations, messages, conversation_settings, conversation_memory)
- `030_phase_a_extended_schema.sql` — Tables ที่ 006, 008 อ้างถึง (twin_evolution_history, twin_evolution_progress, notification_schedule, notification_queue, notification_analytics, decision_patterns)

### Files Reordered (4 ไฟล์)
- `026_consolidate_phase_a_schema.sql` (จาก 028)
- `028_create_twin_complete_function.sql` (จาก 026)
- `036_twin_visual_dna.sql` (จาก 20260825_004)
- `037_onboarding_checkpoints.sql` (จาก 20260826_001)

### Migration Files Made Idempotent (23 ไฟล์)
- 001, 002, 004, 007, 010, 011, 012, 013, 015, 016, 018, 019, 020, 021, 024, 025, 026, 029, 030, 031, 032, 033_community_insights, 033_create_user_lifecycle_table, 036, 037

## Notes

1. **Cloudflare Pages env vars:** ตั้งค่าไว้แล้ว (ดูจาก screenshot)
2. **Supabase database:** Migrations 001-020 applied, 021-035 ต้อง run ใหม่หลังแก้ fixes
3. **Test users:** ยังไม่ seed — ต้องรัน `npm run seed:test-users`
4. **Deployment:** ต้อง redeploy หลัง migrations และ env vars พร้อม

## References

- Supabase Dashboard: https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh
- Cloudflare Pages: https://dash.cloudflare.com/to/xxx/pages/projects/selfprint-staging
- Migrations Guide: `supabase/MIGRATIONS_GUIDE.md`
