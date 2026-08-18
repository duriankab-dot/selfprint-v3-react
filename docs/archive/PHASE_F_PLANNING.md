# Phase F: Planning Document

**Status:** Ready for Next Session  
**Token Budget:** 200k (fresh session)  
**Estimated Duration:** 4-5 hours  
**Priority:** High (unblocks full system)

---

## Phase F Objectives

1. **Fix Build (Critical)** — Resolve legacy code errors so `npm run build` passes
2. **Analytics Dashboard** — Show decision stats and Twin insights
3. **Confidence Display** — Twin shows confidence levels in recommendations
4. **Production Polish** — Full system ready for users

---

## Task Breakdown & Token Allocation

### Task F1: Legacy Code Migration (20k tokens)

**Problem:** 3 files expect old Decision schema  
**Impact:** `npm run build` fails  
**Criticality:** HIGH (blocks production)

#### Files to Fix
1. **src/store/decisionStore.ts** (Zustand store)
   - Replace `getDecisions()` → `getUserDecisions()`
   - Update Decision type expectations
   - ~50 lines to modify

2. **src/pages/DecisionDashboard.tsx**
   - Update Decision field references
   - Import DecisionService functions
   - Update UI to match Phase E design
   - ~80 lines to modify

3. **src/services/DecisionAutomationService.ts**
   - Remove or update outdated logic
   - Integrate with Phase E services
   - ~60 lines to modify

#### Work Estimate
```
Review + Update: 8k tokens
Testing fixes: 5k tokens
Manual QA: 4k tokens
Documentation: 3k tokens
Total: 20k tokens
```

---

### Task F2: Analytics Dashboard (35k tokens)

**Goal:** Display decision stats and insights  
**Scope:** New component + API integration  

#### Components to Build

1. **DecisionStats Component**
   - Total decisions count
   - Success rate (%)
   - Best/worst worlds
   - Pending follow-ups
   - Estimated effort: 8k tokens

2. **DecisionInsights Component**
   - World-specific insights (text)
   - Confidence levels per world
   - Pattern summaries
   - Trend descriptions
   - Estimated effort: 8k tokens

3. **DecisionTimeline Component**
   - Visual timeline of decisions
   - Outcome markers
   - Follow-up indicators
   - Estimated effort: 10k tokens

4. **TwinConfidenceIndicator Component**
   - Display in chat (confidence badge)
   - Confidence → (low/medium/high)
   - Color-coded display
   - Estimated effort: 5k tokens

5. **API Endpoints** (if needed)
   - `/api/decisions/stats`
   - `/api/decisions/insights`
   - `/api/twin/confidence`
   - Estimated effort: 4k tokens

#### Work Estimate
```
Component scaffolding: 8k tokens
Implementation: 20k tokens
Testing: 4k tokens
Polish + docs: 3k tokens
Total: 35k tokens
```

---

### Task F3: Testing & Validation (15k tokens)

**Goal:** All tests pass, build succeeds, no regressions

#### Testing Tasks

1. **Unit Tests**
   - Verify legacy code changes don't break existing tests
   - 3k tokens

2. **Integration Tests**
   - Decision → Dashboard → Insights flow
   - 3k tokens

3. **Full Build Test**
   - `npm run build` passes completely
   - No TypeScript errors
   - 3k tokens

4. **Performance Tests**
   - Dashboard loads in <2 seconds
   - Queries < 100ms
   - 3k tokens

5. **Manual QA**
   - End-to-end user journey
   - Decision creation → Dashboard view
   - 3k tokens

#### Work Estimate
```
Total: 15k tokens
```

---

### Contingency Buffer (15k tokens)

For unexpected issues or scope expansion:
- Complex legacy code interactions
- Database query optimization
- Performance debugging
- Additional edge cases

---

## Detailed Implementation Plan

### F1: Legacy Code Fix (Day 1)

