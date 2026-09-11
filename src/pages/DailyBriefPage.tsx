/**
 * DailyBriefPage.tsx — /brief
 * Master Direction §25
 *
 * NAVGAP-002 (7 ก.ย. 2026): page had zero navigation — no BackButton, no
 * NavRail/BottomNav — a dead end once a user landed here (e.g. from
 * CoreAwakening's "ไปหน้าหลักก่อน →" exit link, which routes to /brief).
 * BACKBUTTON-001 already documents the "every page needs a way back" rule
 * and BackButton.tsx that implements it; this page just never used it.
 * Same NavRail/BottomNav pattern as Dashboard.tsx.
 */
import { BackButton } from '@/components/common/BackButton';
import { AppShell } from '@/components/layout/AppShell';
import { DailyBrief } from '@/components/features/DailyBrief';
import '@/styles/daily-brief.css';

export default function DailyBriefPage() {
  return (
    <AppShell>
      <div className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
        <main style={{ padding: '2rem 1rem' }}>
          <BackButton fallbackTo="/dashboard" style={{ marginBottom: '1rem' }} />
          <DailyBrief />
        </main>
      </div>
    </AppShell>
  );
}
