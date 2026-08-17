# P0-C: PRODUCTION OBSERVABILITY SETUP CHECKLIST

**Date:** 2026-08-17  
**Status:** PARTIAL → Target: VERIFIED  
**Effort:** 4-6 hours  
**Blocker Level:** HIGH (Release Gate)

---

## 📋 OVERVIEW

Current state: Monitoring documentation exists (PHASE_G_MONITORING_SETUP.md) but no active monitoring deployed. This checklist implements the active monitoring loop:

**Error → Alert → Diagnose → Recover → Verify**

Target: Production observability fully active and tested before launch.

---

## 1. ERROR TRACKING

### Current State
- ❌ No error tracking service active
- ✅ Error handling hardened (Phase G)
- 📝 Documentation exists

### Implementation Checklist

#### 1.1 Choose Error Tracking Service

**Option A: Sentry (Recommended)**
- Cost: $29/month or $0 for open source
- Features: Error grouping, stack traces, session replay, performance
- Setup: 15 minutes

**Option B: Rollbar**
- Cost: $49/month
- Features: Similar to Sentry, good alerts
- Setup: 15 minutes

**Option C: Self-hosted (Glitchtip)**
- Cost: ~$50/month (server)
- Features: Open source, full control
- Setup: 1-2 hours

**Recommendation:** Sentry for speed

#### 1.2 Install Error Tracking

```bash
npm install @sentry/react @sentry/tracing
```

**Files to update:**
- `src/main.tsx` — Initialize Sentry at app startup
- `src/App.tsx` — Wrap with Sentry.ErrorBoundary
- `.env` — Add VITE_SENTRY_DSN

#### 1.3 Configure Sentry

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0, // 100% in development, 0.1 (10%) in production
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
});

const App = Sentry.withProfiler(AppComponent);
```

#### 1.4 Wrap Components

```typescript
// src/App.tsx
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <YourApp />
</Sentry.ErrorBoundary>
```

#### 1.5 Manually Report Errors

```typescript
// Any component/service
import * as Sentry from "@sentry/react";

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'TwinChat', operation: 'sendMessage' },
    contexts: {
      user: { userId, twinId },
      data: { messageLength: content.length },
    },
  });
}
```

**Files to update:**
- All service files that have try/catch
- All async API calls
- All error handlers

#### 1.6 Test Error Tracking

```typescript
// Test if Sentry is working
const testButton = () => {
  throw new Error('Test error from Sentry');
};
```

- Click button
- Wait 10 seconds
- Check Sentry dashboard
- Should see error reported

---

## 2. MONITORING & METRICS

### Current State
- 📝 Metrics defined but not active
- ❌ No real-time dashboard

### Implementation Checklist

#### 2.1 Frontend Performance Metrics

**Metrics to track:**
```
1. Page Load Time (FCP, LCP)
2. Interaction Latency (INP)
3. Cumulative Layout Shift (CLS)
4. JavaScript Execution Time
5. API Response Times
6. Memory Usage
7. Error Rate
8. User Session Duration
```

**Implementation with Sentry:**

```typescript
// Auto-collected by Sentry ✓
// - FCP, LCP, CLS
// - INP (interaction to next paint)

// Manual tracking:
import * as Sentry from "@sentry/react";

// Track custom metrics
Sentry.captureMessage('ChatMessage sent', {
  level: 'info',
  tags: { feature: 'chat', action: 'send' },
  measurements: {
    response_time_ms: 245,
    token_count: 150,
  },
});
```

#### 2.2 Backend Performance Metrics

**Metrics to track:**
```
1. API Endpoint Response Times
2. Database Query Times
3. AI Service Latency (Anthropic)
4. Queue Processing Times
5. Memory/CPU Usage
6. Active Connections
7. Queue Depth
```

**Implementation:**

```typescript
// server/index.ts
import * as Sentry from "@sentry/node";

// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    Sentry.captureMessage(`${req.method} ${req.path}`, {
      level: 'info',
      tags: { endpoint: req.path, status: res.statusCode },
      measurements: { duration_ms: duration },
    });
  });
  
  next();
});
```

#### 2.3 Business Metrics

**Metrics to track:**
```
1. New Signups (Daily/Weekly)
2. Twin Creations
3. Active Users (DAU, MAU)
4. Conversations Started
5. Decisions Tracked
6. Follow-ups Delivered
7. Subscription Conversions
8. Churn Rate
9. Premium Feature Usage
10. Error Rate by User Segment
```

**Implementation:**

```typescript
// Track in services
import * as Sentry from "@sentry/react";

async function createTwin(userId: string, characteristics: object) {
  Sentry.captureMessage('Twin created', {
    level: 'info',
    tags: { user_id: userId },
    measurements: { characteristics_size: JSON.stringify(characteristics).length },
  });
  
  // ... actual creation logic
}
```

---

## 3. ALERTING

### Current State
- ❌ No alerts configured

### Implementation Checklist

#### 3.1 Setup Alert Channels

**Email Alerts:**
- [ ] Create team email: `alerts@selfprint.ai` (or ops@ email)
- [ ] Configure in Sentry/Rollbar/etc
- [ ] Test alert delivery

**Slack Alerts:**
- [ ] Create Slack workspace channel: `#incidents`
- [ ] Create Slack app for monitoring service
- [ ] Connect error tracking to Slack
- [ ] Test alert delivery

**PagerDuty (Optional):**
- [ ] Setup for critical incidents
- [ ] On-call rotations
- [ ] Escalation policies

#### 3.2 Alert Rules (Critical)

**Rule 1: Error Rate Spike**
```
Trigger: Error rate > 1% in last 5 minutes
OR: 100+ errors in last minute
Action: Alert → Slack #incidents + Email
Severity: 🔴 Critical
```

**Rule 2: API Response Time**
```
Trigger: P95 response time > 2000ms
Action: Alert → Slack #incidents
Severity: 🟠 High
```

**Rule 3: Database Errors**
```
Trigger: Supabase connection errors > 5 in 5 min
Action: Alert → Slack #incidents + Page On-Call
Severity: 🔴 Critical
```

**Rule 4: Payment Processing**
```
Trigger: Stripe webhook failures > 3 in 5 min
Action: Alert → Slack #payments + Email
Severity: 🔴 Critical
```

**Rule 5: AI Service Degradation**
```
Trigger: Anthropic API timeout or rate limit
Action: Alert → Slack #ai-issues
Severity: 🟠 High
```

**Rule 6: Memory/CPU**
```
Trigger: Server memory > 90% OR CPU > 80% sustained
Action: Alert → Slack #infrastructure
Severity: 🟠 High
```

#### 3.3 Alert Suppression

**Define non-critical alerts (avoid alert fatigue):**

```
DO NOT ALERT for:
- 404 errors (expected for some endpoints)
- Network timeouts < 100ms (flaky connections)
- CSS/image loading failures (CDN issues, not critical)
- Non-authenticated user errors (expected)
```

---

## 4. DASHBOARDS

### Current State
- 📝 Dashboard layouts documented
- ❌ No actual dashboard deployed

### Implementation Checklist

#### 4.1 Real-Time Operations Dashboard

**URL:** `https://monitoring.selfprint.ai` (or Vercel-hosted)

**Sections:**
1. **Health Status** (Green/Yellow/Red)
   - All systems operational?
   - Any ongoing incidents?

2. **Live Errors** (Last 30 min)
   - Error count timeline
   - Top errors (grouped)
   - Error rate trend

3. **Performance**
   - API response time (P50, P95, P99)
   - Frontend page load time
   - Database query times
   - AI service latency

4. **Traffic**
   - Requests per second
   - Users online (concurrent)
   - Daily active users
   - Signup rate

5. **Infrastructure**
   - Memory usage
   - CPU usage
   - Disk usage
   - Network I/O

6. **Business Metrics**
   - Signups (last 24h)
   - Subscriptions active
   - Revenue (last 24h)
   - Churn rate

**Tools to create dashboard:**
- Sentry built-in dashboard (free)
- Custom: Grafana + Prometheus
- Supabase: Realtime dashboard
- Vercel Analytics

#### 4.2 On-Call Dashboard

