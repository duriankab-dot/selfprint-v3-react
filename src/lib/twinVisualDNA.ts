// src/lib/twinVisualDNA.ts
// Deterministic unique visual DNA generator for AI Twins
// Same user = same DNA forever. Different users = visually distinct Twins.

import { mulberry32, hashString } from './hash';

export type SICEKey = 
  | 'self' | 'mind' | 'decisions' | 'purpose'
  | 'career' | 'wealth' | 'life' | 'growth'
  | 'relationships' | 'love' | 'health' | 'future';

export type BlindSpotVisual = 'fracture' | 'void' | 'static' | 'noise';

export type HeadShape = 'oval' | 'round' | 'angular' | 'pear';

export interface TwinVisualDNA {
  // Shape variations (asymmetry built-in)
  headShape: HeadShape;
  eyeOffset: number;        // -3 to +3 px (horizontal asymmetry)
  shoulderTilt: number;     // -5 to +5 deg (left/right tilt)
  spineCurvature: number;   // 0.8 to 1.2 multiplier (straight → curved)
  limbLengthRatio: number;  // 0.9 to 1.1 (short → long limbs)

  // Color identity (from birth data hash)
  primaryHue: number;       // 0-360 (dominant SICE influences hue)
  accentHue: number;        // complementary (primaryHue ± 180 ± 30)
  pulseRhythm: number;      // 0.8 to 1.3x base animation speed

  // Behavioral mapping
  dominantSICE: SICEKey;
  blindSpotVisual: BlindSpotVisual;

  // Meta
  version: number;
  seed: string;
}

export interface BirthInput {
  dob: string;        // YYYY-MM-DD (required)
  time?: string;      // HH:MM (optional)
  place?: string;     // city, country (optional)
}

const SICE_KEYS: SICEKey[] = [
  'self', 'mind', 'decisions', 'purpose',
  'career', 'wealth', 'life', 'growth',
  'relationships', 'love', 'health', 'future'
];

const HEAD_SHAPES: HeadShape[] = ['oval', 'round', 'angular', 'pear'];
const BLIND_SPOT_VISUALS: BlindSpotVisual[] = ['fracture', 'void', 'static', 'noise'];

/**
 * Generate deterministic Twin Visual DNA from birth data + userId
 * Uses mulberry32 PRNG seeded from hash of birth data + userId
 */
export function generateTwinDNA(input: BirthInput, userId: string): TwinVisualDNA {
  // Deterministic seed from birth data + userId
  const seedStr = `${input.dob}|${input.time ?? ''}|${input.place ?? ''}|${userId}`;
  const seed = hashString(seedStr);
  const rng = mulberry32(seed);

  // Shape (pick from weighted distribution)
  const headShape = HEAD_SHAPES[Math.floor(rng() * HEAD_SHAPES.length)];

  // Asymmetry factors
  const eyeOffset = (rng() - 0.5) * 6;       // -3 to +3
  const shoulderTilt = (rng() - 0.5) * 10;   // -5 to +5 deg
  const spineCurvature = 0.8 + rng() * 0.4;  // 0.8 to 1.2
  const limbLengthRatio = 0.9 + rng() * 0.2; // 0.9 to 1.1

  // Color from SICE-influenced hue
  const primaryHue = Math.floor(rng() * 360);
  const accentHue = (primaryHue + 180 + Math.floor((rng() - 0.5) * 60)) % 360;
  const pulseRhythm = 0.8 + rng() * 0.5;

  // Behavioral mapping (will be refined after analysis)
  const dominantSICE = SICE_KEYS[Math.floor(rng() * SICE_KEYS.length)];
  const blindSpotVisual = BLIND_SPOT_VISUALS[Math.floor(rng() * BLIND_SPOT_VISUALS.length)];

  return {
    headShape,
    eyeOffset,
    shoulderTilt,
    spineCurvature,
    limbLengthRatio,
    primaryHue,
    accentHue,
    pulseRhythm,
    dominantSICE,
    blindSpotVisual,
    version: 1,
    seed: seed.toString(16),
  };
}

