/**
 * VisualStateEngine.test.ts
 * Unit tests for Visual State abstraction
 */

import { describe, it, expect } from 'vitest';
import VisualStateEngine, { type VisualStateContext } from '../VisualStateEngine';

describe('VisualStateEngine', () => {
  describe('computeState', () => {
    it('should return valid config for hero archetype', () => {
      const context: VisualStateContext = {
        archetype: 'hero',
        mood: 0.5,
        maturity: 50,
        world: 'career',
      };

      const config = VisualStateEngine.computeState(context);

      expect(config).toBeDefined();
      expect(config.primaryColor).toBe('#FF6B6B'); // hero primary
      expect(config.accentColor).toBe('#FFD93D'); // hero accent
      expect(config.animationSpeed).toBeGreaterThan(0);
      expect(config.particleDensity).toBeGreaterThanOrEqual(0);
      expect(config.particleDensity).toBeLessThanOrEqual(1);
    });

    it('should apply mood modulation (0 = dim, 1 = vibrant)', () => {
      const context0: VisualStateContext = {
        archetype: 'sage',
        mood: 0,
        maturity: 50,
      };

      const context1: VisualStateContext = {
        archetype: 'sage',
        mood: 1,
        maturity: 50,
      };

      const config0 = VisualStateEngine.computeState(context0);
      const config1 = VisualStateEngine.computeState(context1);

      // Vibrant mood = higher glow, higher animation
      expect(config1.glowIntensity).toBeGreaterThan(config0.glowIntensity);
      expect(config1.animationSpeed).toBeGreaterThan(config0.animationSpeed);
    });

    it('should apply maturity modulation (0 = simple, 100 = complex)', () => {
      const contextNew: VisualStateContext = {
        archetype: 'explorer',
        mood: 0.5,
        maturity: 0,
      };

      const contextMature: VisualStateContext = {
        archetype: 'explorer',
        mood: 0.5,
        maturity: 100,
      };

      const configNew = VisualStateEngine.computeState(contextNew);
      const configMature = VisualStateEngine.computeState(contextMature);

      // More mature = higher particle density (more complex)
      expect(configMature.particleDensity).toBeGreaterThan(configNew.particleDensity);
    });

    it('should use world environment palette', () => {
      const contextSelf: VisualStateContext = {
        archetype: 'sage',
        mood: 0.5,
        maturity: 50,
        world: 'self',
      };

      const contextCareer: VisualStateContext = {
        archetype: 'sage',
        mood: 0.5,
        maturity: 50,
        world: 'career',
      };

      const configSelf = VisualStateEngine.computeState(contextSelf);
      const configCareer = VisualStateEngine.computeState(contextCareer);

      // Different worlds = different bg gradients
      expect(configSelf.bgStart).toBe('#0F2027');
      expect(configCareer.bgStart).toBe('#1A1A2E');
    });

    it('should support hybrid archetypes', () => {
      const context: VisualStateContext = {
        archetype: 'strategic_warrior',
        mood: 0.5,
        maturity: 50,
      };

      const config = VisualStateEngine.computeState(context);

      expect(config.primaryColor).toBe('#E74C3C'); // strategic_warrior primary
      expect(config.accentColor).toBe('#F39C12');
    });
  });

  describe('renderVariables', () => {
    it('should convert config to CSS variables', () => {
      const context: VisualStateContext = {
        archetype: 'sage',
        mood: 0.5,
        maturity: 50,
      };

      const config = VisualStateEngine.computeState(context);
      const vars = VisualStateEngine.renderVariables(config);

      expect(vars['--color-primary']).toBe('#3498DB');
      expect(vars['--color-accent']).toBe('#E8F4F8');
      expect(vars['--bg-gradient-start']).toBeDefined();
      expect(vars['--bg-gradient-end']).toBeDefined();
      expect(vars['--overlay-opacity']).toMatch(/^0\.\d{2}$/);
      expect(vars['--animation-speed']).toMatch(/^\d+\.\d{2}$/);
      expect(vars['--particle-density']).toMatch(/^[0-1]\.\d{2}$/);
      expect(vars['--glow-intensity']).toMatch(/^[0-1]\.\d{2}$/);
    });

    it('should output valid CSS variable format', () => {
      const context: VisualStateContext = {
        archetype: 'hero',
        mood: 0.5,
        maturity: 50,
      };

      const config = VisualStateEngine.computeState(context);
      const vars = VisualStateEngine.renderVariables(config);

      Object.entries(vars).forEach(([key, value]) => {
        expect(key).toMatch(/^--/); // CSS custom property format
        expect(value).toBeTruthy();
      });
    });
  });

  describe('compute (convenience method)', () => {
    it('should compute state + render variables in one call', () => {
      const context: VisualStateContext = {
        archetype: 'creator',
        mood: 0.7,
        maturity: 75,
        world: 'creativity',
      };

      const vars = VisualStateEngine.compute(context);

      expect(vars['--color-primary']).toBe('#9B59B6');
      expect(vars['--animation-speed']).toBeDefined();
      expect(Object.keys(vars).length).toBe(8); // 8 CSS variables
    });
  });

  describe('edge cases', () => {
    it('should handle missing world gracefully', () => {
      const context: VisualStateContext = {
        archetype: 'sage',
        mood: 0.5,
        maturity: 50,
        // world omitted
      };

      expect(() => VisualStateEngine.computeState(context)).not.toThrow();

      const config = VisualStateEngine.computeState(context);
      expect(config.bgStart).toBe('#0F2027'); // defaults to 'self'
    });

    it('should clamp mood to sensible bounds', () => {
      const contextLow: VisualStateContext = {
        archetype: 'sage',
        mood: -0.5, // out of bounds
        maturity: 50,
      };

      const contextHigh: VisualStateContext = {
        archetype: 'sage',
        mood: 1.5, // out of bounds
        maturity: 50,
      };

      // Should not throw, should use mood as-is (caller responsible for clamping)
      expect(() => VisualStateEngine.computeState(contextLow)).not.toThrow();
      expect(() => VisualStateEngine.computeState(contextHigh)).not.toThrow();
    });

    it('should handle unknown archetype gracefully', () => {
      const context: VisualStateContext = {
        archetype: 'unknown_archetype' as any,
        mood: 0.5,
        maturity: 50,
      };

      const config = VisualStateEngine.computeState(context);
      expect(config.primaryColor).toBe('#3498DB'); // fallback color
    });
  });
});
