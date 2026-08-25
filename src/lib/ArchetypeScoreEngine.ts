/**
 * ArchetypeScoreEngine.ts
 *
 * 18-Archetype Score Engine — fuses all available sciences to determine
 * primary + secondary archetype, then detects hybrid combinations.
 *
 * Sciences + weights:
 *  1. Numerology (Life Path Number)           0.20
 *  2. Western Zodiac (Sun Sign)               0.12
 *  3. Moon Sign                               0.10
 *  4. Natal Dominant Element                  0.08
 *  5. Chinese Zodiac                          0.07
 *  6. BaZi Year Element                       0.07
 *  7. Vedic Nakshatra (from Moon degree)      0.08
 *  8. Human Design Type (from Sun degree)     0.08
 *  9. Kua Number (needs gender)               0.05 optional
 * 10. Thai Astrology นพเคราะห์               0.05
 * 11. I Ching Hexagram                        0.04
 * 12. Blood Type                              0.06 optional
 *
 * Hybrid combos (primary + secondary → hybrid):
 *   hero + sage            → strategic_warrior
 *   caregiver + ruler      → benevolent_leader
 *   creator + magician     → visionary_artist
 *   explorer + outlaw      → wandering_rebel
 *   lover + jester         → warm_flirt
 *   everyman + innocent    → relatable_neighbor
 *
 * Calculation functions ported from astrovera-v2/js/calc/astro-calc.js
 * Knowledge modules: astrovera-v2/brain/knowledge/{science}/system.js
 */

import type { Archetype } from '../context/TwinContext';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type BaseArchetype =
  | 'innocent' | 'explorer' | 'sage'    | 'everyman'
  | 'lover'    | 'jester'   | 'hero'    | 'outlaw'
  | 'magician' | 'caregiver'| 'creator' | 'ruler';

export type HybridArchetype =
  | 'strategic_warrior' | 'benevolent_leader' | 'visionary_artist'
  | 'wandering_rebel'   | 'warm_flirt'        | 'relatable_neighbor';

export interface ArchetypeInput {
  /** YYYY-MM-DD */
  birthDate: string;
  /** HH:MM — improves Human Design + Thai Planet accuracy */
  birthTime?: string;
  /** City name — used for timezone offset in natal calc */
  birthPlace?: string;
  /** 'male'|'female'|'m'|'f'|'ชาย'|'หญิง' — required for Kua */
  gender?: string;
  /** Blood type: A/B/O/AB */
  bloodType?: string;
  /** Pre-computed values (skip recalculation if already available) */
  moonFullDegree?: number;
  sunFullDegree?: number;
  moonSign?: string;
  natalDominantElement?: string;
  lifePathNumber?: number;
  westernZodiac?: string;
  chineseZodiac?: string;
  /** English: Wood/Fire/Earth/Metal/Water */
  baziYearElement?: string;
  /** 1-64 */
  hexagramNumber?: number;
}

export interface ArchetypeResult {
  /** primary archetype — may be hybrid if combo detected */
  primary: Archetype;
  /** secondary base archetype */
  secondary: Archetype;
  /** Set when primary+secondary match a hybrid combo */
  hybrid?: HybridArchetype;
  /** Raw weighted scores for all 12 base archetypes */
  scores: Record<BaseArchetype, number>;
  /** Sciences that contributed (for transparency / display) */
  sciencesUsed: string[];
}

// ─────────────────────────────────────────────────────────────────
// Hybrid combos
// ─────────────────────────────────────────────────────────────────

const HYBRID_COMBOS: Array<{
  pair: [BaseArchetype, BaseArchetype];
  hybrid: HybridArchetype;
}> = [
  { pair: ['hero',     'sage'],     hybrid: 'strategic_warrior'  },
  { pair: ['caregiver','ruler'],    hybrid: 'benevolent_leader'  },
  { pair: ['creator',  'magician'], hybrid: 'visionary_artist'   },
  { pair: ['explorer', 'outlaw'],   hybrid: 'wandering_rebel'    },
  { pair: ['lover',    'jester'],   hybrid: 'warm_flirt'         },
  { pair: ['everyman', 'innocent'], hybrid: 'relatable_neighbor' },
];

