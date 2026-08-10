# 📝 รายละเอียดงาน: Astrovera ↔ Selfprint Integration

**เอกสารนี้:** Task checklist ที่ละเอียดเพื่อ assign งานให้ทีม

---

## BLOCK 1: ฐาน (Phase 1) — ⏱️ 3 วัน

### 🎯 TASK 1.1: TypeScript Types Definition
**STEP:** 1  
**Assignee:** Engineer 1  
**Due:** Day 1 EOD

**เหตุการณ์:**
```
□ สร้าง: src/lib/types/astrovera.ts
□ Define: AnalysisRequest interface
□ Define: AnalysisResponse interface
□ Define: PersonProfile interface
□ Define: AnalysisError interface
□ Add: JSDoc comments
□ Add: Enum for analysis types
```

**Test:**
```
□ npm run tsc --noEmit (no errors)
□ TypeScript strict mode ✅
□ All interfaces exported ✅
```

**Definition of Done:**
- [ ] ไฟล์ commit ✅
- [ ] TypeScript compile ✅
- [ ] JSDoc complete ✅

---

### 🎯 TASK 1.2: Adapter Layer Core
**STEP:** 2  
**Assignee:** Engineer 1  
**Due:** Day 2 EOD

**เหตุการณ์:**
```
□ สร้าง: src/lib/astrovera-adapter.ts
□ Function: buildAnalysisRequest()
  - ✅ Input: mood, finetuning answers, birthDate
  - ✅ Output: Astrovera format
  - ✅ Handle edge cases (null values, etc.)
□ Function: transformAnalysisResponse()
  - ✅ Input: Astrovera response JSON
  - ✅ Output: Selfprint AnalysisResponse
  - ✅ Confidence score calculation
□ Function: buildFallbackResponse()
  - ✅ Input: lifePathNumber
  - ✅ Output: Valid AnalysisResponse (fallback)
□ Function: handleAnalysisError()
  - ✅ Input: any error
  - ✅ Output: AnalysisError with fallback
```

**Test Suite:**
```
□ src/lib/__tests__/astrovera-adapter.test.ts
□ Test: buildAnalysisRequest conversions
□ Test: transformAnalysisResponse conversions
□ Test: fallback generation
□ Test: error handling
□ Coverage: 100%
```

**Definition of Done:**
- [ ] npm test pass 100% ✅
- [ ] No console errors ✅
- [ ] Adapter commit ✅

---

### 🎯 TASK 1.3: Supabase Edge Function Template
**STEP:** 3  
**Assignee:** Engineer 1  
**Due:** Day 3 EOD

**เหตุการณ์:**
```
□ สร้าง directory: supabase/functions/intelligence/
□ สร้าง: supabase/functions/intelligence/index.ts
□ Boilerplate:
  - ✅ Request handler
  - ✅ Input validation
  - ✅ Error handling
  - ✅ Logging
  - ✅ Response formatting
□ สร้าง: supabase/functions/intelligence/_utils.ts
  - ✅ Helper functions
  - ✅ Config management
  - ✅ Error codes
```

**Deploy Test:**
```
□ supabase functions deploy intelligence
□ Function available at /functions/v1/intelligence
□ Can receive POST requests
□ Returns valid JSON response
```

**Definition of Done:**
- [ ] Function deploy ✅
- [ ] Test endpoint responds ✅
- [ ] No 500 errors ✅

---

## BLOCK 2: Psychology Integration (Phase 2) — ⏱️ 4 วัน

### 🎯 TASK 2.1: API Contract & Documentation
**STEP:** 4  
**Assignee:** Engineer 1 + Astrovera Team  
**Due:** Day 4 EOD (requires communication)

**เหตุการณ์:**
```
□ Contact Astrovera Team:
  - "How to call Psychology module?"
  - "What's the input format?"
  - "What's the output format?"
  - "Error handling?"
  - "Rate limits?"
□ Document: docs/ASTROVERA_API_CONTRACT.md
  - ✅ Endpoint URL
  - ✅ Input schema
  - ✅ Output schema
  - ✅ Error codes
  - ✅ Rate limits
  - ✅ Example requests
  - ✅ Example responses
```

