/**
 * SoundscapePlayer.tsx
 *
 * Master Direction §23 — Adaptive Background Music
 * Master Direction §46 — Advanced Adaptive Environments
 *
 * Renders ambient soundscape playback with:
 *   - Audio ducking when Twin speaks
 *   - Crossfade on period transitions
 *   - User preference controls (§22)
 *   - No autoplay — requires explicit user permission
 *
 * ทำหน้าที่:
 *   1. Integrate EnvironmentContext → get soundscape recommendation
 *   2. Integrate AudioContext → get user audio preferences
 *   3. Manage Web Audio API context + gain nodes
 *   4. Handle ducking (Main Thread → User Input Thread)
 *   5. Expose UI controls (play/pause, volume, info)
 *   6. Crossfade on soundscape transitions
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useEnvironment } from '@/context/EnvironmentContext';
import { useAudio } from '@/context/AudioContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSoundscapeAudioLoader } from '@/hooks/useSoundscapeAudioLoader';
import type { SoundscapeConfig } from '@/lib/experience/SoundscapeEngine';

// NOTE (i18n): soundscape.labelThai / .descriptionThai and timeOfDay.labelThai
// come from SoundscapeEngine.ts / TimeOfDayEngine.ts — genuine Thai-only
// data-layer content (same precedent as InsightEngine / AmbientBadge.tsx).
// Out of scope for a UI-string-level i18n pass.

// ─────────────────────────────────────────────────────────────────────────────

interface AudioNodePool {
  ctx: AudioContext | null;
  mainGain: GainNode | null;
  duckGain: GainNode | null;
  currentSource: AudioBufferSourceNode | null;
  buffers: Map<string, AudioBuffer>; // soundscape ID → cached buffer
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook: manage Web Audio API context + playback
 */
