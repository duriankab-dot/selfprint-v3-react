# SELFPRINT V3 Deployment Guide

**Phase:** A (Production Ready)  
**Date:** 2026-08-25  
**Status:** ✅ Ready to Deploy

---

## Prerequisites

- Node.js 18+
- Supabase account (PostgreSQL)
- GitHub repository access
- Vercel account (for hosting)

---

## 1. Environment Setup

### 1.1 Clone Repository

```bash
git clone https://github.com/user/selfprint-v3-react.git
cd selfprint-v3-react
```

### 1.2 Install Dependencies

```bash
npm install
```

### 1.3 Environment Variables

Create `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Auth
VITE_REDIRECT_URL=http://localhost:3000

# SICE/AI
VITE_API_KEY=your_api_key
```

---

## 2. Database Setup

### 2.1 Start Supabase Locally (Development)

```bash
supabase start
```

This automatically:
- ✅ Creates PostgreSQL container
- ✅ Runs all migrations (001-032)
- ✅ Sets up RLS policies
- ✅ Creates tables

**Critical migrations for Phase A:**
- 001: Core schema (twins, memories, etc.)
- 020: Decision tables
- 021: World preferences
- 024: Twin personality
- 029: Core Awakening ceremony tables
- 030: Extended schema
- **004: twin_visual_dna (A.1 NEW)**

### 2.2 Verify Database

```sql
-- Connect to Supabase Studio, run:

-- Check twin_visual_dna exists (A.1)
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'twin_visual_dna';
-- Should return 1 row ✅

-- Check RLS enabled
SELECT tablename FROM pg_tables 
WHERE schemaname='public' 
ORDER BY tablename;
-- All tables should exist ✅

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'twin_visual_dna';
-- Should have 2 indexes: (twin_id, user_id) ✅
```

---

## 3. Application Build

### 3.1 TypeScript Check

```bash
npm run build
```

Expected output:
```
✓ 398 modules transformed
✓ built in 27.19s
```

**Status:** ✅ Must pass (zero TypeScript errors)

### 3.2 Development Server

```bash
npm run dev
```

Starts at http://localhost:5173

### 3.3 Linting

```bash
npm run lint
```

**Status:** ✅ Should have zero errors (in new code)

---

## 4. Testing

### 4.1 Unit Tests

```bash
npm test
```

**Expected:** 130+ tests passing  
**Status:** ✅ Must pass

**Key test suites:**
- DynamicValueCalculator (A.1)
- VisualDNAService (A.1)
- CoreAwakeningService
- SICEOrchestrator
- TwinSupabaseService

### 4.2 E2E Tests

```bash
npm run test:e2e
```

**Expected:** 28/28 tests passing  
**Status:** ✅ Must pass

**Critical tests (A.1 verification):**
- ✅ Twin Creation: 2.4s (not slower)
- ✅ Visual DNA: Persists across worlds
- ✅ Maturity Score: NOT 30
- ✅ SICE Scores: NOT 50

---

## 5. Phase A.1 Verification

Before deployment, verify A.1 changes are working:

### 5.1 Check Dynamic Maturity Score

```sql
-- After creating a test Twin:
SELECT 
  id,
  maturity_score
FROM twins
ORDER BY awakened_at DESC
LIMIT 1;

-- Should show: maturity_score != 30
-- Expected range: 10-100 based on analysis
```

### 5.2 Check Dynamic SICE Scores

```sql
-- After creating a test Twin:
SELECT 
  sice_name,
  contribution_score
FROM twin_sice_scores
WHERE twin_id = 'LATEST_TWIN_ID'
ORDER BY sice_name;

-- Should show: No all-50 values
-- Expected range: 20-100 per engine
```

### 5.3 Check Visual DNA Persistence

```sql
-- After creating a test Twin:
SELECT 
  color_primary,
  visual_style,
  base_expression
FROM twin_visual_dna
WHERE twin_id = 'LATEST_TWIN_ID';

-- Should return: 1 row with visual data
-- Reload page: Same colors/style persist ✅
```

