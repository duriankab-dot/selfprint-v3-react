# 🧠 12 SICE CORES EXTRACTION PLAN
**Extract Nathan Chart + Hexagram from Astrovera v2 → SelfPrint v3**

**Version**: 1.0 | **Date**: 2026-08-07 | **Status**: Planning

---

## 📋 Overview

### Goal
Extract 2 NEW knowledge modules (Nathan Chart + Hexagram) that already exist in Astrovera v2 codebase, integrate into SelfPrint's 12 SICE cores system.

### Why These 2?
- ✅ Logic + data structures exist in Astrovera v2
- ✅ Support decision-making + pattern recognition
- ✅ Complement existing 10 modules for holistic intelligence
- ✅ Fill knowledge gaps for Activities & Impact hubs

---

## 🔍 SICE 11: NATHAN CHART

### What It Is
**Nathan chart** (Node-based consequence mapping) = Predictive decision modeling using node relationships + weighted outcomes.

### Current State in Astrovera
**Location**: `D:\astrovera-v2\brain\knowledge\` (likely in decision/prediction modules)

**Data Structure** (assumed):
```javascript
{
  userId,
  decisionNode: {
    id, label, context,
    options: [
      {
        id, label, 
        consequences: [
          { nodeId, weight (0-1), impact, timeline }
        ]
      }
    ]
  },
  predictions: [
    { optionId, probability, confidence, reasoning }
  ]
}
```

### Integration Path
1. **Extract**: Copy logic from Astrovera decision engine
2. **Normalize**: Convert to SelfPrint knowledge module format
3. **SelfPrint Use**: 
   - **Decision Hub**: "Show me the nodes" (consequence mapping)
   - **Career Hub**: "What's the ripple effect?" (long-term impact)
   - **Impact Hub**: "How does this scale?" (leverage points)

### Success Criteria
- ✅ Can predict 2-3 consequence chains per decision
- ✅ Confidence score (0-100) for each prediction
- ✅ Integrates with Nova's "reasoning display"

---

## 🔍 SICE 12: HEXAGRAM (I Ching Patterns)

### What It Is
**Hexagram** (I Ching interpretation) = 64 patterns mapping to life situations, transitions, hidden dynamics.

### Current State in Astrovera
**Location**: `D:\astrovera-v2\brain\knowledge\` (likely in spirituality/pattern modules)

**Data Structure** (assumed):
```javascript
{
  hexagramId: (1-64),
  name: "Hexagram 3: Difficulty at the Beginning",
  meaning: "Growth through challenge",
  lines: [ line1, line2, line3, line4, line5, line6 ], // changing/stable
  context: {
    relationship, career, health, finance, spiritual
  },
  interpretation: {
    currentSituation: "...",
    advice: "...",
    warning: "...",
    timing: "..."
  }
}
```

### Integration Path
1. **Extract**: Copy hexagram library (64 patterns) from Astrovera
2. **Normalize**: SelfPrint knowledge module format
3. **SelfPrint Use**:
   - **Spirituality Hub**: "What pattern are you in?" (life situation mapping)
   - **Reflective Mood**: "I Ching reading" (wisdom retrieval)
   - **Relationship Hub**: "What's the dynamic?" (pattern recognition)

### Success Criteria
- ✅ Can map user situation to 2-3 relevant hexagrams
- ✅ Provides current/advice/warning interpretation
- ✅ Works in Reflective + Spirituality contexts

---

## 🛠️ EXTRACTION CHECKLIST

### Step 1: Locate Files (Phase 1)
- [ ] Search `D:\astrovera-v2\brain\knowledge\` for decision/prediction logic
- [ ] Locate Nathan chart data structures + algorithms
- [ ] Search for I Ching/hexagram patterns + interpretation
- [ ] Identify dependencies (other modules, data formats)

### Step 2: Extract Logic (Phase 1)
- [ ] Copy Nathan chart functions → `D:\selfprint-v3-react\src\lib\knowledge\nathan-chart.js`
- [ ] Copy hexagram library → `D:\selfprint-v3-react\src\lib\knowledge\hexagrams.js`
- [ ] Map data structures to SelfPrint format
- [ ] Add TypeScript types

### Step 3: Create Knowledge Modules (Phase 1)
- [ ] `buildPrompt()` for Nathan chart
- [ ] `buildPrompt()` for hexagrams
- [ ] `validate()` for both (ensure output format)
- [ ] Test on 5 sample inputs

### Step 4: Integrate with Hub × Mood (Phase 2)
- [ ] Activities hub: Nathan chart for habit-building
- [ ] Spirituality hub: Hexagrams for pattern recognition
- [ ] Impact hub: Nathan chart for ripple analysis
- [ ] Decision hub: Both for deeper clarity

### Step 5: Test + Verify (Phase 2)
- [ ] Unit tests for both modules
- [ ] Integration test: Nova calls both in Spirituality hub
- [ ] Quality check: Outputs make sense for user

---

## 📊 DEPENDENCIES & RISKS

### Dependencies
- Nathan chart: Requires user decision history (available in Supabase)
- Hexagrams: Requires user birthdate + current situation (available in onboarding)

### Risks
- ❌ Nathan chart complexity might slow response times
- ❌ Hexagram interpretations might feel too mystical (need clear grounding)
- ❌ Data extraction from Astrovera might have migration issues

### Mitigation
- ✅ Cache hexagram library (read-only)
- ✅ Limit Nathan chart to top 3 nodes (simplicity)
- ✅ Ground hexagrams in practical interpretation ("Here's what this means for your situation")

---

## 🚀 TIMELINE

| Phase | Task | Duration | Owner |
|-------|------|----------|-------|
| Phase 1 (NOW) | Locate + extract files | 2-3 days | Backend/AI |
| Phase 1 | Build knowledge modules | 3-4 days | Backend |
| Phase 2 | Hub × Mood integration | 2-3 days | Backend/Frontend |
| Phase 2 | Testing + refinement | 2 days | QA |

**Total**: 9-12 days (fits within Phase 1→2 timeline)

---

## 📝 SUCCESS DEFINITION

✅ Phase 1 COMPLETE when:
- 12 SICE cores extracted + documented
- Nathan chart + hexagrams accessible via API
- Integration plan locked for Phase 2
- Team alignment on Activities hub archetype

---

**Status**: 📋 Ready for extraction kickoff  
**Next**: Identify exact file locations in Astrovera v2 → Begin extraction
