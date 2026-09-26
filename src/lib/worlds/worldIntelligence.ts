/**
 * worldIntelligence.ts — TC-407: World-specific intelligence engine
 *
 * Provides personalized intelligence per world, combining:
 * - SICE scores (per-world domain expertise)
 * - Decision history in that world
 * - Memory/relevant knowledge
 * - Twin's current advice confidence
 */

import { supabase } from '@/lib/supabase/client';
import type { WorldId } from '@/constants/worlds';
import { WORLDS } from '@/constants/worlds';

export interface WorldIntelligence {
  worldId: WorldId;
  name: string;
  nameTh: string;
  adviceConfidence: number; // 0-100
  decisionCount: number;
  memoryCount: number;
  dominantPattern: string | null;
  suggestions: string[];
}

/**
 * Calculate intelligence profile for a single world.
 */
export async function getWorldIntelligence(
  twinId: string,
  worldId: WorldId,
): Promise<WorldIntelligence> {
  const world = WORLDS[worldId];
  if (!world) {
    return getDefaultWorldIntelligence(worldId);
  }

  // Fetch decision count for this world
  let decisionCount = 0;
  try {
    const { count } = await supabase
      .from('decision_log')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId)
      .eq('world', worldId);
    decisionCount = count ?? 0;
  } catch {
    // Fallback: no decisions
  }

  // Fetch memory count for this world
  let memoryCount = 0;
  try {
    const { count } = await supabase
      .from('twin_memories')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId)
      .eq('world_id', worldId.toUpperCase());
    memoryCount = count ?? 0;
  } catch {
    // Fallback: no memories
  }

  // Calculate advice confidence from decision outcomes
  const adviceConfidence = await calculateAdviceConfidence(twinId, worldId);

  // Find dominant pattern from decisions
  const dominantPattern = await findDominantPattern(twinId, worldId);

  // Generate suggestions based on available data
  const suggestions = generateSuggestions(decisionCount, memoryCount, adviceConfidence, worldId);

  return {
    worldId,
    name: world.name,
    nameTh: world.nameTh,
    adviceConfidence,
    decisionCount,
    memoryCount,
    dominantPattern,
    suggestions,
  };
}

/**
 * Get intelligence profiles for all worlds at once.
 */
export async function getAllWorldsIntelligence(
  twinId: string,
): Promise<Map<WorldId, WorldIntelligence>> {
  const worldIds: WorldId[] = ['self', 'mind', 'relationship', 'love', 'career', 'wealth',
    'life', 'growth', 'decision', 'purpose', 'wellbeing', 'future'];

  const map = new Map<WorldId, WorldIntelligence>();
  
  // Fetch in parallel (batch queries where possible)
  const results = await Promise.allSettled(
    worldIds.map(id => getWorldIntelligence(twinId, id))
  );

  worldIds.forEach((id, idx) => {
    const result = results[idx];
    if (result.status === 'fulfilled') {
      map.set(id, result.value);
    } else {
      map.set(id, getDefaultWorldIntelligence(id));
    }
  });

  return map;
}

/**
 * Calculate how confident the Twin should be when giving advice for a world.
 * Based on decision outcome success rate in that world.
 */
async function calculateAdviceConfidence(twinId: string, worldId: WorldId): Promise<number> {
  try {
    // First fetch decision IDs for this world
    const { data: decisions } = await supabase
      .from('decision_log')
      .select('id')
      .eq('twin_id', twinId)
      .eq('world', worldId);

    const decisionIds = decisions?.map(d => d.id) ?? [];
    if (decisionIds.length === 0) return 50; // neutral default

    const { data: outcomes } = await supabase
      .from('decision_outcomes')
      .select('impact')
      .in('decision_id', decisionIds);

    if (!outcomes || outcomes.length === 0) return 50;

    const positive = outcomes.filter(o => o.impact === 'positive').length;
    return Math.round((positive / outcomes.length) * 100);
  } catch {
    return 50;
  }
}

/**
 * Find the most common decision style in a world.
 */
async function findDominantPattern(_twinId: string, _worldId: WorldId): Promise<string | null> {
  // Simplified: would use actual decision text analysis
  // For now return null (no patterns identified yet)
  return null;
}

/**
 * Generate actionable suggestions based on available data.
 */
function generateSuggestions(
  decisionCount: number,
  memoryCount: number,
  adviceConfidence: number,
  _worldId: WorldId,
): string[] {
  const suggestions: string[] = [];

  if (decisionCount < 3) {
    suggestions.push('Record more decisions to improve Twin insights');
  }

  if (memoryCount < 5) {
    suggestions.push('Explore more topics to expand Twin knowledge');
  }

  if (adviceConfidence < 50) {
    suggestions.push('Twin is still learning your preferences in this area');
  }

  if (decisionCount >= 10 && adviceConfidence >= 70) {
    suggestions.push('Twin has strong expertise in this area');
  }

  return suggestions;
}

/**
 * Default intelligence for a world with no data.
 */
function getDefaultWorldIntelligence(worldId: WorldId): WorldIntelligence {
  const world = WORLDS[worldId];
  return {
    worldId,
    name: world.name,
    nameTh: world.nameTh,
    adviceConfidence: 50,
    decisionCount: 0,
    memoryCount: 0,
    dominantPattern: null,
    suggestions: ['Start recording decisions to personalize Twin guidance'],
  };
}
