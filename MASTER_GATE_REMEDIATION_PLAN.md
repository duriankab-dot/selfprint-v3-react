# SELFPRINT — MASTER GATE REMEDIATION PLAN

**Audit date:** 2026-09-11  
**HEAD:** 1f57f46c7ffebfdc1bdba1223b1f1ec7e757ef4b  
**Status:** NOT PASS → requires remediation before "Production Ready" claim

---

## P0 Critical (Must fix before any production claim)

### Blocker 1: Growth Pipeline Not Wired to Production

**Problem:** Conversation → Experience → Memory → Growth → Visual Change loop does not exist in production code. Product lock requires "GROWTH = EVOLUTION" where growth changes Twin visually.

**Current Evidence:**
- `src/services/TwinEvolutionService.ts` has checkMicroEvolution() and evolveTwin() with real DB logic
- `src/hooks/useEvolutionTracking.ts` exists but has ZERO production callers
- maturityScore is set once at birth via calculateMaturityScore() — static afterward
- No conversation-driven update path found anywhere in source

**Why It Fails:** The product concept "growth เปลี่ยน Twin จริง" cannot execute. Users chat forever, Twin stays at same evolutionStage/glow/rings forever. This breaks the core promise of Living Intelligence.

**Exact Files:**
- `src/pages/ImmersiveTwinChat.tsx` — handleSend function (after line 432)
- `src/hooks/useEvolutionTracking.ts` — existing hook needs wiring

**Required Architecture:**
```
handleSend() [ImmersiveTwinChat.tsx]
  ↓ (after saveTwinMemory succeeds for both user and twin messages)
Record interaction metrics: messageCount++, daysSinceAwakening from DB
  ↓
checkMicroEvolution(userId, twinId, metrics, currentStage)
  ↓ (if evolved=true)
evolveTwin(userId, twinId, previousStage, newStage, metrics)
  ↓ (updates twins.maturity_score and stage in DB)
TwinPresence re-renders with updated maturityScore
  ↓ evolutionStage >= 3 → evo rings appear; glow increases
```

**Required Change:** Add growth tracking call in handleSend after successful message persistence. Check every N messages (configurable threshold). On evolution, update twins table.

**Verification Method:** After implementing, send 10+ messages → verify maturity_score increments → reload page → verify evolutionStage changed → verify visual changes (evo rings, glow intensity).

**Acceptance Criteria:**
- 10 consecutive conversations trigger evolution check
- At least 2 stages achievable within reasonable usage (stage 1→2, 2→3)
- Stage 3+ shows evolution rings in TwinPresence SVG
- Evolution history recorded in twin_evolution_history table
- Changes persist across page reloads

---

### Blocker 2: Three.js / Living Body Gate Not Met

**Problem:** Master Gate asks to find actual renderer. There is no Three.js dependency or import. Twin rendering is SVG/CSS/canvas-2D only.

**Current Evidence:**
- package.json: NO three dependency
- grep "from 'three'" across all files: zero matches
- Comment in `src/components/twin/Twin.tsx:12-14`: C5 decided against WebGL (~350kB gzip not justified), reserved for later
- Actual renderers: HologramBirth (canvas 2D), TwinPresence (SVG), fallbacks (CSS radial gradients)

**Why It Fails:** The gate explicitly states "Three.js must be renderer, not business logic." Current implementation is a living presence via SVG but doesn't meet the Three.js gate specification.

**Two Options:**

**Option A (Recommended): Document as deliberate decision**
- Accept SVG/CSS as the living body renderer
- Update product documentation to reflect actual architecture
- Note that WebGL deferred per C5 decision
- Change gate status from RED to GREEN-with-note

**Option B: Build progressive WebGL renderer**
- Create `src/components/twin/TwinWebGLRenderer.tsx` using @react-three/fiber
- Mount as HIGH fidelity tier in Twin.tsx (replacing MEDIUM/HIGH which currently use TwinPresence)
- Keep SVG as FALLBACK/LOW/MEDIUM tiers
- Progressive enhancement: if WebGL available → use it; else → SVG

**Required Change for Option B:**
- New file: `src/components/twin/TwinWebGLRenderer.tsx` (procedural geometry matching VisualDNA parameters)
- Modify `src/components/twin/Twin.tsx` HIGH branch to use WebGL renderer
- Add @react-three/fiber dependency

**Verification Method:** Browser inspection → confirm Three.js scene renders with correct archetype colors/shapes. Verify deterministic output matches SVG version.

