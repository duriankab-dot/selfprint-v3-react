# PHASE 5: SICE ENGINES ARCHITECTURE
## Self-Directed Intelligence + Contextual Extraction

**Date:** August 16, 2026  
**Phase Scope:** 122 hours  
**Status:** Planning & Architecture Design  
**Target Delivery:** Session 2026-08-17+  

---

## 🎯 PHASE 5 OVERVIEW

**What is SICE?**
- **S**elf-Directed: User's own patterns, decisions, values
- **I**ntelligence: Twin learns from user behavior
- **C**ontextual: Understands nuance (career ≠ relationships ≠ health)
- **E**xtraction: Pulls insights from conversations, decisions, outcomes

**Why Phase 5?**
After Twin Evolution (Phase 3), user has months of conversation + decision data. SICE analyzes patterns to generate:
- ✅ Personalized insights ("You tend to avoid conflict")
- ✅ Pattern recognition ("88% of your career decisions are from head, not heart")
- ✅ Twin guidance ("Based on your patterns, here's what I think you should do")
- ✅ Context-aware recommendations ("In relationships, you value honesty above all")

---

## 🏗️ ARCHITECTURE (3-LAYER DESIGN)

### Layer 1: DATA INGESTION
**Sources of user intelligence:**
- Conversations (chat messages with Twin)
- Decisions (explicit decisions + outcomes)
- Evolution metrics (stage progression, message volume)
- World preferences (career focus, relationship concerns, health priorities)
- Behavioral patterns (timing of chats, decision frequency, outcome trends)

**Data Pipeline:**
```
Chat Message → Extract Intent
Decision Made → Record Outcome
Evolution Event → Track Milestone
World Selection → Set Context Filter
Outcome Recorded → Trigger Analysis
```

### Layer 2: PATTERN ANALYSIS ENGINE (Core SICE)
**Components:**

**A. Conversation Analysis Service**
- Parse chat messages for themes/values
- Detect emotional patterns (anxiety, confidence, growth)
- Extract decision-making style
- Identify pain points & aspirations

**B. Decision Intelligence Service**
- Track all decisions (explicit + implicit)
- Correlate decisions with outcomes
- Identify decision patterns (risk-averse, impulsive, analytical)
- Find successful patterns

**C. Evolution Insight Service**
- Correlate Twin stage progression with user behavior
- Detect growth milestones
- Measure Twin-user compatibility
- Predict next stage timing

**D. Context Intelligence Service**
- Segment patterns by world (career, relationships, health, growth)
- Find cross-world correlations
- Identify transferable patterns
- Context-specific guidance

### Layer 3: GUIDANCE GENERATION (Twin Intelligence)
**Uses SICE analysis to:**
- Generate personalized advice
- Recommend next decisions
- Celebrate progress
- Challenge assumptions
- Suggest experiments

**Outputs:**
- Insights (push notifications)
- Guidance cards (in-app)
- Weekly summaries
- Pattern reports
- Decision recommendations

---

## 📊 DATABASE SCHEMA (Phase 5)

### New Tables

