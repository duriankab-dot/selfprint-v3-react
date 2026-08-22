/**
 * WorldExpertiseService.ts
 * Track Twin's expertise and preferences per world
 * (Phase D: World expertise mapping)
 */

import { supabase } from './supabase-service';
import type { WorldId } from '../constants/worlds';

export interface WorldExpertise {
  twinId: string;
  world: WorldId;
  interactionCount: number;
  lastInteractionAt: string;
  expertise_score: number; // 0-100
  confidence: number; // 0-100
}

export interface TwinWorldPreferences {
  twinId: string;
  primaryWorld?: WorldId; // Most used world
  favoriteWorlds: WorldId[]; // Top 3 worlds by usage
  lastWorld?: WorldId; // Remember last world visited
  totalWorldsExplored: number;
}

/**
 * Record a world interaction and update expertise
 *
 * P0-D FIX: the previous version upserted interaction_count: 1 and
 * expertise_score: expertiseGain on every call — a flat RESET, not an
 * increment (the comment even admitted it relied on "a trigger" that never
 * existed). Now reads the current row first and accumulates, the same
 * read-then-upsert pattern already used by WorldContext.recordWorldVisit().
 */
export async function recordWorldInteraction(
  twinId: string,
  world: WorldId,
  expertiseGain: number = 5 // 0-100
): Promise<void> {
  if (!supabase) return;

  try {
    const { data: existing } = await supabase
      .from('twin_world_expertise')
      .select('interaction_count, expertise_score')
      .eq('twin_id', twinId)
      .eq('world', world)
      .single();

    const nextInteractionCount = (existing?.interaction_count || 0) + 1;
    const nextExpertiseScore = Math.min(100, (existing?.expertise_score ?? 0) + expertiseGain);

    const { error } = await supabase
      .from('twin_world_expertise')
      .upsert(
        {
          twin_id: twinId,
          world,
          interaction_count: nextInteractionCount,
          last_interaction_at: new Date().toISOString(),
          expertise_score: nextExpertiseScore,
          confidence: Math.min(100, Math.round(nextExpertiseScore * 0.8)),
        },
        { onConflict: 'twin_id,world' }
      );

    if (error) {
      console.error('Error recording world interaction:', error);
    }
  } catch (err) {
    console.error('World expertise recording failed:', err);
  }
}

/**
 * Get Twin's world preferences
 */
export async function getTwinWorldPreferences(
  twinId: string
): Promise<TwinWorldPreferences | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('twin_world_expertise')
      .select('world, interaction_count, expertise_score, last_interaction_at')
      .eq('twin_id', twinId)
      .order('interaction_count', { ascending: false });

    if (error || !data) return null;

    const worlds = data.map(d => d.world as WorldId);
    const primaryWorld = worlds[0];
    const favoriteWorlds = worlds.slice(0, 3);

    return {
      twinId,
      primaryWorld,
      favoriteWorlds,
      lastWorld: primaryWorld,
      totalWorldsExplored: worlds.length,
    };
  } catch (err) {
    console.error('Error fetching world preferences:', err);
    return null;
  }
}

/**
 * Get expertise score for a specific world
 */
export async function getWorldExpertiseScore(
  twinId: string,
  world: WorldId
): Promise<number> {
  if (!supabase) return 50; // Default neutral score

  try {
    const { data, error } = await supabase
      .from('twin_world_expertise')
      .select('expertise_score')
      .eq('twin_id', twinId)
      .eq('world', world)
      .single();

    if (error || !data) return 50; // Default if not found
    return data.expertise_score || 50;
  } catch (err) {
    console.error('Error getting expertise score:', err);
    return 50;
  }
}

/**
 * Update Twin mood based on world context
 * (Optional: mood affects Twin responses)
 */
export function inferMoodFromWorld(world: WorldId): string {
  const moodMap: Record<WorldId, string> = {
    self: 'introspective',
    mind: 'analytical',
    relationship: 'empathetic',
    love: 'vulnerable',
    career: 'strategic',
    wealth: 'practical',
    life: 'exploratory',
    growth: 'encouraging',
    decision: 'thoughtful',
    purpose: 'visionary',
    wellbeing: 'nurturing',
    future: 'optimistic',
  };

  return moodMap[world] || 'balanced';
}
