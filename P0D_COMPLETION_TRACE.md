# P0-D Completion Trace — World Registry & Routing

Status: **Closed.** Original scope (below) plus a second round of bugs found only through
live production testing on selfprint.one (not from build-passing alone) — user confirmed all
fixed and working in production before closing.

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

**✅ Applied.** Could not be run from this sandbox — user ran it manually against production
(along with `supabase-schema.sql` and migrations 001/002/004, since the whole core schema was
missing; see "Post-trace fixes" below) and confirmed via direct SQL query that the table exists.

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
- **Migration `003_twin_world_expertise.sql`** — applied manually by the user against production;
  confirmed via direct SQL query (see "Post-trace fixes" below).
- **Vitest test layer still not meaningfully runnable in this sandbox** (pre-existing, documented
  in P0A/B and P0C traces — `vitest.config.ts`'s `include` scope is severely restricted, and even
  that restricted scope hangs past 177s here, likely a real unmocked network call in
  `SICEEngines.test.ts`). Not fixed — changing test config scope is outside P0-D's scope and its
  blast radius on other suites is unknown. No new tests were written for `WorldDetail.tsx` or the
  expertise-tracking fix for the same reason: the harness itself doesn't run in this sandbox.

## Post-trace fixes — found only via live production testing, not build-passing

The bugs below were **not** in the original P0D_GAP_ANALYSIS.md scope. They surfaced only
because the user tested selfprint.one live in the browser (DevTools open) after each deploy and
reported exact console errors/behavior, rather than accepting "build passed" as proof of working.

**CRITICAL — production DB missing the entire core schema.** `twins`, `user_lifecycle`, and 9
other core tables had zero `CREATE TABLE` anywhere ever applied to production (`relation "twins"
does not exist`). Root cause: two competing Supabase migration conventions exist in this repo
(`migrations/`, numbered, used by this session's fixes vs `supabase/migrations/`, Supabase-CLI
dated-filename convention, already applied with a different schema for `world_preferences`/
`analytics_events`). Fixed: added `migrations/004_user_lifecycle.sql` (table didn't exist at
all despite being the core lifecycle-state table), removed the dead/never-applied
`twin_id`-keyed `world_preferences`/`analytics_events` definitions from
`src/services/supabase-schema.sql` (colliding with the real, already-live `user_id`-keyed
tables), fixed `CoreAwakeningService.ts`'s insert to match the real schema. User ran
`supabase-schema.sql` + migrations 004→003→001→002 against production directly and confirmed
all tables exist via SQL query. **Resolved and confirmed live.**

**ROUTER-001 — app crashed to a blank white screen on every load.**
`useNavigate() may be used only in the context of a <Router> component`. `<Router>` only wrapped
`<Routes>`, not `RecoveryRouteHandler`/`TwinEvolution`/etc. rendered above it. Fixed by moving
`<Router>` to wrap the entire provider tree in `App.tsx`.

**ROUTELOOP-001 / ROUTELOOP-002 — infinite redirect loops, all internal links landing on the
wrong page.** Every real route lives under `/en` or `/th` (no bare route is registered
anywhere) — a bare path anywhere hits the catch-all and bounces to `/en/`. Found in two waves:
first pass grepped only `navigate()` calls (~18 files, fixed via a new `useLangNavigate()`
wrapper hook used as a drop-in `useNavigate()` replacement); a second, more thorough pass (after
the user reported all 5 bottom-nav buttons landing on dashboard) grepped `<Link>`, `<NavLink>`,
`<Navigate>`, `redirectTo:`, and `window.location.href =` across all of `src/` and found 10 more
sites the first pass missed (`BottomNav.tsx`, `Footer.tsx`, `FeatureMenu.tsx`, `ChatPage.tsx`,
`WorldDetail.tsx`, `Login.tsx`, `ProtectedRoute.tsx`, `AuthContext.tsx`'s OAuth `redirectTo`,
2 in `App.tsx`), plus a third pass on `usePricing.ts`, `PricingSuccessPage.tsx`, and
`PricingPage.tsx`.

