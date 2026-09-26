/**
 * MemoryInsightsPage.tsx — TC-503: Memory Insights page
 *
 * Route: /memory-insights (protected)
 *
 * Full-page memory exploration with search, filter, relevance scoring,
 * and context injection preview.
 */

import { MemoryInsightsPage as MemoryInsightsComponent } from '@/components/memory/MemoryInsights';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

export default function MemoryInsightsPage() {
  const { session } = useAuth();

  if (!session?.user?.id) {
    return (
      <AppShell>
        <div className="page-content" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Not authenticated</p>
        </div>
      </AppShell>
    );
  }

  return <MemoryInsightsComponent />;
}