**Definition of Done:**
- [ ] API contract document ✅
- [ ] Astrovera Team confirmed ✅
- [ ] Examples tested ✅

---

### 🎯 TASK 2.2: Implement Psychology Analysis
**STEP:** 5  
**Assignee:** Engineer 1  
**Due:** Day 6 EOD

**เหตุการณ์:**
```
□ Create: supabase/functions/intelligence/analyze-psychology.ts
□ Function: analyzePsychology(finetuneAnswers, mood, birthDate)
  - ✅ Validate inputs
  - ✅ Transform via adapter → Astrovera format
  - ✅ Call Astrovera Brain Gateway (psychology)
  - ✅ Transform response back → Selfprint format
  - ✅ Save to DB (analysis_history)
  - ✅ Return AnalysisResponse
□ Error Handling:
  - ✅ Catch network errors → fallback
  - ✅ Catch invalid response → fallback
  - ✅ Log all errors
□ Performance:
  - ✅ Add timeout (3s max)
  - ✅ Cache response (optional)
  - ✅ Monitor latency
```

**Integration Test:**
```
□ supabase/functions/intelligence/analyze-psychology.test.ts
□ Test: Psychology call succeeds
□ Test: Response transforms correctly
□ Test: DB save works
□ Test: Fallback on error
□ Test: Latency < 2s
```

**Definition of Done:**
- [ ] npm test pass ✅
- [ ] Astrovera call works ✅
- [ ] Fallback works ✅
- [ ] Latency acceptable ✅

---

### 🎯 TASK 2.3: Frontend Integration
**STEP:** 6  
**Assignee:** Engineer 1  
**Due:** Day 7 EOD

**เหตุการณ์:**
```
□ Edit: src/pages/Onboarding.tsx
  - FIND: const result = await callNova(finetuneAnswers)
  - REPLACE: 
    const result = await fetch('/functions/v1/intelligence', {
      method: 'POST',
      body: JSON.stringify({
        analysisType: 'psychology',
        payload: { finetuneAnswers, mood, birthDate }
      })
    }).then(r => r.json())
  - ✅ Add error handling
  - ✅ Fallback on error still works
  - ✅ Loading state
□ Test Onboarding:
  - ✅ Emotion select → works
  - ✅ Birthdate input → works
  - ✅ Fine-tuning questions → works
  - ✅ Blueprint display → shows Astrovera data
  - ✅ Falls back to Life Path if error
```

**Definition of Done:**
- [ ] Onboarding workflow end-to-end ✅
- [ ] Blueprint shows Astrovera analysis ✅
- [ ] No errors in console ✅
- [ ] Fallback works ✅

---

## BLOCK 3: ฐานข้อมูล (Parallel) — ⏱️ 2 วัน

### 🎯 TASK 3.1: Create History Tables
**STEP:** 7  
**Assignee:** Engineer 2 (DBA)  
**Due:** Day 5 EOD

**เหตุการณ์:**
```
□ Create: supabase/migrations/20260809_add_astrovera_tables.sql
□ Table: analysis_history
  - ✅ id (UUID primary)
  - ✅ user_id (foreign key)
  - ✅ analysis_type (enum)
  - ✅ data (JSONB)
  - ✅ sources (text array)
  - ✅ confidence (float)
  - ✅ created_at (timestamp)
  - ✅ Index: (user_id, created_at)
□ Table: pattern_insights
  - ✅ id, user_id, pattern, frequency, confidence, created_at
  - ✅ Index: (user_id, created_at)
□ Table: session_logs
  - ✅ id, user_id, action, status, latency_ms, created_at
  - ✅ Index: (user_id, created_at)
```

**Test:**
```
□ supabase db push
□ Tables created in DB
□ Indexes created
□ No migration errors
```

**Definition of Done:**
- [ ] Migration apply ✅
- [ ] Tables visible in Supabase ✅
- [ ] Indexes created ✅

---

### 🎯 TASK 3.2: Row Level Security (RLS)
**STEP:** 8  
**Assignee:** Engineer 2  
**Due:** Day 5.5 EOD

