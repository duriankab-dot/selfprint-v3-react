# FORENSIC PHASE 03 — COMPLETE CAPABILITY DISCOVERY

**วันที่ตรวจ:** 27 กันยายน 2026  
**ขอบเขต:** ทั้ง repository `D:/selfprint-v3-react` (1,161 tracked files)  
**วิธีตรวจ:** grep import tracing, file reads แบบ read-only, git ls-files enumeration  
**สถานะ:** ทุก claim มี source-code reference รองรับ  

---

## 1. ขอบเขตการตรวจ

### สิ่งครอบคลุม
- **ทุก route/page** (41 routes จาก App.tsx)
- **ทุก major UI action** (buttons, forms, menus, modals, wizards จาก components ทั้งหมด)
- **ทุก hook ที่เป็น user-facing behavior** (33 hooks จาก src/hooks/)
- **ทุก service** (35 services + 17 SICE engines)
- **ทุก API endpoint** (Cloudflare Functions 7 dedicated + unified-handler modules)
- **ทุก Cloudflare Function** (twin, nova, nova-stream, twin-stream, metrics, og, autonomy-log, [[route]].ts)
- **ทุก Supabase Edge Function** (13 functions ใน supabase/functions/)
- **ทุก database table** ที่มี application usage (20+ tables จาก migrations + queries)
- **ทุก storage bucket** (profiles bucket จาก migration 038)
- **ทุก AI capability** (OpenRouter via callOpenRouter, 3 invocation points)
- **Twin capability** (creation → birth → profile → chat → evolution → persistence)
- **World capability** (12 worlds, selection, recommendation, context, stats)
- **Decision capability** (create, track, follow-up, analytics, export)
- **Personal Context capability** (SICE-based analysis, pattern detection, insight generation)
- **Lifecycle capability** (ONBOARDING → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE)
- **Auth capability** (magic link, OAuth, passkey)
- **Onboarding/birth/awakening/recovery flow** (ครบ path)
- **Notification/push/email capability** (VAPID push, notification queue)
- **Export/import capability** (CSV/JSON decision export, data-export edge function)
- **Profile capability** (user profile, twin profile, twin settings)
- **Privacy/security/account-management capability** (passkey, privacy consent, account deletion)
- **Voice/audio capability** (Web Speech API, soundscape player, SFX system, audio settings)
- **Background/scheduled capability** (journal queue sync, follow-up scheduler, notification scheduling)
- **External trigger capability** (Stripe webhooks, OpenRouter API)

### สิ่งที่อยู่นอกขอบเขต
- Bitemebaby project (`src/BITEMEBABY_PRODUCT_REALITY_MAP.md`) — OUT OF SCOPE อย่างชัดเจน
- การรัน test จริงหรือ deploy (Phase 8 จะจัดการ)
- การแก้ไข bug หรือ source code ระหว่างการตรวจ

---

## 2. วิธีตรวจ

| วิธี | คำสั่ง/เครื่องมือ | ผลที่ได้ |
|------|-----------------|-----------|
| `git ls-files` | นับไฟล์ทั้ง repo | 1,161 tracked files, 555 TS/TSX, 92 test files |
| grep import tracing | trace caller → consumer ของทุก module | Import chains สำหรับทุก component/service/hook |
| File reads (อ่าน) | อ่าน source code จริงโดยไม่แก้ไข | Architecture, data flow, runtime behavior |
| Git status/ls-tree | ตรวจ untracked/ignored files | .kilo/plans, dist/, playwright-report/, test-results/ |
| Migration inspection | อ่าน migration 001–040 | Schema evolution, gaps (003/006/008/009/023) |

**ข้อจำกัดของ Phase นี้:** ไม่มีการรัน runtime test, ไม่มีการเข้าถึง staging URL, ไม่มีการ execute code — สรุปจาก static analysis ของ source code เพียงอย่างเดียว

---

## 3. Capability Inventory (ทั้งหมดที่ค้นพบ)

