# P0-C: ALERT RULES CONFIGURATION

**วันที่:** 2026-08-17  
**สถานะ:** ✅ เตรียมพร้อมสำหรับ Sentry

---

## 🚨 **ALERT RULES สำคัญ (Critical Alerts)**

### **Rule 1: Error Rate Spike** 🔴 CRITICAL

```
Trigger:
  - Error rate > 1% ในช่วง 5 นาที
  - หรือ Errors > 100 ใน 1 นาที

Action:
  - Alert → Slack #incidents + Email
  - Page on-call engineer
  - Severity: 🔴 CRITICAL

Notification:
  - Subject: "🔴 ERROR SPIKE: {error_rate}% - {error_count} errors"
  - Include: Top errors, affected users, affected endpoints
  - Remediation: Link to Sentry dashboard + runbook

Threshold: Immediate response required
Timeline: < 5 minutes to acknowledge
```

---

### **Rule 2: Database Connection Errors** 🔴 CRITICAL

```
Trigger:
  - Supabase connection errors > 5 ใน 5 นาที
  - Database unavailable error

Action:
  - Alert → Slack #incidents + Page on-call
  - Severity: 🔴 CRITICAL

Remediation:
  1. Check Supabase status dashboard
  2. Verify network connectivity
  3. Check connection pool
  4. Escalate to Supabase support if needed

Timeout: < 2 minutes response
```

---

### **Rule 3: Payment Processing Failure** 🔴 CRITICAL

```
Trigger:
  - Stripe webhook failures > 3 ใน 5 นาที
  - Payment processing errors > 5% error rate

Action:
  - Alert → Slack #payments + #incidents
  - Severity: 🔴 CRITICAL

Check:
  - Stripe API status
  - Webhook endpoint health
  - Payment processor logs
  - Manual intervention required

Customer Impact: HIGH - revenue at risk
```

---

### **Rule 4: API Response Time** 🟠 HIGH

```
Trigger:
  - P95 response time > 2000ms ประจำ 10 นาที
  - P99 response time > 5000ms

Action:
  - Alert → Slack #incidents
  - Severity: 🟠 HIGH

Investigate:
  - Database query times
  - AI service latency (Anthropic)
  - Server CPU/Memory
  - Network latency

Target: < 500ms for normal ops
Warning: > 1000ms
Critical: > 2000ms sustained
```

---

### **Rule 5: AI Service Degradation** 🟠 HIGH

```
Trigger:
  - Anthropic API timeout/rate limit
  - Claude response latency > 5 seconds
  - Token limit exceeded errors

Action:
  - Alert → Slack #ai-issues
  - Severity: 🟠 HIGH

Fallback:
  - Switch to text-only mode
  - Disable advanced features temporarily
  - Queue requests for retry

Customer Experience: Degraded but available
```

---

### **Rule 6: Memory/CPU Overload** 🟠 HIGH

```
Trigger:
  - Server memory > 90% sustained
  - CPU > 80% for > 5 minutes
  - Vercel function timeout > 10% error rate

Action:
  - Alert → Slack #infrastructure
  - Severity: 🟠 HIGH

Response:
  1. Scale up resources
  2. Kill long-running processes
  3. Check for memory leaks
  4. Review recent deployments

Performance Impact: Slowdown expected
```

---

### **Rule 7: Unhandled Exceptions** 🟡 MEDIUM

```
Trigger:
  - New exception type detected
  - Exception count > 10 ใน 1 ชั่วโมง

Action:
  - Alert → Slack #alerts
  - Severity: 🟡 MEDIUM

Review:
  - Stack trace
  - Affected users
  - Browser/platform info
  - Reproduction steps

Timeline: Monitor and fix within working hours
```

---

## 📊 **ALERT CHANNELS**

### **Slack Notifications**

```
#incidents
  - Red alerts (critical)
  - All P0/P1 issues
  - Deployments
  - Incident status updates

#alerts  
  - Yellow alerts (medium)
  - Warnings
  - Monitoring info

#ai-issues
  - AI service alerts
  - Claude API status
  - Token usage warnings

#infrastructure
  - Server metrics
  - Scaling events
  - Performance warnings

#payments
  - Payment processing status
  - Stripe webhooks
  - Revenue impact
```

### **Email Notifications**

```
To: ops-team@selfprint.ai

Critical Alerts:
  - Error rate spike
  - Database down
  - Payment processing failure
  - API timeout

Daily Digest:
  - Summary of alerts
  - Metric trends
  - Performance stats
```

### **PagerDuty (Optional)**

```
Critical incidents:
  - Database down
  - Payment processing down
  - Revenue-impacting outage

On-call rotation:
  - Engineering team
  - 24/7 coverage
  - Escalation rules
```

---

## ✅ **ALERT IMPLEMENTATION CHECKLIST**

Sentry Configuration:

- [ ] Create Sentry project
- [ ] Add DSN to .env
- [ ] Initialize Sentry in main.tsx
- [ ] Set environment variable (dev/staging/prod)
- [ ] Setup release tracking

Alert Rules:

- [ ] Rule 1: Error rate spike (> 1%)
- [ ] Rule 2: Database connection errors (> 5)
- [ ] Rule 3: Payment failures (> 3)
- [ ] Rule 4: API response time (P95 > 2000ms)
- [ ] Rule 5: AI service degradation
- [ ] Rule 6: Memory/CPU overload (> 90%/80%)
- [ ] Rule 7: Unhandled exceptions (> 10/hr)

Notification Channels:

- [ ] Slack workspace connected
- [ ] #incidents channel created
- [ ] #alerts channel created
- [ ] Email notifications configured
- [ ] Test alert sent to all channels

Monitoring:

- [ ] Dashboard created
- [ ] Error tracking active
- [ ] Performance monitoring active
- [ ] User session tracking active
- [ ] Source maps uploaded

---

## 🎯 **SUCCESS CRITERIA**

P0-C Observability is VERIFIED when:

- ✅ Sentry project active and receiving events
- ✅ All 7 alert rules configured
- ✅ Slack notifications working
- ✅ Email alerts working
- ✅ Error rate trending < 0.1%
- ✅ API response time P95 < 1000ms
- ✅ No unhandled exceptions in last hour
- ✅ 0 failed payment processing alerts
- ✅ Incident response drill completed successfully
- ✅ Team knows how to respond to alerts

---

**สถานะ:** ⏳ พร้อมเพื่อนำไปใช้งาน

ต่อไป: ติดตั้ง Sentry + ตั้งค่า alerts → Mark P0-C VERIFIED ✅
