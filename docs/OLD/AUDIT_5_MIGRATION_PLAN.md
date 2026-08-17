# AUDIT DOCUMENT 5: Migration Plan

**Phased integration of Astrovera Intelligence into Selfprint**

---

## OVERVIEW

**Duration:** 4 weeks  
**Phases:** 6  
**Team Size:** 1-2 engineers  
**Risk:** Medium  
**Rollback:** Easy (all changes encapsulated in adapter layer)  

---

## PHASE 1: FOUNDATION (Days 1-3)

### Goals
- Set up decoupled architecture
- Create TypeScript contracts
- Design API adapter layer
- Zero functional changes to Selfprint

### Deliverables
1. **File:** `src/lib/types/astrovera.ts`
   - Input types: `AnalysisRequest`, `PersonProfile`
   - Output types: `AnalysisResponse`, `PersonalityInsight`
   - Error types: `AnalysisError`

2. **File:** `src/lib/astrovera-adapter.ts`
   - Functions: `buildAnalysisRequest()`, `transformAnalysisResponse()`
   - Pure transformation logic, zero side effects
   - Comprehensive unit tests

3. **Setup:** `supabase/functions/intelligence/`
   - Template Edge Function
   - Reads `ASTROVERA_API_KEY` from env
   - Calls Astrovera Brain Gateway (mocked initially)

### Tests
- ✅ Adapter transforms Selfprint data correctly
- ✅ Adapter reverse-transforms correctly
- ✅ Edge Function template deploys
- ✅ No changes visible to users

### Deployment
- Deploy adapter code (zero impact)
- Deploy Edge Function template (non-functional)

---

## PHASE 2: PSYCHOLOGY INTEGRATION (Days 4-7)

### Goals
- Replace Life Path fallback with Astrovera Psychology module
- Implement first Astrovera call from Selfprint
- Keep UI identical (same display, richer analysis)

### Deliverables
1. **Connection:** Intelligence Service → Astrovera Psychology
   - Adapter: `buildPsychologyRequest(finetuneAnswers, mood)`
   - Adapter: `transformPsychologyResponse(astroResponse)`

2. **Edge Function Implementation:** `supabase/functions/intelligence/analyze-psychology.ts`
   - Reads: finetuneAnswers, mood, birthDate
   - Calls: Astrovera Brain Gateway (psychology domain)
   - Returns: { decisionStyle, strengths, insights, opportunities }

3. **Frontend Update:** `src/pages/Onboarding.tsx`
   - Calls: `/functions/v1/intelligence` instead of `/api/nova`
   - Uses transformed response (same interface)
   - Falls back to Life Path if Astrovera is down

### Tests
- ✅ Edge Function works
- ✅ Adapter transforms correctly
- ✅ Fallback works
- ✅ UI displays correctly
- ✅ Blueprint shows richer content

### Deployment
- Deploy Edge Function
- Deploy adapter integration
- Monitor Astrovera latency

---

## PHASE 3: NUMEROLOGY ENHANCEMENT (Days 8-9)

### Goals
- Enhance existing Life Path with Astrovera numerology module
- Build confidence scoring system
- No UI changes

### Deliverables
1. **Multi-domain Response:** Adapt Phase 2 to include numerology
   - Adapter: `buildMultiDomainRequest()` - calls both Psychology + Numerology
   - Adapter: `synthesizeMultiDomain()` - combines with confidence scores

2. **Response Format:**
   ```json
   {
     "decisionStyle": "...",
     "strengths": [...],
     "insights": [...],
     "opportunities": [...],
     "confidence": {
       "overall": 0.85,
       "sources": {
         "psychology": 0.90,
         "numerology": 0.75
       }
     }
   }
   ```

3. **Display:** Add confidence indicators to UI (optional Phase 2 UI update)

### Tests
- ✅ Multi-domain call works
- ✅ Confidence calculation correct
- ✅ No data conflicts between domains

---

## PHASE 4: PATTERN DETECTION (Days 10-14)

### Goals
- Integrate memory system
- Detect patterns in journal entries
- Store history in Supabase

