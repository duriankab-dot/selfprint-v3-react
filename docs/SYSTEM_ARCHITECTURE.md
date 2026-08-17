# SELFPRINT V3 — COMPLETE SYSTEM ARCHITECTURE

**Status:** 🟢 LOCKED (Architecture verified & documented)  
**Date:** 2026-08-17 (Phase 2)  
**Scope:** Frontend → API → Edge → Orchestrator → SICE → Twin → World → Database  

---

## 🏗️ SYSTEM OVERVIEW

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          USER (Web Browser)                                 │
│                     (React 18 + TypeScript + Vite)                          │
└────────────────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (React)                                 │
│                                                                              │
│  Pages:  Landing | Auth | Onboarding | Self Print | Dashboard | Settings   │
│  Components:  Twin Chat | Decision Logger | World Switcher | Memory View   │
│  Context:  AIContext | TwinContext | WorldContext | UserContext            │
│  State:  Zustand stores (User, Twin, Decision, World, UI)                 │
│  Hooks:  useAuth | useTwin | useChat | useDecision | useWorld              │
└────────────────────────────────────────────────────────────────────────────┘
                   ↓ Fetch (HTTP POST/GET)
┌────────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (12 APIs LOCKED)                           │
│                                                                              │
│  1. /api/nova              → Nova AI Guide (Claude)                        │
│  2. /api/twin              → Twin Operations (Chat, Create)                │
│  3. /api/sice/process      → SICE Orchestration (12 engines)              │
│  4. /api/core-awakening    → Core Awakening (Twin birth ceremony)         │
│  5. /api/decision          → Decision Recording & Tracking                 │
│  6. /api/notifications     → Notifications (Schedule, List, Track)         │
│  7. /api/twin-evolution    → Twin Progression (Seed → Complete)           │
│  8. /api/intelligence      → Astrovera Analysis (Psychology)              │
│  9. /api/stripe            → Payment & Subscription                        │
│  10. /api/auth             → Authentication (Passkey/WebAuthn)             │
│  11. /api/memory           → Memory Management (Store, Retrieve)           │
│  12. /api/world            → World Expertise & Context                     │
│                                                                              │
│  Query Parameters:  ?action=... (for routing within API)                   │
└────────────────────────────────────────────────────────────────────────────┘
                   ↓ Internal routing
┌────────────────────────────────────────────────────────────────────────────┐
│           SUPABASE EDGE FUNCTIONS (Deno Serverless)                         │
│                                                                              │
│  Security Layer:                                                            │
│    ├─ auth-rate-limit (brute force protection)                            │
│    ├─ request validation & CORS                                           │
│    └─ auth token verification                                             │
│                                                                              │
│  Auth Functions (WebAuthn/Passkey):                                        │
│    ├─ auth-registration-options (ceremony start)                          │
│    ├─ auth-register-passkey (account creation)                           │
│    ├─ auth-authentication-options (login ceremony)                        │
│    └─ auth-verify-passkey (login completion + JWT)                       │
│                                                                              │
│  Orchestration Functions:                                                  │
│    ├─ pattern-detect (SICE pattern analysis)                              │
│    ├─ daily-brief (personalized daily digest)                             │
│    └─ memory-manager (memory CRUD + relevance)                            │
│                                                                              │
│  Operations Functions:                                                     │
│    ├─ send-push (web push notifications)                                  │
│    ├─ data-export (GDPR data export)                                      │
│    ├─ account-delete (GDPR account deletion)                              │
│    └─ account-recovery (password recovery)                                │
└────────────────────────────────────────────────────────────────────────────┘
                   ↓ Internal services
┌────────────────────────────────────────────────────────────────────────────┐
│              SERVICE LAYER (TypeScript/Node.js Services)                    │
│                                                                              │
│  API Services:                                                              │
│    ├─ NovaAPIService (Claude communication)                               │
│    ├─ TwinAPIService (Twin operations)                                    │
│    ├─ DecisionService (Decision CRUD)                                     │
│    └─ StripeService (Payment processing)                                  │
│                                                                              │
│  Core Services:                                                             │
│    ├─ CoreAwakeningService (Twin birth, essence generation)              │
│    ├─ TwinSupabaseService (Twin DB persistence)                           │
│    ├─ TwinEvolutionService (Twin progression)                             │
│    └─ TwinContextInitializer (Twin state setup)                           │
│                                                                              │
│  Intelligence Services:                                                    │
│    ├─ MemoryManager (memory storage & retrieval)                          │
│    ├─ DecisionLearningService (extract patterns)                          │
│    ├─ PersonalModel (Twin personality state)                              │
│    └─ SelfPrintOrchestrator (Self Print ceremony)                        │
│                                                                              │
│  User Services:                                                             │
│    ├─ UserStore (user state management)                                   │
│    └─ AnalyticsService (event tracking)                                   │
└────────────────────────────────────────────────────────────────────────────┘
                   ↓ Orchestration
