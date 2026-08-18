# 🔴 PHASE H EXECUTION — HANDOFF (Remaining Work)

**Date:** August 18, 2026  
**Status:** 🔴 **BLOCKING ISSUES MUST FIX FIRST**  
**Estimated Time:** 12-15 hours  
**Priority:** CRITICAL — Launch blockers

---

## 🚨 BLOCKING ISSUES (Fix Immediately)

### **1. Console Error: feature_collector.js:23**
**Impact:** HIGH — Breaks tracking  
**Type:** Deprecated function parameter  

```
Error: "using deprecated parameters for the feature_collector.js:23 
initialization function; pass a single object instead"
```

**Action:**
- [ ] Locate `feature_collector.js` initialization (likely in layout or root component)
- [ ] Change from `featureCollector(param1, param2)` to `featureCollector({ param1, param2 })`
- [ ] Test console clears

**File Location:** `src/**/*` (search: `feature_collector`)

---

### **2. API Error: Failed to load resource (503)**
**Impact:** CRITICAL — Breaks functionality  
**Type:** Endpoint unavailable or misconfigured  

```
Error: "Failed to load resource: the server responded with a status of 503"
en/api/* endpoints failing
```

**Action:**
- [ ] Check `/api/` endpoints are deployed to Vercel
- [ ] Verify env vars in Vercel dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Test API manually: `curl https://www.selfprint.one/api/metrics`
- [ ] If 503: Check Vercel build logs for TypeScript errors

**Expected Status:** All `/api/` endpoints return 200 or proper error code

---

### **3. CORS / Localhost Warning**
**Impact:** MEDIUM — Local dev only, might affect staging  
**Action:**
- [ ] Check browser console for full error message
- [ ] Verify CORS headers in `vercel.json` or API handler
- [ ] Add `https://selfprint.one` to allowed origins

---

## ✅ PHASE H TASKS (SEQUENTIAL)

### **H0: Fix Console Errors** ⚠️ DO FIRST
**Time:** 1-2 hours  
**Blocking:** All other tasks

#### H0.1: Fix feature_collector deprecation
- [ ] Find initialization call
- [ ] Update to object parameter format
- [ ] Test: `console` should show 0 warnings

#### H0.2: Fix 503 API errors
- [ ] Redeploy to Vercel (or check deployment status)
- [ ] Verify all 4 files merged last session:
  - `api/unified-handler.ts` ✅
  - `api/metrics.ts` ✅
  - `src/lib/supabase/client.ts` ✅
  - `src/services/PushScheduler.ts` ✅
- [ ] Test each API endpoint
- [ ] Result: All endpoints return 2xx status

---

### **H1: Integration Testing** (8-10 hours)
**Blocking:** H5 (launch)  
**Success:** All 5 test paths pass with 0 failures

#### H1a: Landing → Analysis Flow
**Test Path:**
1. Open `selfprint.one/` (Thai version)
2. Select emotion (click any emotion button)
3. Nova chat opens → user provides context
4. Nova analyzes (3-5 exchanges)
5. Click "Core Awakening" button
6. ✅ PASS: Button shows "Ready for Core Awakening"

**Acceptance Criteria:**
- [ ] Page loads in < 2s
- [ ] Emotion selection registers (visual feedback)
- [ ] Nova responds within 3s
- [ ] Core Awakening button clickable
- [ ] No console errors

---

#### H1b: Twin Creation & Persistence
**Test Path:**
1. Click "Core Awakening"
2. Twin birth animation plays (detect 60fps smooth)
3. Name prompt appears
4. Enter twin name (e.g., "Kai")
5. Submit
6. ✅ PASS: Twin appears in `/chat/twin/{twinId}`

**Acceptance Criteria:**
- [ ] Animation plays smoothly (no jank)
- [ ] Name input field appears
- [ ] Twin created in database (verify Supabase)
- [ ] Chat page loads with twin context
- [ ] Twin name displayed in header

---

