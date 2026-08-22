/**
 * WorldEnvironment.tsx
 *
 * P0-H: 12 Hub Worlds Visual & Experience Directive — full-screen environment
 * background layer (directive §17 "Background Asset Specification" /
 * §23 "Final Experience": USER SELECTS HUB → WORLD OPENS →
 * FULL-SCREEN ENVIRONMENT → TWIN APPEARS → LIGHT/COLOR/SOUND ADAPT).
 *
 * No illustrated 4096×4096 art assets exist for the 12 worlds yet (directive
 * §17's production target) — user-confirmed decision: ship a procedural
 * gradient/SVG environment now, matching the directive's §2 Shared Visual DNA
 * (Deep Intelligent Blue foundation + Holographic Intelligence / Energy /
 * Light / Glass / Volumetric light / Cinematic depth / Premium minimalism)
 * and §16 per-world secondary accent, with the same architecture so real
 * illustrated backgrounds can swap in later (this component is the only
 * place that would need to change — callers just pass a worldId).
 *
 * Directive §18 rule respected: this is a PURE visual layer. No navigation,
 * buttons, cards, text, logo, UI, chat bubbles, or avatars are drawn here —
 * those are a separate UI layer composed by the caller on top.
 *
 * VISUAL-DIRECTIVE-001: now consumes the real EnvironmentEngine (via
 * EnvironmentContext, rekeyed to WorldId in the Hub→World merge) so the
 * background actually adapts to time-of-day and mood — not just world color —
 * per directive §37 ("World Transition: lighting/motion/aura must change, not
 * just background"): LightingEngine's --lighting-filter (hue/saturation by
 * time of day) is applied to the whole layer, TimeOfDayEngine's --tod-bg-tint
 * renders as a soft overlay, and ParticleSystemEngine's mood-driven speed +
 * TimeOfDayEngine's energyLevel drive the existing SVG pattern animation
 * durations (previously hardcoded to fixed 90s/6s/10s).
 */

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { WORLDS, DEEP_INTELLIGENT_BLUE, type WorldId, type WorldArchetype } from '../../constants/worlds';
import { useAudio } from '../../context/AudioContext';
import { useEnvironment } from '../../context/EnvironmentContext';

