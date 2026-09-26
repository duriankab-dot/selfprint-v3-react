/**
 * useWorld.ts — TC-407: Hook for world-specific intelligence
 *
 * Provides:
 * - Current world state from URL params or TwinContext
 * - World intelligence data (decision count, confidence, suggestions)
 * - Record world visit tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { WorldId } from '@/constants/worlds';
import { WORLDS, getAllWorlds } from '@/constants/worlds';
import { useAuth } from '@/context/AuthContext';
import { useTwin } from '@/context/TwinContext';
import { supabase } from '@/lib/supabase/client';
import { getWorldIntelligence } from '@/lib/worlds/worldIntelligence';

interface UseWorldReturn {
  currentWorld: WorldId | null;
  world: ReturnType<typeof getAllWorlds>[0] | null;
  intelligence: import('@/lib/worlds/worldIntelligence').WorldIntelligence | null;
  isLoading: boolean;
  recordVisit: () => Promise<void>;
}

export function useWorld(): UseWorldReturn {
  const { session } = useAuth();
  const { twin, currentWorld: contextCurrentWorld } = useTwin();
  const params = useParams<{ worldId?: string }>();
  const [searchParams] = useSearchParams();

  const [intelligence, setIntelligence] = useState<import('@/lib/worlds/worldIntelligence').WorldIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve current world from URL or query param
  const worldIdFromUrl: WorldId | undefined = params.worldId as WorldId;
  const worldIdFromQuery = searchParams.get('world') as WorldId | undefined;
  
  // Priority: URL param > query param > TwinContext.currentWorld
  const resolvedWorldId: WorldId | null = 
    worldIdFromUrl || 
    worldIdFromQuery || 
    contextCurrentWorld || 
    null;

  const world = resolvedWorldId ? (WORLDS[resolvedWorldId] ?? null) : null;

  // Load intelligence when world resolves and user is authenticated
  useEffect(() => {
    if (!resolvedWorldId || !twin?.id) {
      setIntelligence(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    getWorldIntelligence(twin.id, resolvedWorldId)
      .then(setIntelligence)
      .catch(() => setIntelligence(null))
      .finally(() => setIsLoading(false));
  }, [resolvedWorldId, twin?.id]);

  /**
   * Record a visit to the current world.
   * Updates world_preferences and world_stats tables.
   */
  const recordVisit = useCallback(async () => {
    if (!session?.user?.id || !resolvedWorldId) return;

    try {
      await supabase.from('world_preferences').upsert({
        user_id: session.user.id,
        world_id: resolvedWorldId,
        last_accessed: new Date().toISOString(),
        is_favorite: false,
      });

      await supabase.from('world_stats').upsert({
        user_id: session.user.id,
        world_id: resolvedWorldId,
        visits_count: 1,
        journal_entries: 0,
        decisions_made: 0,
        insights_gained: 0,
        time_spent_minutes: 0,
        last_insight_at: null,
      }, { onConflict: 'user_id,world_id' });
    } catch (err) {
      console.error('Failed to record world visit:', err);
    }
  }, [session?.user?.id, resolvedWorldId]);

  return {
    currentWorld: resolvedWorldId,
    world,
    intelligence,
    isLoading,
    recordVisit,
  };
}
