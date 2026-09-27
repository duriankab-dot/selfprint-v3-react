# PHASE 12 — TASK 2: E1 CONVERGENCE DESIGN PROPOSAL (SICE Dual-layer)

**วันที่:** 27 กันยายน 2026 · **สถานะ:** OWNER DECISION: **C1 APPROVED** (27 ก.ย. 2026) — Boundary Formalization, zero code change · **HEAD:** `daa96ae` @ `master`
**ข้อห้ามเด็ดขาด (Owner directive):** ห้าม Merge หรือ Delete Code ใด ๆ ในฝั่ง SICE — เอกสารนี้คือพิมพ์เขียวเท่านั้น
**Boundary แม่:** Section 5 ของ `docs/PHASE_11_CLOSURE_PHASE_12_TRANSITION_TH.md` (8 boundaries) — โดยเฉพาะ "SICE dual-layer + SICEBridge: ห้ามลบฝั่งใดฝั่งหนึ่งจนกว่า E1 convergence design ผ่านการอนุมัติ" (`CLAUDE.md:91-92`)

---

## 1. สถานะสถาปัตยกรรมปัจจุบัน (evidence-based, ตรวจ 27 ก.ย. 2026)

### 1.1 Layer A — `src/lib/intelligence/` (Knowledge & Persistence Intelligence)
- **17 classes + types.ts + index.ts (barrel) + INTEGRATION_GUIDE.md**
- ลักษณะ: domain intelligence ที่ยึด Supabase เป็นแหล่งข้อมูลจริง (import `@/lib/supabase/client`), deterministic, ห้าม fabricate
- **Consumers จริง 30+ import sites:** ExecutiveSummary:26-31, IntelligencePanels:9-12, IntelligencePanel:19-30, GrowthSpace:23-24, FutureSelfPanel:7-8, AnalysisPage:24-39, TwinEvolution:28-30, TwinProfile:27-29, MemoryRecorder/List, FeedbackWidget/Summary, BadgeGallery:18-20, DailyBrief:19-21, DecisionLogger:21-22, DecisionAnalytics/Form, PatternDisplay, ContextDisplay, AccuracyBadge, ConfidenceIndicator, AICreationSequence:18, useTwinIdentity:27-28, useWorldRecommendation:32, analysisStore:8, StoryNarrativeService:34 + ไฟล์ test ประกอบ

### 1.2 Layer B — `src/services/sice/` (Orchestration Runtime)
- **โครง:** `SICEOrchestrator.ts` (1,014 ln) + `SICEBase.ts` (73 ln) + `SICEBridge.ts` (239 ln) + **16 engines**
- **สัญญา SICEBase** (`SICEBase.ts:8-73`): `id/name/description` + abstract `process(SICEInput) → SICEOutput` (confidence clamp 0-100, executionTime, error)
- **Orchestrator** (`SICEOrchestrator.ts:59-77`): ลงทะเบียน 16 engines (IDs 1-16) → รันขนาน → `performCrossEngineSynthesis` (themes/agreements/conflicts ภาษาไทย, ANALYSISLANG-001) → `performFineTuning` (อ่าน `sice_feedback`, ปรับ confidence ±7.5% ต่อ engine) → `buildPersonalIntelligence` → **BLOCKER-01** (`:153-205`): await critical persistence (pattern bridging + essence snapshot) **ก่อน** return — ถ้าพลาด บังคับ status DEGRADED; badge bridging เป็น fire-and-forget (`:194`)
- **Engines อ่าน Supabase โดยตรง** — พิสูจน์แล้วว่า **ไม่มี sice engine ใด import `lib/intelligence` เลย** (grep 27 ก.ย.: พบเพียง docblock ที่อ้างผิดใน `sice/engines/FutureSelfEngine.ts:3` "Wrapper for existing FutureSelfEngine from lib/intelligence" — **ไม่มี import จริง, docblock ล้าสมัย**)

