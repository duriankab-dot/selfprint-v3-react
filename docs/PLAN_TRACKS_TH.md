# SELFPRINT V3 — แผนงานรวม (Engineering Backlog + Visual Redesign)

**สร้าง:** 3 ก.ย. 2026 · **ฐาน:** `da855c5` (อัปเดต 6 ก.ย. 2026 — A1 ปิด · A7 ปิด · migration 035 APPLIED)
**ที่มา:** รวม 2 แหล่งเข้าด้วยกัน
1. `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` — บั๊กค้างที่ตรวจเจอจากโค้ดจริง
2. `New Ux_ui update talk.txt` — SELFPRINT Visual Engineering Contract (Phase 0 → N)

---

## หลักการรวม 2 งานเข้าด้วยกัน

Contract ในไฟล์แนบสั่งชัดว่า **Phase 0 = forensic เท่านั้น ห้าม redesign** และให้ STOP
รอ approve ก่อน Phase 1 — ผมยึดตามนั้น

แต่ contract ยังบอก **"DO NOT TOUCH: DB schema, API contracts"** ซึ่ง**ขัดกับ**คำสั่งตรงของเจ้าของ
ที่ให้แก้ DB-01..03 และ SEC-03 ให้ครบ

**การตัดสิน:** คำสั่งตรงของเจ้าของมาก่อน — แต่แยกให้ชัดว่าเป็นคนละ track และ
**งาน DB จะส่งเป็นไฟล์ SQL + code fix ให้ตรวจก่อน ไม่รันกับ production เอง**

เหตุผลที่ contract ห้ามแตะ DB คือ *"เราไม่ได้แก้ปัญหาพวกนั้น"* — แต่ audit พบว่า
**เราแก้อยู่จริง**: Core Awakening เขียน DB ไม่ลงเพราะ schema mismatch, Twin evolution
ไม่เคยถูกบันทึก, subsystem feedback ทั้งชุดเป็น no-op ถ้าไม่แก้ก่อน Visual redesign
จะไปสวมทับระบบที่ข้างในไม่ทำงาน

---

## โครงสร้าง 3 Track

```
TRACK A — ENGINEERING BACKLOG      ← ทำตอนนี้ (บั๊กค้างจาก forensic audit)
      │
TRACK B — PHASE 0 FORENSIC          ← ✅ ส่งรายงานแล้ว (4–5 ก.ย. 2026) · 🛑 STOP รอ approve
      │
      └── STOP → รอ approve
                    │
TRACK C — VISUAL REDESIGN           ← ยังไม่เริ่ม (Phase 1..N ตาม contract)
```

**A กับ B ทำขนานกันได้** เพราะ A แตะ logic/backend ส่วน B เป็นการอ่านและวัด
**C ห้ามเริ่มจนกว่า B จะผ่านการตรวจ**

---

## TRACK A — Engineering Backlog

ลำดับนี้ตั้งใจให้ตรงกับ dependency จริง ไม่ใช่เรียงตามความสำคัญ
(ลบของตายก่อน → แล้วค่อยเปิดเทสต์ครบ ไม่งั้นจะไปแก้เทสต์ของโค้ดที่กำลังจะลบ)

| # | หัวข้อ | ขนาด | ปิดข้อไหนใน forensic |
|---|--------|------|---------------------|
| **A1** | ล้าง Vercel + dead code | ✅ **ปิดแล้ว** (6 Sep 2026 — 6 orphan files deleted) | REPO-01, CODE-01 |
| **A2** | `.env.example` + รหัสผ่าน e2e | 🟢 ≤8 | SEC-01 (ส่วนที่เหลือ) |
| **A3** | FE-01a..g แก้บั๊ก frontend 7 จุด | 🟡 9–15 | FE-01 |
| **A4** | `/api/og` → jpg static | 🟢 ≤8 | API-02 |
| **A5** | DB-01..03 รวม migration + ลบที่ไม่ใช้ | 🟠 dedicated phase | DB-01, DB-02, DB-03 |
| **A6** | SEC-03 RLS policy | SQL อย่างเดียว | SEC-03 |
| **A7** | เปิด TypeScript strict + `as any` | ✅ **ปิดแล้ว** (47 จุด วัด 6 Sep 2026 — batch fixes) | QA-02 |
| **A8** | เปิด vitest ครบ 66/66 ไฟล์ | 🟠 dedicated phase | QA-01 |
| **A9** | ลบ `.md` ที่ล้าสมัย **84** → เท่าที่จำเป็น | ลบอย่างเดียว | — |

