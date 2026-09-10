# MASTER END-TO-END TRACE

**Date:** 2026-09-10
**Scope:** Complete data flow from User input → Final output → Learning loop

---

## COMPLETE DATA FLOW CHAIN

```
USER INPUT (birth date, onboarding answers, reflections, decisions)
  ↓
[1] PROFILE PERSISTENCE
  ├─ POST /api/profile → verifyUser() → selfprint.users_profiles.upsert()
  │  Files: api/unified-handler.ts:877-955
  │  Auth: Bearer token verified via Supabase JWT
  │  Validation: date format YYYY-MM-DD, time HH:MM, injection check
  │  Evidence: P0-E §E1, P0-F §F1
  │
└─ Onboarding.tsx stores birthData.dob
   Files: src/pages/Onboarding.tsx:288

  ↓
[2] SOURCE DATA GENERATION (12+ Sciences from Birth Date)
  ├─ calculateInitialDisciplines(birthDate)
  │  ├─ calculateLifePathNumber() — digit-sum with master numbers 11/22/33
  │  ├─ calculateWesternZodiac() — date-range lookup
  │  ├─ calculateChineseZodiac() — 1984 Wood Rat anchor
  │  ├─ calculateBaziYearElement() — 10-year stem cycle
  │  ├─ getPrototypeCore() — Life Path → Jungian Archetype
  │  ├─ calculateNatalChartInline() — simplified VSOP (sign-level ±5°)
  │  └─ calculateHexagramInline() — (y+m*7+d*13)%64
  │  File: src/lib/astrology.ts:333-362
  │  Evidence: P0-A §1 — All deterministic, zero hardcoded values
  │
└─ astrovera-adapter.ts transforms to Psychology module input
   Files: src/lib/astrovera-adapter.ts:89-100
   Confidence: 0.6 real DOB / 0.3 invalid DOB (validated)

  ↓
[3] FULL ANALYSIS (InsightEngine)
  ├─ PersonalContextBuilder.initialize(userId, onboardingData)
  │  ├─ createPersonalProfile() → personal_profiles table
  │  ├─ inferContextFromOnboarding() → personal_context table
  │  ├─ detectInitialPatterns() → behavioral_patterns table
  │  └─ createMemoriesFromOnboarding() → personal_memory table
  │  File: src/lib/intelligence/PersonalContextBuilder.ts:49-89
  │
  ├─ InsightEngine.generateFullAnalysis(context, patterns, metrics)
  │  ├─ buildSelfOverview() — top value + decision style + stress response
  │  ├─ behavioralPatterns[] — mapped from detected patterns
  │  ├─ strengths[] — from context.strengths
  │  ├─ blindSpots[] — filtered by sensitivity/confidence
  │  ├─ trends[] — changing patterns
  │  ├─ journey[] — stage mapping from data depth
  │  ├─ focusAreas[] — high-confidence goals + pattern hubs
  │  ├─ guidance[] — blind spots + repeating patterns + goals
  │  └─ nextSteps[] — source count + pattern count checks
  │  File: src/lib/intelligence/InsightEngine.ts:244-283
  │
  └─ Persisted to AnalysisPage display + twins.full_analysis at birth
     Files: src/pages/AnalysisPage.tsx:206, CoreAwakeningService.ts:306
     Evidence: P0-A §7 — All consumers verified

  ↓
[4] 12 SICE ENGINES (Parallel Execution)
  ├─ SICEOrchestrator.orchestrate(SICEInput)
  │  ├─ Promise.all(12 engines) — all run concurrently
  │  │
  │  ├─ Engine #1: PersonalContextBuilder
  │  │  Reads: users_profiles, twins, twin_memories, decision_patterns, world_stats
  │  │  Computes: emotionalState, currentGoals, strengthAreas, growthAreas
  │  │  File: src/services/sice/engines/PersonalContextBuilder.ts
  │  │
  │  ├─ Engine #2: PatternDetector
  │  │  Reads: decisions (last 50)
  │  │  Computes: frequency, success-rate, topic clustering
  │  │  Persists: behavioral_patterns via SICEBridge
  │  │  File: src/services/sice/engines/PatternDetector.ts
  │  │
  │  ├─ Engine #3: InsightEngine
  │  │  Reads: userContext, decisions, world_stats
  │  │  Computes: emotional/decision/growth insights
  │  │  File: src/services/sice/engines/InsightEngine.ts
  │  │
  │  ├─ Engine #4: AIFeedbackLoop ← FIXED: theme extraction added
  │  │  Reads: sice_feedback (last 30 days)
  │  │  Computes: per-engine accuracy, improvements, warnings
  │  │  File: src/services/sice/engines/AIFeedbackLoop.ts
  │  │
  │  ├─ Engine #5: TwinStateEngine
  │  │  Reads: world_stats
  │  │  Computes: maturity score from 5 weighted signals
  │  │  File: src/services/sice/engines/TwinStateEngine.ts
  │  │
  │  ├─ Engine #6: ExperienceEngine ← FIXED: theme extraction added
  │  │  Reads: twins, twin_memories
  │  │  Computes: interactions, streaks, mastered areas
  │  │  File: src/services/sice/engines/ExperienceEngine.ts
  │  │
  │  ├─ Engine #7: EnvironmentEngine ← FIXED: string interpolation
  │  │  Reads: Local clock, twins, twin_memories, decisions
  │  │  Computes: timeOfDay, season, stressLevel, recommendations
  │  │  File: src/services/sice/engines/EnvironmentEngine.ts
  │  │
  │  ├─ Engine #8: BadgeEngine
  │  │  Reads: twins, twin_memories, decisions
  │  │  Computes: badge eligibility, progress percentages
  │  │  Persists: badges via SICEBridge
  │  │  File: src/services/sice/engines/BadgeEngine.ts
  │  │
  │  ├─ Engine #9: BehavioralForecastEngine
  │  │  Reads: twin_memories (30 days)
  │  │  Computes: mood transitions, risks, opportunities
  │  │  File: src/services/sice/engines/BehavioralForecastEngine.ts
  │  │
  │  ├─ Engine #10: FutureSelfEngine
  │  │  Reads: users_profiles, twins, decisions
  │  │  Computes: vision, milestones, barriers
  │  │  File: src/services/sice/engines/FutureSelfEngine.ts
  │  │
  │  ├─ Engine #11: MemoryManagerEngine
  │  │  Reads: twins, twin_memories
  │  │  Computes: relevance ranking, themes, emotional tone
  │  │  File: src/services/sice/engines/MemoryManagerEngine.ts
  │  │
  │  └─ Engine #12: DecisionIntelligenceEngineAdapter ← FIXED: world column
  │     Reads: twins, decisions, decision_outcomes, decision_patterns
  │     Computes: successRate, bestPerformingArea, guidance
  │     File: src/services/sice/engines/DecisionIntelligenceEngineAdapter.ts
  │
  └─ All 12 results collected
     Evidence: P0-A §2, P0-B §B1

  ↓
[5] CROSS-ENGINE SYNTHESIS + CRITICAL PERSISTENCE (BLOCKER-01)
  ├─ performCrossEngineSynthesis(results)
  │  ├─ extractThemesFromEngine() per engine ← FIXED: cases 4 & 6 added
  │  ├─ themeMap aggregation (count, confidence, engines[])
  │  ├─ Classify: agreements (≥2 engines), themes, singleEngineThemes
  │  ├─ identifyConflicts() — Thai keyword matching
  │  └─ confidenceScore = avgConfidence * 0.7 + agreement_bonus * 0.3
  │  File: SICEOrchestrator.ts:148-220
  │
  ├─ performFineTuning(input, results)
  │  ├─ Read sice_feedback history
  │  ├─ Per-engine historical accuracy calculation
  │  └─ Confidence adjustment (max ±7.5%)
  │  File: SICEOrchestrator.ts:349-436
  │
  └─ buildPersonalIntelligence(input, results, synthesis, fineTuned)
     ├─ Extract insights, recommendations, warnings from all engines
     ├─ Sort by confidence, deduplicate
     ├─ recommendedAction from first agreement or top recommendation
     └─ File: SICEOrchestrator.ts:443-518

  ↓
[5b] CRITICAL PERSISTENCE GATING (BLOCKER-01 FIX)
  ├─ await Promise.allSettled([
  │     bridgePatternResults(orchestratorResult),  ← CRITICAL — awaited
  │     persistOrchestrationResults(orchestratorResult)  ← CRITICAL — awaited
  │   ])
  ├─ If critical persistence fails:
  │   ├─ completionStatus overridden to 'DEGRADED'
  │   ├─ persistenceError set with details
  │   └─ Caller MUST check these before treating as success
  ├─ Non-critical: bridgeBadgeResults() — fire-and-forget (acceptable risk)
  └─ return orchestratorResult (only after critical persistence confirmed)
     File: SICEOrchestrator.ts:144-200
     Evidence: BLOCKER-01 closure

  ↓
[5] CROSS-ENGINE SYNTHESIS
  ├─ performCrossEngineSynthesis(results)
  │  ├─ extractThemesFromEngine() per engine ← FIXED: cases 4 & 6 added
  │  ├─ themeMap aggregation (count, confidence, engines[])
  │  ├─ Classify: agreements (≥2 engines), themes, singleEngineThemes
  │  ├─ identifyConflicts() — Thai keyword matching
  │  └─ confidenceScore = avgConfidence * 0.7 + agreement_bonus * 0.3
  │  File: SICEOrchestrator.ts:148-220
  │
  ├─ performFineTuning(input, results)
  │  ├─ Read sice_feedback history
  │  ├─ Per-engine historical accuracy calculation
  │  └─ Confidence adjustment (max ±7.5%)
  │  File: SICEOrchestrator.ts:349-436
  │
  └─ buildPersonalIntelligence(input, results, synthesis, fineTuned)
     ├─ Extract insights, recommendations, warnings from all engines
     ├─ Sort by confidence, deduplicate
     ├─ recommendedAction from first agreement or top recommendation
     └─ File: SICEOrchestrator.ts:443-518
     Evidence: P0-B §B4, B5

  ↓
[6] AWAKENING TRANSACTION
  ├─ startAwakening(userId)
  │  ├─ Run SICE orchestration
  │  ├─ Check completionStatus ← NEW: DEGRADED/FAILED propagates
  │  ├─ Insert awakening_essence (status: 'pending')
  │  │  Columns: user_id, personal_intelligence, sice_results, synthesis, execution_time
  │  │  File: CoreAwakeningService.ts:151-162
  │  │
  │  └─ Atomicity check: failedOps array tracks all critical failures
  │     File: CoreAwakeningService.ts:169-174
  │
  └─ initializeTwin(userId, twinName, essenceId, birthDate, fullAnalysis)
     ├─ Read essence from DB (read-back verification)
     ├─ Calculate archetypes from disciplines
     ├─ Calculate maturityScore from PI.userUnderstanding + insightCount
     ├─ Create Twin record in database
     ├─ Promise.allSettled(9 parallel ops):
     │  1. Mark essence as 'used'
     │  2. Link personal_context to essence
     │  3. Insert baseline SICE scores ← FIXED: now gates success
     │  4. Insert birth memory
      │  5. Create twin_state (with visualDNA) ← FIXED: now gates success
      │  6. Create world_preferences (12 worlds) ← FIXED: now gates success
      │  7. Create twin_personality ← FIXED: now gates success
      │  8. Create twin_capabilities ← FIXED: now gates success
      │  9. Birth memory ← FIXED: now a critical operation (BLOCKER-03)
      │  File: CoreAwakeningService.ts:421-541
      │
      └─ Critical failure gate ← FIXED: returns success:false if any fail
         Compensating rollback ← FIXED: deletes orphaned Twin, marks essence failed (BLOCKER-02)
         File: CoreAwakeningService.ts:581-607, 638-693
         Evidence: P0-C §C1, C2

  ↓
[7] TWIN CONTEXT READY
  ├─ Twin record has:
  │  ├─ name, primaryArchetype, secondaryArchetype (from disciplines)
  │  ├─ maturityScore (from PI computation)
  │  ├─ fullAnalysis (9-section analysis from Full Analysis pipeline)
  │  └─ Visual DNA (procedural, deterministic from birthDate + archetypes)
  │
  ├─ World preferences (12 worlds) initialized
  ├─ Twin personality configured
  ├─ Twin capabilities unlocked (basic-chat, simple-advice, world-navigation)
  └─ Twin state tracking ready
     Evidence: P0-D §D1

  ↓
[8] TWIN CONVERSATION (Normal Path)
  ├─ TwinChat.tsx loads twin + fullAnalysis from DB
  │  Files: src/pages/TwinChat.tsx:342-348
  │
  ├─ User sends message
  │
  ├─ callTwinAPI(messages, twinName, twinProfile, worldId, memories, language)
  │  ├─ buildPrompt(role='TWIN', world, memories, twinState, userContext)
  │  │  Assembles system prompt from:
  │  │  - Twin identity (archetype, personality)
  │  │  - World context
  │  │  - Recent memories (injected into prompt)
  │  │  - Language preference
  │  │  File: src/lib/prompts/promptBuilder.ts
  │  │
  │  ├─ fetch('/api/twin', { headers: await getAuthHeaders(), body })
  │  │  File: src/services/TwinAPIService.ts:92-104
  │  │
  │  └─ functions/api/twin.ts processes:
  │     1. verifyUser(authHeader) → 401 if invalid ← AUTH VERIFIED
  │     2. Rate limit (40 req/min)
  │     3. callOpenRouter(env, { model, system, messages, ... })
  │     4. Return { content }
  │     File: functions/api/twin.ts:79-163
  │
  └─ Response rendered in chat UI
     Evidence: P0-E §E1, E3

  ↓
[9] TWIN CONVERSATION (Streaming Path)
  ├─ streamTwinResponse(messages, twinName, twinProfile, worldId, onChunk, language)
  │  ├─ buildTwinSystemPrompt(...) same builder as normal path
  │  ├─ fetch('/api/twin-stream', { headers: await getAuthHeaders(), body })
  │  │  ← FIXED: auth header now included
  │  │  File: src/services/TwinAPIService.ts:143-151
  │  │
  │  └─ functions/api/twin-stream.ts processes:
  │     1. verifyUser(authHeader) → 401 if invalid ← AUTH VERIFIED
  │     2. Rate limit (40 req/min)
  │     3. getOpenRouterStream(env, { model, system, messages, ... })
  │     4. Transform SSE: OpenRouter delta → client-friendly {type:"chunk",content}
  │     5. Stream back as text/event-stream
  │     File: functions/api/twin-stream.ts:79-end
  │
  └─ Client reads SSE chunks, displays incrementally
     Evidence: P0-E §E2, E3

  ↓
[10] MEMORY EXTRACTION & PERSISTENCE
  ├─ AI extracts memories from conversation
  │  ├─ PersonalMemory → personal_memory table
  │  └─ TwinMemory → twin_memories table (for Twin's continuity)
  │
  ├─ MemoryManagerEngine reads memories for forecast/synthesis
  │  File: src/services/sice/engines/MemoryManagerEngine.ts
  │
  └─ Memories injected into next conversation's system prompt
     Cross-session effect VERIFIED
     Evidence: P0-D §D2

  ↓
[11] DECISION INTELLIGENCE LOOP
  ├─ User makes decision → decisions.insert()
  ├─ User records outcome → decision_outcomes.insert()
  ├─ Follow-up scheduled → follow_up_schedule.insert()
  ├─ Learned patterns → decision_patterns upsert
  │  Files: src/services/DecisionLearningService.ts
  │
  ├─ DecisionIntelligenceEngine reads all decision data
  │  Computes: successRate, bestPerformingArea ← FIXED: world grouping
  │  File: src/services/sice/engines/DecisionIntelligenceEngineAdapter.ts
  │
  └─ Insights feed into future Twin recommendations
     Evidence: P0-D §D3

  ↓
[12] OUTCOME → LEARNING → NEXT DECISION
  ├─ User rates Twin's insight → sice_feedback.insert()
  ├─ AIFeedbackLoop aggregates feedback scores
  ├─ Fine-tuning adjusts engine confidence based on history
  │  File: SICEOrchestrator.ts:349-436
  │
  └─ Improved accuracy in next orchestration cycle
     Loop complete
```

