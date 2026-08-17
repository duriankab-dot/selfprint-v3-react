import { useEffect, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';
import { duckVolume, restoreVolume } from '@/services/audioManager';

/**
 * Hook for Audio Ducking Integration
 * § 23: Automatically reduces music volume when Twin speaks
 *
 * Usage:
 * ```tsx
 * function ChatComponent() {
 *   const { isDucking } = useAudioDucking();
 *
 *   useEffect(() => {
 *     // Start ducking when Twin starts speaking
 *     startDucking();
 *     return () => stopDucking();
 *   }, []);
 * }
 * ```
 */

interface UseAudioDuckingOptions {
  duckLevel?: number; // 0-1, default 0.2 (20%)
  duckDuration?: number; // ms, default 300
  restoreDuration?: number; // ms, default 500
}

export function useAudioDucking(options: UseAudioDuckingOptions = {}) {
  const { state, state: audioState } = useAudio();
  const duckTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const restoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const {
    duckLevel = 0.2,
    duckDuration = 300,
    restoreDuration = 500,
  } = options;

  const startDucking = async () => {
    if (!audioState.musicEnabled) return;

    // Clear any pending restore
    if (restoreTimeoutRef.current) {
      clearTimeout(restoreTimeoutRef.current);
    }

    try {
      await duckVolume(duckLevel, duckDuration);
      console.log('[AudioDucking] Music ducked for Twin speech');
    } catch (error) {
      console.error('[AudioDucking] Failed to duck volume:', error);
    }
  };

  const stopDucking = async () => {
    if (!audioState.musicEnabled) return;

    // Clear any pending duck
    if (duckTimeoutRef.current) {
      clearTimeout(duckTimeoutRef.current);
    }

    try {
      const targetVolume = audioState.volume / 100; // Restore to current volume setting
      await restoreVolume(targetVolume, restoreDuration);
      console.log('[AudioDucking] Music restored');
    } catch (error) {
      console.error('[AudioDucking] Failed to restore volume:', error);
    }
  };

  /**
   * Schedule ducking (useful for delayed Twin responses)
   * @param delay - Delay before ducking starts (ms)
   */
  const scheduleDucking = (delay: number = 100) => {
    duckTimeoutRef.current = setTimeout(() => {
      startDucking();
    }, delay);
  };

  /**
   * Schedule restore (useful for timeout scenarios)
   * @param delay - Delay before restore starts (ms)
   */
  const scheduleRestore = (delay: number = 100) => {
    restoreTimeoutRef.current = setTimeout(() => {
      stopDucking();
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current);
      if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
    };
  }, []);

  return {
    isDucking: state.isDucking,
    startDucking,
    stopDucking,
    scheduleDucking,
    scheduleRestore,
  };
}
