/**
 * EnvironmentEngine.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 *
 * Orchestrates: TimeOfDayEngine + SoundscapeEngine → EnvironmentConfig
 *
 * Input:
 *   - world (current user World — WorldId, see src/constants/worlds.ts)
 *   - mood (current user mood)
 *   - now? (Date — defaults to new Date(), injectable for testing)
 *
 * Output: EnvironmentConfig — single source of truth สำหรับ environment UI
 *
 * Contextual Transition Detection:
 *   - เปรียบเทียบ period ปัจจุบันกับ prevPeriod
 *   - ถ้า period เปลี่ยน → shouldTransition = true
 *   - EnvironmentContext ใช้ flag นี้เพื่อ trigger CSS transition animation
 *
 * ไม่มี side effects — pure computation only.
 *
 * P0-H: input rekeyed from `Hub` (src/context/HubContext.tsx, a 15-id
 * taxonomy unreachable from any live route) to `WorldId` (src/constants/
 * worlds.ts, the 12-id taxonomy actually driven by real routing —
 * /worlds/:worldId, TwinChat.tsx's ?world= param, WorldContext.currentWorld)
 * so this engine's output can actually be driven by real user state. See
 * SoundscapeEngine.ts's header for the same rationale.
 */

import type { WorldId } from '@/constants/worlds';
import type { Mood } from '@/context/EmotionContext';
import type { MusicExperience } from '@/context/AudioContext';
import { TimeOfDayEngine } from './TimeOfDayEngine';
import type { TimeOfDayState, TimePeriod } from './TimeOfDayEngine';
import { SoundscapeEngine } from './SoundscapeEngine';
import type { SoundscapeConfig } from './SoundscapeEngine';
import { LightingEngine } from './LightingEngine';
import type { LightingConfig } from './LightingEngine';
import { ParticleSystemEngine } from './ParticleSystemEngine';
import type { ParticleConfig } from './ParticleSystemEngine';
import { TwinStateEngine } from './TwinStateEngine';
import type { TwinStateConfig } from './TwinStateEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnvironmentConfig {
  /** ช่วงเวลาปัจจุบัน */
  timePeriod: TimePeriod;
  /** Full TimeOfDayState (hour, minute, cssVars, etc.) */
  timeOfDay: TimeOfDayState;
  /** Soundscape ที่แนะนำ */
  soundscape: SoundscapeConfig;
  /** MusicExperience ที่ส่งต่อไปยัง AudioContext.setExperience() */
  recommendedExperience: MusicExperience;
  /** Lighting configuration for this period */
  lighting: LightingConfig;
  /** Particle system configuration for this mood */
  particles: ParticleConfig;
  /** Twin visual state based on period + mood */
  twinState: TwinStateConfig;
  /**
   * CSS vars รวมทุกอย่าง (--tod-* + --env-* + --lighting-* + --particles-* + --twin-*)
   * EnvironmentContext inject ลงใน :root
   */
  cssVars: Record<string, string>;
  /**
   * true เมื่อ period เพิ่งเปลี่ยนจาก prevPeriod
   * EnvironmentContext ใช้เพื่อ trigger transition animation
   */
  shouldTransition: boolean;
  /**
   * ข้อความ ambient description สำหรับแสดงใน UI (เช่น tooltip, ambient badge)
   */
  ambientDescription: string;
}

interface EnvironmentInput {
  world: WorldId;
  mood: Mood;
  now?: Date;
  prevPeriod?: TimePeriod;
}

// ─── EnvironmentEngine ────────────────────────────────────────────────────────

export class EnvironmentEngine {
  private todEngine     = new TimeOfDayEngine();
  private soundEngine   = new SoundscapeEngine();
  private lightEngine   = new LightingEngine();
  private particleEngine = new ParticleSystemEngine();
  private twinEngine    = new TwinStateEngine();

  compute(input: EnvironmentInput): EnvironmentConfig {
    const { world, mood, now = new Date(), prevPeriod } = input;

    // 1. Compute time-of-day
    const timeOfDay = this.todEngine.compute(now);
    const { period } = timeOfDay;

    // 2. Recommend soundscape
    const soundscape = this.soundEngine.recommend(world, mood, period);

    // 3. Compute lighting
    const lighting = this.lightEngine.compute(period);

    // 4. Compute particles
    const particles = this.particleEngine.compute(mood);

    // 5. Compute Twin state
    const twinState = this.twinEngine.compute(period, mood);

    // 6. Detect transition
    const shouldTransition = !!prevPeriod && prevPeriod !== period;

    // 7. Build merged CSS vars
    //    Merge from: TimeOfDay + Soundscape + Lighting + Particles + Twin
    const cssVars: Record<string, string> = {
      ...timeOfDay.cssVars,
      ...lighting.cssVars,
      ...particles.cssVars,
      ...twinState.cssVars,
      // --env-* overrides / additions specific to this environment combination
      '--env-soundscape-id':          `"${soundscape.id}"`,
      '--env-audio-character':        `"${soundscape.audioCharacter}"`,
      '--env-transition-duration':    shouldTransition ? '800ms' : '400ms',
      '--env-energy-level':           String(timeOfDay.energyLevel),
    };

    // 8. Build ambient description
    const ambientDescription = `${timeOfDay.emoji} ${timeOfDay.labelThai} — ${soundscape.labelThai}`;

    return {
      timePeriod: period,
      timeOfDay,
      soundscape,
      recommendedExperience: soundscape.musicExperience,
      lighting,
      particles,
      twinState,
      cssVars,
      shouldTransition,
      ambientDescription,
    };
  }
}

export default EnvironmentEngine;
