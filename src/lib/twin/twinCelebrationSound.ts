/**
 * twinCelebrationSound.ts
 *
 * TWINCELEBRATION-001: the Twin birth ceremony's celebration phase used to
 * play an ambient "celebration" tone (user-confirmed: heard once, during a
 * live awakening) but nothing in the current CoreAwakening.tsx ever wired
 * it up — no <SoundscapePlayer> or ambient-tone hook is mounted on this
 * page at all. The sound design already exists and is unused:
 * SoundscapeEngine.ts / synthesizeAmbientDrone.ts both define a dedicated
 * 'celebration' soundscape (bright plucked chord, short reverb tail) meant
 * for exactly this moment — it was just never triggered outside the
 * Dashboard's SoundscapePlayer.
 *
 * Self-contained, same shape as twinVoice.ts: prime the AudioContext
 * synchronously (inside the user-gesture chain — same autoplay-policy
 * reasoning as speakTwinGreeting()), then render+play the buffer once
 * ready. Never throws — a missing/blocked celebration sound must not
 * interrupt the ceremony.
 */

import { synthesizeSoundscapeBuffer } from '../audio/synthesizeAmbientDrone';

let ctx: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;

/** Creates/resumes the shared AudioContext. Call this SYNCHRONOUSLY inside
 *  the click/submit handler that starts the celebration — same reasoning
 *  as speakTwinGreeting(): browsers that gate audio on user activation
 *  need the context created/resumed within that same gesture, before any
 *  `await`, or the later buffer playback can be silently blocked. */
export function primeCelebrationAudio(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtxCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxCtor) return;
    if (!ctx) ctx = new AudioCtxCtor();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    // Best-effort only.
  }
}

/** Renders (or reuses the cached render of) the 'celebration' soundscape
 *  and plays it once, respecting the app's own sound-on/off + volume
 *  preference so it behaves like every other ambient sound in the app. */
export async function playCelebrationSound(options: { enabled: boolean; volumePercent: number }): Promise<void> {
  try {
    if (!options.enabled || typeof window === 'undefined') return;
    if (!ctx) primeCelebrationAudio();
    if (!ctx) return;

    const buffer = await synthesizeSoundscapeBuffer('celebration', ctx, 8);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    // Same quiet/ambient ceiling as useWorldAmbientTone.ts — a birth
    // moment deserves to be heard, not loud.
    const targetVolume = Math.min(0.18, (options.volumePercent / 100) * 0.22);
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.4);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    activeSource = source;
    source.onended = () => {
      if (activeSource === source) activeSource = null;
    };
  } catch {
    // Best-effort only — a missing celebration sound must not break the ceremony.
  }
}

/** Stops any in-progress celebration sound — call on unmount/navigation. */
export function stopCelebrationSound(): void {
  try {
    activeSource?.stop();
  } catch {
    // already stopped — safe to ignore
  }
  activeSource = null;
}
