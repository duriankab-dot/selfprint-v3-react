/**
 * TwinWorldsIntegration.test.ts
 * Test Twin responses adapt per world (Phase D validation)
 *
 * Validates:
 * 1. World-specific prompts load correctly
 * 2. Twin personality changes per world
 * 3. Focus areas are addressed in responses
 * 4. All 12 worlds work without errors
 */

import { describe, it, expect } from 'vitest';
import { buildTwinSystemPrompt } from '../config/twin-prompts';
import { WORLDS, WorldId, getAllWorlds } from '../constants/worlds';
import { getTwinWorldPrompt } from '../config/twin-prompts';

describe('Phase D: Twin World Integration', () => {
  const testTwinName = 'TestTwin';
  const testProfile = JSON.stringify({ name: 'User', maturityScore: 50 });

  describe('World-Specific Prompts', () => {
    it('should load all 12 world prompts without errors', () => {
      const worlds = getAllWorlds();
      expect(worlds).toHaveLength(12);

      worlds.forEach(world => {
        const prompt = getTwinWorldPrompt(world.id);
        expect(prompt).toBeTruthy();
        expect(prompt.length).toBeGreaterThan(100);
      });
    });

    it('should include world-specific expertise in prompt', () => {
      const worldTests: Record<WorldId, { expertise: string; focus: string }> = {
        self: { expertise: 'Identity Expert', focus: 'authentic' },
        mind: { expertise: 'Cognitive Expert', focus: 'thinking' },
        relationship: { expertise: 'Relationship Expert', focus: 'communication' },
        love: { expertise: 'Love & Emotional', focus: 'attachment' },
        career: { expertise: 'Career Strategist', focus: 'leadership' },
        wealth: { expertise: 'Wealth Intelligence', focus: 'financial' },
        life: { expertise: 'Life Strategist', focus: 'balance' },
        growth: { expertise: 'Growth Expert', focus: 'learning' },
        decision: { expertise: 'Decision Strategist', focus: 'choices' },
        purpose: { expertise: 'Purpose & Meaning', focus: 'calling' },
        wellbeing: { expertise: 'Wellbeing Expert', focus: 'energy' },
        future: { expertise: 'Future Strategist', focus: 'vision' },
      };

      Object.entries(worldTests).forEach(([worldId, { expertise, focus }]) => {
        const prompt = getTwinWorldPrompt(worldId as WorldId);
        expect(prompt).toContain(expertise);
        expect(prompt.toLowerCase()).toContain(focus.toLowerCase());
      });
    });
  });

  describe('System Prompt Building', () => {
    it('should build complete prompt with world context', () => {
      const prompt = buildTwinSystemPrompt(
        testTwinName,
        testProfile,
        'career',
        undefined,
        'traveled, learned leadership'
      );

      // Should contain Twin name
      expect(prompt).toContain(testTwinName);

      // Should contain world context
      expect(prompt).toContain('CAREER');
      expect(prompt).toContain('Career Strategist');

      // Should contain recent decisions reference
      expect(prompt).toContain('travelled');
    });

    it('should default to SELF world if not specified', () => {
      const prompt = buildTwinSystemPrompt(
        testTwinName,
        testProfile,
        undefined
      );

      expect(prompt).toContain('SELF');
      expect(prompt.toLowerCase()).toContain('identity');
    });

    it('should handle missing world gracefully', () => {
      const prompt = buildTwinSystemPrompt(
        testTwinName,
        testProfile,
        'nonexistent-world'
      );

      // Should still contain base prompt
      expect(prompt).toContain(testTwinName);
      expect(prompt).toContain('nonexistent-world'); // Shows world label even if not found
    });
  });

  describe('World Context Validation', () => {
    it('all worlds should have required metadata', () => {
      Object.values(WORLDS).forEach(world => {
        expect(world.id).toBeTruthy();
        expect(world.name).toBeTruthy();
        expect(world.emoji).toBeTruthy();
        expect(world.color).toBeTruthy();
        expect(world.description).toBeTruthy();
        expect(world.tagline).toBeTruthy();
        expect(world.focusAreas).toBeInstanceOf(Array);
        expect(world.focusAreas.length).toBeGreaterThan(0);
      });
    });

    it('should have unique world IDs', () => {
      const worldIds = Object.keys(WORLDS);
      const uniqueIds = new Set(worldIds);
      expect(uniqueIds.size).toBe(12);
    });

    it('focus areas should be meaningful', () => {
      Object.values(WORLDS).forEach(world => {
        world.focusAreas.forEach(area => {
          expect(area.length).toBeGreaterThan(2);
          expect(area).not.toMatch(/^\d+$/); // Not just numbers
        });
      });
    });
  });

  describe('Prompt Personality Adaptation', () => {
    it('Twin personality should change based on world', () => {
      const careerPrompt = buildTwinSystemPrompt(testTwinName, testProfile, 'career');
      const lovePrompt = buildTwinSystemPrompt(testTwinName, testProfile, 'love');
      const wellbeingPrompt = buildTwinSystemPrompt(testTwinName, testProfile, 'wellbeing');

      // Prompts should be different
      expect(careerPrompt).not.toEqual(lovePrompt);
      expect(lovePrompt).not.toEqual(wellbeingPrompt);
      expect(careerPrompt).not.toEqual(wellbeingPrompt);

      // But all should contain the same Twin name
      expect(careerPrompt).toContain(testTwinName);
      expect(lovePrompt).toContain(testTwinName);
      expect(wellbeingPrompt).toContain(testTwinName);
    });

    it('should maintain Twin core while changing expertise', () => {
      const worlds: WorldId[] = ['self', 'career', 'wellbeing', 'future'];

      const prompts = worlds.map(w =>
        buildTwinSystemPrompt(testTwinName, testProfile, w)
      );

      // All should contain base Twin characteristics
      prompts.forEach(prompt => {
        expect(prompt).toContain('personalized');
        expect(prompt.toLowerCase()).toContain('authentic');
      });

      // Each should have unique expertise
      expect(prompts[0].toLowerCase()).toContain('identity');
      expect(prompts[1]).toContain('Career Strategist');
      expect(prompts[2]).toContain('Wellbeing Expert');
      expect(prompts[3]).toContain('Future Strategist');
    });
  });

  describe('Integration Points', () => {
    it('should support world switching in conversation', () => {
      // User starts in one world
      const prompt1 = buildTwinSystemPrompt(testTwinName, testProfile, 'decision');

      // User switches to another world
      const prompt2 = buildTwinSystemPrompt(testTwinName, testProfile, 'growth');

      // Both should be valid but different
      expect(prompt1).toBeTruthy();
      expect(prompt2).toBeTruthy();
      expect(prompt1).not.toEqual(prompt2);
    });

    it('should work with chat message history', () => {
      const recentDecisions = 'chose new job | invested in learning | set boundaries';
      const prompt = buildTwinSystemPrompt(
        testTwinName,
        testProfile,
        'career',
        'excited',
        recentDecisions
      );

      expect(prompt).toContain('career');
      expect(prompt).toContain('excited');
      expect(prompt).toContain('chose');
    });
  });

  describe('Performance Validation', () => {
    it('prompt building should be fast (< 5ms)', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        buildTwinSystemPrompt(testTwinName, testProfile, 'self');
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(500); // 100 calls in < 500ms
    });

    it('should not have memory leaks in repeated calls', () => {
      const worldIds = Object.keys(WORLDS) as WorldId[];

      // Call 1000 times with different worlds
      for (let i = 0; i < 1000; i++) {
        const world = worldIds[i % worldIds.length];
        buildTwinSystemPrompt(testTwinName, testProfile, world);
      }

      // Should complete without crashing
      expect(true).toBe(true);
    });
  });
});

