# P0-C: INCIDENT RESPONSE RUNBOOK

**สำหรับ:** On-call engineers  
**สถานะ:** เตรียมพร้อมสำหรับ production  

---

## 🚨 **SEVERITY LEVELS**

```
🔴 CRITICAL (P0): ต้องตอบสนองทันที
- ระบบเสีย (service down)
- ไม่สามารถประมวลผลการชำระเงิน
- ฐานข้อมูลกำลังปิด
- → ตอบสนอง: < 5 นาที

🟠 HIGH (P1): ตอบสนองเร่งด่วน
- ประสิทธิภาพลดลงมาก
- เกิดข้อผิดพลาดจำนวนมาก
- เป็นการสูญเสียรายได้
- → ตอบสนอง: < 30 นาที

🟡 MEDIUM (P2): ตอบสนองปกติ
- feature บางอย่างไม่ทำงาน
- ผู้ใช้บางคนได้รับผลกระทบ
- → ตอบสนอง: < 4 ชั่วโมง

🟢 LOW (P3): ไม่ด่วน
- ปัญหาเล็กน้อย
- ไม่กระทบต่อผู้ใช้
- → ตอบสนอง: ในวันทำการ
```

---

## 🔴 **CRITICAL INCIDENT — 5 PHASE RESPONSE**

### **PHASE 1: Acknowledge (5 นาที)**

```
1. [ ] Receive alert → Slack/PagerDuty
2. [ ] Acknowledge alert
3. [ ] Join war room (Slack #incidents)
4. [ ] Notify stakeholders:
      - Tech lead
      - CEO/Manager
      - Customer support (if applicable)
5. [ ] Create incident ticket with:
      - Title: Clear & specific
      - Severity: 🔴 CRITICAL
      - Time: Incident start time
      - Initial observations
```

**Checklist:**
```
- [ ] Alert acknowledged within 2 min
- [ ] War room created
- [ ] Stakeholders notified
- [ ] Incident logged
```

---

### **PHASE 2: Diagnose (15 นาที)**

```
First response leader checks:

1. [ ] Dashboard & Status Page
      - Open: https://status.selfprint.ai
      - Check: Service status lights
      - Check: Recent deployments

2. [ ] Error Tracking (Sentry)
      - Top errors
      - Affected users count
      - Error rate graph
      - Related endpoints

3. [ ] Infrastructure
      - Server metrics (Vercel)
      - Database status (Supabase)
      - API service status (Anthropic)
      - Memory/CPU usage

4. [ ] Logs
      - Recent errors
      - Deployment logs
      - Database connection errors

5. [ ] Recent Changes
      - Last deployment (when + what)
      - Configuration changes
      - Database migrations
      - New features enabled

Questions to Answer:
- What is broken? (specific endpoint/feature)
- Who is affected? (number of users)
- When did it start? (exact time)
- What changed recently?
- Is it 100% down or degraded?
```

**Diagnosis Template:**
```
🔍 ROOT CAUSE: [Suspected cause]

💥 IMPACT:
- Users affected: [number]
- Revenue impact: $[amount/hour]
- Services down: [list]

🔧 AFFECTED SERVICES:
- [ ] API
- [ ] Database
- [ ] AI Service
- [ ] Payments
- [ ] Frontend

⏰ TIMELINE:
- Started: [time]
- Detected: [time]
- Response started: [time]
```

---

### **PHASE 3: Mitigate (30 นาที)**

```
Based on diagnosis, take action:

🔴 Database Down:
1. [ ] Check Supabase dashboard
2. [ ] Verify connections
3. [ ] Check disk space
4. [ ] Contact Supabase support
5. [ ] Prepare rollback if needed

🔴 API Timeout/Slow:
1. [ ] Check server metrics
2. [ ] Look for memory leak
3. [ ] Check database query times
4. [ ] Scale up resources
5. [ ] Restart if necessary

🔴 Payment Processing Down:
1. [ ] Check Stripe status
2. [ ] Verify webhook endpoint
3. [ ] Check network connectivity
4. [ ] Manual payment processing if needed
5. [ ] Notify users

🔴 Deployment Issue:
1. [ ] Revert last deployment
      cd /app && git revert HEAD
      npm run build
      npm run deploy
2. [ ] Verify services come back online
3. [ ] Notify team of rollback

🔴 Out of Memory:
1. [ ] Restart server
2. [ ] Kill long-running processes
3. [ ] Check for memory leaks
4. [ ] Scale resources up
5. [ ] Monitor for recurrence
```

