# SELFPRINT REALITY MAP

> เอกสารนี้สร้างจาก **CODE จริง** เท่านั้น (ไม่ถือ README/เอกสารอื่นเป็นความจริง)
> Audited: 2026-09-13 | Target commit: e3edda50645dd8ed72056f86ff4df420887ba4be

---

## 1. REPOSITORY IDENTITY

| Field | Value |
|-------|-------|
| Name | selfprint-v3-react |
| Framework | React 19.2 + TypeScript 6.0 + Vite 8.2 |
| Router | react-router-dom 7.1 (BrowserRouter) |
| State | Zustand 5.0 + React Query 5.10 |
| Database | Supabase (PostgreSQL) |
| AI Provider | OpenRouter REST API (functions/api/_utils/ai-provider.ts) |
| Edge Runtime | Cloudflare Pages Functions (wrangler.toml) + Vercel edge compatibility |
| Auth | Supabase Auth (OAuth Google/Apple, Magic Link, Passkey/WebAuthn) |
| Payments | Stripe (checkout sessions, billing portal, webhooks) |
| PWA | vite-plugin-pwa + injectManifest (hand-written src/sw.js) |
| Monitoring | Sentry (sentry/react) |
| Styling | Tailwind CSS v4 (Tailwind Vite plugin) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Linting | oxlint |
| 3D/Visual | Three.js 0.186 |

---

## 2. CURRENT COMMIT

```
e3edda50645dd8ed72056f86ff4df420887ba4be
fix: MG-05-01 and MG-07-01 — add auth/Twin guard skips for CI
```

CI Status: MASTER GATE claimed 100% PASS (69 passed / 31 skipped E2E). k6 removed from gate criteria (no test files exist).

---

## 3. ACTUAL ARCHITECTURE

### 3.1 Frontend Stack

```
App.tsx (Router wrapper)
├── ThemeProvider
│   └── AuthProvider (Supabase session management)
│       ├── EmotionContext
│       │   └── TwinProvider
│       │       └── LanguageProvider
│       │           ├── OfflineBanner
│       │           ├── PWAInstallPrompt
│       │           ├── FloatingSelfprintChat (general assistant)
│       │           └── ConditionalPrivateProviders (gated by MARKETING_PATH_RE)
│       │               ├── [LAZY] AIProvider
│       │               ├── [LAZY] HubProvider
│       │               ├── [LAZY] WorldProvider
│       │               ├── [LAZY] SubscriptionProvider
│       │               ├── [LAZY] ConditionalExperience (session-gated)
│       │               ├── [LAZY] AudioProvider
│       │               ├── [LAZY] SFXProvider
│       │               ├── [LAZY] EnvironmentProvider
│       │               ├── [LAZY] EvolutionProvider
│       │               ├── [LAZY] PopupProvider
│       │               │   ├── ContextualPopup
│       │               │   └── TwinEvolutionSceneWrapper
│       │               │   └── children (Routes)
│       └── [LAZY] ConditionalTwinEvolution (session-gated overlay)
│           └── RecoveryRouteHandler
│               └── PendingOnboardingSaver
```

**Key architectural decisions:**
- All pages lazy-loaded via React.lazy() for code splitting
- Heavy authenticated providers (AI, Hub, World, etc.) skipped entirely on marketing routes
- Tailwind CSS was NEVER compiled (no postcss.config.js, directives in index.css never imported) — ~800 utility class points in 37 files have zero effect
- Entry closure optimization: Supabase SDK lazy-loaded via client-lazy.ts

### 3.2 Backend/Runtime

```
Cloudflare Pages Functions (functions/api/)
├── [[route]].ts — catch-all router → api/unified-handler.ts
│   ├── notifications (list, schedule, mark-read, record-outcome)
│   ├── twin-evolution (get progress)
│   ├── sice (get-patterns)
│   ├── stripe (create-checkout, create-portal, subscription, webhook)
│   ├── share (GET/POST share codes)
│   ├── profile (GET/POST user profiles)
│   └── blueprint (GET/POST blueprints)
├── nova.ts — Nova chat endpoint
├── nova-stream.ts — Nova streaming chat
├── twin.ts — Twin chat endpoint
├── twin-stream.ts — Twin streaming chat
├── metrics.ts — Metrics endpoint
└── autonomy-log.ts — Autonomy logging
```

**API routing:**
- `/api/*` → `[[route]].ts` → unified-handler.ts (module/action pattern)
- `/api/nova*`, `/api/twin*` → dedicated function files (matched before catch-all)
- Vercel compatibility: GET/POST exports with fallback to process.env

### 3.3 Data Flow

```
User Action
  → React Component / Hook
  → Zustand Store (client state) OR TanStack Query (server state)
  → API call (fetch/axios)
  → Cloudflare Pages Function OR Supabase client direct
  → PostgreSQL (RLS enforced)
  → Response → Update store/UI
```

---

## 4. ACTUAL ROUTES

All routes prefixed with `/en/` or `/th/`. Root `/` redirects to `/th/`.

### 4.1 Public Routes (no auth required)

