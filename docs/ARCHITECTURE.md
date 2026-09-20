# Architecture

## Platform

- **Hosting:** Cloudflare Pages (not Vercel)
- **Framework:** React 19.2 + Vite 8.2 (Rolldown)
- **Router:** react-router-dom 7.18
- **State Management:** Zustand 5.0, TanStack Query 5.10
- **Database:** Supabase (PostgreSQL) with RLS enabled on all user tables
- **API Layer:** Cloudflare Pages Functions (`functions/api/`, `api/unified-handler.ts`)
- **AI Provider:** OpenRouter (model routing via `_utils/ai-provider.ts`)
- **Error Tracking:** Sentry (lazy-loaded)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **PWA:** Service Worker via `vite-plugin-pwa` (injectManifest strategy)

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/            # Passkey login (disabled until rebuild)
│   ├── chat/            # Chat UI (ImmersiveNavbar, ChatWindow, etc.)
│   ├── composites/      # Composite components (Dropdown)
│   ├── dashboard/       # Dashboard widgets
│   ├── intelligence/    # MemoryRecorder, FeedbackWidget, InsightCard
│   ├── landing/         # Landing page components
│   ├── layout/          # AppShell, NavRail, NavBar, Footer, BottomNav
│   ├── pwa/             # OfflineBanner
│   ├── twin/            # Twin visual components (TwinThreeRenderer, TwinEvolution)
│   ├── ui/              # Primitives (Skeleton)
│   ├── viral/           # ShareButton
│   └── audio/           # SFXProvider, SoundscapePlayer, TwinAudioFeedback
├── context/             # React contexts (Auth, AI, Hub, World, Experience, Audio, etc.)
├── features/            # Feature-specific code (chat/hooks, viral/api)
├── hooks/               # Custom React hooks (useAuth, useJournalQueue, etc.)
├── lib/                 # Shared utilities
│   ├── intelligence/    # AIFeedbackLoop, MemoryManager, PatternDetector, HexagramEngine
│   ├── sice/            # SICE engine bridges and orchestrator
│   ├── supabase/        # client.ts, client-lazy.ts, client-registry.ts
│   └── auth/            # PasskeyProvider (disabled)
├── pages/               # Route-level components (35+ lazy-loaded routes)
├── services/            # Business logic services
│   ├── world-routing/   # WorldRoutingService, WorldDecisionRouter, WorldContextAdapter
│   ├── world-prompts/   # WorldExpertPrompts
│   ├── sice/            # SICEOrchestrator, SICEBridge
│   └── __tests__/       # Service unit tests
├── store/               # Zustand stores (userStore, twinStore, lifecycleStore, decisionStore, analysisStore)
├── types/               # TypeScript type definitions
├── constants/           # Static data (worlds, personalities, stages, SEO metadata)
├── config/              # Configuration files (prompts, currency)
├── styles/              # Global CSS
└── sw.js                # Service Worker source (injected by Vite PWA plugin)
```

## Key Architectural Decisions

### Lazy Loading Strategy

All 35+ page routes are lazy-loaded via `React.lazy()` in `App.tsx`. Context providers (9 total) are also lazy-loaded. This ensures the entry bundle only contains shell rendering code.

### Chunk Splitting

Uses Rolldown-native `codeSplitting.groups` (Vite 8 / Rolldown):

| Group | Test | Priority | Content |
|-------|------|----------|---------|
| vite-preload | `/vite.*preload|preload\/helper/` | 120 | Preload helper |
| chunk-supabase-lazy | `/src/lib/supabase/(client-lazy|client-registry)\.ts/` | 115 | Lazy Supabase clients |
| chunk-supabase-client | `/src/(lib\/supabase\/|services\/supabase-service\.ts)/` | 110 | Supabase client pair |
| vendor-supabase | `/node_modules/@supabase/` | 105 | Supabase SDK |
| vendor-react | `/node_modules/(react|react-dom|scheduler|use-sync-external-store)/` | 100 | React core |
| vendor-router | `/node_modules/(react-router|react-router-dom|@remix-run)/` | 100 | Router |
| vendor-query | `/node_modules/@tanstack/` | 100 | React Query |
| vendor-state | `/node_modules/zustand/` | 100 | Zustand |
| vendor-tslib | `/node_modules/tslib/` | 100 | tslib |
| vendor-shallow-equal | `/node_modules/(react-fast-compare|shallowequal|hoist-non-react-statics)/` | 100 | Shallow compare libs |
| vendor-three | `/node_modules/three/` | 95 | Three.js (HIGH fidelity only) |
| vendor-markdown | `/node_modules/(react-markdown|remark-*|rehype-|micromark|...)/` | 95 | Markdown stack |
| chunk-intelligence | `/src/lib/intelligence/` | 90 | Intelligence engines |
| decision-services | `/src/services/(DecisionService|DecisionLearningService|FollowUpScheduler)\.ts/` | 90 | Decision services |
| vendor-misc | `/node_modules/` | 50 | Catch-all remaining |

### Authentication Flow

1. Supabase Auth (email/password + passkey disabled)
2. JWT verification via `verifyUser()` in CF Functions
3. RLS policies enforce row-level access on all user tables
4. Admin client uses `SUPABASE_SERVICE_ROLE_KEY` for server-side operations

### API Routing

- `functions/api/twin.ts` — AI Twin endpoint (rate limited: 40 req/min)
- `functions/api/nova.ts` — Nova endpoint (rate limited)
- `functions/api/twin-stream.ts` / `nova-stream.ts` — Streaming variants
- `functions/api/metrics.ts` — Metrics endpoint
- `functions/api/autonomy-log.ts` — Autonomy logging
- `api/[[route]].ts` → `api/unified-handler.ts` — Catch-all for module-based endpoints
  - Modules: notifications, twin-evolution, sice, stripe, profile, blueprint
  - Exact: share

### Database Schema

35 migrations (001–040) covering:
- User profiles, blueprints, decisions
- Twin creation and evolution (SICE scores, memories, personality)
- Chat messages, journal queue, push subscriptions
- Subscriptions (Stripe), daily briefs, analytics events
- Community insights, world preferences/stats
- Onboarding checkpoints, visual DNA, learning profiles
- Decision insights cache, lifecycle tracking
- Forensic consolidation (RLS fixes, schema normalization)

All user-data tables have RLS enabled with `auth.uid() = user_id` policies.

### Security Guards

- `create_twin_complete` / `optimize_twin_creation`: `p_user_id <> auth.uid()` check added
- All API endpoints require verified JWT via `verifyUser()`
- IDOR prevention: URL/body userId mismatches return 403
- Rate limiting: per-user in-memory (Cloudflare Workers)
- CORS: origin whitelist + fallback log on unknown origins
