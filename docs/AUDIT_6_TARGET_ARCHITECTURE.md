# AUDIT DOCUMENT 6: Target Architecture

**Post-integration system design**

---

## SYSTEM DIAGRAM

```
USER (Selfprint.one)
        ↓
┌─────────────────────────────────────┐
│  SELFPRINT FRONTEND (React 19)      │
│  - Landing page (MEMO V2)           │
│  - Onboarding (MEMO V4)             │
│  - Dashboard + Journal              │
│  - Navigation (Selfprint only)      │
│  - Styling (Tailwind)               │
│  - State (Zustand)                  │
└─────────────────────────────────────┘
        ↓ (fetch)
┌─────────────────────────────────────┐
│  SUPABASE EDGE FUNCTIONS            │
│  /functions/v1/intelligence/*       │
│  - Holds ASTROVERA_API_KEY          │
│  - Transforms requests/responses    │
│  - Error handling + fallback        │
│  - Caching layer                    │
└─────────────────────────────────────┘
        ↓ (HTTPS)
┌─────────────────────────────────────┐
│  INTELLIGENCE ADAPTER LAYER         │
│  src/lib/astrovera-adapter.ts       │
│  - Data transformation              │
│  - Type safety (TypeScript)         │
│  - Zero Astrovera imports in React  │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  ASTROVERA BRAIN GATEWAY            │
│  (D:\astrovera-v2\brain)            │
│                                     │
│  Gateway → Orchestrator             │
│  Routes requests to domains         │
│  Calls: Psychology, Numerology, ... │
│  Builds: Memory context             │
│  Returns: Synthesized response      │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  KNOWLEDGE MODULES                  │
│  - Psychology (Decision Archetype)  │
│  - Numerology (Life Path)           │
│  - Optional: Vedic, Human Design... │
│  - Calls Anthropic Claude API       │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  ANTHROPIC CLAUDE (API)             │
│  - Model: claude-haiku-4-5          │
│  - Each knowledge module calls once │
│  - Max tokens: 800 per call         │
└─────────────────────────────────────┘
        ↓ (response flows back)
┌─────────────────────────────────────┐
│  MEMORY SYSTEM (Astrovera)          │
│  - Stores: context, history, memory │
│  - Used for: next analysis (richer) │
│  - Persistence: D1 / file storage   │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  HISTORY & ANALYTICS                │
│  Supabase Tables:                   │
│  - analysis_history (all results)   │
│  - pattern_insights (detected)      │
│  - session_logs (audit)             │
└─────────────────────────────────────┘
```

---

## DATA FLOW: Complete Example

### Scenario: User completes onboarding

**Step 1: Frontend collects data**
```
User selects mood: "ready"
User enters birthdate: 1990-01-15
User answers fine-tuning questions:
  q1: "ใช้เหตุผล" (logic)
  q2: "ไอเดีย" (ideas)
  q3: "ยืดหยุ่น" (flexible)
  q4: "ทบทวนตัวเอง" (reflection)
```

**Step 2: Frontend calls Intelligence Service**
```typescript
const response = await fetch('/functions/v1/intelligence/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mood: 'ready',
    birthDate: '1990-01-15',
    finetuneAnswers: { q1, q2, q3, q4 }
  })
})
```

**Step 3: Adapter transforms to Astrovera format**
```javascript
// src/lib/astrovera-adapter.ts
const astrovRequest = buildAnalysisRequest({
  mood: 'ready',
  birthDate: '1990-01-15',
  finetuneAnswers: { q1, q2, q3, q4 }
});
// Returns: {
//   psychology: { archKey: "analyst", phase: "reflection", ... },
//   numerology: { lifePathNum: 7 },
//   mood: "ready"
// }
```

**Step 4: Edge Function calls Astrovera Brain**
```javascript
// supabase/functions/intelligence/analyze.ts
const astrovResponse = await callAstoveraBrain(astrovRequest, {
  apiKey: env.ASTROVERA_API_KEY
});
// Calls: Gateway → Orchestrator → Psychology module → Claude
// Returns: {
//   psychology: { decisionStyle: "...", confidence: 0.90 },
//   numerology: { meaning: "...", confidence: 0.75 }
// }
```