**`pattern_analysis` (cached results)**
```sql
CREATE TABLE pattern_analysis (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  analysis_type VARCHAR,  -- 'decision', 'conversation', 'evolution', 'world_context'
  pattern_name VARCHAR,   -- 'risk-averse', 'conflict-avoidant', etc.
  confidence FLOAT (0-1), -- 0.0-1.0 how confident in pattern
  frequency INT,          -- how often pattern observed
  first_observed TIMESTAMPTZ,
  last_observed TIMESTAMPTZ,
  metadata JSONB,         -- context-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`insights` (generated insights)**
```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID REFERENCES twins(id),
  insight_type VARCHAR,  -- 'pattern', 'opportunity', 'challenge', 'celebration'
  title VARCHAR,
  description TEXT,
  related_patterns JSONB, -- [ { pattern, confidence } ]
  recommendation VARCHAR,
  context_world VARCHAR,  -- 'career', 'relationships', 'health', 'growth', 'general'
  generated_from JSONB,   -- source data: decision_id, decision_date, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,  -- insights expire after 30 days
  user_feedback VARCHAR   -- 'helpful', 'not_relevant', 'already_knew'
);
```

**`guidance_recommendations` (decision recommendations)**
```sql
CREATE TABLE guidance_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  twin_id UUID REFERENCES twins(id),
  recommendation_type VARCHAR,  -- 'next_decision', 'experiment', 'reflection'
  title VARCHAR,
  description TEXT,
  based_on_patterns JSONB,      -- [ { pattern, confidence } ]
  context_world VARCHAR,
  suggested_action VARCHAR,
  priority INT (1-5),           -- 1=low, 5=high
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  user_response VARCHAR,        -- 'accepted', 'rejected', 'considering'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_pattern_analysis_user_type ON pattern_analysis(user_id, analysis_type);
CREATE INDEX idx_insights_user_world ON insights(user_id, context_world);
CREATE INDEX idx_guidance_user_world ON guidance_recommendations(user_id, context_world);
CREATE INDEX idx_insights_active ON insights(user_id, is_active);
```

---

## 🔧 CORE SERVICES (Phase 5 Implementation)

### Service 1: ConversationAnalyzer.ts (20h)
**Purpose:** Extract patterns from chat conversations

**Functions:**
```typescript
analyzeConversation(userId, twinId): {
  themes: [{ theme: string, frequency: int, confidence: float }],
  emotionalTone: { predominant: string, shifts: [...] },
  decisionStyle: string, // 'analytical', 'intuitive', 'seeking_advice', 'independent'
  painPoints: [{ point: string, frequency: int }],
  aspirations: [{ aspiration: string, frequency: int }]
}

extractThemes(messageText, previousThemes): Theme[]
// NLP: identify topics, values, concerns in user messages

classifyEmotionalTone(messageText): {
  emotion: string,
  intensity: 0-1,
  shift: boolean
}

detectDecisionStyle(messages): DecisionStyle
// Pattern: does user ask for advice, make own decisions, analyze options?

findPainPoints(messages, decisions): PainPoint[]
// Recurring themes user struggles with

findAspirations(messages): Aspiration[]
// What user wants to achieve
```

**Data source:** conversations table (all user-Twin messages)

---

### Service 2: DecisionIntelligence.ts (20h)
**Purpose:** Analyze decision patterns and correlate with outcomes

**Functions:**
```typescript
analyzeDecisionPatterns(userId): {
  patterns: [{ 
    pattern: string,        // 'risk-averse', 'impulsive', 'over-analyzing'
    confidence: float,
    examples: [decisionId]
  }],
  successRate: { 
    overall: float,
    byType: { career: float, relationships: float, ... }
  },
  impactAreas: string[]     // areas affected most
}

correlateOutcomesWithConditions(userId): {
  conditionalPatterns: [{
    condition: string,      // "when under stress"
    decisionStyle: string,
    outcomeRate: { positive, neutral, negative }
  }]
}

predictDecisionSuccess(userId, decisionType, context): {
  predictedOutcome: 'positive' | 'risky' | 'uncertain',
  confidence: float,
  rationale: string
}

findSuccessfulPatterns(userId): Pattern[]
// What decision-making patterns lead to positive outcomes?

generateDecisionInsight(userId, patternId): Insight
// Turn patterns into actionable insights
```

**Data source:** decision_follow_ups, decision_outcomes tables

---

### Service 3: EvolutionIntelligence.ts (16h)
**Purpose:** Correlate Twin evolution with user behavior

**Functions:**
```typescript
correlateEvolutionWithBehavior(userId, twinId): {
  evolutionDrivers: [{
    behavior: string,       // 'frequent_conversations', 'decision_making', 'pattern_reflection'
    impact: float,          // how much it drives evolution
    examples: [eventId]
  }],
  stageTransitionInsights: [{
    fromStage: int,
    toStage: int,
    triggers: string[],
    timing: int              // avg days to progress
  }]
}

predictNextStage(userId, twinId): {
  nextStage: int,
  daysToUnlock: int,
  actionsThatHelp: string[]
}

measureTwinCompatibility(userId, twinId): {
  compatibilityScore: 0-100,
  strengths: string[],      // things Twin does well for user
  gaps: string[]            // areas Twin could improve
}

generateEvolutionCelebration(userId, twinId, stage): Insight
// Celebrate Twin milestone, suggest next growth
```

**Data source:** twin_evolution_history, twin_evolution_progress tables

---

### Service 4: ContextIntelligence.ts (16h)
**Purpose:** Segment patterns by world/context

**Functions:**
```typescript
analyzeWorldSpecificPatterns(userId, world: 'career' | 'relationships' | 'health' | 'growth'): {
  patterns: Pattern[],
  insights: Insight[],
  recommendations: Recommendation[]
}

