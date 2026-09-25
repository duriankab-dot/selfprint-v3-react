# TWIN_DNA_SPEC.md — Twin Visual DNA Specification
**VERSION: 1.0 | LAST_UPDATED: 2026-09-25**  
**RELATED: TC-004, TC-101, TC-107, TC-108, LIVING_DIAGRAM_SPEC.md**

---

## 🎯 OBJECTIVE
Define deterministic, unique visual identity ("DNA") for each user's AI Twin.  
Same user = same DNA forever. Different users = visually distinct Twins.  
No two Twins look alike. No symmetric/generic templates.

---

## 🧬 DNA DATA STRUCTURE

```typescript
// src/lib/twinVisualDNA.ts

interface TwinVisualDNA {
  // ── Shape Variations (asymmetry built-in) ──────────────────────────
  headShape: 'oval' | 'round' | 'angular' | 'pear';
  eyeOffset: number;        // -3 to +3 px (horizontal asymmetry)
  shoulderTilt: number;     // -5 to +5 deg (left/right tilt)
  spineCurvature: number;   // 0.8 to 1.2 multiplier (straight → curved)
  limbLengthRatio: number;  // 0.9 to 1.1 (short → long limbs)

  // ── Color Identity (from birth data hash) ─────────────────────────
  primaryHue: number;       // 0-360 (dominant SICE influences hue)
  accentHue: number;        // complementary (primaryHue ± 180 ± 30)
  pulseRhythm: number;      // 0.8 to 1.3x base animation speed

  // ── Behavioral Mapping ────────────────────────────────────────────
  dominantSICE: SICEKey;    // shapes polygon bias, node glow
  blindSpotVisual: 'fracture' | 'void' | 'static' | 'noise';

  // ── Meta ──────────────────────────────────────────────────────────
  version: number;          // DNA schema version
  seed: string;             // hash(input) for reproducibility
}

type SICEKey = 
  | 'self' | 'mind' | 'decisions' | 'purpose'
  | 'career' | 'wealth' | 'life' | 'growth'
  | 'relationships' | 'love' | 'health' | 'future';
```

---

## 🌱 SEEDING ALGORITHM (Deterministic)

```typescript
// src/lib/twinVisualDNA.ts

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

interface BirthInput {
  dob: string;        // YYYY-MM-DD (required)
  time?: string;      // HH:MM (optional)
  place?: string;     // city, country (optional)
}

export function generateTwinDNA(input: BirthInput, userId: string): TwinVisualDNA {
  // Deterministic seed from birth data + userId
  const seedStr = `${input.dob}|${input.time ?? ''}|${input.place ?? ''}|${userId}`;
  const seed = hashString(seedStr);
  const rng = mulberry32(seed);

  // Shape (pick from weighted distribution)
  const headShapes: TwinVisualDNA['headShape'][] = ['oval', 'round', 'angular', 'pear'];
  const headShape = headShapes[Math.floor(rng() * headShapes.length)];

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
  const siceKeys: SICEKey[] = ['self','mind','decisions','purpose','career','wealth','life','growth','relationships','love','health','future'];
  const dominantSICE = siceKeys[Math.floor(rng() * siceKeys.length)];
  const blindSpotVisuals: TwinVisualDNA['blindSpotVisual'][] = ['fracture', 'void', 'static', 'noise'];
  const blindSpotVisual = blindSpotVisuals[Math.floor(rng() * blindSpotVisuals.length)];

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
```

---

## 🔗 INTEGRATION POINTS

| Component | DNA Usage | Mode |
|-----------|-----------|------|
| **LivingDiagram** | All SVG components receive `dna` prop | landing/onboarding/dashboard |
| **SVGCore/HumanSVG** | `headShape`, `eyeOffset`, `shoulderTilt`, `spineCurvature`, `limbLengthRatio` → transform | landing |
| **SVGCore/AITwinSVG** | Same shape params + `primaryHue`, `accentHue` → stroke/fill | landing/onboarding |
| **SVGCore/CoreSynapseSVG** | `pulseRhythm` → animation speed, `primaryHue/accentHue` → gradient | landing/onboarding |
| **SVGCore/SICENodesSVG** | `dominantSICE` → node size/glow bias, `blindSpotVisual` → node pattern | onboarding/dashboard |
| **SVGCore/BehavioralMapSVG** | `dominantSICE` → polygon vertex bias, `blindSpotVisual` → fracture/void pattern | onboarding/dashboard |
| **TwinProfilePage** | Full DNA → avatar render, color theme | profile |
| **WorldEnvironment** | `primaryHue/accentHue` → ambient theme, `dominantSICE` → world emphasis | dashboard/worlds |
| **TwinEvolutionScene** | DNA morph animation on version upgrade | celebration |

