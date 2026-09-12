# SELFPRINT — PRODUCTION VERIFICATION CLOSURE PLAN

**สร้างเมื่อ:** 2026-09-12  
**HEAD:** 23ae16c4ba7efbd66a93161a21ba64bb2f547096  
**สถานะปัจจุบัน:** MASTER GATE = CONDITIONAL PASS  
**เป้าหมาย:** ปิด auth injection → MASTER GATE = FULL PASS

---

## กฎการทำงาน

1. **ห้าม rewrite ทั้งระบบ** — แก้เฉพาะสิ่งที่จำเป็นเพื่อให้ผ่าน gate
2. **preserve existing** DB/Supabase/Auth/RLS/Cloudflare/SICE/Twin/Memory/APIs
3. **เขียนทับเอกสารเดิม** ไม่ append ประวัติรายรอบ
4. **build/test/lint ต้องผ่าน** ทุก commit (tsc -b + vite build + vitest + oxlint)
5. **อ่าน MASTER_GATE_AS_IS.md + CHANGE_MAP.md ก่อนเริ่ม** — เป็น source of truth ของ gap ที่ต้องปิด

---

## Status: What's Already Done (Session 2)

| Phase | Status | Evidence |
|-------|--------|----------|
| Growth Pipeline Wiring | ✅ DONE | recordInteraction() wired in chat handleSend |
| World Transition CSS | ✅ DONE | 9 transition types mapped to @keyframes |
| Migration 035 Applied | ✅ DONE | Applied via Supabase Dashboard SQL Editor |
| Streaming Path Consumer | ✅ DONE | streamTwinResponse wired with fallback |
| Audio Behavior Wiring | ✅ DONE | useSFX consumed in ImmersiveTwinChat |
| Schema selfprint Exposed | ✅ DONE | Exposed in Dashboard Settings → API |
| Seed Profiles | ✅ DONE | 6/6 profiles seeded |
| Supabase Key Format | ✅ FIXED | New short-form keys supported |
| Build/Typecheck/Lint | ✅ ALL PASS | 612 modules, 0 errors |
| Unit Tests | ✅ ALL PASS | 1042/1042 pass |
| Phase A E2E | ✅ ALL PASS | 27/27 pass |

---

## Remaining Work: Auth Injection Fix

### Problem
`e2e/global-setup.ts` injects `localStorage` but app's `AuthContext` doesn't re-check session after manual injection. User stays on `/en/` instead of going to `/en/dashboard`.

### Required Change

#### ไฟล์: `e2e/global-setup.ts`

After localStorage.setItem(), add:

```typescript
// Reload page and wait for auth resolution
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => {
  const token = localStorage.getItem('sb-vkjwqrjflxztcctmyzgh-auth-token');
  if (!token) return false;
  try {
    const session = JSON.parse(token);
    return !!session?.access_token && !!session?.user?.id;
  } catch { return false; }
}, { timeout: 15000 });
```

### Acceptance Criteria
- [ ] All 49 staging E2E tests pass (or close to it)
- [ ] Browser Three.js verification possible (authenticated chat page with Twin)
- [ ] Browser Intelligent World verification possible (world recommendation + transitions)
- [ ] `npm run build` ผ่าน 0 errors
- [ ] `npm test` ผ่าน 0 failures

### Verification
```bash
npx playwright test --project=chromium-staging
```

Expected: All 49 tests pass.

---

## Final Verification Checklist

ก่อนประกาศ FULL PASS ต้องผ่านทุกข้อ:

### Build & Test
- [ ] `npm run build` — 0 errors ✅ (already done)
- [ ] `npm run typecheck:functions` — 0 errors ✅ (already done)
- [ ] `npm test` — 0 failures ✅ (already done)
- [ ] `npm run lint` — 0 errors ✅ (already done)

### E2E
- [ ] Phase A E2E — 27/27 pass ✅ (already done)
- [ ] Phase B E2E — 49/49 pass (auth injection fix needed)
- [ ] Master Gate — 12/12 pass (depends on Phase B)

### Browser Verification
- [ ] Three.js `<canvas>` exists in authenticated chat page
- [ ] World transition animations play correctly
- [ ] Streaming chat works end-to-end

### Database
- [ ] Migration 035 applied ✅ (already verified)
- [ ] Seed users: 6/6 confirmed ✅
- [ ] Seed profiles: 6/6 seeded ✅
- [ ] Seed twins: 4/4 created ✅

---

## Order of Execution

| # | Task | Priority | Dependencies |
|---|------|----------|--------------|
| 1 | Fix auth injection in global-setup.ts | P0 CRITICAL | None |
| 2 | Re-run staging E2E | P0 | Step 1 |
| 3 | Browser verification | P1 | Step 2 passes |
| 4 | Claim FULL PASS | P0 | Steps 2+3 pass |

**Total estimated effort:** ~30 min

---

## Notes for Next Session

1. อ่าน `MASTER_GATE_AS_IS.md`, `MASTER_GATE_CHANGE_MAP.md` ก่อนเริ่ม — เป็น source of truth
2. เริ่มจากแก้ `e2e/global-setup.ts` (เพิ่ม reload + waitForFunction)
3. รัน `npx playwright test --project=chromium-staging`
4. ถ้าผ่านทั้งหมด → browser verification
5. อัพเดทเอกสารทั้ง 8 ไฟล์ (overwrite ไม่ใช่ append)
6. ประกาศ FULL PASS

**ห้าม:** rewrite ทั้งระบบ, เพิ่ม feature ใหม่ที่ไม่ได้ระบุในแผน, ลบไฟล์ที่ไม่ใช่ dead code จริง

---

**Plan generated:** 2026-09-12 01:50 UTC  
**Status:** CONDITIONAL PASS — one code change required for FULL PASS
