# 🔴 SELFPRINT P0 ACTION PLAN — EXECUTION PHASE
**Status:** IN PROGRESS  
**Owner:** AI Development Team  
**Date:** 19 August 2026  
**Reference:** Commit 6d093e7 + AI CONTEXT + GAP MAP FINAL

---

## 📋 EXECUTIVE STATUS

| Item | Current | Target | Blocker |
|------|---------|--------|---------|
| Test Suite | 465/529 passing (64 failures) | 529/529 | 🔴 YES |
| Service Inventory | 62 actual vs 13 claimed | All 62 documented | 🔴 YES |
| Rate Limiting | ❌ MISSING | Express middleware | 🔴 YES |
| Input Validation | Partial (decisions only) | All 3 endpoints | 🔴 YES |
| Twin Lifecycle E2E | Code exists, unverified | Full E2E test | 🔴 YES |
| Secrets Config | Unchecked | ANTHROPIC_API_KEY verified | 🔴 YES |

**Timeline:** 3 days (24 work hours)  
**Go/No-Go:** Cannot proceed to P1 until all P0 complete

---

## PHASE 1: TEST SUITE REPAIR (4 hours)

### 1.1 Diagnosis Complete
- **File:** /api/__tests__/
- **Test Files:** 3 files (autonomy-log, coach, intelligence)
- **Sample Failure:** ConfidenceIndicator.test.tsx → "Found multiple elements with text"
- **Root Cause:** Test query too loose (should use getAllByText or similar)

### 1.2 Repair Strategy
```text
For each failing test:
1. Identify error type (selector mismatch, mock issue, async issue)
2. Fix in code or test
3. Verify locally (npm test)
4. Commit with reason
```

### 1.3 Test Repair Tasks

#### Task 1.3.1: Fix ConfidenceIndicator Tests
- [ ] Fix: "Found multiple elements with text: /Evidence/i"
- [ ] Cause: Test query is too generic
- [ ] Solution: Use getByRole or queryAllByText
- [ ] Verify: Test passes

#### Task 1.3.2: Fix Twin Lifecycle Tests
- [ ] File: api/__tests__/autonomy-log.test.ts
- [ ] Fix: Supabase mock setup
- [ ] Verify: All twin-related tests pass

#### Task 1.3.3: Fix Intelligence Tests
- [ ] File: api/__tests__/intelligence.test.ts
- [ ] Fix: API mock + response handling
- [ ] Verify: All intelligence tests pass

#### Task 1.3.4: Run Full Test Suite
- [ ] Command: `npm test 2>&1 | tee test-results.txt`
- [ ] Target: 529/529 passing
- [ ] Commit: `fix: repair 64 test failures - full suite passing`

**Acceptance Criteria:**
- ✅ npm test returns exit code 0
- ✅ No FAIL lines in output
- ✅ All 529 tests PASS
- ✅ Test results committed to repo

---

## PHASE 2: SERVICE INVENTORY DOCUMENTATION (2 hours)

### 2.1 Current State
- **Directive Claims:** 13 core services
- **Code Actual:** 62 production services
- **Gap:** Documentation mismatch

### 2.2 Core Services (Verified to Exist)
```
1. CoreAwakeningService ✅
2. TwinEvolutionService ✅
3. TwinContextInitializer ✅
4. WorldRoutingService ✅
5. DecisionIntelligenceService ✅
6. SICEOrchestratorImpl ✅
7. NovaAPIService ✅
8. FollowUpScheduler ✅
9. DecisionFollowUpService ✅
10. TwinAPIService ✅
11. SelfPrintOrchestrator ✅
12. DecisionService ✅
13. PerformanceMonitor ✅
```

