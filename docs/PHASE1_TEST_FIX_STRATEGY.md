# PHASE 1: TEST SUITE FIX — ROOT CAUSE ANALYSIS

## Problem Summary
- **64 tests failing** out of 529 total
- **Root Cause:** Mock setup incomplete + Supabase mock chain breaks
- **Pattern:** mockInsert.toHaveBeenCalledWith() → 0 calls (expected > 0)

## Affected Test Files (Priority Order)

### Tier 1: CRITICAL (Blocks Core Flow)
1. `src/services/__tests__/CoreAwakeningService.phase3.test.ts` — Essence persistence
2. `src/services/__tests__/TwinLifecycle.integration.test.ts` — Twin birth + restore
3. `api/__tests__/intelligence.test.ts` — Claude integration

### Tier 2: IMPORTANT (Component Tests)
4. `src/components/intelligence/ConfidenceIndicator.test.tsx` — Element query issue
5. `src/components/dashboard/__tests__/IntelligencePanel.test.tsx`
6. `src/services/__tests__/DecisionLearning.p0-3.test.ts`

### Tier 3: SUPPORTING
7. Analytics tests
8. Sentiment tests
9. Other component tests

## Fix Strategy

### STEP 1: Fix Global Mock Setup (src/test/setup.ts)
**Issue:** Supabase mock chain is incomplete
```typescript
// Current (BROKEN):
vi.mocked(supabase.from).mockReturnValue({
  insert: mockInsert,
} as any);  // ← Any type, no chainability

// Fixed (PROPER):
const createChain = (tableName) => ({
  insert: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: {...}, error: null })
    })
  }),
  update: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: {...}, error: null })
      })
    })
  }),
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: {...}, error: null })
    })
  })
});

vi.mocked(supabase.from).mockImplementation(createChain);
```

### STEP 2: Fix Test Mocking Pattern
**Issue:** Tests manually create mocks but don't integrate with global setup
```typescript
// OLD PATTERN (BROKEN):
const mockInsert = vi.fn().mockReturnValue({...});
vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert });

// NEW PATTERN (FIXED):
const { supabase: supabaseMock } = vi.getMocked(supabase);
const mockChain = supabaseMock.from('awakening_essence');
// Chain already has insert/update/select ready from global setup
```

### STEP 3: Component Test Fixes
**Issue:** Test queries are too loose (match multiple elements)
```typescript
// OLD: getByText(/Evidence/i) → finds 2 elements ✗
// NEW: getByRole('heading', { name: /Evidence/i }) ✓
```

## Execution Order

```
1. Fix src/test/setup.ts (global infrastructure)
   └─ Commit: "fix: improve Supabase mock chain in test setup"

2. Fix Tier 1 tests (critical flow)
   ├─ CoreAwakeningService.phase3.test.ts
   ├─ TwinLifecycle.integration.test.ts
   ├─ api/intelligence.test.ts
   └─ Commit: "fix: repair critical flow tests (core awakening, twin lifecycle)"

3. Fix Tier 2 tests (components)
   ├─ ConfidenceIndicator.test.tsx (query selector issue)
   ├─ IntelligencePanel.test.tsx
   ├─ DecisionLearning.test.ts
   └─ Commit: "fix: repair component tests (query selectors, mock chains)"

4. Fix Tier 3 tests (supporting)
   └─ Commit: "fix: repair remaining tests (analytics, sentiment)"

5. Run full test suite
   └─ Commit: "test: verify all 529 tests passing"
```

## Verification Steps

For each test file:
1. [ ] Apply fix
2. [ ] Run: `npm test -- --run src/services/__tests__/CoreAwakeningService.phase3.test.ts`
3. [ ] Verify: exit code 0, no FAIL
4. [ ] Commit

Final:
1. [ ] Run: `npm test`
2. [ ] Verify: 529/529 PASS
3. [ ] Commit: "fix: all 529 tests passing"
