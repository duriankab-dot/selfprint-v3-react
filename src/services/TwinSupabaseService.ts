/**
 * TwinSupabaseService.ts
 * Supabase operations for Twin persistence
 */

import { supabase } from './supabase-service';
import type { TwinProfile } from '../context/TwinContext';

/**
 * Custom error classes for Twin operations
 * ให้ Caller สามารถแยก error type ได้
 */
export class TwinNotFoundError extends Error {
  constructor(userId: string) {
    super(`Twin not found for user ${userId}`);
    this.name = 'TwinNotFoundError';
  }
}

export class TwinPermissionError extends Error {
  constructor(reason: string = 'Permission denied') {
    super(`Twin permission denied: ${reason}`);
    this.name = 'TwinPermissionError';
  }
}

export class TwinNetworkError extends Error {
  constructor(originalError: any) {
    super(`Twin network error: ${originalError.message}`);
    this.name = 'TwinNetworkError';
    this.cause = originalError;
  }
}

export class TwinServiceError extends Error {
  constructor(message: string, originalError: any) {
    super(message);
    this.name = 'TwinServiceError';
    this.cause = originalError;
  }
}

export interface Twin extends TwinProfile {
  awakened_at: string;
  evolution_stage: number;
}

/**
 * Get user's Twin from Supabase
 *
 * Throws specific errors:
 * - TwinNotFoundError: Twin doesn't exist for this user
 * - TwinPermissionError: RLS or auth permission denied
 * - TwinNetworkError: Network/connection issue
 * - TwinServiceError: Other Supabase errors
 */