function useSoundscapeAudio(): {
  isInitialized: boolean;
  initAudio: () => void;
  play: (buffer: AudioBuffer) => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  startDucking: () => void;
  stopDucking: () => void;
  pool: AudioNodePool;
} {
  const poolRef = useRef<AudioNodePool>({
    ctx: null,
    mainGain: null,
    duckGain: null,
    currentSource: null,
    buffers: new Map(),
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Web Audio API on first user interaction
  const initAudio = useCallback(() => {
    if (isInitialized) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Main volume control
    const mainGain = ctx.createGain();
    mainGain.connect(ctx.destination);
    mainGain.gain.value = 0.6; // default 60%

    // Ducking control (separate gain node for ducking transitions)
    const duckGain = ctx.createGain();
    duckGain.connect(mainGain);
    duckGain.gain.value = 1.0; // normal, no ducking initially

    poolRef.current = {
      ctx,
      mainGain,
      duckGain,
      currentSource: null,
      buffers: poolRef.current.buffers,
    };

    setIsInitialized(true);
  }, [isInitialized]);

  const play = useCallback(
    (buffer: AudioBuffer) => {
      if (!poolRef.current.ctx || !poolRef.current.duckGain) return;

      // Stop current playback
      if (poolRef.current.currentSource && poolRef.current.ctx) {
        poolRef.current.currentSource.stop(poolRef.current.ctx.currentTime);
      }

      // Create new source
      const source = poolRef.current.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true; // Ambient soundscape loops
      source.connect(poolRef.current.duckGain);
      source.start(0);

      poolRef.current.currentSource = source;
    },
    []
  );

  const stop = useCallback(() => {
    if (poolRef.current.currentSource && poolRef.current.ctx) {
      poolRef.current.currentSource.stop(poolRef.current.ctx.currentTime);
      poolRef.current.currentSource = null;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!poolRef.current.mainGain) return;
    poolRef.current.mainGain.gain.setValueAtTime(
      volume / 100,
      poolRef.current.ctx?.currentTime || 0
    );
  }, []);

  const startDucking = useCallback(() => {
    if (!poolRef.current.duckGain || !poolRef.current.ctx) return;
    // Smooth fade to duck volume (200ms)
    poolRef.current.duckGain.gain.setTargetAtTime(
      0.2, // duck to 20% volume
      poolRef.current.ctx.currentTime,
      0.1 // time constant 100ms
    );
  }, []);

  const stopDucking = useCallback(() => {
    if (!poolRef.current.duckGain || !poolRef.current.ctx) return;
    // Smooth fade back to normal (300ms)
    poolRef.current.duckGain.gain.setTargetAtTime(
      1.0, // return to normal
      poolRef.current.ctx.currentTime,
      0.15 // time constant 150ms
    );
  }, []);

  return {
    isInitialized,
    initAudio: () => initAudio(),
    play: (buffer: AudioBuffer) => play(buffer),
    stop: () => stop(),
    setVolume: (volume: number) => setVolume(volume),
    startDucking: () => startDucking(),
    stopDucking: () => stopDucking(),
    pool: poolRef.current,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

interface SoundscapePlayerProps {
  /** Show minimal UI (compact mode) */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * SoundscapePlayer
 *
 * Main component — manages soundscape playback with full UI controls
 */
export function SoundscapePlayer({ compact = false, className = '' }: SoundscapePlayerProps) {
  const { environment, isTransitioning } = useEnvironment();
  const audio = useAudio();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { isInitialized, initAudio, play, stop, setVolume, startDucking, stopDucking } =
    useSoundscapeAudio();

  const [isPlaying, setIsPlaying] = useState(false);
  const prevSoundscapeRef = useRef<SoundscapeConfig | undefined>(undefined);

  // Audio context for the soundscape synth loader
  const audioContext = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  // SOUNDSCAPE-SYNTH-001: useSoundscapeAudioLoader synthesizes the ambient
  // drone live via Web Audio (no CDN involved any more — see that hook's
  // header for why), so this buffer is the only source now.
  const soundscapeId = environment?.soundscape.id || null;
  const { buffer: soundscapeBuffer, isLoading: isSynthesizing, error: synthError, progress } = useSoundscapeAudioLoader(
    soundscapeId,
    audioContext
  );

  // ─── Sync user audio preferences ───────────────────────────────────────────

  useEffect(() => {
    if (!audio.state.musicEnabled && isPlaying) {
      stop();
      setIsPlaying(false);
    }
  }, [audio.state.musicEnabled, isPlaying, stop]);

  // Sync volume
  useEffect(() => {
    if (isPlaying && isInitialized) {
      setVolume(audio.state.volume);
    }
  }, [audio.state.volume, isPlaying, isInitialized, setVolume]);

  // ─── Sync ducking from AudioContext ───────────────────────────────────────

  useEffect(() => {
    if (!isInitialized || !isPlaying) return;

    if (audio.state.isDucking) {
      startDucking();
    } else {
      stopDucking();
    }
  }, [audio.state.isDucking, isInitialized, isPlaying, startDucking, stopDucking]);

  // ─── Handle soundscape transitions ─────────────────────────────────────────
  // SOUNDSCAPE-SYNTH-001: previously tried a CDN buffer first and fell back
  // to a crude 4-category oscillator sketch (keyed by exact soundscape.id
  // against just 'cosmic'/'ambient'/'energetic'/'minimal', which no real id
  // ever matched — it silently always played the same 3 sine tones for
  // every soundscape). useSoundscapeAudioLoader now synthesizes a properly
  // distinct drone per soundscape id itself, so this just plays whatever it
  // produces once ready.

  useEffect(() => {
    if (!environment || !isPlaying || !soundscapeBuffer) return;

    const { soundscape } = environment;
    if (prevSoundscapeRef.current?.id === soundscape.id) return;

    try {
      play(soundscapeBuffer);
    } catch (_error) {
      // Failed to play audio
    }

    prevSoundscapeRef.current = soundscape;
  }, [environment, isPlaying, play, soundscapeBuffer]);

  // ─── PlayControl ──────────────────────────────────────────────────────────

  const handleTogglePlay = useCallback(() => {
    if (!audio.state.musicEnabled) {
      // Request permission first
      audio.toggleMusic();
      initAudio();
      return;
    }

    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      if (!isInitialized) initAudio();
      // Generate initial soundscape buffer on play
      setIsPlaying(true); // Trigger useEffect to generate + play buffer
    }
  }, [isPlaying, isInitialized, initAudio, stop, audio]);

  if (!environment) return null;

  const { soundscape, timeOfDay } = environment;

  return (
    <div
      className={`soundscape-player ${compact ? 'compact' : ''} ${isTransitioning ? 'transitioning' : ''} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '6px' : '12px',
        padding: compact ? '6px 10px' : '8px 14px',
        borderRadius: '8px',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--env-soundscape-border, var(--color-border))',
        fontSize: compact ? '12px' : '13px',
        color: 'var(--color-text-secondary)',
      }}
      title={soundscape.descriptionThai}
    >
      {/* Play button */}
      <button
        onClick={handleTogglePlay}
        style={{
          border: 'none',
          background: 'transparent',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          padding: '4px',
          fontSize: compact ? '14px' : '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={isPlaying ? (isTh ? 'หยุดชั่วคราว' : 'Pause') : (isTh ? 'เล่น' : 'Play')}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Soundscape info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '11px', opacity: 0.7 }}>
          {timeOfDay.emoji} {timeOfDay.labelThai}
        </span>
        <span style={{ fontWeight: 500, opacity: 0.9 }}>{soundscape.labelThai}</span>
      </div>

      {/* Volume slider */}
      {!compact && isPlaying && (
        <input
          type="range"
          min="0"
          max="100"
          value={audio.state.volume}
          onChange={(e) => audio.setVolume(parseInt(e.target.value))}
          style={{
            width: '80px',
            cursor: 'pointer',
            opacity: 0.7,
          }}
          aria-label="Volume"
        />
      )}

      {/* Loading indicator (synthesizing the ambient drone) */}
      {isSynthesizing && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            opacity: 0.6,
            marginLeft: 'auto',
          }}
        >
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span>
          <span>{progress}%</span>
        </div>
      )}

      {/* Error indicator — synthesis itself failed (rare: e.g. no Web Audio
          support); the loader already falls back to silence in this case. */}
      {synthError && !soundscapeBuffer && (
        <span
          title={synthError.message}
          style={{
            fontSize: '10px',
            opacity: 0.5,
            marginLeft: 'auto',
          }}
        >
          ⚠️ (Silence)
        </span>
      )}

      {/* Status indicator */}
      {isPlaying && !isSynthesizing && soundscapeBuffer && (
        <span
          title="Synthesized ambient drone"
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--color-accent-primary)',
            animation: 'pulse 2s infinite',
            marginLeft: 'auto',
          }}
        />
      )}
    </div>
  );
}

export default SoundscapePlayer;
