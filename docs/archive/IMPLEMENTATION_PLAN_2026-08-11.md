# 🚀 IMPLEMENTATION PLAN - SELFPRINT
**Date**: 2026-08-11  
**Status**: Ready to Code  
**Token Cost**: P0 (1-2 days), P1 (1-2 days), P2 (ongoing)

---

## 📋 PHASE 0: PREPARATION (Before coding)

### ✅ Completed:
- [x] Full codebase audit (234 files)
- [x] Architecture mapping (14+ contexts, 15 engines)
- [x] Issue identification (4 critical categories)
- [x] Documentation (4 reference docs)

### Ready to Code:
- [x] AUDIT_REPORT_2026-08-11.md (issues)
- [x] FIX_CHECKLIST.md (tasks + estimates)
- [x] CODEBASE_MAP_2026-08-11.md (structure)
- [x] INTELLIGENCE_SYSTEM_ARCHITECTURE.md (engines)
- [x] IMPLEMENTATION_PLAN_2026-08-11.md (this file)

---

## 🔴 P0 - CRITICAL (Must do today)

### 1. Remove PHASE2_TEST_CONSOLE.ts ✂️
**Location**: src/PHASE2_TEST_CONSOLE.ts + App.tsx:53  
**Status**: Exposed to window object  
**Action**:
```bash
# Step 1: Remove import from App.tsx
# Line 52-56: delete or comment out
import('./PHASE2_TEST_CONSOLE').then(module => {
  (window as any).PHASE2_TESTS = module;
  console.log('✅ Phase 2 Tests Ready');
});

# Step 2: Delete file
rm src/PHASE2_TEST_CONSOLE.ts

# Step 3: Verify
grep -r "PHASE2_TEST_CONSOLE" src/ # Should return 0
```
**Estimate**: 10 minutes  
**Verify**: npm run build succeeds, no console errors  

---

### 2. Remove console.log from Production (183 occurrences) 🧹
**Files**: 41 production files  
**Strategy**: Keep in __tests__ only  

**Step-by-step**:
```typescript
// BEFORE (production code)
console.log('Nova API error:', error);  // ❌ REMOVE

// AFTER
// Logging moved to proper logging service
```

**Priority files** (top 10):
1. src/lib/intelligence/AIFeedbackLoop.ts (4)
2. src/hooks/useJournalQueue.ts (14)
3. src/services/supabase-service.ts (20)
4. src/context/EvolutionContext.tsx (6)
5. src/hooks/useAudioDucking.ts (4)
6. src/services/popupService.ts (5)
7. src/lib/intelligence/PersonalContextInitializer.ts (8)
8. src/lib/intelligence/MemoryManager.ts (4)
9. src/hooks/useEvolutionTracking.ts (1)
10. src/lib/intelligence/DailyBriefEngine.ts (1)

**Process**:
1. Run oxlint to identify all console.log
2. Remove or wrap in DEBUG_MODE check
3. Keep only in __tests__ and error scenarios
4. Replace with proper logger (create services/logger.ts)

**Estimate**: 30-45 minutes  
**Verify**: npm run lint passes, no console warnings in prod build

---

### 3. Implement Decision API Calls (Remove mock data) 🔴
**Files**: 
- src/components/features/DecisionForm.tsx (line 62 TODO)
- src/components/features/DecisionLogger.tsx (line 77 TODO)

**Current state**:
```typescript
// ❌ WRONG - Returns mock data
const createDecisionMutation = useMutation({
  mutationFn: async (data: FormData) => {
    return {
      id: `decision_${Date.now()}`,
      userId,
      ...data,
      createdAt: new Date(),
    };
  },
```

**Required state**:
```typescript
// ✅ CORRECT - Real API call
const createDecisionMutation = useMutation({
  mutationFn: async (data: FormData) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiBaseUrl}/api/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: data.title,
        context: data.context,
        expectedOutcome: data.expectedOutcome,
        confidence: data.confidence,
      }),
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  },
```

**Backend endpoints needed**:
- POST /api/decisions (create)
- GET /api/decisions?userId={id} (list)
- PATCH /api/decisions/{id} (update outcome)

**Estimate**: 2-3 hours (includes backend + frontend + testing)  
**Verify**: Create decision flow works end-to-end, Supabase saves data

---

### 4. Fix Crypto Signature Verification 🔒
**File**: src/lib/auth/crypto.ts  
**Issues**:
- Line 102: TODO - Implement full CBOR parser
- Line 347: TODO - Implement signature verification
- Line 357: `valid: true` hardcoded (always true!)

**Current state**:
```typescript
// ❌ WRONG - Always returns true
return {
  valid: true, // TODO: Return actual verification result
  message: 'Signature verified',
};
```

**Required state**:
```typescript
// ✅ CORRECT - Real verification
const isValid = await verifyCBORSignature(
  decodedAttestation,
  clientDataHash,
  publicKey
);

return {
  valid: isValid,
  message: isValid ? 'Signature verified' : 'Signature invalid',
};
```

**Tasks**:
1. Implement CBOR parser (or use cbor-x library)
2. Implement signature verification logic
3. Add proper error handling
4. Test with real Passkey credentials

