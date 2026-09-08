/**
 * useSoundscapeAudioLoader.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 * Sub-feature: Ambient Soundscape Audio
 *
 * Responsibilities:
 *   1. Load real MP3 files from public/audio/{category}/ (priority)
 *   2. Fallback to Web Audio API synthesis if MP3 unavailable
 *   3. Cache the rendered buffer in IndexedDB so repeat plays don't re-fetch
 *   4. Provide loading state
 *   5. Handle errors gracefully (fallback to silence)
 *
 * SOUNDSCAPE-SYNTH-001 (8 ก.ย. 2026): Previously synthesized all audio via
 * Web Audio API because CDN files never existed. Now loads real CC0 MP3s from
 * public/audio/soundscapes/ and public/audio/environment/ first, falling back
 * to synthesis only when no file is found. The soundscape-manifest.json has
 * been rewritten to match the actual 79 CC0 MP3 files downloaded by the user.
 *
 * Usage:
 *   const { buffer, isLoading, error } = useSoundscapeAudioLoader('morning-forest', audioContext);
 *   if (buffer) audioContext.playback(buffer);
 */

import { useEffect, useRef, useState } from 'react';
import { synthesizeSoundscapeBuffer } from '@/lib/audio/synthesizeAmbientDrone';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AudioLoaderState {
  buffer: AudioBuffer | null;
  isLoading: boolean;
  error: Error | null;
  progress: number; // 0-100
  loadedAt: Date | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_DB_NAME = 'selfprint-audio-cache';
const CACHE_STORE_NAME = 'soundscapes';
const CACHE_TTL_DAYS = 30;

// ─── IndexedDB Initialization ──────────────────────────────────────────────────

async function initAudioCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CACHE_DB_NAME, 1);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'soundscapeId' });
      }
    };
  });
}

// AUDIOCACHE-DATACLONE-001 FIX: an AudioBuffer is a live Web Audio API
// object — it is NOT in the structured-clone algorithm's list of
// cloneable types, so `store.put({ buffer: someAudioBuffer })` always
// threw "DataCloneError: AudioBuffer object could not be cloned" and the
// catch in saveCachedAudio() silently swallowed it. Net effect: caching
// never worked, every play re-synthesized, and any caller that awaited
// the write (there weren't any, but it was one `await` away from crashing
// the whole load) would have broken outright. Fix: store the buffer as
// its raw per-channel Float32Array data (which IS cloneable) plus the
// numbers needed to rebuild it, and reconstruct a real AudioBuffer with
// audioContext.createBuffer() on read.
interface SerializedAudioBuffer {
  sampleRate: number;
  length: number;
  numberOfChannels: number;
  channelData: Float32Array<ArrayBuffer>[];
}

function serializeAudioBuffer(buffer: AudioBuffer): SerializedAudioBuffer {
  const channelData: Float32Array<ArrayBuffer>[] = [];
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    // `new Float32Array(source)` copies the data out of the live buffer
    // (so the stored array isn't tied to the original AudioBuffer's
    // memory) and backs it with a plain ArrayBuffer, which TS's DOM lib
    // requires for AudioBuffer.copyToChannel() on read.
    channelData.push(new Float32Array(buffer.getChannelData(ch)));
  }
  return {
    sampleRate: buffer.sampleRate,
    length: buffer.length,
    numberOfChannels: buffer.numberOfChannels,
    channelData,
  };
}

function deserializeAudioBuffer(data: SerializedAudioBuffer, audioContext: AudioContext): AudioBuffer {
  const buffer = audioContext.createBuffer(data.numberOfChannels, data.length, data.sampleRate);
  for (let ch = 0; ch < data.numberOfChannels; ch++) {
    buffer.copyToChannel(data.channelData[ch], ch);
  }
  return buffer;
}

async function getCachedAudio(soundscapeId: string, audioContext: AudioContext): Promise<{ buffer: AudioBuffer; loadedAt: Date } | null> {
  try {
    const db = await initAudioCache();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, 'readonly');
      const store = tx.objectStore(CACHE_STORE_NAME);
      const req = store.get(soundscapeId);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const result = req.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache expired
        const loadedAt = new Date(result.loadedAt);
        const now = new Date();
        const daysSinceCache = (now.getTime() - loadedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceCache > CACHE_TTL_DAYS) {
          // Expired, delete
          store.delete(soundscapeId);
          resolve(null);
        } else {
          resolve({ buffer: deserializeAudioBuffer(result.buffer, audioContext), loadedAt });
        }
      };
    });
  } catch (err) {
    console.warn('[useSoundscapeAudioLoader] Cache read failed:', err);
    return null;
  }
}