### 1.3 SICEBridge — ทางเชื่อมเดียวข้ามเลเยอร์ (`SICEBridge.ts`)
| บทบาท | จาก (Layer B) | ไป (Layer A) | รายละเอียด |
|--------|---------------|--------------|------------|
| `bridgePatternResults` | engine #2 PatternDetector (DetectedPattern[]) | `lib/PatternDetector.updatePattern()` | `convertSICEPatternToBehavioralPattern` (`:196-223`): DetectedPattern → BehavioralPattern (confidence ÷100, `frequencyFromCount` `:228-233`) |
| `bridgeBadgeResults` | engine #8 BadgeEngine (unlockedBadges) | `lib/BadgeEngine.unlockFromSICESignal()` | fire-and-forget, idempotent |
| `persistOrchestrationResults` | OrchestratorResult ทั้งก้อน | Supabase `awakening_essence` | SICERESULTS-001 FIX (`:150-159`): ตารางจริง + column `sice_results` JSONB |
- Singleton `sICEBridge` (`:239`) — ผู้เรียกเดียวคือ SICEOrchestrator (`SICEOrchestrator.ts:46, 161-162, 194`)

### 1.4 Instantiation sites ของ SICEOrchestrator (3 จุด — ตรวจ 27 ก.ย.)
| จุด | สถานะ |
|-----|-------|
| `CoreAwakeningService.ts:141` | **LIVE — SSOT** (Onboarding, TwinBirthPage ผ่าน useTwinBirth delegate — Batch 6) |
| `Onboarding.tsx:545` | LIVE (onboarding flow เรียกตรง) |
| `WorldRoutingService.ts:67` | **DEAD — DC-11** (Phase 9: zero production callers, รอด Batch 5) — จดเป็น candidate สำหรับ dead-code batch ภายหลัง (**ไม่ใช่ scope E1**) |

---

## 2. Mapping Table — คู่ที่ชื่อซ้ำ/ใกล้กัน (ตรวจชื่อ export จริง 27 ก.ย.)

> **หมายเหตุการกระทบยอด:** Ledger E1 ระบุ "9 ชื่อซ้ำ" — การตรวจ export จริงวันนี้พบ **8 คู่ชื่อเดียวกันเป๊ะ + 2 คู่ชื่อใกล้กัน = 10 คู่** ทั้งหมด; ส่วนต่างน่าจะมาจากการนับ `PersonalContextBuilder` แยกออกเป็น packet E4 ของตัวเอง ทั้ง 10 คู่จึงจดไว้ให้ครบ — ไม่เดาทับหลักฐานเดิม

