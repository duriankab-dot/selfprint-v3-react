/**
 * loadRecentMemories.ts
 * P0-I: Memory/Decision Loop — load recent twin_memories for prompt injection
 *
 * Queries twin_memories by twin_id (required) + optional worldId filter.
 * Returns Memory[] compatible with buildPrompt() — max 10 entries, ordered
 * most-recent-first so the cap keeps the freshest context.
 *
 * Security: reads only rows where twin_id matches the caller's twin.
 * RLS on twin_memories ensures the user can only read their own records.
 *
 * §P0-I-001
 */

import { supabase } from '../../services/supabase-service';
import type { Memory } from '../prompts/promptBuilder';

/**
 * Options for loadRecentMemories filtering
 */
export interface LoadRecentMemoriesOptions {
  /** Weight to boost memories matching current world (+20% score) */
  worldRelevanceBoost?: boolean;
  /** Minimum confidence threshold (stored in memory if available). Default: none */
  minConfidence?: number;
  /** Decay factor for freshness — older memories get lower priority. Range 0-1, default 0.5 */
  freshnessDecayWeight?: number;
}

/**
 * Load the most recent memories for a Twin, optionally filtered by world.
 *
 * @param twinId  - Twin's UUID (from twins.id row)
 * @param worldId - Optional: restrict to memories from this world
 * @param limit   - Max rows to fetch (default 10, capped at 10 by buildPrompt anyway)
 * @param options - Optional filtering configuration
 * @returns       Memory[] ready to pass into buildPrompt({ memories })
 */
export async function loadRecentMemories(
  twinId: string,
  worldId?: string | null,
  limit = 10,
  options?: LoadRecentMemoriesOptions,
): Promise<Memory[]> {
  if (!supabase) return [];
  if (!twinId) return [];

  const {
    worldRelevanceBoost = false,
    minConfidence = 0,
    freshnessDecayWeight = 0.5,
  } = options ?? {};

  try {
    let query = supabase
      .from('twin_memories')
      .select('content, world_id, created_at')
      .eq('twin_id', twinId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // World-scoped recall: prefer same-world memories when in a world context
    if (worldId) {
      query = query.eq('world_id', worldId);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    // Apply filtering and scoring
    const now = new Date();
    const scored = data
      .map((row) => {
        const createdAt = new Date(row.created_at as string);
        const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        // Freshness score: decays over time (0.5 = half-life of ~24h with default weight)
        const freshnessScore = Math.exp(-freshnessDecayWeight * hoursAgo / 24);
        
        // World relevance boost
        let finalScore = freshnessScore;
        if (worldRelevanceBoost && worldId && row.world_id === worldId) {
          finalScore += 0.2;
        }
        
        return { ...row, _score: finalScore };
      })
      .filter(row => row._score >= minConfidence)
      .sort((a, b) => b._score - a._score);

    // Map to Memory shape expected by buildPrompt (most-recent-first → reverse
    // so buildPrompt's slice(-10) keeps them in chronological order for the LLM)
    return scored
      .reverse()
      .map((row) => ({
        content: row.content as string,
        worldId: (row.world_id as string | null) ?? undefined,
        timestamp: (row.created_at as string | null) ?? undefined,
      }));
  } catch {
    // Non-fatal — Twin still responds, just without memory context
    return [];
  }
}
