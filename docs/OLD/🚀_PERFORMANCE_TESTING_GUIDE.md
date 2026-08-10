# 🚀 Performance Testing & Monitoring Guide
## ก่อนเริ่ม Astrovera Integration

**วัตถุประสงค์:** ตรวจสอบ Selfprint ปัจจุบัน + เตรียม Monitoring ก่อน integrate Astrovera

---

## 📊 Phase 1: Baseline Testing (ปัจจุบัน)

ทดสอบ Selfprint เดิม (ก่อน Astrovera) เพื่อเป็นจุดอ้างอิง

### ✅ Test 1.1: Page Load Performance

**URL:** https://selfprint.one

**Metrics to Measure:**
```
□ First Contentful Paint (FCP)          → Target: < 2s
□ Largest Contentful Paint (LCP)        → Target: < 3s
□ Cumulative Layout Shift (CLS)         → Target: < 0.1
□ Time to Interactive (TTI)             → Target: < 4s
□ Total Page Size (MB)                  → Monitor
□ Number of Requests                    → Monitor
```

**Tools:**
- Chrome DevTools (F12 → Network + Performance tab)
- WebPageTest: https://www.webpagetest.org/
- PageSpeed Insights: https://pagespeed.web.dev/

**Success Criteria:**
- [ ] FCP < 2s
- [ ] LCP < 3s
- [ ] CLS < 0.1
- [ ] No console errors

---

### ✅ Test 1.2: Onboarding Flow Performance

**Path:** Landing → Onboarding → Blueprint → Home

**Checklist:**
```
□ Step 1: Emotion Select
  - Click time: < 500ms
  - UI responsive: yes/no
  
□ Step 2: Birthdate Input
  - Input lag: none/mild/severe
  - Validation speed: < 100ms
  
□ Step 3: AI Creation Animation
  - Animation smooth: yes/no (60fps?)
  - Duration: 3-5s (expected)
  
□ Step 4: Fine-tuning Questions
  - Auto-advance: smooth/laggy
  - Answer save: instant/delayed
  
□ Step 5: Blueprint Display
  - Load time: < 1s
  - Render quality: clear/blurry
  
□ Step 6: Full Analysis
  - Load time: < 2s
  - Accuracy meter animation: smooth
  
□ Step 7: Home Navigation
  - Transition: smooth/janky
  - Home page load: < 1s
```

**Tools:**
- Chrome DevTools Performance Recorder
- Lighthouse

**Success Criteria:**
- [ ] All steps < 500ms each
- [ ] 60fps animations
- [ ] No jank/stutter

---

### ✅ Test 1.3: API Performance (/api/nova)

**Endpoint:** POST /api/nova

**Metrics:**
```
□ API Response Time        → Target: < 1.5s (p95)
□ Error Rate              → Target: < 0.1%
□ Timeout Rate            → Target: 0%
□ Concurrent Requests     → Test: 10, 50, 100 users
```

**Load Test Tools:**
- Apache JMeter
- k6: https://k6.io/
- Artillery: https://artillery.io/

**Test Scenario:**
```bash
# Simulate 10 concurrent users
artillery quick --count 10 --num 100 https://selfprint.one/api/nova

# Results:
# - Average latency: X ms
# - p95 latency: X ms
# - p99 latency: X ms
# - Error rate: X%
```

**Success Criteria:**
- [ ] p95 latency < 1.5s
- [ ] Error rate < 0.1%
- [ ] Can handle 100 concurrent users

---

## 📈 Phase 2: Baseline Report

**Document:** `docs/PERFORMANCE_BASELINE.md`

```markdown
# Performance Baseline (Current State)

## Metrics Summary
| Metric | Value | Target |
|--------|-------|--------|
| FCP | XXXms | <2000ms ✅/❌ |
| LCP | XXXms | <3000ms ✅/❌ |
| CLS | X.XX | <0.1 ✅/❌ |
| TTI | XXXms | <4000ms ✅/❌ |
| /api/nova (p95) | XXXms | <1500ms ✅/❌ |
| Error Rate | X% | <0.1% ✅/❌ |

## Observations
- Strengths: [list]
- Weaknesses: [list]
- Areas to optimize: [list]

## Recommendations
1. [optimization idea]
2. [optimization idea]
3. [optimization idea]
```

---

## 🔍 Phase 3: Post-Integration Testing (After Phase 2 Complete)

### ✅ Test 3.1: Astrovera Added Latency

**Baseline:** /api/nova latency = X ms  
**With Astrovera:** /functions/v1/intelligence latency = Y ms

**Acceptable Delta:**
```
□ Added latency: < 500ms additional
□ Total latency (baseline + Astrovera): < 2s (p95)
□ Fallback latency (if Astrovera down): < baseline
```

**Test:**
```
1. Measure new endpoint latency
2. Calculate delta
3. If delta > 500ms:
   - Review: network, adapter, Edge Function
   - Optimize: caching, batching, lazy-load
4. Test fallback behavior
```

---

### ✅ Test 3.2: Concurrent Users (Load Test)

**Simulate:** 10, 50, 100, 500 concurrent users

**Metrics:**
```
□ p50 latency:  < 1s
□ p95 latency:  < 2s
□ p99 latency:  < 3s
□ Error rate:   < 0.5%
□ Fallback rate: < 5%
```

**Tool:**
```bash
# k6 load test
k6 run load-test.js
```

