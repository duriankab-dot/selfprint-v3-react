# P0 #3 HANDOFF — Decision 30/90/180/365 Automation ✅

## Status: COMPLETE (Awaiting Git Commit)

**Files Created:**
- `api/decisions.ts` (410 lines) — Decision CRUD handlers + follow-up completion
- `src/services/DecisionAutomationService.ts` (336 lines) — Automation logic
- **Modified:** `server/index.ts` — Added POST /api/decision/trigger-reminders endpoint

**TypeScript:** ✅ PASS (0 errors)

---

## What Was Implemented

### 1. api/decisions.ts — Decision CRUD Handlers

**Handlers:**
- `createDecision()` — POST /api/decisions
  - Auto-generate 4 follow-ups (30/90/180/365 days)
  - Calculate scheduled dates using `getFollowUpDueDate()` helper
  - Save to Supabase with full Decision object
  - Return created decision

- `getDecisions()` — GET /api/decisions?userId=...
  - Fetch all decisions for user
  - Order by creation date (newest first)
  - Return array of Decision objects

- `updateDecision()` — PUT /api/decisions/:id
  - Update any decision fields
  - Auto-update timestamp
  - Return updated decision

- `deleteDecision()` — DELETE /api/decisions/:id
  - Soft or hard delete from Supabase
  - Return success message

- `completeFollowUp()` — POST /api/decisions/:id/followup/:followUpId
  - Mark follow-up as completed
  - Accept reflection text + result score (0-100)
  - Calculate success rate if all follow-ups done
  - Update decision status (pending-followup → completed)
  - Return updated decision

- `getPendingFollowUps()` — GET /api/decisions/:id/pending-followups
  - Get follow-ups due today or earlier
  - Filter out completed follow-ups
  - Return decision + pending array

---

### 2. DecisionAutomationService.ts — Automation Logic

**Main Functions:**

- `generateReflectionPrompt(decision, followUpDay)` → ReflectionPrompt
  - Generate AI-style reflection prompts per follow-up day
  - 30-day: Initial progress check ("How has it played out?")
  - 90-day: Pattern assessment ("Three months in...")
  - 180-day: Long-term impact ("Six months later...")
  - 365-day: Full-year reflection ("One year reflection...")
  - Each prompt includes suggested questions

- `getPendingFollowUpsForUser(userId)` → FollowUpReminder[]
  - Query all decisions for user
  - Extract non-completed follow-ups
  - Calculate days remaining vs scheduled date
  - Mark as overdue if past due date
  - Sort by due date (overdue first)
  - Only return overdue + due within 7 days

- `markFollowUpAsNotified(decisionId, followUpId)` → boolean
  - Update follow-up object
  - Set notificationSent = true, sentAt = now
  - Used to track which follow-ups have been notified

- `analyzeDecisionOutcome(decision)` → DecisionOutcomeAnalysis
  - Calculate success rate from all completed follow-ups
  - Check consistency (actual outcome vs original confidence)
  - Extract learnings from reflection text
  - Generate recommendations based on outcome
  - Return analysis object

- `triggerFollowUpAutomation(userId?)` → {processed, notified, errors}
  - Main automation function
  - If userId specified: trigger for specific user
  - If not specified: trigger for all users (bulk mode)
  - For each user: get pending follow-ups
  - Mark as notified (simulated — ready for real notification service)
  - Return stats + error array

---

### 3. server/index.ts — Cron Trigger Endpoint

**Endpoint:** POST /api/decision/trigger-reminders

**Parameters:**
- Query: `?userId=...` (optional, specific user or all users)
- Header: `x-automation-secret` (simple auth for scheduled jobs)

**Flow:**
1. Verify automation secret (if configured)
2. Call triggerFollowUpAutomation(userId)
3. Return stats JSON with processed/notified counts

**Response:**
```json
{
  "success": true,
  "message": "Decision follow-up automation triggered",
  "stats": {
    "processed": 42,
    "notified": 15,
    "errors": []
  },
  "timestamp": "2026-08-16T15:45:00.000Z"
}
```

**Usage Examples:**
```bash
# Trigger all users
curl -X POST http://localhost:3001/api/decision/trigger-reminders \
  -H "x-automation-secret: your-secret"

# Trigger specific user
curl -X POST http://localhost:3001/api/decision/trigger-reminders?userId=user123 \
  -H "x-automation-secret: your-secret"
```

**Ready For:**
- Vercel Cron Jobs
- GitHub Actions schedule
- External scheduler (e.g., AWS EventBridge)
- Manual cron: `0 9 * * * curl ...` (9am daily)

---

## Data Model

**Decision:**
```typescript
{
  id: string,
  userId: string,
  title: string,
  description: string,
  category: 'career' | 'relationships' | 'health' | 'finance' | 'personal' | 'learning' | 'other',
  decisionDate: string, // ISO date
  confidence: number, // 0-100
  expectedOutcome: string,
  actualOutcome?: string,
  followUps: FollowUp[],
  world?: WorldId,
  status?: 'open' | 'completed' | 'pending-followup',
  successRate?: number, // Calculated from follow-up results
  createdAt: string,
  updatedAt: string
}

FollowUp:
{
  id: string,
  decisionId: string,
  days: 30 | 90 | 180 | 365,
  scheduledDate: string, // ISO date (30/90/180/365 days from decision date)
  completed: boolean,
  completedAt?: string,
  reflection?: string, // User's reflection on outcome
  resultScore?: number, // 0-100: how well did it turn out?
  notificationSent: boolean,
  sentAt?: string
}
```

---

## Integration Checklist

- [ ] **Supabase:** Create/verify `decisions` table with JSON array field for `followUps`
- [ ] **Notifications:** Implement email/push service in markFollowUpAsNotified()
- [ ] **Scheduler:** Set up cron job to POST /api/decision/trigger-reminders daily
- [ ] **Frontend:** Wire up decision creation form to POST /api/decisions
- [ ] **Frontend:** Build follow-up completion UI (reflection + score)
- [ ] **Dashboard:** Display pending follow-ups + decision success rates
- [ ] **Analytics:** Track automation stats (sent/received notifications)

---

## Known Limitations

- Notification sending is mocked (marks as notified but doesn't send email/push yet)
- Reflection prompt generation is static templates (ready for Claude AI enhancement)
- No email/SMS integration yet
- Learning extraction is regex-based (ready for NLP upgrade)
- Cron must be triggered externally (not built-in scheduler)

---

## Next Steps

1. **Immediate:**
   - Git commit: `feat: Decision 30/90/180/365 automation`
   - User commits from Windows (sandbox git lock issue)

2. **Follow-up:**
   - Integrate email notification service (SendGrid/Mailgun)
   - Set up daily cron job (Vercel / GitHub Actions)
   - Build frontend components for decision creation + follow-up UI
   - Add decision success rate dashboard
   - Enhance reflection prompts with Claude AI

3. **Future:**
   - Machine learning for decision outcome prediction
   - Personalized reflection prompts based on past decisions
   - Decision success patterns by category + world
   - Social sharing of successful decisions
   - Decision recommendations based on patterns

---

**Decision:** System is production-ready for basic automation. Ready for integration with notification + scheduler.
