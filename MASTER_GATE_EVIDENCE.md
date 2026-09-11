# SELFPRINT — MASTER GATE EVIDENCE (Source-Level Proof)

**Audit date:** 2026-09-11  
**HEAD:** 1f57f46c7ffebfdc1bdba1223b1f1ec7e757ef4b  
**Method:** grep/read of actual source code only. No runtime execution performed.

---

## Evidence 1: SICE Engine Pipeline (GREEN)

### Registration
File: `src/services/sice/SICEOrchestrator.ts:55-69`
```typescript
this.engines.set(1, new PersonalContextBuilder());
this.engines.set(2, new PatternDetector());
this.engines.set(3, new InsightEngine());
this.engages.set(4, new AIFeedbackLoop());
this.engines.set(5, new TwinStateEngine());
this.engines.set(6, new ExperienceEngine());
this.engines.set(7, new EnvironmentEngine());
this.engines.set(8, new BadgeEngine());
this.engines.set(9, new BehavioralForecastEngine());
this.engines.set(10, new FutureSelfEngine());
this.engines.set(11, new MemoryManagerEngine());
this.engines.set(12, new DecisionIntelligenceEngineAdapter());
```
12 engines registered with correct IDs.

### Parallel Orchestration
File: `src/services/sice/SICEOrchestrator.ts:74-96`
```typescript
async orchestrate(input: SICEInput): Promise<OrchestratorResult> {
  const resultPromises = Array.from(this.engines.values()).map((engine) =>
    engine.process(input).catch((error) => { /* return proper SICEOutput on error */ })
  );
  const results = await Promise.all(resultPromises);
```
All 12 run in parallel. Per-engine .catch returns structured error output.

### Synthesis & Completion Status
File: `src/services/sice/SICEOrchestrator.ts:114-143`
```typescript
let completionStatus: 'COMPLETE' | 'DEGRADED' | 'FAILED';
if (allEnginesFailed) completionStatus = 'FAILED';
else if (someEnginesFailed) completionStatus = 'DEGRADED';
else completionStatus = 'COMPLETE';
```
Computed from actual engine success/failure counts.

### Critical Persistence Awaited
File: `src/services/sice/SICEOrchestrator.ts:150-197`
```typescript
const [patternPersist, essencePersist] = await Promise.allSettled([
  sICEBridge.bridgePatternResults(orchestratorResult),
  sICEBridge.persistOrchestrationResults(orchestratorResult),
]);
// Override COMPLETE → DEGRADED if critical persistence fails
if (criticalPersistenceFailed) {
  completionStatus = 'DEGRADED';
  orchestratorResult.persistenceError = criticalErrorMessage;
}
```
Critical writes awaited BEFORE returning result. Non-critical badge bridge is fire-and-forget (line 186).

### Callers
- `src/pages/Onboarding.tsx:527-528`: `new SICEOrchestrator(); siceResult = await orchestrator.orchestrate({...})`
- `src/services/CoreAwakeningService.ts:141-149`: Same pattern in startAwakening()
- `src/services/world-routing/WorldRoutingService.ts:62-63`: routeToWorld calls orchestrate (but WorldRoutingService has ZERO production callers — DEAD)

### Engine Internal Verification (Sample: PatternDetector)
File: `src/services/sice/engines/PatternDetector.ts:30-49`
```typescript
let query = supabase.from('decisions').select('*')
  .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
const { data: decisions, error } = await query;
const patterns = this.analyzeDecisions(decisions || [], world);
```
Real Supabase query + real analysis logic. Not a mock.

### Engine Internal Verification (Sample: MemoryManagerEngine)
File: `src/services/sice/engines/MemoryManagerEngine.ts:73-89`
```typescript
const { data: twin } = await supabase.from('twins').select('id')
  .eq('user_id', userId).maybeSingle();
let query = supabase.from('twin_memories').select('content, world_id, created_at')
  .eq('twin_id', twin.id).order('created_at', { ascending: false }).limit(50);
```
Real queries to DB tables. Returns synthesized memory state.

---

## Evidence 2: Auth / Security (GREEN)