**LIFECYCLE-002 — dashboard bounced back to onboarding forever on every refresh.**
`Onboarding.tsx`'s completion handler never called `transitionTo(userId, 'ANALYSIS')`, so
`user_lifecycle.status` stayed `'ONBOARDING'` in the DB permanently after a user finished
onboarding — `useRecoveryRoute` was technically correct to keep bouncing back to `/onboarding`
per the (stale) persisted status. Fixed by adding the missing transition call.

**LOOP-002 — onboarding/analysis fought each other mid-session** (skip a question, get asked
again, re-analyze, back-and-forth). `useRecoveryRoute` and `Onboarding.tsx`'s own re-entry guard
both re-ran on every `lifecycleStore.status` change instead of once per login. Fixed with
`useRef` "already checked" guards.

**SCHEMA-TS-001 — Vercel build/type errors, likely cause of `/api/profile`, `/api/blueprint`,
`/api/stripe/subscription` 504s.** `api/_utils/database.types.ts` was missing
`Relationships`/`Views`/`Functions` keys required by `@supabase/supabase-js` 2.112.x's type
contract, silently collapsing every Supabase query row type to `never`. Never surfaced in local
`npm run build` because `tsconfig.json`'s project references never include `api/`. Fixed;
verified via a standalone `tsc --noEmit` pass matching the user's pasted Vercel build log
exactly (8 errors → 0).

**BOTTOMNAV-001 / CHATROUTE-001 — the "AI ฝาแฝด" (AI Twin) button opened the wrong assistant.**
Every "talk to your Twin" entry point in the app (bottom nav, top nav, footer, feature menu,
dashboard's Living Twin card, Today section, Activities, Explore) pointed at `/chat`, which
redirects to `/chat/nova` — `NovaChat.tsx`, the pre-Twin discovery guide, gated on
`isNovaActive`. For any user whose Twin already exists (the normal case once these buttons are
visible), `isNovaActive` is false and NovaChat rendered a dead-end stub with no way forward — a
button literally labeled "AI Twin" opened the wrong page. Fixed by pointing all of these
directly at `/chat/twin` (`TwinChat.tsx`), which has its own correct guard for the rare case a
Twin doesn't exist yet. Also moved the bottom-nav Twin tab to the center slot (position 3 of 5)
per its role as the primary CTA.

Found in the same pass: none of the several call sites that pass a `{ state: { initialMessage }
}` guided prompt (Today section's Gratitude Practice, Morning Intention, etc.; Activities;
Explore's daily question / hexagram reflection) were ever actually read by any chat page — the
prompt silently vanished regardless of which page it landed on, and the user got dropped into an
empty chat instead of the activity they picked. Fixed by wiring `location.state.initialMessage`
into `TwinChat.tsx` with an auto-send-once-on-arrival effect (ref-guarded against double-fire).

**TWINCHAT-HOOKS-001 — pre-existing Rules of Hooks violation in `TwinChat.tsx`.** Both
`useEffect` calls sat *after* the `if (!twin) return` / `if (!session) return` early-return
guards. If `twin`/`session` ever flip from null to defined between renders of an already-mounted
instance (e.g. `TwinContext` finishes its async load slightly after this page mounts), React
would see more hooks called on that render than the previous one and throw "Rendered more hooks
than during the previous render." Found while wiring the `initialMessage` fix above (adding a
third hook into the same already-conditionally-reached region made the existing pattern obvious
enough to flag). Fixed in the same round: both effects moved above the guards, each guarding its
own `twin`/`session` access internally; the two early-return guards moved below, after all
hooks, immediately before the first plain function definition.

Everything in this section was fixed, `npm run build` verified clean after each round, and
confirmed working by the user testing selfprint.one live in production (not just a passing
build) before this trace was closed.

## What "done" means here
Build passes. Every changed function's actual call sites were traced by grep + full-file read, not
assumed. One additional real bug (DISCONNECT-001) was found during that trace and fixed, not just
the bugs already named in the gap analysis. The gap analysis's own claim about worlds not affecting
Twin behavior was checked and corrected rather than taken at face value. The one item that
genuinely cannot be verified from this sandbox (Supabase migration application) is stated as such,
not glossed over.
