# SELFPRINT V3

**Also known as:** SELFPRINT (current version), the platform
**Status:** Production, active development
**Developer:** jb_DEV (solo)

## What It Is
Personal Intelligence Platform—a React-based mobile/web app for self-aware decision-making, powered by AI and data persistence.

## Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js APIs, Edge Functions
- **Database:** PostgreSQL (or current setup)
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** TBD (Vercel / Railway / Docker)
- **Tools:** GitHub, npm, Docker

## Key People
- jb_DEV — full-stack solo developer

## Directory Structure
```
D:\selfprint-v3-react/
  src/
    components/     # React UI components
    lib/            # Reusable logic
    api/            # Backend endpoints
    tests/          # Unit tests (vitest)
  e2e/              # E2E tests (Playwright)
  docs/             # Documentation
  package.json      # Dependencies, scripts
  vitest.config.ts  # Test configuration
  CLAUDE.md         # AI memory (hot cache)
  memory/           # Deep memory (this directory)
```

## Current Priorities
| Priority | Task | Timeline | Status |
|----------|------|----------|--------|
| **P1** | Data Persistence (FBS) | ✅ COMPLETE | 22/22 tests passing, commit pushed |
| **P2** | Test Stabilization | 3-5 days | vitest testTimeout fix needed |
| **P3** | Security CVEs | 2-3 days | npm audit → patch 10 vulnerabilities |
| **P4** | Linting | 1 day | Fix 4 errors + 201 warnings |
| **P5** | E2E Tests | 3-5 days | Create Playwright test suite |
| **P6** | Documentation | 1 day | Reconcile docs with actual code |

## Working Discipline
- **Code-first:** Repo state is ground truth, not cached assumptions
- **Surgical:** Minimal changes, only what's needed
- **Verified:** Every task needs acceptance criteria + verification
- **Documented:** Changes tracked in CLAUDE.md, commit messages clear
- **Production-focused:** Completeness over shortcuts

## Commands
```bash
npm install           # Install dependencies
npm test              # Run Vitest (unit tests)
npm run build         # TypeScript build + type check
npm run lint          # ESLint + format check
npm run dev           # Local dev server
npm audit             # Check security vulnerabilities
npm audit fix         # Auto-fix known CVEs
```

## Key Learnings (Session 1)
- FBS ✅: 22/22 tests passing, data persistence fully implemented
- Build: TS errors resolved, clean compilation
- Testing: vitest needs testTimeout config for stability
- Next: Focus on test reliability before adding new features

## Dependencies to Watch
- React 18 (latest stable)
- TypeScript 5.x
- Vitest (test runner)
- Playwright (E2E)
- Tailwind CSS
- ESLint / Prettier

## Known Issues & CVE Status
1. ✅ Vitest timeout too short → **FIXED** (testTimeout: 30000)
2. 🔴 **10 CVEs** remain — transitive deps chain:
   - @vercel/node v4.0.0 has: undici, js-yaml, minimatch, path-to-regexp, ajv
   - Fix: Upgrade package.json `"@vercel/node": "^4.0.0"` (done locally)
   - Then run: `rm -rf node_modules package-lock.json && npm install`
   - Then verify: `npm audit` (should show 0 vulnerabilities)
3. 🟠 ESLint: 395 unused vars (oxlint no auto-fix) → need IDE bulk refactor
4. 🔴 E2E tests not yet implemented → P5 priority
5. 🔴 Docs out of sync with code → P6 priority

## Success Criteria (Next 2 Weeks)
- [ ] P2: Vitest stable, <5% failure rate
- [ ] P3: All CVEs patched, npm audit clean
- [ ] P4: Linting pass (0 errors, <50 warnings)
- [ ] P5: Core E2E flows tested
- [ ] P6: README, API docs, setup guide current

---
Created: Session 1 memory bootstrap
Last verified: 2026-08-20
