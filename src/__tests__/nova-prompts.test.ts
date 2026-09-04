/**
 * Test Suite: Nova System Prompt Builder
 * Tests getNovaPrompt() for unique personality generation
 */

import { describe, it, expect } from 'vitest';
import { getNovaPrompt, AVAILABLE_ARCHETYPES } from '../lib/nova-prompts/getNovaPrompt';

describe('getNovaPrompt - System Prompt Builder', () => {
  describe('Basic Functionality', () => {
    it('should generate a valid system prompt', () => {
      const prompt = getNovaPrompt({
        hub: 'decision',
        mood: 'ready',
        archetype: 'strategist',
      });

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(500);
    });

    it('should include Base Persona in every prompt', () => {
      const prompt = getNovaPrompt({
        hub: 'identity',
        mood: 'stressed',
        archetype: 'healer',
      });

      // QA-02: BASE_PERSONA was rewritten in Thai and the assistant is named
      // SELFPRINT there (getNovaPrompt.ts:33-38) — the literal string "AI Twin"
      // is nowhere in it. Assert the persona block's actual markers.
      expect(prompt).toContain('Nova');
      expect(prompt).toContain('SELFPRINT');
      expect(prompt).toContain('Core Competencies');
      expect(prompt).toContain('Communication Approach');
    });

    it('should include Hub Context for each hub', () => {
      const hubs = ['identity', 'decision', 'relationship', 'career', 'health', 'money', 'ai-twin', 'learning', 'creativity', 'spirituality', 'impact', 'activities'] as const;

      for (const hub of hubs) {
        const prompt = getNovaPrompt({
          hub,
          mood: 'ready',
          archetype: 'guide',
        });
        expect(prompt).toContain('Hub:');
        expect(prompt.length).toBeGreaterThan(800);
      }
    });

    it('should include Mood Modulation for each mood', () => {
      const moods = ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'] as const;

      for (const mood of moods) {
        const prompt = getNovaPrompt({
          hub: 'decision',
          mood,
          archetype: 'navigator',
        });
        expect(prompt.length).toBeGreaterThan(800);
        expect(prompt).toContain('Nova');
      }
    });
  });

  describe('Personality Combinations', () => {
    it('should generate unique prompts for different archetypes', () => {
      // QA-02: 'healer' and 'guide' are not archetypes in this codebase — the
      // set is the 18 keys of ARCHETYPE_VOICES (getNovaPrompt.ts:318). Both
      // unknown names fell through to the `|| ARCHETYPE_VOICES.sage` default
      // (getNovaPrompt.ts:657) and produced byte-identical prompts, so 5 inputs
      // yielded 4 unique outputs. Drive the test off the exported list instead,
      // which also covers all 18 rather than a hand-picked 5.
      const archetypes = AVAILABLE_ARCHETYPES;

      const prompts = archetypes.map(arch =>
        getNovaPrompt({
          hub: 'decision',
          mood: 'ready',
          archetype: arch,
        })
      );

      // Each prompt should be different
      const uniquePrompts = new Set(prompts);
      expect(uniquePrompts.size).toBe(archetypes.length);
    });

    it('should generate unique prompts for different hub + mood combinations', () => {
      const combinations = [
        { hub: 'decision', mood: 'ready' },
        { hub: 'decision', mood: 'stressed' },
        { hub: 'identity', mood: 'ready' },
        { hub: 'relationship', mood: 'confused' },
      ];

      const prompts = combinations.map(combo =>
        getNovaPrompt({
          hub: combo.hub as any,
          mood: combo.mood as any,
          archetype: 'guide',
        })
      );

      const uniquePrompts = new Set(prompts);
      expect(uniquePrompts.size).toBe(combinations.length);
    });

    it('should support all 1,296 personality combinations (18 archetypes × 12 hubs × 6 moods)', () => {
      const archetypes = ['strategist', 'healer', 'guide', 'explorer', 'creator', 'teacher', 'warrior', 'sage', 'magician', 'lover', 'caregiver', 'everyman', 'jester', 'rebel', 'innocent', 'master', 'shadow', 'sovereign'];
      const hubs = ['identity', 'decision', 'relationship', 'career', 'health', 'money', 'ai-twin', 'learning', 'creativity', 'spirituality', 'impact', 'activities'] as const;
      const moods = ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'] as const;

      let count = 0;
      for (const arch of archetypes) {
        for (const hub of hubs) {
          for (const mood of moods) {
            const prompt = getNovaPrompt({
              hub,
              mood,
              archetype: arch,
            });
            expect(prompt).toBeDefined();
            expect(prompt.length).toBeGreaterThan(500);
            count++;
          }
        }
      }

      expect(count).toBe(1296);
    });
  });

  describe('Token Count', () => {
    it('should keep the assembled prompt inside its size budget', () => {
      // QA-02: this used to divide prompt.length by 4 ("1 token ≈ 4 chars"),
      // which is an English-only heuristic. BASE_PERSONA, HUB_CONTEXTS and
      // MOOD_MODULATIONS are now mostly Thai, where a token covers roughly one
      // to two characters — so the char/4 estimate understates the real token
      // count by several times and the 1,000-token floor was unreachable by
      // construction, not because the prompt got smaller. Assert the character
      // budget directly: measured range across all 12×6×18 = 1,296
      // combinations is 2,372-3,091 chars.
      const prompt = getNovaPrompt({
        hub: 'decision',
        mood: 'ready',
        archetype: 'strategist',
      });

      expect(prompt.length).toBeGreaterThan(2000);
      expect(prompt.length).toBeLessThan(4000);
    });

    it('should maintain consistent token count across different combinations', () => {
      const prompts = [
        getNovaPrompt({ hub: 'decision', mood: 'ready', archetype: 'strategist' }),
        getNovaPrompt({ hub: 'identity', mood: 'stressed', archetype: 'healer' }),
        getNovaPrompt({ hub: 'relationship', mood: 'confused', archetype: 'guide' }),
      ];

      const tokenCounts = prompts.map(p => p.length / 4);
      const avgTokens = tokenCounts.reduce((a, b) => a + b) / tokenCounts.length;

      // All should be within ±30% of average
      tokenCounts.forEach(count => {
        expect(Math.abs(count - avgTokens) / avgTokens).toBeLessThan(0.3);
      });
    });
  });

  describe('Maturity Score Integration', () => {
    it('should adjust prompt depth based on maturityScore', () => {
      const lowMaturity = getNovaPrompt({
        hub: 'decision',
        mood: 'ready',
        archetype: 'guide',
        maturityScore: 10,
      });

      const highMaturity = getNovaPrompt({
        hub: 'decision',
        mood: 'ready',
        archetype: 'guide',
        maturityScore: 90,
      });

      // Both should exist and be different
      expect(lowMaturity).toBeDefined();
      expect(highMaturity).toBeDefined();
      expect(lowMaturity).not.toBe(highMaturity);

      // Higher maturity might have more sophisticated language (rough check)
      expect(highMaturity.length).toBeGreaterThanOrEqual(lowMaturity.length - 100);
    });

    it('should handle maturityScore 0-100 range', () => {
      const scores = [0, 25, 50, 75, 100];

      scores.forEach(score => {
        const prompt = getNovaPrompt({
          hub: 'decision',
          mood: 'ready',
          archetype: 'strategist',
          maturityScore: score,
        });

        expect(prompt).toBeDefined();
        expect(prompt.length).toBeGreaterThan(500);
      });
    });
  });

  describe('User Profile Integration', () => {
    it('should accept and incorporate user profile data', () => {
      const prompt = getNovaPrompt({
        hub: 'decision',
        mood: 'ready',
        archetype: 'guide',
        userProfile: {
          decisionStyle: 'analytical',
          primaryArchetype: 'strategist',
          strengths: ['leadership', 'empathy'],
          blindSpots: ['detail-oriented', 'patience'],
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(500);
    });

    it('should handle missing optional userProfile', () => {
      const prompt1 = getNovaPrompt({
        hub: 'decision',
        mood: 'ready',
        archetype: 'guide',
        userProfile: undefined,
      });

      const prompt2 = getNovaPrompt({
        hub: 'decision',
        mood: 'ready',
        archetype: 'guide',
      });

      // Both should work
      expect(prompt1).toBeDefined();
      expect(prompt2).toBeDefined();
    });
  });

  describe('Content Quality', () => {
    it('should not include placeholder or broken text', () => {
      const prompt = getNovaPrompt({
        hub: 'decision',
        mood: 'ready',
        archetype: 'guide',
      });

      expect(prompt).not.toContain('[');
      expect(prompt).not.toContain(']');
      expect(prompt).not.toContain('{{');
      expect(prompt).not.toContain('}}');
      expect(prompt).not.toContain('TODO');
      expect(prompt).not.toContain('FIXME');
    });

    it('should use consistent formatting', () => {
      const prompt = getNovaPrompt({
        hub: 'identity',
        mood: 'reflective',
        archetype: 'healer',
      });

      // Should have proper line breaks and structure
      expect(prompt.split('\n').length).toBeGreaterThan(5);
      expect(prompt.includes('Nova')).toBe(true);
    });
  });
});