async function saveCachedAudio(soundscapeId: string, buffer: AudioBuffer): Promise<void> {
  try {
    const db = await initAudioCache();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CACHE_STORE_NAME);
      const req = store.put({
        soundscapeId,
        buffer: serializeAudioBuffer(buffer),
        loadedAt: new Date().toISOString(),
      });

      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  } catch (err) {
    console.warn('[useSoundscapeAudioLoader] Cache write failed:', err);
  }
}

// ─── Audio Generation ──────────────────────────────────────────────────────────

/** Map soundscape IDs to real MP3 files in public/audio/soundscapes/ */
const SOUNDSCAPE_TO_MP3: Record<string, string[]> = {
  'morning-forest': ['/audio/environment/mixkit-morning-birds-2472.mp3', '/audio/environment/mixkit-morning-sound-in-a-garden-2464.mp3'],
  'morning-focus': ['/audio/soundscapes/mixkit-futuristic-sci-fi-computer-ambience-2507.mp3', '/audio/soundscapes/mixkit-space-void-ambiance-2006.mp3'],
  'morning-gentle': ['/audio/environment/mixkit-calm-park-with-people-and-children-367.mp3', '/audio/ui/mixkit-fairy-glitter-867.mp3'],
  'deep-work': ['/audio/soundscapes/mixkit-bass-rumble-hum-2297.mp3', '/audio/soundscapes/mixkit-wind-blowing-ambience-2658.mp3'],
  'afternoon-creative': ['/audio/soundscapes/mixkit-space-soundscape-653.mp3', '/audio/soundscapes/mixkit-cinematic-mystery-heartbeat-transition-492.mp3'],
  'afternoon-calm': ['/audio/soundscapes/mixkit-slow-heartbeat-494.mp3', '/audio/environment/mixkit-whistling-stadium-crowd-436.mp3'],
  'discovery-mode': ['/audio/soundscapes/mixkit-space-void-ambiance-2006.mp3', '/audio/soundscapes/mixkit-space-soundscape-653.mp3'],
  'evening-reflection': ['/audio/ui/mixkit-little-piano-game-over-1944.mp3', '/audio/ui/mixkit-piano-falling-effect-408.mp3'],
  'relationship-evening': ['/audio/ui/mixkit-magic-notification-ring-2344.mp3', '/audio/ui/mixkit-magic-wand-sparkle-3062.mp3'],
  'evening-release': ['/audio/soundscapes/mixkit-human-single-heart-beat-490.mp3', '/audio/soundscapes/mixkit-heartbeat-medium-speed-495.mp3'],
  'spiritual-evening': ['/audio/soundscapes/mixkit-wind-blowing-ambience-2658.mp3', '/audio/environment/mixkit-morning-sound-in-a-garden-2464.mp3'],
  'night-ambient': ['/audio/soundscapes/mixkit-slow-heartbeat-494.mp3', '/audio/soundscapes/mixkit-space-void-ambiance-2006.mp3'],
  'night-focus': ['/audio/soundscapes/mixkit-futuristic-sci-fi-computer-ambience-2507.mp3', '/audio/soundscapes/mixkit-bass-rumble-hum-2297.mp3'],
  'night-identity': ['/audio/soundscapes/mixkit-space-soundscape-653.mp3', '/audio/soundscapes/mixkit-space-void-ambiance-2006.mp3'],
  'night-wind-down': ['/audio/soundscapes/mixkit-slow-heartbeat-494.mp3', '/audio/soundscapes/mixkit-human-single-heart-beat-490.mp3'],
  'celebration': ['/audio/ui/mixkit-game-level-completed-2059.mp3', '/audio/ui/mixkit-magic-notification-ring-2344.mp3'],
  'health-nature': ['/audio/environment/mixkit-morning-birds-2472.mp3', '/audio/environment/mixkit-morning-sound-in-a-garden-2464.mp3'],
  'money-clarity': ['/audio/soundscapes/mixkit-futuristic-sci-fi-computer-ambience-2507.mp3', '/audio/soundscapes/mixkit-space-void-ambiance-2006.mp3'],
  'creativity-flow': ['/audio/soundscapes/mixkit-space-soundscape-653.mp3', '/audio/soundscapes/mixkit-cinematic-mystery-heartbeat-transition-492.mp3'],
  'ambient-minimal': ['/audio/soundscapes/mixkit-space-void-ambiance-2006.mp3'],
  'deep-reflection-universal': ['/audio/soundscapes/mixkit-wind-blowing-ambience-2658.mp3', '/audio/soundscapes/mixkit-slow-heartbeat-494.mp3'],
};

