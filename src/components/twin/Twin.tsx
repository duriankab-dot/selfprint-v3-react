/**
 * Twin.tsx
 *
 * PHASE0 forensic §"ถ้าจะทำ Twin 4 fidelity state" step 3 — the single
 * facade every page calls instead of reaching for TwinPresence or
 * HologramBirth directly. Resolves a renderer from useTwinFidelity():
 *
 *   FALLBACK → TwinFallbackRenderer (static gradient, zero motion)
 *   LOW      → TwinLowRenderer (CSS-only breathing orb, no SVG)
 *   MEDIUM   → TwinPresence (SVG + CSS var pipeline — full detail)
 *   HIGH     → TwinThreeRenderer (Three.js Living Body) + TwinPresence
 *              (SVG Intelligence Layer) — Master Concept:
 *                Three.js = Physical Embodiment / Living Body
 *                SVG      = Intelligence Language / Signals
 *                CSS      = UI / Surface
 *
 * variant="birth" delegates to HologramBirth (kept as-is, canvas 2D, C5)
 * for MEDIUM/HIGH fidelity, but skips the 150-particle canvas simulation
 * under FALLBACK (reduced-motion / Save-Data) — the birth moment still
 * happens (a brief opacity fade of the Twin's real color), just without
 * motion that could trigger vestibular symptoms or spend a metered
 * connection. Previously HologramBirth had no reduced-motion check at all.
 */

import { useEffect, useMemo, type CSSProperties } from 'react';
import type { Archetype } from '@/context/TwinContext';
import type { WorldId } from '@/constants/worlds';
import { useTwinFidelity } from '@/hooks/useTwinFidelity';
import { useTwinIdentity } from '@/hooks/useTwinIdentity';
import { getTwinVisualDNA } from '@/lib/twin/twinVisualDNA';
import { TwinPresence } from './TwinPresence';
import { HologramBirth } from './HologramBirth';
import { TwinThreeRenderer } from './TwinThreeRenderer';

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Same containerStyle logic as TwinPresence — kept identical so switching
 *  fidelity tiers never shifts the Twin's position/size on screen. */
function useTwinContainerStyle(contained?: boolean): { containerStyle: CSSProperties; glyphBoxSize: string } {
  return useMemo(() => {
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
          paddingTop: '30vh',
        };
    return { containerStyle, glyphBoxSize: contained ? '80%' : 'min(46vmin, 420px)' };
  }, [contained]);
}

interface TwinPresenceVariantProps {
  variant?: 'presence';
  primaryArchetype?: Archetype;
  secondaryArchetype?: Archetype;
  /** Current world's accent color — thin contextual aura tint only. */
  worldColor: string;
  seedKey?: string;
  worldId?: WorldId;
  contained?: boolean;
  maturityScore?: number;
}

interface TwinBirthVariantProps {
  variant: 'birth';
  onComplete: () => void;
  primaryArchetype?: Archetype;
  secondaryArchetype?: Archetype;
  seedKey?: string;
}

export type TwinProps = TwinPresenceVariantProps | TwinBirthVariantProps;

// ============================================================================
// FALLBACK renderer — static gradient, zero motion, no SVG.
// ============================================================================
function TwinFallbackRenderer({
  primaryArchetype,
  secondaryArchetype,
  worldColor,
  contained,
}: Pick<TwinPresenceVariantProps, 'primaryArchetype' | 'secondaryArchetype' | 'worldColor' | 'contained'>) {
  const dna = useMemo(
    () => getTwinVisualDNA(primaryArchetype, secondaryArchetype),
    [primaryArchetype, secondaryArchetype]
  );
  const { containerStyle, glyphBoxSize } = useTwinContainerStyle(contained);

  return (
    <div aria-hidden="true" style={containerStyle}>
      <div
        style={{
          width: glyphBoxSize,
          height: glyphBoxSize,
          borderRadius: '50%',
          background: `radial-gradient(circle at 38% 35%, ${hexToRgba('#ffffff', 0.25)} 0%, ${hexToRgba(dna.coreColor, 0.75)} 45%, ${hexToRgba(worldColor, 0.3)} 100%)`,
        }}
      />
    </div>
  );
}

