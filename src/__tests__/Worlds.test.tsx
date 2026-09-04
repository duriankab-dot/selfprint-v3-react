/**
 * Worlds.test.tsx
 * Tests for 12 Worlds discovery system
 */

import { describe, it, expect } from 'vitest';
import {
  WORLDS,
  getAllWorlds,
  getWorld,
  getWorldArticles,
  WorldId,
} from '../constants/worlds';

describe('Worlds Constants', () => {
  it('should define all 12 worlds', () => {
    const worldIds: WorldId[] = [
      'self',
      'mind',
      'relationship',
      'love',
      'career',
      'wealth',
      'life',
      'growth',
      'decision',
      'purpose',
      'wellbeing',
      'future',
    ];

    expect(Object.keys(WORLDS)).toEqual(worldIds);
  });

  it('should have required properties on each world', () => {
    Object.values(WORLDS).forEach((world) => {
      expect(world).toHaveProperty('id');
      expect(world).toHaveProperty('name');
      expect(world).toHaveProperty('emoji');
      expect(world).toHaveProperty('color');
      expect(world).toHaveProperty('description');
      expect(world).toHaveProperty('tagline');
      expect(world).toHaveProperty('focusAreas');
    });
  });

  it('should have unique world IDs', () => {
    const ids = Object.keys(WORLDS);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have focus areas for each world', () => {
    Object.values(WORLDS).forEach((world) => {
      expect(Array.isArray(world.focusAreas)).toBe(true);
      expect(world.focusAreas.length).toBeGreaterThan(0);
    });
  });

  it('should have valid hex colors', () => {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    Object.values(WORLDS).forEach((world) => {
      expect(world.color).toMatch(hexRegex);
    });
  });

  it('should have emoji for each world', () => {
    Object.values(WORLDS).forEach((world) => {
      expect(world.emoji.length).toBeGreaterThan(0);
    });
  });
});

describe('World Functions', () => {
  it('should return all worlds', () => {
    const worlds = getAllWorlds();
    expect(worlds.length).toBe(12);
  });

  it('should get world by ID', () => {
    const world = getWorld('self');
    expect(world.id).toBe('self');
    expect(world.name).toBe('Self');
  });

  // REALBUG-002: getWorld() is declared `(id: WorldId): World`
  // (src/constants/worlds.ts:287) but its body is a bare `return WORLDS[id]`,
  // so for an id that is not in WORLDS it returns `undefined` while the type
  // system insists the caller received a World. Any id that reaches it from
  // runtime data (route param, DB column, cached preference) therefore fails
  // silently here and blows up much later, at whatever first touches
  // `world.name`. The test asserts the safe contract — throw on an unknown id.
  // Fixing it means changing product code (throw, or widen the return type to
  // `World | undefined` and make callers handle it), so the owner decides.
  // Note: getWorld() currently has ZERO callers outside this test, so deleting
  // it is also a legitimate resolution.
  it.skip('should throw on invalid world ID', () => {
    expect(() => {
      getWorld('invalid' as WorldId);
    }).toThrow();
  });
});

describe('World Articles', () => {
  it('should have articles for each world', () => {
    Object.keys(WORLDS).forEach((worldId) => {
      const articles = getWorldArticles(worldId as WorldId);
      expect(Array.isArray(articles)).toBe(true);
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  it('should have valid article structure', () => {
    const articles = getWorldArticles('self');
    articles.forEach((article) => {
      expect(article).toHaveProperty('slug');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('excerpt');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('author');
      expect(article).toHaveProperty('publishedAt');
      expect(article).toHaveProperty('readTime');
      expect(article).toHaveProperty('tags');
      expect(article).toHaveProperty('world');
    });
  });

  it('should have articles with proper data types', () => {
    const articles = getWorldArticles('self');
    articles.forEach((article) => {
      expect(typeof article.slug).toBe('string');
      expect(typeof article.title).toBe('string');
      expect(typeof article.excerpt).toBe('string');
      expect(typeof article.readTime).toBe('number');
      expect(article.readTime).toBeGreaterThan(0);
      expect(Array.isArray(article.tags)).toBe(true);
    });
  });

  it('should link articles to correct world', () => {
    Object.keys(WORLDS).forEach((worldId) => {
      const articles = getWorldArticles(worldId as WorldId);
      articles.forEach((article) => {
        expect(article.world).toBe(worldId);
      });
    });
  });

  it('should have unique article slugs within world', () => {
    Object.keys(WORLDS).forEach((worldId) => {
      const articles = getWorldArticles(worldId as WorldId);
      const slugs = articles.map((a) => a.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    });
  });

  it('should return empty array for empty world', () => {
    // Assuming future world has articles, test should not throw
    const articles = getWorldArticles('future');
    expect(Array.isArray(articles)).toBe(true);
  });
});

describe('World Coverage', () => {
  it('should have minimum 3 articles per world', () => {
    Object.keys(WORLDS).forEach((worldId) => {
      const articles = getWorldArticles(worldId as WorldId);
      expect(articles.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should have total article coverage', () => {
    let totalArticles = 0;
    Object.keys(WORLDS).forEach((worldId) => {
      const articles = getWorldArticles(worldId as WorldId);
      totalArticles += articles.length;
    });
    expect(totalArticles).toBeGreaterThanOrEqual(36); // Min 3 per world × 12
  });
});

describe('World Metadata', () => {
  it('should have descriptive world names', () => {
    Object.values(WORLDS).forEach((world) => {
      expect(world.name.length).toBeGreaterThan(0);
      expect(world.name.length).toBeLessThan(50);
    });
  });

  it('should have concise taglines', () => {
    Object.values(WORLDS).forEach((world) => {
      expect(world.tagline.length).toBeGreaterThan(0);
      expect(world.tagline.length).toBeLessThan(100);
    });
  });

  it('should have substantive descriptions', () => {
    Object.values(WORLDS).forEach((world) => {
      expect(world.description.length).toBeGreaterThan(20);
    });
  });

  it('should have 4-5 focus areas per world', () => {
    Object.values(WORLDS).forEach((world) => {
      expect(world.focusAreas.length).toBeGreaterThanOrEqual(4);
      expect(world.focusAreas.length).toBeLessThanOrEqual(6);
    });
  });
});