// ─────────────────────────────────────────────────────────────────
// Scoring maps — per-science archetype tendency weights
// Values within each entry should sum ≈ 1.0
// ─────────────────────────────────────────────────────────────────

type ScoreMap = Partial<Record<BaseArchetype, number>>;

const NUMEROLOGY_MAP: Record<number, ScoreMap> = {
  1:  { hero: 0.5, ruler: 0.3, explorer: 0.2 },
  2:  { lover: 0.5, caregiver: 0.3, everyman: 0.2 },
  3:  { jester: 0.5, creator: 0.3, explorer: 0.2 },
  4:  { everyman: 0.5, ruler: 0.3, caregiver: 0.2 },
  5:  { explorer: 0.5, outlaw: 0.3, jester: 0.2 },
  6:  { caregiver: 0.6, everyman: 0.2, lover: 0.2 },
  7:  { sage: 0.6, magician: 0.2, outlaw: 0.2 },
  8:  { ruler: 0.5, hero: 0.3, magician: 0.2 },
  9:  { innocent: 0.5, caregiver: 0.3, sage: 0.2 },
  11: { magician: 0.5, sage: 0.3, creator: 0.2 },
  22: { creator: 0.5, ruler: 0.3, magician: 0.2 },
  33: { outlaw: 0.5, caregiver: 0.3, hero: 0.2 },
};

const ZODIAC_MAP: Record<string, ScoreMap> = {
  Aries:       { hero: 0.5,    explorer: 0.3, outlaw: 0.2   },
  Taurus:      { caregiver: 0.3, creator: 0.3, everyman: 0.4 },
  Gemini:      { jester: 0.4,  explorer: 0.3, sage: 0.3     },
  Cancer:      { caregiver: 0.5, innocent: 0.3, lover: 0.2  },
  Leo:         { ruler: 0.4,   hero: 0.3,    creator: 0.3   },
  Virgo:       { sage: 0.5,    caregiver: 0.3, creator: 0.2 },
  Libra:       { lover: 0.4,   everyman: 0.3, caregiver: 0.3},
  Scorpio:     { magician: 0.5, outlaw: 0.3, sage: 0.2      },
  Sagittarius: { explorer: 0.5, sage: 0.3,   jester: 0.2    },
  Capricorn:   { ruler: 0.5,   sage: 0.3,    caregiver: 0.2 },
  Aquarius:    { outlaw: 0.4,  magician: 0.3, sage: 0.3     },
  Pisces:      { innocent: 0.4, lover: 0.3,  caregiver: 0.3 },
};

const CHINESE_ZODIAC_MAP: Record<string, ScoreMap> = {
  Rat:     { magician: 0.4, ruler: 0.3,    explorer: 0.3  },
  Ox:      { ruler: 0.4,   caregiver: 0.3, everyman: 0.3  },
  Tiger:   { hero: 0.5,    outlaw: 0.3,    explorer: 0.2  },
  Rabbit:  { lover: 0.4,   innocent: 0.3,  everyman: 0.3  },
  Dragon:  { ruler: 0.4,   hero: 0.3,      magician: 0.3  },
  Snake:   { magician: 0.4, sage: 0.4,     outlaw: 0.2    },
  Horse:   { explorer: 0.5, jester: 0.3,   hero: 0.2      },
  Goat:    { creator: 0.4,  caregiver: 0.3, innocent: 0.3 },
  Monkey:  { jester: 0.4,  magician: 0.3,  explorer: 0.3  },
  Rooster: { ruler: 0.4,   hero: 0.3,      creator: 0.3   },
  Dog:     { caregiver: 0.5, everyman: 0.3, hero: 0.2     },
  Pig:     { lover: 0.4,   innocent: 0.3,  caregiver: 0.3 },
};

