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
| **SELFPRINT V3** | Production - P1 Data Persistence ✅, P2-6 in progress |

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
  - @vercel/node@5.10.1 required for api/unified-handler.ts
  - All CVEs are build/dev-time only (no runtime exposure)
  - Safe to keep; monitor for @vercel updates
**Priority 4:** 🟡 Linting — 395 issues (unused vars), need IDE bulk find-replace
**Priority 5:** 🔴 E2E Tests — Not started (Playwright)
**Priority 6:** 🔴 Documentation — Not started (reconcile docs)

---
Full glossary and deep context: `memory/`
