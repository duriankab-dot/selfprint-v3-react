/**
 * useTwinIdentity.ts
 *
 * PHASE0 forensic §"ถ้าจะทำ Twin 4 fidelity state" step 2 — single source
 * for the Twin's visual-identity math. Previously computed twice, nearly
 * word for word, in LivingTwin.tsx:124-134 (evolutionStage/glowMult only)
 * and TwinPresence.tsx:327-336 (evolutionStage/glowMult + DNA/traits/
 * colors) — both comments admitted "same as [the other file]". Now one
 * hook both consume via the <Twin /> facade (Twin.tsx).
 *
 * Scope note: TwinState (the 8-step awakening→mastery ladder shown on
 * Dashboard) stays inside LivingTwin.tsx — it needs userId + a React Query
 * fetch + TwinStateEngine and is Dashboard-specific UI (state badge,
 * progress %, ladder, next-milestone text), not part of the Twin's
 * cross-page *visual* identity this hook owns. Pulling it in here would
 * force every facade caller (WorldDetail, CoreAwakening) to pay for a
 * personalContext fetch they don't use.
 */
import { useMemo } from 'react';
import type { Archetype } from '@/context/TwinContext';
import type { WorldId } from '@/constants/worlds';
import { getTwinVisualDNA, type TwinVisualDNA } from '@/lib/twin/twinVisualDNA';
import { getUniqueTwinTraits, shiftHue, type TwinUniqueTraits } from '@/lib/twin/twinUniqueness';
import { getTwinWorldContext, type TwinWorldContext } from '@/lib/twin/twinWorldContext';

export type TwinEvolutionStage = 1 | 2 | 3 | 4;

export interface TwinIdentity {
  /** 1 nascent (0-25) · 2 growing (25-50) · 3 active (50-75) · 4 evolved (75-100) */
  evolutionStage: TwinEvolutionStage;
  /** Glow intensity multiplier per stage — same table both old copies used. */
  glowMult: number;
  glowOpacity: number;
  dna: TwinVisualDNA & { blendAuraColor?: string };
  traits: TwinUniqueTraits;
  uniqueCoreColor: string;
  uniqueAuraColor: string;
  worldCtx: TwinWorldContext;
}

export interface UseTwinIdentityArgs {
  primaryArchetype?: Archetype;
  secondaryArchetype?: Archetype;
  /** Stable per-user key (session.user.id) — same seed HologramBirth.tsx
   *  uses, so the born Twin and the ongoing Twin look like the same one. */
  seedKey?: string;
  /** 0–100. Defaults to 30 (nascent-growing boundary), matching both
   *  original call sites' defaults. */
  maturityScore?: number;
  worldId?: WorldId;
}

// TWIN-VISUAL-001: index 0 unused (evolutionStage is 1-4) — kept so the
// stage number can index directly, exactly as both original copies did.
const GLOW_MULT_BY_STAGE = [0, 0.7, 0.9, 1.15, 1.45] as const;

export function useTwinIdentity({
  primaryArchetype,
  secondaryArchetype,
  seedKey,
  maturityScore = 30,
  worldId,
}: UseTwinIdentityArgs): TwinIdentity {
  const evolutionStage = useMemo((): TwinEvolutionStage => {
    const s = Math.max(0, Math.min(100, maturityScore));
    if (s >= 75) return 4;
    if (s >= 50) return 3;
    if (s >= 25) return 2;
    return 1;
  }, [maturityScore]);

  const glowMult = useMemo(() => GLOW_MULT_BY_STAGE[evolutionStage], [evolutionStage]);
  const glowOpacity = useMemo(() => 0.35 + (glowMult - 0.7) * 0.2, [glowMult]);

  const dna = useMemo(
    () => getTwinVisualDNA(primaryArchetype, secondaryArchetype),
    [primaryArchetype, secondaryArchetype]
  );

  // TWINPRESENCE-005: per-user variation layered on the archetype's shared
  // base DNA — same archetype, never the same Twin.
  const traits = useMemo(
    () => getUniqueTwinTraits(seedKey ?? primaryArchetype ?? 'default-twin'),
    [seedKey, primaryArchetype]
  );

  const uniqueCoreColor = useMemo(
    () => shiftHue(dna.coreColor, traits.hueShiftDeg),
    [dna.coreColor, traits.hueShiftDeg]
  );
  const uniqueAuraColor = useMemo(
    () => shiftHue(dna.auraColor, traits.hueShiftDeg),
    [dna.auraColor, traits.hueShiftDeg]
  );

  // P0-H: contextual posture/accessory/expression layer for the active
  // World — never touches core identity (color/shape) above (§34).
  const worldCtx = useMemo(() => getTwinWorldContext(worldId), [worldId]);

  return {
    evolutionStage,
    glowMult,
    glowOpacity,
    dna,
    traits,
    uniqueCoreColor,
    uniqueAuraColor,
    worldCtx,
  };
}
