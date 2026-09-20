# BUNDLE_PERF_A3 — A3 Lazy-Load Intelligence Provider

**Track:** A3 (lazy load providers + remove /components route)
**Date:** 2026-09-06
**HEAD before A3:** `9b8aa6c`
**HEAD after A3:** `<filled at commit time>`

---

## 1. Goal

Reduce the size of the **critical-path JS payload** (initial bundle a first-time
visitor must fetch + parse before the landing page is interactive) by:

1. Removing the unused `/components` route and its 9 kB orphan page chunk.
2. Splitting the `ExperienceProvider` out of the entry tree and gating it on a
   real auth session, so the 345 kB intelligence chunk (PersonalContextBuilder
   + TwinStateEngine + ExperienceEngine) is only fetched **after login**.

Constraint: **AIProvider cannot be lazy** because `NovaChat` and `CoreAwakening`
(public, reachable pre-login) call `useAIContext()`. Only `ExperienceProvider`
fits the lazy/conditional pattern — verified via grep before the change (no
production code reads `useExperience()`).

---

## 2. Bundle sizes (vite build output, gzip column = compressed over the wire)

### Before A3 — HEAD `9b8aa6c`

| Asset                                   | Size      | Gzip      |
|-----------------------------------------|----------:|----------:|
| `chunk-intelligence-CNXkatDu.js`        | 345.37 kB |  87.01 kB |
| `index-y4D8NAu6.js` (entry, initial)   | 145.99 kB |  43.81 kB |
| `vendor-react-DIW0lKMw.js`              | 181.75 kB |  57.16 kB |
| `ComponentShowcase-CkTHa4li.js`         |   9.29 kB |   2.44 kB |

