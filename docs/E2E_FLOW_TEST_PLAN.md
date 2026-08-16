# E2E FLOW TEST PLAN
## Complete User Journey: Signup → Twin Creation → Evolution → Decision Tracking

**Date:** August 16, 2026  
**Scope:** Full end-to-end flow validation  
**Duration:** 60 minutes (interactive testing)  
**Prerequisites:** All migrations applied, dev server running, Phase 2-4 code deployed  

---

## 🎯 TEST OBJECTIVES

Validate that all systems work together:
1. ✅ User can sign up and create account
2. ✅ Self Print Q&A captures personality data
3. ✅ Twin is created with appropriate characteristics
4. ✅ Core Awakening ceremony runs with animations (Phase 2B)
5. ✅ First conversation initializes
6. ✅ Twin Evolution tracks metrics (Phase 3)
7. ✅ Notifications schedule and deliver (Phase 4)
8. ✅ Decisions are tracked and follow-ups scheduled
9. ✅ Patterns are analyzed and guidance generated

**PASS CRITERIA:** All 9 steps complete, no errors, smooth UX

---

## 📋 STEP-BY-STEP TEST FLOW

### STEP 1: Create New User Account
**What:** Sign up flow  
**How:**
1. Navigate to landing page (`/`)
2. Click "Get Started" or "Sign Up"
3. Enter email, password, verify email
4. Verify account created in Supabase Auth dashboard

**Checkpoints:**
- [ ] Form validates properly
- [ ] Confirmation email sent (check inbox/spam)
- [ ] Account appears in Supabase `auth.users`
- [ ] User redirected to onboarding or Self Print ceremony

**Expected time:** 2-3 min

---

### STEP 2: Complete Self Print Ceremony (Q&A)
**What:** 8-10 personality questions to extract Twin characteristics  
**How:**
1. Answer questions about decision-making style
2. Answer questions about values/priorities
3. Answer questions about communication preference
4. Submit answers

**Checkpoints:**
- [ ] Questions render properly
- [ ] Answers save locally (browser console shows no errors)
- [ ] Progress indicator shows completion
- [ ] Form validates (required questions)

**Database check:**
```sql
SELECT * FROM profiles WHERE user_id = 'YOUR_USER_ID';
-- Should have: self_print_answers (JSON), twin_characteristics (JSON)
```

**Expected time:** 3-5 min

---

### STEP 3: WOW 1 Moment (Optional Early Insight)
**What:** System generates first insight to hook user  
**How:**
1. After Self Print, system auto-generates early insight
2. User sees brief insight popup or page
3. System schedules WOW1 notification

**Checkpoints:**
- [ ] Insight displays (relevant to answers)
- [ ] Notification created in `notification_queue`
- [ ] `notification_schedule` has entry with future date

**Database check:**
```sql
SELECT * FROM notification_schedule WHERE user_id = 'YOUR_USER_ID' AND notification_type = 'wow-insight';
```

**Expected time:** 1-2 min (auto)

---

### STEP 4: Core Awakening Ceremony (Phase 2B Animations!)
**What:** Twin is formally created with celebratory animations  
**Where:** `/core-awakening` page  
**How:**
1. System transitions to Core Awakening page
2. Intro animation plays (3s)
3. HolographicBirth animation plays (10s) — watch crystallization effect
4. Naming dialog appears (8s) — user names the Twin
5. Celebration sequence plays (5s) — confetti + screen shake
6. System creates Twin record in database
7. Conversation initializes
8. User is redirected to `/twin/{twinId}/chat`

**Animation Checkpoints (Phase 2B):**
- [ ] HolographicBirth renders (smooth 60fps desktop, 30+ fps mobile)
  - 3D mesh appears
  - Vertices animate toward center
  - Iridescent color gradient visible (purple→pink→blue)
  - Wireframe overlay visible (crystalline effect)
- [ ] ParticleFormation renders (5s)
  - ~500 particles visible
  - Particles converge smoothly toward center
  - Color shift cyan→orange visible
- [ ] CelebrationSequence renders (5s)
  - Confetti particles burst upward
  - Screen shake effect visible
  - Text "Twin Awakened! ✨" appears with glow
  - No rapid flashing (accessibility safe)

**Performance Checkpoints:**
- [ ] No console errors
- [ ] No memory leaks (DevTools Memory before/after same)
- [ ] No stuttering or jank
- [ ] Smooth transitions between phases

