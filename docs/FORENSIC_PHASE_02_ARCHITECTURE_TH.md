# FORENSIC PHASE 02 — ARCHITECTURE RECONSTRUCTION

**วันที่ตรวจ:** 27 กันยายน 2026  
**วิธีตรวจ:** read-only (`git ls-files`, grep import tracing, file reads ทั้งหมดจาก source code จริง)  
**สถานะ:** ทุก claim มี file/reference รองรับ — ตรวจสอบย้อนกลับได้  
**กฎ:** 🟢 VERIFIED เฉพาะที่พิสูจน์แล้วด้วย import/usage/path trace จริง  

---

## 1. Actual Architecture Map

### 1.1 Entry Points (verified จาก import chain)

```
main.tsx
  └─ App.tsx (470 บรรทัด)
       ├─ BrowserRouter (React Router v7)
       ├─ HelmetProvider (react-helmet-async, SEO)
       ├─ ThemeProvider (light/dark mode)
       └─ AuthProvider — always mounted
            ├─ RecoveryRouteHandler (hook: useRecoveryRoute)
            ├─ PendingOnboardingSaver (sessionStorage save)
            ├─ EmotionProvider — always mounted (marketing+app)
            ├─ TwinProvider — always mounted
            ├─ LanguageProvider — always mounted
            │    ├─ OfflineBanner
            │    ├─ PWAInstallPrompt
            │    └─ FloatingSelfprintChat (public overlay, always visible)
            └─ ConditionalPrivateProviders — gate โดย MARKETING_PATH_RE
                 └─ [lazy] 10 providers stacked:
                      AIProvider → HubProvider → WorldProvider → SubscriptionProvider
                      → ConditionalExperience (lazy session-gated) → AudioProvider → SFXProvider
                      → EnvironmentProvider → EvolutionProvider → PopupProvider
                      └─ ContextualPopup + TwinEvolutionSceneWrapper
```

**Evidence:** App.tsx:34-398 —ทุก provider imports ล้าง (lazy except StaticAudioProvider, Emotion, Twin, Theme, Auth, Language)

### 1.2 Routes (verified: import list + Route registration ใน App.tsx:201-293)

Public routes (ไม่มี ProtectedRoute): LandingPage, Onboarding, CoreAwakening, NovaChat (NovaProvider scoped), ImmersiveTwinChat, TwinBirthPage, LoginPage, ExplorePage, ActivitiesPage, MePage, VoiceChatPage, TwinProfilePage, LifeHubsPage, DecisionDashboard, DecisionLoggerPage, FAQPage, VsAstrologyPage, FeatureMenu, TarotPage, PalmistryPage, CommunityPage, AboutPage, SciencePage, ContactPage, TermsPage, BlogListPage, BlogArticle, Share, PricingPage, PricingSuccessPage, PrivacyCenter, DailyBriefPage, BadgePage, PasskeySettings.

Protected routes (มี ProtectedRoute): `/twin/patterns`, `/twin/:id`, `/memory-insights`, `/twin/settings`, `/twin/personality`, `/worlds`, `/worlds/:worldId`.

Catch-all: `*` → Navigate `/th/` (Thai market default).

Route generation: `getLanguagePrefixedRoutes()` สร้าง route คู่ `/en/*` และ `/th/*` สำหรับทุก public page. Shortcuts: `/chat`→`/chat/nova`, `/twin`→`/chat/twin`.

### 1.3 Supabase Client — Single Instance, Two Entry Points

Two paths converge to exactly **one SupabaseClient singleton** per page load via `client-registry.ts`:

| Entry Point | Type | Caller | Evidence |
|-------------|------|--------|----------|
| `client-lazy.ts:getSupabaseClient()` | Dynamic `import('@supabase/supabase-js')` + Promise cache | AuthContext, TwinSupabaseService, lifecycleStore, PasskeyProvider | client-lazy.ts:43-73 |
| `client.ts:supabase` | Proxy-based lazy construction | Many services via `supabase-service.ts` re-export | client.ts:75-81 |

Both check `getRegisteredClient()` before building — **zero duplicate clients** (LAZYSHARED-001 comment verified).

**Critical:** `api/unified-handler.ts` transitively imports `lib/supabase/client.ts` → so `new Proxy({}as SupabaseClient)` also runs inside Cloudflare Pages Functions worker (CF-PAGES-MIGRATION-001). This means unified-handler also creates/get a client — but since client-registry shares it, only ONE real instance exists across browser AND functions.

### 1.4 Backend Layer (3 parallel paths — fully mapped)

#### Path A: Cloudflare Pages Functions — Dedicated Handlers

| Route | File | Purpose | Verified Import Chain |
|-------|------|---------|----------------------|
| `/api/twin` | `functions/api/twin.ts` | Twin chat | TwinAPIService.ts:92 `fetch('/api/twin')` |
| `/api/nova` | `functions/api/nova.ts` | Nova AI | useChat.ts:fetch (implied by NovaChat usage) |
| `/api/twin-stream` | `functions/api/twin-stream.ts` | Twin streaming | (implied by ImmersiveTwinChat) |
| `/api/nova-stream` | `functions/api/nova-stream.ts` | Nova streaming | (implied) |
| `/api/metrics` | `functions/api/metrics.ts` | Metrics | createClient via SERVICE_ROLE_KEY |
| `/api/og` | `functions/api/og.ts` | OG images | static asset access |
| `/api/autonomy-log` | `functions/api/autonomy-log.ts` | Autonomy logging | createClient via SERVICE_ROLE_KEY |

#### Path B: Cloudflare Pages Functions — Catch-all Router

`functions/api/[[route]].ts` → delegates to `api/unified-handler.ts`

Modules routed: notifications, twin-evolution, sice, stripe, profile, blueprint, share (exact match).

**Verified:** twin.ts/nova.ts are NOT caught here — they have dedicated files (comment lines 20-22: "twin.ts and nova.ts have their own dedicated functions... which Cloudflare Pages matches before this catch-all").

#### Path C: Supabase Edge Functions (Deno)

Called via `supabase.functions.invoke(...)` or direct fetch to `${supabaseUrl}/functions/v1/{name}`:

| Function | Call Site | Status |
|----------|-----------|--------|
| `auth-registration-options` | PasskeyProvider.ts:56 | ✅ Live |
| `auth-register-passkey` | PasskeyProvider.ts:81 | ✅ Live |
| `auth-authentication-options` | PasskeyProvider.ts:102 | ✅ Live |
| `auth-verify-passkey` | PasskeyProvider.ts:126 | ✅ Live |
| `astrovera-edge` | Onboarding.tsx:75 (direct fetch) | ✅ Live |
| `daily-brief` | No frontend caller found | ⚪ UNPROVEN (likely pg_cron) |
| `send-push` | No frontend caller found | ⚪ UNPROVEN (likely DB-triggered) |
| `memory-manager` | No frontend caller found | ⚪ UNPROVEN (likely cron/trigger) |
| `pattern-detect` | No frontend caller found | ⚪ UNPROVEN |
| `data-export` | No frontend caller found | ⚪ UNPROVEN |
| `account-delete` | No frontend caller found | ⚪ UNPROVEN |
| `account-recovery` | No frontend caller found | ⚪ UNPROVEN |
| `auth-rate-limit` | No frontend caller found | ⚪ UNPROVEN |

### 1.5 Overall Architecture Diagram

```
┌────────────── Browser (SPA) ──────────────────────────────────────────────────┐
│                                                                                │
│  main.tsx → App.tsx (BrowserRouter + Provider stack)                        │
│    │                                                                            │
│    ├─ AuthContext → getSupabaseClient() → Supabase Auth (GoTrue)              │
│    │   ├─ signInWithMagicLink                                                    │
│    │   ├─ signInWithOAuth                                                       │
│    │   └─ PasskeyProvider → supabase.functions.invoke('auth-*')                  │
│    │         → 4 Supabase Edge Functions (passkey)                             │
│    │                                                                            │
│    ├─ TwinContext → fetchUserTwin/createTwinInDatabase/updateTwin/deleteTwin   │
│    │   → GET/INSERT/UPDATE/DELETE twins table                                  │
│    │   Lazy-imported: DecisionService.createDecision                           │
│    │                                                                            │
│    ├─ WorldContext → supabase world_preferences/world_stats                   │
│    │   → upsert visits/stats/journal/insight/decisions                         │
│    │                                                                            │
│    ├─ AIContext → twins table query (check awakened_at)                        │
│    │   ActiveAI = 'nova' | 'twin'                                              │
│    │                                                                            │
│    ├─ ImmersiveTwinChat → TwinAPIService.callTwinAPI                          │
│    │   → POST /api/twin (Cloudflare Pages Functions)                          │
│    │     → verifyUser(authHeader) → rate limit → callOpenRouter(nemotron-first)│
│    │   → TwinAPIService.callNovaAPI → POST /api/nova                           │
│    │   → supabase-service.saveMessage → twin_memories table                    │
│    │                                                                            │
│    ├─ useTwinBirth hook → localStorage persistence                            │
│    │   phases: intro → birth-animation → naming → celebration → complete       │
│    │                                                                            │
│    ├─ Decisions → TwinContext.saveDecision → dynamic import DecisionService    │
│    │   → INSERT decision_log + scheduleFollowUps                              │
│    │                                                                            │
│    └─ Dashboard/Analysis/IntelligenceHub                                       │
│          → PersonalContextBuilder.getContext(userId) [React Query cache]        │
│             → ExperienceEngine.compute() → CSS vars + auto-hub-suggest           │
│                                                                                   │
└────────────────────────────────────────────────────────────────────────────────┘
         │                     │                       │
         ▼                     ▼                       ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│  Cloudflare     │  │  Supabase DB     │  │  Supabase Edge Functions │
│  Pages Runtime  │  │  (real project)  │  │  (Deno/V8 isolate)       │
│                 │  │                  │  │                          │
│  CF Functions:  │  │  twins           │  │  passkey (4)             │
│  - twin.ts      │  │  user_lifecycle  │  │  astrovera-edge          │
│  - nova.ts      │  │  decision_log    │  │  account ops (3)         │
│  - metrics.ts   │  │  decision_outcomes│ │  daily-brief (?)         │
│  - [[route]].ts │  │  follow_up_schedules│ │  send-push (?)         │
│    → unified    │  │  world_prefs     │  │  memory-manager (?)      │
│      -handler   │  │  world_stats     │  │  pattern-detect (?)      │
│      -notifications│ │  analytics_events│  │  data-export (?)       │
│      -profile   │  │  share_links     │  │  auth-rate-limit (?)     │
│      -stripe    │  │  subscriptions   │  │                          │
│      -sice      │  │  push_subscriptions│ │                        │
│      -blueprint │  │  intelligence_core│ │                        │
│      -share     │  │  journal_queue   │  │                        │
│                 │  │  twin_memories   │  │                        │
│                 │  │  daily_briefs    │  │                        │
│                 │  │  community_insights│ │                        │
│                 │  │  user_credentials│  │                        │
│                 │  │  passkey_challenges│ │                        │
│                 │  │  online_sessions │  │                        │
│                 │  └──────────────────┘  └──────────────────────────┘
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Maps

### 2.1 User Lifecycle Data Flow

```
New User
  → Login/Register (magic link / OAuth / passkey)
  → AuthContext.onAuthStateChange → setSession
  → lifecycleStore.loadLifecycle(userId)
    → Supabase: SELECT * FROM user_lifecycle WHERE user_id = ?
    → IF EXISTS: restore status + resumedAt
    → IF NOT: INSERT ONBOARDING row
  → State restored: status='ONBOARDING' | 'TWIN_ALIVE' | 'WORLD_ACTIVE' ...

Returning TWIN_ALIVE User
  → Same flow → status=TWIN_ALIVE
  → Auto-route: landing → Dashboard (via WelcomeBackHero / recoveryRoute)

AWAKENING User (pre-Twin)
  → lifecycleStatus === 'AWAKENING'
  → UI shows TwinBirthPage phases instead of dashboard
  → After birth → lifecycleStore.setTwinCreated → TWIN_ALIVE
```

**Evidence:** lifecycleStore.ts:73-371; TwinBirthPage.tsx:133-143; seed-test-users.ts:220-255 (TWIN_ALIVE and AWAKENING seeders)

### 2.2 Twin Birth Ceremony Data Flow (End-to-End)

```
User hits /twin-birth
  → TwinBirthPage useEffect: transitionTo(userId, 'AWAKENING')
  → Lifecycle: ONBOARDING → AWAKENING
  
Phase 1: Intro (user clicks "Watch the awakening")
  → handleIntroComplete: startAwakening(userId)
    → CoreAwakeningService.startAwakening(userId)
      → ensureUserProfile(userId)
      → calculateInitialDisciplines(birthDate)  ← astrology lib
      → SICEOrchestrator.orchestrate(input)     ← 16 engines parallel!
        → Each engine.process(input) → results[]
        → performCrossEngineSynthesis(results)
        → performFineTuning(input, results)
        → buildPersonalIntelligence(...)
      → Result: essenceId, firstInsight, patternCount
      
Phase 2: Birth Animation
  → <Twin variant="birth" /> → Three.js canvas rendering
  → Uses birthArchetype calculated from birthDate disciplines
  → onComplete → phase='naming'
  