| Route | Component | Notes |
|-------|-----------|-------|
| `/en/`, `/th/`, `/` | LandingPage | Home page with WelcomeBackHero for logged-in users |
| `/en/onboarding`, `/th/onboarding` | Onboarding | 7-step wizard (emotion → nova → AI creation → blueprint → fine-tune → analysis → claim) |
| `/en/login`, `/th/login` | LoginPage | OAuth + Magic Link + Passkey |
| `/en/core-awakening`, `/th/core-awakening` | CoreAwakening | Twin birth ceremony |
| `/en/chat`, `/th/chat` | Redirect → `/chat/nova` | Shortcut route |
| `/en/chat/nova`, `/th/chat/nova` | NovaChat (NovaProvider) | General assistant chat |
| `/en/chat/twin`, `/th/chat/twin` | ImmersiveTwinChat | Twin chat (ProtectedRoute) |
| `/en/dashboard`, `/th/dashboard` | Dashboard | Main app entry |
| `/en/intelligence`, `/th/intelligence` | IntelligenceHub | AI insights hub |
| `/en/analysis`, `/th/analysis` | AnalysisPage | SICE analysis |
| `/en/privacy`, `/th/privacy` | PrivacyCenter | Privacy settings |
| `/en/share/:code` | Share | Public share view |
| `/en/brief`, `/th/brief` | DailyBriefPage | Daily brief |
| `/en/badges`, `/th/badges` | BadgePage | Badges/achievements |
| `/en/pricing`, `/th/pricing` | PricingPage | Stripe pricing |
| `/en/pricing/success` | PricingSuccessPage | Post-payment success |
| `/en/explore`, `/th/explore` | ExplorePage | Explore features |
| `/en/activities`, `/th/activities` | ActivitiesPage | Activities list |
| `/en/me`, `/th/me` | MePage | User profile/settings |
| `/en/voice`, `/th/voice` | VoiceChatPage | Voice chat |
| `/en/twin-profile`, `/th/twin-profile` | TwinProfilePage | Twin profile view |
| `/en/life-hubs`, `/th/life-hubs` | LifeHubsPage | Life hubs |
| `/en/decisions`, `/th/decisions` | DecisionDashboard | Decision dashboard |
| `/en/decision-log`, `/th/decision-log` | DecisionLoggerPage | Decision logger |
| `/en/menu`, `/th/menu` | FeatureMenu | Feature menu |
| `/en/tarot`, `/th/tarot` | TarotPage | Tarot reading |
| `/en/palmistry`, `/th/palmistry` | PalmistryPage | Palmistry |
| `/en/community`, `/th/community` | CommunityPage | Community features |
| `/en/about`, `/th/about` | AboutPage | SEO page |
| `/en/science`, `/th/science` | SciencePage | SEO page |
| `/en/contact`, `/th/contact` | ContactPage | SEO page |
| `/en/terms`, `/th/terms` | TermsPage | SEO page |
| `/en/faq`, `/th/faq` | FAQPage | FAQ with accordion |
| `/en/vs-astrology`, `/th/vs-astrology` | VsAstrologyPage | Comparison page |
| `/blog` | BlogListPage | Blog listing |
| `/blog/:slug` | BlogArticle | Individual blog article |

### 4.2 Protected Routes (auth required)

| Route | Component |
|-------|-----------|
| `/en/twin/settings`, `/th/twin/settings` | TwinSettingsPage |
| `/en/twin/personality`, `/th/twin/personality` | TwinPersonalityPage |
| `/en/worlds`, `/th/worlds` | WorldsHub |
| `/en/worlds/:worldId`, `/th/worlds/:worldId` | WorldDetail |
| `/en/settings/passkeys`, `/th/settings/passkeys` | PasskeySettings |

### 4.3 Route Guard Logic

- **ProtectedRoute**: Checks `useAuth().session`; redirects to `/en/login` or `/th/login` if no session
- **ConditionalPrivateProviders**: Skips heavy provider stack on marketing paths (`/^\/(?:en\|th)?(?:\/?$\|onboarding\/?$\|login\/?$\|blog(?:\/.*)?\/?$\|faq\/?$\|about\/?$\|science\/?$\|contact\/?$\|terms\/?$\|privacy\/?$\|share(?:\/.*)?\/?$\|vs-astrology\/?$\|tarot\/?$\|palmistry\/?$)/`)
- **RecoveryRouteHandler**: Handles post-auth recovery navigation
- **PendingOnboardingSaver**: Saves incomplete onboarding data

---

## 5. ACTUAL FEATURES

### 5.1 Authentication & Identity

| Feature | Implementation | Source |
|---------|---------------|--------|
| OAuth Login | Google + Apple via Supabase | AuthContext.tsx:224-243 |
| Magic Link | OTP email link | AuthContext.tsx:194-222 |
| Passkey/WebAuthn | Register + Sign-in with biometric | AuthContext.tsx:132-192, lib/auth/PasskeyProvider.ts |
| Session Management | Lazy getSession() after 100ms, onAuthStateChange listener | AuthContext.tsx:70-130 |
| User Isolation | RLS policies on all tables | All migration files |

### 5.2 Twin Lifecycle

```
ONBOARDING → ANALYSIS → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE
```

| Stage | Store/Page | DB Table |
|-------|-----------|----------|
| ONBOARDING | Onboarding.tsx (7 steps) | user_lifecycle.status |
| ANALYSIS | AnalysisPage (SICE) | personal_profiles, decision_log |
| AWAKENING | CoreAwakening.tsx | twins, awakening_essence |
| TWIN_ALIVE | Twin created | user_lifecycle.twin_id, twin_state |
| WORLD_ACTIVE | Chat/Dashboard/Explore | conversations, messages, twin_memories |

### 5.3 Core Features