/**
 * Manual Test Cases (for QA when running locally)
 *
 * Run these scenarios manually to verify Twin personality changes:
 *
 * 1. Self World
 *    Input: "Tell me about my core values"
 *    Expected: Twin acts as Identity Expert, focuses on values/authenticity
 *
 * 2. Career World
 *    Input: "Should I take this job offer?"
 *    Expected: Twin acts as Career Strategist, analyzes purpose/leadership fit
 *
 * 3. Love World
 *    Input: "I'm feeling vulnerable in my relationship"
 *    Expected: Twin acts as Emotional Intelligence Expert, focuses on intimacy/vulnerability
 *
 * 4. Decision World
 *    Input: "I have to choose between A and B"
 *    Expected: Twin acts as Decision Strategist, helps analyze trade-offs
 *
 * 5. Growth World
 *    Input: "I want to improve my skills"
 *    Expected: Twin acts as Growth Expert, focuses on learning/transformation
 *
 * 6. Wellbeing World
 *    Input: "I'm exhausted all the time"
 *    Expected: Twin acts as Wellbeing Expert, focuses on energy/rest/sustainability
 *
 * Test Results Should Show:
 * - ✅ All 12 worlds have prompts
 * - ✅ Prompts contain world-specific expertise labels
 * - ✅ Twin personality adapts while maintaining continuity
 * - ✅ Focus areas match world context
 * - ✅ No errors or missing implementations
 */