### 2.3 Support Services (Undocumented)
```
AlertingService, ContinuousImprovementService, ConversationAnalyzer,
DecisionAutomationService, DecisionFollowUpNotifier, DecisionLearningService,
DeliveryVerification, FeedbackService, FirstConversationSetup,
FollowUpScheduler, InputValidation, NotificationAnalytics, NotificationTemplates,
PushScheduler, QualityMetricsService, SecurityService, SentimentAnalyzer,
SentryService, WorldBadgeTracker, WorldExpertiseService, adaptive-audio-engine,
analytics, audioManager, database-init, error-tracking, nova-ai, personalModel,
popupService, privacy-boundary, stripeService, supabase-service,
WorldExpertPrompts, WorldContextAdapter, WorldDecisionRouter,
+ 12 SICE Engines (AIFeedbackLoop, Badge, BehavioralForecast, Decision,
Environment, Experience, FutureSelf, Insight, Memory, Pattern,
PersonalContext, TwinState)
```

### 2.4 Documentation Task

#### Task 2.4.1: Create SERVICE_INVENTORY.md
```typescript
// File: docs/SERVICE_INVENTORY.md
// Structure:
// - Service Name
// - File Location
// - Purpose (1 line)
// - Status (IMPLEMENTED/PARTIAL/INCOMPLETE)
// - Dependencies
// - Key Methods
```
- [ ] List all 62 services
- [ ] Categorize: core (13) + support (49)
- [ ] Mark each: IMPLEMENTED, PARTIAL, or INCOMPLETE
- [ ] Add dependency map
- [ ] File: /docs/SERVICE_INVENTORY.md

#### Task 2.4.2: Update Master Directive
- [ ] File: AI CONTEXT.md
- [ ] Update: Services section (13 core + 49 support)
- [ ] Add: SERVICE_INVENTORY.md reference
- [ ] Commit: `docs: reconcile service inventory - 13 core + 49 support`

**Acceptance Criteria:**
- ✅ SERVICE_INVENTORY.md lists all 62 services
- ✅ Each service has: name, file, purpose, status
- ✅ Dependency map created
- ✅ AI CONTEXT.md updated
- ✅ Committed to repo

---

## PHASE 3: SECURITY HARDENING (2 hours)

### 3.1 Rate Limiting (CRITICAL)

#### Task 3.1.1: Add Rate Limit Middleware
```typescript
// File: server/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.socket.remoteAddress,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                    // strict for auth
  message: 'Too many login attempts',
  skipSuccessfulRequests: true,
});
```
- [ ] Create middleware file
- [ ] Add to server/index.ts
- [ ] Apply to `/api/` routes
- [ ] Apply to `/auth/*` routes (stricter)

#### Task 3.1.2: Test Rate Limiting
```typescript
// Manual test:
// 1. Send 101 requests to /api/intelligence
// 2. Verify 101st request rejected (429 Too Many Requests)
// 3. Wait 15 min, verify works again
```
- [ ] Write rate limit test
- [ ] Verify: 429 returned when limit exceeded
- [ ] Commit: `feat: add rate limiting middleware`

### 3.2 Input Validation (CRITICAL)

#### Task 3.2.1: Audit Current Validation
- [ ] File: server/routes/intelligence.ts
- [ ] File: server/routes/push.ts
- [ ] File: server/routes/auth.ts
- [ ] Document: what's currently validated

#### Task 3.2.2: Add Missing Validation
```typescript
// Example: /api/intelligence endpoint
const validateIntelligence = (req, res, next) => {
  const { mood, birthDate, finetuneAnswers } = req.body;
  
  if (!mood || typeof mood !== 'string') {
    return res.status(400).json({ error: 'Invalid mood' });
  }
  if (!birthDate || new Date(birthDate).toString() === 'Invalid Date') {
    return res.status(400).json({ error: 'Invalid birthDate' });
  }
  if (!Array.isArray(finetuneAnswers)) {
    return res.status(400).json({ error: 'Invalid finetuneAnswers' });
  }
  
  next();
};

app.post('/api/intelligence', validateIntelligence, handler);
```
- [ ] Add validation to /api/intelligence
- [ ] Add validation to /api/push
- [ ] Add validation to /api/auth (signup/login)
- [ ] Write validation tests
- [ ] Commit: `feat: add input validation to all endpoints`

