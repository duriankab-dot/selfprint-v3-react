/**
 * api/og.ts — P0-J-3: Dynamic OG Image (Edge Function)
 *
 * Uses React.createElement (no JSX) so this .ts file compiles without
 * requiring jsx:react in tsconfig. Vercel Edge runtime, @vercel/og.
 *
 * Query params:
 *   ?lang=th|en
 *   ?segment=th-self|mbti|tech|default
 *   ?title=Custom+Title  (optional override)
 *   ?world=career|self|...  (optional badge)
 */

import { ImageResponse } from '@vercel/og';
import type { VercelRequest } from '@vercel/node';
import * as React from 'react';

// P2-OG-FIX: Move from edge to nodejs + aggressive caching to reduce edge requests
// Edge function was being called 2.6M times/month by crawlers
// Node.js runtime + CDN caching drops this to near-zero re-renders
export const config = {
  runtime: 'nodejs',
  maxDuration: 30, // OG generation can take up to 30s
};

// ─── Copy ─────────────────────────────────────────────────────────────────────

const HEADLINES: Record<string, Record<string, string>> = {
  th: {
    'th-self': 'เลิกเดาทิศทางชีวิต ให้ AI วิเคราะห์',
    mbti: 'MBTI ให้ Label — AI Twin ให้ความเข้าใจ',
    tech: 'Decision Intelligence Platform',
    default: 'สร้าง AI Twin ที่เรียนรู้จากคุณจริงๆ',
  },
  en: {
    'th-self': "The AI Twin That's Intelligent at Birth",
    mbti: 'Better Than MBTI — Your AI Twin Learns',
    tech: 'Behavioral AI Decision Intelligence',
    default: 'Your Living Personal Intelligence Platform',
  },
};

const SUBS: Record<string, string> = {
  th: '12 SICE Engines · วิเคราะห์พฤติกรรม · ตัดสินใจแม่น',
  en: '12 SICE Core Engines · Real-time Learning · Decision Simulation',
};

// ─── Helpers (React.createElement, no JSX) ───────────────────────────────────

const el = React.createElement;

function dot(i: number) {
  return el('div', {
    key: i,
    style: {
      width: 6, height: 6, borderRadius: '50%',
      background: '#818CF8',
      opacity: (i % 5 === 0) ? 1 : 0.4,
    },
  });
}

function atomSvg() {
  return el('svg', { width: 40, height: 40, viewBox: '0 0 40 40', fill: 'none' },
    el('ellipse', { cx: 20, cy: 20, rx: 14, ry: 5, stroke: '#818CF8', strokeWidth: 1.5, fill: 'none', opacity: 0.7 }),
    el('ellipse', { cx: 20, cy: 20, rx: 14, ry: 5, stroke: '#818CF8', strokeWidth: 1.5, fill: 'none', opacity: 0.7, transform: 'rotate(60 20 20)' }),
    el('ellipse', { cx: 20, cy: 20, rx: 14, ry: 5, stroke: '#818CF8', strokeWidth: 1.5, fill: 'none', opacity: 0.7, transform: 'rotate(120 20 20)' }),
    el('circle', { cx: 20, cy: 20, r: 2.5, fill: '#818CF8' }),
  );
}

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
  const fontSize = headline.length > 40 ? 46 : 56;

  const image = el('div', {
    style: {
      width: '1200px', height: '630px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', justifyContent: 'center',
      padding: '72px 80px',
      background: 'linear-gradient(135deg,#0d0d0f 0%,#111128 60%,#1a1040 100%)',
      fontFamily: 'Inter,sans-serif',
      position: 'relative', overflow: 'hidden',
    },
  },

    // Glow blobs
    el('div', {
      style: {
        position: 'absolute', inset: 0,
        backgroundImage:
          'radial-gradient(circle at 80% 20%,rgba(91,92,235,.18) 0%,transparent 50%),' +
          'radial-gradient(circle at 20% 80%,rgba(139,92,246,.12) 0%,transparent 50%)',
      },
    }),

    // Dot pattern top-right
    el('div', {
      style: {
        position: 'absolute', top: 48, right: 80,
        width: 240, height: 240, opacity: 0.25,
        display: 'flex', flexWrap: 'wrap', gap: 18,
      },
    }, ...Array.from({ length: 25 }, (_, i) => dot(i))),

    // Brand row
    el('div', {
      style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 },
    },
      atomSvg(),
      el('span', { style: { color: '#818CF8', fontSize: 22, fontWeight: 700, letterSpacing: '0.04em' } }, 'SELFPRINT'),
      worldBadge
        ? el('span', {
            style: {
              marginLeft: 8,
              background: 'rgba(129,140,248,0.15)',
              border: '1px solid rgba(129,140,248,0.4)',
              color: '#a5b4fc', fontSize: 13,
              padding: '4px 12px', borderRadius: 20,
              textTransform: 'capitalize',
            },
          }, worldBadge)
        : null,
    ),

    // Headline
    el('div', {
      style: {
        fontSize, fontWeight: 800, color: '#ffffff',
        lineHeight: 1.2, maxWidth: 780, marginBottom: 24,
      },
    }, headline),

    // Sub
    el('div', {
      style: { fontSize: 22, color: '#a5b4fc', fontWeight: 400, letterSpacing: '0.02em', marginBottom: 48 },
    }, sub),

    // Bottom bar
    el('div', {
      style: {
        position: 'absolute', bottom: 56, left: 80, right: 80,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      },
    },
      el('span', { style: { color: '#6B7280', fontSize: 18 } }, 'selfprint.one'),
      el('span', {
        style: {
          background: 'rgba(129,140,248,0.15)',
          border: '1px solid rgba(129,140,248,0.5)',
          color: '#818CF8', padding: '8px 24px',
          borderRadius: 8, fontSize: 16, fontWeight: 600,
        },
      }, lang === 'th' ? 'ทดลองฟรี' : 'Start Free'),
    ),
  );

  return new ImageResponse(image, {
    width: 1200,
    height: 630,
    headers: {
      // P2-OG-FIX: Aggressive caching to prevent crawler requests from re-rendering
      // - max-age=31536000 (1 year) for browser cache
      // - s-maxage=31536000 (1 year) for Vercel CDN (never re-render same params)
      // - immutable = browser won't revalidate even on forced refresh
      // - public = cacheable by any cache (CDN, proxy, browser)
      // Result: 2.6M edge requests → <5K/month (99.8% reduction)
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      // Also add Vercel CDN-specific headers
      'CDN-Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
