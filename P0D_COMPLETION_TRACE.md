# P0-D Completion Trace — World Registry & Routing

Status: Complete for the scope defined below. Honest trace, not a build-passed claim.

## Scope decision (user-confirmed)
P0D_GAP_ANALYSIS.md Gap #4 contradicted itself (gate-by-level vs "12 worlds fully accessible").
User resolved it explicitly: **all 12 worlds stay unlocked, no gating** — but content should still
lazy-load per world rather than bundle everything at once. No progression/locking UI was built,
per this instruction. Route-based code splitting (`lazy(() => import('./pages/WorldDetail'))`
in App.tsx) satisfies the lazy-load requirement.

## Gap #1 — No real per-world entry point
**Finding:** `WorldsHub.tsx` only expanded a card in place; no full-screen `/worlds/:worldId` route
existed, so "enter a world" had no real destination and `recordWorldVisit` analytics were never
actually called from a dedicated page.

**Fix:**
- New `src/pages/WorldDetail.tsx` — full-screen page, validates `worldId` via `isValidWorldId()`,
  redirects to `/worlds` if invalid, calls `useWorld().recordWorldVisit(worldId)` on mount, links to
  `/chat/twin?world=${world.id}`.
- `App.tsx`: lazy-loaded route added — `/en/worlds/:worldId` and `/th/worlds/:worldId`, both behind
  `ProtectedRoute`. Verified present (grep, lines 145-146).
- `WorldsHub.tsx` rewritten: cards `navigate()` to the new route instead of inline expand. Verified
  by reading the current file — no leftover inline detail state.

**Correction to the gap analysis:** P0D_GAP_ANALYSIS.md implied the Twin doesn't change behavior
per world. That was inaccurate — `TWIN_WORLD_PROMPTS` / `buildTwinSystemPrompt()`
(`src/config/twin-prompts.ts`) was already wired into `TwinAPIService.callTwinAPI()` and did change
the system prompt per world. The real gap was the missing UI entry point into that existing
pipeline, not the pipeline itself.

**Separate, deliberately unwired system found:** `WorldRoutingService.ts` +
`WorldExpertPrompts.ts` (`src/services/world-routing/`, `src/services/world-prompts/`) is a second,
more complex world-prompt system with zero production callers (confirmed by grep — no imports
outside its own directory and tests). Left unwired; flagged as an explicit scope boundary, not
touched, to avoid running two competing prompt systems in production.

## Gap #2 — `twin_world_expertise` table never existed
**Finding:** `WorldExpertiseService.ts` queried a `twin_world_expertise` table
(`select`/`upsert`/`.eq('twin_id', ...)`) that had no `CREATE TABLE` anywhere in the repo — every
call would fail in production, silently caught and logged, falling back to defaults.

**Fix:** `migrations/003_twin_world_expertise.sql` — schema, index on `twin_id`, RLS enabled with
the same ownership pattern already used elsewhere (`twin_id IN (SELECT id FROM twins WHERE
user_id = auth.uid())`).

**⚠️ Not applied from this sandbox.** This migration must be run manually against the live
Supabase instance before expertise tracking will persist any data. Until it's run, every write
still fails silently and falls back to defaults (score 50, confidence 40) — the app won't break,
but no real per-world expertise data will accumulate.

## Gap #3 — Expertise tracking silently reset instead of accumulating
**Finding:** `recordWorldInteraction()` upserted `interaction_count: 1` and
`expertise_score: expertiseGain` on **every call**, with a comment claiming a DB trigger would
handle real incrementing. No such trigger exists anywhere in the schema — every interaction reset
the counter instead of growing it.

**Fix:** Read-then-upsert, mirroring the pattern already used in `WorldContext.recordWorldVisit()`:
reads existing `interaction_count`/`expertise_score`, computes
`nextInteractionCount = existing + 1` and `nextExpertiseScore = min(100, existing + gain)`, then
upserts the accumulated values. Verified by reading the current file (lines 36-74).

## Gap #3 (wiring) — Nothing ever called `recordWorldInteraction`
**Finding:** The (broken) function had zero callers anywhere in the codebase — expertise tracking
was fully dead code, not just buggy.