┌────────────────────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR LAYER                                        │
│                                                                              │
│  SICEOrchestrator:                                                          │
│    ├─ Parallel run: 12 SICE engines                                       │
│    ├─ Collect outputs from each engine                                    │
│    ├─ Cross-engine synthesis (conflict resolution, weighting)             │
│    ├─ Combine into Personal Intelligence                                  │
│    └─ Return unified result to API                                        │
│                                                                              │
│  TwinOrchestrator (implicit):                                              │
│    ├─ Twin creation ceremony                                              │
│    ├─ Twin state progression                                              │
│    ├─ Twin learning loop                                                  │
│    └─ Twin context switching (12 Worlds)                                  │
└────────────────────────────────────────────────────────────────────────────┘
                   ↓ Intelligence engines
┌────────────────────────────────────────────────────────────────────────────┐
│                  SICE LAYER (12 Engines Parallel)                           │
│                                                                              │
│  1. PersonalContextBuilder      → User profile + behavior analysis        │
│  2. PatternDetector             → Decision/memory patterns                 │
│  3. InsightEngine               → Deep insights from patterns             │
│  4. AIFeedbackLoop              → Learning from past feedback             │
│  5. TwinStateEngine             → Current Twin emotional/mental state     │
│  6. ExperienceEngine            → User experience quality                  │
│  7. EnvironmentEngine           → Context (time, weather, place)          │
│  8. BadgeEngine                 → Achievement recognition                  │
│  9. BehavioralForecastEngine    → Predict future behavior                 │
│  10. FutureSelfEngine           → Vision of future possibilities          │
│  11. MemoryManager              → Experience memory synthesis             │
│  12. DecisionIntelligenceEngine → Smart decision recommendations          │
│                                                                              │
│  Input:  UserContext (history, state, current moment)                    │
│  Output: Personal Intelligence (insights, recommendations, confidence)   │
└────────────────────────────────────────────────────────────────────────────┘
                   ↓ Contextual application
┌────────────────────────────────────────────────────────────────────────────┐
│                     TWIN & WORLD LAYER                                     │
│                                                                              │
│  AI Twin:                                                                   │
│    ├─ Twin Identity (name, personality, archetype)                        │
│    ├─ Twin State (emotional tone, learning state)                         │
│    ├─ Twin Memory (conversation history, experience memories)             │
│    ├─ Twin Evolution (progression from Seed → Complete)                   │
│    └─ Twin Response Generation (Claude + personal context)                │
│                                                                              │
│  12 Worlds (Context-aware modes):                                          │
│    ├─ 1. Self (personal development)                                      │
│    ├─ 2. Health (physical & mental)                                       │
│    ├─ 3. Wealth (financial)                                               │
│    ├─ 4. Relationships (social connections)                               │
│    ├─ 5. Career (professional growth)                                     │
│    ├─ 6. Learning (knowledge & skills)                                    │
│    ├─ 7. Creativity (artistic & innovative)                               │
│    ├─ 8. Spirituality (meaning & purpose)                                │
│    ├─ 9. Adventure (exploration & risk)                                   │
│    ├─ 10. Legacy (impact & contribution)                                  │
│    ├─ 11. Joy (happiness & pleasure)                                      │
│    └─ 12. Integration (holistic balance)                                  │
│                                                                              │
│  World-Aware Twin:                                                         │
│    ├─ Same Twin Identity                                                  │
│    ├─ Different expertise per world                                       │
│    ├─ Isolated memory per world                                           │
│    ├─ Context-specific recommendations                                    │
│    └─ Unified learning across worlds                                      │
└────────────────────────────────────────────────────────────────────────────┘
                   ↓ Persistence
