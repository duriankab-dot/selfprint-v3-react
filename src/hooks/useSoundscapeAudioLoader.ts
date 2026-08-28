/**
 * useSoundscapeAudioLoader.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 * Sub-feature: CDN Audio Loading + Caching
 *
 * Responsibilities:
 *   1. Fetch audio files from CDN (Cloudinary)
 *   2. Cache in IndexedDB for offline support
 *   3. Provide progress tracking (download %)
 *   4. Handle errors gracefully (fallback to silence)
 *   5. Respect user bandwidth preferences
 *
 * Usage:
 *   const { buffer, isLoading, error } = useSoundscapeAudioLoader('morning-forest');
 *   if (buffer) audioContext.playback(buffer);
 */

import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AudioLoaderState {
  buffer: AudioBuffer | null;
  isLoading: boolean;
  error: Error | null;
  progress: number; // 0-100
  loadedAt: Date | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Primary CDN for soundscape audio
const PRIMARY_CDN_URL = import.meta.env.VITE_SOUNDSCAPE_CDN_URL || 'https://res.cloudinary.com/selfprint/video/upload/soundscapes';
const CACHE_DB_NAME = 'selfprint-audio-cache';
const CACHE_STORE_NAME = 'soundscapes';
const CACHE_TTL_DAYS = 30;

// Soundscape registry — map world IDs to available sources
// Each of the 12 Intelligence Worlds has a unique soundscape
const SOUNDSCAPE_SOURCES: Record<string, { primary: string }> = {
  // Generic ambient soundscapes (fallback)
  'morning-forest': { primary: 'morning-forest.mp3' },
  'afternoon-calm': { primary: 'afternoon-calm.mp3' },
  'evening-breeze': { primary: 'evening-breeze.mp3' },
  'night-ambient': { primary: 'night-ambient.mp3' },
  'rain-sounds': { primary: 'rain-sounds.mp3' },
  'ocean-waves': { primary: 'ocean-waves.mp3' },

  // 12 Intelligence Worlds soundscapes
  'self': { primary: 'self-world.mp3' },
  'mind': { primary: 'mind-world.mp3' },
  'relationship': { primary: 'relationship-world.mp3' },
  'love': { primary: 'love-world.mp3' },
  'career': { primary: 'career-world.mp3' },
  'wealth': { primary: 'wealth-world.mp3' },
  'life': { primary: 'life-world.mp3' },
  'growth': { primary: 'growth-world.mp3' },
  'decision': { primary: 'decision-world.mp3' },
  'purpose': { primary: 'purpose-world.mp3' },
  'wellbeing': { primary: 'wellbeing-world.mp3' },
  'future': { primary: 'future-world.mp3' },

  // CF-PAGES-MIGRATION-001 follow-up (production QA, 2026-08-28): the 21
  // mood-based soundscape ids defined in SoundscapeEngine.ts's
  // SOUNDSCAPE_LIBRARY (morning-focus, deep-work, spiritual-evening,
  // celebration, etc.) never had an entry here. Without one, this file
  // falls back to guessing `${id}.mp3` (see below), which doesn't exist
  // on Cloudinary -- confirmed live: every one of these 404'd, e.g.
  // GET .../soundscapes/spiritual-evening.mp3 404. Until the real,
  // dedicated files are uploaded, point each missing id at whichever of
  // the 3 confirmed-working generic tracks best matches its
  // matchPeriods/audioCharacter, so at least *something* plays instead
  // of silence. Swap these for real per-mood files as they're uploaded.
  'morning-focus': { primary: 'morning-forest.mp3' },
  'morning-gentle': { primary: 'morning-forest.mp3' },
  'deep-work': { primary: 'afternoon-calm.mp3' },
  'afternoon-creative': { primary: 'afternoon-calm.mp3' },
  'discovery-mode': { primary: 'afternoon-calm.mp3' },
  'evening-reflection': { primary: 'night-ambient.mp3' },
  'relationship-evening': { primary: 'night-ambient.mp3' },
  'evening-release': { primary: 'night-ambient.mp3' },
  'spiritual-evening': { primary: 'night-ambient.mp3' },
  'night-focus': { primary: 'night-ambient.mp3' },
  'night-identity': { primary: 'night-ambient.mp3' },
  'night-wind-down': { primary: 'night-ambient.mp3' },
  'celebration': { primary: 'afternoon-calm.mp3' },
  'health-nature': { primary: 'morning-forest.mp3' },
  'money-clarity': { primary: 'afternoon-calm.mp3' },
  'creativity-flow': { primary: 'afternoon-calm.mp3' },
  'ambient-minimal': { primary: 'morning-forest.mp3' },
  'deep-reflection-universal': { primary: 'night-ambient.mp3' },
};

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

// ─── Audio Loading ────────────────────────────────────────────────────────────

async function tryFetchFromUrl(url: string, audioContext: AudioContext, onProgress?: (progress: number) => void): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      console.warn(`[useSoundscapeAudioLoader] CDN returned ${response.status}: ${url}`);
      return null;
    }

    const contentLength = response.headers.get('content-length');
    if (!contentLength) {
      const arrayBuffer = await response.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer);
    }

    const total = parseInt(contentLength, 10);
    let loaded = 0;
    const reader = response.body?.getReader();
    if (!reader) return null;

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      onProgress?.(Math.round((loaded / total) * 100));
    }

    const arrayBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      arrayBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    return await audioContext.decodeAudioData(arrayBuffer.buffer);
  } catch (err) {
    console.warn(`[useSoundscapeAudioLoader] Failed to fetch from ${url}:`, err);
    return null;
  }
}

async function fetchAudioBuffer(
  soundscapeId: string,
  audioContext: AudioContext,
  onProgress?: (progress: number) => void
): Promise<AudioBuffer> {
  // Try cache first
  const cached = await getCachedAudio(soundscapeId);
  if (cached) {
    console.log(`[useSoundscapeAudioLoader] Using cached audio: ${soundscapeId}`);
    return cached.buffer;
  }

  // Try primary CDN
  const filename = SOUNDSCAPE_SOURCES[soundscapeId]?.primary || `${soundscapeId}.mp3`;
  const primaryUrl = `${PRIMARY_CDN_URL}/${filename}`;
  console.log(`[useSoundscapeAudioLoader] Fetching from primary CDN: ${primaryUrl}`);

  const buffer = await tryFetchFromUrl(primaryUrl, audioContext, onProgress);
  if (buffer) {
    await saveCachedAudio(soundscapeId, buffer);
    return buffer;
  }

  // Primary CDN failed — throw to trigger fallback silence
  console.error(`[useSoundscapeAudioLoader] CDN failed for ${soundscapeId}`);
  throw new Error(`Could not load soundscape: ${soundscapeId}`);
}

// ─── Fallback: Synthesize audio if CDN fails ──────────────────────────────────

function synthesizeFallbackAudio(soundscapeId: string, audioContext: AudioContext): AudioBuffer {
  // Generate a 30-second silent buffer as fallback
  // (Components can show loading indicator and user can skip)
  const sampleRate = audioContext.sampleRate;
  const duration = 30; // seconds
  const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);

  console.warn(`[useSoundscapeAudioLoader] Using fallback silence for: ${soundscapeId}`);
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

        const buffer = await fetchAudioBuffer(soundscapeId, audioContext, (progress) => {
          if (isMounted) {
            setState((prev) => ({ ...prev, progress }));
          }
        });

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
        console.error(`[useSoundscapeAudioLoader] Error loading ${soundscapeId}:`, err);

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