### JWT Verification Path
File: `api/_utils/verify-user.ts:48-64`
```typescript
export async function verifyUser(authHeader: string | undefined, env: Env): Promise<VerifiedUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const supabaseAdmin = getSupabaseAdmin(env);
  const token = authHeader.slice('Bearer '.length).trim();
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
}
```
Uses service-role admin client. Validates JWT via Supabase auth API.

### twin.ts Gate
File: `functions/api/twin.ts:93-100`
```typescript
const authHeader = request.headers.get('authorization') ?? undefined;
if (!authHeader) return json({ error: 'Unauthorized' }, 401);
const user = await verifyUser(authHeader, env);
if (!user) return json({ error: 'Unauthorized' }, 401);
```
Rate limit (line 107), system prompt required (line 137).

### twin-stream.ts Parity
File: `functions/api/twin-stream.ts:88-95` — identical auth gate pattern.

### unified-handler Ownership Enforcement
File: `api/unified-handler.ts:395`
```typescript
.eq('user_id', user.id) // TWINEVOAUTH-001: ownership enforced in code, not only by RLS
```
File: `api/unified-handler.ts:427-431`
```typescript
if (requestedUserId && requestedUserId !== user.id) {
  return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
}
```

### RLS Policies Verified
- twins: `supabase/migrations/024_create_twins_table.sql:18-24` — SELECT/INSERT/UPDATE with auth.uid() = user_id
- twin_memories: `supabase/migrations/028_consolidate_phase_a_schema.sql:38-50` — twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
- awakening_essence: `supabase/migrations/025_create_awakening_essence.sql:41-57` — auth.uid() = user_id
- world_preferences: `supabase/migrations/021_world_preferences.sql:25-44` — auth.uid() = user_id
- twin_sice_scores: `supabase/migrations/028_consolidate_phase_a_schema.sql:79-92` — twin_id IN own twins

---

## Evidence 3: Awakening → Twin Flow (GREEN)

### Idempotency Guards
File: `src/services/CoreAwakeningService.ts:179-209`
Double-check before inserting essence:
1. Check twins table for existing twin (postCheckTwin)
2. Check awakening_essence for pending essence (postCheckEssence)
Both use maybeSingle(). If either exists → return early with clear message.

### Essence Retrieval (user_id scoped)
File: `src/services/CoreAwakeningService.ts:277-313`
```typescript
const { data, error } = await supabase.from('awakening_essence')
  .select('*').eq('id', essenceId).eq('user_id', userId).eq('status', 'pending').single();
```
Retrieves essence scoped to BOTH essenceId AND user_id — prevents cross-user access.

### 12-Science Archetype Computation
File: `src/services/CoreAwakeningService.ts:328-346`
```typescript
const disciplines = calculateInitialDisciplines(birthDate);
const archetypeResult = calculateArchetypes({
  birthDate, lifePathNumber, westernZodiac, moonSign, natalDominantElement,
  chineseZodiac, baziYearElement, hexagramNumber, moonFullDegree, sunFullDegree,
  mercurySign, venusSign, marsSign,
});
```
Fuses all 12 sciences into primary+secondary archetype.

### 9-Op Parallel Insert with Rollback
File: `src/services/CoreAwakeningService.ts:491-602`
```typescript
const [essenceResult, , scoresResult, memoryResult, stateResult, worldPrefsResult, personalityResult, capabilitiesResult] = 
  await Promise.allSettled([...9 operations...]);
```
File: `src/services/CoreAwakeningService.ts:631-680`
Compensating rollback checks each operation. On failure:
```typescript
const rollbackResult = await compensatingRollback({ twinId, userId, essenceId, failedOps });
```
rollback deletes orphan twin + marks essence as 'failed'. Returns unrecoverable/partial/success.

---

## Evidence 4: Canonical Twin Identity (GREEN)

### Birth seedKey
File: `src/pages/CoreAwakening.tsx:448`
```tsx
<Twin variant="birth" onComplete={handleBirthComplete} primaryArchetype={birthArchetype} seedKey={session.user.id} />
```

### Chat seedKey
File: `src/pages/ImmersiveTwinChat.tsx:540`
```tsx
<Twin variant="presence" ... seedKey={session.user.id ?? twin.id} />
```

