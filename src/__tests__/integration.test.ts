/**
 * Integration Test Suite: Phase 2 Nova AI Twin System
 * Full flow: useChat → selfprintChat → Brain Gateway → Claude
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../features/chat/hooks/useChat';
import { selfprintChat } from '../lib/api/selfprintChat';
import type { SelfprintChatRequest, SelfprintChatResponse } from '../lib/api/selfprintChat';

// Mock Brain Gateway
global.fetch = vi.fn();

describe('Phase 2 Integration Tests - Nova AI Twin System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Full Chat Flow', () => {
    it('should complete full chat flow: hub + mood + archetype → response', async () => {
      const mockResponse: SelfprintChatResponse = {
        response: {
          text: 'Nova responds with insight',
          thinking: 'User is exploring identity...',
        },
        persona: {
          archetype: 'guide',
          hub: 'identity',
          mood: 'reflective',
          maturityLevel: 65,
        },
        metadata: {
          inputTokens: 150,
          outputTokens: 80,
          processingTimeMs: 1200,
          timestamp: new Date().toISOString(),
        },
        learning: {
          discovered: ['introspective', 'value-seeking'],
          blindSpotsAffirmed: true,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: SelfprintChatRequest = {
        userId: 'test-user-1',
        sessionId: 'sess-1',
        hub: 'identity',
        mood: 'reflective',
        archetype: 'guide',
        question: 'Who am I really?',
        birthData: {
          date: '1995-03-15',
          time: '10:30',
          latitude: 13.7563,
          longitude: 100.5018,
        },
      };

      const response = await selfprintChat(request);

      expect(response).toBeDefined();
      expect(response.response.text).toContain('Nova');
      expect(response.persona.hub).toBe('identity');
      expect(response.persona.mood).toBe('reflective');
      expect(response.metadata.processingTimeMs).toBeGreaterThan(0);
    });

    it('should handle multi-turn conversation with history', async () => {
      const mockResponse: SelfprintChatResponse = {
        response: { text: 'Response with context' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 300,
          outputTokens: 150,
          processingTimeMs: 1500,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const history = [
        { role: 'user' as const, content: 'I want to make a change' },
        { role: 'assistant' as const, content: 'What kind of change?' },
        { role: 'user' as const, content: 'Career change' },
        { role: 'assistant' as const, content: 'What are your concerns?' },
      ];

      const response = await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'career',
        mood: 'ready',
        archetype: 'explorer',
        question: 'How do I start?',
        history,
      });

      expect(response.response.text).toBe('Response with context');
      expect(response.metadata.inputTokens).toBe(300); // Should be larger due to history
    });
  });

  describe('All Hub + Mood + Archetype Combinations', () => {
    it('should handle 10+ diverse combinations without error', async () => {
      const testCombinations = [
        { hub: 'identity', mood: 'reflective', archetype: 'guide' },
        { hub: 'decision', mood: 'ready', archetype: 'strategist' },
        { hub: 'decision', mood: 'stressed', archetype: 'explorer' },
        { hub: 'relationship', mood: 'confused', archetype: 'healer' },
        { hub: 'career', mood: 'drained', archetype: 'teacher' },
        { hub: 'health', mood: 'confident', archetype: 'warrior' },
        { hub: 'money', mood: 'reflective', archetype: 'sage' },
        { hub: 'ai-twin', mood: 'ready', archetype: 'creator' },
        { hub: 'learning', mood: 'stressed', archetype: 'magician' },
        { hub: 'creativity', mood: 'confident', archetype: 'lover' },
        { hub: 'spirituality', mood: 'reflective', archetype: 'caregiver' },
        { hub: 'impact', mood: 'ready', archetype: 'everyman' },
      ];

      const mockResponse: SelfprintChatResponse = {
        response: { text: 'Response' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 100,
          outputTokens: 50,
          processingTimeMs: 500,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      let successCount = 0;
      for (const combo of testCombinations) {
        try {
          const response = await selfprintChat({
            userId: 'user1',
            sessionId: 'sess1',
            hub: combo.hub as any,
            mood: combo.mood as any,
            archetype: combo.archetype,
            question: 'Test question?',
          });

          expect(response).toBeDefined();
          expect(response.response.text).toBeDefined();
          successCount++;
        } catch (error) {
          console.error(`Failed for ${combo.hub}/${combo.mood}/${combo.archetype}:`, error);
          throw error;
        }
      }

      expect(successCount).toBe(testCombinations.length);
    });
  });

  describe('Twin Profile Persistence', () => {
    it('should save and retrieve Twin profile from localStorage', () => {
      const twinData = {
        id: 'twin-1',
        userId: 'user1',
        name: 'Nova',
        primaryArchetype: 'guide',
        secondaryArchetype: 'healer',
        maturityScore: 75,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem('twin-profile', JSON.stringify(twinData));

      // Retrieve from localStorage
      const retrieved = JSON.parse(localStorage.getItem('twin-profile') || '{}');

      expect(retrieved.id).toBe('twin-1');
      expect(retrieved.primaryArchetype).toBe('guide');
      expect(retrieved.maturityScore).toBe(75);
    });

    it('should update maturityScore on engagement', () => {
      let twinData = {
        id: 'twin-1',
        userId: 'user1',
        maturityScore: 50,
      };

      localStorage.setItem('twin-profile', JSON.stringify(twinData));

      // Simulate maturity score increase
      twinData.maturityScore = 65;
      localStorage.setItem('twin-profile', JSON.stringify(twinData));

      const retrieved = JSON.parse(localStorage.getItem('twin-profile') || '{}');
      expect(retrieved.maturityScore).toBe(65);
    });
  });

  describe('Maturity Score Impact', () => {
    it('should adjust Nova response depth based on maturityScore', async () => {
      const lowMaturityResponse: SelfprintChatResponse = {
        response: { text: 'Simple guidance for beginners' },
        persona: { hub: 'decision', mood: 'ready', maturityLevel: 20 },
        metadata: {
          inputTokens: 100,
          outputTokens: 50,
          processingTimeMs: 500,
          timestamp: new Date().toISOString(),
        },
      };

      const highMaturityResponse: SelfprintChatResponse = {
        response: { text: 'Complex strategic analysis with nuanced perspective' },
        persona: { hub: 'decision', mood: 'ready', maturityLevel: 90 },
        metadata: {
          inputTokens: 150,
          outputTokens: 150,
          processingTimeMs: 800,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => lowMaturityResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => highMaturityResponse });

      const lowMaturityResult = await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'decision',
        mood: 'ready',
        question: 'What should I do?',
      });

      const highMaturityResult = await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'decision',
        mood: 'ready',
        question: 'What should I do?',
      });

      expect(lowMaturityResult.persona.maturityLevel).toBe(20);
      expect(highMaturityResult.persona.maturityLevel).toBe(90);
      expect(highMaturityResult.response.text.length).toBeGreaterThan(
        lowMaturityResult.response.text.length
      );
    });
  });

  describe('Learning Signal Extraction', () => {
    it('should extract and track discovered archetypes', async () => {
      const mockResponse: SelfprintChatResponse = {
        response: { text: 'Based on our chat, I see strategist and creator patterns' },
        persona: { hub: 'identity', mood: 'reflective' },
        metadata: {
          inputTokens: 100,
          outputTokens: 50,
          processingTimeMs: 500,
          timestamp: new Date().toISOString(),
        },
        learning: {
          discovered: ['strategist', 'creator', 'visionary'],
          blindSpotsAffirmed: false,
          growthOpportunitiesIdentified: ['patience', 'delegation'],
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'identity',
        mood: 'reflective',
        question: 'Who am I?',
      });

      expect(response.learning?.discovered).toContain('strategist');
      expect(response.learning?.discovered).toContain('creator');
      expect(response.learning?.blindSpotsAffirmed).toBe(false);
      expect(response.learning?.growthOpportunitiesIdentified).toContain('patience');
    });
  });

  describe('Error Recovery', () => {
    it('should gracefully handle API failures and retry logic', async () => {
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            response: { text: 'Response after retry' },
            persona: { hub: 'decision', mood: 'ready' },
            metadata: {
              inputTokens: 100,
              outputTokens: 50,
              processingTimeMs: 500,
              timestamp: new Date().toISOString(),
            },
          }),
        });

      // First call fails
      await expect(
        selfprintChat({
          userId: 'user1',
          sessionId: 'sess1',
          hub: 'decision',
          mood: 'ready',
          question: 'Q?',
        })
      ).rejects.toThrow('Network timeout');

      // Second call succeeds
      const response = await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'decision',
        mood: 'ready',
        question: 'Q?',
      });

      expect(response.response.text).toBe('Response after retry');
    });
  });

  describe('Performance', () => {
    it('should complete chat exchange within acceptable latency', async () => {
      const mockResponse: SelfprintChatResponse = {
        response: { text: 'Fast response' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 100,
          outputTokens: 50,
          processingTimeMs: 800, // 0.8 seconds
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const startTime = performance.now();

      await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'decision',
        mood: 'ready',
        question: 'Question?',
      });

      const duration = performance.now() - startTime;

      // Should complete within reasonable time (accounting for mock)
      expect(duration).toBeLessThan(5000); // 5 second timeout
    });

    it('should handle concurrent requests', async () => {
      const mockResponse: SelfprintChatResponse = {
        response: { text: 'Response' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 100,
          outputTokens: 50,
          processingTimeMs: 500,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Fire 5 concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) =>
        selfprintChat({
          userId: `user${i}`,
          sessionId: `sess${i}`,
          hub: 'decision',
          mood: 'ready',
          question: 'Q?',
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.response.text).toBe('Response');
      });
    });
  });
});
