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
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLanguage } from '@/context/LanguageContext';
import '@/styles/daily-brief.css';
// TC-211: Speakable WebPage — voice-assistant readable brief (AEO)
import { dailyBriefSpeakableWebPage } from '@/lib/aeoSchemas';

export default function DailyBriefPage() {
  const { language } = useLanguage();
  const lang = (language === 'th' ? 'th' : 'en') as 'th' | 'en';

  return (
    <AppShell>
      <MetaTagManager
        title={lang === 'th' ? 'สรุปประจำวันของคุณ — SELFPRINT' : 'Your Daily Brief — SELFPRINT'}
        description={lang === 'th'
          ? 'สรุปสิ่งสำคัญของวันนี้จาก Twin ของคุณ อ่านได้ทั้งตาและเสียง พร้อมหลักฐานอ้างอิงได้'
          : 'Your Twin\'s daily brief — readable and speakable, every insight backed by evidence.'}
        canonicalUrl={`/${lang}/brief`}
        additionalScripts={[
          // TC-211: Speakable selectors anchor to the brief headline/insight nodes
          {
            type: 'application/ld+json',
            content: JSON.stringify(dailyBriefSpeakableWebPage(
              lang === 'th' ? 'th-TH' : 'en-US',
              `https://selfprint.one/${lang}/brief`,
            )),
          },
        ]}
      />
      <div className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
        <main style={{ padding: '2rem 1rem' }}>
          <BackButton fallbackTo="/dashboard" style={{ marginBottom: '1rem' }} />
          <DailyBrief />
        </main>
      </div>
    </AppShell>
  );
}
