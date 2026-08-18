# SELFPRINT V3 — API ARCHITECTURE [HISTORICAL SNAPSHOT]

⚠️ **นี่เป็นเอกสารประวัติศาสตร์**  
- วันที่สร้าง: 2026-08-17
- ใช้เป็นข้อมูลอ้างอิงเท่านั้น (implementation architecture changed to unified-api-handler)
- **ห้ามใช้เป็น Current Status** → ดู: [SELFPRINT_PRODUCTION_STATUS_TH.md](SELFPRINT_PRODUCTION_STATUS_TH.md)

---

**Status:** 🔴 ARCHITECTURE LOCKED — No API #13 allowed  
**Total APIs:** 12 (refactored into unified-api-handler.ts)  
**Last Updated:** 2026-08-17 (marked HISTORICAL: 2026-08-18)  
**Verified By:** Phase 2 Audit

---

## 🔐 ARCHITECTURE CONSTRAINT

```
┌─────────────────────────────────────┐
│  SELFPRINT V3 — 12 API ARCHITECTURE │
│     THIS IS LOCKED AND FIXED        │
│  NO ADDITIONAL APIS MAY BE CREATED  │
└─────────────────────────────────────┘
```

**Rationale:**
- 12 SICE ≠ 12 APIs (different layers)
- Edge Functions + Orchestrator handle intelligent routing
- All features must fit within existing 12 APIs
- Adding API #13 violates architecture constraint
- Use existing APIs + Edge Functions instead

---

## 📋 COMPLETE API INVENTORY (12/12)

### 1️⃣ Nova AI Guide API
**Purpose:** Claude AI guide for user intelligence  
**Endpoint:** `POST /api/nova`  
**File:** `src/pages/api/nova.ts` + `src/services/NovaAPIService.ts`  
**Caller:** Frontend (React components)  
**Database:** user_profiles (read for context)  
**Authentication:** Supabase session + rate limit  
**Request Body:**
```typescript
{
  system: string;        // System prompt
  messages: Message[];   // Conversation history
  temperature?: number;  // Model temperature (0.7 default)
  max_tokens?: number;   // Max response length (1000 default)
}
```
**Response:**
```typescript
{
  content: string;  // Claude's response
}
```
**Status:** ✅ IMPLEMENTED  
**Edge Integration:** None (direct Claude API)  
**Error Handling:** 405 (method), 400 (validation), 500 (API key), 500 (Claude error)

---

### 2️⃣ Twin Operations API
**Purpose:** Twin creation, state management, chat  
**Endpoints:**
  - `POST /api/twin` — Chat with Twin
  - `POST /api/twin/create` — Create Twin profile
  - `POST /api/twin-stream` — Streaming Twin response
**Files:** 
  - `src/services/TwinAPIService.ts`
  - `src/api/twin/create.ts`
  - `src/services/TwinSupabaseService.ts`
**Caller:** Frontend (chat interface, Twin creation)  
**Database:**
  - twins (create, read, update)
  - twin_memories (read, write)
  - twin_sice_scores (read, update)
  - user_profiles (read)
**Authentication:** Supabase session + Twin ownership check  
**Request Body (chat):**
```typescript
{
  twinId: string;
  message: string;
  world?: string;  // Current world context
  conversationHistory?: Array<{role: string; content: string}>;
}
```
**Request Body (create):**
```typescript
{
  userId: string;
  twinName: string;
  personalityEssence?: string;  // From SICE
  birthData?: { date, time, timezone };
}
```
**Response (chat):**
```typescript
{
  twinId: string;
  message: string;
  personalityState: Record<string, unknown>;
  confidenceScore: number;
}
```
**Status:** ✅ PARTIAL (sessionStorage hack in CoreAwakeningService)  
**Edge Integration:** Could move chat logic to Edge for scale  
**Error Handling:** 400 (validation), 401 (auth), 403 (ownership), 500 (DB/AI error)

---

### 3️⃣ SICE Orchestration API
**Purpose:** 12 SICE engines parallel orchestration  
**Endpoint:** `POST /api/sice/process`  
**File:** `src/api/sice/process.ts` + `src/services/sice/SICEOrchestrator.ts`  
**Caller:** Frontend (Self Print, Twin awakening)  
**Database:**
  - user_profiles (read for context)
  - twin_sice_scores (read, write)
  - user_insights (write)