### 3.3 Secrets Configuration (CRITICAL)

#### Task 3.3.1: Verify Secrets
```typescript
// File: server/index.ts (startup check)
const REQUIRED_SECRETS = [
  'ANTHROPIC_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

for (const secret of REQUIRED_SECRETS) {
  if (!process.env[secret]) {
    console.error(`❌ CRITICAL: Missing ${secret} in .env`);
    process.exit(1);
  }
}

console.log('✅ All required secrets configured');
```
- [ ] Add startup secret check
- [ ] Verify ANTHROPIC_API_KEY exists
- [ ] Verify Supabase keys exist
- [ ] Document required .env in README
- [ ] Commit: `feat: add startup secret verification`

**Acceptance Criteria:**
- ✅ Rate limiting middleware added
- ✅ Input validation on all 3 endpoints
- ✅ Rate limit test passes
- ✅ Validation test passes
- ✅ Secrets check added
- ✅ All committed

---

## PHASE 4: TWIN LIFECYCLE E2E VERIFICATION (2 hours)

### 4.1 Current Code Status
```
Login ......................... ✅ Implemented
Onboarding .................... ✅ Implemented
Full Analysis ................. ✅ Implemented
Core Awakening ................ ✅ Implemented (test fails)
Twin Birth .................... ✅ Implemented (test fails)
Twin Restoration .............. ✅ Implemented
World Routing ................. ✅ Implemented (unverified)
```

### 4.2 E2E Test Creation

#### Task 4.2.1: Create Twin Lifecycle E2E Test
```typescript
// File: api/__tests__/twin-lifecycle.e2e.test.ts
describe('Twin Lifecycle — E2E', () => {
  test('Signup → Onboarding → Analysis → Awakening → Twin Birth → Restore', async () => {
    // 1. Signup
    const signupRes = await auth.signUp({ email, password });
    expect(signupRes.user).toBeDefined();
    
    // 2. Onboarding
    const onboardingRes = await client.POST('/api/onboarding', { mood, context });
    expect(onboardingRes.ok).toBe(true);
    
    // 3. Full Analysis
    const analysisRes = await client.POST('/api/intelligence', { mood, birthDate, finetuneAnswers });
    expect(analysisRes.essence).toBeDefined();
    
    // 4. Core Awakening
    const awakeningRes = await client.POST('/api/awakening', { essence });
    expect(awakeningRes.twinId).toBeDefined();
    
    // 5. Verify Twin Persists
    const twinDb = await db.select().from('twins').where('id', twinId);
    expect(twinDb.length).toBe(1);
    
    // 6. Logout + Login
    await auth.logout();
    await auth.login({ email, password });
    
    // 7. Verify Twin Restored
    const restoredTwin = await auth.getTwin();
    expect(restoredTwin.id).toBe(twinId);
  });
});
```
- [ ] Create twin-lifecycle.e2e.test.ts
- [ ] Write full flow test
- [ ] Verify all 7 steps pass
- [ ] Commit: `test: add Twin lifecycle E2E test`

#### Task 4.2.2: Fix Core Awakening Test
- [ ] File: api/__tests__/autonomy-log.test.ts
- [ ] Issue: Supabase mock not initialized
- [ ] Fix: Proper mock setup
- [ ] Verify: Test passes
- [ ] Commit: `fix: repair Core Awakening tests`

#### Task 4.2.3: Verify World Routing
- [ ] File: src/services/WorldRoutingService.ts
- [ ] Test: World context changes properly
- [ ] Test: AI prompting adapts to world
- [ ] Verify: All world tests pass
- [ ] Commit: `test: verify World Routing integration`

