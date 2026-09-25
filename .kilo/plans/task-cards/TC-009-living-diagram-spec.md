# TC-009: Narrative spine spec — LivingDiagram
**Phase**: 0 | **Priority**: P0 | **Estimate**: 2 ชม.
**Assignee**: AI-Architect | **Depends On**: TC-004
**Feature Flag**: LIVING_DIAGRAM

## 🎯 OBJECTIVE
ออกแบบ spec ของ LivingDiagram — SVG เดียวที่เป็น "เส้นสันหลัง" เรื่องราวครอบ Landing→Onboarding→Dashboard/Webboard โดยมี 3 modes: landing (scroll-driven), onboarding (step-driven), dashboard (data-driven)

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `docs/LIVING_DIAGRAM_SPEC.md` — spec สมบูรณ์
- [ ] อธิบาย 3 modes + drivers (ScrollDriver, StepDriver, DataDriver)
- [ ] ระบุ SVG core components (Human, AITwin, CoreSynapse, SICENodes, BehavioralMap)
- [ ] อธิบาย DNA integration (TwinVisualDNA ควบคุมรูปร่าง/สี/การเคลื่อนไหว)
- [ ] ระบุ state transitions: v1→v2→v3 animate diff
- [ ] Mobile pattern: SVG sticky + bottom sheet
- [ ] Performance budget: LCP < 2.5s, no forced reflow
- [ ] **Docs updated**: MASTER_PLAN.md, LIVING_DIAGRAM_SPEC.md
- [ ] **All tests pass**: N/A (spec)
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```markdown
# LIVING_DIAGRAM_SPEC.md Outline

## 1. Architecture
- SVGCore.tsx — pure SVG components (zero logic)
- LivingDiagram.tsx — wrapper + driver selection
- drivers/ScrollDriver.ts — IntersectionObserver + rAF (landing)
- drivers/StepDriver.ts — step-based animation (onboarding)
- drivers/DataDriver.ts — live data pulses (dashboard)

## 2. SVG Core Components (from EvolutionaryVisualSystem)
- HumanSVG — asymmetric human silhouette
- AITwinSVG — stroke-draw animation, DNA-driven asymmetry
- CoreSynapseSVG — pulsing sphere, DNA rhythm
- SICENodesSVG — 12 nodes, DNA dominantSICE bias
- BehavioralMapSVG — polygon morph, DNA blindSpotVisual

## 3. Modes
| Mode | Driver | Trigger | DNA State |
|------|--------|---------|-----------|
| landing | ScrollDriver | scrollProgress 0→1 | v1 (DOB only) |
| onboarding | StepDriver | step 1→2→3 | v1→v2 (refining) |
| dashboard | DataDriver | liveData updates | v3 (living) |

## 4. DNA Integration
- ทุก SVG component รับ `dna: TwinVisualDNA` prop
- eyeOffset, shoulderTilt, spineCurvature → transform
- primaryHue, accentHue → CSS custom properties
- dominantSICE → node size/glow bias
- blindSpotVisual → node fracture/void/static/noise pattern

## 5. Version Transitions
- v1→v2: blind spot nodes appear (red pulse), polygon adds vertices
- v2→v3: decision pattern edges appear, live pulses on nodes
- Animate ONLY diff (not full redraw)

## 6. Mobile Pattern
- SVG sticky top 60vh
- Bottom sheet 40vh (slide up/down per mode)
- Touch-friendly node tap → world panel
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- docs/LIVING_DIAGRAM_SPEC.md
- .ai/context-pack/session-XXX-context.json