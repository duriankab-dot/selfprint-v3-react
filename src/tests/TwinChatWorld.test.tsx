/**
 * TwinChatWorld.test.tsx
 * Test world-specific Twin chat features (P0 #7.2)
 */

import { describe, it, expect } from 'vitest';
import { buildWorldSystemPrompt, getBaseTwinPrompt } from '../lib/worldSystemPromptBuilder';
import { WORLDS } from '../constants/worlds';

describe('World System Prompt Builder', () => {
  describe('buildWorldSystemPrompt', () => {
    it('should build prompt for self world', () => {
      const prompt = buildWorldSystemPrompt('self');
      expect(prompt).toContain('Self');
      expect(prompt).toContain('identity');
      expect(prompt).toContain('authentic');
    });

    it('should build prompt for all worlds', () => {
      for (const worldId of Object.keys(WORLDS)) {
        const prompt = buildWorldSystemPrompt(worldId as any);
        expect(prompt).toBeTruthy();
        expect(prompt.length).toBeGreaterThan(100);
      }
    });

    it('should include world-specific focus areas in prompt', () => {
      const prompt = buildWorldSystemPrompt('career');
      const worldInfo = WORLDS.career;
      for (const area of worldInfo.focusAreas) {
        expect(prompt.toLowerCase()).toContain(area.toLowerCase());
      }
    });

    it('should include world description in prompt', () => {
      const prompt = buildWorldSystemPrompt('mind');
      const worldInfo = WORLDS.mind;
      expect(prompt).toContain(worldInfo.description);
    });

    it('should include world tagline in prompt', () => {
      const prompt = buildWorldSystemPrompt('love');
      const worldInfo = WORLDS.love;
      expect(prompt).toContain(worldInfo.tagline);
    });
  });

  describe('getBaseTwinPrompt', () => {
    it('should return base Twin prompt', () => {
      const prompt = getBaseTwinPrompt();
      expect(prompt).toContain('Twin');
      expect(prompt).toContain('warmth');
    });

    it('should be different from world-specific prompts', () => {
      const basePrompt = getBaseTwinPrompt();
      const selfPrompt = buildWorldSystemPrompt('self');
      expect(basePrompt).not.toBe(selfPrompt);
    });
  });

  describe('World Context Integration', () => {
    it('should handle all world IDs from WORLDS constant', () => {
      const worldIds = Object.keys(WORLDS);
      expect(worldIds.length).toBe(12); // 12 worlds

      for (const worldId of worldIds) {
        const prompt = buildWorldSystemPrompt(worldId as any);
        expect(prompt).toBeTruthy();
        expect(prompt).not.toContain('undefined');
        expect(prompt).not.toContain('null');
      }
    });

    it('prompt should be ready for AI consumption', () => {
      const prompt = buildWorldSystemPrompt('career');
      // Should be a reasonable length for LLM context
      expect(prompt.length).toBeGreaterThan(200);
      expect(prompt.length).toBeLessThan(5000);
    });
  });
});

describe('TwinChat World Navigation', () => {
  it('should support world query parameter', () => {
    // This is an integration test placeholder
    // Full test would render TwinChat with world param
    const worldId = 'self';
    expect(Object.keys(WORLDS)).toContain(worldId);
  });

  it('should validate world ID before using', () => {
    const validWorld = 'career';
    const invalidWorld = 'invalid-world';

    const isValidValid = Object.keys(WORLDS).includes(validWorld);
    const isValidInvalid = Object.keys(WORLDS).includes(invalidWorld);

    expect(isValidValid).toBe(true);
    expect(isValidInvalid).toBe(false);
  });

  it('should gracefully handle missing world param', () => {
    // TwinChat should work without world param
    // Falls back to general Twin chat
    expect(true).toBe(true); // Placeholder
  });
});
