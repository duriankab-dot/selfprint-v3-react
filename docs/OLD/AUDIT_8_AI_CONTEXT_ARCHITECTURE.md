# AUDIT DOCUMENT 8: AI Context Architecture

**How Selfprint builds and uses AI context with Astrovera**

---

## CONTEXT LAYERS

### Layer 1: Immediate Context (Current Request)
```javascript
{
  mood: "ready",
  birthDate: "1990-01-15",
  finetuneAnswers: {
    q1: "ใช้เหตุผล",
    q2: "ไอเดีย",
    q3: "ยืดหยุ่น",
    q4: "ทบทวนตัวเอง"
  },
  timestamp: "2026-08-09T10:30:00Z"
}
```

### Layer 2: Historical Context (Last 30 days)
```javascript
{
  analysisHistory: [
    {
      date: "2026-08-08",
      mood: "confused",
      decisionStyle: "...",
      confidence: 0.80
    },
    // ... more history
  ],
  patternsSeen: [
    "stress → avoidance (frequency: 3)",
    "decision fatigue (frequency: 2)"
  ]
}
```

### Layer 3: Personal Profile Context
```javascript
{
  lifePathNumber: 7,
  birthChart: {
    sunSign: "Cancer",
    moonSign: "Virgo",
    // ... astro data (optional)
  },
  personalityProfile: {
    decisionStyle: "analytical",
    strengths: ["logical", "detail-oriented"],
    blindSpots: ["perfectionism"]
  }
}
```

### Layer 4: Astrovera Memory (Sophisticated)
- Stores: Previous analyses + context + inferences
- Built by: Astrovera memory system
- Used for: Cross-session pattern detection
- Accessed via: Astrovera memory builder

---

## CONTEXT FLOW

```
Request: finetuneAnswers
         ↓
[Load from Supabase]
         ↓
Immediate: Current answers
Historical: Last 30 days of moods/analyses
Profile: Birthdate, Life Path
Memory: Astrovera's stored context
         ↓
[Combine into single context object]
         ↓
Pass to Astrovera orchestrator
         ↓
[Orchestrator routes to domains]
         ↓
Psychology module: Uses immediate + historical + profile
Numerology module: Uses profile + historical
(Optional) Vedic: Uses profile + memory
         ↓
[Synthesis]
         ↓
Response: Enhanced with context evidence
```

---

## CONTEXT BUILDER

**File:** `src/lib/memory-builder.ts`

```typescript
interface ContextPacket {
  immediate: ImmediateContext;
  historical: HistoricalContext;
  profile: PersonalProfile;
  memory: AstrovMemory;
}

async function buildContextFromHistory(
  userId: string,
  currentAnalysis: AnalysisRequest
): Promise<ContextPacket> {
  // 1. Get last 30 days of analyses
  const history = await supabase
    .from('analysis_history')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false });
  
  // 2. Get pattern insights
  const patterns = await supabase
    .from('pattern_insights')
    .select('*')
    .eq('user_id', userId);
  
  // 3. Get user profile
  const profile = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // 4. Call Astrovera memory builder
  const memory = await astrovBrain.buildMemory({
    userId,
    history,
    patterns
  });
  
  return {
    immediate: { mood: ..., answers: ... },
    historical: { pastAnalyses: history, patterns },
    profile,
    memory
  };
}
```

---

## CONTEXT SELECTION

**Not all context needed for every call:**

### For Psychology Analysis
```javascript
Context needed: immediate + historical + profile
Memory: Optional (used for refinement)
```

### For Pattern Detection
```javascript
Context needed: historical + patterns
Memory: Required (for sophisticated detection)
```

### For Decision Support
```javascript
Context needed: profile + immediate + memory
Historical: Optional (patterns already in memory)
```

---

## ASTROVERA MEMORY SYSTEM

**How Astrovera's memory works:**

1. **Stores:** After each analysis
   - User profile + response
   - Inferred patterns + themes
   - Cross-session insights

2. **Retrieves:** Before next analysis
   - Builds rich context
   - Detects contradictions
   - Weights past patterns

3. **Enhances:** Analysis confidence
   - "This pattern appeared 5 times"
   - "Conflicting with previous insights"
   - "Growth detected in this area"

4. **Storage:** Astrovera's Workers/D1
   - Not in Selfprint (stays in Astrovera)
   - Accessed via API call

---

## PRIVACY & SECURITY

✅ **What's stored in Supabase:** Analyses + patterns (owned by user)
✅ **What's stored in Astrovera:** Memory + inferences (needed for AI)
✅ **RLS enabled:** Users only see their own data
✅ **API key secure:** Only in Supabase Edge Functions
✅ **No data duplication:** Each system owns its part

---

## CONTEXT SIZE OPTIMIZATION

**Problem:** Passing 30 days of history to every API call = slow

**Solution:** Selective context

```javascript
// DON'T do this (slow)
const fullContext = {
  all30DaysOfAnalyses: [...],
  allPatterns: [...],
  allMetadata: [...]
};

// DO this (optimized)
const selektiveContext = {
  lastAnalysis: analyses[0],
  topPatterns: patterns.slice(0, 5), // Top 5
  summary: "User shows X patterns",
  memory: astrovMemory // Pre-computed
};
```

---

## CONTEXT VALIDATION

```typescript
function validateContext(ctx: ContextPacket): boolean {
  // Ensure no sensitive data leaks
  if (ctx.memory && ctx.memory.apiKey) throw Error('API key in context!');
  
  // Ensure required fields exist
  if (!ctx.profile.userId) throw Error('Missing user ID');
  
  // Check for consistency
  if (ctx.historical.pastAnalyses.length > 100)
    log.warn('Large history, consider pruning');
  
  return true;
}
```

---

## METRICS TO TRACK

- Context build time: < 200ms
- Context size: < 50KB
- Pattern detection rate: # patterns/week
- Memory hit rate: % of analyses using memory
- Context freshness: Avg age of history

---

**Document Complete** ✅

---

## SUMMARY: All 8 Audit Documents Complete ✅

1. ✅ AUDIT_1_ARCHITECTURE_COMPARISON.md
2. ✅ AUDIT_2_FEATURE_INVENTORY_ASTROVERA.md
3. ✅ AUDIT_3_FEATURE_INVENTORY_SELFPRINT.md
4. ✅ AUDIT_4_GAP_ANALYSIS_MATRIX.md
5. ✅ AUDIT_5_MIGRATION_PLAN.md
6. ✅ AUDIT_6_TARGET_ARCHITECTURE.md
7. ✅ AUDIT_7_DATA_MIGRATION_PLAN.md
8. ✅ AUDIT_8_AI_CONTEXT_ARCHITECTURE.md

**Ready for:** APPROVE MIGRATION command