### เหตุผลของลำดับ

```
A1 ลบของตาย
   ↓  (ไม่งั้น A8 จะไปแก้เทสต์ของไฟล์ที่กำลังจะลบ)
A2 A3 A4  แก้บั๊กที่ไม่พึ่ง DB
   ↓
A5 A6  DB + RLS   (Core Awakening จะกลับมาทำงานตรงนี้)
   ↓  (schema ต้องนิ่งก่อน ไม่งั้น strict mode จะไปยึดกับ type ที่ผิด)
A7 strict mode
   ↓
A8 เปิดเทสต์ครบ   (ทำท้ายสุดเพราะทุกอย่างข้างบนเปลี่ยนโค้ดที่เทสต์ครอบอยู่)
   ↓
A9 ล้างเอกสาร
```

### เกณฑ์ DONE ของ Track A (ยึดตาม Anti-Lazy Rule ข้อ 0.17 ของ contract)

ทุกข้อต้องผ่านครบ ถ้าขาดข้อใดข้อหนึ่ง = **PARTIAL ไม่ใช่ DONE**

```
✓ tsc -b                    0 errors
✓ npm run typecheck:functions  0 errors
✓ vite build                สำเร็จ
✓ oxlint                    0 errors
✓ vitest                    ผ่านครบทุกไฟล์ (ไม่ใช่ 7/73)
✓ ไม่มี placeholder / fake data / TODO ใน production path
✓ ของเดิมที่เคยทำงาน ยังทำงาน
```

---

## TRACK B — PHASE 0 Visual + Performance Forensic

ตาม contract ข้อ 0.20 + หัวข้อ "PHASE 0 VISUAL + PERFORMANCE FORENSIC"
**ผลลัพธ์เป็นรายงาน ไม่ใช่โค้ด** และต้อง STOP ก่อน Phase 1

> ✅ **ส่งมอบรายงานแล้ว — 4–5 ก.ย. 2026 · HEAD `da855c5`:**
> [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](./PHASE0_VISUAL_PERF_FORENSIC_TH.md)
>
> 🛑 **สถานะปัจจุบันของ Track B: STOP รอ approve** — ห้ามเริ่ม Phase 1 จนกว่าเจ้าของจะอนุมัติ (contract ข้อ 0.20)

| # | Deliverable | สถานะ (PHASE0 · 4–5 ก.ย. 2026) |
|---|-------------|--------------|
| B0.1 | Visual architecture (screen ไหน CSS / Canvas / WebGL / 3D / fallback) | ✅ **PASS** |
| B0.2 | Existing component audit + reuse map (KEEP/EXTEND/REPLACE) | ✅ **PASS** |
| B0.3 | Bundle / chunk audit | ✅ **PASS** |
| B0.4 | Dependency audit | ✅ **PASS** |
| B0.5 | Large-file audit (>800 / >1,500 / >2,500 บรรทัด) | ✅ **PASS** |
| B0.6 | Asset audit (png/jpg/webp/glb/font/audio) | 🟡 **PARTIAL** |
| B0.7 | 3D / WebGL feasibility | 🟡 **PARTIAL** |
| B0.8 | Mobile performance (360/390/412/768/1024/1440) | ✅ **PASS** |
| B0.9 | SEO / AEO / GEO baseline | 🟡 **PARTIAL** |
| B0.10 | Refactor boundary | ✅ **PASS** |