**Step 5: Adapter transforms back to Selfprint format**
```javascript
const selfprintResponse = transformAnalysisResponse(astrovResponse);
// Returns: {
//   decisionStyle: "นักวิเคราะห์ผู้ใจเย็น",
//   strengths: ["ความเป็นตัวของตัวเอง", "ผู้ที่ใจเย็น"],
//   insights: ["คิดอย่างสมดุล", "ใจเย็นเวลาวุ่น"],
//   opportunities: ["ยืดหยุ่นมากขึ้น", "แสดงความรู้สึก"],
//   confidence: { overall: 0.85, sources: {...} }
// }
```

**Step 6: Frontend displays (identical UI)**
```
Blueprint card shows:
- Decision Style: "นักวิเคราะห์ผู้ใจเย็น"
- Strengths: [...]
- Insights: [...]
- Accuracy: 85% (amber → green)
```

**Step 7: Store in Supabase**
```
INSERT INTO analysis_history {
  user_id, analysis_type: "initial",
  data: { full response },
  confidence: 0.85,
  created_at: now()
}
```

**Step 8: Astrovera stores memory**
```
Save to D1 / file storage:
- User context + response
- Used for next analysis (richer)
```

---

## FILE STRUCTURE (Post-Integration)

```
D:\selfprint-v3-react\
├── src\
│   ├── components\
│   │   ├── onboarding\
│   │   │   ├── InitialBlueprint.tsx (UNCHANGED)
│   │   │   ├── FinetuningQuestions.tsx (UNCHANGED)
│   │   │   ├── FullAnalysis.tsx (UNCHANGED)
│   │   │   └── ...
│   │   └── ...
│   ├── lib\
│   │   ├── types\
│   │   │   └── astrovera.ts (NEW)
│   │   │       // AnalysisRequest, AnalysisResponse, etc.
│   │   ├── astrovera-adapter.ts (NEW)
│   │   │   // buildAnalysisRequest(), transformAnalysisResponse()
│   │   ├── memory-builder.ts (NEW)
│   │   │   // buildContextFromHistory()
│   │   └── anthropic.ts (MODIFIED)
│   │       // Use adapter instead of direct calls
│   ├── pages\
│   │   ├── Onboarding.tsx (MODIFIED - minimal)
│   │   │   // Call /functions/v1/intelligence instead of /api/nova
│   │   └── ...
│   ├── store\
│   │   └── userStore.ts (EXTENDED)
│   │       // Add fields: analysisHistory, patterns, confidence
│   └── ...
├── supabase\
│   ├── migrations\
│   │   ├── 001_analysis_history.sql (NEW)
│   │   ├── 002_pattern_insights.sql (NEW)
│   │   └── 003_session_logs.sql (NEW)
│   └── functions\
│       └── intelligence\
│           ├── index.ts (NEW - router)
│           ├── analyze.ts (NEW - psychology + numerology)
│           ├── patterns.ts (NEW - journal pattern detection)
│           ├── decide.ts (NEW - decision support)
│           └── shared\
│               ├── adapter.ts (COPY of src/lib/astrovera-adapter.ts)
│               └── types.ts (COPY of src/lib/types/astrovera.ts)
├── docs\
│   ├── AUDIT_1_ARCHITECTURE_COMPARISON.md
│   ├── AUDIT_2_FEATURE_INVENTORY_ASTROVERA.md
│   ├── AUDIT_3_FEATURE_INVENTORY_SELFPRINT.md
│   ├── AUDIT_4_GAP_ANALYSIS_MATRIX.md
│   ├── AUDIT_5_MIGRATION_PLAN.md
│   ├── AUDIT_6_TARGET_ARCHITECTURE.md (this file)
│   ├── AUDIT_7_DATA_MIGRATION_PLAN.md
│   ├── AUDIT_8_AI_CONTEXT_ARCHITECTURE.md
│   └── API_CONTRACTS.md (NEW)
└── ...
```

---

## KEY ARCHITECTURAL PRINCIPLES

1. **Decoupling:** Selfprint never imports Astrovera code
2. **Layering:** Intelligence adapter sits between frontend + backend
3. **Fallback:** Life Path always available if Astrovera down
4. **Type Safety:** TypeScript prevents data shape violations
5. **Immutability:** No UI/branding/nav from Astrovera
6. **Caching:** Recent analyses cached in Supabase
7. **Monitoring:** Every call logged + metrics tracked

---

**Document Complete** ✅