**เหตุการณ์:**
```
□ Create: supabase/policies/astrovera_tables.sql
□ Enable RLS on: analysis_history
  - ✅ Policy: users can SELECT own data
  - ✅ Policy: backend can INSERT
□ Enable RLS on: pattern_insights
  - ✅ Same as analysis_history
□ Enable RLS on: session_logs
  - ✅ Same + admin can SELECT all
□ Test RLS:
  - ✅ User A can't see User B data
  - ✅ User A can see own data
  - ✅ Service role can INSERT
```

**Definition of Done:**
- [ ] RLS enabled ✅
- [ ] Policies applied ✅
- [ ] RLS test pass ✅

---

## BLOCK 4: Testing & QA (Phase 2) — ⏱️ 5 วัน

### 🎯 TASK 4.1: Unit Tests - Adapter
**STEP:** 9  
**Assignee:** Engineer 1  
**Due:** Day 8 EOD

**Test Suite:** `src/lib/__tests__/astrovera-adapter.test.ts`

```
✅ Test Suite: buildAnalysisRequest
  □ transforms mood → Astrovera format
  □ transforms finetuning answers
  □ transforms birthDate
  □ handles null/undefined values
  □ handles edge cases

✅ Test Suite: transformAnalysisResponse
  □ maps archetype → decisionStyle
  □ maps insights
  □ calculates confidence
  □ handles invalid response
  □ handles missing fields

✅ Test Suite: buildFallbackResponse
  □ generates valid response
  □ includes Life Path info
  □ sets confidence to 0.6

✅ Coverage: 100%
```

**Definition of Done:**
- [ ] 100% unit test coverage ✅
- [ ] All tests pass ✅
- [ ] npm run test:coverage shows 100% ✅

---

### 🎯 TASK 4.2: Integration Tests - E2E
**STEP:** 10  
**Assignee:** Engineer 1  
**Due:** Day 9 EOD

**Test Suite:** `src/__tests__/onboarding-astrovera.integration.test.ts`

```
✅ Test: Full Onboarding Flow
  □ User selects emotion
  □ User enters birthdate
  □ User answers fine-tuning questions
  □ System calls /functions/v1/intelligence
  □ Psychology analysis returns
  □ Blueprint displays correctly
  □ No UI errors

✅ Test: Fallback Behavior
  □ Astrovera down (simulated)
  □ Fallback to Life Path works
  □ UI still displays correctly
  □ No errors to user

✅ Test: Performance
  □ Latency measurement < 2s (p95)
  □ No memory leaks
  □ No console errors

✅ Test: Error Handling
  □ Network error → fallback
  □ Invalid response → fallback
  □ Timeout → fallback
```

**Definition of Done:**
- [ ] All integration tests pass ✅
- [ ] Latency acceptable ✅
- [ ] Fallback tested ✅

---

### 🎯 TASK 4.3: Staging Deployment
**STEP:** 11  
**Assignee:** Engineer 1 + DevOps  
**Due:** Day 10 EOD

**Checklist:**
```
□ Deploy to Staging:
  - ✅ Push feature/astrovera-adapter
  - ✅ supabase functions deploy (staging)
  - ✅ DB migration run (staging)
  - ✅ Selfprint frontend deploy (staging)

□ Testing Staging:
  - ✅ Full onboarding flow works
  - ✅ Psychology data displays
  - ✅ Fallback works (kill Astrovera)
  - ✅ Latency < 2s
  - ✅ No errors in logs
  - ✅ 100 concurrent users test
  - ✅ Memory stable

□ Monitoring Setup:
  - ✅ Error alerts configured
  - ✅ Latency alerts configured
  - ✅ Logs aggregated
  - ✅ Metrics dashboard ready
```

**Definition of Done:**
- [ ] Staging green ✅
- [ ] Monitoring active ✅
- [ ] Ready for production ✅

---

### 🎯 TASK 4.4: Production Release (Staged Rollout)
**STEP:** 12  
**Assignee:** Engineer 1 + DevOps  
**Due:** Day 13 (3 days with monitoring)

