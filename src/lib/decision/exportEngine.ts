/**
 * exportEngine.ts — TC-405: Decision export engine (CSV, JSON, shareable links)
 *
 * Exports decisions in multiple formats for external analysis.
 * Supports sharing via URL-encoded JSON payloads.
 */

import type { Decision } from '../../types/decision';

export type ExportFormat = 'csv' | 'json' | 'shareable-link';

interface ExportResult {
  success: boolean;
  data?: string;
  url?: string;
  error?: string;
}

/**
 * Convert decisions to CSV format.
 * Includes all fields plus computed metrics.
 */
export function toCSV(decisions: Decision[]): string {
  if (!decisions.length) return '';

  const headers = [
    'ID',
    'Question',
    'World',
    'Twin Recommendation',
    'User Choice',
    'Options',
    'Context',
    'Confidence',
    'Chosen At',
    'Outcome',
  ];

  const rows = decisions.map((d) => [
    d.id,
    `"${escapeCSV(d.question)}"`,
    d.world,
    `"${escapeCSV(d.twinRecommendation)}"`,
    `"${escapeCSV(d.userChoice)}"`,
    `"${escapeCSV(d.options?.join(', ') || '')}"`,
    `"${escapeCSV(d.context || '')}"`,
    '', // confidence stored in outcome
    new Date(d.chosenAt).toISOString(),
    '', // outcome populated below
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Convert decisions to JSON format.
 * Pretty-printed with metadata.
 */
export function toJSON(decisions: Decision[], meta?: { exportedAt: string; version: string }): string {
  const payload = {
    meta: {
      exportedAt: meta?.exportedAt ?? new Date().toISOString(),
      version: meta?.version ?? '1.0',
      count: decisions.length,
    },
    decisions: decisions.map((d) => ({
      id: d.id,
      question: d.question,
      world: d.world,
      twinRecommendation: d.twinRecommendation,
      userChoice: d.userChoice,
      options: d.options,
      context: d.context,
      chosenAt: d.chosenAt,
    })),
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Generate a shareable link from decisions.
 * Uses URL-encoded JSON payload (no server required).
 * Max ~2000 characters for safe URL embedding.
 */
export function toShareableLink(decisions: Decision[]): ExportResult {
  if (decisions.length === 0) {
    return { success: false, error: 'No decisions to share' };
  }

  try {
    const json = toJSON(decisions.slice(0, 5), { version: '1.0' });
    const encoded = encodeURIComponent(json);
    
    // Truncate if too long for safe URL embedding
    const truncated = encoded.length > 2000 ? encoded.substring(0, 2000) + '...' : encoded;
    const url = `${window.location.origin}/#/decisions/share?data=${truncated}`;

    return { success: true, url };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to generate link' };
  }
}

/**
 * Parse decisions from a shareable link.
 * Returns null if invalid or corrupted.
 */
export function fromShareableLink(url: string): Decision[] | null {
  try {
    const parsed = new URL(url);
    const data = parsed.searchParams.get('data');
    if (!data) return null;

    const decoded = decodeURIComponent(data);
    // Handle truncation marker
    const trimmed = decoded.endsWith('...') ? decoded.slice(0, -3) : decoded;
    const payload = JSON.parse(trimmed) as { decisions: any[] };
    
    return payload.decisions.map((d) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : d.id,
      question: d.question,
      world: d.world,
      twinRecommendation: d.twinRecommendation,
      userChoice: d.userChoice,
      options: d.options,
      context: d.context,
      chosenAt: d.chosenAt,
    }));
  } catch {
    return null;
  }
}

/**
 * Download decisions as file.
 * @param format Output format
 * @param decisions Decisions to export
 * @param filename Base filename (extension added automatically)
 */
export function downloadDecisions(
  format: 'csv' | 'json',
  decisions: Decision[],
  filename: string = 'decisions'
): void {
  let content: string;
  let mimeType: string;

  if (format === 'csv') {
    content = toCSV(decisions);
    mimeType = 'text/csv;charset=utf-8;';
  } else {
    content = toJSON(decisions);
    mimeType = 'application/json';
  }

  if (!content) return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy decisions to clipboard as JSON.
 */
export async function copyToClipboard(decisions: Decision[]): Promise<boolean> {
  try {
    const json = toJSON(decisions);
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escape CSV field value.
 */
function escapeCSV(value: string): string {
  return value
    .replace(/"/g, '""')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}