#### H1c: Twin Chat & World Switching
**Test Path:**
1. In twin chat, select different world (Career, Love, Health, Finance)
2. Send message: "What should I do?"
3. Twin responds
4. Switch to different world
5. Send same message
6. ✅ PASS: Response changes based on world context

**Acceptance Criteria:**
- [ ] World selector visible and clickable
- [ ] Chat persists when switching worlds
- [ ] Twin personality adapts to world
- [ ] Previous messages stay visible
- [ ] No API errors

---

#### H1d: Decision → Follow-up → Completion
**Test Path:**
1. In any world, create decision:
   - Title: "Change jobs"
   - Confidence: 75%
   - Expected outcome: "Better salary"
2. System schedules follow-ups (30/90/180/365 days)
3. Simulate time passage (manually update DB or use admin panel)
4. Follow-up notification triggers
5. User completes follow-up
6. ✅ PASS: Success rate calculated

**Acceptance Criteria:**
- [ ] Decision created and saved
- [ ] 4 follow-ups scheduled (verify Supabase `notification_schedule`)
- [ ] Follow-up notification appears at due date
- [ ] User can record outcome (positive/neutral/negative)
- [ ] Success rate appears on dashboard

---

#### H1e: Feedback Loop → Quality Metrics
**Test Path:**
1. User gets insight (e.g., "You tend to procrastinate")
2. Click "Not me" or "Relevant" button
3. Feedback saved
4. Check analytics dashboard
5. ✅ PASS: Feedback counted in metrics

**Acceptance Criteria:**
- [ ] Feedback buttons clickable
- [ ] Feedback saved to `pattern_feedback` table
- [ ] Analytics dashboard reflects feedback
- [ ] No API errors

---

### **H2: Documentation** (10-12 hours)
**Blocking:** H5 (launch)  
**6 Remaining Docs:**

- [ ] **1. API Reference** — All 6 endpoints documented (params, responses, errors)
  - File: `docs/API_REFERENCE.md`
  - Include: `/api/metrics`, `/api/notifications/*`, `/api/twin-evolution/*`, `/api/sice/*`

- [ ] **2. Database Schema** — All 8 tables documented (fields, relationships, indexes)
  - File: `docs/DATABASE_SCHEMA.md`
  - Tables: `users`, `twins`, `decisions`, `notification_*`, `pattern_*`, `feedback`

- [ ] **3. Deployment Guide** — Vercel + Supabase setup from scratch
  - File: `docs/DEPLOYMENT_GUIDE.md`
  - Sections: Vercel setup, env vars, database migrations, monitoring

- [ ] **4. Monitoring & Alerts** — Production health checks
  - File: `docs/MONITORING.md`
  - Metrics: Error rate, API latency, user activity, notification delivery

- [ ] **5. Troubleshooting** — Common issues + fixes
  - File: `docs/TROUBLESHOOTING.md`
  - Issues: 503 errors, notifications not sending, twin chat lag

- [ ] **6. User Guide** — Feature walkthrough (end-user focused)
  - File: `docs/USER_GUIDE.md`
  - Sections: Getting started, twin creation, decision tracking, world switching

---

### **H3: Performance Baseline** (5-8 hours)
**Blocking:** H5 (launch)  
**Success:** All metrics within targets

#### Metrics to Measure:
```
✅ Target: FCP < 1.5s  (First Contentful Paint)
✅ Target: LCP < 2.5s  (Largest Contentful Paint)
✅ Target: INP < 200ms (Interaction to Next Paint)
✅ Target: CLS < 0.1   (Cumulative Layout Shift)
✅ Target: API latency < 500ms (p95)
✅ Target: Error rate < 0.5%
```

**Action:**
- [ ] Run Lighthouse on production (selfprint.one)
- [ ] Record all 6 metrics
- [ ] Test API endpoints with load testing (simulate 100 concurrent users)
- [ ] Screenshot metrics → `docs/PERFORMANCE_BASELINE.md`

**Acceptance Criteria:**
- [ ] All metrics recorded
- [ ] All targets met (or documented why not)
- [ ] Baseline established (for future regression testing)

---

### **H4: Beta User Testing** (5-8 hours)
**Blocking:** H5 (launch)  
**Success:** 10+ users, NPS > 50