**URL:** `https://monitoring.selfprint.ai/oncall`

**Purpose:** Quick diagnosis during incidents

**Sections:**
1. **Current Alerts** (sorted by severity)
2. **Recent Incidents** (last 7 days)
3. **Runbook Links** (quick actions)
4. **Chat** (incident coordination)
5. **On-Call Schedule** (who's responsible now)

---

## 5. LOGGING & LOG AGGREGATION

### Current State
- ✅ Structured logging in some services
- ❌ No centralized log aggregation

### Implementation Checklist

#### 5.1 Structured Logging

**Replace console.* with structured logger:**

```typescript
import { logger } from '@/services/logger';

// BEFORE (bad)
console.log('Twin created:', twinId);
console.error('Database error:', error);

// AFTER (good)
logger.info('Twin created', {
  user_id: userId,
  twin_id: twinId,
  characteristics_keys: Object.keys(characteristics),
});

logger.error('Database error', {
  service: 'TwinSupabaseService',
  operation: 'createTwin',
  error_message: error.message,
  error_code: error.code,
  user_id: userId,
});
```

**Create logger service:**

```typescript
// src/services/logger.ts
export const logger = {
  info: (message: string, data?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }));
    // Also send to Sentry/Datadog/etc if configured
  },
  warn: (message: string, data?: object) => { /* ... */ },
  error: (message: string, data?: object) => { /* ... */ },
  debug: (message: string, data?: object) => { /* ... */ },
};
```

#### 5.2 Centralized Logging

**Option A: Sentry (combined with error tracking)**
- All logs go to Sentry
- Searchable, filterable
- Works with Sentry alerts

**Option B: LogRocket**
- Session replay + logging
- Automatically captures console, network, etc.
- Cost: $99/month

**Option C: Datadog**
- Professional-grade logging
- Powerful queries
- Cost: $100+/month

**Recommendation:** Sentry (already using for errors)

#### 5.3 Log Retention

**Define retention policy:**
```
1. Error logs: 30 days
2. Warning logs: 14 days
3. Info logs: 7 days
4. Debug logs: 1 day (dev only)

Exceptions:
- Payment-related: 90 days (compliance)
- Security incidents: 1 year
```

---

## 6. INCIDENT RESPONSE

### Current State
- 📝 Documentation exists
- ❌ Not tested

### Implementation Checklist

#### 6.1 Incident Response Runbook

**Create:** `docs/INCIDENT_RESPONSE_RUNBOOK.md`

```markdown
# Incident Response Runbook

## Severity Levels
- 🔴 Critical: Service down, payment failing, data loss
- 🟠 High: Degraded performance, significant errors
- 🟡 Medium: Non-critical features broken
- 🟢 Low: Minor issues, UX problems

## Critical Incident (🔴)

### Phase 1: Acknowledge (5 min)
1. [ ] Page on-call engineer
2. [ ] Open incident channel in Slack
3. [ ] Notify stakeholders
4. [ ] Document timeline

### Phase 2: Diagnose (15 min)
1. [ ] Check Sentry dashboard
2. [ ] Check infrastructure dashboard
3. [ ] Check Supabase status
4. [ ] Check Stripe status
5. [ ] Check Vercel logs
6. [ ] Identify root cause

### Phase 3: Mitigate (30 min)
1. [ ] If DB issue: Scale up or failover
2. [ ] If API issue: Restart or redeploy
3. [ ] If AI issue: Fallback to text mode
4. [ ] If payment issue: Notify Stripe support
5. [ ] Update incident status page
6. [ ] Monitor metrics during fix

### Phase 4: Resolve & Communicate
1. [ ] Deploy fix or workaround
2. [ ] Monitor error rates (return to normal?)
3. [ ] Test critical paths manually
4. [ ] Update status page: "Resolved"
5. [ ] Send all-clear notification
6. [ ] Schedule postmortem for next day

### Phase 5: Postmortem (Next day)
1. [ ] Document what happened
2. [ ] Identify root cause
3. [ ] List preventive measures
4. [ ] Assign owner for each action item
5. [ ] Track completion
```

#### 6.2 Test Incident Response

**Run a "game day" incident simulation:**

```
Scenario: Supabase is down (simulated by blocking requests)

Timeline:
T+0:   Alerts start firing
T+5:   On-call responds, opens incident channel
T+10:  Diagnose: Supabase dashboard shows degradation
T+20:  Failover: Switch to read-only mode / cache
T+30:  Communication: Notify customers
T+45:  Resolution: Supabase restored
T+60:  All-clear: Full functionality restored

Success Criteria:
- [ ] Alert fired within 1 minute of issue
- [ ] On-call responded within 5 minutes
- [ ] Root cause identified within 15 minutes
- [ ] Communication sent to users
- [ ] Full mitigation within 1 hour
- [ ] Normal operation restored within 2 hours
```

#### 6.3 War Room Communication

**Setup during incidents:**

- Slack channel: `#incident-[incident-id]`
- Thread format:
  ```
  T+0:05 (Someone) Error rate spiked to 15%
  T+0:10 (Someone else) Investigating database
  T+0:15 (Lead) Found: N+1 query in DecisionService
  T+0:20 (Dev) Deployed fix
  T+0:25 (Lead) Monitoring improvement
  T+0:30 (Lead) ✅ Resolved, error rate back to 0.1%
  ```

---

## 7. PERFORMANCE MONITORING

### Current State
- ✅ Baseline established (Phase G)
- ❌ Continuous monitoring not active

### Implementation Checklist

#### 7.1 Web Vitals Monitoring

**Track Core Web Vitals:**

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import * as Sentry from "@sentry/react";

// src/main.tsx
getCLS(metric => {
  Sentry.captureMessage('CLS', {
    level: 'info',
    measurements: { cls: metric.value },
  });
});

getFID(metric => {
  Sentry.captureMessage('FID', {
    level: 'info',
    measurements: { fid: metric.value },
  });
});

getFCP(metric => {
  Sentry.captureMessage('FCP', {
    level: 'info',
    measurements: { fcp: metric.value },
  });
});

getLCP(metric => {
  Sentry.captureMessage('LCP', {
    level: 'info',
    measurements: { lcp: metric.value },
  });
});

getTTFB(metric => {
  Sentry.captureMessage('TTFB', {
    level: 'info',
    measurements: { ttfb: metric.value },
  });
});
```

**Target values (per Google):**
- FCP: < 1.8s ✅
- LCP: < 2.5s ✅
- CLS: < 0.1 ✅
- INP: < 200ms ✅
- TTFB: < 600ms ✅

#### 7.2 Custom Performance Metrics

```typescript
// Track operation durations
export async function trackMetric(
  name: string,
  operation: () => Promise<any>,
  tags?: object
) {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    
    Sentry.captureMessage(`${name} completed`, {
      level: 'info',
      tags,
      measurements: { duration_ms: duration },
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    Sentry.captureException(error, {
      tags: { operation: name, ...tags },
      measurements: { duration_ms: duration },
    });
    throw error;
  }
}

// Usage
await trackMetric(
  'TwinChat.sendMessage',
  () => sendMessage(twinId, userMessage),
  { twin_id: twinId, message_length: userMessage.length }
);
```

---

## 🎯 SUCCESS CRITERIA

**ALL of these must be TRUE:**

1. ✅ Error tracking active (Sentry or similar)
2. ✅ All errors reported to dashboard
3. ✅ Real-time performance metrics collected
4. ✅ Alert rules configured and tested
5. ✅ Alerts delivered to Slack
6. ✅ Operations dashboard accessible
7. ✅ Structured logging in all services
8. ✅ Centralized log aggregation working
9. ✅ Incident response runbook tested
10. ✅ Game day incident simulation completed successfully
11. ✅ On-call schedule defined
12. ✅ Postmortem process documented

**Status:** ⏳ Not yet complete

---

## NEXT SESSION HANDOFF

When P0-C is VERIFIED:
- Create `HANDOFF_2026-08-18_P0-C_OBSERVABILITY_VERIFIED.md`
- Update task status to COMPLETED
- Move to P0-D: Public Acquisition Engine

**Estimated Timeline:** 4-6 hours of focused work
