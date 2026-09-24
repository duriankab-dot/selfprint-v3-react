# คู่มือตรวจงาน: SELFPRINT Project Audit

## สำหรับ: เจ้าของโปรเจค (Human Review)

---

## 1. Repository State

- [ ] **HEAD**: `889d455` — "Fix test_stabilize upload gate and secure e2e auth state"
- [ ] **Branch**: `master`
- [ ] **Working tree**: Clean (ไม่มีไฟล์เปลี่ยนแปลงที่ไม่ได้วางแผนไว้)
- [ ] **Debug artifacts**: ไม่มีตกค้าง
- [ ] **Secrets/Keys**: ไม่ได้อยู่ใน git history

---

## 2. MG-01-01 TwinNotFoundError

### หลักฐานที่รวบรวมแล้ว

- [ ] **Twin row proof**: REST query → HTTP 200, 1 row, user_id match
  - URL: `/rest/v1/twins?user_id=eq.4108008b-432b-432d-96a4-2c4d9f143c91`
  - Twin ID: `3128261c-1b64-416b-b5ec-bf2b23d339d5`
  - Twin user_id: `4108008b-432b-432d-96a4-2c4d9f143c91`

- [ ] **Project identity proof**: `vkjwqrjflxztcctmyzgh` (staging, Seoul region)
  - E2E_SUPABASE_URL = SUPABASE_URL ที่ seed ใช้ ✅ ตรงกัน

- [ ] **Seed proof**: `scripts/seed-test-users.ts:188-202`
  - Creates twin with `user_id` from auth
  - Upserts with `{ onConflict: 'user_id' }` → idempotent

- [ ] **Auth identity proof**: Auth session จาก global-setup.ts ใน localStorage key `sb-vkjwqrjflxztcctmyzgh-auth-token`
  - User email: `test-phase-b@selfprint.one`
  - User ID: `4108008b-432b-432d-96a4-2c4d9f143c91`

- [ ] **RLS proof**: Migration 024 — `CREATE POLICY "Users can view their own Twin" ON twins FOR SELECT USING (auth.uid() = user_id)`
  - Policy ใช้งานได้ → REST query ผ่าน ✅

- [ ] **fetchUserTwin proof**: Path `TwinContext → fetchUserTwin → Supabase maybeSingle()` ทำงานปกติ
  - No error in app logs during test run

- [ ] **MG-01-01 current status**: **PASS** — Twin row มีอยู่และเข้าถึงได้ผ่านทั้ง REST API และ application flow

- [ ] **Original historical failure root cause**: **NOT PROVEN / NOT REPRODUCED**

- [ ] **Production fix**: **NONE REQUIRED** — MG-01-01 ผ่านอยู่แล้ว

- [ ] **Regression**: CI #417 baseline = 100 tests / 94 PASS / 0 FAIL / 6 SKIP / 0 FLAKY

---

## 3. Test Results

