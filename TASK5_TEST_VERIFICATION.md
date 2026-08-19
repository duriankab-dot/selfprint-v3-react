# Task #5: Full Test Suite Verification

**Goal:** Run complete 529-test suite, verify 64 failures → 0, capture results

---

## Quick Start

```bash
cd D:\selfprint-v3-react
RUN_FULL_TEST_SUITE.bat
```

**Script handles:**
- ✅ Clean git locks (HEAD.lock, index.lock)
- ✅ Clear .vite cache
- ✅ Run npm test (5 min timeout)
- ✅ Capture output to file
- ✅ Generate report

---

## What to Expect

### Success Scenario (0 failures)
```
Status:      ✅ PASSED
Total Tests: 529
Passed:      529
Failed:      0
Duration:    ~2-3 minutes
```

### Current State (11 FeedbackWidget failures expected)
```
Status:      ❌ FAILED (exit code: 1)
Total Tests: 529
Passed:      ~518
Failed:      11 (FeedbackWidget text matchers)
Duration:    ~2-3 minutes
```

---

## Output Files

After running script:

```
test-results-2026-08-19_1550.log
└─ Full test output with all errors, stack traces

test-results-2026-08-19_1550.log.report.txt
└─ Parsed summary:
   - Pass/fail counts
   - Failed test files
   - Build errors (if any)
```

---

## If Tests Fail

### Expected: FeedbackWidget Text Matchers (11 tests)

**Error:** 
```
× should render full card view by default
  Unable to find an element with the text: You tend to make decisions analytically
  (Text is broken up by multiple elements)
```

**Status:** Function matcher applied (line 49), vitest cache pending flush ✓

**Next:** Confirm cache cleared by running again

---

### Unexpected: TypeScript/Build Errors

If build fails with TS errors:
1. Check recent edits to `src/api/middleware/`
2. Run: `npm run build` (separate window)
3. Fix reported TypeScript errors
4. Retry: `RUN_FULL_TEST_SUITE.bat`

---

## Manual Alternative

If batch script fails:

```bash
# 1. Clean cache
rmdir /s /q node_modules\.vite
del .git\HEAD.lock .git\index.lock

# 2. Run tests
npm test -- --run --reporter=verbose 2>&1 | tee test-results.log

# 3. Parse output
findstr "^.*✓\|^.*×" test-results.log > failed-tests.txt
```

---

## Success Criteria

✅ **Task #5 Complete when:**

1. **Tests run to completion** (no timeout)
2. **Count reported:**
   - 529 total tests
   - X passed, Y failed
3. **Results captured** in `test-results-*.log`
4. **Report generated** in `.log.report.txt`
5. **Analysis done:**
   - Which tests failed?
   - Are they text matchers or new issues?
   - Any build errors?

---

## Next Steps After Test Run

### If 0 failures ✅
- Mark Task #5 COMPLETE
- Proceed to Task #8 (E2E verification)
- Verify no regressions

### If 11 FeedbackWidget failures
- Expected (vitest cache + text matcher)
- Mark as KNOWN
- Add to blockers list
- Document that cache flush needed for Task #8

### If other failures appear
- Investigate each failure
- Check if new or pre-existing
- Create sub-tasks for each failure category

---

## Monitoring During Run

While tests run:
- ✓ Window shows "Running tests..." 
- ✓ Log file accumulates in real-time
- ✓ Can open test-results-*.log in editor to follow along
- ✓ Timeout: 5 minutes (300s) — should complete in 2-3 min

---

## Troubleshooting

### Timeout (test runs > 5 min)
```batch
REM Edit script, increase timeout:
REM timeout /t 300 /nobreak >nul  ← Change 300 to 600 for 10 min
```

### npm not found
```
ERROR: npm not found. Please install Node.js.
```
Download from: https://nodejs.org/

### Permission denied on cache deletion
- Close any IDE/editor using node_modules
- Retry script

### Stale git lock persists
```bash
# Manual cleanup
del /f .git\HEAD.lock
del /f .git\index.lock
```

---

## Task #5 Checklist

- [ ] Run `RUN_FULL_TEST_SUITE.bat`
- [ ] Verify script started (shows "Running 529 tests...")
- [ ] Wait for completion (2-5 min)
- [ ] Check output: `test-results-*.log` created
- [ ] Review summary: count passed/failed
- [ ] Analyze failures (if any)
- [ ] Update task status (completed or blocked)
- [ ] Commit results if needed

---

**Ready?** → `RUN_FULL_TEST_SUITE.bat` 🚀