┌────────────────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (Supabase PostgreSQL + RLS)                    │
│                                                                              │
│  Authentication & Authorization:                                           │
│    ├─ auth.users (Supabase managed)                                       │
│    ├─ user_profiles (user metadata)                                       │
│    └─ passkey_credentials (WebAuthn public keys)                          │
│                                                                              │
│  Twin & Evolution:                                                         │
│    ├─ twins (Twin profile & state)                                        │
│    ├─ twin_sice_scores (SICE engine contribution scores)                 │
│    ├─ twin_memories (Twin learned memories)                              │
│    ├─ twin_evolution_logs (progression tracking)                          │
│    └─ twin_world_assignments (Twin ↔ World mapping)                      │
│                                                                              │
│  Decisions & Outcomes:                                                     │
│    ├─ decision_log (decisions recorded by user)                           │
│    ├─ decision_outcomes (actual results of decisions)                     │
│    ├─ follow_up_schedule (scheduled follow-ups)                           │
│    └─ decision_patterns (extracted patterns)                              │
│                                                                              │
│  Worlds & Context:                                                         │
│    ├─ world_definitions (12 Worlds metadata)                              │
│    ├─ world_user_data (user data scoped by world)                         │
│    └─ world_expertise_prompts (expert system prompts per world)           │
│                                                                              │
│  Memories & Intelligence:                                                  │
│    ├─ user_insights (generated insights)                                  │
│    ├─ memory_relevance (memory scoring)                                   │
│    └─ sice_results (orchestration results history)                       │
│                                                                              │
│  Notifications & Engagement:                                               │
│    ├─ notification_queue (pending notifications)                          │
│    ├─ push_subscriptions (web push endpoints)                             │
│    ├─ notification_analytics (engagement tracking)                        │
│    └─ user_analytics (general analytics events)                           │
│                                                                              │
│  Payments & Entitlements:                                                  │
│    ├─ stripe_customers (Stripe customer mapping)                          │
│    ├─ stripe_subscriptions (active subscriptions)                         │
│    ├─ user_entitlements (feature access rights)                           │
│    └─ pricing_tiers (subscription plan definitions)                       │
│                                                                              │
│  Blog & Content:                                                           │
│    ├─ articles (blog articles)                                            │
│    ├─ article_categories (article taxonomy)                               │
│    ├─ testimonials (social proof)                                         │
│    └─ content_metadata (SEO, tags, etc)                                   │
│                                                                              │
│  Security & Operations:                                                    │
│    ├─ rate_limit_log (auth attempt tracking)                              │
│    ├─ recovery_tokens (password recovery)                                 │
│    ├─ audit_logs (system events)                                          │
│    └─ deleted_users_archive (GDPR retention)                              │
│                                                                              │
│  RLS Policies:                                                              │
│    ├─ User-scoped: User can only access own data                          │
│    ├─ Twin-scoped: Twin data isolated by ownership                        │
│    ├─ World-scoped: World data isolated by Twin/World                     │
│    └─ Admin-scoped: System operations (analytics, content)                │
└────────────────────────────────────────────────────────────────────────────┘
                   ↓ External services
┌────────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                        │
│                                                                              │
│  AI & LLM:                                                                  │
│    ├─ Claude API (Nova guide, Twin responses, analysis)                   │
│    └─ Anthropic API v1 (messages endpoint)                                │
│                                                                              │
│  Payment & Monetization:                                                   │
│    ├─ Stripe (checkout, billing, subscriptions)                           │
│    └─ Stripe Webhooks (payment events)                                    │
│                                                                              │
│  Notifications:                                                             │
│    ├─ Web Push API (browser notifications)                                │
│    └─ Service Workers (offline capability)                                │
│                                                                              │
│  Data & Analytics:                                                         │
│    ├─ Supabase Analytics (database metrics)                               │
│    ├─ Sentry (error tracking, optional)                                   │
│    └─ Custom Analytics (internal tracking)                                │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW: KEY USER JOURNEYS

### Journey 1: Core Awakening (Twin Birth)

