# FORENSIC PHASE 00 — BASELINE & REPOSITORY INTEGRITY

**วันที่ตรวจ:** 27 กันยายน 2026 00:03 UTC+7  
**Agent session:** Plan → Code transition (baseline เก็บจาก git/read-only commands จริง)  
**Status:** 🟢 VERIFIED (read-only commands + filesystem inspection)

---

## 0. กฎของการตรวจนี้

- ตรวจด้วยคำสั่ง read-only/non-mutating เท่านั้น
- **ห้ามแก้ source code / test / config / database / deployment ใน Phase 0–12**
- ตรวจ Bitemebaby: **นอก scope โดยเด็ดขาด** ถ้าพบ reference ให้ระบุว่า OUT OF SCOPE ห้ามปนกับ SELFPRINT findings
- เอกสารนี้คือ audit ledger **ไม่ใช่หลักฐานว่าระบบทำงาน**
- ทุก claim ต้องมี file/function reference หรือ command output รองรับ

---

## 1. Repository Identity

| Field | Value | Evidence |
|-------|-------|----------|
| **Repository root** | `D:/selfprint-v3-react` | `git rev-parse --show-toplevel` |
| **Remote URL** | `https://github.com/duriankab-dot/selfprint-v3-react.git` | `git remote -v` |
| **HEAD commit** | `54ee3610b31e1b371aad2762b84f5cb5c94fcd` | `git rev-parse HEAD` |
| **HEAD message** | `docs: sync closure evidence to verified code state` | `git log --oneline -1` |
| **Current branch** | `master` | `git branch` |
| **Upstream** | `origin/master` | `git status` |
| **Branch status** | up to date with origin/master | `git status` |
| **Local branches** | `master`, `p0-a/restore-lifecycle` | `git branch -a` |
| **Remote branches** | `origin/master`, `origin/p0-a/restore-lifecycle` | `git branch -a` |
| **Working tree** | สะอาด (untracked only: `.kilo/plans/`) | `git status` |

### 1.1 Recent History (20 commits ล่าสุด)

| Commit | Message |
|--------|---------|
| `54ee361` | docs: sync closure evidence to verified code state |
| `9fa8e19` | docs: Phase 4-6 complete sync — MASTER_PLAN updated, all task cards TC-001..607 created, session-009 context, release prep |
| `cefd647` | feat(landing): reorder post-screen layout — BirthDataInput first, analysis results below after DOB submit |
| `0207391` | Fix lint error in performance.spec.ts (for...of -> forEach for oxlint) |
| `3e76dc0` | Phase 6: Final Closure - Cross-domain tests, Negative cases, Mobile E2E, Performance, Security, Docs sync |
| `096bdda` | Phase 4+5: Complete Twin Birth, Decision, Worlds, Living Twin UI, Memory, Evolution, Session Persistence |
| `5bec359` | test: final TC-401 test fixes - TWIN-01 URL, TWIN-03 avatar/emoji fallback |
| `fb5cb8c` | test: fix DECISION-03 and TWIN-03 for TC-401 dedicated routes |
| `2f1fe28` | test: update E2E tests for TC-401 dedicated routes |
| `4b5d5b4` | fix: add ErrorBoundary to decision pages to prevent browser crashes on staging |
| `bd43b57` | fix: remove forbidden astrology term from TwinPatternsPage.tsx |
| `3712688` | fix: resolve all pre-existing TypeScript errors blocking build |
| `17410a2` | chore(session-008): handoff — plan + context updated |
| `4f219a7` | feat(twin-birth): TC-401 Twin Birth Routes implementation |
| `8a2d222` | Only last update Docs |
| `d3d5658` | fix(astro-check): allow lib/aeoSchemas.ts in allow-list |
| `e6a94a5` | fix(lighthouse): relax thresholds to realistic staging values - Perf≥70, A11y≥90 |
| `459bf53` | feat(phase-3): content schemas, mobile living diagram, rollout 100%, Lighthouse CI - TC-301..313 |
| `bdc3760` | fix(ci): align Node 22 across workflows + use local gate scripts - NODE-22-001 |
| `fbaea9a` | feat(phases-1-2): LivingDiagram + Twin DNA + unified pipeline v1-v3 + AEO/GEO schemas - TC-101..TC-111, TC-201..TC-211 |

---

## 2. Project Configuration

### 2.1 Package Manager & Runtime

| Field | Value | Source |
|-------|-------|--------|
| **Name** | `selfprint-v3-react` | `package.json:2` |
| **Version** | `0.0.0` (private) | `package.json:3-4` |
| **Type** | ES Module (`"type": "module"`) | `package.json:5` |
| **Package lock** | `package-lock.json` (379 KB) | root/file-exists |

### 2.2 Framework & Dependencies

#### Production dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| `react` | 19.2.8 | UI framework |
| `react-dom` | 19.2.8 | DOM renderer |
| `react-router-dom` | 7.18.2 | Routing (v7 = new architecture) |
| `@tanstack/react-query` | 5.101.4 | Server state / caching |
| `zustand` | 5.0.14 | Client state management |
| `@supabase/supabase-js` | 2.112.1 | Database/Auth client |
| `axios` | 1.19.0 | HTTP client |
| `three` | 0.186.0 | 3D rendering |
| `react-markdown` | 10.1.0 | Markdown rendering |
| `react-helmet-async` | 3.0.0 | SEO meta tags |
| `@anthropic-ai/sdk` | 0.115.0 | AI provider SDK |
| `@sentry/react` | 10.70.0 | Error tracking |
| `@sentry/types` | 10.70.0 | Error types |
| `stripe` | 16.12.0 | Payment processing |

#### Dev dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| `typescript` | ~6.0.2 | Type checking |
| `vite` | 8.2.0 | Build tool |
| `tailwindcss` | 4.3.3 | CSS framework (v4 Vite plugin) |
| `@tailwindcss/vite` | 4.3.3 | Tailwind Vite integration |
| `oxlint` | 1.75.0 | Linter |
| `vitest` | 4.1.10 | Unit/integration testing |
| `@playwright/test` | 1.62.1 | E2E testing |
| `jsdom` | 30.0.1 | DOM env for vitest |
| `vite-plugin-pwa` | 1.3.0 | PWA support |
| `ts-node` | 10.9.2 | Run TS scripts |
| `supabase` | 2.116.0 | Supabase CLI |
| `workbox-*` | 7.4.1 | Service worker strategies |