**Acceptance Criteria:** WebGL renderer produces visually identical output to SVG renderer for same archetype/seedKey. Graceful degradation to SVG when WebGL unavailable.

---

### Blocker 3: Migration 035/034 Application Status Unknown

**Problem:** Without migration 035 applied to production, Twin birth fails silently due to missing INSERT policies on twin_state/twin_personality/twin_capabilities tables.

**Current Evidence:**
- `supabase/migrations/035_forensic_consolidation_2026-09-03.sql:776-858` adds missing INSERT policies
- `PRODUCTION_DB_CATCHUP_2026-09-01.sql` predates 035 by 2 days and does NOT include it
- Comment in 035 line 1186: "migrations/ folder ที่ config.toml ไม่ได้ scope ให้ CLI apply เลย จึงไม่ยืนยันได้ว่ามีอยู่จริงใน production หรือไม่"
- Config.toml `[db.migrations] enabled = true` with default directory — should be picked up by `supabase db push`

**Why It Fails:** If 035 was never applied:
1. initializeTwin tries to INSERT into twin_state → RLS blocks (no INSERT policy) → error logged
2. criticalFailures array populates → compensatingRollback triggers
3. Orphan twin deleted → user sees "Twin creation rolled back" error
4. Birth ceremony completes but Twin never actually created

**Required Action:** Apply migration 035 to production immediately.

```sql
-- Run in Supabase Dashboard > SQL Editor:
-- Copy entire content of supabase/migrations/035_forensic_consolidation_2026-09-03.sql
-- OR run via CLI:
supabase db push --include-all
```

Then verify:
```sql
SELECT tablename, COUNT(*) AS policy_count FROM pg_policies 
WHERE schemaname='public' AND tablename IN ('twin_state','twin_personality','twin_capabilities') 
GROUP BY tablename ORDER BY tablename;
-- Expected: each has policy_count >= 2
```

**Also required:** Apply migration 034_twin_full_analysis.sql if not already applied (twins.full_analysis column needed by CoreAwakeningService.initializeTwin).

**Verification Method:** Run verification queries from 035 E.5/E.6 sections. Attempt test Twin creation.

**Acceptance Criteria:**
- All INSERT policies present on twin_state, twin_personality, twin_capabilities
- Test Twin creation succeeds end-to-end without rollback
- Full Analysis data persists to twins.full_analysis column

---

### Blocker 4: Streaming Path Has No Consumer

**Problem:** `/api/twin-stream` endpoint and `streamTwinResponse()` client function are fully implemented with auth parity but no UI component calls them.

**Current Evidence:**
- `functions/api/twin-stream.ts` — complete SSE stream transform, same auth/rate-limit as twin.ts
- `src/services/TwinAPIService.ts:121-203` streamTwinResponse() — uses shared buildPrompt(), identical semantics
- `src/pages/ImmersiveTwinChat.tsx:423` uses callTwinAPI only
- grep confirmed: streamTwinResponse has ZERO callers

**Why It Fails:** Master Gate requires BOTH normal + streaming paths verified. Streaming path is dead code despite being deployed.

**Required Change:** Switch ImmersiveTwinChat.handleSend to use streamTwinResponse as primary with fallback:

```typescript
// In handleSend, replace:
const twinResponse = await callTwinAPI(...);

// With:
let twinResponse: string;
try {
  const chunks: string[] = [];
  await streamTwinResponse(messages, twinName, twinProfile, worldId, 
    (chunk) => chunks.push(chunk), recentMemories, language);
  twinResponse = chunks.join('');
} catch {
  // Fallback to non-streaming
  twinResponse = await callTwinAPI(...);
}
```

**Exact Files:**
- `src/pages/ImmersiveTwinChat.tsx` — modify handleSend function

**Verification Method:** Open DevTools Network tab → verify SSE stream events received → verify text appears character-by-character.

**Acceptance Criteria:**
- Chat responses stream in real-time
- Error handling gracefully falls back to non-streaming
- Same system prompt, memories, rate limiting as non-streaming path

---

## P1 Major

### Item 1: Audio Behavior Language Wiring

**Problem:** SFX infrastructure complete (SFXProvider global mount, 60+ audio files, preloading) but no component consumes useSFX() to play sounds during interactions.

