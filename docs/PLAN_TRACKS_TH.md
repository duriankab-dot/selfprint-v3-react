# SELFPRINT V3 — แผนงานรวม (Engineering Backlog + Visual Redesign)

**อัปเดต:** 8 ก.ย. 2026 — **Track A + B + C ปิดครบทั้ง 3 track แล้ว**
สถานะ gate/บั๊กปัจจุบัน → ดู `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` (ไม่ซ้ำที่นี่)
ไฟล์นี้เก็บไว้เป็น**แผน + กฎที่ยังใช้กับงานต่อไป** (change budget, do-not-touch, mapping ไป Experience Architecture v2)

---

## โครงสร้าง 3 Track — ทั้งหมดปิดแล้ว

```
TRACK A — ENGINEERING BACKLOG      ✅ ปิดครบ
TRACK B — PHASE 0 FORENSIC          ✅ ปิดครบ (รายงานใน PHASE0_VISUAL_PERF_FORENSIC_TH.md)
TRACK C — VISUAL REDESIGN           ✅ ปิดครบทั้ง 12 phase
```

---

## TRACK A — Engineering Backlog ✅

| # | หัวข้อ | สถานะ |
|---|--------|-------|
| A1 | ล้าง Vercel + dead code | ✅ ปิดแล้ว |
| A2 | `.env.example` + รหัสผ่าน e2e | ✅ ปิดแล้ว |
| A3 | แก้บั๊ก frontend (FE-01a..g) | ✅ ปิดแล้ว |
| A4 | `/api/og` CF Pages Function | ✅ ปิดแล้ว |
| A5 | DB migration รวม + RLS | ✅ ปิดแล้ว (migration 035 applied) |
| A6 | RLS policy | ✅ ปิดแล้ว |
| A7 | TypeScript strict mode + ลด `as any` | ✅ ปิดแล้ว |
| A8 | เปิด vitest ครบทุกไฟล์ | ✅ ปิดแล้ว (67/67 · 1042 tests) |
| A9 | ลบ `.md` ล้าสมัย | ✅ ปิดแล้ว |

### เกณฑ์ DONE ที่ยังใช้กับงานใหม่ทุกครั้ง

```
✓ tsc -b                       0 errors
✓ npm run typecheck:functions  0 errors
✓ vite build                   สำเร็จ
✓ oxlint                       0 errors
✓ vitest                       ผ่านครบทุกไฟล์
✓ ไม่มี placeholder / fake data / TODO ใน production path
✓ ของเดิมที่เคยทำงาน ยังทำงาน
```

ขาดข้อใดข้อหนึ่ง = **PARTIAL ไม่ใช่ DONE**

---

## TRACK B — Phase 0 Visual + Performance Forensic ✅

รายงานฉบับเต็ม: [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](./PHASE0_VISUAL_PERF_FORENSIC_TH.md)
(ปิดแล้ว — เก็บไว้เป็น reference ตัวเลข baseline เช่น bundle size, ไม่ใช่สถานะ live)

**สรุป:** 10 deliverable — PASS 7 · PARTIAL 3 (asset/3D-feasibility/SEO baseline — วัดต่อระหว่าง Track C แล้ว)

---

## TRACK C — Visual Redesign ✅ ปิดครบทั้ง 12 phase

> เอกสารแม่ (design contract): [`docs/Experience Architecture v2.md`](./Experience%20Architecture%20v2.md)
> (51 หัวข้อ, หลัก: **RECOMPOSE ไม่ใช่ REBUILD** · App Shell = TODAY·WORLDS·TWIN·EXPLORE·ME)
> รายละเอียดการปิดแต่ละ phase: [`docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`](./Experience%20Architecture%20v2/TRACK_C_VISUAL_REDESIGN_TH.md)

```
PHASE 1   Performance Foundation      ✅
PHASE 2   Landing                     ✅
PHASE 3   Onboarding                  ✅
PHASE 4   Analysis                    ✅
PHASE 5   Core Awakening              ✅
PHASE 6   Twin Birth                  ✅
PHASE 7   Twin Chat                   ✅
PHASE 8   Today                       ✅
PHASE 9   Worlds                      ✅
PHASE 10  Twin Modes                  ✅ (UI shell + TALK — REFLECT/DECIDE/PATTERN เป็น P1.8 แยกต่างหาก)
PHASE 11  Memory Experience           ✅
PHASE 12  SEO/GEO/AEO knowledge layer ✅
```

**ยังไม่ทำ (นอก scope P0, บันทึกไว้เป็น P1/P2 item):**
- Story Narrative Layer Phase 9 (World=scene 4 ส่วน) / Phase 10 (Choice→Consequence) — ต้องขอ change-budget แยก
- JOURNEY (§15) / SMART ENTRY (§35) / Returning user (§36) — ต้องมี data สะสมก่อนถึงจะมีความหมาย
- P1.3–P1.8 (Twin State, Choice→Memory/Pattern, Evolution presentation, Proactive insight, Reflection/Decision modes) — ต้องมี intelligence data หนุนก่อน

---

## กฎที่ยังใช้กับงานต่อไปทั้งหมด (ไม่ใช่แค่ Track C)

### Change budget guardrail

| ขนาด | กติกา |
|------|------|
| ≤8 ไฟล์ | ทำได้เลย |
| 9–15 ไฟล์ | ต้องมี change map ก่อนแตะ |
| 16–30 ไฟล์ | ต้องเป็น dedicated phase ของตัวเอง |
| >30 หรือแตะ SICE/API/DB/lifecycle/auth/AI pipeline/core state | 🛑 **STOP ต้องขออนุมัติก่อนเสมอ** |

### โซนห้ามแตะ (§44 ARCHITECTURAL SAFETY RULE)

```
SICE / SICE Orchestrator      AI intelligence pipeline
Zustand business state        Auth
Lifecycle logic               Twin intelligence
Analysis calculation          routing core
migration ที่ apply ไป production แล้ว
rename NOVA ใน code
```

หลัก: **RECOMPOSE → CONNECT → ENHANCE** ไม่ใช่ **REBUILD → REWRITE → REPLACE**

### 3D usage rule (§14 + §25)

```
Landing / Onboarding / Analysis  →  ห้ามมี 3D หนัก (CSS atmosphere / SVG พอ)
Core Awakening                   →  lazy-load 3D (สั้น, มี reduced-motion guard)
Twin Birth                       →  load 3D (canvas 2D — ไม่ใช่ WebGL ใหม่)
Twin Chat                        →  reuse 3D เดิม ไม่โหลดซ้ำ
Today                            →  lightweight เท่านั้น
```

- ห้าม import Three.js ที่ `App.tsx` ระดับ top-level
- ห้ามอ้างว่า optimize สำเร็จโดยไม่มีตัวเลข before/after
