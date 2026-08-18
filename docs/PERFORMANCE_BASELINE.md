# H3: PERFORMANCE BASELINE

**Phase:** H3 — Establish Performance Baseline  
**Duration:** 5-8 hours  
**Status:** IN PROGRESS (Started 2026-08-18)  
**Owner:** jb_DEV

---

## 🎯 OBJECTIVE

Establish **baseline performance metrics** across all critical systems to:
- ✅ Identify bottlenecks
- ✅ Set optimization targets (H3+H4)
- ✅ Monitor production health (ongoing)
- ✅ Validate performance gates before launch

---

## 📊 METRICS TO MEASURE

### 1. API PERFORMANCE

**Target:** p95 response time < 500ms

```
Measurements needed:
- GET /api/unified-handler?module=notifications&action=list
- GET /api/unified-handler?module=stripe&action=subscription
- POST /api/unified-handler?module=decisions&action=record-outcome
- GET /api/unified-handler?module=twin-evolution&action=*
```

**How to Measure:**
```bash
# 1. Production logs (Vercel)
vercel logs --tail

# 2. Check timestamps in logs
# Format: Request → Response time in ms

# 3. Export metrics from Vercel Analytics
# Dashboard: https://vercel.com/self-print/selfprint-v3-react/analytics
```

**Current Status:** ❌ Unknown (need measurement)

---

### 2. DATABASE PERFORMANCE

**Target:** Query time p95 < 100ms

**Queries to Profile:**
```sql
-- User profile fetch
SELECT * FROM public.profiles WHERE id = 'user-123';

-- Conversation history (paginated)
SELECT * FROM public.messages 
WHERE conversation_id = 'conv-123' 
ORDER BY created_at DESC 
LIMIT 50;

-- Decision outcomes (with join)
SELECT d.*, o.* FROM public.decisions d
LEFT JOIN public.decision_outcomes o ON d.id = o.decision_id
WHERE d.user_id = 'user-123'
ORDER BY d.created_at DESC
LIMIT 20;

-- Pattern analysis (heavy query)
SELECT * FROM public.pattern_analysis
WHERE user_id = 'user-123'
ORDER BY analyzed_at DESC
LIMIT 50;
```

**How to Measure:**

1. **Supabase Dashboard:**
   - Navigate to: Project → Logs → Database
   - Filter by query
   - Note execution times

