/**
 * LandingPage.tsx — Story Mode
 *
 * 3 fullscreen narrative screens:
 *   Screen 1 "คุณคือใคร จริงๆ?"             — behavioral hook
 *   Screen 2 "NOVA อ่านคุณออก..."           — NOVA reveal + reading cards
 *   Screen 3 CTA                             — single conversion action
 *
 * Smart Entry:  auto-detect language + segment (utm/ref) → SEO copy only
 * Returning:    session + twin → WelcomeBackHero | session + ONBOARDING → ResumeHero
 * Visual:       scientific icons only — no astrology/fortune-telling icons
 * SEO:          bilingual meta, JSON-LD, hreflang via MetaTagManager
 */

import { useEffect, useRef, useState } from 'react';
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

// ─── Story copy (display) ─────────────────────────────────────────────────────

const STORY = {
  th: {
    s1: {
      badge: '12 SICE Engines · AI · พฤติกรรม',
      h1: 'คุณคือใคร\nจริงๆ?',
      sub: 'ไม่ใช่ดวงชะตา ไม่ใช่ความเชื่อ\nแต่เป็นรูปแบบพฤติกรรมที่ซ่อนอยู่ในตัวคุณมาตลอด',
      scroll: 'เลื่อนลงเพื่อพบ NOVA',
    },
    s2: {
      eyeLabel: 'NOVA',
      h1: 'NOVA อ่านคุณออก\nก่อนที่คุณจะรู้จักตัวเอง',
      sub: 'Nova ประมวลผล Initial State Matrix วิเคราะห์รูปแบบพฤติกรรมของคุณผ่าน 12 มิติ — ก่อนที่คุณจะตอบคำถามแม้แต่ข้อเดียว',
      reading: [
        'กำลังสแกน Initial State Matrix...',
        'ตรวจพบรูปแบบพฤติกรรม 12 มิติ',
        'พบ Blind Spots ที่ซ่อนอยู่',
        'พร้อมถอดรหัสตัวตนของคุณ ✓',
      ],
      stats: [
        { value: '12', label: 'SICE Engines' },
        { value: '< 2 นาที', label: 'วิเคราะห์ครบ' },
        { value: '100%', label: 'ฟรี' },
      ],
    },
    s3: {
      h1: 'พร้อมเจอตัวตน\nที่แท้จริงแล้วหรือยัง?',
      bullets: [
        'รูปแบบพฤติกรรมที่ซ่อนอยู่ในตัวคุณ',
        'Blind Spots ที่ขัดขวางการตัดสินใจ',
        'AI Twin ที่รู้จักคุณดีกว่าตัวเอง',
      ],
      cta: 'สร้าง SELFPRINT ของฉัน →',
      trust: 'ฟรี · ไม่ต้องใส่บัตรเครดิต · ใช้เวลาไม่ถึง 2 นาที',
      login: 'มีบัญชีแล้ว? เข้าสู่ระบบ',
    },
  },
  en: {
    s1: {
      badge: '12 SICE Engines · Behavioral AI',
      h1: 'Who are you\nreally?',
      sub: 'Not destiny, not beliefs —\nbut behavioral patterns hiding inside you all along.',
      scroll: 'Scroll to meet NOVA',
    },
    s2: {
      eyeLabel: 'NOVA',
      h1: 'NOVA reads you\nbefore you know yourself',
      sub: 'Nova processes your Initial State Matrix across 12 behavioral dimensions — before you answer a single question.',
      reading: [
        'Scanning Initial State Matrix...',
        'Detecting 12-dimensional patterns',
        'Identifying hidden Blind Spots',
        'Ready to decode your identity ✓',
      ],
      stats: [
        { value: '12', label: 'SICE Engines' },
        { value: '< 2 min', label: 'Full Analysis' },
        { value: '100%', label: 'Free' },
      ],
    },
    s3: {
      h1: 'Ready to meet\nyour true self?',
      bullets: [
        'Behavioral patterns hidden inside you',
        'Blind spots blocking your decisions',
        'AI Twin that knows you better than you do',
      ],
      cta: 'Build My SELFPRINT →',
      trust: 'Free · No credit card · Under 2 minutes',
      login: 'Already have an account? Log in',
    },
  },
} as const;

// ─── SEO copy (segment-aware, meta only) ─────────────────────────────────────

type Segment = 'th-self' | 'mbti' | 'tech' | 'astrology' | 'default';

