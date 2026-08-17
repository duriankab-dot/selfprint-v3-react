# 🧠 PHASE 1: Intelligence Core Analysis & Implementation Plan
**Master Direction Alignment - Living Personal Intelligence Platform**

**Author:** Senior AI Developer + Claude  
**Date:** 2026-08-09  
**Priority:** 🔴 P0 — Foundation for entire Selfprint ecosystem  
**Scope:** Personal Context + Memory + Evidence + Pattern Detection  
**Timeline:** Fast-track (1 team member, fulltime)

---

## 📋 EXECUTIVE SUMMARY

Selfprint ต้อง **transition** จาก "AI App that talks to you" → **"AI that learns to understand you"**

### The Gap
- ✅ Current: Onboarding flow (7 steps)
- ❌ Missing: Intelligence engine that **remembers**, **detects patterns**, **builds context**
- ❌ Missing: Data infrastructure to support "Living Twin"

### What Phase 1 Does
Phase 1 เป็น **foundation layer** ของ Selfprint:
- ทำให้ AI **จำ** ข้อมูลสำคัญของผู้ใช้
- ทำให้ AI **เข้าใจ** ความเชื่อถือได้ (Evidence + Confidence)
- ทำให้ AI **เห็น** patterns ในพฤติกรรม
- ทำให้ AI **ปรับตัว** ตามสิ่งที่เรียนรู้

### North Star Formula
```
Understand → Remember → Reflect → Detect → Adapt → Guide → Evolve
```

Phase 1 = **Understand + Remember + first layer of Detect**

---

## 🏗️ ARCHITECTURE OVERVIEW

### Layer 1: Data Models (Supabase)
```
users (already exists)
├─ id, email, created_at

+ personal_profiles (NEW)
├─ user_id
├─ birth_date
├─ mood_state (current)
├─ hubs_active (JSON array of active life areas)
├─ last_reflection
└─ model_version

+ personal_memory (NEW)
├─ id, user_id
├─ memory_type (small_win | important_moment | discovery | personal)
├─ title, content
├─ linked_to (decision_id, journal_id - nullable)
├─ confidence (0-1)
├─ created_at, updated_at

+ behavioral_patterns (NEW)
├─ id, user_id
├─ pattern_name (e.g., "decision_hesitation")
├─ pattern_type (repeating | emerging | changing)
├─ evidence_points (JSON array of dates/decisions)
├─ frequency (times per period)
├─ last_detected
├─ confidence (0-1)

+ personal_context (NEW)
├─ id, user_id
├─ context_type (value | goal | blind_spot | strength)
├─ title, description
├─ inferred_from (JSON: sources)
├─ confidence (0-1)
├─ ai_evidence (text explanation)
└─ user_feedback (true | false | null)

+ insight_feedback (NEW)
├─ id, user_id
├─ insight_id (from AI response)
├─ feedback_type (very_true | somewhat | not_sure | not_me)
├─ created_at
```

### Layer 2: Personal Intelligence Engine (TypeScript)
```
src/lib/intelligence/
├─ PersonalContextBuilder
│  └─ builds user mental model from all data
├─ MemoryManager
│  └─ CRUD operations on personal_memory
├─ PatternDetector
│  └─ finds repeating/emerging/changing patterns
├─ EvidenceAnalyzer
│  └─ calculates confidence scores
├─ AIFeedbackLoop
│  └─ ingests user feedback to calibrate model
└─ types.ts
   └─ TypeScript interfaces for all above
```

### Layer 3: Experience Bridge (React Components)
```
src/components/intelligence/
├─ MemoryRecorder (user adds memories)
├─ PatternViewer (shows detected patterns)
├─ ContextDisplay (shows inferred context)
├─ ConfidenceIndicator (shows AI certainty)
└─ FeedbackWidget (user calibrates AI)
```

---

## 📊 DATA FLOW - Understand → Remember

### On Onboarding Complete
```
1. User finishes onboarding (mood + birthdate + questions answered)
2. AICreationSequence calls → PersonalContextBuilder.initialize()
3. PersonalContextBuilder analyzes:
   - Mood selection → emotional context
   - Questions answered → values, goals, patterns
   - Birth data → temporal context
4. Creates initial entries in:
   - personal_context (inferred values/goals)
   - behavioral_patterns (emerging patterns from answers)
5. Stores in Supabase
6. Returns to frontend: "Twin created ✨"
```

