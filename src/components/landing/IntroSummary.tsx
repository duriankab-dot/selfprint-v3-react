/**
 * IntroSummary.tsx
 *
 * 3-paragraph introductory article about the user's core identity.
 * Generated from Life Path profile + disciplines data.
 *
 * Structure:
 *   Paragraph 1 (The Hook): Core identity greeting
 *   Paragraph 2 (The Deep Dive): Decision style + key insight
 *   Paragraph 3 (The Bridge): Growth opportunity + scroll prompt
 */

import { useLanguage } from '@/context/LanguageContext';
import type { InitialDisciplines } from '@/lib/astrology.js';
import type { AnalysisResponse } from '@/lib/types/astrovera.js';

interface IntroSummaryProps {
  disciplines: InitialDisciplines;
  analysis: AnalysisResponse;
}

export default function IntroSummary({ disciplines, analysis }: IntroSummaryProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const coreIdentity = disciplines.prototypeCore || 'Explorer';
  const decisionStyle = analysis.decisionStyle || '';
  const insight1 = analysis.insights?.[0] || '';
  const insight2 = analysis.opportunities?.[0] || '';

  // ─── Thai copy ──────────────────────────────────────────────────────────────

  const thContent = isTh ? generateThaiIntro(coreIdentity, decisionStyle, insight1, insight2) : null;

  if (isTh && thContent) {
    return (
      <section
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: 'clamp(24px, 4vw, 40px)',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--color-accent-primary)',
            marginBottom: '16px',
            lineHeight: 1.4,
          }}
        >
          จิตวิญญาณแห่ง {coreIdentity} ในตัวคุณ
        </h3>
        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.9 }}>
          {thContent.paragraphs.map((p, i) => (
            <p key={i} style={{ margin: '0 0 16px 0' }}>{p}</p>
          ))}
        </div>
      </section>
    );
  }

  // ─── English content ────────────────────────────────────────────────────────

  return (
    <section
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: 'clamp(24px, 4vw, 40px)',
      }}
    >
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--color-accent-primary)',
          marginBottom: '16px',
          lineHeight: 1.4,
        }}
      >
        The Spirit of {coreIdentity} Within You
      </h3>
      <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.9 }}>
        <p style={{ margin: '0 0 16px 0' }}>
          {generateEnglishIntro(coreIdentity, decisionStyle, insight1, insight2).paragraphs.map((p, i) => (
            <span key={i}>{p}{i < 2 ? '\n\n' : ''}</span>
          ))}
        </p>
      </div>
    </section>
  );
}

// ─── Content generators ───────────────────────────────────────────────────────

function generateThaiIntro(identity: string, decision: string, insight1: string, insight2: string): { paragraphs: string[] } {
  return {
    paragraphs: [
      `ยินดีต้อนรับสู่โลกของ ${identity} — จิตวิญญาณแห่งการค้นพบและสร้างสรรค์ที่ไม่เคยหยุดนิ่ง คุณเป็นคนที่มีเอกลักษณ์เฉพาะตัว ซึ่งมองเห็นโอกาสที่คนอื่นมองข้าม และกล้าที่จะลงมือทำในสิ่งที่ยืนยันว่าตัวเองพร้อม`,
      `ในฐานะ ${decision} คุณมีวิธีคิดที่ลึกซึ้งและการตัดสินใจที่ผ่านการวิเคราะห์มาอย่างดี ${insight1}`,
      `${insight2} ลองเลื่อนลงไปอ่านรายละเอียดด้านล่างเพื่อทำความเข้าใจตัวตนของคุณในมุมมองที่ลึกซึ้งยิ่งขึ้น`,
    ],
  };
}

function generateEnglishIntro(identity: string, decision: string, insight1: string, insight2: string): { paragraphs: string[] } {
  return {
    paragraphs: [
      `Welcome to the world of ${identity} — a spirit of discovery and creation that never stops. You possess a unique identity that sees opportunities others overlook, and you have the courage to act on what tells you you're ready.`,
      `As a ${decision}, you think deeply and make well-analyzed decisions. ${insight1}`,
      `${insight2}. Scroll down to explore your identity in even greater depth.`,
    ],
  };
}
