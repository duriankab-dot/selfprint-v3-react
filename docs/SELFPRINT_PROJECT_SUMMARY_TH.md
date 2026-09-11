# SELFPRINT — PROJECT SUMMARY (ภาษาไทย)

> **สถานะเอกสาร:** สรุปโปรเจคฉบับภาษาไทย (อัปเดต 11 ก.ย. 2026 — เพิ่ม Daily Time & Energy Dynamics layer)
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

## 0.5 🆕 Daily Time & Energy Dynamics (เพิ่ม 2026-09-11)

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

## 1. สถานะจริง (7 ก.ย. 2026 · HEAD `710afa0` · ล่าสุด `4ed4762`)

> HEAD `710afa0` = baseline ที่ `FORENSIC_...` ฉบับรอบที่ 7 verify แล้ว · ล่าสุด `4ed4762` =
> `fix: remove invalid KV binding, fix SW 503 passthrough, add CSS token aliases`

### Gate table

| gate | ผล | verify กับ |
|------|-----|-----------|
| `tsc -b` (strict) | ✅ 0 errors | local build |
| `npm run typecheck:functions` | ✅ 0 errors | local build |
| `vite build` | ✅ สำเร็จ (3.81 s · 933 modules) | local build |
| `oxlint` | ✅ 0 errors · 187 warnings · 474 files | local build |
| `vitest run` | ✅ **66/66 ไฟล์ · 1037 tests · 0 fail · 0 skip** | local build |
| **E2E Playwright CI** | ✅ **run #305 ผ่านหมด** (7 ก.ย. 2026) | GitHub Actions จริง |
| **Production `selfprint.one`** | ✅ `/th/` + `/en/` โหลดได้ปกติ ไม่มี error boundary | Chrome DevTools จริง |
| **Supabase migration 035** | ✅ apply แล้ว | Supabase SQL Editor 5 ก.ย. 2026 |
| **Supabase Edge Functions** | ✅ 12 functions deployed · ทุกตัวตอบ 401 · SEC-02 live | Supabase dashboard 6 ก.ย. 2026 |

### สถานะงาน

