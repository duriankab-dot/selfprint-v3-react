# 📋 Deployment Readiness Checklist (Phase 3)

**Date:** 2026-08-07  
**Language:** ไทย  
**Phase:** Phase 3 Integration + Launch  
**Owner:** DevOps + Frontend Team  
**Duration:** 3 days (Aug 8-10)  
**Status:** CRITICAL - Go/No-Go Decision Point

---

## 🎯 OBJECTIVE

ตรวจสอบความพร้อมของ **SelfPrint v3.2 + MEMO Integration** ก่อน production deployment:
- Environment setup ✓
- Backend integration ✓
- Frontend build ✓
- Security + Performance ✓
- Monitoring + Rollback ✓

**ไม่ผ่าน checklist นี้ = ห้ามข้าน production**

---

## 🔴 CRITICAL PATH

```
Aug 8:  Brain Gateway Ready
  ↓
Aug 8-9: Full System Test (E2E)
  ↓
Aug 10: Deployment Go/No-Go
  ↓
Aug 11: Production Launch (if GO)
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Group 1: ENVIRONMENT SETUP ✓

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| .env files created (.env.development, .env.production) | [ ] | DevOps | See 07_ENV_TEMPLATE.md |
| API endpoints verified (Brain Gateway, Claude API) | [ ] | Backend | POST /api/chat working |
| Database migrations complete | [ ] | Backend | If any new models added |
| Asset CDN configured | [ ] | DevOps | Images, fonts, icons ready |
| Secrets manager connected (AWS Secrets / HashiCorp Vault) | [ ] | DevOps | API keys secured |
| Rate limiting configured | [ ] | Backend | Prevent abuse (max 100 req/min per user) |

### Group 2: BACKEND INTEGRATION ✓

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Brain Gateway system parameter working | [ ] | Backend | test: POST with `system` field |
| getNovaPrompt.ts generating correct combinations | [ ] | Frontend | 11×6×18 = 1,188 permutations |
| selfprintChat.ts API wrapper tested | [ ] | Frontend | Verified error handling |
| CORS headers configured correctly | [ ] | Backend | Allow selfprint.io origin |
| Response timeout set (15 sec max) | [ ] | Backend | Prevent hang on slow requests |
| Error logging + alerting active | [ ] | DevOps | Datadog/CloudWatch monitoring |

### Group 3: FRONTEND BUILD ✓

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| npm run build succeeds (0 errors) | [ ] | Frontend | Check dist/ folder |
| Production bundle size < 500KB (gzip) | [ ] | Frontend | Run: npm run analyze |
| All TypeScript types validated | [ ] | Frontend | npx tsc --noEmit |
| ESLint + Prettier pass | [ ] | Frontend | npm run lint --fix |
| Critical CSS inlined (above-fold) | [ ] | Frontend | Landing page 1st paint < 2s |
| Images optimized (WebP format) | [ ] | Design/Frontend | All .png → .webp |
| No console errors/warnings | [ ] | Frontend | Run in browser DevTools |

### Group 4: SECURITY ✓

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| API keys NOT hardcoded (all in env vars) | [ ] | Frontend/Backend | grep for hardcoded keys |
| HTTPS enforced (redirect http → https) | [ ] | DevOps | Test on browser |
| Content Security Policy (CSP) headers set | [ ] | Backend | Prevent XSS |
| Input validation on all forms | [ ] | Frontend | Birth date, mood selector, etc. |
| Claude API key rotation plan | [ ] | DevOps | Update monthly |
| No sensitive data in logs | [ ] | Backend/DevOps | Scrub PII from error logs |

### Group 5: PERFORMANCE ✓

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Page load time < 3 sec (LCP target 2.5s) | [ ] | Frontend | Measure with Lighthouse |
| API response time < 2 sec (p95) | [ ] | Backend | Check via Datadog |
| Database query optimization (no N+1) | [ ] | Backend | Profile with explain() |
| Caching strategy active (Redis if needed) | [ ] | Backend | Cache Nova prompts (5 min TTL) |
| Image lazy-loading configured | [ ] | Frontend | Use next/image or Intersection API |
| CDN cache headers set | [ ] | DevOps | Immutable for versioned assets |

### Group 6: TESTING ✓

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| E2E test suite passing (Playwright / Cypress) | [ ] | QA | Full user journey: emotion → Twin creation |
| Manual smoke test on staging | [ ] | QA | 5 test users, 3 hubs each |
| A/B test control group set up (if needed) | [ ] | Marketing/Product | Track conversion metrics |
| Rollback test executed (can revert to v3.1) | [ ] | DevOps | Practiced 1x, document steps |
| Load testing done (1000 concurrent users) | [ ] | QA/DevOps | Check server stays stable |

### Group 7: MONITORING + ALERTING ✓

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Error tracking active (Sentry / Rollbar) | [ ] | DevOps | Alert on >5 errors/min |
| Application metrics dashboard (Datadog) | [ ] | DevOps | CPU, memory, request rate, errors |
| User analytics tracking (Google Analytics / Mixpanel) | [ ] | Product | Track: new twins created, user retention |
| Alerts configured for key thresholds | [ ] | DevOps | Page load > 5s, error rate > 1%, server 500+ |
| On-call rotation active | [ ] | DevOps | Responder assigned 24/7 |
| Incident response playbook ready | [ ] | DevOps | See ROLLBACK_PLAN_TH.md |

### Group 8: DOCUMENTATION ✓

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| README.md updated with deployment instructions | [ ] | Frontend | Step-by-step for team |
| Runbook ready (troubleshooting guide) | [ ] | DevOps | Common issues + fixes |
| API documentation current | [ ] | Backend | Swagger/OpenAPI spec |
| Handoff document to team | [ ] | jb_DEV | Ownership + contact info |
| Post-launch checklist prepared | [ ] | Product | Day 1-7 monitoring activities |

---

## 🚨 GO / NO-GO CRITERIA

### ✅ GO (All Must Be True)
```
✅ Groups 1-5: 100% checklist complete
✅ E2E test passing on staging
✅ Zero critical/high severity bugs
✅ Brain Gateway tested + working
✅ Monitoring + alerting confirmed active
✅ Team sign-off obtained (DevOps + Backend + Frontend)
```

### ❌ NO-GO (Any One Triggers Halt)
```
❌ Any Group 1-4 item unchecked
❌ Load testing shows > 5% error rate
❌ API response time > 5 sec (p95)
❌ Security scan finds vulnerabilities
❌ Brain Gateway integration incomplete
❌ No on-call responder assigned
```

---

## 📊 DECISION MATRIX

| Scenario | Decision | Action |
|----------|----------|--------|
| All checks ✅, no issues | **LAUNCH** | Proceed to production Aug 11 |
| 1-2 low priority items [ ], no blockers | **LAUNCH + FIX** | Launch, fix during week 1 |
| Any critical/high item [ ] | **HALT** | Fix first, re-test, then launch |
| Performance < threshold | **HALT** | Optimize, load test again |
| Brain Gateway not ready | **DELAY** | Push launch to Aug 12-15 |

---

## 🔄 POST-LAUNCH MONITORING (Week 1)

**Aug 11-17: First Week Vigilance**

| Day | Task | Owner | Criteria |
|-----|------|-------|----------|
| Aug 11 | Go-live monitoring (1st 4 hours) | DevOps | Zero 500 errors, <5s load time |
| Aug 11-12 | User acceptance test | QA + early users | Create twins, verify accuracy |
| Aug 12 | Metrics check | Product | >500 new sign-ups, >50 twins created |
| Aug 13 | Performance review | DevOps | Confirm p95 response time <2s |
| Aug 15 | First post-mortem (if issues) | Engineering | Document + action items |
| Aug 17 | Stability assessment | Team | Ready to declare "stable"? |

---

## 📞 ESCALATION PATH

**If issue detected during launch:**

1. **Severity: CRITICAL** (system down, data loss)
   - Contact: DevOps Lead + Backend Lead
   - Action: Execute rollback immediately (< 5 min)
   
2. **Severity: HIGH** (major feature broken, >10% error rate)
   - Contact: Engineering Lead + Product Owner
   - Action: Hotfix or rollback (< 30 min decision)
   
3. **Severity: MEDIUM** (minor bugs, <5% errors)
   - Contact: Team Slack channel
   - Action: Monitor + plan fix for next release

---

## 📝 SIGN-OFF

**Pre-Deployment Checklist Owner:** DevOps Lead  
**Sign-off Required From:**
- [ ] Frontend Lead (Build + Security)
- [ ] Backend Lead (API + Brain Gateway)
- [ ] DevOps Lead (Deployment + Monitoring)
- [ ] Product Owner (Go/No-Go)

---

## 🔗 Related Documents

- **07_ENV_TEMPLATE.md** — Environment configuration
- **08_BACKEND_GATEWAY_SAMPLE_CODE.js** — Brain Gateway integration code
- **ROLLBACK_PLAN_TH.md** — Emergency revert procedures
- **TROUBLESHOOTING_GUIDE_TH.md** — Common issues (coming)
- **00_CURRENT_STATUS_IMPLEMENTATION_PLAN_TH.md** — Full status

---

**Created:** 2026-08-07  
**Last Updated:** 2026-08-07  
**Next Review:** 2026-08-10 (Pre-Launch)