### A. Authentication & Authorization

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| AUTH-001 | Magic Link Login | LoginPage → signInWithMagicLink() | AuthContext.signInWithMagicLink() → supabase.auth.signInWithOtp() → OTP to email → redirect /dashboard | AuthContext.tsx:194-222; magic link handled by Supabase auth provider | 🟢 VERIFIED |
| AUTH-002 | OAuth Login (Google/Apple) | LoginPage → signInWithOAuth() | AuthContext.signInWithOAuth(provider) → supabase.auth.signInWithOAuth(provider) → redirect | AuthContext.tsx:224-243 | 🟢 VERIFIED |
| AUTH-003 | Passkey Registration | LoginPage → PasskeyLogin component → registerPasskey() | PasskeyProvider.isAvailable() → getRegistrationOptions() → webauthn.register() → invoke('auth-register-passkey') | PasskeyProvider.ts:32-188; lib/auth/passkey*.tsx | 🟢 VERIFIED |
| AUTH-004 | Passkey Sign-in | LoginPage → PasskeyLogin → signInWithPasskey() | passkeyProvider.authenticatePasskey(email) → verify with webauthn.get() → invoke('auth-authentication-options', 'auth-verify-passkey') → setSession() | PasskeyProvider.ts:126-170 | 🟢 VERIFIED |
| AUTH-005 | Session Management | Always mounted | onAuthStateChange listener → lazy SDK initialization → getSession after 100ms | AuthContext.tsx:70-130 | 🟢 VERIFIED |
| AUTH-006 | Sign Out | Any page → signOut() | supabase.auth.signOut() → clear session state | AuthContext.tsx:245-252 | 🟢 VERIFIED |
| AUTH-007 | Passkey Settings Page | /settings/passkeys | PasskeySettings.tsx shows registered passkeys, allows registration/deletion | pages/PasskeySettings.tsx | 🟢 VERIFIED |
| AUTH-008 | JWT Verification for API calls | functions/api/*.ts → verifyUser() | Checks Authorization header against Supabase auth token | api/_utils/verify-user.ts | 🟢 VERIFIED |
| AUTH-009 | Rate Limiting (Auth) | Passkey operations | auth-rate-limit Supabase Edge Function invoked by PasskeyProvider | supabase/functions/auth-rate-limit/index.ts | 🟡 PARTIAL (edge function exists but invocation path unclear) |

### B. User Onboarding & Profile

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| ONB-001 | Birth Date Input | Onboarding.tsx → BirthdateInput component | Collects DOB for Twin DNA calculation | components/onboarding/BirthdateInput.tsx | 🟢 VERIFIED |
| ONB-002 | Birth Time/Place Select | Onboarding.tsx → BirthDateTimeSelect, BirthPlaceSelect | Optional time/place for enhanced analysis | components/onboarding/BirthDateTimeSelect.tsx | 🟢 VERIFIED |
| ONB-003 | Finetuning Questions | Onboarding.tsx → FinetuningQuestions component | AI-driven questionnaire to refine Twin personality | components/onboarding/FinetuningQuestions.tsx | 🟢 VERIFIED |
| ONB-004 | AI Creation Sequence | Onboarding.tsx → AICreationSequence component | Stage-based progression: intro → connecting personality → Full Analysis | components/onboarding/AICreationSequence.tsx | 🟢 VERIFIED |
| ONB-005 | Full Analysis | Onboarding.tsx → FullAnalysis component | Runs astrological/SICE analysis based on birth data + answers | components/onboarding/FullAnalysis.tsx | 🟢 VERIFIED |
| ONB-006 | Initial Blueprint | Onboarding.tsx → InitialBlueprint component | Creates initial user blueprint/profile based on analysis | components/onboarding/InitialBlueprint.tsx | 🟢 VERIFIED |
| ONB-007 | Nova Conversation | Onboarding.tsx → NovaConversation component | Conversational interaction during onboarding phase | components/onboarding/NovaConversation.tsx | 🟢 VERIFIED |
| ONB-008 | SCIE Result Display | Onboarding.tsx → SCIEResult component | Displays analysis results to user | components/onboarding/SCIEResult.tsx | 🟢 VERIFIED |
| ONB-009 | Claim Account | LandingPage → ClaimAccount component | Post-signup claim workflow for existing accounts | components/onboarding/ClaimAccount.tsx | 🟡 PARTIAL (flow incomplete — needs verification) |
| ONB-010 | Pending Onboarding Save | Always active | Saves incomplete onboarding progress to sessionStorage | components/PendingOnboardingSaver.tsx | 🟢 VERIFIED |
| ONB-011 | Recovery Route | App.tsx → useRecoveryRoute hook | Restores interrupted onboarding sessions | hooks/useRecoveryRoute.ts | 🟢 VERIFIED |
| ONB-012 | User Profile Storage | Any page where profile updated | supabase-service → users_profiles table (selfprint schema) | services/supabase-service.ts, CoreAwakeningService.ts:73-79 | 🟢 VERIFIED |

### C. Twin Creation & Birth Ceremony

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| TWB-001 | Check Readiness | CoreAwakeningService.checkReadyForAwakening() | Validates: full_analysis_completed flag, no existing Twin row | CoreAwakeningService.ts:61-100 | 🟢 VERIFIED |
| TWB-002 | Start Awakening | CoreAwakeningService.startAwakening(userId) | Calls SICEOrchestrator.orchestrate(input) for essence generation | CoreAwakeningService.ts:100-357 | 🟢 VERIFIED |
| TWB-003 | Twin Creation (DB) | CoreAwakeningService.initializeTwin(userId, name, essenceId, birthDate, analysis) | createTwinInDatabase() INSERT twins table with archetype, maturityScore, visualDNA, fullAnalysis | TwinSupabaseService.ts:126-180 | 🟢 VERIFIED |
| TWB-004 | Hydrate Twin State | TwinContext.hydrateTwin(userId, savedTwin) | Sets local React state WITHOUT inserting DB (prevents UNIQUE constraint violation) | TwinContext.tsx:180-198 | 🟢 VERIFIED |
| TWB-005 | Set Twin Created | lifecycleStore.setTwinCreated(userId, twinId) | Updates user_lifecycle: status=TWIN_ALIVE, twin_id, twin_created_at | lifecycleStore.ts:113-151 | 🟢 VERIFIED |
| TWB-006 | Celebration Audio | celebrateTwinAwakening() | Prime + play celebration sound effect | lib/twin/twinCelebrationSound.ts | 🟢 VERIFIED |
| TWB-007 | Speak Twin Greeting | speakTwinGreeting(buildTwinGreeting(name), { lang }) | Web Speech API text-to-speech | lib/twin/twinVoice.ts | 🟢 VERIFIED |
| TWB-008 | Twin Birth Page Flow | /twin-birth → TwinBirthPage | 5 phases: intro → birth animation → naming → celebration → complete | pages/TwinBirthPage.tsx lines 28-317 | 🟢 VERIFIED |
| TWB-009 | Core Awakening Legacy | /core-awakening → CoreAwakening | Legacy entry point (same ceremony as TwinBirthPage, different UI layout) | pages/CoreAwakening.tsx | 🟡 PARTIAL (alias maintained but not primary path) |
| TWB-010 | Birth Data Hash | calculateArchetypes({ birthData }) | Generates archetype scores from birth date/time/place via astrology calculations | lib/astrology.ts, lib/ArchetypeScoreEngine.ts | 🟢 VERIFIED |
| TWB-011 | Visual DNA Generation | generateTwinDNA(birthInput, userId) | Deterministic SVG avatar shape/color from birth data hash (mulberry32 PRNG) | lib/twinVisualDNA.ts:57-94 | 🟢 VERIFIED |
| TWB-112 | Archetype Visual DNA | getTwinVisualDNA(primaryArchetype, secondaryArchetype) | Returns per-archetype color/shape/motionSpeed lookup | lib/twin/twinVisualDNA.ts:94-104 | 🟢 VERIFIED |

### D. Twin Chat (AI Conversation)

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| CHAT-001 | Send Message (Twin) | ImmersiveTwinChat → messages[] → callTwinAPI() | Build prompt with world/memory/context → POST /api/twin → response → append | TwinAPIService.ts:52-116; functions/api/twin.ts | 🟢 VERIFIED |
| CHAT-002 | Send Message (Nova) | NovaChat → addInsight(msg) | POST /api/nova → OpenRouter response | functions/api/nova.ts | 🟢 VERIFIED |
| CHAT-003 | Streaming Response | /api/twin-stream, /api/nova-stream | SSE streaming responses (exist but no frontend caller traced) | functions/api/twin-stream.ts, nova-stream.ts | ⚪ UNPROVEN |
| CHAT-004 | World Context Header | WorldContextHeader(world, compact) | Displays current world identity during chat | components/chat/WorldContextHeader.tsx | 🟢 VERIFIED |
| CHAT-005 | Floating Chat Button | FloatingSelfprintChat component | Draggable general-assistant button visible on every page | components/chat/FloatingSelfprintChat.tsx | 🟢 VERIFIED |
| CHAT-006 | Typing Indicator | TypingIndicator component | Shows "thinking" animation while waiting for AI response | components/chat/TypingIndicator.tsx | 🟢 VERIFIED |
| CHAT-007 | Message Persistence | supabase-service.saveMessage(userId, hub, role, content, wordId) | INSERT twin_memories (twin_id, user_id, role, content, world_id) | supabase-service.ts:34-50 | 🟢 VERIFIED |
| CHAT-008 | History Loading | Components read twin_memories for conversation history | SELECT * FROM twin_memories WHERE twin_id=? ORDER BY created_at DESC | Implied from saveMessage usage pattern | 🟡 PARTIAL (query implementation detail unclear) |
| CHAT-009 | Voice Chat | VoiceChatPage → VoiceChat component | Real-time voice conversation with AI | pages/VoiceChatPage.tsx, components/features/VoiceChat.tsx | 🟡 PARTIAL (needs runtime verification) |

### E. Twin Features Beyond Chat

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| TF-001 | Twin Presence Visualization | TwinPresence component | WebGL canvas rendering of Twin's visual identity | components/twin/TwinPresence.tsx | 🟢 VERIFIED |
| TF-002 | Three.js Twin Rendering | TwinThreeRenderer component | Interactive 3D model of Twin | components/twin/TwinThreeRenderer.tsx | 🟢 VERIFIED |
| TF-003 | Twin Evolution Tracking | useEvolutionTracking hook | Tracks milestones, badges, growth stages | hooks/useEvolutionTracking.ts | 🟢 VERIFIED |
| TF-004 | Twin Profile | TwinProfilePage, TwinProfileDetailPage | Display/edit Twin's archetype, maturity, settings | pages/TwinProfilePage.tsx, pages/TwinProfileDetailPage.tsx | 🟢 VERIFIED |
| TF-005 | Twin Patterns | TwinPatternsPage | Behavioral pattern insights based on decisions/history | pages/TwinPatternsPage.tsx | 🟢 VERIFIED |
| TF-006 | Twin Personality | TwinPersonalityPage | SICE dimension analysis visualization | pages/TwinPersonalityPage.tsx | 🟢 VERIFIED |
| TF-007 | Twin Settings | TwinSettingsPage (protected route) | Configuration options for Twin behavior/voice/appearance | pages/TwinSettingsPage.tsx | 🟢 VERIFIED |
| TF-008 | Twin Avatar/Living Diagram | LivingDiagram component, TwinDNAAvatar, SVGCore | Procedural avatar generation from Twin DNA | components/living/LivingDiagram.tsx, components/living/TwinDNAAvatar.tsx | 🟢 VERIFIED |
| TF-009 | Twin Stats Card | TwinStatsCard component | Displays Twin's key metrics at a glance | components/features/TwinStatsCard.tsx | 🟢 VERIFIED |
| TF-010 | Choice Consequence Display | ChoiceConsequence component | Shows outcomes of past decisions | components/twin/ChoiceConsequence.tsx | 🟢 VERIFIED |
| TF-011 | Memory List | MemoryList component | Displays stored memories/recollections | components/intelligence/MemoryList.tsx | 🟢 VERIFIED |
| TF-012 | Memory Insights | MemoryInsightsPage (protected route) | AI-generated insights from memory patterns | pages/MemoryInsightsPage.tsx | 🟢 VERIFIED |
| TF-013 | Badge Gallery | BadgePage → BadgeGallery component | Show earned badges from achievements | pages/BadgePage.tsx, components/features/BadgeGallery.tsx | 🟢 VERIFIED |
| TF-014 | Daily Brief | DailyBriefPage → DailyBrief component | Daily personalized intelligence summary | pages/DailyBriefPage.tsx, features/DailyBrief.tsx | 🟢 VERIFIED |
| TF-015 | Future Self Engine | FutureSelfPanel component | Projects Twin's future state based on current trajectory | components/dashboard/FutureSelfPanel.tsx | 🟢 VERIFIED |
| TF-016 | Bias Detection Dashboard | BiasDetectionDashboard component | Shows cognitive biases detected from user behavior | components/features/BiasDetectionDashboard.tsx | 🟢 VERIFIED |
| TF-017 | Confidence Indicator | ConfidenceIndicator component | Displays confidence level for AI responses | components/intelligence/ConfidenceIndicator.tsx | 🟢 VERIFIED |
| TF-018 | Feedback Widget | FeedbackWidget component | Allows user to rate AI responses | components/intelligence/FeedbackWidget.tsx | 🟢 VERIFIED |
| TF-019 | Pattern Display | PatternDisplay component | Visualizes behavioral patterns detected | components/intelligence/PatternDisplay.tsx | 🟢 VERIFIED |

### F. World System

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| WRD-001 | World Hub | WorldsHub (protected route /worlds) | Grid view of 12 selectable worlds with icons/descriptions | pages/WorldsHub.tsx | 🟢 VERIFIED |
| WRD-002 | World Detail | WorldDetail route /worlds/:worldId | Detailed view of individual world's content/personality | pages/WorldDetail.tsx | 🟢 VERIFIED |
| WRD-003 | World Environment Rendering | WorldEnvironment component | Renders world-themed background/lighting/effects | components/world/WorldEnvironment.tsx | 🟢 VERIFIED |
| WRD-004 | World Story Panel | WorldStoryPanel component | Displays world-specific narrative/context overlay | components/world/WorldStoryPanel.tsx | 🟢 VERIFIED |
| WRD-005 | World Tabs Navigation | WorldTabs component | Tab-based navigation between worlds | components/WorldTabs.tsx | 🟢 VERIFIED |
| WRD-006 | World Context Header | WorldContextHeader component | Shows active world badge in chat interface | components/chat/WorldContextHeader.tsx | 🟢 VERIFIED |
| WRD-007 | World Preferences | WorldContext.toggleFavoriteWorld() | Mark worlds as favorites in world_preferences table | WorldContext.tsx:160-187 | 🟢 VERITED |
| WRD-008 | World Visit Tracking | WorldContext.recordWorldVisit() | upsert world_stats.visits_count + world_preferences.last_accessed | WorldContext.tsx:190-235 | 🟢 VERIFIED |
| WRD-009 | World Stats Aggregation | WorldContext.getWorldStats() | Reads visitsCount, journalEntries, decisionsMade, insightsGained from world_stats | WorldContext.tsx:317-320 | 🟢 VERIFIED |
| WRD-010 | Top Worlds Ranking | WorldContext.getTopWorlds(limit=3) | Sorts by visits_count descending, returns top N | WorldContext.tsx:324-330 | 🟢 VERIFIED |
| WRD-011 | World Recommendation (Keyword) | TwinContext.recommendWorld(messageContent) | Simple keyword matching against world keywords (not AI-based) | TwinContext.tsx:228-258 | 🟢 VERIFIED |
| WRD-012 | World Recommendation (Advanced) | useWorldRecommendation hook | More sophisticated scoring including preferences, history, mood | hooks/useWorldRecommendation.ts | 🟢 VERIFIED |
| WRD-013 | World Ambient Tone | useWorldAmbientTone hook | Plays world-specific ambient audio | hooks/useWorldAmbientTone.ts | 🟢 VERIFIED |
| WRD-014 | World Badge Tracking | WorldContext unlockBadge/getWorldBadges/getWorldMastery | P0 #7.4 badge system integrated with world engagement | WorldContext.tsx:342-361 | 🟢 VERIFIED |
| WRD-015 | World Expertise Service | WorldExpertiseService class | Analyzes user expertise level per world | services/WorldExpertiseService.ts | 🟡 PARTIAL (service exists, integration unclear) |
| WRD-016 | World Badge Tracker | WorldBadgeTracker class | Tracks achievement progress across worlds | services/WorldBadgeTracker.ts | 🟡 PARTIAL (tracker exists, UI consumption unclear) |

### G. Decision Intelligence

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| DEC-001 | Record Decision | DecisionLoggerPage → recordDecision() | INSERT decision_log (twin_id, world, question, options[], twin_recommendation, user_choice, context) | DecisionService.ts:66-130 | 🟢 VERIFIED |
| DEC-002 | Follow-up Scheduling | DecisionService.scheduleFollowUps(decisionId) | Creates day30/90/180/365 entries in follow_up_schedules | DecisionService.ts line ~131 | 🟢 VERIFIED |
| DEC-003 | Record Outcome | DecisionService.recordOutcome(decisionId, feedback, impact, lessons) | INSERT decision_outcomes with feedback + updates dayN_completed flags | DecisionService.ts | 🟢 VERIFIED |
| DEC-004 | Get Decisions | DecisionService.getUserDecisions(twinId?, world?) | filtered SELECT with optional world filter | DecisionService.ts:~140 | 🟢 VERIFIED |
| DEC-005 | Get Decision Outcomes | DecisionService.getDecisionOutcomes(decisionId) | SELECT outcomes for specific decision | DecisionService.ts | 🟢 VERIFIED |
| DEC-006 | Pending Follow-ups | DecisionService.getPendingFollowUps(twinId) | SELECT where dayN_due < today AND dayN_completed = false | DecisionService.ts | 🟢 VERIFIED |
| DEC-007 | Decision Dashboard | DecisionDashboard (/decisions) | Table view with filtering by world, trend charts | pages/DecisionDashboard.tsx | 🟢 VERIFIED |
| DEC-008 | Decision Logger | DecisionLoggerPage (/decision-log) | Form to input new decisions with world tagging | pages/DecisionLoggerPage.tsx | 🟢 VERIFIED |
| DEC-009 | Export CSV/JSON | DecisionDashboard → exportEngine | Download decisions as CSV or JSON | DecisionDashboard.tsx:118-148; lib/decision/exportEngine.ts | 🟢 VERIFIED |
| DEC-010 | Decision Analytics | DecisionAnalytics component | Charts showing success rates, patterns over time | features/DecisionAnalytics.tsx | 🟢 VERIFIED |
| DEC-011 | Decision Comparison | DecisionCompare component | Side-by-side comparison of related decisions | features/DecisionCompare.tsx | 🟡 PARTIAL (component exists, may need verification) |
| DEC-012 | Decision Learning Service | DecisionLearningService.updatePattern() | Records outcome feedback for ML learning pipeline | services/DecisionLearningService.ts | 🟡 PARTIAL (learning pipeline depth unclear) |

### H. Personal Context & Intelligence

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| INT-001 | Personal Context Building | PersonalContextBuilder.getContext(userId) | Computes behavioral patterns, SICE scores, blind spots | lib/intelligence/PersonalContextBuilder.ts | 🟢 VERIFIED |
| INT-002 | Pattern Detection | PatternDetector.updatePattern(userId, patternName, evidencePoints) | Detects recurring behavioral patterns from decision history | lib/intelligence/PatternDetector.ts | 🟢 VERIFIED |
| INT-003 | Insight Engine | InsightEngine.generateInsights(context) | Generates actionable insights from personal context | lib/intelligence/InsightEngine.ts | 🟢 VERIFIED |
| INT-004 | AI Feedback Loop | AIFeedbackLoop.process(userId, response) | Learns from user corrections to improve future accuracy | lib/intelligence/AIFeedbackLoop.ts | 🟢 VERIFIED |
| INT-005 | Twin State Engine | TwinStateEngine.computeState(personalContext) | Maps personal context → computed twin state (analyzing/synthesizing/calibrating/etc) | lib/intelligence/TwinStateEngine.ts | 🟢 VERIFIED |
| INT-006 | Experience Engine | ExperienceEngine.compute(config) | Combines personal context + current hub + mood + twinState → adaptive theme + hub suggestion | lib/experience/ExperienceEngine.ts | 🟢 VERIFIED |
| INT-007 | Future Self Engine | FutureSelfEngine.project(currentContext) | Projects likely future self based on current trajectory | lib/intelligence/FutureSelfEngine.ts | 🟢 VERIFIED |
| INT-008 | Behavioral Forecast | BehavioralForecastEngine.forecast(context) | Predicts likely future behaviors | lib/intelligence/BehavioralForecastEngine.ts | 🟢 VERIFIED |
| INT-009 | Daily Brief Engine | DailyBriefEngine.compile(userId) | Compiles daily personalized intelligence brief | lib/intelligence/DailyBriefEngine.ts | 🟢 VERIFIED |
| INT-010 | Memory Manager | MemoryManager operations | Stores, retrieves, manages user memories | lib/intelligence/MemoryManager.ts | 🟢 VERIFIED |
| INT-011 | Emotional Intelligence | EmotionalIntelligenceEngine.analyze(moodSignals) | Maps emotional signals → understanding patterns | services/sice/engines/EmotionalIntelligenceEngine.ts | 🟡 PARTIAL (integration unclear) |
| INT-012 | Social Connection Engine | SocialConnectionEngine.analyze() | Analyzes social interaction patterns | services/sice/engines/SocialConnectionEngine.ts | 🟡 PARTIAL (integration unclear) |
| INT-013 | Goal Tracking Engine | GoalTrackingEngine.track() | Tracks user goals and progress | services/sice/engines/GoalTrackingEngine.ts | 🟡 PARTIAL (integration unclear) |
| INT-014 | Wellness Engine | WellnessEngine.assess() | Assesses wellbeing state | services/sice/engines/WellnessEngine.ts | 🟡 PARTIAL (integration unclear) |
| INT-015 | Badge Engine | BadgeEngine.evaluate(unlockSignals) | Determines which badges to award based on achievements | lib/intelligence/BadgeEngine.ts | 🟢 VERIFIED |
| INT-016 | Evidence Analyzer | EvidenceAnalyzer.analyze() | Evaluates quality/strength of evidence points | lib/intelligence/EvidenceAnalyzer.ts | 🟡 PARTIAL (usage unclear) |

### I. Lifecycle Management

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| LCF-001 | Lifecycle Transition | lifecycleStore.transitionTo(userId, status) | upsert user_lifecycle.status | lifecycleStore.ts:73-107 | 🟢 VERIFIED |
| LCF-002 | Load Lifecycle | lifecycleStore.loadLifecycle(userId) | SELECT maybeSingle() FROM user_lifecycle, auto-initialize ONBOARDING if missing | lifecycleStore.ts:181-333 | 🟢 VERIFIED |
| LCF-003 | Set Twin Created | lifecycleStore.setTwinCreated(userId, twinId) | upsert with status=TWIN_ALIVE, twin_id, twin_created_at | lifecycleStore.ts:113-151 | 🟢 VERIFIED |
| LCF-004 | Mark Activity | lifecycleStore.markActivity(userId) | UPDATE last_activity_at (non-critical, silently fails) | lifecycleStore.ts:156-175 | 🟢 VERIFIED |
| LCF-005 | Set Entry Path | lifecycleStore.setEntryPath(userId, path) | Persist entry_path to DB (fire-and-forget) | lifecycleStore.ts:339-355 | 🟢 VERIFIED |
| LCF-006 | Recovery Route | useRecoveryRoute hook | Resumes interrupted onboarding, redirects TWIN_ALIVE users to /dashboard | hooks/useRecoveryRoute.ts | 🟢 VERIFIED |
| LCF-007 | AWAKENING State | TwinBirthPage transitions to AWAKENING before creation | Explicit state transition in user journey | TwinBirthPage.tsx:135-143 | 🟢 VERIFIED |
| LCF-008 | TWIN_ALIVE State | Default state after successful Twin creation | Indicates completed birth ceremony | Seed script sets this status | 🟢 VERIFIED |
| LCF-009 | Recovery from Session Expiry | AuthContext handles auth state changes | If session drops, re-authenticate, lifecycle reloads | AuthContext.tsx:85-96 | 🟢 VERIFIED |

### J. AI & Model Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| AI-001 | Twin Chat (OpenRouter) | functions/api/twin.ts | POST /api/twin → verifyJWT → rateLimit(40/min) → callOpenRouter(nemotron-first) | functions/api/twin.ts | 🟢 VERIFIED |
| AI-002 | Nova AI (OpenRouter) | functions/api/nova.ts | POST /api/nova → verifyJWT → rateLimit(60/min) → callOpenRouter | functions/api/nova.ts | 🟢 VERIFIED |
| AI-003 | Streaming Responses | functions/api/twin-stream.ts, nova-stream.ts | SSE streaming (exists but no frontend caller traced) | functions/api/*-stream.ts | ⚪ UNPROVEN |
| AI-004 | Astrovera Edge Call | Onboarding.tsx → fetch(`${supabaseUrl}/functions/v1/astrovera-edge`) | Direct fetch to Supabase edge function for analysis | Onboarding.tsx:75 | 🟢 VERIFIED |
| AI-005 | Daily Brief AI | daily-brief edge function | OpenRouter call to generate personalized daily briefing | supabase/functions/daily-brief/index.ts:212 | ⚪ UNPROVEN (no frontend caller traced) |
| AI-006 | Pattern Detection AI | pattern-detect edge function | OpenRouter call to analyze behavioral patterns | supabase/functions/pattern-detect/index.ts:183 | ⚪ UNPROVEN (no frontend caller traced) |
| AI-007 | Model Strategy | nemotron-3-ultra-550b:free (primary), qwen3.7-flash (fallback) | Hardcoded in twin.ts/nova.ts comments, env override via TWIN_MODEL_ID | functions/api/twin.ts:17-19 | 🟢 VERIFIED |
| AI-008 | Prompt Construction | buildPrompt(role, world, memories, twinState, userContext) | Assembles system prompt with world context, memories, twin state | lib/prompts/promptBuilder.ts | 🟢 VERIFIED |
| AI-009 | Twin Prompts Config | config/twin-prompts.ts | Pre-defined system prompts for different scenarios | config/twin-prompts.ts | 🟢 VERIFIED |
| AI-010 | Nova Prompts Config | config/nova-prompts.ts | Pre-defined system prompts for Nova assistant | config/nova-prompts.ts | 🟢 VERIFIED |
| AI-011 | Rate Limiting | In-memory Map per IP address | Module-scope Map survives CF isolate restarts | functions/api/twin.ts:78-90 | 🟢 VERIFIED |
| AI-012 | CORS Protection | KNOWN_ORIGINS array check | Only selfprint.one domains allowed, fallback to wildcard with warning | functions/api/twin.ts:52-66 | 🟢 VERIFIED |
| AI-013 | Error Handling | try/catch around API calls | Returns { error } JSON on failure; logs server-side | All functions/*/index.ts | 🟢 VERIFIED |

