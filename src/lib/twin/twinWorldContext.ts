/**
 * twinWorldContext.ts
 *
 * P0-H (Visual World Integration) — the checklist's "Twin Motion: Twin
 * animation/posture changes per world" + "Expressions: Adapt to world
 * context" + "Clothing/Accessories: Change contextually" items.
 *
 * §34 "World-Aware Twin" is explicit that only CONTEXTUAL layers (lighting,
 * mood, aura tint, motion) may change per world — Core Visual DNA
 * (archetype color/shape, twinVisualDNA.ts) and per-user uniqueness
 * (twinUniqueness.ts) never do. This table is exactly that contextual
 * layer: it doesn't touch color/shape identity, only how the Twin *moves*,
 * *wears*, and *expresses* per World — same Twin, different context, like
 * a person dressing differently for the gym vs. a board meeting.
 *
 * Every value below is derived from that World's own `mood` field in
 * worlds.ts (see the comment on each entry) — not arbitrary.
 */

import type { WorldId } from '@/constants/worlds';

/** Abstract, procedural accessory glyphs — matching this codebase's existing
 *  no-illustration art style (WorldEnvironment's ArchetypePattern, CoreGlyph
 *  shapes). Each is a small geometric accent, not literal clothing. */
export type TwinAccessoryKind =
  | 'ring-focus'    // SELF — a single still ring, inward focus
  | 'spark-arc'     // MIND — a quick arc of small sparks, alertness
  | 'bond-links'    // RELATIONSHIP — two linked rings, connection
  | 'heart-curve'   // LOVE — a soft heart-notch beneath the core
  | 'collar-bar'    // CAREER — a horizontal bar + notch, "dressed for work"
  | 'halo-facets'   // WEALTH — small faceted studs, precision/value
  | 'horizon-arc'   // LIFE — a wide shallow arc, open horizon
  | 'sprout'        // GROWTH — an upward two-leaf sprout
  | 'fork-branch'   // DECISION — a branching fork, choices
  | 'radiant-beam'  // PURPOSE — a single upward beam, direction
  | 'lotus-petal'   // WELLBEING — soft layered petals beneath
  | 'comet-trail';  // FUTURE — a forward-leaning streak, momentum

export interface TwinWorldContext {
  /** Multiplies TwinPresence's base vertical-bob amplitude/duration. */
  bobMultiplier: number;
  /** Multiplies the breathing-glow animation's cycle speed. */
  breatheMultiplier: number;
  /** Static posture tilt in degrees (-6..6). */
  tiltDeg: number;
  accessory: TwinAccessoryKind;
  /** 0 (cool/white glint) .. 1 (warm/core-color glint) — this World's "expression" tint. */
  expressionWarmth: number;
  /** Glint blink cycle, ms — faster reads as more alert/curious, slower as calmer. */
  expressionPulseMs: number;
}

export const TWIN_WORLD_CONTEXT: Record<WorldId, TwinWorldContext> = {
  // "Reflective / Introspective" — stillest of all, inward, unhurried.
  self: { bobMultiplier: 0.85, breatheMultiplier: 0.85, tiltDeg: 0, accessory: 'ring-focus', expressionWarmth: 0.3, expressionPulseMs: 3400 },
  // "Curious / Intelligent" — quick, alert, leaning slightly forward.
  mind: { bobMultiplier: 1.05, breatheMultiplier: 1.15, tiltDeg: 2, accessory: 'spark-arc', expressionWarmth: 0.4, expressionPulseMs: 1800 },
  // "Connected / Warm" — leans in, steady, warm glint.
  relationship: { bobMultiplier: 1.0, breatheMultiplier: 1.0, tiltDeg: -2, accessory: 'bond-links', expressionWarmth: 0.7, expressionPulseMs: 2600 },
  // "Deep / Intimate" — slow, soft, warmest glint of all.
  love: { bobMultiplier: 0.8, breatheMultiplier: 0.8, tiltDeg: 0, accessory: 'heart-curve', expressionWarmth: 0.9, expressionPulseMs: 3000 },
  // "Focused / Ambitious" — upright (no lean), sharp/quick glow, "dressed for work".
  career: { bobMultiplier: 0.9, breatheMultiplier: 1.1, tiltDeg: 0, accessory: 'collar-bar', expressionWarmth: 0.35, expressionPulseMs: 2000 },
  // "Strategic / Precise" — measured, faceted precision accent.
  wealth: { bobMultiplier: 0.85, breatheMultiplier: 0.95, tiltDeg: 0, accessory: 'halo-facets', expressionWarmth: 0.5, expressionPulseMs: 2400 },
  // "Expansive / Contemplative" — wider, more open motion, gentle tilt outward.
  life: { bobMultiplier: 1.1, breatheMultiplier: 0.9, tiltDeg: 3, accessory: 'horizon-arc', expressionWarmth: 0.55, expressionPulseMs: 3200 },
  // "Inspiring / Evolving" — upward energy, leaning up/forward.
  growth: { bobMultiplier: 1.15, breatheMultiplier: 1.1, tiltDeg: -3, accessory: 'sprout', expressionWarmth: 0.6, expressionPulseMs: 2200 },
  // "Analytical / Strategic" — still, considered, no wasted motion.
  decision: { bobMultiplier: 0.8, breatheMultiplier: 0.9, tiltDeg: 0, accessory: 'fork-branch', expressionWarmth: 0.35, expressionPulseMs: 2400 },
  // "Profound / Contemplative" — the stillest/weightiest of all, slow glint.
  purpose: { bobMultiplier: 0.75, breatheMultiplier: 0.8, tiltDeg: 0, accessory: 'radiant-beam', expressionWarmth: 0.65, expressionPulseMs: 3600 },
  // "Calm / Restorative" — gentlest motion in the whole set, slowest glint.
  wellbeing: { bobMultiplier: 0.7, breatheMultiplier: 0.75, tiltDeg: 0, accessory: 'lotus-petal', expressionWarmth: 0.75, expressionPulseMs: 4000 },
  // "Visionary / Expansive" — most dynamic/reaching, forward tilt.
  future: { bobMultiplier: 1.2, breatheMultiplier: 1.05, tiltDeg: 4, accessory: 'comet-trail', expressionWarmth: 0.5, expressionPulseMs: 2000 },
};

/** Neutral fallback for contexts with no active World (e.g. Dashboard orb,
 *  or a Twin preview rendered before a World is chosen) — no posture bias,
 *  no accessory, moderate expression. */
export const DEFAULT_TWIN_WORLD_CONTEXT: TwinWorldContext = {
  bobMultiplier: 1,
  breatheMultiplier: 1,
  tiltDeg: 0,
  accessory: 'ring-focus',
  expressionWarmth: 0.5,
  expressionPulseMs: 2800,
};

export function getTwinWorldContext(worldId?: WorldId): TwinWorldContext {
  if (!worldId) return DEFAULT_TWIN_WORLD_CONTEXT;
  return TWIN_WORLD_CONTEXT[worldId] ?? DEFAULT_TWIN_WORLD_CONTEXT;
}
