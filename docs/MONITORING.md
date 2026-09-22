# MONITORING & OBSERVABILITY

**Status:** Partially Implemented  
**Version:** 1.0  
**Last Updated:** 2026-08-18

---

## 📊 MONITORING OVERVIEW

| Component | Tool | Status | Priority |
|-----------|------|--------|----------|
| API Performance | Vercel Analytics | ✅ Active | High |
| Error Tracking | Sentry | ⚠️ Stub | High |
| Uptime Monitoring | — | ❌ TODO | High |
| Application Logs | Console + File | ✅ Partial | Medium |
| Database Monitoring | Supabase Dashboard | ✅ Active | Medium |
| Performance Metrics | Vercel Speed Insights | ✅ Active | Medium |

---

## 🔍 KEY METRICS

### API Metrics
- **Response Time** — Target: < 500ms (p95)
- **Error Rate** — Target: < 0.1%
- **Throughput** — Track requests/minute
- **Cold Start Time** — Target: < 2s

### Application Metrics
- **Page Load Time** — Target: < 2s (FCP)
- **Largest Paint** — Target: < 2.5s (LCP)
- **Layout Shift** — Target: < 0.1 (CLS)
- **Memory Usage** — Target: < 500MB

### Database Metrics
- **Query Time** — Target: < 100ms (p95)
- **Connections** — Monitor active connections
- **Replication Lag** — Target: < 1s
- **Storage** — Monitor growth rate

### Error Metrics
- **Unhandled Exceptions** — Alert on any
- **Failed Requests** — Track by endpoint
- **Critical Errors** — Immediate escalation
- **User Impact** — Sessions affected

---

## 📈 VERCEL ANALYTICS

**Access:** https://vercel.com/self-print/selfprint-v3-react/analytics

**What's Tracked:**
- Real User Monitoring (RUM)
- Page views & sessions
- Performance metrics
- Error tracking
- Geographical distribution

**Set Alerts:**
1. Vercel Dashboard → Monitoring
2. Create alerts for:
   - Error rate > 1%
   - Response time > 1000ms
   - CLS > 0.25

---

## 🚨 ERROR TRACKING (Sentry)

**Status:** NOT INITIALIZED (TODO)

**Setup Instructions:**

1. Create Sentry project: https://sentry.io
2. Add to `.env`:
   ```
   VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/123456
   VITE_SENTRY_ENVIRONMENT=production
   ```
3. Initialize in `src/main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
     tracesSampleRate: 0.1,
   });
   ```
4. Wrap app: `export default Sentry.withProfiler(App)`

**Benefits Once Enabled:**
- Real-time error alerts
- Stack traces + source maps
- User session replay
- Performance monitoring

---

## 📊 SUPABASE MONITORING

**Access:** https://supabase.com → Your Project → Logs

**Available Logs:**
- API calls
- Database queries
- Authentication events
- Realtime subscriptions

**Key Queries to Monitor:**
```sql
-- Slow queries (> 100ms)
SELECT query, duration FROM pg_stat_statements
WHERE duration > 100000
ORDER BY duration DESC;

-- Active connections
SELECT datname, usename, count(*) 
FROM pg_stat_activity 
GROUP BY datname, usename;
```

---

## 🪵 APPLICATION LOGGING

**Current Implementation:**
- Console logs (development)
- Vercel function logs (production)
- No persistent log storage (TODO)

**Best Practices:**
```typescript
// DO: Include context
console.error('User login failed', { userId, error });

// DON'T: Vague messages
console.error('Error');

// DO: Use log levels
console.log('Info');      // General info
console.warn('Warning');  // Potential issue
console.error('Error');   // Must fix
```

**Structured Logging (TODO):**
```typescript
// Recommended pattern
const log = {
  info: (msg, data) => console.log(JSON.stringify({ level: 'info', msg, data, ts: new Date() })),
  error: (msg, err) => console.error(JSON.stringify({ level: 'error', msg, error: err.message, ts: new Date() }))
};
```

---

## ⚠️ ALERTS & ESCALATION

**Alert Channels:**
- [ ] Email (jb_DEV@example.com) — Critical errors
- [ ] Slack (#alerts) — All alerts (TODO: setup)
- [ ] PagerDuty (TODO: setup)

**Alert Thresholds:**

| Alert | Threshold | Action |
|-------|-----------|--------|
| Error rate spike | > 1% | Page on-call |
| Response time | > 2s p95 | Investigate |
| Database down | 0% availability | Page DBA |
| Memory leak | > 1GB growth/hour | Restart function |
| Disk usage | > 80% | Alert DevOps |

---

## 🔄 HEALTH CHECKS

**Endpoint:** `/api/health` (TODO: implement)

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-18T12:00:00Z",
  "checks": {
    "database": "✓",
    "auth": "✓",
    "api": "✓"
  }
}
```

**Monitoring:**
```bash
# Check every 60 seconds
curl https://www.selfprint.one/api/health
```

---

## 📊 DASHBOARDS (TODO)

**Recommended:**
- Vercel Analytics (built-in)
- Supabase Dashboard (built-in)
- Grafana (for centralized view)
- DataDog (advanced APM)

---

## 🎯 SLO (Service Level Objectives)

| Objective | Target | Status |
|-----------|--------|--------|
| Availability | 99.9% | ⏳ Pending |
| Response Time (p95) | < 500ms | ✅ Met |
| Error Rate | < 0.1% | ✅ Met |
| Incident Response | < 15min | ⏳ Pending |

---

## 📞 ON-CALL PROCEDURES

**Current:** Manual monitoring  
**Future:** Automated alerts + on-call rotation

**Escalation:**
1. Alert triggered
2. Initial response < 5min
3. If unresolved → escalate to jb_DEV
4. If critical → activate incident response plan

---

**Authority:** Single source of truth for monitoring  
**Maintained by:** jb_DEV  
**Last Updated:** 2026-08-18
