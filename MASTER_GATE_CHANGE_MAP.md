# SELFPRINT — MASTER GATE CHANGE MAP

**Audit date:** 2026-09-11  
**HEAD:** 1f57f46c7ffebfdc1bdba1223b1f1ec7e757ef4b  

> กฎ: แก้เฉพาะสิ่งที่จำเป็นเพื่อให้ผ่าน Master Gate ห้าม rewrite ทั้งระบบ preserve existing DB/Supabase/Auth/RLS/Cloudflare/SICE/Twin/Memory/APIs

---

## Change Map Overview

| # | File(s) | Current State | Required Change | Gate Impact | Severity |
|---|---------|---------------|-----------------|-------------|----------|
| 1 | `src/pages/ImmersiveTwinChat.tsx` + `src/hooks/useEvolutionTracking.ts` | Growth engines exist but zero production callers | Wire checkMicroEvolution into handleSend flow after message persistence | Growth = EVOLUTION | P0 CRITICAL |
| 2 | `src/styles/world-transitions.css` | Keyframes defined (18), class selectors missing for runtime types | Add `.world-transition--attraction{...}` etc. rules that apply keyframes to container; ensure twin reaction classes render | World Transition visual | P0 MAJOR |
| 3 | `supabase/migrations/035_forensic_consolidation_2026-09-03.sql` | EXISTS but no evidence of application to production | Apply migration to production or provide proof it was applied | Persistence safety | P0 CRITICAL |
| 4 | `functions/api/twin-stream.ts` + `src/services/TwinAPIService.ts` + `src/pages/ImmersiveTwinChat.tsx` | Stream endpoint exists, streamTwinResponse() has zero callers | Switch ImmersiveTwinChat to use streamTwinResponse with fallback to callTwinAPI | Streaming parity | P0 MAJOR |
| 5 | `src/components/audio/SFXProvider.tsx` consumers | SFX hooks exist but useSFX() never called by any component | Wire useSFX().twin.play() and useUISFX() into ImmersiveTwinChat state transitions | Audio behavior language | P1 MAJOR |
| 6 | `src/lib/twin/twinVisualDNA.ts` + `src/components/twin/TwinPresence.tsx` | Shape space limited to 6 families | Add more shape families OR document as deliberate constraint | Visual DNA completeness | P2 CLEANUP |
| 7 | `src/pages/TwinChat.tsx`, `src/services/SICEOrchestratorImpl.ts`, `src/services/world-routing/WorldRoutingService.ts` | LEGACY/DEAD code still in repo | Mark clearly as deprecated or remove if truly unused | Cleanup | P2 CLEANUP |

---

## Detailed Change Specifications

### Change 1: Growth Wiring (P0 CRITICAL)

**Problem:** Conversation → Experience → Memory → Growth → Visual change loop is broken. Product lock requires "GROWTH = EVOLUTION".

**Current Evidence:**
- `src/services/TwinEvolutionService.ts:44` checkMicroEvolution() — real logic, queries messages/patterns/memories/feedback counts
- `src/services/TwinEvolutionService.ts:109` evolveTwin() — real DB updates (twins.stage, twin_evolution_history, birth memory)
- `src/hooks/useEvolutionTracking.ts:24` hook exists
- Zero production callers (grep confirmed)
- maturityScore set at birth only (CoreAwakeningService.ts:354), static afterward

**Required Architecture:**
```
handleSend() in ImmersiveTwinChat.tsx
  ↓ (after saveTwinMemory succeeds)
useEvolutionTracking.recordInteraction(userId, twinId)
  ↓
checkMicroEvolution(userId, twinId, metrics, currentStage)
  ↓ (if evolved=true)
evolveTwin(userId, twinId, previousStage, newStage, metrics)
  ↓
updates twins.maturity_score & stage in DB
  ↓
TwinPresence reads updated maturityScore via useTwinIdentity
  ↓ evolutionStage ≥ 3 → shows evo rings, glow increases
```

**Exact Files:**
- `src/pages/ImmersiveTwinChat.tsx` — add evolution tracking call after line 432 (saveTwinMemory twin response)
- `src/hooks/useEvolutionTracking.ts` — wire into chat context
- No new DB schema needed (uses existing twins table columns)