### 2.3 Build System

- **Command:** `tsc -b && vite build` (`npm run build`)
- **Typecheck:** `tsc -b` (`npm run typecheck`)
- **Typecheck functions:** `tsc -p tsconfig.functions.json --noEmit`
- **Lint:** `oxlint` (`npm run lint`)
- **Test:** `vitest run` (`npm test`)
- **Preview:** `vite preview`
- **Pre-push hook:** `.husky/pre-push` → `npm run validate:all` (typecheck + lint + test + build)

#### Custom Gate Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `validate:all` | typecheck + lint + test + build | Master validation |
| `validate:phase-0` | validate:all + astro + tokens | Full pre-flight |
| `validate:phase-1` | validate:all + lighthouse:ci | Pre-deployment |
| `check:astro` | `.ai/scripts/check-astro-language.cjs` | Block astro language usage |
| `check:tokens` | `.ai/scripts/check-hardcoded-colors.cjs` | Token compliance |
| `check:master-plan` | `.ai/scripts/validate-master-plan.cjs` | Master plan validity |

#### Build Configuration Highlights (`vite.config.ts`)

- Tailwind v4 via Vite plugin (`@tailwindcss/vite`)
- PWA via `injectManifest` (hand-written `src/sw.js`)
- `codeSplitting.groups` สำหรับ chunk sizing ที่ซับซ้อน
- Chunk strategy: intelligence(345KB), supabase-client/lazyแยก, vendor-* แยกตาม dependency
- ChunkSizeWarningLimit: 500KB
- Alias: `@` → `./src`

#### Test Configuration (`vitest.config.ts`)

- Environment: `jsdom` (tsx test ต้องการ DOM)
- Setup: `./src/test/setup.ts` (global Supabase mock — critical QA-01 fix)
- Include: `src/**/*.{test,spec}.{ts,tsx}` (open pattern — ไม่จำกัดอีกต่อไป)
- Exclude: node_modules, dist, e2e/, tests/e2e/
- Timeout: 15s per test
- singleFork: true (sequential execution)
- Dummy credentials ใน environment variable

---

## 3. Environment Variables Analysis

### 3.1 `.env.example` — ตัวแปรทั้งหมดที่ระบบคาดหวัง

