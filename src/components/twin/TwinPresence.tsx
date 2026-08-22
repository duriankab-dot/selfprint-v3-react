/**
 * TwinPresence.tsx
 *
 * UNIFIED ARCHITECTURE DIRECTIVE — first real "Twin appears in the World"
 * implementation (§23 Final Experience: "...FULL-SCREEN ENVIRONMENT →
 * TWIN APPEARS → LIGHT/COLOR/SOUND ADAPT..."; §35 World Model requires
 * "TWIN PLACEMENT" as its own step, not optional; §36 explicitly forbids
 * "avatar-over-background" — the Twin must look like it's IN the world).
 *
 * Two layers, matching §34 "World-Aware Twin":
 *   1. CORE IDENTITY (constant across every World) — from twinVisualDNA.ts,
 *      keyed only to the Twin's archetype. Never touched by worldColor,
 *      mood, or time of day.
 *   2. CONTEXTUAL STATE (changes per World/mood/time) — read live from the
 *      `--twin-*` CSS custom properties that `lib/experience/TwinStateEngine`
 *      → `EnvironmentEngine` → `EnvironmentContext` already compute and
 *      inject onto `:root` on every tick. That pipeline was fully built and
 *      correctly wired end to end but had zero consumers (confirmed via
 *      repo-wide grep before writing this file — see VISUAL_DIRECTIVE_001
 *      trace) — this component is that pipeline's first real consumer,
 *      rather than a duplicate state computation (§50 No Duplicate Engines).
 *   3. `worldColor` is used ONLY as a thin aura-ring tint (contextual aura,
 *      per §34) — core color/shape never derive from it.
 *
 * Pure visual layer: no text, no buttons, pointer-events disabled — same
 * rule WorldEnvironment.tsx follows (directive §18).
 */

import { useMemo } from 'react';
import type { Archetype } from '@/context/TwinContext';
import { getTwinVisualDNA, type TwinCoreShape } from '@/lib/twin/twinVisualDNA';

interface TwinPresenceProps {
  primaryArchetype?: Archetype;
  secondaryArchetype?: Archetype;
  /** Current world's accent color — used only as a thin contextual aura tint. */
  worldColor: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** One SVG core glyph per shape family — deliberately simple/abstract
 *  (directive §2: procedural, no illustrated character), reusing the same
 *  visual grammar as WorldEnvironment's ArchetypePattern. */
function CoreGlyph({ shape, color }: { shape: TwinCoreShape; color: string }) {
  switch (shape) {
    case 'sphere':
      return <circle cx="50" cy="50" r="26" fill={color} opacity="0.9" />;
    case 'crystal':
      return <polygon points="50,16 74,50 50,84 26,50" fill={color} opacity="0.88" />;
    case 'ring':
      return <circle cx="50" cy="50" r="24" fill="none" stroke={color} strokeWidth="9" opacity="0.9" />;
    case 'diamond':
      return <polygon points="50,20 68,50 50,80 32,50" fill={color} opacity="0.92" transform="rotate(45 50 50)" />;
    case 'bloom':
      return (
        <g opacity="0.9">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <ellipse
              key={deg}
              cx="50"
              cy="34"
              rx="9"
              ry="18"
              fill={color}
              opacity="0.55"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="10" fill={color} />
        </g>
      );
    case 'wave':
      return (
        <path
          d="M 20 50 Q 32 30 50 50 T 80 50 Q 68 70 50 50 T 20 50 Z"
          fill={color}
          opacity="0.88"
        />
      );
    default:
      return <circle cx="50" cy="50" r="26" fill={color} opacity="0.9" />;
  }
}

export function TwinPresence({ primaryArchetype, secondaryArchetype, worldColor }: TwinPresenceProps) {
  const dna = useMemo(
    () => getTwinVisualDNA(primaryArchetype, secondaryArchetype),
    [primaryArchetype, secondaryArchetype]
  );

  // Aura ring blends: mostly the Twin's own Identity aura color, with a
  // thin contextual tint from the current world — never the reverse.
  const auraGradient = `
    radial-gradient(circle, ${hexToRgba(dna.coreColor, 0.55)} 0%, ${hexToRgba(dna.auraColor, 0.28)} 38%, ${hexToRgba(worldColor, 0.16)} 62%, transparent 78%)
  `;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Lower-middle of the frame, not dead-center — leaves room for
        // header text/UI above without the Twin's core sitting behind it.
        paddingTop: '30vh',
      }}
    >
      <div
        className="twin-presence-breathe"
        style={{
          width: 'min(46vmin, 420px)',
          height: 'min(46vmin, 420px)',
          borderRadius: '50%',
          background: auraGradient,
          // Contextual state — read live from EnvironmentEngine's already-
          // computed, previously-unconsumed --twin-* vars (see file header).
          opacity: 'var(--twin-opacity, 0.85)',
          transform: 'scale(var(--twin-scale, 1)) rotate(var(--twin-rotation, 0deg))',
          transition: 'opacity 500ms ease, transform var(--twin-transition-duration, 500ms) ease',
          animationDuration: 'var(--twin-breathing-duration, 2500ms)',
        }}
      >
        <style>{`
          @keyframes twin-presence-breathe {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(calc(1 + var(--twin-breathing-intensity, 0.08))); }
          }
          .twin-presence-breathe {
            animation-name: twin-presence-breathe;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
        `}</style>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          style={{
            filter: `drop-shadow(0 0 calc(18px * var(--twin-glow-intensity, 0.7)) ${hexToRgba(dna.coreColor, 0.6)})`,
          }}
        >
          <CoreGlyph shape={dna.coreShape} color={dna.coreColor} />
        </svg>
      </div>
    </div>
  );
}

export default TwinPresence;
