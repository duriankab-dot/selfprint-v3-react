# 📋 Phase E: Decision Intelligence — SPECIFICATION

**Status:** Spec Ready (Implementation pending next session)  
**Dependency:** Phase D Complete ✅  
**Estimated Duration:** 1 session (200k tokens)  
**Token Budget Fresh Start:** 200k tokens (new session)  

---

## Phase E Objectives

Enable Twin to **remember, track, and learn from user decisions** across all 12 worlds. Twin becomes smarter over time by:
1. Recording decisions in Decision Service
2. Following up on decisions at key intervals (30/90/180/365 days)
3. Learning outcomes to improve future recommendations
4. Adapting expertise based on historical decision success/failure patterns

**Example User Journey:**
```
Day 1 (Career world):
User: "I'm deciding between Job A and Job B"
Twin: "Let's analyze both options..." [records decision]

Day 30:
Scheduled follow-up triggers automatically
Twin: "How's the new job going? Let me check in"
User: "Good, but harder than expected"
Twin: "Let me learn from this outcome" [records result]

Day 90/180/365:
More follow-ups to track career decision impact
Twin: "You've been there 3 months. Long-term assessment?"
```

---

## Phase E Features (Breakdown)

### Feature 1: Decision Service
**File:** `src/services/DecisionService.ts`

```typescript
interface Decision {
  id: string;
  twinId: string;
  world: WorldId;
  question: string;        // "Should I take Job A or B?"
  options: string[];        // ["Job A", "Job B"]
  recommendation: string;   // Twin's suggestion
  userChoice: string;       // User's actual choice
  chosenAt: timestamp;
  context: string;          // Background info
}

interface DecisionOutcome {
  decisionId: string;
  followUpDate: timestamp;  // 30/90/180/365 days post-decision
  feedback: string;         // User's evaluation
  impact: string;           // "positive" | "neutral" | "negative"
  lessons: string;          // What Twin learned
  confidence: number;       // Twin's confidence in this type of decision (0-100)
}

// Functions:
export async function recordDecision(
  twinId: string,
  world: WorldId,
  question: string,
  options: string[],
  twinRecommendation: string,
  userChoice: string,
  context?: string
): Promise<Decision>

export async function getUserDecisions(
  twinId: string,
  world?: WorldId
): Promise<Decision[]>

export async function recordOutcome(
  decisionId: string,
  feedback: string,
  impact: "positive" | "neutral" | "negative",
  lessons: string
): Promise<DecisionOutcome>

export async function getDecisionOutcomes(
  decisionId: string
): Promise<DecisionOutcome[]>

export async function getTwinDecisionConfidence(
  twinId: string,
  world: WorldId
): Promise<number>  // Confidence in giving advice for this world
```

### Feature 2: Follow-up Automation
**File:** `src/services/FollowUpScheduler.ts`

```typescript
interface FollowUpSchedule {
  decisionId: string;
  schedule: {
    day30: { dueDate: timestamp, completed: boolean };
    day90: { dueDate: timestamp, completed: boolean };
    day180: { dueDate: timestamp, completed: boolean };
    day365: { dueDate: timestamp, completed: boolean };
  };
  lastFollowUp: timestamp;
}

// Functions:
export async function scheduleFollowUps(decisionId: string): Promise<void>
  // Creates 4 follow-up dates automatically

export async function getOverdueFollowUps(twinId: string): Promise<Decision[]>
  // Returns decisions due for follow-up

export async function completeFollowUp(
  decisionId: string,
  dayOffset: number,  // 30, 90, 180, 365
  outcome: DecisionOutcome
): Promise<void>
```

### Feature 3: Decision Learning Loop
**File:** `src/services/DecisionLearningService.ts`

```typescript
interface DecisionPattern {
  world: WorldId;
  pattern: string;          // e.g. "user prefers stability over risk"
  successRate: number;      // 0-100 (% of positive outcomes)
  sampleSize: number;       // How many decisions support this pattern
  confidence: number;       // How sure Twin is about this pattern
}

// Functions:
export async function analyzeTwinDecisionPatterns(
  twinId: string
): Promise<DecisionPattern[]>
  // Analyzes all past decisions to find patterns

export async function getWorldSpecificInsights(
  twinId: string,
  world: WorldId
): Promise<string>
  // Returns personalized decision advice based on history
  // e.g., "In career decisions, you consistently value growth over security"

export async function updateTwinExpertiseFromDecisions(
  twinId: string,
  world: WorldId
): Promise<void>
  // Updates TWIN_WORLD_PROMPTS to include learned patterns
  // Next time Twin advises in this world, it references past successes

export async function getDecisionInsights(
  twinId: string
): Promise<{
  totalDecisions: number;
  successRate: number;      // % positive outcomes
  bestWorlds: WorldId[];    // Worlds where user makes best decisions
  improvementAreas: string[];
  trends: string;           // "You're becoming more decisive" etc.
}>
```

---

## Database Schema (to be created)

