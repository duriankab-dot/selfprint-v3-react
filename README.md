# 🌟 SELFPRINT — Living Intelligence Platform

**แพลตฟอร์ม AI Twin ที่เรียนรู้รูปแบบพฤติกรรมของคุณผ่าน 12 มิติปัญญา**  
*(An AI-powered "living Twin awakening" system for self-understanding, learning, and growth.)*

---

> **สถานะการผลิต:** `MASTER GATE — FULL PASS` ✅  
> **Verification Closure:** 2026-09-12 — All gates closed · Build/Lint/Typecheck/Unit tests pass · E2E 76/76 pass · Browser verified

---

## 📊 สถานะการผลิต

| พื้นที่ | สถานะ | หลักฐาน |
|--------|--------|---------|
| **P0-A: 12 Sciences** | ✅ GREEN | ทุก engine มี implementation, registration, execution, output flow |
| **P0-B: SICE Orchestration** | ✅ GREEN | Parallel execution, completionStatus, persistence awaited |
| **P0-C: Awakening/Twin** | ✅ GREEN | Atomic twin creation, compensating rollback, orphan prevention |
| **P0-D: TwinChat** | ✅ GREEN | Streaming path wired with fallback |
| **P0-E: Auth/Security** | ✅ GREEN | JWT verification, user isolation, rate limiting |
| **P0-F: Persistence** | ✅ GREEN | Critical writes awaited + rollback; migration 035 applied |
| **Canonical Twin Identity** | ✅ GREEN | Same seedKey + archetype through birth→presence |
| **Visual DNA** | ✅ GREEN | 18-archetype parameter table + per-user deterministic traits |
| **Birth Continuity** | ✅ GREEN | Canvas 2D → SVG presence, same identity math |
| **Immersive Chat Layer** | ✅ GREEN | Layer architecture verified at source |
| **Growth** | ✅ GREEN | recordInteraction() wired into ImmersiveTwinChat |
| **Three.js / Living Body** | ✅ GREEN | Browser verified — canvas + WebGL active |
| **Intelligent World** | ✅ GREEN | Browser verified — transitions + recommendations |
| **World Transition** | ✅ GREEN | CSS rules mapping 9 transition types to @keyframes |
| **Audio Behavior** | ✅ GREEN | useSFX consumed in ImmersiveTwinChat |
| **Migration 035/034** | ✅ APPLIED | Applied via Supabase Dashboard SQL Editor |
| **Build** | ✅ PASS | `npm run build` — 612 modules, 0 errors |
| **Typecheck** | ✅ PASS | `npm run typecheck:functions` — 0 errors |
| **Lint** | ⚠️ WARNINGS | `npm run lint` — 95 warnings, 0 errors |
| **Unit Tests** | ✅ PASS | `npm test` — 1042 tests, 67 files |
| **E2E Phase A (Production)** | ✅ 27/27 passed | Production smoke tests |
| **E2E Phase B (Staging)** | ✅ 49/49 passed | Auth injection fixed |
| **E2E Master Gate** | ✅ 12/12 passed | All structural tests pass |
| **Browser Three.js** | ✅ PASSED | Canvas + WebGL verified |
| **Browser Intelligent World** | ✅ PASSED | Transitions + recommendations verified |

**สถานะโดยรวม: FULL PASS** ✅ — ทุก gate ผ่านแล้ว

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
|---|------|-------|-------------|
| 1 | 🌅 Today | `/en/` | Living entry, daily brief |
| 2 |  Explore | `/en/explore` | 12 Worlds visualization |
| 3 | 💬 Chat | `/en/chat/twin` | Twin conversation |
| 4 | 📊 Dashboard | `/en/dashboard` | Analytics, decisions |
| 5 |  Menu | `/en/menu` | Settings, features |

---

## 🏗️ Architecture

```
src/
├── App.tsx                        # Router + Provider stack (lazy)
├── context/
│   ├── AuthContext.tsx            # JWT auth + session management
│   ├── AIContext.tsx              # AI/Twin intelligence
│   ├── HubContext.tsx             # Intelligence hub
│   ├── WorldContext.tsx           # World state management
│   └── ...
├── hooks/
│   ├── useWorldRecommendation.ts  # SICE-driven world decision
│   ├── useEvolutionTracking.ts    # Growth pipeline
│   └── ...
├── pages/
│   ├── Dashboard.tsx              # [data-testid="dashboard-container"]
│   ├── ImmersiveTwinChat.tsx      # Chat + Three.js + World transition
│   ├── CoreAwakening.tsx          # Birth flow
│   └── ...
├── components/
│   ├── twin/
│   │   ├── TwinThreeRenderer.tsx  # Three.js Living Body
│   │   └── Twin.tsx               # SVG + Three.js hybrid
│   ├── audio/SFXProvider.tsx      # Sound effects
│   └── ...
├── services/
│   ├── SICEOrchestratorImpl.ts    # 12 science engines
│   ├── TwinAPIService.ts          # Streaming chat
│   └── ...
├── lib/supabase/
│   ├── client-lazy.ts             # Lazy Supabase SDK init
│   └── client-registry.ts         # Shared client singleton
└── styles/
    └── world-transitions.css      # 9 transition type animations
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase project (staging: `vkjwqrjflxztcctmyzgh`)

### Install

```bash
cd D:\selfprint-v3-react
npm install
```

### Environment Variables

Copy `.env.e2e.staging` (or create `.env.development`):

```bash
VITE_SUPABASE_URL=https://vkjwqrjflxztcctmyzgh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Jp7LeZ3uErioSeGN3K9uqw_R2jcp9Ov
```

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Tests

```bash
# Unit tests
npm test

# Production E2E (no auth)
npx playwright test --project=chromium

# Staging E2E (requires auth + seeded DB)
npx playwright test --project=chromium-staging
```

---

## 🧪 Test Coverage

### Unit Tests (vitest)

```
1042 tests, 67 files — ALL PASS
```

### E2E Tests (Playwright)

| Suite | Scope | Result |
|-------|-------|--------|
| `smoke.spec.ts` | Production landing, login, OG | 12/12 ✅ |
| `auth.spec.ts` | Production auth flows | 7/7 ✅ |
| `critical-journey.spec.ts` | Critical user journeys | 8/8 ✅ |
| `lifecycle.spec.ts` | Staging lifecycle (public pages) | 15/15 ✅ |
| `master-gate.spec.ts` | Staging new features | 12/12 ✅ |
| `twin.spec.ts` | Staging Twin creation | 5/5 ✅ |
| `decision.spec.ts` | Staging decisions | 5/5 ✅ |
| `upload.spec.ts` | Staging uploads | 5/5 ✅ |
| `world-visual.spec.ts` | Staging worlds | 7/7 ✅ |

**Total:** 76/76 E2E tests pass ✅

---

## 🔧 Recent Changes (2026-09-12)

| File | Change | Purpose |
|------|--------|---------|
| `e2e/global-setup.ts` | Added reload + waitForFunction after localStorage injection | Fix auth injection — trigger Supabase session re-check |
| `e2e/global-setup.ts` | Rewrote: REST API login | Support new Supabase short-form keys (`sb_publishable_*`) |
| `FINAL_TEST_CLOSURE_REPORT.md` | Updated | FULL PASS status |
| `MASTER_GATE_AS_IS.md` | Updated | FULL PASS status |
| `README.md` | Updated | Current status |

---

## 📄 License

SELFPRINT — Living Intelligence Platform
