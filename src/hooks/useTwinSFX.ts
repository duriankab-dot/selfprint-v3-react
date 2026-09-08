/**
 * useTwinSFX.ts
 *
 * Play Twin-specific SFX from public/audio/twin/
 * Used by: HologramBirth, TwinPresence, CoreAwakening, Twin awakening events
 *
 * SFX Library (18 files):
 *   - Awakening: robot-awakening-power-on.mp3
 *   - Interaction: electric-buzz-glitch, electric-pop, futuristic-robotic-fast-sweep
 *   - Communication: robot-says-thank-you, robot-says-yes, science-fiction-computer-voice
 *   - Effects: robotic-glitch, robotic-insect-buzz, sci-fi-laser, sci-fi-positive-notification
 *   - Ambient: small-electric-glitch, space-deploy-whizz, space-plasma-shot
 *   - Transitions: static-electricity-presentation, unknown-technology-chirp-pattern
 *   - Death/End: robot-death
 */

import { useEffect, useRef, useCallback } from 'react';

export type TwinSFXType =
  | 'awakening'       // robot-awakening-power-on
  | 'interact'        // electric-pop
  | 'glitch'          // electric-buzz-glitch
  | 'sweep'           // futuristic-robotic-fast-sweep
  | 'thank-you'       // robot-says-thank-you
  | 'yes'             // robot-says-yes
  | 'voice'           // science-fiction-computer-voice
  | 'laser'           // sci-fi-laser-in-space
  | 'notification'    // sci-fi-positive-notification
  | 'ambient'         // small-electric-glitch
  | 'deploy'          // space-deploy-whizz
  | 'plasma'          // space-plasma-shot
  | 'static'          // static-electricity-presentation
  | 'chirp'           // unknown-technology-chirp-pattern
  | 'death';          // robot-death

const TWIN_SFX_MAP: Record<TwinSFXType, string> = {
  awakening: '/audio/twin/746988__gammagool__robot-awakening-power-on.mp3',
  interact: '/audio/twin/mixkit-electric-pop-2365.mp3',
  glitch: '/audio/twin/mixkit-electric-buzz-glitch-2594.mp3',
  sweep: '/audio/twin/mixkit-futuristic-robotic-fast-sweep-171.mp3',
  'thank-you': '/audio/twin/mixkit-robot-says-thank-you-381.mp3',
  yes: '/audio/twin/mixkit-robot-says-yes-283.mp3',
  voice: '/audio/twin/mixkit-science-fiction-computer-voice-238.mp3',
  laser: '/audio/twin/mixkit-sci-fi-laser-in-space-sound-2825.mp3',
  notification: '/audio/twin/mixkit-sci-fi-positive-notification-266.mp3',
  ambient: '/audio/twin/mixkit-small-electric-glitch-2595.mp3',
  deploy: '/audio/twin/mixkit-space-deploy-whizz-3003.mp3',
  plasma: '/audio/twin/mixkit-space-plasma-shot-3002.mp3',
  static: '/audio/twin/mixkit-static-electricity-presentation-2592.mp3',
  chirp: '/audio/twin/mixkit-unknown-technology-chirp-pattern-3125.mp3',
  death: '/audio/twin/mixkit-robot-death-3153.mp3',
};

interface UseTwinSFXOptions {
  /** Enable/disable all SFX */
  enabled?: boolean;
  /** Volume 0–100 */
  volume?: number;
}

interface UseTwinSFXReturn {
  play: (sfx: TwinSFXType) => void;
  /** Preload specific SFX for instant playback */
  preload: (sfx: TwinSFXType) => void;
  /** Preload all Twin SFX */
  preloadAll: () => void;
}

/** Cache decoded AudioBuffers for instant playback */
const sfxCache = new Map<string, AudioBuffer>();
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)!();
  }
  return audioCtx;
}

async function loadSFX(sfxType: TwinSFXType): Promise<AudioBuffer | null> {
  const cached = sfxCache.get(sfxType);
  if (cached) return cached;

  const url = TWIN_SFX_MAP[sfxType];
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

export function useTwinSFX({ enabled = true, volume = 70 }: UseTwinSFXOptions = {}): UseTwinSFXReturn {
  const volumeRef = useRef(volume);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    volumeRef.current = volume;
    enabledRef.current = enabled;
  }, [volume, enabled]);

  const play = useCallback((sfx: TwinSFXType) => {
    if (!enabledRef.current) return;

    const buffer = sfxCache.get(sfx);
    if (!buffer) {
      // Load asynchronously and play when ready
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

  const preload = useCallback((sfx: TwinSFXType) => {
    loadSFX(sfx);
  }, []);

  const preloadAll = useCallback(() => {
    Object.keys(TWIN_SFX_MAP).forEach((key) => loadSFX(key as TwinSFXType));
  }, []);

  return { play, preload, preloadAll };
}

export default useTwinSFX;
