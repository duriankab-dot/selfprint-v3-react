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
 * TWIN-STATE-MERGE-001 (7 ก.ย. 2026): TwinState (the 8-step awakening→
 * mastery ladder) is now also sourced from here, gated behind the optional
 * `userId` arg — LivingTwin.tsx is the only caller that passes it, so
 * WorldDetail/CoreAwakening/TwinPresence's internal call (none of which
 * pass userId) don't pay for a query they don't use. The query key stays
 * exactly `['personalContext', userId]` — the same key IntelligencePanel/
 * ExecutiveSummary already use — so this shares their React Query cache
 * entry instead of creating a second, competing one for the same data.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Archetype } from '@/context/TwinContext';
import type { WorldId } from '@/constants/worlds';
import { getTwinVisualDNA, type TwinVisualDNA } from '@/lib/twin/twinVisualDNA';
import { getUniqueTwinTraits, shiftHue, type TwinUniqueTraits } from '@/lib/twin/twinUniqueness';
import { getTwinWorldContext, type TwinWorldContext } from '@/lib/twin/twinWorldContext';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import { TwinStateEngine, type TwinStateResult } from '@/lib/intelligence/TwinStateEngine';

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
  /** TWIN-STATE-MERGE-001: populated only when `userId` is passed to the
   *  hook — null while loading, or when no userId was given at all. */
  twinState: TwinStateResult | null;
  isTwinStateLoading: boolean;
  /** Exposed so callers (LivingTwin's <Ladder/>) can still use
   *  engine.getAllStates()/stateIndex() without instantiating their own. */
  twinStateEngine: TwinStateEngine;
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
  /** TWIN-STATE-MERGE-001: opt in to fetching TwinState (8-step ladder).
   *  Omit for callers that only need the Twin's *visual* identity — the
   *  facade's WorldDetail/CoreAwakening renderers never pass this. */
  userId?: string;
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
  userId,
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

  // TWIN-STATE-MERGE-001: same 'personalContext' query key IntelligencePanel
  // / ExecutiveSummary / (previously) LivingTwin itself already use — React
  // Query dedupes/shares the cache entry across all of them, so this never
  // triggers a second fetch for a userId another component already loaded.
  const contextBuilder = useMemo(() => new PersonalContextBuilder(), []);
  const twinStateEngine = useMemo(() => new TwinStateEngine(), []);

  const { data: personalContext, isLoading: isTwinStateLoading } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () => contextBuilder.getContext(userId as string),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const twinState = useMemo(
    () => (userId ? twinStateEngine.computeState(personalContext ?? null) : null),
    [userId, personalContext, twinStateEngine]
  );

  return {
    evolutionStage,
    glowMult,
    glowOpacity,
    dna,
    traits,
    uniqueCoreColor,
    uniqueAuraColor,
    worldCtx,
    twinState,
    isTwinStateLoading: !!userId && isTwinStateLoading,
    twinStateEngine,
  };
}
