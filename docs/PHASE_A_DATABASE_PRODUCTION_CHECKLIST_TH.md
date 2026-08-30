# ✅ PHASE A DATABASE & PRODUCTION RELEASE CHECKLIST

**วันที่:** 30 สิงหาคม 2026 | **Status:** 🟡 HIGH PRIORITY

---

## 📦 DATABASE VERIFICATION CHECKLIST

### Part 1: RLS Policies (Row-Level Security)

**ต้องตรวจสอบใน Supabase Console:**

#### Step 1: Login to Supabase
```
URL: https://app.supabase.com
Project: SELFPRINT V3
→ Database → RLS
```

#### Step 2: Verify RLS Enabled on Critical Tables

| Table | RLS Status | Policy | Test Status |
|---|---|---|---|
| **user_profiles** | 🟡 CHECK | SELECT: user_id = auth.uid() | 📋 TODO |
| **twins** | 🟡 CHECK | SELECT: user_id = auth.uid() | 📋 TODO |
| **profiles_blueprints** | 🟡 CHECK | SELECT: user_id = auth.uid() | 📋 TODO |
| **personal_memory** | 🟡 CHECK | SELECT: user_id = auth.uid() | 📋 TODO |
| **chat_messages** | 🟡 CHECK | SELECT: user_id = auth.uid() | 📋 TODO |
| **user_lifecycle** | 🟡 CHECK | SELECT: user_id = auth.uid() | 📋 TODO |
| **twin_world_expertise** | 🟡 CHECK | SELECT: user_id = auth.uid() | 📋 TODO |

#### Step 3: For Each Table:

1. Click table name
2. Switch to "RLS Enabled" toggle ✅
3. Check policy:
   - **SELECT:** `SELECT (user_id = auth.uid())`
   - **INSERT:** `(auth.uid() = user_id)`
   - **UPDATE:** `(auth.uid() = user_id)`
   - **DELETE:** `(auth.uid() = user_id)`

✅ **Expected:** All tables have RLS enabled + proper policies

---

### Part 2: Schema & Constraints

**Verify via Supabase SQL Editor:**

```sql
-- 1. Check user_profiles table exists
SELECT * FROM user_profiles LIMIT 1;
-- Expected: id (UUID), auth_id, email, name, created_at

-- 2. Check twins table exists + unique constraint
SELECT * FROM twins LIMIT 1;
-- Expected: id (UUID), user_id (UNIQUE), created_at, maturity_score

-- 3. Check profiles_blueprints exists
SELECT * FROM profiles_blueprints LIMIT 1;
-- Expected: id, user_id, blueprint_data (JSONB), created_at

-- 4. Check chat_messages exists
SELECT * FROM chat_messages LIMIT 1;
-- Expected: id, user_id, twin_id, message_text, created_at

-- 5. Verify foreign key constraints (if any)
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' AND table_name IN (
  'user_profiles', 'twins', 'profiles_blueprints', 'personal_memory', 'chat_messages'
);
-- Expected: Foreign keys linking to user_profiles(id)

-- 6. Verify unique constraints
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'UNIQUE' AND table_name = 'twins';
-- Expected: UNIQUE (user_id) — ensures 1 Twin per user
```

✅ **Expected:** All schema checks pass

---

### Part 3: User Isolation Test

**Test via SQL:** Verify user_id filtering prevents cross-user access

```sql
-- Create test scenario:
-- User A has Twin A
-- User B tries to query Twin A (should fail RLS)

-- 1. Get a test user ID
SELECT id FROM user_profiles LIMIT 1;
-- Note: user_123

-- 2. Get Twin for that user
SELECT id FROM twins WHERE user_id = 'user_123' LIMIT 1;
-- Note: twin_abc

-- 3. Simulate another user querying user_123's Twin
-- (would be blocked by RLS in production)
-- In console, this passes RLS but code-level user_id check also applies

-- 4. Verify NO cross-user queries in codebase:
-- All database calls must include: WHERE user_id = auth.uid()
```

✅ **Expected:** User isolation verified

---

### Part 4: Data Integrity

**Run automated checks:**

```bash
# Check for orphaned records (Twins without user)
SELECT COUNT(*) FROM twins WHERE user_id NOT IN (SELECT id FROM user_profiles);
# Expected: 0

# Check for duplicate Twins per user
SELECT user_id, COUNT(*) FROM twins GROUP BY user_id HAVING COUNT(*) > 1;
# Expected: 0 rows (enforced by UNIQUE constraint)

# Check for message orphans
SELECT COUNT(*) FROM chat_messages 
WHERE user_id NOT IN (SELECT id FROM user_profiles);
# Expected: 0
```

✅ **Expected:** Zero orphaned records

---

## 🔐 SECURITY VERIFICATION

### Part 1: API Authentication

**Test via Curl:**

```bash
# 1. Test unauthenticated request (should fail 401)
curl -X GET https://www.selfprint.one/api/unified?module=profile \
  -H "Content-Type: application/json"
# Expected: 401 Unauthorized (or redirect to login)

# 2. Test with valid JWT token
JWT_TOKEN="eyJhbGc..." # Get from browser session
curl -X GET https://www.selfprint.one/api/unified?module=profile \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
# Expected: 200 OK + user profile data

# 3. Test rate limiting (40-60 req/min)
for i in {1..100}; do
  curl -X GET https://www.selfprint.one/api/unified?module=profile \
    -H "Authorization: Bearer $JWT_TOKEN"
done
# Expected: After 60 requests, returns 429 Too Many Requests
```

