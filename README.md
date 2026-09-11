# 🌟 SELFPRINT — Living Intelligence Platform

**แพลตฟอร์ม AI Twin ที่เรียนรู้รูปแบบพฤติกรรมของคุณผ่าน 12 มิติปัญญา**  
*(An AI-powered "living Twin awakening" system for self-understanding, learning, and growth.)*

> **สถานะการผลิต:** `MASTER GATE = NOT PASS` (Forensic Audit 2026-09-11)  
> มี 6 critical gaps ที่ต้องปิดก่อนเรียก "Production Ready"

---

## 📊 สถานะการผลิต

| พื้นที่ | สถานะ | หลักฐาน |
|--------|--------|---------|
| **P0-A: 12 Sciences** | ✅ GREEN (source verified) | ทุก engine มี implementation, registration, execution, output flow |
| **P0-B: SICE Orchestration** | ✅ GREEN (source verified) | Parallel execution, completionStatus, persistence awaited |
| **P0-C: Awakening/Twin** | ✅ GREEN (source verified) | Atomic twin creation, compensating rollback, orphan prevention |
| **P0-D: TwinChat** | 🟡 YELLOW | Normal path real + persisted; streaming path IMPLEMENTED BUT NOT VERIFIED (zero callers) |
| **P0-E: Auth/Security** | ✅ GREEN (source verified) | JWT verification, user isolation, rate limiting, streaming auth parity |
| **P0-F: Persistence** | 🟡 YELLOW | Critical writes awaited + rollback; migration 035 apply status UNKNOWN |
| **Canonical Twin Identity** | ✅ GREEN (source verified) | Same seedKey + archetype through birth→presence |
| **Visual DNA** | ✅ GREEN (source verified) | 18-archetype parameter table + per-user deterministic traits |
| **Birth Continuity** | ✅ GREEN (source verified) | Canvas 2D → SVG presence, same identity math |
| **Immersive Chat Layer** | ✅ GREEN (source verified) | Layer architecture verified at source |
| **Growth** | 🔴 ORANGE | checkMicroEvolution/evolveTwin/useEvolutionTracking = zero production callers |
| **Three.js / Living Body** | 🔴 RED | NO three.js dependency — actual renderer is SVG/canvas2D/CSS |
| **World Transition** | 🟠 ORANGE | Engine real, CSS wiring broken (missing selectors), visual dead |
| **Audio Behavior** | 🟠 ORANGE | Infrastructure exists, behavior wiring absent (useSFX zero consumers) |
| **Migration 035/034 apply** | 🔵 BLOCKED | No evidence in repo that applied to production |
| **Build/Test/Lint** | 🔵 BLOCKED | Environment permission gate prevents execution in this session |
| **Live Environment** | 🔵 NOT VERIFIED | No credentials available |

**สถานะโดยรวม: NOT PASS** — มี 6 blockers ต้องปิดก่อน Production Ready claim

---

## 🧠 SELFPRINT คืออะไร

SELFPRINT เป็น **Living Intelligence experience** — ระบบ AI Twin ที่ช่วยให้ผู้ใช้เข้าใจตนเอง เรียนรู้ และเติบโต Twin AI เกิดผ่านกระบวนการ **Core Awakening** และเติบโตผ่าน 5 ขั้นตอน

**ประสบการณ์การใช้งาน** *(ตรวจสอบจาก routes ใน `src/App.tsx`):*

```
Nova (ผู้แนะนำ) → 12 มิติ / SICE analysis → Blueprint → Core Awakening
→ Twin Birth → Twin + memory/evolution → Today (living entry)
```

**5 แท็บนำทาง** *(ตรวจสอบจาก `BottomNav.tsx:89-93` + `NavRail.tsx`):*

| # | แท็บ | Route | วัตถุประสงค์ |
|---|-----|-------|-------------|
| 1 | วันนี้ (Today) | `/dashboard` | หน้าแรกที่ปรับแต่งเฉพาะบุคคล |
| 2 | โลก (Worlds) | `/worlds` | สำรวจมิติของชีวิต |
| 3 | **AI ฝาแฝด (AI Twin)** | `/chat/twin` (→ ImmersiveTwinChat) | **AI Twin chat (จุดศูนย์กลาง)** |
| 4 | สำรวจ (Explore) | `/explore` | ค้นพบตนเอง |
| 5 | ฉัน (Me) | `/me` | การควบคุมส่วนตัว |

### 🆕 Immersive V3 Visual Foundation (เพิ่ม 2026-09-11)

ชั้น visual ใหม่ทั้งระบบ — 5-layer stack, world transitions, immersive twin chat, glass surfaces

