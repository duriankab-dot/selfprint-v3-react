# Phase G: Go-Live Runbook

**Purpose:** Step-by-step operational guide for production launch  
**Audience:** DevOps, Engineering Lead, On-Call Engineer  
**Duration:** ~1 hour total (30 min deployment + 30 min monitoring)

---

## Quick Reference

| Item | Details |
|------|---------|
| **Deployment Type** | Blue-green (if available) or rolling |
| **Rollback Time** | ~10 minutes |
| **Monitoring Window** | 2-4 hours (first 30 min intensive) |
| **Success Criteria** | 0% error rate, <2s dashboard load |
| **Abort Condition** | >1% error rate or >5s response time |

---

## PHASE 1: PRE-FLIGHT (T-4 hours)

### 1.1 Notify Team
```
→ Slack: #engineering-oncall
  "Deploying Selfprint Phase G at [TIME] UTC"
  "Expected window: 30-45 minutes"
  "Rollback ready if needed"
```

### 1.2 Verify Staging
```bash
# SSH to staging
$ ssh staging.example.com

# Test dashboard
curl -s http://localhost:3000/dashboard | grep "Decision" && echo "✅ Staging OK"

# Test API
curl -s http://localhost:3000/api/decisions/stats | jq . && echo "✅ API OK"

# Database check
psql -U admin -d selfprint -c "SELECT COUNT(*) FROM decision_log;" && echo "✅ DB OK"
```

### 1.3 Backup Database
```bash
# Full database backup
$ pg_dump selfprint > /backups/selfprint-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
$ ls -lh /backups/selfprint-*.sql | tail -1

# Archive to S3
$ aws s3 cp /backups/selfprint-latest.sql s3://backups/prod/
```

### 1.4 Final Verification
- [ ] Build artifact ready: `dist/` folder generated
- [ ] Version tag exists: `git describe --tags`
- [ ] Database backup verified
- [ ] Monitoring dashboards loaded
- [ ] Alert email test sent

---

## PHASE 2: DEPLOYMENT (T-0)

### 2.1 Pre-Deployment Check (5 min)
```bash
# Test connectivity
$ ping production-api.example.com
$ curl -I https://selfprint.app/status

# Check current version
$ curl https://selfprint.app/api/version
# Should show previous version (e.g., "v1.2.3")

# Database health
$ psql -U admin -d selfprint -c "SELECT 1;"
```

### 2.2 Stop Current Service (2 min)
```bash
# SSH to production
$ ssh prod.example.com

# Stop service gracefully
$ sudo systemctl stop selfprint

# Wait for connections to drain
$ sleep 10

# Verify stopped
$ sudo systemctl status selfprint | grep "inactive"
```

### 2.3 Deploy New Version (3 min)
```bash
# Backup current version
$ sudo cp -r /opt/selfprint /opt/selfprint.backup

# Deploy new build
$ sudo cp -r dist/* /opt/selfprint/

# Verify files
$ ls -la /opt/selfprint/index.html

# Update version file
$ echo "v1.3.0" | sudo tee /opt/selfprint/.version
```

### 2.4 Start Service (2 min)
```bash
# Start service
$ sudo systemctl start selfprint

# Wait for startup
$ sleep 5

# Verify running
$ sudo systemctl status selfprint | grep "active"

# Check logs
$ sudo journalctl -u selfprint -n 20
```

### 2.5 Smoke Tests (5 min)
```bash
# API health
$ curl -s https://selfprint.app/api/health | jq .

# Test dashboard load
$ curl -s https://selfprint.app/dashboard | grep "Decision" && echo "✅"

# Test decision endpoint
$ curl -s -X GET https://selfprint.app/api/decisions/stats \
  -H "Authorization: Bearer $TEST_TOKEN" | jq .

# Create test decision
$ curl -X POST https://selfprint.app/api/decisions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "question": "Test decision",
    "options": ["A", "B"],
    "choice": "A"
  }' | jq .
```

**Expected Responses:**
```json
✅ Health: { "status": "ok", "version": "v1.3.0" }
✅ Dashboard: HTML containing "Decision" word
✅ Stats: { "totalDecisions": N, "successRate": X% }
✅ Create: { "id": "...", "status": "created" }
```

---

## PHASE 3: MONITORING (T+30 min)

### 3.1 First 5 Minutes (Critical)
```bash
# Monitor logs in real-time
$ sudo journalctl -u selfprint -f

# Watch for errors
# - Connection timeouts?
# - Database errors?
# - Memory issues?
```

### 3.2 First 30 Minutes (Intensive)
**Check every 2 minutes:**
```bash
# Error rate (should be <0.1%)
$ curl -s https://monitoring.example.com/error-rate | jq .

# Response time (should be <2s)
$ time curl -s https://selfprint.app/dashboard > /dev/null

# Database latency (should be <100ms)
$ sudo psql -U admin -d selfprint -c "EXPLAIN ANALYZE SELECT COUNT(*) FROM decision_log;"

# Memory usage (should be stable)
$ sudo free -h

# Disk space (should have >5GB free)
$ sudo df -h /
```

### 3.3 Next 30 Minutes (Active)
**Check every 5 minutes:**
- Error rate still good?
- Response times stable?
- No spike in database connections?
- Log entries clean?
- Users accessing dashboard?

