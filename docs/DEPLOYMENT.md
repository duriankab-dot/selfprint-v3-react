# 🚀 Deployment Guide

**How to Deploy SELFPRINT V3 to Production**

---

## **Deployment Architecture**

```
GitHub (Main Branch)
  ↓
Vercel (CI/CD Pipeline)
  ├─ Install dependencies: npm ci
  ├─ Build: npm run build
  ├─ Type check: tsc --noEmit
  ├─ Deploy static assets to CDN
  └─ Live on https://selfprint-v3-react.vercel.app
  ↓
Supabase (Database & Auth)
  ├─ PostgreSQL hosted
  ├─ Migrations auto-applied
  └─ RLS policies enforced
```

---

## **Pre-Deployment Checklist**

### **Code Quality**
```bash
# 1. Run all tests
npm test                    # Unit tests
npm run test:e2e            # E2E tests

# 2. Type checking
npm run build               # TypeScript + Vite build

# 3. Linting
npm run lint                # ESLint + Prettier

# 4. Security audit
npm audit --audit-level=moderate

# 5. Verify production build works
npm run build
# (no errors = ready to deploy)
```

### **Environment Variables**
Ensure Vercel project has these set:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=https://your-api.vercel.app
```

**Never** commit `.env.local` — use `.env.example` as template.

---

## **Deployment Steps**

### **Option 1: Automatic Deployment (Recommended)**

Vercel auto-deploys on every push to `main` branch:

```bash
# 1. Commit your changes
git add .
git commit -m "feature: xyz"

# 2. Push to main
git push origin main

# 3. Vercel automatically:
#    - Runs npm ci
#    - Runs npm run build
#    - Deploys to CDN
#    - Live in ~2 minutes

# 4. Check deployment
# Visit: https://vercel.com/dashboards
# Status should be "Ready"
```

### **Option 2: Manual Deployment**

```bash
# 1. Install Vercel CLI (if not already)
npm i -g vercel

# 2. Authenticate
vercel login

# 3. Deploy
vercel --prod

# 4. Follow prompts:
#    - Link to existing project
#    - Confirm environment variables
#    - Wait for build to complete
```

---

## **Post-Deployment Verification**

### **Smoke Tests**

```bash
# 1. Check site is live
curl https://selfprint-v3-react.vercel.app

# 2. Verify auth works
# Visit site → Sign up → Check email verification

# 3. Verify database connection
# Try creating a Twin → Check Supabase dashboard

# 4. Check E2E tests still pass
npm run test:e2e
```

### **Monitor Performance**

Vercel Analytics:
```
https://vercel.com/dashboards
  ├─ Build time (should be <2 min)
  ├─ Function size (should be <10MB)
  ├─ Core Web Vitals
  └─ Traffic & errors
```

Supabase Monitoring:
```
https://supabase.com/dashboard
  ├─ Query performance
  ├─ Database size
  ├─ Auth logs
  └─ Real-time activity
```

---

## **Rollback Procedure**

If deployment has critical issues:

### **Quick Rollback (Vercel)**

```bash
# 1. Go to Vercel dashboard
# 2. Find the previous successful deployment
# 3. Click "Promote to Production"
# 4. Confirm

# (Instant rollback, ~30 seconds)
```

### **Manual Rollback (Git)**

```bash
# 1. Find last good commit
git log --oneline | head -10

# 2. Revert to it
git revert <commit-hash>
# OR
git reset --hard <commit-hash>

# 3. Push to main
git push -f origin main

# 4. Vercel redeploys automatically
```

---

## **Production Issues & Fixes**

### **Issue: Build Fails**

```bash
# Check error in Vercel logs:
# https://vercel.com/dashboards → Deployments → Failed → Logs

