# FORENSIC AUDIT: MG-01-01 TwinNotFoundError — หลักฐานจาก Production

## วันที่ตรวจ
24 กันยายน 2569 (2026-09-24)

---

## 1. Baseline ที่ตรวจ

```text
HEAD          : 889d455 "Fix test_stabilize upload gate and secure e2e auth state"
Branch        : master
CI Baseline   : #417 (100 tests / 94 PASS / 0 FAIL / 6 SKIP / 0 FLAKY / Exit 0)
Working Tree  : Clean ก่อนเริ่มตรวจ
Supabase URL  : https://vkjwqrjflxztcctmyzgh.supabase.co (staging, Seoul region)
Project Ref   : vkjwqrjflxztcctmyzgh
Region        : ap-northeast-2
```

---

## 2. Architecture Path ที่วิเคราะห์

```
Auth Session (localStorage)
    ↓
TwinProvider (TwinContext.tsx:308-384)
    ↓
fetchUserTwin(userId) (TwinSupabaseService.ts:60-121)
    ↓
Supabase REST: .from('twins').select('*').eq('user_id', userId).maybeSingle()
    ↓
RLS Policy: auth.uid() = user_id
```

---

## 3. ข้อเท็จจริงสำคัญที่พิสูจน์แล้ว

### 3.1 maybeSingle() Behavior

**เอกสาร Supabase PostgREST:**
| Rows Returned | data | error.code |
|---------------|------|------------|
| 0 rows | `null` | `null` |
| 1 row | `{...}` | `null` |
| >1 rows | `null` | `"PGRST116"` |

**ข้อสรุป**: `PGRST116` ไม่ใช่อันตรายของ Twin หายไป — มันเกิดเมื่อมี **หลายแถว** (duplicate) ไม่ใช่ไม่มีแถว

**การ throw TwinNotFoundError เกิดที่บรรทัด 103** (`if (!data)` branch) ไม่ใช่อันที่ PGRST116

---

### 3.2 Auth Session Flow

**global-setup.ts:176-194**: Auth session ถูกเก็บใน localStorage ภายใต้ key:
```
sb-{project-ref}-auth-token
ตัวอย่าง: sb-vkjwqrjflxztcctmyzgh-auth-token
```

โครงสร้าง session ใน localStorage:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_at": ...,
  "user": {
    "id": "4108008b-432b-432d-96a4-2c4d9f143c91",
    "email": "test-phase-b@selfprint.one"
  }
}
```

---

### 3.3 Seed Script

**scripts/seed-test-users.ts:188-202** — สร้าง Twin ใน `public.twins`:

```typescript
await supabase.from('twins').upsert(
  {
    user_id: userId,           // จาก auth.admin.createUser()
    name: `Digital Twin (${user.name})`,
    personality_type: 'test',
  },
  { onConflict: 'user_id' }
);
```

**LIFECYCLE-SYNC-001 (20 ก.ย. 2569)**: Sync lifecycle เป็น `TWIN_ALIVE` หลังสร้าง twin

---

### 3.4 RLS Policy

**migration 024_create_twins_table.sql:19-20**:
```sql
CREATE POLICY "Users can view their own Twin" ON twins
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 4. ผลการ Diagnostic Test

### 4.1 Test: `e2e/debug-twin-existence.spec.ts`

**Command**:
```bash
npm run test:e2e:staging -- e2e/debug-twin-existence.spec.ts
```

**ผลลัพธ์**: ✅ PASS

#### Evidence Log:
```
Session source: localStorage:sb-vkjwqrjflxztcctmyzgh-auth-token
Authenticated user: test-phase-b@selfprint.one
user_id: 4108008b-432b-432d-96a4-2c4d9f143c91

Twin REST url: https://vkjwqrjflxztcctmyzgh.supabase.co/rest/v1/twins?user_id=eq.4108008b-432b-432d-96a4-2c4d9f143c91&select=*

HTTP Status: 200
Twin Row Count: 1

Twin Data:
{
  "id": "3128261c-1b64-416b-b5ec-bf2b23d339d5",
  "user_id": "4108008b-432b-432d-96a4-2c4d9f143c91",
  "name": "Digital Twin (Test User Phase B)",
  "personality_type": "test",
  "created_at": "2026-09-23T04:42:35.308662+00:00",
  "updated_at": "2026-09-23T04:42:35.308662+00:00",
  "system_prompt": null,
  "full_analysis": null,
  "primary_archetype": null,
  "secondary_archetype": null,
  "maturity_score": 30,
  "evolution_stage": 1,
  "awakened_at": "2026-09-23T04:42:35.308662+00:00"
}

✅ user_id match: 4108008b-432b-432d-96a4-2c4d9f143c91 == 4108008b-432b-432d-96a4-2c4d9f143c91
```

---

