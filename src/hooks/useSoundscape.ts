/**
 * useSoundscape.ts
 *
 * Custom hook for soundscape state management
 * Integrates EnvironmentContext + AudioContext
 */

import { useEnvironment } from '@/context/EnvironmentContext';
import { useAudio } from '@/context/AudioContext';

export interface SoundscapeState {
  soundscapeName: string;
  soundscapeEmoji: string;
  description: string;
  isPlaying: boolean;
  volume: number;
  isDucking: boolean;
  period: string;
}

/**
 * Hook: get current soundscape state
 */
export function useSoundscape(): SoundscapeState {
  const { environment } = useEnvironment();
  const audio = useAudio();

  if (!environment) {
    return {
      soundscapeName: 'Ambient',
      soundscapeEmoji: '〰️',
      description: 'Loading...',
      isPlaying: false,
      volume: 0,
      isDucking: false,
      period: 'unknown',
    };
  }

  return {
    soundscapeName: environment.soundscape.labelThai,
    soundscapeEmoji: environment.soundscape.emoji,
    description: environment.soundscape.descriptionThai,
    isPlaying: audio.state.musicEnabled,
    volume: audio.state.volume,
    isDucking: audio.state.isDucking,
    period: environment.timePeriod,
  };
}

export default useSoundscape;
