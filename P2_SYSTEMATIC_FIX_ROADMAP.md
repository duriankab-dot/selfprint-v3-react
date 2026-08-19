# P2: SYSTEMATIC TEST FIX ROADMAP
**Status:** Mock infrastructure working. 168+ test failures remain.
**Strategy:** Fix category-by-category without full suite hang.

---

## CURRENT STATE
```
✅ Mocks registered: @supabase/supabase-js, @/lib/supabase/client, @/services/supabase-service
✅ Setup.ts: Optimized builder (removed vi.fn wrappers)
⚠️  Tests running but slow: FeedbackWidget 11 failed | 9 passed
❌ Full suite hangs after first test file
```

**Mock warnings:** "The vi.fn() mock did not use 'function' or 'class' in its implementation"
- Source: FeedbackWidget.test.tsx line 26 (test file itself, not setup)
- Issue: Test's mockImplementation() structure, not our Supabase mock
- Action: Fix test file, not setup

---

## FIX STRATEGY: Test-by-Test NOT Full Suite

### Phase 1: Fix FeedbackWidget Test File ✅ NEXT

**Issue:** vi.fn() warnings + slow async tests (1000+ ms per async operation)

**Root Cause Analysis:**
```
Test does: vi.mock('@/lib/intelligence/AIFeedbackLoop')
Then: mockImplementation(function() { return { recordFeedback: vi.fn()... } })
Problem: Component's async flow is waiting for something
```

**Symptoms:**
- Fast tests (render, UI checks): 6-177 ms ✅
- Slow tests (form submission, state changes): 1000+ ms ❌  
- Tests that wait for async operations timeout

**Fix:**
1. Review FeedbackWidget test → find what causes async delay
2. Mock recordFeedback response time
3. Add proper waitFor() conditions
4. Verify test completes in < 500ms

---

### Phase 2: Fix Other Test Files (Same Pattern)

After FeedbackWidget works, repeat for:
- MemoryRecorder.test.tsx (likely same AIFeedbackLoop issue)
- Avatar.test.tsx (rendering/CSS issues)
- ConfidenceIndicator.test.tsx (similar to Avatar)
- ContextDisplay.test.tsx (rendering)
- E2E tests (async flows)

**Per-File Approach:**
```bash
npm test -- <FileName> 2>&1 | tail -100
# Fix issues  
# Re-run until all pass
# Move to next
```

---

## FAILURE CATEGORIES

### Category A: Mock-Related (FeedbackWidget, MemoryRecorder)
- **Symptom:** Tests slow or timeout when calling Supabase
- **Fix:** Ensure mock resolves faster, use faster Promise mock responses
- **Time:** 10-15 min per file

### Category B: Component Rendering (Avatar, Confidence, Context)
- **Symptom:** "Unable to find element" or assertion fails  
- **Fix:** Add data-testid, use getByTestId, verify selector matches DOM
- **Time:** 5-10 min per file

### Category C: E2E Flows (E2E.test.tsx, critical paths)
- **Symptom:** Async chain issues, missing awaits
- **Fix:** Ensure all async calls awaited, break chains into steps
- **Time:** 15-20 min per file

### Category D: Vitest Configuration
- **Symptom:** "Worker exited unexpectedly"
- **Fix:** Check for circular mocks, infinite loops in setup
- **Time:** 5-10 min

---

## ACTION STEPS (IMMEDIATE)

### Step 1: Fix FeedbackWidget.test.tsx (NOW)

```bash
# Run only this file
cd D:\selfprint-v3-react
npm test -- FeedbackWidget 2>&1 | tail -100
```

**Look for:**
- What exact assertion fails in slow tests
- Are mocks responding correctly?
- Is component calling recordFeedback correctly?

**Common fixes:**
- Mock response needs to be faster: `vi.fn().mockResolvedValue(true)` ✅ (fast)
- Or component waiting for something: Check waitFor() timeout
- Or loop/recursion: Check test logic

### Step 2: Once FeedbackWidget passes
```bash
npm test -- MemoryRecorder 2>&1 | tail -100
```

### Step 3: Continue per-file until all categories fixed

---

## ESTIMATED COMPLETION

| File | Time | Failures |
|------|------|----------|
| FeedbackWidget | 15 min | 11 |
| MemoryRecorder | 10 min | ~8 |
| Avatar | 8 min | 2 |
| ConfidenceIndicator | 10 min | 4 |
| ContextDisplay | 5 min | 1 |
| E2E tests | 20 min | 4 |
| Other components | 30 min | ~128 |
| **TOTAL** | **~2 hours** | **168+** |

---

## SUCCESS CRITERIA PER FILE

```
✅ All tests in file pass
✅ No Vitest warnings
✅ No "Worker exited" errors  
✅ Average test time < 500ms
✅ No timeouts
```

---

## COMMIT AFTER EACH FILE

```bash
git add -A
git commit -m "Fix [FileName] tests - all pass"
git push
```

---

## VERIFICATION

After each phase:
```bash
npm test -- <Pattern> 2>&1 | grep "Test Files"
```

Expected:
```
Test Files  N failed | N passed
Tests       M failed | M passed
```

Target: `Test Files 0 failed | X passed`

---

## NOTES

- **Don't run full suite** — it hangs. Use per-file approach.
- **Mock setup is solid** — issue is in test files themselves
- **Warnings are fixable** — just need proper implementation in test file
- **Performance matters** — slow tests suggest real issues (missing mocks, sync waits, etc.)

**Next action:** Fix FeedbackWidget test file. Report back with results.

---

Generated: 2026-08-19
Status: Ready for Phase 1 (FeedbackWidget)