const BAZI_ELEMENT_MAP: Record<string, ScoreMap> = {
  Wood:  { explorer: 0.4, creator: 0.3,  caregiver: 0.3 },
  Fire:  { hero: 0.4,    jester: 0.3,   magician: 0.3  },
  Earth: { everyman: 0.4, caregiver: 0.3, ruler: 0.3   },
  Metal: { ruler: 0.4,   hero: 0.3,     sage: 0.3      },
  Water: { sage: 0.4,    magician: 0.3, innocent: 0.3  },
};

const NATAL_ELEMENT_MAP: Record<string, ScoreMap> = {
  Fire:  { hero: 0.4,     creator: 0.3,  jester: 0.3   },
  Earth: { everyman: 0.4, caregiver: 0.3, ruler: 0.3   },
  Air:   { jester: 0.4,  sage: 0.3,     explorer: 0.3  },
  Water: { innocent: 0.4, caregiver: 0.3, lover: 0.3   },
};

/** Human Design Type → archetype tendency */
const HD_TYPE_MAP: Record<string, ScoreMap> = {
  'Generator':            { everyman: 0.4,  caregiver: 0.3, hero: 0.3    },
  'Manifesting Generator':{ hero: 0.4,      creator: 0.3,   outlaw: 0.3  },
  'Manifestor':           { outlaw: 0.4,    ruler: 0.3,     hero: 0.3    },
  'Projector':            { sage: 0.5,      caregiver: 0.3, magician: 0.2},
  'Reflector':            { innocent: 0.4,  sage: 0.3,      magician: 0.3},
};

/** Thai Planet index (day-of-week) → archetype */
const THAI_PLANET_MAP: Record<number, ScoreMap> = {
  0: { ruler: 0.5,    hero: 0.3,     creator: 0.2   }, // อาทิตย์ — Sun
  1: { lover: 0.4,    caregiver: 0.4, innocent: 0.2 }, // จันทร์  — Moon
  2: { hero: 0.5,     outlaw: 0.3,   explorer: 0.2  }, // อังคาร  — Mars
  3: { sage: 0.4,     jester: 0.3,   explorer: 0.3  }, // พุธ     — Mercury
  4: { sage: 0.5,     caregiver: 0.3, ruler: 0.2    }, // พฤหัส   — Jupiter
  5: { lover: 0.5,    creator: 0.3,  jester: 0.2    }, // ศุกร์   — Venus
  6: { ruler: 0.4,    sage: 0.3,     everyman: 0.3  }, // เสาร์   — Saturn
  7: { magician: 0.4, outlaw: 0.4,   explorer: 0.2  }, // ราหู    — Rahu
};

/** Kua Number (1-9) → archetype */
const KUA_MAP: Record<number, ScoreMap> = {
  1: { sage: 0.4,     magician: 0.3, innocent: 0.3  },
  2: { caregiver: 0.4, everyman: 0.4, ruler: 0.2    },
  3: { explorer: 0.4, creator: 0.4,  jester: 0.2    },
  4: { explorer: 0.4, sage: 0.3,     creator: 0.3   },
  5: { ruler: 0.4,    everyman: 0.3, caregiver: 0.3 },
  6: { ruler: 0.5,    hero: 0.3,     sage: 0.2      },
  7: { lover: 0.4,    ruler: 0.3,    jester: 0.3    },
  8: { caregiver: 0.4, sage: 0.3,    everyman: 0.3  },
  9: { hero: 0.4,     jester: 0.3,   magician: 0.3  },
};

/** Blood type → archetype tendency */
const BLOOD_TYPE_MAP: Record<string, ScoreMap> = {
  O:  { hero: 0.4,    ruler: 0.3,    outlaw: 0.3    },
  A:  { caregiver: 0.4, sage: 0.3,   everyman: 0.3  },
  B:  { explorer: 0.4, outlaw: 0.3,  creator: 0.3   },
  AB: { magician: 0.4, sage: 0.3,    jester: 0.3    },
};

// ─────────────────────────────────────────────────────────────────
// Vedic Nakshatra (27 lunar mansions) — zone-based archetype map
// Ported from astrovera-v2/js/bundles/bundle-data-calc.js
// ─────────────────────────────────────────────────────────────────

