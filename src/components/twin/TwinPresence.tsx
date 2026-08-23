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

import { useMemo, type CSSProperties } from 'react';
import type { Archetype } from '@/context/TwinContext';
import type { WorldId } from '@/constants/worlds';
import { getTwinVisualDNA, type TwinCoreShape } from '@/lib/twin/twinVisualDNA';
import { getUniqueTwinTraits, shiftHue, type TwinUniqueTraits } from '@/lib/twin/twinUniqueness';
import { getTwinWorldContext, type TwinAccessoryKind } from '@/lib/twin/twinWorldContext';

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
  /** P0-H: active World — drives the contextual posture/accessory/expression
   *  layer (twinWorldContext.ts), never Core Identity (color/shape stay
   *  fixed regardless). Omit for a neutral, no-World preview. */
  worldId?: WorldId;
  /** P0-H Gap 4 (visual QA): renders as a normal sized box instead of a
   *  fixed full-viewport overlay, so multiple instances can be shown side
   *  by side (see ComponentShowcase.tsx's "Twin per World" preview grid).
   *  World pages never pass this — default is the existing full-screen
   *  behavior. */
  contained?: boolean;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Blend a hex color toward white by `t` (0 = original color, 1 = white) —
 *  used for the expression glint's per-world "warmth" tint (P0-H Gap 3). */
function mixWithWhite(hex: string, t: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const mix = (c: number) => Math.round(c + (255 - c) * (1 - t));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
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
    <g style={{ transformOrigin: '50px 50px', animation: `${orbitId} calc(9s / var(--twin-pulse-speed, 1) / var(--twin-world-breathe-mult, 1)) linear infinite` }}>
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

/** P0-H Gap 2 — "Clothing/Accessories: Change contextually" (e.g. business
 *  suit in CAREER). Kept abstract/procedural, matching this codebase's
 *  existing no-illustration art style rather than literal clothing — a
 *  small geometric accent per World (see twinWorldContext.ts for the
 *  per-World reasoning), layered near/around the core glyph. */
function TwinAccessory({ kind, color }: { kind: TwinAccessoryKind; color: string }) {
  switch (kind) {
    case 'ring-focus': // SELF — a single still ring, inward focus
      return <circle cx="50" cy="82" r="6" fill="none" stroke={color} strokeWidth="2" opacity="0.75" />;
    case 'spark-arc': // MIND — a quick arc of small sparks above, alertness
      return (
        <g opacity="0.8">
          {[-40, -18, 4].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 34 * Math.sin(rad);
            const y = 18 + 6 * Math.cos(rad);
            return <circle key={deg} cx={x.toFixed(1)} cy={y.toFixed(1)} r="2" fill={color} />;
          })}
        </g>
      );
    case 'bond-links': // RELATIONSHIP — two linked rings, connection
      return (
        <g opacity="0.75" fill="none" stroke={color} strokeWidth="2">
          <circle cx="44" cy="80" r="6" />
          <circle cx="56" cy="80" r="6" />
        </g>
      );
    case 'heart-curve': // LOVE — a soft heart-notch beneath the core
      return (
        <path
          d="M 42 78 Q 46 72 50 78 Q 54 72 58 78 Q 54 86 50 90 Q 46 86 42 78 Z"
          fill={color}
          opacity="0.65"
        />
      );
    case 'collar-bar': // CAREER — horizontal bar + notch, "dressed for work"
      return (
        <g opacity="0.8">
          <rect x="38" y="76" width="24" height="4" rx="2" fill={color} />
          <polygon points="50,76 46,68 54,68" fill={color} />
        </g>
      );
    case 'halo-facets': // WEALTH — small faceted studs, precision/value
      return (
        <g opacity="0.75" fill={color}>
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 32 * Math.cos(rad);
            const y = 50 + 32 * Math.sin(rad);
            return <rect key={deg} x={(x - 2).toFixed(1)} y={(y - 2).toFixed(1)} width="4" height="4" transform={`rotate(45 ${x.toFixed(1)} ${y.toFixed(1)})`} />;
          })}
        </g>
      );
    case 'horizon-arc': // LIFE — a wide shallow arc, open horizon
      return <path d="M 28 84 Q 50 76 72 84" stroke={color} fill="none" strokeWidth="2" opacity="0.7" />;
    case 'sprout': // GROWTH — an upward two-leaf sprout above the core
      return (
        <g opacity="0.75" fill={color}>
          <rect x="49" y="14" width="2" height="10" />
          <ellipse cx="45" cy="16" rx="5" ry="3" transform="rotate(-30 45 16)" />
          <ellipse cx="55" cy="16" rx="5" ry="3" transform="rotate(30 55 16)" />
        </g>
      );
    case 'fork-branch': // DECISION — a branching fork, choices
      return (
        <g opacity="0.75" stroke={color} strokeWidth="2" fill="none">
          <path d="M 50 74 L 50 80" />
          <path d="M 50 80 L 44 88" />
          <path d="M 50 80 L 56 88" />
        </g>
      );
    case 'radiant-beam': // PURPOSE — a single upward beam, direction
      return <polygon points="50,8 46,22 54,22" fill={color} opacity="0.6" />;
    case 'lotus-petal': // WELLBEING — soft layered petals beneath
      return (
        <g opacity="0.65" fill={color}>
          {[-30, 0, 30].map((deg) => (
            <ellipse key={deg} cx="50" cy="82" rx="4" ry="9" transform={`rotate(${deg} 50 82)`} />
          ))}
        </g>
      );
    case 'comet-trail': // FUTURE — a forward-leaning streak, momentum
      return (
        <g opacity="0.7" fill={color}>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={68 + i * 5} cy={36 - i * 4} r={2.5 - i * 0.5} opacity={0.7 - i * 0.15} />
          ))}
        </g>
      );
    default:
      return null;
  }
}

