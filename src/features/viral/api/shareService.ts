// Real share-link service — talks to /api/share (backed by
// selfprint.share_links + selfprint.blueprints in Supabase).

export async function generateShareLink(accessToken: string): Promise<string> {
  const res = await fetch('/api/share', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate share link (${res.status})`);
  }

  const data = await res.json();
  return `${window.location.origin}/share/${data.code}`;
}

export interface PairPreview {
  found: boolean;
  accuracyLevel?: number;
  decisionStyle?: string;
}

export async function getPairAnalysis(code: string): Promise<PairPreview | null> {
  try {
    const res = await fetch(`/api/share?code=${encodeURIComponent(code)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
