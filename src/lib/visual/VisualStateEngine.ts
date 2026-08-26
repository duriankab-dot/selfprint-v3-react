/**
 * VisualStateEngine.ts
 * Abstraction layer for visual state management
 *
 * ก่อนหน้า: WorldEnvironment ใช้ CSS vars ad-hoc
 * ตอนนี้: VisualStateEngine เป็น single source of truth
 *
 * Features:
 *  - Archetype-based visual mapping
 *  - Mood + maturity modulation
 *  - World environment adaptation
 *  - Deterministic CSS variable generation
 *  - Type-safe state management
 *
 * §VISUAL-STATE-ENGINE-001
 */

import type { ArchetypeId } from '@/lib/archetypes/types';
import type { WorldId } from '@/lib/worlds/worldRegistry';

/**
 * Visual state context — all data needed to render visual appearance
 */
export interface VisualStateContext {
  /** Primary archetype (e.g., 'sage', 'hero', 'strategic_warrior') */
  archetype: ArchetypeId;

  /** Secondary archetype (optional, for hybrid rendering) */
  secondaryArchetype?: ArchetypeId;

  /** Current emotional mood (0-1, affects saturation/brightness) */
  mood: number; // 0 = withdrawn, 0.5 = neutral, 1 = vibrant

  /** Maturity level (0-100, affects complexity of visuals) */
  maturity: number;

  /** Current world (affects environment palette) */
  world?: WorldId;

  /** Twin birth timestamp (for animations) */
  bornAt?: Date;
}

/**
 * Computed visual configuration — ready to render
 */
export interface VisualConfig {
  /** Primary color (hex) */
  primaryColor: string;

  /** Secondary color (accent) */
  accentColor: string;

  /** Background gradient start */
  bgStart: string;

  /** Background gradient end */
  bgEnd: string;

  /** Opacity of overlays (0-1) */
  overlayOpacity: number;

  /** Animation speed modifier (0.5 = slow, 1 = normal, 2 = fast) */
  animationSpeed: number;

  /** Particle density (0 = none, 1 = full) */
  particleDensity: number;

  /** Glow intensity (0 = subtle, 1 = intense) */
  glowIntensity: number;
}

/**
 * Archetype → base visual mapping
 * (สีพื้นฐาน + personality ของแต่ละ archetype)
 */
const ARCHETYPE_VISUAL_MAP: Record<ArchetypeId, Partial<VisualConfig>> = {
  // Base 12 archetypes
  hero: { primaryColor: '#FF6B6B', accentColor: '#FFD93D', animationSpeed: 1.2 },
  shadow: { primaryColor: '#2C3E50', accentColor: '#8E44AD', glowIntensity: 0.6 },
  sage: { primaryColor: '#3498DB', accentColor: '#E8F4F8', animationSpeed: 0.8 },
  innocent: { primaryColor: '#F39C12', accentColor: '#FFE5CC', particleDensity: 0.9 },
  explorer: { primaryColor: '#27AE60', accentColor: '#D5F4E6', animationSpeed: 1.3 },
  creator: { primaryColor: '#9B59B6', accentColor: '#F4D5FF', glowIntensity: 0.9 },
  caregiver: { primaryColor: '#E91E63', accentColor: '#FFB6D9', particleDensity: 0.8 },
  lover: { primaryColor: '#FF1493', accentColor: '#FFB6D9', animationSpeed: 1.1 },
  jester: { primaryColor: '#FFD700', accentColor: '#FF8C00', glowIntensity: 1.0 },
  everyman: { primaryColor: '#95A5A6', accentColor: '#BDC3C7', animationSpeed: 0.9 },
  magician: { primaryColor: '#34495E', accentColor: '#3498DB', glowIntensity: 0.8 },
  outlaw: { primaryColor: '#C0392B', accentColor: '#E74C3C', animationSpeed: 1.2 },

  // Hybrid 6 archetypes
  strategic_warrior: { primaryColor: '#E74C3C', accentColor: '#F39C12', animationSpeed: 1.25 },
  benevolent_leader: { primaryColor: '#16A085', accentColor: '#D35400', particleDensity: 0.85 },
  visionary_artist: { primaryColor: '#8E44AD', accentColor: '#C0392B', glowIntensity: 0.95 },
  wandering_rebel: { primaryColor: '#27AE60', accentColor: '#E74C3C', animationSpeed: 1.4 },
  warm_flirt: { primaryColor: '#FF1493', accentColor: '#FFD700', particleDensity: 0.9 },
  relatable_neighbor: { primaryColor: '#95A5A6', accentColor: '#F39C12', animationSpeed: 0.95 },
};

