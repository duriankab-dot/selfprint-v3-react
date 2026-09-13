/**
 * TwinAudioFeedback.tsx
 *
 * Provides subtle audio feedback when Twin responds — procedural tones
 * via Web Audio API (no external assets needed).
 * 
 * Features:
 *   - World-dependent tone frequencies
 *   - Debounced (max 1 sound per 2 seconds)
 *   - Respects prefers-reduced-motion
 *   - Toggleable in settings
 */

import { useEffect, useRef } from 'react';
import type { WorldId } from '@/constants/worlds';

// World-to-frequency mapping (unique tone per world)
const WORLD_FREQUENCIES: Record<WorldId, number> = {
  self: 440,    // A4
  mind: 493.88, // B4
  relationship: 523.25, // C5
  love: 587.33, // D5
  career: 659.25, // E5
  wealth: 698.46, // F5
  life: 783.99, // G5
  growth: 880, // A5
  decision: 987.77, // B5
  purpose: 1046.5, // C6
  wellbeing: 1174.66, // D6
  future: 1318.51, // E6
};

interface TwinAudioFeedbackProps {
  /** Current message count (triggers sound on increase) */
  messageCount: number;
  /** Current world for tone selection */
  currentWorld?: WorldId;
  /** Whether audio feedback is enabled */
  enabled?: boolean;
}

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number = 0.15): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Envelope: quick attack, smooth decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available — silently fail
  }
}

export function TwinAudioFeedback({
  messageCount,
  currentWorld,
  enabled = false,
}: TwinAudioFeedbackProps) {
  const lastPlayedRef = useRef(0);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    // Only play when message count increases (twin sent a new message)
    if (messageCount <= prevMessageCountRef.current) return;
    
    // Debounce: max 1 sound per 2 seconds
    const now = Date.now();
    if (now - lastPlayedRef.current < 2000) return;
    
    // Play world-specific tone
    const frequency = currentWorld ? WORLD_FREQUENCIES[currentWorld] : 440;
    playTone(frequency, 0.12);
    
    lastPlayedRef.current = now;
    prevMessageCountRef.current = messageCount;
  }, [messageCount, currentWorld, enabled]);

  return null; // This is a side-effect-only component
}
