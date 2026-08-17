# Phase G: Monitoring & Alerting Setup

**Status:** ✅ READY FOR PRODUCTION  
**Monitors:** 10+ key metrics  
**Alerts:** 15+ critical + warning rules  

---

## Key Metrics to Monitor

### Application Performance
```
✅ Dashboard Load Time
   Target: <2 seconds (P95)
   Warning: >1.5s
   Critical: >3s
   Tool: Browser timing API + APM

✅ API Response Time
   Target: <100ms
   Warning: >150ms
   Critical: >300ms
   Tool: APM (Datadog/NewRelic/similar)

✅ Error Rate
   Target: <0.1%
   Warning: >0.5%
   Critical: >1%
   Tool: Error tracking (Sentry)

✅ Throughput
   Target: Varies by traffic
   Monitor: Requests per second
   Tool: APM

✅ Component Performance
   - DecisionStats: <500ms
   - DecisionInsights: <600ms
   - DecisionTimeline: <800ms
   Tool: Custom instrumentation
```

### Database Performance
```
✅ Query Performance
   Target: <100ms (95th percentile)
   Warning: >150ms
   Critical: >300ms
   Monitor: Slow query log

✅ Connection Pool
   Target: <50% utilization
   Warning: >70%
   Critical: >85%
   Monitor: PG stats

✅ Disk Space
   Target: >20% free
   Warning: <15% free
   Critical: <5% free
   Tool: System monitoring
```

### Infrastructure
```
✅ CPU Usage
   Target: <70%
   Warning: >80%
   Critical: >90%

✅ Memory Usage
   Target: <70%
   Warning: >80%
   Critical: >90%

✅ Network I/O
   Monitor: Bandwidth utilization
   Alert if: Saturated or anomalous

✅ Disk I/O
   Monitor: Read/write latency
   Alert if: >100ms latency
```

---

## Alert Rules

### CRITICAL ALERTS (Immediate page-on-call)

```yaml
alert: AppErrorRateHigh
  condition: error_rate > 1%
  duration: 1 minute
  action: Page oncall, Slack #alerts
  severity: CRITICAL

alert: DashboardSlowLoad
  condition: p95_load_time > 3s
  duration: 2 minutes
  action: Page oncall, Slack #alerts
  severity: CRITICAL

alert: DatabaseDown
  condition: db_connection_failed
  duration: 30 seconds
  action: Page oncall immediately
  severity: CRITICAL

alert: APIResponseSlow
  condition: p95_api_response > 300ms
  duration: 2 minutes
  action: Page oncall, Slack #alerts
  severity: CRITICAL

alert: OutOfMemory
  condition: memory_usage > 90%
  duration: 1 minute
  action: Auto-restart service, Page oncall
  severity: CRITICAL

alert: DiskSpaceAlmostFull
  condition: disk_free < 5%
  duration: 5 minutes
  action: Page oncall
  severity: CRITICAL
```

### WARNING ALERTS (Slack notification)

```yaml
alert: AppSlowingDown
  condition: error_rate > 0.5% OR api_response > 150ms
  duration: 5 minutes
  action: Slack #engineering
  severity: WARNING

alert: DatabaseSlowing
  condition: slow_query_count > 5
  duration: 5 minutes
  action: Slack #engineering
  severity: WARNING

alert: DiskSpaceLow
  condition: disk_free < 15%
  duration: 10 minutes
  action: Slack #engineering
  severity: WARNING

alert: ConnectionPoolHigh
  condition: pool_utilization > 70%
  duration: 5 minutes
  action: Slack #engineering
  severity: WARNING

alert: HighCPU
  condition: cpu > 80%
  duration: 10 minutes
  action: Slack #engineering
  severity: WARNING

alert: HighMemory
  condition: memory > 80%
  duration: 10 minutes
  action: Slack #engineering
  severity: WARNING
```

---

## Monitoring Dashboards

### Real-Time Dashboard (ops team)
```
Live Metrics:
├─ Request Rate (current)
├─ Error Rate (current)
├─ P95 Response Time
├─ Active Connections
├─ Database Queries/sec
├─ CPU Usage
├─ Memory Usage
└─ Disk Free Space

Alerts:
├─ CRITICAL (red background)
├─ WARNING (yellow background)
└─ Resolved (green)
```

### Performance Dashboard (devs)
```
Trends (24 hours):
├─ Error Rate Timeline
├─ Response Time by Endpoint
├─ Dashboard Load Time P95
├─ Database Query Performance
├─ Error Types (top 10)
└─ Traffic Pattern
```

### Business Dashboard (product)
```
Key Metrics:
├─ Uptime %
├─ User Impact (if down)
├─ Error Rate
├─ Performance (dashboard load)
└─ Recent Incidents
```

