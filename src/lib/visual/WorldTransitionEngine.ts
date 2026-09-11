/**
 * WorldTransitionEngine.ts — Narrative World Transition Grammar
 *
 * เมื่อผู้ใช้เปลี่ยน World (self → mind → relationship → love → career ฯลฯ)
 * ห้ามเปลี่ยนแบบ hard cut (fade A → fade B)
 * ต้องเป็น narrative transition ที่:
 *   1. World เริ่มตอบสนองเมื่อ detect context shift
 *   2. มี environmental force ดึงดูด Twin
 *   3. Twin ยืด/ไหล/ตอบสนองต่อการเปลี่ยนแปลง
 *   4. World เก่ายุบหรือละลาย
 *   5. World ใหม่ปรากฏ
 *   6. Twin settle ในบริบทใหม่
 *
 * Transition grammar แต่ละแบบเหมาะกับแต่ละ World pair:
 *   attraction    — self → mind, growth → purpose
 *   pull          — career → wealth, life → future
 *   absorption    — love → relationship, wellbeing → calm
 *   dissolution   — stressed → calm, confused → reflective
 *   flow          — any → nature worlds (organic, path, horizon)
 *   fold          — decision → purpose, mind → insight
 *   tunnel        — awakening → aware, aware → connected
 *   gravity_shift — wealth → career, explorer → creator
 *   env_wave      — energetic → calm, stressed → drained
 */

import type { WorldId } from '@/constants/worlds';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransitionType =
  | 'attraction'
  | 'pull'
  | 'absorption'
  | 'dissolution'
  | 'flow'
  | 'fold'
  | 'tunnel'
  | 'gravity_shift'
  | 'env_wave'
  | 'none';

export interface WorldTransitionConfig {
  /** Type of narrative transition */
  type: TransitionType;
  /** CSS animation class for old world dissolving */
  oldWorldAnimation: string;
  /** CSS animation class for new world emerging */
  newWorldAnimation: string;
  /** CSS class for Twin reaction */
  twinReactionClass: string;
  /** Duration in ms */
  duration: number;
  /** Has particle burst effect */
  hasParticles: boolean;
  /** Particle burst direction */
  particleBurstDirection?: 'inward' | 'outward' | 'random';
  /** Lighting flash color during transition */
  lightingFlashColor?: string;
}

// ─── Transition Rules ─────────────────────────────────────────────────────────

/** Define which transitions are appropriate for each world pair */
const TRANSITION_RULES: Record<WorldId, Record<WorldId, TransitionType>> = {
  self: {
    self: 'none',
    mind: 'attraction',
    relationship: 'absorption',
    love: 'absorption',
    career: 'pull',
    wealth: 'gravity_shift',
    life: 'tunnel',
    growth: 'flow',
    decision: 'fold',
    purpose: 'attraction',
    wellbeing: 'dissolution',
    future: 'tunnel',
  },
  mind: {
    self: 'dissolution',
    mind: 'none',
    relationship: 'flow',
    love: 'absorption',
    career: 'pull',
    wealth: 'gravity_shift',
    life: 'flow',
    growth: 'attraction',
    decision: 'fold',
    purpose: 'fold',
    wellbeing: 'dissolution',
    future: 'tunnel',
  },
  relationship: {
    self: 'absorption',
    mind: 'flow',
    love: 'absorption',
    relationship: 'none',
    career: 'pull',
    wealth: 'gravity_shift',
    life: 'flow',
    growth: 'flow',
    decision: 'flow',
    purpose: 'flow',
    wellbeing: 'absorption',
    future: 'flow',
  },
  love: {
    self: 'absorption',
    mind: 'absorption',
    relationship: 'absorption',
    love: 'none',
    career: 'pull',
    wealth: 'flow',
    life: 'flow',
    growth: 'flow',
    decision: 'absorption',
    purpose: 'absorption',
    wellbeing: 'absorption',
    future: 'flow',
  },
  career: {
    self: 'pull',
    mind: 'pull',
    relationship: 'pull',
    love: 'pull',
    career: 'none',
    wealth: 'attraction',
    life: 'pull',
    growth: 'pull',
    decision: 'gravity_shift',
    purpose: 'pull',
    wellbeing: 'dissolution',
    future: 'gravity_shift',
  },
  wealth: {
    self: 'gravity_shift',
    mind: 'gravity_shift',
    relationship: 'gravity_shift',
    love: 'gravity_shift',
    career: 'gravity_shift',
    wealth: 'none',
    life: 'pull',
    growth: 'attraction',
    decision: 'fold',
    purpose: 'pull',
    wellbeing: 'dissolution',
    future: 'gravity_shift',
  },
  life: {
    self: 'tunnel',
    mind: 'flow',
    relationship: 'flow',
    love: 'flow',
    career: 'pull',
    wealth: 'pull',
    life: 'none',
    growth: 'flow',
    decision: 'flow',
    purpose: 'flow',
    wellbeing: 'dissolution',
    future: 'tunnel',
  },
  growth: {
    self: 'flow',
    mind: 'attraction',
    relationship: 'flow',
    love: 'flow',
    career: 'pull',
    wealth: 'attraction',
    life: 'flow',
    growth: 'none',
    decision: 'fold',
    purpose: 'attraction',
    wellbeing: 'flow',
    future: 'flow',
  },
  decision: {
    self: 'fold',
    mind: 'fold',
    relationship: 'flow',
    love: 'absorption',
    career: 'gravity_shift',
    wealth: 'fold',
    life: 'flow',
    growth: 'fold',
    decision: 'none',
    purpose: 'fold',
    wellbeing: 'dissolution',
    future: 'fold',
  },
  purpose: {
    self: 'attraction',
    mind: 'fold',
    relationship: 'flow',
    love: 'absorption',
    career: 'pull',
    wealth: 'pull',
    life: 'flow',
    growth: 'attraction',
    decision: 'fold',
    purpose: 'none',
    wellbeing: 'dissolution',
    future: 'tunnel',
  },
  wellbeing: {
    self: 'dissolution',
    mind: 'dissolution',
    relationship: 'absorption',
    love: 'absorption',
    career: 'dissolution',
    wealth: 'dissolution',
    life: 'dissolution',
    growth: 'flow',
    decision: 'dissolution',
    purpose: 'dissolution',
    wellbeing: 'none',
    future: 'dissolution',
  },
  future: {
    self: 'tunnel',
    mind: 'tunnel',
    relationship: 'flow',
    love: 'flow',
    career: 'gravity_shift',
    wealth: 'gravity_shift',
    life: 'tunnel',
    growth: 'flow',
    decision: 'fold',
    purpose: 'tunnel',
    wellbeing: 'dissolution',
    future: 'none',
  },
};