| Feature | Description | Key Files |
|---------|-------------|-----------|
| **Nova Chat** | General AI assistant chat (streaming) | pages/NovaChat.tsx, functions/api/nova.ts |
| **Twin Chat** | Immersive Twin conversation (streaming) | pages/ImmersiveTwinChat.tsx, functions/api/twin.ts |
| **Dashboard** | Main app hub with panels | pages/Dashboard.tsx, components/dashboard/* |
| **SICE Analysis** | Science/Intuition/Creative/Experience scoring | pages/AnalysisPage.tsx, lib/astrology.ts |
| **Blueprint** | User personality/archetype blueprint | api/unified-handler.ts handleBlueprint |
| **Worlds** | 12 Intelligence Worlds with expertise tracking | pages/WorldsHub.tsx, WorldDetail.tsx |
| **Decisions** | Decision logging, outcomes, follow-ups | pages/DecisionDashboard.tsx, DecisionLoggerPage.tsx |
| **Evolution** | Twin evolution through 5 stages | components/twin/TwinEvolution.tsx, context/EvolutionContext.tsx |
| **Memory** | Twin memory/recording system | components/intelligence/MemoryRecorder.tsx |
| **Daily Brief** | Daily intelligence brief | pages/DailyBriefPage.tsx |
| **Pricing/Subscriptions** | Stripe integration (plus/pro/lifetime) | pages/PricingPage.tsx, api/unified-handler.ts handleStripe |
| **Share** | Shareable blueprint links | pages/Share.tsx, api/unified-handler.ts handleShare |
| **Notifications** | Push notifications + in-app queue | services/PushScheduler.ts, notification_queue table |
| **Voice Chat** | Voice-based interaction | pages/VoiceChatPage.tsx |
| **Tarot/Palmistry** | Fortune-telling activities | pages/TarotPage.tsx, PalmistryPage.tsx |
| **Community** | Community insights | services/CommunityService.ts |
| **Blog** | Markdown blog system | pages/BlogListPage.tsx, BlogArticle.tsx |
| **PWA** | Service worker, offline banner, install prompt | src/sw.js, components/pwa/OfflineBanner.tsx, PWAInstallPrompt.tsx |
| **Audio/SFX** | Soundscape player + SFX provider | components/audio/SoundscapePlayer.tsx, SFXProvider.tsx |
| **Environment** | Ambient environment system | context/EnvironmentContext.tsx |
| **Emotion** | Mood/emotion tracking | context/EmotionContext.tsx |
| **Popup/Contextual** | Contextual popup system | context/PopupContext.tsx, ContextualPopup.tsx |
| **FloatingChat** | Draggable general assistant button | components/chat/FloatingSelfprintChat.tsx |

### 5.4 Missing Features (documented but not implemented)

| Claimed Feature | Status | Evidence |
|----------------|--------|----------|
| Fingerprint/NOVA flow in onboarding | SKIP in tests | twin.spec.ts TWIN-01: "fingerprint→NOVA flow not implemented" |
| /en/twin-birth route | Not registered | twin.spec.ts TWIN-02: "Route /en/twin-birth not implemented" |
| /en/twin/:id route | Not registered | twin.spec.ts TWIN-03: "Route /en/twin/:id not implemented" |
| HolographicBirth standalone | Exists only inside Onboarding/CoreAwakening | Components exist but no dedicated route |
| k6 load tests | No test files | testing.yml: "NOT YET IMPLEMENTED" |

---

## 6. ACTUAL USER LIFECYCLE

### 6.1 New User Journey

```
Landing (/en/) → Click CTA → /en/onboarding
  Step 1: Emotion selection
  Step 2: Nova conversation
  Step 3: AI creation trigger
  Step 4: Blueprint generation
  Step 5: Fine-tuning
  Step 6: SICE analysis
  Step 7: Claim Twin (Core Awakening)
→ /en/dashboard (or /en/chat/twin)
```

### 6.2 Returning User Journey

```
Open site → Auth check (lazy getSession) → LandingPage with WelcomeBackHero
→ Navigate to /dashboard OR /chat/twin OR any protected route
→ Existing Twin loaded from DB → Chat/Dashboard/Explore available
```

### 6.3 Interrupted Onboarding

- **Data persistence**: Onboarding checkpoints saved via `20260826_001_onboarding_checkpoints.sql`
- **localStorage**: `selfprint_onboarding_resume` stores step + DOB for pre-auth recovery
- **Server-side**: user_lifecycle table tracks status per user
- **Risk**: If user clears localStorage before completing, pre-auth data lost

---

## 7. ACTUAL STATE MODEL

### 7.1 Zustand Stores (Client State)

| Store | Persistence | Purpose |
|-------|------------|---------|
| userStore | persist (theme only via partialize) | UserProfile, SICE scores, landing context |
| twinStore | persist (selfprint-twin-storage) | Messages, autonomy score, patterns, feedback |
| lifecycleStore | In-memory (syncs to user_lifecycle DB) | Lifecycle status transitions |
| decisionStore | In-memory | Decision-related state |
| analysisStore | In-memory | Analysis state |

**Important**: userStore.partialize only saves `theme` to localStorage. Birth date, SICE scores, and profile are NOT persisted (source-of-truth is Supabase).

### 7.2 React Query (Server State)

- @tanstack/react-query 5.10 used throughout for server-state caching
- Cache invalidation triggered by mutations (Twin creation, decision save, etc.)
- Stale data risk: Some queries may not invalidate properly on Twin updates

### 7.3 Context Providers (Global State)

| Context | Provides | Consumed By |
|---------|----------|-------------|
| AuthContext | session, login methods, passkey | Every authenticated route |
| EmotionContext | mood state | LandingPage, Onboarding, components |
| TwinContext | twin data | Chat, Dashboard, Evolution |
| AIContext | AI chat functionality | NovaChat, TwinChat |
| WorldContext | 12 worlds, expertise | WorldsHub, TwinChat world routing |
| ExperienceContext | Experience engine | (conditionally mounted) |
| EvolutionContext | Twin evolution state | TwinEvolution component |
| EnvironmentContext | Ambient environment | (session-gated) |
| PopupContext | Contextual popup system | ContextualPopup, overlays |
| AudioContext | Audio playback | AudioSettings, SFX |
| HubContext | Intelligence hubs | IntelligenceHub, Dashboard |
| SubscriptionContext | Stripe subscription state | PricingPage, gated features |
| LanguageContext | i18n (EN/TH) | All pages |
| ThemeContext | Light/dark theme | All pages |

---

## 8. ACTUAL APIs

### 8.1 Serverless Functions (Cloudflare Pages)

| Endpoint | Method | Handler | Auth Required | Description |
|----------|--------|---------|---------------|-------------|
| `/api/notifications/list` | GET | unified-handler | Yes | List notifications |
| `/api/notifications/schedule` | POST | unified-handler | Yes | Schedule notification |
| `/api/notifications/mark-read` | POST | unified-handler | Yes | Mark notification read |
| `/api/notifications/record-outcome` | POST | unified-handler | Yes | Record decision outcome |
| `/api/twin-evolution` | GET | unified-handler | Yes | Get twin evolution progress |
| `/api/sice/get-patterns` | GET | unified-handler | Yes | Get SICE patterns |
| `/api/stripe/create-checkout` | POST | unified-handler | Yes | Create Stripe checkout |
| `/api/stripe/create-portal` | POST | unified-handler | Yes | Stripe billing portal |
| `/api/stripe/subscription` | GET | unified-handler | Yes | Get subscription status |
| `/api/stripe/webhook` | POST | unified-handler | No (signature verify) | Stripe webhook handler |
| `/api/share` | GET/POST | unified-handler | POST: Yes | Generate/view share code |
| `/api/profile` | GET/POST | unified-handler | Yes | User profile CRUD |
| `/api/blueprint` | GET/POST | unified-handler | Yes | Blueprint CRUD |
| `/api/nova*` | POST | nova.ts | Yes | Nova AI chat |
| `/api/nova-stream*` | POST | nova-stream.ts | Yes | Nova streaming chat |
| `/api/twin*` | POST | twin.ts | Yes | Twin AI chat |
| `/api/twin-stream*` | POST | twin-stream.ts | Yes | Twin streaming chat |
| `/api/metrics*` | POST | metrics.ts | Yes | Metrics collection |
| `/api/autonomy-log*` | POST | autonomy-log.ts | Yes | Autonomy logging |
| `/api/og` | GET | og.ts | No | OpenGraph image generation |

### 8.2 Direct Supabase Client Calls (from frontend)

| Operation | Table | File |
|-----------|-------|------|
| Save message | twin_memories | services/supabase-service.ts:saveMessage |
| Get chat history | twin_memories | services/supabase-service.ts:getChatHistory |
| Save insight | user_insights | services/supabase-service.ts:saveInsight |
| Save decision | decision_log | services/supabase-service.ts:saveDecision |
| Get decisions | decision_log | services/supabase-service.ts:getUserDecisions |
| Get dashboard insights | decision_log | services/supabase-service.ts:getDashboardInsights |
| Get decision logs | decision_log | services/supabase-service.ts:getDecisionLogs |
| Get autonomy trend | decision_log | services/supabase-service.ts:getAutonomyTrend |
| Export decisions | decision_log | services/supabase-service.ts:exportDecisionLogs |
| Lifecycle transitions | user_lifecycle | store/lifecycleStore.ts |
| Twin creation | twins | Various (CoreAwakening, etc.) |

### 8.3 AI Provider

- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Function**: `callOpenRouter()` / `getOpenRouterStream()` in functions/api/_utils/ai-provider.ts
- **Model**: Configurable via env (vendor/model-name format)
- **Streaming**: SSE via ReadableStream forwarding

---

## 9. ACTUAL DATABASE

### 9.1 Schema Overview

Two schemas used:
- `public.*` — Standard Supabase tables
- `selfprint.*` — Custom schema for profiles, blueprints, share_links (created by 002_profiles_blueprints.sql)

### 9.2 Tables (public schema)

| Table | Purpose | RLS | Key Columns |
|-------|---------|-----|-------------|
| twins | User's AI Twin | Yes (user_id = auth.uid()) | id, user_id, name, personality_type, system_prompt |
| twin_state | Twin consciousness state | Yes | twin_id, user_id, current_stage, consciousness_level |
| twin_personality | Twin personality config | Yes | twin_id, user_id, base_personality, tone |
| twin_capabilities | Unlocked features per stage | Yes | twin_id, user_id, unlocked_features |
| twin_memory | Twin memories | Yes | twin_id, user_id, memory_type, content (JSONB) |
| twin_memories | Chat messages (renamed from twin_memory) | Yes | twin_id, world_id, role, content |
| conversations | User-Twin conversations | Yes | twin_id, user_id, world, title |
| messages | Individual chat messages | Yes | conversation_id, twin_id, user_id, role, content |
| conversation_settings | Per-conversation settings | Yes | conversation_id, user_id, tone, response_length |
| conversation_memory | Conversation context | Yes | conversation_id, user_id, key_themes |
| personal_profiles | User extended profile | Yes | user_id, birth_date, mood_state |
| personal_memory | Important moments/wins | Yes | user_id, memory_type, title, content |
| behavioral_patterns | Detected behavior patterns | Yes | user_id, pattern_name, evidence_points |
| personal_context | Values/goals/blind spots | Yes | user_id, context_type, confidence |
| insight_feedback | AI insight calibration | Yes | user_id, insight_id, feedback_type |
| decision_log | User decisions | Yes | user_id, title, context, confidence, hub, mood |
| decision_outcomes | Decision follow-up results | Yes (via decision_log FK) | decision_id, follow_up_day, impact |
| follow_up_schedule | Follow-up timing | Yes (via decision_log FK) | decision_id, day30-day365 due/completed |
| decision_patterns | Learned decision patterns | Yes (via twins FK) | twin_id, world, pattern, success_rate |
| twin_evolution_history | Evolution event log | Yes | user_id, twin_id, previous_stage, new_stage |
| twin_evolution_progress | Current evolution progress | Yes | user_id, twin_id, current_stage, progress_percent |
| twin_world_expertise | World expertise tracking | Yes (via twins FK) | twin_id, world, interaction_count, expertise_score |
| learning_profiles | Twin learning profiles | Yes | twin_id, user_id, pattern data |
| world_preferences | World preference config | Yes | twin_id, user_id, world preferences |
| world_stats | World statistics | Yes | twin_id, world, stats |
| notification_schedule | Scheduled notifications | Yes | user_id, twin_id, scheduled_for, status |
| notification_queue | Notification queue | Yes | user_id, type, title, message, status |
| notification_analytics | Notification event tracking | Yes | user_id, event_type |
| subscriptions | Stripe subscription state | Yes (user_id = auth.uid()) | user_id, tier, status, stripe_customer_id |
| push_subscriptions | Push notification subscriptions | Yes | user_id, endpoint, p256dh, auth |
| daily_briefs | Daily brief data | Yes | user_id, date, content |
| journal_queue | Journal background sync | Yes | user_id, entries |
| community_insights | Community-level insights | Yes | user_id, insight data |
| auth_rate_limits | Auth attempt rate limiting | Yes | user_id, endpoint, created_at |
| passkey_challenges | WebAuthn challenge storage | Yes | user_id, challenge, expires_at |
| privacy_consent | Privacy consent records | Yes | user_id, consent data |
| user_credentials | User credential storage | Yes | user_id, credential data |
| unlocked_badges | World badges | Yes | user_id, badge_id |
| user_lifecycle | Lifecycle state machine | Yes (user_id = auth.uid()) | user_id, status, twin_id |
| analytics_events | Analytics tracking | Yes | user_id, event data |

### 9.3 Tables (selfprint schema)

| Table | Purpose | RLS |
|-------|---------|-----|
| users_profiles | User birth/profile data | Via service_role in API |
| blueprints | User AI blueprints | Via service_role in API |
| share_links | Shareable link codes | Via service_role in API |
| performance_metrics | Performance metrics | Via service_role in API |
| autonomy_signals | Autonomy signals | Via service_role in API |

### 9.4 Key Migrations

| Migration | Description |
|-----------|-------------|
| 001_decision_log_autonomy_tracking.sql | decision_log table + RLS |
| 002_profiles_blueprints.sql | selfprint schema + users_profiles/blueprints/share_links |
| 003_core_awakening_ceremony.sql | Rescheduled (depends on twins table) |
| 004_share_links.sql | Share links (selfprint schema) |
| 005_blueprint_prototype_core.sql | Blueprint core tables |
| 006_twin_evolution.sql | twin_evolution tables |
| 007_analytics_events.sql | Analytics events |
| 008_notifications.sql | Notification tables |
| 010_intelligence_core_schema.sql | personal_profiles/memory/patterns/context |
| 011_chat_messages.sql | Chat messages table |
| 012_create_user_credentials.sql | User credentials |
| 013_journal_queue.sql | Journal queue |
| 014_privacy_consent_columns.sql | Privacy consent |
| 015_push_subscriptions.sql | Push subscriptions |
| 016_subscriptions.sql | Stripe subscriptions |
| 017_auth_rate_limits.sql | Auth rate limiting |
| 018_create_passkey_challenges.sql | Passkey challenges |
| 019_daily_briefs.sql | Daily briefs |
| 020_create_decision_tables.sql | decision_outcomes, follow_up_schedule |
| 021_world_preferences.sql | World preferences |
| 022_p0_3_decision_learning.sql | Decision learning (duplicate: also in 030) |
| 024_create_twins_table.sql | Foundation: twins table |
| 025_create_awakening_essence.sql | Awakening essence |
| 026_create_twin_complete_function.sql | Twin complete function |
| 027_optimize_twin_creation.sql | Twin creation optimization |
| 028_consolidate_phase_a_schema.sql | Phase A consolidation |
| 029_phase_a_core_schema.sql | twin_state, twin_personality, conversations, messages |
| 030_phase_a_extended_schema.sql | Evolution, notifications, decision patterns |
| 031_world_stats_fixes.sql | World stats fixes |
| 032_twin_learning_profiles.sql | Learning profiles |
| 033_community_insights.sql | Community insights |
| 034_twin_full_analysis.sql | Full analysis tables |
| 035_forensic_consolidation_2026-09-03.sql | Forensic fix: tables missing from production |
| 20260812000002_fix_decision_logs_uuid.sql | Fix decision_log UUID |
| 20260825_004_twin_visual_dna.sql | Twin visual DNA |
| 20260826_001_onboarding_checkpoints.sql | Onboarding checkpoints |

### 9.5 Additional Migrations (root migrations/)

| File | Description |
|------|-------------|
| 001_feedback_tables.sql | user_feedback, feedback_sentiment, quality_metrics |
| 002_security_tables.sql | csrf_tokens, sessions, rate_limit_log, error_logs |
| 003_twin_world_expertise.sql | twin_world_expertise (RLS via twins.user_id) |
| 004_user_lifecycle.sql | user_lifecycle table (missing from production!) |
| metrics_table.sql | Metrics table |
| autonomy_signals_table.sql | Autonomy signals |

---

## 10. ACTUAL RLS

### 10.1 Policy Patterns

**Pattern 1 — Direct user_id match:**
```sql
USING (auth.uid() = user_id)
```
Applied to: personal_profiles, personal_memory, behavioral_patterns, personal_context, insight_feedback, subscriptions, notification_queue, notification_analytics, notification_schedule, twin_evolution_history, twin_evolution_progress, user_lifecycle, analytics_events, push_subscriptions, daily_briefs, journal_queue, community_insights, auth_rate_limits, passkey_challenges, privacy_consent, user_credentials

**Pattern 2 — Via FK relationship:**
```sql
USING (twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid()))
```
Applied to: twin_world_expertise, decision_patterns, decision_outcomes, follow_up_schedule, twin_memory, twin_capabilities, twin_personality, twin_state, conversations, messages, conversation_settings, conversation_memory, unlocked_badges

**Pattern 3 — Via decision_log FK:**
```sql
USING (decision_id IN (SELECT id FROM decision_log WHERE user_id = auth.uid()::text))
```
Applied to: decision_outcomes, follow_up_schedule

### 10.2 Selfprint Schema Tables

Tables in `selfprint.*` schema (users_profiles, blueprints, share_links) are accessed via **service_role** in API handlers — NOT through RLS. The unified-handler.ts uses getSupabaseAdmin(env) which bypasses RLS entirely.

### 10.3 Security Concerns

1. **selfprint schema bypasses RLS**: All access goes through API with service_role — authorization is handled at application layer (verifyUser), not database layer
2. **decision_log has duplicate RLS definitions**: 001 creates RLS, 020 attempts to recreate (commented out to avoid override)
3. **decision_patterns defined twice**: 020 and 030 both define it with slightly different schemas (020 references auth.users directly, 030 references via twins)

---

## 11. ACTUAL TESTS

### 11.1 Unit Tests (Vitest)

| Location | Count | Framework |
|----------|-------|-----------|
| src/__tests__/ | ~20 files | Vitest |
| src/services/__tests__/ | ~10 files | Vitest |
| src/components/**/*.test.tsx | ~15 files | Vitest + Testing Library |
| src/tests/ | ~5 files | Vitest |