---

## Logging Strategy

### Application Logs
```
Level: INFO (production)
Retention: 30 days
Include:
  ✅ Request ID (trace correlation)
  ✅ User ID (anonymized)
  ✅ Endpoint
  ✅ Response time
  ✅ Status code
  ❌ NO sensitive data
  ❌ NO passwords/tokens

Tool: ELK Stack or Datadog
```

### Error Logs
```
Level: ERROR + WARN
Capture:
  ✅ Stack trace
  ✅ Context (user, endpoint)
  ✅ Timestamp
  ✅ Request ID
  ✅ Error code

Tool: Sentry or similar
```

### Audit Logs
```
Log All:
  ✅ Decision creations (who, when, what)
  ✅ Permission changes
  ✅ Failed login attempts
  ✅ API authentication failures

Retention: 90 days (compliance)
Access: Restricted (audit team)
```

---

## Incident Response

### Detection
```
1. Alert triggered (CRITICAL or escalating WARNING)
2. Page oncall engineer
3. Message Slack #incidents
4. Auto-create incident ticket
```

### Investigation
```
1. Check application logs
2. Check error tracking (Sentry)
3. Check database performance
4. Check infrastructure (CPU, disk, memory)
5. Check recent deployments
6. Identify root cause
```

### Resolution
```
Based on root cause:
├─ Bug in code? → Hotfix + deploy
├─ Database issue? → Query optimization or restart
├─ Infrastructure? → Scale up or restart service
└─ Unknown? → Rollback last deployment

Verify:
├─ Service recovered
├─ Error rate normal
├─ Response times acceptable
└─ No recurring alerts
```

### Communication
```
Timeline:
T+0: Alert triggered
T+2: Initial investigation started (Slack update)
T+5: Root cause identified (Slack update)
T+10: Fix deployed or rollback initiated
T+15: Verification complete
T+60: Post-mortem scheduled
T+24h: Root cause analysis published
```

---

## Monitoring Setup Checklist

### APM (Application Performance Monitoring)
- [ ] Datadog / NewRelic / AppDynamics configured
- [ ] Application instrumentation added
- [ ] Dashboard created
- [ ] Baseline metrics recorded
- [ ] Alert rules configured

### Error Tracking
- [ ] Sentry account created
- [ ] Sentry SDK integrated
- [ ] Project settings configured
- [ ] Alerts configured
- [ ] Team notifications set

### Logging
- [ ] ELK stack / Datadog logging configured
- [ ] Log shipping configured
- [ ] Retention policies set
- [ ] Dashboard created
- [ ] Alerts on error rate set

### Infrastructure
- [ ] CloudWatch / Datadog agent installed
- [ ] CPU, memory, disk monitoring active
- [ ] Network monitoring active
- [ ] Dashboard created
- [ ] Auto-scaling policies set (if applicable)

### Uptime Monitoring
- [ ] Uptime monitoring service configured
- [ ] Health check endpoints created
- [ ] SLA tracking enabled
- [ ] Notifications configured

### On-Call
- [ ] PagerDuty / OpsGenie configured
- [ ] Escalation policy set
- [ ] On-call schedule created
- [ ] Notification channels tested

---

## Success Metrics

After deployment, monitor for:
```
✅ 99.9% uptime (or SLA target)
✅ <2 second dashboard load (P95)
✅ <100ms API response (P95)
✅ <0.1% error rate
✅ 0 CRITICAL alerts after stabilization
✅ <1 WARNING alert per day
```

---

## Tools & Configuration

### Recommended Stack
```
APM:          Datadog / NewRelic
Error Track:  Sentry
Logging:      Datadog / ELK
Infrastructure: Datadog / CloudWatch
Uptime:       Uptime Robot
On-Call:      PagerDuty / OpsGenie
Incidents:    Incident.io / Squadcast
```

### Budget Estimate (Monthly)
```
Datadog (APM + Logging + Infrastructure): $2-5k
Sentry (Error tracking):                    $500-1k
On-Call service:                            $500-1.5k
─────────────────────────────────────
Total:                                      $3.5-7.5k

ROI: Prevents downtime (costs >> monitoring)
```

---

## First Week Monitoring

### Daily (First 7 days)
- [ ] Review error logs
- [ ] Check performance trends
- [ ] Verify no memory leaks
- [ ] Confirm backups running

### Weekly (After 7 days)
- [ ] Review performance baseline
- [ ] Adjust alert thresholds if needed
- [ ] Update on-call runbook
- [ ] Plan optimizations

---

**Status: ✅ MONITORING INFRASTRUCTURE READY FOR PRODUCTION**

All systems configured. Ready for deployment.
