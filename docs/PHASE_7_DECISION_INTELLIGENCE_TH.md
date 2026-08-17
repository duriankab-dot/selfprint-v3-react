# PHASE 7 — Decision Intelligence Complete (ภาษาไทย)

**วันที่:** 2026-08-17 | **Status:** 🔧 IN PROGRESS | **Token:** Managed

---

## 🔴 3 Critical TODOs

### 1️⃣ Send Notifications (Line 137)

**File:** `FollowUpScheduler.ts:137`

```typescript
// ❌ TODO: Send notification to user
// This would integrate with:
// - Push notifications
// - Email
// - In-app notifications
// - Scheduled task system

// ✅ NEEDED:
async function sendFollowUpNotification(
  userId: string,
  decisionId: string,
  day: number
) {
  // 1. Get notification preference
  const prefs = await fetchUserNotificationPrefs(userId);
  
  // 2. Build notification message
  const decision = await fetchDecision(decisionId);
  const message = `${day}วัน ได้แล้ว: คิดถึงการตัดสินใจว่า "${decision.title}" ไหม?`;
  
  // 3. Send via preference channels
  if (prefs.pushEnabled) {
    await sendPushNotification(userId, message);
  }
  if (prefs.emailEnabled) {
    await sendEmailNotification(userId, message);
  }
  
  // 4. Create in-app notification
  await createNotification(userId, {
    type: 'decision-follow-up',
    decisionId,
    day,
  });
  
  // 5. Mark as sent
  await markFollowUpSent(decisionId, day);
}
```

**Status:** ❌ NOT IMPLEMENTED

---

### 2️⃣ Pattern Learning Loop

**File:** `DecisionLearningService.ts:204`

```typescript
// ❌ TODO: Update Twin's system prompt with these patterns

// ✅ NEEDED: 
async function updateTwinFromPatterns(
  twinId: string,
  patterns: DecisionPattern[]
) {
  // 1. Analyze patterns
  const topPatterns = patterns.filter(p => p.successRate > 0.6);
  
  // 2. Generate insight
  const insight = `Your decision-making style tends toward: ${topPatterns.map(p => p.pattern).join(', ')}`;
  
  // 3. Update Twin system prompt
  const twinPrompt = await getTwinSystemPrompt(twinId);
  const updatedPrompt = `${twinPrompt}\n\nUser's decision patterns: ${insight}`;
  
  // 4. Store updated prompt
  await updateTwinPrompt(twinId, updatedPrompt);
  
  // 5. Persist to database
  const { error } = await supabase
    .from('twin_learning_profiles')
    .upsert({
      twin_id: twinId,
      decision_patterns: topPatterns,
      updated_at: new Date(),
    });
}
```

**Status:** ❌ NOT IMPLEMENTED

---

### 3️⃣ Recommendations from Patterns

**File:** `DecisionService.ts:280`

```typescript
// ❌ TODO: Use recordDecision instead

// Current: Old deprecated method
// ✅ NEEDED: New method that includes learning

async function recordDecisionWithLearning(
  userId: string,
  decision: DecisionInput
) {
  // 1. Record decision
  const id = await recordDecision(userId, decision);
  
  // 2. Analyze patterns
  const patterns = await analyzeDecisionPatterns(userId);
  
  // 3. Generate next-decision recommendation
  const recommendation = generateRecommendation(patterns, decision);
  
  // 4. Store recommendation
  await storeRecommendation(userId, {
    basedOnPatterns: patterns,
    suggestion: recommendation,
    confidence: calculateConfidence(patterns),
  });
  
  return { decisionId: id, recommendation };
}
```

**Status:** ❌ NOT IMPLEMENTED

---

## 📊 Decision Loop (Complete)

```
User Records Decision
  ↓
✅ Save to decision_log
✅ Schedule follow-ups (30/90/180/365)
  ↓
[30 days later]
  ↓
❌ Send notification (TODO line 137)
  ↓
User Records Outcome
  ↓
✅ Save to decision_outcomes
✅ Calculate success rate
  ↓
❌ Extract patterns (TODO line 204)
❌ Update Twin prompt (TODO line 204)
  ↓
❌ Generate recommendation (TODO line 280)
  ↓
Twin uses pattern → Future decisions smarter
```

---

## ✅ Already Implemented

- Decision recording (30/90/180/365 scheduling)
- Follow-up detection (getOverdueFollowUps)
- Pattern analysis (DecisionIntelligence.ts)
- Success rate calculation
- Pattern storage (pattern_analysis table)

---

## ❌ Phase 7 Must Fix

| Task | File | Line | Impact |
|------|------|------|--------|
| Send notifications | FollowUpScheduler.ts | 137 | Users don't get reminders |
| Update Twin from patterns | DecisionLearningService.ts | 204 | Twin doesn't learn |
| Recommendation generation | DecisionService.ts | 280 | No smart suggestions |

---

## 📋 Checklist

### Notifications (Priority P0)
- [ ] Create sendFollowUpNotification()
- [ ] Check user preferences (push/email)
- [ ] Send via appropriate channels
- [ ] Create in-app notification
- [ ] Mark as sent in DB

### Pattern Learning (Priority P0)
- [ ] Get patterns from DecisionIntelligence
- [ ] Generate insight summary
- [ ] Update Twin system prompt
- [ ] Store in twin_learning_profiles table
- [ ] Test: Twin remembers pattern after learning

### Recommendations (Priority P1)
- [ ] Generate recommendations from top patterns
- [ ] Calculate confidence score
- [ ] Return with decision
- [ ] Show to user in decision context
- [ ] Test: Recommendations improve over time

### Integration
- [ ] Hook: After outcome recorded → call pattern learning
- [ ] Hook: Before Twin chat → include learned patterns
- [ ] Hook: On follow-up due → send notification
- [ ] E2E test: Full decision cycle (record → follow-up → outcome → learn)

---

## 🔗 Dependencies

**Blocks Phase 8:** Decision → Monetization (users need to see value)  
**Depends on Phase 6:** World context (patterns per world)

---

**Document:** PHASE_7_DECISION_INTELLIGENCE_TH.md  
**Language:** ภาษาไทย | **Concise:** ✅ | **Token:** Managed
