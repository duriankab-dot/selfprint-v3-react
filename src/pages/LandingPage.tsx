/**
 * LandingPage.tsx — P0-J + GAP-1
 *
 * Smart Entry:   auto-detect language + segment variant (utm/ref)
 * Hybrid Funnel: Quick Analysis (2 min) vs Full Journey
 * Returning:     session + twin → WelcomeBackHero; session + no twin → ResumeHero
 * Visual:        scientific icons only — Brain, Network, Radar, Atom, Waves
 *                NO astrology/fortune-telling icons
 * SEO:           bilingual meta, JSON-LD, hreflang via MetaTagManager
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLanguage } from '@/context/LanguageContext';
import { useLangNavigate } from '@/hooks/useLangNavigate';
import { useEmotion } from '@/context/EmotionContext';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@/context/AuthContext';
import { useTwin } from '@/context/TwinContext';
import { useLifecycleStore } from '@/store/lifecycleStore';

// Lazy-load below-fold sections
const EmotionSelector = lazy(() =>
  import('@/components/features/EmotionSelector').then(m => ({ default: m.EmotionSelector }))
);
const BirthDataInput = lazy(() =>
  import('@/components/landing/BirthDataInput').then(m => ({ default: m.BirthDataInput }))
);

// ─── Scientific SVG Icons ──────────────────────────────────────────────────────

const BrainIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="9" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none"/>
    <path d="M20 11 C14 11 11 15 11 20" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 11 C26 11 29 15 29 20" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 20 C11 25 14 29 20 29" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M29 20 C29 25 26 29 20 29" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="11" x2="20" y2="29" stroke="var(--color-accent-primary)" strokeWidth="1" opacity="0.4"/>
    <line x1="11" y1="20" x2="29" y2="20" stroke="var(--color-accent-primary)" strokeWidth="1" opacity="0.4"/>
    <circle cx="20" cy="20" r="2.5" fill="var(--color-accent-primary)"/>
    <circle cx="14" cy="16" r="1.5" fill="var(--color-accent-primary)" opacity="0.6"/>
    <circle cx="26" cy="16" r="1.5" fill="var(--color-accent-primary)" opacity="0.6"/>
    <circle cx="14" cy="24" r="1.5" fill="var(--color-accent-primary)" opacity="0.6"/>
    <circle cx="26" cy="24" r="1.5" fill="var(--color-accent-primary)" opacity="0.6"/>
  </svg>
);

const RadarIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="9" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none" opacity="0.3"/>
    <circle cx="20" cy="20" r="14" stroke="var(--color-accent-primary)" strokeWidth="1" fill="none" opacity="0.2"/>
    <circle cx="20" cy="20" r="4" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <circle cx="20" cy="20" r="1.5" fill="var(--color-accent-primary)"/>
    <line x1="20" y1="6" x2="20" y2="20" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    <path d="M20 20 L30 14" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <circle cx="28" cy="13" r="1.5" fill="var(--color-accent-primary)" opacity="0.7"/>
    <circle cx="13" cy="12" r="1.5" fill="var(--color-accent-primary)" opacity="0.4"/>
    <circle cx="30" cy="26" r="1.5" fill="var(--color-accent-primary)" opacity="0.4"/>
  </svg>
);

const NetworkIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="3" fill="var(--color-accent-primary)"/>
    <circle cx="8" cy="12" r="2" fill="var(--color-accent-primary)" opacity="0.7"/>
    <circle cx="32" cy="12" r="2" fill="var(--color-accent-primary)" opacity="0.7"/>
    <circle cx="8" cy="28" r="2" fill="var(--color-accent-primary)" opacity="0.7"/>
    <circle cx="32" cy="28" r="2" fill="var(--color-accent-primary)" opacity="0.7"/>
    <circle cx="20" cy="8" r="2" fill="var(--color-accent-primary)" opacity="0.5"/>
    <circle cx="20" cy="32" r="2" fill="var(--color-accent-primary)" opacity="0.5"/>
    <line x1="20" y1="20" x2="8" y2="12" stroke="var(--color-accent-primary)" strokeWidth="1" opacity="0.4"/>
    <line x1="20" y1="20" x2="32" y2="12" stroke="var(--color-accent-primary)" strokeWidth="1" opacity="0.4"/>
    <line x1="20" y1="20" x2="8" y2="28" stroke="var(--color-accent-primary)" strokeWidth="1" opacity="0.4"/>
    <line x1="20" y1="20" x2="32" y2="28" stroke="var(--color-accent-primary)" strokeWidth="1" opacity="0.4"/>
    <line x1="20" y1="20" x2="20" y2="8" stroke="var(--color-accent-primary)" strokeWidth="1" opacity="0.4"/>
    <line x1="20" y1="20" x2="20" y2="32" stroke="var(--color-accent-primary)" strokeWidth="1" opacity="0.4"/>
    <line x1="8" y1="12" x2="20" y2="8" stroke="var(--color-accent-primary)" strokeWidth="0.75" opacity="0.25"/>
    <line x1="32" y1="12" x2="20" y2="8" stroke="var(--color-accent-primary)" strokeWidth="0.75" opacity="0.25"/>
  </svg>
);

const AtomIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <ellipse cx="20" cy="20" rx="14" ry="5" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <ellipse cx="20" cy="20" rx="14" ry="5" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none" opacity="0.5" transform="rotate(60 20 20)"/>
    <ellipse cx="20" cy="20" rx="14" ry="5" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none" opacity="0.5" transform="rotate(120 20 20)"/>
    <circle cx="20" cy="20" r="2.5" fill="var(--color-accent-primary)"/>
    <circle cx="34" cy="20" r="1.5" fill="var(--color-accent-primary)" opacity="0.8"/>
  </svg>
);

const GitBranchIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="14" cy="10" r="3" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none"/>
    <circle cx="14" cy="30" r="3" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none"/>
    <circle cx="28" cy="16" r="3" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none"/>
    <line x1="14" y1="13" x2="14" y2="27" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
    <path d="M14 13 Q14 16 28 16" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const WavesIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M4 20 Q10 14 16 20 Q22 26 28 20 Q34 14 40 20" stroke="var(--color-accent-primary)" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M4 26 Q10 20 16 26 Q22 32 28 26 Q34 20 40 26" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
    <path d="M4 14 Q10 8 16 14 Q22 20 28 14 Q34 8 40 14" stroke="var(--color-accent-primary)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3"/>
  </svg>
);

// Step number SVG (replaces emoji 1️⃣2️⃣3️⃣)
const StepNumber = ({ n }: { n: number }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-label={`Step ${n}`}>
    <circle cx="26" cy="26" r="25" fill="var(--color-accent-primary)" opacity="0.12" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
    <text x="26" y="31" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--color-accent-primary)">{n}</text>
  </svg>
);

// ─── Hero Neural Network SVG (large decorative) ────────────────────────────────

const HeroNetworkSvg = () => (
  <svg
    viewBox="0 0 320 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', maxWidth: 320, height: 'auto' }}
    aria-hidden="true"
  >
    <style>{`
      @keyframes pulse-node { 0%,100%{opacity:.7} 50%{opacity:1} }
      @keyframes drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(0,-6px)} }
      .n1{animation:pulse-node 2.4s ease-in-out infinite}
      .n2{animation:pulse-node 2.4s 0.4s ease-in-out infinite}
      .n3{animation:pulse-node 2.4s 0.8s ease-in-out infinite}
      .n4{animation:pulse-node 2.4s 1.2s ease-in-out infinite}
      .n5{animation:pulse-node 2.4s 1.6s ease-in-out infinite}
      .hero-group{animation:drift 6s ease-in-out infinite}
    `}</style>
    <g className="hero-group">
      {/* Core */}
      <rect x="116" y="116" width="88" height="88" rx="18" fill="var(--color-accent-primary)" opacity="0.08" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
      <rect x="132" y="132" width="56" height="56" rx="10" fill="var(--color-accent-primary)" opacity="0.15"/>
      <text x="160" y="166" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-accent-primary)" letterSpacing="0.5">SELFPRINT</text>
      <text x="160" y="178" textAnchor="middle" fontSize="8" fill="var(--color-accent-primary)" opacity="0.7">SICE × 12</text>
      {/* CPU pins */}
      {[134,148,162,176].map((x,i) => (
        <g key={i}>
          <line x1={x} y1="116" x2={x} y2="100" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          <line x1={x} y1="204" x2={x} y2="220" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </g>
      ))}
      {[134,148,162,176].map((y,i) => (
        <g key={i}>
          <line x1="116" y1={y} x2="100" y2={y} stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          <line x1="204" y1={y} x2="220" y2={y} stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </g>
      ))}
      {/* Outer nodes */}
      <circle className="n1" cx="160" cy="50" r="14" fill="var(--color-accent-primary)" opacity="0.12" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
      <text x="160" y="54" textAnchor="middle" fontSize="8" fill="var(--color-accent-primary)">SELF</text>
      <circle className="n2" cx="270" cy="160" r="14" fill="var(--color-accent-primary)" opacity="0.12" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
      <text x="270" y="164" textAnchor="middle" fontSize="7" fill="var(--color-accent-primary)">CAREER</text>
      <circle className="n3" cx="160" cy="270" r="14" fill="var(--color-accent-primary)" opacity="0.12" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
      <text x="160" y="274" textAnchor="middle" fontSize="8" fill="var(--color-accent-primary)">MIND</text>
      <circle className="n4" cx="50" cy="160" r="14" fill="var(--color-accent-primary)" opacity="0.12" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
      <text x="50" y="164" textAnchor="middle" fontSize="7" fill="var(--color-accent-primary)">GROWTH</text>
      <circle className="n5" cx="252" cy="68" r="10" fill="var(--color-accent-primary)" opacity="0.1" stroke="var(--color-accent-primary)" strokeWidth="1"/>
      <text x="252" y="72" textAnchor="middle" fontSize="6" fill="var(--color-accent-primary)">FUTURE</text>
      {/* Connection dashes */}
      <line x1="160" y1="64" x2="160" y2="116" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="5 4" opacity="0.35"/>
      <line x1="256" y1="160" x2="204" y2="160" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="5 4" opacity="0.35"/>
      <line x1="160" y1="256" x2="160" y2="204" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="5 4" opacity="0.35"/>
      <line x1="64" y1="160" x2="116" y2="160" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="5 4" opacity="0.35"/>
      <line x1="245" y1="74" x2="204" y2="116" stroke="var(--color-accent-primary)" strokeWidth="0.75" strokeDasharray="4 5" opacity="0.25"/>
    </g>
  </svg>
);

