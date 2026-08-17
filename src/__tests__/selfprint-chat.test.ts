/**
 * Test Suite: SelfPrint Chat API Wrapper
 * Tests selfprintChat() for Brain Gateway integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selfprintChat, SelfprintChatError } from '../lib/api/selfprintChat';
import type { SelfprintChatRequest, SelfprintChatResponse } from '../lib/api/selfprintChat';

// Mock fetch
global.fetch = vi.fn();

describe('selfprintChat - Brain Gateway Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Formatting', () => {
    it('should format a valid request with all required fields', async () => {
      const mockResponse = {
        response: { text: 'Test response' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 100,
          outputTokens: 50,
          processingTimeMs: 500,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: SelfprintChatRequest = {
        userId: 'user123',
        sessionId: 'session456',
        hub: 'decision',
        mood: 'ready',
        question: 'How should I approach this decision?',
      };

      const response = await selfprintChat(request);

      expect(response).toBeDefined();
      expect(response.response.text).toBe('Test response');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should include hub, mood, and archetype in request', async () => {
      const mockResponse = {
        response: { text: 'Response' },
        persona: { hub: 'identity', mood: 'reflective' },
        metadata: {
          inputTokens: 100,
          outputTokens: 50,
          processingTimeMs: 500,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'identity',
        mood: 'reflective',
        archetype: 'guide',
        question: 'Who am I really?',
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall).toBeDefined();
    });

    it('should support optional birthData and twinProfile', async () => {
      const mockResponse = {
        response: { text: 'Response with context' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 150,
          outputTokens: 75,
          processingTimeMs: 600,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: SelfprintChatRequest = {
        userId: 'user123',
        sessionId: 'session456',
        hub: 'decision',
        mood: 'ready',
        question: 'What should I do?',
        birthData: {
          date: '1990-05-15',
          time: '14:30',
          latitude: 13.7563,
          longitude: 100.5018,
        },
        twinProfile: {
          id: 'twin1',
          userId: 'user123',
          primaryArchetype: 'strategist',
          maturityScore: 75,
        },
      };

      const response = await selfprintChat(request);

      expect(response).toBeDefined();
      expect(response.response.text).toBe('Response with context');
    });
  });

  describe('Response Parsing', () => {
    it('should parse valid response structure', async () => {
      const mockResponse: SelfprintChatResponse = {
        response: {
          text: 'Nova says: This is important.',
          thinking: 'User is in decision paralysis...',
        },
        persona: {
          archetype: 'strategist',
          hub: 'decision',
          mood: 'ready',
          maturityLevel: 75,
        },
        metadata: {
          inputTokens: 200,
          outputTokens: 100,
          processingTimeMs: 750,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'decision',
        mood: 'ready',
        question: 'Question?',
      });

      expect(response.response.text).toBe('Nova says: This is important.');
      expect(response.persona.archetype).toBe('strategist');
      expect(response.metadata.inputTokens).toBe(200);
      expect(response.metadata.outputTokens).toBe(100);
    });

    it('should extract learning signals from response', async () => {
      const mockResponse: SelfprintChatResponse = {
        response: { text: 'Response' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 100,
          outputTokens: 50,
          processingTimeMs: 500,
          timestamp: new Date().toISOString(),
        },
        learning: {
          discovered: ['analytical-thinker', 'future-focused'],
          blindSpotsAffirmed: true,
          growthOpportunitiesIdentified: ['emotional-awareness', 'delegate-trust'],
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
        question: 'What can I learn?',
      });

      expect(response.learning?.discovered).toContain('analytical-thinker');
      expect(response.learning?.blindSpotsAffirmed).toBe(true);
      expect(response.learning?.growthOpportunitiesIdentified).toContain('emotional-awareness');
    });

    it('should handle missing optional learning signals', async () => {
      const mockResponse: SelfprintChatResponse = {
        response: { text: 'Simple response' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 50,
          outputTokens: 25,
          processingTimeMs: 300,
          timestamp: new Date().toISOString(),
        },
        // No learning signals
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'decision',
        mood: 'ready',
        question: 'Q?',
      });

      expect(response.learning).toBeUndefined();
      expect(response.response.text).toBe('Simple response');
    });
  });

  describe('Error Handling', () => {
    it('should throw SelfprintChatError on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      await expect(
        selfprintChat({
          userId: 'user1',
          sessionId: 'sess1',
          hub: 'decision',
          mood: 'ready',
          question: 'Q?',
        })
      ).rejects.toThrow(SelfprintChatError);
    });

    it('should include error code and message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      try {
        await selfprintChat({
          userId: 'user1',
          sessionId: 'sess1',
          hub: 'decision',
          mood: 'ready',
          question: 'Q?',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(SelfprintChatError);
        expect((error as SelfprintChatError).statusCode).toBe(401);
      }
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      await expect(
        selfprintChat({
          userId: 'user1',
          sessionId: 'sess1',
          hub: 'decision',
          mood: 'ready',
          question: 'Q?',
        })
      ).rejects.toThrow();
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Invalid JSON');
        },
      });

      await expect(
        selfprintChat({
          userId: 'user1',
          sessionId: 'sess1',
          hub: 'decision',
          mood: 'ready',
          question: 'Q?',
        })
      ).rejects.toThrow();
    });
  });

  describe('Hub & Mood Context', () => {
    it('should support all hub values', async () => {
      const hubs = ['identity', 'decision', 'relationship', 'career', 'health', 'money', 'ai-twin', 'learning', 'creativity', 'spirituality', 'impact', 'activities'] as const;

      const mockResponse = {
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

      for (const hub of hubs) {
        const response = await selfprintChat({
          userId: 'user1',
          sessionId: 'sess1',
          hub,
          mood: 'ready',
          question: 'Question?',
        });

        expect(response).toBeDefined();
      }
    });

    it('should support all mood values', async () => {
      const moods = ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'] as const;

      const mockResponse = {
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

      for (const mood of moods) {
        const response = await selfprintChat({
          userId: 'user1',
          sessionId: 'sess1',
          hub: 'decision',
          mood,
          question: 'Question?',
        });

        expect(response).toBeDefined();
      }
    });
  });

  describe('Message History', () => {
    it('should support chat history', async () => {
      const mockResponse = {
        response: { text: 'Contextual response' },
        persona: { hub: 'decision', mood: 'ready' },
        metadata: {
          inputTokens: 200,
          outputTokens: 100,
          processingTimeMs: 800,
          timestamp: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const history = [
        { role: 'user' as const, content: 'I have a decision to make' },
        { role: 'assistant' as const, content: 'Tell me more about the options' },
        { role: 'user' as const, content: 'Option A seems safer' },
      ];

      const response = await selfprintChat({
        userId: 'user1',
        sessionId: 'sess1',
        hub: 'decision',
        mood: 'ready',
        question: 'But what does my gut tell me?',
        history,
      });

      expect(response.response.text).toBe('Contextual response');
      expect(response.metadata.inputTokens).toBe(200);
    });
  });
});
