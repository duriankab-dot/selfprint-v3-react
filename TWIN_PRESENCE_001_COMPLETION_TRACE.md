# TWIN-PRESENCE-001 — Twin Visual DNA + "Twin appears in World"

Status: First real pass shipped and build-verified. This is a scoped slice of the
UNIFIED doc's much larger Phase 8/35/36/34 scope (user explicitly chose this
starting point over Entry Resolver / World Transitions — see prior turn).

## Also included in this pass: EnvironmentEngine wired into WorldDetail (for real)

Before this, `EnvironmentEngine`'s output (lighting, particles, soundscape,
time-of-day) was computed correctly every 60s but had zero consumers — flagged
as an open finding in VISUAL-DIRECTIVE-001. Closed it:

- **`WorldEnvironment.tsx`** now reads `useEnvironment()` and applies:
  - `lighting.cssVars['--lighting-filter']` (hue-rotate + saturate by time of
    day) to the whole background layer.
  - `timeOfDay.cssVars['--tod-bg-tint']` as a soft overlay gradient.
  - `timeOfDay.energyLevel` / `particles.speed` now drive the SVG pattern's
    spin/pulse/drift animation durations (previously hardcoded 90s/6s/10s).
- **`WorldDetail.tsx`** now shows the real soundscape recommendation
  (`environment.soundscape.labelThai`) on the sound toggle instead of a
  generic label, and `environment.ambientDescription` under the tagline —
  makes directive §23's "SOUND ADAPT" beat actually visible.

## Twin Visual DNA (directive §6.2)

**New: `src/lib/twin/twinVisualDNA.ts`** — a static, deterministic lookup
table, one entry per archetype (18 total: 12 base + 6 hybrid, from
`TwinContext.ARCHETYPES`), each covering the four axes §6.2 requires:

| Axis | Field |
|---|---|
| Identity | `archetype` |
| Appearance | `coreColor`, `auraColor`, `coreShape` (sphere / crystal / ring / diamond / bloom / wave) |
| Visual Language | `auraStyle` (Thai descriptor) |
| Motion Characteristics | `motionSpeed` (0.7–1.3 multiplier) |

Per §9 ("AI Generates Parameters, Not Pictures") this is a plain object
lookup — no AI/image-generation call, no runtime image. `getTwinVisualDNA()`
resolves a Twin's DNA from its `primaryArchetype` (+ light secondary-archetype
aura blend), matching the existing archetype system already grounded in
P0-C — no new archetype taxonomy invented.

**Audited before writing** (per directive §48/§49/§50): confirmed via
repo-wide grep that no `visualDNA`/`appearance`/`avatar`-on-Twin concept
existed anywhere prior. Found `TwinAvatar.tsx` (components/features) — a
built-but-unused mood/stage-driven small orb — deliberately **not** extended
or reused, since it solves a different problem (a small inline avatar with
its own test coverage) than "full-screen in-world presence," and touching it
risked its existing `Avatars.test.tsx`. Also confirmed three differently-
located `TwinStateEngine.ts` files exist (`lib/experience`, `lib/intelligence`,
`services/sice/engines`) — none touched; this pass only adds a new, distinct
file (`twinVisualDNA.ts`), no new engine with a colliding name.

## Twin appears in the World (directive §23 / §34 / §35 / §36)

**New: `src/components/twin/TwinPresence.tsx`** — renders a centered, glowing
SVG "core" shape (from Visual DNA) with an aura gradient, composited on top
of `WorldEnvironment`'s background and behind the text/UI column (per §36:
"Twin must look in the world, not avatar-over-background" — not a small
corner icon). Positioned lower-middle of the frame (not dead-center) so it
doesn't collide with the header text above it.

Two-layer split, per §34 "World-Aware Twin":
- **Core Identity (constant across every World):** `coreColor` / `coreShape`
  come only from `twinVisualDNA.ts`, keyed to the Twin's archetype — never
  touched by `worldColor`, mood, or time.