**Fix:** `TwinChat.tsx` now calls `recordWorldInteraction(twin.id, currentWorld)` (non-blocking,
`.catch()`-guarded) after every successful Twin response, when a world is active. Verified: line
218, inside the same block as the successful API response handling.

## DISCONNECT-001 — found during trace verification, not in the original gap analysis
**Finding:** `WorldTabs` (rendered inside `TwinChat.tsx`) updated `WorldContext.currentWorld` on
tab click and called `recordWorldVisit`. But the page's actual AI-prompt-building logic
(`callTwinAPI(...)`) read a **separate local `useState<WorldId | null>`** that `WorldTabs` never
touched. Net effect: clicking a world tab visually highlighted a new world and logged a "visit,"
but the AI kept using whichever world was last set via the `?world=` URL param (or none) — the
visible switcher didn't actually switch what the Twin talked about.

**Fix:**
- `WorldTabs.tsx`: added optional `onWorldSelect?: (world: WorldId) => void` prop, called inside
  `handleWorldSelect` alongside the existing `setCurrentWorld`/`recordWorldVisit` calls.
- `TwinChat.tsx`: imports `useWorld`, destructures `setCurrentWorld: setWorldContextCurrentWorld`.
  The `?world=` URL-param effect now also calls `setWorldContextCurrentWorld(world)` (so WorldTabs
  highlights correctly on arrival from `WorldDetail.tsx`'s "Chat with Twin" link). The
  `<WorldTabs onWorldSelect={...}>` usage sets **both** the local state (`setLocalWorld`, which
  drives `callTwinAPI`) and `setCurrentWorld` (TwinContext's, used elsewhere in the page) on tab
  click. Verified by grep: lines 35, 77-82, 218, 277-284 all consistent — no orphaned state left.

## Verification performed
1. `npm run build` — `✓ built in 28.11s`, no TypeScript errors, after all P0-D changes including
   the DISCONNECT-001 fix.
2. Grep trace of every changed call site (`App.tsx` routes, `WorldsHub.tsx` navigation,
   `WorldDetail.tsx` mount effect, `WorldExpertiseService.ts` read-then-upsert logic,
   `TwinChat.tsx` and `WorldTabs.tsx` wiring) — confirmed consistent, no dangling references to the
   old inline-expand state or the old flat-upsert bug.
3. Full-file reads of `WorldTabs.tsx`, `WorldExpertiseService.ts`, `WorldsHub.tsx`, and
   `003_twin_world_expertise.sql` performed directly before writing this doc to confirm the code on
   disk matches what's claimed here (not relying on memory of earlier edits).

## Explicit scope boundaries (not done, by design or by sandbox limitation)
- **No world-locking/progression UI.** Per user's explicit decision: all 12 worlds stay accessible.
- **`WorldRoutingService.ts` / `WorldDecisionRouter.ts` remain unwired.** A more complex,
  DB-expertise-driven alternative to the currently-active `twin-prompts.ts` system. Not touched —
  wiring it in would mean running two competing prompt-selection systems simultaneously.
- **Migration `003_twin_world_expertise.sql` not applied.** Must be run manually on the live
  Supabase instance — cannot be applied from this sandbox. Until then, expertise tracking degrades
  gracefully to defaults (score 50, confidence 40) rather than erroring.
- **Vitest test layer still not meaningfully runnable in this sandbox** (pre-existing, documented
  in P0A/B and P0C traces — `vitest.config.ts`'s `include` scope is severely restricted, and even
  that restricted scope hangs past 177s here, likely a real unmocked network call in
  `SICEEngines.test.ts`). Not fixed — changing test config scope is outside P0-D's scope and its
  blast radius on other suites is unknown. No new tests were written for `WorldDetail.tsx` or the
  expertise-tracking fix for the same reason: the harness itself doesn't run in this sandbox.

## What "done" means here
Build passes. Every changed function's actual call sites were traced by grep + full-file read, not
assumed. One additional real bug (DISCONNECT-001) was found during that trace and fixed, not just
the bugs already named in the gap analysis. The gap analysis's own claim about worlds not affecting
Twin behavior was checked and corrected rather than taken at face value. The one item that
genuinely cannot be verified from this sandbox (Supabase migration application) is stated as such,
not glossed over.
