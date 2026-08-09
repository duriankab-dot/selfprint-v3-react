# Phase 4 Technical Handoff Guide
**Prepared For:** Backend Integration & Home Dashboard Development  
**Date:** August 7, 2026  
**Status:** Ready for Phase 4 Sprint Planning

---

## Overview

Phase 3 (Onboarding) is complete. Phase 4 will connect the backend AI/Brain Gateway and build the home dashboard. This guide details the integration points and data contracts.

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SELFPRINT v3.2 FLOW                       │
└─────────────────────────────────────────────────────────────┘

PHASE 3 (COMPLETE)                      PHASE 4 (TODO)
────────────────────────              ──────────────────
Emotion Selector                       Brain Gateway API
    ↓                                      ↓
Nova Conversation                      Dynamic Blueprint
    ↓                                   Generation
AI Animation                               ↓
    ↓                                  Home Dashboard
Initial Blueprint (60%)                    ↓
    ↓                                  Insights Engine
Fine-tuning (60%→85%)                      ↓
    ↓                                  Export/Sharing
Full Analysis (85%+)
    ↓
localStorage persistence
```

---

## Key Integration Points for Phase 4

### 1. Fine-tuning Answers → Brain Gateway

**Current State:**
- Answers stored in localStorage at `finetune_answers`
- Format:
  ```json
  {
    "answers": {
      "q1": "Intuition",
      "q2": "People",
      "q3": "Collaborative",
      "q4": "Reflection"
    },
    "timestamp": "2026-08-07T12:34:56Z"
  }
  ```

**Phase 4 Action Required:**
1. **Endpoint:** POST `/api/chat` with system parameter
2. **Payload:**
   ```json
   {
     "messages": [
       {
         "role": "user",
         "content": "Refine AI Twin based on these responses: [answers]"
       }
     ],
     "system": "[Nova personality prompt + analysis instructions]",
     "model": "claude-3-5-sonnet-20241022",
     "temperature": 0.7
   }
   ```
3. **Handler Location:** `server/handler/chat.js` (already supports system parameter)
4. **Expected Response:** Refined blueprint analysis

### 2. SICE Result Data Contract

**Current State (Mock):**
```javascript
siceResult = {
  accuracy: 85,  // Will be 60 initially
  disciplines: [],  // Will contain SICE areas
  finetuned: true  // After fine-tuning
}
```

**Phase 4 Enhancement:**
Connect to actual SICE assessment results:
```javascript
siceResult = {
  accuracy: 60,  // Initial SICE accuracy
  disciplines: {
    decisionStyle: "Strategic Planner",
    strengths: ["Forward-thinking", "Detail-oriented"],
    blindSpot: "Difficulty letting go",
    fullInsights: [...],  // From Brain Gateway
  },
  timestamp: "2026-08-07T...",
  finetuned: false
}
```

### 3. Blueprint Generation & Updates

**Current Implementation (Static Mock):**
- `FullAnalysis` component has hardcoded data
- Accuracy fixed at 85%

**Phase 4 Requirements:**
1. **Dynamic Data:** Pull from `siceResult.disciplines`
2. **Accuracy Progression:** Update as fine-tuning completes
3. **Storage:** Persist full blueprint to user profile
4. **API:** Generate via Brain Gateway with system prompts

**Code Location to Update:**
```typescript
// src/pages/Onboarding.tsx, line 276-305
<FullAnalysis
  profile={{
    // REPLACE THESE WITH ACTUAL DATA
    decisionStyle: siceResult.disciplines?.decisionStyle || "Unknown",
    strengths: siceResult.disciplines?.strengths || [],
    insights: siceResult.disciplines?.insights || [],
    opportunities: siceResult.disciplines?.opportunities || [],
  }}
  accuracy={siceResult.accuracy}
  onHome={handleComplete}