```
User completes Full Analysis
       ↓
[Frontend] Onboarding page → "Ready for Core Awakening?"
       ↓
POST /api/core-awakening
       ↓
CoreAwakeningService.startAwakening()
       ↓
SICEOrchestrator.orchestrate() [12 engines parallel]
       ↓
Collect results → Synthesis → Personal Intelligence
       ↓
Store essence (SESSION STORAGE — TODO: Move to Supabase)
       ↓
Return success with essence
       ↓
[Frontend] Display essence, prompt "Name your Twin"
       ↓
User enters Twin name
       ↓
POST /api/twin/create
       ↓
createTwin() → TwinSupabaseService
       ↓
INSERT twins table → Initialize SICE scores → Create first memory
       ↓
Return twinId + profile
       ↓
[Frontend] Twin chat UI appears → Twin awakened ✨
```

---

### Journey 2: Twin Chat & Learning

```
User messages Twin
       ↓
[Frontend] TwinChat component captures input
       ↓
POST /api/twin { twinId, message, world }
       ↓
TwinAPIService.callTwinAPI()
       ↓
Fetch Twin context from DB:
  - Twin profile (personality, state)
  - Recent memories (world-scoped)
  - Twin evolution (stage, progression)
  - World expertise (if world-aware)
       ↓
Append message to memory
       ↓
POST to Claude API via /api/nova
  - System prompt: Twin personality + world expertise
  - Messages: conversation history + recent memories
  - Temperature: from Twin state
       ↓
Claude generates response
       ↓
Store response in twin_memories (with world context)
       ↓
Update memory_relevance scores (recency boost)
       ↓
Trigger DecisionLearningService (if decision-related)
       ↓
Return response to [Frontend]
       ↓
Display in Twin chat → User sees personalized response ✨
       ↓
Optional: User marks "helpful" → Track in AI feedback loop
```

---

### Journey 3: Decision Recording & Follow-ups

```
User makes important decision
       ↓
[Frontend] Decision Logger form
  - Title, description, options, choice, confidence
  - World context
       ↓
POST /api/decision
       ↓
DecisionService.recordDecision()
       ↓
INSERT decision_log
  - decision_id, user_id, twin_id, world, status: "pending"
       ↓
Schedule follow-ups:
  - 30 days: "How's this decision working out?"
  - 90 days: "Reflect on this choice"
  - 180 days: "What did you learn?"
  - 365 days: "Year reflection"
       ↓
INSERT follow_up_schedule (4 rows)
       ↓
Trigger notification scheduling:
  POST /api/notifications?action=schedule
    - Type: "decision-follow-up"
    - Times: 30/90/180/365 days from now
       ↓
INSERT notification_queue (4 rows)
       ↓
Return decision created + follow-ups scheduled
       ↓
[Frontend] Show decision saved + follow-up timeline
       ↓
[LATER at scheduled time]
       ↓
Edge function send-push (or cron trigger)
       ↓
Send push notification → Browser notification
       ↓
User clicks → Opens decision
       ↓
POST /api/notifications?action=record-outcome
  - outcome: "yes" | "no" | "mixed" | "unknown"
  - reflection: user text
       ↓
INSERT decision_outcomes
       ↓
Trigger DecisionLearningService.analyzePatterns()
       ↓
Pattern analysis:
  - Extract success signals
  - Compare to past decisions
  - Identify repeating patterns
  - Calculate confidence scores
       ↓
INSERT decision_patterns
       ↓
Update Twin system prompt with new patterns
       ↓
Twin will now recommend decisions based on learned patterns ✨
```

---

### Journey 4: World Switching (Context-Aware Twin)

```
User switches world (e.g., from Self → Health)
       ↓
[Frontend] World switcher button/tab
       ↓
WorldContext.setCurrentWorld("health")
       ↓
POST /api/world/context?world=health
       ↓
WorldExpertiseService.getExpertise()
       ↓
Fetch from DB:
  - world_definitions (expertise, prompts)
  - world_user_data (scoped data for this user + world)
  - twin_world_assignments (Twin assignments)
       ↓
Return world expertise + context
       ↓
[Frontend] Update Twin chat system prompt
  - Expertise: "Health Coach" (from world_definitions)
  - Context: user's health data (from world_user_data)
  - Memory: health-related memories only
       ↓
User messages Twin
       ↓
POST /api/twin { twinId, message, world: "health" }
       ↓
Same as Journey 2, but:
  - Memories filtered by world="health"
  - System prompt uses health expertise
  - Recommendations are health-focused
       ↓
Claude generates health-specific response
       ↓
Store memory with world="health"
       ↓
Twin appears to have medical expertise (world-aware) ✨
       ↓
User switches to "wealth" world
       ↓
Twin system prompt switches to financial expertise
       ↓
Same Twin, different personality per world ✨
```