type SeoCopy = {
  seoTitle: string;
  seoDesc: string;
};

const SEO_COPY: Record<'th' | 'en', Record<Segment, SeoCopy>> = {
  th: {
    'th-self': {
      seoTitle: 'SELFPRINT | สร้าง AI Twin ภาษาไทย - ช่วยตัดสินใจชีวิต (ไม่ใช่ดูดวง)',
      seoDesc: 'เลิกเดาทิศทาง ให้ SELFPRINT วิเคราะห์ 12 มิติชีวิตด้วย AI และสถิติพฤติกรรมจริง ฟรี',
    },
    mbti: {
      seoTitle: 'SELFPRINT | AI Twin ดีกว่า MBTI — เรียนรู้จากพฤติกรรมจริง',
      seoDesc: 'SELFPRINT vs MBTI: AI Twin ที่เรียนรู้การตัดสินใจจริงของคุณ ไม่ใช่แค่แบบทดสอบ ลองฟรี',
    },
    tech: {
      seoTitle: 'SELFPRINT | Decision Intelligence Platform — AI Twin Thailand',
      seoDesc: 'Living Personal Intelligence Platform. 12 SICE Core Engines. Behavioral pattern simulation. Real-time Twin evolution.',
    },
    astrology: {
      seoTitle: 'SELFPRINT vs ดูดวง AI — ต่างกันอย่างไร? | SELFPRINT',
      seoDesc: 'ต้องการเข้าใจตัวเอง? SELFPRINT วิเคราะห์พฤติกรรมจริง ไม่ใช่โชคชะตา — แม่นกว่าเพราะเรียนรู้จากคุณ',
    },
    default: {
      seoTitle: 'SELFPRINT | สร้าง AI Twin ภาษาไทย - ช่วยตัดสินใจชีวิต',
      seoDesc: 'SELFPRINT วิเคราะห์ 12 มิติชีวิตด้วย AI Twin ที่เรียนรู้จากคุณจริงๆ ฟรี',
    },
  },
  en: {
    'th-self': {
      seoTitle: 'SELFPRINT | Your Living Personal Intelligence Platform & AI Twin',
      seoDesc: 'Stop guessing your life. 12 SICE Core Engines simulate decisions, detect blind spots, and evolve your Twin in real-time.',
    },
    mbti: {
      seoTitle: 'SELFPRINT | Better than MBTI — AI Twin that learns from you',
      seoDesc: 'SELFPRINT vs MBTI: AI Twin that learns from your real decisions, not a static test. Start free.',
    },
    tech: {
      seoTitle: 'SELFPRINT | AI Twin & Decision Intelligence Platform',
      seoDesc: 'Living Personal Intelligence Platform. 12 SICE Core Engines. Real-time behavioral learning. Decision simulation.',
    },
    astrology: {
      seoTitle: 'SELFPRINT vs Astrology AI — What\'s the Difference? | SELFPRINT',
      seoDesc: 'Looking to understand yourself? SELFPRINT analyzes real behavior — not destiny. More accurate because it learns from you.',
    },
    default: {
      seoTitle: 'SELFPRINT | Your Living Personal Intelligence Platform & AI Twin',
      seoDesc: 'Stop guessing your life. 12 SICE Core Engines simulate decisions, detect blind spots, and evolve your Twin.',
    },
  },
};

// ─── Hero Neural Network SVG ──────────────────────────────────────────────────

