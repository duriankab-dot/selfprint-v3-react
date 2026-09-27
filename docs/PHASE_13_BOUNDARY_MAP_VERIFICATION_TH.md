# PHASE 13 — ARCHITECTURAL BOUNDARY MAP & VERIFICATION

**วันที่:** 27 กันยายน 2026 · **สถานะ:** CANONICAL (per Phase 12 closure directive, Owner 27 ก.ย.) · **HEAD:** `6ae88bd` @ `master`
**กรอบบังคับสูงสุด:** 8 Architectural Boundaries — Section 5 ของ `docs/PHASE_11_CLOSURE_PHASE_12_TRANSITION_TH.md` (Owner-approved)
**วิธีการ:** ทุก boundary ผูกกับ evidence จริง (file:line) ตรวจ 27 ก.ย. 2026 + pipeline results ล่าสุด — ไม่มีข้อสรุปที่ไม่มีหลักฐาน

---

## B1 — CoreAwakeningService = SSOT (Orchestration)

| หัวข้อ | เนื้อหา |
|--------|---------|
| นิยาม | จุดรวม orchestration ของ awakening/twinBirth — wiring ทั้งหมด delegate เข้า path เดียว ห้ามสร้าง path คู่ขนาน |
| Evidence | `CoreAwakeningService.ts:7` (import SICEOrchestrator), `:141` (`new SICEOrchestrator()`), `:14,427` (VisualDNAService F3 ต่อ E3) |
| สายพาน delegate ที่พิสูจน์แล้ว | `useTwinBirth` → CoreAwakeningService (Batch 6 W2, commit `6c77750`) · `twinBirthFlow.ts:17,121` (startAwakening/initializeTwin/celebrateTwinAwakening) |
| Instantiation sites ของ SICEOrchestrator (ตรวจ 27 ก.ย.) | `CoreAwakeningService.ts:141` = **SSOT path (live)** · `Onboarding.tsx:545` = **live เรียกตรง** (onboarding finetune → orchestrate → merge analysisProfile — จด docblock `:541` ว่า "12 engines" ซึ่งล้าสมัย จริง = 16) · `WorldRoutingService.ts:67` = **DEAD (DC-11, zero production callers)** — candidate ของ dead-code batch แยก |
| Verification | Batch 6 wiring verified (tsc 0 / vitest 1,102) — Dual Orchestration Risk ควบคุมตาม Owner attestation (Ledger §10.3) |

## B2 — SICE Dual-layer + SICEBridge (E1 — CLOSED ด้วย C1)

| หัวข้อ | เนื้อหา |
|--------|---------|
| นิยาม | Layer A = `lib/intelligence/` (Knowledge & Persistence Intelligence — 17 classes + types.ts shared schema, 30+ import sites) · Layer B = `services/sice/` (Orchestration Runtime — SICEOrchestrator 1,014 ln + SICEBase 73 ln + 16 engines) |
| Seam เดียว (SSOT Seam) | `SICEBridge.ts` (239 ln, singleton `sICEBridge:239`): engine #2 → lib `PatternDetector.updatePattern` (`:35-84`, schema conversion `:196-233`) · engine #8 → lib `BadgeEngine.unlockFromSICESignal` (`:94-132`) · snapshot → Supabase `awakening_essence` (`:139-189`, SICERESULTS-001) |
| Proof ล่าสุด (27 ก.ย.) | sice/engines **zero import** ของ lib/intelligence (grep) — engines อ่าน Supabase โดยตรง; docblock `sice/engines/FutureSelfEngine.ts:3` อ้าง "wrapper" แต่ไม่มี import จริง (ล้าสมัย — จดไว้แก้ comment ภายหลัง) |
| การตัดสิน Owner | E1 = **C1 Boundary Formalization** (zero code change) — C2/C3 ไม่ execute จน Owner สั่งใหม่ (`PHASE_12_E1_CONVERGENCE_DESIGN_TH.md` §6) |
| กติกาห้ามแตะ | `CLAUDE.md:91-92` "เป็น fork คนละตัวจริงๆ — ห้ามลบฝั่งไหนทิ้งเพราะคิดว่าซ้ำ" · BLOCKER-01 persistence-before-return (`SICEOrchestrator.ts:153-205`) · `sice_feedback` fine-tuning loop (`:443-530`) |

## B3 — TwinStateEngine ×3 (E2 = Retain — CLOSED)

| หัวข้อ | เนื้อหา |
|--------|---------|
| #1 | `lib/intelligence/TwinStateEngine.ts:195` — knowledge ladder AWAKENING→MASTERY จากความลึก PersonalContext (7 consumers เช่น LivingTwin:25, TwinEvolution:28-29, useTwinIdentity:28) |
| #2 | `lib/experience/TwinStateEngine.ts` — visual posture layer (consumer: `lib/experience/EnvironmentEngine.ts:41`) |
| #3 | `sice/engines/TwinStateEngine.ts:21` — SICE engine #5 (stage 1-5 + maturity + mood/energy) |
| กติกา | **ห้ามแตะ / rename / merge ทุกกรณี** — E2 = Retain ปิดแล้ว (Ledger §7, Owner decision) |

## B4 — TwinVisualDNA ×3 (E3 = Retain — CLOSED)