**Authentication:** Supabase session + rate limit  
**Request Body:**
```typescript
{
  userId: string;
  userInput?: string;
  currentWorld?: WorldId;
  conversationHistory?: Array<{role: string; content: string}>;
}
```
**Response:**
```typescript
{
  success: boolean;
  result?: OrchestratorResult;  // 12 SICE results + synthesis
  message: string;
}
```
**Engines Orchestrated:** PersonalContextBuilder, PatternDetector, InsightEngine, AIFeedbackLoop, TwinStateEngine, ExperienceEngine, EnvironmentEngine, BadgeEngine, BehavioralForecastEngine, FutureSelfEngine, MemoryManager, DecisionIntelligenceEngine  
**Status:** ⚠️ PARTIAL (engines 4/12 incomplete)  
**Edge Integration:** ✅ RECOMMENDED (move orchestration to Edge for performance)  
**Error Handling:** 400 (validation), 401 (auth), 500 (orchestration error)

---

### 4️⃣ Core Awakening API
**Purpose:** Twin birth ceremony, essence generation  
**Endpoint:** `POST /api/core-awakening`  
**File:** `src/api/core-awakening.ts` + `src/services/CoreAwakeningService.ts`  
**Caller:** Frontend (Onboarding flow, Self Print completion)  
**Database:**
  - twins (create)
  - twin_memories (create initial)
  - twin_sice_scores (initialize)
  - awakening_essence (create) — NEEDED (currently using sessionStorage)
**Authentication:** Supabase session + Full Analysis completion check  
**Request Body:**
```typescript
{
  userId: string;
}
```
**Response:**
```typescript
{
  success: boolean;
  twinId?: string;
  message: string;
  essence?: { personalIntelligence, siceResults, synthesis };
}
```
**Status:** ❌ BLOCKER (sessionStorage hack, not persisted to Supabase)  
**Edge Integration:** Should move to Edge for reliability  
**Error Handling:** 401 (auth), 400 (not ready), 500 (orchestration failed)

---

### 5️⃣ Decision Recording API
**Purpose:** Log decisions, schedule follow-ups, track outcomes  
**Endpoints:**
  - `POST /api/decision` — Record decision
  - `GET /api/decision?userId=...` — Fetch decisions
  - `PUT /api/decision/:id` — Update decision
  - `DELETE /api/decision/:id` — Delete decision
  - `POST /api/decision/outcome` — Record outcome
**Files:**
  - `src/services/DecisionService.ts`
  - `server/api/decisions` (backend routing)
  - `src/pages/api/decisions.ts` (if exists)
**Caller:** Frontend (Decision Dashboard)  
**Database:**
  - decision_log (CRUD)
  - decision_outcomes (create, read, update)
  - follow_up_schedule (create, read)
  - decision_patterns (read, write)
**Authentication:** Supabase session + user isolation  
**Request Body (record):**
```typescript
{
  userId: string;
  twinId?: string;
  title: string;
  category: string;
  description: string;
  options: string[];
  selectedOption: string;
  confidence: number;  // 0-100
  world?: string;
  metadata?: Record<string, unknown>;
}
```
**Response (record):**
```typescript
{
  success: boolean;
  decisionId: string;
  scheduledFollowUps: Array<{ date, days }>;
  message: string;
}
```
**Status:** ✅ IMPLEMENTED (Phase E) / ⚠️ PARTIAL (Phase F learning incomplete)  
**Edge Integration:** Follow-up scheduling could move to Edge  
**Error Handling:** 400 (validation), 401 (auth), 403 (user isolation), 500 (DB error)

---

### 6️⃣ Notifications API
**Purpose:** Schedule, deliver, track notifications (follow-ups, achievements, reminders)  
**Endpoints:**
  - `GET /api/notifications?userId=...&action=list` — List notifications
  - `POST /api/notifications?action=schedule` — Schedule notification
  - `POST /api/notifications?action=mark-read` — Mark read
  - `POST /api/notifications?action=record-outcome` — Log outcome
**Files:**
  - `src/api/notification-endpoints.ts`
  - `src/api/unified-api-handler.ts` (router)
  - `src/services/PushScheduler.ts`
  - `src/services/DecisionFollowUpNotifier.ts`
**Caller:** Frontend (notification panel), Backend (follow-up scheduler)  
**Database:**
  - notification_queue (create, read, update)
  - push_subscriptions (read)
  - notification_analytics (write)
