# PHASE 10 — Testing Coverage (ภาษาไทย)

**วันที่:** 2026-08-17 | **Status:** 🔧 AUDIT | **Token:** Managed

---

## 📊 Test Coverage Status

### Test Files Found
```
✅ src/services/__tests__/
   ├── CoreAwakeningService.phase3.test.ts ✅
   ├── CoreAwakeningService.integration.ts ✅
   └── analytics.test.ts ✅

✅ src/__tests__/
   ├── Phase_E_Integration.test.ts ✅
   ├── Decision.test.ts ✅
   ├── FollowUpScheduler.test.ts ✅
   ├── DecisionService.test.ts ✅
   ├── DecisionLearningService.test.ts ✅
   ├── TwinWorldsIntegration.test.ts ✅
   ├── TwinEvolution.test.ts ✅
   ├── SICE.test.ts ✅
   ├── Worlds.test.tsx ✅
   ├── CoreAwakening.test.ts ✅
   ├── AIContext.test.ts ✅
   ├── Avatars.test.tsx ✅
   ├── nova-prompts.test.ts ✅
   ├── selfprint-chat.test.ts ✅
   └── integration.test.ts ✅

Total: 15+ test files
```

**Status:** ✅ Good foundation

---

## 🎯 Critical Path Tests (Must Pass)

### 1️⃣ Twin Lifecycle Test

```typescript
// ✅ NEEDED: Complete Twin journey in 1 test
describe('Twin Lifecycle E2E', () => {
  it('should complete full Twin journey: Awakening → Creation → Chat → Evolution → Learning', async () => {
    // Step 1: Core Awakening
    const awakening = await startAwakening(userId);
    expect(awakening.success).toBe(true);
    const essenceId = awakening.essenceId;

    // Step 2: Initialize Twin
    const twin = await initializeTwin(userId, essenceId, 'Nova');
    expect(twin.id).toBeDefined();
    expect(twin.stage).toBe(1); // Seed stage

    // Step 3: First chat (interaction 1-10)
    for (let i = 0; i < 10; i++) {
      const response = await twinChat(twin.id, `Message ${i + 1}`);
      expect(response).toBeTruthy();
    }

    // Step 4: Verify evolution (should be Stage 2 at 10+ interactions)
    const evolved = await checkEvolution(twin.id);
    expect(evolved.stage).toBe(2);
    expect(evolved.evolved).toBe(true);

    // Step 5: Verify memory persists
    const memories = await fetchTwinMemories(twin.id);
    expect(memories.length).toBeGreaterThan(0);

    // Step 6: Verify patterns learned
    const patterns = await analyzeTwinPatterns(twin.id);
    expect(patterns.length).toBeGreaterThan(0);

    // Step 7: Verify recommendations generated
    const recs = await generateRecommendations(twin.id);
    expect(recs.length).toBeGreaterThan(0);
  });
});
```

**Status:** ⚠️ PARTIAL (individual steps tested, need full E2E)

---

### 2️⃣ Decision Intelligence Loop Test

```typescript
// ✅ NEEDED: 30-day decision cycle in test
describe('Decision Cycle E2E (30 days simulated)', () => {
  it('should complete: Record → Schedule → Notify → Outcome → Learn → Recommend', async () => {
    const twinId = 'test-twin';
    
    // Day 1: User records decision
    const decision = await recordDecision(twinId, {
      title: 'Career change?',
      options: ['Yes', 'No'],
      context: 'Bored with current role',
      world: 'career',
    });
    expect(decision.id).toBeDefined();

    // Verify follow-up scheduled
    const schedule = await getFollowUpSchedule(decision.id);
    expect(schedule.day30_due).toBeDefined();

    // Day 30: Get overdue follow-up
    // (Mock time forward 30 days in test)
    const overdue = await getOverdueFollowUps(twinId);
    expect(overdue.some(d => d.id === decision.id)).toBe(true);

    // Day 30: Send notification
    // ✅ TODO: Verify notification sent
    const notified = await sendFollowUpNotification(twinId, decision.id, 30);
    expect(notified).toBe(true);

    // Day 30: User records outcome
    const outcome = await recordOutcome(decision.id, {
      context: 'Accepted new position, feeling better',
      impact: 'positive',
    });
    expect(outcome.success).toBe(true);

    // Day 31: System learns
    const patterns = await extractDecisionPatterns(twinId);
    expect(patterns.length).toBeGreaterThan(0);

    // Day 31: Twin updated with patterns
    // ✅ TODO: Verify Twin prompt updated
    const updatedTwin = await fetchTwin(twinId);
    expect(updatedTwin.learningProfile).toBeDefined();

    // Day 31: Next decisions get recommendations
    const recommendation = await generateNextRecommendation(twinId, 'career');
    expect(recommendation).toBeTruthy();
  });
});
```

**Status:** ❌ NOT STARTED (needs Phase 7 notification + learning)

---

### 3️⃣ Authentication Flow Test

```typescript
// ✅ NEEDED: Full auth journey
describe('Auth Flow E2E', () => {
  it('should complete: Passkey registration → Login → Session → Timeout', async () => {
    // Register with passkey
    const registered = await registerPasskey('test@example.com', 'Test User');
    expect(registered.error).toBeUndefined();

    // Sign in with passkey
    const session = await signInWithPasskey('test@example.com');
    expect(session.user?.email).toBe('test@example.com');

    // Verify session stored
    const stored = await fetchStoredSession();
    expect(stored).toBeDefined();

    // Simulate 30 min idle
    // (Mock time in test)
    await wait(SESSION_TIMEOUT_MS);

    // Verify session expired
    const active = await isSessionActive();
    expect(active).toBe(false);

    // User redirected to login
    // (Verify redirect happens)
  });
});
```