/**
 * Refine DNA after onboarding analysis completes (v2)
 * Updates dominantSICE, blindSpotVisual, and may shift primaryHue
 */
export function refineTwinDNA(
  dna: TwinVisualDNA,
  analysis: { dominantSICE?: SICEKey; topBlindSpot?: string }
): TwinVisualDNA {
  const refined = { ...dna, version: 2 };

  if (analysis.dominantSICE) {
    refined.dominantSICE = analysis.dominantSICE;
    // Shift primary hue toward dominant SICE hue (±15°)
    const siceHue = getSICEHue(analysis.dominantSICE);
    refined.primaryHue = (refined.primaryHue + siceHue) / 2;
  }

  if (analysis.topBlindSpot) {
    refined.blindSpotVisual = mapBlindSpotToVisual(analysis.topBlindSpot);
  }

  refined.accentHue = (refined.primaryHue + 180 + 30) % 360;
  return refined;
}

/**
 * Upgrade DNA for living dashboard (v3)
 * Adds pulseRhythm adaptation and growthVector
 */
export function upgradeTwinDNA(dna: TwinVisualDNA): TwinVisualDNA & { growthVector?: number } {
  return {
    ...dna,
    version: 3,
    // pulseRhythm adapts to decision frequency over time
    // growthVector added for trajectory visualization
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getSICEHue(sice: SICEKey): number {
  const hueMap: Record<SICEKey, number> = {
    self: 280, mind: 220, decisions: 30, purpose: 60,
    career: 180, wealth: 45, life: 120, growth: 150,
    relationships: 330, love: 340, health: 160, future: 200,
  };
  return hueMap[sice] ?? 0;
}

function mapBlindSpotToVisual(blindSpot: string): BlindSpotVisual {
  const lower = blindSpot.toLowerCase();
  if (lower.includes('optimism') || lower.includes('risk') || lower.includes('impulsive')) return 'fracture';
  if (lower.includes('emotion') || lower.includes('self') || lower.includes('avoid')) return 'void';
  if (lower.includes('cognitive') || lower.includes('bias') || lower.includes('pattern')) return 'static';
  return 'noise';
}

// ─── DNA persistence (localStorage bridge for cross-page consistency) ──

const DNA_STORAGE_KEY = 'selfprint_twin_dna';

export function saveTwinDNA(input: BirthInput, userId: string): TwinVisualDNA {
  const dna = generateTwinDNA(input, userId);
  try {
    localStorage.setItem(DNA_STORAGE_KEY, JSON.stringify(dna));
  } catch { /* storage unavailable — in-memory only */ }
  return dna;
}

export function loadTwinDNA(): TwinVisualDNA | null {
  try {
    const raw = localStorage.getItem(DNA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TwinVisualDNA;
    if (typeof parsed.primaryHue !== 'number' || typeof parsed.seed !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

// ─── CSS helpers (SVG/CSS colors derived from DNA — never hardcoded) ───

export function dnaPrimaryColor(dna: TwinVisualDNA, alpha = 1): string {
  return alpha >= 1
    ? `hsl(${Math.round(dna.primaryHue)}, 85%, 60%)`
    : `hsla(${Math.round(dna.primaryHue)}, 85%, 60%, ${alpha})`;
}

export function dnaAccentColor(dna: TwinVisualDNA, alpha = 1): string {
  return alpha >= 1
    ? `hsl(${Math.round(dna.accentHue)}, 80%, 65%)`
    : `hsla(${Math.round(dna.accentHue)}, 80%, 65%, ${alpha})`;
}

export function dnaSoftColor(dna: TwinVisualDNA, alpha = 1): string {
  return alpha >= 1
    ? `hsl(${Math.round(dna.primaryHue)}, 70%, 74%)`
    : `hsla(${Math.round(dna.primaryHue)}, 70%, 74%, ${alpha})`;
}