**Authentication:** Supabase session + push subscription validation  
**Request Body (schedule):**
```typescript
{
  userId: string;
  twinId?: string;
  type: 'decision-follow-up' | 'achievement' | 'reminder' | 'daily-brief';
  title: string;
  message: string;
  scheduledFor: string;  // ISO timestamp
  timezone: string;
  metadata?: Record<string, unknown>;
}
```
**Response (list):**
```typescript
{
  success: boolean;
  data?: {
    notifications: Notification[];
    total: number;
    unread: number;
  };
}
```
**Status:** ⚠️ PARTIAL (notifications scheduled but TODO: send at line 137)  
**Edge Integration:** Could move scheduler to Edge for reliability  
**Error Handling:** 400 (validation), 401 (auth), 500 (scheduling error)

---

### 7️⃣ Twin Evolution API
**Purpose:** Track Twin progression (Seed → Awakening → Growing → Advanced → Complete)  
**Endpoint:** `POST /api/twin-evolution?action=...`  
**File:** `src/api/twin-evolution.ts` + `src/services/TwinEvolutionService.ts`  
**Caller:** Frontend (Twin profile page)  
**Database:**
  - twins (update stage)
  - twin_evolution_logs (write)
  - twin_sice_scores (read for progression triggers)
**Authentication:** Supabase session + Twin ownership  
**Query Parameters:**
  - `action`: 'get-stage' | 'progress' | 'unlock' | 'history'
  - `twinId`: Twin identifier
  - `userId`: User identifier
**Request Body (progress):**
```typescript
{
  twinId: string;
  trigger: 'activity' | 'sice-score' | 'decision' | 'memory';
  metrics: Record<string, number>;
}
```
**Response (stage):**
```typescript
{
  success: boolean;
  stage: number;  // 1-5
  stageName: 'Seed' | 'Awakening' | 'Growing' | 'Advanced' | 'Complete';
  progress: number;  // 0-100
  nextUnlock?: string;
}
```
**Status:** ⚠️ PARTIAL (progression triggers incomplete)  
**Edge Integration:** None currently  
**Error Handling:** 400 (validation), 401 (auth), 403 (ownership), 500 (DB error)

---

### 8️⃣ Intelligence Analysis API
**Purpose:** Astrovera psychology analysis via Claude (Natal chart, patterns, insights)  
**Endpoint:** `POST /api/intelligence`  
**File:** `server/index.ts` (Express backend)  
**Caller:** Frontend (Analysis page)  
**Database:**
  - user_profiles (read for birth date)
  - analysis_results (write)
**Authentication:** Supabase session  
**Request Body:**
```typescript
{
  mood: string;  // 'stressed' | 'confused' | 'confident' | 'drained' | 'ready' | 'reflective'
  birthDate: string;  // YYYY-MM-DD
  finetuneAnswers?: Record<string, string>;
  question?: string;
}
```
**Response:**
```typescript
{
  chartData: Record<string, unknown>;  // Natal chart
  insights: string[];  // Psychology insights
  recommendations: string[];
  patterns: Record<string, unknown>;
}
```
**Status:** ✅ IMPLEMENTED  
**Edge Integration:** Could move to Edge  
**Error Handling:** 400 (validation), 401 (auth), 500 (Claude API error), 500 (safety check fails)

---

### 9️⃣ Stripe Payment API
**Purpose:** Subscription management, checkout, customer portal  
**Endpoints:**
  - `POST /api/stripe?action=create-checkout` — Create checkout session
  - `POST /api/stripe?action=create-portal` — Create billing portal
  - Webhook: `/api/stripe-webhook` (separate from API count)
**File:** `src/services/stripeService.ts` + backend routing  
**Caller:** Frontend (pricing page, account settings)  
**Database:**
  - stripe_customers (read, create)
  - stripe_subscriptions (read, create, update)
  - user_entitlements (write on webhook)
**Authentication:** Supabase session  
**Request Body (checkout):**
```typescript
{
  priceId: string;
  planName: string;
  email: string;
  userId: string;
}
```
**Response (checkout):**
```typescript
{
  success: boolean;
  sessionUrl?: string;
  checkoutSessionId?: string;
}
```
**Status:** ⚠️ PARTIAL (checkout works, entitlement enforcement incomplete)  
**Edge Integration:** Could move checkout creation to Edge  
**Error Handling:** 400 (validation), 401 (auth), 500 (Stripe API error)

---

### 🔟 Authentication API (Passkey/WebAuthn)
**Purpose:** Register & verify passkey authentication  
**Endpoints:**
  - `POST /api/auth/passkey/register-options` — Start passkey registration
  - `POST /api/auth/passkey/register` — Complete passkey registration
  - `POST /api/auth/passkey/authenticate-options` — Start passkey login
  - `POST /api/auth/passkey/authenticate` — Complete passkey login
