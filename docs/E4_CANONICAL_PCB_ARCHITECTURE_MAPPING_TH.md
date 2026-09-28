# E4 — CANONICAL PCB ARCHITECTURE MAPPING

**วันที่สร้าง:** 28 กันยายน 2026  
**HEAD:** `b5ec988` @ `master`  
**สถานะ:** FORENSIC MAPPING ONLY — ไม่ใช่ implementation plan  
**วัตถุประสงค์:** ระบุ canonical model, field provenance, caller migration path, cache location — เพื่อให้ Owner ตัดสินใจก่อนอนุมัติ implementation

---

## 1. OWNER CONSTRAINTS (LOCKED)

| # | Constraint | Implication for Mapping |
|---|------------|------------------------|
| 1 | **PCB source of truth = canonical domain เดียว** | Single `PersonalContext` interface is source of truth; both implementations map to it |
| 2 | **Existing callers = รักษา compatibility ผ่าน adapter** | No breaking changes to 10 callers; adapter layer translates canonical → caller shape |
| 3 | **World personality = อย่าทิ้ง SICE behavior** | World-aware fields (`worldPersonality`, `worldFocus`, `strengthAreas`, `growthAreas`) must be preserved in canonical model |
| 4 | **Persistence = อย่าเอาออกจาก lib capability** | Lib persistence methods (`initialize`, `updateFromReflection`, DB writes) remain available; not removed without proof |
| 5 | **Migration = phased ไม่ใช่ big-bang** | Stepwise: canonical model → adapters → caller migration (one-by-one) → cache consolidation |
| 6 | **confidenceOverall 0–1 vs 0–100 = trace callers first** | Data-contract decision deferred until all callers analyzed |
| 7 | **No immediate single-file merge** | Two implementations remain separate; canonical model sits above both |

---

## 2. CANONICAL PERSONALCONTEXT MODEL

### 2.1 Unified Interface (Source of Truth)

```typescript
// src/types/personalContext.ts (NEW — canonical domain)
export interface CanonicalPersonalContext {
  // Identity
  userId: string;

  // === LIB DOMAIN (persistence + inference) ===
  values: Value[];                    // from lib PersonalContext.values
  goals: Goal[];                      // from lib PersonalContext.goals
  strengths: Strength[];              // from lib PersonalContext.strengths
  blindSpots: BlindSpot[];            // from lib PersonalContext.blindSpots
  emotionalRange: EmotionalRange;     // from lib PersonalContext.emotionalRange
  decisionStyle: DecisionStyle;       // from lib PersonalContext.decisionStyle
  relationships: Relationship[];      // from lib PersonalContext.relationships
  confidenceOverall: number;          // 0-1 normalized (lib scale)
  sourceCount: number;                // lib: personal_context entry count
  lastUpdated: Date;
  modelVersion: number;

  // === SICE DOMAIN (world adaptation) ===
  emotionalState: string;             // SICE: 'optimistic'|'focused'|'balanced'|...
  currentGoals: string[];             // SICE: string[] from goals_json/focus_areas
  activePatterns: string[];           // SICE: pattern strings with success rates
  worldFocus: string;                 // SICE: currentWorld or 'self'
  recentMemories: Array<{ timestamp: string; content: string }>;  // SICE: twin_memories
  strengthAreas: string[];            // SICE: world_ids with high engagement
  growthAreas: string[];              // SICE: world_ids with low/no engagement
  worldPersonality?: {                // SICE: world-specific adaptation
    mood: string;
    responseStyle: string;
    focusArea: string;
  };

  // === BRIDGE FIELDS (computed from both) ===
  hubsActive?: string[];              // lib: hubsActive / SICE: derived from worldStats
  birthDate?: string;                 // lib: from onboarding / SICE: from users_profiles

  // === META ===
  _provenance: {
    libFields: string[];              // which fields came from lib builder
    siceFields: string[];             // which fields came from SICE builder
    mergedAt: string;                 // ISO timestamp
  };
}
```

### 2.2 Field Provenance Matrix