/**
 * World → environment palette adjustments
 * (ปรับ gradient background ตามแต่ละ world)
 */
const WORLD_ENVIRONMENT_MAP: Record<WorldId, { bgStart: string; bgEnd: string }> = {
  self: { bgStart: '#0F2027', bgEnd: '#203A43' }, // introspective, dark
  career: { bgStart: '#1A1A2E', bgEnd: '#16213E' }, // professional, focused
  love: { bgStart: '#2C1B47', bgEnd: '#4A0E4E' }, // romantic, warm
  health: { bgStart: '#0A3622', bgEnd: '#1A5C3A' }, // vital, energetic
  creativity: { bgStart: '#2D1B69', bgEnd: '#3E1F47' }, // imaginative, mystic
  spirituality: { bgStart: '#0D0221', bgEnd: '#1F0744' }, // transcendent, deep
  relationships: { bgStart: '#4A148C', bgEnd: '#6A1B9A' }, // connective, warm
  wealth: { bgStart: '#33691E', bgEnd: '#558B2F' }, // abundant, grounded
  learning: { bgStart: '#0D47A1', bgEnd: '#1565C0' }, // curious, expansive
  adventure: { bgStart: '#FF6F00', bgEnd: '#E65100' }, // dynamic, vibrant
  solitude: { bgStart: '#1A237E', bgEnd: '#283593' }, // quiet, reflective
  community: { bgStart: '#4A148C', bgEnd: '#6A1B9A' }, // social, connected
};

/**
 * Visual State Engine — compute visual config from context
 */
export class VisualStateEngine {
  /**
   * Compute complete visual configuration from state context
   */
  static computeState(context: VisualStateContext): VisualConfig {
    const {
      archetype,
      mood,
      maturity,
      world = 'self',
    } = context;

    // Base visual from archetype
    const archetypeBase = ARCHETYPE_VISUAL_MAP[archetype] || {};
    const worldEnv = WORLD_ENVIRONMENT_MAP[world] || WORLD_ENVIRONMENT_MAP.self;

    // Default config
    const config: VisualConfig = {
      primaryColor: archetypeBase.primaryColor || '#3498DB',
      accentColor: archetypeBase.accentColor || '#E8F4F8',
      bgStart: worldEnv.bgStart,
      bgEnd: worldEnv.bgEnd,
      overlayOpacity: 0.85,
      animationSpeed: archetypeBase.animationSpeed || 1.0,
      particleDensity: archetypeBase.particleDensity || 0.7,
      glowIntensity: archetypeBase.glowIntensity || 0.7,
    };

    // Modulate by mood (0-1)
    // Mood = 0 (withdrawn) → dim, low saturation
    // Mood = 1 (vibrant) → bright, high saturation
    config.overlayOpacity = 0.7 + mood * 0.25; // 0.7 - 0.95
    config.glowIntensity = Math.max(0.3, config.glowIntensity * (0.6 + mood * 0.6));
    config.animationSpeed = config.animationSpeed * (0.7 + mood * 0.6);

    // Modulate by maturity (0-100)
    // Maturity = 0 (new) → simple, bright
    // Maturity = 100 (evolved) → complex, subtle
    const matureFactor = maturity / 100; // 0-1
    config.particleDensity = Math.min(1, config.particleDensity + matureFactor * 0.3);
    config.overlayOpacity = config.overlayOpacity - matureFactor * 0.1; // gets subtler

    return config;
  }

  /**
   * Render visual config → CSS variables (for use in stylesheets)
   */
  static renderVariables(config: VisualConfig): Record<string, string> {
    return {
      '--color-primary': config.primaryColor,
      '--color-accent': config.accentColor,
      '--bg-gradient-start': config.bgStart,
      '--bg-gradient-end': config.bgEnd,
      '--overlay-opacity': config.overlayOpacity.toFixed(2),
      '--animation-speed': config.animationSpeed.toFixed(2),
      '--particle-density': config.particleDensity.toFixed(2),
      '--glow-intensity': config.glowIntensity.toFixed(2),
    };
  }

  /**
   * Convenience: compute state + render variables in one call
   */
  static compute(context: VisualStateContext): Record<string, string> {
    const state = this.computeState(context);
    return this.renderVariables(state);
  }
}

export default VisualStateEngine;