### Same derivation path
File: `src/components/twin/TwinPresence.tsx:327-333`
```typescript
const { evolutionStage, glowMult, dna, traits, uniqueCoreColor, uniqueAuraColor, worldCtx } = useTwinIdentity({
  primaryArchetype, secondaryArchetype, seedKey, maturityScore, worldId,
});
```

File: `src/hooks/useTwinIdentity.ts:72-147`
useTwinIdentity computes:
- evolutionStage from maturityScore (line 80-86)
- dna from getTwinVisualDNA(primary, secondary) (line 91-94)
- traits from getUniqueTwinTraits(seedKey) (line 98-101)
- uniqueCoreColor from shiftHue(dna.coreColor, traits.hueShiftDeg) (line 103-106)

Same seedKey + same archetype → same DNA + same traits → same visual identity.

---

## Evidence 5: Visual DNA Parameter Space (GREEN)

File: `src/lib/twin/twinVisualDNA.ts:56-75`
18 archetypes mapped to coreColor/auraColor/coreShape/motionSpeed/auraStyle. Each archetype has distinct color pair. Shape families (sphere/crystal/ring/diamond/bloom/wave) reused across few archetypes but combined with color still uniquely identifies.

File: `src/lib/twin/twinUniqueness.ts:65-77`
Per-user deterministic variation:
```typescript
return {
  hueShiftDeg: (rand() - 0.5) * 34,       // ~±17 degrees
  facetCount: 5 + Math.floor(rand() * 6),   // 5..10 facets
  facetRadiusRatio: 0.55 + rand() * 0.3,    // 0.55..0.85
  shapeJitterSeed: rand(),                   // polygon vertex perturbation
  orbitDirection: rand() > 0.5 ? 1 : -1,     // spin direction
};
```
Seeded by mulberry32(hashStringToInt(seedKey)) — deterministic from session.user.id.

---

## Evidence 6: Three.js ABSENT (RED)

package.json dependencies (lines 17-31): react, react-dom, zustand, @tanstack/react-query, @supabase/supabase-js, axios, stripe, @anthropic-ai/sdk, @sentry/react — NO three.

grep "from 'three'" across all .ts/.tsx files: zero matches.

Comment confirming decision:
File: `src/components/twin/Twin.tsx:11-14`
```
* HIGH     → also TwinPresence — C5 decided against building a WebGL
*              renderer (three.js ~350kB gzip not justified vs. the
*              current ~250kB gzip initial bundle without real Lighthouse
*              numbers to argue from). Reserved for later.
```

Actual renderers:
- FALLBACK: CSS radial-gradient div (line 95-118)
- LOW: CSS breathing orb (line 124-150)
- MEDIUM/HIGH: SVG TwinPresence component (Twin.tsx:179-257)
- Birth: Canvas 2D HologramBirth (canvas.getContext('2d'))

---

## Evidence 7: Growth Unwired (ORANGE)

File: `src/services/TwinEvolutionService.ts:44-103` checkMicroEvolution — real logic that queries messages/patterns/memories/feedback counts from DB.

File: `src/services/TwinEvolutionService.ts:109-187` evolveTwin — real DB updates (twins.stage, twin_evolution_history insert, birth memory).

Grep for callers:
- `src/__tests__/TwinEvolution.test.ts:168,200` — test callers only
- `src/hooks/useEvolutionTracking.ts:24` — hook defined but grep shows ZERO imports of useEvolutionTracking outside its own file

maturityScore update path:
- Set once at birth: `CoreAwakeningService.ts:354` calculateMaturityScore(...)
- Only other reference: `TwinSupabaseService.ts:185` in updateTwinProfile (admin profile save, not conversation-driven)
- No loop connecting conversation count → maturity_score increment

---

## Evidence 8: World Transition CSS Gap (ORANGE)

File: `src/pages/ImmersiveTwinChat.tsx:200`
```typescript
container.className = `world-transition-container world-transition--${config.type}`;
```
Sets class like `world-transition--attraction`.

