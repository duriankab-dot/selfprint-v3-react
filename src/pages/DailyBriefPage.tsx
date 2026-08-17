/**
 * DailyBriefPage.tsx — /brief
 * Master Direction §25
 */
import { DailyBrief } from '@/components/features/DailyBrief';
import '@/styles/daily-brief.css';

export default function DailyBriefPage() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1rem' }}>
      <DailyBrief />
    </main>
  );
}
