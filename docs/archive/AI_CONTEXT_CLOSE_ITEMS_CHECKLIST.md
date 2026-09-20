# CLOSE ITEMS CHECKLIST — สิ่งที่ต้องปิดก่อนอื่น
## ใช้ร่วมกับ SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md

**Status:** Ready for implementation  
**Date:** 19 August 2026  
**Priority:** 🔴 P0 (Block all other work until closed)

---

## ✅ CLOSE ITEM #1: Session Storage Hack → Supabase Persistence

**File:** `src/services/CoreAwakeningService.ts`  
**Lines:** 101-112  
**Severity:** 🔴 CRITICAL (Twin doesn't persist)

**Current Code (WRONG):**
```typescript
// ❌ Twin essence ใน sessionStorage → dies on refresh
const awakeningCache = new Map<string, any>();
awakeningCache.set(userId, essence);

if (typeof window !== 'undefined' && window.sessionStorage) {
  window.sessionStorage.setItem(`awakening-essence-${userId}`, JSON.stringify(essence));
}
```

**Fix Required:**
```typescript
// ✅ Twin essence ใน Supabase → persists forever
const { data, error } = await supabase
  .from('twins')
  .insert({
    user_id: userId,
    essence: essence,
    created_at: new Date()
  });
```

**Verification Steps:**
1. [ ] Create Twin
2. [ ] Refresh page → Twin loads from Supabase ✅
3. [ ] Logout/Login → Twin restored ✅
4. [ ] Browser restart → Twin still there ✅

**Test:** `src/tests/twin-persistence.test.ts`

**Commit Message:** `fix: Replace sessionStorage hack with Supabase persistence for Twin essence`

**Blocks:** Everything (can't test anything until this works)

---

## ✅ CLOSE ITEM #2: Test Suite — 64 Failures → 529/529 Passing

**Files:** `src/tests/**/*.test.ts`  
**Total Tests:** 529  
**Failures:** 64  
**Severity:** 🔴 CRITICAL (Can't verify anything)

**Root Cause:** Supabase mock not configured in test setup

**Critical Failures:**
1. `src/tests/phase3.test.ts` — Supabase mock initialization
2. `src/tests/TwinLifecycle.integration.test.ts` — Persistence mock
3. `src/tests/CoreAwakening.integration.test.ts` — E2E setup

**Fix Steps:**
1. [ ] Check test setup file (`jest.setup.ts` or similar)
2. [ ] Verify Supabase client is properly mocked
3. [ ] Run `npm test` and identify first failure
4. [ ] Fix one test at a time
5. [ ] Target: `npm test 2>&1 | grep "529 passing"`

**Commit Message:** `test: Fix all test failures, achieve 529/529 passing`

**Blocks:** Cannot verify Twin, SICE, World, Decision systems

---

## ✅ CLOSE ITEM #3: Decision Learning Loop — 3 TODO Items

**Locations:**

### TODO #1
**File:** `src/services/DecisionAutomationService.ts:83`
```typescript
// TODO: "Implement ใน Phase 7 using DecisionLearningService"
// ❌ Automation is stub, not working
```
**Fix:** Implement full automation logic connecting to DecisionLearningService

### TODO #2
**File:** `src/services/DecisionLearningService.ts:204`
```typescript
// TODO: "Update Twin's system prompt ด้วย patterns"
// ❌ Twin doesn't learn from past decisions
```
**Fix:** Extract patterns from decision history and update Twin system prompt dynamically

### TODO #3
**File:** `src/services/DecisionService.ts:280`
```typescript
// TODO: "ใช้ recordDecision แทน"
// ❌ Old method still in use
```
**Fix:** Replace with recordDecision, remove legacy code

**Verification:**
- [ ] Create decision
- [ ] Verify scheduled in DB
- [ ] Verify notification queued
- [ ] Record outcome
- [ ] Verify Twin learned (system prompt updated)
- [ ] Test: Twin's next advice reflects learning

**Test:** `src/tests/decision-learning-loop.e2e.test.ts`

**Commit Message:** `feat: Complete Decision Learning Loop (close 3 TODOs)`

**Blocks:** Cannot verify Decision system learning

---

## ✅ CLOSE ITEM #4: Rate Limiting Middleware (Missing)

**Location:** API endpoints (`/api/*`)  
**Severity:** 🔴 CRITICAL (Security gap: DDoS vulnerability)

**What's Missing:** No rate limiting middleware

**Add to:** `src/middleware/rateLimiter.ts` or `server/index.ts`

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP per window
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter); // Apply to all API routes
```

**Verification:**
1. [ ] Send 100 requests to `/api/intelligence` → all pass
2. [ ] Send 101st request → receive 429 Too Many Requests
3. [ ] Wait 15 minutes → counter resets

**Test:** `src/tests/security/rate-limiting.test.ts`

**Commit Message:** `security: Add rate limiting middleware to all API endpoints`

**Blocks:** Cannot deploy to production securely

---

## ✅ CLOSE ITEM #5: Input Validation Incomplete

**Current:** Only `/api/decisions` is validated  
**Missing validation for:**
- `/api/intelligence` (mood, birthDate, finetuneAnswers)
- `/api/push` (subscription object)
- `/api/auth/*` (credentials)

**Location:** Add validation middleware in `src/middleware/validation.ts`

**Example:**
```typescript
export const validateIntelligencePayload = (payload: any) => {
  if (!payload.mood || typeof payload.mood !== 'string') {
    throw new Error('Invalid mood: must be string');
  }
  if (!isValidDate(payload.birthDate)) {
    throw new Error('Invalid birthDate: must be valid date');
  }
  if (!Array.isArray(payload.finetuneAnswers)) {
    throw new Error('Invalid finetuneAnswers: must be array');
  }
};

// Use in route:
app.post('/api/intelligence', validateIntelligencePayload, handler);
```

**Verification:**
1. [ ] Send invalid mood → 400 Bad Request
2. [ ] Send invalid birthDate → 400 Bad Request
3. [ ] Send invalid subscription → 400 Bad Request
4. [ ] Send valid payload → 200 OK

**Test:** `src/tests/security/input-validation.test.ts`

**Commit Message:** `security: Add input validation to all API endpoints`

**Blocks:** Cannot deploy to production safely

---

## ✅ CLOSE ITEM #6: Service Documentation (49 undocumented)

**Current:** 62 production services, only 13 documented  
**Action:** Create comprehensive service inventory

**Location:** Create `docs/SERVICE_INVENTORY_COMPLETE.md`

**Format per service:**
```markdown
### ServiceName
- **Category:** Core | Support
- **File:** src/services/ServiceName.ts
- **Status:** IMPLEMENTED | PARTIAL | INCOMPLETE
- **Purpose:** Brief description
- **Dependencies:** [List dependent services]
- **Tests:** [Link to test file or "None"]
- **Last Updated:** YYYY-MM-DD
```

**Verification:**
1. [ ] All 62 services documented
2. [ ] Each marked as Core (13) or Support (49)
3. [ ] Status marked (IMPLEMENTED/PARTIAL/INCOMPLETE)
4. [ ] Dependencies clear
5. [ ] Test coverage known

**Commit Message:** `docs: Document all 62 production services`

**Blocks:** Cannot understand codebase architecture clearly

---

## ✅ CLOSE ITEM #7: Entry Resolver Architecture (Missing)

**Current:** Basic routing in App.tsx  
**Required:** Centralized entry resolution logic

**Create:** `src/services/EntryResolver.ts`

**Logic:**
```typescript
export async function resolveEntryPath(user: User | null): Promise<EntryResolution> {
  // Check 1: Authenticated?
  if (!user) return { path: '/en/', type: 'guest' };
  
  // Check 2: Twin exists?
  const twin = await fetchUserTwin(user.id);
  if (twin) return { path: '/twin', type: 'returning_with_twin' };
  
  // Check 3: Journey in progress?
  const journey = await fetchUserJourney(user.id);
  if (journey) return { path: journey.last_step, type: 'resume_journey' };
  
  // Check 4: Preferred entry?
  const prefs = await fetchUserPreferences(user.id);
  return { path: prefs.preferred_entry || '/dashboard', type: 'returning_new_session' };
}
```

**Usage in App.tsx:**
```typescript
const resolution = await resolveEntryPath(auth.session?.user);
navigate(resolution.path);
```

**Verification:**
1. [ ] Guest user → Landing
2. [ ] Existing + Twin → Twin (direct)
3. [ ] Existing + incomplete → Resume state
4. [ ] PWA + Twin → Twin (not Landing)
5. [ ] All entry_path values tracked correctly

**Test:** `src/tests/entry-resolution.test.ts`

**Commit Message:** `feat: Implement centralized EntryResolver for Smart Entry Architecture`

**Blocks:** Cannot implement Smart Entry feature

---

# IMPLEMENTATION ORDER

**Complete in this order:**

1. ✅ **#1: Session Storage → Supabase** (2 hrs)
   - Without this, can't test anything
   
2. ✅ **#2: Fix Tests** (4-8 hrs)
   - Proves #1 works
   - Unblocks verification
   
3. ✅ **#4 & #5: Security (Rate Limit + Validation)** (2-4 hrs)
   - Required before prod
   - Relatively simple
   
4. ✅ **#7: Entry Resolver** (2-4 hrs)
   - Needed for Smart Entry
   - Can test independently
   
5. ✅ **#3: Decision Loop** (4-6 hrs)
   - Complex but not blocking
   - Depends on #2 (tests)
   
6. ✅ **#6: Service Documentation** (2-3 hrs)
   - Last (documentation)
   - Doesn't block anything

**Total:** 16-27 hours (2-4 days with focus)

---

# DAILY CHECKLIST

**Day 1:**
- [ ] Item #1: Session Storage fix (test passing)
- [ ] Item #2: First batch of test fixes

**Day 2:**
- [ ] Item #2: Continue test fixes (target 529/529)
- [ ] Item #4 & #5: Rate limiting + validation (2-3 hours)

**Day 3:**
- [ ] Item #7: Entry Resolver (2-3 hours)
- [ ] Item #3: Decision Loop TODOs (4-5 hours)
- [ ] Item #6: Service Documentation (start if time permits)

**Day 4:**
- [ ] Item #6: Complete Service Documentation
- [ ] Verify: All CLOSE items closed
- [ ] Commit: Final "Close all P0 items" commit
- [ ] Update master document status

---

**Ready?** Start with Item #1. Everything else depends on it.