// ─── Smart Entry Hook ─────────────────────────────────────────────────────────

type Segment = 'th-self' | 'mbti' | 'tech' | 'astrology' | 'default';

function useSmartEntry() {
  const { language } = useLanguage();
  const navigate = useLangNavigate();
  const [segment, setSegment] = useState<Segment>('default');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Segment from URL param (?ref=mbti|tech|astrology)
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    let seg: Segment = 'default';
    if (ref === 'mbti') seg = 'mbti';
    else if (ref === 'tech') seg = 'tech';
    else if (ref === 'astrology') seg = 'astrology';
    else if (language === 'th' || navigator.language.startsWith('th')) seg = 'th-self';

    setSegment(seg);

    // 2. Language auto-detect: if on bare / root without lang prefix, redirect
    const path = window.location.pathname;
    if (path === '/') {
      const browserLang = navigator.language.toLowerCase();
      const target = browserLang.startsWith('th') ? '/th' : '/en';
      navigate(target, { replace: true });
      return;
    }

    setReady(true);
  }, [language]);  // eslint-disable-line react-hooks/exhaustive-deps

  return { segment, ready };
}

// ─── Copy per segment ─────────────────────────────────────────────────────────

type LangCopy = {
  badge: string;
  h1: string;
  sub: string;
  quickCta: string;
  fullCta: string;
  watchDemo: string;
  seoTitle: string;
  seoDesc: string;
};