**Test coverage areas:**
- DecisionService, DecisionLearningService, FollowUpScheduler
- AIContext, TwinEvolution, Avatars
- Worlds, TwinWorldsIntegration, Phase E Integration
- MemoryRecorder, FeedbackWidget (with integration tests)
- IntelligencePanel, AskCoach, AnalyticsSummary (dashboard)
- SEO JsonLdSchemas
- Navigation

### 11.2 E2E Tests (Playwright)

| Project | Target | Test Files |
|---------|--------|------------|
| chromium | Production (selfprint.one) | smoke.spec.ts, auth.spec.ts, critical-journey.spec.ts |
| chromium-staging | Staging (selfprint-staging.pages.dev) | twin.spec.ts, decision.spec.ts, upload.spec.ts, world-visual.spec.ts, lifecycle.spec.ts, master-gate.spec.ts |
| Mobile Chrome | Production | smoke.spec.ts |
| Mobile Safari | Production | smoke.spec.ts |

**Smoke tests (SK-01 to SK-12):** Landing page EN/TH, language redirect, OG image, llms.txt, login page, console errors, performance, pricing, navbar

**Master Gate:** 12 tests covering lifecycle, Three.js visuals, intelligent world

### 11.3 Test Issues Identified

| Issue | Classification | Details |
|-------|---------------|---------|
| TWIN-01, TWIN-02, TWIN-03 | Test contract drift | Assert non-existent routes/features; marked skip |
| k6 load tests | Missing implementation | No test files exist; workflow_dispatch only |
| Staging URL inconsistency | Environment issue | playwright.config defaults to staging.selfprint.one (525 SSL); should use selfprint-staging.pages.dev |
| Global setup auth injection | Correction applied | Uses page.reload() + waitForFunction (PLAYWRIGHTCFG-003) |