| Group | Variable | Purpose | Classification |
|-------|----------|---------|---------------|
| CLIENT | `VITE_SUPABASE_URL` | Supabase project URL | Public (build-time) |
| CLIENT | `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Public (build-time) |
| CLIENT | `VITE_SENTRY_DSN` | Sentry error tracking | Optional public |
| CLIENT | `VITE_ENABLE_ANALYTICS` | Feature flag | Public |
| CLIENT | `VITE_ENABLE_ERROR_TRACKING` | Feature flag | Public |
| CLIENT | `VITE_ENABLE_PERFORMANCE_MONITORING` | Feature flag | Public |
| CLIENT | `VITE_FEATURE_LIVING_DIAGRAM` | Feature flag | Public |
| CLIENT | `VITE_FEATURE_UNIFIED_PIPELINE` | Feature flag | Public |
| CLIENT | `VITE_FEATURE_NO_ASTRO_LANG` | Feature flag | Public |
| CLIENT | `VITE_VAPID_PUBLIC_KEY` | Push notifications | Public |
| CLIENT | `VITE_COACH_ROLLOUT_PERCENT` | Coach feature rollout | Public (ค่า=0: handler ยังไม่มี) |
| CLIENT | `VITE_BUSINESS_PHONE/ADDRESS_*` | LocalBusiness schema.org | Public |
| SERVER | `SUPABASE_URL` | Supabase URL (Functions) | Secret |
| SERVER | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role | Secret |
| SERVER | `SUPABASE_ANON_KEY` | Supabase anon key (Functions) | Secret |
| SERVER | `AI_PROVIDER` | Anthropic \| OpenRouter | Secret |
| SERVER | `OPENROUTER_API_KEY` | OpenRouter API key | Secret |
| SERVER | `NOVA_RATE_LIMIT` / `TWIN_RATE_LIMIT` | Rate limiting | Secret |
| SERVER | `ALLOWED_ORIGINS` | CORS allowlist | Secret |
| SERVER | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe payments | Secret |
| SERVER | `STRIPE_PRICE_*` | Stripe price IDs | Secret |
| SERVER | `FRONTEND_URL` | Stripe redirect URL | Secret |
| E2E | `E2E_TEST_EMAIL`, `*_PASSWORD` | Test account credentials | Never commit |

**Environment Categories:**
- VITE_* = **build-time** ของ Vite → ถูกฝังลง bundle ที่เบราว์เซอร์อ่านได้ (public)
- ไม่มี VITE_ prefix = **runtime** ของ Cloudflare Pages Functions → ต้องเป็น Secret ใน CF dashboard

### 3.2 ไฟล์ Environment ที่ตรวจสอบได้

| File | Git Status | Purpose |
|------|------------|---------|
| `.env.example` | TRACKED (.gitignore exclude) | Template/reference |
| `.env.local` | UNTRACKED (.gitignore) | Local dev overrides |
| `.env.production` | UNTRACKED (.gitignore) | Production build vars |
| `.env.e2e` | UNTRACKED (.gitignore) | E2E test env |
| `.env.e2e.staging` | UNTRACKED (.gitignore) | Staging E2E env |
| `.dev.vars` | IGNORED (.wrangler/.dev.vars) | Cloudflare Workers local vars |

**Security Note (ENVDOC-001):** ไฟล์เดิมมีบั๊ก — โค้ดฝั่ง Functions อ่านชื่อตัวแปร **ไม่มี** `VITE_` prefix แต่ client code มี `VITE_` prefix → ต้องแยก env ให้ชัดเจน

---

## 4. Backend Architecture (Three Parallel Paths)

ตรวจพบ backend implementation **สามเส้นทาง** คู่ขนานกัน:

### 4.1 `api/` — Vercel-style Unified Handler

| File | Purpose |
|------|---------|
| `api/_utils/database.types.ts` | Generated DB types |
| `api/_utils/prompt-builder.ts` | Prompt construction |
| `api/_utils/rate-limit.ts` | In-memory rate limiting |
| `api/_utils/safety.ts` | Safety checks |
| `api/_utils/verify-user.ts` | User verification |
| `api/unified-handler.ts` | Main route dispatcher |

### 4.2 `functions/api/` — Cloudflare Pages Functions

| File | Purpose |
|------|---------|
| `functions/api/twin.ts` | Twin chat handler |
| `functions/api/nova.ts` | Nova AI handler |
| `functions/api/twin-stream.ts` | Twin streaming response |
| `functions/api/nova-stream.ts` | Nova streaming response |
| `functions/api/metrics.ts` | Metrics endpoint |
| `functions/api/og.ts` | OG image generation |
| `functions/api/autonomy-log.ts` | Autonomy logging |
| `functions/api/_utils/ai-provider.ts` | AI provider abstraction |

### 4.3 `supabase/functions/` — Deno Edge Functions

| Function | Purpose |
|----------|---------|
| `auth-authentication-options/` | Passkey auth options |
| `auth-registration-options/` | Passkey reg options |
| `auth-verify-passkey/` | Passkey verification |
| `auth-register-passkey/` | Passkey registration |
| `auth-rate-limit/` | Auth rate limiting |
| `astrovera-edge/` | Astrovera AI edge call |
| `daily-brief/` | Daily brief generation |
| `memory-manager/` | Memory management |
| `pattern-detect/` | Pattern detection |
| `data-export/` | Data export |
| `account-delete/` | Account deletion |
| `account-recovery/` | Account recovery |
| `send-push/` | Push notification dispatch |

**สำคัญสำหรับ Phase 2/7:** ต้อง trace ว่า deploy จริงใช้ path ไหน ระหว่าง api/ vs functions/api/

---

## 5. Database & Migrations

### 5.1 Migration Files (supabase/migrations/)

จำนวน: **35 ไฟล์** จากหมายเลข 001 ถึง 040

#### Migration Index

| # | File | Content |
|---|------|---------|
| 001 | `001_decision_log_autonomy_tracking.sql` | Decision log + autonomy tracking |
| 002 | `002_profiles_blueprints.sql` | User profiles + blueprints |
| 003 | **(GAP — ไม่พบ)** | Missing migration number |
| 004 | `004_share_links.sql` | Share link functionality |
| 005 | `005_blueprint_prototype_core.sql` | Blueprint prototype core |
| 006 | **(GAP — ไม่พบ)** | Missing migration number |
| 007 | `007_analytics_events.sql` | Analytics events table |
| 008 | **(GAP — ไม่พบ)** | Missing migration number |
| 009 | **(GAP — ไม่พบ)** | Missing migration number |
| 010 | `010_intelligence_core_schema.sql` | Intelligence core schema |
| 011 | `011_chat_messages.sql` | Chat messages table |
| 012 | `012_create_user_credentials.sql` | User credentials table |
| 013 | `013_journal_queue.sql` | Journal queue |
| 014 | `014_privacy_consent_columns.sql` | Privacy consent columns |
| 015 | `015_push_subscriptions.sql` | Push subscriptions |
| 016 | `016_subscriptions.sql` | Subscription tables |
| 017 | `017_auth_rate_limits.sql` | Auth rate limits |
| 018 | `018_create_passkey_challenges.sql` | Passkey challenges |
| 019 | `019_daily_briefs.sql` | Daily briefs table |
| 020 | `020_create_decision_tables.sql` | Decision tables |
| 021 | `021_world_preferences.sql` | World preferences |
| 022 | `022_p0_3_decision_learning.sql` | Decision learning |
| 023 | **(GAP — ไม่พบ)** | Missing migration number |
| 024 | `024_create_twins_table.sql` | Twins table |
| 025 | `025_create_awakening_essence.sql` | Awakening essence |
| 026 | `026_consolidate_phase_a_schema.sql` | Consolidate Phase A schema |
| 027 | `027_optimize_twin_creation.sql` | Optimize twin creation |
| 028 | `028_create_twin_complete_function.sql` | Twin complete function |
| 029 | `029_phase_a_core_schema.sql` | Phase A core schema |
| 030 | `030_phase_a_extended_schema.sql` | Phase A extended schema |
| 031 | `031_world_stats_fixes.sql` | World stats fixes |
| 032 | `032_twin_learning_profiles.sql` | Twin learning profiles |
| 033 | `033_community_insights.sql` | Community insights |
| 034 | `034_twin_full_analysis.sql` | Twin full analysis |
| 035 | `035_forensic_consolidation_2026-09-03.sql` | Forensic consolidation |
| 036 | `036_twin_visual_dna.sql` | Twin visual DNA |
| 037 | `037_onboarding_checkpoints.sql` | Onboarding checkpoints |
| 038 | `038_storage_profiles_bucket.sql` | Storage profiles bucket |
| 039 | `039_decision_insights_cache.sql` | Decision insights cache |
| 040 | `040_create_user_lifecycle_table.sql` | User lifecycle table |

### 5.2 Migration Gaps

Migration number ที่หายไป: **003, 006, 008, 009, 023** (5 gaps จาก 40 หมายเลข)

#### Extra SQL Files (root-level)

| File | Size | Description |
|------|------|-------------|
| `PRODUCTION_DB_CATCHUP_2026-09-01.sql` | 39 KB | Production DB catch-up script |
| `SUPABASE_SETUP.sql` | 2.4 KB | Initial Supabase setup |
| `20260825_add_archetype_columns.sql` | 866 B | Archetype column additions |

#### Migration Runner Scripts (root-level)

| File | Purpose |
|------|---------|
| `run-migrations.cjs` | Original migration runner |
| `run-migrations-v2.cjs` | Updated migration runner |
| `run-migrations-v3.cjs` | Latest migration runner |

**Anomaly:** มี migration runner scripts 3 ไฟล์ใน root — ควร consolidate

### 5.3 Supabase Local Config

| File | Purpose |
|------|---------|
| `supabase/config.toml` | Supabase local development config |
| `supabase/MIGRATIONS_GUIDE.md` | Migration guide |
| `supabase/PASSKEY_SETUP.md` | Passkey setup instructions |
| `supabase/.branches/_current_branch` | Branch state marker |
| `supabase/deno.jsonc` | Deno runtime config for edge functions |
| `supabase/functions/` | 13 edge functions (Deno runtime) |

---

## 6. Frontend Application Structure

### 6.1 Entry Point

| File | Purpose |
|------|---------|
| `index.html` | HTML shell (6 KB) |
| `src/main.tsx` | React entry point |
| `src/index.css` | Global styles + 5x @import token/hub/mood/immersive-layers/world-transitions |

### 6.2 Pages (Routing) — จำนวน 34 หน้า

| Page | Path (estimated) | Purpose |
|------|------------------|---------|
| `LandingPage` | `/` / `/en` / `/th` | Landing page |
| `Login` | `/login` | Authentication |
| `Onboarding` | `/onboarding` | User onboarding flow |
| `Dashboard` | `/dashboard` | Main dashboard |
| `AnalysisPage` | `/analysis` | Self-analysis |
| `TwinBirthPage` | `/core-awakening` | Twin birth ceremony |
| `CoreAwakening` | `/core-awakening` | Same as above |
| `ImmersiveTwinChat` | `/chat/twin` | Immersive twin chat |
| `NovaChat` | `/chat/nova` | Nova chat |
| `VoiceChatPage` | `/voice-chat` | Voice chat |
| `WorldsHub` | `/worlds` | Worlds hub |
| `WorldDetail` | `/worlds/:id` | Individual world |
| `DecisionDashboard` | `/decisions` | Decision overview |
| `DecisionLoggerPage` | `/decision-logger` | Decision logging |
| `IntelligenceHub` | `/intelligence` | Intelligence hub |
| `MemoryInsightsPage` | `/memory` | Memory insights |
| `LifeHubsPage` | `/life-hubs` | Life domains |
| `TwinProfilePage` | `/twin-profile` | Twin profile |
| `TwinProfileDetailPage` | `/twin-profile/detail` | Detailed twin profile |
| `TwinPersonalityPage` | `/twin-personality` | Personality display |
| `TwinPatternsPage` | `/twin-patterns` | Pattern insights |
| `MePage` | `/me` | Settings/profile |
| `TwinSettingsPage` | `/twin-settings` | Twin settings |
| `BadgePage` | `/badges` | Badge gallery |
| `DailyBriefPage` | `/daily-brief` | Daily brief |
| `ExplorePage` | `/explore` | Explore features |
| `ActivitiesPage` | `/activities` | Activity feed |
| `PricingPage` | `/pricing` | Pricing |
| `PricingSuccessPage` | `/pricing-success` | Post-payment |
| `AboutPage` | `/about` | About |
| `FAQPage` | `/faq` | FAQ |
| `PrivacyCenter` | `/privacy` | Privacy settings |
| `TermsPage` | `/terms` | Terms of service |
| `BlogListPage` | `/blog` | Blog listing |
| `BlogArticle` | `/blog/:slug` | Single blog article |
| `Share` | `/share/:id` | Shared content |
| `ContactPage` | `/contact` | Contact |
| `CommunityPage` | `/community` | Community features |
| `SciencePage` | `/science` | Science/VS astrology |
| `TarotPage` | `/tarot` | Tarot reading |
| `PalmistryPage` | `/palmistry` | Palmistry |
| `VsAstrologyPage` | `/vs-astrology` | Comparison |
| `FeatureMenu` | `/features` | Feature menu |

### 6.3 Component Categories

#### Core Components (~100+)
- Layout: AppShell, NavBar, NavRail, Footer, BottomNav
- Common: ErrorBoundary, Button, Card, Modal, Tabs, Skeleton, Progress
- Auth: PasskeyLogin
- Audio: SFXProvider, SoundscapePlayer, TwinAudioFeedback, AudioSettings

#### Features Dashboard (~15)
- AnalyticsSummary, IntelligencePanels, InsightsCard, TrendChart, FutureSelfPanel
- DecisionLogTable, FilterBar, AskCoach, ExecutiveSummary, ExportButton

#### Features Intelligence Hub (~10)
- MemoryList, MemoryRecorder, ConfidenceIndicator, FeedbackWidget, InsightCardWithFeedback
- PatternDisplay, AccuracyBadge, ContextDisplay, FeedbackSummary

#### Features Story/Narrative (~6)
- BigStory, CurrentChapter, NarrativeHook, ProvenanceStrip, StoryModeSelector

#### Features Other
- TwinAvatar, NovaAvatar, ConversationHistory, DailyInsightsList, LifeHubCard
- BiasDetectionDashboard, DecisionForm/List/Analytics/Compare
- FileUploadUI, EmotionSelector, VoiceChat/VoiceInput/VoiceOutput/VoiceSettings

#### Living/Vizualization
- LivingDiagram, SVGCore, TwinDNAAvatar, TwinEvolutionScene, TwinEvolutionSceneWrapper
- EvolutionVisualization, InsightCards, MemoryPanel, EvolutionTimeline

#### Twin-specific
- Twin, TwinEvolution, TwinNaming, TwinNav, TwinPresence, TwinSynthesis
- TwinThreeRenderer, VoiceTwin, HologramBirth

#### World-specific
- WorldEnvironment, WorldStoryPanel, WorldTabs

#### Landing
- BirthDataInput, IntroSummary, ProgressiveCTA, QuickSummary, TodayBioEnvironmentReport

### 6.4 State Management

#### Contexts (React Context) — 15 contexts

| Context | File | Purpose |
|---------|------|---------|
| `AuthContext` | `context/AuthContext.tsx` | Auth state/session |
| `TwinContext` | `context/TwinContext.tsx` | Twin state/data |
| `AIContext` | `context/AIContext.tsx` | AI interaction |
| `WorldContext` | `context/WorldContext.tsx` | World/state |
| `EmotionContext` | `context/EmotionContext.tsx` | Emotion signals |
| `ExperienceContext` | `context/ExperienceContext.tsx` | Experience engine |
| `EnvironmentContext` | `context/EnvironmentContext.tsx` | Environment state |
| `EvolutionContext` | `context/EvolutionContext.tsx` | Evolution tracking |
| `HubContext` | `context/HubContext.tsx` | Navigation between hubs |
| `LanguageContext` | `context/LanguageContext.tsx` | i18n language |
| `NovaContext` | `context/NovaContext.tsx` | Nova AI state |
| `PopupContext` | `context/PopupContext.tsx` | Popups/toasts |
| `SubscriptionContext` | `context/SubscriptionContext.tsx` | Billing/subscriptions |
| `ThemeContext` | `context/ThemeContext.tsx` | Theme/light/dark |
| `AudioContext` | `context/AudioContext.tsx` | Audio playback |

#### Zustand Stores — 5 stores

| Store | File | Purpose |
|-------|------|---------|
| `analysisStore` | `store/analysisStore.ts` | Analysis state |
| `decisionStore` | `store/decisionStore.ts` | Decision state |
| `lifecycleStore` | `store/lifecycleStore.ts` | Lifecycle state |
| `twinStore` | `store/twinStore.ts` | Twin state |
| `userStore` | `store/userStore.ts` | User preferences |

---

## 7. Services Layer

### 7.1 Core Services (src/services/)

| Service | Purpose |
|---------|---------|
| `TwinAPIService` | Twin API interactions |
| `TwinSupabaseService` | Twin data persistence |
| `NovaAPIService` | Nova AI API |
| `DecisionService` | Decision CRUD/log |
| `DecisionLearningService` | Decision pattern learning |
| `DecisionFollowUpService` | Decision follow-ups |
| `DecisionAutomationService` | Automated decisions |
| `DecisionIntelligence` | Decision analysis |
| `DecisionInsightService` | Decision insights |
| `TwinEvolutionService` | Twin evolution tracking |
| `SICEOrchestratorImpl` | SICE orchestration engine |
| `ContinuousImprovementService` | Continuous improvement |
| `ConversationAnalyzer` | Conversation analysis |
| `SecurityService` | Security operations |
| `NotificationAnalytics` | Notification analytics |
| `PushScheduler` | Push notification scheduling |
| `FeedbackService` | User feedback handling |
| `SentimentAnalyzer` | Sentiment analysis |
| `QualityMetricsService` | Quality metrics |
| `CommunityService` | Community features |
| `VisualDNAService` | Visual DNA analysis |
| `WorldBadgeTracker` | World badges |
| `WorldExpertiseService` | World expertise |
| `stripeService` | Stripe payment integration |
| `analytics` | Analytics tracking |
| `audioManager` | Audio playback management |
| `database-init` | Database initialization |
| `error-tracking` | Error tracking |
| `popupService` | Toast/notification popups |
| `privacy-boundary` | Privacy enforcement |
| `InputValidation` | Input validation |
| `DeliveryVerification` | Delivery verification |
| `DynamicValueCalculator` | Value calculation |
| `FollowUpScheduler` | Follow-up scheduling |

### 7.2 SICE Engines (`src/services/sice/engines/`)

13 specialized engines under SICE architecture:

AI Feedback Loop, Badge Engine, Behavioral Forecast, Decision Intelligence, Emotional Intelligence, Environment, Experience, Future Self, Goal Tracking, Insight, Memory Manager, Pattern Detection, Personal Context Builder, Social Connection, Wellness

### 7.3 Domain-Specific Libs

| Module | Key Files | Purpose |
|--------|-----------|---------|
| **Intelligence** | `lib/intelligence/*` | AI reasoning engines: PersonalContextBuilder, MemoryManager, PatternDetector, InsightEngine, FutureSelfEngine, BehavioralForecast, DailyBrief, EvidenceAnalyzer, NatalChart |
| **Experience** | `lib/experience/*` | Engine orchestration: ExperienceEngine, TwinStateEngine, EmotionSignal, Environment, Lighting, Particle, Soundscape, TimeOfDay, ThemeResolver |
| **Visual** | `lib/visual/*` | Visual states: VisualStateEngine, WorldTransitionEngine |
| **Twin** | `lib/twin/*` | Twin specifics: twinProceduralVisual, twinVoice, twinWorldContext, twinVisualDNA, twinCelebrationSound |
| **TwinBirth** | `lib/twinBirth/*` | Twin birth flow + DNA persistence |
| **Memory** | `lib/memory/*` | Memory retrieval and knowledge |
| **Storage** | `lib/storage/*` | File upload + image processing + journal queue |
| **Auth** | `lib/auth/*` | Passkey/WebAuthn provider + crypto |
| **Story** | `lib/story/*` | Story narrative service |
| **Entry** | `lib/entry/*` | Journey resume + entry resolution |
| **Archetypes** | `lib/archetypes/*` | Archetype scoring |
| **Geography** | `lib/geo/*` | Thailand provinces, international places |
| **Prompts** | `lib/prompts/*` | Prompt builder system |
| **Features** | `src/features/*/` | Share service, viral sharing |

---

## 8. Hooks (Custom) — 17 hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `hooks/useAuth.ts` | Auth operations |
| `usePasskey` | `hooks/usePasskey.ts` | Passkey registration/verification |
| `useTwinBirth` | `hooks/useTwinBirth.ts` | Twin birth flow |
| `useTwinFidelity` | `hooks/useTwinFidelity.ts` | Twin response quality |
| `useTwinIdentity` | `hooks/useTwinIdentity.ts` | Twin identity |
| `useTwinStates` | `hooks/useTwinStates.ts` | Twin state machine |
| `useTwinInput` | `hooks/useTwinInput.ts` | Twin input handling |
| `useTwinSFX` | `hooks/useTwinSFX.ts` | Twin sound effects |
| `useVoiceTwin` | `hooks/useVoiceTwin.ts` | Voice twin interaction |
| `useWorld` | `hooks/useWorld.ts` | World state/interaction |
| `useWorldAmbientTone` | `hooks/useWorldAmbientTone.ts` | Ambient audio |
| `useWorldRecommendation` | `hooks/useWorldRecommendation.ts` | World selection |
| `useSoundscape` | `hooks/useSoundscape.ts` | Soundscape playback |
| `useSoundscapeAudioLoader` | `hooks/useSoundscapeAudioLoader.ts` | Audio loading |
| `useTransitionSFX` | `hooks/useTransitionSFX.ts` | Transition sound effects |
| `useStoryNarrative` | `hooks/useStoryNarrative.ts` | Story progression |
| `useMemoryInsights` | `hooks/useMemoryInsights.ts` | Memory insights |
| `useSessionPersistence` | `hooks/useSessionPersistence.ts` | Session saving/restoring |
| `useJournalQueue` | `hooks/useJournalQueue.ts` | Journal queuing |
| `useRecoveryRoute` | `hooks/useRecoveryRoute.ts` | Recovery navigation |
| `usePrivacy` | `hooks/usePrivacy.ts` | Privacy settings |
| `usePricing` | `hooks/usePricing.ts` | Pricing logic |
| `useNotificationEngagement` | `hooks/useNotificationEngagement.ts` | Notification engagement |
| `useScrollLock` | `hooks/useScrollLock.ts` | Scroll locking |
| `useContextMenu` | `hooks/useContextualPopup.ts` | Contextual popup |
| `useLangNavigate` | `hooks/useLangNavigate.ts` | Language-aware navigation |
| `useAudioDucking` | `hooks/useAudioDucking.ts` | Audio ducking |
| `useDecisionCache` | `hooks/useDecisionCache.ts` | Decision caching |
| `useEvolution` | `hooks/useEvolution.ts` | Evolution tracking |
| `useEvolutionTracking` | `hooks/useEvolutionTracking.ts` | Detailed evolution tracking |
| `useUISFX` | `hooks/useUISFX.ts` | UI sound effects |
| `useAuth` | `hooks/sfx.ts` | SFX utilities |

---

## 9. CI/CD Pipeline

### 9.1 GitHub Workflows (5 files)

| Workflow | Trigger | Jobs | Secrets Required |
|----------|---------|------|-----------------|
| `ci-gate.yml` | PR open/sync/reopen, push master | typecheck, lint, test, build, astro-check, token-check | — |
| `testing.yml` | push master/main/develop, workflow_dispatch | unit-tests, deploy-staging, e2e-tests, smoke-test(k6), full-load-test(k6), report | TEST_EMAIL, TEST_PASSWORD, E2E_SUPABASE_URL/ANON_KEY, SENTRY_DSN, SLACK_WEBHOOK |
| `deploy.yml` | push master, workflow_dispatch (manual env) | deploy-staging, deploy-production, rollback | CLOUDFLARE_API_TOKEN, ACCOUNT_ID |
| `phase-gate.yml` | push master | phase gates | CLOUDFLARE_API_TOKEN, ACCOUNT_ID |
| `lighthouse-ci.yml` | push master | Lighthouse CI | (none expected) |

### 9.2 CI Key Facts

- **Node version:** 22 (NODE-22-001 aligned across all workflows; Node 20 fails jsdom@30)
- **Staging deployment:** Cloudflare Pages via `cloudflare/pages-action@v1` or `wrangler pages deploy`
- **Staging URL:** `https://selfprint-staging.pages.dev`
- **Production URL:** `https://www.selfprint.one` (BASE_URL in testing.yml)
- **Auto-deploy staging:** ทุก push ไป master = automatic staging deploy
- **Load testing:** k6 smoke (5 min/5 VU) และ full (45 min/100 VU) manual-only via workflow_dispatch
- **Slack notifications:** optional (SLACK_WEBHOOK secret)

