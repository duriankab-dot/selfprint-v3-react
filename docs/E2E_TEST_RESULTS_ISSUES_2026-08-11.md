# ⚠️ E2E Testing — Issues Found & Action Items

**Date:** 2026-08-11  
**Status:** 🟡 BLOCKING — Cannot proceed without fixes  
**Token Used:** ~100k (from 200k budget)

---

## 🔴 CRITICAL ISSUES (Block Testing)

### 1. Missing Supabase Environment Variables (Production)
**Error:**
```
Uncaught Error: Missing Supabase credentials. 
Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

**Where:** selfprint.one (production) ✗  
**Cause:** Vercel environment variables not set

**Fix Required:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   ```
   VITE_SUPABASE_URL=https://orxteuufqeohptpbwkqx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_q5nNmAvkitf6QrYyl6O6BA_VJQaDoqH
   ```
3. Re-deploy
4. Check `.env.local` for values (from git history or current file)

**Severity:** 🔴 HIGH — App won't initialize without Supabase

---

### 2. Backend API Endpoints Missing (Local & Production)
**Errors:**
- ❌ `POST /api/intelligence` → 404
- ❌ `GET /api/stripe?action=subscription` → 500
- ❌ Supabase OAuth redirect → 400

**Cause:** Backend routes not implemented or misconfigured

**Status:**
- These endpoints are used by onboarding, pricing, auth flows
- May not be critical for Passkey testing, but needed for full E2E

**Fix Required:**
1. Check `api/` folder structure
2. Verify endpoints are exported in server/main file
3. Test locally: `curl http://localhost:5173/api/intelligence`
4. If missing, implement stubs or mock responses

---

## 🟡 MEDIUM ISSUES (Minor Impact)

### 3. Email Validation Too Strict
**Error:** `test-passkey@example.com` rejected  
**Fix:** Use `test@example.com` or real email

**Impact:** Low — just need correct email format

---

### 4. Icon Manifest 404
**Error:** `https://www.selfprint.one/icon-192.png` not found  
**Fix:** Add missing icon files to public/ folder

**Impact:** Low — UI only, no functionality break

---

## ✅ WHAT'S WORKING

- ✅ App renders (UI loads correctly)
- ✅ Thai language rendering
- ✅ Phase 2 Tests loaded
- ✅ Dev server running (localhost:5173)
- ✅ Vercel deployment successful

---

## 🎯 TESTING BLOCKED UNTIL

**Required before E2E:**
1. ✅ Set Supabase env vars on Vercel
2. ✅ Verify backend API endpoints
3. ✅ Test sign-up flow (email validation)

**Then can test:**
- Passkey registration
- Passkey authentication
- Pricing flow
- Audio playback
- Journal sync

---

## 📋 Action Plan

### Immediate (Next 30 min)
- [ ] Set Vercel environment variables (3 vars: Supabase URL + Key)
- [ ] Re-deploy to production
- [ ] Test app loads without errors

### Short-term (Next 1-2 hours)
- [ ] Fix email validation (allow test emails)
- [ ] Check backend API endpoints exist
- [ ] Re-run E2E testing scenarios

### Follow-up (Post-testing)
- [ ] Add icon files to public/
- [ ] Document environment setup
- [ ] Create deployment checklist for next developer

---

## 📞 Next Steps

**Choose one:**

**A) Quick Fix (Recommended)**
1. Add env vars to Vercel (5 min)
2. Re-test (10 min)
3. Report results

**B) Detailed Audit**
1. Review all backend endpoints
2. Check Stripe config
3. Validate all API routes

---

## 💾 Environment Variables Needed

```env
# Frontend (.env.local)
VITE_SUPABASE_URL=https://orxteuufqeohptpbwkqx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_q5nNmAvkitf6QrYyl6O6BA_VJQaDoqH
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51U2imTH0vRik0oDQw4AUpSoAQtbKtTj8AFzoDKfuLvPpVqWT1Cn00lvkFS3L2QZE3WvuYFUWIA
VITE_STRIPE_CHECKOUT_URL=https://checkout.stripe.com/pay

# Vercel (Settings → Environment Variables)
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY (backend only)
STRIPE_WEBHOOK_SECRET (backend only)
SUPABASE_SERVICE_ROLE_KEY (backend only)
```

---

## 📊 Testing Status

| Component | Local | Production | Status |
|-----------|-------|-----------|--------|
| App Load | ✅ | ❌ | Blocked by env vars |
| Email Validation | ❌ | ❌ | Too strict |
| Supabase Config | ✅ | ❌ | Missing on Vercel |
| Backend APIs | ❌ | ❌ | Endpoints 404/500 |
| Passkey Funcs | ✅ Code | ? Not Tested | Needs testing |
| Audio | ✅ Code | ? Not Tested | Needs testing |

---

**Status:** 🟡 BLOCKED — Awaiting environment configuration  
**Estimated Fix Time:** 15-30 minutes  
**Can Resume After:** Vercel env vars set + re-deployed

---

Created: 2026-08-11  
Last Updated: [current time]  
