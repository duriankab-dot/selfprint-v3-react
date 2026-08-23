/**
 * twinUniqueness.ts
 *
 * TWINPRESENCE-005: each Twin belongs to one of 18 archetypes (a
 * meaningful, numerology-derived "family" — see twinVisualDNA.ts) but two
 * users with the same archetype previously rendered as pixel-identical
 * twins. This layer adds a second, per-user deterministic variation on
 * top of the archetype base — seeded by the user's session id (stable
 * from before the Twin is even born through every later World visit,
 * unlike the Twin row's own id, which doesn't exist yet during the birth
 * ceremony) so it's stable across renders/sessions for the same user, but
 * different between any two users.
 *
 * Deliberately NOT random per render (Math.random()) — a Twin's look must
 * be consistent every time its owner sees it.
 */

/** Simple deterministic string hash (djb2) — good enough for a visual seed,
 *  not for anything security-sensitive. */
function hashStringToInt(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // unsigned 32-bit
}

/** mulberry32 — small, fast, deterministic PRNG from a 32-bit seed. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface TwinUniqueTraits {
  /** Hue rotation applied to the archetype's base colors, degrees. Keeps
   *  the Twin recognizably in its archetype's color family while making
   *  no two same-archetype Twins identical. */
  hueShiftDeg: number;
  /** Number of small orbiting facets/particles around the core glyph. */
  facetCount: number;
  /** Orbit radius of the facets, as a ratio of the core glyph's radius. */
  facetRadiusRatio: number;
  /** Facet dot size, as a ratio of the core glyph's radius. */
  facetSizeRatio: number;
  /** Starting rotation of the whole glyph + facet ring, degrees. */
  rotationOffsetDeg: number;
  /** Multiplies the base breathing/orbit animation duration (0.8–1.2 —
   *  some Twins breathe faster, some slower). */
  pulseSpeedFactor: number;
  /** 0–1 seed used to perturb polygon vertex radii on crystal/diamond
   *  shapes, giving each one a subtly irregular, one-of-a-kind silhouette
   *  instead of a perfect geometric shape. */
  shapeJitterSeed: number;
  /** Which direction the facet ring orbits — not every Twin spins the
   *  same way. */
  orbitDirection: 1 | -1;
}

export function getUniqueTwinTraits(seedKey: string): TwinUniqueTraits {
  const rand = mulberry32(hashStringToInt(seedKey || 'default-twin'));
  return {
    hueShiftDeg: (rand() - 0.5) * 34, // ~-17..+17
    facetCount: 5 + Math.floor(rand() * 6), // 5..10
    facetRadiusRatio: 0.55 + rand() * 0.3, // 0.55..0.85
    facetSizeRatio: 0.5 + rand() * 0.55, // 0.5..1.05
    rotationOffsetDeg: rand() * 360,
    pulseSpeedFactor: 0.85 + rand() * 0.35, // 0.85..1.2
    shapeJitterSeed: rand(),
    orbitDirection: rand() > 0.5 ? 1 : -1,
  };
}

/** Shift a #rrggbb hex color's hue by `degrees`, keeping saturation/lightness. */
export function shiftHue(hex: string, degrees: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }

  h = ((h * 360 + degrees) % 360 + 360) % 360 / 360;

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  let nr: number;
  let ng: number;
  let nb: number;
  if (s === 0) {
    nr = ng = nb = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    nr = hue2rgb(p, q, h + 1 / 3);
    ng = hue2rgb(p, q, h);
    nb = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
}