**load-test.js:**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100,        // virtual users
  duration: '5m',  // 5 minutes
  thresholds: {
    http_req_duration: ['p(95)<2000'], // p95 < 2s
    http_req_failed: ['rate<0.005'],   // error < 0.5%
  },
};

export default function() {
  let res = http.post('https://selfprint.one/functions/v1/intelligence', {
    analysisType: 'psychology',
    payload: { /* data */ }
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency < 2s': (r) => r.timings.duration < 2000,
  });
}
```

---

## 🎯 Phase 4: Monitoring Setup

### ✅ Test 4.1: Vercel Analytics

**Setup:**
```
□ Enable: Vercel Analytics (Web Vitals)
□ Monitor: FCP, LCP, CLS, TTI
□ Dashboard: https://vercel.com/analytics
□ Alerts: if LCP > 3s for > 5% of users
```

**Metrics to Track:**
- Page load times
- Core Web Vitals
- Geographic distribution
- Device types (mobile vs desktop)

---

### ✅ Test 4.2: Supabase Edge Function Monitoring

**Setup:**
```
□ Enable: Supabase Function Logs
□ Monitor: error rate, latency, execution time
□ Alerts:
  - Error rate > 1%
  - Latency p95 > 2s
  - Timeouts > 5%
```

**Metrics:**
```sql
-- Query: Function execution metrics
SELECT 
  DATE_TRUNC('minute', created_at) as time,
  function_name,
  AVG(execution_ms) as avg_latency,
  MAX(execution_ms) as max_latency,
  COUNT(CASE WHEN status='error' THEN 1 END)::FLOAT / COUNT(*) as error_rate
FROM function_logs
GROUP BY 1, 2
ORDER BY 1 DESC;
```

---

### ✅ Test 4.3: Application Performance Monitoring (APM)

**Tools (Choose One):**
- **Sentry** (Error tracking + Performance): https://sentry.io/
- **New Relic** (Full APM): https://newrelic.com/
- **DataDog** (Enterprise): https://www.datadoghq.com/
- **Cloudflare Analytics Engine** (Free): built-in

**Setup in Selfprint:**
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});
```

**Monitor:**
- API call latency
- Error rates by endpoint
- User journey funnels
- Performance trends

---

## 📋 Pre-Deployment Checklist

**Before Going Live with Astrovera:**

```
PERFORMANCE
□ Baseline metrics captured
□ Post-integration latency tested
□ Load test passed (100+ concurrent)
□ p95 latency < 2s
□ Error rate < 0.5%
□ Fallback tested & working

MONITORING
□ Vercel Analytics enabled
□ Supabase Function logs configured
□ APM (Sentry/New Relic) set up
□ Alerts configured
□ Dashboards created

STAGING
□ Deploy to staging environment
□ Run all tests in staging
□ Team QA sign-off
□ No critical issues

PRODUCTION READY
□ Rollback plan documented
□ On-call engineer assigned
□ Communication plan ready
□ 24h monitoring planned
```

---

## 🔄 Rollback Plan

**If Performance Degrades:**

```
Metric Threshold          Action
─────────────────────────────────────
p95 latency > 3s    →     Investigate
Error rate > 1%     →     Investigate
Fallback rate > 10% →     Rollback
CLS > 0.15          →     Rollback
LCP > 4s            →     Investigate
```

**Rollback Steps:**
```bash
# 1. Switch /functions/v1/intelligence → /api/nova (old endpoint)
# 2. Disable Astrovera adapter
# 3. Revert Selfprint deployment
# 4. Monitor metrics for 30 minutes
# 5. If stable: investigate issue
# 6. If unstable: contact Astrovera team
```

---

## 📊 Reporting Template

**Daily Report (While Rolling Out):**

```
Date: 2026-08-XX
Rollout: XX% of users

METRICS (last 24h)
├─ FCP:           X ms (baseline: X ms)
├─ LCP:           X ms (baseline: X ms)
├─ API latency:   X ms (target: < 2s)
├─ Error rate:    X% (target: < 0.5%)
└─ Fallback rate: X% (target: < 5%)

ALERTS
├─ [✅/❌] LCP < 3s
├─ [✅/❌] Error rate < 0.5%
└─ [✅/❌] Fallback < 5%

ISSUES
└─ None / [List any issues]

NEXT ACTIONS
└─ [What's next?]
```

---

## 🎯 Success Criteria

**Integration is Successful If:**

```
✅ Performance Metrics
   - p95 latency < 2s
   - Error rate < 0.5%
   - Fallback rate < 5%
   - No regression from baseline

✅ User Experience
   - Onboarding smooth (60fps)
   - Blueprint loads quickly
   - No visible errors

✅ Monitoring
   - All alerts configured
   - Data flowing to dashboards
   - On-call engineer has visibility

✅ Stability
   - 24h stable at 100% users
   - No critical issues
   - Rollback plan not needed
```

---

## 📞 Contacts & Escalation

| Issue | Contact | Channel |
|-------|---------|---------|
| **Performance degradation** | DevOps Lead | Slack #incidents |
| **API errors** | Astrovera Team | Email + Slack |
| **Monitoring alerts** | On-call engineer | Phone + Slack |
| **User complaints** | Support Team | Zendesk |

---

**ดำเนินการตามขั้นตอนนี้** → **ผ่าน Phase 1-4** → **พร้อม Deploy** ✅