**Database Checkpoints:**
```sql
-- Twin should be created
SELECT * FROM twins WHERE user_id = 'YOUR_USER_ID';
-- Should have: stage = 1, name = (user-provided), characteristics

-- Conversation should be initialized
SELECT * FROM conversations WHERE twin_id = (TWIN_ID);
```

**Expected time:** 30-40 sec (ceremony) + 2-3 min (total)

---

### STEP 5: First Chat with Twin
**What:** User converses with Twin, builds connection  
**How:**
1. Navigate to Twin chat page (`/twin/{twinId}/chat`)
2. Send 3-5 messages to Twin
3. Watch Twin responses appear
4. Observe conversation metrics update

**Messages to send (variety):**
- Personal reflection ("I'm worried about my job")
- Decision ("Should I change careers?")
- Question ("How can I be happier?")
- Casual chat ("Tell me something interesting")

**Checkpoints:**
- [ ] Chat interface loads
- [ ] Message input works
- [ ] Twin responds (within 2-3 sec)
- [ ] Messages display in conversation
- [ ] No console errors

**Database Checkpoints:**
```sql
-- Messages stored
SELECT COUNT(*) FROM conversations_messages WHERE twin_id = 'TWIN_ID';
-- Should increase by 3-5 (user messages) + 3-5 (Twin responses)

-- Evolution metrics updated
SELECT * FROM twin_evolution_progress WHERE twin_id = 'TWIN_ID';
-- Should have: message_count = 3-5, stage = 1
```

**Expected time:** 3-5 min

---

### STEP 6: Trigger Twin Evolution (if possible)
**What:** Send enough messages to trigger automatic stage-up  
**How:**
1. Continue sending messages (10+ total to try to trigger evolution)
2. System checks if metrics meet Stage 2 requirements
   - Days since awakening ≥ 3 (may not trigger on day 1)
   - Message count ≥ 10
   - Pattern recognition ≥ 1

**Checkpoints (if evolution triggers):**
- [ ] `twin_evolution_progress.stage` changes from 1 → 2
- [ ] Evolution notification created
- [ ] `twin_evolution_history` record created
- [ ] User sees stage-up celebration (UI shows new stage)

**Database Checkpoints:**
```sql
-- Evolution progress
SELECT * FROM twin_evolution_progress WHERE twin_id = 'TWIN_ID';
-- stage should be 2 (or still 1 if not enough time/messages)

-- Evolution history (if evolved)
SELECT * FROM twin_evolution_history WHERE twin_id = 'TWIN_ID';
```

**Note:** May not trigger on first day (requires 3+ days). If not, that's OK — move to next step.

**Expected time:** 2-3 min (check only, may not actually evolve)

---

### STEP 7: Make a Decision (via Chat)
**What:** User mentions or makes a decision in chat  
**How:**
1. Send message with clear decision element:
   - "I've decided to take the new job offer"
   - "I'm going to start learning Python"
   - "I'm moving to Bangkok next month"
2. System (Twin) acknowledges decision
3. System (backend) extracts decision and schedules follow-ups

**Checkpoints:**
- [ ] Twin acknowledges decision
- [ ] Follow-up notifications scheduled (1d, 7d, 30d)
  ```sql
  SELECT * FROM decision_follow_ups WHERE decision_text ILIKE '%decided%';
  -- Should have 3 rows: follow_up_day = 1, 7, 30
  ```

**Expected time:** 1-2 min

---

### STEP 8: Record Decision Outcome
**What:** Call API endpoint to record how decision went  
**How:**

**Option A (Manual API call):**
```bash
curl -X POST http://localhost:5173/api/notifications?action=record-outcome \
  -H "Content-Type: application/json" \
  -d '{
    "decisionId": "DECISION_ID",
    "userId": "YOUR_USER_ID",
    "twinId": "TWIN_ID",
    "decisionText": "I took the new job offer",
    "outcome": "positive",
    "followUpDay": 1,
    "notes": "It was scary but I'm glad I did it",
    "timezone": "UTC"
  }'
```

**Option B (Via app UI):**
1. If app has decision tracking page, navigate there
2. Find the decision made in STEP 7
3. Click "Record Outcome"
4. Select outcome: positive/neutral/negative
5. Optional: add notes
6. Submit

**Checkpoints:**
- [ ] Outcome recorded in `decision_outcomes` table
- [ ] Pattern analysis triggered
- [ ] Response includes analysis patterns
  ```json
  {
    "success": true,
    "data": {
      "outcomeRecorded": true,
      "patterns": [
        { "pattern": "Positive outcomes", "frequency": 1, "insight": "..." }
      ]
    }
  }
  ```