findCrossWorldCorrelations(userId): {
  correlations: [{
    world1: string,
    world2: string,
    pattern: string,       // "Career stress affects relationship decisions"
    strength: float
  }]
}

transferPattern(userId, pattern, fromWorld, toWorld): {
  applicability: float,    // 0-1 how well does it transfer
  adaptation: string,      // how to apply in new context
  expectedOutcome: string
}

generateWorldContextGuidance(userId, world): Guidance
// World-specific advice
```

**Data source:** world_preferences, all pattern tables filtered by context

---

### Service 5: GuidanceGenerator.ts (20h)
**Purpose:** Generate Twin guidance from SICE analysis

**Functions:**
```typescript
generateInsights(userId, twinId, trigger: 'daily' | 'milestone' | 'pattern' | 'decision'): Insight[]
// Generate 1-3 insights based on analysis

generateRecommendations(userId, twinId, context?: string): Recommendation[]
// Suggest next decisions/experiments

generateWeeklySummary(userId, twinId): {
  highlights: string[],       // key patterns observed
  progressAreas: string[],    // growth detected
  nextSteps: string[],        // recommended actions
  thinking: string            // Twin's reflective note
}

generateDecisionGuidance(userId, twinId, decisionText): {
  analysis: string,           // Twin's analysis of decision
  questions: string[],        // reflection questions
  relatedPatterns: Pattern[], // how this connects to history
  riskFactors: string[],      // potential pitfalls
  successFactors: string[]    // what could help
}

generateChallengePrompt(userId, twinId): Guidance
// Constructive challenge to growth assumptions

generateCelebration(userId, twinId, achievementType): Guidance
// Celebrate wins, progress
```

**Output:** Guidance records, Insights, Recommendations (pushed via Phase 4 Notifications)

---

## 🔌 API DESIGN (Phase 5)

### Pattern Analysis Endpoints
```
GET    /api/sice?action=get-patterns&userId=...
       Response: { patterns: [...], summary: {...} }

GET    /api/sice?action=get-insights&userId=...&world=career
       Response: { insights: [...], nextActions: [...] }

POST   /api/sice?action=analyze-decision&userId=...
       Body: { decisionText, context }
       Response: { analysis, guidance, riskFactors, successFactors }

GET    /api/sice?action=weekly-summary&userId=...&twinId=...
       Response: { highlights, progressAreas, nextSteps, thinking }

POST   /api/sice?action=feedback&insightId=...
       Body: { feedback: 'helpful' | 'not_relevant' | 'already_knew' }
       Response: { success, updated }
```

### Integration Endpoints
```
-- Trigger SICE analysis on decision outcome
POST   /api/notifications?action=record-outcome
       → Calls DecisionIntelligence.analyzeDecisionPatterns()
       → Generates recommendations
       → Schedules insight notification

-- Daily SICE update job (cron)
GET    /api/sice/jobs?action=daily-analysis
       → Analyzes new conversations
       → Generates daily insights
       → Updates patterns
       → Schedules notifications
