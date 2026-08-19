# 🚨 P0 CRITICAL FIXES ROADMAP

**Status:** BLOCKED → P0 Fixes in Progress  
**Date:** 19 August 2026  
**Goal:** Production Ready in 2-3 weeks

---

## FIX #1: Test Suite (64 failures → 0 failures)

### Problem
```
❌ 64 tests failing
❌ Core Twin lifecycle unverified
❌ Supabase mock not initialized properly
❌ Cannot confirm runtime behavior
```

### Root Cause
- Mock Supabase client not setup with proper table methods
- CoreAwakening.phase3 test expecting persistence that mock doesn't do
- Twin lifecycle integration test missing proper mock fixtures

### Solution

**Step 1: Fix Mock Setup**

File: `src/__tests__/setup.ts` or `jest.setup.ts`

```typescript
// Before: Missing mock implementation
// After: Proper mock with all table methods

const mockSupabase = {
  from: (table) => ({
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
    update: jest.fn().mockResolvedValue({ data: {}, error: null }),
    delete: jest.fn().mockResolvedValue({ data: null, error: null }),
    eq: jest.fn().mockReturnThis(),
    // ... other methods
  }),
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
  },
};

// Mock tables with storage
const tableStorage = {
  twins: [],
  users_profiles: [],
  blueprints: [],
  // ... all tables
};
```

**Step 2: Fix CoreAwakening Test**

File: `src/__tests__/services/CoreAwakening.test.ts`

```typescript
it('phase3: TwinBirth should persist to essence table', async () => {
  const mockUser = { id: 'user123' };
  
  // Mock INSERT to return saved essence
  mockSupabase.from('awakening_essence').insert = jest.fn()
    .mockResolvedValue({
      data: { id: 'essence123', ... },
      error: null
    });
  
  const result = await CoreAwakeningService.phase3_TwinBirth(mockUser);
  
  expect(result.success).toBe(true);
  expect(mockSupabase.from).toHaveBeenCalledWith('awakening_essence');
});
```

**Step 3: Fix Twin Lifecycle Test**

File: `src/__tests__/integration/TwinLifecycle.test.ts`

```typescript
describe('Twin Lifecycle', () => {
  beforeEach(() => {
    // Reset mock storage before each test
    tableStorage.twins = [];
    tableStorage.awakening_essence = [];
  });

  it('Signup → Birth → Persist → Retrieve', async () => {
    // 1. Signup
    const user = await AuthService.signUp(email, password);
    
    // 2. Initiate awakening
    const awakening = await CoreAwakening.start(user.id);
    
    // 3. Complete phases
    await CoreAwakening.phase3_TwinBirth(user.id);
    
    // 4. Verify persistence
    const essence = tableStorage.awakening_essence[0];
    expect(essence.user_id).toBe(user.id);
    
    // 5. Verify retrieval
    const retrieved = await TwinService.getTwinProfile(user.id);
    expect(retrieved.id).toBe(user.id);
  });
});
```

### Deadline
**Day 1-2** (by end of Aug 20)

### Verification
```bash
npm test
# Target: 529 passed, 0 failed, 0 skipped
```

**Owner:** AI Dev / Test Engineer

---

## FIX #2: Rate Limiting (Missing → Complete)

### Problem
```
❌ No rate limit protection
❌ DDoS vulnerability
❌ API endpoints unprotected
```

### Solution

**File: `api/_utils/rate-limit.ts` (NEW)**

```typescript
import { Request } from '@vercel/node';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {}; // In production: use Redis

const LIMITS = {
  intelligence: { perMin: 100, perHour: 1000 },
  api: { perMin: 1000, perHour: 10000 },
};

export async function checkRateLimit(
  request: Request,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userId = request.headers.get('x-user-id') || ip;
  const key = `${endpoint}:${userId}`;
  
  const now = Date.now();
  const entry = store[key];
  
  if (!entry || now > entry.resetTime) {
    // Reset window
    store[key] = { count: 1, resetTime: now + 60000 };
    return { allowed: true, remaining: LIMITS[endpoint].perMin - 1, resetIn: 60 };
  }
  
  entry.count++;
  const limit = LIMITS[endpoint].perMin;
  
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
  }
  
  return { allowed: true, remaining: limit - entry.count, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
}
```

**File: `api/unified-handler.ts` (UPDATE)**

```typescript
import { checkRateLimit } from './_utils/rate-limit.js';

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const endpoint = url.pathname.split('/').pop();
  
  // Check rate limit for critical endpoints
  if (endpoint === 'intelligence' || endpoint === 'stripe' || endpoint === 'profile') {
    const limit = await checkRateLimit(request, endpoint);
    
    if (!limit.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded', resetIn: limit.resetIn },
        { status: 429 }
      );
    }
  }
  
  // ... rest of handler
}
```

### Deadline
**Day 1** (by end of Aug 20)

### Verification
```bash
# Hammer /api/intelligence with 101 requests
for i in {1..101}; do curl -X POST http://localhost:3000/api/intelligence; done

# Verify: Request 101 gets 429 Too Many Requests
```

**Owner:** Backend Dev

---

## FIX #3: Input Validation (Partial → Complete)

### Problem
```
❌ Only /api/decisions validated
❌ Other endpoints accept arbitrary input
❌ XSS/injection vulnerability
```

### Solution

**File: `api/_utils/validators.ts` (NEW)**

