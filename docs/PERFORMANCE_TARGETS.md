# PERFORMANCE TARGETS — Selfprint Production

**Version:** 1.0  
**Date:** 2026-08-19  
**Status:** Targets defined — measurement pending  

---

## CORE WEB VITALS TARGETS

| Metric | Target | Good | Needs Work | Poor |
|--------|--------|------|------------|------|
| First Contentful Paint (FCP) | **< 1.5s** | < 1.8s | 1.8–3s | > 3s |
| Largest Contentful Paint (LCP) | **< 2.5s** | < 2.5s | 2.5–4s | > 4s |
| Cumulative Layout Shift (CLS) | **< 0.1** | < 0.1 | 0.1–0.25 | > 0.25 |
| Interaction to Next Paint (INP) | **< 200ms** | < 200ms | 200–500ms | > 500ms |
| Time to First Byte (TTFB) | **< 800ms** | < 800ms | 800–1800ms | > 1800ms |

---

## BUNDLE SIZE TARGETS

| Asset | Target (gzipped) | Hard Limit |
|-------|-----------------|------------|
| Initial HTML | < 30 KB | 50 KB |
| Main JavaScript | < 300 KB | 500 KB |
| CSS | < 50 KB | 80 KB |
| Total Initial Payload | < 500 KB | 800 KB |

> **Project footprint (~260 MB) ≠ Initial payload.** See SELFPRINT SENIOR DEV SKILL for policy.

---

## SELFPRINT-SPECIFIC TARGETS

```
First UI visible          < 1 second
User interaction ready    < 2 seconds
Voice engine ready        < 3 seconds (after UI ready)
Character loaded          < 4 seconds (lazy, after interaction)
Fingerprint module        On-demand only (lazy load)
SICE engines              Background / on-demand
Return visit (cached)     < 500ms first paint
```

---

## RENDERING TARGETS

| Device | Network | LCP Target |
|--------|---------|-----------|
| Desktop | Fast (100 Mbps) | < 1.5s |
| Desktop | Slow 3G | < 3s |
| Mobile (high-end) | 4G | < 2.5s |
| Mobile (mid-range) | 4G | < 3s |
| Mobile (low-end) | 3G | < 4s |

---

## ANIMATION TARGETS

- Smooth at **60 fps** on high-end devices
- Acceptable at **30 fps** on mid-range devices  
- Disable non-critical animations on low-end devices (use `prefers-reduced-motion`)

---

## MEASUREMENT TOOLS

| Tool | When | What |
|------|------|------|
| Lighthouse | Every build | FCP, LCP, CLS, INP, TTFB |
| Web Vitals API | Production | Real user metrics (RUM) |
| Sentry Performance | Production | Error rates + performance traces |
| Vite Bundle Analyzer | Every release | Bundle composition + chunk sizes |
| Chrome DevTools | Feature dev | Main thread, memory, network |

---

## HOW TO MEASURE (Commands)

```bash
# Bundle size analysis
npm run build
npx vite-bundle-visualizer  # or check dist/ sizes

# Lighthouse (local)
npx lighthouse http://localhost:5173 --view

# Type check + build
tsc -b && npm run build

# Check initial payload size
ls -lh dist/assets/ | sort -k5 -hr | head -20
```

---

## BUDGET ALERTS

Fail the build if:
- Any single JS chunk > 500 KB (uncompressed)
- Total initial JS > 800 KB (uncompressed)
- Build time > 120 seconds

---

## BASELINE (2026-08-19)

To be measured after first production deploy. Target: all metrics in "Good" range.

See: `docs/PERFORMANCE_BASELINE.md` for current measurements.

---

*These targets follow the Selfprint Senior Dev skill principle:*  
> **"Make Selfprint FEEL FASTER — not just look smaller."**
