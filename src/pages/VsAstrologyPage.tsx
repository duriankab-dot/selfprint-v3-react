/**
 * VsAstrologyPage.tsx
 * Bridge content page: SELFPRINT vs Astrology/ดูดวง
 *
 * Target segment: Horoscope-curious users who land from "AI ดูดวง" / fortune-telling queries
 * Trojan Horse strategy: meet their intent → redirect to behavioral science
 * Route: /th/vs-astrology, /en/vs-astrology
 */

import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NavRail } from '@/components/layout/NavRail';
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLanguage } from '@/context/LanguageContext';
import { useLangNavigate } from '@/hooks/useLangNavigate';

// ─── Comparison table data ───────────────────────────────────────────────────

type LangKey = 'th' | 'en';

const COPY: Record<LangKey, {
  title: string;
  badge: string;
  hero: string;
  heroSub: string;
  meta: { title: string; desc: string };
  cta: string;
  sections: { q: string; astrology: string; selfprint: string }[];
  closing: string;
}> = {
  th: {
    meta: {
      title: 'SELFPRINT vs ดูดวง AI — ต่างกันอย่างไร? | SELFPRINT',
      desc: 'ดูดวง AI กับ SELFPRINT ต่างกันอย่างไร? SELFPRINT ใช้สถิติพฤติกรรมจริง ไม่ใช่โชคชะตา — แม่นกว่าเพราะเรียนรู้จากคุณจริงๆ',
    },
    badge: 'ต่างกันอย่างไร?',
    title: 'SELFPRINT vs Co-Star, ดูดวง AI — ตัดสินใจอย่างไร?',
    hero: 'ถ้าคุณมาที่นี่เพราะคิดว่า Co-Star หรือ "ดูดวง AI" เป็นคำตอบ\nคุณกำลังจะได้รับสิ่งที่ดีกว่ามาก',
    heroSub: 'SELFPRINT ไม่ใช่ดูดวง ไม่ใช่ horoscope AI เหมือน Co-Star — แต่ตอบคำถามเดียวกัน:\n"ฉันเป็นคนแบบไหน? ควรทำอะไรต่อไป?" — แต่ตรงมากขึ้น',
    sections: [
      {
        q: 'ข้อมูลที่ใช้วิเคราะห์',
        astrology: 'ตำแหน่งดาว ณ วันเกิด — ข้อมูลเดียวกันสำหรับทุกคนที่เกิดวันเดียวกัน',
        selfprint: 'รูปแบบการตัดสินใจจริงของคุณ — เรียนรู้จาก feedback และ memories ที่คุณให้',
      },
      {
        q: 'ความแม่นยำ',
        astrology: 'ทำนายทั่วไป — ตีความได้หลายแบบ ใช้ได้กับหลายคน',
        selfprint: 'วิเคราะห์เฉพาะตัวคุณ — แม่นขึ้นเรื่อยๆ ตามข้อมูลที่สะสม',
      },
      {
        q: 'สิ่งที่ได้รับ',
        astrology: 'คำทำนายอนาคต ดวงประจำวัน/สัปดาห์/เดือน',
        selfprint: 'เข้าใจรูปแบบพฤติกรรมตัวเอง + คำแนะนำสำหรับการตัดสินใจจริง',
      },
      {
        q: 'เปลี่ยนแปลงได้ไหม',
        astrology: 'ดวงเปลี่ยนได้ แต่ตัวตนตาม "ราศี" คงที่',
        selfprint: 'Twin เรียนรู้และปรับตัมตามที่คุณเติบโต — ไม่มีวันล้าสมัย',
      },
      {
        q: 'ตอบคำถามชีวิตจริงได้ไหม',
        astrology: 'ตอบได้ แต่ในแบบที่ต้องตีความเอง',
        selfprint: 'ตอบได้โดยตรง เช่น "ทำไมฉันถึงตัดสินใจแบบนี้ซ้ำๆ?" หรือ "ควรเปลี่ยนงานตอนนี้ไหม?"',
      },
    ],
    cta: 'ลองวิเคราะห์ตัวเอง 2 นาที — ฟรี',
    closing: 'ถ้าคุณชอบดูดวงเพราะมันช่วยให้เข้าใจตัวเองและรู้สึกมีทิศทาง SELFPRINT ทำสิ่งเดียวกัน — แต่แม่นกว่า เพราะมาจากพฤติกรรมจริงของคุณ ไม่ใช่ดาวบนฟ้า',
  },
  en: {
    meta: {
      title: 'SELFPRINT vs Astrology AI — What\'s the Difference? | SELFPRINT',
      desc: 'How is SELFPRINT different from horoscope AI? SELFPRINT uses real behavioral statistics — not fate. More accurate because it actually learns from you.',
    },
    badge: "What's the difference?",
    title: 'Astrology AI vs SELFPRINT',
    hero: 'If you landed here searching for "AI horoscope"\nyou\'re about to get something far more powerful',
    heroSub: 'SELFPRINT isn\'t astrology — but it answers the same question:\n"Who am I? What should I do next?"',
    sections: [
      {
        q: 'Data used for analysis',
        astrology: 'Star positions at birth — same data for everyone born the same day',
        selfprint: 'Your real decision patterns — learned from feedback and memories you provide',
      },
      {
        q: 'Accuracy',
        astrology: 'General predictions — interpretable many ways, applicable to many people',
        selfprint: 'Personalized analysis — gets more accurate as more data accumulates',
      },
      {
        q: 'What you get',
        astrology: 'Future predictions, daily/weekly/monthly horoscopes',
        selfprint: 'Understanding your behavioral patterns + actionable guidance for real decisions',
      },
      {
        q: 'Does it evolve?',
        astrology: 'Your sign never changes — only the daily transits shift',
        selfprint: 'Your Twin learns and adapts as you grow — never becomes outdated',
      },
      {
        q: 'Answers real life questions?',
        astrology: 'Yes, but requires personal interpretation',
        selfprint: 'Directly — "Why do I keep making this same decision?" or "Should I change careers now?"',
      },
    ],
    cta: 'Try a free 2-minute analysis',
    closing: 'If you like astrology because it helps you understand yourself and feel direction — SELFPRINT does the same thing, but more accurately, because it\'s grounded in your actual behavioral patterns, not stars.',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VsAstrologyPage() {
  const { language } = useLanguage();
  const navigate = useLangNavigate();
  const lang = (language === 'th' ? 'th' : 'en') as LangKey;
  const c = COPY[lang];

  return (
    <>
      <MetaTagManager
        title={c.meta.title}
        description={c.meta.desc}
        canonicalUrl={`/${lang}/vs-astrology`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: c.title,
          description: c.meta.desc,
          inLanguage: lang,
        }}
      />

      <NavBar />

      <main style={{ minHeight: '100vh', paddingTop: 72 }}>

        {/* Hero */}
        <section style={{
          padding: 'clamp(64px,10vw,100px) clamp(20px,5vw,48px)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
        }}>
          <span style={{
            display: 'inline-block',
            background: 'var(--color-accent-primary)',
            color: 'white',
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 24,
          }}>
            {c.badge}
          </span>
          <h1 style={{
            fontSize: 'clamp(28px,4vw,52px)',
            fontWeight: 800,
            lineHeight: 1.25,
            marginBottom: 20,
            color: 'var(--color-text-primary)',
            whiteSpace: 'pre-line',
          }}>
            {c.hero}
          </h1>
          <p style={{
            fontSize: 18,
            color: 'var(--color-text-secondary)',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
          }}>
            {c.heroSub}
          </p>
        </section>

        {/* Comparison table */}
        <section style={{
          padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,48px)',
          maxWidth: 900,
          margin: '0 auto',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 15,
            }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--color-border)', width: '30%' }}>
                    {lang === 'th' ? 'เปรียบเทียบ' : 'Comparison'}
                  </th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--color-border)' }}>
                    🔮 {lang === 'th' ? 'ดูดวง / Horoscope AI' : 'Astrology / Horoscope AI'}
                  </th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--color-accent-primary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--color-accent-primary)' }}>
                    ⚡ SELFPRINT
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.sections.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '20px', fontWeight: 600, color: 'var(--color-text-primary)', verticalAlign: 'top' }}>
                      {row.q}
                    </td>
                    <td style={{ padding: '20px', color: 'var(--color-text-secondary)', lineHeight: 1.6, verticalAlign: 'top' }}>
                      {row.astrology}
                    </td>
                    <td style={{ padding: '20px', color: 'var(--color-text-primary)', lineHeight: 1.6, verticalAlign: 'top', background: 'var(--color-bg-secondary)' }}>
                      <span style={{ color: 'var(--color-accent-primary)', fontWeight: 700, marginRight: 6 }}>✓</span>
                      {row.selfprint}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Closing + CTA */}
        <section style={{
          padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,48px)',
          textAlign: 'center',
          background: 'var(--color-bg-secondary)',
        }}>
          <p style={{
            fontSize: 18,
            color: 'var(--color-text-primary)',
            maxWidth: 640,
            margin: '0 auto 40px',
            lineHeight: 1.8,
          }}>
            {c.closing}
          </p>
          <button
            onClick={() => navigate('/onboarding?ref=astrology')}
            style={{
              padding: '16px 40px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              background: 'var(--color-accent-primary)',
              color: 'white',
              border: 'none',
            }}
          >
            {c.cta} →
          </button>
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {lang === 'th' ? 'ไม่ต้องสมัคร ไม่ต้องใส่บัตรเครดิต' : 'No signup required. No credit card.'}
          </p>
        </section>

      </main>

      <Footer />
      <NavRail />
      <BottomNav />
    </>
  );
}