const COPY: Record<'th' | 'en', Record<Segment, LangCopy>> = {
  th: {
    'th-self': {
      badge: 'Living AI ภาษาไทยหนึ่งเดียว',
      h1: 'เลิกเดาทิศทางของชีวิต\nให้ AI วิเคราะห์แทนดูดวง',
      sub: 'SELFPRINT ประมวลผลพฤติกรรมจริงผ่าน 12 SICE Engines — ไม่ใช่โชคชะตา แต่เป็นสถิติ',
      quickCta: 'วิเคราะห์เบื้องต้น 2 นาที',
      fullCta: 'สร้าง AI Twin เต็มรูปแบบ',
      watchDemo: 'ดูวิธีการทำงาน',
      seoTitle: 'SELFPRINT | สร้าง AI Twin ภาษาไทย - ช่วยตัดสินใจชีวิต (ไม่ใช่ดูดวง)',
      seoDesc: 'เลิกเดาทิศทาง ให้ SELFPRINT วิเคราะห์ 12 มิติชีวิตด้วย AI และสถิติพฤติกรรมจริง ฟรี',
    },
    mbti: {
      badge: 'ดีกว่า MBTI เพราะเรียนรู้จากคุณจริงๆ',
      h1: 'MBTI ให้ Label\nAI Twin ให้ความเข้าใจที่เติบโต',
      sub: 'SELFPRINT เรียนรู้การตัดสินใจจริงของคุณ — ไม่ใช่แบบทดสอบ 93 ข้อที่ผลไม่เปลี่ยน',
      quickCta: 'ทดลองวิเคราะห์ฟรี 2 นาที',
      fullCta: 'สร้าง Twin เต็มรูปแบบ',
      watchDemo: 'ดูเปรียบเทียบ MBTI vs AI Twin',
      seoTitle: 'SELFPRINT | AI Twin ดีกว่า MBTI — เรียนรู้จากพฤติกรรมจริง',
      seoDesc: 'SELFPRINT vs MBTI: AI Twin ที่เรียนรู้การตัดสินใจจริงของคุณ ไม่ใช่แค่แบบทดสอบ ลองฟรี',
    },
    tech: {
      badge: 'Decision Intelligence Platform — Thailand',
      h1: 'AI ที่รู้จักคุณลึกที่สุด\nจำลองการตัดสินใจชีวิตก่อนเกิด',
      sub: '12 SICE Engines ประมวลผลรูปแบบพฤติกรรม ทำนายผลการตัดสินใจด้วยสถิติจริง',
      quickCta: 'Quick Analysis 2 min',
      fullCta: 'สร้าง AI Twin เต็มระบบ',
      watchDemo: 'ดู Architecture',
      seoTitle: 'SELFPRINT | Decision Intelligence Platform — AI Twin Thailand',
      seoDesc: 'Living Personal Intelligence Platform. 12 SICE Core Engines. Behavioral pattern simulation. Real-time Twin evolution.',
    },
    astrology: {
      badge: 'วิทยาศาสตร์พฤติกรรม ไม่ใช่โชคชะตา',
      h1: 'คุณไม่ได้มาเพื่อดูดวง\nคุณมาเพื่อเข้าใจตัวเอง',
      sub: 'SELFPRINT วิเคราะห์พฤติกรรมจริง — ไม่ใช่ดาวจรัส แต่เป็นสถิติที่ทำนายได้เพราะมาจากตัวคุณจริง',
      quickCta: 'วิเคราะห์เบื้องต้น 2 นาที',
      fullCta: 'สร้าง AI Twin',
      watchDemo: 'ดูเปรียบเทียบ vs ดูดวง',
      seoTitle: 'SELFPRINT vs ดูดวง AI — ต่างกันอย่างไร? | SELFPRINT',
      seoDesc: 'ต้องการเข้าใจตัวเอง? SELFPRINT วิเคราะห์พฤติกรรมจริง ไม่ใช่โชคชะตา — แม่นกว่าเพราะเรียนรู้จากคุณ',
    },
    default: {
      badge: 'Living AI ภาษาไทยหนึ่งเดียว',
      h1: 'เลิกเดาทิศทางของชีวิต\nให้ AI ช่วยคิดและตัดสินใจ',
      sub: 'SELFPRINT สังเคราะห์พฤติกรรมผ่าน 12 SICE Engines สร้างแบบจำลองอนาคตด้วยสถิติจริง',
      quickCta: 'วิเคราะห์เบื้องต้น 2 นาที',
      fullCta: 'สร้าง AI Twin เต็มรูปแบบ',
      watchDemo: 'ดูวิธีการทำงาน',
      seoTitle: 'SELFPRINT | สร้าง AI Twin ภาษาไทย - ช่วยตัดสินใจชีวิต',
      seoDesc: 'SELFPRINT วิเคราะห์ 12 มิติชีวิตด้วย AI Twin ที่เรียนรู้จากคุณจริงๆ ฟรี',
    },
  },
  en: {
    'th-self': {
      badge: 'Living Personal Intelligence Platform',
      h1: 'The Only AI Twin\nThat\'s Actually Intelligent at Birth',
      sub: 'Synchronize your Initial State Matrix with 12 SICE Core Engines to simulate decisions and detect blind spots.',
      quickCta: 'Quick Analysis (2 min)',
      fullCta: 'Build Your AI Twin',
      watchDemo: 'Watch how it works',
      seoTitle: 'SELFPRINT | Your Living Personal Intelligence Platform & AI Twin',
      seoDesc: 'Stop guessing your life. 12 SICE Core Engines simulate decisions, detect blind spots, and evolve your Twin in real-time.',
    },
    mbti: {
      badge: 'Better than MBTI — it actually learns',
      h1: 'MBTI Gives a Label.\nYour AI Twin Grows With You.',
      sub: 'SELFPRINT learns from your real decisions — not a static 93-question test that never changes.',
      quickCta: 'Free 2-min Analysis',
      fullCta: 'Build Full AI Twin',
      watchDemo: 'Compare MBTI vs AI Twin',
      seoTitle: 'SELFPRINT | Better than MBTI — AI Twin that learns from you',
      seoDesc: 'SELFPRINT vs MBTI: AI Twin that learns from your real decisions, not a static test. Start free.',
    },
    tech: {
      badge: 'Decision Intelligence Platform',
      h1: 'Behavioral AI That Knows\nYou Better Than Anyone',
      sub: '12 SICE Core Engines process behavioral patterns, simulate future decisions, and evolve in real-time with your Twin.',
      quickCta: 'Quick Analysis (2 min)',
      fullCta: 'Full Onboarding',
      watchDemo: 'View Architecture',
      seoTitle: 'SELFPRINT | AI Twin & Decision Intelligence Platform',
      seoDesc: 'Living Personal Intelligence Platform. 12 SICE Core Engines. Real-time behavioral learning. Decision simulation.',
    },
    astrology: {
      badge: 'Behavioral science, not destiny',
      h1: 'You didn\'t come here for horoscopes\nYou came to understand yourself',
      sub: 'SELFPRINT analyzes your real behavioral patterns — not stars. More accurate because it learns from your actual decisions.',
      quickCta: 'Quick Analysis (2 min)',
      fullCta: 'Build Your AI Twin',
      watchDemo: 'See the difference',
      seoTitle: 'SELFPRINT vs Astrology AI — What\'s the Difference? | SELFPRINT',
      seoDesc: 'Looking to understand yourself? SELFPRINT analyzes real behavior — not destiny. More accurate because it learns from you.',
    },
    default: {
      badge: 'Living Personal Intelligence Platform',
      h1: 'The Only AI Twin\nThat\'s Actually Intelligent at Birth',
      sub: 'Synchronize your Initial State Matrix with 12 SICE Core Engines to simulate decisions, detect blind spots, and evolve.',
      quickCta: 'Quick Analysis (2 min)',
      fullCta: 'Build Your AI Twin',
      watchDemo: 'Watch how it works',
      seoTitle: 'SELFPRINT | Your Living Personal Intelligence Platform & AI Twin',
      seoDesc: 'Stop guessing your life. 12 SICE Core Engines simulate decisions, detect blind spots, and evolve your Twin.',
    },
  },
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const sectionBase: React.CSSProperties = {
  padding: 'clamp(64px, 10vw, 100px) clamp(20px, 5vw, 48px)',
};

const cardStyle: React.CSSProperties = {
  padding: '28px 24px',
  background: 'var(--color-bg-secondary)',
  borderRadius: '14px',
  border: '1px solid var(--color-border)',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface LandingPageProps {
  onStartOnboarding?: () => void;
}

// ─── WelcomeBackHero — returning user with existing Twin ──────────────────────

function WelcomeBackHero({ lang, twinName, onEnter }: { lang: 'th' | 'en'; twinName?: string; onEnter: () => void }) {
  const name = twinName ?? (lang === 'th' ? 'Twin ของคุณ' : 'Your Twin');
  return (
    <section style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,48px)', background: 'linear-gradient(135deg,var(--color-bg-primary) 0%,var(--color-bg-secondary) 100%)' }}>
      <span style={{ display: 'inline-block', background: 'var(--color-accent-primary)', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>
        {lang === 'th' ? 'ยินดีต้อนรับกลับ' : 'Welcome Back'}
      </span>
      <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.25, marginBottom: 16, color: 'var(--color-text-primary)' }}>
        {lang === 'th' ? `${name} รอคุณอยู่` : `${name} is waiting for you`}
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', maxWidth: 520, lineHeight: 1.8, marginBottom: 40 }}>
        {lang === 'th'
          ? 'Twin ของคุณเรียนรู้และพัฒนาไปพร้อมกับคุณ — กลับมาสนทนาต่อได้เลย'
          : 'Your Twin has been learning and evolving. Pick up right where you left off.'}
      </p>
      <button
        onClick={onEnter}
        style={{ padding: '16px 40px', borderRadius: '12px', fontWeight: 700, fontSize: '18px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none' }}
      >
        {lang === 'th' ? 'เข้าหา Twin ของฉัน →' : 'Enter My Twin →'}
      </button>
    </section>
  );
}

// ─── ResumeHero — logged-in but Twin not created yet ─────────────────────────

function ResumeHero({ lang, onResume, onRestart }: { lang: 'th' | 'en'; onResume: () => void; onRestart: () => void }) {
  return (
    <section style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,48px)', background: 'linear-gradient(135deg,var(--color-bg-primary) 0%,var(--color-bg-secondary) 100%)' }}>
      <span style={{ display: 'inline-block', background: 'var(--color-bg-secondary)', color: 'var(--color-accent-primary)', border: '1.5px solid var(--color-accent-primary)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>
        {lang === 'th' ? 'เกือบเสร็จแล้ว!' : 'Almost there!'}
      </span>
      <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.25, marginBottom: 16, color: 'var(--color-text-primary)' }}>
        {lang === 'th' ? 'AI Twin ของคุณยังไม่สมบูรณ์' : 'Your AI Twin isn\'t complete yet'}
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', maxWidth: 520, lineHeight: 1.8, marginBottom: 40 }}>
        {lang === 'th'
          ? 'คุณเริ่มสร้าง Twin ไว้แล้ว — ต่อจากที่ค้างไว้เพื่อเปิดใช้งานระบบเต็มรูปแบบ'
          : 'You\'ve started creating your Twin — resume where you left off to activate the full system.'}
      </p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onResume}
          style={{ padding: '15px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none' }}
        >
          {lang === 'th' ? 'ต่อจากที่ค้างไว้ →' : 'Resume Setup →'}
        </button>
        <button
          onClick={onRestart}
          style={{ padding: '15px 32px', borderRadius: '10px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)' }}
        >
          {lang === 'th' ? 'เริ่มใหม่ตั้งแต่ต้น' : 'Start Over'}
        </button>
      </div>
    </section>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage({ onStartOnboarding }: LandingPageProps) {
  const { language } = useLanguage();
  const navigate = useLangNavigate();
  const { mood } = useEmotion();
  const { setLandingContext } = useUserStore();
  const { segment } = useSmartEntry();
  const [birthVisible, setBirthVisible] = useState(false);

  // GAP-1: Returning user detection
  const { session } = useAuth();
  const { twin } = useTwin();
  const lifecycleStatus = useLifecycleStore((state) => state.status);

  const lang = (language === 'th' ? 'th' : 'en') as 'th' | 'en';
  const copy = COPY[lang][segment] ?? COPY[lang]['default'];
  const ogUrl = `https://selfprint.one/api/og?lang=${lang}&segment=${segment}`;

  const goQuick = () => {
    setLandingContext({ mood });
    // /analysis requires auth — unauthenticated users route to /onboarding instead
    // (Onboarding works without login and pre-populates from BirthDataInput data)
    if (!session) {
      navigate('/onboarding');
    } else {
      navigate('/analysis');
    }
  };

  const goFull = () => {
    setLandingContext({ mood });
    if (onStartOnboarding) {
      onStartOnboarding();
    } else {
      navigate('/onboarding');
    }
  };

  const features = lang === 'th' ? [
    { icon: <BrainIcon />, title: 'วิเคราะห์รูปแบบพฤติกรรม', desc: 'ตรวจจับ Blind Spots และรูปแบบซ้ำ ชี้จุดเสี่ยงก่อนตัดสินใจ' },
    { icon: <RadarIcon />, title: 'ประมวลผล 12 มิติชีวิต', desc: 'SICE Engines วิเคราะห์แบบ Multi-dimensional ครอบคลุมทุกด้านชีวิต' },
    { icon: <WavesIcon />, title: 'Twin วิวัฒนาการไปพร้อมคุณ', desc: 'ทุกการตัดสินใจและ Feedback ถูกเรียนรู้ — Twin แม่นขึ้นเรื่อยๆ' },
  ] : [
    { icon: <BrainIcon />, title: 'Behavioral Pattern Recognition', desc: 'Detect blind spots and recurring patterns before they cost you.' },
    { icon: <GitBranchIcon />, title: '12-Dimensional Life Analysis', desc: '12 SICE Core Engines analyze your life across all critical domains.' },
    { icon: <WavesIcon />, title: 'Real-time Twin Evolution', desc: 'Every decision and feedback loop makes your Twin more accurate.' },
  ];

  const steps = lang === 'th' ? [
    { title: 'บอกข้อมูลตัวตน', desc: 'AI ประมวลผลสภาวะเริ่มต้น (Initial State Matrix) ของคุณ' },
    { title: 'AI Twin ถูกสร้าง', desc: 'เห็นกระจกสะท้อนตัวเอง รูปแบบพฤติกรรม และสไตล์การตัดสินใจครั้งแรก' },
    { title: 'เริ่มวิวัฒนาการ', desc: 'ยิ่งสะท้อนตัวตนมาก Twin ยิ่งแม่นยำและช่วยได้ลึกขึ้น' },
  ] : [
    { title: 'Input Your State Matrix', desc: 'AI processes your Initial State Matrix — behavioral baseline, not birth charts.' },
    { title: 'Your AI Twin Awakens', desc: 'See your behavioral mirror: patterns, decision style, blind spots.' },
    { title: 'Evolve Together', desc: 'Every interaction makes your Twin more accurate. It never stops learning.' },
  ];

  const testimonials = [
    {
      quote: lang === 'th'
        ? '"SELFPRINT ช่วยให้ผมเข้าใจรูปแบบการตัดสินใจของตัวเอง — ปรึกษา AI Twin ของผมได้ทั้งวัน"'
        : '"SELFPRINT helped me understand my decision patterns. I consult my Twin daily — it knows me better than I thought."',
      name: 'ณัฐพล', role: 'CEO, Tech Startup',
    },
    {
      quote: lang === 'th'
        ? '"เลิกเดาอนาคตด้วยสถิติจริง SELFPRINT คาดการณ์แนวโน้มชีวิตได้แม่นมาก ช่วยตัดสินใจเรื่องงานเยอะมาก"'
        : '"Real statistics instead of guessing. SELFPRINT\'s behavioral forecasting made my career decisions significantly better."',
      name: 'พนนีย์', role: 'Investor, VC Fund',
    },
    {
      quote: lang === 'th'
        ? '"ทุกการตัดสินใจดีขึ้นมากหลายเท่าหลังจากใช้ SELFPRINT — ไม่น่าเชื่อว่าจะตอบโจทย์ได้ขนาดนี้"'
        : '"Every decision improved dramatically after using SELFPRINT. Incredibly precise behavioral analysis."',
      name: 'วิทยา', role: 'Entrepreneur, E-commerce',
    },
  ];

  // GAP-1: Returning user gate — show personalized hero before main landing content.
  // Lifecycle must be loaded (not null) before checking to avoid flash-redirects.
  if (session && lifecycleStatus && twin) {
    // User is fully set up — direct them to their Twin
    return (
      <>
        <NavBar position="fixed" />
        <WelcomeBackHero
          lang={lang}
          twinName={twin.name ?? undefined}
          onEnter={() => navigate('/twin')}
        />
        <Footer />
        <BottomNav />
      </>
    );
  }

  if (session && lifecycleStatus && lifecycleStatus === 'ONBOARDING') {
    // Signed in but Twin not created — offer to resume or restart
    return (
      <>
        <NavBar position="fixed" />
        <ResumeHero
          lang={lang}
          onResume={() => navigate('/onboarding')}
          onRestart={() => navigate('/onboarding')}
        />
        <Footer />
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <MetaTagManager
        title={copy.seoTitle}
        description={copy.seoDesc}
        keywords={lang === 'th'
          ? 'AI Twin ไทย, ตัดสินใจชีวิต, วิเคราะห์พฤติกรรม, 12 มิติชีวิต, SELFPRINT'
          : 'AI twin, personal intelligence, decision making AI, behavioral pattern, SELFPRINT'}
        ogImage={ogUrl}
        ogType="website"
        canonicalUrl={`/${lang}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'SELFPRINT',
          applicationCategory: lang === 'th' ? 'LifestyleApplication' : 'BusinessApplication',
          inLanguage: lang,
          description: copy.seoDesc,
          offers: { '@type': 'Offer', price: '0', priceCurrency: lang === 'th' ? 'THB' : 'USD' },
          featureList: lang === 'th'
            ? ['AI Digital Twin สร้างใน 2 นาที', '12 Hub Worlds วิเคราะห์ชีวิต', 'Behavioral Pattern Recognition', 'Decision simulation', 'Real-time learning Twin']
            : ['AI Digital Twin creation', '12 Intelligence Hub Worlds', 'Real-time behavioral learning', 'Future decision simulation', 'Memory-enabled Twin evolution'],
        }}
      />

      <div style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontFamily: "'Inter','Noto Sans Thai',sans-serif", minHeight: '100vh' }}>

        {/* NAV */}
        <NavBar position="fixed" rightSlot={
          <button
            onClick={goQuick}
            style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none' }}
          >
            {lang === 'th' ? 'เริ่มฟรี' : 'Start Free'}
          </button>
        } />

        {/* ── HERO ── */}
        <section style={{ ...sectionBase, paddingTop: 'clamp(100px, 14vw, 160px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px,1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center', minHeight: '85vh', background: 'linear-gradient(135deg,var(--color-bg-primary) 0%,var(--color-bg-secondary) 100%)' }}>
          <div>
            {/* Segment badge */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-accent-primary)', color: 'white', padding: '5px 14px', borderRadius: '20px', fontSize: 'clamp(10px,2vw,12px)', fontWeight: 600, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ display: 'inline-flex', transform: 'scale(0.45)', transformOrigin: 'left center', width: 18, height: 18, overflow: 'hidden' }}><NetworkIcon /></span>
              {copy.badge}
            </span>

            <h1 style={{ fontSize: 'clamp(32px,4.5vw,56px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px', color: 'var(--color-text-primary)', whiteSpace: 'pre-line' }}>
              {copy.h1}
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '36px', maxWidth: '520px' }}>
              {copy.sub}
            </p>

            {/* ── HYBRID FUNNEL CTA ── */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Primary: Quick Analysis */}
              <button
                onClick={goQuick}
                style={{ padding: '15px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none', transition: 'opacity .2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {copy.quickCta}
              </button>
              {/* Secondary: Full Journey */}
              <button
                onClick={goFull}
                style={{ padding: '15px 28px', borderRadius: '10px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', background: 'transparent', color: 'var(--color-accent-primary)', border: '2px solid var(--color-accent-primary)', transition: 'opacity .2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {copy.fullCta}
              </button>
            </div>

            {/* Demo link */}
            <p style={{ marginTop: '18px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <span
                onClick={() => document.getElementById('how-section')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--color-accent-primary)', color: 'var(--color-accent-primary)' }}
              >
                {copy.watchDemo} →
              </span>
            </p>
          </div>

          {/* Hero visual */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'clamp(16px,4vw,32px)', background: 'linear-gradient(135deg,rgba(91,92,235,.07) 0%,rgba(139,92,246,.07) 100%)', borderRadius: '20px' }}>
            <HeroNetworkSvg />
          </div>
        </section>

        {/* ── EMOTION SECTION (lazy) ── */}
        <Suspense fallback={<div style={{ height: 200 }} />}>
          <section style={{ ...sectionBase, background: 'linear-gradient(135deg,var(--color-bg-secondary) 0%,var(--color-bg-primary) 100%)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 700, marginBottom: '12px' }}>
              {lang === 'th' ? 'วันนี้คุณรู้สึกยังไงบ้าง?' : 'How are you feeling today?'}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.8 }}>
              {lang === 'th'
                ? 'อารมณ์ปัจจุบันของคุณคือดาต้าสำคัญที่ AI Twin ใช้ปรับการวิเคราะห์ให้ตรงกับสภาวะจริงของคุณ'
                : 'Your current state is behavioral data. Your Twin adapts its analysis to your real-time emotional context.'}
            </p>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <EmotionSelector />
            </div>
          </section>
        </Suspense>

        {/* ── WHY SECTION ── */}
        <section style={{ ...sectionBase, background: 'var(--color-bg-primary)', textAlign: 'center' }} id="why-section">
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, marginBottom: '12px' }}>
            {lang === 'th' ? 'ทำไมคนไทยยุคใหม่ต้องใช้ SELFPRINT?' : 'Why SELFPRINT?'}
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--color-text-secondary)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.8 }}>
            {lang === 'th'
              ? 'ในแต่ละวันคุณตัดสินใจมากกว่า 100 ครั้ง แต่ติดกับดัก Blind Spots โดยไม่รู้ตัว SELFPRINT ช่วยตรวจจับด้วยสถิติจริง'
              : 'You make 35,000 decisions daily — most shaped by invisible behavioral patterns. SELFPRINT detects and maps them.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px', maxWidth: '960px', margin: '0 auto 40px' }}>
            {features.map((f, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ marginBottom: '14px' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '16px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <button onClick={goFull} style={{ padding: '14px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none' }}>
            {copy.fullCta}
          </button>
        </section>

        {/* ── HOW SECTION ── */}
        <section style={{ ...sectionBase, background: 'var(--color-bg-secondary)', textAlign: 'center' }} id="how-section">
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, marginBottom: '12px' }}>
            {lang === 'th' ? 'SELFPRINT ทำงานยังไง?' : 'How SELFPRINT Works'}
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--color-text-secondary)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.8 }}>
            {lang === 'th' ? '3 ขั้นตอน สร้าง AI Twin ที่เข้าใจคุณจริงๆ ภายใน 2 นาที' : '3 steps to an AI Twin that genuinely understands you — in under 2 minutes.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '24px', maxWidth: '860px', margin: '0 auto 40px' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ ...cardStyle, textAlign: 'center', background: 'var(--color-bg-primary)' }}>
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}><StepNumber n={i + 1} /></div>
                <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '16px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={goQuick} style={{ padding: '14px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none' }}>
              {copy.quickCta}
            </button>
            <button onClick={goFull} style={{ padding: '14px 28px', borderRadius: '10px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', background: 'transparent', color: 'var(--color-accent-primary)', border: '2px solid var(--color-accent-primary)' }}>
              {copy.fullCta}
            </button>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ ...sectionBase, background: 'var(--color-bg-primary)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, marginBottom: '12px' }}>
            {lang === 'th' ? 'เสียงตอบรับจากผู้ใช้งาน' : 'What users say'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '20px', maxWidth: '960px', margin: '0 auto 40px' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ ...cardStyle, textAlign: 'left' }}>
                <p style={{ fontSize: '15px', fontStyle: 'italic', marginBottom: '16px', color: 'var(--color-text-primary)', lineHeight: 1.7 }}>{t.quote}</p>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.role}</div>
              </div>
            ))}
          </div>
          <button onClick={goFull} style={{ padding: '14px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none' }}>
            {lang === 'th' ? 'ลอง SELFPRINT ฟรี' : 'Try SELFPRINT Free'}
          </button>
        </section>

        {/* ── BIRTH DATA (lazy, shown on demand) ── */}
        <section style={{ ...sectionBase, background: 'var(--color-bg-secondary)', textAlign: 'center' }}>
          {!birthVisible ? (
            <>
              <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, marginBottom: '16px' }}>
                {lang === 'th' ? 'พร้อมสร้าง AI Twin แล้วหรือยัง?' : 'Ready to build your AI Twin?'}
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--color-text-secondary)', marginBottom: '36px', maxWidth: '540px', margin: '0 auto 36px', lineHeight: 1.8 }}>
                {lang === 'th' ? 'ทดลองฟรี ไม่ผูกมัด ปลอดภัย ไม่ต้องใส่ข้อมูลบัตรเครดิต' : 'Free, no commitment, no credit card required.'}
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={goQuick} style={{ padding: '16px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '17px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none' }}>
                  {copy.quickCta}
                </button>
                <button onClick={() => setBirthVisible(true)} style={{ padding: '16px 32px', borderRadius: '10px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', background: 'transparent', color: 'var(--color-accent-primary)', border: '2px solid var(--color-accent-primary)' }}>
                  {copy.fullCta}
                </button>
              </div>
            </>
          ) : (
            <Suspense fallback={<div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>Loading...</div>}>
              <BirthDataInput onComplete={goFull} />
            </Suspense>
          )}
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ ...sectionBase, background: 'linear-gradient(135deg,var(--color-accent-primary) 0%,#8B5CF6 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Scientific atom decoration */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', opacity: 0.6 }}>
              <AtomIcon />
            </div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px', color: 'white' }}>
              {lang === 'th' ? 'เริ่มวิเคราะห์ระบบตัวตนของคุณ\nวันนี้ ฟรี ไม่มีข้อผูกมัด' : 'Start Understanding Yourself\nToday — Free, No Commitment'}
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '36px', lineHeight: 1.7 }}>
              {lang === 'th' ? 'SELFPRINT พร้อมพัฒนาคุณแล้ว' : 'SELFPRINT is ready to evolve with you.'}
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={goQuick} style={{ padding: '16px 32px', fontSize: '17px', background: 'white', color: 'var(--color-accent-primary)', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                {copy.quickCta}
              </button>
              <button onClick={goFull} style={{ padding: '16px 32px', fontSize: '16px', background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.6)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                {copy.fullCta}
              </button>
            </div>
          </div>
        </section>

        <Footer />
        <BottomNav />
      </div>
    </>
  );
}
