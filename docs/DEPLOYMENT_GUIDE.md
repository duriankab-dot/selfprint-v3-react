# DEPLOYMENT GUIDE

**Target Environment:** Vercel (Production)  
**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** 2026-08-18

---

## 🚀 QUICK START

**Prerequisites:**
- Node.js 24+ installed
- Git (for version control)
- Vercel account (connected to GitHub)
- Supabase project (database credentials)

**Deployment:** 5 minutes

```bash
# 1. Ensure environment variables are set in Vercel
vercel env list

# 2. Deploy to production
vercel --prod

# 3. Verify deployment
curl https://www.selfprint.one

# 4. Check logs
vercel logs --tail
```

---

## 🔑 ENVIRONMENT VARIABLES

**Required Variables (Set in Vercel Dashboard):**

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGc...` |

**How to Get Values:**

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon` key → `VITE_SUPABASE_ANON_KEY`

**Set in Vercel:**

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Add both variables
3. Set scope to **Production**
4. Click **Save**

---

## 📦 BUILD CONFIGURATION

**Build Command:**
```bash
npm install --legacy-peer-deps && npm run build
```

**Dev Command:**
```bash
npm run dev
```

**Install Command:**
```bash
npm install --legacy-peer-deps
```

**Framework:** Vite (React 19)  
**Output Directory:** `dist/`  
**Node Version:** 24.x

---

## 🔧 VERCEL CONFIGURATION

**File:** `vercel.json`

```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "vite",
  "functions": {
    "api/unified-handler.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "rewrites": [
    {
      "source": "/api/notifications/:action*",
      "destination": "/api/unified-handler?module=notifications&action=:action*"
    },
    {
      "source": "/api/twin-evolution/:action*",
      "destination": "/api/unified-handler?module=twin-evolution&action=:action*"
    },
    {
      "source": "/api/sice/:action*",
      "destination": "/api/unified-handler?module=sice&action=:action*"
    },
    {
      "source": "/api/stripe/:action*",
      "destination": "/api/unified-handler?module=stripe&action=:action*"
    },
    {
      "source": "/api/profile/:action*",
      "destination": "/api/unified-handler?module=profile&action=:action*"
    },
    {
      "source": "/api/blueprint/:action*",
      "destination": "/api/unified-handler?module=blueprint&action=:action*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key Settings:**
- `maxDuration: 10` — 10-second timeout per function
- `memory: 1024` — 1GB memory allocation
- **Rewrites** — Route API calls to unified-handler

---

## 📥 STEP-BY-STEP DEPLOYMENT

### Step 1: Prepare Code
```bash
# Ensure clean state
git status
# Should show "working tree clean"

# Pull latest
git pull origin master
```

### Step 2: Local Verification
```bash
# Install dependencies
npm install --legacy-peer-deps

# Build locally
npm run build

# Should complete with no errors
# Output: dist/ folder created
```

### Step 3: Verify Environment Variables
```bash
# Check Vercel env vars
vercel env list

# Should show:
# - VITE_SUPABASE_URL ✓
# - VITE_SUPABASE_ANON_KEY ✓
```

### Step 4: Deploy
```bash
# Deploy to production
vercel --prod

# Output will show:
# Production: https://www.selfprint.one
# Inspect: https://vercel.com/...
```

### Step 5: Verify Deployment
```bash
# Check deployment status
vercel deployments

# Should show "READY" for latest

# Test API
curl https://www.selfprint.one/api/unified-handler?module=stripe&action=subscription

# Should return 200 OK
```

### Step 6: Monitor Logs
```bash
# View production logs
vercel logs --tail

# Watch for errors (should be clean)
# Expected: INFO, DEBUG logs only
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

- [ ] `npm run build` succeeds locally (no errors)
- [ ] `npm run lint` passes (no warnings)
- [ ] All tests pass: `npm test`
- [ ] TypeScript strict mode: `npx tsc --noEmit`
- [ ] Environment variables set in Vercel (both vars present)
- [ ] No secrets in code (verify `.env.local` not committed)
- [ ] Git branch is clean: `git status`
- [ ] Latest code pulled: `git pull origin master`

