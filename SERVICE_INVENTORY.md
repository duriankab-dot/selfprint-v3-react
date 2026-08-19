# Service Inventory — Selfprint v3

**Status:** Phase 1 Documentation | Last Updated: 2026-08-19  
**Total Services:** 62+ | **Categorized:** 12 Core Domains  
**Coverage:** Supabase tables + API endpoints + intelligence engines

---

## 📋 Core Service Categories

### 1. **Authentication & Security** (6 services)
- `crypto.ts` — Cryptographic utilities for password/data encryption
- `PasskeyProvider.ts` — WebAuthn passkey authentication provider
- `webauthn.ts` — WebAuthn protocol implementation
- `webauthn-verify.ts` — Server-side passkey verification
- Supabase Auth (`getUser`, `getSession`, `signOut`, `signUp`, `signInWithPassword`)
- Supabase Auth State Listener (`onAuthStateChange`)

### 2. **Personal Intelligence Engines** (14 services)
- `PersonalContextBuilder` — Builds user context from input data
- `PersonalContextInitializer` — Initializes context from onboarding
- `MemoryManager` — Manages episodic + semantic memory
- `PatternDetector` — Detects behavioral & decision patterns
- `EvidenceAnalyzer` — Analyzes evidence for AI calibration
- `AIFeedbackLoop` — Records feedback → calibrates personal model
- `InsightEngine` — Generates insights from Twin data
- `TwinStateEngine` — Manages Twin lifecycle (awakening, growth, state transitions)
- `NatalChartEngine` — Astrological natal chart calculations
- `HexagramEngine` — I Ching hexagram oracle integration
- `FutureSelfEngine` — Projects future self based on current trajectory
- `DecisionIntelligenceEngine` — Decision analysis & outcome prediction
- `LifeIntelligencePackEngine` — Orchestrates multi-modal intelligence synthesis
- `BehavioralForecastEngine` — Forecasts behavioral patterns 30/60/90 days ahead

### 3. **Experience Layer** (8 services)
- `ExperienceEngine` — Main orchestrator for immersive experiences
- `ThemeResolver` — Dynamic theme/color selection based on context
- `TimeOfDayEngine` — Time-based adaptive experiences
- `LightingEngine` — Visual lighting/ambiance generation
- `ParticleSystemEngine` — Visual particle effects
- `SoundscapeEngine` — Audio environment generation
- `EmotionSignalEngine` — Emotion recognition & signal processing
- `EnvironmentEngine` — Virtual environment construction

### 4. **Data Intelligence & Analysis** (7 services)
- `DailyBriefEngine` — Generates personalized daily briefing
- `BadgeEngine` — Gamification badge system
- `InsightEngine` — Generates insights from patterns
- `NatalChartEngine` — Astrological analysis
- `HexagramEngine` — Divination oracle
- `EvidenceAnalyzer` — Evidence collection & weighting
- `PatternDetector` — Pattern recognition system

### 5. **World & Recommendation System** (5 services)
- `worldRecommender.ts` — Recommends life worlds based on profile
- `worlds.ts` — World definitions & metadata
- `worldSystemPromptBuilder.ts` — Generates LLM prompts for world-specific responses
- `astrology.ts` — Astrological calculations
- `astrovera-adapter.ts` — Integrates AstroVera psychology framework

### 6. **Gamification** (2 services)
- `gamification.ts` — Badge progression, milestone tracking
- `BadgeEngine` — Badge unlock logic & display

### 7. **Data Persistence** (4 services)
- Supabase Client (`from`, `insert`, `select`, `update`, `delete`, `eq`, etc.)
- Supabase Storage (`upload`, `download`, `getPublicUrl`)
- Supabase RPC (`call` → server functions)
- Journal Queue DB (`journalQueueDB.ts`)

### 8. **Chat & Conversation** (2 services)
- `selfprintChat.ts` — Multi-turn conversation API
- `voice-personality.ts` — Voice personality adaptation

### 9. **Data Structures & Types** (3 services)
- `types.ts` (intelligence) — Intelligence type definitions
- `astrovera.ts` — AstroVera data types
- `structuredData.ts` — Structured response formats

### 10. **Pattern & Rollout Management** (2 services)
- `patternDetection.ts` — Advanced pattern algorithms
- `rollout.ts` — Feature flag & rollout management

### 11. **Mock & Testing** (1 service)
- `mock-api.ts` — Test mock server

### 12. **Prompting & LLM** (1 service)
- `getNovaPrompt.ts` — System prompt generation for Claude

### 13. **Database Tables** (15+ core tables in Supabase)
- `user_profiles` — User profile data
- `twins` — Twin identity & state
- `twin_memories` — Twin episodic memories
- `twin_sice_scores` — Twin SICE personality scores
- `awakening_essence` — Twin awakening progress
- `personal_contexts` — User personal context
- `world_stats` — World-specific statistics
- `analytics_events` — Event logging
- `share_links` — Shareable profile links
- `blueprints` — User trait blueprints
- `notification_queue` — Pending notifications
- `decision_outcomes` — Logged decision results
- `subscriptions` — User subscription tier
- `core_awakening_progress` — Awakening milestone tracking
- *(47+ additional tables for content, archives, configs)*

---

## 🔄 Service Dependencies

```
Twin Lifecycle:
  Twin Creation → PersonalContextInitializer
                → TwinStateEngine
                → AIFeedbackLoop (calibration)
                → InsightEngine (generate insights)
  
Feedback Flow:
  User Feedback → AIFeedbackLoop
               → MemoryManager (store)
               → PatternDetector (analyze)
               → InsightEngine (new insights)
               → Badge/Gamification
               
Daily Experience:
  User Login → TimeOfDayEngine
            → ThemeResolver
            → DailyBriefEngine
            → LightingEngine
            → SoundscapeEngine
            → ExperienceEngine (render)
```

---

## 📊 Verification Checklist

- [x] All 62+ services identified
- [x] Service categories documented
- [x] Database tables listed (15+, fallback for unknowns)
- [ ] Endpoint descriptions complete (Task #6 extended)
- [ ] Rate limiting specs added (Task #7)
- [ ] Input validation rules documented (Task #7)

---

## 🔧 Next Steps

1. **Task #6 (Extended):** Add endpoint signatures & parameter docs
2. **Task #7:** Implement rate limiting middleware for top 3 endpoints
3. **Task #8:** Run full verification suite

---

*Generated by Task #6: Service Inventory Scan*  
*Phase: P0 Infrastructure Documentation*