**Files:** 
  - `supabase/functions/auth-registration-options/index.ts`
  - `supabase/functions/auth-register-passkey/index.ts`
  - `supabase/functions/auth-authentication-options/index.ts`
  - `supabase/functions/auth-verify-passkey/index.ts`
  - `src/hooks/usePasskey.ts`
**Caller:** Frontend (auth pages)  
**Database:**
  - auth.users (create/read, Supabase built-in)
  - user_profiles (create on registration)
  - passkey_credentials (store public keys)
**Authentication:** None for registration / Passkey challenge for login  
**Status:** ✅ IMPLEMENTED  
**Edge Integration:** ✅ Running on Supabase Edge Functions  
**Error Handling:** 400 (validation), 401 (invalid challenge), 409 (duplicate), 500 (Supabase error)

---

### 1️⃣1️⃣ Memory Management API
**Purpose:** Store, retrieve, relevance-score user memories (conversations, experiences, insights)  
**Endpoints:**
  - `POST /api/memory/store` — Store memory
  - `GET /api/memory/retrieve` — Retrieve memories
  - `POST /api/memory/search` — Search memories
  - `DELETE /api/memory/:id` — Delete memory
**Files:**
  - `src/services/MemoryManager.ts`
  - `supabase/functions/memory-manager/index.ts`
  - `src/services/TwinSupabaseService.ts`
**Caller:** Frontend (Twin chat), Backend (services)  
**Database:**
  - twin_memories (CRUD)
  - memory_relevance (read, write scores)
**Authentication:** Supabase session + Twin ownership  
**Request Body (store):**
```typescript
{
  twinId: string;
  world: string;
  role: 'user' | 'twin' | 'system';
  content: string;
  metadata?: {
    eventType?: string;
    topic?: string;
    confidence?: number;
  };
}
```
**Response (retrieve):**
```typescript
{
  success: boolean;
  memories: Array<{
    id: string;
    content: string;
    world: string;
    relevance: number;
    createdAt: string;
  }>;
}
```
**Status:** ✅ IMPLEMENTED  
**Edge Integration:** ✅ Memory retrieval on Edge Functions  
**Error Handling:** 400 (validation), 401 (auth), 403 (ownership), 500 (DB error)

---

### 1️⃣2️⃣ World Expertise API
**Purpose:** Provide world-specific expert context and recommendations  
**Endpoints:**
  - `GET /api/world/expert?world=...` — Get world expertise
  - `POST /api/world/context` — Set world context
  - `GET /api/world/recommendation?world=...` — Get world recommendation
**File:** `src/services/WorldExpertiseService.ts` + `src/context/WorldContext.tsx`  
**Caller:** Frontend (world switching, Twin chat per world)  
**Database:**
  - world_definitions (read)
  - world_user_data (read, write per world)
  - twin_world_assignments (read)
**Authentication:** Supabase session + Twin ownership  
**Request Body (context):**
```typescript
{
  twinId: string;
  world: WorldId;  // 'self' | 'health' | 'wealth' | 'relationships' | etc
  contextData?: Record<string, unknown>;
}
```
**Response (expertise):**
```typescript
{
  world: WorldId;
  expertise: string;  // World-specific expert role
  prompt: string;  // Expert system prompt
  recommendations: string[];
  badges: Badge[];
}
```
**Status:** ⚠️ PARTIAL (12 Worlds ~30% integrated)  
**Edge Integration:** Could move prompt generation to Edge  
**Error Handling:** 400 (validation), 401 (auth), 404 (unknown world), 500 (DB error)

---

## 🔗 API FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                              │
└──────────────────────────────────────────────────────────────────────┘
                           ↓ (HTTP)
┌──────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / ROUTES                             │
│                   (12 APIs locked, fixed)                            │
│  1. Nova  2. Twin  3. SICE  4. Awakening  5. Decision  6. Notif      │
│  7. Evolution  8. Intelligence  9. Stripe  10. Auth  11. Memory     │
│  12. World Expertise                                                 │
└──────────────────────────────────────────────────────────────────────┘
                           ↓ (internal)
┌──────────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (orchestration)                  │
│  - Auth (Passkey)  - Pattern Detection  - Memory Manager             │
│  - Daily Brief  - Data Export  - Account Ops  - Rate Limiting       │
└──────────────────────────────────────────────────────────────────────┘
                           ↓ (internal)