**Initial-bundle sum** (entry + react vendor + ComponentShowcase lazy +
everything the entry transitively pulls in for landing render):
≈ **145.99 kB / 43.81 kB gzip** (entry alone — vite reports entry = all code
reachable from `index.html`'s `<script type=module src=...index-*.js>`).

The 345 kB `chunk-intelligence` was reachable from the entry (via the static
`import { ExperienceProvider } from './context/ExperienceContext'` in
`src/App.tsx`), so a cold-load first-time visitor had to fetch it **before**
login.

### After A3 — HEAD `<this commit's parent>`

| Asset                                   | Size      | Gzip      |
|-----------------------------------------|----------:|----------:|
| `chunk-intelligence-D8Ok-Aot.js`        | 345.37 kB |  87.07 kB |
| `index-BmudURyZ.js` (entry, initial)    | 139.84 kB |  41.93 kB |
| `vendor-react-DIW0lKMw.js`              | 181.75 kB |  57.16 kB |
| `ExperienceContext-Bx0shhUS.js` (lazy)  |   6.66 kB |   2.46 kB |
| `ComponentShowcase-CkTHa4li.js`         |       —   |       —   (removed) |

The 345 kB `chunk-intelligence` is **still emitted** (rolldown's heuristic
bundles `PersonalContextBuilder` + `TwinStateEngine` + `ExperienceEngine`
together — they're all called synchronously from inside `ExperienceContext.tsx`,
so they have to live in the same module-graph chunk). What changed is **how
that chunk is referenced**:

- **Before**: `index-*.js` had a direct static import of `ExperienceContext`
  → the 345 kB chunk was on the critical path.
- **After**: `index-*.js` has only a `lazy(() => import('./context/ExperienceContext'))`
  reference. That reference is reached only when `ConditionalExperience` (in
  `src/App.tsx`) renders, which happens only when `useContext(AuthContext)?.session`
  is truthy. Pre-login visitors never trigger the dynamic import — they never
  fetch the 345 kB intelligence chunk.

---

## 3. Concrete delta

| Metric                                | Before       | After        | Δ                  |
|---------------------------------------|-------------:|-------------:|-------------------:|
| Initial entry chunk (`index-*.js`)    | 145.99 kB    | 139.84 kB    | **−6.15 kB raw**   |
| Initial entry chunk gzip              |  43.81 kB    |  41.93 kB    | **−1.88 kB gzip**  |
| Critical-path intelligence (pre-login)| 345.37 kB    |       0 kB   | **−345.37 kB** (cold pre-login visit) |
| `/components` chunk present?          | yes (9.29 kB)| no           | −9.29 kB raw       |
| New lazy chunks introduced            | —            | ExperienceContext (6.66 kB) + chunk-intelligence (deferred) |  |

> The headline number is **the 345 kB intelligence tree stops being on the
> critical path**. A first-time visitor who has never logged in will no longer
> fetch it at all. A returning logged-in user fetches it once, on login, not
> on every page load.

The entry-chunk raw reduction is small (6.15 kB) because the static
`ExperienceProvider` import was only the React component definition itself;
the heavy work was already in `chunk-intelligence` — but the **static
reference** in the entry is what made that chunk eagerly loaded. Removing the
static reference is the actual fix.

---

## 4. Commits in this track

1. `chore(routes): remove /components route (Q6 - not needed)` — `badb7f7`
   - Drops the `/:lang/components` route from `src/App.tsx` and the
     `ComponentShowcase = lazy(...)` declaration. Build chunk
     `ComponentShowcase-CkTHa4li.js` (9.29 kB / 2.44 kB gzip) disappears.
2. `chore(a1-cont): remove ComponentShowcase orphan file (A1-dead-code cont)`
   — `5676db7`
   - Removes `src/pages/ComponentShowcase.tsx` (220 lines) — no remaining
     importer after commit 1 (the only other reference was a JSDoc comment in
     `TwinPresence.tsx`).
3. `refactor(providers): lazy-load ExperienceProvider + conditional on session
   (A3-lazy)` — `875a5ca`
   - `src/App.tsx`: replaces the static
     `import { ExperienceProvider } from './context/ExperienceContext'` with
     `const ExperienceProvider = lazy(() => import(...).then(m => ({ default: m.ExperienceProvider })))`.
   - Adds a `ConditionalExperience` wrapper that calls `useContext(AuthContext)`
     and renders `<ExperienceProvider>` only when `auth?.session` is truthy
     (Suspense fallback renders the children un-wrapped, so pre-login render
     still works).
   - Wraps the `<ExperienceProvider>` slot in `App()` with the new component.

All three commits pass `npm run build` (tsc + vite) and `npm test` (vitest:
67 files / 1042 tests passing).

---

## 5. Caveats / what this change does NOT do

- **AIProvider stays mounted eagerly.** `NovaChat` and `CoreAwakening` are
  public pages reachable pre-login and both call `useAIContext()`, so making
  AIProvider lazy would crash them. AIProvider's own footprint is small
  (mostly supabase wiring), so this is fine.
- **The intelligence chunk is still 345 kB** when it does load — this commit
  doesn't make the intelligence tree smaller, it just defers it. Trimming it
  further requires a separate track (tree-shake SICE, slim down
  PersonalContextBuilder, etc.) — explicitly out of scope for A3 per the
  instruction "ห้ามแตะ SICE core / Auth core / lifecycle".
- **ConditionalExperience is intentionally minimal.** It reads `session` from
  AuthContext via the already-exported `AuthContext` constant (not via
  `useAuth()`) to avoid creating an extra `useAuth` throw-if-no-provider
  contract — `useContext(AuthContext)` returns `undefined` safely when
  AuthProvider is absent in test environments.

---

## 6. Reproduce

```powershell
cd D:\selfprint-v3-react

# baseline (HEAD before A3, commit 9b8aa6c)
git checkout 9b8aa6c
npm run build  # see "Before A3" table

# after A3 (HEAD = current master)
git checkout master
npm run build  # see "After A3" table
```

For a per-route bundle visualisation, install `rollup-plugin-visualizer` (not
added in this commit per instruction "Commit 4 เป็นเอกสารเท่านั้น — ไม่ต้องแก้
production code"). To enable it later, add to `vite.config.ts`:

```ts
import { visualizer } from 'rollup-plugin-visualizer';
plugins: [react(), visualizer({ filename: 'dist/stats.html', gzipSize: true })]
```