**Actions Taken:**
```
- [ ] Mitigation action 1: [what was done]
- [ ] Mitigation action 2: [what was done]
- [ ] Time taken: [duration]
- [ ] Status: Improving / Stable / Still critical
```

---

### **PHASE 4: Communicate (Ongoing)**

```
Update status every 10 minutes:

Internal (Slack #incidents):
@here 🟠 UPDATE: [Status]
- What we know: [findings]
- What we've done: [actions taken]
- Next steps: [what's happening now]
- ETA to resolution: [estimate]

Customer (Status Page):
- Update status page
- Post update on Twitter/LinkedIn if needed
- Email to affected customers if revenue-impacting

Example Status:
🔴 INVESTIGATING: Twin API is experiencing high latency
- Cause: Database connection spike detected
- Action: Scaling database connections
- ETA: 15 minutes
- Updates every 5 minutes
```

---

### **PHASE 5: Resolve & Document (Post-incident)**

```
Resolution Checklist:
- [ ] Service returned to normal
- [ ] Verified by checking:
      ✓ Error rate < 0.1%
      ✓ Response time < 500ms
      ✓ All endpoints responding
      ✓ Payments processing
      ✓ No new errors

Post-Incident Actions:
1. [ ] Update status page: All green
2. [ ] Send all-clear message
3. [ ] Collect incident data for postmortem

Postmortem (Next working day):
- [ ] What happened
- [ ] Why it happened
- [ ] What we did well
- [ ] What we can improve
- [ ] Action items (with owners)
- [ ] Estimated fix timeline
- [ ] When to follow up

Postmortem Template:
1. Timeline
   - T+0:00 - Alert triggered
   - T+0:05 - Response started
   - T+0:20 - Root cause identified
   - T+0:35 - Mitigation started
   - T+1:00 - Service recovered

2. Root Cause
   - [Description of what caused the incident]

3. Contributing Factors
   - [What conditions made it worse]

4. Action Items
   - [ ] [Owner] Fix issue by [date]
   - [ ] [Owner] Improve monitoring by [date]
   - [ ] [Owner] Add redundancy by [date]
```

---

## 🎯 **ESCALATION MATRIX**

```
On-Call Rotation:

Monday-Friday (9am-5pm):
- Tech Lead: [Name]
- Backup: [Name]

After Hours (5pm-9am):
- On-Call Engineer (PagerDuty)
- Tech Lead (emergency)

Escalation Chain:
🔴 CRITICAL (No response in 5 min)
  ↓
  Call Tech Lead
  ↓
  (No response in 10 min)
  ↓
  Notify CEO/Manager
  ↓
  Emergency all-hands
```

---

## ✅ **INCIDENT RESPONSE DRILL**

**Simulate:** Database down for 1 hour

**Participants:**
- On-call engineer (you)
- Tech lead
- Customer support

**Drill Timeline:**
```
T+0:00 - Alert sent to PagerDuty
T+0:02 - Acknowledge alert
T+0:05 - Join war room, diagnosis starts
T+0:15 - Root cause identified: "Database connection pool exhausted"
T+0:20 - Mitigation: Restart database pool
T+0:25 - Service partially recovering
T+0:30 - Service fully recovered
T+0:35 - Status page updated to green
T+1:00 - Postmortem meeting

Success Criteria:
- ✓ Alert acknowledged within 2 minutes
- ✓ Root cause identified within 15 minutes
- ✓ Mitigation started within 20 minutes
- ✓ Service recovered within 30 minutes
- ✓ All stakeholders informed
- ✓ Status page updated
- ✓ Postmortem scheduled
```

---

## 📞 **CONTACT INFORMATION**

```
Tech Lead: [name] [phone] [email]
CEO: [name] [phone] [email]
Customer Support: [email] [slack]
Supabase Support: [email] [dashboard]
Stripe Support: [phone] [email]
Anthropic Support: [email] [dashboard]

Status Page: https://status.selfprint.ai
Sentry Dashboard: https://sentry.io/organizations/selfprint/
Vercel Dashboard: https://vercel.com/dashboard
```

---

**สถานะ:** ✅ เตรียมพร้อม  
**ดำเนินการเมื่อ:** มีการเตือนระบบ (Alert)
