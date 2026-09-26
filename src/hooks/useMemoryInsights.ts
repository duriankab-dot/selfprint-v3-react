/**
 * useMemoryInsights.ts — TC-503: Hook for memory insights data
 *
 * Provides:
 * - Recent memories with relevance scoring
 * - Search/filter capabilities
 * - Forget functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useTwin } from '@/context/TwinContext';
import { getRecentlyLearned, forgetMemory, type LearnedMemory } from '@/lib/memory/getTwinKnowledge';

interface UseMemoryInsightsReturn {
  memories: LearnedMemory[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (s: string) => void;
  worldFilter: string;
  setWorldFilter: (w: string) => void;
  filteredMemories: LearnedMemory[];
  forgetMemory: (id: string) => Promise<boolean>;
  refresh: () => void;
}

export function useMemoryInsights(
  twinId?: string,
  maxMemories = 100
): UseMemoryInsightsReturn {
  const { twin } = useTwin();
  const resolvedTwinId = twinId ?? twin?.id;

  const [memories, setMemories] = useState<LearnedMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [worldFilter, setWorldFilter] = useState('all');

  const loadMemories = useCallback(async () => {
    if (!resolvedTwinId) {
      setMemories([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getRecentlyLearned(resolvedTwinId, maxMemories);
      setMemories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, [resolvedTwinId, maxMemories]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleForget = useCallback(async (memoryId: string): Promise<boolean> => {
    if (!resolvedTwinId) return false;
    try {
      const ok = await forgetMemory(memoryId, resolvedTwinId);
      if (ok) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      }
      return ok;
    } catch {
      return false;
    }
  }, [resolvedTwinId]);

  // Score and filter
  const filteredMemories = memories
    .map((m) => {
      const now = Date.now();
      const age = m.createdAt ? now - new Date(m.createdAt).getTime() : Infinity;
      const recencyScore = Math.max(0, 1 - age / (90 * 24 * 60 * 60 * 1000));
      const searchBoost = search && m.content.toLowerCase().includes(search.toLowerCase()) ? 0.4 : 0;
      const worldBoost = worldFilter !== 'all' && m.worldId === worldFilter ? 0.2 : 0;
      return { ...m, relevanceScore: Math.min(1, recencyScore + searchBoost + worldBoost) };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .filter((m) => m.content.toLowerCase().includes(search.toLowerCase()));

  return {
    memories,
    loading,
    error,
    search,
    setSearch,
    worldFilter,
    setWorldFilter,
    filteredMemories,
    forgetMemory: handleForget,
    refresh: loadMemories,
  };
}

export default useMemoryInsights;