# Development Guide

## Prerequisites

- Node.js >= 22.12 (Vite 8 requires Rolldown native bindings)
- npm >= 11.x
- Supabase project (staging: `selfprint-staging.pages.dev`, production: `selfprint.one`)

## Setup

```bash
npm install
cp .env.example .env.local   # Fill in credentials
npm run dev                   # Start development server
```

Environment variables required (see `.env.example`):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN` (optional, for error tracking)

For CF Pages Functions, configure secrets in the Cloudflare dashboard:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run typecheck` | TypeScript check only (`tsc -b`) |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview production build locally |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:staging` | Run staging E2E harness |
| `npm run seed:test-users` | Seed test users script |

## Code Style

- **Linter:** oxlint (configured in `.oxlintrc.json`)
- **TypeScript:** strict mode via `tsconfig.app.json`
- **CSS:** Tailwind CSS v4 utility classes (no postcss.config needed — Vite plugin handles it)
- **Formatting:** Standard conventions, no Prettier configured

## Git Workflow

- Branch naming: feature/, fix/, refactor/ prefixes
- Commit messages: Conventional Commits style
- No force-push to master/main
- PRs require CI green before merge

## Testing

### Unit Tests (Vitest)

Run: `npm test`

- 67 test files, ~1050 tests
- Mock Supabase client globally in test setup
- Component tests use @testing-library/react

### E2E Tests (Playwright)

Run: `npm run test:e2e` or `npm run test:e2e:staging`

- Global setup injects auth session into Playwright storageState
- Staging tests target `https://selfprint-staging.pages.dev`
- Production tests target `https://www.selfprint.one`

## Architecture Decisions

See `docs/ARCHITECTURE.md` for full architectural details.

Key decisions:
1. All routes lazy-loaded via React.lazy()
2. Supabase client lazy-loaded (client-lazy.ts)
3. Three.js in separate vendor chunk (HIGH fidelity only)
4. RLS enforced on all user tables
5. API auth via JWT verification in CF Functions
