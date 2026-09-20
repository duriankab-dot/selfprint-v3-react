/**
 * WorldBadgeTracker.ts
 * Track and unlock world-specific badges and achievements (P0 #7.4)
 */

import type { WorldId } from '../constants/worlds';
import type { Badge } from '../types/badges';
import { getWorldBadges, calculateWorldPoints } from '../types/badges';
import { supabase } from './supabase-service';

export interface WorldBadgeProgress {
  worldId: WorldId;
  unlockedBadges: string[];
  totalPoints: number;
  nextBadges: Badge[];
}

export class WorldBadgeTracker {
  /**
   * Get unlocked badges for a user in a world
   */
  static async getWorldBadges(
    userId: string,
    worldId: WorldId
  ): Promise<WorldBadgeProgress> {
    try {
      // Query unlocked_badges table from Supabase (public schema)
      const { data: unlockedData, error } = await supabase
        .from('unlocked_badges')
        .select('badge_id')
        .eq('user_id', userId)
        .eq('world_id', worldId);

      if (error) {
        console.error('Failed to fetch unlocked badges:', error);
        throw error;
      }

      const unlockedBadges = (unlockedData || []).map((row: any) => row.badge_id);
      const allBadges = getWorldBadges(worldId);
      const totalPoints = calculateWorldPoints(worldId, unlockedBadges);

      return {
        worldId,
        unlockedBadges,
        totalPoints,
        nextBadges: allBadges.filter((b) => !unlockedBadges.includes(b.id)),
      };
    } catch (error) {
      console.error('Failed to get world badges:', error);
      return {
        worldId,
        unlockedBadges: [],
        totalPoints: 0,
        nextBadges: getWorldBadges(worldId),
      };
    }
  }

  /**
   * Unlock a badge for user
   */
  static async unlockBadge(userId: string, badgeId: string, worldId: WorldId): Promise<boolean> {
    try {
      // Check if badge is already unlocked (public schema)
      const { data: existing } = await supabase
        .from('unlocked_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .eq('world_id', worldId)
        .maybeSingle();

      if (existing) {
        // Already unlocked
        return true;
      }

      // Insert into unlocked_badges table with timestamp (public schema)
      const { error } = await supabase
        .from('unlocked_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          world_id: worldId,
          unlocked_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to unlock badge:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to unlock badge:', error);
      return false;
    }
  }

  /**
   * Check if all badges in a world are unlocked (world mastery)
   */
  static async isWorldMastered(userId: string, worldId: WorldId): Promise<boolean> {
    const progress = await this.getWorldBadges(userId, worldId);
    const allBadges = getWorldBadges(worldId);
    return progress.unlockedBadges.length === allBadges.length;
  }

  /**
   * Get all world achievements for user — SINGLE QUERY optimization.
   * Replaces the previous N+1 pattern (12 sequential queries) with one
   * batched query that fetches all unlocked badges at once and groups
   * them client-side by world_id.
   */
  static async getAllWorldAchievements(
    userId: string
  ): Promise<Record<WorldId, WorldBadgeProgress>> {
    const worlds: WorldId[] = [
      'self',
      'mind',
      'relationship',
      'love',
      'career',
      'wealth',
      'life',
      'growth',
      'decision',
      'purpose',
      'wellbeing',
      'future',
    ];

    // Single batched query — replaces 12 sequential requests
    let allUnlockedRows: Array<{ badge_id: string; world_id: string }> = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('unlocked_badges')
        .select('badge_id, world_id')
        .eq('user_id', userId);
      if (!error && data) {
        allUnlockedRows = data as any;
      } else if (error) {
        console.error('Failed to fetch unlocked badges:', error);
      }
    }

    // Group by world_id client-side
    const groupedByWorld = new Map<string, string[]>();
    for (const row of allUnlockedRows) {
      const w = row.world_id as WorldId;
      if (!groupedByWorld.has(w)) groupedByWorld.set(w, []);
      groupedByWorld.get(w)!.push(row.badge_id);
    }

    const achievements: Record<WorldId, WorldBadgeProgress> = {} as Record<
      WorldId,
      WorldBadgeProgress
    >;

    for (const worldId of worlds) {
      const unlockedBadges = groupedByWorld.get(worldId) || [];
      const allBadges = getWorldBadges(worldId);
      const totalPoints = calculateWorldPoints(worldId, unlockedBadges);

      achievements[worldId] = {
        worldId,
        unlockedBadges,
        totalPoints,
        nextBadges: allBadges.filter((b) => !unlockedBadges.includes(b.id)),
      };
    }

    return achievements;
  }

  /**
   * Calculate total points across all worlds — uses getAllWorldAchievements
   * which now fetches all data in a single query.
   */
  static async getTotalWorldPoints(userId: string): Promise<number> {
    const achievements = await this.getAllWorldAchievements(userId);
    return Object.values(achievements).reduce((sum, world) => sum + world.totalPoints, 0);
  }

  /**
   * Get world mastery level (0-100)
   */
  static async getWorldMastery(userId: string, worldId: WorldId): Promise<number> {
    const progress = await this.getWorldBadges(userId, worldId);
    const allBadges = getWorldBadges(worldId);
    return allBadges.length > 0
      ? Math.round((progress.unlockedBadges.length / allBadges.length) * 100)
      : 0;
  }
}