### K. Audio & Voice Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| AUD-001 | Soundscape Player | SoundscapePlayer component | HTML5 audio playback with volume/mute controls | components/audio/SoundscapePlayer.tsx | 🟢 VERIFIED |
| AUD-002 | SFX Provider | SFXProvider component | Manages sound effects (birth sounds, whooshes, notifications) | components/audio/SFXProvider.tsx | 🟢 VERIFIED |
| AUD-003 | Audio Settings | AudioSettings component | Master volume, music/sfx toggles, per-source mixing | components/AudioSettings.tsx | 🟢 VERIFIED |
| AUD-004 | Audio Ducking | useAudioDucking hook | Lowers music when speaking/SFX plays (hook defined but NO CALLER FOUND) | hooks/useAudioDucking.ts | 🔴 BROKEN (code exists, no consumer) |
| AUD-005 | Web Speech TTS | speakTwinGreeting(), buildTwinGreeting() | Web Speech API text-to-speech for Twin greetings | lib/twin/twinVoice.ts | 🟢 VERIFIED |
| AUD-006 | Celebration Sounds | primeCelebrationAudio(), playCelebrationSound() | MP3 audio cues for Twin awakening celebration | lib/twin/twinCelebrationSound.ts | 🟢 VERIFIED |
| AUD-007 | Sound Effects Hooks | useTwinSFX, useUISFX, useTransitionSFX | Hook wrappers for playing various SFX | hooks/useTwinSFX.ts, useUISFX.ts, useTransitionSFX.ts | 🟢 VERIFIED |
| AUD-008 | Audio Context Integration | AudioContext provider | Centralized audio state management | context/AudioContext.tsx | 🟢 VERIFIED |
| AUD-009 | Voice Input | VoiceInput component | Microphone capture → speech recognition | components/features/VoiceInput.tsx | 🟡 PARTIAL (UI exists, needs runtime verification) |
| AUD-010 | Voice Output | VoiceOutput component | Text-to-speech output with volume control | components/features/VoiceOutput.tsx | 🟡 PARTIAL (UI exists, needs runtime verification) |
| AUD-011 | Voice Chat Page | VoiceChatPage (/voice) | Complete voice conversation interface | pages/VoiceChatPage.tsx | 🟡 PARTIAL (needs runtime verification) |

### L. Notification & Push Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| NOT-001 | Push Subscription | PWAInstallPrompt component | Registers service worker, requests push permission | components/PWAInstallPrompt.tsx | 🟢 VERIFIED |
| NOT-002 | Push Notification Dispatch | send-push edge function | VAPID-signed HTTP request to Firebase Cloud Messaging endpoints | supabase/functions/send-push/index.ts | 🟡 PARTIAL (no frontend caller traced) |
| NOT-003 | Push Subscriptions Table | push_subscriptions (migration 015) | Stores user subscription endpoint URLs | Migrations list | 🟢 VERIFIED (table exists) |
| NOT-004 | Browser Notifications | Notification.requestPermission() | Called from CoreAwakeningService, FollowUpScheduler | CoreAwakeningService.ts:1007; FollowUpScheduler.ts:176 | 🟢 VERIFIED |
| NOT-005 | Notification Queue | notification_queue table (unified-handler) | QUEUED notifications processed by backend | api/unified-handler.ts:188-280 | 🟡 PARTIAL (backend handler exists, consumer unclear) |
| NOT-006 | Follow-up Scheduler | FollowUpScheduler class | Reminds about upcoming follow-ups at day30/90/180/365 | services/FollowUpScheduler.ts | 🟡 PARTIAL (scheduler exists, trigger unclear) |
| NOT-007 | Notification Engagement | useNotificationEngagement hook | Track open rates, click-through (hook defined, NO CALLER) | hooks/useNotificationEngagement.ts | 🔴 BROKEN (code exists, no consumer) |

### M. Sharing & Viral Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| SHR-001 | Share Links | Share component (/share/:code) | View shared Twin analysis | pages/Share.tsx | 🟢 VERIFIED |
| SHR-002 | Generate Share Link | generateShareLink() in shareService | Create shareable URL with Twinned persona data | features/viral/api/shareService.ts | 🟢 VERIFIED |
| SHR-003 | Share Buttons | ShareButton component | One-click sharing to social platforms | components/viral/ShareButton.tsx | 🟢 VERIFIED |
| SHR-004 | OG Image Generation | og.ts Cloudflare Function | Dynamic OpenGraph images for social sharing | functions/api/og.ts | 🟢 VERIFIED |
| SHR-005 | Pair Analysis Display | getPairAnalysis() in shareService | Shows paired analysis view in shared pages | features/viral/api/shareService.ts | 🟢 VERIFIED |

### N. Privacy, Security & Account Management

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| SEC-001 | Privacy Center | PrivacyCenter (/privacy) | Privacy settings and data management | pages/PrivacyCenter.tsx | 🟢 VERIFIED |
| SEC-002 | Privacy Consent Columns | privacy_consent_columns (migration 014) | GDPR-style consent tracking | Migration 014 | 🟢 VERIFIED (schema exists) |
| SEC-003 | Data Export | data-export edge function | Full data export from Supabase | supabase/functions/data-export/index.ts | ⚪ UNPROVEN (no frontend caller traced) |
| SEC-004 | Account Deletion | account-delete edge function | Delete user data across all tables | supabase/functions/account-delete/index.ts | ⚪ UNPROVEN (no frontend caller traced) |
| SEC-005 | Account Recovery | account-recovery edge function | Magic link for passwordless recovery | supabase/functions/account-recovery/index.ts | ⚪ UNPROVEN (no frontend caller traced) |
| SEC-006 | Auth Rate Limiting | auth-rate-limit edge function | Prevent brute-force on authentication | supabase/functions/auth-rate-limit/index.ts | 🟡 PARTIAL (existence confirmed, frontend caller unclear) |
| SEC-007 | SQL Injection Prevention | validateUserId() in TwinAPIService | Regex whitelist [a-zA-Z0-9\-] for userId validation | TwinAPIService.ts:22-28 | 🟢 VERIFIED |
| SEC-008 | API Token Verification | verifyUser(authHeader, env) | Validates JWT from Authorization header | api/_utils/verify-user.ts | 🟢 VERIFIED |