| Canonical Field | Source Builder | Source Method | DB Table | Notes |
|-----------------|----------------|---------------|----------|-------|
| `userId` | Both | Input param | — | Primary key |
| `values[]` | **Lib** | `extractValues()` | `personal_context` (context_type='value') | Rich objects with confidence, evidence |
| `goals[]` | **Lib** | `extractGoals()` | `personal_context` (context_type='goal') | Rich objects |
| | **SICE** | `fetchUserGoals()` | `users_profiles.goals_json` | String[] — simpler |
| `strengths[]` | **Lib** | `extractStrengths()` | `personal_context` (context_type='strength') | Rich objects |
| | **SICE** | `fetchWorldAreas()` → `strengthAreas` | `world_stats` | World IDs only |
| `blindSpots[]` | **Lib** | `extractBlindSpots()` | `personal_context` (context_type='blind_spot') | Unique to lib |
| `emotionalRange` | **Lib** | `extractEmotionalRange()` | `personal_context` (context_type='emotional_range') | Structured object |
| | **SICE** | `inferEmotionalState()` | `twin_memories` (content analysis) | String enum |
| `decisionStyle` | **Lib** | `extractDecisionStyle()` | `personal_context` (context_type='decision_style') | Unique to lib |
| `relationships[]` | **Lib** | `extractRelationships()` | — (stub) | Unique to lib |
| `confidenceOverall` | **Lib** | `calculateOverallConfidence()` | Computed from entries | 0-1 scale |
| `sourceCount` | **Lib** | `entries.length` | `personal_context` count | Unique to lib |
| `emotionalState` | **SICE** | `inferEmotionalState()` | `twin_memories` | String enum |
| `currentGoals[]` | **SICE** | `fetchUserGoals()` | `users_profiles.goals_json` | String[] |
| `activePatterns[]` | **SICE** | `fetchActivePatterns()` | `decision_patterns` | String[] with success % |
| `worldFocus` | **SICE** | `input.currentWorld` | — | Runtime context |
| `recentMemories[]` | **SICE** | `fetchRecentMemories()` | `twin_memories` | Timestamp + content |
| `strengthAreas[]` | **SICE** | `fetchWorldAreas()` | `world_stats` | World IDs |
| `growthAreas[]` | **SICE** | `fetchWorldAreas()` | `world_stats` | World IDs |
| `worldPersonality` | **SICE** | `getWorldPersonality()` | `worldPersonalities` constant | Unique to SICE |
| `hubsActive[]` | **Lib** | `request.hubsActive` | `personal_profiles.hubs_active` | |
| | **SICE** | Derived from `world_stats` | `world_stats` | Alternative source |
| `birthDate` | **Lib** | `request.birthDate` | `personal_profiles.birth_date` | |
| | **SICE** | `users_profiles` | `users_profiles.date_of_birth` | Alternative source |

### 2.3 Conflict Resolution Rules

| Conflict | Resolution |
|----------|------------|
| `goals[]` (lib: Goal[] vs SICE: string[]) | Canonical keeps **both**: `goals: Goal[]` (lib) + `currentGoals: string[]` (SICE) — different semantic levels |
| `strengths[]` (lib: Strength[] vs SICE: string[]) | Canonical keeps **both**: `strengths: Strength[]` (lib) + `strengthAreas: string[]` (SICE) |
| `emotionalRange` (lib: object) vs `emotionalState` (SICE: string) | Canonical keeps **both** — different granularity |
| `confidenceOverall` (lib: 0-1) vs SICE confidence (0-100) | **DEFERRED** — trace callers first (data-contract) |
| Duplicate `hubsActive` / `birthDate` | Prefer **Lib** as primary (persistence layer); SICE as fallback |

---

## 3. CALLER MIGRATION MAP (10 Callers)

### 3.1 Caller Inventory