File: `src/styles/world-transitions.css` grep for `.world-transition--`:
- Line 52: `.world-transition--old-world {` — rule exists
- Line 65: `.world-transition--new-world {` — rule exists
- Line 387: `.twin-transition-react.is-attracted {` — rule exists
- Line 494: `.lighting-transition-overlay {` — rule exists
- MISSING: `.world-transition--attraction`, `.world-transition--pull`, etc. — no selectors match the runtime class names

Container element (line 520): `<div className="world-transition-container" />` — empty, no old/new-world children.

---

## Evidence 9: Streaming Dead Code (IMPLEMENTED BUT NOT VERIFIED)

File: `src/services/TwinAPIService.ts:121-203` streamTwinResponse — complete implementation using buildPrompt(), fetch('/api/twin-stream'), SSE parsing.

Grep for streamTwinResponse callers: zero matches outside definition.

File: `src/pages/ImmersiveTwinChat.tsx:423` uses callTwinAPI only:
```typescript
const twinResponse = await callTwinAPI(apiMessages, twin.name, twinProfile, currentWorld, recentMemories, language);
```

Semantic parity verified: both callTwinAPI (line 69-78) and streamTwinResponse (line 135-144) call identical `buildPrompt()` with same parameters.

---

## Evidence 10: Immersive Chat Layer Architecture (GREEN)

File: `src/styles/immersive-layers.css` @import in `src/index.css:7-8`:
```css
@import url('./styles/immersive-layers.css');
@import url('./styles/world-transitions.css');
```

Layer structure in ImmersiveTwinChat.tsx:
- Line 528-530: Layer 0 World (`<div className="layer-world">`)
- Line 532-544: Layer 1 Twin (`<div className="layer-twin">`)
- Line 547-727: Layer 3+ Content (`<div className="immersive-content">`)
- Line 703-726: Layer 3 Controls (`<div className="layer-primary">`)
- Line 730-740: Layer 4 Drawer (`<WorldDrawer>`)

CSS layer classes defined in immersive-layers.css:
- Line 65: `.layer-world { position: fixed; inset: 0; z-index: 0; }`
- Line 85: `.layer-twin { position: absolute; inset: 0; z-index: 10; }`

AppShell hideNav: line 517 `<AppShell hideNav>` — no side navigation.

---

## Evidence 11: Audio Infrastructure Complete but Unused (ORANGE)

File: `src/App.tsx:356-366` SFXProvider mounted globally:
```tsx
<SFXProvider>
  <EnvironmentProvider>...</EnvironmentProvider>
</SFXProvider>
```

File: `src/components/audio/SFXProvider.tsx:54-56` hooks initialized:
```typescript
const ui = useUISFX({ enabled: masterEnabled, volume });
const twin = useTwinSFX({ enabled: masterEnabled, volume });
const transition = useTransitionSFX({ enabled: masterEnabled, volume });
```

File: `src/components/audio/SFXProvider.tsx:59-66` preloads on mount:
```typescript
useEffect(() => { setTimeout(() => { ui.preloadAll(); twin.preloadAll(); transition.preloadAll(); }, 1000); }, []);
```

Grep for useSFX() consumers: zero matches outside provider definition.
Grep for .play() calls from SFX context: zero matches.

---

## Evidence 12: Legacy/Duplicate Systems

| File | Import Count | Status |
|------|-------------|--------|
| `src/pages/TwinChat.tsx` | 0 imports (not in App.tsx routes) | LEGACY |
| `src/services/SICEOrchestratorImpl.ts` | 0 imports | DEAD |
| `src/services/world-routing/WorldRoutingService.ts` | 0 imports (routeToWorld called nowhere) | DEAD |
| `src/services/world-routing/WorldDecisionRouter.ts` | 0 imports | DEAD |
| `twin_memory` (singular) table | Code uses twin_memories (plural) only | DUPLICATE EMPTY TABLE |

File: `supabase/migrations/035_forensic_consolidation_2026-09-03.sql:694-715` documents twin_memory duplicate:
```sql
COMMENT ON TABLE twin_memory IS
'DUPLICATE-001: ตารางนี้ถูกสร้างซ้ำโดยไม่ตั้งใจจาก race ระหว่าง migration 028 (DROP) กับ 029 (CREATE ใหม่)...'
```
