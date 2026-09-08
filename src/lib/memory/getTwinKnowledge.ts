/**
 * getTwinKnowledge.ts
 * Track C Phase 11 (G4 — Memory Experience, §16): data access for the
 * "What Twin Knows" narrative — separate from loadRecentMemories.ts, which
 * serves a different purpose (full-role prompt-injection context for the
 * LLM). This module only returns what the user themselves said/did, i.e.
 * what Twin actually *learned*, and lets the user "forget" an entry
 * (§4.2 Memory — visible continuity: review/correct/forget/update).
 *
 * §MEMORY-KNOWS-001
 */

import { supabase } from '../../services/supabase-service';

export interface LearnedMemory {
  id: string;
  content: string;
  worldId: string | null;
  createdAt: string | null;
}

/**
 * Recently learned: memories where role = 'user' — things the user actually
 * said/shared, not Twin's own replies. This is the real "what Twin has
 * learned about you" list; role is never inferred or guessed.
 */
export async function getRecentlyLearned(
  twinId: string,
  limit = 8,
): Promise<LearnedMemory[]> {
  if (!supabase || !twinId) return [];

  try {
    const { data, error } = await supabase
      .from('twin_memories')
      .select('id, content, world_id, created_at')
      .eq('twin_id', twinId)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id as string,
      content: row.content as string,
      worldId: (row.world_id as string | null) ?? null,
      createdAt: (row.created_at as string | null) ?? null,
    }));
  } catch {
    return [];
  }
}

/**
 * Forget a single memory — a real, permanent delete (§4.2 "forget"), scoped
 * by both id and twin_id so a caller can never delete another Twin's row
 * even if an id were guessed. RLS on twin_memories also enforces ownership
 * server-side.
 */
export async function forgetMemory(memoryId: string, twinId: string): Promise<boolean> {
  if (!supabase || !memoryId || !twinId) return false;

  try {
    const { error } = await supabase
      .from('twin_memories')
      .delete()
      .eq('id', memoryId)
      .eq('twin_id', twinId);

    return !error;
  } catch {
    return false;
  }
}