---

## 12. ACTUAL UX FLOW

### 12.1 Landing Page
- Hero section with H1 ("Who are you really?" / "คุณคือใครกันแน่?")
- CTA: "Give Birth to My AI Twin →" / "ให้กำเนิด AI Twin ของฉัน →"
- WelcomeBackHero for authenticated returning users
- NavBar with Start Free / Log in buttons (hidden on mobile)
- Footer with links to About, Science, Contact, Terms, FAQ, Blog

### 12.2 Onboarding Flow (7 steps)
1. **Emotion Selection** — Pick initial mood
2. **Nova Conversation** — Chat with Nova assistant
3. **AI Creation Trigger** — Request Twin creation
4. **Blueprint Generation** — AI analyzes and creates blueprint
5. **Fine-tuning** — Adjust personality/direction
6. **SICE Analysis** — Score Science/Intuition/Creative/Experience
7. **Claim Twin** — Core Awakening ceremony → Twin born

### 12.3 Post-Onboarding
- **Dashboard** — Main hub with Living Twin visual, panels (intelligence, insights, trends)
- **Chat** — Two modes: Nova (general) and Twin (personalized)
- **Explore** — Discover features
- **Today** — Landing page acts as today/recent view for logged-in users

### 12.4 Known UX Gaps

| Gap | Severity | Description |
|-----|----------|-------------|
| White screen on home for logged-in users | P1 | HOMEBLANK-001 fixed: HomeRoute returns LandingPage instead of null |
| RecoveryRoute double-navigation | P2 | useRecoveryRoute runs once per login; subsequent home navigations go to LandingPage |
| Tailwind not compiled | P0 | ~800 utility classes in 37 files have NO effect — UI relies on custom CSS |
| /chat and /twin shortcut routes | P2 | LangRedirect handles /en vs /th prefix correctly (ROUTELOOP-002 fixed) |