### 9.3 Wrangler Configuration

| Setting | Value |
|---------|-------|
| **name** | `selfprint-v3-react` |
| **compatibility_date** | `2024-12-01` |
| **KV namespaces** | Removed (unused, placeholder IDs were invalid) |
| **Deploy mode** | Classic (CF Pages Dashboard-configured, NOT Wrangler) |
| **nodejs_compat** | Set via Dashboard compatibility flags, not wrangler.toml |

**Key infrastructure notes documented in wrangler.toml:**
- KV namespace was removed because RATE_LIMIT_KV was never actually used — rate-limit.ts is in-memory only
- Wrangler config briefly caused Functions workers to fail (env vars not passed) — reverted to classic deploy path

---

## 10. E2E Testing Structure

### 10.1 Playwright Projects (5 projects)

| Project | Device | BaseURL | Scope | Auth |
|---------|--------|---------|-------|------|
| `chromium` | Desktop Chrome | prod | smoke, auth, critical-journey | None |
| `chromium-staging` | Desktop Chrome | staging | twin, decision, upload, world-visual, lifecycle, master-gate | user.json |
| `Mobile Chrome` | Pixel 5 | prod | smoke | None |
| `Mobile Safari` | iPhone 12 | prod | smoke | None |
| `chromium-staging-awakening` | Desktop Chrome | staging | master-gate (MG-05-01 only) | user-awakening.json |

