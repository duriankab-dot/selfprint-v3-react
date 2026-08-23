/**
 * worldsVerification.test.ts
 * P0-G: 12 Worlds Intelligence Verification
 *
 * Verifies end-to-end coverage across all 12 worlds:
 * 1. WorldId registry (worlds.ts)
 * 2. Twin world prompts (twin-prompts.ts)
 * 3. World personalities (worldPersonalities.ts)
 * 4. SICE hints in promptBuilder
 * 5. buildTwinSystemPrompt injects world context
 * 6. buildPrompt includes SICE for each world
 * 7. Back-nav guard (invalid worldId caught)
 *
 * §P0-G-001
 */

import { describe, it, expect } from 'vitest';
import { WORLDS, type WorldId } from '../../../constants/worlds';
import { TWIN_WORLD_PROMPTS, buildTwinSystemPrompt } from '../../../config/twin-prompts';
import { WORLD_PERSONALITIES, validateWorldPersonalities } from '../../../constants/worldPersonalities';
import { buildPrompt } from '../../prompts/promptBuilder';

const ALL_WORLDS: WorldId[] = [
  'self', 'mind', 'relationship', 'love', 'career', 'wealth',
  'life', 'growth', 'decision', 'purpose', 'wellbeing', 'future',
];

// ─── 1. World registry ────────────────────────────────────────────────────────

describe('P0-G: World registry (worlds.ts)', () => {
  it('defines exactly 12 worlds', () => {
    expect(Object.keys(WORLDS)).toHaveLength(12);
  });

  it.each(ALL_WORLDS)('world "%s" has required fields', (worldId) => {
    const world = WORLDS[worldId];
    expect(world.id).toBe(worldId);
    expect(world.name).toBeTruthy();
    expect(world.emoji).toBeTruthy();
    expect(world.color).toMatch(/^#/);
    expect(world.mood).toBeTruthy();
    expect(world.archetype).toBeTruthy();
    expect(world.description).toBeTruthy();
    expect(world.tagline).toBeTruthy();
    expect(world.focusAreas.length).toBeGreaterThan(0);
  });
});

// ─── 2. Twin world prompts ────────────────────────────────────────────────────

describe('P0-G: Twin world prompts (twin-prompts.ts)', () => {
  it('has a prompt entry for all 12 worlds', () => {
    for (const worldId of ALL_WORLDS) {
      expect(TWIN_WORLD_PROMPTS[worldId]).toBeTruthy();
    }
  });

  it.each(ALL_WORLDS)('world "%s" prompt contains world name reference', (worldId) => {
    const prompt = TWIN_WORLD_PROMPTS[worldId];
    expect(prompt.toLowerCase()).toContain(worldId);
  });

  it.each(ALL_WORLDS)('buildTwinSystemPrompt injects world prompt for "%s"', (worldId) => {
    const result = buildTwinSystemPrompt('TestTwin', 'A curious, driven person.', worldId);
    // Should include the world-specific content
    expect(result.toLowerCase()).toContain(worldId);
    expect(result).toContain('TestTwin');
  });
});

// ─── 3. World personalities ───────────────────────────────────────────────────

describe('P0-G: World personalities (worldPersonalities.ts)', () => {
  it('validateWorldPersonalities() passes with no missing worlds', () => {
    const { isValid, missingWorlds } = validateWorldPersonalities();
    expect(isValid).toBe(true);
    expect(missingWorlds).toHaveLength(0);
  });

  it.each(ALL_WORLDS)('world "%s" has personality entry', (worldId) => {
    const personality = WORLD_PERSONALITIES[worldId];
    expect(personality).toBeDefined();
    expect(personality.defaultMood).toBeTruthy();
    expect(personality.responseStyle).toBeTruthy();
    expect(personality.tone).toBeTruthy();
    expect(personality.badge.name).toBeTruthy();
    expect(personality.badge.icon).toBeTruthy();
  });
});

// ─── 4. SICE coverage in promptBuilder ───────────────────────────────────────

describe('P0-G: SICE hints in buildPrompt', () => {
  it.each(ALL_WORLDS)('buildPrompt includes [SICE CONTEXT] for world "%s"', (worldId) => {
    const result = buildPrompt({ role: 'NOVA', world: worldId });
    expect(result).toContain('[SICE CONTEXT]');
    expect(result).toContain('[ACTIVE WORLD]');
    expect(result).toContain(worldId.toUpperCase());
  });

  it.each(ALL_WORLDS)('TWIN buildPrompt includes world context for "%s"', (worldId) => {
    const result = buildPrompt({
      role: 'TWIN',
      world: worldId,
      twinState: { name: 'Aria', profile: 'Driven and empathetic.', stage: 2 },
    });
    expect(result).toContain('[SICE CONTEXT]');
    expect(result).toContain('[TWIN IDENTITY + STATE]');
  });
});

// ─── 5. Invalid worldId guard ─────────────────────────────────────────────────

describe('P0-G: Invalid worldId guard', () => {
  it('unknown worldId is not in WORLDS', () => {
    expect(Object.prototype.hasOwnProperty.call(WORLDS, 'fake-world')).toBe(false);
  });

  it('all 12 valid worldIds pass the isValidWorldId check', () => {
    for (const worldId of ALL_WORLDS) {
      expect(Object.prototype.hasOwnProperty.call(WORLDS, worldId)).toBe(true);
    }
  });
});