**Acceptance Criteria:**
- After N conversations (configurable threshold from TwinEvolutionService constants), maturity_score increases
- Reload page → higher maturityScore → different evolutionStage → visual changes (glow rings appear at stage 3+)
- Evolution history recorded in twin_evolution_history table

---

### Change 2: World Transition CSS Wiring (P0 MAJOR)

**Problem:** Engine computes correct transition type, sets className on container, but CSS has no rule for `.world-transition--${type}` so nothing animates.

**Current Evidence:**
- `src/lib/visual/WorldTransitionEngine.ts:328` computeTransition() returns config with type
- `src/pages/ImmersiveTwinChat.tsx:200` sets `container.className = world-transition-container world-transition--${config.type}`
- `src/styles/world-transitions.css:82-365` defines @keyframes world-* (all 18 animation names match engine's ANIMATION_MAP)
- `src/styles/world-transitions.css:52-72` defines .world-transition--old-world / .world-transition--new-world rules
- `src/styles/world-transitions.css:387-410` defines .twin-transition-react.is-* classes (for twin reaction)
- MISSING: Rules like `.world-transition--attraction { ... apply keyframes ... }` — these don't exist

**Required Architecture:**
Add CSS rules that map each transition type to its animation:
```css
.world-transition--attraction .world-transition--old-world { animation: world-attraction-pull 800ms ease-out forwards; }
.world-transition--attraction .world-transition--new-world { animation: world-attraction-emerge 800ms ease-in forwards; }
/* ... repeat for all 9 types ... */
```

Also ensure the DOM has old/new world wrapper elements (or modify ImmersiveTwinChat to render them during transition).

**Exact Files:**
- `src/styles/world-transitions.css` — add 9 × 2 class rules mapping to existing keyframes (~18 lines)
- `src/pages/ImmersiveTwinChat.tsx` — optionally add old/new world wrapper divs inside transition container

**Acceptance Criteria:**
- Changing world triggers visible transition animation matching narrative type
- Twin reacts with appropriate CSS class (is-attracted/is-pulled/etc.)
- Lighting overlay flashes with configured color

---

### Change 3: Migration 035 Application (P0 CRITICAL)

**Problem:** Without migration 035 applied, twin_state/twin_personality/twin_capabilities INSERT policies are missing → RLS blocks inserts → compensating rollback deletes twin → birth fails silently.

**Current Evidence:**
- `supabase/migrations/035_forensic_consolidation_2026-09-03.sql:776-858` adds INSERT policies via guarded DO blocks
- `PRODUCTION_DB_CATCHUP_2026-09-01.sql` does NOT include migration 035 (dated 09-01 vs 09-03)
- Comment in 035 line 1186: "โฟลเดอร์ migrations/ ที่ config.toml ไม่ได้ scope ให้ CLI apply เลย จึงไม่ยืนยันได้ว่ามีอยู่จริงใน production หรือไม่"
- Config.toml `[db.migrations] enabled = true` — default directory should be picked up by `supabase db push`

**Required Action:**
Run one of:
```sql
-- Option A: Run migration 035 directly in Supabase SQL Editor
-- Copy entire content of supabase/migrations/035_forensic_consolidation_2026-09-03.sql

-- Option B: Push via CLI
supabase db push --include-all
```

Then verify with 035's own verification queries (lines 1321-1349):
```sql
SELECT tablename, COUNT(*) AS policy_count FROM pg_policies WHERE schemaname='public' AND tablename IN ('twin_state','twin_personality','twin_capabilities') GROUP BY tablename ORDER BY tablename;
-- Expected: each table has policy_count >= 2
```

**Acceptance Criteria:**
- twin_state has INSERT policy (users_insert_own_twin_state)
- twin_personality has INSERT policy (users_insert_own_twin_personality)
- twin_capabilities has INSERT+SELECT policies (users_insert_own_twin_capabilities + users_view_own_twin_capabilities)
- All with CHECK (auth.uid() = user_id)

---

### Change 4: Streaming Path Consumer (P0 MAJOR)

**Problem:** `/api/twin-stream` and `streamTwinResponse()` exist with full auth/rate-limit/parity but no UI calls them.

**Current Evidence:**
- `functions/api/twin-stream.ts` — SSE stream transform, same auth as twin.ts
- `src/services/TwinAPIService.ts:121` streamTwinResponse() — uses shared buildPrompt(), same semantics as callTwinAPI
- `src/features/chat/hooks/useChat.ts` and `src/pages/ImmersiveTwinChat.tsx` both use callTwinAPI only
- grep confirmed: streamTwinResponse has ZERO callers

**Required Architecture:**
Modify ImmersiveTwinChat.handleSend to prefer streaming with fallback:
```typescript
// Prefer stream, fallback to non-streaming
try {
  await streamTwinResponse(messages, twinName, twinProfile, worldId, onChunk, memories, language);
} catch {
  // Fallback to non-streaming
  const response = await callTwinAPI(...);
  appendMessage(response);
}
```

Or simply switch to streamTwinResponse as primary (since parity is verified).

**Exact Files:**
- `src/pages/ImmersiveTwinChat.tsx` — replace callTwinAPI with streamTwinResponse in handleSend
- No server-side changes needed

**Acceptance Criteria:**
- Chat responses stream character-by-character
- Error handling falls back gracefully
- Same system prompt, same memories, same rate limiting

---

### Change 5: Audio Behavior Wiring (P1 MAJOR)

**Problem:** SFX infrastructure complete but no component consumes useSFX() to play sounds during interactions.

**Current Evidence:**
- `src/components/audio/SFXProvider.tsx` — provides useSFX() context
- `src/hooks/useTwinSFX.ts` — plays twin sounds (awakening, interact, glitch, sweep, etc.)
- `src/hooks/useUISFX.ts` — plays UI sounds (click, select, hover, error)
- `src/hooks/useTransitionSFX.ts` — plays transition sounds
- Both hooks preloaded by SFXProvider on mount
- Zero components call ui.play()/twin.play()/transition.play()

**Required Architecture:**
Wire sound playback into ImmersiveTwinChat state transitions:
```typescript
const sfx = useSFX(); // from SFXProvider context

// In handleSend:
startListening();
sfx.twin.play('interact');     // when user sends message

startThinking();
sfx.twin.play('glitch');       // when Twin starts processing

startResponding();
sfx.twin.play('sweep');        // when Twin responds

stopResponding();
sfx.ui.play('select');         // when choice selected
```

**Exact Files:**
- `src/pages/ImmersiveTwinChat.tsx` — import useSFX, wire into state transitions

**Acceptance Criteria:**
- Sound plays on user message send
- Sound plays on Twin thinking/responding states
- Sounds respect audio preferences (masterEnabled, volume)
- Browser autoplay policy handled (already handled by SFXProvider init pattern)

---

### Change 6: Cleanup Dead Code (P2 CLEANUP)

**Problem:** Legacy/dead files remain in repo creating confusion.

| File | Status | Action |
|------|--------|--------|
| `src/pages/TwinChat.tsx` | LEGACY (not routed) | Keep but add `@deprecated` JSDoc comment |
| `src/services/SICEOrchestratorImpl.ts` | DEAD (zero imports) | Mark as legacy reference |
| `src/services/world-routing/WorldRoutingService.ts` | DEAD (routeToWorld not called) | Keep as reference, mark dead |
| `src/services/world-routing/WorldDecisionRouter.ts` | DEAD | Keep as reference |
| `src/lib/intelligence/` vs `src/services/sice/engines/` | BOTH LIVE (different purposes) | Document distinction, keep both |

No functional changes needed.

---

### Change 7: Three.js Decision Documentation (P2 DOCUMENTATION)

**Problem:** Product concept says "TWIN = Living Embodiment" via Three.js but actual implementation is SVG/CSS/canvas-2D.

**Required Action:**
Document the C5 decision explicitly in product docs:
- Accept SVG/CSS as the living body renderer
- Note WebGL deferred per Twin.tsx:12-14 comment
- Update gate documentation to reflect actual renderer

No code changes required.