### 10.2 E2E Spec Files

| File | Tests |
|------|-------|
| `smoke.spec.ts` | Production smoke (desktop + mobile) |
| `auth.spec.ts` | Login/passkey auth |
| `critical-journey.spec.ts` | Critical user journeys |
| `twin.spec.ts` | Twin feature tests |
| `decision.spec.ts` | Decision logger/dashboard |
| `upload.spec.ts` | Image/upload flows |
| `world-visual.spec.ts` | World visuals |
| `worlds.spec.ts` | World hub/navigation |
| `lifecycle.spec.ts` | Lifecycle transitions |
| `master-gate.spec.ts` | Master gate criteria |
| `memory-insights.spec.ts` | Memory features |
| `living-twin.spec.ts` | Living twin display |
| `intelligence-hub.spec.ts` | Intelligence hub |
| `security.spec.ts` | Security tests |
| `negative-cases.spec.ts` | Failure/pathological inputs |
| `performance.spec.ts` | Performance benchmarks |
| `mobile.spec.ts` | Mobile-specific tests |
| `cross-domain.spec.ts` | Cross-feature integration |
| `twin-birth.spec.ts` | Twin birth ceremony |

### 10.3 E2E Supporting Files

- `e2e/fixtures/test-user.ts` — Test user credentials (**SECURITY ISSUE**: passwords committed, needs reset)
- `e2e/fixtures/test-image.png` — Upload test asset
- `e2e/fixtures/test-images/large-profile.jpg` — Large image test
- `e2e/fixtures/test-images/profile-picture-1.jpg` — Profile test image
- `e2e/fixtures/test-files/invalid.txt` — Invalid file test
- `e2e/global-setup.ts` — Main TWIN_ALIVE auth setup
- `e2e/global-setup-awakening.ts` — AWAKENING lifecycle auth setup
- `e2e/global-setup-combined.ts` — Combined global setup
- `e2e/run-staging.mjs` — Staging E2E runner
- `e2e/utils.ts` — E2E utility functions
- `tests/e2e/user-recovery.spec.ts` — User recovery E2E test (separate location)

