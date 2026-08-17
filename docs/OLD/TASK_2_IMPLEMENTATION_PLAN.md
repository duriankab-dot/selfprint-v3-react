# 🧠 TASK #2 IMPLEMENTATION PLAN
**P0-1: Native Personal Intelligence Engine**

**Status:** IN PROGRESS  
**Date:** August 10, 2026  
**Target Duration:** 2-3 weeks

---

## OVERVIEW

Core objective: **Complete the Personal Intelligence Engine so Selfprint understands users on first session**

**8-Step First-Session Pipeline (from DIRECTIVE):**
```
User Input → Validation → Personal Context → Multi-source Synthesis → 
Pattern Analysis → Confidence Assessment → Relevance Ranking → First Insight (+ Twin Birth)
```

**Components to Complete/Enhance:**
1. ✅ PersonalContextBuilder.ts — framework exists, need private method implementation
2. ✅ MemoryManager.ts — exists, need full CRUD ops + UI connection
3. ✅ PatternDetector.ts — exists, need 3-way detection (repeat/change/emerging)
4. ✅ EvidenceAnalyzer.ts — exists, need confidence scoring system
5. ✅ AIFeedbackLoop.ts — exists, need calibration logic
6. ✅ InsightEngine.ts — exists, need Deep Analysis (9 components)
7. ⚠️ PersonalContextInitializer.ts — exists, need onboarding integration
8. ✅ TwinStateEngine.ts — exists, need full Evolution states (6 levels)

**UI Integration Points:**
- Dashboard → shows real insights from Intelligence engines
- Today page → dynamic sections from AI Orchestrator
- Twin → displays Twin state based on TwinStateEngine
- Memory UI → MemoryRecorder component connects to MemoryManager

---

## PHASE 1: FOUNDATION (Week 1)

### Task 1A: Verify & Complete PersonalContextBuilder

**Current Status:**
- Class structure exists ✅
- Methods: `initialize()`, `updateFromReflection()`, `getContext()` ✅
- Private helpers: Most are stubs or incomplete

**What Needs Done:**
1. ✅ Implement `createPersonalProfile()` — store user baseline
2. ✅ Implement `inferContextFromOnboarding()` — parse answers → Values/Goals/Strengths
3. ✅ Implement `detectInitialPatterns()` — first pattern detection
4. ✅ Implement `createMemoriesFromOnboarding()` — extract significant moments
5. ✅ Implement `synthesizeContext()` — combine all into PersonalContext
6. ✅ Fix database calls (supabase + db queries)
7. ✅ Test with real onboarding flow

**Exit Criteria:**
- All methods have real implementation (no stubs)
- Tests pass: `npm test PersonalContextBuilder.test.ts`
- PersonalContext is returned with real data (not empty)

**Estimated Tokens:** 3,000

---

### Task 1B: Verify & Complete MemoryManager

**Current Status:**
- Class structure exists ✅
- CRUD methods likely present ✅
- Need to verify complete implementation

**What Needs Done:**
1. ✅ Verify CRUD ops exist (Create, Read, Update, Delete)
2. ✅ Verify memory categorization (small_win, important_moment, discovery, personal)
3. ✅ Implement getUserMemories() → fetch all memories for user
4. ✅ Implement deleteMemory() → user can remove memory
5. ✅ Implement clearAllMemories() → reset AI memory
6. ✅ Implement linkMemoryToInsight() → connect memory to pattern/insight
7. ✅ Test database operations

**Exit Criteria:**
- All CRUD ops work
- Tests pass
- MemoryRecorder.tsx can call createMemory() + deleteMemory()

**Estimated Tokens:** 2,500

---

### Task 1C: Verify & Complete PatternDetector

**Current Status:**
- Framework exists ✅
- Need to verify 3-way detection logic

**What Needs Done:**
1. ✅ Implement detectRepeating() — "What keeps repeating?"
   - Look for recurring themes in reflections/decisions
   - Time window: last 30 days
   - Min occurrences: 3+
   
2. ✅ Implement detectChanging() — "What is changing?"
   - Compare current behavior to baseline
   - Track trend direction (improving/declining)
   - Min time span: 2 weeks
   
3. ✅ Implement detectEmerging() — "What is emerging?"
   - Early signals of new behavior/interest
   - Low confidence but high potential signal
   - Not yet confirmed pattern

4. ✅ Implement confidence scoring for each detection

**Exit Criteria:**
- All 3 detection methods work
- Returns structured BehavioralPattern[] with confidence
- Tests pass

**Estimated Tokens:** 2,500

---

### Task 1D: Verify & Complete EvidenceAnalyzer

**Current Status:**
- Framework exists ✅
- Need confidence system

**What Needs Done:**
1. ✅ Implement analyzeInsight() → break down insight into:
   - Evidence: which data points support this?
   - Recency: how recent is this evidence?
   - Relevance: does it matter now?
   - Confidence: 0-1 score

2. ✅ Implement distinguishKnowInferUnknown():
   - KNOW: user explicitly stated ("I like writing")
   - INFER: AI concluded from behavior ("you seem to enjoy writing")
   - UNKNOWN: not enough data ("unclear about your music taste")

