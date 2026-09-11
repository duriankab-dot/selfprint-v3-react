/**
 * QuickSummary.tsx
 *
 * 6-section identity summary card + Social Share buttons (Facebook, Line, X).
 *
 * Sections: Core Identity, Decision Style, Strengths, Blind Spots,
 * Growth Opportunities, Current Mood
 */

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useEmotion } from '@/context/EmotionContext';
import type { InitialDisciplines } from '@/lib/astrology.js';
import type { AnalysisResponse } from '@/lib/types/astrovera.js';

interface QuickSummaryProps {
  disciplines: InitialDisciplines;
  analysis: AnalysisResponse;
  birthDate?: string;
}

export default function QuickSummary({ disciplines, analysis }: QuickSummaryProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { mood } = useEmotion();

  const [copied, setCopied] = useState(false);

  const coreIdentity = disciplines.prototypeCore || 'Explorer';
  const decisionStyle = analysis.decisionStyle || '';
  const strengths = analysis.strengths?.slice(0, 3) || [];
  const blindSpots = analysis.blindSpots?.slice(0, 2) || [];
  const opportunities = analysis.opportunities?.slice(0, 2) || [];

  // ─── Share caption ──────────────────────────────────────────────────────────

  const shareCaption = isTh
    ? `เพิ่งไปลองอ่านบทวิเคราะห์ตัวตนมา ผลบอกว่าเนื้อแท้ของเราคือ จิตวิญญาณแห่ง ${coreIdentity} เป็น ${decisionStyle} ที่ชอบ ${analysis.insights?.[0]?.slice(0, 40) || 'ค้นพบตัวเอง'}! แม่นจนขนลุก ตรงกับตัวเองตอนนี้มากๆ 🔮✨ ใครอยากรู้ลองไปเล่นดูนะ #SelfPrint #ค้นพบตัวตน`
    : `Just discovered my true identity — I'm a ${coreIdentity}, ${decisionStyle} who ${analysis.insights?.[0]?.slice(0, 40) || 'explores deeply'}! So accurate it gave me chills 🔮✨ Try it yourself: #SelfPrint #DiscoverYourself`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareCaption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    const caption = encodeURIComponent(shareCaption);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${caption}`, '_blank', 'width=600,height=400');
  };

  const handleLineShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareCaption);
    window.open(`https://line.me/R/msg/text/?${text}${url}`, '_blank');
  };

  const handleXShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareCaption);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  // ─── Thai copy ──────────────────────────────────────────────────────────────

  if (isTh) {
    return (
      <section
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: 'clamp(24px, 4vw, 40px)',
        }}
      >
        {/* 6-Section Summary Card */}
        <div
          style={{
            background: 'rgba(10, 12, 28, 0.5)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(91, 92, 235, 0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(91,92,235,0.15), transparent)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-accent-primary)', margin: 0 }}>
              สรุปตัวตนฉบับด่วน
            </h3>
          </div>

          {/* Sections */}
          <div style={{ padding: '20px' }}>
            {/* Core Identity */}
            <SummaryItem icon="🧬" label="จิตวิญญาณหลัก (Core Identity)" value={coreIdentity} />

            {/* Decision Style */}
            <SummaryItem icon="⚡" label="สไตล์การตัดสินใจ" value={decisionStyle} />

            {/* Strengths */}
            <SummaryItem icon="💪" label="จุดแข็ง" valueArray={strengths} />

            {/* Blind Spots */}
            <SummaryItem icon="👁️" label="จุดบอด (Blind Spots)" valueArray={blindSpots} />

            {/* Opportunities */}
            <SummaryItem icon="🌱" label="โอกาสในการเติบโต" valueArray={opportunities} />

            {/* Mood */}
            {mood && (
              <SummaryItem icon="🎭" label="อารมณ์ปัจจุบัน" value={translateMood(mood)} />
            )}
          </div>
        </div>

        {/* Social Share Section */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            ส่งต่อตัวตนที่ใช่ ให้เพื่อนรู้จักคุณมากขึ้น
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <ShareButton label="แชร์ลง Facebook" onClick={handleFacebookShare} color="#1877F2" />
            <ShareButton label="ส่งต่อใน Line" onClick={handleLineShare} color="#06C755" />
            <ShareButton label="แชร์ลง X" onClick={handleXShare} color="#1DA1F2" />
            <ShareButton label="คัดลอกข้อความ" onClick={handleCopy} color="var(--color-accent-primary)" altText={copied ? 'คัดลอกแล้ว!' : undefined} />
          </div>
        </div>
      </section>
    );
  }

  // ─── English copy ───────────────────────────────────────────────────────────

  return (
    <section
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: 'clamp(24px, 4vw, 40px)',
      }}
    >
      {/* 6-Section Summary Card */}
      <div
        style={{
          background: 'rgba(10, 12, 28, 0.5)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(91, 92, 235, 0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(91,92,235,0.15), transparent)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-accent-primary)', margin: 0 }}>
            Quick Identity Summary
          </h3>
        </div>

        {/* Sections */}
        <div style={{ padding: '20px' }}>
          <SummaryItem icon="🧬" label="Core Identity" value={coreIdentity} />
          <SummaryItem icon="⚡" label="Decision Style" value={decisionStyle} />
          <SummaryItem icon="💪" label="Strengths" valueArray={strengths} />
          <SummaryItem icon="👁️" label="Blind Spots" valueArray={blindSpots} />
          <SummaryItem icon="🌱" label="Growth Opportunities" valueArray={opportunities} />
          {mood && (
            <SummaryItem icon="🎭" label="Current Mood" value={translateMood(mood)} />
          )}
        </div>
      </div>

      {/* Social Share Section */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          Share your true self — help others understand you better
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <ShareButton label="Share on Facebook" onClick={handleFacebookShare} color="#1877F2" />
          <ShareButton label="Send via Line" onClick={handleLineShare} color="#06C755" />
          <ShareButton label="Share on X" onClick={handleXShare} color="#1DA1F2" />
          <ShareButton label="Copy Caption" onClick={handleCopy} color="var(--color-accent-primary)" altText={copied ? 'Copied!' : undefined} />
        </div>
      </div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryItem({ icon, label, value, valueArray }: {
  icon: string;
  label: string;
  value?: string;
  valueArray?: string[];
}) {
  return (
    <div style={{
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          {label}
        </div>
        {value && (
          <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{value}</div>
        )}
        {valueArray && valueArray.length > 0 && (
          <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {valueArray.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ShareButton({ label, onClick, color, altText }: {
  label: string;
  onClick: () => void;
  color: string;
  altText?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '13px',
        cursor: 'pointer',
        background: color,
        color: color === 'var(--color-accent-primary)' || color === '#E6E6FA' ? 'var(--color-text-primary)' : 'white',
        border: 'none',
        transition: 'opacity .2s, transform .2s',
        opacity: altText ? 0.7 : 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = altText ? 0.7 : 1; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {altText || label}
    </button>
  );
}

function translateMood(mood: string): string {
  const moodMap: Record<string, string> = {
    stressed: 'เครียด / กดดัน',
    confused: 'สับสน / ไม่แน่ใจ',
    confident: 'มั่นใจ / พร้อม',
    drained: 'หมดพลัง / อ่อนล้า',
    ready: 'พร้อม / ฮึกเหิม',
    reflective: 'ครุ่นคิด / สงบ',
    neutral: 'ปกติ / เฉยๆ',
  };
  return moodMap[mood] || mood;
}
