# 🚀 STEP 5: E2E Tests on PRODUCTION

**Target:** https://www.selfprint.one (LIVE)

---

## ✅ Run E2E Tests on Production

```bash
npm run test:e2e
```

---

## 📊 Expected Results

```
baseURL: https://www.selfprint.one

✓ smoke.spec.ts (12 tests)
✓ auth.spec.ts (8 tests)
✓ twin.spec.ts (5 tests)
✓ decision.spec.ts (6 tests)
✓ world-visual.spec.ts (4 tests)
✓ upload.spec.ts (3 tests)

Total: 38 tests
Duration: ~5-10 minutes (network dependent)
```

---

## ⏱️ Timeline

- **Browser setup:** ~10s
- **Navigation & auth:** ~30s per spec
- **E2E tests:** ~5-10 minutes total

---

## 📝 If Tests Fail

**Common reasons:**
- Network timeout (production slow)
- Auth not ready
- Feature not deployed yet

**Solution:**
- Check https://www.selfprint.one manually first
- Verify landing page loads
- Verify auth flow works
- Then retry `npm run test:e2e`

---

## 🎯 PHASE A STEP 5

```
Input:  https://www.selfprint.one (production site)
Tests:  38 E2E test cases
Output: ✓ All pass = STEP 5 COMPLETE
```

---

**Go!**
```bash
npm run test:e2e
```

