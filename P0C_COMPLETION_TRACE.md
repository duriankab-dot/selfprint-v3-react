# P0-C — Intelligent Twin Birth: Trace & Verification
**Date:** August 22, 2026
**Method:** Same standard as the P0-A/P0-B correction — every function traced by
grep for real call sites, every field checked against actual runtime shape, not
inferred from type declarations or file existence.

---

## GAPS ADDRESSED (from P0C_GAP_ANALYSIS.md, which was accurate)

### Gap #1 — Twin birth used hardcoded personality
**Was:** `primaryArchetype: profile.primaryArchetype || 'Guide'`,
`secondaryArchetype: profile.secondaryArchetype || 'Companion'`. Neither
`'Guide'` nor `'Companion'` is a valid value in the 18-value `Archetype` enum
(`TwinContext.ARCHETYPES`) — this wasn't just "not grounded," it was writing
invalid data that only avoided a type error because the call site passed
`profile: any`.

**Now:**
- `primaryArchetype` = `calculateInitialDisciplines(birthDate).prototypeCore`,
  lowercased. This is the same deterministic numerology → Jungian-archetype
  mapping already used for Analysis (`src/lib/astrology.ts`), computed from
  the user's real birth date. Verified the 12 `PROTOTYPE_CORE_MAP` values
  lowercase to an exact 1:1 match with the 12 base `Archetype` values.
- `secondaryArchetype` = keyword match against the essence's own text
  (`personalIntelligence.recommendedAction` + `.insights`), always a
  different, always-valid archetype — grounded in real SICE output, not
  invented.