- **Contextual state (changes per World/mood/time):** read live from the
  `--twin-opacity` / `--twin-scale` / `--twin-rotation` / `--twin-glow-intensity`
  / `--twin-breathing-duration` / `--twin-breathing-intensity` CSS custom
  properties. These were already fully computed by
  `lib/experience/TwinStateEngine.ts` → `EnvironmentEngine` →
  `EnvironmentContext` and injected onto `:root` every tick — confirmed via
  grep before writing this file that **nothing in the entire codebase
  consumed them** (dead pipeline, computed and discarded). `TwinPresence.tsx`
  is their first real consumer, not a duplicate computation.
- `worldColor` is used only as a thin outer-aura tint (the one thing §34 says
  *should* change per world) — never the core color/shape.

Wired into `WorldDetail.tsx`: `useTwin()` (existing `TwinContext`, already
globally provided in `App.tsx`) supplies `primaryArchetype`/`secondaryArchetype`;
`<TwinPresence>` renders between `<WorldEnvironment>` and the content column.
Null-safe — falls back to a neutral default DNA if `twin` hasn't loaded yet.

## Verification performed
1. `npm run build` — clean, `✓ built in 30.74s`, 0 TypeScript errors (twice —
   once after the EnvironmentEngine wiring, once after TwinPresence).
2. Repo-wide grep audit (via a dedicated read-only investigation) before
   writing any code: confirmed no existing Visual DNA/appearance concept,
   confirmed `TwinAvatar.tsx` is unused-in-production (not silently
   duplicated), confirmed the `--twin-*` CSS var pipeline is genuinely
   orphaned (not already consumed somewhere I'd have collided with),
   confirmed the three `TwinStateEngine.ts` files are unrelated by design.
3. Confirmed `TwinProvider` / `WorldProvider` / `EnvironmentProvider` all
   wrap the `/worlds/:worldId` route in `App.tsx` — `useTwin()`/`useEnvironment()`
   won't throw at runtime.
4. Read `TwinProfile`'s actual field names (`primaryArchetype`,
   `secondaryArchetype`) from `TwinContext.tsx` before wiring, rather than
   guessing.

## Explicit scope boundaries (not done this pass)
- **Not done:** Twin placement/rendering on `TwinChat.tsx`, `Dashboard.tsx`
  (`LivingTwin.tsx`), or `CoreAwakening.tsx`'s birth ceremony
  (`HologramBirth.tsx` still uses a hardcoded color, not archetype-driven —
  flagged, not touched, since changing the birth ceremony's visual was not
  part of this ask and risks the emotionally-significant birth moment).
- **Not done:** any of the other UNIFIED-doc Phase 4/6/9/11+ items (Entry
  Resolver, shared 2D/2.5D compositor, World Transition animations, PWA
  entry) — user explicitly deferred these in favor of this slice.
- **Not done:** `coreShape` variety is currently 6 shape families reused
  across 18 archetypes (paired with 18 distinct colors) — not 18 fully unique
  glyphs. Matches this codebase's existing precedent (`WorldEnvironment.tsx`
  reuses spin/pulse/drift across many worlds too) but is a real simplification
  worth naming.
- **Not done:** no persistence of Visual DNA anywhere — it's derived on every
  render from `primaryArchetype`/`secondaryArchetype` (already persisted on
  `twins`), so nothing new needed saving; flagging only so it's not assumed
  a `visual_dna` column was added (it wasn't, and doesn't need to be).

## What "done" means here
The Twin now visibly exists inside `/worlds/:worldId` — the "TWIN APPEARS"
beat from directive §23 is real, not just a planned line item. Its Identity
(color/shape) is deterministic per archetype and doesn't drift between
worlds; its immediate state (glow/scale/rotation/breathing) responds to the
same live mood/time-of-day pipeline the rest of the environment already
uses, closing the previously-flagged dead pipeline. `EnvironmentEngine`'s
lighting/particle output is also now visibly driving the background, not
just computed and discarded.