| องค์ประกอบ | รายละเอียด | ไฟล์ |
|-----------|-----------|------|
| **5-Layer Visual Stack** | World/Twin/Contextual/Primary/Temporary UI — z-index scale 0/10/20/30/40 | `immersive-layers.css` |
| **World Transitions** | 9 narrative types (attraction/pull/absorption/dissolution/flow/fold/tunnel/gravity_shift/env_wave) | `world-transitions.css` |
| **Twin State Machine** | IDLE → LISTENING → THINKING → RESPONDING → GROWING + CSS custom properties | `useTwinStates.ts` |
| **Immersive Twin Chat** | Living space replacement — Layer 0-4 composition, world drawer, decision logging | `ImmersiveTwinChat.tsx` |
| **Transition Engine** | 12 worlds × 12 = 144 transition rules → narrative type mapping | `WorldTransitionEngine.ts` |
| **Glass Surfaces** | `immersive-glass` class + `immersive-page` wrapper on WorldsHub/ExplorePage/MePage | `worlds-hub.css`, pages |

**Route Change:** `/chat/twin` → `ImmersiveTwinChat` (lazy import), TwinChat.tsx เก็บเป็น backup

### 🆕 Daily Time & Energy Dynamics (เพิ่ม 2026-09-11)

Landing Page มีชั้นคำนวณพลังงานรายวันใหม่:
- **Vedic Hora/Panchang logic** → คำนวณ Accelerated Phase, High Friction Interval, Circadian Color, Attraction Vector
- **Bio-Tracking Dashboard UI** (Oura Ring / Cyberpunk style) แสดงรายงานรายวันบน Landing Page
- **Retention Loop**: ค่า refresh อัตโนมัติทุกวัน → ผู้ใช้ bookmark กลับมาเช้าวันละครั้ง
- **SEO/AEO/GEO markup**: FAQ JSON-LD + GEO tags (TH-22 / Chanthaburi)
- **Flow**: Quick Input DOB → Daily Dynamics + Quick Summary → CTA ไป Onboarding

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| State | Zustand + TanStack React Query |
| Serverless | Cloudflare Pages Functions (`functions/`) + Supabase Edge Functions (12 deployed) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | 12 SICE engines (client-side) + OpenRouter REST API (twin/nova) |
| Payments | Stripe |
| Auth | Supabase Auth + Passkeys (WebAuthn) |
| Monitoring | Sentry |
| Deploy | Cloudflare Pages (selfprint.one) |
| Render | **SVG** (TwinPresence) + **Canvas 2D** (HologramBirth) + CSS fallbacks — **NO THREE.JS** |

> Express.js (Node) backend และ Vercel deployment ถูกลบออกแล้ว ไม่มี Node server — backend คือ Cloudflare Pages Functions + Supabase Edge Functions

---

## 🚀 Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. ตั้งค่าสภาพแวดล้อม
cp .env.example .env.local
# แก้ไข .env.local ด้วย Supabase credentials (ดู .env.example)

# 3. รัน dev server
npm run dev
# เปิด http://localhost:5173
```

### Commands (ตรวจสอบจาก package.json)

| Command | ทำอะไร |
|---------|--------|
| `npm run dev` | เริ่ม Vite dev server |
| `npm run build` | `tsc -b && vite build` — type check + production build |
| `npm test` | รัน Vitest tests ทั้งหมด |
| `npm run lint` | รัน oxlint |
| `npm run typecheck:functions` | Type-check `functions/` + `api/` (strict) |
| `npm run preview` | Preview production build |
| `npm run test:e2e` | รัน Playwright E2E tests |
| `npm run test:e2e:staging` | รัน staging E2E tests |

---

## 🏗️ Project Structure

```
src/                      # React frontend
├── components/           # UI components
│   ├── layout/           # Layout shell (AppShell, BottomNav, NavRail, NavBar)
├── pages/                # Page components (5-tab navigation)
├── services/             # Business logic (CoreAwakeningService, SICEOrchestrator, ...)
│   └── sice/engines/     # SICE engines (12 engines)
├── lib/
│   └── intelligence/     # SICE engines (the other live fork — connected via SICEBridge)
├── context/              # React Context (Auth, Language, ...)
├── hooks/                # Custom hooks
│   └── useTwinStates.ts  # Canonical Twin interaction state machine
├── styles/               # Global styles
│   ├── immersive-layers.css    # 5-layer visual stack
│   └── world-transitions.css   # Narrative transition grammar
├── types/                # TypeScript interfaces
└── App.tsx               # Root component

src/lib/visual/           # Visual utilities
└── WorldTransitionEngine.ts  # 12×12 transition rules

