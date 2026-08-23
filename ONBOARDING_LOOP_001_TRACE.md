# ONBOARDING-LOOP-001 — onboarding loop / "ข้ามไม่ได้" fix

Status: Root-caused and build-verified. Found during live testing of the
TWIN-PRESENCE-001 work — this is a pre-existing bug, not caused by this
session's visual-directive changes, but it blocked verifying that work
(HologramBirth archetype color, TwinPresence) since testing never reached
past onboarding.

## Root cause (confirmed by evidence, not guessed)

`lifecycleStore.ts`'s `transitionTo()` and `setTwinCreated()` **never
reject on failure** — both catch internally and do `set({ error: msg })`
instead of throwing. Three call sites treated them as fire-and-forget or
awaited-but-unchecked, so a failed write was silently swallowed and the UI
proceeded as if it had succeeded:

1. `Onboarding.tsx`'s `handleComplete()` — called `transitionTo(userId,
   'ANALYSIS')` without awaiting it, `.catch(err => console.warn(...))`.
2. `CoreAwakening.tsx`'s arrival guard — called `transitionTo(userId,
   'AWAKENING')` the same way.
3. `CoreAwakening.tsx`'s `handleTwinNamed()` — `await setTwinCreated(...)`
   was awaited, but its result was never checked, so even a failed write
   didn't stop the celebration/navigation.

When the backend is slow or times out — confirmed live during testing:
`/api/profile`, `/api/blueprint`, and `/api/stripe/subscription` all
returned 504 Gateway Timeout in the same session, plus a `twins` query
returning 406 — any of these writes can fail. When it does,
`user_lifecycle.status` stays stale in the database (e.g. stuck at
`ONBOARDING`) while the UI has already moved the user forward.

`useRecoveryRoute.ts` only fires **once per login** (a ref guard), but that
guard resets on any fresh app mount — clicking the magic-link email in a
new tab, a mobile browser reloading a suspended tab, or a hard refresh. The
next time it fires, it reads the (stale) DB status and sends the user
straight back to `/onboarding`, where `Onboarding.tsx`'s local `step` state
resets to `'emotion'` — the user has to redo the whole wizard. This
repeats for as long as the write keeps failing, matching exactly what was
reported: "ออนบอร์ดวนซ้ำ ข้ามไม่ได้" (onboarding loops, can't skip past it).

## Fix

Added a small, per-file `withLifecycleRetry()` helper (up to 3 attempts,
600ms apart — deliberately not extracted into a shared module; each file's
copy is intentionally scoped only to that file's exact call sites, per
project "no premature abstraction" rule) and applied it at all three sites,
with different UX per context:

**`Onboarding.tsx` (`handleComplete`)** — blocking, user-visible. Retries
automatically first; if still failing, shows a dedicated retry screen
("บันทึกความคืบหน้าไม่สำเร็จ… ลองอีกครั้ง") instead of silently navigating
to Core Awakening on an unconfirmed write. Never advances on a write we
don't know succeeded.

**`ClaimAccount.tsx`** — added a `useRef` guard so its render-time
`if (session) { onDone(); }` branch (which runs `handleComplete()`) can
only fire once, even if `session`'s object reference changes while the
first async attempt is still in flight (token-refresh ticks were a
plausible source of duplicate concurrent writes here).

**`CoreAwakening.tsx` arrival guard (`transitionTo('AWAKENING')`)** —
retries automatically, but stays non-blocking: this is background arrival
bookkeeping, not a user-gated action, and `setTwinCreated()` below sets
status straight to `TWIN_ALIVE` regardless of whether this intermediate
step landed, so a failure here is logged (loudly) rather than shown.

**`CoreAwakening.tsx` `handleTwinNamed()` (`setTwinCreated`)** — retries
automatically. If it still fails after retries: the Twin record itself was
already created successfully (`createTwinInDatabase`, inside
`initializeTwin()`, which ran earlier in the same function and would have
thrown already if *it* failed) — only the lifecycle-status write failed —
so the celebration is allowed to proceed (blocking a real Twin's birth
celebration over a background sync failure would be worse UX), but the
failure is logged loudly, not silently dropped like before.

**`PendingOnboardingSaver.tsx`** — separate but same-class bug, found
during this investigation: it POSTs to `/api/profile` then `/api/blueprint`
(the exact two endpoints seen 504ing live) and was clearing its
`localStorage` pending-data key regardless of whether either call actually
succeeded — a 504 is still a resolved (non-throwing) `fetch()`, so the
file's own comment ("will retry next session") was never true; data could
be silently lost on a single bad request. Now checks `response.ok` on both
and only clears the key once both are confirmed to have succeeded.

## What's still open (named, not silently left)

Even with retries, a **sustained** backend outage can still exhaust all
attempts and leave `user_lifecycle.status` genuinely stale. The retry logic
narrows the window this can happen in (from "any single slow request" to
"multiple consecutive slow requests across ~2 seconds"), but doesn't
eliminate it structurally. A complete fix means `useRecoveryRoute`/lifecycle
recovery should fall back to checking for an actual `twins` row (ground
truth) when `status` looks inconsistent with it, instead of trusting
`status` alone as the single source of truth — that's squarely **Entry
Resolver / Resume Integration** work (the next planned phase), not
something to bolt on inside this fix.

## Verification performed
1. `npm run build` — clean, `✓ built in 23.19s`, 0 TypeScript errors.
2. Traced the exact failure chain against the live console errors captured
   during testing (504s on `/api/profile`, `/api/blueprint`,
   `/api/stripe/subscription`; a 406 on a `twins` query) rather than
   guessing at a plausible-sounding cause.
3. Confirmed `useRecoveryRoute.ts`'s once-per-login guard resets on fresh
   mount (not on every render) before concluding it was the redirect
   mechanism responsible, rather than assuming.
4. Confirmed `transitionTo()`/`setTwinCreated()` genuinely never reject
   (read `lifecycleStore.ts` in full) before designing the retry+check
   pattern — awaiting them without checking `store.error` afterward would
   still silently succeed-looking on failure.

## Not addressed (separate, pre-existing, out of scope here)
- The `world_stats` table's missing `last_accessed` column (production
  schema mismatch, PGRST204) — real, confirmed, but unrelated to this loop;
  affects world-visit analytics only, not routing.
- The specific `twins?select=...` query returning 406 — over 30 call sites
  reference the `twins` table; the exact one responsible wasn't
  identified from the truncated console output. Needs either the full
  query string or a live repro to pin down.
- Whether `/api/profile`/`/api/blueprint`/`/api/stripe/subscription`'s 504s
  are a live, ongoing backend issue or were transient during the test
  session — not something diagnosable from static code alone; worth
  retesting now that the loop itself is fixed, and checking
  Supabase/Vercel status if 504s persist.
