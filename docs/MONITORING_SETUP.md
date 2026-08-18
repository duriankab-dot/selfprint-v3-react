# 📊 Monitoring Setup — Sentry + Uptime Robot

**วันที่:** 18 สิงหาคม 2026  
**สถานะ:** PHASE 3D  
**ประเมิน:** Production Error Tracking + Uptime Monitoring

---

## Part 1: Sentry Setup (Error Tracking + Performance Monitoring)

### Step 1: Create Sentry Project

1. Go to [sentry.io](https://sentry.io)
2. Sign in or create account
3. Create new project:
   - **Platform:** React
   - **Organization:** Your team
   - **Project name:** `selfprint-production`
   - **Alert emails:** dev-alerts@company.com

### Step 2: Get Sentry DSN

After creating project, you'll see:
```
Sentry DSN:
https://[KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]
```

Store this securely (add to .env.production)

### Step 3: Install Sentry SDK

```bash
npm install @sentry/react @sentry/tracing
```

### Step 4: Initialize Sentry in App

Create `src/services/sentry.ts`:

```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export function initSentry() {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    integrations: [
      new BrowserTracing({
        tracingOrigins: ["localhost", /^\//],
      }),
    ],
    tracesSampleRate: 0.1, // Trace 10% of transactions
    release: process.env.REACT_APP_VERSION,
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      return event;
    },
  });
}
```

Add to `src/main.tsx`:

```typescript
import { initSentry } from './services/sentry';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Step 5: Capture Errors Manually

```typescript
import * as Sentry from "@sentry/react";

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'TwinChat',
      action: 'sendMessage',
    },
  });
}
```

### Step 6: Backend Sentry (Node.js/Express)

If using Express backend, add Sentry there too:

```bash
npm install @sentry/node @sentry/tracing
```

In your Express app:

```typescript
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    nodeProfilingIntegration(),
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  tracesSampleRate: 0.1,
});

// Add Sentry error handler AFTER all routes
app.use(Sentry.Handlers.errorHandler());
```

### Step 7: Environment Variables

Add to `.env.production`:

```bash
# Sentry
REACT_APP_SENTRY_DSN=https://[KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]
REACT_APP_VERSION=3.0.0
SENTRY_DSN=https://[KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]
```

### Step 8: Sentry Dashboard Configuration

#### Performance Monitoring
1. Go to Sentry → Project Settings → Performance
2. Enable:
   - ✅ Transaction name normalization
   - ✅ Inbound filters
   - ✅ Performance monitoring

#### Alert Rules
Create alerts for:

```
Alert 1: Error Rate High
- When: error count > 10 in 5 minutes
- Action: Email + Slack

Alert 2: Performance Degradation
- When: p95 response time > 3000ms
- Action: Email + Slack

Alert 3: Twin Chat Errors
- When: Twin API returns 5xx
- Action: Slack + PagerDuty (if critical)
```

#### Source Maps
Upload source maps for better stack traces:

```bash
# In your build script
npm run build
sentry-cli releases files upload-sourcemaps ./dist --release=3.0.0
```

---

## Part 2: Uptime Robot Setup (Availability Monitoring)

### Step 1: Create Uptime Robot Account

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free tier available)
3. Verify email

### Step 2: Create Monitors

#### Monitor 1: Main Site
- **Monitor name:** SELFPRINT Main Site
- **Monitor type:** HTTP(s)
- **URL:** `https://www.selfprint.one`
- **Check interval:** Every 5 minutes
- **Timeout:** 30 seconds
- **HTTP method:** GET

#### Monitor 2: API Health
- **Monitor name:** SELFPRINT API Health
- **Monitor type:** HTTP(s)
- **URL:** `https://www.selfprint.one/api/health`
- **Check interval:** Every 5 minutes
- **Timeout:** 30 seconds
- **HTTP method:** GET

#### Monitor 3: Auth Endpoint
- **Monitor name:** SELFPRINT Auth Service
- **Monitor type:** HTTP(s)
- **URL:** `https://www.selfprint.one/api/auth/status`
- **Check interval:** Every 10 minutes
- **Timeout:** 30 seconds
- **HTTP method:** GET

#### Monitor 4: Twin API
- **Monitor name:** SELFPRINT Twin Chat API
- **Monitor type:** HTTP(s)
- **URL:** `https://www.selfprint.one/api/twin`
- **Check interval:** Every 15 minutes
- **Timeout:** 30 seconds
- **HTTP method:** POST
- **Custom headers:**
  ```
  Content-Type: application/json
  ```
- **Request body:**
  ```json
  {"twinId":"health-check","message":"ping"}
  ```

### Step 3: Configure Alerts

For each monitor, set up notifications:

#### Email Alerts
1. Select monitor → Edit → Notifications
2. Add email:
   - Primary: dev-alerts@company.com
   - Secondary: team@company.com
3. Notification type: Alert + Recovery