```sql
-- Phase E Tables (add to Supabase schema)

CREATE TABLE decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES auth.users(id),
  world VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,           -- ["Option A", "Option B", ...]
  twin_recommendation TEXT,
  user_choice TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE decision_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decision_log(id),
  follow_up_day INT NOT NULL,       -- 30, 90, 180, 365
  feedback TEXT,
  impact VARCHAR(20),               -- "positive", "neutral", "negative"
  lessons TEXT,
  twin_confidence FLOAT,            -- 0-100
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE follow_up_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decision_log(id),
  day30_due TIMESTAMP,
  day90_due TIMESTAMP,
  day180_due TIMESTAMP,
  day365_due TIMESTAMP,
  day30_completed BOOLEAN DEFAULT FALSE,
  day90_completed BOOLEAN DEFAULT FALSE,
  day180_completed BOOLEAN DEFAULT FALSE,
  day365_completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE decision_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES auth.users(id),
  world VARCHAR(50),
  pattern TEXT,
  success_rate FLOAT,               -- 0-100
  sample_size INT,
  confidence FLOAT,                 -- 0-100
  identified_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_decision_log_twin_id ON decision_log(twin_id);
CREATE INDEX idx_decision_log_world ON decision_log(world);
CREATE INDEX idx_decision_outcomes_decision_id ON decision_outcomes(decision_id);
CREATE INDEX idx_follow_up_schedule_decision_id ON follow_up_schedule(decision_id);
CREATE INDEX idx_decision_patterns_twin_world ON decision_patterns(twin_id, world);
```

---

## Integration Points (Phase E adds to Phase D)

### 1. TwinChat → DecisionService
When Twin recommends a choice, user can save it:
```typescript
// In TwinChat.tsx (add button/action)
const handleDecisionSave = async () => {
  await recordDecision(
    session.user.id,
    currentWorld,
    userMessage,  // The decision question
    extractOptions(twinResponse),
    twinResponse,
    userChoice,
    context
  );
  // Schedules 30/90/180/365 day follow-ups automatically
};
```

### 2. DecisionService → TwinAPIService
Twin's system prompt includes decision history:
```typescript
// In buildTwinSystemPrompt() → add to base prompt
const decisionContext = `
DECISION HISTORY IN ${currentWorld}:
${previousDecisions.map(d => `- ${d.question}: Chose ${d.userChoice} (outcome: ${d.outcome})`).join('\n')}

LESSONS LEARNED:
${decisionPatterns.map(p => `- ${p.pattern}`).join('\n')}
`;
```

### 3. Scheduled Task → FollowUpScheduler
Runs daily, checks for due follow-ups:
```typescript
// Create scheduled task (runs daily)
// Finds decisions due for follow-up
// Triggers follow-up messages to user
const overdueFollowUps = await getOverdueFollowUps(userId);
if (overdueFollowUps.length) {
  // Send notification: "Check in on your [decision] from 30 days ago"
}
```

---

## Phase E Step-by-Step Implementation

### Step 1: Database Setup
- Create decision_log, decision_outcomes, follow_up_schedule, decision_patterns tables
- Add indexes for performance
- Test schema with sample data

### Step 2: DecisionService Implementation
- Build recordDecision(), getUserDecisions(), recordOutcome()
- Test CRUD operations
- Verify data persistence

### Step 3: FollowUpScheduler Implementation
- Build scheduleFollowUps(), getOverdueFollowUps()
- Create scheduled task (runs daily)
- Test follow-up timing

### Step 4: DecisionLearningService Implementation
- Build analyzeTwinDecisionPatterns()
- Build getWorldSpecificInsights()
- Update Twin prompts with learned patterns

### Step 5: TwinChat Integration
- Add decision save action to messages
- Add follow-up notification UI
- Wire up DecisionService calls

### Step 6: Testing & Validation
- Unit tests for each service
- Integration test: decision → outcome → learning
- E2E test: complete decision lifecycle

---

## Success Criteria (Phase E Complete)

✅ User can record decisions in Twin chat  
✅ Follow-ups trigger automatically on day 30/90/180/365  
✅ Twin learns patterns from decision outcomes  
✅ Twin adjusts recommendations based on past successes  
✅ Decision history available per world  
✅ Tests pass (unit + integration + E2E)  
✅ No performance regressions (<100ms for decision lookups)  
✅ Database optimized (indexes, queries <50ms)  

---

## Optional Enhancements (Post-Phase E)

- **Decision Analytics Dashboard** — Visualize success rate per world
- **Decision Export** — User can export decision history
- **Collaborative Decisions** — Compare Twin's advice with user's outcome
- **Confidence Intervals** — Twin states confidence in recommendations
- **Counter-factual Analysis** — "What if you had chosen Option B?"

---

## Pre-Phase E Checklist (Before Starting)

- [ ] Read PHASE_D_COMPLETION.md
- [ ] Verify Phase D tests pass locally (npm test)
- [ ] Understand WorldExpertiseService.ts (model for Phase E services)
- [ ] Review decision tracking requirements above
- [ ] Have fresh 200k token budget ready
- [ ] Create database tables in Supabase (schema provided above)

---

## Estimated Scope

| Task | Tokens | Duration |
|------|--------|----------|
| Database setup | 5k | 15 min |
| DecisionService | 25k | 45 min |
| FollowUpScheduler | 20k | 30 min |
| DecisionLearningService | 35k | 60 min |
| TwinChat integration | 30k | 45 min |
| Tests + validation | 40k | 60 min |
| **Total** | **155k** | **4 hours** |

**Headroom:** 45k tokens for debugging, refinements, documentation

---

## Quick Start (Next Session)

1. Clone fresh: `git pull origin master`
2. Read PHASE_D_COMPLETION.md
3. Create Supabase tables (schema above)
4. Start with DecisionService.ts
5. Follow step-by-step implementation guide above

**Ready to go! 🚀**

---

**Phase E Specification: READY**  
**Dependency Chain:** Phase B ✅ → Phase C ✅ → Phase D ✅ → **Phase E (next)** → Phase F → Phase G  