const HeroNetworkSvg = () => (
  <svg
    viewBox="0 0 320 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', maxWidth: 300, height: 'auto' }}
    aria-hidden="true"
  >
    <style>{`
      @keyframes pulse-node{0%,100%{opacity:.7}50%{opacity:1}}
      @keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-8px)}}
      .n1{animation:pulse-node 2.4s ease-in-out infinite}
      .n2{animation:pulse-node 2.4s .4s ease-in-out infinite}
      .n3{animation:pulse-node 2.4s .8s ease-in-out infinite}
      .n4{animation:pulse-node 2.4s 1.2s ease-in-out infinite}
      .n5{animation:pulse-node 2.4s 1.6s ease-in-out infinite}
      .hero-group{animation:drift 6s ease-in-out infinite}
    `}</style>
    <g className="hero-group">
      <rect x="116" y="116" width="88" height="88" rx="18" fill="var(--color-accent-primary)" opacity="0.08" stroke="var(--color-accent-primary)" strokeWidth="1.5"/>
      <rect x="132" y="132" width="56" height="56" rx="10" fill="var(--color-accent-primary)" opacity="0.15"/>
      <text x="160" y="166" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-accent-primary)" letterSpacing="0.5">SELFPRINT</text>
      <text x="160" y="178" textAnchor="middle" fontSize="8" fill="var(--color-accent-primary)" opacity="0.7">SICE × 12</text>
      {[134, 148, 162, 176].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="116" x2={x} y2="100" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          <line x1={x} y1="204" x2={x} y2="220" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </g>
      ))}
      {[134, 148, 162, 176].map((y, i) => (
        <g key={i}>
          <line x1="116" y1={y} x2="100" y2={y} stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          <line x1="204" y1={y} x2="220" y2={y} stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </g>
      ))}
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
      <line x1="160" y1="64" x2="160" y2="116" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="5 4" opacity="0.35"/>
      <line x1="256" y1="160" x2="204" y2="160" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="5 4" opacity="0.35"/>
      <line x1="160" y1="256" x2="160" y2="204" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="5 4" opacity="0.35"/>
      <line x1="64" y1="160" x2="116" y2="160" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="5 4" opacity="0.35"/>
      <line x1="245" y1="74" x2="204" y2="116" stroke="var(--color-accent-primary)" strokeWidth="0.75" strokeDasharray="4 5" opacity="0.25"/>
    </g>
  </svg>
);

// ─── NOVA Eye SVG ─────────────────────────────────────────────────────────────

const NovaEyeSvg = () => (
  <svg
    viewBox="0 0 280 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', maxWidth: 280, height: 'auto' }}
    aria-hidden="true"
  >
    <style>{`
      @keyframes nova-pulse{0%,100%{opacity:.06;r:118}50%{opacity:.12;r:122}}
      @keyframes nova-scan{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      @keyframes nova-blink{0%,85%,100%{opacity:1}92%{opacity:.1}}
      @keyframes nova-dash{0%{stroke-dashoffset:0}100%{stroke-dashoffset:60}}
      .nova-ring{animation:nova-pulse 3.5s ease-in-out infinite}
      .nova-scanner{animation:nova-scan 10s linear infinite;transform-origin:140px 140px}
      .nova-pupil{animation:nova-blink 5s ease-in-out infinite}
      .nova-dash{animation:nova-dash 4s linear infinite}
    `}</style>

    {/* Outer glow ring */}
    <circle className="nova-ring" cx="140" cy="140" r="118" stroke="var(--color-accent-primary)" strokeWidth="1" fill="none" opacity="0.06"/>

    {/* Dashed orbit ring */}
    <circle className="nova-dash" cx="140" cy="140" r="100" stroke="var(--color-accent-primary)" strokeWidth="0.75" fill="none" opacity="0.2" strokeDasharray="8 7"/>

    {/* Middle ring */}
    <circle cx="140" cy="140" r="72" stroke="var(--color-accent-primary)" strokeWidth="1" fill="none" opacity="0.25"/>

    {/* Inner iris ring */}
    <circle cx="140" cy="140" r="44" stroke="var(--color-accent-primary)" strokeWidth="1.5" fill="none" opacity="0.5"/>

    {/* Eye lens shape */}
    <path
      d="M28 140 Q140 42 252 140 Q140 238 28 140Z"
      fill="var(--color-accent-primary)" fillOpacity="0.04"
      stroke="var(--color-accent-primary)" strokeWidth="1.2" strokeOpacity="0.4"
    />

    {/* Iris fill */}
    <circle cx="140" cy="140" r="34" fill="var(--color-accent-primary)" opacity="0.08"/>

    {/* Iris detail lines */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      return (
        <line
          key={i}
          x1={140 + 18 * Math.cos(rad)}
          y1={140 + 18 * Math.sin(rad)}
          x2={140 + 34 * Math.cos(rad)}
          y2={140 + 34 * Math.sin(rad)}
          stroke="var(--color-accent-primary)"
          strokeWidth="0.75"
          opacity="0.35"
        />
      );
    })}

    {/* Pupil */}
    <circle className="nova-pupil" cx="140" cy="140" r="14" fill="var(--color-accent-primary)"/>
    <circle cx="134" cy="135" r="4" fill="white" opacity="0.15"/>
    <circle cx="140" cy="140" r="5" fill="var(--color-accent-primary)" opacity="0.3"/>

    {/* Scanner arm */}
    <g className="nova-scanner">
      <line x1="140" y1="140" x2="140" y2="42" stroke="var(--color-accent-primary)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
      <circle cx="140" cy="45" r="3.5" fill="var(--color-accent-primary)" opacity="0.7"/>
    </g>

    {/* Cardinal data nodes */}
    {[
      { deg: 0, r: 100 }, { deg: 45, r: 95 }, { deg: 90, r: 100 },
      { deg: 135, r: 95 }, { deg: 180, r: 100 }, { deg: 225, r: 95 },
      { deg: 270, r: 100 }, { deg: 315, r: 95 },
    ].map(({ deg, r }, i) => {
      const rad = (deg * Math.PI) / 180;
      const x = 140 + r * Math.cos(rad);
      const y = 140 + r * Math.sin(rad);
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={i % 2 === 0 ? 3.5 : 2.5} fill="var(--color-accent-primary)" opacity={i % 2 === 0 ? 0.55 : 0.3}/>
        </g>
      );
    })}

    {/* NOVA label */}
    <text x="140" y="218" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-accent-primary)" opacity="0.55" letterSpacing="5">NOVA</text>
  </svg>
);