| # | Caller | File | Current Builder | Current Key | Current Shape Expected | Migration Strategy |
|---|--------|------|-----------------|-------------|------------------------|-------------------|
| 1 | `useTwinIdentity` | `useTwinIdentity.ts:120-128` | Lib | `['personalContext', userId]` | Lib `PersonalContext` | Adapter: canonical → lib shape |
| 2 | `IntelligencePanel` | `IntelligencePanel.tsx:84` | Lib | `['personalContext', userId]` | Lib `PersonalContext` | Adapter: canonical → lib shape |
| 3 | `ExecutiveSummary` | `ExecutiveSummary.tsx:84` | Lib | `['personalContext', userId]` | Lib `PersonalContext` | Adapter: canonical → lib shape |
| 4 | `DecisionLogger` | `DecisionLogger.tsx:72` | Lib | `['personalContext', userId]` | Lib `PersonalContext` | Adapter: canonical → lib shape |
| 5 | `TwinEvolution` | `TwinEvolution.tsx:92` | Lib | `['personalContext', userId]` | Lib `PersonalContext` | Adapter: canonical → lib shape |
| 6 | `AnalysisPage` | `AnalysisPage.tsx:177` | Lib | `['personalContext', userId]` | Lib `PersonalContext` | Adapter: canonical → lib shape |
| 7 | `IntelligenceHub` | `IntelligenceHub.tsx:94` | Lib | `['personalContext', userId]` | Lib `PersonalContext` | Adapter: canonical → lib shape |
| 8 | `ExperienceContext` | `ExperienceContext.tsx:77` | Lib | `['personalContext', userId]` | Lib `PersonalContext` | Adapter: canonical → lib shape |
| 9 | `TwinPersonalityPage` | `TwinPersonalityPage.tsx:116-166` | **SICE** | `['personalContext', userId]` | SICE `PersonalContext` → maps to `PersonalityMetrics` | Adapter: canonical → SICE shape |
| 10 | `SICEOrchestrator` | `SICEOrchestrator.ts:61` (engine #1) | SICE (internal) | N/A (orchestration) | SICE `PersonalContext` | Direct: engine returns canonical SICE subset |

### 3.2 Adapter Layer Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CANONICAL PERSONALCONTEXT                       │
│                    (Single Source of Truth)                         │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │  Lib Adapter │ │ SICE Adapter │ │ Orchestrator │
       │  (to lib     │ │ (to SICE     │ │  Adapter     │
       │   shape)     │ │  shape)      │ │  (engine #1) │
       └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
              │               │               │
              ▼               ▼               ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │ 9 Lib       │ │ 1 SICE      │ │ 15 Other    │
       │ Callers     │ │ Caller      │ │ Engines     │
       └─────────────┘ └─────────────┘ └─────────────┘
```

### 3.3 Adapter Specifications

#### Lib Adapter (`canonicalToLibPersonalContext`)
```typescript
// Input: CanonicalPersonalContext
// Output: lib/intelligence/types.ts PersonalContext
function canonicalToLibPersonalContext(canonical: CanonicalPersonalContext): PersonalContext {
  return {
    userId: canonical.userId,
    values: canonical.values,
    goals: canonical.goals,
    strengths: canonical.strengths,
    blindSpots: canonical.blindSpots,
    emotionalRange: canonical.emotionalRange,
    decisionStyle: canonical.decisionStyle,
    relationships: canonical.relationships,
    hubsActive: canonical.hubsActive,
    lastUpdated: canonical.lastUpdated,
    modelVersion: canonical.modelVersion,
    confidenceOverall: canonical.confidenceOverall,  // 0-1
    sourceCount: canonical.sourceCount,
  };
}
```

#### SICE Adapter (`canonicalToSicePersonalContext`)
```typescript
// Input: CanonicalPersonalContext
// Output: types/sice.ts PersonalContext
function canonicalToSicePersonalContext(canonical: CanonicalPersonalContext): SicePersonalContext {
  return {
    userId: canonical.userId,
    emotionalState: canonical.emotionalState,
    currentGoals: canonical.currentGoals,
    activePatterns: canonical.activePatterns,
    worldFocus: canonical.worldFocus,
    recentMemories: canonical.recentMemories,
    strengthAreas: canonical.strengthAreas,
    growthAreas: canonical.growthAreas,
    worldPersonality: canonical.worldPersonality,
  };
}
```

### 3.4 Phased Migration Sequence

| Phase | Action | Callers Affected | Risk |
|-------|--------|------------------|------|
| **0** | Create canonical type + adapters (no caller changes) | — | Zero |
| **1** | Migrate **1 low-risk caller** (e.g., `ExperienceContext`) to canonical + adapter | 1 | Low — isolated component |
| **2** | Migrate **dashboard callers** (`IntelligencePanel`, `ExecutiveSummary`, `DecisionLogger`) | 3 | Medium — shared dashboard |
| **3** | Migrate **twin callers** (`useTwinIdentity`, `TwinEvolution`) | 2 | Medium — visual identity |
| **4** | Migrate **analysis callers** (`AnalysisPage`, `IntelligenceHub`) | 2 | Medium — analytics |
| **5** | Migrate **SICE caller** (`TwinPersonalityPage`) to canonical + SICE adapter | 1 | High — world personality mapping |
| **6** | Update `SICEOrchestrator` engine #1 to use canonical internally | Internal | Medium — orchestration |
| **7** | Consolidate cache to single canonical key | All | Low — after all callers migrated |

---

## 4. CACHE ARCHITECTURE

### 4.1 Current State (Problematic)

```
Cache Key: ['personalContext', userId]
     │
     ├─► Writer A (Lib):  PersonalContext (lib shape)  ──► 8 callers read
     │
     └─► Writer B (SICE): PersonalContext (SICE shape) ──► 1 caller reads
           │
           └─► COLLISION: Last writer wins; readers get wrong shape
```

### 4.2 Target State (Post-Migration)

```
┌─────────────────────────────────────────────────────────────────┐
│  CANONICAL CACHE: ['personalContext', userId, 'canonical']     │
│  ─────────────────────────────────────────────────────────────  │
│  Single entry: CanonicalPersonalContext (full unified model)   │
│  staleTime: 60s (same as current)                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │  Lib Adapter │ │ SICE Adapter │ │ Orchestrator │
       │  (derived)   │ │ (derived)    │ │ (derived)    │
       └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
              │               │               │
              ▼               ▼               ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │ Derived     │ │ Derived     │ │ Derived     │
       │ Lib Shape   │ │ SICE Shape  │ │ Engine Shape│
       │ (virtual)   │ │ (virtual)   │ │ (virtual)   │
       └─────────────┘ └─────────────┘ └─────────────┘
```

### 4.3 Cache Implementation Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Single canonical entry + virtual derived views** | Store canonical; adapters compute shapes on read | Single source of truth; no duplication | Compute on every read (negligible) |
| **B: Three separate keys** | `['personalContext', userId, 'canonical']`, `['personalContext', userId, 'lib']`, `['personalContext', userId, 'sice']` | Explicit isolation; parallel fetches possible | 3x cache memory; sync complexity |
| **C: Canonical + selector functions** | Store canonical; `selectLibShape()`, `selectSiceShape()` utilities | Type-safe; React Query `select` option | Requires React Query v5 `select` |

**Recommendation:** **Option C** — uses React Query `select` for zero-cost derived views:
```typescript
// Caller uses:
const { data: libContext } = useQuery({
  queryKey: ['personalContext', userId, 'canonical'],
  select: (canonical) => canonicalToLibPersonalContext(canonical),
});
```

---

## 5. IMPLEMENTATION ARCHITECTURE (Post-Migration)

### 5.1 File Structure (Phased)

```
src/
├── types/
│   └── personalContext.ts          # NEW: CanonicalPersonalContext
├── lib/intelligence/
│   ├── PersonalContextBuilder.ts   # UNCHANGED (lib implementation)
│   ├── canonicalAdapter.ts         # NEW: canonicalToLibPersonalContext
│   └── types.ts                    # Existing lib types
├── services/sice/
│   ├── engines/
│   │   └── PersonalContextBuilder.ts  # UNCHANGED (SICE implementation)
│   ├── canonicalAdapter.ts         # NEW: canonicalToSicePersonalContext
│   └── SICEOrchestrator.ts         # UPDATED: engine #1 uses canonical internally
├── hooks/
│   ├── usePersonalContext.ts       # NEW: unified hook with select
│   └── useTwinIdentity.ts          # UPDATED: uses usePersonalContext
├── components/
│   └── ... (9 callers updated to use usePersonalContext)
└── pages/
    ├── TwinPersonalityPage.tsx     # UPDATED: uses usePersonalContext (SICE select)
    └── ...
```

### 5.2 Data Flow (Post-Migration)

```
User Request
     │
     ▼
┌──────────────────────────────────────────┐
│  usePersonalContext(userId)              │
│  - queryKey: ['personalContext', userId, │
│               'canonical']               │
│  - queryFn: canonicalBuilder.getContext  │
└────────────────────────────┬─────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
            ┌───────────────┐  ┌───────────────┐
            │ Lib Builder   │  │ SICE Builder  │
            │ (persistence  │  │ (world adapt) │
            │  + inference) │  │               │
            └───────┬───────┘  └───────┬───────┘
                    │                 │
                    ▼                 ▼
            ┌─────────────────────────────────┐
            │      CanonicalPersonalContext   │
            │   (merged in queryFn or cache)  │
            └─────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        | Lib Shape|  | SICE Shape| |Engine #1 |
        | (select) |  | (select)  | | (direct) |
        └──────────┘  └──────────┘  └──────────┘
```

---

## 6. OPEN DECISIONS (Owner Must Resolve)

### 6.1 Confidence Scale (0-1 vs 0-100) — DEFERRED

**Callers to trace:**
| Caller | Current Usage | Scale Expected |
|--------|---------------|----------------|
| `IntelligencePanel` | `confidenceOverall` → UI % | 0-1 |
| `ExecutiveSummary` | `confidenceOverall` → UI % | 0-1 |
| `AnalysisPage` | `sourceCount`, `confidenceOverall` | 0-1 |
| `TwinPersonalityPage` | SICE `confidence` (hardcoded 75) | 0-100 |
| `SICEOrchestrator` | `SICEOutput.confidence` | 0-100 |

**Owner Decision Required:** Choose canonical scale; other side adapts.

### 6.2 Canonical Builder Implementation

| Approach | Description |
|----------|-------------|
| **A: Facade** | New `CanonicalPersonalContextBuilder` composes both builders; `getContext()` runs both, merges |
| **B: Selector** | Keep builders separate; `usePersonalContext` runs both queries, merges in `select` |
| **C: Hybrid** | Lib builder as primary (persistence); SICE builder enriches with world data |

**Owner Decision Required:** Which architecture for canonical builder?

### 6.3 Persistence Boundary

- Lib builder: **writes** to `personal_context`, `personal_memory`, `behavioral_patterns`
- SICE builder: **reads** from `users_profiles`, `twin_memories`, `decision_patterns`, `world_stats`
- **Canonical model must support both read and write paths** — Owner to confirm if SICE path ever needs writes

### 6.4 SICEOrchestrator Engine #1

- Currently registers `new PersonalContextBuilder()` (SICE version) at line 61
- Post-migration: Engine #1 should return canonical SICE subset
- **SICEBridge** bridges engine #2→lib PatternDetector, engine #8→lib BadgeEngine — must remain compatible

---

## 7. EVIDENCE TRACEABILITY

| Mapping Element | Source Evidence |
|-----------------|-----------------|
| Canonical fields | `lib/intelligence/types.ts:118-137`, `types/sice.ts:81-96` |
| Lib builder methods | `lib/intelligence/PersonalContextBuilder.ts` (all methods) |
| SICE builder methods | `services/sice/engines/PersonalContextBuilder.ts:17-60` |
| Cache key usage | 10 grep matches across codebase |
| `TwinPersonalityPage` SICE usage | `TwinPersonalityPage.tsx:116-166` |
| SICEOrchestrator engine #1 | `SICEOrchestrator.ts:61, 303, 631, 797` |
| SICEBridge contracts | `SICEBridge.ts:35-84, 94-132, 139-189` |
| E4 collision proof | `scripts/E4_PCB_COLLISION_REPRODUCTION.mjs` (4/4 reproduced) |
| Lib callers (8) | Component grep + `useTwinIdentity.ts` |
| SICE callers (2) | `TwinPersonalityPage.tsx`, `SICEOrchestrator.ts` |

---

## 8. NEXT STEPS (Owner Gate)

1. **Owner reviews** this mapping
2. **Owner decides** on:
   - Confidence scale (0-1 vs 0-100)
   - Canonical builder approach (Facade vs Selector vs Hybrid)
   - Persistence boundary for SICE path
3. **Owner approves** phased migration start (Phase 0: types + adapters)
4. **Agent implements** Phase 0 only — then returns for next gate

---

**END OF MAPPING — FOR OWNER DECISION ONLY**