function getNakshatraArchetypeMap(idx: number): ScoreMap {
  if (idx <= 2)  return { hero: 0.5,     outlaw: 0.3,   explorer: 0.2  }; // 0-2  Ashwini/Bharani/Krittika — fire/action
  if (idx <= 5)  return { caregiver: 0.4, lover: 0.3,   magician: 0.3  }; // 3-5  Rohini/Mrigashira/Ardra — nurture/search
  if (idx <= 8)  return { innocent: 0.4, caregiver: 0.3, magician: 0.3 }; // 6-8  Punarvasu/Pushya/Ashlesha — renewal/depth
  if (idx <= 11) return { ruler: 0.4,    lover: 0.3,    caregiver: 0.3 }; // 9-11 Magha/P.Phalguni/U.Phalguni — royalty
  if (idx <= 14) return { creator: 0.4,  explorer: 0.3, jester: 0.3    }; // 12-14 Hasta/Chitra/Swati — craft/independence
  if (idx <= 17) return { hero: 0.4,     ruler: 0.3,    caregiver: 0.3 }; // 15-17 Vishakha/Anuradha/Jyeshtha — devotion
  if (idx <= 20) return { outlaw: 0.4,   magician: 0.3, explorer: 0.3  }; // 18-20 Mula/P.Ashadha/U.Ashadha — transform
  if (idx <= 23) return { sage: 0.4,     ruler: 0.3,    caregiver: 0.3 }; // 21-23 Shravana/Dhanishtha/Shatabhisha
  if (idx <= 25) return { magician: 0.4, sage: 0.4,     outlaw: 0.2    }; // 24-25 P.Bhadrapada/U.Bhadrapada
  return         { innocent: 0.4,        sage: 0.3,     explorer: 0.3  }; // 26   Revati — completion
}

// ─────────────────────────────────────────────────────────────────
// I Ching Hexagram → archetype (cycled zone, hexagram 1-64)
// ─────────────────────────────────────────────────────────────────

const HEX_ZONE_MAPS: ScoreMap[] = [
  { ruler: 0.6,     hero: 0.4     }, // 1  — Creation
  { caregiver: 0.6, innocent: 0.4 }, // 2  — Receptive
  { explorer: 0.5,  outlaw: 0.5   }, // 3  — Difficulty
  { sage: 0.6,      innocent: 0.4 }, // 4  — Youth/Learning
  { caregiver: 0.5, everyman: 0.5 }, // 5  — Waiting
  { outlaw: 0.5,    hero: 0.5     }, // 6  — Conflict
  { ruler: 0.6,     caregiver: 0.4}, // 7  — Army
  { everyman: 0.6,  lover: 0.4    }, // 8  — Union
  { creator: 0.5,   caregiver: 0.5}, // 9  — Small Taming
  { explorer: 0.5,  hero: 0.5     }, // 10 — Treading
  { innocent: 0.5,  ruler: 0.5    }, // 11 — Peace
  { magician: 0.6,  outlaw: 0.4   }, // 12 — Standstill
];

// ─────────────────────────────────────────────────────────────────
// Astronomical helpers (ported from astrovera-v2 + astrology.ts)
// ─────────────────────────────────────────────────────────────────

function normDeg(d: number): number {
  return ((d % 360) + 360) % 360;
}

function dateToJulian(y: number, m: number, d: number, h = 12): number {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d + h / 24 + B - 1524.5
  );
}

function calcMoonFullDegree(dob: string, time = '12:00'): number {
  const [year, month, day] = dob.split('-').map(Number);
  const [hour = 12, minute = 0] = (time || '12:00').split(':').map(Number);
  const utcHour = hour - 7; // Thailand = UTC+7 default
  const jd = dateToJulian(year, month, day, utcHour + minute / 60);
  const T = (jd - 2451545.0) / 36525;
  const L  = normDeg(218.3165 + 481267.8813 * T);
  const M  = normDeg(357.5291 + 35999.0503 * T);
  const Mp = normDeg(134.9634 + 477198.8676 * T);
  const D  = normDeg(297.8502 + 445267.1115 * T);
  const F  = normDeg(93.2721  + 483202.0175 * T);
  const R = Math.PI / 180;
  return normDeg(
    L
    + 6.2886 * Math.sin(Mp * R)
    + 1.2740 * Math.sin((2 * D - Mp) * R)
    + 0.6583 * Math.sin(2 * D * R)
    + 0.2136 * Math.sin(2 * Mp * R)
    - 0.1851 * Math.sin(M * R)
    - 0.1143 * Math.sin(2 * F * R),
  );
}

