# 🌟 SELFPRINT V3 — Personal Intelligence Platform

**AI-powered "living Twin awakening" system** สำหรับการเข้าใจตัวเอง เรียนรู้ และเติบโต
*(A system for self-understanding, learning, and growth.)*

> ⚠️ **สถานะจริง (honest status):** Build / test / lint ผ่านทั้งหมด — พร้อมเข้าสู่ **Track C (UX/UI improvement)**
> แต่ **ยังไม่ใช่ "100% product-verified"** — ดู [Known Limitations / Not Yet Done](#known-limitations--not-yet-done)
> เอกสารสถานะฉบับเดียวที่ถูกต้อง: [`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](./FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md)

---

## 📊 Status (measured 6 Sep 2026 · HEAD `da855c5`)

| Gate | Result |
|------|--------|
| `tsc -b` (`strict: true`) | ✅ 0 errors (HEAD da855c5 verified 6 Sep 2026) |
| `npm run typecheck:functions` | ✅ 0 errors |
| `vite build` | ⚠️ Windows-native binary required (rolldown); Windows build HEAD 3fa100a ✅ · dist/ stale |
| `oxlint` | ⚠️ Windows-native binary required (oxlint) |
| `vitest run` | ⚠️ Windows-native binary required (vitest/rolldown) |

**Honest conclusion:** Track B (Phase 0 forensic) + C0 (Track C enablers) are complete in code, and the Track A work that was blocking UX/UI is done. **A1 and A7 are now closed:** A1 (dead code — 6 orphan files deleted 6 Sep) · A7 (`as any` — 47 casts remaining after batch fixes) · Track C is unblocked. The project is **ready to enter Track C (visual redesign)** — but it is **NOT yet "100% product-verified"**. Four conditions remain before that claim can be made (see [Known Limitations](#known-limitations--not-yet-done)).

---

## 🧠 What is SELFPRINT V3?

SELFPRINT V3 is a **Living Intelligence experience** — an AI-powered "living Twin awakening" system that helps users understand themselves, learn, and grow. The AI Twin is born through the **Core Awakening** flow and grows with the user through 5 growth stages.

> **Core promise:** *"Understand yourself. Meet your Twin. Keep evolving."*
> *(ตรงกับ §1–2 ของ `docs/Experience Architecture v2.md` — SELFPRINT ไม่ใช่ AI chatbot / ไม่ใช่ astrology app / ไม่ใช่ dashboard แต่เป็น Living Intelligence experience)*

**5-tab navigation** *(verified from `BottomNav.tsx:89-93` + `NavRail.tsx:73-77`):*

| # | Tab | Route | Purpose |
|---|-----|-------|---------|
| 1 | วันนี้ (Today) | `/dashboard` | Dynamic personal home |
| 2 | โลก (Worlds) | `/worlds` | Explore dimensions of life |
| 3 | **AI ฝาแฝด (AI Twin)** | `/chat/twin` | **AI Twin chat (center / focal point)** |
| 4 | สำรวจ (Explore) | `/explore` | Discover yourself |
| 5 | ฉัน (Me) | `/me` | Personal control |

> **Note:** **Worlds IS a top-level tab** (per `BottomNav.tsx:6` comment "รวมกิจกรรมเดิม"). **Activities is NOT a tab** — the `/activities` route still exists (`App.tsx:170`) but is orphaned from navigation; **Activities is now a section of Explore**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| State | Zustand + TanStack React Query |
| Serverless | Cloudflare Pages Functions (`functions/` — the **only** deployed folder) + Supabase Edge Functions (12 functions in repo; deploy status unverified) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | 12 SICE (Selfprint Intelligence Core Engines — client-side, rule-based) + Claude API (Nova guide + AI Twin) |
| Payments | Stripe |
| Auth | Supabase Auth + Passkeys (WebAuthn) |
| Monitoring | Sentry |
| Deploy | Cloudflare Pages (selfprint.one) — **Vercel fully removed** |

> **Note:** The Express.js (Node) backend and Vercel deployment were **removed** from the project. There is no Node server — the backend is Cloudflare Pages Functions + Supabase Edge Functions.

---

## 🚀 Quick Start

```bash
# 1. Install
npm ci

# 2. Environment
cp .env.example .env.local
# Edit .env.local with Supabase credentials (see .env.example)

# 3. Run dev server
npm run dev
# Open http://localhost:5173
```

### Commands (verified against package.json)

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | `tsc -b && vite build` — type check + production build |
| `npm test` | Run all Vitest tests (`vitest run`) |
| `npm run lint` | Run oxlint |
| `npm run typecheck:functions` | Type-check `functions/` + `api/` (strict) |
| `npm run preview` | Preview the production build |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:staging` | Run staging E2E tests |

> ⚠️ If build/test fails with a **bus error**, native binaries were not fully installed (interrupted `npm install`). Check `@rolldown/binding-*` (~19.9 MB), `lightningcss-*` (~10 MB), `@oxlint/binding-*` (~16 MB). If much smaller, run `rm -rf node_modules && npm install` again.

---

## 🏗️ Project Structure

```
src/                      # React frontend
├── components/           # UI components
├── pages/                # Page components (5-tab navigation)
├── services/             # Business logic (CoreAwakeningService, SICEOrchestrator, ...)
│   └── sice/engines/     # SICE engines (one of two live forks)
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
├── Experience Architecture v2.md  # Design/experience master for Track C (RECOMPOSE not REBUILD)
├── Experience Architecture v2/    # Track C working docs (e.g. TRACK_C_VISUAL_REDESIGN_TH.md)
├── PLAN_TRACKS_TH.md     # Master plan: Track A (bugs) / B (Phase 0 forensic) / C (visual redesign)
└── PHASE0_VISUAL_PERF_FORENSIC_TH.md  # Phase 0 forensic results (read before Track C)

CLAUDE.md                 # Permanent context / gotchas before touching code
FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md  # THE single source of truth for status
```

---

## 🧩 Architecture Highlights

### API — 7 modules via catch-all route

`functions/api/[[route]].ts` → `api/unified-handler.ts` handles exactly **7 modules**:

`notifications` · `twin-evolution` · `sice` · `stripe` · `profile` · `blueprint` · `share`

Anything else returns a JSON 404 (no fallback to `index.html`).

### SICE — 12 Selfprint Intelligence Core Engines

Client-side, rule-based intelligence engines (PersonalContextBuilder, PatternDetector, InsightEngine, TwinStateEngine, MemoryManager, DecisionIntelligenceEngine, ...), orchestrated by `SICEOrchestrator`.

### ⚠️ Two live SICE forks — do NOT delete either

`src/lib/intelligence/*` and `src/services/sice/engines/*` are **two separate live implementations**, connected one-way via `SICEBridge.ts`. They are NOT duplicates — deleting either breaks the system.

### i18n pattern

Internationalization is done with **inline `isTh ? ... : ...`** (958 points) plus `useLanguage` / `TRANSLATIONS` / `t(` (1607 points). Two systems currently overlap — Track C will decide.

### Database gotchas (verified)

- `personal_context` (singular) ≠ `personal_contexts` (plural) — **different tables**
- `selfprint.users_profiles.id` is a **surrogate key**, not the auth uid — always query with `.eq('user_id', ...)`

---

## 📚 Trusted Documentation

Only these documents are trustworthy. The 84 root `.md` files that lied were deleted.

| Document | Purpose |
|----------|---------|
| [`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](./FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md) | **Single source of truth** — real project status (round 3, 5 Sep 2026) |
| [`docs/Experience Architecture v2.md`](./docs/Experience%20Architecture%20v2.md) | **Design/experience master document for Track C** — RECOMPOSE not REBUILD · core promise · App Shell · P0/P1/P2 matrix · §44 safety rule |
| [`docs/PLAN_TRACKS_TH.md`](./docs/PLAN_TRACKS_TH.md) | Master plan: Track A (engineering backlog) / B (Phase 0 forensic) / C (visual redesign) |
| [`CLAUDE.md`](./CLAUDE.md) | Permanent context + gotchas before touching code |
| [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](./docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md) | Phase 0 visual + performance forensic results — **must read before Track C** |

---

## ⚠️ Known Limitations / Not Yet Done

### 3 conditions before "100% product-verified" can be claimed

~~Apply migration 035~~ ✅ **done** (verified Supabase SQL Editor 5 Sep 2026)

1. **Deploy Edge Functions** — SEC-02 fixes (`send-push`, `daily-brief`, `pattern-detect` JWT enforcement) coded but **not deployed** (12 functions in repo; verify Supabase dashboard).
2. **Fix/decide passkey flow** — broken: `AuthContext.tsx:130` never calls `supabase.auth.setSession()`, `PasskeyProvider.ts:144` calls 4 non-existent Edge Functions.
3. **Decide voice route** — `VoiceChat.tsx:80` is a mock wired into the real `/voice` production route.

### Known stubs / mocks / placeholders

| File:line | What's fake |
|-----------|-------------|
| `VoiceChat.tsx:80` | Mock AI response (wired into real `/voice` route) |
| `VoiceInput.tsx:38` | Mock speech recognition |
| `VoiceOutput.tsx:34` | Mock TTS |
| `SentryService.ts:15` | `MockSentry` class (orphan — delete candidate; A1 closed but this remains) |
| `CommunityPage.tsx:397` | "Coming soon" |
| `ExplorePage.tsx:728,898` | Stub cards |
| `DecisionDashboard.tsx:126` | Placeholder "Phase F Dashboard" |
| `structuredData.ts:21` | Fake phone fallback |
| `public/soundscape-manifest.json` | 23 broken `CLOUDINARY_URL`s; `public/audio/` missing |

---

## 📞 Links

- **GitHub:** https://github.com/duriankab-dot/selfprint-v3-react
- **Production:** https://selfprint.one
- **Contributing:** see [`CONTRIBUTING.md`](./CONTRIBUTING.md)

**Last verified:** 6 September 2026 · HEAD `da855c5`