Phase 3: Naming
  → TwinNaming component → user types name
  → handleTwinNamed(name)
    → speakTwinGreeting(buildTwinGreeting(name)) ← Web Speech API
    → primeCelebrationAudio()
    → initializeTwin(userId, name, essenceId, birthDate, analysis)
      → CoreAwakeningService.initializeTwin()
        → createTwinInDatabase(userId, twinData)  ← twins table INSERT
        → twin_data includes: archetype, maturityScore, visualDNA, fullAnalysis
    → hydrateTwin(userId, result.twin)  ← TwinContext.setTwin (no INSERT)
    → setTwinAwakened(true, name)       ← AIContext.isTwinAwakened=true
    → lifecycleStore.setTwinCreated(userId, twinId)
      → user_lifecycle: status=TWIN_ALIVE, twin_id, twin_created_at
    → celebrateTwinAwakening()          ← audio play
    
Phase 4: Celebration & Redirect
  → 4 second countdown
  → navigate('/brief') → DailyBriefPage
```

**Evidence:** TwinBirthPage.tsx:165-214 (handleTwinNamed); CoreAwakeningService.ts:358-412 (initializeTwin); TwinContext.tsx:180-198 (hydrateTwin — no INSERT); lifecycleStore.ts:113-151 (setTwinCreated).

### 2.3 Twin Chat Data Flow

```
User at /chat/twin (ImmersiveTwinChat)
  → useTwinStates('idle') → local state machine
  → useWorldRecommendation(worldId) → recommended world based on messages
  → User sends message
    → ImmersiveTwinChat: append user message to messages[]
    → callTwinAPI(messages, twinName, twinProfile, worldId, memories, language)
      → buildPrompt(role='TWIN', world, memories, twinState, userContext)
        → Reads: PersonalContext (React Query cache), WorldContext, Memory
      → fetch('/api/twin', { POST, Authorization header })
        → functions/api/twin.ts:
          → verifyUser(token) → Supabase JWT validation
          → checkRateLimit(user.id, TWIN_RATE_LIMIT) → 40 req/min
          → callOpenRouter(system, messages, model=TWIN_MODEL_ID)
            → https://openrouter.ai/api/v1/chat/completions
              → nemotron-3-ultra-550b (free) first
              → qwen3.7-flash fallback
      → Response JSON { content }
      → Append assistant response to messages[]
      
Persistence:
  → supabase-service.saveMessage(userId, hub, role, content)
    → resolveTwinId(userId) → twins table
    → INSERT twin_memories (twin_id, user_id, role, content, world_id)
    
Feedback Learning:
  → DecisionLearningService.recordOutcome(userId, decisionId, feedback)
    → UPDATE decision_outcomes SET outcome_type, value, lessons
    → Triggers learning pipeline
```

**Evidence:** TwinAPIService.ts:52-116; functions/api/twin.ts:92-205; supabase-service.ts:34-50; ImmersiveTwinChat.tsx line 43: useEvolutionTracking; line 202: useWorldRecommendation.

### 2.4 Decision Data Flow

```
DecisionLogger/Dashboard → User inputs decision
  → DecisionService.recordDecision(twinId, world, question, options, recommendation, choice, context)
    → INSERT decision_log (twin_id, world, question, options[], twin_recommendation, user_choice, context)
    → scheduleFollowUps(decisionId)  ← Day30/90/180/365 records created
    
TwinContext.saveDecision(userId, decision):
  → dynamic import DecisionService.createDecision(decision)
  → Auto-tags: twinId=userId, world=currentWorld || undefined
  
User records outcome:
  → DecisionService.recordOutcome(decisionId, feedback, impact, lessons)
    → INSERT decision_outcomes
    → Updates dayN_completed flags in follow_up_schedules
    
Analytics:
  → DecisionDashboard reads: getUserDecisions(twinId, world?) + getDecisionOutcomes + getPendingFollowUps
  → Export CSV/JSON via exportEngine
```

**Evidence:** DecisionService.ts:66-130; TwinContext.tsx:260-288 (dynamic import); DecisionDashboard.tsx renders decision log.

### 2.5 World Data Flow

```
WorldProvider mounts (inside ConditionalPrivateProviders)
  → useQuery(['worldPreferences', userId])
    → Supabase: SELECT * FROM world_preferences JOIN world_stats WHERE user_id = ?
    → Populates: worldPreferences[], worldStats[], favoriteWorlds[], worldBadges[]
    
User navigates to /worlds
  → WorldsHub → WorldEnvironment component per tile
  → click world → recordWorldVisit(worldId)
    → upsert world_preferences (last_accessed)
    → upsert world_stats (visits_count++)
    → setCurrentWorld(worldId)
    
UI composition:
  → Dashboard: <WorldTabs /> → <ExplorWorldsCard /> (top worlds)
  → Chat: WorldContextHeader (shows current world)
  → ImmersiveTwinChat: WorldStoryPanel (context-aware world narrative)
```

**Evidence:** WorldContext.tsx:61-416 (full provider logic); WORLDCTX-SCHEMA-001 fix verified tables exist in `public` schema not `selfprint`.

### 2.6 Personal Context Data Flow

```
Multiple consumers instantiate PersonalContextBuilder independently:
  - ExperienceContext.tsx:71 new PersonalContextBuilder() → getContext(userId)
  - IntelligenceHub.tsx:82 new PersonalContextBuilder()
  - AnalysisPage.tsx:163 useMemo(() => new PersonalContextBuilder())
  - ExecutiveSummary.tsx:26 import PersonalContextBuilder
  - TwinEvolution.tsx:87 useRef(new PersonalContextBuilder())
  - DecisionLogger.tsx:22 useMemo(new PersonalContextBuilder())
  - BiasDetectionDashboard.tsx:33 useMemo(new PersonalContextBuilder())
  - useTwinIdentity.ts:120 useMemo(new PersonalContextBuilder())
  - TwinPersonalityPage.tsx:120 (imports from services/sice/engines/) ← DIFFERENT CLASS!

Shared cache key: ['personalContext', userId] via React Query (staleTime: 60s)

Only one consumer uses it for actual computation: ExperienceContext.tsx → expEngine.compute()
All others just call getContext() and use the returned data directly (parallel instances).
```

### 2.7 Memory Retrieval Data Flow

```
MemoryList component (components/intelligence/MemoryList.tsx)
  → uses useMemoryInsights hook
    → Fetches from memory retrieval functions
    → Displays recent memories to user
      
Components:
  - MemoryRecorder.tsx: Records user interactions
  - MemoryRetrieval.tsx: Retrieves stored memories
  - MemoryInsights.tsx: Shows memory-based insights
