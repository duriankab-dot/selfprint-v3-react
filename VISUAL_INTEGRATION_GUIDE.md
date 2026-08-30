# EvolutionaryVisualSystem — Integration Guide

## Files

- **`EvolutionaryVisualSystem.jsx`** — React component. Drop into your project.
- **`selfprint_landing.html`** — Standalone HTML artifact (reference only).

---

## Quick Start

### Option 1: Auto Scroll Detection (Recommended)

```jsx
import EvolutionaryVisualSystem from './EvolutionaryVisualSystem';

export default function LandingPage() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '200vh' }}>
      {/* Left: scrollable content (S1 + S2) */}
      <div>
        <section>Your content here</section>
      </div>

      {/* Right: sticky visual panel */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', alignSelf: 'start' }}>
        <EvolutionaryVisualSystem containerRef={containerRef} />
      </div>
    </div>
  );
}
```

Component listens to window scroll and calculates progress from container position automatically.

---

### Option 2: External Scroll Progress

```jsx
import { useState, useEffect } from 'react';
import EvolutionaryVisualSystem from './EvolutionaryVisualSystem';

export default function LandingPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Your custom scroll logic (0→1)
      setProgress(/* calculated value */);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '200vh' }}>
      <div>{/* content */}</div>
      <div style={{ position: 'sticky', top: 0, height: '100vh', alignSelf: 'start' }}>
        <EvolutionaryVisualSystem scrollProgress={progress} />
      </div>
    </div>
  );
}
```

---

## Animation Phases

| Progress | Phase | What Happens |
|---|---|---|
| 0→0.43 | Phase 1 | Human figure fades in, AI Twin builds via stroke-dashoffset, data streams flow, ISM grid appears |
| 0.38→0.60 | Transition | Both figures dissolve into Core Synapse Sphere (3D energy orb) |
| 0.56→1.0 | Phase 2 | 12 SICE nodes activate in 3 groups, electric pulses flow from core, labels float |
| 0.84→1.0 | Climax | Polygon Behavioral Map connects all 12 nodes |

---

## Dependencies

- React (hooks: `useEffect`, `useRef`)
- No external SVG/animation libraries needed

---

## Notes

- Component manages its own state (node refs, label positions, etc.)
- Floating labels use `requestAnimationFrame` for smooth physics
- All animations are CSS keyframes + SVG attributes
- Mobile responsive (already built in via sticky layout)
- Replace/remove `<section id="s2">`, `<div id="rc0/rc1/rc2/rc3">` refs if not using reading cards

---

## Tailoring

**Colors:**
- Edit `stopColor` in gradient defs (e.g., `#06E8F8` for cyan, `#5B5CEB` for accent)
- Edit stroke widths, opacity values in SVG elements

**SICE Labels:**
- Change the `SICE` array (keep 12 items, grouped by 4)

**Animation Speed:**
- Modify `NODE_THRESH` array for node activation timing
- Edit animation `dur` and `style` properties in SVG elements (e.g., `svg-spin 16s` → `svg-spin 12s`)

---

## Troubleshooting

**SVG not rendering:**
- Ensure refs are properly attached (`svgRef`, `gnodes`, etc.)
- Check browser console for errors

**Scroll animation not triggering:**
- Verify `containerRef` is passed and correctly set on the container element
- Or use `scrollProgress` prop with custom scroll calculation

**Labels not floating:**
- Check `requestAnimationFrame` is running (should auto-start)
- Verify label opacity > 0.05

---

**Ready to integrate!**