### 3.4 Next 2-4 Hours (Monitoring)
**Automated checks active:**
- Error alerts triggered if >1%?
- Performance alerts fired?
- Database connection limit healthy?
- Disk space adequate?

---

## ABORT/ROLLBACK PROCEDURE

**Trigger Rollback if:**
- Error rate > 1% for >1 min
- Response time > 5s for >3 consecutive requests
- Database connection failures
- Service crashes repeatedly
- Security incident detected

**Execute Rollback:**
```bash
# T+0: Decision made, announce
$ slack: "@here Rolling back to v1.2.3. ETA 10 minutes."

# T+1: Stop current service
$ sudo systemctl stop selfprint

# T+2: Restore previous version
$ sudo rm -rf /opt/selfprint && sudo mv /opt/selfprint.backup /opt/selfprint

# T+4: Start previous version
$ sudo systemctl start selfprint

# T+5: Smoke tests
$ curl https://selfprint.app/api/health | jq .

# T+10: Verification complete
$ slack: "✅ Rollback complete. System stable on v1.2.3"

# T+60: Root cause analysis
$ Post-mortem meeting scheduled
```

---

## INCIDENT RESPONSE

### Scenario 1: High Error Rate
```
1. [ ] Check logs: $ sudo journalctl -u selfprint -n 100
2. [ ] Identify error pattern
3. [ ] If code bug: ROLLBACK
4. [ ] If config issue: FIX and restart
5. [ ] If DB issue: ROLLBACK
6. [ ] Verify stability after fix
```

### Scenario 2: Slow Response Times
```
1. [ ] Check database performance
2. [ ] Check API response times
3. [ ] Check N+1 queries
4. [ ] If bottleneck clear: OPTIMIZE or ROLLBACK
5. [ ] Monitor recovery
```

### Scenario 3: Database Issues
```
1. [ ] Check connection count
2. [ ] Check query slowlog
3. [ ] Check disk space
4. [ ] If can't fix: ROLLBACK immediately
5. [ ] Restore from backup if needed
```

---

## SUCCESS CRITERIA

### Deployment Complete When:
```
✅ Service running on v1.3.0
✅ Error rate < 0.1%
✅ Response time < 2 seconds
✅ Dashboard loads successfully
✅ API endpoints responding
✅ Database queries <100ms
✅ No critical alerts
✅ All smoke tests passed
```

### Stable When:
```
✅ 30 minutes with 0 errors
✅ Response times consistent
✅ No memory leaks
✅ User traffic normal
✅ Customer feedback positive
```

---

## POST-DEPLOYMENT

### T+1 Hour
- [ ] Full monitoring report
- [ ] Performance metrics stable
- [ ] All success criteria met
- [ ] Announce to customers: "Online"

### T+24 Hours
- [ ] No issues reported
- [ ] Performance stable
- [ ] Users positive
- [ ] Schedule retrospective

### T+7 Days
- [ ] Deployment retrospective
- [ ] Lessons documented
- [ ] Improvements identified

---

## EMERGENCY CONTACTS

| Role | Name | Phone | Email | Slack |
|------|------|-------|-------|-------|
| DevOps Lead | ___________ | _________ | _____________ | @_____ |
| Engineer Lead | ___________ | _________ | _____________ | @_____ |
| Security | ___________ | _________ | _____________ | @_____ |
| DB Admin | ___________ | _________ | _____________ | @_____ |

---

## COMMUNICATION TEMPLATES

### Pre-Deployment (T-2 hours)
```
🚀 Deploying Selfprint Phase G (Decision Intelligence Dashboard)

⏰ Scheduled: [DATE TIME] UTC
⏱️ Expected downtime: 15-30 minutes
🎯 Changes: Dashboard components, security hardening, performance optimization

🔗 Status page: https://status.selfprint.app
📞 Support: [contact info]

Will post updates every 5 minutes.
```

### Deployment Complete
```
✅ Deployment complete!

📊 Dashboard: https://selfprint.app/dashboard
📈 Performance: Response times <2s, 0 errors
🔒 Security: All inputs validated, rate limiting active
🎉 New Features:
  • Decision statistics dashboard
  • Twin confidence indicators
  • World-specific insights

Questions? Post in #support or contact DevOps team.
```

### Rollback Announcement
```
⚠️ Rolling back to v1.2.3

Issue: [Brief description]
Status: System will be down 10 minutes
ETA: [time]

Apologies for the inconvenience. Our team is working to fix the issue.
```

---

## CHECKLIST FOR NEXT DEPLOYMENT

```
PRE-DEPLOYMENT:
- [ ] Code reviewed and merged
- [ ] Tests passing
- [ ] Staging verified
- [ ] Database backup done
- [ ] Team notified
- [ ] Rollback plan ready

DEPLOYMENT:
- [ ] Service stopped
- [ ] New version deployed
- [ ] Service started
- [ ] Smoke tests passed
- [ ] Monitoring active

POST-DEPLOYMENT:
- [ ] Error rate <0.1%
- [ ] Response times <2s
- [ ] Customers notified
- [ ] Team updated
- [ ] Monitoring 24-48h

SUCCESS CRITERIA MET:
- [ ] All checks passing
- [ ] System stable
- [ ] Ready to move on
```

---

**Status: ✅ RUNBOOK READY FOR EXECUTION**

This runbook can be executed immediately with proper team coordination.