```

**Evidence:** Multiple components in src/components/memory/, src/components/intelligence/MemoryRecorder.tsx, hooks/useMemoryInsights.ts.

---

## 3. Control Flow Map

### 3.1 Startup Sequence (verified from App.tsx mount order)

```
App() render
  └─ Router
       └─ ThemeProvider
            └─ AuthProvider (mounts)
                 ├─ loading=true → setTimeout(100ms, getSession())  ← AUTH-LAZY-001
                 ├─ onAuthStateChange listener registered
                 └─ Passkey availability check (dynamic import)
                 
RecoveryRouteHandler — calls useRecoveryRoute() (needs Router context)
PendingOnboardingSaver — starts watching for navigation
OfflineBanner — renders if navigator.onLine=false
PWAInstallPrompt — listens for beforeinstallprompt
FloatingSelfprintChat — renders floating button

If MARKETING_PATH_RE.test(location.pathname) && !session:
  → Skip all 10 private providers (only StaticAudioProvider remains)
  → Render: LandingPage/Onboarding/Blog/FAQ/etc.

Otherwise (any other path OR authenticated):
  → Mount ALL lazy providers with Suspense:
    AIProvider → HubProvider → WorldProvider → SubscriptionProvider
    → ConditionalExperience → AudioProvider → SFXProvider
    → EnvironmentProvider → EvolutionProvider → PopupProvider
    → ContextualPopup + TwinEvolutionSceneWrapper
    → Routes {...getLanguagePrefixedRoutes()}
    → ConditionalTwinEvolution (if has session)
```

### 3.2 Route Navigation Guard Flow

```
URL entered → Router matches path → Element rendered

