# Phase A.2: Verification & Performance Testing

**Status:** Starting after Phase A.1 commit  
**Timeline:** 3-4 days  
**Objective:** Verify all Phase A.1 changes work correctly in real conditions

---

## A.2.1 Unit Test Verification (Day 1)

### Test Suite Target: DynamicValueCalculator

```bash
npm test -- src/services/DynamicValueCalculator.test.ts
```

**Tests to verify:**

1. **calculateMaturityScore()**
   - [ ] Returns 100 when userUnderstanding=100
   - [ ] Returns 10 (not 30) when no data
   - [ ] Averages multiple components correctly
   - [ ] Clamps to 0-100 range
   - [ ] Insight count scaling works (10 insights = 100%)

2. **calculateSICEEngineScore()**
   - [ ] Uses engineConfidence if available
   - [ ] Falls back to user understanding + analysis depth
   - [ ] Returns 20 (not 50) when no data
   - [ ] Different engines can have different scores

3. **calculateAnalysisDepth()**
   - [ ] Insight count component: 10+ = 100%
   - [ ] Time component: 5+ minutes = 100%
   - [ ] Averages multiple sources
   - [ ] Edge cases (0 minutes, 0 insights) = 0%

4. **shouldUseCalculatedDefault()**
   - [ ] Returns true for empty SICE results
   - [ ] Returns false if has engine results
   - [ ] Returns false if has insights
   - [ ] Returns false if has userUnderstanding

### Test Suite Target: VisualDNAService

```bash
npm test -- src/services/VisualDNAService.test.ts
```

**Tests to verify:**

