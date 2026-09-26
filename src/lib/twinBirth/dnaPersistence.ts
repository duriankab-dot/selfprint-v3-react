/**
 * dnaPersistence.ts — TC-402: DNA state persistence for Twin Birth
 *
 * Wraps twinVisualDNA persistence with additional birth-specific metadata.
 * Survives page reload and tab restore.
 */

import { loadTwinDNA as loadRawDNA, saveTwinDNA as saveRawDNA, type TwinVisualDNA } from '@/lib/twinVisualDNA';

const DNA_METADATA_KEY = 'sp_twin_dna_metadata';

export interface DNAMetadata {
  version: number;
  createdAt: string;
  userId: string | null;
  twinId: string | null;
  lastUpdated: string;
}

interface StoredDNAWithMeta {
  dna: TwinVisualDNA;
  meta: DNAMetadata;
}

/**
 * Load DNA with its metadata. Returns null if not found.
 */
export function loadDNAMetadata(): StoredDNAWithMeta | null {
  try {
    const raw = localStorage.getItem(DNA_METADATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDNAWithMeta;
  } catch {
    return null;
  }
}

/**
 * Save DNA along with creation/update timestamp and twin linkage.
 */
export function saveDNAMetadata(dna: TwinVisualDNA, meta: Partial<DNAMetadata>): void {
  try {
    const existing = loadDNAMetadata();
    const fullMeta: DNAMetadata = {
      version: dna.version ?? 1,
      createdAt: existing?.meta.createdAt ?? new Date().toISOString(),
      userId: meta.userId ?? existing?.meta.userId ?? null,
      twinId: meta.twinId ?? existing?.meta.twinId ?? null,
      lastUpdated: new Date().toISOString(),
      ...existing?.meta,
      ...meta,
    };

    saveRawDNA(dna);
    localStorage.setItem(DNA_METADATA_KEY, JSON.stringify({ dna, meta: fullMeta }));
  } catch {
    // non-fatal
  }
}

/**
 * Upgrade DNA from v1 → v2 or v2 → v3 based on evolution triggers.
 */
export function upgradeDNAIfNeeded(dna: TwinVisualDNA | null, trigger: 'sice' | 'decision' | 'manual'): TwinVisualDNA | null {
  if (!dna) return null;

  if (dna.version < 2 && trigger === 'sice') {
    // Vite dynamic import to avoid pulling SICE into entry bundle
    return import('@/lib/twinVisualDNA').then(m => m.upgradeTwinDNA(dna)).catch(() => dna);
  }

  if (dna.version < 3 && trigger === 'decision') {
    return import('@/lib/twinVisualDNA').then(m => m.upgradeTwinDNA(dna)).catch(() => dna);
  }

  return dna;
}