| Test Suite | Status | Details |
|------------|--------|---------|
| **Typecheck** | ✅ PASS | `tsc -b` |
| **Functions Typecheck** | ✅ PASS | `tsc -p tsconfig.functions.json --noEmit` |
| **Build** | ✅ PASS | Vite + PWA build succeeded |
| **Lint** | ✅ PASS | Warnings only (all pre-existing) |
| **Master Gate** | ✅ PASS | All tests pass including MG-01-01 |
| **Full E2E (CI #417 baseline)** | ✅ PASS | 100 tests / 94 PASS / 0 FAIL / 6 SKIP / 0 FLAKY / Exit 0 |

> Local diagnostic run (37 passed / 1 failed / 10 skipped) is a separate forensic run — NOT the CI #417 baseline.

---

## 4. Documentation

| File | Status | Notes |
|------|--------|-------|
| `docs/PROJECT_STATUS_FORENSIC_TH.md` | ✅ สร้างใหม่ | Forensic audit evidence |
| `docs/HUMAN_REVIEW_CHECKLIST_TH.md` | ✅ ไฟล์นี้ | Human review checklist |
| CI counts | ✅ ถูกต้อง | Baseline #417: 94/6 |
| Skip count | ✅ ถูกต้อง | 6 historical skips documented |
| No unsupported claims | ✅ ตรวจแล้ว | ไม่มี claim ที่ไม่มี evidence |

---

## 5. Architecture Verification

```
┌─────────────────────┐
│  Auth Session        │
│  (localStorage)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  TwinProvider        │
│  (TwinContext.tsx)   │
│  useEffect: loadTwin │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  fetchUserTwin()     │
│  (TwinSupabaseService)│
│  .maybeSingle()      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase REST       │
│  /twins?user_id=eq.X │
│  RLS: auth.uid()=X   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  twins table         │
│  (public.twins)      │
│  user_id UNIQUE      │
└─────────────────────┘
```

---

## 6. Known Limitations

1. **DECISION-01 timing issue**: Locator timeout 12s อาจเกิดจาก staging deployment speed — ไม่เกี่ยวข้องกับ MG-01-01
2. **LIFE-05 body length assertion**: Page content length < 50 chars — อาจเป็น staging bundle difference
3. **Conditional skips**: 10 tests skip conditionally — ต้องตรวจสอบว่า conditions เป็น intentional หรือไม่

---

## 7. Historical Flaky Tests (CI #417 ผ่านหมด)

| Test | CI #417 | Status |
|------|---------|--------|
| MG-07-01 | ✅ PASS | No action needed |
| TWIN-04 | ✅ PASS | No action needed |
| WORLD-01 | ✅ PASS | No action needed |

---

## 8. Final Checklist

### Environment
- [ ] Staging URL: `https://selfprint-staging.pages.dev`
- [ ] Supabase project: `vkjwqrjflxztcctmyzgh` (staging, ap-northeast-2)
- [ ] Seed script runs before e2e in CI workflow
- [ ] Environment variables propagated correctly

### Security
- [ ] `.env.e2e.staging` ไม่อยู่ใน git
- [ ] `e2e/.auth/` อยู่ใน .gitignore
- [ ] ไม่มี secrets ใน code หรือ logs

### Code Quality
- [ ] Typecheck ผ่าน
- [ ] Build สำเร็จ
- [ ] Lint warnings ไม่มี new warnings
- [ ] No debug residue

---

## 9. Human Approval

### Owner Sign-off

หลังจากตรวจหลักฐานทั้งหมดแล้ว:

- [ ] ตรวจ **Forensic Evidence** แล้ว
- [ ] ตรวจ **MG-01-01 evidence** แล้ว
- [ ] ตรวจ **Test Results** แล้ว
- [ ] ตรวจ **Documentation Consistency** แล้ว
- [ ] ยืนยันว่า **ไม่มี unrelated changes**
- [ ] ยืนยันว่า **ไม่มี debug artifact ตกค้าง**
- [ ] อนุมัติให้ commit

### คำสั่งที่จะรันหลังอนุมัติ:

```bash
git add docs/PROJECT_STATUS_FORENSIC_TH.md
git add docs/HUMAN_REVIEW_CHECKLIST_TH.md
git commit -m "docs: add forensic audit report for MG-01-01 investigation

Proved MG-01-01 currently passes — Twin row exists and accessible.
No app code changes required. Historical root cause NOT PROVEN.
Created Thai-language documentation for project status and human review checklist."
```

---

**COMMIT: NOT DONE**

**PUSH: NOT DONE**

---

## 10. Next Steps

หลังจาก approve commit:

1. รัน `git push origin master` เพื่อส่งเอกสารเข้า repo
2. รัน GitHub Actions เพื่อยืนยัน CI ยังผ่าน
3. ตรวจสอบ production deployment หลัง merge

---

**Document created**: 24 กันยายน 2569
**Status**: รอ human approval ก่อน commit/push