1. **generateVisualDNA()**
   - [ ] Same birthDate + archetypes = same visual DNA
   - [ ] Different birth dates = different colors
   - [ ] Accessories array not empty
   - [ ] Maturity score affects animation speed (0.8-1.2x)
   - [ ] Valid color hex format (#RRGGBB)

2. **Color helpers**
   - [ ] hslToHex(0, 100, 50) = red-like color
   - [ ] lightenColor() increases RGB values
   - [ ] hexToRgb() parses valid hex
   - [ ] rgbToHex() creates valid hex

---

## A.2.2 Database Migration Verification (Day 1)

### Run Migration

```bash
supabase start
```

**Verify:**
- [ ] Migration 20260825_004 runs without errors
- [ ] twin_visual_dna table created
- [ ] All columns present (color_primary, style, accessories, etc.)
- [ ] RLS policies active
- [ ] Indexes created (twin_id, user_id)

### Quick SQL Check

```sql
-- In Supabase Studio
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'twin_visual_dna';

-- Should return 1 row

SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'twin_visual_dna';

-- Should return 2 rows (twin_id, user_id)
```

---

## A.2.3 E2E Integration Testing (Day 2)

### Test Scenario 1: New Twin Creation

```
USER JOURNEY:
1. Login
2. Start analysis (5+ questions answered)
3. Complete Twin birth
4. Verify Twin properties
```

**Database Checks:**
```sql
-- After Twin birth, run:
SELECT 
  t.id, 
  t.maturity_score as actual_maturity,
  ts.contribution_score as sice_score,
  vd.color_primary as visual_dna_exists
FROM twins t
LEFT JOIN twin_sice_scores ts ON t.id = ts.twin_id
LEFT JOIN twin_visual_dna vd ON t.id = vd.twin_id
WHERE t.user_id = 'YOUR_USER_ID'
ORDER BY t.awakened_at DESC
LIMIT 1;
```

**Assertions:**
- [ ] maturity_score IS NOT 30 (should be 10-100 based on analysis)
- [ ] All SICE scores NOT 50 (should be 20-100)
- [ ] visual_dna row exists (not null)
- [ ] color_primary is valid hex (#RRGGBB)

---

### Test Scenario 2: Twin Persistence Across Worlds

```
USER JOURNEY:
1. Create Twin
2. Record Twin's visual characteristics
3. Navigate through all 12 worlds
4. Return to each world
5. Verify Twin looks identical
```

**What to Check:**
- [ ] Twin visual colors consistent across worlds
- [ ] Twin accessories same in SELF, MIND, CAREER worlds
- [ ] Base expression same when switching worlds
- [ ] Animation speed consistent

---

### Test Scenario 3: Maturity Score Evolution

```
USER JOURNEY:
1. Create Twin (analysis = shallow, maturity = low ~20-30)
2. Have 5-10 messages with Twin
3. Add more insights to analysis
4. Observe maturity increase
```

**What to Check:**
- [ ] New Twin: maturity = 10-30 (incomplete)
- [ ] After interaction: maturity = 30-50
- [ ] After more analysis: maturity = 50-70+
- [ ] Maturity increases progressively (not suddenly)

---

## A.2.4 Performance Verification (Day 2)

### Measurement: Twin Creation Time

```bash
# Run Playwright test with timing
npm run test:e2e -- twin-creation.test.ts --reporter=verbose
```

**Baseline (from Phase A):** 2.4 seconds  
**Target for A.2:** ≤2.5 seconds (added Visual DNA ops)  
**Acceptable:** ≤2.8 seconds (small regression ok)

**Measured Components:**
- [ ] SICE orchestration: ~1.0-1.2s
- [ ] Twin DB insert: ~0.1s
- [ ] Essence save: ~0.1s
- [ ] SICE scores batch: ~0.1s
- [ ] Memory insert: ~0.1s
- [ ] **Visual DNA generation + save: ~0.1s** (NEW)
- [ ] Total: should stay ~2.4s (parallel ops)

**If Regression Occurs (>2.8s):**
- [ ] Profile with DevTools
- [ ] Check database query performance
- [ ] Verify indexes on twin_visual_dna
- [ ] Consider moving Visual DNA save out of critical path

---

### Measurement: Visual DNA Retrieval

```javascript
// Measure time to fetch Visual DNA
const start = performance.now();
const visualDNA = await getVisualDNA(twinId);
const elapsed = performance.now() - start;
console.log(`Visual DNA retrieval: ${elapsed}ms`);
```

**Target:** <50ms  
**Acceptable:** <100ms

---

## A.2.5 Security & Data Integrity (Day 3)

### Cross-User Isolation Test

```sql
-- Verify user A cannot see user B's visual DNA
-- As User A:
SELECT * FROM twin_visual_dna 
WHERE user_id != 'USER_A_ID';
-- Should return 0 rows

-- As User B:
SELECT * FROM twin_visual_dna 
WHERE user_id != 'USER_B_ID';
-- Should return 0 rows
```

**Assertion:**
- [ ] RLS policy blocks cross-user access
- [ ] Each user sees only own Twin visual DNA

---

### Data Consistency Test

```sql
-- Verify every Twin has Visual DNA
SELECT 
  t.id,
  t.maturity_score,
  vd.id as visual_dna_id
FROM twins t
LEFT JOIN twin_visual_dna vd ON t.id = vd.twin_id
WHERE vd.id IS NULL;
-- Should return 0 rows (all Twins have Visual DNA)
```

**Assertion:**
- [ ] No orphaned Twins (all have Visual DNA)
- [ ] No orphaned Visual DNA (all linked to Twin)

---

### Determinism Test

```javascript
// Verify same input = same output
const dna1 = generateVisualDNA({
  birthDate: '1990-05-15',
  primaryArchetype: 'sage',
  secondaryArchetype: 'explorer',
  maturityScore: 50
});

const dna2 = generateVisualDNA({
  birthDate: '1990-05-15',
  primaryArchetype: 'sage',
  secondaryArchetype: 'explorer',
  maturityScore: 50
});

assert(JSON.stringify(dna1) === JSON.stringify(dna2));
```

**Assertion:**
- [ ] Color values identical
- [ ] Accessories array identical
- [ ] Metadata identical

---

## A.2.6 Documentation Verification (Day 3)

### Code Documentation Check
- [ ] DynamicValueCalculator has JSDoc comments
- [ ] VisualDNAService has function documentation
- [ ] Edge cases documented (e.g., "returns 10 if no data")
- [ ] Parameters and return types documented

### Migration Documentation
- [ ] Migration file has clear comments
- [ ] Table purpose documented
- [ ] Column purposes documented
- [ ] RLS policy logic explained

### README/Runbook Update
- [ ] Add "Visual DNA" section to architecture docs
- [ ] Document scoring methodology
- [ ] Explain deterministic generation
- [ ] Add troubleshooting section

---

## A.2.7 Regression Testing (Day 4)

### Full Test Suite

```bash
npm test
npm run test:e2e
```

**Check for regressions:**
- [ ] All existing tests still pass
- [ ] No new TypeScript errors
- [ ] No new lint warnings
- [ ] Build still passes

**Priority regressions to watch:**
- [ ] Twin creation flow (most critical)
- [ ] SICE orchestration (confidence scoring)
- [ ] Twin context/state management
- [ ] World routing (uses Twin metadata)

---

## A.2.8 Sign-Off Checklist

### Code Quality
- [x] TypeScript build passes
- [x] No type errors
- [ ] All unit tests pass
- [ ] All E2E tests pass

### Database
- [x] Migration created
- [ ] Migration runs successfully
- [ ] RLS policies enforced
- [ ] Data consistency verified

### Performance
- [ ] Twin creation <2.8s (was 2.4s)
- [ ] Visual DNA retrieval <100ms
- [ ] No memory leaks
- [ ] No query performance regressions

### Security
- [ ] Cross-user isolation works
- [ ] RLS prevents unauthorized access
- [ ] No SQL injection vulnerabilities
- [ ] Secrets not in code/migrations

### Documentation
- [ ] Code comments complete
- [ ] Migration documented
- [ ] Architecture updated
- [ ] Troubleshooting guide written

### Verification
- [ ] New Twin maturity ≠ 30
- [ ] SICE scores ≠ 50
- [ ] Visual DNA persists across loads
- [ ] Visual DNA deterministic

---

## Commands to Run (In Order)

**Day 1:**
```bash
npm test
supabase start
```

**Day 2:**
```bash
npm run test:e2e
# Manual UI testing (create Twin, verify metrics)
```

**Day 3:**
```bash
npm test && npm run build
# Database verification (SQL checks)
```

**Day 4:**
```bash
npm test
npm run test:e2e
npm run build
```

---

## Success Criteria

**Phase A.2 is COMPLETE when:**

1. ✅ All unit tests pass
2. ✅ All E2E tests pass
3. ✅ Database migration runs without errors
4. ✅ New Twin maturityScore ≠ 30 (calculated from data)
5. ✅ SICE baseline scores ≠ 50 (per-engine calculated)
6. ✅ Visual DNA persists across page reloads
7. ✅ Performance regression <10% (2.4s → <2.64s)
8. ✅ Security checks pass (RLS, cross-user isolation)
9. ✅ Documentation complete

---

**Estimated Timeline:** 3-4 days of testing  
**Next Phase:** Phase A.3 (Mobile & Polish)

---

**Start Date:** After Phase A.1 commit ✅  
**Current Date:** Ready to begin