### Deliverables
1. **Database Schema Additions:**
   ```sql
   CREATE TABLE analysis_history (
     id UUID PRIMARY KEY,
     user_id UUID,
     analysis_type TEXT, -- "initial", "refined", "pattern"
     data JSONB,
     source TEXT, -- "psychology", "numerology", "pattern"
     created_at TIMESTAMP
   );
   
   CREATE TABLE pattern_insights (
     id UUID PRIMARY KEY,
     user_id UUID,
     pattern TEXT,
     first_seen TIMESTAMP,
     last_seen TIMESTAMP,
     frequency INT,
     confidence FLOAT
   );
   ```

2. **Memory Builder:** `src/lib/memory-builder.ts`
   - Reads: User's history + journal entries
   - Outputs: Context object for Astrovera

3. **Edge Function:** `supabase/functions/intelligence/detect-patterns.ts`
   - Calls: Astrovera memory system + pattern engine
   - Stores: Results in analysis_history + pattern_insights

### Tests
- ✅ History stored correctly
- ✅ Memory context built correctly
- ✅ Pattern detection works
- ✅ Confidence > 70%

---

## PHASE 5: DECISION SUPPORT (Days 15-18)

### Goals
- Integrate coach + insight agents
- Add decision recommendations
- Create "Ask Coach" feature (future UI)

### Deliverables
1. **Edge Function:** `supabase/functions/intelligence/decision-support.ts`
   - Input: User question + personality context + history
   - Calls: Astrovera coach agent + insight agent
   - Output: { recommendation, reasoning, confidence }

2. **Backend Route:** `POST /functions/v1/intelligence/decide`
   ```json
   {
     "question": "Should I quit my job?",
     "personality": { ... },
     "context": { ... }
   }
   ```

3. **Response Format:**
   ```json
   {
     "recommendation": "...",
     "reasoning": ["point1", "point2", "point3"],
     "confidence": 0.82,
     "source": ["coach", "psychology"]
   }
   ```

### Tests
- ✅ Coach agent responds
- ✅ Reasoning is coherent
- ✅ Confidence appropriate

---

## PHASE 6: TESTING & REFINEMENT (Days 19-28)

### Goals
- End-to-end testing
- Performance optimization
- Documentation
- Prepare for launch

### Deliverables
1. **E2E Testing:**
   - ✅ Onboarding flow works end-to-end
   - ✅ Analysis quality improved
   - ✅ Fallback works when Astrovera down
   - ✅ No data leaks between users
   - ✅ Performance < 2s latency (p95)

2. **Performance Optimization:**
   - Cache analysis results (24h TTL)
   - Lazy-load optional domains (Vedic, etc.)
   - Compress Edge Function payloads

3. **Security Audit:**
   - ✅ API keys not exposed
   - ✅ User data isolated
   - ✅ Rate limits in place
   - ✅ Error messages safe

4. **Documentation:**
   - API contracts document
   - Integration guide
   - Troubleshooting guide

5. **Monitoring Setup:**
   - Log all Astrovera calls
   - Alert on errors
   - Track latency + confidence

### Tests
- ✅ All previous tests still pass
- ✅ New tests for performance
- ✅ Security tests pass
- ✅ Accessibility still WCAG AA

---

## ROLLOUT STRATEGY

### Canary (Day 29)
- 10% of users get new intelligence
- Monitor: latency, errors, user feedback
- Keep fallback enabled

### Staged (Days 30-35)
- 25% → 50% → 100%
- Watch: error rates, latency, support tickets
- Adjust timeouts/fallback as needed

### Final (Day 36)
- 100% on new system
- Keep fallback available (never remove)
- Celebrate 🎉

---

## RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Astrovera down | Users get fallback (acceptable) | Fallback = Life Path always works |
| Slow analysis | Timeout → fallback | 3s timeout, show "using cache" |
| API key leaked | Compromise | Never in frontend, env-only |
| Data conflict | Bad analysis | Multi-domain synthesis tested |
| Latency increase | Bad UX | Cache + optimize (target <2s) |

---

## SUCCESS CRITERIA

✅ Selfprint UI looks identical  
✅ Analysis depth 3-5x better  
✅ Zero Astrovera code in React components  
✅ Fallback always works  
✅ < 2s added latency (p95)  
✅ 99.5% uptime (with fallback)  
✅ 100% test coverage on adapter  
✅ Zero data leaks  

---

**Document Complete** ✅