### Gap #2 — Twin didn't get grounded SICE baseline
**Was:** all 12 `twin_sice_scores` rows inserted with `contribution_score: 50`
flat, regardless of what the orchestration actually found. Also found
**NAME-001**: the hardcoded engine-name list used `'MemoryManager'` and
`'DecisionIntelligenceEngine'`, but the real engines (confirmed by reading
each engine's `super()` call in `src/services/sice/engines/*.ts`) are named
`'MemoryManagerEngine'` and `'DecisionIntelligenceEngineAdapter'` — 2 of 12
names silently didn't match anything.

**Now:** baseline scores read `essence.sice_results[].confidence` per engine,
keyed by the *real* 12 engine names (`REAL_SICE_ENGINE_NAMES`, sourced by
reading the actual engine constructors, not assumed). Falls back to 50 only
for an engine that genuinely has no score (e.g. it errored during
orchestration) — not as the blanket default.

### Gap #3 — Personal intelligence essence not linked to Twin
**Was already true before this session** that `initializeTwin()` links
`awakening_essence.twin_id` and `personal_contexts.awakening_essence_id` — but
the UI never called `initializeTwin()` at all (see below), so this linking
never ran in production. Now it does, via the rewiring below.

### Gap #4 — Twin's first response not informed
**Was:** birth memory was a fixed string (`"ฉันเกิดมาในชื่อ X ฉันอยู่ที่นี่..."`),
and the UI's celebration screen showed a hardcoded quote regardless of what
was actually known about the user.

**Now:** birth memory content includes `personalIntelligence.insights[0]` when
present. The celebration screen (`CoreAwakening.tsx`) now shows that same
grounded insight instead of the generic quote — Gap #4 explicitly required
this to reach the UI, not just the database, so both were changed.

---

## THE DEEPER BUG THIS UNCOVERED: the essence pipeline was never called at all

Before this session, `startAwakening()` (runs the 12 SICE engines, persists
`awakening_essence`) and `initializeTwin()` (the function all 4 gaps above are
fixes *inside*) had **zero production callers** — grep confirmed both were
referenced only from test files. `CoreAwakening.tsx` called a different,
shallower function, `saveTwinProfile()`, which never touched essence at all.

Fixing Gaps #1-4 inside `initializeTwin()` would have been dead work without
also rewiring `CoreAwakening.tsx` to actually call `startAwakening()` +
`initializeTwin()`. That rewiring is the majority of this session's diff.

**`saveTwinProfile()` was removed** (not left as dead code) once its one
caller was gone — it's what wrote the invalid `'Guide'`/`'Companion'` values
in the first place.

---

## BUG FOUND DURING THE REWIRE: DUP-001 — double Twin creation

While wiring `CoreAwakening.tsx` to use the essence-grounded path, tracing
what happens *after* Twin creation surfaced another real bug, independent of
the 4 gaps: `TwinContext.createTwin()` unconditionally calls
`createTwinInDatabase()` — it always **inserts**. The old code called it
*after* `saveTwinProfile()` had already inserted the Twin. `twins.user_id` has
a `UNIQUE` constraint (confirmed in `supabase-schema.sql`), so the second
insert would fail — and `createTwin()`'s catch block swallows the error into
local state without throwing, so the ceremony appeared to succeed while
`TwinContext.twin` silently stayed `null`.

**Fix:** added `hydrateTwin(userId, twin)` to `TwinContext` — sets local state
from a record that's already persisted, without inserting again.
`CoreAwakening.tsx` now calls this instead of `createTwin()`.
`createTwin()` itself was left in place (public Context API, not an
internal-only helper) but is now unused in production — flagged with a
comment rather than silently left unexplained or unilaterally deleted, since
removing public API surface is a bigger call than removing an internal dead
helper.

---

## BUILD VERIFICATION (re-run after each change, not just once at the end)

```
✓ built in 22.02s   — after Gap #1/#2 (archetype + SICE score grounding)
✓ built in 25.58s   — after adding hydrateTwin() to TwinContext
✓ built in 23.51s   — after rewiring CoreAwakening.tsx to call initializeTwin()
✓ built in 24.53s   — after removing saveTwinProfile()
✓ built in 25.62s   — after flagging createTwin() as now-unused
```

## TRACE VERIFICATION (every new/changed call site, grepped and read)

```
startAwakening()    → called by: CoreAwakening.tsx handleIntroComplete()
                       (fired early, in background, during birth animation)
initializeTwin()    → called by: CoreAwakening.tsx handleTwinNamed()
hydrateTwin()       → called by: CoreAwakening.tsx handleTwinNamed()
                       (only after initializeTwin() succeeds)
createTwin()        → zero production callers (confirmed, flagged in-code)
saveTwinProfile()   → removed; zero references outside comments/old docs
```

---

## WHAT WAS DELIBERATELY NOT TOUCHED (scope boundary, stated explicitly)

`checkReadyForAwakening()`, `completeCoreAwakening()`, `notifyAwakening()`
remain uncalled from production UI, same as before this session. They are not
part of Gap #1-4. Wiring them in was judged out of scope for this pass:

- `checkReadyForAwakening()`'s re-awakening guard is not strictly needed right
  now because two other layers already prevent it: the LIFE-001 fix in
  `CoreAwakening.tsx` stops a `TWIN_ALIVE` user's status from being downgraded
  on arrival, and `useRecoveryRoute` redirects `TWIN_ALIVE` users away from
  `/core-awakening` before they'd reach the ceremony. `twins.user_id UNIQUE`
  is a third backstop even if both of those were bypassed.
- `completeCoreAwakening()` (writes a completion memory + analytics event) and
  `notifyAwakening()` (browser notification) are enhancements, not required
  by any of the 4 stated gaps. Not wiring them is a scope decision, not an
  oversight — flagging it here so it isn't mistaken for "done."

## TEST LAYER — same unresolved limitation as P0-A/P0-B

`vitest.config.ts`'s `include` still only covers 2 files project-wide, and
running even that scope previously hung past 177s in this environment. This
was not re-attempted for P0-C — it's the same pre-existing infrastructure gap
documented in `P0A_P0B_COMPLETION_TRACE.md`, not something new to this phase,
and still out of scope to silently fix.

---

## HONEST STATUS

| Layer | Status | Evidence |
|-------|--------|----------|
| TypeScript build | ✅ Verified | 5 separate passing builds, one per change |
| Archetype grounding (Gap #1) | ✅ Verified by trace | birth-date-deterministic + essence keyword match |
| SICE score grounding (Gap #2) | ✅ Verified by trace | real engine names confirmed from source, not assumed |
| Essence linkage (Gap #3) | ✅ Verified by trace | now actually runs, confirmed via call-site grep |
| Grounded first response (Gap #4) | ✅ Verified by trace | reaches both DB memory and celebration UI |
| DUP-001 (found during rewire) | ✅ Fixed | hydrateTwin() added, traced as sole caller path |
| Unit tests | ⚠️ NOT verified | same infra gap as P0-A/B, not re-investigated here |
| E2E | ⚠️ Not attempted | out of scope for this pass |

P0-C's 4 stated gaps are closed and traced, not just built. The essence
pipeline that used to be test-only code now runs in production. What is
**not** claimed: automated test proof (same known limitation as P0-A/B), and
`checkReadyForAwakening()`/`completeCoreAwakening()`/`notifyAwakening()`
remain explicitly out of scope, not silently done.

---

**Traced by:** Senior AI Full-Stack Engineer
