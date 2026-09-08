/**
 * useUISFX.ts
 *
 * Play UI feedback SFX from public/audio/ui/
 * Used by: button clicks, navigation, notifications, form submissions
 *
 * SFX Library (30 files):
 *   - Clicks: click-error, confirmation-tone, cool-interface-click-tone
 *            , interface-device-click, interface-option-select, select-click
 *   - Navigation: page-back-chime, page-forward-single-chime, page-turn-chime
 *                , software-interface-back, software-interface-remove, software-interface-start
 *   - Feedback: correct-answer-tone, failure-piano, negative-tone-interface-tap
 *              , retro-confirmation-tone
 *   - Notifications: interface-hint-notification, magic-glitter-or-particles
 *                   , magic-notification-ring, magic-wand-sparkle
 *   - Game-like: game-level-completed, little-piano-game-over, losing-piano
 *               , piano-falling-effect, piano-game-over, repeating-arcade-beep
 *   - Other: classic-alarm, impact-of-a-blow, fairy-glitter
 *           , opening-software-interface
 */

import { useEffect, useRef, useCallback } from 'react';

export type UISFXType =
  | 'click'                  // select-click (default button click)
  | 'click-cool'             // cool-interface-click-tone
  | 'option-select'          // interface-option-select
  | 'confirm'                // confirmation-tone
  | 'confirm-retro'          // retro-confirmation-tone
  | 'correct'                // correct-answer-tone
  | 'error'                  // click-error
  | 'failure'                // cartoon-failure-piano
  | 'page-back'              // page-back-chime
  | 'page-forward'           // page-forward-single-chime
  | 'page-turn'              // page-turn-chime
  | 'nav-start'              // software-interface-start
  | 'nav-back'               // software-interface-back
  | 'nav-remove'             // software-interface-remove
  | 'hint'                   // interface-hint-notification
  | 'magic-glint'            // magic-glitter-or-particles
  | 'magic-notification'     // magic-notification-ring
  | 'magic-wand'             // magic-wand-sparkle
  | 'level-complete'         // game-level-completed
  | 'losing'                 // losing-piano
  | 'alarm'                  // classic-alarm
  | 'impact'                 // impact-of-a-blow
  | 'fairy-glitter'          // fairy-glitter-867.mp3
  | 'opening'                // opening-software-interface
  | 'negative'               // negative-tone-interface-tap
  | 'piano-falling'          // piano-falling-effect
  | 'piano-game-over'        // piano-game-over
  | 'repeating-beep'         // repeating-arcade-beep
  | 'little-piano-over';     // little-piano-game-over

const UI_SFX_MAP: Record<UISFXType, string> = {
  'click': '/audio/ui/mixkit-select-click-1109.mp3',
  'click-cool': '/audio/ui/mixkit-cool-interface-click-tone-2568.mp3',
  'option-select': '/audio/ui/mixkit-interface-option-select-2573.mp3',
  'confirm': '/audio/ui/mixkit-confirmation-tone-2867.mp3',
  'confirm-retro': '/audio/ui/mixkit-retro-confirmation-tone-2860.mp3',
  'correct': '/audio/ui/mixkit-correct-answer-tone-2870.mp3',
  'error': '/audio/ui/mixkit-click-error-1110.mp3',
  'failure': '/audio/ui/mixkit-cartoon-failure-piano-473.mp3',
  'page-back': '/audio/ui/mixkit-page-back-chime-1108.mp3',
  'page-forward': '/audio/ui/mixkit-page-forward-single-chime-1107.mp3',
  'page-turn': '/audio/ui/mixkit-page-turn-chime-1106.mp3',
  'nav-start': '/audio/ui/mixkit-software-interface-start-2574.mp3',
  'nav-back': '/audio/ui/mixkit-software-interface-back-2575.mp3',
  'nav-remove': '/audio/ui/mixkit-software-interface-remove-2576.mp3',
  'hint': '/audio/ui/mixkit-interface-hint-notification-911.mp3',
  'magic-glint': '/audio/ui/mixkit-magic-glitter-or-particles-2352.mp3',
  'magic-notification': '/audio/ui/mixkit-magic-notification-ring-2344.mp3',
  'magic-wand': '/audio/ui/mixkit-magic-wand-sparkle-3062.mp3',
  'level-complete': '/audio/ui/mixkit-game-level-completed-2059.mp3',
  'losing': '/audio/ui/mixkit-losing-piano-2024.mp3',
  'alarm': '/audio/ui/mixkit-classic-alarm-995.mp3',
  'impact': '/audio/ui/mixkit-impact-of-a-blow-2150.mp3',
  'fairy-glitter': '/audio/ui/mixkit-fairy-glitter-867.mp3',
  'opening': '/audio/ui/mixkit-opening-software-interface-2578.mp3',
  'negative': '/audio/ui/mixkit-negative-tone-interface-tap-2569.mp3',
  'piano-falling': '/audio/ui/mixkit-piano-falling-effect-408.mp3',
  'piano-game-over': '/audio/ui/mixkit-piano-game-over-1941.mp3',
  'repeating-beep': '/audio/ui/mixkit-repeating-arcade-beep-1084.mp3',
  'little-piano-over': '/audio/ui/mixkit-little-piano-game-over-1944.mp3',
};

interface UseUISFXOptions {
  enabled?: boolean;
  volume?: number;
}

interface UseUISFXReturn {
  play: (sfx: UISFXType) => void;
  preload: (sfx: UISFXType) => void;
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

async function loadSFX(sfxType: UISFXType): Promise<AudioBuffer | null> {
  const cached = sfxCache.get(sfxType);
  if (cached) return cached;

  const url = UI_SFX_MAP[sfxType];
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

export function useUISFX({ enabled = true, volume = 50 }: UseUISFXOptions = {}): UseUISFXReturn {
  const volumeRef = useRef(volume);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    volumeRef.current = volume;
    enabledRef.current = enabled;
  }, [volume, enabled]);

  const play = useCallback((sfx: UISFXType) => {
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

  const preload = useCallback((sfx: UISFXType) => {
    loadSFX(sfx);
  }, []);

  const preloadAll = useCallback(() => {
    Object.keys(UI_SFX_MAP).forEach((key) => loadSFX(key as UISFXType));
  }, []);

  return { play, preload, preloadAll };
}

export default useUISFX;
