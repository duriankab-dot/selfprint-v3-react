/**
 * Cloudflare Pages Function: /api/og
 * ═══════════════════════════════════════════════════════
 * OG Image HTML — returns an HTML page used for Open Graph previews.
 *
 * Query params:
 *   lang    = 'th' | 'en'  (default: 'en')
 *   segment = string        (default: 'default')
 * ═══════════════════════════════════════════════════════
 */

interface Env {
  [key: string]: unknown;
}

// TSFN-OG-001 (8 ก.ย. 2026): match the PagesContext pattern every other
// functions/api/*.ts file already uses (nova.ts, twin.ts, metrics.ts,
// autonomy-log.ts) instead of the `PagesFunction<Env>` global type, which
// requires @cloudflare/workers-types — not installed, and not to be added
// without asking first (AI_WORKING_DISCIPLINE_RULES.md).
interface PagesContext {
  request: Request;
  env: Env;
}

const COPY: Record<string, { title: string; desc: string }> = {
  th: {
    title: 'SELFPRINT — สร้าง AI Twin ภาษาไทยของคุณ',
    desc: 'เปลี่ยนทุกการวิเคราะห์ เรียนรู้ และตัดสินใจให้กลายเป็น AI Twin — ร่างจำลองที่เตือนสติ ชี้จุดบอด (Blind Spots) และนำทางชีวิต',
  },
  en: {
    title: 'SELFPRINT — Build Your Personal AI Twin',
    desc: 'Transform every insight, decision and habit into a living AI Twin that knows you deeply — your guide, your mirror, your edge.',
  },
};

export async function onRequestGet({ request }: PagesContext): Promise<Response> {
  const url = new URL(request.url);
  const lang = (url.searchParams.get('lang') ?? 'en') as 'th' | 'en';
  const copy = COPY[lang] ?? COPY['en'];

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${copy.title}</title>
  <meta property="og:title" content="${copy.title}" />
  <meta property="og:description" content="${copy.desc}" />
  <meta property="og:url" content="https://selfprint.one" />
  <meta property="og:image" content="https://selfprint.one/icons/icon-512x512.png" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${copy.title}" />
  <meta name="twitter:description" content="${copy.desc}" />
  <meta name="twitter:image" content="https://selfprint.one/icons/icon-512x512.png" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px; overflow: hidden;
      background: #0a0a0a; color: #ffffff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex; align-items: center; padding: 80px;
    }
    .logo { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 32px; }
    .logo span { color: #a855f7; }
    h1 { font-size: 64px; font-weight: 900; line-height: 1.1; letter-spacing: -0.03em; max-width: 900px; }
    .url { margin-top: 48px; font-size: 22px; color: #6b7280; }
  </style>
</head>
<body>
  <div>
    <div class="logo">SELF<span>PRINT</span></div>
    <h1>${copy.title.replace('SELFPRINT — ', '')}</h1>
    <div class="url">selfprint.one</div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