**Estimate**: 1-2 hours  
**Verify**: Passkey login works on test device with real biometric

---

## 🟡 P1 - HIGH (Next 1-2 hours)

### 5. Remove Mock Data from Components 📊
**Files**: TwinEvolutionChart, DecisionForm (4 occurrences), etc.  
**Pattern**:
```typescript
// ❌ WRONG - Mock return
const mockData = [
  { x: 1, y: 50 },
  { x: 2, y: 75 },
];
return mockData;

// ✅ CORRECT - Fetch real data
const { data } = await fetch(`/api/evolution/${userId}`);
return data;
```

**Affected components**: ~15 files  
**Estimate**: 1-2 hours  

---

### 6. Add Logging Service 📝
**Create**: src/services/logger.ts  
```typescript
export function logInfo(scope: string, message: string, data?: any) {
  if (import.meta.env.DEV) {
    console.log(`[${scope}] ${message}`, data);
  }
  // Also send to analytics/monitoring service
}

export function logError(scope: string, error: Error) {
  console.error(`[${scope}]`, error);
  // Send to error tracking (Sentry, etc.)
}
```

**Estimate**: 30 minutes  

---

### 7. Extend PersonalContextBuilder (Relationship types) 🤝
**File**: src/lib/intelligence/PersonalContextBuilder.ts (line 593)  
**Current TODO**:
```typescript
// TODO: Extend PersonalContextEntry to support relationship type or create separate table
```

**Action**:
1. Add `relationshipType` to PersonalContextEntry interface
2. Create separate relationships table if needed
3. Update extractRelationships() logic

**Estimate**: 1 hour  

---

## 🔵 P2 - MEDIUM (Ongoing)

### 8. Scan for Unused Imports
**Tool**: oxlint + manual review  
**Estimate**: 1 hour  

### 9. Find Dead Code Functions
**Tool**: IDE "find references" for all exports  
**Estimate**: 2 hours  

### 10. Consolidate Dependencies
**Check**: npm ls for duplicates  
**Estimate**: 30 minutes  

---

## ✅ QUALITY GATES (Verification)

### Before Each Commit:
```bash
# Format
npm run lint -- --fix

# Build
npm run build

# Test
npm run test

# Check bundle size
npm run build && echo "Bundle ready"
```

### Before PR:
- [ ] All TODO comments resolved
- [ ] No console.log in production code
- [ ] All API calls are real (no mock)
- [ ] Tests pass
- [ ] Lint passes
- [ ] No new console warnings

---

## 📊 Success Criteria

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| TODO Count | 9 | 0 | ❌→✅ |
| console.log (prod) | 183 | 0 | ❌→✅ |
| PHASE2_TEST_CONSOLE | 1 file | 0 | ❌→✅ |
| Mock data (prod) | 300+ | 0 | ❌→✅ |
| API calls (real) | ~50% | 100% | ❌→✅ |
| Build time | ✓ | <30s | ✓→✓ |
| Test pass rate | ✓ | 100% | ✓→✓ |

---

## 🎯 Workflow

### Day 1 (P0 Critical):
```
09:00 - Remove PHASE2_TEST_CONSOLE
09:15 - Remove console.log (all prod files)
10:00 - Implement Decision API calls
12:00 - Fix crypto verification
13:00 - Add logging service
14:00 - PR review + merge
```

### Day 2 (P1 High):
```
09:00 - Remove mock data from components
10:30 - Extend PersonalContextBuilder relationships
11:30 - Testing + verification
13:00 - Deploy to staging
```

---

## 📦 Deployment Checklist

- [ ] All P0 tasks complete
- [ ] All P1 tasks complete
- [ ] npm run build succeeds
- [ ] npm run test passes
- [ ] npm run lint passes
- [ ] No new console warnings
- [ ] Tested on mobile (small device)
- [ ] Tested on desktop (large device)
- [ ] PWA offline works
- [ ] Service Worker updated
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Supabase policies updated
- [ ] Analytics tracking works
- [ ] Error tracking configured
- [ ] Performance metrics < targets

---

## 🚀 Post-Implementation

### Monitoring:
- [ ] Sentry error tracking active
- [ ] Analytics events firing
- [ ] Performance metrics logged
- [ ] User feedback channels open

### Next Phase:
- [ ] A/B test new features
- [ ] Gather user feedback
- [ ] Plan Phase 2 enhancements
- [ ] Performance optimization

---

## 📝 Notes

**Architecture is solid** ✅
- 15 intelligence engines work correctly
- Type safety is good
- Data model is comprehensive
- No fundamental design issues

**Cleanup is straightforward** ✅
- Remove test console
- Replace console.log with proper logging
- Implement real API calls
- Fix crypto verification

**No major refactoring needed** ✅
- Context structure is good
- Component hierarchy works
- Service layer is clean
- State management is sound

---

**Status**: 🟢 Ready to Implement  
**Estimated Duration**: 2-3 days (P0 + P1)  
**Risk Level**: 🟢 Low (no architecture changes)

---

**Generated**: 2026-08-11  
**Reference Documents**: 4 audit/architecture docs
