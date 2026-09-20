# Testing Strategy

## Overview

| Test Type | Framework | Files | Tests | Location |
|-----------|-----------|-------|-------|----------|
| Unit Tests | Vitest | 67 | ~1050 | `src/__tests__/`, `src/services/__tests__/`, `src/components/`, `src/tests/` |
| E2E Tests | Playwright | N/A | 63 pass, 30 skip | `e2e/` |
| Load Tests | k6 | Manual only | N/A | `loadtests/` |

## Unit Tests

Run: `npm test` (Vitest)

### Structure

- `src/__tests__/` — Integration and service tests
- `src/services/__tests__/` — Service unit tests
- `src/components/intelligence/*.test.tsx` — Component tests
- `src/tests/` — Additional integration tests

### Supabase Mocking

All Supabase clients are mocked globally in `src/test/setup.ts`. The mock implements:
- `.from().select().single()` chain
- `.insert().select().single()` chain
- `.update()`, `.delete()`, `.eq()`, `.maybeSingle()` methods

### Key Test Coverage Areas

- MemoryRecorder component rendering and form validation
- FeedbackWidget component with all 4 feedback types
- AIFeedbackLoop calibration (integration)
- Onboarding components (InitialBlueprint, FinetuningQuestions)
- World routing and context adapters
- Sentiment analysis
- Decision service logic
- Follow-up scheduler

## E2E Tests

Run: `npm run test:e2e` or `npm run test:e2e:staging`

### Architecture

- Global setup (`e2e/global-setup.ts`) injects auth session via Playwright storageState
- Tests run against staging (`selfprint-staging.pages.dev`) or production (`selfprint.one`)
- Navigation uses `spaNavTo()` with one controlled recovery if navigation fails

### Gate Policy

- Phase A smoke/auth/critical-journey tests MUST gate CI
- No silent-pass allowed
- Master Gate status tracked in `MASTER_GATE_AS_IS.md`

### CI Pipeline

```yaml
jobs:
  unit-tests:    # Vitest — gates CI
  e2e-tests:     # Playwright — gates CI
  smoke-test:    # k6 — manual only (workflow_dispatch)
  full-load:     # k6 — manual only (workflow_dispatch)
  report:        # Generates test report from mandatory artifacts
```

The `report-results` job depends only on `unit-tests` and `e2e-tests`. k6 jobs are manual-only and must not block reporting.

## Performance Targets

| Metric | Target |
|--------|--------|
| Auth login | < 2s (p95) |
| GET /api/profile | < 1s (p95) |
| POST /api/twin | < 8s (p95) |
| POST /api/nova | < 7s (p95) |
| Error rate | < 1% |
| No 5xx errors > 0.1% |

## Bundle Size Limits

- Chunk size warning: 500 KB (unminified)
- Largest feature chunk: `chunk-intelligence` (~137 KB raw / ~34 KB gzip)
- Three.js isolated in `vendor-three` chunk (HIGH fidelity path only)