---

## 6. Production Deployment (Vercel)

### 6.1 Connect GitHub

```bash
# Push to GitHub first
git add .
git commit -m "Phase A: Production ready"
git push origin master
```

### 6.2 Deploy to Vercel

```bash
# Option 1: Via Vercel CLI
vercel --prod

# Option 2: Via Vercel Dashboard
# Push to GitHub → Auto-deploys on Vercel
```

### 6.3 Set Production Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key
VITE_REDIRECT_URL=https://selfprint-v3.vercel.app
VITE_API_KEY=prod_api_key
```

### 6.4 Run Production Database Migrations

```bash
# Connect to Supabase production
supabase link --project-ref prod-id

# Run migrations
supabase db push

# Should show: All 032 migrations applied ✅
```

---

## 7. Production Verification Checklist

After deployment, verify everything works:

### 7.1 Frontend Checks

- [ ] Homepage loads at https://selfprint-v3.vercel.app
- [ ] Can create account
- [ ] Can login
- [ ] No console errors (DevTools)
- [ ] All CSS loads (no unstyled content)

### 7.2 Twin Creation Flow

- [ ] Complete analysis questions
- [ ] Analysis completes in <10s
- [ ] Twin birth succeeds in <3s
- [ ] Twin appears in dashboard

### 7.3 Phase A.1 Verification

- [ ] Create test Twin
- [ ] Query database: maturity_score ≠ 30
- [ ] Query database: SICE scores ≠ 50
- [ ] Query database: visual_dna row exists
- [ ] Reload page: Twin looks identical

### 7.4 World System

- [ ] All 12 worlds accessible
- [ ] Twin renders in each world
- [ ] World-specific context works
- [ ] No missing data

### 7.5 Security

- [ ] Cross-user isolation: User A cannot see User B's Twins
- [ ] RLS policies enforced
- [ ] Auth required for all data
- [ ] No SQL errors in logs

### 7.6 Performance

- [ ] Twin creation: ~2.4s
- [ ] Page load: <2s (LCP)
- [ ] Dashboard: No lag
- [ ] World switching: Smooth

---

## 8. Rollback Procedure

If deployment fails:

```bash
# Revert to last working version
git revert <commit-hash>
git push origin master

# Vercel will auto-redeploy from main branch
# Migrations cannot be rolled back (forward-compatible only)
```

---

## 9. Monitoring

### Logs

Check application logs:
```bash
vercel logs [project-name]
```

### Database

Monitor Supabase:
```bash
# Via Supabase Dashboard
Settings → Statistics → Database usage
```

### Performance

Monitor Vercel Analytics:
```bash
# Via Vercel Dashboard
Analytics → Real User Monitoring
```

---

## 10. Troubleshooting

### Build Fails

```bash
# Clear node_modules and cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests Fail

```bash
# Run specific test
npm test -- DynamicValueCalculator

# Run E2E in headed mode
npm run test:e2e -- --headed
```

### Database Migration Issues

```bash
# Check migration status
supabase db pull

# Manual migration (rare)
supabase db push --force
```

### RLS Issues (Cross-user data visible)

```bash
# Check RLS is enabled
SELECT * FROM pg_stat_user_tables 
WHERE relname = 'twin_visual_dna';

# Should show: relhasindex = true
```

---

## Deployment Checklist (Final)

- [ ] npm run build → passes
- [ ] npm test → passes (130+ tests)
- [ ] npm run test:e2e → passes (28/28)
- [ ] supabase start → all migrations run
- [ ] Twin Creation works (2.4s)
- [ ] maturityScore ≠ 30
- [ ] SICE scores ≠ 50
- [ ] Visual DNA persists
- [ ] All 12 worlds render
- [ ] Cross-user isolation verified
- [ ] Performance baseline met
- [ ] No console errors
- [ ] GitHub commit → Vercel deploys

**Status:** Ready for production ✅

