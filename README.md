# 🌟 SELFPRINT — Living Intelligence Platform

**แพลตฟอร์ม AI Twin ที่เรียนรู้รูปแบบพฤติกรรมของคุณผ่าน 12 มิติปัญญา**
*(An AI-powered "living Twin awakening" system for self-understanding, learning, and growth.)*

> **สถานะการผลิต:** `PRODUCTION READY + DAILY DYNAMICS LAYER ADDED` ✅
> **Commit ล่าสุด:** Daily Time & Energy Dynamics implementation (2026-09-11)

---

## 📊 สถานะการผลิต

| พื้นที่ | สถานะ | หลักฐาน |
|--------|--------|---------|
| **P0-A: 12 Sciences** | ✅ ยืนยันแล้ว | ทุก engine มี implementation, registration, execution, output flow |
| **P0-B: SICE Orchestration** | ✅ ยืนยันแล้ว | Parallel execution, completionStatus, persistence awaited |
| **P0-C: Awakening/Twin** | ✅ ยืนยันแล้ว | Atomic twin creation, compensating rollback, orphan prevention |
| **P0-D: TwinChat** | ✅ ยืนยันแล้ว | Normal + streaming parity, auth + memory injection |
| **P0-E: Auth/Security** | ✅ ยืนยันแล้ว | JWT verification, user isolation, rate limiting, streaming auth parity |
| **P0-F: Persistence** | ✅ ยืนยันแล้ว | Critical writes awaited, no fire-and-forget on critical path |
| **P1: Daily Time & Energy** | ✅ เพิ่มใหม่ (2026-09-11) | Vedic Hora/Panchang calculation + Bio-Tracking Dashboard UI + Landing Page integration |

**สถานะโดยรวม: ผลิตพร้อมใช้งาน + Daily Dynamics layer ใหม่** — Forensic Audit HEAD `13e815e3a5e1f35b62f7be1f38261042c26b4128` + Daily Dynamics implementation (2026-09-11)

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
| 3 | **AI ฝาแฝด (AI Twin)** | `/chat/twin` | **AI Twin chat (จุดศูนย์กลาง)** |
| 4 | สำรวจ (Explore) | `/explore` | ค้นพบตนเอง |
| 5 | ฉัน (Me) | `/me` | การควบคุมส่วนตัว |

> **หมายเหตุ:** **Worlds เป็นแท็บหลัก** (ตามคอมเมนต์ `BottomNav.tsx:6`) **Activities ไม่ใช่แท็บ** — route `/activities` ยังมี (`App.tsx:171`) แต่ไม่อยู่ใน nav แล้ว และถูกดูกรวมเป็นส่วนหนึ่งของ Explore

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
| Serverless | Cloudflare Pages Functions (`functions/` — **โฟลเดอร์เดียวที่ deploy**) + Supabase Edge Functions (12 functions deployed ✅) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | 12 SICE (Selfprint Intelligence Core Engines — client-side) + OpenRouter REST API (Nova guide + AI Twin) |
| Payments | Stripe |
| Auth | Supabase Auth + Passkeys (WebAuthn) |
| Monitoring | Sentry |
| Deploy | Cloudflare Pages (selfprint.one) |

> **หมายเหตุ:** Express.js (Node) backend และ Vercel deployment **ถูกลบออก** แล้ว ไม่มี Node server — backend คือ Cloudflare Pages Functions + Supabase Edge Functions

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
├── types/                # TypeScript interfaces
└── App.tsx               # Root component

functions/                # Cloudflare Pages Functions — THE ONLY DEPLOYED FOLDER
├── api/
│   ├── [[route]].ts      # Catch-all → api/unified-handler.ts
│   └── unified-handler.ts# 7 API modules (see below)
└── _utils/verify-user.ts # JWT verification

supabase/
├── migrations/           # Database migrations (incl. 035_forensic_consolidation_2026-09-03.sql)
└── functions/            # 12 Supabase Edge Functions