┌──────────────────────────────────────────────────────────────────────┐
│                 SERVICES & ORCHESTRATORS                              │
│  - SICEOrchestrator (12 engines)  - Twin services  - Decision logic │
│  - Memory synthesis  - Analytics  - Twin evolution                  │
└──────────────────────────────────────────────────────────────────────┘
                           ↓ (internal)
┌──────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE (PostgreSQL)                     │
│  - user_profiles  - twins  - twin_memories  - decisions              │
│  - notifications  - stripe_* (customers, subscriptions)             │
│  - analytics  - decision_patterns  - world_definitions              │
└──────────────────────────────────────────────────────────────────────┘
                           ↓ (external)
┌──────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL AI/SERVICES                             │
│  - Claude API (Nova, analysis)  - Stripe (payments)                 │
│  - Web Push notifications                                           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## ✅ API GOVERNANCE CHECKLIST

Before implementing any new feature, verify:

```
[ ] 1. Does an existing API handle this?
[ ] 2. Can I use an existing endpoint (new action)?
[ ] 3. Can I merge this into Edge Functions?
[ ] 4. Can I use an existing service?
[ ] 5. Can I use the Orchestrator?
[ ] 6. No endpoint duplication?
[ ] 7. No business logic duplication?

If any answer to 1-7 is YES:
  → REUSE existing API/service/function
  
If all answers are NO:
  → BLOCKED: Cannot add API #13
  → Must redesign within 12 API constraint
```

---

## 🔴 KNOWN ISSUES (Phase 2 Audit)

| API | Issue | Impact | Blocker |
|-----|-------|--------|---------|
| Twin Create | sessionStorage hack | Essence not persisted | Phase 3 P0 |
| Decision | 3 TODO comments | Learning loop incomplete | Phase 7 P0 |
| SICE | Engines 4/12 incomplete | AI quality degraded | Phase 4 P0 |
| Notifications | TODO line 137 | Follow-ups not sent | Phase 7 P0 |
| Worlds | Only 30% integrated | World routing incomplete | Phase 6 P0 |
| Stripe | Entitlements partial | Feature gates broken | Phase 8 P0 |

---

## 📊 API STATUS SUMMARY

| API | Status | Tests | Docs | Production |
|-----|--------|-------|------|-----------|
| 1. Nova | ✅ IMPLEMENTED | ⚠️ Partial | ✅ OK | ⚠️ Needs monitoring |
| 2. Twin | ⚠️ PARTIAL | ⚠️ Partial | ⚠️ Incomplete | ❌ sessionStorage bug |
| 3. SICE | ⚠️ PARTIAL | ⚠️ Partial | ⚠️ Incomplete | ⚠️ Engines incomplete |
| 4. Awakening | ❌ BLOCKER | ❌ None | ⚠️ Incomplete | ❌ Not persisted |
| 5. Decision | ⚠️ PARTIAL | ⚠️ Partial | ⚠️ Incomplete | ⚠️ Learning incomplete |
| 6. Notifications | ⚠️ PARTIAL | ⚠️ Partial | ⚠️ Incomplete | ❌ Dispatch TODO |
| 7. Evolution | ⚠️ PARTIAL | ⚠️ Minimal | ⚠️ Incomplete | ⚠️ Triggers incomplete |
| 8. Intelligence | ✅ IMPLEMENTED | ⚠️ Partial | ✅ OK | ✅ Working |
| 9. Stripe | ⚠️ PARTIAL | ❌ None | ⚠️ Incomplete | ⚠️ Entitlements incomplete |
| 10. Auth | ✅ IMPLEMENTED | ✅ Good | ✅ OK | ✅ Working |
| 11. Memory | ✅ IMPLEMENTED | ✅ Good | ✅ OK | ✅ Working |
| 12. World | ⚠️ PARTIAL | ⚠️ Minimal | ⚠️ Incomplete | ⚠️ Routing incomplete |

---

## 🎯 ARCHITECTURE LOCK VERIFICATION

**Verified on:** 2026-08-17 (Phase 2)

✅ **12 APIs confirmed**
- Counted: 12 unique, independent endpoints
- No API #13 exists
- No duplicate endpoints

✅ **API Independence verified**
- Each API has single responsibility
- No overlapping purposes
- Clear separation of concerns

✅ **Extensibility within 12 APIs**
- Can add new `action` query parameters
- Can add Edge Functions for orchestration
- Can refactor services without adding APIs

**Lock Status:** 🔴 **LOCKED** — Verified, no changes allowed without architecture review

---

**Document:** API_ARCHITECTURE.md  
**Last Verified:** Phase 2 (2026-08-17)  
**Next Review:** After Phase 3 (Core Awakening completion)