```typescript
export function validateProfile(data: any): { valid: boolean; error?: string } {
  if (!data) return { valid: false, error: 'Empty data' };
  
  // dateOfBirth: YYYY-MM-DD
  if (data.dateOfBirth) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
      return { valid: false, error: 'Invalid dateOfBirth format' };
    }
    const date = new Date(data.dateOfBirth);
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'Invalid date' };
    }
  }
  
  // timeOfBirth: HH:MM
  if (data.timeOfBirth) {
    if (!/^\d{2}:\d{2}$/.test(data.timeOfBirth)) {
      return { valid: false, error: 'Invalid timeOfBirth format' };
    }
  }
  
  // Prevent XSS in strings
  if (data.placeOfBirth && typeof data.placeOfBirth === 'string') {
    if (/<script|<iframe|javascript:/i.test(data.placeOfBirth)) {
      return { valid: false, error: 'Invalid characters in placeOfBirth' };
    }
  }
  
  return { valid: true };
}

export function validateBlueprint(data: any): { valid: boolean; error?: string } {
  if (typeof data.accuracyLevel !== 'number' || data.accuracyLevel < 0 || data.accuracyLevel > 100) {
    return { valid: false, error: 'accuracyLevel must be 0-100' };
  }
  
  if (!Array.isArray(data.strengths) || data.strengths.length === 0) {
    return { valid: false, error: 'strengths required (non-empty array)' };
  }
  
  return { valid: true };
}

export function validateIntelligence(data: any): { valid: boolean; error?: string } {
  if (typeof data.message !== 'string' || data.message.length === 0) {
    return { valid: false, error: 'message required' };
  }
  
  if (data.message.length > 2000) {
    return { valid: false, error: 'message too long (max 2000 chars)' };
  }
  
  return { valid: true };
}
```

**Apply to all endpoints:**

```typescript
// /api/profile POST
const validation = validateProfile(body);
if (!validation.valid) {
  return Response.json({ error: validation.error }, { status: 400 });
}

// /api/blueprint POST
const validation = validateBlueprint(body);
if (!validation.valid) {
  return Response.json({ error: validation.error }, { status: 400 });
}

// /api/intelligence POST
const validation = validateIntelligence(body);
if (!validation.valid) {
  return Response.json({ error: validation.error }, { status: 400 });
}
```

### Deadline
**Day 1-2** (by end of Aug 20)

### Verification
```bash
# Test: Send invalid profile
curl -X POST http://localhost:3000/api/profile \
  -H "Authorization: Bearer token" \
  -d '{"dateOfBirth": "invalid"}'

# Expected: 400 Bad Request with error message
```

**Owner:** Backend Dev

---

## FIX #4: Documentation (Wrong → Correct)

### Problem
```
❌ Claims 13 services, actually 44
❌ MASTER_DIRECTIVE.md outdated
❌ Documentation invalidates architecture claims
```

### Solution

**File: Update `SELFPRINT_MASTER_DIRECTIVE.md`**

Find and replace:
```
OLD: "Selfprint has 13 core application services"
NEW: "Selfprint has 44 core + utility services across 7 categories"

OLD: "Core Services: Intelligence, Auth, Twin, Memory, ..."
NEW: "See docs/SERVICE_INVENTORY_COMPLETE_2026-08-19.md for full inventory"
```

**Files to update:**
- [ ] `SELFPRINT_MASTER_DIRECTIVE.md` — Change service count
- [ ] `AI CONTEXT.md` — Add service list
- [x] `docs/SERVICE_INVENTORY_COMPLETE_2026-08-19.md` — Created ✓
- [x] `docs/PRODUCTION_AUDIT_RESPONSE_2026-08-19.md` — Created ✓
- [x] `P0_STATUS.md` — Updated ✓

### Deadline
**Day 1** (by end of Aug 20)

### Verification
```bash
grep -n "13.*service" SELFPRINT_MASTER_DIRECTIVE.md
# Should return 0 matches (all 13s replaced with 44)
```

**Owner:** Documentation

---

## TIMELINE

```
AUG 20 (Day 1):
  ✓ Fix test setup (Supabase mock)
  ✓ Add rate limiting
  ✓ Start input validation
  ✓ Update documentation

AUG 21 (Day 2):
  ✓ Complete input validation
  ✓ Run full test suite → verify 0 failures
  ✓ Create E2E test skeleton
  ✓ Add SEO (schema, sitemap)

AUG 22-23 (Days 3-4):
  ✓ E2E critical path testing
  ✓ Performance baseline documentation
  ✓ Security audit (rate limit + validation verification)

AUG 24+ (Day 5+):
  ✓ Final QA
  ✓ Monitoring setup
  ✓ Launch readiness
```

---

## GATE CRITERIA (Before Production)

- [ ] `npm test` returns 0 failures
- [ ] E2E critical path verified
- [ ] Rate limiting working (test: exceed limit → 429)
- [ ] Input validation working (test: invalid input → 400)
- [ ] All documentation updated + accurate
- [ ] Security audit passed
- [ ] Performance baselines documented
- [ ] Monitoring alerts configured

---

**Next Phase:** P1 Major Fixes (E2E suite, SEO, baselines)  
**Current Phase:** P0 Critical (THIS ROADMAP)

**Prepared by:** Senior AI Full-Stack Engineer  
**Date:** 19 August 2026
