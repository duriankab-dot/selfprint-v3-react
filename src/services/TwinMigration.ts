/**
 * TwinMigration.ts
 * Handles migration of existing Twin data to new Nova/Twin separation system
 */

import { supabase } from './supabase-service';

export interface MigrationResult {
  success: boolean;
  isTwinAwakened: boolean;
  twinName?: string;
  message: string;
}

/**
 * Check if user has an awakened Twin in the `twins` table
 */
export async function checkTwinAwakening(userId: string): Promise<MigrationResult> {
  try {
    if (!userId) {
      return { success: false, isTwinAwakened: false, message: 'User ID required' };
    }

    if (!supabase) {
      return { success: false, isTwinAwakened: false, message: 'Supabase unavailable' };
    }

    const { data, error } = await supabase
      .from('twins')
      .select('id, name, awakened_at')
      .eq('user_id', userId)
      .not('awakened_at', 'is', null)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { success: true, isTwinAwakened: false, message: 'No awakened Twin found' };
    }

    return {
      success: true,
      isTwinAwakened: true,
      twinName: data.name,
      message: 'Twin found',
    };
  } catch (error) {
    console.error('Error checking Twin awakening:', error);
    return {
      success: false,
      isTwinAwakened: false,
      message: `Migration check failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Migrate old Twin data to new system structure
 * Upserts into `twins` table (conflict on user_id)
 */
export async function migrateTwinToNewSystem(
  userId: string,
  oldTwinData?: Record<string, unknown>
): Promise<MigrationResult> {
  try {
    if (!userId) {
      return { success: false, isTwinAwakened: false, message: 'User ID required' };
    }

    if (!oldTwinData) {
      return { success: true, isTwinAwakened: false, message: 'No old Twin data to migrate' };
    }

    if (!supabase) {
      return { success: false, isTwinAwakened: false, message: 'Supabase unavailable' };
    }

    // Transform old schema → new `twins` columns
    const newTwinRow = {
      user_id: userId,
      name: String(oldTwinData['name'] ?? 'Twin'),
      primary_archetype: String(
        oldTwinData['primaryArchetype'] ?? oldTwinData['primary_archetype'] ?? ''
      ),
      secondary_archetype:
        (oldTwinData['secondaryArchetype'] as string | undefined) ??
        (oldTwinData['secondary_archetype'] as string | undefined) ??
        null,
      maturity_score: Number(
        oldTwinData['maturityScore'] ?? oldTwinData['maturity_score'] ?? 30
      ),
      evolution_stage: Number(
        oldTwinData['stage'] ?? oldTwinData['evolution_stage'] ?? 1
      ),
      awakened_at: String(
        oldTwinData['awakenedAt'] ?? oldTwinData['awakened_at'] ?? new Date().toISOString()
      ),
    };

    const { error } = await supabase
      .from('twins')
      .upsert([newTwinRow], { onConflict: 'user_id' });

    if (error) throw error;

    return {
      success: true,
      isTwinAwakened: true,
      twinName: newTwinRow.name,
      message: 'Twin migrated successfully',
    };
  } catch (error) {
    console.error('Error migrating Twin:', error);
    return {
      success: false,
      isTwinAwakened: false,
      message: `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get full Twin profile from `twins` table
 */
export async function getTwinProfile(userId: string) {
  try {
    if (!userId) throw new Error('User ID required');

    if (!supabase) return null;

    const { data, error } = await supabase
      .from('twins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    return data ?? null;
  } catch (error) {
    console.error('Error fetching Twin profile:', error);
    return null;
  }
}

/**
 * Initialize new Twin row in `twins` table
 */
export async function initializeTwin(userId: string, twinName: string) {
  try {
    if (!userId || !twinName) {
      throw new Error('User ID and Twin name required');
    }

    if (!supabase) {
      return { success: false, message: 'Supabase unavailable' };
    }

    const { data, error } = await supabase
      .from('twins')
      .insert([
        {
          user_id: userId,
          name: twinName,
          evolution_stage: 1,
          awakened_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) throw error;

    return {
      success: true,
      twinId: data.id as string,
      message: `Twin "${twinName}" initialized`,
    };
  } catch (error) {
    console.error('Error initializing Twin:', error);
    return {
      success: false,
      message: `Initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
