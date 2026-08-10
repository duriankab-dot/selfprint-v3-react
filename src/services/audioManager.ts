/**
 * Audio Manager Service
 * § 23 Adaptive Background Music
 *
 * Handles:
 * - Experience-to-audio mapping
 * - Volume management
 * - Audio ducking (music reduction when Twin speaks)
 * - Playback control
 */

import type { MusicExperience } from '@/context/AudioContext';

/**
 * Map experience to audio file/stream
 * Using data URLs or external CDN (production would use proper audio files)
 */
export const AUDIO_LIBRARY: Record<MusicExperience, { url: string; name: string }> = {
  reflection: {
    name: 'Ambient Piano',
    url: 'https://example.com/audio/reflection-ambient.mp3', // TODO: Replace with actual URL
  },
  focus: {
    name: 'Minimal Pulse',
    url: 'https://example.com/audio/focus-pulse.mp3',
  },
  discovery: {
    name: 'Cosmic Ambient',
    url: 'https://example.com/audio/discovery-cosmic.mp3',
  },
  deep_reflection: {
    name: 'Sparse Ambient',
    url: 'https://example.com/audio/deep-reflection-sparse.mp3',
  },
  celebration: {
    name: 'Cinematic Uplift',
    url: 'https://example.com/audio/celebration-cinematic.mp3',
  },
  idle: {
    name: 'Silence',
    url: '', // No audio in idle state
  },
};

/**
 * Audio player instance (singleton)
 */
let audioElement: HTMLAudioElement | null = null;
let currentExperience: MusicExperience = 'idle';
let volumeTransitionInterval: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize audio element if not already done
 */
export function initializeAudioPlayer(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'auto';
    audioElement.loop = true;
    audioElement.style.display = 'none';
    document.body.appendChild(audioElement);
    console.log('[Audio] Player initialized');
  }
  return audioElement;
}

/**
 * Play ambient music for a given experience
 * Fades in smoothly to avoid jarring transitions
 *
 * @param experience - Type of experience (reflection, focus, etc.)
 * @param volume - Current volume (0-100)
 */
export async function playAmbience(experience: MusicExperience, volume: number): Promise<void> {
  if (!audioElement) {
    initializeAudioPlayer();
  }

  const audio = audioElement!;
  const audioData = AUDIO_LIBRARY[experience];

  try {
    // Don't restart if already playing the same track
    if (currentExperience === experience && audio.src === audioData.url) {
      return;
    }

    // Stop current audio
    audio.pause();
    audio.volume = 0;

    // Update source
    audio.src = audioData.url;
    currentExperience = experience;

    // Only play if not idle and not empty URL
    if (experience !== 'idle' && audioData.url) {
      await audio.play();

      // Fade in
      await fadeVolume(0, volume / 100, 1000); // 1 second fade-in
      console.log(`[Audio] Playing: ${audioData.name}`);
    }
  } catch (error) {
    console.error(`[Audio] Failed to play ${audioData.name}:`, error);
  }
}

/**
 * Stop ambient music (fade out)
 */
export async function stopAmbience(): Promise<void> {
  if (!audioElement) return;

  try {
    await fadeVolume(audioElement.volume, 0, 500); // 0.5 second fade-out
    audioElement.pause();
    currentExperience = 'idle';
    console.log('[Audio] Stopped');
  } catch (error) {
    console.error('[Audio] Failed to stop:', error);
  }
}

/**
 * Audio Ducking: Reduce volume when Twin is speaking
 * Smooth volume transition to duckVolume over duration
 *
 * @param targetVolume - Target volume (0-1, typically 0.2 for 20%)
 * @param duration - Transition duration in milliseconds
 */
export async function duckVolume(targetVolume: number = 0.2, duration: number = 300): Promise<void> {
  if (!audioElement) return;

  const currentVol = audioElement.volume;
  const target = Math.max(0, Math.min(1, targetVolume));

  await fadeVolume(currentVol, target, duration);
  console.log(`[Audio] Ducked to ${Math.round(target * 100)}%`);
}

/**
 * Restore volume to previous level (unduck)
 * Called when Twin stops speaking
 *
 * @param targetVolume - Target volume (0-1, typically previous volume)
 * @param duration - Transition duration in milliseconds
 */
export async function restoreVolume(targetVolume: number, duration: number = 500): Promise<void> {
  if (!audioElement) return;

  const currentVol = audioElement.volume;
  const target = Math.max(0, Math.min(1, targetVolume));

  await fadeVolume(currentVol, target, duration);
  console.log(`[Audio] Restored to ${Math.round(target * 100)}%`);
}

/**
 * Smooth volume fade
 * @param startVol - Starting volume (0-1)
 * @param endVol - Ending volume (0-1)
 * @param duration - Fade duration in milliseconds
 */
async function fadeVolume(startVol: number, endVol: number, duration: number): Promise<void> {
  return new Promise(resolve => {
    if (!audioElement) {
      resolve();
      return;
    }

    // Clear any existing transition
    if (volumeTransitionInterval) {
      clearInterval(volumeTransitionInterval);
    }

    const startTime = Date.now();
    const startVolume = Math.max(0, Math.min(1, startVol));
    const targetVolume = Math.max(0, Math.min(1, endVol));
    const volumeDiff = targetVolume - startVolume;

    volumeTransitionInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (audioElement) {
        audioElement.volume = startVolume + volumeDiff * progress;
      }

      if (progress >= 1) {
        clearInterval(volumeTransitionInterval!);
        volumeTransitionInterval = null;
        if (audioElement) {
          audioElement.volume = targetVolume;
        }
        resolve();
      }
    }, 10); // Update every 10ms for smooth transition
  });
}

/**
 * Set volume directly (0-100)
 */
export function setVolume(percent: number): void {
  if (!audioElement) {
    initializeAudioPlayer();
  }

  const volume = Math.max(0, Math.min(1, percent / 100));
  audioElement!.volume = volume;
}

/**
 * Get current playback state
 */
export function getPlaybackState() {
  return {
    isPlaying: audioElement ? !audioElement.paused : false,
    currentExperience,
    volume: audioElement ? Math.round(audioElement.volume * 100) : 0,
  };
}

/**
 * Cleanup
 */
export function cleanup(): void {
  if (audioElement) {
    audioElement.pause();
    audioElement.src = '';
    if (audioElement.parentNode) {
      audioElement.parentNode.removeChild(audioElement);
    }
    audioElement = null;
  }

  if (volumeTransitionInterval) {
    clearInterval(volumeTransitionInterval);
    volumeTransitionInterval = null;
  }

  currentExperience = 'idle';
}
