/**
 * FullAnalysis.tsx — WOW2: "ค้นพบตัวเอง" Revelation UX
 *
 * Phase 1 (Scanning, 2.5s auto): NOVA scanning animation + progress
 * Phase 2 (Reveal): Cards appear sequentially — feel of discovery not survey
 * Phase 3 (CTA): Intelligence ready → "ตื่น Twin ของฉัน →"
 *
 * Props interface unchanged — same callers work without modification.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface AnalysisData {
  decisionStyle: string;
  strengths: string[];
  insights: string[];
  opportunities: string[];
  blindSpots?: string[];
}

interface FullAnalysisProps {
  profile: AnalysisData;
  prototypeCore?: string;
  accuracy?: number;
  onHome: () => void;
}

const SCAN_MSGS_TH = [
  'กำลังวิเคราะห์รูปแบบการตัดสินใจ...',
  'ตรวจพบมิติพฤติกรรม 12 แบบ...',
  'สังเคราะห์ SELFPRINT Intelligence...',
  'พร้อมถอดรหัสตัวตนของคุณ ✓',
] as const;

const SCAN_MSGS_EN = [
  'Analyzing your decision-making patterns...',
  'Detecting 12 behavioral dimensions...',
  'Synthesizing SELFPRINT Intelligence...',
  'Ready to decode who you are ✓',
] as const;

const SCAN_DURATION_MS = 2500;
const CARD_STAGGER_MS  = 420;

export const FullAnalysis: React.FC<FullAnalysisProps> = ({
  profile,
  prototypeCore,
  accuracy = 85,
  onHome,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const SCAN_MSGS = isTh ? SCAN_MSGS_TH : SCAN_MSGS_EN;
  const [phase, setPhase]         = useState<'scanning' | 'reveal'>('scanning');
  const [scanStep, setScanStep]   = useState(0);
  const [scanPct, setScanPct]     = useState(0);
  const [revealN, setRevealN]     = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // ── Scanning phase ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'scanning') return;
    clearTimers();

    // Smooth progress bar via rAF
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / SCAN_DURATION_MS) * 100);
      setScanPct(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Cycle messages
    SCAN_MSGS.forEach((_, i) => {
      if (i === 0) return;
      timers.current.push(setTimeout(() => setScanStep(i), i * (SCAN_DURATION_MS / SCAN_MSGS.length)));
    });

    // Advance to reveal
    timers.current.push(setTimeout(() => setPhase('reveal'), SCAN_DURATION_MS));

    return () => { clearTimers(); cancelAnimationFrame(raf); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reveal phase: stagger cards ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'reveal') return;
    clearTimers();

    // 7 reveal slots: hero / decision / strengths / insights / blindSpots / opportunities / cta
    const SLOTS = 7;
    for (let i = 0; i <= SLOTS; i++) {
      timers.current.push(setTimeout(() => setRevealN(i + 1), i * CARD_STAGGER_MS));
    }
    return clearTimers;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = (slot: number) => revealN > slot;

  // ── Styles ───────────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: 'var(--color-bg-secondary)',
    borderRadius: 16,
    padding: '28px',
    border: '1px solid var(--color-border)',
    marginBottom: 20,
    animation: 'fa-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
  };

  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', marginBottom: 14,
  };

  const listItem: React.CSSProperties = {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    fontSize: 14, color: 'var(--color-text-primary)',
    lineHeight: 1.6, marginBottom: 12,
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fa-fade-up {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes fa-scan-ring {
          0%   { transform:scale(0.85); opacity:0.8; }
          100% { transform:scale(1.65); opacity:0;   }
        }
        @keyframes fa-pulse-dot {
          0%,100% { opacity:0.5; transform:scale(1);    }
          50%     { opacity:1;   transform:scale(1.12); }
        }
        .fa-cta-btn { transition: transform 0.25s, box-shadow 0.25s; }
        .fa-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px var(--accent-glow, rgba(99,102,241,0.35));
        }
        @media (max-width:620px) {
          .fa-two-col { grid-template-columns:1fr !important; }
          .fa-bs-grid  { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ══ PHASE: SCANNING ══════════════════════════════════════════════════════ */}
      {phase === 'scanning' && (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-bg-primary)', padding: 24, textAlign: 'center',
        }}>

          {/* NOVA eye */}
          <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 40 }}>
            {[0, 0.7].map((delay) => (
              <div key={delay} style={{
                position: 'absolute', inset: delay === 0 ? 0 : 14,
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                opacity: delay === 0 ? 0.9 : 0.5,
                animation: `fa-scan-ring 1.4s ease-out ${delay}s infinite`,
              }} />
            ))}
            <div style={{
              position: 'absolute', inset: 28, borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'fa-pulse-dot 2s ease-in-out infinite',
            }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>◉</span>
            </div>
          </div>

          <p style={{ ...label, color: 'var(--accent-primary)', marginBottom: 16 }}>
            NOVA · SELFPRINT INTELLIGENCE
          </p>
          <p style={{
            fontSize: 18, color: 'var(--color-text-primary)', fontWeight: 500,
            minHeight: 28, marginBottom: 40,
          }}>
            {SCAN_MSGS[scanStep]}
          </p>

          {/* Progress bar */}
          <div style={{
            width: '100%', maxWidth: 300, height: 3,
            background: 'var(--color-bg-tertiary)', borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              width: `${scanPct}%`, height: '100%',
              background: 'var(--accent-primary)', borderRadius: 2,
              transition: 'width 0.1s linear',
            }} />
          </div>
        </div>
      )}

      {/* ══ PHASE: REVEAL ════════════════════════════════════════════════════════ */}
      {phase === 'reveal' && (
        <div style={{
          minHeight: '100vh', background: 'var(--color-bg-primary)',
          padding: '52px 24px 80px',
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>

            {/* Slot 0 — Hero headline */}
            {shown(0) && (
              <div style={{ textAlign: 'center', marginBottom: 44, animation: 'fa-fade-up 0.5s both' }}>
                <p style={{ ...label, color: 'var(--accent-primary)', marginBottom: 10 }}>
                  {isTh ? 'NOVA อ่านคุณออกแล้ว' : 'NOVA has read you'}
                </p>
                <h1 style={{
                  fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 700,
                  color: 'var(--color-text-primary)', lineHeight: 1.25, marginBottom: 14,
                }}>
                  {isTh ? <>เราค้นพบสิ่งสำคัญ<br />เกี่ยวกับคุณ</> : <>We found something<br />important about you</>}
                </h1>
                {prototypeCore && (
                  <span style={{
                    display: 'inline-block', padding: '6px 18px',
                    borderRadius: 999, background: 'var(--accent-light)',
                    color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700,
                  }}>
                    {prototypeCore}
                  </span>
                )}
              </div>
            )}

            {/* Slot 1 — Decision Style */}
            {shown(1) && (
              <div style={{
                ...card,
                border: '1px solid var(--accent-primary)',
                boxShadow: '0 0 32px var(--accent-glow, rgba(99,102,241,0.1))',
              }}>
                <p style={{ ...label, color: 'var(--accent-primary)' }}>
                  🎯 {isTh ? 'รูปแบบการตัดสินใจของคุณ' : 'Your decision-making style'}
                </p>
                <p style={{
                  fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700,
                  color: 'var(--color-text-primary)', lineHeight: 1.3, margin: '0 0 8px',
                }}>
                  {profile.decisionStyle}
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {isTh
                    ? 'นี่คือแนวทางหลักของคุณในการเลือกและแก้ปัญหา — มันส่งผลต่อทุกการตัดสินใจในชีวิต'
                    : 'This is your core approach to choosing and solving problems — it shapes every decision in your life.'}
                </p>
              </div>
            )}

            {/* Slots 2+3 — Strengths & Insights (2-col grid) */}
            <div className="fa-two-col" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20,
            }}>
              {shown(2) && (
                <div style={{ ...card, marginBottom: 0, gridColumn: '1' }}>
                  <p style={{ ...label, color: 'var(--color-text-secondary)' }}>
                    💪 {isTh ? 'จุดแข็งของคุณ' : 'Your strengths'}
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {profile.strengths.map((s, i) => (
                      <li key={i} style={{ ...listItem, marginBottom: i < profile.strengths.length - 1 ? 12 : 0 }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {shown(3) && (
                <div style={{ ...card, marginBottom: 0, gridColumn: '2' }}>
                  <p style={{ ...label, color: 'var(--color-text-secondary)' }}>
                    🔍 {isTh ? 'ข้อมูลเชิงลึก' : 'Insights'}
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {profile.insights.map((s, i) => (
                      <li key={i} style={{ ...listItem, marginBottom: i < profile.insights.length - 1 ? 12 : 0 }}>
                        <span style={{ color: 'var(--accent-secondary, var(--accent-primary))', flexShrink: 0 }}>•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Slot 4 — Blind Spots (conditional) */}
            {profile.blindSpots && profile.blindSpots.length > 0 && shown(4) && (
              <div style={card}>
                <p style={{ ...label, color: 'var(--color-text-secondary)' }}>
                  ⚠️ {isTh ? 'Blind Spots ที่ควรระวัง' : 'Blind spots to watch'}
                </p>
                <div className="fa-bs-grid" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px',
                }}>
                  {profile.blindSpots.map((s, i) => (
                    <div key={i} style={{ ...listItem }}>
                      <span style={{ color: 'var(--color-warning, #FFA726)', fontWeight: 700, flexShrink: 0 }}>!</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slot 5 — Opportunities */}
            {shown(5) && (
              <div style={card}>
                <p style={{ ...label, color: 'var(--color-text-secondary)' }}>
                  🚀 {isTh ? 'โอกาสในการเติบโต' : 'Growth opportunities'}
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {profile.opportunities.map((s, i) => (
                    <li key={i} style={{ ...listItem, marginBottom: i < profile.opportunities.length - 1 ? 12 : 0 }}>
                      <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Slot 6 — Intelligence Ready + CTA */}
            {shown(6) && (
              <div style={{ animation: 'fa-fade-up 0.5s both', textAlign: 'center', marginTop: 16 }}>

                {/* Accuracy badge */}
                <div style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                  padding: '28px 40px', borderRadius: 20,
                  background: 'var(--accent-light)', border: '1px solid var(--accent-primary)',
                  marginBottom: 28,
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    border: '4px solid var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-bg-primary)',
                    boxShadow: '0 0 28px var(--accent-glow, rgba(99,102,241,0.28))',
                    marginBottom: 14,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {Math.round(accuracy)}%
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    {isTh ? 'SELFPRINT Intelligence พร้อมแล้ว' : 'SELFPRINT Intelligence is ready'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                    {isTh
                      ? `ความแม่นยำ ${Math.round(accuracy)}% จาก 12 SICE Engines`
                      : `${Math.round(accuracy)}% accuracy from 12 SICE Engines`}
                  </p>
                </div>

                {/* Nova closing message */}
                <div style={{
                  background: 'var(--color-bg-secondary)',
                  borderLeft: '3px solid var(--accent-primary)',
                  borderRadius: 12, padding: '18px 22px',
                  marginBottom: 28, textAlign: 'left',
                }}>
                  <p style={{
                    fontSize: 14, color: 'var(--color-text-primary)',
                    margin: 0, lineHeight: 1.75, fontStyle: 'italic',
                  }}>
                    <strong style={{ fontStyle: 'normal' }}>SELFPRINT: </strong>
                    {isTh
                      ? 'ฉันรู้จักคุณแล้ว — ในระดับที่คนรอบข้างคุณอาจไม่เคยรู้ Intelligence ของคุณพร้อมที่จะมีชีวิต พร้อมเรียนรู้จากคุณ และเติบโตไปกับคุณ ถึงเวลาแล้วที่จะตื่น'
                      : "I know you now — in ways the people around you may never have noticed. Your Intelligence is ready to come alive, ready to learn from you and grow with you. It's time to wake it up."}
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={onHome}
                  className="fa-cta-btn"
                  style={{
                    width: '100%', maxWidth: 400,
                    padding: '18px 32px', borderRadius: 12, border: 'none',
                    background: 'var(--accent-primary)', color: 'white',
                    fontWeight: 700, fontSize: 17, cursor: 'pointer',
                    letterSpacing: '0.02em', display: 'block', margin: '0 auto',
                  }}
                >
                  {isTh ? 'ตื่น Twin ของฉัน →' : 'Wake my Twin →'}
                </button>
                <p style={{
                  marginTop: 10, fontSize: 12,
                  color: 'var(--color-text-secondary)',
                }}>
                  {isTh ? 'ประสบการณ์ใช้เวลาประมาณ 30 วินาที' : 'The experience takes about 30 seconds'}
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