- ✅ **Track A + B + C0 ปิดหมดแล้ว** (บั๊ก engineering backlog · Phase 0 forensic · งานเคลียร์ทาง Track C)
- ✅ **Production ทำงานได้ · E2E CI ผ่าน** (run #305)
- 🔜 **Track C (visual redesign) พร้อมเริ่ม** — เริ่มที่ Phase 1 (Performance Foundation) ซึ่งแตะ 0 ไฟล์
- ⚠️ ยัง **ไม่สามารถอ้าง "100% product-verified"** ได้ — ดูหัวข้อ 4 (Known limitations)

---

## 2. สถาปัตยกรรมจริง

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| State | Zustand + TanStack React Query |
| Serverless backend | **Cloudflare Pages Functions** (`functions/` — โฟลเดอร์เดียวที่ deploy) + **Supabase Edge Functions (12 ตัว)** |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | **SICE 12 engines** (client-side, rule-based) + Claude API (Nova guide + AI Twin) |
| Payments / Auth / Monitoring | Stripe · Supabase Auth + Passkeys (WebAuthn) · Sentry |
| Deploy | Cloudflare Pages (selfprint.one) — **Vercel + Express (Node) ถูกลบออกแล้ว** |

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

### Experience flow (จากโค้ดจริง)

`Nova (guide)` → วิเคราะห์ 12 มิติ / SICE → Blueprint → Core Awakening → **Twin Birth** →
Twin + memory/evolution → **Today** (living entry)

### 5-tab nav (verified `BottomNav.tsx:89-93` + `NavRail.tsx`)

| # | Tab | Route |
|---|-----|-------|
| 1 | วันนี้ (Today) | `/dashboard` |
| 2 | โลก (Worlds) | `/worlds` |
| 3 | AI ฝาแฝด (AI Twin) | `/chat/twin` |
| 4 | สำรวจ (Explore) | `/explore` |
| 5 | ฉัน (Me) | `/me` |

> **Worlds เป็น top-level tab** (ไม่ใช่ Activities) — `/activities` ยังมี route แต่หลุดจาก nav แล้ว
> (กิจกรรมย้ายไปเป็น section ของ Explore)

---

## 3. จุดแข็งโดยจริง

1. **Honesty culture** — โปรเจคมี `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` ที่ **verify กับ Supabase /
   Cloudflare / GitHub / scoop จริง** ไม่เชื่อ `.md` ใด ๆ รวมถึงฉบับของตัวเอง · มีตาราง "เอกสารที่เคยโกหก"
   เก็บเป็นบทเรียน
2. **Story layer (§51) + anti-fake guardrails** — `docs/Experience Architecture v2.md` §51 กำหนด
   **7 story primitives** (Chapter / Story Beat / Narrative Hook / Question / Choice / Consequence / Reveal)
   map กับข้อมูลที่มีอยู่แล้ว (ไม่สร้าง DB table ใหม่) + **guardrails 5 ข้อ** (NO FAKE STORY / NO GAMIFICATION /
   NO PARALLEL MEMORY / NO NEW INTELLIGENCE ENGINE / ONLY SHOW HOOK WHEN REAL DATA EXISTS)
3. **Dual language** — i18n แบบ inline `isTh ? ... : ...` (958 จุด) + `useLanguage` / `TRANSLATIONS` / `t(` (1607 จุด)
4. **Lifecycle ครบ** — onboarding → analysis → Core Awakening → Twin Birth → Twin chat → Today →
   evolution (5 growth stages) → memory

---

## 4. ความเสี่ยง / สิ่งที่ยังค้าง (honest)

| รายการ | รายละเอียดจริง |
|--------|---------------|
| **Stubs / mocks / placeholders** | `VoiceInput.tsx:38` (mock STT) · `VoiceOutput.tsx:34` (mock TTS) · `CommunityPage.tsx:397` ("Coming soon") · `ExplorePage.tsx:728,898` (stub cards) · `DecisionDashboard.tsx:126` (placeholder "Phase F Dashboard") |
| **Preflight ยังปิดอยู่** | Tailwind v4 ตั้งใจ**ไม่เปิด preflight** (`TWFIX-001`) เพื่อไม่ให้ทับ CSS เขียนมือ ~30 ไฟล์ก่อน Track C |
| **Soundscape พัง** | `soundscape-manifest.json` ยังมี 23 `CLOUDINARY_URL` ที่ไม่ถูกแทนที่ · `public/audio/` ไม่มีอยู่จริง · `adaptive-audio-engine.ts:285` อ้าง mp3 ที่ไม่มี |
| **C1 — Twin มี 3 implementations** | `LivingTwin.tsx` (orb CSS) · `TwinPresence.tsx` (SVG) · `HologramBirth.tsx` (canvas 2D) — คำนวณ `evolutionStage`/`glowMult` ซ้ำกัน · **A3 ต้องขออนุมัติ** ก่อนรวม (แตะแก่น product) |
| **C2 — ไม่มี SSR/SSG/prerender** | 24/41 หน้าไม่มี meta · FAQ schema แค่ 5 คำถาม · sitemap ไม่สมบูรณ์ · **A4 ต้องขออนุมัติ** (แตะ build/deploy pipeline) |
| **SEO meta** | 24/41 หน้าไม่มี meta (`MetaTagManager` ยังไม่ครอบคลุม) |
| **`as any`** | 47 จุด (วัด 6 ก.ย. 2026) — SICE layer สะอาดแล้ว แต่ทั้งโปรเจคยังเหลือ |
| **`dangerouslySetInnerHTML`** | 8 จุด — ปลอดภัยทั้งหมดผ่าน `safeJsonLd()` |
| **`chunk-intelligence` 345 kB** | chunk ใหญ่สุด — ส่วนใหญ่คือ Supabase SDK ถูกกลืน (verify ใน Phase 0) |
| **X1 env** | `structuredData.ts:21` `'+66-2-XXX-XXXX'` fake phone fallback → GEO spam signal |
| **SICE → Full Analysis** | ❌ ยังไม่ได้เชื่อม `SICEOrchestrator.orchestrate()` เข้ากับ Full Analysis — ใช้เฉพาะ astrology fallback |
| **twin_sice_scores persistence** | ❌ migration มี table แล้วแต่ CoreAwakeningService เท่านั้นเขียน `twin_awakening_essence` — ยังไม่เขียน `twin_sice_scores` |
| **Phase 2 Edge Function** | ❌ ยังไม่มี Astrovera Edge Function — `buildFallbackResponse()` เป็น primary แทนที่จะเป็น fallback |

> ทั้งหมดนี้ **ไม่บล็อกการเริ่ม Track C** — แต่ต้องรู้ก่อน redesign และต้องแก้ก่อนอ้าง "100% product-verified"

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
| [`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](../FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md) | **Single source of truth** ของสถานะจริง (round 7 · 7 ก.ย. 2026) |
| [`docs/Experience Architecture v2.md`](Experience%20Architecture%20v2.md) | **Design/experience master** ของ Track C · 51 topics · §44 safety rule · §45 success criteria · §46 core loop · §51 story layer |
| [`docs/PLAN_TRACKS_TH.md`](PLAN_TRACKS_TH.md) | Master plan: Track A / B / C |
| [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](PHASE0_VISUAL_PERF_FORENSIC_TH.md) | Phase 0 forensic results — **ต้องอ่านก่อนเริ่ม Track C** |

> **Track C working docs:** [`docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`](Experience%20Architecture%20v2/TRACK_C_VISUAL_REDESIGN_TH.md)

---

> **หลักการ:** ตรวจจากโค้ดจริง + verify กับ Supabase / Cloudflare / GitHub จริง · แยก "แก้แล้ว verify แล้ว"
> ออกจาก "ยังไม่แก้" · ไม่อ้างว่าทำสิ่งที่ยังไม่ได้ทำ · **ห้ามอ้าง "100% product-verified"** จนกว่าจะทำครบเงื่อนไข
