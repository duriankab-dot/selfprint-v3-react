/**
 * Cloudflare Pages Function: /api/og
 * Dynamic OG Image Generator (CF version)
 *
 * Port from src/api/og.ts (Vercel Edge Function)
 * Generates social media preview images on-demand
 */

interface PagesContext {
  request: Request;
  env: Record<string, string | undefined>;
}

// ─── Copy ──────────────────────────────────────────────────────────────────

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

// ─── SVG Helpers ───────────────────────────────────────────────────────────

function atomSvg(): string {
  return `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <ellipse cx="20" cy="20" rx="14" ry="5" stroke="#818CF8" stroke-width="1.5" opacity="0.7"/>
    <ellipse cx="20" cy="20" rx="14" ry="5" stroke="#818CF8" stroke-width="1.5" opacity="0.7" transform="rotate(60 20 20)"/>
    <ellipse cx="20" cy="20" rx="14" ry="5" stroke="#818CF8" stroke-width="1.5" opacity="0.7" transform="rotate(120 20 20)"/>
    <circle cx="20" cy="20" r="2.5" fill="#818CF8"/>
  </svg>`;
}

function dotPattern(): string {
  let dots = '';
  for (let i = 0; i < 25; i++) {
    const opacity = i % 5 === 0 ? 1 : 0.4;
    dots += `<div style="width:6px;height:6px;border-radius:50%;background:#818CF8;opacity:${opacity}"></div>`;
  }
  return dots;
}

// ─── HTML Escaping ─────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── HTML OG Image ─────────────────────────────────────────────────────────

function renderOGImage(headline: string, sub: string, worldBadge?: string): string {
  const fontSize = headline.length > 40 ? 46 : 56;
  const badge = worldBadge
    ? `<span style="margin-left:8px;background:rgba(129,140,248,0.15);border:1px solid rgba(129,140,248,0.4);color:#a5b4fc;font-size:13px;padding:4px 12px;border-radius:20px;text-transform:capitalize;">${escapeHtml(worldBadge)}</span>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      padding: 72px 80px;
      background: linear-gradient(135deg,#0d0d0f 0%,#111128 60%,#1a1040 100%);
      font-family: Inter, sans-serif;
      position: relative;
      overflow: hidden;
    }
    .glow {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 80% 20%,rgba(91,92,235,.18) 0%,transparent 50%),
        radial-gradient(circle at 20% 80%,rgba(139,92,246,.12) 0%,transparent 50%);
    }
    .dots {
      position: absolute;
      top: 48px;
      right: 80px;
      width: 240px;
      height: 240px;
      opacity: 0.25;
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
    }
    .content {
      position: relative;
      z-index: 10;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
    }
    .brand-text {
      color: #818CF8;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .headline {
      font-size: ${fontSize}px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
      max-width: 780px;
      margin-bottom: 24px;
    }
    .sub {
      font-size: 22px;
      color: #a5b4fc;
      font-weight: 400;
      letter-spacing: 0.02em;
      margin-bottom: 48px;
    }
    .footer {
      position: absolute;
      bottom: 56px;
      left: 80px;
      right: 80px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-site {
      color: #6B7280;
      font-size: 18px;
    }
    .footer-cta {
      background: rgba(129,140,248,0.15);
      border: 1px solid rgba(129,140,248,0.5);
      color: #818CF8;
      padding: 8px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="glow"></div>
  <div class="dots">${dotPattern()}</div>

  <div class="content">
    <div class="brand">
      ${atomSvg()}
      <span class="brand-text">SELFPRINT</span>
      ${badge}
    </div>

    <div class="headline">${escapeHtml(headline)}</div>
    <div class="sub">${sub}</div>
  </div>

  <div class="footer">
    <span class="footer-site">selfprint.one</span>
    <span class="footer-cta">${sub.includes('SICE') ? 'ทดลองฟรี' : 'Start Free'}</span>
  </div>
</body>
</html>`;
}

// ─── Handler ───────────────────────────────────────────────────────────────

export async function onRequest(context: PagesContext): Promise<Response> {
  const url = new URL(context.request.url);
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

  const html = renderOGImage(headline, sub, worldBadge);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