---

## FAILURE PATHS IN THE CHAIN

| Point of Failure | Detection | Recovery | Status |
|-----------------|-----------|----------|--------|
| Profile save fails | API returns {success:false} | User retries | PASS |
| Birth date invalid | Confidence capped at 0.3 | Proceeds with reduced confidence | PASS |
| SICE engine crashes | completionStatus='DEGRADED'/FAILED | Other engines continue | PASS |
| Essence DB write fails | Awaited + completionStatus override | DEGRADED status + persistenceError set | PASS ✓ |
| Pattern persistence fails | Awaited + completionStatus override | DEGRADED status + persistenceError set | PASS ✓ |
| Twin creation partial | compensatingRollback triggered | Orphaned Twin deleted, essence marked failed | PASS ✓ |
| Birth memory fails | In criticalFailures → rollback | Twin deleted, essence preserved for retry | PASS ✓ |
| Memory persistence fails | IntelligenceError thrown | Caller receives typed error code | PASS ✓ |
| Streaming auth missing | 401 Unauthorized | Client must retry with valid token | PASS ✓ |

---

## EVIDENCE INDEX

| Trace Point | Verification Document | Section |
|-------------|----------------------|---------|
| User Profile → Source Data | P0-A-E2E-MATRIX.md | §1 |
| 12 Sciences Computation | P0-A-E2E-MATRIX.md | §2 |
| Synthesis Quality | P0-B-SICE-SYNTHESIS-MATRIX.md | §B4 |
| Completion Status | P0-B-SICE-SYNTHESIS-MATRIX.md | §B2 |
| Awakening Atomicity | P0-C-AWAKENING-TWIN-MATRIX.md | §C1 |
| Read-Back Verification | P0-C-AWAKENING-TWIN-MATRIX.md | §C2 |
| Twin Context Grounding | P0-D-TWIN-MEMORY-DECISION-MATRIX.md | §D1 |
| Cross-Session Memory | P0-D-TWIN-MEMORY-DECISION-MATRIX.md | §D2 |
| Decision Intelligence Loop | P0-D-TWIN-MEMORY-DECISION-MATRIX.md | §D3 |
| Auth Security | P0-E-API-AUTH-MATRIX.md | §E1 |
| Streaming Auth Parity | P0-E-API-AUTH-MATRIX.md | §E2, E3 |
| Error Propagation | P0-E-API-AUTH-MATRIX.md | §E4 |
| Persistence Consistency | P0-F-PERSISTENCE-MATRIX.md | §F1 |
| All Failure Scenarios | FAILURE-PATH-MATRIX.md | All 10 scenarios |