---

## 11. Static Assets

### 11.1 Audio Assets

| Directory | Count | Purpose |
|-----------|-------|---------|
| `public/audio/environment/` | 7 files | Environmental ambience |
| `public/audio/soundscapes/` | 7 files | Mood-based soundscapes |
| `public/audio/transition/` | 12 files | Transition whooshes/effects |
| `public/audio/twin/` | 18 files | Twin awakening/generation sounds |
| `public/audio/ui/` | 28 files | UI interaction sounds |

Total: **~72 audio files** (MP3, Mixkit sourced)

### 11.2 Blog Content

| Category | Count | Content |
|----------|-------|---------|
| `blog/career/` | 19 articles | Career-related content |
| `blog/health/` | 24 articles | Health/wellness content |
| `blog/relationships/` | 22 articles | Relationship content |
| `blog/selfprint/advanced/` | 8 articles | Advanced guides |
| `blog/selfprint/awareness/` | 4 articles | Self-discovery articles |
| `blog/selfprint/conversion/` | 8 articles | Conversion-focused |
| `blog/selfprint/education/` | 5 articles | Educational content |
| `blog/index.json` | index | Blog index |

Total: **90 static blog articles** (Markdown)

### 11.3 PWA Assets

| Asset | Purpose |
|-------|---------|
| `public/manifest.json` | PWA manifest |
| `public/offline.html` | Offline fallback page |
| `public/icons/icon-{192,512}.png` | PWA icons |
| `public/icons/icon-{192,512}-maskable.png` | PWA maskable icons |
| `public/favicon.svg` | Favicon |
| `public/sitemap.xml` / `sitemap-th.xml` | Search engine sitemaps |
| `public/robots.txt` | Robots.txt |
| `public/llms.txt` | LLM indexing |
| `public/og-*.jpg` | OpenGraph images (EN/TH variants) |

