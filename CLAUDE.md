# Memory

## ⚠️ อ่านก่อนเริ่มงานทุกครั้ง

เอกสารที่เชื่อได้มี **3 ไฟล์เท่านั้น**

| ไฟล์ | ใช้ทำอะไร |
|------|----------|
| `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` | สถานะจริงของโปรเจกต์ · อะไรแก้แล้ว อะไรยัง |
| `docs/PLAN_TRACKS_TH.md` | แผนงานรวม Track A (บั๊ก) / B (Phase 0 forensic) / C (visual redesign) |
| ไฟล์นี้ | context ถาวร · เกร็ดที่ต้องรู้ก่อนแตะโค้ด |

`.md` ที่ root อีก **84 ไฟล์ถูกลบทิ้งแล้ว** (3 ก.ย. 2026) เพราะอ้างสิ่งที่โค้ดไม่ได้ทำ
รวมถึงบันทึก Session 2–12 เดิมใน CLAUDE.md ไฟล์นี้ด้วย — verify แล้วหลายข้อไม่ตรงกับโค้ด

---

## Me
**jb_DEV** (Durian Kab). Senior dev + entrepreneur. Solo SELFPRINT V3 developer.
Code-first, ecosystem thinking, production-focused. ตอบภาษาไทย กระชับ ตรงประเด็น

## Preferences
- Current repo state = source of truth — **ห้าม cache สมมติฐานจากเอกสาร**
- แยกให้ชัด: facts / gaps / recommendations / completed
- ทุกงานต้องมี success criteria + วิธีตรวจ ห้ามจบด้วย "แก้แล้วครับ" เฉย ๆ
- Surgical changes — แตะเฉพาะไฟล์ที่เกี่ยว ไม่ refactor นอก scope
- ถ้าไม่มั่นใจใน assumption ให้พูดออกมาก่อนลงมือ

## Terms
| Term | Meaning |
|------|---------|
| **SELFPRINT** | Personal Intelligence Platform |
| **SICE** | 12-engine intelligence orchestration (client-side) |
| **CF Pages** | Cloudflare Pages — production runtime |
| **Track A / B / C** | บั๊กค้าง / Phase 0 forensic / visual redesign (ดู `docs/PLAN_TRACKS_TH.md`) |
| **P0 / P1 / P2** | Priority (P0 = drop everything) |

---

## สถาปัตยกรรมจริง (verify จากโค้ด 3 ก.ย. 2026 — หลังล้าง dead code แล้ว)

```
CF Pages (selfprint.one) ← auto-deploy จาก master
  functions/ = โฟลเดอร์เดียวที่ deploy จริง
  ├── functions/api/nova.ts          → /api/nova          (verifyUser ✅)
  ├── functions/api/twin.ts          → /api/twin          (verifyUser ✅)
  ├── functions/api/metrics.ts       → /api/metrics       (verifyUser ✅)
  ├── functions/api/autonomy-log.ts  → /api/autonomy-log  (verifyUser ✅)
  └── functions/api/[[route]].ts     → catch-all → api/unified-handler.ts
        รู้จักแค่ 7 module: notifications | twin-evolution | sice |
                           stripe | profile | blueprint | share
        นอกเหนือจากนี้ = JSON 404 (ไม่ fallback ไป index.html)

  api/ = ไม่ใช่ route source — เข้าถึงได้เพราะ functions/ import เข้ามา
  api/_utils/verify-user.ts + api/unified-handler.ts เท่านั้นที่ยัง live

Supabase Edge Functions (deploy แยกผ่าน CLI ไม่อยู่ใน build ของ CF):
  13 ฟังก์ชันใน supabase/functions/ — ⚠️ 4 ตัวไม่ verify JWT (SEC-02)

DB: Supabase — migration กระจาย 3 โฟลเดอร์ CLI apply แค่ supabase/migrations/
```

**Vercel ถูกลบออกหมดแล้ว** — `.vercel/`, `vercel.json`, `.vercelignore`,
`api/{twin,nova,og,metrics}.ts`, `api/_archived/`, `@vercel/*` deps

---

## สถานะ gate (วัดจริง 3 ก.ย. 2026)

| gate | ผล |
|------|-----|
| `tsc -b` | ✅ 0 errors |
| `npm run typecheck:functions` | ✅ 0 errors |
| `vite build` | ✅ สำเร็จ |
| `oxlint` | ✅ 0 errors · 200 warnings · 484 files |
| `vitest run` | ⚠️ 167 tests ผ่าน แต่รันแค่ **7 จาก 69 ไฟล์** |

