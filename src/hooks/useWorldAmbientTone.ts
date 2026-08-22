/**
 * useWorldAmbientTone.ts
 *
 * P0-H: 12 Hub Worlds Visual & Experience Directive §23 ("LIGHT / COLOR /
 * SOUND ADAPT" when a Hub opens). No ambient audio files exist for the 12
 * worlds yet — user-confirmed decision: generate a soft two-tone ambient pad
 * per world with the Web Audio API instead of waiting on produced audio
 * assets (same shape as the color system: procedural now, swappable for
 * real audio later without touching call sites).
 *
 * Deliberately does NOT autoplay — browsers block un-gestured audio anyway,
 * and forcing sound on every world visit is bad UX. Exposes a play/pause
 * toggle the page renders as a visible control.
 *
 * Does NOT gate on AudioContext.state.soundEnabled (src/context/
 * AudioContext.tsx) despite that field existing for exactly this purpose —
 * traced its only real toggle UI (AudioSettings.tsx via
 * AudioSettingsButton.tsx) and found it is not rendered anywhere reachable
 * in the live app, so soundEnabled can never actually become true through
 * any UI path a user can reach; gating on it would make this toggle
 * permanently disabled for everyone. Still watches soundEnabled and stops
 * playback if it's ever explicitly turned false, in case that settings UI
 * gets wired up later — just doesn't require it to start.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import type { WorldId } from '../constants/worlds';

/** Soft base frequency per world (Hz), all in a low/mid ambient range —
 *  distinct per world, none jarring. Deterministic, not randomized. */
const WORLD_BASE_FREQUENCY: Record<WorldId, number> = {
  self: 174,
  mind: 210,
  relationship: 196,
  love: 165,
  career: 220,
  wealth: 185,
  life: 200,
  growth: 155,
  decision: 233,
  purpose: 130,
  wellbeing: 140,
  future: 246,
};

interface ToneNodes {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  gain: GainNode;
}

export function useWorldAmbientTone(worldId: WorldId) {
  const audio = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<ToneNodes | null>(null);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (ctx && nodes) {
      const now = ctx.currentTime;
      nodes.gain.gain.cancelScheduledValues(now);
      nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
      nodes.gain.gain.linearRampToValueAtTime(0, now + 0.6);
      const { osc1, osc2 } = nodes;
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
        } catch {
          // already stopped — safe to ignore
        }
      }, 650);
    }
    nodesRef.current = null;
    setIsPlaying(false);
  }, []);

  const start = useCallback(() => {
    if (nodesRef.current) return;

    const AudioCtxCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxCtor) return;
    if (!ctxRef.current) ctxRef.current = new AudioCtxCtor();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const base = WORLD_BASE_FREQUENCY[worldId];

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = base;
    osc1.connect(gain);

    // Soft fifth above the base tone — pleasant, not dissonant.
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = base * 1.5;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.3;
    osc2.connect(gain2);
    gain2.connect(gain);

    osc1.start();
    osc2.start();

    // Deliberately quiet — "ambient", not a soundtrack. Scales with the
    // user's existing volume preference but caps well below full volume.
    const targetVolume = Math.min(0.06, (audio.state.volume / 100) * 0.08);
    gain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.2);

    nodesRef.current = { osc1, osc2, gain };
    setIsPlaying(true);
  }, [worldId, audio.state.volume]);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  // Stop when leaving this world / unmounting.
  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldId]);

  // If the user turns sound off globally while this is playing, follow it.
  useEffect(() => {
    if (!audio.state.soundEnabled && isPlaying) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.state.soundEnabled]);

  return {
    isPlaying,
    toggle,
    soundGloballyEnabled: audio.state.soundEnabled,
  };
}
