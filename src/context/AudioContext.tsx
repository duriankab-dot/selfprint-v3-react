import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * § 23 Adaptive Background Music
 *
 * Experience → Sound Mapping:
 * - Reflection → Ambient / Piano
 * - Focus → Minimal Pulse
 * - Discovery → Cosmic Ambient
 * - Deep Reflection → Sparse Ambient
 * - Celebration → Cinematic Uplift
 */

export type MusicExperience =
  | 'reflection'
  | 'focus'
  | 'discovery'
  | 'deep_reflection'
  | 'celebration'
  | 'idle';

export interface AudioState {
  // Current experience/music type
  experience: MusicExperience;

  // User preferences
  musicEnabled: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  volume: number; // 0-100

  // Audio ducking (auto volume reduction when Twin speaks)
  isDucking: boolean;
  baseVolume: number; // Volume before ducking
  duckVolume: number; // Volume during ducking (0-100, default 20)

  // Reduce motion accessibility
  reduceMotion: boolean;
}

interface AudioContextType {
  state: AudioState;
  setExperience: (experience: MusicExperience) => void;
  setVolume: (volume: number) => void;
  toggleMusic: () => void;
  toggleSound: () => void;
  toggleVoice: () => void;
  toggleReduceMotion: () => void;

  // Audio ducking
  startDucking: () => void;
  stopDucking: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AudioState>(() => {
    // Load from localStorage
    const stored = localStorage.getItem('selfprint-audio-state');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        // Failed to load audio state
      }
    }

    // Default state
    return {
      experience: 'idle',
      musicEnabled: false, // Don't autoplay - wait for user permission
      soundEnabled: false,
      voiceEnabled: false,
      volume: 60,
      isDucking: false,
      baseVolume: 60,
      duckVolume: 20,
      reduceMotion: false,
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('selfprint-audio-state', JSON.stringify(state));
  }, [state]);

  // Permission check on first load
  useEffect(() => {
    const hasUserInteraction = localStorage.getItem('selfprint-audio-permission-granted');
    if (!hasUserInteraction) {
      // Show permission request (handled by AudioSettings component)
    }
  }, []);

  const setExperience = (experience: MusicExperience) => {
    setState(prev => ({ ...prev, experience }));
  };

  const setVolume = (volume: number) => {
    const clipped = Math.max(0, Math.min(100, volume));
    setState(prev => ({
      ...prev,
      volume: clipped,
      baseVolume: clipped, // Update base volume if not ducking
    }));
  };

  const toggleMusic = () => {
    setState(prev => {
      const newState = { ...prev, musicEnabled: !prev.musicEnabled };
      if (newState.musicEnabled) {
        localStorage.setItem('selfprint-audio-permission-granted', 'true');
      }
      return newState;
    });
  };

  const toggleSound = () => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleVoice = () => {
    setState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
  };

  const toggleReduceMotion = () => {
    setState(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  };

  const startDucking = () => {
    setState(prev => ({
      ...prev,
      isDucking: true,
      baseVolume: prev.volume, // Save current volume
    }));
  };

  const stopDucking = () => {
    setState(prev => ({
      ...prev,
      isDucking: false,
      // Volume will return to baseVolume gradually
    }));
  };

  return (
    <AudioContext.Provider
      value={{
        state,
        setExperience,
        setVolume,
        toggleMusic,
        toggleSound,
        toggleVoice,
        toggleReduceMotion,
        startDucking,
        stopDucking,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};