export async function fetchUserTwin(userId: string): Promise<Twin> {
  try {
    if (!userId || !supabase) {
      throw new TwinServiceError('Invalid userId or Supabase unavailable', null);
    }

    const { data, error } = await supabase
      .from('twins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Handle Supabase error response
    if (error) {
      // PGRST116 = "JSON object requested, multiple or no rows returned"
      // Essentially means: row not found when using maybeSingle()
      if (error.code === 'PGRST116') {
        throw new TwinNotFoundError(userId);
      }

      // Permission errors — check message since PostgrestError doesn't have status
      // RLS policy violations or auth issues typically have "permission" or "permission denied"
      if (error.message?.toLowerCase().includes('permission') ||
          error.message?.toLowerCase().includes('denied') ||
          error.message?.toLowerCase().includes('rls')) {
        throw new TwinPermissionError(error.message);
      }

      // Network-related errors
      if (error.message?.includes('Failed to fetch') ||
          error.message?.includes('Network') ||
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND')) {
        throw new TwinNetworkError(error);
      }

      // Generic service error for other Supabase errors
      throw new TwinServiceError(`Supabase query failed: ${error.message}`, error);
    }

    // No error but also no data = Twin doesn't exist
    if (!data) {
      throw new TwinNotFoundError(userId);
    }

    return data as Twin;
  } catch (err) {
    // Re-throw custom errors (don't double-wrap)
    if (err instanceof TwinNotFoundError ||
        err instanceof TwinPermissionError ||
        err instanceof TwinNetworkError ||
        err instanceof TwinServiceError) {
      throw err;
    }

    // Catch unknown errors and wrap them
    console.error('Unexpected error in fetchUserTwin:', err);
    throw new TwinServiceError('Unexpected error fetching Twin', err);
  }
}

/**
 * Create new Twin in Supabase
 */
export async function createTwinInDatabase(
  userId: string,
  twinData: Omit<TwinProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Twin | null> {
  try {
    if (!userId || !supabase) {
      throw new Error('Invalid userId or Supabase unavailable');
    }

    const { data, error } = await supabase
      .from('twins')
      .insert([
        {
          user_id: userId,
          name: twinData.name,
          primary_archetype: twinData.primaryArchetype,
          secondary_archetype: twinData.secondaryArchetype,
          maturity_score: Math.max(0, Math.min(100, twinData.maturityScore || 30)),
          evolution_stage: 1,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Twin;
  } catch (err) {
    console.error('Failed to create Twin:', err);
    throw err;
  }
}

/**
 * Update Twin profile
 */
export async function updateTwinInDatabase(
  twinId: string,
  updates: Partial<Twin>
): Promise<Twin | null> {
  try {
    if (!twinId || !supabase) {
      throw new Error('Invalid twinId or Supabase unavailable');
    }

    const { data, error } = await supabase
      .from('twins')
      .update({
        name: updates.name,
        primary_archetype: updates.primaryArchetype,
        secondary_archetype: updates.secondaryArchetype,
        maturity_score: updates.maturityScore,
        evolution_stage: updates.evolution_stage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', twinId)
      .select()
      .single();

    if (error) throw error;

    return data as Twin;
  } catch (err) {
    console.error('Failed to update Twin:', err);
    throw err;
  }
}

/**
 * Store Twin memory (conversation)
 */
export async function saveTwinMemory(
  twinId: string,
  role: 'user' | 'twin' | 'system',
  content: string,
  worldId?: string
): Promise<boolean> {
  try {
    if (!twinId || !supabase) return false;

    const { error } = await supabase
      .from('twin_memories')
      .insert([
        {
          twin_id: twinId,
          world_id: worldId,
          role,
          content,
          metadata: { timestamp: new Date().toISOString() },
        },
      ]);

    if (error) throw error;

    return true;
  } catch (err) {
    console.error('Failed to save Twin memory:', err);
    return false;
  }
}

/**
 * Get Twin conversation history
 */
export async function fetchTwinMemories(
  twinId: string,
  worldId?: string,
  limit: number = 50
): Promise<any[]> {
  try {
    if (!twinId || !supabase) return [];

    let query = supabase
      .from('twin_memories')
      .select('*')
      .eq('twin_id', twinId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (worldId) {
      query = query.eq('world_id', worldId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).reverse(); // Return chronological order
  } catch (err) {
    console.error('Failed to fetch Twin memories:', err);
    return [];
  }
}

/**
 * Update Twin SICE scores
 */
export async function updateSICEScore(
  twinId: string,
  siceName: string,
  score: number
): Promise<boolean> {
  try {
    if (!twinId || !siceName || !supabase) return false;

    const { error } = await supabase
      .from('twin_sice_scores')
      .upsert(
        [
          {
            twin_id: twinId,
            sice_name: siceName,
            contribution_score: Math.max(0, Math.min(100, score)),
            last_active: new Date().toISOString(),
          },
        ],
        { onConflict: 'twin_id,sice_name' }
      );

    if (error) throw error;

    return true;
  } catch (err) {
    console.error('Failed to update SICE score:', err);
    return false;
  }
}

/**
 * Delete Twin and all related data from Supabase
 * Removes: twins, twin_memories (by twin_id), world_stats (by user_id)
 */
export async function deleteTwinFromDatabase(
  twinId: string,
  userId: string
): Promise<boolean> {
  try {
    if (!twinId || !userId || !supabase) return false;

    // 1. Delete twin_memories (FK → twin_id)
    const { error: memoriesErr } = await supabase
      .from('twin_memories')
      .delete()
      .eq('twin_id', twinId);

    if (memoriesErr) throw memoriesErr;

    // 2. Delete world_stats (keyed by user_id, not twin_id)
    const { error: statsErr } = await supabase
      .from('world_stats')
      .delete()
      .eq('user_id', userId);

    if (statsErr) throw statsErr;

    // 3. Delete the Twin row itself
    const { error: twinErr } = await supabase
      .from('twins')
      .delete()
      .eq('id', twinId);

    if (twinErr) throw twinErr;

    return true;
  } catch (err) {
    console.error('Failed to delete Twin from database:', err);
    return false;
  }
}

/**
 * Get Twin SICE scores
 */
export async function fetchTwinSICEScores(twinId: string): Promise<Record<string, number>> {
  try {
    if (!twinId || !supabase) return {};

    const { data, error } = await supabase
      .from('twin_sice_scores')
      .select('sice_name, contribution_score')
      .eq('twin_id', twinId);

    if (error) throw error;

    const scores: Record<string, number> = {};
    (data || []).forEach((row) => {
      scores[row.sice_name] = row.contribution_score;
    });

    return scores;
  } catch (err) {
    console.error('Failed to fetch SICE scores:', err);
    return {};
  }
}