| หัวข้อ | เนื้อหา |
|--------|---------|
| F1 | `lib/twinVisualDNA.ts` — 9 live consumers |
| F2 | `lib/twin/twinVisualDNA.ts` — 5 consumers |
| F3 | `services/VisualDNAService.ts` — ผูกกับ CoreAwakeningService.ts:14, 427 |
| กติกา | **ห้ามลบ F3 หรือรวม implementations** — E3 = Retain ปิดแล้ว (Ledger §7) |

## B5 — PersonalContextBuilder (E4 — เปิด: unproven runtime impact)

| หัวข้อ | เนื้อหา |
|--------|---------|
| นิยาม | `lib/intelligence/PersonalContextBuilder.ts:38` (656 ln) = PC synthesis core; cache key `['personalContext', userId]` + 13 creation sites (canonical ตาม E4) |
| ตรวจใหม่ 27 ก.ย. | `new PersonalContextBuilder()` production ฝั่ง lib = **11 จุด** (ExperienceContext:71, DecisionLogger:64, ExecutiveSummary:74, IntelligencePanel:72, useTwinIdentity:120, TwinEvolution:88, DailyBriefEngine:52, PersonalContextInitializer:39, IntelligenceHub:82, TwinPersonalityPage:120, AnalysisPage:163) + sice engine #1 (คนละคลาส — `SICEOrchestrator.ts:61`) + 2 test + 1 docblock — **ส่วนต่างจากเลข 13 ของ E4 จดเป็นหมายเหตุ** (E4 นับรวม pattern อื่นใน Phase 9/10) — สถานะ E4 ไม่เปลี่ยน |
| Collision site | `TwinPersonalityPage.tsx:116-166` — sice PCB คืน PersonalityMetrics บน cache key เดียวกับ lib PCB |
| Wording canonical | "E1-proven cache-shape collision; E5 runtime impact unproven" |
| กติกา | ห้ามแตะ cache key + creation sites · E5 runtime reproduction script: **เขียนได้ ห้ามรัน** จน Owner อนุมัติ |

## B6 — Supabase Edge Functions (RV-05 — CLOSED)

| หัวข้อ | เนื้อหา |
|--------|---------|
| Repo inventory (27 ก.ย.) | `supabase/functions/` = **13 directories**: account-delete · auth-registration-options · auth-register-passkey · auth-authentication-options · auth-verify-passkey · auth-rate-limit · account-recovery · send-push · pattern-detect · memory-manager · daily-brief · astrovera-edge · data-export (+ deno.jsonc) |
| สถานะ canonical | RV-05 = **VERIFIED ACTIVE ตาม owner dashboard attestation** (8 deployed functions — Ledger §2) — ปิด gate แล้ว |
| กติกา | **ห้ามแตะ** code ฝั่ง repo และ dashboard config |

## B7 — CF API Endpoints `/api/metrics` + `/api/autonomy-log` (RV-02/RV-03 — REMAINS UNPROVEN)

| หัวข้อ | เนื้อหา |
|--------|---------|
| Files | `functions/api/[[route]].ts` · `functions/api/autonomy-log.ts` (comment `:18,41` อ้าง useChat.ts:160,166-175 — ไฟล์ consumer ถูกลบ Batch 7 (`cc38ff0`) แล้ว แต่ **endpoint ไม่ถูกแตะ**) |
| สถานะ canonical | **REMAINS UNPROVEN** — external callers (k6/e2e `security.spec.ts:71`) ปฏิเสธไม่ได้; NO EVIDENCE FOUND ≠ NO EXTERNAL CALLER |
| กติกา | **ห้ามแตะ** — closure ต้องใช้ CF dashboard logs (owner-side) |

## B8 — sw.js PWA Infrastructure (UO-7 — CLOSED)

| หัวข้อ | เนื้อหา |
|--------|---------|
| Handlers หลัง UO-7 (ตรวจ 27 ก.ย.) | install `:70` · activate `:93` · fetch `:114` · push `:209` · notificationclick `:248` · notificationclose `:279` · message `:286` (SKIP_WAITING เท่านั้น) — **ไม่มี sync listener แล้ว** |
| Build | injectManifest → `dist/sw.js` (precache 1,509 entries) — compile ผ่าน 0 error (commit `6ae88bd`) |
| ประวัติ | journal background-sync machinery ลบแล้ว (`6ae88bd`) — client chain หายไปกับ Batch 7 |
| กติกา | แตะได้เฉพาะเมื่อมี owner decision ชัดเจน + **build verify เสมอ** (tsc / vitest / vite build) |

---

## Verification Summary (27 ก.ย. 2026)

| ขั้น | ผล |
|------|-----|
| `tsc -b` | ✅ 0 errors |
| `vitest run` | ✅ 1,102/1,102 (72 files) |
| `vite build` + PWA injectManifest | ✅ client 647 modules · `src/sw.js` → `dist/sw.js` (precache 1,509) — 0 error |
| TEST-ONLY bundle proof | ✅ 9 module names = 0 occurrences ใน prod bundle |
| `dist/sw.js` | ✅ zero journal references |

**สถานะเอกสารนี้:** CANONICAL — input ตั้งต้นของ Phase 14 (Master Audit Specification)