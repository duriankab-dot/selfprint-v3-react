/**
 * useTwinStates.ts — Canonical Twin Interaction State Machine
 *
 * Twin ไม่ถูก replace ทุก state — เป็น canonical living object ที่เปลี่ยน:
 *   motion, pulse, density, particles, flow, deformation, light, sound
 *
 * States:
 *   IDLE          — Twin รอการโต้ตอบ, soft ambient pulse
 *   LISTENING     — Twin กำลังรับข้อมูลจาก user, subtle responsive resonance
 *   THINKING      — Twin กำลังประมวลผล, fluid harmonic movement
 *   RESPONDING    — Twin กำลังตอบกลับ, pulse / harmonic reaction
 *   GROWING       — Twin มีการเติบโต/เปลี่ยนแปลง, deep expansion
 *
 * กฎ:
 *   - เปลี่ยนผ่าน state ต้องมี narrative transition (ไม่ hard cut)
 *   - แต่ละ state เปลี่ยน visual parameters เท่านั้น (ไม่ใช่เปลี่ยน model ใหม่)
 *   - Transition duration ~500ms (configurable)
 *   - Respect reduceMotion preference
 */

import { useState, useCallback } from 'react';
import { useAudio } from '@/context/AudioContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TwinInteractionState = 'idle' | 'listening' | 'thinking' | 'responding' | 'growing';

export interface TwinStateVisualParams {
  /** Scale factor — how much Twin expands/compresses */
  scale: number;
  /** Glow intensity — outer aura strength */
  glowIntensity: number;
  /** Pulse speed multiplier — breathing rhythm */
  pulseSpeed: number;
  /** Breathing intensity — brightness oscillation */
  breathingIntensity: number;
  /** Opacity — visibility */
  opacity: number;
  /** Rotation offset — slight body tilt */
  rotationDeg: number;
  /** Particle spawn rate multiplier */
  particleRate: number;
  /** Fluid deformation amount (0 = rigid, 1 = fully fluid) */
  deformation: number;
  /** CSS class for transition reaction */
  reactionClass: string;
}

export interface TwinStateTransition {
  from: TwinInteractionState;
  to: TwinInteractionState;
  duration: number; /* ms */
  type: 'smooth' | 'reaction' | 'expansion';
}

// ─── State Definitions ────────────────────────────────────────────────────────

const STATE_DEFINITIONS: Record<TwinInteractionState, TwinStateVisualParams> = {
  idle: {
    scale: 1.0,
    glowIntensity: 0.6,
    pulseSpeed: 1.0,
    breathingIntensity: 0.08,
    opacity: 0.92,
    rotationDeg: 0,
    particleRate: 0.3,
    deformation: 0.1,
    reactionClass: '',
  },
  listening: {
    scale: 1.02,
    glowIntensity: 0.75,
    pulseSpeed: 1.15,
    breathingIntensity: 0.12,
    opacity: 0.95,
    rotationDeg: -2,
    particleRate: 0.5,
    deformation: 0.2,
    reactionClass: 'is-attracted',
  },
  thinking: {
    scale: 1.04,
    glowIntensity: 0.85,
    pulseSpeed: 1.3,
    breathingIntensity: 0.15,
    opacity: 0.97,
    rotationDeg: 1,
    particleRate: 0.7,
    deformation: 0.3,
    reactionClass: 'is-absorbing',
  },
  responding: {
    scale: 1.06,
    glowIntensity: 0.9,
    pulseSpeed: 1.2,
    breathingIntensity: 0.18,
    opacity: 1.0,
    rotationDeg: 0,
    particleRate: 0.6,
    deformation: 0.25,
    reactionClass: 'is-pulled',
  },
  growing: {
    scale: 1.08,
    glowIntensity: 1.0,
    pulseSpeed: 0.9,
    breathingIntensity: 0.2,
    opacity: 1.0,
    rotationDeg: 0,
    particleRate: 0.8,
    deformation: 0.35,
    reactionClass: 'is-settled',
  },
};

