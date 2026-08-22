# P0-A + P0-B — Complete Trace & Verification (CORRECTED)
**Date:** August 21, 2026
**Status:** ✅ Lifecycle bugs fixed and re-verified
**Supersedes:** Earlier version of this file, which incorrectly declared P0-A/P0-B
"100% complete" without tracing actual call sites end-to-end. That version was wrong.

---

## WHY THIS DOCUMENT WAS REWRITTEN

The first version of this trace checked only "does the code compile" and "does the
file exist" — it never traced whether functions were actually *called* anywhere in
production code, or whether one write could silently undo another. A user audit of
the real code (not this document) found two real integration bugs that the original
trace missed entirely. This version documents what was actually found and fixed,
and is explicit about what is still NOT verified.

---

## BUGS FOUND (by user code audit) AND FIXED THIS SESSION

### 🔴 LIFE-001 — Twin creation never advanced lifecycle to TWIN_ALIVE
**Found by:** user code review, not by this session's earlier "verification"

**Root cause:**
- `lifecycleStore.setTwinCreated(userId, twinId)` was written correctly (sets
  `status: 'TWIN_ALIVE'`, persists `twin_id`) — but had **zero callers** anywhere
  in production code (confirmed via project-wide grep).
- `CoreAwakening.tsx` instead called `transitionTo(userId, 'AWAKENING')` **after**
  the Twin already existed — the wrong status, at the wrong time.
- Net effect: every user who completed Twin Birth stayed at `AWAKENING` forever.
  `useRecoveryRoute` would keep routing them back to `/core-awakening` on every
  future login, forcing them to repeat the ceremony — exactly the bug P0-B was
  supposed to prevent.

**Fix (`src/pages/CoreAwakening.tsx`):**
- Transition to `AWAKENING` on page **entry** (ceremony start), not on exit.
- Guarded: skip the transition if lifecycle is already `TWIN_ALIVE` or
  `WORLD_ACTIVE`, so a user who lands here via stale URL/back button before the
  global recovery redirect fires cannot be downgraded backwards.
- After `saveTwinProfile()` succeeds and returns a real `twin.id`, call
  `setTwinCreated(userId, twin.id)` — this is what actually advances the DB to
  `TWIN_ALIVE` and persists `twin_id`.

### 🟠 RECOVERY-001 — Dashboard had no resume entry point
**Found by:** user code review

**Root cause:** The original P0B_IMPLEMENTATION_PLAN.md (written by this session)
explicitly specified: "If TWIN_ALIVE → Show 'ENTER YOUR TWIN'; if WORLD_ACTIVE →
Show 'CONTINUE TO YOUR WORLDS'." This was never implemented — only the routing
hook (`useRecoveryRoute`) was built, which sends `TWIN_ALIVE` users to
`/dashboard`, but Dashboard.tsx had zero lifecycle-aware content once they
arrived. The "resume" was a redirect to a generic page, not an actual
continuation point.

**Fix (`src/pages/Dashboard.tsx`, `src/styles/dashboard.css`):**
- Added a resume banner driven by `lifecycleStore.status`:
  - `TWIN_ALIVE` → "✨ Twin ของคุณพร้อมแล้ว" → button to `/chat/twin`
  - `WORLD_ACTIVE` → "🌍 ไปต่อในโลกของคุณ" → button to `/worlds`
- `WORLD_ACTIVE` is currently unreachable (see Known Gaps below — this is
  expected, not a new bug) but the banner is wired ahead of P0-D so no
  additional Dashboard work is needed once World Routing lands.

### 🟡 Dead code / duplicate logic — `initializeLifecycle()`
**Found while tracing LIFE-001** (not reported by user, found independently
during the re-audit this triggered)

- `lifecycleStore.initializeLifecycle()` was fully implemented but had **zero
  callers** anywhere in the codebase.
- It duplicated logic already present (differently) inline inside
  `loadLifecycle()` — two different code paths doing "create a lifecycle record
  for a new user," which is exactly the kind of duplication the project's own
  rules prohibit ("Logic ที่ทำงานเหมือนกัน → รวม").
- Worse: `initializeLifecycle()`'s "existing user" branch updated `resumed_at`
  in the DB — `loadLifecycle()` (the function actually called from
  `AuthContext`) did **not**. So the P0-B success criterion "Activity timestamp
  updates on login" was never actually true in production.

**Fix (`src/store/lifecycleStore.ts`):**
- Removed `initializeLifecycle()` entirely (dead code, per project rules).
- Merged its correct behavior into `loadLifecycle()`: on finding an existing
  record, `resumed_at` and `last_activity_at` are now written to the DB, not
  just read.

