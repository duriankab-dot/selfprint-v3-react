# SELFPRINT — PROJECT SUMMARY (ภาษาไทย)

> **สถานะเอกสาร:** สรุปโปรเจคฉบับภาษาไทย (อัปเดต 11 ก.ย. 2026 — Master Gate Forensic Verification)  
> **แหล่งอ้างอิงหลัก:** [`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](../FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md) — เอกสารนี้ **ไม่แทนที่** `FORENSIC_...`
> `FORENSIC_...` ยังเป็น **single source of truth** ของสถานะจริง ส่วนเอกสารนี้เป็น summary กระชับสำหรับอ่านเร็ว  
> **หลักการ:** เนื้อหาทุกข้อตรวจจากซอร์สโค้ดจริง (file:line) — ไม่เชื่อ `.md` เก่า · ไม่อ้างเกินจริง · ระบุ limitations จริง

---

## 0. เรื่องของโปรเจค

SELFPRINT คือ **Living Intelligence Experience** — ไม่ใช่ AI chatbot / ไม่ใช่แอปดูดวง / ไม่ใช่ dashboard

- **Core promise:** *"Understand yourself. Meet your Twin. Keep evolving."*
  (ตรงกับ §1–2 ของ `docs/Experience Architecture v2.md`)
- ผู้ใช้ผ่านการวิเคราะห์พฤติกรรม (behavioral analysis) → ได้ **AI Twin** ที่เกิดจาก **Core Awakening**
  แล้วเติบโตไปกับผู้ใช้ผ่าน growth stages
- ภาษา: รองรับไทย + อังกฤษ (dual language)
- หลักการออกแบบ (ตามเอกสารแม่): **RECOMPOSE → CONNECT → ENHANCE** ไม่ใช่ REBUILD → REWRITE → REPLACE (§44)

---

## 0.5 🆕 Immersive V3 Visual Foundation (เพิ่ม 2026-09-11)

ชั้น visual ใหม่ทั้งระบบ — 5-layer stack, world transitions, immersive twin chat, glass surfaces

| องค์ประกอบ | รายละเอียด | ไฟล์ |
|-----------|-----------|------|
| **5-Layer Visual Stack** | World/Twin/Contextual/Primary/Temporary UI — z-index scale 0/10/20/30/40 | `immersive-layers.css` |
| **World Transitions** | 9 narrative types (attraction/pull/absorption/dissolution/flow/fold/tunnel/gravity_shift/env_wave) | `world-transitions.css` |
| **Twin State Machine** | IDLE → LISTENING → THINKING → RESPONDING → GROWING + CSS custom properties | `useTwinStates.ts` |
| **Immersive Twin Chat** | Living space replacement — Layer 0-4 composition, world drawer, decision logging | `ImmersiveTwinChat.tsx` |
| **Transition Engine** | 12 worlds × 12 = 144 transition rules → narrative type mapping | `WorldTransitionEngine.ts` |
| **Glass Surfaces** | `immersive-glass` class + `immersive-page` wrapper on WorldsHub/ExplorePage/MePage | `worlds-hub.css`, pages |

**Data Flow:** Route `/chat/twin` → `ImmersiveTwinChat` → useTwinStates hook → cssVars inject into Twin renderer → world transitions via WorldTransitionEngine

---

## 0.6 🆕 Daily Time & Energy Dynamics (เพิ่ม 2026-09-11)

ชั้นคำนวณพลังงานรายวันบน Landing Page — ใช้ตรรกะ Vedic Hora/Panchang อยู่เบื้องหลัง แต่แสดงผลเป็น scientific terminology เท่านั้น

| องค์ประกอบ | รายละเอียด | ไฟล์ |
|-----------|-----------|------|
| **Daily Dynamics Engine** | คำนวณ Accelerated Phase, High Friction Interval, Circadian Color, Attraction Vector จาก birthDate + today | `astrology.ts:calculateDailyDynamics()` |
| **Bio-Tracking Dashboard UI** | หน้ารายงานพลังงานรายวันสไตล์ Oura Ring / Cyberpunk — แสดงบน Landing Page เป็น "เบ็ดล่อชิ้นแรก" | `TodayBioEnvironmentReport.tsx` |
| **Quick Summary + Intro Article** | บทความสรุปตัวตน 3 ย่อหน้า + 6-section identity card + Social Share (FB, Line, X) | `IntroSummary.tsx`, `QuickSummary.tsx` |
| **Retention Loop** | ค่า refresh อัตโนมัติทุกวัน (ตรวจสอบทุก 1 ชั่วโมง) → CTA ไป Onboarding → Full Analysis | `TodayBioEnvironmentReport.tsx`, `LandingPage.tsx` |
| **SEO/AEO/GEO Markup** | FAQ JSON-LD (ซ่อนคำค้นหาสายมู) + GEO tags (TH-22 / Chanthaburi) | `MetaTagManager.tsx`, `intro-summary.ts` |
| **Chronopsychology Prompt** | System prompt แปลง Vedic output เป็น scientific language — ห้ามใช้คำศัพท์สายมู | `intro-summary.ts:CHRONOPSYCHOLOGY_SYSTEM_PROMPT` |

**Data Flow:** Quick Input DOB → calculateInitialDisciplines() → buildFallbackResponse() → render TodayBioEnvironmentReport → IntroSummary → QuickSummary → CTA /onboarding

---

## 1. สถานะจริง (11 ก.ย. 2026 · HEAD master · Forensic Audit NOT PASS)

### Gate table

| gate | ผล | verify กับ |
|------|-----|----------|
| SICE engine pipeline | ✅ GREEN (source verified) | SICEOrchestrator.ts:55-197, call graph traced |
| Auth / Security | ✅ GREEN (source verified) | verify-user.ts, twin.ts, unified-handler.ts |
| Persistence | 🟡 YELLOW | await present; migration 035 apply status unknown |
| Awakening → Twin | ✅ GREEN (source verified) | CoreAwakeningService.ts:131-820 |
| Canonical Twin Identity | ✅ GREEN (source verified) | seedKey=session.user.id through birth→presence |
| Visual DNA | ✅ GREEN (source verified) | 18 archetype parameter table + per-user traits |
| Birth Continuity | ✅ GREEN (source verified) | Same DNA/traits derivation in canvas and SVG |
| Growth | 🔴 ORANGE | checkMicroEvolution/evolveTwin/useEvolutionTracking = zero production callers |
| Three.js / Living Body | 🔴 RED | NO three.js dependency — actual renderer is SVG/canvas2D/CSS |
| World System | 🟢 Manual selection real; auto-routing DEAD | routeToWorld() has zero callers |
| World Transition | 🟠 ORANGE | Engine real but CSS wiring broken (missing selectors) |
| Immersive Chat | ✅ GREEN (source verified) | Layer architecture verified at source |
| Streaming path | 🟡 IMPLEMENTED BUT NOT VERIFIED | streamTwinResponse() has zero callers |
| Audio behavior | 🟠 ORANGE | Infrastructure exists, no consumer wiring |
| Build/Test/Lint | 🔵 BLOCKED | Environment gate prevents execution |
| Live Environment | 🔵 NOT VERIFIED | No credentials available |

### สรุปภาพรวม

```text
MASTER GATE = NOT PASS
```

มี 6 critical gaps:

| # | Gap | Severity |
|---|-----|----------|
| 1 | Growth pipeline unwired | P0 CRITICAL |
| 2 | Three.js gate not met | P0 CRITICAL |
| 3 | World Transition CSS broken | P0 MAJOR |
| 4 | Migration 035/034 apply UNKNOWN | P0 CRITICAL |
| 5 | Streaming path dead | P0 MAJOR |
| 6 | Build/Test/Lint blocked | P1 MAJOR |

รายละเอียดเต็ม: ดู `MASTER_GATE_AS_IS.md`, `MASTER_GATE_EVIDENCE.md`, `MASTER_GATE_REMEDIATION_PLAN.md`

---

## 2. สถาปัตยกรรมจริง

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| State | Zustand + TanStack React Query |
| Serverless backend | **Cloudflare Pages Functions** (`functions/`) + **Supabase Edge Functions (12 ตัว)** |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | **SICE 12 engines** (client-side, rule-based) + OpenRouter REST API (Nova guide + AI Twin) |
| Payments / Auth / Monitoring | Stripe · Supabase Auth + Passkeys (WebAuthn) · Sentry |
| Deploy | Cloudflare Pages (selfprint.one) — **Vercel + Express (Node) ถูกลบออกแล้ว** |
| Render | **SVG** (TwinPresence) + **Canvas 2D** (HologramBirth) + CSS fallbacks — **NO THREE.JS** |

### SICE — 12 Selfprint Intelligence Core Engines

`src/services/sice/engines/` (12 ไฟล์): `TwinStateEngine` · `PersonalContextBuilder` · `PatternDetector` ·
`MemoryManagerEngine` · `InsightEngine` · `FutureSelfEngine` · `ExperienceEngine` · `EnvironmentEngine` ·
`DecisionIntelligenceEngineAdapter` · `BehavioralForecastEngine` · `BadgeEngine` · `AIFeedbackLoop`

> ⚠️ **2 forks ที่ใช้งานจริง — ห้ามลบฝั่งใดฝั่งหนึ่ง**
> `src/services/sice/engines/*` และ `src/lib/intelligence/*` เป็น **สอง implementations ที่ยังใช้งานอยู่**
> เชื่อมกันทางเดียวผ่าน `SICEBridge.ts` — ไม่ใช่ของ duplicate · ลบแล้วระบบพัง

### API — 7 modules ผ่าน catch-all route

`functions/api/[[route]].ts` → `api/unified-handler.ts` จัดการ **7 modules**:
`notifications` · `twin-evolution` · `sice` · `stripe` · `profile` · `blueprint` · `share`
(นอกนั้นคืน JSON 404) — `twin.ts` / `nova.ts` มี function เฉพาะของตัวเอง ไม่ผ่าน catch-all

### Immersive V3 Visual Architecture

```
Layer 0: WorldEnvironment (full-screen background, pointer-events: none)
Layer 1: Canonical Twin (center of gravity, uses useTwinStates cssVars)
Layer 2: Contextual Effects (particles, light, atmosphere)
Layer 3: Primary Controls (input + send, minimal actions)
Layer 4: Temporary UI (drawers, sheets, overlays)

z-index scale: --layer-world:0, --layer-twin:10, --layer-contextual:20, --layer-primary:30, --layer-temporary:40
Glass tokens: --glass-bg, --glass-border, --glass-blur, --glass-surface, --glass-elevated
```

### Experience flow (จากโค้ดจริง)

`Nova (guide)` → วิเคราะห์ 12 มิติ / SICE → Blueprint → Core Awakening → **Twin Birth** →
Twin + memory/evolution → **Today** (living entry)

### 5-tab nav (verified `BottomNav.tsx:89-93` + `NavRail.tsx`)

| # | Tab | Route |
|---|-----|-------|
| 1 | วันนี้ (Today) | `/dashboard` |
| 2 | โลก (Worlds) | `/worlds` |
| 3 | AI ฝาแฝด (AI Twin) | `/chat/twin` (→ ImmersiveTwinChat) |
| 4 | สำรวจ (Explore) | `/explore` |
| 5 | ฉัน (Me) | `/me` |

> **Worlds เป็น top-level tab** (ไม่ใช่ Activities) — `/activities` ยังมี route แต่หลุดจาก nav แล้ว

---

## 3. จุดแข็งโดยจริง

1. **Honesty culture** — โปรเจคมี `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` ที่ **verify กับซอร์สโค้ดจริง** ไม่เชื่อ `.md` ใด ๆ รวมถึงฉบับของตัวเอง
2. **Story layer (§51) + anti-fake guardrails** — `docs/Experience Architecture v2.md` §51 กำหนด
   **7 story primitives** + **guardrails 5 ข้อ** (NO FAKE STORY / NO GAMIFICATION /
   NO PARALLEL MEMORY / NO NEW INTELLIGENCE ENGINE / ONLY SHOW HOOK WHEN REAL DATA EXISTS)
3. **Dual language** — i18n แบบ inline `isTh ? ... : ...` (~958 จุด) + `useLanguage` / `TRANSLATIONS` / `t(` (~1607 จุด)
4. **Lifecycle ครบ** — onboarding → analysis → Core Awakening → Twin Birth → Twin chat → Today →
   evolution (5 growth stages) → memory
5. **Canonical Twin Identity continuity** — same seedKey + archetype through birth→presence (verified at source)
6. **Visual DNA parameter space** — 18 archetypes × deterministic per-user traits (not hardcoded avatars)
7. **Compensating rollback** — initializeTwin atomic creation with orphan prevention (verified at source)
8. **Auth/RLS coverage** — JWT verification + ownership enforcement across all endpoints (verified at source)
9. **Critical persistence awaited** — SICE orchestration awaits writes before returning (verified at source)
10. **Immersive V3 Visual Foundation** — 5-layer stack + world transitions + canonical twin state machine + glass surfaces across site
11. **Daily Dynamics Layer** — Vedic calculation + Bio-Tracking Dashboard + Social Share + SEO/AEO/GEO markup

---

## 4. ความเสี่ยง / สิ่งที่ยังค้าง (honest)

### Master Gate Blockers (P0 Critical)

| รายการ | รายละเอียดจริง |
|--------|---------------|
| **Growth pipeline unwired** | `checkMicroEvolution`/`evolveTwin`/`useEvolutionTracking` มีแค่ test callers — zero production consumers. maturityScore set ที่ birth เท่านั้น ไม่มี conversation-driven update path |
| **Three.js gate not met** | package.json ไม่มี `three`, grep "from 'three'" = 0 matches. Twin rendering = SVG/canvas2D/CSS. Decision บันทึกใน Twin.tsx:12-14 (deferred) |
| **Migration 035/034 apply** | PRODUCTION_DB_CATCHUP (09-01) ไม่รวม 035 (09-03). Comment ใน 035:1186 ยืนยันว่าไม่สามารถ verify ว่า apply แล้วหรือไม่ — Twin birth อาจ fail ถ้าไม่ apply |
| **Streaming path dead** | `streamTwinResponse()` มี implementation + auth parity แต่ zero callers ใน production UI |
| **World Transition CSS broken** | Engine real แต่ CSS ไม่มี selector `.world-transition--attraction/pull/...` → animation ไม่ trigger |

### Known Limitations (P1/P2)

| รายการ | รายละเอียดจริง |
|--------|---------------|
| **Stubs / mocks** | `VoiceInput.tsx:38` (mock STT) · `VoiceOutput.tsx:34` (mock TTS) · `CommunityPage.tsx:397` ("Coming soon") · `ExplorePage.tsx:728,898` (stub cards) · `DecisionDashboard.tsx:126` (placeholder) |
| **Soundscape files** | `soundscape-manifest.json` อ้าง URL ที่อาจไม่มีไฟล์ mp3 จริง — app มี fallback oscillator synthesis |
| **C1 — Twin 3 implementations** | `LivingTwin.tsx` (orb CSS) · `TwinPresence.tsx` (SVG) · `HologramBirth.tsx` (canvas 2D) — compute `evolutionStage`/`glowMult` ซ้ำกัน |
| **Audio behavior wiring** | SFXProvider global mount สำเร็จ แต่ useSFX() มี zero consumers outside provider |
| **`as any`** | ~18 จุด (เฉพาะ unified-handler.ts ที่ @ts-nocheck ทั้งไฟล์ตั้งใจ) |
| **`dangerouslySetInnerHTML`** | 8 จุด — ปลอดภัยทั้งหมดผ่าน `safeJsonLd()` |
| **Chunk size** | `chunk-intelligence` ~345 kB — ส่วนใหญ่คือ Supabase SDK ถูกกลืน |
| **X1 env** | `structuredData.ts:21` `'+66-2-XXX-XXXX'` fake phone fallback → GEO spam signal |

### Closed Items

| รายการ | สถานะ |
|--------|-------|
| **SICE → Full Analysis** | ✅ **ปิดแล้ว (2026-09-11)** · handleFinetuneSubmit เรียก SICEOrchestrator.orchestrate() → merge personalIntelligence.insights เข้า analysisProfile |
| **twin_sice_scores persistence** | ✅ **ปิดแล้ว (2026-09-11)** · persistSiceScores() บันทึก baseline scores หลัง orchestration สำเร็จ |
| **Phase 2 Edge Function** | ✅ **สร้างแล้ว (2026-09-11)** · supabase/functions/astrovera-edge/index.ts — Claude 3.5 Sonnet via OpenRouter + numerology life_path fallback |

---

## 5. แผนงาน Track A / B / C

### Track A — Engineering Backlog

ล้าง Vercel + dead code (A1) · env + รหัสผ่าน (A2) · แก้บั๊ก frontend (A3) · OG image (A4) ·
DB migration (A5) · RLS policy (A6) · TypeScript strict (A7) · vitest ครบ 66/66 (A8) · ลบ `.md` เก่า 84 ไฟล์ (A9)
→ **A1·A4·A7·A8 ปิดแล้ว** (ส่วนที่เหลือตาม `PLAN_TRACKS_TH.md`)

### Track B — Phase 0 Forensic

รายงาน `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md` (ส่งแล้ว 4–5 ก.ย. 2026)
→ สรุป: **PASS 7 · PARTIAL 3 · BLOCKED 0** (รวม 0.11 mock = PARTIAL · ~~0.12 passkey~~ ✅ · ~~0.13 migration 035~~ ✅)

### Track C — Visual Redesign (12 phase)

```
PHASE 1   Performance Foundation
PHASE 2   Landing
PHASE 3   Onboarding
PHASE 4   Analysis
PHASE 5   Core Awakening
PHASE 6   Twin Birth
PHASE 7   Twin Chat
PHASE 8   Today
PHASE 9   Worlds            (NEW · G1 · P0.5)
PHASE 10  Twin Modes        (NEW · G3 · P0.4 / P1.8)
PHASE 11  Memory Experience (NEW · G4 · P1.1 / P1.2)
PHASE 12  SEO/GEO/AEO knowledge layer (NEW · G7 · P0.9)
```

**Gaps G1–G8** ที่ Track C เพิ่มจากช่องว่างของเอกสารแม่:
**G1** Worlds (→ Phase 9) · **G2** JOURNEY (§15, P1/P2) · **G3** Twin Modes (→ Phase 10) ·
**G4** Memory (→ Phase 11) · **G5** SMART ENTRY (§35, P1/P2) · **G6** First message จาก real analysis (→ Phase 6) ·
**G7** SEO/GEO/AEO (→ Phase 12) · **G8** Returning user (§36, P1/P2)

**ต้องขออนุมัติก่อน (แตะแก่น product / pipeline):** A2 provider lazy · A3 Twin consolidation (C1) · A4 SSR (C2)

---

## 6. เอกสารอ้างอิงหลัก

| เอกสาร | ใช้ทำอะไร |
|--------|-----------|
| [`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](../FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md) | **Single source of truth** ของสถานะจริง (Master Gate Forensic Verification) |
| [`MASTER_GATE_AS_IS.md`](../MASTER_GATE_AS_IS.md) | AS-IS state document for all gates |
| [`MASTER_GATE_EVIDENCE.md`](../MASTER_GATE_EVIDENCE.md) | Source-level evidence for all gates |
| [`MASTER_GATE_REMEDIATION_PLAN.md`](../MASTER_GATE_REMEDIATION_PLAN.md) | Required remediation steps |
| [`docs/Experience Architecture v2.md`](Experience%20Architecture%20v2.md) | **Design/experience master** ของ Track C · 51 topics · §44 safety rule · §45 success criteria · §46 core loop · §51 story layer |
| [`docs/PLAN_TRACKS_TH.md`](PLAN_TRACKS_TH.md) | Master plan: Track A / B / C |
| [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](PHASE0_VISUAL_PERF_FORENSIC_TH.md) | Phase 0 forensic results — **ต้องอ่านก่อนเริ่ม Track C** |

> **Track C working docs:** [`docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`](Experience%20Architecture%20v2/TRACK_C_VISUAL_REDESIGN_TH.md)

---

> **หลักการ:** ตรวจจากโค้ดจริง + verify กับ Supabase / Cloudflare / GitHub จริง · แยก "แก้แล้ว verify แล้ว"
> ออกจาก "ยังไม่แก้" · ไม่อ้างว่าทำสิ่งที่ยังไม่ได้ทำ · **ห้ามอ้าง "100% product-verified"** จนกว่าจะทำครบเงื่อนไข