2. **Enable Query Analysis:**
   ```sql
   -- Check slow queries
   SELECT query, calls, mean_time, max_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

3. **Connection Monitoring:**
   - Supabase Dashboard → Database → Connections
   - Monitor active connections
   - Check for connection pools

**Current Status:** ❌ Unknown (need measurement)

---

### 3. FRONTEND PERFORMANCE

**Target Metrics (Google Core Web Vitals):**

| Metric | Target | Good | Needs Work |
|--------|--------|------|-----------|
| **FCP** (First Contentful Paint) | < 2s | ✅ Good | 🔴 > 3s |
| **LCP** (Largest Contentful Paint) | < 2.5s | ✅ Good | 🔴 > 4s |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ✅ Good | 🔴 > 0.25 |
| **FID** (First Input Delay) | < 100ms | ✅ Good | 🔴 > 300ms |

**How to Measure:**

1. **Local Development (Lighthouse):**
   ```bash
   # Generate report
   npm run build
   npm run preview  # Serve production build locally
   
   # Open Chrome DevTools → Lighthouse → Generate report
   ```

2. **Production (Vercel Analytics):**
   - URL: https://vercel.com/self-print/selfprint-v3-react/analytics
   - View: Real User Monitoring (RUM)
   - Check metrics by URL

3. **WebPageTest:**
   - Visit: https://www.webpagetest.org
   - Enter: https://www.selfprint.one
   - Run test, get detailed waterfall

**Current Status:** 
- FCP: ~1.5s ✅
- LCP: ~2.2s ✅ (Need full measurement)
- CLS: Unknown ⏳
- FID: Unknown ⏳

---

### 4. ERROR RATES

**Target:** < 0.1% error rate

**How to Measure:**

1. **Vercel Logs:**
   ```bash
   vercel logs --tail --level error
   
   # Count errors over 1 hour
   # Calculate: errors / total requests
   ```

2. **Sentry (when initialized):**
   - Will show real-time error tracking
   - Error frequency + stack traces

**Current Status:** ❌ Unknown (Sentry not initialized)

---

### 5. COLD START TIME

**Target:** < 2 seconds

**How to Measure:**

1. Clear function cache
2. Make first API call
3. Note duration in Vercel logs

```bash
vercel logs --tail
# Look for first request after deployment
# Note: "Duration: XXX ms"
```

**Current Status:** ❌ Unknown (need measurement)

---

### 6. UPTIME & AVAILABILITY

**Target:** 99.9% availability

**How to Monitor:**

1. **Vercel Status Page:**
   - https://vercel-status.com

2. **Manual Health Checks:**
   ```bash
   # Check every 5 minutes
   curl -X GET https://www.selfprint.one/api/unified-handler \
     -H "Content-Type: application/json"
   
   # Expected: 400 (missing params) or 200 (valid call)
   # If 504/503: Down
   ```

3. **Set Up Automated Monitoring (TODO):**
   - UptimeRobot or Pingdom
   - Alert on downtime

**Current Status:** ⚠️ No monitoring (needs setup)

---

## 📋 BASELINE MEASUREMENT CHECKLIST

### Week 1: Data Collection

- [ ] **API Performance**
  - [ ] Test 5 endpoints under normal load
  - [ ] Record p50, p95, p99 response times
  - [ ] Test cold start (first request after deploy)
  - [ ] Test with realistic payload sizes

- [ ] **Database Performance**
  - [ ] Profile top 10 queries
  - [ ] Measure connection pool usage
  - [ ] Check for N+1 queries
  - [ ] Measure index effectiveness

- [ ] **Frontend Performance**
  - [ ] Run Lighthouse on homepage
  - [ ] Measure FCP, LCP, CLS
  - [ ] Test on 3G network (slow connection)
  - [ ] Test on low-end device

- [ ] **Error Monitoring**
  - [ ] Count errors over 24 hours
  - [ ] Categorize by type
  - [ ] Identify top 5 error patterns

- [ ] **Uptime Verification**
  - [ ] 24-hour continuous monitoring
  - [ ] Document any downtime
  - [ ] Check failure recovery time

### Week 2: Analysis & Documentation

- [ ] Compile all measurements
- [ ] Create baseline report (this document)
- [ ] Identify top 3 bottlenecks
- [ ] Set optimization priorities
- [ ] Define H4 performance targets

---

## 📊 CURRENT MEASUREMENTS (TO BE UPDATED)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| API Response (p95) | Unknown | < 500ms | ⏳ Measuring |
| DB Query (p95) | Unknown | < 100ms | ⏳ Measuring |
| Page Load (FCP) | ~1.5s | < 2s | ✅ Good* |
| Layout Shift (CLS) | Unknown | < 0.1 | ⏳ Measuring |
| Error Rate | Unknown | < 0.1% | ⏳ Measuring |
| Cold Start | Unknown | < 2s | ⏳ Measuring |
| Uptime | Unknown | 99.9% | ⏳ Measuring |

*FCP based on local testing; need production data

---

## 🛠️ TOOLS SETUP

### Vercel Analytics (Already Active)
✅ Real User Monitoring enabled  
✅ Lighthouse data available  
✅ Can see metrics in dashboard

### Supabase Monitoring
✅ Database logs available  
✅ Query statistics available  
⏳ Need to enable slow query log

### Sentry (TODO)
❌ Not initialized yet  
❌ Needed for production error tracking

### Custom Health Checks (TODO)
❌ No automated uptime monitoring  
❌ Need UptimeRobot or similar

---

## 📈 OPTIMIZATION PRIORITIES (Preliminary)

Once baseline is established, prioritize by impact:

1. **High Impact** (> 20% improvement expected)
   - API timeout fixes (currently 504 errors)
   - Database query optimization (N+1 queries)
   - Bundle size reduction

2. **Medium Impact** (10-20% improvement)
   - Cold start optimization
   - Image optimization (if applicable)
   - Minification of assets

3. **Low Impact** (< 10% improvement)
   - CSS/JS organization
   - Analytics overhead
   - Logging overhead

---

## ✅ SUCCESS CRITERIA

H3 is **COMPLETE** when:

1. ✅ All metrics measured and documented
2. ✅ Baseline report published
3. ✅ Top 3 bottlenecks identified
4. ✅ Optimization plan created
5. ✅ H4 performance targets set

**This Document:** Serves as baseline reference for all future optimization work

---

## 🚀 NEXT STEPS (H4)

Once baseline established:
1. **Performance Optimization** — Fix top 3 bottlenecks
2. **Beta Testing** — Validate performance with real users
3. **Production Deployment** — Release with monitoring active

---

**Authority:** Performance baseline for production  
**Maintained by:** jb_DEV  
**Started:** 2026-08-18