✅ **Expected:** Auth + rate limiting working

---

### Part 2: XSS & SQL Injection Prevention

**Verify in code:**

```typescript
// ❌ BAD: Direct string interpolation
const query = `SELECT * FROM twins WHERE id = '${userId}'`;

// ✅ GOOD: Parameterized query (Supabase ORM)
const { data } = await supabase
  .from('twins')
  .select('*')
  .eq('id', userId);
```

**Audit:** Check all database calls in:
- `src/services/TwinSupabaseService.ts`
- `src/services/CoreAwakeningService.ts`
- `src/pages/TwinChat.tsx`

✅ **Expected:** All queries use parameterized ORM (Supabase PostgREST)

---

## 🚀 PRODUCTION RELEASE CHECKLIST

### Pre-Release (Today)

**BLOCKING ITEMS:**

- [ ] All E2E smoke tests pass (SK-01 to SK-12)
- [ ] All mobile E2E tests pass
- [ ] All auth E2E tests pass (unskipped)
- [ ] Critical journey E2E passes
- [ ] Build passes: `npm run build` ✅
- [ ] TypeScript clean: `tsc -b` ✅
- [ ] ESLint clean: `oxlint` ✅
- [ ] Database RLS policies verified ✅
- [ ] User isolation verified ✅
- [ ] No 5xx errors in production logs

**HIGH PRIORITY:**

- [ ] Production smoke test run against https://www.selfprint.one
- [ ] Vercel deployment status: ✅ Green
- [ ] Cloudflare auto-deploy: ✅ Enabled
- [ ] Environment variables set correctly
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_URL`
  - [ ] `ANTHROPIC_API_KEY` (for Nova)

**MEDIUM PRIORITY:**

- [ ] Error logging verified (console/Sentry)
- [ ] Performance baseline established (FCP, LCP, INP, CLS)
- [ ] SEO/OG meta tags verified
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile viewport rendering correct

---

### Release Gate: Production Verification Report

**Generate report:**

```bash
# 1. Run comprehensive test suite
npm run test:e2e

# 2. Generate reports
ls -la test-results/
# Expected: e2e-results.json, junit.xml

# 3. Check production health
curl -I https://www.selfprint.one
# Expected: HTTP 200

# 4. Test critical endpoints
curl -s https://www.selfprint.one/api/og?lang=en | file -
# Expected: PNG image

curl -s https://www.selfprint.one/llms.txt | head
# Expected: SELFPRINT + SICE text

# 5. Check Vercel deployment
# https://vercel.com/duriankab-dot/selfprint-v3-react
# Expected: Latest commit deployed ✅
```

---

### Post-Release (After Deployment)

**IMMEDIATE (First 1 hour):**

- [ ] Monitor Vercel logs for errors
- [ ] Check Sentry for exceptions
- [ ] Verify chat/Twin API responding
- [ ] Test live Twin creation flow (manual)
- [ ] Verify analysis persistence (create Twin → reload → Twin still exists)

**FIRST DAY:**

- [ ] Monitor user signup flow
- [ ] Check for 5xx errors
- [ ] Verify email notifications (if applicable)
- [ ] Test mobile responsiveness (real devices if possible)
- [ ] Verify Cloudflare analytics

**FIRST WEEK:**

- [ ] Collect performance metrics (Real User Monitoring)
- [ ] Review error logs daily
- [ ] Test rollback procedure (if issues)
- [ ] Gather user feedback

---

## 📋 SIGN-OFF CHECKLIST

**Before marking Phase A COMPLETE:**

```
Database:
  [ ] RLS policies enabled on all tables
  [ ] User isolation verified
  [ ] Schema constraints verified
  [ ] No orphaned records

Testing:
  [ ] All smoke tests (SK-01 to SK-12) PASS
  [ ] All mobile tests PASS
  [ ] All auth tests PASS
  [ ] Critical journey E2E PASS

Production:
  [ ] Build clean (tsc, lint)
  [ ] Deployment successful (Vercel ✅ Cloudflare ✅)
  [ ] Production smoke test PASS
  [ ] Health check PASS
  [ ] Error monitoring active

Documentation:
  [ ] SETUP.md updated
  [ ] README.md updated
  [ ] Known issues documented
  [ ] Rollback procedure documented

Final:
  [ ] Commit pushed: "chore: Phase A complete + production verified"
  [ ] Tag created: v1.0.0-phase-a-complete
  [ ] Status updated: PHASE A ✅ VERIFIED 100%
```

---

## 🎯 PHASE A SUCCESS CRITERIA

```
SUCCESS = ✅ All gates passed + Live in production

✅ Landing → Onboarding → Full Analysis → Twin Birth working
✅ All test suites passing (desktop + mobile + auth + critical journey)
✅ Database secure (RLS + user isolation + data integrity)
✅ Production live (https://www.selfprint.one)
✅ Monitoring active (logs + errors + performance)
✅ Users can create Twin + persist + reload = Twin still exists
✅ Documentation complete + rollback procedure ready
```

---

**Status:** 🔴 **NOT YET** — Waiting for test execution  
**Timeline:** Today  
**Owner:** AI Developer  
**Blocker:** None