// ─── Animation Mapping ────────────────────────────────────────────────────────

const ANIMATION_MAP: Record<TransitionType, Omit<WorldTransitionConfig, 'type'>> = {
  attraction: {
    oldWorldAnimation: 'world-attraction-pull',
    newWorldAnimation: 'world-attraction-emerge',
    twinReactionClass: 'is-attracted',
    duration: 800,
    hasParticles: true,
    particleBurstDirection: 'inward',
  },
  pull: {
    oldWorldAnimation: 'world-pull-directional',
    newWorldAnimation: 'world-pull-reverse',
    twinReactionClass: 'is-pulled',
    duration: 800,
    hasParticles: true,
    particleBurstDirection: 'inward',
  },
  absorption: {
    oldWorldAnimation: 'world-absorption-spiral-in',
    newWorldAnimation: 'world-absorption-spiral-out',
    twinReactionClass: 'is-absorbing',
    duration: 900,
    hasParticles: true,
    particleBurstDirection: 'inward',
    lightingFlashColor: 'rgba(99, 102, 241, 0.2)',
  },
  dissolution: {
    oldWorldAnimation: 'world-dissolution-scatter',
    newWorldAnimation: 'world-dissolution-gather',
    twinReactionClass: 'is-dissolving',
    duration: 1000,
    hasParticles: false,
  },
  flow: {
    oldWorldAnimation: 'world-flow-drift-right',
    newWorldAnimation: 'world-flow-drift-left',
    twinReactionClass: 'is-flowing',
    duration: 700,
    hasParticles: true,
    particleBurstDirection: 'random',
  },
  fold: {
    oldWorldAnimation: 'world-fold-collapse',
    newWorldAnimation: 'world-fold-unfold',
    twinReactionClass: 'is-folding',
    duration: 800,
    hasParticles: true,
    particleBurstDirection: 'inward',
  },
  tunnel: {
    oldWorldAnimation: 'world-tunnel-rush',
    newWorldAnimation: 'world-tunnel-emerge',
    twinReactionClass: 'is-tunneling',
    duration: 1000,
    hasParticles: true,
    particleBurstDirection: 'outward',
    lightingFlashColor: 'rgba(139, 92, 246, 0.25)',
  },
  gravity_shift: {
    oldWorldAnimation: 'world-gravity-shift-fall',
    newWorldAnimation: 'world-gravity-shift-settle',
    twinReactionClass: 'is-gravity-shift',
    duration: 800,
    hasParticles: true,
    particleBurstDirection: 'outward',
  },
  env_wave: {
    oldWorldAnimation: 'world-wave-sweep',
    newWorldAnimation: 'world-wave-ripple',
    twinReactionClass: 'is-env-wave',
    duration: 900,
    hasParticles: true,
    particleBurstDirection: 'random',
  },
  none: {
    oldWorldAnimation: '',
    newWorldAnimation: '',
    twinReactionClass: '',
    duration: 0,
    hasParticles: false,
  },
};

// ─── Engine ───────────────────────────────────────────────────────────────────

export class WorldTransitionEngine {
  private currentTransition: WorldTransitionConfig | null = null;

  /**
   * Compute transition config when world changes
   */
  computeTransition(from: WorldId | null, to: WorldId): WorldTransitionConfig {
    if (!from || from === to) {
      this.currentTransition = null;
      return { type: 'none', ...ANIMATION_MAP.none };
    }

    const rule = TRANSITION_RULES[from]?.[to];
    const type = rule ?? 'flow'; // Default to flow for undefined pairs
    const config = { type, ...ANIMATION_MAP[type] };

    this.currentTransition = config;

    return config;
  }

  /**
   * Get the current active transition (if any)
   */
  getCurrentTransition(): WorldTransitionConfig | null {
    return this.currentTransition;
  }

  /**
   * Clear the active transition (after it completes)
   */
  clearTransition(): void {
    this.currentTransition = null;
  }

  /**
   * Reset the engine state
   */
  reset(): void {
    this.currentTransition = null;
  }

  /**
   * Check if a transition is valid between two worlds
   */
  isValidTransition(from: WorldId | null, to: WorldId): boolean {
    if (!from || from === to) return false;
    return !!TRANSITION_RULES[from]?.[to];
  }

  /**
   * Get all defined transition types
   */
  getAllTransitionTypes(): TransitionType[] {
    return ['attraction', 'pull', 'absorption', 'dissolution', 'flow', 'fold', 'tunnel', 'gravity_shift', 'env_wave'];
  }
}

export default WorldTransitionEngine;
