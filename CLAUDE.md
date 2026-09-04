# Memory

## ⚠️ อ่านก่อนเริ่มงานทุกครั้ง

เอกสารที่เชื่อได้มี **4 ไฟล์เท่านั้น**

| ไฟล์ | ใช้ทำอะไร |
|------|----------|
| `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` | สถานะจริงของโปรเจกต์ · อะไรแก้แล้ว อะไรยัง |
| `docs/PLAN_TRACKS_TH.md` | แผนงานรวม Track A (บั๊ก) / B (Phase 0 forensic) / C (visual redesign) |
| `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md` | **ผล Phase 0** — ต้องอ่านก่อนเริ่ม Track C ทุกกรณี |
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
| `tsc -b` | ✅ 0 errors (**strict: true** เปิดแล้ว) |
| `npm run typecheck:functions` | ✅ 0 errors (strict เช่นกัน) |
| `vite build` | ✅ สำเร็จ |
| `oxlint` | ✅ 0 errors · 195 warnings · 480 files |
| `vitest run` | ✅ **66/66 ไฟล์ · 1026 tests ผ่าน · 0 พัง** (skip 11 = REALBUG รอตัดสินใจ) |

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

## ✅ Track A + B เสร็จหมดแล้ว (4 ก.ย. 2026)
A1 ลบ Vercel+dead code · A2 env+รหัสผ่าน e2e · A3 FE bugs · A4 OG image ·
A5 DB migration 035 · A6 RLS · A7 strict mode · A8 เทสต์ครบ 66 ไฟล์ ·
A9 ลบ .md 84 ไฟล์ · B Phase 0 forensic

## 🔴 ค้างอยู่ — ต้องทำด้วยมือ / ต้องตัดสินใจ

1. **apply `supabase/migrations/035_forensic_consolidation_2026-09-03.sql`**
   → **Core Awakening ขึ้นกับข้อนี้ ไม่เคยทำงานได้เลยจนกว่าจะรัน**
   ทดสอบกับ PostgreSQL 18.4 จริงแล้ว 3 เคส (production-like / รันซ้ำ / DB ว่าง)
2. **REALBUG-001..004** — บั๊กจริงที่เทสต์จับได้ skip ไว้ 11 เทสต์ รอตัดสินใจ
   (grep `REALBUG` ในไฟล์ `.test.tsx` จะเจอคำอธิบายเต็มในโค้ด)
   - **004 กระทบผู้ใช้มากสุด**: `ConfidenceIndicator.tsx:112` เช็ค field
     `confidencePoints` ที่ไม่มีในโปรเจกต์ (ของจริง `evidencePoints`)
     → การ์ดขึ้น **NaN% / Very Low / พื้นแดง** ทุกครั้งที่รับ BehavioralPattern
3. **F-01 Tailwind ไม่เคยถูกคอมไพล์** — `@tailwind` อยู่ใน `src/index.css` ที่ไม่มีใคร
   import · ไม่มี `postcss.config.js` · ไม่มี plugin ใน vite → utility class ใน
   **37 ไฟล์ไม่มีผลอะไรเลย** ต้องตัดสินใจก่อนเริ่ม Track C ว่าจะเอา Tailwind ทางไหน
4. **git filter-repo** — ยังไม่ได้ลง (`pip install git-filter-repo`) คำสั่งอยู่ในไฟล์
   forensic หัวข้อ 2.1 · ไม่เร่งด่วนแล้วเพราะ key revoke ไปแล้ว เหลือแค่ลดขนาด repo
5. **เปลี่ยนรหัสผ่านบัญชี staging 6 ตัว** (ของเดิมหลุดใน git history)
6. **SEC-02** — Edge Functions 4 ตัวไม่ verify JWT (`send-push`, `daily-brief`,
   `pattern-detect` แก้ได้ทันที · passkey flow ต้องคุยก่อน)

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
