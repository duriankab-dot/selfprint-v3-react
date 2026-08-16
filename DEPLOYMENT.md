# 🚀 SELFPRINT — DEPLOYMENT GUIDE

**Version:** 17-Phase Master Direction  
**Date:** 14 สิงหาคม 2569

---

## 🔴 สิ่งสำคัญก่อน Deploy

### Architecture Verification

| Item | Status |
|------|--------|
| Nova ≠ Twin Separation | ✅ |
| 12 SICE Core | ✅ |
| 5 Navigation + Twin Center | ✅ |
| 12 Hub Worlds | ✅ |
| 5 Growth Stages | ✅ |
| Trial 7-14 days | ✅ |
| Human Expert | ✅ |
| SEO/GEO Layer | ✅ |
| Public/Private | ✅ |

---

## 📦 Production Build

### 1. Build

```bash
npm run build
2. Preview
bash
npm run preview
3. Verify
✅ No TypeScript errors

✅ No lint errors

✅ All tests passing

✅ Lighthouse ≥ 85

🌐 Vercel Deployment
1. Connect to Vercel
bash
vercel
2. Environment Variables
Variable	Production	Staging
VITE_SUPABASE_URL	✅	✅
VITE_SUPABASE_ANON_KEY	✅	✅
VITE_CLAUDE_API_KEY	✅	✅
VITE_STRIPE_PUBLISHABLE_KEY	✅	✅
STRIPE_SECRET_KEY	✅	❌
STRIPE_WEBHOOK_SECRET	✅	❌
3. Deploy
bash
vercel --prod
📱 PWA Configuration
1. Manifest
json
{
  "name": "Selfprint",
  "short_name": "Selfprint",
  "description": "Living Personal Intelligence Platform",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#0a0a1a"
}
2. Service Worker
Static assets caching

API calls caching

Offline fallback

Auto-update

🔐 Security
1. HTTPS
Vercel provides automatic HTTPS

Force HTTPS redirect

2. Headers
javascript
// Security Headers
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "..."
}
3. Environment
Never expose secrets in client

Use environment variables

Supabase RLS enabled

📊 Monitoring
1. Analytics
Vercel Analytics

Custom events

Performance monitoring

2. Error Tracking
Sentry integration

Error boundaries

Logging service

3. Performance
Lighthouse CI

Core Web Vitals

Real user monitoring

🔄 CI/CD Pipeline
1. GitHub Actions
yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: vercel --prod
2. Pre-deploy Checks
✅ TypeScript compilation

✅ Lint

✅ Tests

✅ Build

📁 Production Assets
1. Static Assets
Images optimized

Fonts preloaded

Critical CSS inlined

2. Dynamic Assets
Code splitting

Lazy loading

Prefetch on demand

3. Cache Strategy
Asset Type	Cache	TTL
HTML	no-cache	—
JS/CSS	immutable	1 year
Images	cache	1 week
Fonts	cache	1 month
🔍 Post-Deploy Checklist
Item	Status
Homepage loads	✅
Authentication works	✅
Nova appears	✅
Onboarding works	✅
Core Awakening works	✅
Twin created	✅
Chat works	✅
5 Navigation works	✅
Dashboard loads	✅
PWA installable	✅
Offline works	✅
Analytics tracking	✅
Error tracking	✅
SEO metadata	✅
Performance OK	✅
🚨 Rollback
1. Vercel Rollback
bash
vercel rollback
2. Manual Rollback
bash
git revert <commit>
git push origin main
อัปเดตล่าสุด: 14 สิงหาคม 2569