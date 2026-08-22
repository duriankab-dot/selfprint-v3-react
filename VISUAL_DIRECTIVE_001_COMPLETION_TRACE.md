# VISUAL-DIRECTIVE-001 — Merge duplicate Hub system into worlds.ts

Status: Complete, build-verified. Scope: narrow, user-approved merge only — the
larger UNIFIED-directive items below remain explicitly out of scope for this pass.

## Why

Reported as a finding in P0-H (not fixed at the time, per project convention —
"บอก ไม่ใช่แก้เอง"): a second, older, fully-built "12/11 Hub" environment/mood/
soundscape system existed in parallel with the real `worlds.ts`/`WorldContext`
system, mounted globally (`EnvironmentProvider` in App.tsx, ticking every 60s)
but unreachable by any live user action — traced end to end:
- `HubContext.tsx`'s `switchHub()` (the only way its state changes) is called
  only from `ExperienceContext.tsx` (auto-apply, itself unused in a live route)
  and `HubSwitcher.tsx` — which is imported only by `Chat.tsx` (commented out of
  `App.tsx`'s routes) and `ChatPage.tsx` (never registered as a route at all).
- Confirmed NOT a memory/growth-tracking system — `hubHistory` is ephemeral
  React state only, never persisted to Supabase.

User's uploaded `SELF_MASTER_VISUAL_INTELLIGENCE_SMART_ENTRY_UNIFIED_ARCHITECTURE_
DIRECTIVE.md` §38 ("World State — Single Source of Truth") directly forbids this:
UI/AI/Visual must never use different world ids. §50 forbids duplicate engines —
extend/integrate, never build a parallel system. User's explicit instruction:
**"รวมเข้ากับระบบ worlds.ts ตัวจริง"** (merge into the real worlds.ts system) —
not delete.

## What was merged

The duplicate system's *live, impactful* piece was `EnvironmentContext.tsx` →
`EnvironmentEngine.ts` → `SoundscapeEngine.ts`, all keyed to `HubContext`'s
15-id `Hub` taxonomy. Rekeyed all three to the real 12-id `WorldId` taxonomy
(`src/constants/worlds.ts`) and the real `WorldContext.currentWorld` (Supabase-
persisted, updated by real navigation in `WorldDetail.tsx`/`TwinChat.tsx`).

**`src/lib/experience/SoundscapeEngine.ts`**
- `matchHubs?: Hub[]` → `matchHubs?: WorldId[]` on `SoundscapeConfig`.
- `recommend(hub: Hub, ...)` → `recommend(worldId: WorldId, ...)`.
- All 11 `matchHubs` array entries across the 24-item `SOUNDSCAPE_LIBRARY`
  remapped by closest concept:

  | Old Hub id | New WorldId |
  |---|---|
  | career | career |
  | decision | decision |
  | learning | growth |
  | money | wealth |
  | creativity | growth |
  | impact | purpose |
  | spirituality | purpose |
  | identity | self |
  | relationship | relationship |
  | health | wellbeing |
  | activities | life |
  | ai-twin | dropped (no real-world equivalent — not force-mapped) |

**`src/lib/experience/EnvironmentEngine.ts`**
- `EnvironmentInput.hub: Hub` → `EnvironmentInput.world: WorldId`.
- `compute()` destructures/passes `world` instead of `hub` to
  `soundEngine.recommend()`. `LightingEngine`/`ParticleSystemEngine`/
  `TwinStateEngine` were already keyed only to `period`/`mood` — untouched.

**`src/context/EnvironmentContext.tsx`**
- `useHub().currentHub` → `useWorld().currentWorld`, with `?? 'self'` fallback
  since `currentWorld` is nullable (no world selected outside
  `/worlds/:worldId`).
- `engine.compute({ hub: currentHub, ... })` → `engine.compute({ world:
  worldForEnv, ... })`; dependency arrays (`useCallback`, both `useEffect`s)
  updated from `currentHub`/`mood` to `worldForEnv`/`mood`.

**Not touched:** `HubContext.tsx` itself (still used by `ExperienceContext.tsx`,
`HubSwitcher.tsx`, `hub-themes.css`, `Chat.tsx`, `ChatPage.tsx`) — per "merge,
don't delete." Deciding whether those remaining consumers get migrated or
removed is a separate, not-yet-requested decision.

## Verification performed
1. `npm run build` — clean, `✓ built in 23.50s`, 0 TypeScript errors.
2. Grepped every `.recommend(` / `EnvironmentEngine(` / `engine.compute(` call
   site in `src/` to confirm the only real instantiation is
   `EnvironmentContext.tsx` — ruled out `SICEOrchestrator.ts`'s unrelated
   same-named `EnvironmentEngine` class and `WorldContextAdapter.ts`'s
   unrelated `adaptEnvironmentEngine` function as false leads (already
   confirmed unrelated during P0-H investigation).
3. Confirmed no test file imports the visual `EnvironmentEngine`/
   `SoundscapeEngine` directly (only the unrelated SICE engine has tests) —
   no test breakage from the type/param rename.
4. Read `WorldContext.tsx`'s actual exported shape (`currentWorld: WorldId |
   null`, `useWorld()`) before wiring, rather than assuming.

## Explicit scope boundaries (not done this pass)
- `HubContext.tsx`/`hub-themes.css`/`ExperienceContext.tsx`/`HubSwitcher.tsx`
  themselves not touched — still exist, still unreachable from any live route,
  same as before. Not deleted per user's "merge" instruction, but also not
  actively migrated to `WorldId` since nothing reachable calls them.
- `WorldEnvironment.tsx`/`useWorldAmbientTone.ts` (built in P0-H) were **not**
  refactored to consume `EnvironmentEngine`'s richer computed output (lighting/
  particles/twinState CSS vars) — they remain independent, simpler
  implementations. This is a real open question, flagged here rather than
  decided silently: `EnvironmentEngine` now computes a per-world soundscape,
  lighting, particles, and Twin posture/expression state that isn't visible
  anywhere in the UI yet (the CSS vars it injects onto `<html>` have no reader).
  Wiring `WorldDetail.tsx`/`WorldEnvironment.tsx` to actually consume those vars
  would be the natural next step to make this merge deliver visible value, not
  just remove the duplication — not started, needs a decision first.
- Full UNIFIED-doc scope (Visual DNA, AI-generated visual parameters, Twin
  placement, World Transitions, Entry Resolver, Smart Entry, PWA entry) —
  unchanged, still not started.

## What "done" means here
The duplicate-taxonomy problem flagged in P0-H is resolved for the one piece
that was actually live: `EnvironmentContext`'s 60-second tick now computes
against the real `WorldId` the user is actually in, not an unreachable `Hub`.
Per §38, there is now one world-id source of truth feeding this engine.
`EnvironmentEngine`'s output itself is not yet visibly wired into any page —
that gap is named above, not hidden.