### On Each Reflection (Journal Entry)
```
1. User reflects/journals
2. Sends to Claude API + context
3. Claude analyzes:
   - Emotions mentioned
   - Decisions made
   - Patterns in thinking
   - New discoveries about self
4. PersonalContextBuilder processes response:
   - Updates personal_context with new insights
   - Creates personal_memory entries (if user confirms)
   - Detects new patterns
   - Calculates confidence scores
5. Stores everything in Supabase
6. Returns AI response + confidence indicators to frontend
```

### On User Feedback
```
1. User sees insight: "Very true / Somewhat / Not sure / Not me"
2. Feedback stored in insight_feedback table
3. AIFeedbackLoop.calibrate() runs:
   - Updates confidence of related patterns
   - Adjusts personal_context if needed
   - Retrains pattern detection
4. Next insight is more accurate ✅
```

---

## 🎯 DETAILED COMPONENTS

### 1. PersonalContextBuilder
**Purpose:** Synthesize all user data into a coherent mental model

**Key Methods:**
```typescript
initialize(userId, onboardingData): Promise<PersonalContext>
// Called after onboarding
// Returns: user's first personal context

updateFromReflection(userId, reflection, aiAnalysis): Promise<void>
// Called after user journal/reflection
// Updates context based on new data

getContext(userId): Promise<PersonalContext>
// Returns current cached personal context

inferValues(userId): Promise<Value[]>
// Analyze patterns → infer core values

inferGoals(userId): Promise<Goal[]>
// Infer what user is working towards

inferBlindSpots(userId): Promise<BlindSpot[]>
// Find patterns user may not see
```

**TypeScript Type:**
```typescript
interface PersonalContext {
  userId: string;
  values: Value[];           // inferred core values
  goals: Goal[];             // inferred goals
  strengths: Strength[];     // what's working
  blindSpots: BlindSpot[];   // what user may not see
  emotionalRange: EmotionalRange;  // typical emotional patterns
  decisionStyle: string;     // how user makes decisions
  relationships: Relationship[];   // important people
  lastUpdated: Date;
}

interface Value {
  name: string;
  confidence: 0-1;
  evidence: string[];        // which reflections/decisions led to this
  inferred: boolean;
}
```

---

### 2. MemoryManager
**Purpose:** Persistent storage of important moments/discoveries

**Key Methods:**
```typescript
addMemory(userId, type, title, content, linkedTo?): Promise<PersonalMemory>
// user="Small Wins" or "Discovery"
// Returns created memory with ID

getMemories(userId, type?, limit?): Promise<PersonalMemory[]>
// Get user's memories, optionally filtered by type

updateMemory(memoryId, updates): Promise<PersonalMemory>
// Edit existing memory

deleteMemory(memoryId): Promise<void>

linkMemory(memoryId, to_decision_id): Promise<void>
// Connect memory to a decision for pattern detection
```

**TypeScript Type:**
```typescript
interface PersonalMemory {
  id: string;
  userId: string;
  memoryType: 'small_win' | 'important_moment' | 'discovery' | 'personal';
  title: string;
  content: string;
  linkedTo?: string;         // decision_id or journal_id
  confidence: 0-1;           // how central is this memory?
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 3. PatternDetector
**Purpose:** Find what's repeating, emerging, or changing

**Key Methods:**
```typescript
detectPatterns(userId): Promise<BehavioralPattern[]>
// Scan user's decisions, reflections, memories
// Return: repeating/emerging/changing patterns

getPattern(userId, patternName): Promise<BehavioralPattern>

updatePattern(patternId, newEvidence): Promise<BehavioralPattern>

// Specialized:
detectEmergingPatterns(userId): Promise<BehavioralPattern[]>
// What's new/just starting to happen?

detectChangingPatterns(userId): Promise<BehavioralPattern[]>
// What's shifting in behavior?