// ─── Smart Entry Hook ─────────────────────────────────────────────────────────

function useSmartEntry() {
  const { language } = useLanguage();
  const navigate = useLangNavigate();
  const [segment, setSegment] = useState<Segment>('default');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    let seg: Segment = 'default';
    if (ref === 'mbti') seg = 'mbti';
    else if (ref === 'tech') seg = 'tech';
    else if (ref === 'astrology') seg = 'astrology';
    else if (language === 'th' || navigator.language.startsWith('th')) seg = 'th-self';

    setSegment(seg);

    const path = window.location.pathname;
    if (path === '/') {
      const browserLang = navigator.language.toLowerCase();
      const target = browserLang.startsWith('th') ? '/th' : '/en';
      navigate(target, { replace: true });
      return;
    }

    setReady(true);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  return { segment, ready };
}

// ─── WelcomeBackHero ──────────────────────────────────────────────────────────

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

// ─── ResumeHero ───────────────────────────────────────────────────────────────

function ResumeHero({ lang, onResume, onRestart }: { lang: 'th' | 'en'; onResume: () => void; onRestart: () => void }) {
  return (
    <section style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,48px)', background: 'linear-gradient(135deg,var(--color-bg-primary) 0%,var(--color-bg-secondary) 100%)' }}>
      <span style={{ display: 'inline-block', background: 'var(--color-bg-secondary)', color: 'var(--color-accent-primary)', border: '1.5px solid var(--color-accent-primary)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>
        {lang === 'th' ? 'เกือบเสร็จแล้ว!' : 'Almost there!'}
      </span>
      <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.25, marginBottom: 16, color: 'var(--color-text-primary)' }}>
        {lang === 'th' ? 'AI Twin ของคุณยังไม่สมบูรณ์' : "Your AI Twin isn't complete yet"}
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', maxWidth: 520, lineHeight: 1.8, marginBottom: 40 }}>
        {lang === 'th'
          ? 'คุณเริ่มสร้าง Twin ไว้แล้ว — ต่อจากที่ค้างไว้เพื่อเปิดใช้งานระบบเต็มรูปแบบ'
          : "You've started creating your Twin — resume where you left off to activate the full system."}
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

// ─── Scroll Arrow ─────────────────────────────────────────────────────────────

const ScrollArrow = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M11 4 L11 18 M5 12 L11 18 L17 12" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── LandingPage ──────────────────────────────────────────────────────────────

interface LandingPageProps {
  onStartOnboarding?: () => void;
}

export default function LandingPage({ onStartOnboarding }: LandingPageProps) {
  const { language } = useLanguage();
  const navigate = useLangNavigate();
  const { mood } = useEmotion();
  const { setLandingContext } = useUserStore();
  const { segment } = useSmartEntry();

  const { session } = useAuth();
  const { twin } = useTwin();
  const lifecycleStatus = useLifecycleStore((state) => state.status);

  const lang = (language === 'th' ? 'th' : 'en') as 'th' | 'en';
  const story = STORY[lang];
  const seo = SEO_COPY[lang][segment] ?? SEO_COPY[lang]['default'];
  const ogUrl = `https://selfprint.one/api/og?lang=${lang}&segment=${segment}`;

  // Scroll-triggered animation state
  const [s2Visible, setS2Visible] = useState(false);
  const [s3Visible, setS3Visible] = useState(false);
  const [readingStep, setReadingStep] = useState(0);
  const s2Ref = useRef<HTMLElement>(null);
  const s3Ref = useRef<HTMLElement>(null);

  const goFull = () => {
    setLandingContext({ mood });
    if (onStartOnboarding) {
      onStartOnboarding();
    } else {
      navigate('/onboarding');
    }
  };

  // IntersectionObserver — trigger per-screen animations once
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === s2Ref.current && entry.isIntersecting) {
            setS2Visible(true);
            story.s2.reading.forEach((_: string, i: number) => {
              if (i > 0) {
                timers.push(setTimeout(() => setReadingStep(i), i * 750));
              }
            });
            obs.unobserve(entry.target);
          }
          if (entry.target === s3Ref.current && entry.isIntersecting) {
            setS3Visible(true);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.25 },
    );

    if (s2Ref.current) obs.observe(s2Ref.current);
    if (s3Ref.current) obs.observe(s3Ref.current);

    return () => {
      obs.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Returning user gates ──
  if (session && lifecycleStatus && twin) {
    return (
      <>
        <NavBar position="fixed" />
        <WelcomeBackHero lang={lang} twinName={twin.name ?? undefined} onEnter={() => navigate('/twin')} />
        <Footer />
        <BottomNav />
      </>
    );
  }

  if (session && lifecycleStatus && lifecycleStatus === 'ONBOARDING') {
    return (
      <>
        <NavBar position="fixed" />
        <ResumeHero lang={lang} onResume={() => navigate('/onboarding')} onRestart={() => navigate('/onboarding')} />
        <Footer />
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <MetaTagManager
        title={seo.seoTitle}
        description={seo.seoDesc}
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
          description: seo.seoDesc,
          offers: { '@type': 'Offer', price: '0', priceCurrency: lang === 'th' ? 'THB' : 'USD' },
          featureList: lang === 'th'
            ? ['AI Digital Twin สร้างใน 2 นาที', '12 Hub Worlds วิเคราะห์ชีวิต', 'Behavioral Pattern Recognition', 'Decision simulation', 'Real-time learning Twin']
            : ['AI Digital Twin creation', '12 Intelligence Hub Worlds', 'Real-time behavioral learning', 'Future decision simulation', 'Memory-enabled Twin evolution'],
        }}
      />

      <style>{`
        @keyframes hero-enter{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sp-bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(7px)}}
        @keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fade-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .hero-badge{animation:hero-enter .7s .05s both}
        .hero-title{animation:hero-enter .8s .15s both}
        .hero-sub{animation:hero-enter .8s .3s both}
        .hero-cta{animation:hero-enter .7s .45s both}
        .hero-visual{animation:hero-enter 1s .2s both}
        .hero-scroll{animation:sp-bounce 2.2s ease-in-out infinite}
        .sp-s2-enter{transition:opacity .6s ease,transform .6s ease}
        .sp-s3-enter{transition:opacity .7s ease,transform .7s ease}
        .sp-cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px color-mix(in srgb,var(--color-accent-primary) 45%,transparent)!important}
        .sp-cta-btn{transition:transform .2s,box-shadow .2s}
        @media(max-width:700px){
          .sp-s2-grid{grid-template-columns:1fr!important}
          .sp-nova-wrap{max-width:220px!important;margin:0 auto 32px!important}
          .sp-s3-bullets{text-align:left}
        }
      `}</style>

      <div style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontFamily: "'Inter','Noto Sans Thai',sans-serif" }}>

        {/* ── NAV ── */}
        <NavBar
          position="fixed"
          rightSlot={
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => navigate('/login')}
                style={{ padding: '10px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)' }}
              >
                {lang === 'th' ? 'เข้าสู่ระบบ' : 'Log in'}
              </button>
              <button
                onClick={goFull}
                style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: 'var(--color-accent-primary)', color: 'white', border: 'none' }}
              >
                {lang === 'th' ? 'เริ่มฟรี' : 'Start Free'}
              </button>
            </div>
          }
        />

        {/* ══════════════════════════════════════════════════════ */}
        {/* SCREEN 1 — "คุณคือใคร จริงๆ?"                        */}
        {/* ══════════════════════════════════════════════════════ */}
        <section
          style={{
            minHeight: '100vh',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center',
            padding: 'clamp(100px, 14vw, 160px) clamp(24px, 5vw, 80px) clamp(60px, 8vw, 80px)',
            background: 'var(--color-bg-primary)',
            overflow: 'hidden',
          }}
        >
          {/* Radial glow background */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70vw',
              height: '60vw',
              maxWidth: 700,
              maxHeight: 600,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, color-mix(in srgb, var(--color-accent-primary) 8%, transparent) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Left: text content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span
              className="hero-badge"
              style={{
                display: 'inline-block',
                background: 'color-mix(in srgb, var(--color-accent-primary) 15%, transparent)',
                color: 'var(--color-accent-primary)',
                border: '1px solid color-mix(in srgb, var(--color-accent-primary) 35%, transparent)',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: 'clamp(10px, 1.5vw, 12px)',
                fontWeight: 600,
                marginBottom: '24px',
                letterSpacing: '0.04em',
              }}
            >
              {story.s1.badge}
            </span>

            <h1
              className="hero-title"
              style={{
                fontSize: 'clamp(40px, 6vw, 76px)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '24px',
                color: 'var(--color-text-primary)',
                whiteSpace: 'pre-line',
                letterSpacing: '-0.02em',
              }}
            >
              {story.s1.h1}
            </h1>

            <p
              className="hero-sub"
              style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.9,
                marginBottom: '40px',
                maxWidth: '480px',
                whiteSpace: 'pre-line',
              }}
            >
              {story.s1.sub}
            </p>

            <div className="hero-cta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={goFull}
                className="sp-cta-btn"
                style={{
                  padding: '15px 32px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 20px color-mix(in srgb, var(--color-accent-primary) 35%, transparent)',
                }}
              >
                {lang === 'th' ? 'ค้นพบตัวเอง →' : 'Discover Myself →'}
              </button>
              <span
                onClick={() => navigate('/login')}
                style={{ fontSize: '14px', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--color-border)' }}
              >
                {lang === 'th' ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'Have an account? Log in'}
              </span>
            </div>
          </div>

          {/* Right: visual */}
          <div
            className="hero-visual"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'clamp(16px, 3vw, 28px)',
              background: 'color-mix(in srgb, var(--color-accent-primary) 5%, var(--color-bg-secondary))',
              borderRadius: '24px',
              border: '1px solid var(--color-border)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <HeroNetworkSvg />
          </div>

          {/* Scroll indicator */}
          <div
            className="hero-scroll"
            style={{
              position: 'absolute',
              bottom: '32px',
              left: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>
              {story.s1.scroll}
            </span>
            <ScrollArrow />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════ */}
        {/* SCREEN 2 — "NOVA อ่านคุณออก..."                      */}
        {/* ══════════════════════════════════════════════════════ */}
        <section
          ref={s2Ref}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)',
            background: 'var(--color-bg-secondary)',
            position: 'relative',
          }}
        >
          {/* Section header */}
          <div
            className="sp-s2-enter"
            style={{
              textAlign: 'center',
              marginBottom: 'clamp(48px, 6vw, 72px)',
              opacity: s2Visible ? 1 : 0,
              transform: s2Visible ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <span style={{
              display: 'inline-block',
              background: 'color-mix(in srgb, var(--color-accent-primary) 12%, transparent)',
              color: 'var(--color-accent-primary)',
              border: '1px solid color-mix(in srgb, var(--color-accent-primary) 30%, transparent)',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              {story.s2.eyeLabel}
            </span>
            <h2 style={{
              fontSize: 'clamp(30px, 4.5vw, 58px)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: 'var(--color-text-primary)',
              whiteSpace: 'pre-line',
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}>
              {story.s2.h1}
            </h2>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.85,
            }}>
              {story.s2.sub}
            </p>
          </div>

          {/* Two-column: NOVA eye + reading cards */}
          <div
            className="sp-s2-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(32px, 5vw, 72px)',
              alignItems: 'center',
              maxWidth: '960px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            {/* NOVA SVG */}
            <div
              className="sp-nova-wrap sp-s2-enter"
              style={{
                opacity: s2Visible ? 1 : 0,
                transform: s2Visible ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: '0.1s',
              }}
            >
              <NovaEyeSvg />
            </div>

            {/* Reading cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {story.s2.reading.map((line: string, i: number) => {
                const isDone = i < readingStep;
                const isActive = i === readingStep && s2Visible;
                return (
                  <div
                    key={i}
                    style={{
                      opacity: s2Visible && i <= readingStep ? 1 : 0,
                      transform: s2Visible && i <= readingStep ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'opacity 0.45s ease, transform 0.45s ease',
                      transitionDelay: `${i * 0.1}s`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 18px',
                      background: isDone
                        ? 'color-mix(in srgb, var(--color-accent-primary) 8%, var(--color-bg-primary))'
                        : isActive
                          ? 'color-mix(in srgb, var(--color-accent-primary) 5%, var(--color-bg-primary))'
                          : 'var(--color-bg-primary)',
                      borderRadius: '10px',
                      border: `1px solid ${isDone ? 'color-mix(in srgb, var(--color-accent-primary) 30%, transparent)' : 'var(--color-border)'}`,
                    }}
                  >
                    <span style={{
                      minWidth: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: isDone ? 'var(--color-accent-primary)' : 'transparent',
                      color: isDone ? 'white' : 'var(--color-accent-primary)',
                      border: isDone ? 'none' : `1.5px solid ${isActive ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                      flexShrink: 0,
                    }}>
                      {isDone ? '✓' : isActive ? '▸' : '·'}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isDone ? 500 : 400,
                      color: isDone ? 'var(--color-accent-primary)' : isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      flex: 1,
                    }}>
                      {line}
                    </span>
                    {isActive && readingStep < story.s2.reading.length - 1 && (
                      <span style={{ width: '2px', height: '14px', background: 'var(--color-accent-primary)', display: 'inline-block', animation: 'cursor-blink 1s infinite', flexShrink: 0 }}/>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats row */}
          <div
            className="sp-s2-enter"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(24px, 5vw, 64px)',
              marginTop: 'clamp(48px, 6vw, 72px)',
              flexWrap: 'wrap',
              opacity: s2Visible ? 1 : 0,
              transform: s2Visible ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: '0.4s',
            }}
          >
            {story.s2.stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: 'var(--color-accent-primary)', lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════ */}
        {/* SCREEN 3 — CTA                                        */}
        {/* ══════════════════════════════════════════════════════ */}
        <section
          ref={s3Ref}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)',
            background: 'color-mix(in srgb, var(--color-accent-primary) 7%, var(--color-bg-primary))',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 40%, color-mix(in srgb, var(--color-accent-primary) 12%, transparent) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          />

          <div
            className="sp-s3-enter"
            style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: '680px',
              opacity: s3Visible ? 1 : 0,
              transform: s3Visible ? 'translateY(0)' : 'translateY(24px)',
            }}
          >
            {/* Accent line */}
            <div style={{
              width: '48px',
              height: '3px',
              background: 'var(--color-accent-primary)',
              borderRadius: '2px',
              margin: '0 auto 32px',
              opacity: 0.7,
            }}/>

            <h2 style={{
              fontSize: 'clamp(34px, 5.5vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.1,
              color: 'var(--color-text-primary)',
              whiteSpace: 'pre-line',
              letterSpacing: '-0.02em',
              marginBottom: '40px',
            }}>
              {story.s3.h1}
            </h2>

            {/* Discovery bullets */}
            <ul
              className="sp-s3-bullets"
              style={{ listStyle: 'none', padding: 0, margin: '0 auto 48px', display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '440px' }}
            >
              {story.s3.bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--color-accent-primary) 15%, transparent)',
                    border: '1.5px solid color-mix(in srgb, var(--color-accent-primary) 40%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '10px',
                    color: 'var(--color-accent-primary)',
                  }}>✦</span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Primary CTA */}
            <button
              onClick={goFull}
              className="sp-cta-btn"
              style={{
                padding: 'clamp(16px, 2vw, 20px) clamp(40px, 5vw, 64px)',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: 'clamp(16px, 2vw, 20px)',
                cursor: 'pointer',
                background: 'var(--color-accent-primary)',
                color: 'white',
                border: 'none',
                boxShadow: '0 6px 28px color-mix(in srgb, var(--color-accent-primary) 40%, transparent)',
                display: 'block',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto 20px',
              }}
            >
              {story.s3.cta}
            </button>

            {/* Trust line */}
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px', opacity: 0.75 }}>
              {story.s3.trust}
            </p>

            {/* Login link */}
            <span
              onClick={() => navigate('/login')}
              style={{ fontSize: '14px', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--color-border)' }}
            >
              {story.s3.login}
            </span>
          </div>
        </section>

        <Footer />
        <BottomNav />
      </div>
    </>
  );
}