/** P0-H Gap 3 — "Expressions: Adapt to world context". This Twin has no
 *  illustrated face, so "expression" is reinterpreted procedurally: a
 *  small focal glint whose warmth (cool/white → warm/core-color) and blink
 *  speed shift per World mood — the closest honest analog to an expression
 *  for a faceless, abstract Twin. */
function ExpressionGlint({ color, warmth, pulseMs, animId }: { color: string; warmth: number; pulseMs: number; animId: string }) {
  const glintColor = mixWithWhite(color, warmth);
  return (
    <>
      <circle cx="41" cy="39" r="3.2" fill={glintColor} style={{ animation: `${animId} ${pulseMs}ms ease-in-out infinite` }} />
      <style>{`
        @keyframes ${animId} {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.95; }
        }
      `}</style>
    </>
  );
}

export function TwinPresence({ primaryArchetype, secondaryArchetype, worldColor, seedKey, worldId, contained }: TwinPresenceProps) {
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

  // P0-H: contextual posture/accessory/expression layer for the active
  // World — never touches core identity (color/shape) above. See
  // twinWorldContext.ts for why each World's values are what they are.
  const worldCtx = useMemo(() => getTwinWorldContext(worldId), [worldId]);

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

  // P0-H Gap 4 (visual QA): `contained` renders a normal in-flow box for
  // the ComponentShowcase preview grid instead of a fixed full-viewport
  // overlay — World pages never set this, so their behavior is unchanged.
  const containerStyle: CSSProperties = contained
    ? {
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {
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
      };
  const glyphBoxSize = contained ? '80%' : 'min(46vmin, 420px)';

  return (
    <div aria-hidden="true" style={containerStyle}>
      {/* P0-H Gap 1: static per-World posture tilt — a separate outer wrapper
          so it composes with (rather than fights) the animated bob/breathe
          transforms nested inside it. */}
      <div style={{ transform: `rotate(${worldCtx.tiltDeg}deg)`, width: glyphBoxSize, height: glyphBoxSize }}>
      {/* TWINPRESENCE-002: same breathing-scale + gentle vertical bob as the
          Dashboard orb (LivingTwin.tsx's twin-orb-breathe, 4s ease-in-out,
          scale 1→1.05) — kept on its own wrapper so it composes with, rather
          than overwrites, the state-driven scale/rotate transform below. */}
      <div
        className="twin-presence-bob"
        style={{
          width: '100%',
          height: '100%',
          // P0-H Gap 1: per-World bob amplitude/speed — read by the
          // twin-presence-bob keyframes below.
          ['--twin-bob-mult' as string]: worldCtx.bobMultiplier,
        }}
      >
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
            // TWINPRESENCE-005 + P0-H Gap 1: per-Twin breathing variance
            // (0.85–1.2x) composed with this World's own breathe multiplier
            // — read by the CSS breathing animation below, OrbitFacets' spin
            // duration, and ExpressionGlint's blink, so the whole Twin feels
            // like one coherent "creature" whose tempo shifts per World.
            animationDuration: 'calc(var(--twin-breathing-duration, 2500ms) / var(--twin-pulse-speed, 1) / var(--twin-world-breathe-mult, 1))',
            ['--twin-pulse-speed' as string]: traits.pulseSpeedFactor,
            ['--twin-world-breathe-mult' as string]: worldCtx.breatheMultiplier,
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
              50% { transform: translateY(calc(-6px * var(--twin-bob-mult, 1))) scale(calc(1 + 0.03 * var(--twin-bob-mult, 1))); }
            }
            .twin-presence-bob {
              /* P0-H Gap 1: livelier Worlds (higher bob-mult) bounce a
                 little faster too, not just further — reads as more energy,
                 not just a bigger wobble. */
              animation: twin-presence-bob calc(4s / var(--twin-bob-mult, 1)) ease-in-out infinite;
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
            {/* P0-H Gap 2: contextual accessory for the active World. */}
            <TwinAccessory kind={worldCtx.accessory} color={uniqueAuraColor} />
            {/* P0-H Gap 3: contextual "expression" glint for the active World. */}
            <ExpressionGlint
              color={uniqueCoreColor}
              warmth={worldCtx.expressionWarmth}
              pulseMs={worldCtx.expressionPulseMs}
              animId="twin-expression-glint"
            />
          </svg>
        </div>
      </div>
      </div>
    </div>
  );
}

export default TwinPresence;
