# Performance

## Bundle Analysis (Post-Fix)

### Chunk Sizes

| Chunk | Raw | Gzip | Notes |
|-------|-----|------|-------|
| vendor-react | ~190 KB | ~60 KB | React core (entry) |
| vendor-query | ~37 KB | ~12 KB | TanStack Query (entry) |
| vendor-router | ~38 KB | ~12 KB | React Router (entry) |
| chunk-intelligence | 137 KB | 34 KB | Intelligence engines |
| vendor-supabase | ~50 KB | ~15 KB | Supabase SDK |
| vendor-three | ~140 KB | ~40 KB | Three.js (HIGH fidelity only) |
| decision-services | 4 KB | 2 KB | Decision services |
| entry | ~88 KB | ~28 KB | App shell |

Total estimated entry: ~580 KB raw / ~165 KB gzip (down from ~930 KB with three.js in vendor-misc).

### Chunk Splitting Strategy

Uses Rolldown-native `codeSplitting.groups` with explicit priorities. Key groups:
- `vendor-three`: Prevents three.js from entering entry graph
- `vendor-tslib`, `vendor-shallow-equal`: Isolates micro-deps to prevent misc contamination
- `chunk-supabase-lazy`: Separate lazy client from sync client

## Route Lazy Loading

All 35+ pages use `React.lazy()`. Context providers (9 total) also lazy-loaded. Only the app shell renders on initial page load.

## Supabase Client Lazy Loading

`client-lazy.ts` defers Supabase SDK import until first use. Reduces initial bundle parse time by ~200 KB.

## Performance Optimizations Applied

1. **Three.js isolated** in `vendor-three` chunk (P1-D1 fix)
2. **emptyOutDir: true** prevents stale chunk accumulation (P1-D2 fix)
3. **N+1 badge queries** replaced with single batched query (P1-D3 fix)
4. **SW runtime cache** bounded with max 100 entries, 30-day TTL
5. **Security headers** added via `_headers` (CSP, HSTS, etc.)

## Database Query Performance

### Optimized

- `getAllWorldAchievements()`: Single query replacing 12 sequential requests
- Batch outcome fetching in `DecisionLearningService`
- React Query deduplication with `staleTime: 30_000`

### Remaining

- ~60+ wildcard `.select('*')` across services — should specify columns explicitly
- `ConversationAnalyzer.ts:475` missing `.limit()` on pattern_analysis query
- Sequential upsert loop in `DecisionLearningService.updateTwinExpertiseFromDecisions`

## Service Worker

- Precache: hashed build assets only (no stale chunks due to emptyOutDir: true)
- Runtime cache: bounded (max 100 entries, 30-day TTL)
- Data cache: StaleWhileRevalidate for twin_memories, decision_logs, daily_briefs (max 200 entries, 7-day TTL)
- Background sync: journal queue when online
- Push notifications: handled by SW

## Caching Strategy

| Path | Cache-Control | Duration |
|------|---------------|----------|
| `/assets/*` | public, immutable | 1 year |
| `/icons/*` | public, immutable | 1 year |
| `/audio/*` | public, immutable | 1 year |
| `/blog/*.md` | public, immutable | 30 days |
| `/manifest.json` | public, must-revalidate | 1 day |
| SPA shell (`/*`) | private, no-cache | — |
| Authenticated API | private, no-store | — |

## Known Issues

| ID | Severity | Description |
|----|----------|-------------|
| M-2 | Medium | Profile/blueprint responses marked `public, max-age=300` — should be `private, no-store` |
| TwinThreeRenderer | Low | Full WebGL context rebuild on color/world changes; rAF never pauses offscreen |