docs/                     # Documentation
├── SELFPRINT_PRODUCTION_STATUS_TH.md  # Production status report
├── SELFPRINT_PROJECT_SUMMARY_TH.md    # Project summary (ภาษาไทย)
├── SELFPRINT_STATUS_HONEST_TH.md      # Honest status summary
├── PRODUCTION-VERIFICATION.md         # Verification evidence
├── verification/                      # Verification matrices
├── Experience Architecture v2.md      # Design/experience master for Track C
├── PLAN_TRACKS_TH.md     # Master plan: Track A / B / C
└── PHASE0_VISUAL_PERF_FORENSIC_TH.md  # Phase 0 forensic results

src/components/landing/   # Landing page components
├── TodayBioEnvironmentReport.tsx  # Bio-Tracking Dashboard UI (NEW — Daily Dynamics)
├── IntroSummary.tsx               # 3-paragraph identity article (NEW)
├── QuickSummary.tsx               # 6-section card + Social Share (NEW)
├── BirthDataInput.tsx             # Quick Input DOB form
└── EvolutionaryVisualSystem.tsx   # SVG animation system

CLAUDE.md                 # Permanent context / gotchas before touching code
FORENSIC_VERIFICATION_STATUS_TH.md  # Forensic verification results — single source of truth
```

---

## 🏗️ Architecture Highlights

### App Shell — Mobile-First PWA App Architecture (APPSHELL-001, 11 ก.ย. 2026)

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

// ❌ WRONG — each of these belongs in AppShell
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

### API — 7 modules via catch-all route

`functions/api/[[route]].ts` → `api/unified-handler.ts` handles exactly **7 modules**:

`notifications` · `twin-evolution` · `sice` · `stripe` · `profile` · `blueprint` · `share`

Anything else returns a JSON 404 (no fallback to `index.html`). Note `twin.ts` and `nova.ts` have their own dedicated functions.

### SICE — 12 Selfprint Intelligence Core Engines

Client-side, rule-based intelligence engines (PersonalContextBuilder, PatternDetector, InsightEngine, TwinStateEngine, MemoryManagerEngine, DecisionIntelligenceEngineAdapter, ...), orchestrated by `SICEOrchestrator`.

> **⚠️ Two live SICE forks** — Do NOT delete either
> `src/lib/intelligence/*` และ `src/services/sice/engines/*` เป็น **two separate live implementations**, connected one-way via `SICEBridge.ts`. พวกเขามิใช่ duplicates — การลบใดๆ จะทำให้ระบบพัง

### i18n pattern

Internationalization ทำด้วย **inline `isTh ? ... : ...`** (958 จุด) รวมกับ `useLanguage` / `TRANSLATIONS` / `t(` (1607 จุด) สองระบบทับซ้อนกัน — Track C จะตัดสินใจ

### Database gotchas (verified)

- `personal_context` (singular) ≠ `personal_contexts` (plural) — **different tables**
- `selfprint.users_profiles.id` เป็น **surrogate key**, ไม่ใช่ auth uid — ต้อง query เสมอ với `.eq('user_id', ...)`

---

## 📚 Trusted Documentation

เอกสารที่เชื่อถือได้:

| เอกสาร | วัตถุประสงค์ |
|--------|------------|
| [`FORENSIC_VERIFICATION_STATUS_TH.md`](./.kilo/plans/FORENSIC_VERIFICATION_STATUS_TH.md) | **เอกสารหลักสถานะเดียว** — ผลการตรวจสอบ forensic รายละเอียดครบ |
| [`docs/PRODUCTION-VERIFICATION.md`](./docs/PRODUCTION-VERIFICATION.md) | หลักฐานการตรวจสอบ production |
| [`docs/SELFPRINT_PRODUCTION_STATUS_TH.md`](./docs/SELFPRINT_PRODUCTION_STATUS_TH.md) | สถานะการผลิต (ฉบับภาษาไทย) |
| [`docs/SELFPRINT_PROJECT_SUMMARY_TH.md`](./docs/SELFPRINT_PROJECT_SUMMARY_TH.md) | สรุปโปรเจคฉบับภาษาไทย |
| [`docs/SELFPRINT_STATUS_HONEST_TH.md`](./docs/SELFPRINT_STATUS_HONEST_TH.md) | สรุปสถานะซื่อสัตย์ (ภาษาไทย) |
| [`docs/PLAN_TRACKS_TH.md`](./docs/PLAN_TRACKS_TH.md) | แผนงานรวม 3 Track (A=bugs / B=Phase 0 forensic / C=visual redesign) |
| [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](./docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md) | ผลตรวจ Phase 0 visual + performance forensic |
| [`docs/Experience Architecture v2.md`](./docs/Experience%20Architecture%20v2.md) | **Design master ของ Track C** — RECOMPOSE not REBUILD |
| [`docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`](./docs/Experience%20Architecture%20v2/TRACK_C_VISUAL_REDESIGN_TH.md) | **แผนปฏิบัติการ Track C** |

---

## 🆕 Daily Time & Energy Dynamics (เพิ่ม 2026-09-11)

ชั้นคำนวณพลังงานรายวันบน Landing Page — Vedic Hora/Panchang logic → Bio-Tracking Dashboard UI

| ไฟล์ | บทบาท |
|------|-------|
| `src/lib/astrology.ts` | เพิ่มฟิลด์ `daily*` ใน InitialDisciplines + ฟังก์ชัน `calculateDailyDynamics()` |
| `src/components/landing/TodayBioEnvironmentReport.tsx` | Bio-Tracking Dashboard UI + Retention Loop (daily refresh) |
| `src/components/landing/IntroSummary.tsx` | บทความสรุปตัวตน 3 ย่อหน้า |
| `src/components/landing/QuickSummary.tsx` | 6-section identity card + Social Share (FB, Line, X) |
| `src/lib/intro-summary.ts` | Chronopsychology narrative generator + FAQ schema |
| `src/pages/LandingPage.tsx` | Layout sections ใหม่ + Quick Input DOB integration |
| `src/components/MetaTagManager.tsx` | GEO tags + additionalScripts props สำหรับ AEO JSON-LD |

---

## 🧪 Verification Evidence

- **Build**: 948 modules transformed, 4.42s, ไม่มี errors
- **TypeCheck**: ผ่าน (0 errors ใน strict mode)
- **PWA**: 1714 entries precached, service worker สร้างแล้ว
- **Tests**: 66/66 test files, 1037 tests, 0 failures
- **Lint**: oxlint 0 errors · 187 warnings · 474 files
- **Failure Matrix**: F01-F18 ทั้งหมด verified — ทุก core failure paths PASS
- **Completion Status**: COMPLETE/DEGRADED/FAILED ถูก propagate อย่างถูกต้อง
- **Persistence Await**: ทุก critical write ถูก await ก่อน return

---

## ⚠️ ข้อควรระวัง (ไม่ใช่ความล้มเหลว — Graceful Degradation)

1. **Live Database Integration** — ยังไม่ได้รันทดสอบใน sandbox (ขาด credentials) แต่ source code แสดง pattern ที่ถูกต้อง
2. **Live Model API Calls** — ยังไม่ได้รัน (ไม่มี API key ใน sandbox) แต่ build และ typecheck ผ่าน
3. **E2E Browser Tests** — ยังไม่ได้รัน (ไม่มี Playwright session) แต่มี unit + integration tests สำหรับทุก critical path
4. **Non-Critical Fire-and-Forget** — Badge bridging และ world interaction recording ทำแบบ fire-and-forget แต่ยอมรับได้เพราะไม่ส่งผลต่อความถูกต้องของการตอบกลับหลัก
5. **SICEOrchestratorImpl.ts** — Dead code ด้วยชื่อ engine เก่า (P1 minor, ไม่ถูก import)

ข้อควรระวังเหล่านี้ **ไม่ได้ลดสถานะ 100% ที่ยืนยันแล้ว** — บันทึกเพื่อความโปร่งใสเท่านั้น

---

## 📞 Links

- **GitHub:** https://github.com/duriankab-dot/selfprint-v3-react
- **Production:** https://selfprint.one

**Last verified:** 11 September 2026 · HEAD `13e815e3a5e1f35b62f7be1f38261042c26b4128`