**Acceptance Criteria:**
- ✅ Twin lifecycle E2E test created and passing
- ✅ Core Awakening test fixed and passing
- ✅ World Routing verification complete
- ✅ All 7 steps verified end-to-end
- ✅ Committed

---

## PHASE 5: VERIFICATION & SIGN-OFF (2 hours)

### 5.1 100% Verification Checklist

#### ✅ Static Analysis
- [ ] `npm run lint` — 0 errors
- [ ] `npx tsc --noEmit` — 0 type errors
- [ ] No `any` types in modified files
- [ ] ESLint: prettier passed

#### ✅ Unit Tests
- [ ] `npm test` → 529/529 passing
- [ ] No test warnings
- [ ] All mocks properly initialized

#### ✅ Logic & Edge Cases
- [ ] Test success path
- [ ] Test failure path
- [ ] Test edge cases (empty, null, malformed)
- [ ] Test error handling
- [ ] Test fallbacks

#### ✅ Build Simulation
- [ ] `npm run build` → success (0 errors)
- [ ] No dynamic import errors
- [ ] No missing dependencies
- [ ] Build artifacts clean

#### ✅ Performance Rules
- [ ] Rate limiting doesn't break legitimate flow
- [ ] Validation doesn't add >50ms latency
- [ ] No new memory leaks introduced

### 5.2 Final Commit & Push

#### Task 5.2.1: Prepare Release
```bash
# Summary of all P0 fixes
git log --oneline | head -20
```
- [ ] List all commits in this session
- [ ] Verify no breaking changes
- [ ] Verify backward compatibility

#### Task 5.2.2: Push to Repository
```bash
git push origin main
```
- [ ] Push to main branch
- [ ] Verify GitHub CI passes
- [ ] Verify deployment triggered

#### Task 5.2.3: Sign-Off Document
```markdown
# P0 COMPLETION SIGN-OFF

Date: 19 August 2026
Status: ✅ COMPLETE

✅ Test Suite: 529/529 passing
✅ Service Inventory: All 62 documented
✅ Rate Limiting: Middleware added + tested
✅ Input Validation: All 3 endpoints validated
✅ Twin Lifecycle: E2E test passing
✅ Secrets: Verified + startup check added

Production Ready: YES ✅
```
- [ ] Create SIGN_OFF.md
- [ ] Commit: `docs: P0 completion sign-off`
- [ ] Push

---

## EXECUTION SCHEDULE

```
Session 1 (Now)
├─ PHASE 1: Fix tests (4h)
├─ PHASE 2: Document services (2h)
└─ Checkpoint: Commit batches

Session 2
├─ PHASE 3: Security hardening (2h)
├─ PHASE 4: E2E verification (2h)
└─ Checkpoint: All P0 complete

Session 3
├─ PHASE 5: Final verification (2h)
├─ Sign-off + Push
└─ Status: 🟢 READY FOR P1
```

---

## SUCCESS CRITERIA

| Metric | Target | Status |
|--------|--------|--------|
| Tests Passing | 529/529 | 📊 Monitor |
| Services Documented | 62/62 | 📊 Monitor |
| Rate Limiting | Working + tested | 📊 Monitor |
| Input Validation | All endpoints | 📊 Monitor |
| Twin E2E | Full cycle verified | 📊 Monitor |
| Secrets | Configured + verified | 📊 Monitor |
| Zero Breaking Changes | — | 📊 Monitor |
| Backward Compatible | — | 📊 Monitor |

---

## NEXT PHASE (P1)

Once P0 complete:
- [ ] E2E test suite (Playwright)
- [ ] SEO implementation (schema, sitemap, hreflang)
- [ ] Monitoring activation (Sentry)
- [ ] Performance measurement

---

**Document Owner:** AI Development Team  
**Last Updated:** 19 August 2026  
**Reference:** Master Directive V5 + GAP MAP FINAL