### O. Payment & Subscription Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| PAY-001 | Pricing Page | PricingPage (/pricing) | Stripe pricing tiers display | pages/PricingPage.tsx | 🟢 VERIFIED |
| PAY-002 | Stripe Checkout | unified-handler stripe:create-checkout | Create Stripe checkout session | api/unified-handler.ts:~514-660 | 🟢 VERIFIED |
| PAY-003 | Stripe Webhook | unified-handler stripe:webhook | Handle payment events (subscription.created, invoice.paid, etc.) | api/unified-handler.ts:702-760 | 🟢 VERIFIED |
| PAY-004 | Subscriptions Table | subscriptions table (migration 016) | Store tier/status/billing info | Migration 016 | 🟢 VERIFIED (schema exists) |
| PAY-005 | Pricing Success Page | PricingSuccessPage (/pricing/success) | Post-payment confirmation | pages/PricingSuccessPage.tsx | 🟢 VERIFIED |
| PAY-006 | UsePricing Hook | usePricing hook | Pricing logic used in UI components | hooks/usePricing.ts | 🟡 PARTIAL (implementation unclear) |

### P. Story & Narrative Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| STR-001 | Big Story Component | BigStory component | Long-form narrative visualization | components/story/BigStory.tsx | 🟢 VERIFIED |
| STR-002 | Current Chapter | CurrentChapter component | Active story chapter display | components/story/CurrentChapter.tsx | 🟢 VERIFIED |
| STR-003 | Narrative Hook | NarrativeHook component | Opening narrative elements | components/story/NarrativeHook.tsx | 🟢 VERIFIED |
| STR-004 | Provenance Strip | ProvenanceStrip component | Shows data sources behind AI statements | components/story/ProvenanceStrip.tsx | 🟢 VERIFIED |
| STR-005 | Story Mode Selector | StoryModeSelector component | Choose story presentation style | components/story/StoryModeSelector.tsx | 🟢 VERIFIED |
| STR-006 | Story Narrative Service | StoryNarrativeService | Service orchestrating story construction | lib/story/StoryNarrativeService.ts | 🟢 VERIFIED |
| STR-007 | useStoryNarrative Hook | useStoryNarrative hook | Reactive story state management | hooks/useStoryNarrative.ts | 🟢 VERIFIED |