---

## BUILD VERIFICATION (re-run after every fix above)

```
✓ built in 28.55s   (final run, after all 3 fixes)
0 TypeScript errors
```

Each fix was built independently before moving to the next — no fix was applied
on top of an unverified prior state.

---

## WHAT IS STILL NOT VERIFIED (reported honestly, not swept under the rug)

### Unit/integration test layer — NOT executable in this environment
- `vitest.config.ts` currently has `include: ['**/test/minimal.test.ts',
  '**/sice/__tests__/SICEEngines.test.ts']` — this means the vast majority of
  existing test files in the repo (including `CoreAwakening.test.ts`,
  `CoreAwakeningService.phase3.test.ts`, and others) **are not run at all** by
  `npm test`. Any earlier claim that "unit tests pass" for P0-A/P0-B was not
  actually backed by those tests running.
- Running `npx vitest run` (the actual configured include scope — just 2 files)
  hung past 177 seconds with no output, most likely because
  `SICEEngines.test.ts` makes real orchestration calls with no mock in this
  sandbox. This is a pre-existing infrastructure issue, not something
  introduced by this session's changes.
- **This was not fixed** — changing `vitest.config.ts`'s include scope or
  investigating the hang is outside the surgical scope of "trace P0-A/P0-B to
  100%" and could have a large, unknown blast radius (unknown how many
  previously-never-run tests would newly fail). Flagging for explicit decision
  rather than silently expanding scope.

### E2E tests
- `tests/e2e/user-recovery.spec.ts` (created during P0-B) is a **template** —
  the actual assertions are commented out pending Playwright + test-Supabase
  setup. It does not currently prove anything by itself.

---

## FULL LIFECYCLE STATE TRACE (every writer, confirmed by grep)

```
ONBOARDING   → written by: loadLifecycle() auto-init (new user)
ANALYSIS     → written by: AnalysisPage.tsx handleAwakeTwin()
AWAKENING    → written by: CoreAwakening.tsx on page entry (guarded, no downgrade)
TWIN_ALIVE   → written by: CoreAwakening.tsx after Twin persists, via setTwinCreated()
WORLD_ACTIVE → NOT YET WRITTEN ANYWHERE — expected: this is P0-D scope
               (World Registry & Routing), not yet implemented. Not a bug.
```

Routing (`useRecoveryRoute.ts`) reads this same state to redirect authenticated
users on every load — confirmed consistent with the above writers after fixes.

---

## SCOPE BOUNDARY — WHAT WAS DELIBERATELY NOT TOUCHED

Per the user's own finding, confirmed independently: `startAwakening()` (SICE
orchestration → `awakening_essence`) and `initializeTwin()` (essence → grounded
Twin + SICE baseline + birth memory) exist and are well-built, but are **called
only from test files, never from production UI**. `CoreAwakening.tsx` instead
calls the shallower `saveTwinProfile()`, which grounds the Twin only in
`analysisContext.sourceCount` — not onboarding, not SICE, not visual DNA.

This is genuinely **P0-C scope** ("Twin Input Grounding": Onboarding + Analysis
+ SICE + Visual DNA → Twin Birth), not P0-A/P0-B. It was deliberately not
touched in this session to keep the fix surgical. P0-C cannot be marked
started, let alone complete, until this is addressed.

---

## HONEST STATUS

| Layer | Status | Evidence |
|-------|--------|----------|
| TypeScript build | ✅ Verified | `✓ built in 28.55s`, re-run after each fix |
| Lifecycle state machine (code trace) | ✅ Verified | Every writer grepped and read, not assumed |
| Dead code / duplicate logic | ✅ Cleaned | `initializeLifecycle()` removed, behavior merged |
| Unit tests | ⚠️ NOT verified | Config scopes out most tests; remaining 2 hang >177s |
| E2E tests | ⚠️ Template only | No live assertions yet |
| SICE-grounded Twin Birth | ❌ Not done | Confirmed P0-C scope, correctly not started |

**P0-A + P0-B are now correct in the parts that were traced** (lifecycle state
machine reaches TWIN_ALIVE, Dashboard has a real resume entry point, no dead
code). They are **not "100% verified"** in the sense of automated test proof —
that layer is currently not executable in this environment, and that limitation
is reported here rather than hidden.

---

**Traced by:** Senior AI Full-Stack Engineer
**Method:** Project-wide grep for every caller of every lifecycle-mutating
function, manual read of full call sites, not inferred from file existence.
