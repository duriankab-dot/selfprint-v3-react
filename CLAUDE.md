# Memory

## ⚠️ อ่านก่อนเริ่มงานทุกครั้ง

เอกสารที่เชื่อได้มี **4 ไฟล์เท่านั้น**

| ไฟล์ | ใช้ทำอะไร |
|------|----------|
| `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` | สถานะจริงปัจจุบันของโปรเจกต์ · อะไรแก้แล้ว อะไรยังเปิดอยู่ |
| `docs/PLAN_TRACKS_TH.md` | แผนงาน Track A (บั๊ก) / B (Phase 0 forensic) / C (visual redesign) + กฎที่ยังใช้กับงานใหม่ |
| `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md` | รายงาน Phase 0 (ปิดแล้ว) — เก็บไว้เป็น reference ตัวเลข baseline |
| ไฟล์นี้ | context ถาวร: สถาปัตยกรรม, คำสั่ง, เกร็ดที่ต้องรู้ก่อนแตะโค้ด, โซนห้ามแตะ |

**Current repo state = source of truth เสมอ** — ห้าม cache สมมติฐานจากเอกสาร ต้อง verify จากโค้ดจริงก่อนเชื่อ

---

## Me
**jb_DEV** (Durian Kab). Senior dev + entrepreneur. Solo SELFPRINT V3 developer.
Code-first, ecosystem thinking, production-focused. ตอบภาษาไทย กระชับ ตรงประเด็น

## Preferences
- แยกให้ชัด: facts / gaps / recommendations / completed
- ทุกงานต้องมี success criteria + วิธีตรวจ ห้ามจบด้วย "แก้แล้วครับ" เฉยๆ
- Surgical changes — แตะเฉพาะไฟล์ที่เกี่ยว ไม่ refactor นอก scope
- ถ้าไม่มั่นใจใน assumption ให้พูดออกมาก่อนลงมือ
- อัปเดตเอกสารด้วยการ**เขียนทับสถานะเดิม** ไม่ append ประวัติรายรอบต่อท้ายเรื่อยๆ

## Terms
| Term | Meaning |
|------|---------|
| **SELFPRINT** | Personal Intelligence Platform |
| **SICE** | 12-engine intelligence orchestration (client-side) |
| **CF Pages** | Cloudflare Pages — production runtime |
| **Track A / B / C** | บั๊กค้าง / Phase 0 forensic / visual redesign (ทั้ง 3 ปิดครบแล้ว — ดู `docs/PLAN_TRACKS_TH.md`) |
| **P0 / P1 / P2** | Priority (P0 = drop everything) |

---

## สถาปัตยกรรมจริง (verify จากโค้ด)

```
CF Pages (selfprint.one) ← auto-deploy จาก master
  functions/ = โฟลเดอร์เดียวที่ deploy จริง
  ├── functions/api/nova.ts          → /api/nova          (verifyUser ✅)
  ├── functions/api/twin.ts          → /api/twin          (verifyUser ✅)
  ├── functions/api/metrics.ts       → /api/metrics       (verifyUser ✅)
  ├── functions/api/autonomy-log.ts  → /api/autonomy-log  (verifyUser ✅)
  ├── functions/api/og.ts            → /api/og
  └── functions/api/[[route]].ts     → catch-all → api/unified-handler.ts
        รู้จักแค่ 7 module: notifications | twin-evolution | sice |
                           stripe | profile | blueprint | share
        นอกเหนือจากนี้ = JSON 404 (ไม่ fallback ไป index.html)

  api/ = ไม่ใช่ route source — เข้าถึงได้เพราะ functions/ import เข้ามา
  api/_utils/verify-user.ts + api/unified-handler.ts เท่านั้นที่ยัง live
  api/unified-handler.ts มี @ts-nocheck ทั้งไฟล์โดยตั้งใจ (Supabase types ไม่ตรง schema — runtime ถูกต้อง)

Supabase Edge Functions (deploy แยกผ่าน CLI ไม่อยู่ใน build ของ CF):
  13 ฟังก์ชันใน supabase/functions/ — JWT บังคับครบทุกตัวแล้ว (SEC-02)

DB: Supabase — migration กระจาย 3 โฟลเดอร์ CLI apply แค่ supabase/migrations/
    schema หลัก: selfprint.* (ไม่ใช่ public schema)
```

