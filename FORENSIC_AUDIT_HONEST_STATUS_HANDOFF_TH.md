# FORENSIC AUDIT — HONEST STATUS HANDOFF ภาษาไทย

**อัปเดต:** 12 กันยายน 2026 (เขียนทับรายงานเดิมที่เคลม "FULL PASS" โดยไม่ได้รันจริง)

---

## สรุปสถานะจริง (วัดจากการรันจริงทั้งหมด)

```
MASTER GATE = NOT PASS ❌  (Phase B staging 21/49)
```

| หมวด | ผล |
|------|-----|
| Build / Typecheck / Lint / Unit | ✅ ผ่านทั้งหมด (vitest 1042/1042) |
| Phase A production (`--project=chromium`) | ✅ 27/27 |
| Mobile Chrome / Mobile Safari | ✅ 12/12, 12/12 |
| Phase B staging (`--project=chromium-staging`) | ❌ 21/49 (ผ่าน 21, ล้มเหลว 27, ข้าม 1) |
| Full suite (ทั้ง 4 projects) | 72 passed / 27 failed / 1 skipped |

---

## ไทม์ไลน์การตรวจ (ซื่อสัตย์)

1. **รายงานก่อนหน้า** (02:05 UTC) เคลม Phase B 49/49 PASS — **ไม่มีการรันทดสอบจริง** เป็นข้อมูลเท็จ
2. **ผู้ใช้รันจริงที่ commit 60715c5** พบ:
   - `npm run typecheck` ไม่มี script
   - `npx playwright test --project=chromium` → ByteString error ที่ globalSetup
   - `--project=chromium-staging` → project ไม่ถูก define ตอน config evaluation
3. **เซสชันนี้: ตรวจวินิจฉัย + แก้ + รันจริง**

## ผลตรวจ ByteString error (สอบสวนเสร็จ)

- สาเหตุ: HTTP header value ต้องเป็น ASCII "ByteString" — อักขระไทย `ใ` (U+0E43 = 3651) ที่ **index 5** ของ `E2E_SUPABASE_ANON_KEY` (header `apikey`) ทำให้ `fetch` โยน `Cannot convert argument to a ByteString ... 3651 > 255`
- ไฟล์ `.env.e2e.staging` ปัจจุบัน: UTF-8 ถูกต้อง; **ค่าตัวแปรทุกตัวเป็น ASCII บริสุทธิ์** (พบ non-ASCII เฉพาะใน comment 4 บรรทัด) → ค่าที่ผู้ใช้รันตอนแรกน่าจะถูกปนด้วยการคัดลอกจากแชท/IME
- เพิ่ม guard ใน `global-setup.ts`: เจอ non-ASCII ใน header → error ชัดเจน (บอกชื่อตัวแปร + index + U+code point) **ไม่ปริ้นค่าความลับ**

## วิธีตรวจ .env (ไม่ปริ้นค่า)

| ตัวแปร | status | length (chars) | allAscii<=255 |
|--------|--------|----------------|---------------|
| E2E_SUPABASE_URL | present | 40 | ✅ |
| E2E_SUPABASE_ANON_KEY | present | 46 | ✅ |
| E2E_TEST_PASSWORD | present | 12 | ✅ |
| STAGING_URL | present | 35 | ✅ |

## งานที่ทำในเซสชันนี้ (uncommitted)

- `package.json`: เพิ่ม `typecheck`
- `playwright.config.ts`: define `chromium-staging` แบบไม่มีเงื่อนไข (ตัด race condition `existsSync`)
- `global-setup.ts`: ASCII guard + deterministic staging detection (config.argv) + placeholder state สำหรับ Phase A + error ชัดเจนเมื่อรัน staging โดยไม่มี creds
- `test-user.ts`: lazy getters (collection ไม่ require password)
- `run-staging.mjs`: set `E2E_STAGING_RUN=1`

## งานที่เหลือ (blocker ของ Phase B)

1. rebuild/redeploy staging ให้ตรงกับ `src` (deployed bundle ยังไม่มี `data-testid` ที่ทดสอบต้องการ; `staging.selfprint.one` เองเป็น Cloudflare 525)
2. reconcile ทดสอบ MG-01/MG-02-01/MG-06 กับ decision เอา Living Twin ออก (immersion-first)
3. เพิ่ม testid ที่ยังขาด หรือแปลงเป็น `test.fixme` ที่ถูกต้อง (ตัวเดิม 17 จุดเป็น no-op)

## สิ่งที่ "ห้าม" อีกต่อไป

- ห้ามเคลม PASS โดยไม่ได้รันจริง
- ห้ามใส่ secret ลงในเอกสาร commit (anon key เดิมที่หลุดในรายงานถูกเขียนทับลบออกแล้ว)

**สถานะ:⚠️ NOT PASS — แก้ infrastructure แล้ว แต่ Phase B ยังติดที่ UI/test contract drift**