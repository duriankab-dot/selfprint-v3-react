# Phase G: Production Hardening Plan

**Date:** 2026-08-17  
**Token Budget:** 80-100k  
**Estimated Duration:** 4-6 hours  
**Priority:** CRITICAL — Pre-deployment  

---

## Phase G Objectives

1. **Performance Optimization** — Ensure <2s dashboard load, <100ms queries
2. **Security Hardening** — API safety, auth flow, input validation
3. **Load Testing** — Simulate 1000+ users, identify bottlenecks
4. **Deployment Ready** — Checklist, runbook, monitoring

---

## Task Breakdown

### G1: Performance Optimization (25k tokens)

#### G1a: Identify Bottlenecks (6k)
- Profile DecisionStats component load time
- Profile DecisionInsights query performance
- Profile DecisionTimeline rendering
- Baseline: dashboard load time
- Target: <2 seconds

#### G1b: Implement Caching (8k)
- Add React Query/SWR for decision data caching
- Cache insights (24-hour TTL)
- Cache patterns (12-hour TTL)
- Reduce database queries by 70%

#### G1c: Query Optimization (6k)
- Review DecisionLearningService queries
- Add database indices (world, twinId)
- Optimize FollowUpScheduler query
- Batch operations where possible

#### G1d: Code Splitting & Lazy Loading (5k)
- Lazy load decision components
- Split dashboard bundle
- Defer heavy computations
- Target: <1.5s dashboard initial load

---

### G2: Security Hardening (20k tokens)

#### G2a: API Security Audit (7k)
- Review TwinAPIService endpoints
- Verify auth on all decision endpoints
- Check SQL injection risks
- Validate input (userId, worldId)
- Rate limiting for endpoints

#### G2b: Auth Flow Verification (6k)
- Verify Passkey authentication
- Check session management
- Validate token refresh
- Test unauthorized access scenarios
- Permission boundary testing

#### G2c: Input Validation & Sanitization (4k)
- Validate decision inputs
- Sanitize user-provided text
- Prevent XSS in insights display
- Test edge cases (empty, null, malicious)

#### G2d: Environment Security (3k)
- Verify no secrets in code
- Check .env configuration
- Database connection security
- API key management

---

### G3: Load Testing & Performance (20k tokens)

#### G3a: Performance Benchmarking (8k)
- DecisionStats: <500ms load
- DecisionInsights: <600ms per world
- DecisionTimeline: <800ms for 100 decisions
- All endpoints: <100ms query time
- Dashboard full load: <2 seconds

#### G3b: Simulate 1000+ Decisions (7k)
- Generate test data (1000+ decisions)
- Test query performance at scale
- Test pattern analysis performance
- Memory usage profiling

#### G3c: Optimize Hot Paths (5k)
- Profile getDecisionInsights()
- Profile analyzeTwinDecisionPatterns()
- Cache most-used computations
- Reduce re-renders in components

---

### G4: Deployment & Go-Live (20k tokens)

#### G4a: Deployment Checklist (7k)
```
Pre-deployment:
- [ ] All tests passing
- [ ] TypeScript: PASS
- [ ] No console.log
- [ ] No hardcoded values
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Migrations ready (if any)

Deployment:
- [ ] Database backups
- [ ] Feature flags configured
- [ ] Monitoring set up
- [ ] Rollback procedure ready

Post-deployment:
- [ ] Smoke tests run
- [ ] Analytics tracking live
- [ ] Error monitoring active
```

#### G4b: Go-Live Runbook (7k)
- Step-by-step deployment guide
- Rollback procedures
- Monitoring & alerting setup
- Incident response plan
- Escalation contacts

#### G4c: Monitoring & Alerting (6k)
- Dashboard uptime monitoring
- Performance degradation alerts
- Error rate monitoring
- Database performance tracking
- User activity logging

---

## Success Criteria

### Performance Targets ✅
- Dashboard loads in <2 seconds
- All API endpoints <100ms
- DecisionStats <500ms
- DecisionInsights <600ms per world
- 1000+ decisions handled efficiently

### Security Targets ✅
- All endpoints authenticated
- Input validation on all user data
- No SQL injection risks
- No XSS vulnerabilities
- Rate limiting active

### Deployment Readiness ✅
- Full checklist completed
- Runbook tested
- Monitoring live
- Rollback procedures verified
- Team trained

---

## Files to Create/Modify

### New Files
```
✅ docs/PHASE_G_DEPLOYMENT_CHECKLIST.md
✅ docs/PHASE_G_GO_LIVE_RUNBOOK.md
✅ docs/PHASE_G_PERFORMANCE_REPORT.md
✅ server/middleware/rate-limit.ts (if needed)
```

### Modified Files
```
✅ src/services/DecisionLearningService.ts (optimize queries)
✅ src/services/TwinAPIService.ts (add auth, rate limiting)
✅ src/components/decision/*.tsx (lazy loading)
✅ vite.config.ts (code splitting)
```

---

## Token Allocation

| Task | Tokens | Status |
|------|--------|--------|
| G1a: Bottleneck Analysis | 6k | Pending |
| G1b: Caching | 8k | Pending |
| G1c: Query Optimization | 6k | Pending |
| G1d: Code Splitting | 5k | Pending |
| G2a: API Security | 7k | Pending |
| G2b: Auth Verification | 6k | Pending |
| G2c: Input Validation | 4k | Pending |
| G2d: Environment Security | 3k | Pending |
| G3a: Benchmarking | 8k | Pending |
| G3b: Load Testing | 7k | Pending |
| G3c: Hot Path Optimization | 5k | Pending |
| G4a: Deployment Checklist | 7k | Pending |
| G4b: Go-Live Runbook | 7k | Pending |
| G4c: Monitoring Setup | 6k | Pending |
| **TOTAL** | **~92k** | |
| **Buffer** | ~38k | Reserve |

---

## Implementation Order

1. **G1a + G2a** (in parallel) — Identify issues
2. **G1b + G2b + G2c** — Fix core issues
3. **G1c + G1d** — Optimize performance
4. **G3a + G3b + G3c** — Validate performance
5. **G4a + G4b + G4c** — Prepare deployment
6. **Final verification** — All systems GO

---

## Critical Path

```
START
  ↓
[G1a] Identify bottlenecks ──→ [G1b] Caching ──→ [G1c] Queries ──→ [G1d] Code split
                                    ↓
[G2a] API Security      ──→ [G2b] Auth      ──→ [G2c] Validation ──→ [G2d] Env
                                    ↓
[G3a] Benchmarking      ──→ [G3b] Load test ──→ [G3c] Hot paths
                                    ↓
[G4a] Deployment        ──→ [G4b] Runbook  ──→ [G4c] Monitoring
                                    ↓
                              FINAL VERIFICATION
                                    ↓
                              GO-LIVE READY ✅
```

---

## Notes for Next Session

- Phase F committed and deployed to staging
- Use staging env for G performance testing
- Production DB backup before any migrations
- Have rollback plan ready
- Team training on go-live procedures
- Customer communication prepared

---

**Status: READY TO PROCEED WITH PHASE G** 🚀
