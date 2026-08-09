/**
 * Memory Manager
 * Handles persistent storage of personal memories
 * Small wins, important moments, discoveries, personal notes
 * @module intelligence/MemoryManager
 */

import { supabase } from '@/lib/supabase/client';
import { IntelligenceError } from './types';
import type { PersonalMemory, MemoryType } from './types';

/**
 * MemoryManager
 * CRUD operations for personal memories
 *
 * Usage:
 * ```typescript
 * const manager = new MemoryManager();
 * const memory = await manager.addMemory(userId, 'small_win', 'Won a promotion', '...');
 * ```
 */
export class MemoryManager {
  /**
   * Add a new memory
   * @param userId User ID
   * @param type Type of memory (small_win, important_moment, discovery, personal)
   * @param title Memory title
   * @param content Full content
   * @param linkedTo Optional ID of related decision/journal
   * @returns Created PersonalMemory
   */
  async addMemory(
    userId: string,
    type: MemoryType,
    title: string,
    content: string,
    linkedTo?: string,
    tags?: string[]
  ): Promise<PersonalMemory> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');
    if (!title || !content) throw new IntelligenceError('Title and content required', 'MISSING_DATA');

    try {
      const { data, error } = await supabase
        .from('personal_memory')
        .insert({
          user_id: userId,
          memory_type: type,
          title,
          content,
          linked_to: linkedTo || null,
          confidence: 0.8,
          tags: tags || [],
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapFromDB(data);
    } catch (error) {
      throw new IntelligenceError(
        `Failed to add memory: ${error}`,
        'ADD_MEMORY_FAILED'
      );
    }
  }

  /**
   * Get all memories for user
   * @param userId User ID
   * @param type Optional filter by memory type
   * @param limit Optional limit (default 100)
   * @returns Array of PersonalMemory
   */
  async getMemories(
    userId: string,
    type?: MemoryType,
    limit: number = 100
  ): Promise<PersonalMemory[]> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      let query = supabase
        .from('personal_memory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('memory_type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map((d) => this.mapFromDB(d));
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get memories: ${error}`,
        'GET_MEMORIES_FAILED'
      );
    }
  }

  /**
   * Get single memory by ID
   * @param memoryId Memory ID
   * @returns PersonalMemory
   */
  async getMemory(memoryId: string): Promise<PersonalMemory> {
    if (!memoryId) throw new IntelligenceError('Memory ID required', 'MISSING_ID');

    try {
      const { data, error } = await supabase
        .from('personal_memory')
        .select('*')
        .eq('id', memoryId)
        .single();

      if (error) throw error;
      if (!data) throw new IntelligenceError('Memory not found', 'NOT_FOUND', 404);

      return this.mapFromDB(data);
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get memory: ${error}`,
        'GET_MEMORY_FAILED'
      );
    }
  }

  /**
   * Update memory
   * @param memoryId Memory ID
   * @param updates Partial updates
   * @returns Updated PersonalMemory
   */
  async updateMemory(
    memoryId: string,
    updates: Partial<PersonalMemory>
  ): Promise<PersonalMemory> {
    if (!memoryId) throw new IntelligenceError('Memory ID required', 'MISSING_ID');

    try {
      const { data, error } = await supabase
        .from('personal_memory')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.content && { content: updates.content }),
          ...(updates.memoryType && { memory_type: updates.memoryType }),
          ...(updates.linkedTo && { linked_to: updates.linkedTo }),
          ...(updates.confidence && { confidence: updates.confidence }),
          ...(updates.tags && { tags: updates.tags }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', memoryId)
        .select()
        .single();

      if (error) throw error;
      return this.mapFromDB(data);
    } catch (error) {
      throw new IntelligenceError(
        `Failed to update memory: ${error}`,
        'UPDATE_MEMORY_FAILED'
      );
    }
  }

  /**
   * Delete memory
   * @param memoryId Memory ID
   */
  async deleteMemory(memoryId: string): Promise<void> {
    if (!memoryId) throw new IntelligenceError('Memory ID required', 'MISSING_ID');

    try {
      const { error } = await supabase
        .from('personal_memory')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;
    } catch (error) {
      throw new IntelligenceError(
        `Failed to delete memory: ${error}`,
        'DELETE_MEMORY_FAILED'
      );
    }
  }

  /**
   * Link memory to decision/journal
   * @param memoryId Memory ID
   * @param toDecisionId Decision or journal ID to link to
   */
  async linkMemory(memoryId: string, toDecisionId: string): Promise<PersonalMemory> {
    if (!memoryId || !toDecisionId) {
      throw new IntelligenceError('Memory ID and decision ID required', 'MISSING_ID');
    }

    try {
      const { data, error } = await supabase
        .from('personal_memory')
        .update({
          linked_to: toDecisionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memoryId)
        .select()
        .single();

      if (error) throw error;
      return this.mapFromDB(data);
    } catch (error) {
      throw new IntelligenceError(
        `Failed to link memory: ${error}`,
        'LINK_MEMORY_FAILED'
      );
    }
  }

  /**
   * Get all memories of specific type
   * @param userId User ID
   * @param type Memory type
   * @returns Array of PersonalMemory
   */
  async getMemoriesByType(userId: string, type: MemoryType): Promise<PersonalMemory[]> {
    return this.getMemories(userId, type);
  }

  /**
   * Search memories by title or content
   * @param userId User ID
   * @param query Search query
   * @returns Array of matching PersonalMemory
   */
  async searchMemories(userId: string, query: string): Promise<PersonalMemory[]> {
    if (!userId || !query) {
      throw new IntelligenceError('User ID and query required', 'MISSING_DATA');
    }

    try {
      const { data, error } = await supabase
        .from('personal_memory')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

      if (error) throw error;
      return (data || []).map((d) => this.mapFromDB(d));
    } catch (error) {
      throw new IntelligenceError(
        `Failed to search memories: ${error}`,
        'SEARCH_FAILED'
      );
    }
  }

  /**
   * Get memories created after date
   * @param userId User ID
   * @param since Date
   * @returns Array of PersonalMemory
   */
  async getMemoriesSince(userId: string, since: Date): Promise<PersonalMemory[]> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const { data, error } = await supabase
        .from('personal_memory')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((d) => this.mapFromDB(d));
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get memories since date: ${error}`,
        'GET_MEMORIES_SINCE_FAILED'
      );
    }
  }

  /**
   * Clear all memories for user (DANGEROUS - use with caution)
   * @param userId User ID
   */
  async clearAllMemories(userId: string): Promise<void> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const { error } = await supabase
        .from('personal_memory')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw new IntelligenceError(
        `Failed to clear memories: ${error}`,
        'CLEAR_FAILED'
      );
    }
  }

  /**
   * Get statistics about memories
   * @param userId User ID
   * @returns Memory statistics
   */
  async getMemoryStats(userId: string): Promise<any> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const memories = await this.getMemories(userId, undefined, 1000);

      const stats = {
        total: memories.length,
        byType: {} as Record<string, number>,
        averageConfidence: 0,
        recentCount: 0,
      };

      // Group by type
      memories.forEach((m) => {
        stats.byType[m.memoryType] = (stats.byType[m.memoryType] || 0) + 1;
      });

      // Calculate average confidence
      if (memories.length > 0) {
        stats.averageConfidence =
          memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length;
      }

      // Count recent (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      stats.recentCount = memories.filter(
        (m) => new Date(m.createdAt) > thirtyDaysAgo
      ).length;

      return stats;
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get memory stats: ${error}`,
        'STATS_FAILED'
      );
    }
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  /**
   * Map database record to PersonalMemory interface
   */
  private mapFromDB(data: any): PersonalMemory {
    return {
      id: data.id,
      userId: data.user_id,
      memoryType: data.memory_type,
      title: data.title,
      content: data.content,
      linkedTo: data.linked_to,
      confidence: data.confidence,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export default MemoryManager;
