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
import { getUniqueTwinTraits, shiftHue, type TwinUniqueTraits } from '@/lib/twin/twinUniqueness';

interface TwinPresenceProps {
  primaryArchetype?: Archetype;
  secondaryArchetype?: Archetype;
  /** Current world's accent color — used only as a thin contextual aura tint. */
  worldColor: string;
  /** TWINPRESENCE-005: stable per-user key (session.user.id) used to derive
   *  this Twin's unique traits on top of its archetype's shared base DNA —
   *  same seed HologramBirth.tsx uses during the birth ceremony, so the
   *  Twin looks like the same one the user watched being born. Falls back
   *  to the archetype name if a session id isn't available yet. */
  seedKey?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** TWINPRESENCE-005: perturb a regular polygon's vertex radii using the
 *  Twin's shapeJitterSeed so no two same-archetype crystal/diamond Twins
 *  share an identical silhouette — still reads as "the same shape family",
 *  just subtly, permanently one-of-a-kind. */
function jitteredPolygonPoints(
  vertexCount: number,
  baseRadius: number,
  startAngleDeg: number,
  jitterSeed: number,
  jitterAmount = 0.14
): string {
  const points: string[] = [];
  for (let i = 0; i < vertexCount; i++) {
    const angle = ((startAngleDeg + (360 / vertexCount) * i) * Math.PI) / 180;
    // Deterministic per-vertex wobble derived from the seed, not random.
    const wobble = 1 + jitterAmount * Math.sin(jitterSeed * 100 + i * 2.4);
    const r = baseRadius * wobble;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

/** TWINPRESENCE-005: small orbiting facets ringing the core glyph — count,
 *  radius, size, spin direction and starting angle all come from this
 *  Twin's unique traits, so the "constellation" around the core is never
 *  identical between two Twins of the same archetype. */
function OrbitFacets({ color, traits, orbitId }: { color: string; traits: TwinUniqueTraits; orbitId: string }) {
  const facetRadius = 26 * traits.facetRadiusRatio + 10;
  const facetSize = 3.2 * traits.facetSizeRatio;
  const facets = Array.from({ length: traits.facetCount }, (_, i) => {
    const angle = (360 / traits.facetCount) * i + traits.rotationOffsetDeg;
    const rad = (angle * Math.PI) / 180;
    const x = 50 + facetRadius * Math.cos(rad);
    const y = 50 + facetRadius * Math.sin(rad);
    return (
      <circle
        key={i}
        cx={x.toFixed(2)}
        cy={y.toFixed(2)}
        r={facetSize.toFixed(2)}
        fill={color}
        opacity={0.55 + (i % 3) * 0.12}
      />
    );
  });

  return (
    <g style={{ transformOrigin: '50px 50px', animation: `${orbitId} calc(9s / var(--twin-pulse-speed, 1)) linear infinite` }}>
      {facets}
      <style>{`
        @keyframes ${orbitId} {
          from { transform: rotate(0deg); }
          to { transform: rotate(${traits.orbitDirection * 360}deg); }
        }
      `}</style>
    </g>
  );
}

/** One SVG core glyph per shape family — deliberately simple/abstract
 *  (directive §2: procedural, no illustrated character), reusing the same
 *  visual grammar as WorldEnvironment's ArchetypePattern. Per-Twin unique
 *  traits (TWINPRESENCE-005) add polygon jitter + a starting rotation so
 *  the same archetype never renders pixel-identical across two Twins. */
function CoreGlyph({ shape, color, traits }: { shape: TwinCoreShape; color: string; traits: TwinUniqueTraits }) {
  const rot = `rotate(${traits.rotationOffsetDeg} 50 50)`;
  switch (shape) {
    case 'sphere':
      return <circle cx="50" cy="50" r="26" fill={color} opacity="0.9" />;
    case 'crystal':
      return (
        <polygon
          points={jitteredPolygonPoints(4, 26, -90 + traits.rotationOffsetDeg, traits.shapeJitterSeed)}
          fill={color}
          opacity="0.88"
        />
      );
    case 'ring':
      return <circle cx="50" cy="50" r="24" fill="none" stroke={color} strokeWidth="9" opacity="0.9" />;
    case 'diamond':
      return (
        <polygon
          points={jitteredPolygonPoints(4, 24, traits.rotationOffsetDeg, traits.shapeJitterSeed)}
          fill={color}
          opacity="0.92"
          transform={rot}
        />
      );
    case 'bloom':
      return (
        <g opacity="0.9" transform={rot}>
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

export function TwinPresence({ primaryArchetype, secondaryArchetype, worldColor, seedKey }: TwinPresenceProps) {
  const dna = useMemo(
    () => getTwinVisualDNA(primaryArchetype, secondaryArchetype),
    [primaryArchetype, secondaryArchetype]
  );

  // TWINPRESENCE-005: per-user variation layered on the archetype's shared
  // base DNA — same archetype, never the same Twin. See twinUniqueness.ts.
  const traits = useMemo(
    () => getUniqueTwinTraits(seedKey ?? primaryArchetype ?? 'default-twin'),
    [seedKey, primaryArchetype]
  );
  const uniqueCoreColor = useMemo(() => shiftHue(dna.coreColor, traits.hueShiftDeg), [dna.coreColor, traits.hueShiftDeg]);
  const uniqueAuraColor = useMemo(() => shiftHue(dna.auraColor, traits.hueShiftDeg), [dna.auraColor, traits.hueShiftDeg]);

  // TWINPRESENCE-004: previous gradient faded all the way to `transparent`,
  // which read as "see-through to the World background" instead of a solid
  // presence — same complaint didn't apply to the Dashboard orb because
  // living-twin.css's .living-twin__orb gradient never goes past 20% alpha
  // even at its outer edge. Matched that structure here: an off-center
  // white highlight (same "glossy sphere" look) through to a solid-ish
  // core, ending at a non-zero edge alpha instead of `transparent` — the
  // box-shadow below (not this gradient) is what supplies the soft outer
  // falloff, exactly like the Dashboard orb.
  const auraGradient = `
    radial-gradient(circle at 38% 35%, ${hexToRgba('#ffffff', 0.3)} 0%, ${hexToRgba(uniqueCoreColor, 0.85)} 35%, ${hexToRgba(uniqueAuraColor, 0.55)} 70%, ${hexToRgba(worldColor, 0.35)} 100%)
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
      {/* TWINPRESENCE-002: same breathing-scale + gentle vertical bob as the
          Dashboard orb (LivingTwin.tsx's twin-orb-breathe, 4s ease-in-out,
          scale 1→1.05) — kept on its own wrapper so it composes with, rather
          than overwrites, the state-driven scale/rotate transform below. */}
      <div className="twin-presence-bob" style={{ width: 'min(46vmin, 420px)', height: 'min(46vmin, 420px)' }}>
        <div
          className="twin-presence-breathe"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: auraGradient,
            // TWINPRESENCE-002: on some Worlds the aura color sits close
            // enough to WorldEnvironment's own ambient palette that the glow
            // read as "part of the background" rather than a distinct Twin
            // presence — same glow strength as the Dashboard orb
            // (living-twin.css's .living-twin__orb box-shadow) so both
            // read as the same Twin.
            boxShadow: `0 0 0 1px ${hexToRgba(uniqueCoreColor, 0.55)}, 0 0 32px ${hexToRgba(uniqueCoreColor, 0.55)}, 0 0 64px ${hexToRgba(uniqueCoreColor, 0.3)}, inset 0 0 32px ${hexToRgba('#ffffff', 0.08)}`,
            // Contextual state — read live from EnvironmentEngine's already-
            // computed, previously-unconsumed --twin-* vars (see file header).
            opacity: 'var(--twin-opacity, 0.92)',
            transform: 'scale(var(--twin-scale, 1)) rotate(var(--twin-rotation, 0deg))',
            transition: 'opacity 500ms ease, transform var(--twin-transition-duration, 500ms) ease',
            // TWINPRESENCE-005: per-Twin breathing speed variance (0.85–1.2x)
            // — read by both the CSS breathing animation below and by
            // OrbitFacets' spin duration, so the whole Twin feels like one
            // coherent "creature" with its own tempo.
            animationDuration: 'calc(var(--twin-breathing-duration, 2500ms) / var(--twin-pulse-speed, 1))',
            ['--twin-pulse-speed' as string]: traits.pulseSpeedFactor,
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
            @keyframes twin-presence-bob {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-6px) scale(1.03); }
            }
            .twin-presence-bob {
              animation: twin-presence-bob 4s ease-in-out infinite;
            }
          `}</style>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            style={{
              filter: `drop-shadow(0 0 calc(22px * var(--twin-glow-intensity, 0.85)) ${hexToRgba(uniqueCoreColor, 0.75)})`,
            }}
          >
            <CoreGlyph shape={dna.coreShape} color={uniqueCoreColor} traits={traits} />
            {/* TWINPRESENCE-005: orbiting facets — this Twin's own
                "constellation", never identical to another Twin's. */}
            <OrbitFacets color={uniqueAuraColor} traits={traits} orbitId="twin-orbit-facets" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default TwinPresence;