// ============================================================================
// LOW renderer — CSS-only breathing orb (no SVG glyph/facets/accessory).
// ============================================================================
function TwinLowRenderer({
  primaryArchetype,
  secondaryArchetype,
  seedKey,
  maturityScore,
  contained,
}: Pick<TwinPresenceVariantProps, 'primaryArchetype' | 'secondaryArchetype' | 'seedKey' | 'maturityScore' | 'contained'>) {
  const identity = useTwinIdentity({ primaryArchetype, secondaryArchetype, seedKey, maturityScore });
  const { containerStyle, glyphBoxSize } = useTwinContainerStyle(contained);

  return (
    <div aria-hidden="true" style={containerStyle}>
      <div
        className="twin-low-breathe"
        style={{
          width: glyphBoxSize,
          height: glyphBoxSize,
          borderRadius: '50%',
          background: `radial-gradient(circle at 38% 35%, ${hexToRgba('#ffffff', 0.3)} 0%, ${hexToRgba(identity.uniqueCoreColor, 0.85)} 45%, ${hexToRgba(identity.uniqueAuraColor, 0.4)} 100%)`,
          boxShadow: [
            `0 0 0 1px ${hexToRgba(identity.uniqueCoreColor, 0.3 + 0.25 * identity.glowMult)}`,
            `0 0 ${Math.round(28 * identity.glowMult)}px ${hexToRgba(identity.uniqueCoreColor, 0.4)}`,
          ].join(', '),
        }}
      />
      <style>{`
        @keyframes twin-low-breathe {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.08); }
        }
        .twin-low-breathe {
          animation: twin-low-breathe 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Birth variant
// ============================================================================
function TwinBirthFallback({ color, onComplete }: { color: string; onComplete: () => void }) {
  // FALLBACK birth: no 150-particle canvas simulation. Pure opacity fade
  // (no scale/position motion) so the "you watched your Twin appear"
  // moment still happens without triggering reduced-motion concerns.
  useEffect(() => {
    const t = setTimeout(onComplete, 1500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        aria-hidden="true"
        style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${hexToRgba(color, 0.9)} 0%, ${hexToRgba(color, 0.3)} 70%, transparent 100%)`,
          animation: 'twin-birth-fallback-fade 1.5s ease-out forwards',
        }}
      />
      <style>{`
        @keyframes twin-birth-fallback-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Facade
// ============================================================================
export function Twin(props: TwinProps) {
  const fidelity = useTwinFidelity();

  if (props.variant === 'birth') {
    const dna = getTwinVisualDNA(props.primaryArchetype);
    if (fidelity === 'FALLBACK') {
      return <TwinBirthFallback color={dna.coreColor} onComplete={props.onComplete} />;
    }
    return (
      <HologramBirth
        onComplete={props.onComplete}
        color={dna.coreColor}
        primaryArchetype={props.primaryArchetype}
        secondaryArchetype={props.secondaryArchetype}
        seedKey={props.seedKey}
      />
    );
  }

  const { primaryArchetype, secondaryArchetype, worldColor, seedKey, worldId, contained, maturityScore } = props;

  if (fidelity === 'FALLBACK') {
    return (
      <TwinFallbackRenderer
        primaryArchetype={primaryArchetype}
        secondaryArchetype={secondaryArchetype}
        worldColor={worldColor}
        contained={contained}
      />
    );
  }

  if (fidelity === 'LOW') {
    return (
      <TwinLowRenderer
        primaryArchetype={primaryArchetype}
        secondaryArchetype={secondaryArchetype}
        seedKey={seedKey}
        maturityScore={maturityScore}
        contained={contained}
      />
    );
  }

  if (fidelity === 'MEDIUM') {
    // MEDIUM: SVG-only (no Three.js)
    return (
      <TwinPresence
        primaryArchetype={primaryArchetype}
        secondaryArchetype={secondaryArchetype}
        worldColor={worldColor}
        seedKey={seedKey}
        worldId={worldId}
        contained={contained}
        maturityScore={maturityScore}
      />
    );
  }

  // HIGH: Three.js Living Body + SVG Intelligence Layer
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <TwinThreeRenderer
        primaryArchetype={primaryArchetype}
        secondaryArchetype={secondaryArchetype}
        worldColor={worldColor}
        seedKey={seedKey}
        maturityScore={maturityScore}
      />
      <TwinPresence
        primaryArchetype={primaryArchetype}
        secondaryArchetype={secondaryArchetype}
        worldColor={worldColor}
        seedKey={seedKey}
        worldId={worldId}
        contained={contained}
        maturityScore={maturityScore}
      />
    </div>
  );
}

export default Twin;
