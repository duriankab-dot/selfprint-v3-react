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
import { TwinNav } from '@/components/twin/TwinNav';
import { NavRail } from '@/components/layout/NavRail';
import '@/styles/twin-profile.css';

export default function TwinProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavRail />
      {/* APPSHELL-004: Twin app-space sub-nav — this page is "What Twin
          Knows" (accuracy, evolution, insights, patterns found). */}
      <TwinNav currentTab="knows" />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', width: '100%' }}>
        <TwinProfile />
      </main>
    </div>
  );
}