**Current Evidence:**
- `src/App.tsx:356` SFXProvider mounted globally
- `src/components/audio/SFXProvider.tsx:54-56` hooks initialized and preloaded
- grep for useSFX() consumers: ZERO outside provider definition
- Immersive chat plays no behavior sounds

**Why It Fails:** Product concept "Audio Behavior Language" specifies idle/touch/thinking/responding/growth/birth/world transition sounds. Infrastructure exists but behavioral wiring is absent.

**Required Change:** Wire sound playback into state transitions:

```typescript
const sfx = useSFX(); // from SFXProvider context (already mounted)

// In handleSend:
startListening();
sfx.twin.play('interact');

startThinking();
sfx.twin.play('glitch');

startResponding();
sfx.twin.play('sweep');

stopResponding();
sfx.ui.play('select');
```

**Exact Files:**
- `src/pages/ImmersiveTwinChat.tsx` — import useSFX, wire into state transitions

**Verification Method:** Play sound on message send, thinking, responding. Verify respects masterEnabled/volume settings.

**Acceptance Criteria:**
- Sound plays on user message send (interact sound)
- Sound plays on Twin thinking state (glitch sound)
- Sound plays on Twin responding state (sweep sound)
- Sounds respect audio preferences
- Browser autoplay policy handled (SFXProvider already handles this pattern)

---

### Item 2: World Transition CSS Wiring

**Problem:** Engine computes correct transition type, sets className on container, but CSS has no rule for `.world-transition--${type}` so animations don't trigger.

**Current Evidence:**
- `src/pages/ImmersiveTwinChat.tsx:200` sets container class like `world-transition--attraction`
- `src/styles/world-transitions.css` defines 18 @keyframes but no class selectors matching runtime types
- Container element is empty — no old/new-world children rendered

**Required Change:** Add CSS rules mapping transition types to their keyframes:

```css
.world-transition--attraction .world-transition--old-world { animation: world-attraction-pull 800ms ease-out forwards; }
.world-transition--attraction .world-transition--new-world { animation: world-attraction-emerge 800ms ease-in forwards; }
/* ... repeat for pull, absorption, dissolution, flow, fold, tunnel, gravity_shift, env_wave ... */
```

**Exact Files:**
- `src/styles/world-transitions.css` — add ~18 lines of class rules
- Optionally `src/pages/ImmersiveTwinChat.tsx` — add old/new-world wrapper divs inside transition container

**Acceptance Criteria:**
- Changing world triggers visible transition animation
- Animation matches narrative type (attraction pulls inward, dissolution scatters, etc.)
- Twin reacts with appropriate CSS class

---

## P2 Cleanup

### Item 1: Remove/Mark Dead Code

| File | Status | Action |
|------|--------|--------|
| `src/pages/TwinChat.tsx` | LEGACY (not routed) | Add `@deprecated` JSDoc comment |
| `src/services/SICEOrchestratorImpl.ts` | DEAD (zero imports) | Mark as legacy reference |
| `src/services/world-routing/WorldRoutingService.ts` | DEAD (routeToWorld not called) | Keep as reference, mark dead |
| `src/services/world-routing/WorldDecisionRouter.ts` | DEAD | Keep as reference |

No functional changes needed. These files have zero impact if left in repo.

### Item 2: Database Table Cleanup (requires approval)

| Table | Status | Notes |
|-------|--------|-------|
| `twin_memory` (singular) | DUPLICATE EMPTY TABLE | Documented in 035:694-715; DROP safe after confirming no external writes |
| `twin_visual_dna` | BYPASSED | Code uses twin_state.data.visualDNA instead; table may not exist in prod |

These require manual review before removal.

---

## Preservation Statement

All remediation preserves existing:
- **DB schema:** No new tables or columns required (growth uses existing twins.maturity_score)
- **Supabase/Auth/RLS:** Existing policies and ownership enforcement unchanged
- **Cloudflare Functions:** twin.ts, twin-stream.ts, unified-handler.ts unchanged
- **SICE 12 Engines:** All engine implementations preserved
- **Twin Creation Flow:** startAwakening → initializeTwin → compensating rollback unchanged
- **Memory System:** twin_memories persistence unchanged
- **Existing APIs:** All endpoints preserved

Only additions/minor modifications:
1. Growth tracking call added to handleSend (one line addition)
2. CSS rules added (declarative, no logic change)
3. Audio playback calls added (non-breaking, SFXProvider handles disabled state)
4. Streaming switch in handleSend (with fallback)