| # | Layer A (lib/intelligence) | Layer B (services/sice/engines) | บทบาท A vs B | ความสัมพันธ์จริง |
|---|---------------------------|--------------------------------|--------------|------------------|
| 1 | `PersonalContextBuilder.ts` (656 ln, class `:38`) | `PersonalContextBuilder.ts` (270 ln, SICE **#1** `:12`) | A = synthesize mental model หลักของระบบ (PC core); B = snapshot บริบทราย session แบบ world-adaptive (`getWorldPersonality`) | คนละ implementation — จุดชนกันที่ `TwinPersonalityPage.tsx:12` (E4 cache-shape collision) |
| 2 | `PatternDetector.ts` (773 ln, class `:56`) | `PatternDetector.ts` (138 ln, SICE **#2** `:10`) | A = ตรวจจับ 3 ประเภท pattern (REPEATING/EMERGING/CHANGING) จาก evidence จริง + persist; B = scan decision history → `DetectedPattern[]` | **BRIDGED** ผ่าน SICEBridge (แปลง schema + persist เข้า A) |
| 3 | `InsightEngine.ts` (448 ln, class `:72`) | `InsightEngine.ts` (181 ln, SICE **#3** `:10`) | A = สังเคราะห์ Executive Summary ภาษาไทยแบบ deterministic (Master Direction §9); B = สร้าง insights จาก patterns (thresholds 70/60) | คนละ implementation |
| 4 | `AIFeedbackLoop.ts` (549 ln, class `:78`) | `AIFeedbackLoop.ts` (244 ln, SICE **#4** `:27`) | A = เก็บ feedback ผู้ใช้ → calibrate confidence (+0.1/−0.15) + accuracy trend; B = อ่าน `sice_feedback` → ปรับ confidence ต่อ engine (±7.5%) | คนละ implementation, ต่างระดับ (user-level vs engine-level) |
| 5 | `TwinStateEngine.ts` (277 ln, class `:195`) | `TwinStateEngine.ts` (190 ln, SICE **#5** `:21`) | A = knowledge ladder AWAKENING→MASTERY จากความลึก PersonalContext (E2 **#1**); B = stage 1-5 + maturity + mood/energy (E2 **#3**) | **E2 = Retain — ห้ามแตะ/rename/merge ทุกกรณี** (ปิด gate แล้ว) |
| 6 | `BadgeEngine.ts` (BADGE_DEFINITIONS `:43`, class `:149`) | `BadgeEngine.ts` (274 ln, SICE **#8** `:27`) | A = นิยาม badge + unlock แบบ idempotent; B = ตรวจจับ achievement → ส่งสัญญาณ | **BRIDGED** ผ่าน SICEBridge |
| 7 | `BehavioralForecastEngine.ts` (class `:288`) | `BehavioralForecastEngine.ts` (416 ln, SICE **#9** `:32`) | A = forecast types (risk/momentum/forecast); B = ทำนาย mood trajectory จาก Twin memory history | คนละ implementation |
| 8 | `FutureSelfEngine.ts` (class `:220`) | `FutureSelfEngine.ts` (351 ln, SICE **#10** `:11`) | A = scenarios/projections; B = docblock อ้างว่า "wrapper" แต่**ไม่พบ import จริง** — self-contained (docblock ล้าสมัย) | คนละ implementation |
| 9 | `MemoryManager.ts` (401 ln, class `:40`) | `MemoryManagerEngine.ts` (213 ln, SICE **#11** `:26`) | A = PersonalMemory CRUD (ผู้ใช้ควบคุม); B = synthesize/retrieve memories เพื่อ interaction | ชื่อต่างกัน (`MemoryManager` vs `MemoryManagerEngine`) — คนละ implementation |
| 10 | `DecisionIntelligenceEngine.ts` (class `:255`) | `DecisionIntelligenceEngineAdapter.ts` (275 ln, SICE **#12** `:25`) | A = รายงาน bias/framework/checklist; B = วิเคราะห์ decision history (success rate, guidance) — ชื่อ "Adapter" แต่ไม่ import ฝั่ง A | คนละ implementation (self-contained) |

**Sice-only (6):** ExperienceEngine #6, EnvironmentEngine #7, EmotionalIntelligenceEngine #13, SocialConnectionEngine #14, GoalTrackingEngine #15, WellnessEngine #16
**Lib-only (7):** AnalysisNarrativeBuilder (functions), EvidenceAnalyzer, HexagramEngine, NatalChartEngine, DailyBriefEngine, LifeIntelligencePackEngine, PersonalContextInitializer — + `types.ts` เป็น **shared schema source** (SICEBridge import type จากไฟล์นี้ `SICEBridge.ts:14`)

---

## 3. ทางเลือก Convergence Design (ให้ Owner เลือก — Agent ห้ามตัดสิน)

### C1 — Boundary Formalization (แนะนำเป็นขั้นแรก, **zero code change**)
- ประกาศสัญญาเลเยอร์เป็นทางการ: Layer A = "Knowledge & Persistence Intelligence" (domain, DB-backed, UI-facing) · Layer B = "Orchestration Runtime" (session orchestration, สัญญา SICEBase, engines ราย orchestration)
- ประกาศ **SICEBridge = seam เดียวที่อนุญาต** ข้ามเลเยอร์ (engineId 2 → lib PatternDetector, engineId 8 → lib BadgeEngine, essence snapshot)
- ลงทะเบียน engine-ID map (1-16) เป็น canonical (Section 2 ของเอกสารนี้)
- งานแตะไฟล์เดียวที่เสนอ: แก้ docblock ล้าสมัยใน `sice/engines/FutureSelfEngine.ts:3` (comment-only, ไม่แตะ logic)
- **ความเสี่ยง: ศูนย์** — ไม่มีการย้าย/ลบ/รวม code

### C2 — Adapter Unification แบบเป็นขั้น (ทำภายหลัง, ต่อคู่ 1 sub-batch)
- แปลง sice engine ที่ซ้ำชื่อให้เป็น true adapter (delegate ภายในไปยัง lib implementation) ตามแบบที่ชื่อ `DecisionIntelligenceEngineAdapter` บอกไว้แล้ว
- ลำดับเสนอ: AIFeedbackLoop → InsightEngine → PatternDetector (bridged อยู่แล้ว) → BadgeEngine (bridged อยู่แล้ว) → BehavioralForecastEngine → FutureSelfEngine → MemoryManagerEngine → DecisionIntelligenceEngineAdapter
- **คู่ที่ห้ามรวมตาม gate ที่ปิดแล้ว:** #5 TwinStateEngine (E2 = Retain) · #1 PersonalContextBuilder (E4 ยังรอ runtime reproduction — ห้ามแตะ cache key/sites ด้วย)
- เงื่อนไขทุก sub-batch: สัญญา orchestrator ไม่เปลี่ยน + `tsc -b` + `vitest run` ≥1,102 + `vite build`
- **ความเสี่ยง: กลาง** — ต้องพิสูจน์ parity ต่อคู่ก่อนรวม

### C3 — Full Convergence (ไม่แนะนำตอนนี้)
- implementation เดียวต่อ domain — ต้องมี runtime parity proof ราย engine + e2e ครบ ความเสี่ยงสูงสุด เสนอพิจารณาเฉพาะหลัง C2 สำเร็จทุกคู่

---

## 4. ผลกระทบต่อ Risk Vector / System Invariants (ทุกทางเลือกต้องเคารพ)

| Invariant | ที่มา | ผลต่อ convergence |
|-----------|-------|--------------------|
| BLOCKER-01: persist สำคัญก่อน return, พลาด → DEGRADED | `SICEOrchestrator.ts:153-205` | ห้ามทำให้ semantics เปลี่ยนในทุกทางเลือก |
| sice_feedback fine-tuning loop (engine-level) | `SICEOrchestrator.ts:443-530` | เป็นของ Layer B — ห้ามย้ายเข้า lib |
| สัญญาแปลง schema DetectedPattern → BehavioralPattern (confidence ÷100, frequencyFromCount) | `SICEBridge.ts:196-233` | สัญญาห้ามแตะ — ใช้เป็น spec ของ C2 |
| ตาราง `awakening_essence` + `sice_results` JSONB | `SICEBridge.ts:150-170` (SICERESULTS-001) | persistence contract — ห้ามเปลี่ยน |
| E2 TwinStateEngine ×3 Retain | Ledger §7 | คู่ #5 ถูก exclude จาก C2/C3 |
| E3 TwinVisualDNA ×3 Retain | Ledger §7 | ไม่เกี่ยวกับ SICE — ห้ามแตะเผื่อ |
| E4 PCB cache-shape collision (runtime impact unproven) | Ledger §3/§7 | คู่ #1 ถูก block จนกว่า E4 runtime reproduction |
| UI consumers Layer A 30+ sites | grep 27 ก.ย. | ต้องเห็นพฤติกรรมไม่เปลี่ยน (tsc/vitest เป็น gate) |
| WorldRoutingService.ts:67 (DC-11 dead instantiation) | Phase 9 | แยกไป dead-code batch — ไม่อยู่ใน E1 |

---

## 5. Verification Plan เสนอ (ต่อ sub-batch ของทางเลือกที่เลือก)

1. `tsc -b` → 0 errors
2. `vitest run` → ≥1,102 tests (รวม `SICEBridge.test.ts`, `SICEEngines.test.ts` ฝั่ง B และ lib tests ฝั่ง A)
3. `vite build` + PWA → ผ่าน (ถ้าแตะไฟล์ที่เข้า bundle)
4. ห้ามรัน/แตะอะไรก่อน Owner อนุมัติทางเลือก C1/C2/C3

---

## 6. OWNER DECISION — E1 (ลงนาม 27 ก.ย. 2026)

- **ทางเลือกที่เลือก: C1 — Boundary Formalization (Zero Code Change)**
- **เหตุผล Owner:** เป้าหมายหลักของ Phase 12 คือการสถาปนา Architectural Boundaries ให้ชัดเจน — ล็อก `SICEBridge` เป็น **SSOT Seam เดียว** และคงทั้งสองเลเยอร์ไว้โดยไม่แตะ code/logic การคำนวณ (zero risk ต่อ `sice_feedback` fine-tuning loop และ persistence-before-return) — กลยุทธ์ปลอดภัยที่สุดก่อนเข้าสู่ Phase 14
- **C2 / C3:** ไม่ถูกเลือก — จะไม่ execute จนกว่า Owner จะสั่งใหม่ (สถานะข้อเสนอเดิมคงอยู่ใน Section 3)
- **ผลการ execute C1:** เอกสารนี้ + engine-ID map (Section 2) + สัญญา SICEBridge (Section 1.3) = **canonical boundary contract** ของ SICE dual-layer
- `docblock` ล้าสมัยใน `sice/engines/FutureSelfEngine.ts:3` จดไว้เป็น comment-only fix รอ batch ที่อนุญาตให้แตะ — **ไม่แตะใน C1** เพื่อคุม zero code change เด็ดขาด

**สถานะเอกสารนี้:** APPROVED (C1) โดย Owner — 27 กันยายน 2026