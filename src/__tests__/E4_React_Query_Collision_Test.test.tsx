/**
 * E4 React Query Collision Test
 * 
 * Proves that the canonical cache key ['personalContext', userId, 'canonical']
 * prevents library/SICE shape collisions by using selector-based derived views.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CANONICAL_PCB_CACHE_KEY } from '@/types/personalContext';
import { libPersonalContextToCanonical, createEmptyCanonicalContext } from '@/lib/intelligence/canonicalAdapter';
import { sicePersonalContextToCanonical, enrichCanonicalWithSice } from '@/services/sice/canonicalAdapter';
import {
  usePersonalContextLib,
  usePersonalContextSice,
  usePersonalContextEngine,
  usePersonalContextCanonical,
} from '@/hooks/usePersonalContext';

// Mock CanonicalPersonalContextBuilder
const mockBuilderFn = vi.fn();
vi.mock('@/lib/intelligence/CanonicalPersonalContextBuilder', () => ({
  CanonicalPersonalContextBuilder: function() {
    this.getContext = mockBuilderFn;
  },
}));

describe('E4 React Query Collision Test', () => {
  let queryClient: QueryClient;
  
  const setup = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  };

  beforeEach(() => {
    setup();
    vi.clearAllMocks();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  // Shared mock data
  const libCtx = {
    userId: 'u_test',
    values: [{ id: 'v1', name: 'ความซื่อสัตย์', category: 'core', confidence: 0.9, sourceRefs: [], createdAt: new Date(), updatedAt: new Date() }],
    goals: [{ title: 'เรียนภาษาใหม่', description: 'ภาษาญี่ปุ่น', confidence: 0.8, evidence: [], inferredFromSources: [] }],
    strengths: [{ name: 'ความอดทน', description: 'อดทนได้ดี', confidence: 0.85, evidence: [], inferredFromSources: [], relatedPatterns: [] }],
    blindSpots: [],
    emotionalRange: {
      primaryMoods: ['calm', 'focused'], volatility: 0.3, responseToStress: 'analytical',
      emotionalTriggers: ['deadline pressure'], confidence: 0.8,
    },
    decisionStyle: { type: 'analytical' as const, description: 'Analytical thinker', confidence: 0.8, evidence: [] },
    relationships: [],
    confidenceOverall: 0.75,
    sourceCount: 10,
    lastUpdated: new Date(),
    modelVersion: 2,
    hubsActive: ['career', 'learning'],
  };

  const siceResult = {
    engineId: 1, engineName: 'PersonalContextBuilder',
    result: {
      userId: 'u_test', emotionalState: 'focused',
      currentGoals: ['เรียนภาษาญี่ปุ่น', 'พัฒนาอาชีพ'],
      activePatterns: ['deep-work-morning (85% success)'],
      worldFocus: 'career',
      recentMemories: [
        { timestamp: new Date().toISOString(), content: 'ทำโปรเจกต์เสร็จทันเวลา' },
      ],
      strengthAreas: ['career', 'learning'],
      growthAreas: ['relationship', 'health'],
      worldPersonality: { mood: 'determined', responseStyle: 'pragmatic', focusArea: 'career advancement' },
    },
    confidence: 80, executionTime: 50,
  };

  // Build expected merged canonical context
  const libCanonical = libPersonalContextToCanonical(libCtx, { userId: 'u_test', currentWorld: 'career' });
  const siceCanonical = sicePersonalContextToCanonical(siceResult.result as any, { userId: 'u_test' });
  const expectedCanonical = enrichCanonicalWithSice(libCanonical, siceCanonical);

  // Set up mock builder to return merged canonical
  const setupMock = () => {
    mockBuilderFn.mockResolvedValue({
      context: expectedCanonical,
      success: true,
      message: 'Canonical context built successfully',
    });
  };

  describe('Single cache key prevents collision', () => {
    it('all selectors read from SAME cache entry', async () => {
      setupMock();

      const { result: libResult } = renderHook(() => usePersonalContextLib({ userId: 'u_test', currentWorld: 'career' }), { wrapper });
      const { result: siceHookResult } = renderHook(() => usePersonalContextSice({ userId: 'u_test', currentWorld: 'career' }), { wrapper });
      const { result: engineResult } = renderHook(() => usePersonalContextEngine({ userId: 'u_test', currentWorld: 'career' }), { wrapper });
      const { result: canonicalResult } = renderHook(() => usePersonalContextCanonical({ userId: 'u_test', currentWorld: 'career' }), { wrapper });

      await waitFor(() => expect(libResult.current.data).toBeDefined());

      // All selectors should have data
      expect(libResult.current.data).toBeDefined();
      expect(siceHookResult.current.data).toBeDefined();
      expect(engineResult.current.data).toBeDefined();
      expect(canonicalResult.current.data).toBeDefined();

      // Verify single cache entry was created
      const cacheEntries = queryClient.getQueryCache().findAll({ queryKey: CANONICAL_PCB_CACHE_KEY('u_test') });
      expect(cacheEntries.length).toBe(1);

      // Verify the same queryFn was called only once
      expect(mockBuilderFn).toHaveBeenCalledTimes(1);
    });

    it('lib selector returns lib PersonalContext shape', async () => {
      setupMock();

      const { result } = renderHook(() => usePersonalContextLib({ userId: 'u_test', currentWorld: 'career' }), { wrapper });
      await waitFor(() => expect(result.current.data).toBeDefined());

      const data = result.current.data!;
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('values');
      expect(data).toHaveProperty('goals');
      expect(data).toHaveProperty('strengths');
      expect(data).toHaveProperty('emotionalRange');
      expect(data).toHaveProperty('confidenceOverall');
      expect(data.confidenceOverall).toBe(0.75); // From lib
      expect(data.sourceCount).toBe(10); // From lib
      // SICE-specific fields NOT in lib shape
      expect((data as any).emotionalState).toBeUndefined();
      expect((data as any).currentGoals).toBeUndefined();
    });

    it('SICE selector returns SICE PersonalContext shape', async () => {
      setupMock();

      const { result: siceHookResult } = renderHook(() => usePersonalContextSice({ userId: 'u_test', currentWorld: 'career' }), { wrapper });
      await waitFor(() => expect(siceHookResult.current.data).toBeDefined());

      const data = siceHookResult.current.data!;
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('emotionalState');
      expect(data).toHaveProperty('currentGoals');
      expect(data).toHaveProperty('activePatterns');
      expect(data).toHaveProperty('worldFocus');
      expect(data).toHaveProperty('worldPersonality');
      expect(data.emotionalState).toBe('focused');
      expect(data.worldFocus).toBe('career');
      expect(data.currentGoals).toContain('เรียนภาษาญี่ปุ่น');
      // Lib-specific fields NOT in SICE shape
      expect((data as any).values).toBeUndefined();
      expect((data as any).emotionalRange).toBeUndefined();
    });

    it('engine selector includes confidence on 0-100 scale', async () => {
      setupMock();

      const { result: engResult } = renderHook(() => usePersonalContextEngine({ userId: 'u_test', currentWorld: 'career' }), { wrapper });
      await waitFor(() => expect(engResult.current.data).toBeDefined());

      const data = engResult.current.data!;
      expect(data).toHaveProperty('emotionalState');
      expect(data).toHaveProperty('confidence');
      // Engine expects SICEOutput.confidence scale (0-100)
      expect(data.confidence).toBe(75); // 0.75 → 75
    });

    it('TwinPersonalityPage gets correct SICE/world projection', async () => {
      setupMock();

      const { result: tpResult } = renderHook(() => usePersonalContextSice({ userId: 'u_test', currentWorld: 'career' }), { wrapper });
      await waitFor(() => expect(tpResult.current.data).toBeDefined());

      const data = tpResult.current.data!;
      // TwinPersonalityPage uses SICE shape for world-personality display
      expect(data.worldPersonality).toBeDefined();
      expect(data.worldPersonality?.responseStyle).toBe('pragmatic');
      expect(data.strengthAreas).toContain('career');
      expect(data.growthAreas).toContain('relationship');
    });
  });

  describe('No legacy key usage in production hooks', () => {
    it('usePersonalContextLib does not use legacy key', async () => {
      setupMock();

      const { result } = renderHook(() => usePersonalContextLib({ userId: 'u_test' }), { wrapper });
      await waitFor(() => expect(result.current.data).toBeDefined());

      // Verify only canonical key is in cache
      const legacyEntries = queryClient.getQueryCache().findAll({ queryKey: ['personalContext', 'u_test'] });
      const canonicalEntries = queryClient.getQueryCache().findAll({ queryKey: ['personalContext', 'u_test', 'canonical'] });
      
      // Should have canonical entries but NO bare ['personalContext', userId] entries
      expect(canonicalEntries.length).toBeGreaterThanOrEqual(1);
      // Legacy key without 'canonical' suffix should have zero active entries
      expect(legacyEntries.filter(e => e.queryKey.length === 2)).toHaveLength(0);
    });
  });

  describe('Selector isolation — changing one hook does not affect others', () => {
    it('all selectors share the same underlying React Query data', async () => {
      setupMock();

      const { result: libResult } = renderHook(() => usePersonalContextLib({ userId: 'u_test' }), { wrapper });
      const { result: siceHookResult } = renderHook(() => usePersonalContextSice({ userId: 'u_test' }), { wrapper });
      
      await waitFor(() => expect(libResult.current.data).toBeDefined());

      // Get the shared raw data from cache
      const sharedKey = CANONICAL_PCB_CACHE_KEY('u_test');
      const sharedCacheData = queryClient.getQueryData(sharedKey) as any;
      expect(sharedCacheData).toBeDefined();
      expect(sharedCacheData.userId).toBe('u_test');

      // Both hooks read from the single canonical cache entry
      expect(queryClient.getQueryData(sharedKey)).toBeTruthy();
    });
  });

  describe('Cache key uniqueness — canonical vs legacy are separate', () => {
    it('setting legacy key data does not interfere with canonical data', async () => {
      setupMock();

      // First, set some legacy data (simulating pre-migration state)
      queryClient.setQueryData(['personalContext', 'u_test'], {
        userId: 'u_test',
        emotionalState: 'old_legacy_data',
        currentGoals: ['legacy_goal'],
      });

      // Now fetch canonical context
      const { result: libResult } = renderHook(() => usePersonalContextLib({ userId: 'u_test' }), { wrapper });
      await waitFor(() => expect(libResult.current.data).toBeDefined());

      // Verify they are DIFFERENT cache entries with DIFFERENT data
      const legacyEntry = queryClient.getQueryData(['personalContext', 'u_test']);
      const canonicalEntry = queryClient.getQueryData(CANONICAL_PCB_CACHE_KEY('u_test'));

      expect(legacyEntry).toEqual({
        userId: 'u_test',
        emotionalState: 'old_legacy_data',
        currentGoals: ['legacy_goal'],
      });
      expect(canonicalEntry).not.toEqual(legacyEntry);
      // Lib selector should return lib shape from canonical, not legacy
      expect(libResult.current.data?.emotionalState).toBeUndefined();
    });
  });
});
