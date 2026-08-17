/**
 * ParticleSystemEngine.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 * Sub-feature: Mood-Based Particle System
 *
 * ระบบอนุภาคที่ปรับตามอารมณ์ผู้ใช้:
 *   stressed/drained → Minimal particles (1) — calm, sparse
 *   confused → Light particles (2) — subtle, gentle
 *   reflective → Medium particles (3) — balanced, contemplative
 *   ready/confident → Dense particles (4-5) — energetic, lively
 *
 * Output: ParticleConfig with CSS vars สำหรับ EnvironmentEngine
 *
 * ไม่มี side effects — pure computation only.
 */

import type { Mood } from '@/context/EmotionContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ParticleDensity = 1 | 2 | 3 | 4 | 5;

export interface ParticleConfig {
  /** Particle density (1-5, where 1 = sparse, 5 = dense) */
  density: ParticleDensity;
  /** Particle movement speed (0.5 = slow, 1.0 = normal, 2.0 = fast) */
  speed: number;
  /** Particle color (CSS color string) */
  color: string;
  /** CSS var output สำหรับ inject ลงใน :root */
  cssVars: Record<string, string>;
}

// ─── Particle Characteristics per Mood ─────────────────────────────────────────

interface MoodParticleCharacteristics {
  density: ParticleDensity;
  speed: number;
  color: string;
  descriptionThai: string;
}

const PARTICLES_BY_MOOD: Record<Mood, MoodParticleCharacteristics> = {
  stressed: {
    density: 1,
    speed: 0.3,
    color: 'rgba(100, 116, 139, 0.3)',  // Soft slate
    descriptionThai: 'น้อย (สงบ)',
  },
  drained: {
    density: 1,
    speed: 0.2,
    color: 'rgba(100, 116, 139, 0.25)', // Very faint slate
    descriptionThai: 'ขาดแคลน (นิ่ง)',
  },
  confused: {
    density: 2,
    speed: 0.6,
    color: 'rgba(148, 163, 184, 0.4)',  // Soft slate-gray
    descriptionThai: 'เล็กน้อย (หม่อม)',
  },
  reflective: {
    density: 3,
    speed: 0.8,
    color: 'rgba(148, 163, 184, 0.5)',  // Medium slate-gray
    descriptionThai: 'ปานกลาง (สมดุล)',
  },
  ready: {
    density: 4,
    speed: 1.2,
    color: 'rgba(71, 85, 105, 0.6)',    // Brighter slate
    descriptionThai: 'มาก (พลัง)',
  },
  confident: {
    density: 5,
    speed: 1.5,
    color: 'rgba(51, 65, 85, 0.7)',     // Vibrant slate
    descriptionThai: 'มากที่สุด (พลังเต็ม)',
  },
};

// ─── ParticleSystemEngine ──────────────────────────────────────────────────────

export class ParticleSystemEngine {
  /**
   * Given a mood, compute particle system config
   *
   * @param mood — Current user mood ('stressed' | 'confused' | 'confident' | etc.)
   * @returns ParticleConfig with cssVars ready to inject
   */
  compute(mood: Mood): ParticleConfig {
    const particle = PARTICLES_BY_MOOD[mood];

    const cssVars: Record<string, string> = {
      '--particles-density': String(particle.density),
      '--particles-speed': String(particle.speed),
      '--particles-color': particle.color,

      // Particle opacity — denser particles = higher opacity
      '--particles-opacity': String(0.3 + (particle.density * 0.1)),

      // Particle size range (for CSS animation)
      '--particles-size-min': '2px',
      '--particles-size-max': `${4 + particle.density}px`,

      // Animation duration — faster mood = shorter duration
      '--particles-duration': `${3000 / particle.speed}ms`,

      // Transition timing
      '--particles-transition': '600ms',
    };

    return {
      density: particle.density,
      speed: particle.speed,
      color: particle.color,
      cssVars,
    };
  }

  /**
   * Get particle description in Thai for UI display
   */
  getDescription(mood: Mood): string {
    const particle = PARTICLES_BY_MOOD[mood];
    return particle.descriptionThai;
  }
}

export default ParticleSystemEngine;