#### Step 1: Update Decision Type (3k tokens)
```typescript
// src/types/decision.ts (already has compatibility fields)
// No changes needed - already updated in Phase E

// Just verify these fields exist:
- title (optional)
- description (optional)
- category (optional)
- followUps (optional array)
- confidence (optional number)
- decisionDate (optional string)
```

#### Step 2: Fix decisionStore.ts (5k tokens)
```typescript
// Change:
import { getDecisions } from '../services/DecisionService';
// To:
import { getUserDecisions } from '../services/DecisionService';

// Update all getDecisions() calls to getUserDecisions(twinId, world?)

// Remove references to non-existent fields:
// - d.title, d.description, d.category → populate from question
// - d.followUps → calculate from FollowUpScheduler
// - d.decisionDate → use createdAt
```

#### Step 3: Fix DecisionDashboard.tsx (6k tokens)
```typescript
// Import Phase E services
import * as DecisionService from '../services/DecisionService';
import * as DecisionLearningService from '../services/DecisionLearningService';

// Update to use:
- getDecisionInsights(userId)
- getUserDecisions(userId, world?)
- getTwinDecisionConfidence(userId, world)

// Remove old functions:
- getDecisionStats() → use getDecisionInsights()
- createDecision() → use recordDecision()
```

#### Step 4: Fix DecisionAutomationService.ts (4k tokens)
```typescript
// Either:
// Option A: Remove deprecated automation (if not used)
// Option B: Rewrite using Phase E services

// Recommended: Option B
// Use FollowUpScheduler.runDailyFollowUpTask()
// Use DecisionLearningService for pattern analysis
```

#### Step 5: Test & Verify (2k tokens)
```bash
npm run build          # Should pass
npm test               # All tests passing
npm run lint           # No linting errors
```

---

### F2: Analytics Dashboard (Next 2 days)

#### Step 1: Create Components (15k tokens)

**File Structure:**
```
src/components/decision/
  ├── DecisionStats.tsx           (stats card)
  ├── DecisionInsights.tsx        (insights text)
  ├── DecisionTimeline.tsx        (visual timeline)
  ├── TwinConfidenceIndicator.tsx (confidence badge)
  └── DecisionDashboard.tsx       (main page)
```

**Implementation Order:**
1. DecisionStats (simplest) → 4k
2. TwinConfidenceIndicator → 3k
3. DecisionInsights → 4k
4. DecisionTimeline (most complex) → 4k

#### Step 2: API Integration (8k tokens)

**Add to TwinAPIService or new DecisionAPI:**
```typescript
// Get insights for dashboard
export async function getDecisionInsights(userId: string)

// Get confidence for Twin recommendations
export async function getTwinConfidenceInWorld(userId: string, world: WorldId)

// Get world-specific insights
export async function getWorldInsights(userId: string, world: WorldId)
```

#### Step 3: UI Polish (10k tokens)

- Responsive design for mobile
- Loading states
- Empty states
- Error handling
- Animations/transitions
- Theme integration

#### Step 4: Testing (2k tokens)

- Component tests
- Integration with services
- Performance tests
- Manual QA

---

### F3: Testing & Validation (Day 3)

#### Build Verification
```bash
npm run build          # ✅ Must pass
npm test               # ✅ 100+ tests passing
npm run lint           # ✅ No errors
```

#### Performance Verification
```
Dashboard load: < 2 seconds
Query response: < 100ms
Decision save: < 500ms
Insights calc: < 600ms
```

#### E2E Scenarios
1. Create decision → appears on dashboard
2. Record outcome → confidence updates
3. View insights → accurate data
4. Multi-world → correct filtering
5. Follow-up notification → triggers correctly

---

## Success Criteria

### ✅ Phase F Complete When:

1. **Build passes**
   ```bash
   npm run build  # No errors
   ```

2. **All tests pass**
   ```bash
   npm test       # 100+ tests ✅
   ```

3. **Dashboard displays**
   - Decision stats visible
   - Confidence per world shown
   - Insights generated and displayed
   - Timeline renders

