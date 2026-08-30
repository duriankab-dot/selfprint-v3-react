/**
 * useSoundscapeAudioLoader.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 * Sub-feature: Ambient Soundscape Audio
 *
 * Responsibilities:
 *   1. Synthesize a soundscape's ambient drone live via the Web Audio API
 *      (see src/lib/audio/synthesizeAmbientDrone.ts)
 *   2. Cache the rendered buffer in IndexedDB so repeat plays don't re-render
 *   3. Provide loading state
 *   4. Handle errors gracefully (fallback to silence)
 *
 * SOUNDSCAPE-SYNTH-001 (2026-08-30): this used to fetch MP3s from a
 * Cloudinary CDN (`res.cloudinary.com/selfprint/video/upload/soundscapes`).
 * That folder was never actually populated with real audio — confirmed
 * live, every track 404s, including the ones previously assumed "known
 * working" — public/soundscape-manifest.json is a setup template that says
 * outright "Replace CLOUDINARY_URL...", "Upload all 20 MP3 files", which
 * never happened. Per product decision, this no longer depends on any CDN
 * at all: every soundscape is generated procedurally in the browser instead.
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

async function getCachedAudio(soundscapeId: string): Promise<{ buffer: AudioBuffer; loadedAt: Date } | null> {
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
          resolve({ buffer: result.buffer, loadedAt });
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
        buffer,
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

async function fetchAudioBuffer(soundscapeId: string, audioContext: AudioContext): Promise<AudioBuffer> {
  // Try cache first — synthesis is cheap but not free, no reason to redo it
  // every play.
  const cached = await getCachedAudio(soundscapeId);
  if (cached) {
    console.log(`[useSoundscapeAudioLoader] Using cached synthesized audio: ${soundscapeId}`);
    return cached.buffer;
  }

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