functions/                # Cloudflare Pages Functions — THE ONLY DEPLOYED FOLDER
├── api/
│   ├── [[route]].ts      # Catch-all → api/unified-handler.ts
│   └── unified-handler.ts# 7 API modules
└── _utils/verify-user.ts # JWT verification

supabase/
├── migrations/           # Database migrations (incl. 035_forensic_consolidation_2026-09-03.sql)
└── functions/            # 12 Supabase Edge Functions (incl. astrovera-edge)

docs/                     # Documentation
├── FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md  # Forensic audit — single source of truth
├── SELFPRINT_PROJECT_SUMMARY_TH.md             # Project summary (ภาษาไทย)
├── SELFPRINT_STATUS_HONEST_TH.md               # Honest status summary
├── MASTER_GATE_AS_IS.md                        # Master Gate AS-IS state
├── MASTER_GATE_CHANGE_MAP.md                   # Required changes
├── MASTER_GATE_EVIDENCE.md                     # Source-level evidence
├── MASTER_GATE_REMEDIATION_PLAN.md             # Remediation plan
├── Experience Architecture v2.md               # Design/experience master
└── PLAN_TRACKS_TH.md                           # Master plan: Track A / B / C

src/components/landing/   # Landing page components
├── TodayBioEnvironmentReport.tsx  # Bio-Tracking Dashboard UI
├── IntroSummary.tsx               # 3-paragraph identity article
├── QuickSummary.tsx               # 6-section card + Social Share
├── BirthDataInput.tsx             # Quick Input DOB form
└── EvolutionaryVisualSystem.tsx   # SVG animation system

CLAUDE.md                 # Permanent context / gotchas before touching code
```

---

## 🏗️ Architecture Highlights

### App Shell — Mobile-First PWA App Architecture (APPSHELL-001)

**SELFPRINT IS A MOBILE-FIRST PWA APP — NOT A RESPONSIVE WEBSITE.**

The mental model for layout is: **"mobile operating environment"**, not "desktop website responsive down to mobile".

| Principle | Detail |
|-----------|--------|
| **Primary target** | 320–430px viewport on mobile devices |
| **Tablet/desktop** | Progressive enhancements layered ON TOP of mobile base |
| **Never solve mobile by** | Shrinking desktop columns, fixed widths, negative margins, `overflow-hidden`, `scale()`, arbitrary pixel offsets |

#### AppShell Component (`src/components/layout/AppShell.tsx`)

AppShell owns ALL layout concerns:

```tsx
<AppShell>                        {/* 100dvh, overflow-x:hidden */}
  <div className="page-content">  {/* scrollable, padded */}
    {pageContent}
  </div>
  {/* BottomNav ≤1023px, NavRail ≥1024px — inside AppShell */}
</AppShell>
```

Layout responsibilities owned by AppShell:
1. **Viewport**: `min-height: 100dvh` (dynamic viewport height for mobile browser chrome)
2. **Safe area**: `env(safe-area-inset-bottom)` handled in footer padding
3. **Header**: Optional `<NavBar>` via `showHeader` + `header` props
4. **Main content**: Scrollable flex child with consistent padding (16px edges, 72px bottom for nav)
5. **Bottom navigation**: Mobile/tablet ≤1023px (controlled by BottomNav's own media query)
6. **Desktop nav rail**: Desktop ≥1024px (88px wide, controlled by NavRail's own media query)
7. **Scroll behavior**: No horizontal overflow, natural vertical scroll

#### Page Layout Rules

Every page MUST wrap content in `<AppShell>`. Pages MUST NOT:
- Import `BottomNav`, `NavRail`, `NavBar`, or `Footer` directly
- Modify `body` styles (padding, margin, etc.)
- Define their own `minHeight: 100vh` / `100dvh`
- Invent their own bottom navigation spacing

```tsx
// ✅ CORRECT
import { AppShell } from '../components/layout/AppShell';

return (
  <AppShell>
    <div className="page-content">
      {/* page-specific content only */}
    </div>
  </AppShell>
);

// ❌ WRONG
<div style={{ minHeight: '100dvh' }}>
  <NavBar />
  <div>{content}</div>
  <Footer />
  <NavRail />
  <BottomNav />
</div>
```

#### Special Cases

| Page Type | Props | Example |
|-----------|-------|---------|
| Standard app page | `<AppShell>` | Dashboard, Me, Explore |
| Public/SEO page | `<AppShell showHeader header={<NavBar />} >` | LandingPage |
| Full-screen flow | `<AppShell hideNav={true}>` | Onboarding |

---

### Immersive V3 Visual Architecture

```
Layer 0: WorldEnvironment (full-screen background, pointer-events: none)
Layer 1: Canonical Twin (center of gravity, uses useTwinStates cssVars)
Layer 2: Contextual Effects (particles, light, atmosphere)
Layer 3: Primary Controls (input + send, minimal actions)
Layer 4: Temporary UI (drawers, sheets, overlays)

