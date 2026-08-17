/**
 * 👥 TwinProfilePage.tsx — /twin
 *
 * AI Twin Profile — Accuracy, Evolution, Stats
 *
 * Shows:
 * - Twin accuracy % + trend
 * - Evolution timeline (progress over time)
 * - Twin stats (insights count, feedback given, patterns found)
 * - Recent feedback history
 * - Twin confidence badge
 */

import { TwinProfile } from '@/components/features/TwinProfile';
import '@/styles/twin-profile.css';

export default function TwinProfilePage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <TwinProfile />
    </main>
  );
}