---

## 13. KNOWN BUGS

### 13.1 Critical (P0)

| ID | Description | File | Status |
|----|-------------|------|--------|
| TAILWIND-COMPILE-001 | Tailwind CSS never compiled — no postcss.config.js, @tailwind directive in index.css never imported, Vite has plugin but CSS cascade doesn't include it | src/index.css, vite.config.ts:8 | Documented in build-output.txt |
| user_lifecycle table missing | 004_user_lifecycle.sql exists in root migrations/ but NOT in supabase/migrations/ — never applied to production | migrations/004_user_lifecycle.sql | MISSING IMPLEMENTATION on DB |
| chat_messages table missing | CHATMESSAGES-001/002: saveMessage/getChatHistory reference 'chat_messages' which doesn't exist; rerouted to twin_memories (CHATMESSAGES-003) | services/supabase-service.ts:22-29 | FIXED (rerouted) |

### 13.2 High (P1)

| ID | Description | File | Status |
|----|-------------|------|--------|
| DEBUGLEAK-001 | Multiple API handlers previously returned raw Postgrest errors to clients (schema/table names) — fixed in most places but some paths may still leak | api/unified-handler.ts (multiple locations) | Mostly fixed |
| ENVNAME-001 | API handler reads wrong env var names for Supabase (VITE_* vs SUPABASE_*) — fixed with fallback | api/unified-handler.ts:45-51 | FIXED |
| CF-PAGES-MIGRATION-001 | Buffer.from() used in generateShareCode — fails without nodejs_compat flag — fixed with crypto.getRandomValues | api/unified-handler.ts:748-764 | FIXED |
| STRIPEWH-001 | Stripe webhook constructEvent uses Node crypto — fixed with createSubtleCryptoProvider | api/unified-handler.ts:691-698 | FIXED |
| TWINEVOAUTH-001 | Twin evolution handler had no auth check — fixed by passing verified user | api/unified-handler.ts:370-413 | FIXED |
| NOTIFCOL-001 | Notifications handler uses camelCase column names but DB uses snake_case | api/unified-handler.ts:169-179 | FIXED |
| NOTIFAUTH-001 | Notification POST actions took userId from body — fixed to use verified user.id | api/unified-handler.ts:202-205 | FIXED |

### 13.3 Medium (P2)

| ID | Description | File | Status |
|----|-------------|------|--------|
| CTXMEMO-001 | AuthContext value object recreated every render — fixed with useMemo | AuthContext.tsx:257-267 | FIXED |
| AUTH-LAZY-001 | Session check blocks first paint — fixed with 100ms timeout | AuthContext.tsx:70-130 | FIXED |
| AUTHLAZY-002 | Supabase SDK pulled into entry — fixed with client-lazy | AuthContext.tsx:8 | FIXED |
| LIFECYCLELAZY-001 | lifecycleStore imports Supabase — fixed with client-lazy | lifecycleStore.ts:17 | FIXED |
| LIFECYCLE406-001 | .single() returns 406 for new users — fixed with .maybeSingle() | lifecycleStore.ts:192 | FIXED |
| ROUTELOOP-001/002 | Magic link/OAuth redirect to bare "/dashboard" — fixed with lang prefix | AuthContext.tsx:213-240 | FIXED |
| PRVLAZY-001 | Auth providers statically imported in App.tsx — converted to lazy | App.tsx:20-53 | FIXED |
| DOMDEPTH-001 | 13+ nested provider layers on marketing pages — ConditionalPrivateProviders skips them | App.tsx:332-375 | FIXED |
| NOVAPROV-001 | NovaProvider never mounted — NovaChat throws useNova() error | App.tsx:208 | FIXED (mounted in route) |
| A2-LAZY/A3-LAZY | TwinEvolution/ExperienceProvider pull chunk-intelligence into entry — made conditional | App.tsx:304-312, 291-299 | FIXED |
| CSS-SPLIT-001 | Page-scoped CSS imported in App.tsx hoisted to entry — moved to consumer components | App.tsx:91-103 | FIXED |
| CHUNK-GROUPS-001 | manualChunks didn't work in Rolldown — switched to codeSplitting.groups | vite.config.ts:80-186 | FIXED |
| CLOCK-SKEW-FIX | Device clock behind causes JWT future error — refresh session then retry | lifecycleStore.ts:281-327 | FIXED |
| API504-002/004/005 | Vercel runtime legacy mode timeout; action param empty string; decisionStyle validation — all fixed | api/unified-handler.ts:1055-1082, various | FIXED |
| CFBUFFER-001 | Buffer.from in share code generation — replaced with crypto | api/unified-handler.ts:748-764 | FIXED |

### 13.4 Low (P3)

| ID | Description | File |
|----|-------------|------|
| Duplicate decision_patterns definition | 020 and 030 both define decision_patterns with different schemas | supabase/migrations/020, 030 |
| twin_memory vs twin_memories naming | 029 creates twin_memory (singular), app uses twin_memories (plural) | supabase/migrations/029, services/supabase-service.ts |
| Unused tables in migrations/ | 001-004 in root migrations/ may not be applied to production | migrations/001-004.sql |
| Ghost code references | profiles_blueprints, pattern_analysis, detected_patterns, alerts referenced in 035 but 0 importers | 035_forensic_consolidation.sql |

---

## 14. DOCUMENTATION CONTRADICTIONS