```

---

## 📈 PHASING STRATEGY (122 hours)

### Phase 5A: Core Pattern Analysis (60h)
**Goal:** Extract baseline patterns from existing data

1. **ConversationAnalyzer** (20h)
   - NLP-based conversation analysis
   - Theme extraction
   - Emotional tone detection

2. **DecisionIntelligence** (20h)
   - Correlate decisions ↔ outcomes
   - Pattern identification
   - Success rate analysis

3. **Migration & Data Prep** (20h)
   - Create pattern_analysis table + indexes
   - Historical analysis of all existing users
   - Cache baseline patterns

### Phase 5B: Context & Guidance (62h)
**Goal:** Generate actionable guidance

4. **EvolutionIntelligence** (16h)
   - Twin-behavior correlation
   - Stage prediction
   - Compatibility scoring

5. **ContextIntelligence** (16h)
   - World-specific patterns
   - Cross-world correlation
   - Context transfer

6. **GuidanceGenerator** (20h)
   - Insight generation
   - Recommendation engine
   - Weekly summaries
   - Challenge prompts

7. **API + Integration** (10h)
   - Endpoints implementation
   - Phase 4 integration
   - Job scheduling

---

## 🔗 INTEGRATION WITH PHASE 2-4

### With Phase 2B (Animations)
- No direct integration
- SICE runs in background, doesn't affect animations

### With Phase 3 (Twin Evolution)
**Input → Output:**
```
Twin stage → EvolutionIntelligence
↓
Correlate with conversation/decision patterns
↓
Generate "Growth Opportunity" insight
↓
Push via Phase 4 Notifications
↓
Twin mentions next time user chats
```

### With Phase 4 (Notifications)
**Tight Integration:**
```
SICE generates Insight
↓
Calls scheduleNotification() (Phase 4 PushScheduler)
↓
Insight stored in Insights table
↓
Notification queued
↓
When user opens notification → trackNotificationClicked() (Phase 4 Analytics)
↓
Feedback recorded → improves SICE next iteration
```

**Example Flow:**
```typescript
// In GuidanceGenerator.ts
async function generateInsights(userId, twinId) {
  const patterns = await analyzeDecisionPatterns(userId);
  
  if (patterns.riskAverse > 0.8) {
    const insight = {
      type: 'pattern',
      title: 'You tend to play it safe',
      description: '88% of your recent decisions were low-risk...',
      recommendation: 'Consider one calculated risk this week'
    };
    
    // Store insight
    await supabase.from('insights').insert(insight);
    
    // Schedule notification via Phase 4
    await scheduleNotification({
      userId,
      type: 'pattern-insight',
      title: insight.title,
      message: insight.description,
      scheduledFor: tomorrow_8am
    });
  }
}
```

---

## 🧪 MVP vs STRETCH

### MVP (Essential)
- ✅ Conversation theme extraction
- ✅ Decision pattern analysis
- ✅ Success rate calculation
- ✅ Basic insights generation
- ✅ API endpoints (get-patterns, get-insights)
- ✅ Phase 4 integration (push insights)

### Stretch Goals (if time)
- 🎯 Advanced NLP (sentiment, topic modeling)
- 🎯 Predictive models (success prediction)
- 🎯 Machine learning pattern discovery
- 🎯 Cross-world correlation engine
- 🎯 Leaderboard/comparison (peer benchmarks)
- 🎯 A/B test guidance variants
- 🎯 Habit formation tracking
- 🎯 Long-term trend analysis (6-month+ patterns)

---

## 📊 SUCCESS METRICS

| Metric | Target | Notes |
|--------|--------|-------|
| Pattern discovery latency | < 500ms | Real-time analysis on decision |
| Insight relevance | > 80% | User finds insights valuable |
| Recommendation acceptance | > 50% | Users act on recommendations |
| Daily active analysis | > 90% | Patterns updated daily |
| API response time | < 200ms | Fast guidance retrieval |
| Pattern accuracy | > 75% | Patterns match observed behavior |

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### Performance
- Pattern analysis runs async (don't block user)
- Cache patterns (update every 24h)
- Lazy-load heavy computations

### Data Privacy
- SICE analysis stays on-device or in Supabase RLS
- Never export raw patterns outside
- User can view/delete insights

### Storage
- Pattern_analysis table: ~100KB per user (all patterns)
- Insights table: ~10KB per insight
- Estimated: 1GB for 10k users

---

## 📋 NEXT SESSION KICKOFF

When ready to start Phase 5:
1. Review this architecture document
2. Decide MVP vs stretch goals
3. Start Phase 5A: ConversationAnalyzer service
4. Build historical pattern analysis
5. Integrate with Phase 4 notifications

---

## 🎯 PHASE 5 COMPLETE ROADMAP

```
Session 1: Architecture + ConversationAnalyzer (20h)
Session 2: DecisionIntelligence + Migration (20h)
Session 3: EvolutionIntelligence + ContextIntelligence (32h)
Session 4: GuidanceGenerator + APIs + Integration (50h)
↓
Phase 5 Complete (122h) ✅
↓
Selfprint Roadmap Progress: Phase 6 (12 Worlds) ready
```

---

**PHASE 5 ARCHITECTURE: READY FOR IMPLEMENTATION** 🚀

*SICE Engines will transform Selfprint from a journal tool into an intelligent personal advisor.*