> 📌 **ผลละเอียดทุกข้ออยู่ใน**
> [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](./PHASE0_VISUAL_PERF_FORENSIC_TH.md)
> §"ตารางสรุป PASS / PARTIAL / BLOCKED"
>
> **สรุป 10 deliverable ของ Track B: PASS 7 · PARTIAL 3 · BLOCKED 0**
> (รายงาน PHASE0 ฉบับเดียวกันยังมี 0.11 mock/stub = PARTIAL · ~~0.12 passkey = BLOCKED~~ ✅ CLOSED (b7bde64) ·
> ~~0.13 migration 035 = BLOCKED~~ ✅ CLOSED (Supabase 5 Sep 2026) — สรุปรวมทั้งรายงาน: PASS 7 · PARTIAL 4 · ~~BLOCKED 2~~ → 0)
>
> **เหตุผลของ 3 ข้อที่เป็น PARTIAL:**
> - **B0.6** — splash/logo ที่อ้างใน `index.html:83` แก้แล้ว (ASSET404-001) · **แต่** `public/audio/` ยังหาย +
>   `soundscape-manifest.json` ยังมี 23 CLOUDINARY_URL + `logo.png`/`og-image.png` ยังหาย
> - **B0.7** — ตอบได้ว่ามีอะไรอยู่จริง (ไม่มี WebGL/THREE เลย) และลำดับที่ควรเริ่ม ·
>   **แต่** ตอบไม่ได้ว่า HIGH ควรเป็น WebGL หรือ canvas — ต้องรอผล Lighthouse บนมือถือระดับกลาง
>   ของ LandingPage/WorldDetail ซึ่งยังไม่เคยวัด (เป็นงานของ Phase 1)
> - **B0.9** — ตรวจครบทุกไฟล์ที่ระบุ + ตอบ AEO ครบ 6 ข้อ · **แต่** ตอบไม่ได้ 2 เรื่อง —
>   X1: ค่า env `VITE_BUSINESS_*` จริงบน CF Pages (อยู่ในโซนห้ามแตะ) · X2: Google Search Console coverage report จริง
>
> 🛑 **Track B ต้อง STOP และรอ approve ก่อนเริ่ม Phase 1** ตาม Visual Engineering Contract ข้อ 0.20

### B0.3 — Bundle baseline (วัดจริงแล้ว 3 ก.ย. 2026)

**นี่คือครั้งแรกที่วัดได้จริง** — เซสชันก่อน ๆ บันทึกว่า "build ไม่ได้ Rolldown native
binding พังบน Linux" ซึ่ง**วินิจฉัยผิด** สาเหตุจริงคือ `npm install` ถูกขัดจังหวะ
ทำให้ไฟล์ `.node` ถูกตัดกลางคัน (rolldown 248 KB จากของจริง 19.9 MB,
lightningcss 2.8 MB จาก 10.0 MB, oxlint 1.1 MB จาก 16.0 MB)
ติดตั้งใหม่ให้ครบแล้ว build/test/lint รันได้ทั้งหมด

```
chunk                              raw        gzip
------------------------------------------------------
chunk-intelligence                345.77 kB   87.31 kB   ← ใหญ่สุด
vendor-react                      181.75 kB   57.16 kB
index (entry)                     145.40 kB   43.66 kB
vendor-misc                       116.00 kB   35.16 kB
worlds                             95.41 kB   26.22 kB
CoreAwakening                      94.22 kB   29.44 kB
IntelligenceHub                    87.60 kB   20.78 kB
Onboarding                         65.69 kB   17.36 kB
LandingPage                        45.06 kB   11.80 kB
```

**ข้อสังเกตเบื้องต้น (ยังไม่ใช่ข้อสรุป ต้องขุดต่อใน B0.3 เต็ม):**
- `chunk-intelligence` 345 kB ใหญ่กว่า `vendor-react` — ต้องดูว่าโหลดตอนไหน
- `vendor-three` **ไม่ถูกสร้างเลย** ยืนยันว่า `three` ไม่มีใคร import จริง
- build เตือน `INEFFECTIVE_DYNAMIC_IMPORT`: `DecisionLearningService.ts` ถูก
  dynamic import จาก `DecisionService.ts` แต่ static import จากอีก 3 ที่ →
  code splitting ไม่เกิดผล

### กฎที่ล็อกไว้จาก contract (ห้ามละเมิดใน Track C)

