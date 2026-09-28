/**
 * usePersonalContext — Unified hook for canonical personal context
 * 
 * Replaces direct PersonalContextBuilder usage with canonical cache
 * Provides selector-based derived views for lib/SICE/engine shapes
 * 
 * @module hooks/usePersonalContext
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CanonicalPersonalContextBuilder } from '@/lib/intelligence/CanonicalPersonalContextBuilder';
import type { CanonicalPersonalContext, CanonicalBuilderInput } from '@/types/personalContext';
import { canonicalToLibPersonalContext } from '@/lib/intelligence/canonicalAdapter';
import { canonicalToSicePersonalContext } from '@/services/sice/canonicalAdapter';
import { CANONICAL_PCB_CACHE_KEY } from '@/types/personalContext';

/**
 * Canonical query function
 */
async function fetchCanonicalContext(input: CanonicalBuilderInput): Promise<CanonicalPersonalContext> {
  const builder = new CanonicalPersonalContextBuilder();
  const result = await builder.getContext(input);
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch canonical context');
  }
  return result.context;
}

/**
 * Hook options for lib shape (existing lib callers)
 */
export interface UsePersonalContextLibOptions {
  userId: string;
  currentWorld?: string;
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * Hook options for SICE shape (TwinPersonalityPage, SICEOrchestrator)
 */
export interface UsePersonalContextSiceOptions {
  userId: string;
  currentWorld?: string;
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * Hook options for engine shape (SICEOrchestrator engine #1)
 */
export interface UsePersonalContextEngineOptions {
  userId: string;
  currentWorld?: string;
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * Lib shape selector — for existing 8 lib callers
 * Returns: lib/intelligence/types.ts PersonalContext
 */
export function usePersonalContextLib(options: UsePersonalContextLibOptions) {
  const { userId, currentWorld, enabled = true, staleTime = 60_000, retry, retryDelay } = options;
  
  return useQuery({
    queryKey: CANONICAL_PCB_CACHE_KEY(userId),
    queryFn: () => fetchCanonicalContext({ userId, currentWorld }),
    enabled: enabled && !!userId,
    staleTime,
    retry,
    retryDelay,
    select: (canonical: CanonicalPersonalContext) => canonicalToLibPersonalContext(canonical),
  });
}

/**
 * SICE shape selector — for TwinPersonalityPage
 * Returns: types/sice.ts PersonalContext (with worldPersonality)
 */
export function usePersonalContextSice(options: UsePersonalContextSiceOptions) {
  const { userId, currentWorld, enabled = true, staleTime = 60_000, retry, retryDelay } = options;
  
  return useQuery({
    queryKey: CANONICAL_PCB_CACHE_KEY(userId),
    queryFn: () => fetchCanonicalContext({ userId, currentWorld }),
    enabled: enabled && !!userId,
    staleTime,
    retry,
    retryDelay,
    select: (canonical: CanonicalPersonalContext) => canonicalToSicePersonalContext(canonical),
  });
}

/**
 * Engine shape selector — for SICEOrchestrator engine #1
 * Returns: SICE shape but with confidence already converted (0-100)
 */
export function usePersonalContextEngine(options: UsePersonalContextEngineOptions) {
  const { userId, currentWorld, enabled = true, staleTime = 60_000, retry, retryDelay } = options;
  
  return useQuery({
    queryKey: CANONICAL_PCB_CACHE_KEY(userId),
    queryFn: () => fetchCanonicalContext({ userId, currentWorld }),
    enabled: enabled && !!userId,
    staleTime,
    retry,
    retryDelay,
    select: (canonical: CanonicalPersonalContext) => ({
      ...canonicalToSicePersonalContext(canonical),
      // Engine expects SICEOutput.confidence scale (0-100)
      // Canonical stores confidenceOverall as 0-1, so convert
      confidence: Math.round(canonical.confidenceOverall * 100),
    } as any),
  });
}

/**
 * Raw canonical context — for advanced use cases
 * Returns: CanonicalPersonalContext (full unified model)
 */
export function usePersonalContextCanonical(options: UsePersonalContextLibOptions) {
  const { userId, currentWorld, enabled = true, staleTime = 60_000, retry, retryDelay } = options;
  
  return useQuery({
    queryKey: CANONICAL_PCB_CACHE_KEY(userId),
    queryFn: () => fetchCanonicalContext({ userId, currentWorld }),
    enabled: enabled && !!userId,
    staleTime,
    retry,
    retryDelay,
  });
}

/**
 * Invalidate canonical cache for user
 */
export function useInvalidatePersonalContext() {
  const queryClient = useQueryClient();
  return (userId: string) => queryClient.invalidateQueries({ queryKey: CANONICAL_PCB_CACHE_KEY(userId) });
}

/**
 * Remove canonical cache for user (for logout/cache clear)
 */
export function useRemovePersonalContext() {
  const queryClient = useQueryClient();
  return (userId: string) => queryClient.removeQueries({ queryKey: CANONICAL_PCB_CACHE_KEY(userId) });
}

/**
 * Prefetch canonical context
 */
export function usePrefetchPersonalContext() {
  const queryClient = useQueryClient();
  return async (userId: string, currentWorld?: string) => {
    await queryClient.prefetchQuery({
      queryKey: CANONICAL_PCB_CACHE_KEY(userId),
      queryFn: () => fetchCanonicalContext({ userId, currentWorld }),
      staleTime: 60_000,
    });
  };
}

/**
 * Backward compatibility — legacy cache key helpers
 * Used during migration to clear stale entries
 */
export const legacyCacheHelpers = {
  /**
   * Get legacy cache key
   */
  key: (userId: string) => ['personalContext', userId] as const,

  /**
   * Invalidate legacy cache
   */
  invalidate: (_userId: string) => {
    // Note: This is a non-hook function for use outside React components
    // In React components, use useQueryClient() directly
  },

  /**
   * Remove legacy cache
   */
  remove: (_userId: string) => {
    // Note: This is a non-hook function for use outside React components
  },

  /**
   * Check if legacy cache exists
   */
  hasLegacyData: (_userId: string) => {
    // Note: This is a non-hook function for use outside React components
    return false;
  },
};

/**
 * Migration helper — clear legacy cache after migration
 * Must be called within a React component (uses useQueryClient)
 */
export function useClearLegacyCache() {
  const queryClient = useQueryClient();
  return async (userId: string): Promise<void> => {
    // Remove legacy entries
    queryClient.removeQueries({ queryKey: ['personalContext', userId] });
    
    // Also clear any queryClient.setQueryData that might have been used
    queryClient.invalidateQueries({ queryKey: ['personalContext', userId] });
  };
}

/**
 * Non-hook version for use in non-React contexts (e.g., scripts)
 * Requires queryClient to be passed in
 */
export function clearLegacyCacheForUser(queryClient: ReturnType<typeof useQueryClient>, userId: string): void {
  queryClient.removeQueries({ queryKey: ['personalContext', userId] });
  queryClient.invalidateQueries({ queryKey: ['personalContext', userId] });
}

export default usePersonalContextLib;