function calcSunFullDegree(dob: string, time = '12:00'): number {
  const [year, month, day] = dob.split('-').map(Number);
  const [hour = 12] = (time || '12:00').split(':').map(Number);
  const jd = dateToJulian(year, month, day, hour - 7);
  const T  = (jd - 2451545.0) / 36525;
  const L0 = normDeg(280.46646 + 36000.76983 * T);
  const M  = normDeg(357.52911 + 35999.05029 * T);
  const Mr = M * Math.PI / 180;
  const C  =
    (1.914602 - 0.004817 * T) * Math.sin(Mr) +
    0.019993 * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  return normDeg(L0 + C);
}

const LAHIRI_AYANAMSHA = 23.85; // Epoch 2025

function getNakshatraIndex(moonFullDegree: number): number {
  const sidereal = normDeg(moonFullDegree - LAHIRI_AYANAMSHA);
  return Math.min(Math.floor(sidereal / 13.333), 26);
}

// ─────────────────────────────────────────────────────────────────
// Human Design Type from Sun degree
// Ported from astrovera-v2/js/calc/astro-calc.js calcHumanDesign()
// ─────────────────────────────────────────────────────────────────

const HD_GATE_ORDER = [
  41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,
  27,24, 2,23, 8,20,16,35,45,12,15,52,39,53,62,56,
  31,33, 7, 4,29,59,40,64,47, 6,46,18,48,57,32,50,
  28,44, 1,43,14,34, 9, 5,26,11,10,58,38,54,61,60,
];

const SACRAL_GATES    = new Set([5,14,29,59,9,3,42,27,34]);
const MANIFESTOR_GATES = new Set([1,2,3,7,10,13,14,15,17,21,22,25,26,34,38,45,51]);

function calcHDType(sunFullDegree: number): string {
  const d = normDeg(sunFullDegree);
  const idx = Math.floor(d / 5.625) % 64;
  const sunGate   = HD_GATE_ORDER[idx]        ?? 1;
  const earthGate = HD_GATE_ORDER[(idx + 32) % 64] ?? 1;

  const hasSacral = SACRAL_GATES.has(sunGate) || SACRAL_GATES.has(earthGate);
  const hasManiGate = MANIFESTOR_GATES.has(sunGate) || MANIFESTOR_GATES.has(earthGate);
  const hasManifestedSacral = hasSacral && hasManiGate;

  if (hasManifestedSacral) return 'Manifesting Generator';
  if (hasSacral)           return 'Generator';
  if (MANIFESTOR_GATES.has(sunGate)) return 'Manifestor';
  return 'Projector';
}

// ─────────────────────────────────────────────────────────────────
// Thai Planet — day-of-week planet index
// Source: astrovera-v2/js/calc/astro-calc.js calcThaiPlanet()
// ─────────────────────────────────────────────────────────────────

function calcThaiPlanetIndex(dob: string, time?: string): number | null {
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const dow = d.getDay(); // 0=Sun … 6=Sat
  // Wednesday night (18:00–06:00) → Rahu (index 7)
  if (dow === 3 && time) {
    const hr = parseInt(time.split(':')[0], 10);
    if (!isNaN(hr) && (hr >= 18 || hr < 6)) return 7;
  }
  return dow; // 0→Sun,1→Moon,2→Mars,3→Mercury,4→Jupiter,5→Venus,6→Saturn
}

// ─────────────────────────────────────────────────────────────────
// Kua Number — feng shui
// Source: astrovera-v2/js/calc/astro-calc.js calcKua()
// ─────────────────────────────────────────────────────────────────