/>
```

### 4. State Persistence & Home Dashboard

**Current Flow:**
- localStorage stores mood, birth data, fine-tuning answers
- Onboarding completes → navigates to /home

**Phase 4 Requirements:**
1. **Profile Completion:** After onboarding, create user profile record
2. **Database Storage:** Save:
   - Birth data (DOB, time, place)
   - Initial assessment results
   - Fine-tuning answers
   - Blueprint (85% accuracy version)
3. **Home Dashboard:**
   - Display persisted AI Twin
   - Show current accuracy level
   - Offer refinement options
   - Track improvements over time

---

## API Integration Checklist

### Brain Gateway (Existing)
- ✅ Endpoint: `/api/chat`
- ✅ Method: POST
- ✅ System parameter: Supported (line 142-146 in chat.js)
- ✅ Rate limiting: 100 req/min per IP
- ✅ CORS: Configured for selfprint.io

### Required for Phase 4
- [ ] New `/api/profile` endpoint (create/update user profile)
- [ ] New `/api/blueprint` endpoint (store/retrieve blueprints)
- [ ] Authentication middleware (verify user token)
- [ ] Database schema for profiles
- [ ] Database schema for blueprints

---

## Component Integration Points

### InitialBlueprint → Brain Gateway
**When:** After AI Creation animation completes  
**Action:** Could optionally validate with Brain Gateway  
**Current:** Mock data  
**Phase 4:** Connect to SICE results

**Code:**
```typescript
// src/components/onboarding/InitialBlueprint.tsx
// Props: profile (from siceResult), accuracy (60), ctaSource
// Callbacks: onContinue() → fine-tuning, onSkip() → complete
```

### FinetuningQuestions → Brain Gateway
**When:** User answers 4 questions  
**Action:** Send answers to `/api/chat` for analysis  
**Current:** Answers stored to localStorage only  
**Phase 4:** Call Brain Gateway with answers

**Integration Code Needed:**
```typescript
// src/pages/Onboarding.tsx handleFinetuneSubmit()
const handleFinetuneSubmit = async (answers: Record<string, string>) => {
  // NEW: Call Brain Gateway
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: `Refine blueprint based on: ${JSON.stringify(answers)}`
        }
      ],
      system: 'You are Nova analyzing fine-tuning responses...',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7
    })
  });
  
  const result = await response.json();
  
  // Update accuracy to 85% with refined data
  setSiceResult(prev => ({
    ...prev,
    accuracy: 85,
    finetuned: true,
    disciplines: parseRefiningAnalysis(result)
  }));
  
  setStep('complete');
};
```

### FullAnalysis → Home Dashboard
**When:** Analysis complete, before home navigation  
**Action:** Pass blueprint to home component  
**Current:** Navigate to /home without data  
**Phase 4:** Pass siceResult as route state

**Integration Code Needed:**
```typescript
// src/pages/Onboarding.tsx onHome handler
const handleComplete = () => {
  // NEW: Pass blueprint data to dashboard
  navigate('/home', { 
    state: { blueprint: siceResult } 
  });
};
```

---

## Database Schema (Phase 4)

### users_profiles Table
```sql
CREATE TABLE users_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  
  -- Birth data
  date_of_birth DATE,
  time_of_birth TIME,
  place_of_birth VARCHAR(255),
  
  -- Emotion baseline
  initial_mood VARCHAR(50),
  
  -- Assessment results
  initial_sice_score INT,
  fine_tuned_sice_score INT,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### blueprints Table
```sql
CREATE TABLE blueprints (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  
  -- Blueprint content
  accuracy_level INT,
  decision_style VARCHAR(255),
  strengths TEXT[], -- JSON array
  insights TEXT[], -- JSON array
  opportunities TEXT[], -- JSON array
  blind_spots TEXT[], -- JSON array
  
  -- Metadata
  version INT,
  is_latest BOOLEAN,
  source VARCHAR(50), -- 'initial', 'refined', 'exported'
  
  FOREIGN KEY (profile_id) REFERENCES users_profiles(id)
);
```

### finetune_responses Table
```sql
CREATE TABLE finetune_responses (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL,
  
  -- Response data
  question_1 VARCHAR(50),
  question_2 VARCHAR(50),
  question_3 VARCHAR(50),
  question_4 VARCHAR(50),
  
  FOREIGN KEY (profile_id) REFERENCES users_profiles(id)
);
```

---

## Environment Variables Needed

### Backend (.env)
```
CLAUDE_API_KEY=sk-...  # Already configured
SELFPRINT_DOMAIN=selfprint.io
DATABASE_URL=postgresql://...  # Phase 4
REDIS_URL=redis://...  # Optional for caching
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:3000/api  # Dev
# or
VITE_API_BASE_URL=https://api.selfprint.io  # Prod
```

---

## Testing Strategy for Phase 4

### Unit Tests
- [ ] Brain Gateway API client
- [ ] Profile creation/update
- [ ] Blueprint parsing from API response
- [ ] Home dashboard data loading

### Integration Tests
- [ ] Full flow: Emotion → Blueprint → Home
- [ ] Fine-tuning answers → API → Blueprint
- [ ] Profile persistence across sessions
- [ ] Error handling (API failures)

### E2E Tests
- [ ] Onboarding → API call → Dashboard navigation
- [ ] Data persistence through page refresh
- [ ] Authentication/authorization

---

## Known Implementation Details

### Mood System
- 10 moods with unique color systems
- CSS variables automatically applied
- Animation timing varies by mood
- Located: `src/styles/tokens.css`

### State Management
- Zustand for user context
- localStorage for persistence
- No Redux (intentionally simple)
- User store: `src/store/userStore.ts`

### localStorage Keys
```javascript
user_mood            // Current mood
user_profile         // User birth data
landing_cta_source   // Which CTA was clicked
finetune_answers     // Fine-tuning responses
```

### Component Props Contracts

**InitialBlueprint:**
```typescript
interface InitialBlueprintProps {
  profile: { decisionStyle, strengths[], blindSpot }
  accuracy?: number  // Default 60
  onContinue: () => void
  onSkip?: () => void
  ctaSource?: string  // 'why'|'how'|'who'|'next'
}
```

