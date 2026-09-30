# P0-A: Gap Analysis & Fix Plan
**Date:** 2026-08-21  
**Status:** ✅ Verified from code audit

---

## GAP #1: Analysis → CoreAwakening Link (MISSING)

**Current State:**
- AnalysisPage.tsx renders 9 sections ✅
- CoreAwakening page exists ✅
- **Connection between them: ❌ MISSING**

**Evidence:**
- AnalysisPage: No navigate to `/core-awakening` found
- No button to trigger Twin birth
- No state transfer

**Fix Required:**
```typescript
// Add to AnalysisPage.tsx (end of page)
<button onClick={() => navigate('/core-awakening')}>
  Your Intelligence Core is Ready → Awaken Twin
</button>
```

---

## GAP #2: Twin Intelligence (STUB ONLY)

**Current State:**
- CoreAwakening.tsx calls `saveTwinProfile()` ✅
- saveTwinProfile() creates twin with hardcoded maturityScore: 30
- **Twin doesn't know user data**: ❌ NO grounding

**Evidence:**
```typescript
// Line 60-62 in CoreAwakening.tsx
const twinProfile = await saveTwinProfile(session.user.id, twinName, {
  userId: session.user.id,
  maturityScore: 30,  // ← hardcoded, not from analysis
});
```

**Fix Required:**
- Get analysis results from store/cache
- Pass to saveTwinProfile as context
- Use context in twin.service.ts to generate informed first response

---

## GAP #3: Lifecycle State Store (MISSING)

**Current State:**
- No lifecycle state management found
- Sessions use client-side context
- No DB persistence

**Fix Required:**
Create: `src/store/lifecycleStore.ts`
```typescript
interface LifecycleState {
  status: 'ONBOARDING' | 'ANALYSIS' | 'AWAKENING' | 'TWIN_ALIVE' | 'WORLD_ACTIVE';
  twinCreatedAt?: Date;
  resumedAt?: Date;
}
```

---

## GAP #4: World Routing (INCOMPLETE)

**Current State:**
- WorldsHub page exists ✅
- Routes defined ✅
- **Full-screen experience**: ? (need to verify)

**Fix Required:**
Verify `/worlds/:worldId` renders full-screen
Add Twin context per world

---

## ACTION PLAN

### Priority 1 (Today):
1. ✅ Add Analysis → CoreAwakening link
2. ✅ Pass analysis data to Twin birth
3. ✅ Create lifecycle state store
4. ✅ Verify E2E: Analysis → Awakening → Twin → Worlds

### Priority 2 (After P0-A):
- World context injection
- Twin personality per world
- Memory baseline initialization

---

## VERIFICATION

Before commit:
```bash
npm run type-check   # 0 errors
npm run test:unit   # Pass
npm run build        # Success
# E2E: Manual test flow
```

---

**Next: Create fixes immediately**