**Status:** ⚠️ PARTIAL (passkey works, session timeout not tested)

---

## 📋 Phase 10 Test Checklist

### Critical Paths (Priority P0)
- [ ] Twin Lifecycle E2E (awakening → creation → chat → evolution → learning)
- [ ] Decision 30-day cycle (record → schedule → notify → outcome → learn → recommend)
- [ ] Auth flow with session timeout
- [ ] Payment checkout (free → plus, plus → pro)
- [ ] API error handling (4xx, 5xx responses)

### Unit Tests (Priority P0)
- [ ] Core Awakening Service (essence persistence) ✅
- [ ] Twin Service (CRUD operations)
- [ ] Decision Service (recording, scheduling)
- [ ] SICE Engines (all 12 engines individually)
- [ ] World context routing
- [ ] Memory isolation (world-scoped)
- [ ] Evolution progression
- [ ] Pattern analysis
- [ ] RLS policies (user data isolation)

### Integration Tests (Priority P1)
- [ ] Twin + Memory (save → retrieve)
- [ ] Twin + Evolution (chat interactions trigger stages)
- [ ] Twin + SICE (orchestration of 12 engines)
- [ ] Decision + FollowUp (scheduling + notifications)
- [ ] Decision + Learning (outcome → patterns → recommendations)
- [ ] World + Twin + Memories (context switching)
- [ ] Stripe + Subscription (checkout → webhook → user update)
- [ ] Blog + SEO (article load → indexing)

### Component Tests (Priority P1)
- [ ] ErrorBoundary (catches errors gracefully)
- [ ] TwinChat component (input/output)
- [ ] DecisionForm component (validation)
- [ ] PricingPage component (tier selection)
- [ ] WorldSelector component (switching)

### Security Tests (Priority P0)
- [ ] RLS enforcement (User A cannot read User B data)
- [ ] CSRF token validation
- [ ] Rate limiting (auth endpoints)
- [ ] Input validation (XSS prevention)
- [ ] Session timeout (30 min idle)
- [ ] Stripe PCI compliance (no card data logged)

### Performance Tests (Priority P2)
- [ ] Twin chat response time (<3s)
- [ ] Decision query performance (<500ms)
- [ ] Memory fetch with 100+ items (<1s)
- [ ] SICE orchestration (parallel, <5s)
- [ ] Twin creation (phase 3 + init, <10s)

---

## ❌ Test Gaps (Not Yet Tested)

| Feature | Coverage | Status |
|---------|----------|--------|
| Core Awakening | ✅ 80% | phase3.test.ts exists |
| Twin creation | ⚠️ 50% | basic tests, full E2E missing |
| Twin chat | ⚠️ 60% | response works, learning not tested |
| Evolution | ⚠️ 70% | stage progression tested |
| Decision recording | ⚠️ 70% | recording works, outcome→learning missing |
| Follow-up notifications | ❌ 0% | FollowUpScheduler.triggerFollowUp() unimplemented |
| Pattern learning | ❌ 0% | DecisionLearningService incomplete |
| Recommendations | ❌ 0% | Not implemented yet |
| Stripe checkout | ❌ 0% | No payment tests |
| Auth session timeout | ❌ 0% | Not implemented |
| RLS enforcement | ⚠️ 50% | Policies exist, not tested |
| Error boundaries | ❌ 0% | Component not created |
| Blog article loading | ⚠️ 30% | Content strategy missing |
| Testimonials | ❌ 0% | Component not created |

---

## 🔗 Recommended Test Order

### Week 1: Critical Path (P0)
1. Twin Lifecycle E2E (blocks everything else)
2. Decision 30-day cycle (core monetization feature)
3. Auth + session timeout (security critical)
4. Payment flow (revenue dependent)
5. API error handling (stability)

### Week 2: Unit Tests (P0)
6. All SICE engines individually
7. World routing + memory isolation
8. RLS enforcement tests
9. Input validation tests
10. Rate limiting tests

### Week 3: Integration (P1)
11. Twin + Memory + Evolution together
12. Decision + Learning together
13. Blog + Testimonials loading
14. Stripe webhook verification
15. Email/notification delivery

### Week 4: Performance + Polish (P2)
16. Response time benchmarks
17. Load testing (concurrent users)
18. Component rendering performance
19. Database query optimization
20. Error recovery scenarios

---

## 📍 Test Infrastructure

```typescript
// vitest.config.ts needed
export default {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
      lines: 70,
      functions: 70,
      branches: 65,
      statements: 70,
    },
  },
};

// Run: npm test
// Coverage: npm run test:coverage
// Watch: npm run test:watch
```

---

## 📊 Coverage Goals (Phase 10 End)

| Category | Target | Current | Gap |
|----------|--------|---------|-----|
| Unit tests | 70%+ | ~50% | +20% |
| Integration | 60%+ | ~30% | +30% |
| E2E critical paths | 100% | ~60% | +40% |
| Security tests | 100% | ~20% | +80% |

---

## 🚀 Success Criteria

- ✅ All critical paths have E2E tests
- ✅ Unit test coverage ≥70%
- ✅ RLS policies verified
- ✅ Auth flow includes session timeout
- ✅ Decision loop tests pass (notification + learning)
- ✅ Payment flow tested end-to-end
- ✅ Error cases tested (4xx, 5xx)
- ✅ Performance benchmarks documented

---

**Document:** PHASE_10_TESTING_TH.md  
**Language:** ภาษาไทย | **Concise:** ✅ | **Token:** Managed