4. **Performance meets targets**
   - All operations < performance targets
   - No regressions from Phase E

5. **Production ready**
   - Full code review passed
   - Documentation updated
   - Ready to deploy

---

## Blockers & Dependencies

### No External Blockers
- Phase E complete ✅
- Database deployed ✅
- Services ready ✅

### Internal Risks
- Legacy code complexity (mitigated by step-by-step approach)
- Timeline component complexity (start early if running low on tokens)

---

## Resources Needed

### Documentation to Review
```
docs/PHASE_E_SPECIFICATION.md
docs/PHASE_E_STEP1_DATABASE.md
docs/PHASE_E_STEP2_TESTING_VALIDATION.md
docs/PHASE_E_STEP2_COMPLETION.md
```

### Services to Integrate With
```
src/services/DecisionService.ts
src/services/FollowUpScheduler.ts
src/services/DecisionLearningService.ts
```

### Existing Components to Reference
```
src/components/chat/WorldContextHeader.tsx  (styling patterns)
src/pages/TwinChat.tsx                       (integration pattern)
```

---

## Session Structure (Next Time)

### Hour 1: Setup & F1 Start
- Git pull latest
- Read Phase E docs
- Start legacy code fixes

### Hour 2-3: F1 Complete + F2 Start
- Finish legacy fixes & build verification
- Begin analytics components

### Hour 3-4: F2 Continue
- Complete dashboard components
- API integration

### Hour 4-5: F3 Testing + Polish
- Full build test
- Performance validation
- QA scenarios
- Final documentation

### Buffer
- Remaining tokens for fixes/refinements
- If ahead of schedule: Phase G planning

---

## Phase F Checklist (For Next Session)

**Before Starting:**
- [ ] Read all Phase E documentation
- [ ] Pull latest master branch
- [ ] Verify Phase E services compile
- [ ] Review PHASE_E_STEP2_COMPLETION.md

**F1: Legacy Code Migration**
- [ ] Update decisionStore.ts
- [ ] Update DecisionDashboard.tsx
- [ ] Update DecisionAutomationService.ts
- [ ] Run `npm run build` → passes
- [ ] Commit: "Phase F Task 1: Legacy Code Migration"

**F2: Analytics Dashboard**
- [ ] Create DecisionStats component
- [ ] Create DecisionInsights component
- [ ] Create DecisionTimeline component
- [ ] Create TwinConfidenceIndicator component
- [ ] Integrate with Phase E services
- [ ] Commit: "Phase F Task 2: Analytics Dashboard"

**F3: Testing & Validation**
- [ ] All tests pass (100+)
- [ ] Full build passes
- [ ] Performance benchmarks met
- [ ] E2E scenarios validated
- [ ] Commit: "Phase F Task 3: Testing & Validation Complete"

**Final**
- [ ] Code review passed
- [ ] Documentation updated
- [ ] Ready to deploy Phase F

---

## Phase G Preview (Future)

After Phase F is complete:

**Phase G: Production Hardening**
- Performance optimization for 1000+ decisions
- Caching strategy implementation
- Advanced analytics (counter-factual analysis)
- Mobile-optimized follow-up notifications
- User feedback integration

**Estimated Effort:** 2-3 sessions

---

## Questions for Next Session

1. Which analytics view is highest priority?
2. Should timeline be visual or tabular?
3. Need confidence indicators in chat, or just dashboard?
4. Export functionality needed immediately?

---

## Success Summary

Phase F takes the **foundation** of Phase E (services, tests, database) and adds the **visibility layer** (dashboard, insights, confidence indicators).

**Result:** Users can see:
- What decisions they've made
- How well those decisions turned out
- Twin's confidence in each world
- Patterns and trends
- When follow-ups are due

**Timeline:** Next session, 4-5 hours, 200k tokens

---

**Ready to implement Phase F on next session!** 🚀

