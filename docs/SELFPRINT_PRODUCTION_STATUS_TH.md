# 🟢 SELFPRINT PRODUCTION STATUS ภาษาไทย

**อัปเดต:** 12 กันยายน 2026 — เขียนทับข้อมูล "VERIFIED 100% / FULL PASS" ที่คลาดเคลื่อน

---

## Production (https://selfprint.one)

| รายการ | สถานะ |
|--------|--------|
| หน้า landing /en /th /pricing /components /login | ✅ 200 ผ่าน |
| SK-01..12 production smoke | ✅ 27/27 `/api/og`, `/llms.txt`, CTA, JS errors, cold-start(<8s) |
| Mobile production smoke | ✅ 12/12 (Chrome), 12/12 (Safari/WebKit) |
| ข้อความ Trojan rule (ไม่ให้มี "ดูดวง") | ✅ ผ่าน |

**สรุป production: ✅ พร้อมใช้งาน (Phase A 51/51)**

## Staging

| รายการ | สถานะ |
|--------|--------|
| Auth pipeline (REST login → inject → storageState) | ✅ ทำงานจริง |
| Phase B staging E2E (49) | ❌ 21 PASS / 27 FAIL / 1 SKIP |
| สาเหตุหลัก 22 tests | deployed bundle ไม่มี `data-testid="dashboard-container"` (verify จาก HTML ที่เสิร์ฟจริง) |
| สาเหตุรอง 5 tests | MG-01 (Living Twin Three.js) / MG-02-01 / MG-06 — UI ถูกเอาออกตาม design ใหม่ |
| `staging.selfprint.one` | ❌ Cloudflare 525 SSL — ใช้ `selfprint-staging.pages.dev` แทนได้ |

**สรุป staging: ⚠️ ยังไม่ผ่าน gate — ติดที่ UI/test contract drift ไม่ใช่ auth**

## ค่าที่ตรวจ .env.e2e.staging (ไม่ปริ้นค่า)

- UTF-8 valid ✅ · ตัวแปรทุกตัว ASCII บริสุทธิ์ ✅ (non-ASCII อยู่แค่ comment)
- นี่คือที่มาของ ByteString error เดิม: ถ้ามีอักขระไทยปนใน `E2E_SUPABASE_ANON_KEY` ตรงกับ index ที่ระบุใน error (`U+0E43 = ใ`, 3651) ระบบตอนนี้จะ error ชัดเจนทันที

## Gate โดยรวม

```text
MASTER GATE = NOT PASS ❌  (blocked: Phase B staging 21/49)
```

เส้นทางปิด: rebuild/redeploy staging → reconcile test contract (Living Twin/immersive layer) → เพิ่ม testid ที่เหลือ → รัน full suite ให้ได้ 0 unexpected failures