detectRepeatingPatterns(userId): Promise<BehavioralPattern[]>
// What's stuck/recurring?
```

**TypeScript Type:**
```typescript
interface BehavioralPattern {
  id: string;
  userId: string;
  patternName: string;
  patternType: 'repeating' | 'emerging' | 'changing';
  evidencePoints: EvidencePoint[];  // dates/decisions where seen
  frequency: string;                 // "weekly", "every decision", etc
  lastDetected: Date;
  confidence: 0-1;
  description: string;              // human-readable
  aiInsight: string;                // why this matters
}

interface EvidencePoint {
  date: Date;
  source: 'reflection' | 'decision' | 'memory';
  sourceId: string;
  excerpt: string;
}
```

---

### 4. EvidenceAnalyzer
**Purpose:** Calculate confidence in AI insights

**Key Methods:**
```typescript
calculateConfidence(insight, sources): 0-1
// Given an insight + evidence sources, return confidence

validateEvidence(userId, evidencePoints): Promise<boolean>
// Check evidence is real/linked

separateKnowInferUnknown(userId, claim): 'KNOW' | 'INFER' | 'UNKNOWN'
// Classify what we actually know vs infer vs don't know

getRecency(sourceDate): RecencyLevel
// 'recent' | 'somewhat_recent' | 'old'
```

**Master Direction Rule:**
```
KNOW    = user told us directly
INFER  = we concluded from evidence
UNKNOWN = we haven't seen data yet

✅ Rule: "Never pretend to know what the system does not know."
```

---

### 5. AIFeedbackLoop
**Purpose:** Learn from user validation

**Key Methods:**
```typescript
recordFeedback(userId, insightId, feedback: 'very_true' | 'somewhat' | 'not_sure' | 'not_me')
// User gives feedback on an insight

calibrateFromFeedback(userId): Promise<void>
// Run after feedback recorded
// Updates model, confidence scores, pattern weights

getAccuracyMetrics(userId): Promise<AccuracyMetrics>
// What % of insights does user validate?
```

**Data Flow:**
```
AI Insight
  ↓
User Feedback ("Very true" / "Not me" / etc)
  ↓
AIFeedbackLoop.calibrate()
  ↓
Update PersonalContext confidence scores
Update Pattern weights
Retrain next insight
  ↓
Better Personal Context
  ↓
Better Twin
```

---

## 🗄️ DATABASE SCHEMA (Supabase SQL)

```sql
-- 1. Personal Profile (extends users)
CREATE TABLE personal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE,
  mood_state VARCHAR(50),
  hubs_active JSONB DEFAULT '[]',
  last_reflection TIMESTAMP,
  model_version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Personal Memory
CREATE TABLE personal_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50),  -- small_win, important_moment, discovery, personal
  title VARCHAR(255),
  content TEXT,
  linked_to UUID,  -- decision_id or journal_id
  confidence FLOAT DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personal_memory_user ON personal_memory(user_id);
CREATE INDEX idx_personal_memory_type ON personal_memory(memory_type);

-- 3. Behavioral Patterns
CREATE TABLE behavioral_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_name VARCHAR(255),
  pattern_type VARCHAR(50),  -- repeating, emerging, changing
  evidence_points JSONB,  -- Array of {date, source, sourceId, excerpt}
  frequency VARCHAR(50),
  last_detected TIMESTAMP,
  confidence FLOAT DEFAULT 0.5,
  description TEXT,
  ai_insight TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_behavioral_patterns_user ON behavioral_patterns(user_id);

-- 4. Personal Context
CREATE TABLE personal_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type VARCHAR(50),  -- value, goal, blind_spot, strength, emotional_range, decision_style
  title VARCHAR(255),
  description TEXT,
  inferred_from JSONB,  -- {sources: [...], methodology: "..."}
  confidence FLOAT DEFAULT 0.5,
  ai_evidence TEXT,
  user_feedback BOOLEAN,  -- true=user confirmed, false=user rejected, null=no feedback
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personal_context_user ON personal_context(user_id);

-- 5. Insight Feedback
CREATE TABLE insight_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_id VARCHAR(255),  -- reference to AI-generated insight
  feedback_type VARCHAR(50),  -- very_true, somewhat, not_sure, not_me
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_insight_feedback_user ON insight_feedback(user_id);

-- Permissions (Row Level Security)
ALTER TABLE personal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_feedback ENABLE ROW LEVEL SECURITY;