## Commands
```powershell
npm install
npm run dev
npm run build                 # tsc -b && vite build
npm test                      # ⚠️ รันแค่ 7/69 ไฟล์
npm run lint                  # oxlint
npm run typecheck:functions   # typecheck functions/ + api/
```

---

## 🔴 ค้างอยู่ — ต้องทำด้วยมือ

1. **git filter-repo** — คำสั่งที่แก้แล้วอยู่ในไฟล์ forensic หัวข้อ 2.1
   (ต้นตอ: มีไฟล์ในประวัติชื่อ `feat(e2e): ...` ที่มี `:` → Windows สร้างไม่ได้)
2. **apply `supabase/migrations/035_forensic_consolidation_2026-09-03.sql`**
   → **Core Awakening ขึ้นกับข้อนี้ ไม่เคยทำงานได้เลยจนกว่าจะรัน**
3. **เปลี่ยนรหัสผ่านบัญชี staging 6 ตัว** (ของเดิมหลุดใน git history)
4. **SEC-02** — Edge Functions 4 ตัวไม่ verify JWT

## 🟠 Track A ที่เหลือ
A3 (FE bugs 6 จุด) · A6 (rอ apply 035) · A7 (strict mode + `as any` 101 จุด) ·
A8 (เปิด vitest ครบ 69 ไฟล์) · B (Phase 0 forensic)

---

## เกร็ดที่ต้องรู้ก่อนแก้โค้ด (verify แล้ว)

- **build/test พังด้วย bus error = ไฟล์ native ติดตั้งไม่ครบ ไม่ใช่ Linux ไม่รองรับ**
  เช็คขนาด `@rolldown/binding-*` ต้อง ~19.9 MB · `lightningcss-*` ~10 MB ·
  `@oxlint/binding-*` ~16 MB ถ้าเล็กกว่ามาก ให้ `rm -rf node_modules && npm install` ใหม่
  (เอกสารเก่าเข้าใจผิดเรื่องนี้มาหลายเซสชัน)
- **`functions/` เท่านั้นที่ deploy** — `api/` เข้าถึงได้เพราะ `[[route]].ts` import เข้ามา
- **`src/lib/intelligence/*` กับ `src/services/sice/engines/*` เป็น fork คนละตัวจริง ๆ**
  ทั้งคู่ live คนละ implementation เชื่อมทางเดียวผ่าน `SICEBridge.ts`
  — **ห้ามลบฝั่งไหนทิ้งเพราะคิดว่าซ้ำ**
- **`personal_context` (เอกพจน์) ≠ `personal_contexts` (พหูพจน์)** คนละตาราง คนละคอลัมน์
  ตัวเอกพจน์คือตัวที่มี `context_type/title/description/inferred_from/confidence/ai_evidence`
- **`selfprint.users_profiles.id` เป็น surrogate key** ไม่ใช่ auth uid
  ต้อง query ด้วย `.eq('user_id', userId)` เสมอ
- **`translations.ts` มี 161 key ใช้จริง 15** — i18n จริงทำด้วย `isTh ? ... : ...` inline
  ~40 คอมโพเนนต์ ตอนนี้มี 2 ระบบซ้อนกัน (Track C จะตัดสิน)
- **CRLF**: มี `.gitattributes` แล้ว commit ครั้งถัดไปจะมี renormalize diff ก้อนใหญ่
  ครั้งเดียว — **นั่นไม่ใช่การเปลี่ยนเนื้อหา**
- **duplicate component**: ตัวจริงอยู่ในโฟลเดอร์ย่อยเสมอ ตัวที่ root ถูกลบไปแล้ว
  แต่ `components/features/DecisionList.tsx` **ยังใช้อยู่จริง** (`DecisionLogger.tsx:24`)
  อย่าลบตามที่ audit รอบแรกแนะนำ

## โซนห้ามแตะ (ต้องถามก่อนเสมอ)
- `.env*`, `KEY/`, secret ทุกชนิด
- `supabase/migrations/*` ที่ apply ไป production แล้ว
- SICE / AI pipeline / Zustand business state / Auth / lifecycle / routing core
- rename NOVA ในโค้ด

---
Full glossary: `memory/`
