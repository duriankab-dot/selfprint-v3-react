/**
 * TodayBioEnvironmentReport.tsx
 *
 * "Today's Bio-Environmental Resonance Report" — Bio-Tracking Dashboard
 * styled like Oura Ring / Whoop / Apple Health / Cyberpunk UI.
 *
 * Displays Daily Time & Energy Dynamics calculated from Vedic Hora/Panchang
 * logic behind the scenes, but presents everything in scientific/chronopsychology
 * terminology only.
 *
 * Features:
 *  - Dynamic daily refresh (recalculates on new date)
 *  - CTA → Full Analysis + Onboarding
 *  - Retention loop: users bookmark and return every morning
 */

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUserStore } from '@/store/userStore';
import { useLangNavigate } from '@/hooks/useLangNavigate';
import { calculateDailyDynamics } from '@/lib/astrology.js';

interface TodayBioEnvironmentReportProps {
  birthDate: string;
  compact?: boolean;
}

// ─── Helper: get current date string for daily comparison ────────────────────

function todayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GaugeBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{ fontSize: '20px', fontWeight: 800, color }} >{value}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            borderRadius: '3px',
            transition: 'width 1s ease-out',
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

function PhaseCard({ icon, title, timeRange, description, type }: {
  icon: string;
  title: string;
  timeRange: string;
  description: string;
  type: 'accelerated' | 'friction';
}) {
  const borderColor = type === 'accelerated' ? 'var(--color-accent-primary)' : '#ef5350';

  return (
    <div
      style={{
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        border: `1px solid ${borderColor}44`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
          opacity: 0.8,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 10 }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: borderColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </span>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
        {timeRange}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

function ColorBlock({ name, hex }: { name: string; hex: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: hex,
          boxShadow: `0 0 16px ${hex}44, inset 0 1px 2px rgba(255,255,255,0.2)`,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Active Resonance Color
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{name}</div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', marginTop: 2 }}>{hex}</div>
      </div>
    </div>
  );
}

// ─── Thai copy ────────────────────────────────────────────────────────────────

const TH = {
  title: '🌐 TODAY\'S BIO-ENVIRONMENTAL RESONANCE REPORT',
  subtitle: 'รายงานการสั่นพ้องทางชีวภาพและสิ่งแวดล้อมรายวัน',
  attractionLabel: 'ดัชนีการตอบสนองต่อสิ่งแวดล้อมวันนี้',
  attractionDesc: 'สภาพตัวตนภายนอกมีเสถียรภาพสูง',
  timeDynamics: 'จังหวะมิติเวลา (Time Dynamics)',
  acceleratedTitle: 'หน้าต่างจังหวะเร่งประสิทธิภาพ',
  acceleratedDesc: 'ช่วงเวลาที่สมองเข้าสู่โหมดลื่นไหลสูงสุด เหมาะแก่การยื่นข้อเสนอ ปิดดีลสำคัญ หรือเจรจาผลประโยชน์',
  frictionTitle: 'ช่วงสภาวะแรงต้านแวดล้อมสูง',
  frictionDesc: 'ตรวจพบแรงต้านทางอารมณ์จากสิ่งแวดล้อมรอบตัว ระวังการปะทะ แนะนำให้ลดความเร็วในการตัดสินใจ',
  attractionVector: 'ดัชนีแรงดึงดูดวัตถุและโอกาสภายนอก (External Attraction Vector)',
  attractionVectorDesc: (score: number) =>
    `วิเคราะห์โอกาสที่วัตถุหรือสิ่งแวดล้อมภายนอกจะเอื้ออำนวยให้เกิดผลประโยชน์สูงสุดในวันนี้ เช่น "วันนี้ดัชนีการดึงดูดทรัพยากรภายนอกของคุณพุ่งสูงขึ้น ${score}% เหมาะแก่การยื่นข้อเสนอ เปิดรับการเจรจาตัวเลข หรือปิดดีลสำคัญ สิ่งแวดล้อมกำลังหมุนรอบผลประโยชน์ของคุณ"`,
  relationalResonance: 'คลื่นความสัมพันธ์ส่งเสริม (Relational Resonance Graph)',
  relationalDesc: 'Analytical Nodes (กลุ่มคนสายตรรกะ) — วันนี้คลื่นความถี่ของคุณเปิดรับการส่งเสริมจากผู้ที่มีลักษณะตรรกะสูง การปรึกษาหรือทำงานร่วมกับคนกลุ่มนี้จะช่วยขยายผลลัพธ์ได้ทวีคูณ',
  socialFriction: 'ดัชนีแรงเสียดทานจากบุคคลภายนอก (Social Friction Intercept)',
  socialFrictionDesc: (_start: string, _end: string) =>
    `ตรวจพบสัญญาณแรงเสียดทานทางอารมณ์จากบุคคลรอบข้างในช่วงเวลาดังกล่าว แนะนำให้ลดการปะทะหรือระวังการตีความเจตนาที่ผิดพลาดจากฝ่ายตรงข้าม`,
  colorTitle: 'มิติคลื่นแสงประจำวัน (Color Frequency Alignment)',
  colorDesc: 'การเปิดรับหรือใช้สีนี้ในพื้นที่ทำงานวันนี้ จะช่วยลดแรงกระตุ้นประจุลบ และเพิ่มสมาธิในการวิเคราะห์',
  ctaText: 'ปลดล็อกตารางเวลาชีวภาพและความถนัดถาวรของคุณ\n(Full 12-SICE Intelligence Analysis)',
  ctaSubtext: 'ลงทะเบียนเพื่อเข้าถึง Full Analysis แบบครบถ้วน',
  lastUpdated: 'อัปเดตข้อมูลอัตโนมัติทุกวัน',
};

// ─── English copy ─────────────────────────────────────────────────────────────

const EN = {
  title: '🌐 TODAY\'S BIO-ENVIRONMENTAL RESONANCE REPORT',
  subtitle: 'Daily Bio-Environmental Resonance Analysis',
  attractionLabel: 'Environmental Response Index Today',
  attractionDesc: 'High external identity stability detected',
  timeDynamics: 'Time Dynamics',
  acceleratedTitle: 'Accelerated Phase Window',
  acceleratedDesc: 'Peak cognitive flow state — optimal for proposals, deal closure, or high-stakes negotiations',
  frictionTitle: 'High Friction Interval',
  frictionDesc: 'Elevated environmental emotional resistance detected. Exercise caution; reduce decision-making velocity',
  attractionVector: 'External Attraction Vector',
  attractionVectorDesc: (score: number) =>
    `Analysis shows external resources and opportunities are aligned at ${score}% today. Ideal window for presenting offers, negotiating terms, or closing important deals. The environment is rotating around your benefit.`,
  relationalResonance: 'Relational Resonance Graph',
  relationalDesc: 'Analytical Nodes — Your frequency band is open to support from highly analytical individuals. Collaboration with this cluster amplifies outcomes exponentially.',
  socialFriction: 'Social Friction Intercept',
  socialFrictionDesc: (_start: string, _end: string) =>
    `Emotional friction signals from surrounding individuals detected during this window. Recommend de-escalation and careful interpretation of opposing intentions.`,
  colorTitle: 'Color Frequency Alignment',
  colorDesc: 'Exposure to or use of this color in your workspace today reduces negative charge stimulation and enhances analytical focus.',
  ctaText: 'Unlock Your Biological Schedule & Permanent Aptitudes\n(Full 12-SICE Intelligence Analysis)',
  ctaSubtext: 'Register for complete Full Analysis access',
  lastUpdated: 'Auto-refreshes daily',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TodayBioEnvironmentReport({ birthDate, compact = false }: TodayBioEnvironmentReportProps) {
  const { language } = useLanguage();
  const navigate = useLangNavigate();
  const { setLandingContext } = useUserStore();
  const isTh = language === 'th';
  const t = isTh ? TH : EN;

  const [dailyData, setDailyData] = useState(() =>
    calculateDailyDynamics(birthDate, new Date())
  );
  const [lastRefresh, setLastRefresh] = useState(todayDateString());
  const prevDateRef = useRef(lastRefresh);

  // Daily refresh: recalculate when date changes
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const today = todayDateString();
      if (today !== prevDateRef.current) {
        prevDateRef.current = today;
        setDailyData(calculateDailyDynamics(birthDate, new Date()));
        setLastRefresh(today);
      }
    }, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(checkInterval);
  }, [birthDate]);

  const handleCTAClick = () => {
    setLandingContext({ mood: undefined });
    navigate('/onboarding');
  };

  const accStart = dailyData.dailyAcceleratedPhaseStart ?? '--:--';
  const accEnd = dailyData.dailyAcceleratedPhaseEnd ?? '--:--';
  const fricStart = dailyData.dailyHighFrictionStart ?? '--:--';
  const fricEnd = dailyData.dailyHighFrictionEnd ?? '--:--';
  const score = dailyData.dailyAttractionVectorScore ?? 50;
  const colorName = dailyData.dailyCircadianColorNameTh ?? '';
  const colorHex = dailyData.dailyCircadianColorHex ?? '#8FBC8F';

  return (
    <section
      style={{
        maxWidth: '520px',
        margin: '0 auto',
        padding: compact ? '16px' : 'clamp(24px, 4vw, 40px)',
        background: 'rgba(10, 12, 28, 0.6)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(91, 92, 235, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--color-accent-primary), transparent)',
          opacity: 0.6,
        }}
      />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: compact ? '13px' : '15px',
            fontWeight: 800,
            color: 'var(--color-accent-primary)',
            letterSpacing: '0.04em',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
          }}
        >
          {t.title}
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
          {t.subtitle} · {t.lastUpdated} · {lastRefresh}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)', marginBottom: '20px' }} />

      {/* Attraction Score Gauge */}
      <GaugeBar value={score} label={t.attractionLabel} color="var(--color-accent-primary)" />

      {/* Time Dynamics — Accelerated Phase + High Friction */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          ⏱️ {t.timeDynamics}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PhaseCard
            icon="🎯"
            title={t.acceleratedTitle}
            timeRange={`${accStart} — ${accEnd} น.`}
            description={t.acceleratedDesc}
            type="accelerated"
          />
          <PhaseCard
            icon="⚠️"
            title={t.frictionTitle}
            timeRange={`${fricStart} — ${fricEnd} น.`}
            description={t.frictionDesc}
            type="friction"
          />
        </div>
      </div>

      {/* External Attraction Vector Description */}
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0', paddingLeft: '12px', borderLeft: '2px solid var(--color-accent-primary)33' }}>
        {t.attractionVectorDesc(score)}
      </p>

      {/* Relational Resonance */}
      <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          📡 {t.relationalResonance}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {t.relationalDesc}
        </p>
      </div>

      {/* Social Friction */}
      <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239,83,80,0.05)', borderRadius: '8px', border: '1px solid rgba(239,83,80,0.1)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef5350', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          🛡️ {t.socialFriction}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {t.socialFrictionDesc(fricStart, fricEnd)}
        </p>
      </div>

      {/* Color Frequency Alignment */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          🎨 {t.colorTitle}
        </div>
        <ColorBlock name={colorName} hex={colorHex} />
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: '10px 0 0 0', paddingLeft: '12px', borderLeft: '2px solid rgba(165,180,252,0.3)' }}>
          {t.colorDesc}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)', marginBottom: '20px' }} />

      {/* CTA Button */}
      <button
        onClick={handleCTAClick}
        className="sp-cta-btn"
        style={{
          width: '100%',
          padding: '14px 20px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '14px',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--color-accent-primary), #6366f1)',
          color: 'white',
          border: 'none',
          boxShadow: '0 0 20px rgba(91,92,235,0.4), 0 4px 16px rgba(91,92,235,0.25)',
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
          transition: 'transform .2s, box-shadow .2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(91,92,235,0.8), 0 8px 32px rgba(91,92,235,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(91,92,235,0.4), 0 4px 16px rgba(91,92,235,0.25)';
        }}
      >
        {t.ctaText}
        <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, opacity: 0.8, marginTop: 4 }}>
          {t.ctaSubtext}
        </span>
      </button>
    </section>
  );
}
