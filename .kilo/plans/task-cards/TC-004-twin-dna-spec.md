# TC-004: Twin DNA spec finalize
**Phase**: 0.5 | **Priority**: P0 | **Estimate**: 2 ชม.
**Assignee**: AI-Architect | **Depends On**: TC-001
**Feature Flag**: LIVING_DIAGRAM

## 🎯 OBJECTIVE
ออกแบบ spec ของ Twin Visual DNA — deterministic unique identity ต่อ user ที่ควบคุมรูปร่าง สี ความเคลื่อนไหวของ SVG ทุกที่ที่แสดง Twin

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `docs/TWIN_DNA_SPEC.md` — spec สมบูรณ์ พร้อม TypeScript interfaces
- [ ] ระบุ DNA fields ทั้งหมด (shape, color, rhythm, behavioral mapping)
- [ ] อธิบาย seeding algorithm (mulberry32 from birth data + userId)
- [ ] ระบุ integration points ทุกหน้า (Landing, Onboarding, Dashboard, Profile, Worlds)
- [ ] Team review & sign-off
- [ ] **Docs updated**: MASTER_PLAN.md, TWIN_DNA_SPEC.md
- [ ] **All tests pass**: N/A (spec only)
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```typescript
// src/lib/twinVisualDNA.ts
interface TwinVisualDNA {
  // Shape variations (asymmetry built-in)
  headShape: 'oval' | 'round' | 'angular' | 'pear';
  eyeOffset: number;        // -3 to +3 px
  shoulderTilt: number;     // -5 to +5 deg
  spineCurvature: number;   // 0.8 to 1.2
  limbLengthRatio: number;  // 0.9 to 1.1

  // Color identity (from birth data hash)
  primaryHue: number;       // 0-360
  accentHue: number;        // complementary
  pulseRhythm: number;      // 0.8-1.3x base speed

  // Behavioral mapping
  dominantSICE: SICEKey;
  blindSpotVisual: 'fracture' | 'void' | 'static' | 'noise';
}

function generateTwinDNA(input: BirthInput, userId: string): TwinVisualDNA {
  const seed = hash(`${input.dob}|${input.time}|${input.place}|${userId}`);
  const rng = mulberry32(seed);
  // ... deterministic generation
}
```

**Integration Points:**
- `LivingDiagram` — ใช้ DNA ควบคุม SVG ทุก mode
- `TwinProfilePage` — avatar จาก DNA
- `WorldEnvironment` — theme colors จาก DNA
- `TwinEvolutionScene` — morph จาก DNA

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- docs/TWIN_DNA_SPEC.md
- .ai/context-pack/session-XXX-context.json (includes: DNA interface, seeding algo)