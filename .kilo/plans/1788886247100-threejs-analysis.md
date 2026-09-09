# Three.js Analysis and Recommendations

## Current Status: Three.js Intentionally Removed

**Three.js is NOT missing/incomplete - it was deliberately removed** per documented project decisions:

1. **DEADDEP-001** (`vite.config.ts:50-58`): Removed `three` + `@types/three` dependencies
2. **C5** (`TRACK_C_VISUAL_REDESIGN_TH.md:297-301`): "3D = progressive enhancement only" - Twin Birth must use existing canvas 2D
3. **PHASE0 §0.7** (`PHASE0_VISUAL_PERF_FORENSIC_TH.md:383-436`): Confirmed WebGL/THREE = ❌ absent due to performance justification
4. **3D Usage Rule** (`PLAN_TRACKS_TH.md:110-121`): "ห้าม import Three.js ที่ App.tsx ระดับ top-level" (forbidden)

## Current Visual System Implementation

Instead of Three.js, the project uses:

### 1. Canvas 2D (`HologramBirth.tsx`)
- 200-particle deterministic birth animation
- Seeded PRNG from user traits (`shapeJitterSeed`, `facetCount`, `pulseSpeedFactor`)
- 5-phase 4-second animation: Particle → Asymmetric Living Seed → Twin Emerges
- `requestAnimationFrame` loop with `prefers-reduced-motion` guard

### 2. SVG Renderer (`TwinPresence.tsx`)
- 521-line SVG-based Twin renderer
- Core glyphs (sphere/crystal/ring/diamond/bloom/wave) per archetype
- Orbiting facets, evolution rings, world-specific accessories
- Reads `--twin-*` CSS custom properties from EnvironmentEngine

### 3. CSS 3D Transforms (`TwinAvatar.tsx`)
- Limited CSS 3D: `perspective: '1000px'`, `transformStyle: 'preserve-3d'`
- Not true WebGL/Three.js

### 4. Environment System
- CSS variable pipeline injecting `--twin-*`, `--lighting-*`, `--particles-*` vars
- Environmental engines (Lighting, ParticleSystem, TwinState) compute CSS vars
- EnvironmentContext sets `data-tod`/`data-twin-state` on `<html>`

## If Three.js Integration is Required (Not Recommended)

To add Three.js back would require:

### 1. Reverse Multiple Documented Decisions
- Re-add `three` and `@types/three` dependencies (reverses DEADDEP-001)
- Override C5 restriction on 3D being "progressive enhancement only"
- Potentially conflict with PHASE0 §0.7 performance justification
- Risk violating "ห้าม import Three.js ที่ App.tsx ระดับ top-level"

### 2. Implementation Approach (If Approved)
**Progressive Enhancement Pattern:**
- Keep existing canvas 2D/SVG/CSS as baseline
- Add Three.js as optional enhancement layer
- Load conditionally based on device capabilities/user preference
- Implement proper fallback to current canvas 2D system

### 3. Performance Budget Justification
- Three.js adds ~350kB gzip
- Would need real Lighthouse testing showing:
  - No degradation in First Contentful Paint
  - Acceptable impact on Time to Interactive
  - Clear visual/user experience benefit justifying cost
- Requires A3 approval per change budget (>30 files or touching core systems)

## Recommended Alternative: Enhance Current System

Rather than adding Three.js, enhance the existing visual system:

### 1. Improve Canvas 2D (`HologramBirth.tsx`)
- Increase particle count for richer effects (while maintaining performance)
- Add more sophisticated fluid dynamics or flocking behaviors
- Improve asymmetric seed generation algorithms
- Enhance lighting/shading within canvas 2D context

### 2. Enhance SVG Renderer (`TwinPresence.tsx`)
- Add more sophisticated procedural glyph generation
- Improve orbiting facet behaviors with physics-based motion
- Add more world-specific visual variations
- Enhance expression glint with more nuanced behaviors

### 3. Improve Environmental Integration
- Make visual parameters more responsive to real-time user data
- Enhance the connection between SICE insights and visual manifestations
- Improve World atmosphere effects in SVG/canvas contexts

### 4. Maintain Deterministic Procedural Generation
- Continue using seeded PRNG from user traits for consistency
- Ensure same `seedKey` + archetype produces identical visuals
- Preserve accessibility features (`prefers-reduced-motion` support)

## Validation Approach

If pursuing visual enhancements:

### Performance Validation
- Measure baseline performance (Lighthouse) on target devices
- Test enhancements on same devices
- Ensure no significant degradation in:
  - First Contentful Paint
  - Time to Interactive
  - Cumulative Layout Shift
  - Total Blocking Time

### Visual Quality Validation
- Verify deterministic behavior: identical inputs = identical outputs
- Test across different user trait combinations
- Validate accessibility compliance
- Confirm visual enhancements align with brand principles

## Conclusion

The visual system is **complete per project design decisions** - it intentionally uses canvas 2D + SVG + CSS instead of Three.js for performance, accessibility, and deterministic reasons.

**Recommendation**: Enhance the existing visual system rather than reintroducing Three.js, which would require reversing multiple architectural decisions and significant performance justification.

If Three.js integration is essential despite these constraints, it would need to be implemented as a progressive enhancement layer with proper fallback, performance budget justification, and formal approval through the A3 process.