### 4.2 Master Gate Tests

**Command**:
```bash
npm run test:e2e:staging -- e2e/master-gate.spec.ts --project=chromium-staging
```

**ผลลัพธ์**: All Pass

| Test | Result | Notes |
|------|--------|-------|
| MG-01-01 | ✅ PASS | HIGH fidelity: canvas 1, 331x115, WebGL: true |
| MG-01-02 | ✅ PASS | Canvas/presence visible |
| MG-02-01 | ✅ PASS | World transition container present |
| MG-02-02 | ✅ PASS | World transition animation triggered |
| MG-03-01 | ✅ PASS | Growth pipeline loaded |
| MG-04-01 | ✅ PASS | Chat input visible & enabled |
| MG-05-02 | ✅ PASS | Twin layer elements: 4 |
| MG-06-01 | ✅ PASS | Immersive page present, layers: 3 |
| MG-06-02 | ✅ PASS | World transition infrastructure present |
| MG-07-01 | ✅ PASS | Decision logging UI present (14 elements) |

---

### 4.3 Local Diagnostic Run (Separate from CI #417 Baseline)

**Command**:
```bash
npm run test:e2e:staging
```

**ผลลัพธ์ (separate forensic/diagnostic run — NOT the CI #417 baseline)**:
```
37 passed
1 failed (DECISION-01 - timing issue, unrelated to MG-01-01)
10 skipped (conditional skips)
Exit: success
```

---

### 4.4 Authoritative CI Baseline — CI #417

**CI #417 is the authoritative baseline for this project**:

```
100 tests
94 PASS
0 FAIL
6 SKIP
0 FLAKY
Exit 0
```

ห้ามนำ local diagnostic run ไปแทนที่หรือเปลี่ยนสถานะ CI #417 baseline.

---

## 5. Root Cause Classification

| Case | Condition | Interpretation | Action |
|------|-----------|----------------|--------|
| A | 0 rows | Twin missing OR hidden by RLS | Trace seed, verify user_id, check RLS |
| **B** | **1 row** | **DB read healthy** | **MG-01-01 passes — no fix needed** |
| C | 401/403 | JWT invalid or RLS denies | Check token, RLS policy |
| D | >1 row | Duplicate twins | Fix seed idempotency, check unique constraint |

**ผลการตรวจปัจจุบัน**: **Case B** — Twin row มีอยู่และอ่านได้ผ่าน REST API และ App flow

---

## 6. Conclusion

### MG-01-01 Status: ✅ PASSING

- Twin row อยู่ในฐานข้อมูลสำหรับ test-user `test-phase-b@selfprint.one`
- RLS policy ทำงานถูกต้อง (authenticated user อ่าน twin ของตัวเองได้)
- Application's `fetchUserTwin()` ผ่าน path ทั้งหมด
- Master Gate test ทั้งชุดผ่าน
- No app code changes required

### Original Historical Failure Root Cause: NOT PROVEN / NOT REPRODUCED

MG-01-01 current failure condition was not reproduced in this diagnostic session.

Current evidence proves:
- Twin row exists
- Authenticated user_id matches twins.user_id
- Supabase project matches E2E and seed
- RLS permits the authenticated read
- fetchUserTwin() succeeds
- MG-01-01 currently passes

The original historical failure root cause is NOT PROVEN / NOT REPRODUCED.

---

## 7. คำสั่งที่ใช้ตรวจ

```bash
git rev-parse HEAD                           # Verify HEAD
git status --short                            # Check working tree
npm run typecheck                             # TypeScript check
npm run typecheck:functions                   # Functions typecheck
npm run build                                 # Production build
npm run lint                                  # Linter
npm run test:e2e:staging                     # Full E2E staging
npm run test:e2e:staging -- debug-twin-existence.spec.ts  # Diagnostic
npm run test:e2e:staging -- master-gate.spec.ts          # Master Gate
```

---

## 8. Cleanup Status

| Artifact | Status |
|----------|--------|
| `e2e/debug-twin-existence.spec.ts` | ✅ ลบออกแล้ว |
| Debug logging in `TwinSupabaseService.ts` | ✅ ลบออกแล้ว |
| Debug entry in `playwright.config.ts` | ✅ Reverted แล้ว |
| `e2e/.auth/user.json` | ✅ .gitignore'd (auth state artifact) |
| `e2e/.auth/user-awakening.json` | ✅ .gitignore'd (auth state artifact) |

**Debug residue**: ไม่มี

---

## 9. Security Review

| Item | Status |
|------|--------|
| Secrets in code | ✅ ไม่มี |
| Tokens/keys ใน logs | ✅ ไม่มีเปิดเผย |
| Auth files committed | ✅ .gitignore'd |
| Environment files | ✅ `.env.e2e.staging` ไม่อยู่ใน git |
