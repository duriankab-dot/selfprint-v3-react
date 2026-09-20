# Deployment

## Platform: Cloudflare Pages

### Production

- **URL:** `https://www.selfprint.one`
- **Deploy trigger:** Push to `master`, `main`, or `develop` branches
- **Build command:** `npm run build` (tsc -b && vite build)
- **Output directory:** `dist/`

### Staging

- **URL:** `https://selfprint-staging.pages.dev`
- **Trigger:** Manual deploy from CF dashboard or separate branch

## Environment Variables (CF Pages Secrets)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side DB access |
| `SUPABASE_ANON_KEY` | Anon key for client-side operations |
| `OPENROUTER_API_KEY` | AI provider API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `SENTRY_DSN` | Sentry error tracking DSN |

## CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/testing.yml`

```
unit-tests  →  Vitest (gates CI)
    └── e2e-tests  →  Playwright (gates CI)
            ├── smoke-test  →  k6 (manual only via workflow_dispatch)
            └── full-load   →  k6 (manual only via workflow_dispatch)
    └── report-results  →  Generates test report from mandatory artifacts
```

The `report-results` job depends only on `unit-tests` and `e2e-tests`. k6 jobs are manual-only and must not block reporting.

## Database Migrations

35 migrations (001–040) in `supabase/migrations/`:

1. Review migration files in order
2. Apply to production via Supabase SQL Editor or CLI
3. Migration guide: `supabase/MIGRATIONS_GUIDE.md`

Key migrations:
- 001–026: Core schema (profiles, twins, decisions, conversations)
- 027–028: Twin creation optimization (atomic RPC)
- 029–030: Phase A extended schema (notifications, evolution)
- 035: Forensic consolidation (RLS fixes, policy normalization)
- 036–040: Visual DNA, onboarding, lifecycle, insights cache

## Build Configuration

Vite config (`vite.config.ts`):
- Tailwind CSS v4 via Vite plugin
- PWA via `vite-plugin-pwa` (injectManifest strategy)
- Code splitting via Rolldown-native `codeSplitting.groups`
- `emptyOutDir: true` — clean dist before each build
- Chunk size warning: 500 KB

## Cache Headers

Configured in `public/_headers`:
- `/assets/*`: 1 year immutable
- `/icons/*`: 1 year immutable
- `/audio/*`: 1 year immutable
- `/blog/*.md`: 30 days
- `/manifest.json`: 1 day revalidate
- SPA shell (`/*`): private, no cache

## PWA / Service Worker

- Source: `src/sw.js` (injected by Vite PWA plugin)
- Precache: hashed build assets via `self.__WB_MANifest`
- Runtime cache: bounded (max 100 entries, 30-day TTL)
- Data cache: Supabase REST API responses for twin_memories, decision_logs, daily_briefs
- Background sync: journal queue when offline
- Push notifications: handled by SW

## Monitoring

- **Error tracking:** Sentry (configured via `VITE_SENTRY_DSN`)
- **Analytics:** Client-side event tracking via `analytics.ts`
- **Performance:** Lighthouse reports in repo root (historical)

## Rollback

Cloudflare Pages retains last 300 deployments. Rollback via CF dashboard.
