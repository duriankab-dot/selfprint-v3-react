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

const CDN_URL = import.meta.env.VITE_SOUNDSCAPE_CDN_URL || 'https://res.cloudinary.com/selfprint/video/upload/soundscapes';
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

// ─── Audio Loading ────────────────────────────────────────────────────────────

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

  // Fetch from CDN
  const url = `${CDN_URL}/${soundscapeId}.mp3`;
  console.log(`[useSoundscapeAudioLoader] Fetching from CDN: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch soundscape: ${response.statusText}`);
  }

  // Handle download progress
  const contentLength = response.headers.get('content-length');
  if (!contentLength) {
    // No progress info, just read
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    await saveCachedAudio(soundscapeId, buffer);
    return buffer;
  }

  // Stream with progress tracking
  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body unavailable');

  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;
    const progress = Math.round((loaded / total) * 100);
    onProgress?.(progress);
  }

  const arrayBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    arrayBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  const buffer = await audioContext.decodeAudioData(arrayBuffer.buffer);
  await saveCachedAudio(soundscapeId, buffer);
  return buffer;
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
