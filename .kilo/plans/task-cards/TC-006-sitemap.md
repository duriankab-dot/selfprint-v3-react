# TC-006: Sitemap generator
**Phase**: 0 | **Priority**: P1 | **Estimate**: 2 ชม.
**Assignee**: AI-SEO | **Depends On**: TC-001
**Feature Flag**: N/A

## 🎯 OBJECTIVE
สร้าง script generate sitemap.xml อัตโนมัติจาก App.tsx routes พร้อม hreflang alternates สำหรับ /th และ /en

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `scripts/generate-sitemap.ts` — อ่าน routes จาก App.tsx, generate sitemap.xml
- [ ] เพิ่มใน `package.json` scripts: `"sitemap": "tsx scripts/generate-sitemap.ts"`
- [ ] `public/sitemap.xml` สร้างหลัง build
- [ ] `public/robots.txt` dynamic (disallow protected routes)
- [ ] **Docs updated**: MASTER_PLAN.md, docs/SEO_AEO_GEO_SPEC.md
- [ ] **All tests pass**: N/A
- [ ] **Build passes**: `npm run build && npm run sitemap`

## 🔧 IMPLEMENTATION NOTES
```typescript
// scripts/generate-sitemap.ts
import { readFileSync, writeFileSync } from 'fs';

const routes = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/onboarding', changefreq: 'weekly', priority: 0.8 },
  { path: '/pricing', changefreq: 'monthly', priority: 0.9 },
  { path: '/science', changefreq: 'monthly', priority: 0.7 },
  { path: '/vs-astrology', changefreq: 'monthly', priority: 0.8 },
  { path: '/faq', changefreq: 'weekly', priority: 0.7 },
  { path: '/blog', changefreq: 'daily', priority: 0.8 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
  { path: '/terms', changefreq: 'yearly', priority: 0.5 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.5 },
];

function generateSitemap() {
  const base = 'https://selfprint.one';
  const urls = routes.flatMap(r => [
    { url: `${base}/th${r.path}`, alternates: [{ lang: 'th', url: `${base}/th${r.path}` }, { lang: 'en', url: `${base}/en${r.path}` }], ...r },
    { url: `${base}/en${r.path}`, alternates: [{ lang: 'th', url: `${base}/th${r.path}` }, { lang: 'en', url: `${base}/en${r.path}` }], ...r },
  ]);
  // ... generate XML with xhtml:link rel="alternate" hreflang
  writeFileSync('public/sitemap.xml', xml);
}

// robots.txt
/*
User-agent: *
Allow: /th/
Allow: /en/
Disallow: /th/dashboard
Disallow: /th/worlds
Disallow: /th/chat
Disallow: /th/twin
Disallow: /th/onboarding
Disallow: /api/
Sitemap: https://selfprint.one/sitemap.xml
*/
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- scripts/generate-sitemap.ts
- .ai/context-pack/session-XXX-context.json