---

## 🚨 ROLLBACK PROCEDURE

**If deployment fails:**

```bash
# Revert to previous commit
git revert HEAD
git push origin master

# Vercel will auto-redeploy previous commit
# Check: Vercel Dashboard → Deployments → Select previous

# Or manual rollback:
vercel --prod --prebuilt  # Use previous build cache
```

**Common Issues & Fixes:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails | Missing env vars | Set `VITE_SUPABASE_URL` + key in Vercel |
| 504 timeout | Slow cold start | Increase `maxDuration` to 15 (if needed) |
| 404 API errors | Missing rewrite rule | Update `vercel.json` routes |
| CORS errors | Missing headers | Check Supabase CORS config |

---

## 📊 DEPLOYMENT MONITORING

### Key Metrics

**Performance:**
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

**Reliability:**
- Uptime: > 99.9%
- Error rate: < 0.1%
- API response time: < 500ms

### Monitor via Vercel Dashboard

1. Click **Analytics** tab
2. View metrics:
   - Response time
   - Error rate
   - Request count
   - Edge cache hits

### Monitor via External Tools

**Status Page:** [Status.io](https://status.io) (TODO: setup)  
**Uptime Monitoring:** [Pingdom](https://www.pingdom.com) (TODO: setup)  
**Error Tracking:** [Sentry](https://sentry.io) (TODO: setup)

---

## 🔄 CONTINUOUS DEPLOYMENT

**Trigger:** Auto-deployment on push to `master` branch

**GitHub Actions Workflow:** `.github/workflows/deploy.yml` (TODO: create)

**Current:** Manual `vercel --prod`

---

## 🎯 DEPLOYMENT GATE CHECKLIST

| Item | Status | Owner |
|------|--------|-------|
| Code review complete | ✅ | jb_DEV |
| All tests passing | ✅ | CI/CD |
| Build successful | ✅ | CI/CD |
| Env vars configured | ✅ | jb_DEV |
| Database migrations applied | ✅ | Database team |
| Security audit complete | ⚠️ PARTIAL | jb_DEV |
| Performance baseline established | ⚠️ TODO | DevOps |
| Monitoring alerts configured | ⚠️ TODO | DevOps |
| Rollback plan documented | ✅ | DevOps |

---

## 📞 POST-DEPLOYMENT

### Immediate (< 5 min)
- [ ] Verify homepage loads: https://www.selfprint.one
- [ ] Test auth flow (passkey login)
- [ ] Check API endpoint: `/api/unified-handler?module=stripe&action=subscription`
- [ ] Monitor logs for errors

### Short-term (< 1 hour)
- [ ] User-facing feature smoke tests
- [ ] Database connectivity verified
- [ ] Notifications working
- [ ] Analytics tracking active

### Daily
- [ ] Monitor error rate in Vercel logs
- [ ] Check performance metrics
- [ ] Review user feedback (support channels)

---

## 🆘 EMERGENCY PROCEDURES

**If production is down:**

1. **Assess severity**
   - Homepage down? → Critical
   - API errors? → High
   - Slow performance? → Medium

2. **Immediate actions**
   - Check Vercel dashboard (status page)
   - Check Supabase status
   - View Vercel logs for errors

3. **Rollback (if needed)**
   ```bash
   git revert HEAD
   git push origin master
   # Vercel auto-redeploys
   ```

4. **Communicate**
   - Post to #status (internal)
   - Update status page (if available)
   - Notify stakeholders

5. **Root cause analysis**
   - Review deployment logs
   - Check code changes
   - Verify env var configuration
   - Test locally with same environment

---

## 📚 REFERENCE

**Official Docs:**
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Supabase Setup](https://supabase.com/docs)
- [Vite Build Docs](https://vitejs.dev/guide/ssr.html)

**Configuration Files:**
- `vercel.json` — Vercel config
- `tsconfig.json` — TypeScript config
- `vite.config.ts` — Vite config
- `.env.example` — Environment variables template

---

**Authority:** Single source of truth for deployment procedures  
**Maintained by:** jb_DEV  
**Last Updated:** 2026-08-18
