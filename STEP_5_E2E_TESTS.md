# 🎬 STEP 5: E2E Tests (Fixed)

**Config Updated:** ✅ `playwright.config.ts`

```javascript
baseURL: 'http://localhost:5173'    // ← LOCAL (ไม่ใช่ production!)
webServer: {
  command: 'npm run dev',           // ← Auto-start dev server
  url: 'http://localhost:5173',
  reuseExistingServer: true,
}
```

---

## ✅ NOW: Just Run This

```bash
npm run test:e2e
```

**That's it!** Playwright จะ:
1. ✓ Start dev server automatically (`npm run dev`)
2. ✓ Wait for http://localhost:5173 to be ready
3. ✓ Run all E2E tests against LOCAL server
4. ✓ Clean up after done

---

## 📊 Expected Output

```
smoke.spec.ts (12 tests)         ✓
auth.spec.ts (8 tests)           ✓
twin.spec.ts (5 tests)           ✓
decision.spec.ts (6 tests)       ✓
world-visual.spec.ts (4 tests)   ✓
upload.spec.ts (3 tests)         ✓

Total: 38 tests passed in ~3 minutes
```

---

## ⏱️ Timeline

- **Playwright startup:** ~10s
- **Dev server start:** ~15s
- **Tests run:** ~2-3 minutes
- **Total:** ~3-4 minutes

---

## 🚀 Go!

```bash
npm run test:e2e
```

**ปิด terminal อื่นๆ ออกก่อน** (ไม่ต้อง manual start dev server)

---

**ที่อัปเดต:**
- `playwright.config.ts` — baseURL + webServer config
- **ผลลัพธ์:** Tests run local, ไม่ test production