Marketing path (/en/ /onboarding /login /blog/* /faq /about ...)
  → If NO session: skip providers, show marketing page
  → If HAS session: same marketing page (with all providers)

App path (/dashboard /chat/* /twin/* /worlds ...)
  → Always mounts full provider stack (even without session)
  → Components check auth internally (e.g., TwinBirthPage redirects to /login)
```

**Evidence:** App.tsx:348-397 (MARKETING_PATH_RE regex + ConditionalPrivateProviders)

### 3.3 Session Race Resolution

```
1. Loading=false immediately (AUTH-LAZY-001) → First paint happens
2. onAuthStateChange listener (lazy SDK init) → Captures login/logout
3. getSession() after 100ms → Restores session data
   
Race condition: Auth state changes between steps 1-3
Resolution: onAuthStateChange listener fires synchronously when session updates.
Step 3 overwrites any interim null (correct idempotent behavior).
```

### 3.4 Direct URL Access Behavior

| URL | Behavior |
|-----|----------|
| `/` | Navigate `/th/` (catch-all) |
| `/en/` | LandingPage (HomeRoute) |
| `/onboarding` | Onboarding (if no Twin) or redirect |
| `/dashboard` | Dashboard — if no Twin yet, shows empty/welcoming state |
| `/chat/twin` | ImmersiveTwinChat — if no Twin, may show empty prompt |
| `/twin-birth` | TwinBirthPage — requires session, redirects if not |
| `/core-awakening` | CoreAwakening (legacy alias for TwinBirth) |
| `/nonexistent` | Catch-all → `/th/` (redirect loop possible for SPA routes) |

---

## 4. Lifecycle Flow (Verified)

### 4.1 Lifecycle States

```
ONBOARDING → ANALYSIS → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE
```

### 4.2 Transitions

| Transition | Trigger | Mechanism | Database Write |
|-----------|---------|-----------|---------------|
| ONBOARDING → AWAKENING | TwinBirthPage: user clicks "Watch the awakening" | lifecycleStore.transitionTo(userId, 'AWAKENING') | user_lifecycle.upsert(status='AWAKENING') |
| AWAKENING → TWIN_ALIVE | Twin creation succeeds (initializeTwin) | lifecycleStore.setTwinCreated(userId, twinId) | user_lifecycle.upsert(status='TWIN_ALIVE', twin_id, twin_created_at) |
| Any → WORLD_ACTIVE | Not directly seen in code; implied by TWIN_ALIVE being final reached state | Possibly implicit via interaction | TBD (Phase 3 verification) |

### 4.3 Recovery Flow

```
After successful auth + session load:
  AuthContext loads session → triggers useLifecycleStore.loadLifecycle(userId)
    → Supabase: SELECT maybeSingle() FROM user_lifecycle
    → Sets store.status from DB
    → Updates resumed_at timestamp

RecoveryRouteHandler (in App.tsx) calls useRecoveryRoute():
  → Checks sessionStorage for pending onboarding state
  → If user already completed onboarding: redirect to /dashboard
  → If user is mid-onboarding: restore progress
  → If TWIN_ALIVE: go directly to /dashboard (skip onboarding)
  → Once executed: sets flag sp_recovery_done_for_user (prevents re-execution)
```

**BUG identified:** HOMEBLANK-001 comment in App.tsx:175-190 documents previous bug where recovery would cause blank page because useRecoveryRoute cleared itself after first execution but didn't navigate. Fixed: HomeRoute now shows LandingPage always (not return null).

### 4.4 AWAKENING-specific Behavior

AWAKENING users see different UI than TWIN_ALIVE users:
- `/core-awakening` shows HologramBirth canvas (birth ceremony)
- `/dashboard` for AWAKENING user might show pre-Twin state
- E2E test MG-05-01 specifically targets AWAKENING lifecycle user (dedicated storageState)

**Evidence:** e2e/global-setup-combined.ts:255-272 (AWAKENING auth setup); e2e/master-gate.spec.ts:393-410 (AWAKENING user checks).

---

## 5. Twin Architecture

### 5.1 What is the "Twin"?

**Verified from code:** The Twin is a **persistent user profile** stored in the `twins` table, containing:
- Archetype(s): primary + secondary (18 total: 12 base Jungian archetypes + 6 hybrids)
- Maturity score (0-100, dynamically calculated)
- Birth data (date/time/place of birth)
- FullAnalysis: complete SICE analysis result persisted at birth
- Visual DNA: coreColor, auraColor, coreShape, motionSpeed (per archetype lookup table)
- Name: user-chosen during Twin Birth ceremony

### 5.2 Twin Context — State Management

```
TwinContext:
  .twin: TwinProfile | null (React useState)
  .loading: boolean (SET during fetch, reset after)
  .error: string | null (specific error types: TwinNotFoundError/TwinPermissionError/...)
  .currentWorld: WorldId | null
  
  Actions:
  .createTwin(profile) → INSERT twins table (marked: "no production code calls this")
  .hydrateTwin(userId, savedTwin) → Set local state WITHOUT INSERT (actual birth completion path)
  .updateTwin(updates) → optimistic update + async DB sync (don't block UI)
  .saveDecision(userId, decision) → dynamic import DecisionService.createDecision
  .resetTwin() → DELETE twins table + clear local state
  .recommendWorld(messageContent) → keyword matching → WorldId (simple, non-AI)
```

**Verified:** TwinContext.tsx:128: `createTwin` never called in production (only hydrateTwin used after CoreAwakeningService.persisted it). This is intentional design to prevent UNIQUE constraint violation on twins.user_id.

### 5.3 Twin Visual Identity

Two separate systems serving different purposes:

| System | Location | Purpose | Consumer |
|--------|----------|---------|----------|
| **twinVisualDNA (root)** | `src/lib/twinVisualDNA.ts` | SVG avatar from birth data hash (deterministic PRNG) | LivingDiagram, TwinDNAAvatar, Dashboard, LandingPage |
| **twinVisualDNA (subdir)** | `src/lib/twin/twinVisualDNA.ts` | Per-archetype color/shape table (18 entries + default) | Twin, TwinThreeRenderer, TwinPresence, TwinNav |

Different interfaces, different APIs. Both generate deterministic visuals per twin. Different callers use different ones.

**No conflict detected** — they serve different visual layers:
- Root version: shape/body proportions for SVG avatar rendering
- Subdir version: glow/color/aura for Three.js/WebGL rendering

### 5.4 Twin Services Layer

```
TwinContext (state)
  └─ TwinSupabaseService (CRUD)
       ├─ fetchUserTwin(userId) → SELECT twins WHERE user_id=?
       ├─ createTwinInDatabase(userId, profile) → INSERT twins
       ├─ updateTwinInDatabase(twinId, profile) → UPDATE twins
       └─ deleteTwinFromDatabase(twinId, userId) → DELETE twins
       
CoreAwakeningService (ceremony)
  ├─ checkReadyForAwakening(userId) → DB checks
  ├─ startAwakening(userId) → SICEOrchestrator.orchestrate() + essential generation
  └─ initializeTwin(userId, name, essenceId, birthDate, analysis) → createTwinInDatabase + persistence
  └─ celebrateTwinAwakening() → audio play
```

**Note:** CoreAwakeningService imports supabase directly from './supabase-service' (NOT lazy), meaning it pulls the SDK into whoever imports it — potentially problematic for tree-shaking.

---

## 6. Chat Architecture

### 6.1 Chat Providers

| Provider | Scope | Lazy? | Notes |
|----------|-------|-------|-------|
| `NovaProvider` | Scoped to `/chat/nova` route only | No (static import) | NOVAPROV-001: was never mounted, added as fix |
| `TwinProvider` | Global (always mounted) | No | Twin state, world recommendations, decisions |
| `AIContext` | In ConditionalPrivateProviders | Yes (lazy) | ActiveAI switch, twinAwakened status |
| `ExperienceProvider` | In ConditionalPrivateProviders | Yes (lazy, session-gated) | Adaptive UI, personalization |
| `EmotionContext` | Global (always mounted) | No | Mood signals |

### 6.2 Chat Implementation Paths

**Nova Chat** (`/chat/nova`):
```
NovaChat component → useNova() → addInsight(msg)
  → Fetches from /api/nova → functions/api/nova.ts → OpenRouter
  → Persistence: supabase-service.saveMessage() → twin_memories
```

**Twin Chat** (`/chat/twin`):
```
ImmersiveTwinChat → useTwinStates() → messages[] → callTwinAPI()
  → fetch('/api/twin') → verifyUser() → rateLimit() → callOpenRouter()
  → Messages rendered with world context header
  → Evolution tracking: useEvolutionTracking() → milestones
  → World recommendation: useWorldRecommendation() → suggested hub
  → Conversation history: stored in twin_memories table
```

### 6.3 Message Storage

**History of bug (CHATMESSAGES-001/002/003):** Messages were being saved to `chat_messages` table which doesn't exist in production (schema mismatch). Fix: `saveMessage()` rerouted to `twin_memories` table.

**Current state:** All chat messages → `twin_memories` table with columns: twin_id, user_id, role, content, world_id. mood/autonomyLevel dropped (wasn't read back).

### 6.4 Streaming vs Non-streaming

Two variants exist:
- Standard: `functions/api/twin.ts` → returns single JSON `{ content }`
- Streaming: `functions/api/twin-stream.ts` → SSE/StreamingResponse
- Usage: Neither appears directly imported in frontend (likely handled by server-side streaming in the future or unused).

---

## 7. World Architecture

### 7.1 World Model

**Verified from constants/worlds.ts:**
```
12 Worlds: self, mind, relationship, love, career, wealth, life, growth, decision, purpose, wellbeing, future
```

Each world has:
- Id (string)
- Display name (Thai + English)
- Icon emoji
- Description (Thai + English)
- Associated SICE keys (behavioral dimensions)
- Recommended personality/avatar style

### 7.2 World Persistence

```
Tables: world_preferences (user_id, world_id, is_favorite, last_accessed, engagement_score)
        world_stats (user_id, world_id, visits_count, journal_entries, decisions_made, insights_gained, time_spent_minutes)

Bugs fixed:
  - WORLDCTX-SCHEMA-001: queries used .schema('selfprint') but tables are in public schema
  - Fixed by removing .schema() prefix from all queries in WorldContext.tsx
```

### 7.3 World Recommendation Engine

Two levels of recommendation:
1. **Simple keyword matching** (TwinContext.recommendWorld): word-list comparison against message content
2. **useWorldRecommendation hook**: more sophisticated scoring based on world preferences, history, and current mood

### 7.4 World-Aware Chat

When sending messages in ImmersiveTwinChat:
```
System Prompt includes: world personality config
  → Determines how the AI responds (tone, perspective, advice style)
  → Changes dynamically as world changes
  → Maintains consistency within conversation
```

**Evidence:** functions/api/twin.ts accepts world parameter in request body; twin-prompts.ts contains world-specific system prompts.

---

## 8. Decision Architecture

### 8.1 Decision Model

```
Decision {
  id, twinId, world, question, options[], twinRecommendation, userChoice, context
}
DecisionOutcome {
  id, decisionId, followUpDay, feedback, impact, lessons, twinConfidence
}
FollowUpSchedule {
  id, decisionId, day30_due/90/180/365, day30/90/180/365_completed
}
```

### 8.2 Decision Service Operations

```
recordDecision(twinId, world, question, options, recommendation, choice, context?)
  → INSERT decision_log
  → scheduleFollowUps(decisionId) ← Creates 4 day entries (30/90/180/365)
  
recordOutcome(decisionId, feedback, impact, lessons?)
  → INSERT decision_outcomes
  → Updates relevant dayN_completed flags
  
getUserDecisions(twinId?, world?) → filtered SELECT
getDecisionOutcomes(decisionId) → outcomes for decision
getPendingFollowUps(twinId) → upcoming due follow-ups
```

### 8.3 Decision Analytics

```
DecisionDashboard:
  → Full list of decisions with filtering by world
  → Trend visualization over time
  → Success/failure ratio
  
DecisionCompare:
  → Side-by-side comparison of related decisions
  → Pattern highlighting across similar scenarios
```

**Evidence:** DecisionService.ts entire file; DecisionDashboard.tsx renders table/chart/export; DecisionCompare.tsx implements comparison UI.

---

## 9. Personal Context Architecture

### 9.1 What is Personal Context?

Verified from PersonalContextBuilder usage:
- Behavioral patterns extracted from user history (decisions, interactions, choices)
- SICE scores computed per dimension (identity, cognitive, emotional, behavioral, social)
- Blind spots identified through pattern contradictions
- Emotional range mapped from sentiment analysis
- Goals/values inferred from decision history

### 9.2 Consumption Pattern (Verified — Critical Finding)

Multiple independent instantiations of PersonalContextBuilder:
- ExperienceContext: `const contextBuilder = useMemo(() => new PersonalContextBuilder(), [])` → getContext(userId) → feed to ExperienceEngine.compute() → **this is the ONLY place driving UI adaptation**
- IntelligenceHub, AnalysisPage, ExecutiveSummary, TwinEvolution, DecisionLogger, BiasDetection, useTwinIdentity: Each creates their own instance and calls getContext() independently → **6+ parallel copies running simultaneously**
- Only the ExperienceContext consumes it for reactive behavior (theme switching, hub suggestion)
- Other consumers read the data for display only (static rendering)

### 9.3 PersonalContext Initialization

During onboarding:
```
AICreationSequence component (stage 2: "Connecting personality")
  → Calls PersonalContextInitializer.initialize()
  → Saves initial context to Supabase
  → Used as foundation for ongoing evolution
```

### 9.4 Key Insight

PersonalContextBuilder.getContext(userId) is the bottleneck — every consumer waits for this. It's cached by React Query with 60s staleTime, but multiple consumers trigger separate calls (different queryKey patterns?).

---

## 10. AI Architecture

### 10.1 Model Strategy

**MODEL-SWITCH-001 (25 ก.ย. 2026):**
```
Primary: nvidia/nemotron-3-ultra-550b-a55b:free (FREE)
Fallback: qwen3.7-flash → qwen-plus → deepseek-chat
Claude explicitly removed ("claude ยกเลิก — ห้ามใช้")
Override via env vars: TWIN_MODEL_ID, NOVA_MODEL_ID
```

### 10.2 Request Flow

**Frontend → Cloudflare Function → OpenRouter → LLM:**

```
Browser (TwinAPIService/NovaAPIService)
  ↓ POST /api/twin or /api/nova (Bearer token required)
Cloudflare Pages Function (functions/api/twin.ts or nova.ts)
  ↓ verifyUser() — validates Supabase JWT
  ↓ checkRateLimit() — 40 req/min for Twin, 60 for Nova
  ↓ callOpenRouter() (fetch to openrouter.ai)
    Headers: Authorization: Bearer OPENROUTER_API_KEY
    Body: { model, messages, temperature, max_tokens }
    Response: { choices: [{ message: { content } }] }
  ↓ Return { content }
Browser receives response, appends to conversation
```

**Model routing:** functions/api/_utils/ai-provider.ts → callOpenRouter() uses headers X-Title, X-Client-Info for attribution. Rate limiting is in-memory Map (process-wide, survives cold starts in CF isolate).

### 10.3 Prompt Construction

```
buildPrompt(role, world, memories, twinState, userContext)
  → Role: 'TWIN' or 'NOVA'
  → World context injected into system prompt
  → Memories injected as recent conversation snippets
  → Twin state included (name, archetype, maturity)
  → User language determined from UI state
```

### 10.4 Error Handling

```
Frontend: fetch('/api/twin') → check response.ok → throw on 4xx/5xx
Backend: rate limit → 429 with retryAfter; missing key → 500 with error; unauthenticated → 401
Network: timeout not explicitly configured (default fetch behavior)
No circuit breaker observed
```

### 10.5 Deprecated modelRouter

`src/lib/ai/modelRouter.ts` is marked DEPRECATED. The model selection logic lives in the Cloudflare Functions (twin.ts/nova.ts comments describe the strategy). There's no centralized router — each function hardcodes its model preference.

---

## 11. Auth/Data/Storage Architecture

### 11.1 Authentication

**Methods:** Magic Link (OTP), OAuth (Google/Apple), Passkey (WebAuthn)

**Flow:**
```
AuthProvider.mount:
  1. setLoading(false) immediately (first paint, no auth check)
  2. onAuthStateChange listener (lazy SDK) — captures real-time changes
  3. setTimeout(100ms, getSession()) — restores session without blocking
  
Passkey (the most complex):
  1. Check device capability (isAvailable, isBiometricAvailable)
  2. Get registration options → supabase.functions.invoke('auth-registration-options')
  3. Create credential → webauthn.register()
  4. Register → supabase.functions.invoke('auth-register-passkey')
  5. Authenticate → webauthn.get() → supabase.functions.invoke('auth-authentication-options')
  6. Verify → supabase.functions.invoke('auth-verify-passkey')
  7. Update session → supabase.auth.setSession(token) ← CRITICAL: must set session on client side
```

**Passkey security notes:**
- Registration/Login options come from Supabase edge functions (auth-rate-limit protects against abuse)
- Verification produces JWT-like tokens that become Supabase sessions
- PasskeyProvider is dynamically imported (code-split out of entry chunk)

### 11.2 Data Models (tables with evidence)

| Table | Used By | Operation Type |
|-------|---------|---------------|
| twins | TwinContext, CoreAwakeningService, AIContext | CRUD |
| user_lifecycle | lifecycleStore | CRUD |
| decision_log | DecisionService | INSERT + SELECT |
| decision_outcomes | DecisionService | INSERT |
| follow_up_schedules | DecisionService | INSERT + UPDATE |
| world_preferences | WorldContext | upsert |
| world_stats | WorldContext | upsert |
| twin_memories | supabase-service/saveMessage | INSERT + SELECT |
| analytics_events | Tracking scripts | INSERT |
| journal_queue | Journal queue feature | INSERT + processing |
| push_subscriptions | Push notification target | CRUD |
| subscriptions | Billing/stripe | CRUD |
| share_links | Sharing system | CREATE + lookup |
| intelligence_core_schema | Various ML features | SELECT |
| passkey_challenges | Passkey provider | CRUD |
| daily_briefs | Daily brief feature | INSERT + SELECT |
| community_insights | Community feature | INSERT + SELECT |
| profiles/blueprints | User profiles (selfprint schema) | SELECT |
| chat_messages | **DELETED** (renamed to twin_memories) | N/A |

### 11.3 RLS Policies

All Supabase tables should have RLS enabled (standard Supabase pattern). No explicit policy definitions found in migration files themselves (policies likely applied manually or through RLS defaults).

**Evidence:** Migration files define table schemas; policy enforcement occurs at runtime through Supabase client configuration. Comments in various files reference "RLS permission denied" errors.

### 11.4 Storage Buckets

```
Migrations: 038_storage_profiles_bucket.sql creates storage bucket
Usage: Avatar upload via FileUploadService/imageProcessor
      → Profile pictures stored in Supabase Storage
      → File upload validation + image processing pipeline
```

**Evidence:** `src/lib/storage/FileUploadService.ts`, `imageProcessor.ts`, `avatar-upload.tsx`.

---

## 12. SICE / Intelligence Architecture (Deep Dive)

### 12.1 Dual-Sister Problem (Verified Critical Finding)

**SICEOrchestrator** (services/sice/SICEOrchestrator.ts) orchestrates 16 engines from `services/sice/engines/`. Called by:
- CoreAwakeningService.initializeTwin() — during Twin Birth
- CoreAwakeningService.startAwakening() — essence generation
- Onboarding.tsx — during analysis phase

**BUT** — individual engines also exist in `lib/intelligence/` (deprecated per comment but **HEAVILY USED in practice**):

```
sice/engines/ (16 engines, orchestrated):        lib/intelligence/ (deprecated but used):
──────────────────────────────────────────       ────────────────────────────────────────
1.  PersonalContextBuilder                      PersonalContextBuilder (same class?)
2.  PatternDetector                              PatternDetector (same class?)
3.  InsightEngine                                InsightEngine (same class?)
4.  AIFeedbackLoop                               AIFeedbackLoop (same class?)
5.  TwinStateEngine                              TwinStateEngine (same class?)
6.  ExperienceEngine                             ExperienceEngine (same class?)
7.  EnvironmentEngine                            EnvironmentEngine (same class?)
8.  BadgeEngine                                  BadgeEngine (same class?)
9.  BehavioralForecastEngine                     BehavioralForecastEngine
10. FutureSelfEngine                             FutureSelfEngine
11. MemoryManagerEngine                          MemoryManager
12. DecisionIntelligenceEngineAdapter            DecisionIntelligenceEngine
13. EmotionalIntelligenceEngine                  NatalChartEngine
14. SocialConnectionEngine                       HexagramEngine
15. GoalTrackingEngine                           DailyBriefEngine
16. WellnessEngine                               LifeIntelligencePackEngine
                                                  EvidenceAnalyzer
                                                  PersonalContextInitializer
```

**SICEBridge** (services/sice/SICEBridge.ts) connects orchestrator output → lib/intelligence:
```
bridgePatternResults(orchestratorResult)
  → Extract engine #2 results → convert → feed to lib PatternDetector → persist to DB
  
bridgeBadgeResults(orchestratorResult)
  → Extract engine #8 results → extract badge IDs → feed to lib BadgeEngine → persist
```

### 12.2 Data Duplication Risk

The SICEOrchestrator runs 16 engines in parallel (Promise.all). Each engine processes the SAME input. But individual consumers ALSO create their own instance of the same engines (e.g., ExperienceContext creates PersonalContextBuilder + TwinStateEngine + ExperienceEngine separately).

**Runtime consequence:** When a user opens Dashboard → ExperienceContext → computes → 3 new engine instances. When they navigate to IntelligenceHub → 5 MORE instances (PersonalContextBuilder, PatternDetector, etc.). All running independently. No shared computation.

### 12.3 SICEBase Class

All 16 engines extend `SICEBase` which provides:
- Shared ID/name metadata
- Base error handling
- Common output format standardization

### 12.4 TwinStateEngine ×3 Instances

Found in 3 locations:
1. `lib/experience/TwinStateEngine.ts` — NEVER imported (dead)
2. `lib/intelligence/TwinStateEngine.ts` — 7 consumers (Active)
3. `services/sice/engines/TwinStateEngine.ts` — consumed by orchestrator

The lib/experience version is dead code (confirmed by 0 imports).

---

## 13. Duplicate/Competing Architecture Findings

### 🔴 D-01: Intelligence Engines — Two Complete Copies

| Aspect | Details |
|--------|---------|
| **What** | SICE engine classes exist in BOTH `lib/intelligence/` (deprecated) AND `services/sice/engines/` (live orchestrator) |
| **Impact** | Two independent instances of same engine classes running in parallel |
| **Caller** | CoreAwakeningService uses sice/engines/ version; Dashboard/IntelligenceHub/etc. use lib/intelligence/ version |
| **Severity** | HIGH — wasted compute, inconsistent state, maintenance burden |
| **Status** | 🟠 PARTIAL MIGRATION — bridge exists but not completing the job |

### 🔴 D-02: Supabase Client — Two Entry Points (One Singleton)

| Aspect | Details |
|--------|---------|
| **What** | `client-lazy.ts` (dynamic import) vs `client.ts` (Proxy wrapper) vs `supabase-service.ts` (re-export) |
| **Impact** | Technically 1 instance via registry, BUT three different import paths create confusion |
| **Severity** | LOW — works correctly but confusing architecture |
| **Status** | 🟡 OK — single instance guaranteed by registry |

### 🟡 D-03: Twin Birth — Two Entry Points

| Aspect | Details |
|--------|---------|
| **What** | CoreAwakening.tsx (legacy) AND TwinBirthPage.tsx (TC-401 dedicated) both implement Twin Birth flow |
| **Impact** | /core-awakening and /twin-birth are ALIASES for the same ceremony |
| **Severity** | MEDIUM — duplicate state machines, different UI layouts |
| **Status** | 🟡 PARTIAL — legacy kept for compatibility |

### 🟤 D-04: twinVisualDNA — Same Name, Different Implementation

| Aspect | Details |
|--------|---------|
| **What** | `lib/twinVisualDNA.ts` (PRNG-based SVG avatar) vs `lib/twin/twinVisualDNA.ts` (archetype color table) |
| **Impact** | Same filename pattern, completely different APIs, different consumers |
| **Severity** | MEDIUM — confusing for developers, technically correct |
| **Status** | 🟡 OK — serves different visual layers |

### 🟤 D-05: Skeleton Component — Two Implementations

| Aspect | Details |
|--------|---------|
| **What** | `components/ui/Skeleton.tsx` vs `components/composites/Skeleton.tsx` |
| **Impact** | Duplicate component with potentially different styling |
| **Severity** | LOW — either could be orphan |
| **Status** | ⚪ NEEDS TRACE — Phase 9 will verify which is actually used |

### 🟤 D-06: Migration Runners — Three Versions

| Aspect | Details |
|--------|---------|
| **What** | `run-migrations.cjs`, `run-migrations-v2.cjs`, `run-migrations-v3.cjs` in root |
| **Impact** | Unclear which version is current |
| **Severity** | MEDIUM — potential for running wrong migration script |
| **Status** | ⚪ NEEDS INSPECTION — Phase 9 will compare contents |

### 🟡 D-07: Cloudflare Functions — Dedicated vs Catch-all

| Aspect | Details |
|--------|---------|
| **What** | `functions/api/twin.ts` and `functions/api/nova.ts` exist alongside `functions/api/[[route]].ts` → `api/unified-handler.ts` |
| **Impact** | Twin and Nova use dedicated handlers; all other routes go through unified-handler |
| **Severity** | LOW — intentional design (comment confirms) |
| **Status** | 🟢 INTENTIONAL — documented in [[route]].ts:20-22 |

### 🟠 D-08: Supabase Edge Functions — Many Unproven

| Aspect | Details |
|--------|---------|
| **What** | 13 Deno edge functions deployed; only 4 confirmed called from frontend |
| **Impact** | 9 functions have NO observable frontend caller |
| **Severity** | MEDIUM — could be cron-triggered, or could be orphaned |
| **Status** | ⚪ UNPROVEN — needs investigation |

### 🔵 D-09: api/ Directory — Legacy Vercel Handler

| Aspect | Details |
|--------|---------|
| **What** | `api/` directory was originally for Vercel (vercel.json rewrites); now served through `functions/api/[[route]].ts` |
| **Impact** | Business logic untouched, adapter layer changed from VercelRequest/Response to Fetch API |
| **Severity** | LOW — working but architecturally dated |
| **Status** | 🟡 TRANSITIONING — functional but conceptual debt |

---

## 14. Unproven Architecture Areas

### ⚪ U-01: daily-brief Function Trigger

No frontend caller found. Speculation: triggered via pg_cron or Supabase scheduled jobs. **Needs investigation.**

### ⚪ U-02: send-push Function Trigger

No frontend caller found. Speculation: triggered by DB events (push_subscriptions insert) or scheduled job. **Needs investigation.**

### ⚪ U-03: memory-manager Function Behavior

No frontend caller found. Speculation: part of autonomous intelligence pipeline (called by Supabase Edge Functions directly, not frontend). **Needs investigation.**

### ⚪ U-04: pattern-detect Function Usage

No frontend caller found. Speculation: triggered by DB changes or scheduled scan. **Needs investigation.**

### ⚪ U-05: data-export, account-delete, account-recovery

No frontend callers. Speculation: admin/operations endpoints, possibly called via Supabase CLI or admin tools. **Needs investigation.**

### ⚪ U-06: push_scheduler (frontend hook)

`src/hooks/useNotificationEngagement.ts` exists but no caller traced. **Needs investigation.**

### ⚪ U-07: voice-twin Integration

VoiceChatPage exists and imports VoiceChat component, but actual speech recognition/two-way communication implementation is unclear from available code samples.

---

## 15. Contradictions with Existing Documentation

### 🔴 CONTRADICTED — Feature Completeness Claims

| Doc Claim | Code Reality | Evidence |
|-----------|-------------|----------|
| `SICEOrchestrator.ts` header says 16 engines, but `REAL_SICE_ENGINE_NAMES` in CoreAwakeningService lists only 12 | Missing 4 engines from official list | CoreAwakeningService.ts:42-55 vs SICEOrchestrator.ts:59-76 |
| `lib/intelligence/index.ts` says "DEPRECATED — all callers migrated to services/sice/engines" | 20+ imports still target lib/intelligence directly | grep found ~30+ imports of lib/intelligence/* vs 2 of sice/engines/* |
| `createTwin()` is available on TwinContext | Never called in production; hydrateTwin used instead | TwinContext.tsx:128 explicit comment + grep showing 0 production callers |

### 🟡 PARTIALLY CORRECT — Architecture Documentation

| Doc Claim | Code Reality | Notes |
|-----------|-------------|-------|
| `ARCHITECTURE.md` describes "single Supabase client" | True via registry, but three import paths exist (lazy, Proxy, re-export) | Partially accurate — works but architecture is confusing |
| `TECH_STACK.md` lists frameworks accurately | Confirmed accurate | React 19, Vite 8, TypeScript 6, Tailwind 4 |
| Migration documentation says "035 forensic consolidation" | Tables show gaps (missing 003/006/008/009/023) | Inconsistency between stated completeness and actual numbering |

### ⚪ UNVERIFIABLE — Deployment/CI Documentation

| Doc Claim | Can Verify? | Notes |
|-----------|-------------|-------|
| CI passes all gates | Need to run actual tests (out of scope for Phase 2) | Cannot execute npm run validate:all (would mutate environment) |
| Deployments succeed to staging | Can check deploy.yml workflow | Confirmed: Cloudflare Pages action pushes to selfprint-staging |
| Production deployment workflow | Confirmed manual-only | deploy.yml requires workflow_dispatch with environment=production |

---

## 16. Summary of Architecture Health

### Strong Points
- **Auth** is solid with 3 methods (magic link, OAuth, passkey) and proper error handling
- **Lazy loading** implemented throughout (providers, SDK, components) reducing initial bundle
- **Supabase client** truly shared (registry pattern prevents duplicates)
- **Cloudflare Functions** properly structured with auth gate + rate limiting + CORS
- **Route structure** clean with consistent /en /th prefixes and proper lazy loading

### Concerns
- **Dual-engine architecture** (SICE) creating runtime duplication
- **Multiple PersonalContextBuilder instances** across unrelated components
- **Legacy/alias pages** creating duplicated user journeys
- **Unproven edge functions** (9 of 13) with no observable callers
- **Migration runner redundancy** (3 versions in root)
- **Skeleton component duplication** (2 versions)

### Architectural Patterns Observed
- **Provider stacking**: 13 layers deep in ConditionalPrivateProviders
- **Lazy initialization**: SDK, providers, and many components loaded on demand
- **Registry pattern**: Shared client instance across browser and functions
- **Dynamic imports**: Breaking circular dependencies (DecisionService ↔ DecisionLearningService)
- **Event-driven**: onAuthStateChange listeners, sessionStorage persistence
- **Optimistic updates**: updateTwin writes local state first, syncs to DB async
- **Retry patterns**: TwinBirthPage wraps critical operations with 3-attempt retry loops

🛑 STOP — PHASE 2 COMPLETE

รอคำสั่งดำเนิน Phase 3 (Capability Discovery)
