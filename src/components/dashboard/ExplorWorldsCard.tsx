/**
 * ExplorWorldsCard.tsx
 * Quick action card to explore 12 Worlds from dashboard
 * Appears prominently for authenticated users (P0 #7)
 */

import type { ReactNode } from 'react';
import { useLangNavigate as useNavigate } from '../../hooks/useLangNavigate';
import { useLanguage } from '../../context/LanguageContext';

export function ExplorWorldsCard(): ReactNode {
  const navigate = useNavigate();
  // I18N-001 FIX + DASHBOARD-POLISH-001: this card never checked language at
  // all — it rendered hard-coded English ("Explore the 12 Worlds" etc.) even
  // on /th. Also bumped to match the rest of the redesigned Dashboard: full
  // rounded button + shadow + hover lift, and the hover-darken used
  // color-mix(... 120%, transparent) which is out of range (0-100%) and did
  // nothing — replaced with the same lift+shadow pattern used elsewhere.
  const { language } = useLanguage();
  const isTh = language === 'th';

  return (
    <div
      style={{
        maxWidth: '100%',
        margin: '0 auto var(--space-2xl, 40px)',
        padding: 'var(--space-xl, 32px)',
        borderRadius: 'var(--radius-2xl, 24px)',
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-primary) 15%, transparent), color-mix(in srgb, var(--color-accent-secondary, var(--color-accent-primary)) 10%, transparent))',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
      }}
      onClick={() => navigate('/worlds')}
    >
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 0.5rem',
          color: 'var(--color-text-primary)',
        }}
      >
        🌍 {isTh ? 'สำรวจ 12 โลกแห่งชีวิต' : 'Explore the 12 Worlds'}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          margin: '0 0 1.5rem',
          lineHeight: 1.5,
        }}
      >
        {isTh
          ? 'ค้นพบมิติต่างๆ ของชีวิตคุณ พร้อมคำแนะนำจากฝาแฝดที่ปรับให้เข้ากับแต่ละโลก'
          : 'Discover life domains and get Twin guidance tailored to each world'}
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/worlds');
        }}
        style={{
          padding: '12px 28px',
          borderRadius: 'var(--radius-full, 999px)',
          border: 'none',
          background: 'var(--color-accent-primary)',
          color: 'white',
          fontWeight: 700,
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px color-mix(in srgb, var(--color-accent-primary) 35%, transparent)',
          transition: 'transform 150ms, box-shadow 150ms',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px color-mix(in srgb, var(--color-accent-primary) 45%, transparent)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'none';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px color-mix(in srgb, var(--color-accent-primary) 35%, transparent)';
        }}
      >
        {isTh ? 'สำรวจโลกทั้งหมด →' : 'Explore Worlds →'}
      </button>
    </div>
  );
}