Vercel ถูกลบออกหมดแล้ว — `.vercel/`, `vercel.json`, `api/{twin,nova,og,metrics}.ts` เก่า, `@vercel/*` deps

## Commands

```powershell
npm install
npm run dev
npm run build                 # tsc -b && vite build
npm test                      # vitest — 67 ไฟล์ 1042 tests
npm run lint                  # oxlint
npm run typecheck:functions   # typecheck functions/ + api/
```

สถานะ gate ปัจจุบัน + สรุปงานที่เหลือจริง → ดู `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` (ไม่ซ้ำที่นี่)

---

## เกร็ดที่ต้องรู้ก่อนแก้โค้ด (verify แล้ว)

- **build/test พังด้วย bus error = ไฟล์ native ติดตั้งไม่ครบ ไม่ใช่ Linux ไม่รองรับ**
  เช็คขนาด `@rolldown/binding-*` ต้อง ~19.9 MB · `lightningcss-*` ~10 MB ·
  `@oxlint/binding-*` ~16 MB ถ้าเล็กกว่ามาก ให้ `rm -rf node_modules && npm install` ใหม่
- **`functions/` เท่านั้นที่ deploy** — `api/` เข้าถึงได้เพราะ `[[route]].ts` import เข้ามา
- **`src/lib/intelligence/*` กับ `src/services/sice/engines/*` เป็น fork คนละตัวจริงๆ**
  ทั้งคู่ live คนละ implementation เชื่อมทางเดียวผ่าน `SICEBridge.ts` — **ห้ามลบฝั่งไหนทิ้งเพราะคิดว่าซ้ำ**
- **`personal_context` (เอกพจน์) ≠ `personal_contexts` (พหูพจน์)** คนละตาราง คนละคอลัมน์ ทั้งคู่ใช้งานจริง
  ตัวเอกพจน์มี `context_type/title/description/inferred_from/confidence/ai_evidence` (migration 010)
  ตัวพหูพจน์ผูกกับ `awakening_essence` มี `context_data/initialized_at` (migration 028 + 035)
- **`selfprint.users_profiles.id` เป็น surrogate key** ไม่ใช่ auth uid — ต้อง query ด้วย `.eq('user_id', userId)` เสมอ
- **บทความบล็อก (`/blog/:slug`) ไม่มี lang prefix โดยตั้งใจ** (URL สั้น + SEO) ต่างจากหน้า public อื่นที่มีทั้ง `/en/x` และ `/th/x`
  — อย่าใส่ `langPrefix` เวลาสร้าง canonical/URL ของบทความ
- **`translations.ts` มี 161 key ใช้จริงส่วนน้อย** — i18n จริงทำด้วย `isTh ? ... : ...` inline ~40 คอมโพเนนต์
  ตอนนี้มี 2 ระบบซ้อนกัน (ยังไม่ตัดสินใจเลือกทางเดียว)
- **duplicate component**: ตัวจริงอยู่ในโฟลเดอร์ย่อยเสมอ แต่ `components/features/DecisionList.tsx`
  ยังใช้งานจริง (`DecisionLogger.tsx`) — อย่าลบเพราะดูเหมือนซ้ำกับตัวที่ root
- **`import.meta.env[name]` (dynamic bracket access) ไม่ถูก Vite inline ตอน build** — ต้องใช้ literal
  `import.meta.env.VITE_FOO` เท่านั้น ทุกจุดที่อ่าน env

## โซนห้ามแตะ (ต้องถามก่อนเสมอ)
- `.env*`, `KEY/`, secret ทุกชนิด
- `supabase/migrations/*` ที่ apply ไป production แล้ว
- SICE / AI pipeline / Zustand business state / Auth / lifecycle / routing core
- rename NOVA ในโค้ด (label ที่ user เห็นเปลี่ยนเป็น SELFPRINT ได้ แต่ internal code ห้ามแตะ)

---
Full glossary: `memory/`