3. ✅ Implement confidenceThreshold() → min confidence to surface insight

**Exit Criteria:**
- Insights include evidence breakdown
- KNOW vs INFER properly distinguished
- Tests pass

**Estimated Tokens:** 2,000

---

### Task 1E: Verify & Complete AIFeedbackLoop

**Current Status:**
- Framework exists ✅
- Need calibration logic

**What Needs Done:**
1. ✅ Implement collectUserFeedback() → show insight + ask:
   - "Very true" (↑ weight)
   - "Somewhat" (→ weight)
   - "Not sure" (↓ weight)
   - "Not me" (× weight)

2. ✅ Implement calibrateModel() → adjust weights based on feedback

3. ✅ Implement adjustSignalWeight() → modify confidence of sources

4. ✅ Implement updateBehavioralModel() → improve next inferences

**Exit Criteria:**
- User can give feedback on insights
- Model learns from feedback
- Subsequent insights improved
- Tests pass

**Estimated Tokens:** 2,000

---

## PHASE 2: INTEGRATION (Week 2)

### Task 2A: Connect PersonalContextBuilder → Dashboard

**What Needs Done:**
1. Dashboard calls `InsightEngine.generateInsight()` on load
2. InsightEngine uses PersonalContext from builder
3. Dashboard displays real insight (not static)

**Exit Criteria:**
- Dashboard shows AI-generated insight specific to user

**Estimated Tokens:** 1,500

---

### Task 2B: Connect MemoryManager → MemoryRecorder UI

**What Needs Done:**
1. MemoryRecorder.tsx calls `MemoryManager.createMemory()`
2. User can view/edit/delete memories
3. Memories persist in database

**Exit Criteria:**
- Full memory CRUD in UI works

**Estimated Tokens:** 1,000

---

### Task 2C: Connect PatternDetector → PatternInsights UI

**What Needs Done:**
1. PatternInsights.tsx calls `PatternDetector.detectAll()`
2. Shows "Repeating", "Changing", "Emerging" sections
3. Updates when new data arrives

**Exit Criteria:**
- Real patterns display in UI

**Estimated Tokens:** 1,500

---

## PHASE 3: POLISH (Week 3)

### Task 3A: Deep Personal Analysis (9 components)

Build InsightEngine to generate:
1. ภาพรวมตัวตน — "You are..."
2. รูปแบบพฤติกรรม — "You tend to..."
3. จุดแข็ง — "Your strengths are..."
4. Blind Spots — "You might not see..."
5. แนวโน้ม — "You're trending toward..."
6. Journey — "You're in this stage..."
7. ประเด็นสำคัญ — "Right now..."
8. Personal Guidance — "Consider..."
9. Next Step — "Try..."

**Exit Criteria:**
- All 9 components generated + displayed in Dashboard

**Estimated Tokens:** 3,000

---

### Task 3B: Twin Evolution Tracking

Use TwinStateEngine to track Twin state:
- Current state (1-6)
- Conditions to advance
- Visual display

**Exit Criteria:**
- Twin state accurately reflects Personal Model maturity

**Estimated Tokens:** 1,000

---

### Task 3C: Testing & Verification

- `npm test` → all pass ✅
- `npm run lint` → no blockers
- Manual testing of canonical flow

**Exit Criteria:**
- Full E2E first-session flow works

**Estimated Tokens:** 1,000

---

## CRITICAL IMPLEMENTATION RULES

### Data Integrity
- ❌ Never hardcode confidences
- ✅ Calculate from actual evidence
- ❌ Don't overclaim on soft signals (Fingerprint/Palm/Hexagram)

### User Privacy
- ❌ Don't diagnose mental health (use soft signals only)
- ✅ Let user control memory
- ✅ Show evidence for insights

### Quality Gates
- ❌ Deploy without tests passing
- ❌ Show insight below min confidence
- ✅ Always distinguish KNOW vs INFER

---

## SUCCESS CRITERIA FOR TASK #2

✅ **All 5 core engines complete & integrated**  
✅ **Dashboard shows real AI-generated insights**  
✅ **Memory manager fully functional**  
✅ **Pattern detection works (3 types)**  
✅ **Evidence system transparent**  
✅ **Feedback loop trains model**  
✅ **All tests pass**  
✅ **TypeScript: `tsc --noEmit` ✅**  

**Metric:** User feels "Selfprint is learning about me" on first session

---

## BLOCKERS & DEPENDENCIES

**External Dependency:**
- Supabase tables must exist (schema checks)

**Internal Dependency:**
- Onboarding flow must generate answers → `InitializeContextRequest`
- Dashboard must accept Intelligence Engine output

---

## ESTIMATED EFFORT

- **Phase 1 (Foundation):** 5 days (core engines)
- **Phase 2 (Integration):** 3 days (UI connection)
- **Phase 3 (Polish):** 2 days (refinement + testing)

**Total:** 10 days = 2 weeks (conservative estimate)

---

## NEXT STEP

→ Start Task 1A: Complete PersonalContextBuilder