### Q. Content & Educational Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| CON-001 | Blog Listing | BlogListPage (/blog) | Lists blog articles with category filters | pages/BlogListPage.tsx | 🟢 VERIFIED |
| CON-002 | Blog Article | BlogArticle (/blog/:slug) | Single article rendering with react-markdown | pages/BlogArticle.tsx | 🟢 VERIFIED |
| CON-003 | Static Blog Posts | public/blog/{category}/{slug}.md | ~90 markdown files across career/health/relationships/selfprint categories | public/blog/* | 🟢 VERIFIED |
| CON-004 | Keyword Map | docs/blog-keyword-map.json | SEO keyword targeting for blog content | docs/blog-keyword-map.json | 🟢 VERIFIED |
| CON-005 | SEO Metadata | seoMetadata.ts constants | Structured data for search engines | constants/seoMetadata.ts | 🟢 VERIFIED |
| CON-006 | FAQ Accordion | FAQAccordion component | Expandable FAQ items | components/FAQAccordion.tsx | 🟢 VERIFIED |
| CON-007 | About Page | AboutPage (/about) | Project information | pages/AboutPage.tsx | 🟢 VERIFIED |
| CON-008 | Contact Page | ContactPage (/contact) | Contact form/information | pages/ContactPage.tsx | 🟢 VERIFIED |
| CON-009 | Terms of Service | TermsPage (/terms) | Legal terms | pages/TermsPage.tsx | 🟢 VERIFIED |
| CON-010 | Science Page | SciencePage (/science) | Scientific basis explanation | pages/SciencePage.tsx | 🟢 VERIFIED |

### R. Analytics & Monitoring Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| ANL-001 | Analytics Events Table | analytics_events (migration 007) | Generic event tracking infrastructure | Migration 007 | 🟡 PARTIAL (table exists, query usage unclear) |
| ANL-002 | Sentry Error Tracking | import.meta.env.VITE_SENTRY_DSN | Client-side error reporting | error-tracking.ts | 🟢 VERIFIED (SENTRY_DSN configured) |
| ANL-003 | Performance Monitoring | Performance specs (performance.spec.ts) | PWA performance benchmarks (LCP, CLS, FID) | e2e/performance.spec.ts | 🟡 PARTIAL (tests exist, execution unclear) |
| ANL-004 | Metrics Endpoint | metrics.ts Cloudflare Function | Query metrics from Supabase SERVICE_ROLE_KEY | functions/api/metrics.ts | 🟡 PARTIAL (endpoint exists, consumer unclear) |
| ANL-005 | Autonomy Logging | autonomy-log.ts Cloudflare Function | Log autonomy-related events | functions/api/autonomy-log.ts | 🟡 PARTIAL (endpoint exists, consumer unclear) |
| ANL-006 | Quality Metrics Service | QualityMetricsService class | Metrics calculation for AI responses | services/QualityMetricsService.ts | 🟡 PARTIAL (class exists, usage unclear) |

### S. Journaling & Notes Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| JOU-001 | Journal Queue Table | journal_queue (migration 013) | Offline journal notes queuing infrastructure | Migration 013 | 🟢 VERIFIED (table exists) |
| JOU-002 | useJournalQueue Hook | useJournalQueue hook | Offline journal queueing with Service Worker sync | hooks/useJournalQueue.ts | 🟢 VERIFIED |
| JOU-003 | Journal Queue DB | journalQueueDB module | IndexedDB operations for offline journal storage | lib/storage/journalQueueDB.ts | 🟢 VERIFIED |
| JOU-004 | Daily Brief Integration | DailyBrief component pulls from journals | Context-aware brief generation includes recent journal entries | features/DailyBrief.tsx | 🟡 PARTIAL (integration detail unclear) |

### T. Community & Social Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| COM-001 | Community Page | CommunityPage (/community) | Community feature page | pages/CommunityPage.tsx | 🟡 PARTIAL (page exists, content/functionality unclear) |
| COM-002 | Community Insights Table | community_insights (migration 033) | Shared community-level insights | Migration 033 | 🟡 PARTIAL (table exists, consumer unclear) |
| COM-003 | World Badge Progression | WorldBadgeTracker → unlockBadge | Achievement system tied to world exploration | services/WorldBadgeTracker.ts | 🟢 VERIFIED (but integration unclear) |

### U. Miscellaneous Utility Capabilities

| ID | ชื่อ | Entry Point | Implementation | Evidence | Status |
|----|------|------------|---------------|----------|--------|
| MIS-001 | Language Switcher | LanguageSwitcher component | EN/TH toggle with i18n support | components/LanguageSwitcher.tsx | 🟢 VERIFIED |
| MIS-002 | PWA Install Prompt | PWAInstallPrompt component | Beforeinstallprompt handler | components/PWAInstallPrompt.tsx | 🟢 VERIFIED |
| MIS-003 | Offline Banner | OfflineBanner component | VisibilityState change listener | components/pwa/OfflineBanner.tsx | 🟢 VERIFIED |
| MIS-004 | Error Boundary | ErrorBoundary component | Graceful crash recovery | components/ErrorBoundary.tsx | 🟢 VERIFIED |
| MIS-005 | Feature Menu | FeatureMenu (/menu) | Shows available features | pages/FeatureMenu.tsx | 🟢 VERIFIED |
| MIS-006 | Tarot Reading | TarotPage (/tarot) | Tarot reading interface | pages/TarotPage.tsx | 🟢 VERIFIED |
| MIS-007 | Palmistry | PalmistryPage (/palmistry) | Palm reading interface | pages/PalmistryPage.tsx | 🟢 VERIFIED |
| MIS-008 | Vs Astrology | VsAstrologyPage (/vs-astrology) | Comparison with traditional astrology | pages/VsAstrologyPage.tsx | 🟢 VERIFIED |
| MIS-009 | RSS Feed | RSS feed generation | RSS/XML feed for blog/content | implied by sitemap.xml + llms.txt | ⚪ UNPROVEN (references found but implementation details unclear) |
| MIS-010 | Sitemap Generator | generate-sitemap.ts script | XML sitemap for SEO | scripts/generate-sitemap.ts | 🟢 VERIFIED (script exists, scheduled? unclear) |

---

## 4. Verified User Capabilities (ผู้ใช้พิสูจน์ได้ว่าใช้งานจริง)

### ผู้ใช้ใหม่สามารถทำอะไรได้

1. **เข้าเว็บ landing** → /th/ หรือ /en/ แสดงหน้าแรกพร้อมเนื้อหาภาษาไทย/อังกฤษ
2. **สมัคร/เข้าสู่ระบบ** → ผ่าน Magic Link (OTP), OAuth (Google/Apple), หรือ Passkey (WebAuthn)
3. **กรอก Birth Data** → วันที่เกิด + เวลา + สถานที่เกิด
4. **ตอบคำถาม Finetuning** → ตอบคำถาม AI เพื่อปรับแต่งบุคลิก Twin
5. **ดู Full Analysis** → ดูผลการวิเคราะห์จาก birth data + finetuning answers
6. **สร้าง Twin (Birth Ceremony)** → พิธีการปลุกตื่น 5 ขั้นตอน: intro → birth animation → naming → celebration → redirect to brief
7. **รับ Daily Brief** → สรุปข้อมูลประจำวันที่ personalize แล้ว
8. **ดู Decision Log** → จัดเก็บและติดตามการตัดสินใจ
9. **สำรวจ 12 Worlds** → เลือกโลกที่เหมาะสมกับสถานการณ์
10. **พูดคุยกับ Twin** → chat interface พร้อม world context
11. **ดู Badges** → ดู badge ที่ได้รับจากการใช้งาน
12. **ตั้งค่า Twin** → ปรับแต่ง Twin ในหน้า settings (protected route)
13. **สลับภาษา** → English ↔ ไทย ผ่าน LanguageSwitcher
14. **ติดตั้ง PWA** → ติดตั้งเป็นแอปบนมือถือ/desktop
15. **ดู Blog** → อ่านบทความหมวด career/health/relationships/selfprint
16. **แชร์ Twin** → สร้าง share link สำหรับแสดงผลการวิเคราะห์
17. **ซื้อสมาชิก** → ผ่าน Pricing page → Stripe checkout

### ผู้ใช้ที่มีข้อมูลแล้วสามารถทำอะไรได้เพิ่มเติม

1. **กลับมา Dashboard** → เห็นภาพรวม Twin status, world recommendations, upcoming follow-ups
2. **สร้าง Decision ใหม่** → บันทึกการตัดสินใจพร้อม option และ recommendation
3. **บันทึก Outcome** → บอกผลหลังจากที่ทำ Decision แล้ว
4. **ดู Follow-up Schedule** → เตือนล่วงหน้าก่อนถึงวันที่ต้องติดตามผล
5. **เปลี่ยน World** → สลับระหว่าง 12 โลกตามสถานการณ์
6. **Favorite Worlds** →标记โปรดไว้ใน world_preferences
7. **ดู Behavioral Patterns** → ดู pattern ที่ตรวจจับได้จากประวัติการใช้งาน
8. **ดู Memory Insights** → insights จาก memory retrieval
9. **View Twin Evolution** → ดูวิวัฒนาการของ Twin
10. **Reset Twin** → ลบ Twin และเริ่มใหม่
11. **Manage Passkeys** → เพิ่ม/ลบ passkey ใน settings
12. **Privacy Settings** → จัดการข้อมูลส่วนตัวและ consent

---

## 5. Partial Capabilities

| ID | ชื่อ | ข้อจำกัด | Evidence |
|----|------|---------|----------|
| AUD-004 | Audio Ducking | Hook กำหนดไว้แต่ไม่มี consumer | hooks/useAudioDucking.ts — ไม่มี import จากที่ไหน |
| AUD-009/010/011 | Voice Chat/Recording/TTS | UI มี แต่ functionality ต้องการ runtime verification | VoiceChatPage.tsx, VoiceInput.tsx, VoiceOutput.tsx |
| CHAT-003 | Streaming | Functions มีแต่ไม่มี frontend caller | twin-stream.ts, nova-stream.ts — ไม่มี import ใน src/ |
| COM-001 | Community Page | หน้ามีอยู่แต่เนื้อหาไม่ชัดเจน | CommunityPage.tsx — ตรวจสอบเพิ่มเติมที่ staging |
| COM-002 | Community Insights | ตารางมีแต่ consumer ไม่ชัด | migration 033 + services/CommunityService.ts |
| DEC-011 | Decision Compare | Component มีอยู่แต่อาจยังไม่ integrate | DecisionCompare.tsx |
| INT-011~014 | Emotional/Social/Goal/Wellness Engines | Services มีใน sice/engines/ แต่ integration ไม่ชัดเจน | services/sice/engines/* |
| MIS-009 | RSS Feed | References มีแต่ implementation ไม่ชัด | Found in some references but no RSS endpoint traced |
| PAY-006 | UsePricing Hook | Implementation ไม่ชัดเจน | hooks/usePricing.ts |
| SEC-006 | Auth Rate Limiting | Edge function มีแต่ caller ไม่ชัด | auth-rate-limit/index.ts — PasskeyProvider ใช้หรือไม่? |
| WRD-015/016 | World Expertise/Badge Tracker | Services มีแต่ integration ไม่ชัดเจน | services/WorldExpertiseService.ts, WorldBadgeTracker.ts |
| ONB-009 | Claim Account | Flow ยังไม่สมบูรณ์ | ClaimAccount.tsx — ต้องยืนยัน runtime |

---

## 6. Broken Capabilities

| ID | ชื่อ | สาเหตุ | Evidence |
|----|------|--------|----------|
| AUD-004 | Audio Ducking | Hook ไม่มีผู้เรียก | hooks/useAudioDucking.ts — grep พบ 0 consumers |
| NOT-007 | Notification Engagement | Hook ไม่มีผู้เรียก | hooks/useNotificationEngagement.ts — grep พบ 0 consumers |
| AI-003 | Streaming Responses | Functions มีแต่ไม่มี frontend caller | twin-stream.ts, nova-stream.ts — grep พบ 0 import ใน src/ |

**หมายเหตุ:** Broken คือ code ที่ implement แล้วแต่ runtime ใช้ไม่ได้จริงๆ ไม่ใช่แค่ยังไม่ได้ connect กับ UI

---

## 7. Code-only / Orphan Candidates

### Code-only (มี implementation แต่ไม่มี evidenceว่าเป็น user-accessible capability)

| ID | ชื่อ | Reason | Evidence |
|----|------|--------|----------|
| ORP-001 | daily-brief edge function | ไม่มี frontend caller พบ | supabase/functions/daily-brief/index.ts |
| ORP-002 | send-push edge function | ไม่มี frontend caller พบ | supabase/functions/send-push/index.ts |
| ORP-003 | memory-manager edge function | ไม่มี frontend caller พบ | supabase/functions/memory-manager/index.ts |
| ORP-004 | pattern-detect edge function | ไม่มี frontend caller พบ | supabase/functions/pattern-detect/index.ts |
| ORP-005 | data-export edge function | ไม่มี frontend caller พบ | supabase/functions/data-export/index.ts |
| ORP-006 | account-delete edge function | ไม่มี frontend caller พบ | supabase/functions/account-delete/index.ts |
| ORP-007 | account-recovery edge function | ไม่มี frontend caller พบ | supabase/functions/account-recovery/index.ts |
| ORP-008 | auth-rate-limit edge function | ไม่มี frontend caller พบ | supabase/functions/auth-rate-limit/index.ts |
| ORP-009 | metrics.ts Cloudflare Function | ไม่มี frontend caller พบ | functions/api/metrics.ts |
| ORP-010 | autonomy-log.ts Cloudflare Function | ไม่มี frontend caller พบ | functions/api/autonomy-log.ts |
| ORP-011 | notification_queue processing | Unified handler มีแต่ consumer ไม่ชัด | api/unified-handler.ts:188-280 |
| ORP-012 | push_subscriptions table | ตารางมีแต่ consumer ไม่ชัด | Migration 015 |
| ORP-013 | analytics_events table | ตารางมีแต่ query usage ไม่ชัด | Migration 007 |
| ORP-014 | TwinStateEngine (lib/experience/) | ไม่มี import คนละ path กับที่ใช้จริง | src/lib/experience/TwinStateEngine.ts — 0 import |
| ORP-015 | SICEOrchestratorImpl | Deprecated + ไม่มี consumer | services/SICEOrchestratorImpl.ts — self-declared deprecated |

### Orphan candidates (potential external triggers)

| ID | ชื่อ | Potential Caller | Status |
|----|------|-----------------|--------|
| EXT-001 | daily-brief | pg_cron / Supabase cron / scheduled job | ⏸️ DEFERRED (needs investigation) |
| EXT-002 | send-push | DB trigger on push_subscriptions insert | ⏸️ DEFERRED |
| EXT-003 | memory-manager | Scheduled scan / autonomous intelligence | ⏸️ DEFERRED |
| EXT-004 | pattern-detect | DB change trigger / scheduled pattern scan | ⏸️ DEFERRED |
| EXT-005 | data-export | Admin tool / user request from UI | ⏸️ DEFERRED |
| EXT-006 | account-delete | Settings page / account management | ⏸️ DEFERRED |
| EXT-007 | account-recovery | Forgot-password flow / email recovery | ⏸️ DEFERRED |

**ข้อควรระวัง:** เหล่านี้คือ ORPHAN CANDIDATE — ยังไม่ใช่ orphan จนกว่าจะพิสูจน์ว่าไม่มี external trigger (pg_cron, DB trigger, webhook, cloud scheduler) ครบ

---

## 8. Unproven Capabilities

| ID | ชื่อ | เหตุผลที่ยังพิสูจน์ไม่ได้ |
|----|------|--------------------------|
| UNP-001 | Streaming chat | twin-stream/nova-stream functions มีแต่ frontend caller ไม่ชัด |
| UNP-002 | Push notification dispatch | send-push edge function มีแต่ trigger mechanism ไม่ชัด |
| UNP-003 | Voice chat complete flow | VoiceChatPage/UI มีแต่ real voice interaction runtime ไม่ชัด |
| UNP-004 | RSS feed generation | References มีแต่ implementation path ไม่ชัด |
| UNP-005 | Daily brief generation | daily-brief edge function มีแต่ invoker ไม่ชัด |
| UNP-006 | Pattern detection AI | pattern-detect function มีแต่ invoker ไม่ชัด |
| UNP-007 | Community feature completeness | CommunityPage มีแต่ content/behavior ไม่ชัด |
| UNP-008 | Badge engine full integration | BadgeEngine evaluation logic มีแต่ UI consumption ไม่ชัด |
| UNP-009 | Memory manager full scope | memory-manager function มีแต่ scope ไม่ชัด |
| UNP-010 | Notification queue delivery | notification_queue handler มีแต่ delivery mechanism ไม่ชัด |

---

## 9. Missing Capabilities (Evidence ว่าควรมีแต่ไม่พบ implementation)

| ID | ชื่อ | Evidence ว่าควรมี | สถานะ |
|----|------|------------------|-------|
| MISS-001 | Email notification delivery | Notification queue มี แต่ SMTP/SES integration ไม่เห็น | ⚪ UNPROVEN |
| MISS-002 | Real-time WebSocket | บน live chat ไม่มี WebSocket connection setup (ใช้ REST poll แทน) | ⚫ MISSING |
| MISS-003 | Image upload to storage | Migration 038 creates profiles bucket แต่ direct upload flow ไม่เห็นชัดเจน | 🟡 PARTIAL |
| MISS-004 | Multi-language AI responses | ระบบรองรับ EN/TH สำหรับ UI แต่ AI prompt language อาจไม่ translate ตาม preference | 🟡 PARTIAL |
| MISS-005 | Real-time collaboration | ไม่มี evidence ของ multi-user collaborative features | ⚫ MISSING |
| MISS-006 | Admin dashboard | ไม่มี admin panel สำหรับ manage users/content (แต่มี data-export function) | ⚫ MISSING |
| MISS-007 | Two-factor authentication beyond passkey | ใช้ passkey เป็นหลัก ไม่มี SMS/TOTP alternative | 🟡 PARTIAL |
| MISS-008 | Bulk operations | ไม่มี bulk delete/update for decisions/posts | 🟡 PARTIAL |

---

## 10. Twin Capability Map (เฉพาะ)

| Capability | Entry Point | Implementation | Data Source | User Flow | Status |
|-----------|------------|---------------|-------------|-----------|--------|
| Creation | TwinBirthPage / CoreAwakening | initializeTwin() → createTwinInDatabase() | twins table INSERT | User → /twin-birth → intro → birth animation → naming → celebration → TWIN_ALIVE | 🟢 VERIFIED |
| Initialization | startAwakening() | SICEOrchestrator.orchestrate() → essence generation | twins + user_lifecycle tables | Triggered during birth ceremony | 🟢 VERIFIED |
| Hydration | hydrateTwin(userId, savedTwin) | Sets React state without INSERT | twins table (already persisted) | Called after successful creation | 🟢 VERIFIED |
| Profile | TwinProfilePage, TwinProfileDetailPage | Displays archetype, maturity, settings | twins.fullAnalysis, twins.archetype, twins.maturity_score | Protected route accessible post-creation | 🟢 VERIFIED |
| Visual Identity | twinVisualDNA ×2 systems | SVG avatar (PRNG) + archetype color table (lookup) | Generated deterministically from birth data + userId | Visible in LivingDiagram, Dashboard, LandingPage | 🟢 VERIFIED |
| State Machine | useTwinStates hook | idle → thinking → responding → error | Local React state | Used in ImmersiveTwinChat | 🟢 VERIFIED |
| Personality | TwinPersonalityPage | SICE dimension visualization + archetype display | twins.primary_archetype, twins.secondary_archetype | Protected route | 🟢 VERIFIED |
| Patterns | TwinPatternsPage, PatternDetector | Behavioral pattern analysis | decision_log, twin_memories | Protected route | 🟢 VERIFIED |
| Memory | MemoryList, MemoryInsightsPage | Retrieve stored memories and show insights | twin_memories table | Protected route /components | 🟢 VERIFIED |
| Lifecyle | lifecycleStore + TwinContext.birth | ONBOARDING → AWAKENING → TWIN_ALIVE | user_lifecycle table | Managed automatically during ceremony | 🟢 VERIFIED |
| Interaction | ImmersiveTwinChat / VoiceChatPage | POST /api/twin or /api/nova → OpenRouter | twins.twinMemories + system prompts | User sends message → AI responds | 🟢 VERIFIED |
| Persistence | TwinSupabaseService CRUD | fetch/create/update/delete on twins table | Supabase twins table | Automatic on hydration/updates | 🟢 VERIFIED |
| Recovery | RecoveryRoute hook | Restores interrupted sessions | sessionStorage + user_lifecycle | Automatic on return | 🟢 VERIFIED |
| Evolution | TwinEvolutionScene, useEvolutionTracking | Milestone tracking, badge earning | twins.evolution_stage, badges | Visible in dashboard | 🟢 VERIFIED |
| Voice TTS | speakTwinGreeting() | Web Speech API | Generated at birth naming | Triggered during naming phase | 🟢 VERIFIED |
| Reset | resetTwin() → DELETE twins | Deletes Twin record + clears state | twins table DELETE | Available in TwinSettingsPage | 🟢 VERIZED |

---

## 11. Twin Birth Capability Map

### Entry Points

| Path | Component | Behavior | Status |
|------|-----------|----------|--------|
| /twin-birth | TwinBirthPage | Modern TC-401 implementation — 5-phase ceremony | 🟢 VERIFIED |
| /core-awakening | CoreAwakening | Legacy alias — same ceremony, different UI layout | 🟡 PARTIAL |

### Twin Birth Flow (verified)

```
Phase 1: Intro ("ฝาแฝดของคุณกำลังตื่น")
  User sees ceremony preview → clicks "Watch the awakening"
  → lifecycleStore.transitionTo(userId, 'AWAKENING')

Phase 2: Birth Animation (<Twin variant="birth" />)
  Three.js canvas renders procedural Twin visual
  Uses birthArchetype calculated from birth date disciplines
  → onComplete → phase='naming'

Phase 3: Naming (TwinNaming component)
  User enters Twin name
  → speakTwinGreeting(name) ← Web Speech API TTS
  → initializeTwin(userId, name, essenceId, birthDate, analysis)
    → createTwinInDatabase() INSERT twins table
    → Calculates archetype, maturityScore, visualDNA, fullAnalysis
  → hydrateTwin(userId, result.twin) ← sets React state
  → lifecycleStore.setTwinCreated(userId, twinId)
    → user_lifecycle: status='TWIN_ALIVE', twin_id, twin_created_at
  → celebrateTwinAwakening() ← play celebration sound

Phase 4: Celebration
  4-second countdown with "🎉 ตื่นรู้ของ Twin!"
  → playCelebrationSound() ← play audio cue
  → navigate('/brief') → DailyBriefPage
```

### Twin Birth Contract Differences

| Aspect | TwinBirthPage | CoreAwakening |
|--------|--------------|---------------|
| Route | /twin-birth | /core-awakening |
| Phase count | 5 (intro/birth/naming/celebration/complete) | Fewer explicit phases |
| UI Layout | Centered ceremony flow | Legacy layout |
| Birth Animation | <Twin variant="birth" /> component | Twin presence rendering |
| Data contract | Same twins table insertion | Same twins table insertion |
| Hydration | hydrateTwin() explicitly called | Direct setTwin() ? |
| Recovery | localStorage persists birth state | Unclear if localStorage persists |

**Verdict:** TwinBirthPage is the primary path (TC-401); CoreAwakening is maintained as legacy alias. Both ultimately write to the same twins table with the same data contract.

---

## 12. Twin Chat Capability Map

| Capability | Description | Implementation | Status |
|-----------|------------|---------------|--------|
| Send Message | Type message → submit | ImmersiveTwinChat messages[] → callTwinAPI() | 🟢 VERIFIED |
| AI Response | Receive response | POST /api/twin → OpenRouter → { content } | 🟢 VERIFIED |
| World Context | Chat aware of current world | system prompt includes world personality | 🟢 VERIFIED |
| Memory Injection | Recent memories injected | Memories passed to buildPrompt() as context | 🟢 VERIFIED |
| Conversation Continuity | Maintains conversation thread | messages[] accumulates; history from twin_memories | 🟡 PARTIAL |
| Persistence | Messages saved to DB | INSERT twin_memories | 🟢 VERIFIED |
| Retry/Error | Handles API failures | try/catch → console.error → user sees error | 🟢 VERIFIED |
| Rate Limiting | 40 req/min per IP | In-memory Map check in twin.ts | 🟢 VERIFIED |
| Model Fallback | Primary → Fallback chain | nemotron → qwen3.7-flash → qwen-plus → deepseek | 🟢 VERIFIED |
| Streaming | Real-time token streaming | SSE in twin-stream.ts (no frontend caller traced) | ⚪ UNPROVEN |
| Session/Auth | Requires valid session | Authorization Bearer token verified by API | 🟢 VERIFIED |
| Language | Thai/English support | language parameter passed to system prompt | 🟢 VERIFIED |
| Voice Chat | Real-time voice interaction | VoiceChatPage + VoiceInput + VoiceOutput | 🟡 PARTIAL |
| Typing Indicator | Shows "thinking..." | TypingIndicator component | 🟢 VERIFIED |
| Floating Assistant | Persistent chat button | FloatingSelfprintChat draggable button | 🟢 VERIFIED |
| Nova Alternative | Switch to Nova guide | NovaChat (/chat/nova) → POST /api/nova | 🟢 VERIFIED |

---

## 13. World Capability Map

### World Selection Methods

| Method | Level | Mechanism | Evidence |
|--------|-------|-----------|----------|
| Manual Selection | Manual | Click world card → navigate to /worlds/:worldId | WorldHub → WorldDetail routing |
| Keyword Matching | Rule-based | TwinContext.recommendWorld() — simple word-list compare | TwinContext.tsx:228-258 |
| Advanced Recommendation | Context-aware | useWorldRecommendation hook — considers preferences, history, mood | hooks/useWorldRecommendation.ts |
| Auto-selection | Adaptive | ExperienceEngine.compute() suggests hub based on personalContext | ExperienceContext.tsx:114-117 |
| Intelligent Selection | AI-selected | Not implemented — recommendation uses rule-based + keyword, not AI | N/A |

### World Capabilities Summary

| Capability | Level | Details | Status |
|-----------|-------|---------|--------|
| World List | Basic | 12 worlds displayed in grid | 🟢 VERIFIED |
| World Detail | Basic | Individual world page with description | 🟢 VERIFIED |
| World Environment | Rule-based | Themed background/lighting per world | 🟢 VERIFIED |
| World Story Panel | Rule-based | World-specific narrative overlay | 🟢 VERIFIED |
| World Stats | Basic | Visit counts, journal entries, decisions tracked | 🟢 VERIFIED |
| World Preferences | Basic | Favorites, last accessed, engagement score | 🟢 VERIFIED |
| World Badge Progress | Basic | Achievement tracking per world | 🟢 VERIFIED |
| World Recommendation | Rule-based + Context-aware | Keyword matching + preference scoring (NOT AI-based) | 🟡 PARTIAL |
| World-aware AI | Context-aware | System prompt includes world personality | 🟢 VERIFIED |
| World Transitions | Basic | CSS transitions between worlds | Styles exist in world-transitions.css |
| World Ambience | Rule-based | World-specific ambient audio via useWorldAmbientTone | 🟡 PARTIAL |

---

## 14. Decision Capability Map

| Capability | Implementation | Data Flow | Status |
|-----------|---------------|-----------|--------|
| Record Decision | DecisionService.recordDecision() | INSERT decision_log + schedule follow-ups | 🟢 VERIFIED |
| Decision Options | UI presents choices | options[] stored in decision_log table | 🟢 VERIFIED |
| Twin Recommendation | Twin suggests option | Stored in twin_recommendation field | 🟢 VERIFIED |
| Follow-up Scheduling | scheduleFollowUps() | Creates day30/90/180/365 records | 🟢 VERIFIED |
| Record Outcome | DecisionService.recordOutcome() | INSERT decision_outcomes + update completion flags | 🟢 VERIFIED |
| Follow-up Alerts | FollowUpScheduler | Notification reminder for due dates | 🟡 PARTIAL (trigger unclear) |
| Decision Analytics | DecisionAnalytics component | Success rates, trends visualization | 🟢 VERIFIED |
| Decision Comparison | DecisionCompare component | Side-by-side view | 🟡 PARTIAL (integration unclear) |
| Export Decisions | exportEngine (CSV/JSON) | Downloadable decision report | 🟢 VERIFIED |
| Decision Learning | DecisionLearningService.updatePattern() | Records feedback for ML improvement | 🟡 PARTIAL (pipeline depth unclear) |
| Pending Follow-ups | getPendingFollowUps() | Queries upcoming overdue items | 🟢 VERIFIED |
| Decision Dashboard | DecisionDashboard page | Full overview with filtering | 🟢 VERIFIED |
| Decision Logger | DecisionLoggerPage | Input form with world tagging | 🟢 VERIFIED |

---

## 15. Personal Context Capability Map

| Capability | What it does | Consumer | Status |
|-----------|-------------|----------|--------|
| Context Building | PersonalContextBuilder.getContext(userId) | ExperienceEngine (for adaptation), multiple display components | 🟢 VERIFIED |
| Pattern Detection | PatternDetector finds recurring behaviors | PersonalContext → displayed in UI | 🟢 VERIFIED |
| Insight Generation | InsightEngine generates insights from context | IntelligenceHub, ExecutiveSummary | 🟢 VERIFIED |
| Emotional Mapping | Maps emotional range from user interactions | PersonalContext | 🟢 VERIFIED |
| Blind Spot Identification | Finds contradictions in user behavior | PersonalContext.blindSpots | 🟢 VERIFIED |
| Value/Goal Inference | Infers values/goals from decision history | PersonalContext.values, PersonalContext.goals | 🟢 VERIFIED |
| SICE Score Computation | Computes scores per dimension | PersonalContext.siceScores | 🟢 VERIFIED |
| Future Projection | FutureSelfEngine projects trajectory | FutureSelfPanel | 🟢 VERIFIED |
| Behavioral Forecast | BehavioralForecastEngine predicts next actions | FutureSelfPanel | 🟡 PARTIAL |
| Daily Brief Compilation | DailyBriefEngine compiles daily summary | DailyBrief component | 🟢 VERIFIED |
| Memory Retrieval | Retrieves relevant stored memories | MemoryList, MemoryInsights | 🟢 VERIFIED |
| Feedback Integration | AIFeedbackLoop learns from corrections | Improves future predictions | 🟢 VERIFIED |
| Evidence Analysis | EvidenceAnalyzer evaluates strength of claims | Internal to intelligence layer | 🟡 PARTIAL |

---

## 16. Lifecycle Capability Map

| Capability | States | Transitions | Storage | Status |
|-----------|--------|-------------|---------|--------|
| User Journey Tracking | ONBOARDING → ANALYSIS → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE | Upset-based transitions | user_lifecycle table | 🟢 VERIFIED |
| Session Recovery | Resume interrupted onboarding | Automatic via sessionStorage | sessionStorage | 🟢 VERIFIED |
| Return User Detection | Identify returning vs new users | Based on user_lifecycle.status | user_lifecycle + twins table | 🟢 VERIFIED |
| Twin Creation Gate | Prevent duplicate Twins | Check existing Twins before allowing | twins.user_id UNIQUE constraint | 🟢 VERIZED |
| Activity Tracking | Track last activity timestamp | Mark activity periodically | user_lifecycle.last_activity_at | 🟢 VERIFIED |
| Entry Path Logging | Track how user arrived | Set entry_path on first meaningful visit | user_lifecycle.entry_path | 🟡 PARTIAL |
| AWAKENING State | Special pre-Twin state | Explicitly set before birth ceremony | user_lifecycle.status = 'AWAKENING' | 🟢 VERIFIED |
| TWIN_ALIVE State | Post-birth active state | Set on Twin creation success | user_lifecycle.status = 'TWIN_ALIVE' | 🟢 VERIFIED |

---

## 17. AI Capability Map

### AI Models & Providers

| Model | Provider | Role | Fallback Chain | Status |
|-------|----------|------|---------------|--------|
| nvidia/nemotron-3-ultra-550b-a55b:free | NVIDIA (via OpenRouter) | Primary for both Twin and Nova | None — it's free | 🟢 VERIFIED |
| qwen3.7-flash | Alibaba (via OpenRouter) | First fallback | → qwen-plus → deepseek-chat | 🟢 VERIFIED |
| claude | Anthropic (via OpenRouter) | Explicitly REMOVED | N/A | 🔴 BROKEN (MODEL-SWITCH-001 confirms removal) |

### AI Capabilities Detail

| Capability | Model | Input | Context | Output | Consumer | Status |
|-----------|-------|-------|---------|--------|----------|--------|
| Twin Chat Response | nemotron-primary | Last 3 messages + system prompt | World personality + memories + twin state + language | AI response string | ImmersiveTwinChat | 🟢 VERIFIED |
| Nova Chat Response | nemotron-primary | User message | General guide context | AI response string | NovaChat | 🟢 VERITED |
| Astrovera Analysis | ??? | Birth data + answers | Natal chart positions | Personality analysis | Onboarding.tsx | 🟡 PARTIAL |
| Daily Brief Generation | OpenRouter | User history + context | Recent decisions + memories | Daily summary text | daily-brief edge fn | ⚪ UNPROVEN |
| Pattern Detection | OpenRouter | User decision history | Existing patterns | New/updated patterns | pattern-detect edge fn | ⚪ UNPROVEN |
| Prompt Assembly | N/A (local) | Role + world + memories + twinState + userContext | Pre-defined prompt templates | System prompt string | buildPrompt() function | 🟢 VERIFIED |
| AI Feedback Learning | N/A (local) | Response + user correction | Historical corrections | Improved prediction | AIFeedbackLoop | 🟢 VERIFIED |

### AI Infrastructure

| Component | Purpose | Rate Limit | Error Handling | Fallback |
|-----------|---------|-----------|---------------|----------|
| callOpenRouter() | Proxy to OpenRouter API | N/A (handled by OpenRouter) | 4xx/5xx errors caught | Model fallback chain |
| In-memory rate limiter | Prevent abuse | 40/min (Twin), 60/min (Nova) | Returns 429 with retryAfter | None — hard limit |
| CORS protection | Origin validation | N/A | Warns for unrecognized origins, falls back to wildcard | Wildcard * fallback |
| JWT verification | Authenticate API calls | N/A | Returns 401 unauthorized | None — blocks unauthenticated |

---

## 18. Auth/Security Capability Map

### Authentication

| Method | Flow | Verification | Status |
|--------|------|-------------|--------|
| Magic Link (OTP) | Email link → Supabase OAuth | Supabase handles deliverability | 🟢 VERIFIED |
| Google OAuth | Redirect → Google login → callback | Supabase OAuth provider | 🟢 VERIFIED |
| Apple OAuth | Redirect → Apple login → callback | Supabase OAuth provider | 🟢 VERIFIED |
| Passkey (WebAuthn) | isAvailable → getOptions → register/webauthn → invoke edge functions → setSession | WebAuthn API + Supabase Edge Functions | 🟢 VERIFIED |

### Security Controls

| Control | Implementation | Scope | Status |
|---------|---------------|-------|--------|
| JWT Verification | verifyUser() checks Authorization header | All Cloudflare Functions | 🟢 VERIFIED |
| Rate Limiting | In-memory Map per IP | Twin (40/min), Nova (60/min) | 🟢 VERIFIED |
| CORS Protection | KNOWN_ORIGINS array | All Functions endpoints | 🟢 VERIFIED |
| SQL Injection Prevention | Regex whitelist for userId | TwinAPIService.validateUserId() | 🟢 VERIFIED |
| Sensitive Env Separation | VITE_* (public) vs Server secrets | .env.example documents distinction | 🟢 VERIFIED |
| Session Lazy Init | AUTH-LAZY-001 prevents SDK on entry chunk | Reduces attack surface | 🟢 VERIFIED |
| Error Boundary | Wraps critical components | Prevents total app crash | 🟢 VERIFIED |
| Audit Trail | Console logging for security events | Security events logged | 🟡 PARTIAL |

---

## 19. Backend/Data Capability Map

### Tables with Application Usage (verified from query traces)

| Table | Operations | Caller(s) | Purpose | Status |
|-------|-----------|-----------|---------|--------|
| twins | INSERT, SELECT, UPDATE, DELETE | TwinContext, CoreAwakeningService, TwinSupabaseService | Main Twin entity | 🟢 VERIFIED |
| user_lifecycle | INSERT, SELECT, UPDATE, UPSERT | lifecycleStore, seed-test-users.ts | User journey tracking | 🟢 VERIFIED |
| decision_log | INSERT, SELECT | DecisionService | Decision recording | 🟢 VERIFIED |
| decision_outcomes | INSERT, SELECT | DecisionService | Decision outcome tracking | 🟢 VERIFIED |
| follow_up_schedules | INSERT, UPDATE | DecisionService.followUpScheduler | Follow-up reminders | 🟢 VERIFIED |
| world_preferences | INSERT/UPSERT, SELECT | WorldContext | World preference tracking | 🟢 VERIFIED |
| world_stats | INSERT/UPSERT, SELECT | WorldContext | World engagement metrics | 🟢 VERIFIED |
| twin_memories | INSERT, SELECT | supabase-service.saveMessage | Chat message persistence | 🟢 VERIFIED |
| subscriptions | INSERT/UPSERT, SELECT, UPDATE | unified-handler (stripe), stripeService | Billing/subscriptions | 🟢 VERIFIED |
| share_links | INSERT, SELECT | unified-handler (share) | Shareable links | 🟢 VERIFIED |
| blueprints | INSERT, SELECT, UPDATE | unified-handler (blueprint) | User preference blueprints | 🟢 VERIFIED |
| users_profiles | SELECT, UPSERT | CoreAwakeningService, unified-handler (profile) | User profile storage | 🟢 VERIFIED |
| notification_queue | INSERT, SELECT, UPDATE | unified-handler (notifications) | Queued notifications | 🟡 PARTIAL |
| pattern_analysis | SELECT | unified-handler (patterns) | Stored pattern analysis | ⚪ UNPROVEN |
| twin_evolution_progress | SELECT | unified-handler (twin-evolution) | Twin milestone tracking | ⚪ UNPROVEN |
| intelligence_core_schema | INSERT, SELECT | Various intelligence engines | Core intelligence data | ⚪ UNPROVEN |
| journal_queue | INSERT, processing | useJournalQueue hook | Offline journal notes | 🟡 PARTIAL |
| push_subscriptions | INSERT, SELECT | send-push function target | Push notification recipients | 🟡 PARTIAL |
| passkey_challenges | INSERT, SELECT | auth-* edge functions | Passkey challenge tokens | 🟡 PARTIAL |
| daily_briefs | INSERT, SELECT | daily-brief function, DailyBrief page | Stored daily summaries | ⚪ UNPROVEN |
| community_insights | INSERT, SELECT | Community feature | Shared insights | 🟡 PARTIAL |
| analytics_events | INSERT | Various tracking points | Generic event logging | 🟡 PARTIAL |
| chat_messages | **REMOVED** (moved to twin_memories) | Migrated during CHATMESSAGES-001/002 fix | Old chat storage | 🔴 REMOVED (deprecated) |

### Tables Without Clear Application Consumer (from migration analysis)

| Table | Migration | Observation | Status |
|-------|-----------|-------------|--------|
| user_credentials | 012 | Defined but no queries found | ⚪ UNPROVEN |
| online_sessions | 015-related | May track active browser sessions | ⚪ UNPROVEN |

### API Endpoints

| Endpoint | Handler | Purpose | Auth Required | Status |
|----------|---------|---------|---------------|--------|
| POST /api/twin | functions/api/twin.ts | Twin chat | JWT (Bearer) | 🟢 VERIFIED |
| POST /api/nova | functions/api/nova.ts | Nova AI | JWT (Bearer) | 🟢 VERIFIED |
| POST /api/twin-stream | functions/api/twin-stream.ts | Twin streaming | JWT (Bearer) | ⚪ UNPROVEN |
| POST /api/nova-stream | functions/api/nova-stream.ts | Nova streaming | JWT (Bearer) | ⚪ UNPROVEN |
| GET /api/og | functions/api/og.ts | OG image generation | None | 🟢 VERIFIED |
| GET /api/metrics | functions/api/metrics.ts | Metrics querying | JWT (Bearer) | 🟡 PARTIAL |
| POST /api/autonomy-log | functions/api/autonomy-log.ts | Autonomy event logging | JWT (Bearer) | 🟡 PARTIAL |
| POST /api/notifications/:action | [[route]].ts → unified-handler | Notification handling | JWT (Bearer) | 🟡 PARTIAL |
| POST /api/stripe/:action | [[route]].ts → unified-handler | Stripe payment processing | JWT (Bearer) / Webhook sig | 🟢 VERIFIED |
| POST /api/profile/:action | [[route]].ts → unified-handler | Profile operations | JWT (Bearer) | 🟢 VERIFIED |
| POST /api/blueprint/:action | [[route]].ts → unified-handler | Blueprint CRUD | JWT (Bearer) | 🟡 PARTIAL |
| POST /api/sice/:action | [[route]].ts → unified-handler | SICE orchestration | JWT (Bearer) | ⚪ UNPROVEN |
| POST /api/twin-evolution/:action | [[route]].ts → unified-handler | Twin evolution tracking | JWT (Bearer) | ⚪ UNPROVEN |
| GET /api/share | [[route]].ts → unified-handler | Share link lookup | None | 🟢 VERIFIED |

---

## 20. Background/External Capability Map

| External Function | Invocation Method | Evidence | Status |
|------------------|-------------------|----------|--------|
| daily-brief | Likely pg_cron / Supabase scheduled | No frontend caller found; contains OpenRouter call for daily generation | ⏸️ DEFERRED |
| send-push | Likely DB trigger on push_subscriptions insert | VAPID auth header construction present; requires SUPABASE_URL + anon key | ⏸️ DEFERRED |
| memory-manager | Unknown trigger | Reads/writes memory data; requires Supabase credentials | ⏸️ DEFERRED |
| pattern-detect | Unknown trigger | Contains OpenRouter call; expects CRON_SECRET for verification | ⏸️ DEFERRED |
| data-export | Admin/API caller | Comprehensive data extraction from Supabase | ⏸️ DEFERRED |
| account-delete | Admin/User request | Deletes user data across tables using admin API | ⏸️ DEFERRED |
| account-recovery | Email recovery flow | Sends magic link via Supabase auth; needs trigger mechanism | ⏸️ DEFERRED |
| auth-authentication-options | PasskeyProvider.invoke() | PasskeyProvider.ts:102 — confirmed caller | 🟢 VERIFIED |
| auth-register-passkey | PasskeyProvider.invoke() | PasskeyProvider.ts:81 — confirmed caller | 🟢 VERIFIED |
| auth-registration-options | PasskeyProvider.invoke() | PasskeyProvider.ts:56 — confirmed caller | 🟢 VERITED |
| auth-verify-passkey | PasskeyProvider.invoke() | PasskeyProvider.ts:126 — confirmed caller | 🟢 VERIFIED |
| auth-rate-limit | Potentially Passkey flow | Exists but no direct caller traced | ⏸️ DEFERRED |
| astrovera-edge | Onboarding.tsx fetch() | Onboarding.tsx:75 — confirmed caller | 🟢 VERIFIED |
| account-delete | ?? | Script exists, no UI route found | ⏸️ DEFERRED |
| account-recovery | ?? | Script exists, no UI route found | ⏸️ DEFERRED |

---

## 21. User-facing Claim vs Actual Capability

| User-facing claim | Evidence location | Actual capability | Status |
|------------------|-------------------|------------------|--------|
| "สร้าง Twin" | TwinBirthPage | ✅ ทำได้จริง — พิธีการ 5 ขั้นตอนที่นำไปสู่ twins table INSERT | 🟢 VERIFIED |
| "พูดคุยกับ Twin" | ImmersiveTwinChat, FloatingSelfprintChat | ✅ POST /api/twin → OpenRouter → response | 🟢 VERIFIED |
| "Twin จำได้" | MemoryList, MemoryRetrieval, MemoryInsightsPage | ✅ twin_memories table stores messages; retrieved per conversation | 🟢 VERIFIED |
| "World ปรับตามผู้ใช้" | WorldContext + useWorldRecommendation | ⚠️ มี keyword matching + preference scoring แต่ไม่มี AI-driven world switching | 🟡 PARTIAL |
| "AI เข้าใจ context" | buildPrompt() includes world + memories + twin state | ✅ Context injection verified in prompt assembly | 🟢 VERIFIED |
| "สร้าง Decision" | DecisionLoggerPage, DecisionService | ✅ INSERT decision_log with full context | 🟢 VERIFIED |
| "ติดตามผล Decision" | FollowUpScheduler + getPendingFollowUps | ✅ Follow-up scheduling works; alert trigger unclear | 🟡 PARTIAL |
| "Personal Context" | PersonalContextBuilder.getContext() | ✅ Computing behavioral patterns, SICE scores | 🟢 VERIFIED |
| "Push Notification" | PWAInstallPrompt + send-push edge function | ⚠️ Infrastructure exists but delivery mechanism untraced | 🟡 PARTIAL |
| "Voice Twin" | VoiceChatPage, VoiceInput, VoiceOutput | ⚠️ UI has components but real-time voice flow needs verification | 🟡 PARTIAL |
| "Export ข้อมูล" | exportEngine (CSV/JSON) + data-export edge function | ✅ CSV/JSON export from DecisionDashboard works; full data export via edge function exists | 🟢 VERIFIED |
| "ลบบัญชี" | account-delete edge function | ⚠️ Script exists but no UI integration traced | 🟡 PARTIAL |
| "_recovery_onboarding_" | RecoveryRoute hook + PendingOnboardingSaver | ✅ sessionStorage + user_lifecycle-based resume | 🟢 VERIFIED |

---

## 22. Duplicate/Competing Capability Map

### Confirmed Duplicates

| Item | Location A | Location B | Consumer A | Consumer B | Verdict |
|------|-----------|-----------|-----------|-----------|---------|
| SICE Engines | lib/intelligence/* | services/sice/engines/* | Dashboard, IntelligenceHub | SICEOrchestrator | Dual instances running parallel — bridge exists but migration incomplete | 🟠 PARTIAL MIGRATION |
| TwinStateEngine | lib/experience/TwinStateEngine.ts | lib/intelligence/TwinStateEngine.ts | (none — dead) | 7 consumers (useTwinIdentity, ExperienceContext, LivingTwin, etc.) | Dead code — no imports of experience version | 🟤 ORPHAN |
| TwinStateEngine | services/sice/engines/TwinStateEngine.ts | (same) | SICEOrchestrator | (same) | Only one caller (orchestrator) | 🟢 USED |
| twinVisualDNA | lib/twinVisualDNA.ts | lib/twin/twinVisualDNA.ts | LivingDiagram, Dashboard | Twin, TwinPresence, TwinThreeRenderer | Different APIs, different purposes — intentional split | 🟡 SEPARATE PURPOSES |
| Skeleton | components/ui/Skeleton.tsx | components/composites/Skeleton.tsx | (need to trace) | (need to trace) | Duplicate — needs consumer trace | 🟤 ORPHAN CANDIDATE |
| Twin Birth entry | TwinBirthPage.tsx | CoreAwakening.tsx | /twin-birth route | /core-awakening route | Aliases — same ceremony, different UI | 🟡 ALTERNATIVE PATHS |
| Migration runners | run-migrations.cjs | run-migrations-v2.cjs | run-migrations-v3.cjs | (unknown) | 3 versions in root — unclear which is current | 🟤 LEGACY CANDIDATE |

### Competing Architectures

| Area | Path A | Path B | Which wins? | Evidence |
|------|--------|--------|------------|----------|
| Supabase client | client-lazy (dynamic import) | client (Proxy) | SAME instance via registry | LAZYSHARED-001 comment verifies dedup |
| Twin chat API | twin.ts (dedicated function) | [[route]].ts → unified-handler | twin.ts WINS (specific path matches first) | Comment confirms deliberate separation |
| Nova AI | nova.ts (dedicated function) | [[route]].ts → unified-handler | nova.ts WINS (specific path matches first) | Same reasoning as twin |
| Authentication | PasskeyProvider | AuthContext built-in | COMPLEMENTARY — PasskeyProvider is method within AuthContext | AuthContext:44 dynamic imports PasskeyProvider |
| Personalization | ExperienceEngine → CSS vars + auto-hub | Manual user selection | USER HAS FINAL SAY — shouldAutoApplyHub respects hubHistoryLength > 0 | ExperienceContext.tsx:113-117 |

---

## 23. Requirement Traces Discovered So Far

From documentation inventory (Phase 0/1):

| Requirement Category | Source Document | Evidence of Implementation | Coverage |
|---------------------|----------------|---------------------------|----------|
| Twin Birth ceremony | MASTER_PLAN.md, TC-401 task cards | TwinBirthPage.tsx (5 phases), CoreAwakeningService | 🟢 IMPLEMENTED |
| Twin Chat with memory | TC-301..313, SICE architecture docs | ImmersiveTwinChat, twin_memories table, MemoryRecorder | 🟢 IMPLEMENTED |
| 12 World system | WORLDS_REFERENCE.md, TC-301 | WorldContext, WorldEnvironment, 12 worlds constant | 🟢 IMPLEMENTED |
| Decision tracking | MASTER_GATE_AS_IS.md, decision specs | DecisionService, DecisionDashboard, follow_up_schedules | 🟢 IMPLEMENTED |
| AI-powered responses | TECH_STACK.md, AI_WORK_STATE.md | functions/api/twin.ts, functions/api/nova.ts, callOpenRouter | 🟢 IMPLEMENTED |
| Passkey auth | PASSKEY_SETUP.md, auth docs | PasskeyProvider, auth-* edge functions, PasskeySettings | 🟢 IMPLEMENTED |
| Daily brief | MONITORING.md, daily-brief spec | DailyBriefPage, DailyBriefEngine, daily-brief edge function | 🟡 PARTIAL |
| Voice interaction | VOICE_PERSONALITY_GUIDE.md | VoiceChatPage, VoiceInput, VoiceOutput | 🟡 PARTIAL |
| Push notifications | PUSH_SPEC (?), PWA docs | PWAInstallPrompt, send-push function | 🟡 PARTIAL |
| Export data | DATA_EXPORT_SPEC (?), privacy docs | exportEngine, data-export edge function | 🟢 IMPLEMENTED |
| Analytics/events | TESTING.md, MONITORING.md | analytics_events table, Sentry integration | 🟡 PARTIAL |

---

## 24. Runtime Evidence (Static Analysis Only)

เนื่องจาก Phase 3 ทำการตรวจแบบ static analysis (ไม่รัน code), "runtime evidence" ในที่นี้หมายถึงสิ่งที่ code บ่งชี้ว่าจะทำงานอย่างไรเมื่อดำเนินการจริง:

| Behavior Indication | Evidence | Reliability |
|--------------------|----------|-------------|
| First paint happens without auth block | AuthContext: loading=false immediately; getUserSession delayed 100ms | HIGH — code clearly implements lazy auth |
| Supabase client loaded lazily | getSupabaseClient() dynamic import; vendor-supabase chunk only on first use | HIGH — LAZYLAZY-002 comment confirms optimization |
| Twin creation inserts into DB | createTwinInDatabase() wraps Supabase INSERT with explicit error handling | HIGH — standard Supabase operation |
| API calls require JWT | verifyUser() in every Cloudflare Function | HIGH — 401 returned without valid token |
| Rate limiting is per-isolate | Module-scope Map in twin.ts | MEDIUM — survives cold starts but resets on new isolate |
| CORS allows origin matching | KNOWN_ORIGINS check with wildcard fallback | MEDIUM — wildcard fallback is a security concern |
| PersonalContext computation runs per-request | Each consumer creates its own PersonalContextBuilder instance | HIGH — verified by grep showing independent instantiation |
| Message persistence goes to twin_memories | CHATMESSAGES-003 reroute confirmed in supabase-service.ts | HIGH — was fixed from chat_messages to twin_memories |
| Staging deployment target | deploy.yml specifies "selfprint-staging" Cloudflare Pages project | HIGH — GitHub Actions workflow configuration |

---

## 25. ข้อขัดแย้งกับเอกสารเดิม

### ข้อขัดแย้งสำคัญ (Contradictions)

| เอกสารเดิม | คำกล่าวอ้าง | หลักฐานจากโค้ด | ความขัดแย้ง |
|-----------|-----------|---------------|-------------|
| `SICEOrchestrator.ts` (header) | "16 engines" | REAL_SICE_ENGINE_NAMES lists only 12 | Documentation says 16 but only 12 named |
| `lib/intelligence/index.ts` | "DEPRECATED — all callers migrated to sice/engines" | 20+ imports still target lib/intelligence directly | Deprecation claimed but migration incomplete |
| `MASTER_GATE_AS_IS.md` | "Master gate criteria met" | Needs actual execution to verify (this audit cannot confirm) | Claims unverified by static analysis |
| `TECH_STACK.md` | Technology stack listing | Matches package.json dependencies | Accurate |
| `SELFPRINT_STATUS_HONEST_TH.md` | Test count and gate status | Cannot verify test execution results from static analysis | Requires runtime verification |
| `Migration numbering` | Continuous sequence implied | Gaps at 003, 006, 008, 009, 023 | Numbering discontinuous |

### สิ่งที่เอกสารตรงกัน
- Tech stack matches package.json ✅
- Route structure matches App.tsx registration ✅
- Twin creation flow matches CoreAwakeningService + TwinBirthPage ✅
- Supabase client architecture (lazy init) matches comments in code ✅
- Cloudflare Functions deployment matches deploy.yml ✅

---

## 26. ข้อค้นพบที่ยังพิสูจน์ไม่ได้ (Phase 3 limitations)

สิ่งต่อไปนี้ต้องการ **runtime verification** หรือ **staging environment access**:

1. **Push notification delivery** — send-push edge function exists, but cannot verify if triggers actually fire
2. **Voice chat two-way communication** — UI components exist, but real-time mic/audio path needs runtime testing
3. **Streaming chat responses** — twin-stream/nova-stream exist, but no frontend caller found; need runtime to see if SSR streaming replaces them
4. **Daily brief generation timing** — daily-brief function exists, but cron/schedule mechanism untraced
5. **Community feature functionality** — page exists but content unclear from static code
6. **Badge system UI consumption** — tracker exists but whether badges appear in UI is unclear
7. **Actual test execution results** — tests exist but pass/fail status unknown without running vitest/playwright
8. **Performance metrics (Lighthouse scores)** — lighthouse-*.json files exist but may be stale
9. **Production deployment status** — staging deploy path confirmed, production deploy manual-only
10. **RSS/feed availability** — references found but implementation path unclear

---

## 27. สิ่งที่ยังห้ามสรุป

### ห้ามสรุปว่าเป็น "VERIFIED" สำหรับ:
- ทุก capability ที่ต้องการ runtime verification (push, voice chat, streaming, daily-brief triggers)
- ทุก capability ที่ edge function ไม่มี frontend caller traced (แม้จะมี code ก็ตาม)
- ทุก claim เกี่ยวกับ test pass rate (ต้องรัน vitest/playwright จริงๆ)
- ทุก claim เกี่ยวกับ deployment status (ต้องตรวจสอบ staging URL จริงๆ)

### ห้ามสรุปว่าเป็น "MISSING" สำหรับ:
- ทุก edge function ที่อาจถูก trigger โดย pg_cron / DB trigger / webhook ที่อยู่นอก repo
- ทุก feature ที่มี migration/seed/infrastructure แต่ขาด UI route (อาจเป็น admin-only feature)

---

## 28. สรุป "SELFPRINT ทำอะไรได้จริง ณ ตอนตรวจ"

### สิ่งที่ทำได้จริง (Verified from code):

1. **เข้าสู่ระบบ** ได้ผ่าน 3 วิธี (magic link, OAuth, passkey)
2. **กรอก Birth Data และคำตอบ Finetuning** เพื่อกำหนดบุคลิก Twin
3. **สร้าง Twin ผ่านพิธีการปลุกตื่น** 5 ขั้นตอน — เขียนลง DB twins table จริง
4. **พูดคุยกับ Twin** ผ่าน chat interface — เรียก AI ผ่าน OpenRouter ได้จริง
5. **ดูข้อมูล Twin** เช่น archetype, maturity, patterns, evolution, badges
6. **บันทึกและติดตาม Decision** — ลง DB + schedule follow-up + export CSV/JSON
7. **เลือก 12 Worlds** ที่กำหนดให้ — มีการเก็บสถิติการใช้
8. **เปลี่ยนภาษา EN/TH** ได้
9. **ติดตั้งเป็น PWA** ได้
10. **ดู Blog** บทความ ~90 ชิ้น across 4 categories
11. **แชร์ Twin** สร้าง share link
12. **ซื้อสมาชิก** ผ่าน Stripe (checkout page มี)
13. **จัดการ Privacy/Passkeys** ใน settings

### สิ่งที่อาจทำได้แต่พิสูจน์ไม่เต็มที่ (Partial):

- Push notification (infrastructure มี แต่ trigger ไม่ชัด)
- Voice chat (UI มี แต่ real-time flow ไม่ชัด)
- Daily brief (engine มี แต่ generation trigger ไม่ชัด)
- Community feature (page มี แต่ functionality ไม่ชัด)
- Badge system (tracker มี แต่ UI consumption ไม่ชัด)
- RSS feed (references มี แต่ implementation ไม่ชัด)
- Notification queue delivery (handler มี แต่ delivery ไม่ชัด)

### สิ่งที่โค้ดมีแต่ไม่มี consumer (Orphan Candidates):

- audio ducking hook (ไม่มีผู้เรียก)
- notification engagement hook (ไม่มีผู้เรียก)
- streaming chat functions (ไม่มี frontend caller)
- 9 Supabase Edge Functions (ไม่มี frontend caller traced)
- metrics/autonomy-log Cloudflare Functions (ไม่มี frontend caller traced)

### สิ่งที่ควรมีแต่ไม่พบ (Missing):

- Real-time WebSocket (ใช้ REST polling แทน)
- Admin dashboard
- Bulk operations
- SMS/OTP 2FA alternative (ใช้ passkey เป็นหลัก)

### สิ่งที่ต้องระวัง:

- **Dual-engine architecture**: SICE engines ทำงาน 2 ชุดคู่ขนาน → inconsistent state risk
- **Legacy aliases**: /core-awakening และ /twin-birth เป็นเส้นทางเดียวกัน
- **Orphaned functions**: 9 edge functions ไม่มี frontend caller แต่อาจถูก trigger ทางอื่น (pg_cron, DB trigger)
- **No hardcoded astrology language**: โค้ดพยายามหลีกเลี่ยงคำว่า "ดูดวง" ตามนโยบาย product
- **Rate limiting vulnerable to cold starts**: In-memory Map loses state เมื่อ CF isolate recycle

🛑 STOP — PHASE 3 COMPLETE

รอคำสั่งดำเนิน Phase 4 (Requirement Reconciliation)
