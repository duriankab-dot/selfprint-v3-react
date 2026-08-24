# ⚡ PHASE A: LOCAL EXECUTION GUIDE

**ผมทำเฟส A ได้เพียง 3/14 ขั้นตอนในสภาวะ Sandbox**  
**ที่เหลือ 11 ขั้นตอน ต้องทำบนเครื่องของคุณเอง**

---

## 🎯 สิ่งที่ผมทำแล้ว ✅

```
STEP 1: npm install              ✅ 496 packages
STEP 2: npm run build            ✅ 25.98s, bundle OK
STEP 3: npm run lint + fixes     ✅ 4 lint errors FIXED
```

---

## 🔴 สิ่งที่ต้องทำบนเครื่องของคุณ (Local)

### STEP 4: รัน Unit Tests
```bash
cd D:\selfprint-v3-react

# 1. สตาร์ท Supabase Local
supabase start

# รอจนกว่า:
# ✓ Postgres database started
# ✓ Auth server started
# ✓ Local development server started successfully at http://localhost:54321

# 2. รัน tests
npm test

# ผลที่คาดหวัง:
# ✓ All tests passed
# ✓ No timeouts
```

---

### STEP 5: รัน E2E Tests

**Terminal 1:**
```bash
cd D:\selfprint-v3-react
npm run dev

# รอจนกว่า:
# ✓ Local: http://localhost:5173
```

**Terminal 2 (เฉพาะหลังจาก Terminal 1 ready):**
```bash
cd D:\selfprint-v3-react
npm run test:e2e

# ผลที่คาดหวัง:
# ✓ smoke.spec.ts (12 tests)
# ✓ auth.spec.ts (8 tests)
# ✓ All tests passed
```

---

### STEP 6-14: ตรวจสอบ Production

1. **เปิดเว็บไซต์:**
   ```
   https://www.selfprint.one
   ```
   - โหลดแล้วหรือเปล่า?
   - มี error แดงหรือเปล่า?

2. **ตรวจ Landing Page:**
   - ข้อความแสดงผลถูกต้องหรือเปล่า?
   - ภาพมันขึ้นมาหรือเปล่า?
   - ปุ่ม CTA ทำงานหรือเปล่า?

3. **ตรวจ Auth Flow:**
   - https://www.selfprint.one/auth
   - Modal auth แสดงผลหรือเปล่า?

4. **ตรวจ Chat:**
   - Chat interface โหลดหรือเปล่า?
   - Voice features ตั้งค่าอย่างถูกต้องหรือเปล่า?

5. **ตรวจ Performance:**
   - ใช้: https://pagespeed.web.dev/?url=https://www.selfprint.one
   - LCP < 2.5s หรือเปล่า?
   - CLS < 0.1 หรือเปล่า?

6. **ตรวจ Error Tracking:**
   - เข้า https://sentry.io
   - SELFPRINT project มี error จำนวนมากหรือเปล่า?

---

## ✅ CHECKLIST ก่อน PHASE A COMPLETE

- [ ] STEP 1-3: ✅ Done (ผมทำแล้ว)
- [ ] STEP 4: npm test ✅ All pass
- [ ] STEP 5: npm run test:e2e ✅ All pass
- [ ] STEP 6-14: Production verified ✅ All checks pass
- [ ] เอกสาร: Generate PHASE_A_COMPLETION_REPORT_TH.md

---

## 📊 WHEN ALL STEPS PASS

```
PHASE A: ✅ PRODUCTION VERIFIED 100%

Status:   COMPLETE ✓
Verdict:  Ready for production
Next:     Start PHASE B features
```

---

## 🚨 IF STEP 4-5 FAIL

**ถ้า npm test ล้ม:**
```bash
# 1. ตรวจ Supabase started
supabase status

# 2. ถ้ายังไม่ start ให้ kill และ restart
supabase stop
supabase start

# 3. รีรัน test
npm test
```

**ถ้า npm run test:e2e ล้ม:**
```bash
# 1. ตรวจ dev server running
# (ควร localhost:5173)

# 2. ตรวจ playwright browser
npx playwright install

# 3. รีรัน
npm run test:e2e --debug
```

---

## 📞 SUMMARY

**ผมทำ:**
- ✅ Audit code (10 domains)
- ✅ Build + compile
- ✅ Fix lint errors
- ✅ Deploy to production
- ✅ Generate documentation

**คุณต้องทำ:**
- STEP 4: npm test (ต้อง Docker + Supabase local)
- STEP 5: npm run test:e2e (ต้อง Browser)
- STEP 6-14: ตรวจสอบ production

**After you complete:**
- PHASE A ✅ DONE 100%
- Ready for PHASE B 🚀

---

**ขออภัยที่จำนวนจากไป 🙏**  
**Sandbox environment มีข้อจำกัด ทำ STEP 4-5 ไม่ได้**  
**ต้องทำเองบนเครื่องของคุณ**