---

## 🔒 SECURITY ARCHITECTURE

### Authentication
- **Passkey/WebAuthn** (Supabase Edge Functions)
  - No passwords stored
  - FIDO2 compatible
  - Phishing resistant
- **Session Management** (Supabase JWT)
  - Short-lived tokens (24h)
  - Refresh tokens (30d)
  - Auto-logout on inactivity

### Authorization
- **Row-Level Security (RLS)**
  - Every table has user_id check
  - Twin data scoped by twin_id
  - World data scoped by world_id
  - Admin operations whitelisted
- **API Authorization**
  - Supabase session required
  - User ownership verification
  - Twin ownership verification

### Data Privacy
- **No password exposure** (use email recovery)
- **GDPR Compliance**
  - Data export endpoint
  - Account deletion endpoint
  - Retention policies
- **Privacy Boundaries**
  - Twin memories not shared
  - Decisions private to user
  - World context isolated

### Security Practices
- **Rate Limiting** (auth-rate-limit edge function)
- **CORS validation** (origin checking)
- **Input sanitization** (validation before DB)
- **Secrets management** (environment variables only, not in code)
- **HTTPS only** (enforced)

---

## ⚡ PERFORMANCE CHARACTERISTICS

| Component | Latency | Scale | Notes |
|-----------|---------|-------|-------|
| API Response (simple) | 50-100ms | 1000 req/s | Cached, no DB |
| API + DB Query | 100-300ms | 500 req/s | RLS overhead |
| SICE Orchestration | 2-5s | 10 req/s | 12 engines parallel |
| Twin Chat (Claude) | 3-8s | 20 req/s | API latency |
| Memory Retrieval | 50-200ms | 1000 req/s | Indexed query |
| Edge Functions | 20-100ms | 10000 req/s | Deno runtime |
| Database Query (cold) | 100-500ms | 100 req/s | Connection overhead |
| Database Query (warm) | 50-150ms | 500 req/s | Pooled connections |

---

## 🎯 DEPLOYMENT ARCHITECTURE

### Frontend (React)
- **Hosting:** Vercel
- **Build:** `npm run build` → dist/
- **Deploy:** Auto-deploy on git push
- **CDN:** Vercel Edge Network (global)

### Backend Services (Node.js)
- **Hosting:** Railway (or similar)
- **Runtime:** Node.js 18+
- **Deploy:** Docker container
- **Scale:** Horizontal (load balanced)

### Edge Functions (Deno)
- **Hosting:** Supabase Edge Functions
- **Runtime:** Deno
- **Deploy:** `supabase functions deploy`
- **Scale:** Auto-scale (serverless)

### Database (PostgreSQL)
- **Hosting:** Supabase
- **Replication:** Multi-region available
- **Backups:** Daily + point-in-time recovery
- **RLS:** Enabled globally

### External APIs
- **Claude API:** Anthropic
- **Stripe:** Stripe.com
- **Email:** Supabase Auth email service
- **Push:** Web Push API (browser-based)

---

## 📋 ARCHITECTURE CONSTRAINTS & LOCKS

### API Lock ✅ LOCKED
- **Total:** 12 APIs (cannot add more)
- **Reason:** Each API has single responsibility
- **Extension:** Use action query params, not new APIs

### SICE Lock ✅ LOCKED
- **Total:** 12 engines (fixed)
- **Reason:** Represents complete intelligence system
- **Extension:** Improve existing engines, not add new ones

### World Lock ✅ LOCKED
- **Total:** 12 worlds (fixed)
- **Reason:** Complete lifecycle representation
- **Extension:** Integrate worlds deeper, not add new ones

### Database Lock ✅ LOCKED
- **Migrations:** Applied and immutable
- **Schema:** Stable for production
- **Extension:** Add columns, not new critical tables

---

**Document:** SYSTEM_ARCHITECTURE.md  
**Verified:** Phase 2 (2026-08-17)  
**Locked:** ✅ Cannot modify architecture without approval  
**Next Review:** Phase 14 (100% Release Gate)