ตรงกับ **§14 WORLD VISUAL SYSTEM** (ห้ามแก้ความดื่มดื่มด้วย heavy 3D โดย default — ใช้ CSS atmosphere / gradient / WebP/AVIF / lightweight SVG / subtle motion / lazy-loaded assets) และ **§25 PERFORMANCE ARCHITECTURE** (โหลดเฉพาะที่ route ต้องการ · Worlds lazy-load · Twin visuals lightweight · 3D = progressive enhancement เท่านั้น · animation ใช้ CSS ที่ทำได้ · heavy module = dynamic import)

```
Landing / Onboarding / Analysis  →  ห้ามมี 3D หนัก
Core Awakening                   →  lazy load 3D
Twin Birth                       →  load 3D
Twin Chat                        →  reuse 3D เดิม
Today                            →  lightweight representation
```

- ห้าม import Three.js ที่ `App.tsx`
- ห้ามใช้ `lazy()` ทุก component เป็นทางลัด — *"Performance improvement must not become perceived latency"*
- ห้ามอ้างว่า optimize สำเร็จโดยไม่มีตัวเลข before/after
- ระดับ L0–L3 ที่วัดใน `PHASE0_VISUAL_PERF_FORENSIC_TH.md` (0.1) คือ baseline ของ §14/§25 — งาน visual ทุกข้อต้องเทียบกับระดับ "ตอนนี้" ที่วัดไว้

---

## TRACK C — Visual Redesign (ยังไม่เริ่ม)

> 📌 **Track C ถูกกำกับโดย master design document:**
> [`docs/Experience Architecture v2.md`](./Experience%20Architecture%20v2.md) (2,046 บรรทัด · 51 หัวข้อ · **Status: Proposed Architecture**)
> เป็น design/experience master ของ Track C — หลัก: **RECOMPOSE ไม่ใช่ REBUILD** ·
> core promise: *"Understand yourself. Meet your Twin. Keep evolving."* ·
> App Shell = **TODAY · WORLDS · TWIN · EXPLORE · ME** ·
> priority matrix **P0.1–P0.10 / P1.1–P1.8 / P2.1–P2.7** ·
> §44 ARCHITECTURAL SAFETY RULE · §45 SUCCESS CRITERIA · §46 CORE LOOP
> ทุก phase ใน Track C ต้องอ้างหัวข้อของเอกสารนี้ (ดู mapping ใน `PHASE0_VISUAL_PERF_FORENSIC_TH.md`)

```
PHASE 1   Performance Foundation
PHASE 2   Landing        → verify
PHASE 3   Onboarding     → verify
PHASE 4   Analysis       → verify
PHASE 5   Core Awakening → verify
PHASE 6   Twin Birth     → verify
PHASE 7   Twin Chat      → verify
PHASE 8   Today          → verify
PHASE 9   Worlds         → verify   (NEW · P0.5 World = context)
PHASE 10  Twin Modes     → verify   (NEW · P0.4 / P1.8)
PHASE 11  Memory Experience → verify (NEW · P1.1 / P1.2)
PHASE 12  SEO/GEO/AEO knowledge layer → verify (NEW · P0.9)
```

**P0/P1/P2 mapping (จาก §41–43 ของ Experience Architecture v2):**
- **P0 (Experience Recomposition):** P0.1 Twin protagonist · P0.2 Today living entry · P0.3 Twin Birth signature · P0.4 Chat = one mode · P0.5 World = context · P0.6 ลด card density · P0.7 onboarding narrative · P0.8 mobile-app patterns · P0.9 SEO/GEO/AEO · P0.10 performance-safe visual
- **P1 (Relationship Intelligence):** P1.1 Visible Memory · P1.2 What Twin Knows · P1.3 Twin State · P1.4 Choice→Memory · P1.5 Choice→Pattern · P1.6 Evolution presentation · P1.7 Proactive insight · P1.8 Reflection/Decision/Pattern modes
- **P2 (Living Intelligence Expansion):** P2.1–P2.7 (หลัง Phase A production closure)
- **P1/P2 items ที่ Track C ยังมี:** JOURNEY (§15) · SMART ENTRY (§35) · Returning user (§36)