#### Slack Integration
1. Uptime Robot Dashboard → Integrations
2. Add Slack webhook
3. Enable for all monitors

#### Status Page (Optional)
1. Create public status page
2. Add all 4 monitors
3. Share with customers/stakeholders
4. URL: `https://status.selfprint.one`

### Step 4: Alert Escalation Policy

```
Scenario 1: Single Monitor Down (< 5 min)
- Send email alert
- Wait 5 minutes

Scenario 2: Continued Downtime (5-15 min)
- Send Slack alert
- Notify on-call engineer

Scenario 3: Extended Downtime (> 15 min)
- Send PagerDuty critical alert
- Auto-escalate to manager
- Post to #incidents Slack channel
```

### Step 5: Uptime Robot Dashboard

Configure dashboard to show:
- ✅ Current status of all monitors
- ✅ Uptime percentage (last 30 days)
- ✅ Average response time
- ✅ Alert history
- ✅ Incident timeline

---

## Part 3: Integration with Load Testing

### Sentry + k6 Integration

When running load tests, tag Sentry events:

```javascript
// loadtest.js (k6 script)

// Send test marker to Sentry
function markSentryEvent() {
  http.post('https://sentry.io/api/[PROJECT_ID]/events/', {
    message: `Load test started: ${__ENV.TEST_NAME}`,
    level: 'info',
    tags: {
      'test.type': 'load',
      'test.vus': __ENV.VUS,
      'test.duration': __ENV.DURATION,
    },
  });
}
```

---

## Part 4: Monitoring Dashboards

### Dashboard 1: Real-time Monitoring

Create a dashboard showing:

```
Row 1: Health Status
  - Main Site Status (Uptime Robot)
  - API Response Time (Sentry)
  - Error Rate (Sentry)

Row 2: Performance
  - P95 Response Time
  - P99 Response Time
  - Throughput (req/sec)

Row 3: Errors
  - Top 10 errors
  - Error trend
  - Affected users

Row 4: Infrastructure
  - Database connection pool
  - Memory usage
  - CPU usage
```

### Dashboard 2: Load Test Results

After load test completes:

1. Download results from k6/Sentry
2. Create summary:
   - Peak load reached: 100 users
   - P95 response time: X ms
   - Error rate: X%
   - Database bottleneck: Y

---

## Part 5: Alerting Rules Summary

| Alert | Condition | Action |
|-------|-----------|--------|
| **High Error Rate** | > 10 errors / 5 min | Email + Slack |
| **API Timeout** | Response > 5s | Email |
| **Twin Chat Down** | 503 status > 2 min | Slack + PagerDuty |
| **Database Slow** | Query > 2s | Email |
| **Uptime Critical** | Site down | Slack + SMS |
| **Memory Leak** | Usage > 90% | Email |
| **Load Test Started** | Test marker | Slack (info) |

---

## Part 6: Post-Launch Monitoring Plan

### Daily
- [ ] Check Sentry dashboard for new errors
- [ ] Verify all Uptime Robot monitors green
- [ ] Review Slack #incidents channel

### Weekly
- [ ] Review error trends (Sentry)
- [ ] Analyze performance metrics (Sentry)
- [ ] Check Uptime Robot reports
- [ ] Review alert frequency

### Monthly
- [ ] Generate incident report
- [ ] Review monitoring coverage
- [ ] Optimize alert thresholds
- [ ] Update runbooks based on incidents

---

## Part 7: Verification Checklist

- [ ] Sentry project created + DSN configured
- [ ] Frontend Sentry initialized
- [ ] Backend Sentry initialized
- [ ] Error capturing working (test via Sentry.captureException)
- [ ] Performance monitoring enabled
- [ ] Uptime Robot account created
- [ ] All 4 monitors created + running
- [ ] Email alerts working
- [ ] Slack integration working
- [ ] Status page public + accessible
- [ ] Dashboard created
- [ ] Alert rules configured
- [ ] Load test integration complete

---

## Troubleshooting

### Sentry: Events not showing up

```bash
# Check DSN is correct
echo $REACT_APP_SENTRY_DSN

# Test manually in console
Sentry.captureMessage("Test event")

# Check browser console for errors
# Verify environment is not 'development' (sample rate = 0)
```

### Uptime Robot: False positives

- Increase timeout to 60 seconds
- Add custom HTTP response code (e.g., 301 redirects)
- Whitelist Uptime Robot IPs in firewall

### Load test + monitoring collision

- Schedule load tests outside business hours
- Tag load test events in Sentry to filter
- Set separate alert threshold during load test

---

## Cost Estimates

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Sentry** | 5K events/month | $29/month (100K events) |
| **Uptime Robot** | 50 monitors | $50/month (500 monitors) |
| **Slack** | Unlimited | Free for Slack Workspace |
| **Total** | ~$0 | ~$80/month |

---

**Setup Completed:** 2026-08-18  
**Status:** Ready for PHASE 3 verification  
**Next:** Manual testing + load test execution