| Document | Says | Code Actually Does | Correct Behavior |
|----------|------|-------------------|------------------|
| README.md | "Tailwind CSS v4 configured" | Tailwind plugin loaded in vite.config.ts but @tailwind directive in index.css never imported — utility classes have NO effect | Either import index.css properly or acknowledge Tailwind is non-functional |
| README.md | "k6 load tests available" | No loadtest-smoke.js or loadtest.js files exist; workflow has continue-on-error for k6 jobs | Remove k6 from documentation or implement tests |
| README.md | "MASTER GATE 100% PASS" | 31 tests skipped (auth/Twin guard skips); skipped tests not counted as failures but not "passing" either | Report as "69 passed / 31 skipped" |
| README.md | Nav tabs: Today/Explore/Chat/Dashboard/Menu | Actual routes: / (Landing), /explore, /chat/twin, /dashboard, /menu — matches but "Today" is actually LandingPage | Clarify terminology |
| MIGRATION 004_user_lifecycle.sql | "CRITICAL FIX: user_lifecycle table never existed" | File exists in root migrations/ but NOT in supabase/migrations/ — likely never applied to production | Move to supabase/migrations/ or document as applied manually |
| FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md | Various claims about production state | Must be verified against actual production DB — cannot confirm from repo alone | UNKNOWN — REQUIRES VERIFICATION |
| MASTER_GATE_AS_IS.md | Claims about staging bundle state | Requires live verification against selfprint-staging.pages.dev | UNKNOWN — REQUIRES VERIFICATION |

---

## 15. P0 — PRODUCTION BLOCKERS

| # | Issue | Impact | Fix Required |
|---|-------|--------|--------------|
| P0-1 | **Tailwind CSS not compiled** | ~800 utility classes across 37 files have zero effect — entire UI built on non-functional styling | Import index.css properly in main.tsx or migrate all styles to Tailwind v4 composition API |
| P0-2 | **user_lifecycle table may not exist in production** | Lifecycle state machine (ONBOARDING→ANALYSIS→AWAKENING→TWIN_ALIVE→WORLD_ACTIVE) silently fails | Apply migrations/004_user_lifecycle.sql to production |
| P0-3 | **Supabase project mismatch for staging** | Staging uses same Supabase project as production (per corrections.md) — DNS/SSL issues on staging.selfprint.one | Use selfprint-staging.pages.dev consistently; fix DNS for staging.selfprint.one |

---

## 16. P1 — CRITICAL

| # | Issue | Impact | Fix Required |
|---|-------|--------|--------------|
| P1-1 | **selfprint schema bypasses RLS** | All selfprint.* table access goes through service_role — authorization depends entirely on application-layer verifyUser() | Add RLS policies to selfprint schema tables OR document as intentional design |
| P1-2 | **Duplicate decision_patterns table** | Two migrations define the same table with different schemas — risk of confusion and inconsistent behavior | Consolidate to single definition |
| P1-3 | **twin_memory vs twin_memories naming inconsistency** | 029 creates twin_memory but app queries twin_memories — one will fail | Rename table or update app code consistently |
| P1-4 | **Staging URL inconsistency in playwright.config.ts** | Default baseURL is staging.selfprint.one (525 SSL) but actual staging is selfprint-staging.pages.dev | Update default to selfprint-staging.pages.dev |
| P1-5 | **No e2e/global-setup.ts auth state file in git** | .auth/user.json is gitignored — CI must regenerate auth state every run | Ensure CI pipeline has E2E_SUPABASE_URL/E2E_SUPABASE_ANON_KEY secrets |

---

## 17. P2 — IMPORTANT

| # | Issue | Impact | Fix Required |
|---|-------|--------|--------------|
| P2-1 | **Missing error boundary on lazy-loaded routes** | Suspense fallback=null on many routes — if a lazy component throws during load, nothing renders | Add ErrorBoundary wrappers around lazy routes |
| P2-2 | **Zustand stores not synced with DB** | twinStore.messages persisted to localStorage only — not synced to DB | Add sync mechanism or document as client-only |
| P2-3 | **No loading states on some API calls** | Some components make API calls without visible loading indicators | Add Skeleton/loading states |
| P2-4 | **SEO metadata incomplete** | react-helmet-async used but not all pages have proper meta tags | Audit all pages for title/description/OG tags |
| P2-5 | **Accessibility gaps** | Some modals/drawers may lack focus trap, ARIA labels | Audit interactive components |
| P2-6 | **Mobile viewport issues** | NavBar buttons hidden on mobile but hero-CTA present — ensure consistent mobile experience | Test on Pixel 5 / iPhone 12 viewports |

---

## 18. P3 — POLISH

