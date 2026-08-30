# Memory

## Me
**jb_DEV** (Durian Kab). Senior dev + entrepreneur. Solo SELFPRINT V3 developer. Code-first, ecosystem thinking, production-focused.

## Terms
| Term | Meaning |
|------|---------|
| **SELFPRINT** | Personal Intelligence Platform |
| **V3** | Current production version |
| **AI Dev** | Coding agent (Claude) for implementation |
| **PRD** | Product Requirements Document |
| **Master Directive** | Authoritative project instructions |
| **Master Handoff** | Current status & next priorities |
| **Production Ready** | Fully tested, secured, documented, deployable |
| **GAP Matrix** | Implementation vs production gap tracking |
| **E2E** | End-to-end testing (Playwright) |
| **FBS** | Feedback Service (data persistence) ✅ P1 complete |
| **P0 / P1 / P2** | Priority levels (P0 = drop everything) |
| **Edge** | Edge Functions / API layer |
| **DB** | Database layer |
| **UX/UI** | User experience & interface |
| **API** | Application programming interface |

## Projects
| Name | Status |
|------|--------|
| **SELFPRINT V3** | Production - P1 ✅, P2 ✅, P3 CVE + .npmrc ⏳, P4-6 blocked |

## Active Workflows
```
GitHub audit → GAP Matrix → AI Dev handoff → 
Implementation → Production verify → Documentation
```

## Commands (Most Used)
```
npm test              # Run vitest suite
npm run build         # TypeScript build + type check
npm run lint          # ESLint + format check
npm run dev           # Local dev server
npm audit             # Security check
```

## Preferences
- **Async-first** communication
- **Concise** answers in Thai
- **Code-first** thinking
- Current repo state = source of truth
- Separate facts / gaps / recommendations / completed
- Actionable implementation instructions + acceptance criteria
- Production completeness over theory
- No cached assumptions—verify actual state first

## Tech Stack
- Frontend: React 18, TypeScript, Tailwind CSS
- Backend: Node.js APIs, Edge Functions
- Testing: Vitest, Playwright (E2E)
- Tools: GitHub, npm, Docker
- DB: PostgreSQL (or current setup)

## Session 2 Status
**Priority 1:** ✅ Data Persistence (FBS) — Complete
**Priority 2:** ✅ Test Stabilization — testTimeout fixed, FeedbackService 11/11 passing  
**Priority 3:** ✅ Security CVEs Assessment — 10 CVEs ACCEPTED (transitive devDeps, not exploitable in production)
**Priority 4:** ⏸️ Linting DEFERRED — 219 warnings, 0 errors (verified 30 ส.ค. 2026 via oxlint, 550 files), not blocking build.
**Priority 5:** ✅ E2E Tests — CI #157 green, SK-01 updated for story-mode landing
**Priority 6:** ✅ Documentation — CLAUDE.md updated (this entry)

## Session 3 Status (Phase A Completion)

### Completed This Session
- ✅ LandingPage.tsx — 3-screen story mode (NOVA reveal, fullscreen narrative)
- ✅ NovaEyeSvg — animated CSS scanner eye
- ✅ CI fix — GitHub Actions Node 20→22 (asamuzakjp/css-color compat)
- ✅ .gitignore — test-results/, playwright-report/ added
- ✅ E2E smoke SK-01 — updated CTA selectors for story-mode landing
- ✅ CI k6 load tests — disabled on push (was consuming Edge Request quota)
- ✅ WOW2 FullAnalysis.tsx — revelation UX ("ค้นพบตัวเอง" moment, 3-phase)
- ✅ subscription→500 — diagnosed as Vercel cold-start 504 (infra, not code)
- ✅ WOW3 animations — HolographicBirth + ParticleFormation already real Three.js

### Architecture Locked (Phase A → B)
```
Landing (3 screens) → CREATE SELFPRINT → APP MODE
→ Emotion → NOVA → Birth Data → Blueprint → FineTuning
→ FullAnalysis (WOW2 ✅) → CoreAwakening → WOW3/TwinBirth ✅
→ LIVING SELFPRINT → Phase B: Community
```

### Infra: Vercel → Cloudflare Migration — ✅ DONE (corrected 30 ส.ค. 2026)
- Vercel paused: Edge Requests 2.8M/1M (k6 CI was hammering production)
- k6 disabled on push — only manual workflow_dispatch now
- **CF Pages deploy: ✅ LIVE** — selfprint.one running on Cloudflare Pages,
  auto-deploy from `master` confirmed working
- **CF Pages Functions: ✅ PORTED** — `functions/api/{nova,twin,og}.ts` +
  `functions/api/[[route]].ts` (catch-all → `api/unified-handler.ts`, which
  is fetch-style and does NOT use `@vercel/node` — that earlier note was
  wrong, unified-handler.ts never needed the rewrite it was assumed to need)
- `api/nova.ts`, `api/twin.ts`, `api/og.ts` (old Vercel format) kept
  intentionally — still wired in `vercel.json` `functions` block as a
  rollback path, not dead code, do not delete without a business decision
- `src/pages/api/nova.ts` (Next.js-style, zero routing, 100% unreferenced)
  — removed 30 ส.ค. 2026, was genuinely dead
- **Known gap**: `api/metrics.ts` has no `functions/api/metrics.ts`
  counterpart — `PerformanceMonitor.ts` POSTs to `/api/metrics` and gets
  404 on CF Pages right now. Metrics are not being collected. Needs a
  decision: port it or retire the feature. (P1, not yet fixed)

---
Full glossary and deep context: `memory/`
