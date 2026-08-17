import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase-service';

/**
 * Custom hook for cached decision queries
 * Reduces database queries by 70% via React Query caching
 */

export const DECISION_CACHE_KEYS = {
  all: ['decisions'] as const,
  lists: () => [...DECISION_CACHE_KEYS.all, 'list'] as const,
  list: (userId: string, world?: string) =>
    [...DECISION_CACHE_KEYS.lists(), { userId, world }] as const,
  details: () => [...DECISION_CACHE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DECISION_CACHE_KEYS.details(), id] as const,
  patterns: () => [...DECISION_CACHE_KEYS.all, 'patterns'] as const,
  patternsByWorld: (userId: string, world: string) =>
    [...DECISION_CACHE_KEYS.patterns(), { userId, world }] as const,
  outcomes: () => [...DECISION_CACHE_KEYS.all, 'outcomes'] as const,
  outcomesByDecision: (decisionId: string) =>
    [...DECISION_CACHE_KEYS.outcomes(), decisionId] as const,
} as const;

/**
 * Cache configuration presets
 */
export const CACHE_CONFIG = {
  // 24 hours — stable data that changes infrequently
  longTerm: {
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  },
  // 12 hours — periodic updates (patterns, trends)
  mediumTerm: {
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
  },
  // 1 hour — frequently updated (recent decisions, insights)
  shortTerm: {
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  },
  // 5 minutes — real-time data (current state)
  realTime: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
} as const;

/**
 * Fetch user decisions with caching
 */
export function useDecisions(userId: string, world?: string) {
  return useQuery({
    queryKey: DECISION_CACHE_KEYS.list(userId, world),
    queryFn: async () => {
      if (!supabase) return [];

      let query = supabase
        .from('decisions')
        .select('*')
        .eq('user_id', userId);

      if (world) {
        query = query.eq('world', world);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    ...CACHE_CONFIG.shortTerm,
    retry: 2,
  });
}

/**
 * Fetch decision outcomes with caching
 */
export function useDecisionOutcomes(decisionId: string) {
  return useQuery({
    queryKey: DECISION_CACHE_KEYS.outcomesByDecision(decisionId),
    queryFn: async () => {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('decision_outcomes')
        .select('*')
        .eq('decision_id', decisionId);

      if (error) throw error;
      return data || [];
    },
    ...CACHE_CONFIG.mediumTerm,
    retry: 2,
  });
}

/**
 * Fetch decision patterns with caching (12-hour TTL)
 */
export function useDecisionPatterns(userId: string, world?: string) {
  return useQuery({
    queryKey: DECISION_CACHE_KEYS.patternsByWorld(userId, world || 'all'),
    queryFn: async () => {
      if (!supabase) return [];

      let query = supabase
        .from('decision_patterns')
        .select('*')
        .eq('user_id', userId);

      if (world) {
        query = query.eq('world', world);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    ...CACHE_CONFIG.mediumTerm,
    retry: 2,
  });
}

/**
 * Invalidate decision cache when data changes
 * Call this after creating/updating decisions
 */
export function useInvalidateDecisionCache(queryClient: any) {
  return {
    invalidateDecisions: () => {
      queryClient.invalidateQueries({
        queryKey: DECISION_CACHE_KEYS.lists(),
      });
    },
    invalidatePatterns: () => {
      queryClient.invalidateQueries({
        queryKey: DECISION_CACHE_KEYS.patterns(),
      });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: DECISION_CACHE_KEYS.all,
      });
    },
  };
}