async function loadAudioFromMP3(url: string, audioContext: AudioContext): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch {
    return null;
  }
}

async function fetchAudioBuffer(soundscapeId: string, audioContext: AudioContext): Promise<AudioBuffer> {
  // Try cache first — loading from disk is cheap but not free, no reason to redo it
  // every play.
  const cached = await getCachedAudio(soundscapeId, audioContext);
  if (cached) {
    console.log(`[useSoundscapeAudioLoader] Using cached audio: ${soundscapeId}`);
    return cached.buffer;
  }

  // Priority 1: Load real MP3 file from public/audio/
  const mp3Urls = SOUNDSCAPE_TO_MP3[soundscapeId];
  if (mp3Urls && mp3Urls.length > 0) {
    for (const url of mp3Urls) {
      const buffer = await loadAudioFromMP3(url, audioContext);
      if (buffer) {
        console.log(`[useSoundscapeAudioLoader] Loaded MP3: ${url}`);
        await saveCachedAudio(soundscapeId, buffer);
        return buffer;
      }
    }
  }

  // Fallback: synthesize ambient drone via Web Audio API
  console.log(`[useSoundscapeAudioLoader] Synthesizing ambient drone: ${soundscapeId}`);
  const buffer = await synthesizeSoundscapeBuffer(soundscapeId, audioContext);
  await saveCachedAudio(soundscapeId, buffer);
  return buffer;
}

// ─── Fallback: silence if Web Audio synthesis itself fails ────────────────────

function synthesizeFallbackAudio(soundscapeId: string, audioContext: AudioContext): AudioBuffer {
  // Generate a 30-second silent buffer as fallback
  // (Components can show loading indicator and user can skip)
  const sampleRate = audioContext.sampleRate;
  const duration = 30; // seconds
  const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);

  console.warn(`[useSoundscapeAudioLoader] Drone synthesis failed, using silence for: ${soundscapeId}`);
  return buffer;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSoundscapeAudioLoader(soundscapeId: string | null, audioContext: AudioContext | null): AudioLoaderState {
  const [state, setState] = useState<AudioLoaderState>({
    buffer: null,
    isLoading: false,
    error: null,
    progress: 0,
    loadedAt: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!soundscapeId || !audioContext) {
      setState({ buffer: null, isLoading: false, error: null, progress: 0, loadedAt: null });
      return;
    }

    let isMounted = true;

    (async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null, progress: 0 }));

      try {
        abortRef.current = new AbortController();

        const buffer = await fetchAudioBuffer(soundscapeId, audioContext);

        if (isMounted) {
          setState({
            buffer,
            isLoading: false,
            error: null,
            progress: 100,
            loadedAt: new Date(),
          });
        }
      } catch (err) {
        console.error(`[useSoundscapeAudioLoader] Error synthesizing ${soundscapeId}:`, err);

        if (isMounted) {
          // Use fallback silence instead of null
          const fallbackBuffer = synthesizeFallbackAudio(soundscapeId, audioContext);

          setState({
            buffer: fallbackBuffer,
            isLoading: false,
            error: err instanceof Error ? err : new Error('Unknown error'),
            progress: 0,
            loadedAt: new Date(),
          });
        }
      }
    })();

    return () => {
      isMounted = false;
      abortRef.current?.abort();
    };
  }, [soundscapeId, audioContext]);

  return state;
}

export default useSoundscapeAudioLoader;
