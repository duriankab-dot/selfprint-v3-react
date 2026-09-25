// src/lib/hash.ts
// Deterministic hash functions for Twin DNA generation

/**
 * Mulberry32 - fast, good quality PRNG
 * Returns a function that generates random numbers [0, 1)
 */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simple string hash -> 32-bit unsigned integer
 * Deterministic across runs
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit signed int
  }
  return hash >>> 0; // Convert to unsigned
}

/**
 * Generate a seed string from birth input + userId
 */
export function createSeedString(dob: string, time: string | undefined, place: string | undefined, userId: string): string {
  return `${dob}|${time ?? ''}|${place ?? ''}|${userId}`;
}