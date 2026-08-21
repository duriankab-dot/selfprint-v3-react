# P0-A: Restore Lifecycle — Implementation Plan
**Created:** 2026-08-21  
**Status:** Ready to implement  
**Branch:** p0-a/restore-lifecycle

---

## MISSION
Link Full Analysis → Core Awakening → Twin Birth → World Routing  
Make Twin intelligent + World Routing full-screen

---

## CURRENT CODE STATE (from audit)

### Exists:
✅ TwinHologramBirth.tsx  
✅ WorldSelector.tsx  
✅ TwinEvolutionDisplay.tsx  
✅ Components but NOT CONNECTED  

### Missing:
❌ Core Awakening ceremony component  
❌ Connection logic between phases  
❌ Lifecycle state management  
❌ Twin grounding with onboarding/analysis data  

---

## STEP-BY-STEP IMPLEMENTATION

### 1. UNDERSTAND CURRENT FLOW
- [ ] Read App.tsx routing
- [ ] Check analysis.store.ts state
- [ ] Check onboarding.store.ts data
- [ ] Check twin.service.ts initialization

### 2. CREATE CORE AWAKENING COMPONENT
```typescript
src/components/CoreAwakeningCeremony.tsx
- Display analysis insights
- Show "Your intelligence core is ready"
- Trigger transition to Twin Birth
- Pass grounded context to Twin
```

### 3. IMPLEMENT GROUNDED TWIN BIRTH
```typescript
src/services/twin.service.ts
- Input: {onboarding, analysis, sice}
- Output: Twin with grounded identity
- NO stubs, NO placeholders
```

### 4. VERIFY WORLD ROUTING
```typescript
src/components/WorldSelector.tsx + /worlds/:world_id
- Full-screen experience
- 12 worlds accessible
- Twin context per world
```

### 5. TESTS
```bash
E2E: Login → Analysis → Core Awakening → Twin Birth → Worlds
Unit: Each component works
Integration: Data flows correctly
```

---

## FILES TO CREATE/MODIFY

**Create:**
- src/components/CoreAwakeningCeremony.tsx (new)
- src/lib/prompts/twin-prompt-builder.ts (new)
- tests/e2e/lifecycle.spec.ts (new)

**Modify:**
- src/App.tsx (add routing)
- src/services/twin.service.ts (implement grounding)
- src/stores/ (lifecycle state)

---

## VERIFICATION (5-layer)
- [ ] TypeScript: npm run type-check
- [ ] Unit: npm run test:unit
- [ ] Integration: npm run test:integration
- [ ] E2E: npm run test:e2e
- [ ] Build: npm run build

---

## NEXT SESSION MUST:
1. Clone repo
2. Create branch: p0-a/restore-lifecycle
3. Start with Step 1 (understand current flow)
4. Implement systematically per steps above
5. Verify each layer before commit

**Estimated time: 6-8 hours**