interface WorldEnvironmentProps {
  worldId: WorldId;
  /** 'fixed' covers the viewport (full-screen entry pages); 'absolute' fills
   *  a positioned parent (e.g. behind a chat panel). Default 'fixed'. */
  position?: 'fixed' | 'absolute';
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** One procedural SVG pattern per world archetype (directive §4's "Visual"
 *  notes for each world). Center kept clear (negative space) per §17. */
function ArchetypePattern({ archetype, color, animate }: { archetype: WorldArchetype; color: string; animate: boolean }) {
  const spinClass = animate ? 'world-env-spin' : '';
  const pulseClass = animate ? 'world-env-pulse' : '';
  const driftClass = animate ? 'world-env-drift' : '';

  switch (archetype) {
    case 'core': // SELF — crystal core, concentric energy rings
      return (
        <g className={spinClass} style={{ transformOrigin: '50% 50%' }}>
          {[1, 2, 3, 4].map((n) => (
            <circle key={n} cx="50%" cy="50%" r={`${n * 9}%`} fill="none" stroke={color} strokeWidth="1" opacity={0.5 - n * 0.09} />
          ))}
          <polygon points="50,38 58,50 50,62 42,50" fill={color} opacity="0.35" className={pulseClass} />
        </g>
      );

    case 'network': // MIND — neural nodes, orbital structures
      return (
        <g className={driftClass}>
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = (i / 9) * Math.PI * 2;
            const r = 30 + (i % 3) * 6;
            const cx = 50 + Math.cos(angle) * r;
            const cy = 50 + Math.sin(angle) * r;
            return <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="1.2%" fill={color} opacity="0.6" />;
          })}
          {Array.from({ length: 9 }).map((_, i) => {
            const a1 = (i / 9) * Math.PI * 2;
            const a2 = ((i + 2) / 9) * Math.PI * 2;
            const r = 30 + (i % 3) * 6;
            const r2 = 30 + ((i + 2) % 3) * 6;
            return (
              <line
                key={i}
                x1={`${50 + Math.cos(a1) * r}%`}
                y1={`${50 + Math.sin(a1) * r}%`}
                x2={`${50 + Math.cos(a2) * r2}%`}
                y2={`${50 + Math.sin(a2) * r2}%`}
                stroke={color}
                strokeWidth="0.5"
                opacity="0.25"
              />
            );
          })}
        </g>
      );

    case 'constellation': // RELATIONSHIP — luminous nodes + connecting paths
      return (
        <g className={pulseClass}>
          {[[20, 25], [35, 15], [70, 20], [80, 45], [60, 65], [30, 70], [15, 50]].map(([x, y], i) => (
            <circle key={i} cx={`${x}%`} cy={`${y}%`} r="1%" fill={color} opacity="0.7" />
          ))}
          <polyline
            points="20,25 35,15 70,20 80,45 60,65 30,70 15,50 20,25"
            fill="none"
            stroke={color}
            strokeWidth="0.4"
            opacity="0.3"
          />
        </g>
      );

    case 'heart': // LOVE — soft abstract heart-energy geometry
      return (
        <g className={pulseClass} style={{ transformOrigin: '50% 50%' }}>
          <circle cx="42%" cy="45%" r="14%" fill={color} opacity="0.18" />
          <circle cx="58%" cy="45%" r="14%" fill={color} opacity="0.18" />
          <polygon points="30,52 50,78 70,52" fill={color} opacity="0.14" />
        </g>
      );

    case 'city': // CAREER — vertical structures, branching opportunity paths
      return (
        <g>
          {[20, 32, 44, 56, 68, 80].map((x, i) => (
            <rect
              key={i}
              x={`${x}%`}
              y={`${70 - (i % 3) * 12}%`}
              width="4%"
              height={`${(i % 3) * 12 + 20}%`}
              fill={color}
              opacity="0.2"
              className={driftClass}
            />
          ))}
        </g>
      );

    case 'crystal': // WEALTH — quantum grid, crystalline structures
      return (
        <g className={pulseClass}>
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 5 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={`${18 + col * 13}%`}
                y={`${18 + row * 13}%`}
                width="6%"
                height="6%"
                fill="none"
                stroke={color}
                strokeWidth="0.4"
                opacity="0.25"
                transform={`rotate(45 ${18 + col * 13 + 3} ${18 + row * 13 + 3})`}
              />
            ))
          )}
        </g>
      );

    case 'path': // LIFE — cosmic pathway, horizon, energy trails
      return (
        <g className={driftClass}>
          <path d="M 0 70 Q 50 40 100 60" fill="none" stroke={color} strokeWidth="0.6" opacity="0.3" />
          <path d="M 0 80 Q 50 55 100 75" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" />
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={`${(i * 7.3) % 100}%`} cy={`${8 + ((i * 17) % 30)}%`} r="0.4%" fill={color} opacity="0.5" />
          ))}
        </g>
      );

    case 'organic': // GROWTH — bioluminescent organic growth forms
      return (
        <g className={pulseClass} style={{ transformOrigin: '50% 65%' }}>
          <path
            d="M 50 85 C 45 70 35 65 38 50 C 40 40 48 38 50 25 C 52 38 60 40 62 50 C 65 65 55 70 50 85 Z"
            fill={color}
            opacity="0.22"
          />
          {[[42, 45], [58, 40], [50, 30]].map(([x, y], i) => (
            <circle key={i} cx={`${x}%`} cy={`${y}%`} r="1.5%" fill={color} opacity="0.5" />
          ))}
        </g>
      );

    case 'branch': // DECISION — origin branching into option paths
      return (
        <g>
          <line x1="20%" y1="50%" x2="45%" y2="50%" stroke={color} strokeWidth="0.6" opacity="0.4" />
          <line x1="45%" y1="50%" x2="75%" y2="28%" stroke={color} strokeWidth="0.5" opacity="0.35" />
          <line x1="45%" y1="50%" x2="75%" y2="50%" stroke={color} strokeWidth="0.5" opacity="0.35" />
          <line x1="45%" y1="50%" x2="75%" y2="72%" stroke={color} strokeWidth="0.5" opacity="0.35" />
          <circle cx="45%" cy="50%" r="1%" fill={color} opacity="0.6" />
          {[[75, 28], [75, 50], [75, 72]].map(([x, y], i) => (
            <circle key={i} cx={`${x}%`} cy={`${y}%`} r="0.9%" fill={color} opacity="0.55" className={pulseClass} />
          ))}
        </g>
      );

    case 'temple': // PURPOSE — monumental cosmic geometry, contemplative space
      return (
        <g className={spinClass} style={{ transformOrigin: '50% 50%' }}>
          <circle cx="50%" cy="50%" r="32%" fill="none" stroke={color} strokeWidth="0.5" opacity="0.25" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${50 + Math.cos(angle) * 32}%`}
                y2={`${50 + Math.sin(angle) * 32}%`}
                stroke={color}
                strokeWidth="0.3"
                opacity="0.18"
              />
            );
          })}
        </g>
      );

    case 'sanctuary': // WELLBEING — flowing digital + organic curves
      return (
        <g className={driftClass}>
          <path d="M 0 40 Q 25 30 50 40 T 100 40" fill="none" stroke={color} strokeWidth="0.6" opacity="0.3" />
          <path d="M 0 55 Q 25 65 50 55 T 100 55" fill="none" stroke={color} strokeWidth="0.5" opacity="0.25" />
          <path d="M 0 70 Q 25 62 50 70 T 100 70" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" />
        </g>
      );

    case 'horizon': // FUTURE — expansive horizon, energy arcs
      return (
        <g className={pulseClass}>
          <line x1="0%" y1="62%" x2="100%" y2="62%" stroke={color} strokeWidth="0.4" opacity="0.25" />
          {[18, 26, 34].map((r, i) => (
            <path
              key={i}
              d={`M ${50 - r} 62 A ${r} ${r} 0 0 1 ${50 + r} 62`}
              fill="none"
              stroke={color}
              strokeWidth="0.4"
              opacity={0.3 - i * 0.07}
            />
          ))}
        </g>
      );

    default:
      return null;
  }
}

export function WorldEnvironment({ worldId, position = 'fixed' }: WorldEnvironmentProps) {
  const world = WORLDS[worldId];
  // Directive §2 forbids busy/loud motion ("ห้าม... Neon เยอะเกินไป");
  // AudioContext already carries a user-controlled reduceMotion preference
  // (§ accessibility) — reuse it instead of adding a second motion setting.
  const audio = useAudio();
  const animate = !audio.state.reduceMotion;

  // EnvironmentContext computes against WorldContext.currentWorld (set by
  // WorldDetail.tsx's recordWorldVisit()) — real-time-of-day + real-mood
  // driven, not this component re-deriving anything on its own.
  const { environment } = useEnvironment();

  // Fallback to neutral values before the first compute tick resolves —
  // EnvironmentContext computes synchronously on mount, so this is only
  // ever momentary.
  const lightingFilter = environment?.lighting.cssVars['--lighting-filter'] ?? 'none';
  const bgTint = environment?.timeOfDay.cssVars['--tod-bg-tint'] ?? 'rgba(0,0,0,0)';
  const energyLevel = environment?.timeOfDay.energyLevel ?? 1;
  const particleSpeed = environment?.particles.speed ?? 1;

  const layerStyle = useMemo(
    () => ({
      position,
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none' as const,
      overflow: 'hidden' as const,
      filter: lightingFilter,
      transition: 'filter 800ms ease',
      background: `
        radial-gradient(ellipse at 50% 40%, ${hexToRgba(world.color, 0.16)} 0%, transparent 55%),
        linear-gradient(160deg, ${DEEP_INTELLIGENT_BLUE} 0%, #060F26 100%),
        linear-gradient(${bgTint}, ${bgTint})
      `,
    }),
    [world.color, position, lightingFilter, bgTint]
  );

  // Motion speed now reflects real state instead of fixed durations —
  // higher time-of-day energy / mood-driven particle speed = faster drift,
  // pulse, and spin (directive §37: "aura must change").
  const durationVars = {
    '--world-env-spin-duration': `${(90 / energyLevel).toFixed(1)}s`,
    '--world-env-pulse-duration': `${(6 / particleSpeed).toFixed(1)}s`,
    '--world-env-drift-duration': `${(10 / particleSpeed).toFixed(1)}s`,
  } as CSSProperties;

  return (
    <div aria-hidden="true" style={{ ...layerStyle, ...durationVars }}>
      <style>{`
        @keyframes world-env-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes world-env-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        @keyframes world-env-drift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2%); } }
        .world-env-spin { animation: world-env-spin var(--world-env-spin-duration, 90s) linear infinite; }
        .world-env-pulse { animation: world-env-pulse var(--world-env-pulse-duration, 6s) ease-in-out infinite; }
        .world-env-drift { animation: world-env-drift var(--world-env-drift-duration, 10s) ease-in-out infinite; }
      `}</style>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <ArchetypePattern archetype={world.archetype} color={world.color} animate={animate} />
      </svg>
    </div>
  );
}

export default WorldEnvironment;