// ─── State Transition Map ─────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<TwinInteractionState, TwinInteractionState[]> = {
  idle: ['listening', 'growing'],
  listening: ['thinking', 'idle'],
  thinking: ['responding', 'idle'],
  responding: ['idle', 'growing'],
  growing: ['idle'],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTwinStates(initialState: TwinInteractionState = 'idle') {
  const [current, setCurrent] = useState<TwinInteractionState>(initialState);
  const [previous, setPrevious] = useState<TwinInteractionState | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [transition, setTransition] = useState<TwinStateTransition | null>(null);

  const params = STATE_DEFINITIONS[current];
  const prevParams = previous ? STATE_DEFINITIONS[previous] : params;

  // Interpolated params during transition (reserved for future smooth animation)

  const audio = useAudio();
  const reduceMotion = audio.state.reduceMotion;

  // Set current state (with validation)
  const setState = useCallback((nextState: TwinInteractionState) => {
    setCurrent((prev) => {
      const allowed = VALID_TRANSITIONS[prev];
      if (!allowed.includes(nextState)) {
        console.warn(
          `[useTwinStates] Invalid transition: ${prev} → ${nextState}. Allowed: ${allowed.join(', ')}`
        );
        return prev;
      }

      setPrevious(prev);
      setTransition({
        from: prev,
        to: nextState,
        duration: reduceMotion ? 0 : 500,
        type: nextState === 'growing' ? 'expansion' : 'smooth',
      });
      setTransitioning(true);

      // Clean up transition flag after duration
      setTimeout(() => {
        setTransitioning(false);
        setPrevious(null);
      }, reduceMotion ? 0 : 500);

      return nextState;
    });
  }, [reduceMotion]);

  // Helper methods for common transitions
  const startListening = useCallback(() => setState('listening'), [setState]);
  const stopListening = useCallback(() => setState('idle'), [setState]);

  const startThinking = useCallback(() => setState('thinking'), [setState]);
  const stopThinking = useCallback(() => setState('idle'), [setState]);

  const startResponding = useCallback(() => setState('responding'), [setState]);
  const stopResponding = useCallback(() => setState('idle'), [setState]);

  const triggerGrowth = useCallback(() => setState('growing'), [setState]);

  // Full conversation flow: listening → thinking → responding → idle
  const runConversationFlow = useCallback(async (onThinkComplete?: () => void) => {
    setState('listening');

    // Simulate thinking delay (in real usage, this is triggered by API response)
    await new Promise((resolve) => setTimeout(resolve, 800));

    setState('thinking');

    // Wait for "thinking" to complete
    if (onThinkComplete) {
      await new Promise<void>((resolve) => {
        onThinkComplete();
        resolve();
      });
    }

    setState('responding');

    // Auto-return to idle after responding settles
    await new Promise((resolve) => setTimeout(resolve, reduceMotion ? 0 : 1500));
    setState('idle');
  }, [setState, reduceMotion]);

  // Get CSS custom properties for this state
  const cssVars = params
    ? {
        '--twin-interaction-state': `"${current}"`,
        '--twin-scale': String(params.scale),
        '--twin-glow-intensity': String(params.glowIntensity),
        '--twin-pulse-speed': String(params.pulseSpeed),
        '--twin-breathing-intensity': String(params.breathingIntensity),
        '--twin-opacity': String(params.opacity),
        '--twin-rotation': `${params.rotationDeg}deg`,
        '--twin-particle-rate': String(params.particleRate),
        '--twin-deformation': String(params.deformation),
      }
    : {};

  return {
    current,
    previous,
    transitioning,
    transition,
    params,
    prevParams,
    cssVars,
    setState,
    startListening,
    stopListening,
    startThinking,
    stopThinking,
    startResponding,
    stopResponding,
    triggerGrowth,
    runConversationFlow,
    isValidTransition: (from: TwinInteractionState, to: TwinInteractionState) =>
      VALID_TRANSITIONS[from]?.includes(to) ?? false,
  };
}

export default useTwinStates;