**FinetuningQuestions:**
```typescript
interface FinetuningQuestionsProps {
  onSubmit: (answers: Record<string, string>) => void
  onSkip: () => void
  initialAccuracy?: number  // Default 60
}
```

**FullAnalysis:**
```typescript
interface FullAnalysisProps {
  profile: {
    decisionStyle: string
    strengths: string[]
    insights: string[]
    opportunities: string[]
  }
  accuracy?: number  // Default 85
  onHome: () => void
}
```

---

## Common Pitfalls to Avoid

### ❌ Don't
1. **Hardcode accuracy values** - Pull from siceResult
2. **Skip Brain Gateway integration** - Send fine-tuning answers to API
3. **Lose user data** - Properly persist to database
4. **Forget authentication** - Verify user before saving
5. **Ignore error handling** - API calls can fail
6. **Assume single refresh** - Handle page refresh gracefully

### ✅ Do
1. **Use siceResult for all data** - Single source of truth
2. **Implement proper error boundaries** - Catch API errors
3. **Add loading states** - Show when calling Brain Gateway
4. **Validate responses** - Ensure data structure matches expectations
5. **Test extensively** - Phase 4 adds async complexity
6. **Document changes** - Keep this handoff updated

---

## Performance Considerations

### Current (Phase 3)
- All operations <500ms (CPU-bound only)
- No network latency

### Phase 4 (With API)
- Brain Gateway call: ~2-5 seconds
- Database operations: ~100-500ms
- Need loading states/spinners
- Consider request debouncing
- Cache blueprints locally

### Recommendations
1. Show loading spinner during Brain Gateway calls
2. Implement timeout (15 seconds)
3. Retry logic for failed requests (exponential backoff)
4. Cache blueprints in localStorage
5. Show draft version while API responds

---

## Documentation Structure

### For Frontend Developers
- This file (technical handoff)
- Component JSDoc comments
- `TESTING_REPORT.md` for test structure

### For Backend Developers
- API contract (above)
- Database schema (above)
- `server/handler/chat.js` for Brain Gateway reference

### For DevOps/Deployment
- Environment variables section
- Database setup scripts (to create)
- API deployment checklist (to create)

---

## Estimated Phase 4 Timeline

Based on complexity and integration points:

| Task | Estimate | Dependencies |
|------|----------|--------------|
| API endpoints (profile, blueprint) | 3 days | Database schema |
| Database setup & migrations | 2 days | Schema finalized |
| Brain Gateway integration | 3 days | API endpoints ready |
| Home dashboard component | 4 days | API working |
| Error handling & loading states | 2 days | All API calls in place |
| Testing & QA | 3 days | All features complete |
| Deployment prep | 1 day | All testing passing |

**Estimated Total:** 18 days (3 sprints of 2 weeks)

---

## Questions for Next Session

### Planning
1. [ ] Database location decided?
2. [ ] Authentication method finalized?
3. [ ] Analytics requirements defined?
4. [ ] Home dashboard mockups ready?

### Technical
1. [ ] API response format approved?
2. [ ] Error handling strategy agreed?
3. [ ] Caching approach defined?
4. [ ] Rate limiting requirements?

### Business
1. [ ] Export/sharing features in scope?
2. [ ] Multi-language support planned?
3. [ ] Mobile app considered?
4. [ ] Monetization model?

---

## Success Criteria for Phase 4

- ✅ All API endpoints working
- ✅ Brain Gateway integration complete
- ✅ Home dashboard displaying blueprint
- ✅ Data persistence verified
- ✅ Error handling comprehensive
- ✅ Performance acceptable (<5sec for full flow)
- ✅ Tests passing (75%+ coverage)
- ✅ Documentation updated
- ✅ Ready for production deployment

---

## Sign-off

**Prepared by:** Claude  
**Date:** August 7, 2026  
**Status:** Ready for Phase 4 Sprint Planning

**Next Steps:**
1. Review this document in Phase 4 kickoff
2. Clarify API contracts with backend team
3. Finalize database schema
4. Begin API development
5. Parallel: Home dashboard component design

---

## Appendix: Quick Links

**Code References:**
- Onboarding flow: `src/pages/Onboarding.tsx`
- State management: `src/store/userStore.ts`
- Design tokens: `src/styles/tokens.css`
- Testing: `src/pages/Onboarding.test.tsx`

**Documentation:**
- Testing report: `TESTING_REPORT.md`
- Session summary: `SESSION_SUMMARY.md`
- This document: `PHASE4_TECHNICAL_HANDOFF.md`

**External Resources:**
- Brain Gateway: `server/handler/chat.js` (system parameter support)
- Claude API docs: https://docs.anthropic.com/

---

**END OF PHASE 4 TECHNICAL HANDOFF**

*This document is the official handoff from Phase 3 to Phase 4. Keep updated as Phase 4 progresses.*