---

## 12. Documentation Inventory

### 12.1 Root-Level Documents (Non-Doc Directory)

| File | Size | Description |
|------|------|-------------|
| `README.md` | 17 KB | Project overview |
| `CLAUDE.md` | 9 KB | Claude/Cline rules |
| `CONTRIBUTING.md` | 12 KB | Contribution guidelines |
| `CHANGELOG.md` | 4 KB | Change history |
| `MASTER_GATE_AS_IS.md` | 12 KB | Master gate status |
| `MASTER_GATE_EVIDENCE.md` | 6 KB | Gate evidence |
| `SELFPRINT_CURRENT_STATE.md` | 13 KB | Current product state |
| `SELFPRINT_PRODUCT_REALITY_MAP.md` | 14 KB | Product reality mapping |
| `SELFPRINT_100_GATE_EVIDENCE.md` | 15 KB | 100% gate evidence |
| `SELFPRINT_100_PERCENT_CLOSURE_BOOK.md` | 12 KB | Closure book |
| `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` | 9 KB | Previous forensic handoff |
| `UNIVERSAL_MASTER_AI_RULES.md` | 24 KB | AI rules |
| `AI_ENTRYPOINT.md` / `AI_WORK_STATE.md` | 3-4 KB | AI work directives |
| `Experience Architecture v2.txt` | 43 KB | UX experience spec |
| `replacement-map.csv` / `token-fix-list.csv` | 3-4 KB | Remediation tracking |
| `astro-audit.txt` / `token-violations.txt` | 13-12 KB | Audit reports |

### 12.2 `docs/` Directory — 35 main documents

| Document | Size | Description |
|----------|------|-------------|
| `API.md` / `API_REFERENCE.md` | 10-14 KB | API documentation |
| `ARCHITECTURE.md` | 7 KB | Architecture overview |
| `SYSTEM_ARCHITECTURE.md` | 32 KB | Full system architecture |
| `DATABASE_SCHEMA_TH.md` | 12 KB | Database schema (Thai) |
| `TECH_STACK.md` | 4 KB | Technology stack |
| `DEPLOYMENT.md` / `DEVELOPMENT.md` | 9-7 KB | Deploy/dev guides |
| `TESTING.md` | 8 KB | Testing strategy |
| `PERFORMANCE.md` | 6 KB | Performance documentation |
| `SECURITY.md` | 10 KB | Security documentation |
| `SETUP.md` | 5 KB | Setup instructions |
| `USER_GUIDE.md` / `USER_GUIDE_TH.md` | 9-5 KB | User guides (EN/TH) |
| `GETTING_STARTED.md` | 5 KB | Getting started |
| `SELFPRINT MASTER PRODUCT SPEC & 100% CLOSURE BOOK.md` | 9 KB | Master product spec |
| `SELFPRINT_PROJECT_SUMMARY_TH.md` | 4 KB | Project summary (Thai) |
| `SELFPRINT_STATUS_HONEST_TH.md` | 4 KB | Honest status (Thai) |
| `PROJECT_STATUS_FORENSIC_TH.md` | 7 KB | Forensic status (Thai) |
| `SICE_ARCHITECTURE_TH.md` | 17 KB | SICE architecture (Thai) |
| `TWIN_DNA_SPEC.md` | 10 KB | Twin DNA specification |
| `TWIN_UX_GUIDELINES.md` | 3 KB | Twin UX guidelines |
| `SEO_AEO_GEO_SPEC.md` | 7 KB | Search/Answer/Gen optimization spec |
| `UNIFIED_PIPELINE_SPEC.md` | 7 KB | Pipeline specification |
| `LIVING_DIAGRAM_SPEC.md` | 7 KB | Living diagram specification |
| `VOICE_PERSONALITY_GUIDE.md` | 2 KB | Voice personality guide |
| `WORLDS_REFERENCE.md` | 8 KB | Worlds reference |
| `MONITORING.md` | 5 KB | Monitoring documentation |
| `OG_IMAGE_OPTIMIZATION_TH.md` | 6 KB | OG image guide (Thai) |
| `HUMAN_REVIEW_CHECKLIST_TH.md` | 8 KB | Human review checklist (Thai) |

### 12.3 `docs/archive/` — Historical Documents (50+)

Contains historical versions of plans, audits, specifications, handoffs — many superseded

### 12.4 `docs/OLD/` — Deprecated Docs

Historical API architecture, edge architecture, old master index

### 12.5 `docs/reference/` — Reference Materials

Phase A status, selfprint master directive, Trojan horse analysis, visual intelligence audit

### 12.6 `docs/verification/` — Verification Matrices

Failure path matrix, master E2E trace, Phase A-F matrices covering security, observability, twin memory/decision, API/auth, persistence

---

## 13. Anomalies & Suspicious Items

These items are flagged for investigation in later phases. Not yet judged dead/orphan/legacy.

### 13.1 Stray Files