z-index tokens: --layer-world:0, --layer-twin:10, --layer-contextual:20, --layer-primary:30, --layer-temporary:40
Glass tokens: --glass-bg, --glass-border, --glass-blur, --glass-surface, --glass-elevated
Transition durations: --transition-fast:150ms, --transition-base:300ms, --transition-slow:500ms, --transition-narrative:800ms
```

### API — 7 modules ผ่าน catch-all route

`functions/api/[[route]].ts` → `api/unified-handler.ts` handles exactly **7 modules**:

`notifications` · `twin-evolution` · `sice` · `stripe` · `profile` · `blueprint` · `share`

Anything else returns a JSON 404. Note `twin.ts` and `nova.ts` have their own dedicated functions.

### SICE — 12 Selfprint Intelligence Core Engines

Client-side, rule-based intelligence engines (PersonalContextBuilder, PatternDetector, InsightEngine, TwinStateEngine, MemoryManagerEngine, DecisionIntelligenceEngineAdapter, ...), orchestrated by `SICEOrchestrator`.

> **⚠️ Two live SICE forks** — Do NOT delete either
> `src/lib/intelligence/*` และ `src/services/sice/engines/*` เป็น **two separate live implementations**, connected one-way via `SICEBridge.ts`.

### i18n pattern

Internationalization ทำด้วย **inline `isTh ? ... : ...`** (~958 จุด) รวมกับ `useLanguage` / `TRANSLATIONS` / `t(` (~1607 จุด) สองระบบทับซ้อนกัน

### Database gotchas (verified)

- `personal_context` (singular) ≠ `personal_contexts` (plural) — **different tables**
- `selfprint.users_profiles.id` เป็น **surrogate key**, ไม่ใช่ auth uid — ต้อง query เสมอ กับ `.eq('user_id', ...)`

---

## 📚 Trusted Documentation

เอกสารที่เชื่อถือได้:

| เอกสาร | วัตถุประสงค์ |
|--------|------------|
| [`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](../FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md) | **เอกสารหลักสถานะเดียว** — ผลการตรวจสอบ forensic รายละเอียดครบ |
| [`MASTER_GATE_AS_IS.md`](../MASTER_GATE_AS_IS.md) | Master Gate AS-IS state document |
| [`MASTER_GATE_EVIDENCE.md`](../MASTER_GATE_EVIDENCE.md) | Source-level evidence for all gates |
| [`MASTER_GATE_REMEDIATION_PLAN.md`](../MASTER_GATE_REMEDIATION_PLAN.md) | Required remediation steps |
| [`docs/SELFPRINT_PROJECT_SUMMARY_TH.md`](./docs/SELFPRINT_PROJECT_SUMMARY_TH.md) | สรุปโปรเจคฉบับภาษาไทย |
| [`docs/SELFPRINT_STATUS_HONEST_TH.md`](./docs/SELFPRINT_STATUS_HONEST_TH.md) | สรุปสถานะซื่อสัตย์ (ภาษาไทย) |
| [`docs/PLAN_TRACKS_TH.md`](./docs/PLAN_TRACKS_TH.md) | แผนงานรวม 3 Track (A=bugs / B=Phase 0 forensic / C=visual redesign) |
| [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](./docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md) | ผลตรวจ Phase 0 visual + performance forensic |
| [`docs/Experience Architecture v2.md`](./docs/Experience%20Architecture%20v2.md) | **Design master ของ Track C** — RECOMPOSE not REBUILD |

---

## ⚠️ Known Blockers (Forensic Audit 2026-09-11)

**MASTER GATE = NOT PASS** — กblocks ที่ต้องปิด:

1. **Growth pipeline ไม่ถูก wire** — conversation → growth → visual change loop ตัด
2. **Three.js gate ไม่ผ่าน** — rendering ใช้ SVG/canvas2D/CSS แทน WebGL
3. **World Transition CSS wiring ตัด** — engine real แต่ visual dead
4. **Migration 035/034 apply status UNKNOWN** — Twin birth อาจ fail ถ้าไม่ apply
5. **Streaming path zero callers** — implemented but not wired into UI
6. **Build/Test/Lint ไม่ได้ execute** — environment gate blocks execution

รายละเอียดเต็ม: ดู `MASTER_GATE_REMEDIATION_PLAN.md`

---

## 📞 Links

- **GitHub:** https://github.com/duriankab-dot/selfprint-v3-react
- **Production:** https://selfprint.one