function calcKuaNumber(dob: string, gender: string): number | null {
  const yr = parseInt(dob.split('-')[0], 10);
  if (isNaN(yr)) return null;
  const y2 = yr % 100;
  let s = Math.floor(y2 / 10) + (y2 % 10);
  while (s > 9) s = Math.floor(s / 10) + (s % 10);
  const isMale =
    gender === 'male' || gender === 'm' || gender === 'ชาย';
  let kua: number;
  if (isMale) {
    kua = 11 - s;
    if (kua === 5) kua = 2;
    if (kua > 9)   kua = kua - 9;
  } else {
    kua = s + 4;
    while (kua > 9) kua = kua - 9;
    if (kua === 5) kua = 8;
  }
  return kua;
}

// ─────────────────────────────────────────────────────────────────
// Scoring utilities
// ─────────────────────────────────────────────────────────────────

const BASE_ARCHETYPES: BaseArchetype[] = [
  'innocent','explorer','sage','everyman',
  'lover','jester','hero','outlaw',
  'magician','caregiver','creator','ruler',
];

function emptyScores(): Record<BaseArchetype, number> {
  return Object.fromEntries(
    BASE_ARCHETYPES.map(a => [a, 0]),
  ) as Record<BaseArchetype, number>;
}

function addWeighted(
  acc: Record<BaseArchetype, number>,
  map: ScoreMap,
  weight: number,
): void {
  for (const [arch, score] of Object.entries(map)) {
    if (score) acc[arch as BaseArchetype] += score * weight;
  }
}

function topTwo(scores: Record<BaseArchetype, number>): [BaseArchetype, BaseArchetype] {
  const sorted = [...BASE_ARCHETYPES].sort((a, b) => scores[b] - scores[a]);
  return [sorted[0], sorted[1]];
}

