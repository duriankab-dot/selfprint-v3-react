```markdown
# Selfprint Deployment Guide

## 🚀 Frontend — Vercel

```bash
npm run build
vercel --prod
Environment Variables ที่ต้องตั้งใน Vercel:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

VITE_ANTHROPIC_API_KEY

VITE_STRIPE_PUBLISHABLE_KEY

STRIPE_SECRET_KEY

STRIPE_WEBHOOK_SECRET

🗄️ Backend — Supabase
bash
supabase migration up
💳 Payment — Stripe
Webhook endpoint: /api/stripe/webhook

ทดสอบใน Local:

bash
stripe listen --forward-to localhost:5173/api/stripe/webhook
📱 PWA
iOS: Share → "Add to Home Screen"

Android: เมนู ⋮ → "Install app"

Desktop: ไอคอน Install ที่ URL bar

อัปเดตล่าสุด: 12 สิงหาคม 2569