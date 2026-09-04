# SELFPRINT V3 — แผนงานรวม (Engineering Backlog + Visual Redesign)

**สร้าง:** 3 ก.ย. 2026 · **ฐาน:** `62987f6` (ยังไม่ push)
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
TRACK B — PHASE 0 FORENSIC          ← ทำตอนนี้ (รายงานอย่างเดียว ไม่แตะโค้ด visual)
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
| **A1** | ล้าง Vercel + dead code | 🟠 16–30 files (ลบเป็นหลัก) | REPO-01, CODE-01 |
| **A2** | `.env.example` + รหัสผ่าน e2e | 🟢 ≤8 | SEC-01 (ส่วนที่เหลือ) |
| **A3** | FE-01a..g แก้บั๊ก frontend 7 จุด | 🟡 9–15 | FE-01 |
| **A4** | `/api/og` → jpg static | 🟢 ≤8 | API-02 |
| **A5** | DB-01..03 รวม migration + ลบที่ไม่ใช้ | 🟠 dedicated phase | DB-01, DB-02, DB-03 |
| **A6** | SEC-03 RLS policy | SQL อย่างเดียว | SEC-03 |
| **A7** | เปิด TypeScript strict + `as any` 101 จุด | 🟠 dedicated phase | QA-02 |
| **A8** | เปิด vitest ครบ 73 ไฟล์ | 🟠 dedicated phase | QA-01 |
| **A9** | ลบ `.md` ที่ล้าสมัย 87 → เท่าที่จำเป็น | ลบอย่างเดียว | — |

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

| # | Deliverable | สถานะเริ่มต้น |
|---|-------------|--------------|
| B0.1 | Visual architecture (screen ไหน CSS / Canvas / WebGL / 3D / fallback) | ยังไม่ทำ |
| B0.2 | Existing component audit + reuse map (KEEP/EXTEND/REPLACE) | มีข้อมูลบางส่วนแล้วจาก audit |
| B0.3 | Bundle / chunk audit | ✅ วัดได้แล้ว — ดูด้านล่าง |
| B0.4 | Dependency audit | ✅ เจอแล้วบางส่วน (`three` ไม่มีใคร import) |
| B0.5 | Large-file audit (>800 / >1,500 / >2,500 บรรทัด) | ยังไม่ทำ |
| B0.6 | Asset audit (png/jpg/webp/glb/font/audio) | ยังไม่ทำ |
| B0.7 | 3D / WebGL feasibility | ยังไม่ทำ |
| B0.8 | Mobile performance (360/390/412/768/1024/1440) | ยังไม่ทำ |
| B0.9 | SEO / AEO / GEO baseline | มีข้อมูลบางส่วน (API-02) |
| B0.10 | Refactor boundary | ยังไม่ทำ |

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

---

## TRACK C — Visual Redesign (ยังไม่เริ่ม)

```
PHASE 1  Performance Foundation
PHASE 2  Landing        → verify
PHASE 3  Onboarding     → verify
PHASE 4  Analysis       → verify
PHASE 5  Core Awakening → verify
PHASE 6  Twin Birth     → verify
PHASE 7  Twin Chat      → verify
PHASE 8  Today          → verify
```

**Change budget ต่อ phase** (guardrail ไม่ใช่ quota):
`≤8 files` ปกติ · `9–15` ต้องมี change map + test · `16–30` ต้องเป็น dedicated phase ·
`>30 หรือแตะ SICE/API/DB/Lifecycle/Auth/AI pipeline/core state` = **STOP ขออนุมัติ**

**แยก commit เสมอ:** `VISUAL FOUNDATION` → `<SCREEN> UX` → `<SCREEN> PRESENTATION REFACTOR` → `<SCREEN> VERIFICATION`

**Refactor only when earned** — ไฟล์ 900 บรรทัดไม่ได้แปลว่าต้องแยก
ถามก่อนว่ามันขวาง UX implementation จริงไหม ถ้าไม่ อย่าแตะ

---

## สิ่งที่ห้ามแตะตลอดทั้ง 3 track

จาก contract ข้อ 0.1 + ข้อ "ไม่แนะนำให้ refactor ตอนนี้":

```
SICE / SICE Orchestrator      AI intelligence pipeline
Zustand business state        Auth
Lifecycle logic               Twin intelligence
Analysis calculation          routing core
rename NOVA ใน code
```

**ข้อยกเว้นที่เจ้าของอนุมัติแล้ว:** DB schema + RLS (Track A5/A6) — แต่ส่งเป็นไฟล์ให้ตรวจก่อนรัน

---

## สถานะ gate ปัจจุบัน (วัดจริง 3 ก.ย. 2026)

| gate | ผล |
|------|-----|
| `tsc -b` | ✅ 0 errors |
| `npm run typecheck:functions` | ✅ 0 errors |
| `vite build` | ✅ สำเร็จ |
| `oxlint` | ✅ 0 errors · 209 warnings · 550 files |
| `vitest run` | ⚠️ 167 tests ผ่าน แต่รันแค่ **7 จาก 73 ไฟล์** (A8 จะแก้) |

⚠️ เทสต์ปัจจุบัน**ยิงเน็ตจริงไป Supabase** (`EAI_AGAIN orxteufqeohptpbwkqx.supabase.co`)
แล้ว fail เงียบ ๆ — ต้องแก้ใน A8 ด้วย ไม่งั้นเทสต์ขึ้นกับเน็ตและ DB จริง