**Release Plan:**
```
📅 Day 11: 10% Rollout
  □ Deploy to 10% of users
  □ Monitor for 4+ hours
  □ Check: error rate, latency, fallback frequency
  □ Criteria to go: error < 0.1%, latency < 2s

📅 Day 12: 50% Rollout (if 10% good)
  □ Deploy to 50% of users
  □ Monitor for 4+ hours
  □ Check: same metrics
  □ Criteria to go: same thresholds

📅 Day 13: 100% Rollout (if 50% good)
  □ Deploy to 100% of users
  □ Monitor for 24 hours
  □ Check: stable state
  □ Celebrate! 🎉

Rollback Plan:
  □ If error > 0.5%: immediate rollback
  □ If latency > 3s: immediate rollback
  □ Revert to /api/nova endpoint
```

**Definition of Done:**
- [ ] 100% users on Astrovera ✅
- [ ] Stable for 24 hours ✅
- [ ] No rollback needed ✅

---

## BLOCK 5: Enhanced Features (Phased) — ⏱️ 2-4 weeks ต่อไป

### 🎯 TASK 5.1: Numerology Enhancement
**STEP:** 13  
**Timeline:** Week 3  
**Effort:** 2 วัน

```
□ Create: analyze-numerology.ts
□ Multi-domain synthesis (Psychology + Numerology)
□ Confidence scoring (blend Psychology 60% + Numerology 40%)
□ Update frontend to show both domains
□ Test accuracy improvement
```

---

### 🎯 TASK 5.2: Pattern Detection
**STEP:** 14  
**Timeline:** Week 3-4  
**Effort:** 5 วัน

```
□ Create: detect-patterns.ts
□ Algorithm: compare last 30 days of moods/analyses
□ Detect: stress → avoidance, decision fatigue, etc.
□ Store: pattern_insights table
□ Display: pattern insights on dashboard
```

---

### 🎯 TASK 5.3: AI Agents (Coach, Insight)
**STEP:** 15  
**Timeline:** Week 4  
**Effort:** 4 วัน

```
□ Integrate: Coach agent (life guidance)
□ Integrate: Insight agent (deep analysis)
□ Create UI: coach cards / guidance cards
□ Test: agent responses quality
```

---

### 🎯 TASK 5.4: Optional Modules
**STEP:** 16  
**Timeline:** Future  
**Effort:** 3-5 วัน ต่อ module

```
□ Vedic Astrology (Indian market)
□ Bazi/Four Pillars (Chinese market)
□ Human Design (specialized)
□ Thai Astrology (Thailand market)
□ User preference UI (select modules)
```

---

## 📊 Summary Table

| Block | Tasks | Timeline | Owner | Subtotal |
|-------|-------|----------|-------|----------|
| **1: Foundation** | 1.1-1.3 | 3 days | Eng1 | 3 days |
| **2: Psychology** | 2.1-2.3 | 4 days | Eng1 | 4 days |
| **3: Database** | 3.1-3.2 | 2 days | Eng2 | 2 days (parallel) |
| **4: Testing** | 4.1-4.4 | 5 days | Eng1+DevOps | 5 days |
| **5: Enhanced** | 5.1-5.4 | 2-4 weeks | Eng1 | Future phases |
| | | | **Total:** | **⏱️ 14 days** |

---

## 🎯 Critical Path

```
Day 1-3   ← MUST COMPLETE (blocks everything)
  ├─ TASK 1.1-1.3 (Types + Adapter + Template)
  └─ TASK 3.1 (start DB tables)

Day 4-7   ← MUST COMPLETE (production ready)
  ├─ TASK 2.1-2.3 (Psychology integration)
  ├─ TASK 3.2 (finish DB RLS)
  └─ TASK 4.1-4.2 (Unit + Integration tests)

Day 8-10  ← MUST COMPLETE (deploy)
  ├─ TASK 4.3-4.4 (Staging → Production)
  └─ 24h monitoring

Day 11+   ← NICE-TO-HAVE (future improvements)
  └─ TASK 5.1-5.4 (Enhanced features)
```

---

## ✅ Before You Start

**Checklist:**
- [ ] Git cleanup done
- [ ] Feature branch created: `feature/astrovera-adapter`
- [ ] Team read Handoff document
- [ ] Astrovera Team replied with API contract
- [ ] `.env.local` has `ASTROVERA_API_KEY`
- [ ] Staging environment ready
- [ ] Monitoring tools configured

---

**Ready to Go! 🚀**

Assign tasks จาก TASK 1.1 เริ่มต้นเลย
