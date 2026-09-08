/**
 * useTransitionSFX.ts
 *
 * Play scene transition SFX from public/audio/transition/
 * Used by: page transitions, world switches, mode changes
 *
 * SFX Library (14 files):
 *   - Wooshes: air-woosh, cinematic-tunnel-reverb-woosh, cinematic-whoosh-fast-transition
 *                    , cinematic-whoosh-stutter, electric-whoosh, fairy-sparkle-whoosh
 *   - Sweeps:  futuristic-transition-sweep, magic-astral-sweep-effect, magic-sparkle-whoosh
 *             , magical-light-moving, magical-light-sweep, magical-light-transition
 *   - Others:  magical-stone-slide, user-interface-zoom-out
 */

import { useEffect, useRef, useCallback } from 'react';

export type TransitionSFXType =
  | 'air-woosh'            // mixkit-air-woosh-1489.mp3
  | 'tunnel-woosh'         // mixkit-cinematic-tunnel-reverb-woosh-1486.mp3
  | 'fast-whoosh'          // mixkit-cinematic-whoosh-fast-transition-1492.mp3
  | 'stutter-whoosh'       // mixkit-cinematic-whoosh-stutter-787.mp3
  | 'electric-whoosh'      // mixkit-electric-whoosh-2596.mp3
  | 'fairy-sparkle'        // mixkit-fairy-sparkle-whoosh-869.mp3
  | 'futuristic-sweep'     // mixkit-futuristic-transition-sweep-2634.mp3
  | 'astral-sweep'         // mixkit-magic-astral-sweep-effect-2629.mp3
  | 'sparkle-whoosh'       // mixkit-magic-sparkle-whoosh-2350.mp3
  | 'light-moving'         // mixkit-magical-light-moving-2584.mp3
  | 'light-sweep'          // mixkit-magical-light-sweep-2586.mp3
  | 'light-transition'     // mixkit-magical-light-transition-2583.mp3
  | 'stone-slide'          // mixkit-magical-stone-slide-1528.mp3
  | 'ui-zoom-out';         // mixkit-user-interface-zoom-out-2620.mp3

const TRANSITION_SFX_MAP: Record<TransitionSFXType, string> = {
  'air-woosh': '/audio/transition/mixkit-air-woosh-1489.mp3',
  'tunnel-woosh': '/audio/transition/mixkit-cinematic-tunnel-reverb-woosh-1486.mp3',
  'fast-whoosh': '/audio/transition/mixkit-cinematic-whoosh-fast-transition-1492.mp3',
  'stutter-whoosh': '/audio/transition/mixkit-cinematic-whoosh-stutter-787.mp3',
  'electric-whoosh': '/audio/transition/mixkit-electric-whoosh-2596.mp3',
  'fairy-sparkle': '/audio/transition/mixkit-fairy-sparkle-whoosh-869.mp3',
  'futuristic-sweep': '/audio/transition/mixkit-futuristic-transition-sweep-2634.mp3',
  'astral-sweep': '/audio/transition/mixkit-magic-astral-sweep-effect-2629.mp3',
  'sparkle-whoosh': '/audio/transition/mixkit-magic-sparkle-whoosh-2350.mp3',
  'light-moving': '/audio/transition/mixkit-magical-light-moving-2584.mp3',
  'light-sweep': '/audio/transition/mixkit-magical-light-sweep-2586.mp3',
  'light-transition': '/audio/transition/mixkit-magical-light-transition-2583.mp3',
  'stone-slide': '/audio/transition/mixkit-magical-stone-slide-1528.mp3',
  'ui-zoom-out': '/audio/transition/mixkit-user-interface-zoom-out-2620.mp3',
};

interface UseTransitionSFXOptions {
  enabled?: boolean;
  volume?: number;
}

interface UseTransitionSFXReturn {
  play: (sfx: TransitionSFXType) => void;
  preload: (sfx: TransitionSFXType) => void;
  preloadAll: () => void;
}

/** Shared cache across all instances */
const sfxCache = new Map<string, AudioBuffer>();
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)!();
  }
  return audioCtx;
}

async function loadSFX(sfxType: TransitionSFXType): Promise<AudioBuffer | null> {
  const cached = sfxCache.get(sfxType);
  if (cached) return cached;

  const url = TRANSITION_SFX_MAP[sfxType];
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const ctx = getAudioContext();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    sfxCache.set(sfxType, buffer);
    return buffer;
  } catch {
    return null;
  }
}

export function useTransitionSFX({ enabled = true, volume = 60 }: UseTransitionSFXOptions = {}): UseTransitionSFXReturn {
  const volumeRef = useRef(volume);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    volumeRef.current = volume;
    enabledRef.current = enabled;
  }, [volume, enabled]);

  const play = useCallback((sfx: TransitionSFXType) => {
    if (!enabledRef.current) return;

    const buffer = sfxCache.get(sfx);
    if (!buffer) {
      loadSFX(sfx).then((buf) => {
        if (!buf) return;
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const source = ctx.createBufferSource();
        source.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = volumeRef.current / 100;
        source.connect(gain).connect(ctx.destination);
        source.start(0);
      });
      return;
    }

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = volumeRef.current / 100;
    source.connect(gain).connect(ctx.destination);
    source.start(0);
  }, []);

  const preload = useCallback((sfx: TransitionSFXType) => {
    loadSFX(sfx);
  }, []);

  const preloadAll = useCallback(() => {
    Object.keys(TRANSITION_SFX_MAP).forEach((key) => loadSFX(key as TransitionSFXType));
  }, []);

  return { play, preload, preloadAll };
}

export default useTransitionSFX;