-- Policies (users can only see their own data)
CREATE POLICY "Users see own profiles" ON personal_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own profiles" ON personal_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- (repeat for other tables)
```

---

## 🎯 PHASE 1 IMPLEMENTATION CHECKLIST

### Stage 1: Foundation (Days 1-2)
- [ ] Database schema created + deployed to Supabase
- [ ] TypeScript interfaces defined (`src/lib/intelligence/types.ts`)
- [ ] PersonalContextBuilder skeleton + initialize() method
- [ ] MemoryManager basic CRUD
- [ ] Unit tests for both (3+ each)
- [ ] Supabase client configured in project

### Stage 2: Intelligence Core (Days 3-4)
- [ ] PatternDetector.detectPatterns() working
- [ ] PatternDetector specialized methods (emerging/changing/repeating)
- [ ] EvidenceAnalyzer confidence calculations
- [ ] AIFeedbackLoop.recordFeedback() working
- [ ] Integration with existing Claude API calls
- [ ] Unit tests (5+ per component)

### Stage 3: Integration with Onboarding (Days 5)
- [ ] After AICreationSequence completes → call PersonalContextBuilder.initialize()
- [ ] Onboarding stores data in personal_profiles + personal_context
- [ ] First Twin synthesis now has real personal context
- [ ] E2E tests: onboarding → context created → in DB

### Stage 4: React Components & Frontend (Days 6-7)
- [ ] MemoryRecorder component (user can add memory)
- [ ] ConfidenceIndicator (shows AI certainty level)
- [ ] FeedbackWidget (very_true / somewhat / not_sure / not_me)
- [ ] ContextDisplay (show inferred context)
- [ ] Integration: reflection page now calls MemoryManager + PatternDetector
- [ ] UI tests + E2E

### Stage 5: Testing & Polish (Day 8)
- [ ] Run full test suite (npm test)
- [ ] Performance check: pattern detection on 100+ reflections
- [ ] Type safety: 0 TypeScript errors
- [ ] Code review: JSDoc comments, clean architecture
- [ ] Handoff document: API reference + examples

---

## 🔑 KEY DECISION: Architecture Pattern

**Chosen: Modular Layered**
```
React Components (MemoryRecorder, PatternViewer)
        ↓
Business Logic (PersonalContextBuilder, PatternDetector)
        ↓
Data Access Layer (Supabase client)
        ↓
Database (Supabase)
```

**Benefits:**
✅ Easy to test (mock data access layer)
✅ Reusable logic (CLI tools, backend, etc)
✅ Clear separation of concerns
✅ Scalable (can move to backend later)

---

## 📈 SUCCESS METRICS - Phase 1 Done When:

1. **Database** ✅
   - All 5 tables created + seeded with sample data
   - RLS policies working
   - Supabase dashboard shows tables

2. **Intelligence Engine** ✅
   - PersonalContextBuilder can initialize from onboarding data
   - PatternDetector finds ≥1 pattern in sample data
   - EvidenceAnalyzer provides confidence scores
   - AIFeedbackLoop updates confidence after feedback

3. **Integration** ✅
   - Onboarding flow → PersonalContextBuilder called
   - Data appears in Supabase in real-time
   - No TypeScript errors

4. **Testing** ✅
   - ≥50 unit tests, all passing
   - ≥10 E2E tests for onboarding → context creation
   - Code coverage ≥70%

5. **Documentation** ✅
   - API reference (JSDoc + markdown)
   - Example usage for each component
   - Database schema diagram

---

## 🔄 Token & Context Management

**Phase 1 Tokens Estimate:**
- Analysis + design: 30K
- Implementation: 80K
- Testing + docs: 50K
- Buffer (debugging): 40K
- **Total Phase 1: ~200K tokens**

**If approaching limit:**
→ Create HANDOFF document
→ Mark completed tasks
→ Start new session with summary
→ Continue from where we left off

---

## 📝 NEXT AFTER PHASE 1

Phase 2 (Dashboard + Twin UI) depends on:
- ✅ Personal Intelligence data in Supabase
- ✅ PersonalContextBuilder producing real context
- ✅ PatternDetector finding patterns

Phase 2 will:
- Display this context in Dashboard
- Show Twin with evolving states
- Build Full Analysis page

---

**Ready to code?** → Let's go! 🚀