# Common fixes:
1. npm ci fails → Check .npmrc & package-lock.json
2. tsc fails → npm run build locally first
3. Missing env var → Add to Vercel project settings
4. Node version mismatch → Check Vercel Node version (set in .nvmrc)
```

### **Issue: App loads but errors**

```bash
# 1. Check browser console (F12)
# 2. Check Vercel function logs:
#    https://vercel.com/dashboards → Functions → Logs
# 3. Check Supabase logs:
#    https://supabase.com/dashboard → Database → Logs
# 4. Reproduce locally with npm run dev
```

### **Issue: Slow Performance**

```bash
# 1. Check Vercel Analytics
# 2. Profile bundle size:
#    npm run build
#    ls -lh dist/
# 3. Check database query performance (Supabase)
# 4. Run E2E tests to measure Twin creation time:
#    npm run test:e2e
```

---

## **Database Migrations in Production**

### **Applying New Migrations**

```bash
# 1. Create migration file
supabase migration new your_feature_name

# 2. Write migration SQL
# (See supabase/migrations/ for examples)

# 3. Test locally
supabase db push

# 4. Commit & push to main
git add supabase/migrations/
git commit -m "migration: xyz"
git push origin main

# 5. Vercel deploys (migrations auto-apply to prod)
```

### **Migration Safety**

```sql
-- ✅ SAFE: Non-breaking changes
ALTER TABLE twins ADD COLUMN new_field VARCHAR;
CREATE INDEX idx_twins_user_id ON twins(user_id);

-- ⚠️ CAREFUL: Breaking changes (check app first)
ALTER TABLE twins DROP COLUMN old_field;

-- ❌ DANGEROUS: Data loss
DELETE FROM twins; -- NEVER do this in prod
TRUNCATE TABLE twins; -- NEVER do this in prod
```

---

## **Environment Configuration**

### **Development (.env.local)**
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-key-xxxx
VITE_API_URL=http://localhost:3000
VITE_LOG_LEVEL=debug
```

### **Production (Vercel Settings)**
```env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-key-xxxx
VITE_API_URL=https://api.selfprint.app
VITE_LOG_LEVEL=info
```

---

## **Monitoring & Alerts**

### **Setup Vercel Alerts**

```
Vercel Dashboard
  → Project Settings
  → Monitoring
  → Enable:
    ├─ Build Failures
    ├─ High Memory Usage
    └─ Unhandled Errors
```

### **Setup Supabase Alerts**

```
Supabase Dashboard
  → Project Settings
  → Monitoring
  → Alert Rules:
    ├─ Database CPU > 80%
    ├─ Database Storage > 80%
    └─ Auth failures spike
```

---

## **Performance Targets**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Build time | < 2 min | ~1-1.5 min | ✅ |
| Bundle size | < 500 KB | ~380 KB | ✅ |
| First Paint | < 2s | ~1.5s | ✅ |
| Twin creation | < 1.0s | 2.4s | ⚠️ |
| API response | < 200ms | ~100-150ms | ✅ |

**Notes:**
- Twin creation time (2.4s) includes SICE orchestration (~1.0-1.5s)
- Database operations optimized via parallelization (P5)
- Network latency is main remaining bottleneck

---

## **Disaster Recovery**

### **Backup Database**

```bash
# Manual backup
supabase db dump > backup-$(date +%Y-%m-%d).sql

# Automated: Supabase does daily backups
# (See: Supabase Dashboard → Database → Backups)
```

### **Restore from Backup**

```bash
# Contact Supabase support to restore from backup
# (Automatic backups retained for 30 days)
```

---

## **Security Checklist**

- [ ] `.env.local` not in git (added to `.gitignore`)
- [ ] All environment variables set in Vercel
- [ ] npm audit passes (moderate level)
- [ ] RLS policies enabled on all tables
- [ ] HTTPS enforced (Vercel default)
- [ ] Rate limiting configured (if needed)
- [ ] Sensitive data not logged

---

**Last Updated:** 2026-08-24  
**Deployment Platform:** Vercel + Supabase  
**Auto-deploy:** Enabled on main branch
