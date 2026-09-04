/**
 * src/context/WorldContext.tsx
 * World Context Provider — Track user's world preferences and focus (P0 #7.2)
 * 12 Worlds: self, mind, relationship, love, career, wealth, life, growth, decision, purpose, wellbeing, future
 */

import React, { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase-service';
import { WorldBadgeTracker } from '../services/WorldBadgeTracker';
import type { WorldId } from '../constants/worlds';
import type { WorldBadgeProgress } from '../services/WorldBadgeTracker';

export interface WorldPreference {
  worldId: WorldId;
  isFavorite: boolean;
  lastAccessed: string;
  engagementScore: number;
}

export interface WorldStats {
  worldId: WorldId;
  visitsCount: number;
  journalEntries: number;
  decisionsMade: number;
  insightsGained: number;
  timeSpentMinutes: number;
  lastInsightAt: string | null;
}

export interface WorldContextType {
  // State
  currentWorld: WorldId | null;
  favoriteWorlds: WorldId[];
  worldPreferences: Record<WorldId, WorldPreference>;
  worldStats: Record<WorldId, WorldStats>;
  worldBadges: Record<WorldId, WorldBadgeProgress | null>;
  totalWorldPoints: number;
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentWorld: (world: WorldId | null) => void;
  toggleFavoriteWorld: (world: WorldId) => Promise<void>;
  recordWorldVisit: (world: WorldId) => Promise<void>;
  recordJournalEntry: (world: WorldId) => Promise<void>;
  recordDecision: (world: WorldId) => Promise<void>;
  recordInsight: (world: WorldId) => Promise<void>;
  getWorldStats: (world: WorldId) => WorldStats | null;
  getTopWorlds: (limit?: number) => WorldId[];
  // P0 #7.4: Badge tracking
  getWorldBadges: (world: WorldId) => WorldBadgeProgress | null;
  unlockBadge: (world: WorldId, badgeId: string) => Promise<void>;
  getWorldMastery: (world: WorldId) => Promise<number>;
}

const WorldContext = createContext<WorldContextType | undefined>(undefined);

export function WorldProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [currentWorld, setCurrentWorld] = useState<WorldId | null>(null);
  const [favoriteWorlds, setFavoriteWorlds] = useState<WorldId[]>([]);
  const [worldPreferences, setWorldPreferences] = useState<Record<WorldId, WorldPreference>>({} as Record<WorldId, WorldPreference>);
  const [worldStats, setWorldStats] = useState<Record<WorldId, WorldStats>>({} as Record<WorldId, WorldStats>);
  // P0 #7.4: Badge tracking
  const [worldBadges, setWorldBadges] = useState<Record<WorldId, WorldBadgeProgress | null>>({} as Record<WorldId, WorldBadgeProgress | null>);
  const [totalWorldPoints, setTotalWorldPoints] = useState(0);

  // WORLDCTX-SCHEMA-001 FIX: every query/upsert in this file used to call
  // .schema('selfprint').from('world_preferences'/'world_stats'). Verified
  // against a live `SELECT schemaname, tablename FROM pg_tables` dump from
  // production: both tables only exist under `public` (selfprint schema
  // only has blueprints/finetune_responses/share_links/users_profiles) —
  // matching the user's real console log exactly (PGRST205 "Could not find
  // the table 'selfprint.world_preferences'"/'selfprint.world_stats' in the
  // schema cache", hint pointing at the unrelated 'selfprint.users_profiles').
  // This broke world favorites, visit tracking, journal/decision/insight
  // counters, and badge progress for every user. Removed .schema('selfprint')
  // from all 8 call sites in this file — default client already targets
  // `public`, where these tables actually live.

  // Load world preferences from Supabase
  const { data: preferencesData, isLoading, error } = useQuery({
    queryKey: ['worldPreferences', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data: prefs } = await supabase
        .from('world_preferences')
        .select('*')
        .eq('user_id', session.user.id);

      const { data: stats } = await supabase
        .from('world_stats')
        .select('*')
        .eq('user_id', session.user.id);

      return { preferences: prefs || [], stats: stats || [] };
    },
    enabled: !!session?.user?.id,
  });

  // Load user_metadata for default world
  useEffect(() => {
    if (session?.user?.user_metadata?.default_world) {
      setCurrentWorld(session.user.user_metadata.default_world as WorldId);
    }
  }, [session?.user?.user_metadata?.default_world]);

  // Sync loaded preferences
  useEffect(() => {
    if (preferencesData?.preferences) {
      const prefs: Record<WorldId, WorldPreference> = {} as Record<WorldId, WorldPreference>;
      const favs: WorldId[] = [];

      preferencesData.preferences.forEach((pref: any) => {
        const worldId = pref.world_id as WorldId;
        prefs[worldId] = {
          worldId,
          isFavorite: pref.is_favorite,
          lastAccessed: pref.last_accessed,
          engagementScore: pref.engagement_score,
        };

        if (pref.is_favorite) {
          favs.push(worldId);
        }
      });

      setWorldPreferences(prefs);
      setFavoriteWorlds(favs);
    }

    if (preferencesData?.stats) {
      const stats: Record<WorldId, WorldStats> = {} as Record<WorldId, WorldStats>;

      preferencesData.stats.forEach((stat: any) => {
        const worldId = stat.world_id as WorldId;
        stats[worldId] = {
          worldId,
          visitsCount: stat.visits_count,
          journalEntries: stat.journal_entries,
          decisionsMade: stat.decisions_made,
          insightsGained: stat.insights_gained,
          timeSpentMinutes: stat.time_spent_minutes,
          lastInsightAt: stat.last_insight_at,
        };
      });

      setWorldStats(stats);
    }
  }, [preferencesData]);

  // Toggle favorite world
  const toggleFavoriteWorld = useCallback(
    async (world: WorldId) => {
      if (!session?.user?.id) return;

      const isFavorite = favoriteWorlds.includes(world);
      const { error: err } = await supabase
        .from('world_preferences')
        .upsert(
          {
            user_id: session.user.id,
            world_id: world,
            is_favorite: !isFavorite,
            last_accessed: new Date().toISOString(),
          },
          { onConflict: 'user_id,world_id' }
        );

      if (err) throw err;

      // Update local state
      setFavoriteWorlds((prev) =>
        isFavorite ? prev.filter((w) => w !== world) : [...prev, world]
      );

      queryClient.invalidateQueries({ queryKey: ['worldPreferences', session.user.id] });
    },
    [session?.user?.id, favoriteWorlds, queryClient]
  );

  // Record world visit
  const recordWorldVisit = useCallback(
    async (world: WorldId) => {
      if (!session?.user?.id) return;

      setCurrentWorld(world);

      const now = new Date().toISOString();

      // Update world_preferences.last_accessed
      const { error: err } = await supabase
        .from('world_preferences')
        .upsert(
          {
            user_id: session.user.id,
            world_id: world,
            last_accessed: now,
          },
          { onConflict: 'user_id,world_id' }
        );

      if (err) {
        console.error('Failed to record world visit:', err);
      }

      // Update visits_count in world_stats — used by TwinStateEngine for maturity scoring
      const currentVisits = worldStats[world]?.visitsCount || 0;
      const { error: statsErr } = await supabase
        .from('world_stats')
        .upsert(
          {
            user_id: session.user.id,
            world_id: world,
            visits_count: currentVisits + 1,
            last_accessed: now,
          },
          { onConflict: 'user_id,world_id' }
        );

      if (statsErr) {
        console.error('Failed to update world stats visits_count:', statsErr);
      } else {
        queryClient.invalidateQueries({ queryKey: ['worldPreferences', session.user.id] });
      }
    },
    [session?.user?.id, worldStats, queryClient]
  );

  // Record journal entry for world
  const recordJournalEntry = useCallback(
    async (world: WorldId) => {
      if (!session?.user?.id) return;

      const { error: err } = await supabase
        .from('world_stats')
        .upsert(
          {
            user_id: session.user.id,
            world_id: world,
            journal_entries: (worldStats[world]?.journalEntries || 0) + 1,
            last_accessed: new Date().toISOString(),
          },
          { onConflict: 'user_id,world_id' }
        );

      if (err) {
        console.error('Failed to record journal entry:', err);
      } else {
        queryClient.invalidateQueries({ queryKey: ['worldPreferences', session.user.id] });
      }
    },
    [session?.user?.id, worldStats, queryClient]
  );

  // Record decision for world
  const recordDecision = useCallback(
    async (world: WorldId) => {
      if (!session?.user?.id) return;

      const { error: err } = await supabase
        .from('world_stats')
        .upsert(
          {
            user_id: session.user.id,
            world_id: world,
            decisions_made: (worldStats[world]?.decisionsMade || 0) + 1,
            last_accessed: new Date().toISOString(),
          },
          { onConflict: 'user_id,world_id' }
        );

      if (err) {
        console.error('Failed to record decision:', err);
      } else {
        queryClient.invalidateQueries({ queryKey: ['worldPreferences', session.user.id] });
      }
    },
    [session?.user?.id, worldStats, queryClient]
  );

  // Record insight for world
  const recordInsight = useCallback(
    async (world: WorldId) => {
      if (!session?.user?.id) return;

      const { error: err } = await supabase
        .from('world_stats')
        .upsert(
          {
            user_id: session.user.id,
            world_id: world,
            insights_gained: (worldStats[world]?.insightsGained || 0) + 1,
            last_insight_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,world_id' }
        );

      if (err) {
        console.error('Failed to record insight:', err);
      } else {
        queryClient.invalidateQueries({ queryKey: ['worldPreferences', session.user.id] });
      }
    },
    [session?.user?.id, worldStats, queryClient]
  );

  // Get world stats
  const getWorldStats = useCallback(
    (world: WorldId): WorldStats | null => {
      return worldStats[world] || null;
    },
    [worldStats]
  );

  // Get top worlds by visits
  const getTopWorlds = useCallback(
    (limit = 3): WorldId[] => {
      return Object.values(worldStats)
        .sort((a, b) => b.visitsCount - a.visitsCount)
        .slice(0, limit)
        .map((stat) => stat.worldId);
    },
    [worldStats]
  );

  // P0 #7.4: Badge tracking methods
  const getWorldBadges = useCallback(
    (world: WorldId): WorldBadgeProgress | null => {
      return worldBadges[world] || null;
    },
    [worldBadges]
  );

  const unlockBadge = useCallback(
    async (world: WorldId, badgeId: string) => {
      if (!session?.user?.id) return;
      await WorldBadgeTracker.unlockBadge(session.user.id, badgeId, world);
      // Reload badges
      const updated = await WorldBadgeTracker.getWorldBadges(session.user.id, world);
      setWorldBadges((prev) => ({ ...prev, [world]: updated }));
      const points = await WorldBadgeTracker.getTotalWorldPoints(session.user.id);
      setTotalWorldPoints(points);
    },
    [session?.user?.id]
  );

  const getWorldMastery = useCallback(
    async (world: WorldId): Promise<number> => {
      if (!session?.user?.id) return 0;
      return await WorldBadgeTracker.getWorldMastery(session.user.id, world);
    },
    [session?.user?.id]
  );

  // Load badges on mount
  useEffect(() => {
    if (session?.user?.id) {
      (async () => {
        const achievements = await WorldBadgeTracker.getAllWorldAchievements(session.user.id);
        setWorldBadges(achievements);
        const points = await WorldBadgeTracker.getTotalWorldPoints(session.user.id);
        setTotalWorldPoints(points);
      })();
    }
  }, [session?.user?.id]);

  // CTXMEMO-001 FIX (4 ก.ย. 2026): provider นี้อยู่ในสแตกที่ซ้อนกัน 13 ชั้นใน
  // App.tsx — object literal ตัวใหม่ทุก render บังคับให้ consumer ทุกตัวของ
  // context นี้ re-render แม้ค่าข้างในจะเหมือนเดิมทุกประการ
  const value = useMemo<WorldContextType>(() => ({
    currentWorld,
    favoriteWorlds,
    worldPreferences,
    worldStats,
    worldBadges,
    totalWorldPoints,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    setCurrentWorld,
    toggleFavoriteWorld,
    recordWorldVisit,
    recordJournalEntry,
    recordDecision,
    recordInsight,
    getWorldStats,
    getTopWorlds,
    // P0 #7.4: Badge methods
    getWorldBadges,
    unlockBadge,
    getWorldMastery,
  }), [currentWorld, favoriteWorlds, worldPreferences, worldStats, worldBadges, totalWorldPoints, isLoading, error, setCurrentWorld, toggleFavoriteWorld, recordWorldVisit, recordJournalEntry, recordDecision, recordInsight, getWorldStats, getTopWorlds, getWorldBadges, unlockBadge, getWorldMastery]);

  return (
    <WorldContext.Provider value={value}>
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld(): WorldContextType {
  const context = React.useContext(WorldContext);
  if (context === undefined) {
    throw new Error('useWorld must be used within WorldProvider');
  }
  return context;
}

export default WorldContext;