**Steps:**
1. [ ] Recruit 10-15 beta users (friends, colleagues, communities)
2. [ ] Send them unique links with tracking
3. [ ] Collect NPS score (question: "Would you recommend SelfPrint?")
4. [ ] Record qualitative feedback (what they liked/disliked)
5. [ ] Track usage metrics (time in app, features used, churn rate)
6. [ ] Document findings → `docs/BETA_TESTING_REPORT.md`

**Acceptance Criteria:**
- [ ] 10+ users completed full flow
- [ ] NPS score collected (target: > 50)
- [ ] No critical bugs reported
- [ ] User satisfaction > 4/5 on key features
- [ ] Report written with recommendations

---

### **H5: Launch Ready** (3-5 hours)
**Blocking:** Go-live  
**Success:** All items checked, team aligned

#### Go-Live Checklist:
- [ ] All H1-H4 complete
- [ ] 0 critical bugs in production
- [ ] Monitoring + alerts configured
- [ ] Support docs ready for users
- [ ] Team communication drafted (Discord, email, social)
- [ ] Rollback plan documented
- [ ] 24/7 on-call schedule assigned

#### Launch Communications:
- [ ] **Announcement post** (Twitter, LinkedIn) — written, scheduled
- [ ] **Email to waitlist** — written, approval done
- [ ] **Discord server** — welcome message pinned
- [ ] **Support docs** — visible on `/help`

#### Runbook (If Issue):
- [ ] **API is down (503)** → Redeploy from `main` branch
- [ ] **Database is slow** → Check Supabase dashboard, scale if needed
- [ ] **High error rate** → Check logs, rollback last deployment
- [ ] **Users can't create twins** → Check `twins` table, verify Supabase permissions

---

## 📊 SUMMARY

| Phase | Status | Time | Blocker? |
|-------|--------|------|----------|
| **H0: Fix Errors** | 🔴 TODO | 1-2h | YES ⚠️ |
| **H1: E2E Testing** | 🔴 TODO | 8-10h | YES |
| **H2: Documentation** | 🔴 TODO | 10-12h | YES |
| **H3: Performance** | 🔴 TODO | 5-8h | YES |
| **H4: Beta Testing** | 🔴 TODO | 5-8h | YES |
| **H5: Launch Ready** | 🔴 TODO | 3-5h | YES |
| **TOTAL** | | **32-45h** | — |

---

## 🎯 NEXT STEPS (PRIORITY ORDER)

```
TODAY (Next chat session):
1. Fix feature_collector deprecation warning
2. Fix 503 API errors (verify deployment)
3. Test each API endpoint manually
4. Start H1a (landing → analysis flow test)

IF COMPLETED TODAY:
5. Continue H1b, H1c, H1d, H1e (full E2E suite)
6. Start H2 (docs) in parallel

DEFER (If time runs out):
- H3 (performance) — can be in next sprint
- H4 (beta testing) — user recruiting takes time
- H5 (launch) — after all above pass
```

---

## 📝 NOTES FOR NEXT DEV

**Critical Context:**
- ✅ Code: 100% Phase E/F/G delivered
- ✅ Production: Live at www.selfprint.one (Thai version only)
- ⚠️ Console: 3 warnings (fix first)
- 🔴 Testing: 0% (must do H1-H4 before launch)
- 📋 Docs: 33% (6 files pending)

**Quick Links:**
- Production: https://www.selfprint.one
- Vercel: https://vercel.com/dashboard (check build logs)
- Supabase: https://supabase.com/dashboard (check tables)
- GitHub: https://github.com/jb_DEV/selfprint-v3-react

**Previous Session Work:**
- Fixed 4 TypeScript errors (extensions + import.meta)
- Created SESSION_HANDOFF & PHASE_H_READY docs
- Code quality: ✅ TypeScript PASS, Lint PASS

---

**Status:** 🟢 Code ready, 🔴 Testing + Launch prep needed  
**Launch Date:** When Phase H complete (estimate: 32-45 hours work)
