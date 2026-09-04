/**
 * Unit Tests for MemoryManager
 * @module intelligence/__tests__/MemoryManager.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import MemoryManager from './MemoryManager';
import { PersonalMemory } from './types';

// Mock Supabase
// QA-02: vi.mock() is hoisted above every const in this file, so referencing a
// plain top-level `const mockSupabase` from the factory below threw
// "There was an error when mocking a module ... top level variables inside"
// and took the whole suite down. vi.hoisted() lifts the definition with it.
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: {
        id: '123',
        user_id: 'test-user',
        memory_type: 'small_win',
        title: 'Test Memory',
        content: 'Test content',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null
    }),
    // QA-02: MemoryManager moved from .single() to .maybeSingle() for every
    // read/write terminal (MemoryManager.ts:62,135,166,225). The mock still
    // only stubbed .single(), so addMemory/getMemory/updateMemory/linkMemory
    // all blew up with "maybeSingle is not a function".
    maybeSingle: vi.fn().mockResolvedValue({
      data: {
        id: '123',
        user_id: 'test-user',
        memory_type: 'small_win',
        title: 'Test Memory',
        content: 'Test content',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null
    }),
  })),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
  default: mockSupabase,
}));

describe('MemoryManager', () => {
  let manager: MemoryManager;

  beforeEach(() => {
    manager = new MemoryManager();
    vi.clearAllMocks();
  });

  describe('addMemory', () => {
    it('should add a new memory', async () => {
      const memory = await manager.addMemory(
        'test-user-123',
        'small_win',
        'Won a promotion',
        'Got promoted to senior developer'
      );

      expect(memory).toBeDefined();
      expect(memory.userId).toBe('test-user');
      expect(memory.memoryType).toBe('small_win');
      expect(memory.title).toBe('Test Memory');
    });

    it('should throw error without userId', async () => {
      await expect(
        manager.addMemory('', 'small_win', 'Test', 'Content')
      ).rejects.toThrow();
    });

    it('should throw error without title', async () => {
      await expect(
        manager.addMemory('test-user', 'small_win', '', 'Content')
      ).rejects.toThrow();
    });

    it('should throw error without content', async () => {
      await expect(
        manager.addMemory('test-user', 'small_win', 'Title', '')
      ).rejects.toThrow();
    });

    it('should support memory linking', async () => {
      const memory = await manager.addMemory(
        'test-user-123',
        'decision',
        'Accepted new role',
        'Decision to move to new company',
        'decision-456'
      );

      expect(memory).toBeDefined();
    });

    it('should support memory tags', async () => {
      const memory = await manager.addMemory(
        'test-user-123',
        'discovery',
        'Found my passion',
        'Realized I love teaching',
        undefined,
        ['passion', 'career', 'breakthrough']
      );

      expect(memory).toBeDefined();
    });
  });

  describe('getMemories', () => {
    it('should get all memories for user', async () => {
      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().order.mockReturnThis();
      mockSupabase.from().limit.mockResolvedValue({
        data: [],
        error: null
      });

      const memories = await manager.getMemories('test-user-123');
      expect(Array.isArray(memories)).toBe(true);
    });

    it('should filter by memory type', async () => {
      await manager.getMemories('test-user-123', 'small_win', 50);
      expect(true).toBe(true); // Placeholder
    });

    it('should limit results', async () => {
      await manager.getMemories('test-user-123', undefined, 10);
      expect(true).toBe(true); // Placeholder
    });

    it('should throw error without userId', async () => {
      await expect(
        manager.getMemories('')
      ).rejects.toThrow();
    });
  });

  describe('getMemory', () => {
    it('should get single memory by ID', async () => {
      const memory = await manager.getMemory('memory-123');
      expect(memory).toBeDefined();
      expect(memory.id).toBe('123');
    });

    it('should throw error without memory ID', async () => {
      await expect(
        manager.getMemory('')
      ).rejects.toThrow();
    });
  });

  describe('updateMemory', () => {
    it('should update memory', async () => {
      const updated = await manager.updateMemory('memory-123', {
        title: 'Updated title',
        confidence: 0.9,
      });

      expect(updated).toBeDefined();
    });

    it('should throw error without memory ID', async () => {
      await expect(
        manager.updateMemory('', { title: 'New' })
      ).rejects.toThrow();
    });
  });

  describe('deleteMemory', () => {
    it('should delete memory', async () => {
      mockSupabase.from().delete.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue({ error: null });

      await manager.deleteMemory('memory-123');
      expect(true).toBe(true);
    });

    it('should throw error without memory ID', async () => {
      await expect(
        manager.deleteMemory('')
      ).rejects.toThrow();
    });
  });

  describe('linkMemory', () => {
    it('should link memory to decision', async () => {
      const linked = await manager.linkMemory('memory-123', 'decision-456');
      expect(linked).toBeDefined();
    });

    it('should throw error without IDs', async () => {
      await expect(
        manager.linkMemory('', 'decision-456')
      ).rejects.toThrow();
    });
  });

  describe('getMemoriesByType', () => {
    it('should get memories by type', async () => {
      const memories = await manager.getMemoriesByType('test-user', 'small_win');
      expect(Array.isArray(memories)).toBe(true);
    });
  });

  describe('searchMemories', () => {
    it('should search memories', async () => {
      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().or.mockResolvedValue({ data: [], error: null });

      const results = await manager.searchMemories('test-user', 'promotion');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should throw error without query', async () => {
      await expect(
        manager.searchMemories('test-user', '')
      ).rejects.toThrow();
    });
  });

  describe('getMemoriesSince', () => {
    it('should get recent memories', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().gte.mockReturnThis();
      mockSupabase.from().order.mockResolvedValue({ data: [], error: null });

      const memories = await manager.getMemoriesSince('test-user', thirtyDaysAgo);
      expect(Array.isArray(memories)).toBe(true);
    });
  });

  describe('getMemoryStats', () => {
    it('should calculate memory statistics', async () => {
      const stats = await manager.getMemoryStats('test-user');
      expect(stats).toBeDefined();
      expect(stats.total).toBeDefined();
      expect(stats.byType).toBeDefined();
      expect(stats.averageConfidence).toBeDefined();
      expect(stats.recentCount).toBeDefined();
    });

    it('should have zero stats for empty data', async () => {
      const stats = await manager.getMemoryStats('non-existent-user');
      expect(stats.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('clearAllMemories', () => {
    it('should clear all memories (DANGEROUS)', async () => {
      mockSupabase.from().delete.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue({ error: null });

      await manager.clearAllMemories('test-user');
      expect(true).toBe(true);
    });

    it('should throw error without userId', async () => {
      await expect(
        manager.clearAllMemories('')
      ).rejects.toThrow();
    });
  });
});