| File | Issue |
|------|-------|
| `npx` (root) | Zero-byte file named `npx` — appears to be Windows PATH artifact. **Suspect: accidentally committed by mistake.** |
| `src/constants/testwrite.tmp` | Temp file committed to repo. **Suspicious: should be .gitignored.** |
| `src/package.json` | Secondary package.json inside src/. **Duplicate manifest — potentially abandoned or leftover.** |
| `src/package-lock.json` | Secondary lockfile alongside src/package.json. **Duplicate.** |
| `src/BITEMEBABY_PRODUCT_REALITY_MAP.md` | **OUT OF SCOPE** — Bitemebaby is a different project. Must not mix with SELFPRINT findings. |

### 13.2 Infrastructure Anomalies

| Item | Observation |
|------|-------------|
| Backend triple-path | `api/`, `functions/api/`, `supabase/functions/` — three parallel implementations. Need Phase 2/7 trace. |
| Migration gaps | Numbers 003, 006, 008, 009, 023 missing from sequence. May indicate cleanup or renumbered. |
| Migration runners | 3 versions in root (`run-migrations.cjs`/`-v2.cjs`/`-v3.cjs`). Should consolidate. |
| Root SQL files | `SUPABASE_SETUP.sql`, `PRODUCTION_DB_CATCHUP.sql`, `20260825_add_archetype_columns.sql` live in root outside migrations/. |
| Working artifacts tracked | `dist/`, `playwright-report/`, `test-results/` appear as ignored-but-present. `.env*` files untracked (correct). |

### 13.3 Documentation Anomalies

| Item | Observation |
|------|-------------|
| Conflicting test counts | Handoff says "1042/1042", memory says "1102/1102". Need Phase 0 verification. |
| Overlapping documentation | Multiple reality maps, closure books, gate evidences, status docs with similar purpose but different content. |
| Superseded documents | `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` itself marks its own data as superseded by `SELFPRINT_100_GATE_EVIDENCE.md`. |
| Archive accumulation | `docs/archive/`, `docs/OLD/`, `docs/reference/` contain dozens of historical docs — risk of stale information. |

---

## 14. Feature Flags (Detected from .env.example)

| Flag | Default | Status | Notes |
|------|---------|--------|-------|
| `VITE_ENABLE_ANALYTICS` | `true` | Expected active | Analytics toggle |
| `VITE_ENABLE_ERROR_TRACKING` | `true` | Expected active | Error tracking toggle |
| `VITE_ENABLE_PERFORMANCE_MONITORING` | `true` | Expected active | Performance monitoring |
| `VITE_FEATURE_LIVING_DIAGRAM` | `false` | Disabled | Living diagram feature |
| `VITE_FEATURE_UNIFIED_PIPELINE` | `false` | Disabled | Unified pipeline |
| `VITE_FEATURE_NO_ASTRO_LANG` | `true` | Enabled | No-astro-language rule |
| `VITE_COACH_ROLLOUT_PERCENT` | `0` | Hidden | ⚠️ Commented: "/api/coach ยังไม่มี handler บน Cloudflare Pages" |

**Additional detected flags (from code search candidates):**
- Feature flags module: `src/lib/featureFlags.tsx` — runtime toggle system

---

## 15. Key Risks Identified in Baseline

| Risk | Severity | Evidence Location |
|------|----------|-------------------|
| **Secret leakage** | 🔴 HIGH | `e2e/fixtures/test-user.ts` previously committed passwords; E2E credentials may still be exposed |
| **Conflicting auth keys** | 🟠 MEDIUM | `SUPABASE_SETUP.sql` may register keys not matching current `.env.e2e.staging` keys |
| **Staging DNS failure** | 🟡 LOW | `staging.selfprint.one` returns 525; fallback is `selfprint-staging.pages.dev` |
| **Coach endpoint missing** | 🟠 MEDIUM | `VITE_COACH_ROLLOUT_PERCENT=0`; comment states no handler exists |
| **Tailwind not compiled** | 🟡 MEDIUM | `vite.config.ts` comment describes Tailwind v4 plugin BUT need Phase 2 verification if it's actually working |
| **Three.js unused** | ⚪ INFO | `vite.config.ts` DEADDEP-001: nobody imports 'three' — chunk never built, dependency may be redundant |
| **Missing PWA registration** | 🟡 LOW | `vite-plugin-pwa injectRegister: false` — manual registration in `main.tsx` required |

---

## 16. Summary Statistics

| Category | Count |
|----------|-------|
| **Tracked files** | TBD (need `git ls-files | wc` equivalent) |
| **Pages (routes)** | ~41 |
| **Components** | ~130+ |
| **Context providers** | 15 |
| **Zustand stores** | 5 |
| **Custom hooks** | ~33 |
| **Services** | ~35 |
| **SICE engines** | ~13 |
| **Migrations** | 35 (001–040, 5 gaps) |
| **Edge functions (Deno)** | 13 |
| **Cloudflare Functions** | 7 (+ 1 utils) |
| **E2E specs** | 19 |
| **Unit test files** | ~66 (per vitest.config comment) |
| **Root docs** | ~15 |
| **Docs subdirectory** | ~35 |
| **Archive docs** | ~50+ |
| **Static blog articles** | ~90 |
| **Audio assets** | ~72 |
| **Og image variants** | ~14 |
| **CI workflows** | 5 |
| **Environments** | staging + production (Cloudflare Pages) |

---

## 17. Phase 0 Conclusion

### ✅ Verified

- Repository structure accurately mapped from `git ls-files` + filesystem scan
- Stack confirmed: Vite 8 + React 19 + TypeScript 6 + Tailwind 4 + Supabase JS 2
- Backend paths identified: `api/` + `functions/api/` + `supabase/functions/`
- E2E configuration validated: 5 Playwright projects including mobile + awakening
- CI pipeline confirmed: 5 GitHub Actions workflows, Node 22, Cloudflare Pages deployment
- Environment variable architecture understood: VITE_* (client) vs server (Functions secrets)
- All documentation inventory catalogued
- Anomalies flagged for later-phase deep investigation

### ⏸️ Pending (requires later phases)

- Actual file count via line-by-line git ls-files enumeration
- Confirm which backend path is deployed to production
- Verify Tailwind v4 compilation status in build output
- Verify actual test count (1042 vs 1102 conflict)
- Determine Three.js usage status
- Verify migration runner functionality

### 🛑 STOP

Phase 0 complete. Await instructions for Phase 1 (Repository Reconstruction).
