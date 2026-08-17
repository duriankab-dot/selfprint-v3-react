/**
 * Audio Manager Service
 * § 23 Adaptive Background Music + P3.1 Adaptive Engine
 *
 * Handles:
 * - Experience-to-audio mapping
 * - Volume management
 * - Audio ducking (music reduction when Twin speaks)
 * - Playback control
 * - Adaptive quality (network/device aware)
 */

import type { MusicExperience } from '@/context/AudioContext';
import { adaptiveAudioEngine, type AudioProfile } from './adaptive-audio-engine';

/**
 * Map experience to audio file/stream
 * Using data URLs or external CDN (production would use proper audio files)
 */
/**
 * Web Audio API Oscillator Frequencies (Hz)
 * Generates ambient tones without external audio files
 */
export const AUDIO_LIBRARY: Record<MusicExperience, { frequencies: number[]; name: string }> = {
  reflection: {
    name: 'Ambient Piano',
    frequencies: [262, 330, 392], // C4, E4, G4 (C major chord)
  },
  focus: {
    name: 'Minimal Pulse',
    frequencies: [440], // A4 (pure tone)
  },
  discovery: {
    name: 'Cosmic Ambient',
    frequencies: [174, 258, 417], // Solfeggio frequencies (root, earth, light)
  },
  deep_reflection: {
    name: 'Sparse Ambient',
    frequencies: [136.10], // OM frequency (cosmic)
  },
  celebration: {
    name: 'Cinematic Uplift',
    frequencies: [523, 659, 784], // C5, E5, G5 (high C major chord)
  },
  idle: {
    name: 'Silence',
    frequencies: [], // No audio in idle state
  },
};

/**
 * Web Audio API context (singleton)
 */
let audioContext: AudioContext | null = null;
let oscillators: OscillatorNode[] = [];
let gainNode: GainNode | null = null;
let currentExperience: MusicExperience = 'idle';
let volumeTransitionInterval: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize Web Audio API context
 */
export function initializeAudioPlayer(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.3; // Default volume
    console.log('[Audio] Web Audio context initialized');
  }
  return audioContext;
}

/**
 * Play ambient music for a given experience using Web Audio API
 * Generates oscillator tones without external files
 *
 * @param experience - Type of experience (reflection, focus, etc.)
 * @param volume - Current volume (0-100)
 */
export async function playAmbience(experience: MusicExperience, volume: number): Promise<void> {
  const ctx = initializeAudioPlayer();
  const audioData = AUDIO_LIBRARY[experience];

  try {
    // Don't restart if already playing the same experience
    if (currentExperience === experience && oscillators.length > 0) {
      return;
    }

    // Stop current oscillators
    stopAmbience();

    currentExperience = experience;

    // Only play if not idle and has frequencies
    if (experience !== 'idle' && audioData.frequencies.length > 0) {
      // Create oscillators for each frequency (polyphonic)
      audioData.frequencies.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.frequency.value = freq;
        osc.type = 'sine';
        osc.connect(gainNode!);
        osc.start();
        oscillators.push(osc);
      });

      // Fade in
      await fadeVolume(0, volume / 100, 1000); // 1 second fade-in
      console.log(`[Audio] Playing: ${audioData.name} (${audioData.frequencies.join(', ')} Hz)`);
    }
  } catch (error) {
    console.error(`[Audio] Failed to play ${audioData.name}:`, error);
  }
}

/**
 * Stop ambient music (fade out and stop oscillators)
 */