function detectHybrid(
  p: BaseArchetype,
  s: BaseArchetype,
): HybridArchetype | undefined {
  for (const { pair, hybrid } of HYBRID_COMBOS) {
    if ((p === pair[0] && s === pair[1]) || (p === pair[1] && s === pair[0])) {
      return hybrid;
    }
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────

export function calculateArchetypes(input: ArchetypeInput): ArchetypeResult {
  const scores       = emptyScores();
  const sciencesUsed: string[] = [];

  // Science weights
  const W: Record<string, number> = {
    numerology:   0.20,
    westernZodiac:0.12,
    moonSign:     0.10,
    natalElement: 0.08,
    chineseZodiac:0.07,
    baziElement:  0.07,
    nakshatra:    0.08,
    humanDesign:  0.08,
    kua:          0.05,
    thaiPlanet:   0.05,
    hexagram:     0.04,
    bloodType:    0.06,
  };

  // Compute missing degrees from birth date
  const moonFull: number =
    input.moonFullDegree ??
    (input.birthDate ? calcMoonFullDegree(input.birthDate, input.birthTime) : 0);
  const sunFull: number =
    input.sunFullDegree ??
    (input.birthDate ? calcSunFullDegree(input.birthDate, input.birthTime) : 0);

  // Determine which sciences are available → normalise weight total
  const avail = {
    numerology:   typeof input.lifePathNumber === 'number',
    westernZodiac:!!input.westernZodiac,
    moonSign:     !!input.moonSign,
    natalElement: !!input.natalDominantElement,
    chineseZodiac:!!input.chineseZodiac,
    baziElement:  !!input.baziYearElement,
    nakshatra:    !!input.birthDate,
    humanDesign:  !!input.birthDate,
    kua:          !!input.gender && !!input.birthDate,
    thaiPlanet:   !!input.birthDate,
    hexagram:     typeof input.hexagramNumber === 'number',
    bloodType:    !!input.bloodType && !!BLOOD_TYPE_MAP[input.bloodType.toUpperCase()],
  };

  const totalW = Object.entries(W).reduce(
    (sum, [k, w]) => sum + (avail[k as keyof typeof avail] ? w : 0),
    0,
  ) || 1;

  // 1. Numerology
  if (avail.numerology && input.lifePathNumber) {
    const m = NUMEROLOGY_MAP[input.lifePathNumber];
    if (m) { addWeighted(scores, m, W.numerology / totalW); sciencesUsed.push('Numerology'); }
  }

  // 2. Western Zodiac (Sun Sign)
  if (avail.westernZodiac && input.westernZodiac) {
    const m = ZODIAC_MAP[input.westernZodiac];
    if (m) { addWeighted(scores, m, W.westernZodiac / totalW); sciencesUsed.push('Western Astrology'); }
  }

  // 3. Moon Sign
  if (avail.moonSign && input.moonSign) {
    const m = ZODIAC_MAP[input.moonSign];
    if (m) { addWeighted(scores, m, W.moonSign / totalW); sciencesUsed.push('Moon Sign'); }
  }

  // 4. Natal Dominant Element
  if (avail.natalElement && input.natalDominantElement) {
    const m = NATAL_ELEMENT_MAP[input.natalDominantElement];
    if (m) { addWeighted(scores, m, W.natalElement / totalW); sciencesUsed.push('Natal Chart Element'); }
  }

  // 5. Chinese Zodiac
  if (avail.chineseZodiac && input.chineseZodiac) {
    const m = CHINESE_ZODIAC_MAP[input.chineseZodiac];
    if (m) { addWeighted(scores, m, W.chineseZodiac / totalW); sciencesUsed.push('Chinese Zodiac'); }
  }

  // 6. BaZi Year Element
  if (avail.baziElement && input.baziYearElement) {
    const m = BAZI_ELEMENT_MAP[input.baziYearElement];
    if (m) { addWeighted(scores, m, W.baziElement / totalW); sciencesUsed.push('BaZi Element'); }
  }

  // 7. Vedic Nakshatra (from Moon longitude)
  if (avail.nakshatra) {
    const nIdx = getNakshatraIndex(moonFull);
    const m    = getNakshatraArchetypeMap(nIdx);
    addWeighted(scores, m, W.nakshatra / totalW);
    sciencesUsed.push('Vedic Nakshatra');
  }

  // 8. Human Design Type (from Sun longitude)
  if (avail.humanDesign) {
    const hdType = calcHDType(sunFull);
    const m = HD_TYPE_MAP[hdType];
    if (m) { addWeighted(scores, m, W.humanDesign / totalW); sciencesUsed.push('Human Design'); }
  }

  // 9. Kua Number
  if (avail.kua && input.gender && input.birthDate) {
    const kua = calcKuaNumber(input.birthDate, input.gender);
    if (kua !== null) {
      const m = KUA_MAP[kua];
      if (m) { addWeighted(scores, m, W.kua / totalW); sciencesUsed.push('Kua Number (Feng Shui)'); }
    }
  }

  // 10. Thai Planet นพเคราะห์
  if (avail.thaiPlanet && input.birthDate) {
    const pIdx = calcThaiPlanetIndex(input.birthDate, input.birthTime);
    if (pIdx !== null) {
      const m = THAI_PLANET_MAP[pIdx];
      if (m) { addWeighted(scores, m, W.thaiPlanet / totalW); sciencesUsed.push('Thai Astrology (นพเคราะห์)'); }
    }
  }

  // 11. I Ching Hexagram
  if (avail.hexagram && input.hexagramNumber) {
    const zoneIdx = ((input.hexagramNumber - 1) % HEX_ZONE_MAPS.length);
    const m = HEX_ZONE_MAPS[zoneIdx];
    if (m) { addWeighted(scores, m, W.hexagram / totalW); sciencesUsed.push('I Ching'); }
  }

  // 12. Blood Type
  if (avail.bloodType && input.bloodType) {
    const m = BLOOD_TYPE_MAP[input.bloodType.toUpperCase()];
    if (m) { addWeighted(scores, m, W.bloodType / totalW); sciencesUsed.push('Blood Type'); }
  }

  // ── Determine result ──────────────────────────────────────────
  const [primary, secondary] = topTwo(scores);
  const hybrid = detectHybrid(primary, secondary);

  return {
    primary:  (hybrid ?? primary) as Archetype,
    secondary: secondary as Archetype,
    hybrid,
    scores,
    sciencesUsed,
  };
}