**Change budget ต่อ phase** (guardrail ไม่ใช่ quota):
`≤8 files` ปกติ · `9–15` ต้องมี change map + test · `16–30` ต้องเป็น dedicated phase ·
`>30 หรือแตะ SICE/API/DB/Lifecycle/Auth/AI pipeline/core state` = **STOP ขออนุมัติ**

**แยก commit เสมอ:** `VISUAL FOUNDATION` → `<SCREEN> UX` → `<SCREEN> PRESENTATION REFACTOR` → `<SCREEN> VERIFICATION`

**Refactor only when earned** — ไฟล์ 900 บรรทัดไม่ได้แปลว่าต้องแยก
ถามก่อนว่ามันขวาง UX implementation จริงไหม ถ้าไม่ อย่าแตะ

---

## สิ่งที่ห้ามแตะตลอดทั้ง 3 track

จาก contract ข้อ 0.1 + ข้อ "ไม่แนะนำให้ refactor ตอนนี้" — และตรงกับ
**§44 ARCHITECTURAL SAFETY RULE** ของ `docs/Experience Architecture v2.md`
(ห้าม: rewrite/replace SICE · สร้าง parallel intelligence · replace canonical APIs ·
rewrite business logic · เปลี่ยน DB lifecycle โดยไม่มีเหตุบั๊ก · bypass memory เดิม ·
สร้าง duplicate Twin · เอา Community เข้า First Journey · ทำให้ Phase A production closure ไม่นิ่ง)

```
SICE / SICE Orchestrator      AI intelligence pipeline
Zustand business state        Auth
Lifecycle logic               Twin intelligence
Analysis calculation          routing core
rename NOVA ใน code
```

หลักของ §44: **RECOMPOSE → CONNECT → ENHANCE** ไม่ใช่ **REBUILD → REWRITE → REPLACE**

**ข้อยกเว้นที่เจ้าของอนุมัติแล้ว:** DB schema + RLS (Track A5/A6) — แต่ส่งเป็นไฟล์ให้ตรวจก่อนรัน

---

## สถานะ gate ปัจจุบัน (วัดจริง 4–5 ก.ย. 2026 · HEAD `da855c5`)

| gate | ผล |
|------|-----|
| `tsc -b` | ✅ 0 errors (strict) — HEAD da855c5 verified 6 Sep 2026 |
| `npm run typecheck:functions` | ✅ 0 errors |
| `vite build` | ⚠️ Windows native binary (rolldown) — Windows build HEAD 3fa100a ✅ · dist/ stale |
| `oxlint` | ⚠️ Windows native binary (oxlint) |
| `vitest run` | ⚠️ Windows native binary (vitest/rolldown) |

> ⚠️ ตัวเลขนี้เป็น **ฉบับที่ถูกแก้แล้ว** — ฉบับก่อน (3 ก.ย. 2026) บอก "oxlint 209 warnings · 550 files"
> และ "vitest 7 จาก 73 ไฟล์" ซึ่ง**ล้าสมัย** ตอนนี้ oxlint = 187/474 และ vitest = 66/66 ไฟล์ · 1037 tests

---

## 4 เงื่อนไขก่อนอ้าง "100% product-verified"

แม้ gate ทุกตัวจะผ่าน — **ยังห้ามอ้าง "100% product-verified"** จนกว่าจะทำครบ 4 ข้อ
(อ้างอิง `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` §8.6):

~~**Apply migration 035**~~ ✅ **APPLIED** (verify Supabase SQL Editor 5 Sep 2026)
~~1. **Deploy Edge Functions**~~ ✅ ปิดแล้ว — 12 functions deployed 6 Sep 2026, ทุกตัวตอบ 401
~~2. **แก้/ตัดสินใจ passkey flow**~~ ✅ ปิดแล้ว — AuthContext.tsx + JWT HMAC-SHA256 + PasskeyProvider NotImplemented (b7bde64)
~~3. **ตัดสินใจ voice route**~~ ✅ ปิดแล้ว — VoiceChat ใช้ Web Speech API + /api/nova (b7bde64)

> 📌 **Track C Phase 1 เริ่มได้แล้ว — 3 เงื่อนไขปิดครบ 6 Sep 2026 HEAD b7bde64**
