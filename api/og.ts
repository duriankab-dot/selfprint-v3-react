/**
 * api/og.ts  — P0-J-3: Dynamic OG Image
 *
 * Vercel Edge Function using @vercel/og to generate a 1200×630 PNG
 * with SELFPRINT branding and scientific visual theme.
 *
 * Query params:
 *   ?lang=th|en        — language for text
 *   ?segment=th-self|mbti|tech|default  — variant headline
 *   ?title=Custom+Title  — override headline (optional)
 *   ?world=career|self|...  — show a world badge (optional)
 *
 * Usage: /api/og?lang=th&segment=th-self
 *
 * NOTE: @vercel/og requires Edge runtime.
 */

import { ImageResponse } from '@vercel/og';
import type { VercelRequest } from '@vercel/node';

export const config = { runtime: 'edge' };

// ─── Copy map ────────────────────────────────────────────────────────────────

const HEADLINES: Record<string, Record<string, string>> = {
  th: {
    'th-self': 'เลิกเดาทิศทางชีวิต ให้ AI วิเคราะห์',
    mbti: 'MBTI ให้ Label — AI Twin ให้ความเข้าใจ',
    tech: 'Decision Intelligence Platform',
    default: 'สร้าง AI Twin ที่เรียนรู้จากคุณจริงๆ',
  },
  en: {
    'th-self': 'The AI Twin That\'s Intelligent at Birth',
    mbti: 'Better Than MBTI — Your AI Twin Learns',
    tech: 'Behavioral AI Decision Intelligence',
    default: 'Your Living Personal Intelligence Platform',
  },
};

const SUBS: Record<string, string> = {
  th: '12 SICE Engines · วิเคราะห์พฤติกรรม · ตัดสินใจแม่น',
  en: '12 SICE Core Engines · Real-time Learning · Decision Simulation',
};

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest) {
  const url = new URL(req.url as string, 'https://selfprint.one');
  const lang = (url.searchParams.get('lang') ?? 'th') as 'th' | 'en';
  const segment = url.searchParams.get('segment') ?? 'default';
  const customTitle = url.searchParams.get('title');
  const worldBadge = url.searchParams.get('world');

  const headline =
    customTitle ??
    HEADLINES[lang]?.[segment] ??
    HEADLINES[lang]?.['default'] ??
    'SELFPRINT';

  const sub = SUBS[lang] ?? SUBS['en'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0d0d0f 0%, #111128 60%, #1a1040 100%)',
          fontFamily: 'Inter, Noto Sans Thai, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background subtle grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(91,92,235,0.18) 0%, transparent 50%), ' +
              'radial-gradient(circle at 20% 80%, rgba(139,92,246,0.12) 0%, transparent 50%)',
          }}
        />

        {/* Neural dots pattern top-right */}
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 80,
            width: 240,
            height: 240,
            opacity: 0.25,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 18,
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#818CF8',
                opacity: (i % 5 === 0) ? 1 : 0.4,
              }}
            />
          ))}
        </div>

        {/* Branding mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 40,
          }}
        >
          {/* Atom icon (SVG inlined) */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <ellipse cx="20" cy="20" rx="14" ry="5" stroke="#818CF8" strokeWidth="1.5" fill="none" opacity="0.7"/>
            <ellipse cx="20" cy="20" rx="14" ry="5" stroke="#818CF8" strokeWidth="1.5" fill="none" opacity="0.7" transform="rotate(60 20 20)"/>
            <ellipse cx="20" cy="20" rx="14" ry="5" stroke="#818CF8" strokeWidth="1.5" fill="none" opacity="0.7" transform="rotate(120 20 20)"/>
            <circle cx="20" cy="20" r="2.5" fill="#818CF8"/>
          </svg>
          <span style={{ color: '#818CF8', fontSize: 22, fontWeight: 700, letterSpacing: '0.04em' }}>
            SELFPRINT
          </span>
          {/* World badge */}
          {worldBadge && (
            <span
              style={{
                marginLeft: 8,
                background: 'rgba(129,140,248,0.15)',
                border: '1px solid rgba(129,140,248,0.4)',
                color: '#a5b4fc',
                fontSize: 13,
                padding: '4px 12px',
                borderRadius: 20,
                textTransform: 'capitalize',
              }}
            >
              {worldBadge}
            </span>
          )}
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: headline.length > 40 ? 46 : 56,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            maxWidth: 780,
            marginBottom: 24,
          }}
        >
          {headline}
        </div>

        {/* Sub text */}
        <div
          style={{
            fontSize: 22,
            color: '#a5b4fc',
            fontWeight: 400,
            letterSpacing: '0.02em',
            marginBottom: 48,
          }}
        >
          {sub}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 80,
            right: 80,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#6B7280', fontSize: 18 }}>selfprint.one</span>
          <span
            style={{
              background: 'rgba(129,140,248,0.15)',
              border: '1px solid rgba(129,140,248,0.5)',
              color: '#818CF8',
              padding: '8px 24px',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {lang === 'th' ? 'ทดลองฟรี' : 'Start Free'}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    }
  );
}
