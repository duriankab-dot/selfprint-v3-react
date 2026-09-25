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
import { AppShell } from '@/components/layout/AppShell';
import '@/styles/twin-profile.css';
// TC-107: DNA avatar — flag-gated (VITE_FEATURE_LIVING_DIAGRAM)
import { isFeatureEnabled } from '@/lib/featureFlags';
import TwinDNAAvatar from '@/components/living/TwinDNAAvatar';
import { loadTwinDNA } from '@/lib/twinVisualDNA';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@/context/AuthContext';

/**
 * TC-107 DNAAvatarStrip — deterministic DNA avatar rendered above TwinProfile
 * when the LIVING_DIAGRAM flag is on and persisted DNA exists. Non-DNA users
 * (no stored DNA) see nothing — zero behavior change when the flag is off.
 */
function DNAAvatarStrip() {
  const dna = loadTwinDNA();
  const profile = useUserStore((s) => s.profile);
  const { session } = useAuth();
  if (!dna || !profile.birthDate) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 0 20px',
      }}
      data-testid="twin-dna-strip"
    >
      <TwinDNAAvatar
        dna={dna}
        size={64}
        label={session?.user?.id ? 'AI Twin avatar' : 'AI Twin avatar'}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Twin DNA · v{dna.version}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          seed {dna.seed.slice(0, 8)} · {dna.headShape} · dominant {dna.dominantSICE}
        </span>
      </div>
    </div>
  );
}

export default function TwinProfilePage() {
  const showDna = isFeatureEnabled('LIVING_DIAGRAM');
  return (
    <AppShell>
      <div className="page-content">
      {/* APPSHELL-004: Twin app-space sub-nav — this page is "What Twin
          Knows" (accuracy, evolution, insights, patterns found). */}
      <TwinNav currentTab="knows" />
      <main className="page-content" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', width: '100%' }}>
        {showDna && <DNAAvatarStrip />}
        <TwinProfile />
      </main>
      </div>
    </AppShell>
  );
}