---

## 🎨 DNA → VISUAL MAPPING

### Shape Parameters → SVG Transforms
```typescript
// Applied to HumanSVG / AITwinSVG
const transforms = {
  head: `scale(${headShape === 'oval' ? '1,1.1' : headShape === 'round' ? '1,1' : headShape === 'angular' ? '1,0.9' : '1,1.2'})`,
  leftEye: `translateX(${eyeOffset}px)`,
  rightEye: `translateX(${-eyeOffset}px)`,
  shoulders: `rotate(${shoulderTilt}deg)`,
  spine: `scaleY(${spineCurvature})`,
  arms: `scaleY(${limbLengthRatio})`,
  legs: `scaleY(${limbLengthRatio})`,
};
```

### Color Parameters → CSS Custom Properties
```css
/* Injected via style prop on LivingDiagram root */
:root {
  --twin-primary-hue: <primaryHue>;
  --twin-accent-hue: <accentHue>;
  --twin-pulse-rhythm: <pulseRhythm>;
}

/* Used in SVGCore components */
.twin-stroke { stroke: hsl(var(--twin-primary-hue), 70%, 50%); }
.twin-fill { fill: hsl(var(--twin-primary-hue), 50%, 40%); }
.twin-accent { stroke: hsl(var(--twin-accent-hue), 70%, 50%); }
@keyframes twin-pulse { 
  0%, 100% { opacity: 0.3; } 
  50% { opacity: 0.8; } 
}
.twin-node { animation: twin-pulse calc(2s / var(--twin-pulse-rhythm)) ease-in-out infinite; }
```

### Dominant SICE → Node Bias
```typescript
// SICENodesSVG: dominant node gets 1.3x size, extra glow
const nodeStyle = (index: number, dna: TwinVisualDNA) => {
  const isDominant = SICE_KEYS[index] === dna.dominantSICE;
  return {
    r: isDominant ? 8 * 1.3 : 6,
    filter: isDominant ? 'drop-shadow(0 0 8px currentColor)' : 'none',
    animationDelay: `${index * 100}ms`,
  };
};
```

### Blind Spot Visual Patterns
| Type | SVG Pattern | Meaning |
|------|-------------|---------|
| `fracture` | Jagged polygon edges, cracked texture | Decision-making blind spot |
| `void` | Empty node center, dark hole | Emotional/self blind spot |
| `static` | Noise/flicker animation | Cognitive/noise blind spot |
| `noise` | Particle scatter around node | Sensory/perception blind spot |

---

## 🔄 VERSION UPGRADES & DNA REFINEMENT

| Version | Trigger | DNA Changes |
|---------|---------|-------------|
| **v1 (Landing)** | DOB submitted | Seed from DOB only. Shape/color generated. `dominantSICE` = random placeholder. `blindSpotVisual` = random. |
| **v2 (Onboarding)** | Mood + Nova + Finetune complete | `dominantSICE` = calculated from analysis. `blindSpotVisual` = mapped from top blind spot. `primaryHue` may shift ±15° toward dominant SICE hue. |
| **v3 (Living)** | First decision / World interaction | `pulseRhythm` adapts to decision frequency. New `growthVector` added (trajectory). |

**Upgrade Animation**: Only diff animates. v1→v2: blind spot nodes appear with `blindSpotVisual` pattern. v2→v3: decision edges pulse, polygon vertices drift toward `growthVector`.

---

## 📦 HANDOFF ARTIFACTS
- `src/lib/twinVisualDNA.ts` — implementation
- `src/components/landing/SVGCore.tsx` — DNA-aware SVG components
- `src/components/landing/LivingDiagram.tsx` — DNA injection
- `docs/LIVING_DIAGRAM_SPEC.md` — narrative spine integration