| # | Issue | Impact | Fix Required |
|---|-------|--------|--------------|
| P3-1 | **Unused migration files in root/** | migrations/001-004.sql duplicated from supabase/migrations/ | Consolidate or remove duplicates |
| P3-2 | **Ghost code references** | 035 references tables with 0 importers (alerts, detected_patterns, etc.) | Remove ghost code or implement |
| P3-3 | **Bundle size optimization** | chunk-intelligence at 345 KB raw / 87 KB gzip | Further code splitting or tree-shaking |
| P3-4 | **Comment cleanup** | Extensive Thai comments throughout codebase | Consider standardizing comment language |
| P3-5 | **@ts-nocheck in unified-handler.ts** | Line 6: `@ts-nocheck Supabase types don't match schema` | Fix type definitions |

---

## 19. PRODUCTION GATE STATUS

| Gate | Status | Evidence |
|------|--------|----------|
| TypeScript 0 errors | UNKNOWN — requires running `npm run typecheck` | Cannot execute without bash approval |
| Lint 0 errors | UNKNOWN — requires running `npm run lint` | Cannot execute without bash approval |
| Build PASS | UNKNOWN — requires running `npm run build` | Cannot execute without bash approval |
| Unit tests PASS | UNKNOWN — requires running `npm test` | README claims 1042/1042 pass |
| E2E Phase A PASS | UNKNOWN — requires running `npm run test:e2e -- --project=chromium` | README claims 27/27 |
| E2E Mobile PASS | UNKNOWN — requires running `npm run test:e2e -- --project="Mobile Chrome"` | README claims 24/24 |
| E2E Phase B PASS | UNKNOWN — requires staging Supabase credentials | README claims 25/25 |
| Auth PASS | Partially verified | AuthContext, PasskeyProvider, global-setup.ts audited |
| Authorization PASS | Partially verified | RLS policies audited; selfprint schema relies on app-layer auth |
| RLS PASS | Partially verified | Policies present on public.* tables; selfprint.* bypasses RLS |
| User isolation PASS | Partially verified | RLS uses auth.uid() = user_id pattern consistently |
| DB persistence PASS | UNKNOWN — requires live DB verification | Tables exist in migrations; apply status unknown |
| API PASS | Partially verified | unified-handler.ts, dedicated functions audited |
| Error handling PASS | Partially verified | DEBUGLEAK-001 fixes applied; some paths may still leak |
| Loading states PASS | UNKNOWN — requires visual inspection | Skeleton component exists; coverage unclear |
| Empty states PASS | UNKNOWN — requires visual inspection | Not systematically audited |
| Mobile PASS | UNKNOWN — requires visual/automated testing | Playwright Mobile projects defined |
| Desktop PASS | UNKNOWN — requires visual testing | Playwright Desktop Chrome defined |
| Accessibility PASS | UNKNOWN — requires audit | Semantic HTML, ARIA not systematically checked |
| SEO PASS | UNKNOWN — requires audit | HelmetProvider configured; per-page audit needed |
| Performance ACCEPTABLE | Partially verified | Code splitting, lazy loading, PWA configured |
| PWA PASS | Partially verified | sw.js, VitePWA injectManifest configured |
| Production deploy PASS | UNKNOWN — requires deployment verification | GitHub Actions configured for CI |
| Monitoring PASS | Partially verified | Sentry integrated (@sentry/react) |
| **No P0 blockers** | FAIL | P0-1, P0-2, P0-3 identified |
| **No unresolved P1** | FAIL | P1-1 through P1-5 identified |

**Overall Status: NOT 100% PRODUCTION READY**

Blockers:
1. Tailwind CSS compilation must be resolved (P0-1)
2. user_lifecycle table must exist in production (P0-2)
3. Staging infrastructure must be stable (P0-3)
4. selfprint schema RLS must be addressed (P1-1)
5. E2E test execution must be verified (all gates require actual test runs)

---

## 20. EVIDENCE / FILE REFERENCES

### Source Code References

| Category | Key Files |
|----------|-----------|
| App/Routing | src/App.tsx (447 lines) |
| Auth | src/context/AuthContext.tsx (278 lines) |
| Stores | src/store/{user,twin,lifecycle,decision,analysis}Store.ts |
| Contexts | src/context/{Auth,Emotion,Twin,AI,World,Experience,Evolution,Environment,Popup,Audio,Hub,Subscription,Language,Theme,Nova}.tsx |
| Services | src/services/{supabase-service,DecisionService,DecisionLearningService,FollowUpScheduler,CoreAwakeningService,NovaAPIService,stripeService,SICEOrchestratorImpl,*}.ts |
| Pages | src/pages/*.tsx (47 page files) |
| Components | src/components/{primitives,ui,composites,dashboard,twin,chat,intelligence,onboarding,audio,pwa,auth,*}.tsx |
| Lib | src/lib/{intelligence,supabase,auth,archetypes,visual,voice-personality,worlds,*}.ts |
| API | api/unified-handler.ts (1082 lines), api/_utils/*.ts |
| Functions | functions/api/{[[route]],nova,nova-stream,twin,twin-stream,metrics,autonomy-log,og,ai-provider}.ts |
| Types | src/types/{sice,feedback,decision,badges}.ts |

### Database References

| Category | Key Files |
|----------|-----------|
| Core Schema | supabase/migrations/024_create_twins_table.sql, 029_phase_a_core_schema.sql |
| Extended Schema | supabase/migrations/030_phase_a_extended_schema.sql |
| Intelligence | supabase/migrations/010_intelligence_core_schema.sql |
| Decisions | supabase/migrations/020_create_decision_tables.sql |
| Subscriptions | supabase/migrations/016_subscriptions.sql |
| Forensic Fix | supabase/migrations/035_forensic_consolidation_2026-09-03.sql (1391 lines) |
| Root Migrations | migrations/{001,002,003,004}_*.sql |

### Configuration References

| File | Purpose |
|------|---------|
| package.json | Dependencies, scripts |
| vite.config.ts | Build config, PWA, code splitting |
| tsconfig.json/tsconfig.app.json | TypeScript config |
| tailwind.config.js | Tailwind config |
| playwright.config.ts | E2E test config |
| wrangler.toml | Cloudflare Pages config |
| vitest.config.ts | Unit test config |
| .oxlintrc.json | Lint config |
| .github/workflows/testing.yml | CI pipeline |
| .env.example | Env var template |
| .env.production | Production env |
| .env.e2e.staging | E2E staging env |

### Test References

| File | Type |
|------|------|
| e2e/smoke.spec.ts | Production smoke (SK-01 to SK-12) |
| e2e/auth.spec.ts | Auth tests |
| e2e/critical-journey.spec.ts | Critical journey tests |
| e2e/twin.spec.ts | Twin creation (TWIN-01 to TWIN-05) |
| e2e/decision.spec.ts | Decision tests |
| e2e/lifecycle.spec.ts | Lifecycle tests |
| e2e/master-gate.spec.ts | Master gate tests |
| e2e/global-setup.ts | Playwright global setup |
| src/__tests__/*.test.ts | Unit tests |
| src/services/__tests__/*.test.ts | Service unit tests |
| src/components/**/__tests__/*.test.tsx | Component tests |

---

## REPAIR ORDER (Proposed)

1. **P0-1**: Fix Tailwind CSS compilation — verify if Tailwind v4 composition API is being used or if postcss migration is needed
2. **P0-2**: Apply migrations/004_user_lifecycle.sql to production
3. **P0-3**: Stabilize staging infrastructure — ensure consistent URL usage
4. **P1-1**: Address selfprint schema RLS gap
5. **P1-2**: Consolidate decision_patterns table definition
6. **P1-3**: Fix twin_memory/twin_memories naming
7. **P1-4**: Fix playwright.config.ts default staging URL
8. **P1-5**: Verify CI auth state regeneration
9. **P2-1 through P2-6**: Implement loading/error/empty states, accessibility improvements
10. **P3 items**: Cleanup, optimization, documentation

---

## FINAL NOTE

This reality map is based on **code forensics only**. Several items marked "UNKNOWN — REQUIRES VERIFICATION" need:
- Actual `npm run typecheck` execution
- Actual `npm run lint` execution
- Actual `npm run build` execution
- Actual `npm test` execution
- Actual `npm run test:e2e` execution against live staging
- Live production database schema verification

The system shows extensive iterative fixing (see fix prefixes like HOMEBLANK-001, DEBUGLEAK-001, CTXMEMO-001, etc.) indicating active development with many bugs already identified and patched. The remaining blockers are primarily infrastructure (Tailwind compilation, staging URL) and database consistency issues rather than fundamental architectural problems.