**Database Checkpoints:**
```sql
SELECT * FROM decision_outcomes WHERE user_id = 'YOUR_USER_ID' AND follow_up_day = 1;
-- Should show outcome = 'positive'
```

**Expected time:** 1-2 min

---

### STEP 9: Verify Twin Guidance (Final Validation)
**What:** System suggests next steps based on decision patterns  
**How:**
1. Return to Twin chat
2. Send message: "What should I do next?"
3. Watch Twin provide guidance based on decision outcome + patterns
4. Verify guidance is relevant to decision made in STEP 7

**Checkpoints:**
- [ ] Twin guidance appears contextual
- [ ] Guidance references the decision made
- [ ] Guidance suggests realistic next steps
- [ ] No errors in guidance generation

**Expected time:** 1-2 min

---

## ✅ FULL FLOW VERIFICATION CHECKLIST

| Step | Component | Status | Notes |
|------|-----------|--------|-------|
| 1 | Sign up | [ ] | User account created |
| 2 | Self Print Q&A | [ ] | Personality data captured |
| 3 | WOW1 Insight | [ ] | Early insight generated |
| 4 | Core Awakening (Phase 2B) | [ ] | Animations smooth, Twin created |
| 5 | First Chat | [ ] | Conversation works |
| 6 | Evolution Check | [ ] | Metrics tracked (may not evolve yet) |
| 7 | Make Decision | [ ] | Decision detected, follow-ups scheduled |
| 8 | Record Outcome | [ ] | Outcome stored, patterns analyzed |
| 9 | Twin Guidance | [ ] | Guidance generated + relevant |

---

## 🐛 COMMON ISSUES & TROUBLESHOOTING

### Issue: Animations stutter or freeze
**Cause:** WebGL not supported, performance issue  
**Fix:**
- [ ] Check browser console for WebGL errors
- [ ] Try Chrome (best WebGL support)
- [ ] Check GPU acceleration enabled
- [ ] Reduce particle count in ParticleFormation if needed

### Issue: Twin doesn't respond
**Cause:** API call failed, auth issue  
**Fix:**
- [ ] Check Network tab for failed requests
- [ ] Verify Supabase connection
- [ ] Check if chat API endpoint exists
- [ ] Check auth token is valid

### Issue: Notifications don't appear
**Cause:** Scheduling failed, notification queue issue  
**Fix:**
- [ ] Query `notification_schedule` table
- [ ] Check if PushScheduler.processScheduledNotifications() is running
- [ ] Verify Supabase migration 007_notifications.sql applied
- [ ] Check notification_queue for entries

### Issue: Evolution doesn't trigger
**Cause:** Metrics don't meet requirements, or not enough time  
**Fix:**
- [ ] Evolution requires 3+ days since Twin creation (may not trigger on day 1)
- [ ] Check `twin_evolution_progress` metrics
- [ ] Manually update for testing: `UPDATE twin_evolution_progress SET days_since_awakening = 7 WHERE twin_id = '...';`

### Issue: API endpoints 404
**Cause:** Routes not registered  
**Fix:**
- [ ] Verify `src/api/notification-endpoints.ts` exists
- [ ] Check Next.js auto-detects /api/* routes
- [ ] Run `npm run build` to verify no build errors

---

## 📊 SUCCESS METRICS

| Metric | Target | Actual |
|--------|--------|--------|
| Signup time | < 2 min | |
| Self Print completion | < 5 min | |
| Core Awakening ceremony | 26 sec | |
| Animation FPS (desktop) | 60 fps | |
| Animation FPS (mobile) | 30+ fps | |
| First response latency | < 2 sec | |
| Total flow time | < 20 min | |
| Error count | 0 | |

---

## 🚀 NEXT STEPS (after E2E passes)

1. **Performance optimization** (if needed)
   - Profile animations with DevTools
   - Check bundle size
   - Optimize payload delivery

2. **Phase 5 SICE Engines** (122 hours)
   - Pattern analysis engine
   - Insights extraction
   - Twin guidance generation

3. **Phase 6: 12 Worlds** (96 hours)
   - Career, Relationships, Health, etc.
   - World-specific guidance
   - Cross-world pattern analysis

---

**E2E TEST PLAN COMPLETE**

When ready to test: Follow this plan step-by-step. Document any issues found. All 9 steps should complete successfully with no errors.

*This is a blueprint for manual testing. Automated E2E tests (Playwright, Cypress) can be built from this plan.* 🚀