export async function stopAmbience(): Promise<void> {
  if (!gainNode) return;

  try {
    await fadeVolume(gainNode.gain.value, 0, 500); // 0.5 second fade-out

    // Stop all oscillators
    oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    oscillators = [];

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
  if (!gainNode) return;

  const currentVol = gainNode.gain.value;
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
  if (!gainNode) return;

  const currentVol = gainNode.gain.value;
  const target = Math.max(0, Math.min(1, targetVolume));

  await fadeVolume(currentVol, target, duration);
  console.log(`[Audio] Restored to ${Math.round(target * 100)}%`);
}

/**
 * Smooth volume fade using Web Audio API
 * @param startVol - Starting volume (0-1)
 * @param endVol - Ending volume (0-1)
 * @param duration - Fade duration in milliseconds
 */
async function fadeVolume(startVol: number, endVol: number, duration: number): Promise<void> {
  return new Promise(resolve => {
    if (!gainNode) {
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

      if (gainNode) {
        gainNode.gain.value = startVolume + volumeDiff * progress;
      }

      if (progress >= 1) {
        clearInterval(volumeTransitionInterval!);
        volumeTransitionInterval = null;
        if (gainNode) {
          gainNode.gain.value = targetVolume;
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
  initializeAudioPlayer();
  const volume = Math.max(0, Math.min(1, percent / 100));
  if (gainNode) {
    gainNode.gain.value = volume;
  }
}

/**
 * Get current playback state
 */
export function getPlaybackState() {
  return {
    isPlaying: oscillators.length > 0,
    currentExperience,
    volume: gainNode ? Math.round(gainNode.gain.value * 100) : 0,
  };
}

/**
 * P3.1 Adaptive Audio: Get frequencies adjusted for device capability
 * @param experience Experience type
 * @param profile Adaptive audio profile
 * @returns Adjusted frequency array
 */
export function getAdaptiveFrequencies(
  experience: MusicExperience,
  profile: AudioProfile
): number[] {
  const baseFrequencies = AUDIO_LIBRARY[experience].frequencies;

  // Limit oscillators based on device capability
  if (profile.maxConcurrentOscillators === 0) {
    return []; // Silent mode
  }

  return baseFrequencies.slice(0, profile.maxConcurrentOscillators);
}

/**
 * P3.1 Adaptive Audio: Play with device-aware settings
 * @param experience Experience type
 * @param volume Volume 0-100
 * @param adaptiveProfile Optional audio profile (auto-detect if not provided)
 */
export async function playAmbienceWithAdaptation(
  experience: MusicExperience,
  volume: number,
  adaptiveProfile?: AudioProfile
): Promise<void> {
  const profile = adaptiveProfile || adaptiveAudioEngine.getRecommendedProfile();

  // Handle silent mode
  if (profile.quality === 'silence') {
    console.log('[Audio] Adaptive: Silent mode (low battery/offline)');
    await stopAmbience();
    return;
  }

  // For now, use oscillators with adaptive frequency count
  // In future: load MP3 files based on profile.quality
  const frequencies = getAdaptiveFrequencies(experience, profile);

  if (frequencies.length === 0) {
    await stopAmbience();
    return;
  }

  // Log adaptive decision
  const audioData = AUDIO_LIBRARY[experience];
  console.log(
    `[Audio] Adaptive: ${audioData.name} (${frequencies.length}/${AUDIO_LIBRARY[experience].frequencies.length} freq) - ${profile.quality}`
  );

  // Play with adapted frequencies
  const ctx = initializeAudioPlayer();

  try {
    if (currentExperience === experience && oscillators.length > 0) {
      return;
    }

    await stopAmbience();
    currentExperience = experience;

    if (experience !== 'idle' && frequencies.length > 0) {
      frequencies.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.frequency.value = freq;
        osc.type = 'sine';
        osc.connect(gainNode!);
        osc.start();
        oscillators.push(osc);
      });

      await fadeVolume(0, volume / 100, 1000);
    }
  } catch (error) {
    console.error('[Audio] Adaptive playback failed:', error);
  }
}

/**
 * P3.1 Adaptive Audio: Get current network/device profile
 */
export function getAdaptiveProfile(): AudioProfile {
  return adaptiveAudioEngine.getRecommendedProfile();
}

/**
 * P3.1 Adaptive Audio: Get network info
 */
export function getNetworkInfo() {
  return adaptiveAudioEngine.getNetworkProfile();
}

/**
 * P3.1 Adaptive Audio: Get device capabilities
 */
export function getDeviceInfo() {
  return adaptiveAudioEngine.getDeviceProfile();
}

/**
 * P3.1 Adaptive Audio: Listen for network changes and auto-adapt
 */
export function enableAutoAdaptation(): void {
  adaptiveAudioEngine.onNetworkChange((newProfile) => {
    const audioProfile = adaptiveAudioEngine.computeAudioProfile(
      newProfile,
      adaptiveAudioEngine.getDeviceProfile()
    );

    console.log('[Audio] Network changed, auto-adapting:', audioProfile.quality);

    // Re-play current experience with new profile if playing
    if (oscillators.length > 0) {
      const currentVol = gainNode?.gain.value || 0.3;
      playAmbienceWithAdaptation(currentExperience, Math.round(currentVol * 100), audioProfile);
    }
  });
}

/**
 * Cleanup Web Audio resources
 */
export function cleanup(): void {
  oscillators.forEach(osc => {
    try {
      osc.stop();
    } catch (e) {
      // Already stopped
    }
  });
  oscillators = [];

  if (volumeTransitionInterval) {
    clearInterval(volumeTransitionInterval);
    volumeTransitionInterval = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  currentExperience = 'idle';
}
