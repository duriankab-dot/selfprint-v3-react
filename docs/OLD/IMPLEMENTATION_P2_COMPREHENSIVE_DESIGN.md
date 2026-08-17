# 🟡 P2 COMPREHENSIVE DESIGN — Advanced Adaptive Environments, Future Self, Decision Intelligence
**Status:** Design Phase Complete  
**Session:** 2026-08-10  
**Priority:** P2 (After P0 + P1 complete)

---

## § 46: P2 Overview — What We're Building

From Master Direction § 46, P2 consists of:
1. **Advanced Adaptive Environments** (§ 46.1)
2. **Time-of-Day Themed Environments** (§ 46.2)
3. **Personalized Soundscapes** (§ 46.3)
4. **Future Self Module** (§ 46.4)
5. **Advanced Decision Intelligence** (§ 46.5)
6. **Life Intelligence Packs** (§ 46.6 — Optional/Post-MVP)
7. **Advanced Twin States** (§ 46.7)

---

## 📊 Data Model Architecture

### 1. Environment Context

```typescript
interface EnvironmentContext {
  time: {
    hour: number;              // 0-23
    minute: number;            // 0-59
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    timezone: string;          // User's timezone (or auto-detect)
  };
  
  activity: {
    current: 'journaling' | 'reflecting' | 'analyzing' | 'exploring' | 'deciding' | 'idle';
    duration: number;          // minutes
    engagement: 0-1;           // low → high
  };
  
  emotional: {
    calm: 0-1;
    reflective: 0-1;
    uncertain: 0-1;
    excited: 0-1;
    focused: 0-1;
    // From existing emotion engine (§18)
  };
  
  journey: {
    currentHub: string;        // Career, Relationship, Health, etc.
    phase: 'discovery' | 'decision' | 'action' | 'reflection';
    recentPatterns: string[];
  };
  
  user: {
    preferences: {
      timeOfDayOverride?: boolean;  // Skip auto time-based
      soundscapeEnabled: boolean;
      motionEnabled: boolean;
      darknessLevel: 0-1;
      audioVolume: 0-1;
    };
  };
}
```

### 2. Adaptive Environment State

```typescript
interface AdaptiveEnvironmentState {
  id: string;
  environmentType: 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
  
  visual: {
    theme: string;             // Name from 66-72 theme library
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    particleDensity: 0-1;
    twinGlow: {
      intensity: 0-1;
      color: string;
    };
    backgroundPattern: string;  // 'cosmic' | 'nature' | 'tech' | 'abstract'
    brightness: 0-1;
    saturation: 0-1;
  };
  
  audio: {
    ambientTrack: string;       // Soundscape name
    volume: 0-1;
    layers: {
      base: string;             // Base ambient
      mood: string;              // Mood-specific layer
      hub: string;               // Hub-specific layer
      activity: string;          // Activity-specific layer
    };
  };
  
  motion: {
    particleSpeed: 0-1;
    twinAnimation: string;      // 'gentle' | 'active' | 'flowing' | 'pulsing'
    transitionDuration: number; // ms
    reduceMotion: boolean;
  };
  
  twin: {
    state: 'awakening' | 'aware' | 'mentor' | 'explorer' | 'mirror' | 'forecaster' | 'advisor' | 'cheerleader';
    voice: {
      tone: 'calm' | 'focused' | 'reflective' | 'energetic' | 'gentle';
      speed: 0-2;               // 0.5 = slow, 1 = normal, 2 = fast
      pitch: 0-2;
    };
  };
  
  interaction: {
    promptStyle: 'gentle' | 'direct' | 'exploratory' | 'supportive';
    suggestionFrequency: 'rare' | 'moderate' | 'frequent';
  };
  
  timestamps: {
    createdAt: Date;
    lastAppliedAt: Date;
    nextTransitionAt?: Date;
  };
}
```

### 3. Prediction Model (Future Self)

```typescript
interface BehavioralPrediction {
  id: string;
  userId: string;
  
  analysis: {
    historicalPattern: string;  // Description of what's been happening
    trajectory: 'improving' | 'declining' | 'stagnant' | 'cycling';
    confidence: 0-1;            // How confident are we?
    evidence: {
      journalEntries: number;
      reflections: number;
      decisions: number;
      patterns: string[];
    };
  };
  
  forecast: {
    timeframe: 30 | 60 | 90 | 180 | 365;  // days
    scenarios: {
      conservative: string;     // If current behavior continues
      optimistic: string;       // If user makes positive change
      risky: string;            // If user ignores patterns
    };
    likelyOutcomes: {
      emotional: string;
      behavioral: string;
      decision: string;
    };
  };
  
  guidance: {
    warnings: string[];        // Things to watch for
    opportunities: string[];   // Positive paths forward
    criticalDecisionPoints: { when: string; what: string }[];
  };
}
```

### 4. Decision Intelligence Model

```typescript
interface SmartDecisionAnalysis {
  id: string;
  userId: string;
  
  currentDecision: {
    title: string;
    description: string;
    options: string[];
    timelineSuggestion: string;  // "Urgent" | "This week" | "No rush"
    contextualHub: string;
  };
  
  analysis: {
    alignmentScores: {
      [option: string]: {
        score: 0-1;
        reason: string;
        alignment: string[];   // Which values align
      };
    };
    
    historicalContext: {
      similarDecisions: Array<{
        what: string;
        when: Date;
        outcome: string;
        whatWorked: string[];
      }>;
    };
    
    riskAssessment: {
      [option: string]: {
        risk: 0-1;
        concerns: string[];
        mitigations: string[];
      };
    };
    
    timelineRecommendation: {
      waitingReasons?: string[];
      urgentReasons?: string[];
      bestTimeToDecide: string;
    };
  };
  
  recommendation: {
    suggestedOption?: string;
    reasoning: string;
    confidence: 0-1;
    nextSteps: string[];
  };
}
```

---

## 🏗️ System Architecture Diagram

```
                        USER INTERACTION
                               ↓
                    ┌──────────────────────┐
                    │  Experience Engine   │ (existing P0/P1)
                    └──────────────────────┘
                               ↓
        ┌─────────────────────────────────────────────┐
        │                                             │
        ↓                                             ↓
┌──────────────────────┐            ┌─────────────────────────┐
│ Environment Context  │            │  Personal Intelligence  │
│ (time + activity)    │            │  (P0 Engine)            │
└──────────────────────┘            └─────────────────────────┘
        ↓                                    ↓
        │                                    │
        ├─ Time-of-Day Resolver             ├─ Pattern Analysis
        ├─ Activity Detector                ├─ Historical Data
        ├─ Emotion Signals                  ├─ Decision History
        ├─ User Preferences                 └─ Behavioral Trends
        └─ Theme Library (66-72)                    │
                                                    ↓
        ┌────────────────────────────────────────────────────┐
        │   ADAPTIVE SYSTEM (NEW)                            │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        ├─ Environment Resolver                             │
        │  └─ Select/Generate environment state             │
        │                                                    │
        ├─ Soundscape Engine                                │
        │  └─ Base + Mood + Hub + Activity layers           │
        │                                                    │
        ├─ Future Self Forecaster                           │
        │  └─ Predict trajectories & scenarios              │
        │                                                    │
        ├─ Decision Intelligence Engine                     │
        │  └─ Analyze decisions, recommend options          │
        │                                                    │
        └─ Twin State Orchestrator                          │
           └─ Compute sophisticated Twin state              │
                                                    │
                                                    ↓
                    ┌────────────────────────────────────┐
                    │   OUTPUT: AdaptiveEnvironmentState │
                    └────────────────────────────────────┘
                               ↓
                    ┌────────────────────────┐
                    │  Rendering + Playback  │
                    │ (Visual + Audio        │
                    │  Motion + Interaction) │
                    └────────────────────────┘
```

---

## 📁 File Structure (P2)

```
src/
  ├─ lib/
  │   ├─ intelligence/
  │   │   ├─ EnvironmentEngine.ts           [NEW] § 46.1
  │   │   ├─ TimeOfDayResolver.ts           [NEW] § 46.2
  │   │   ├─ SoundscapeEngine.ts            [NEW] § 46.3
  │   │   ├─ FutureSelfForecaster.ts        [NEW] § 46.4
  │   │   ├─ DecisionIntelligence.ts        [NEW] § 46.5
  │   │   ├─ TwinStateOrchestrator.ts       [NEW] § 46.7
  │   │   └─ LifeIntelligencePacks.ts       [NEW] § 46.6 (optional)
  │   │
  │   └─ contexts/
  │       └─ EnvironmentContext.ts          [NEW] Type definitions
  │
  ├─ components/
  │   ├─ features/
  │   │   ├─ EnvironmentDisplay.tsx         [NEW] Render environment
  │   │   ├─ SoundscapeControls.tsx         [NEW] Soundscape UI
  │   │   ├─ FutureSelfViewer.tsx           [NEW] Show predictions
  │   │   ├─ DecisionHelper.tsx             [NEW] Decision guidance
  │   │   └─ AdvancedTwinStates.tsx         [NEW] Twin state display
  │   │
  │   └─ styles/
  │       ├─ environment.css                [NEW]
  │       ├─ soundscape.css                 [NEW]
  │       └─ future-self.css                [NEW]
  │
  ├─ hooks/
  │   ├─ useAdaptiveEnvironment.ts          [NEW]
  │   ├─ useFutureSelfPrediction.ts         [NEW]
  │   ├─ useDecisionIntelligence.ts         [NEW]
  │   └─ useSoundscape.ts                   [NEW]
  │
  └─ pages/
      ├─ FutureSelfPage.tsx                 [NEW] Route: /future-self
      ├─ DecisionPage.tsx                   [NEW] Route: /decisions
      └─ EnvironmentSettingsPage.tsx        [NEW] Route: /settings/environment

supabase/
  └─ migrations/
      ├─ 20260810_create_environments.sql   [NEW]
      ├─ 20260810_create_predictions.sql    [NEW]
      └─ 20260810_create_decision_history.sql [NEW]

docs/
  ├─ IMPLEMENTATION_P2_COMPREHENSIVE_DESIGN.md  [This file]
  ├─ P2_DETAILED_BREAKDOWN.md                   [NEW] Detailed tasks
  └─ HANDOFF_2026-08-10_P2_COMPREHENSIVE.md     [NEW] Final handoff
```

---

## 🎯 Implementation Sequence

### Phase 1: Environment Resolver (§ 46.1-46.2) — ~8 hours
1. Create `EnvironmentEngine.ts` (core logic)
2. Implement `TimeOfDayResolver.ts` (time-based themes)
3. Build `EnvironmentDisplay.tsx` + CSS
4. Create `useAdaptiveEnvironment.ts` hook
5. Add to Dashboard/ChatPage
6. Test with various times + preferences

### Phase 2: Soundscape System (§ 46.3) — ~6 hours
1. Create `SoundscapeEngine.ts` (layer management)
2. Build sound asset registry (or use generative audio API)
3. Implement `SoundscapeControls.tsx` UI
4. Audio ducking logic (Twin voice interrupts music)
5. Volume + enable/disable controls
6. Integration with experience engine

### Phase 3: Prediction Engine (§ 46.4) — ~12 hours
1. Create `FutureSelfForecaster.ts` (complex logic)
2. Pattern analysis (historical journaling + decisions)
3. Trajectory computation
4. Scenario generation (conservative/optimistic/risky)
5. Build `FutureSelfViewer.tsx` visualization
6. Create `/future-self` route
7. Integration with Twin (give context)
8. Testing + iteration

### Phase 4: Decision Intelligence (§ 46.5) — ~12 hours
1. Create `DecisionIntelligence.ts`
2. Alignment scoring vs user values
3. Historical decision lookup + analysis
4. Risk assessment logic
5. Timeline recommendation
6. Build `DecisionHelper.tsx` UI
7. Create `/decisions` route
8. Proactive decision point detection
9. Testing

### Phase 5: Advanced Twin States (§ 46.7) — ~8 hours
1. Expand `TwinStateOrchestrator.ts`
2. Create 8+ sophisticated states (Mentor, Explorer, Mirror, etc.)
3. State transition logic based on context
4. Visual representation changes per state
5. Voice adaptation (already have hooks from P1)
6. Motion + animation per state
7. Test state transitions

### Phase 6: Integration + Testing — ~6 hours
1. End-to-end testing of all features
2. TypeScript strict mode verification
3. Accessibility audit (audio alternatives)
4. Performance profiling
5. Mobile + responsive testing
6. Create comprehensive handoff doc

**Total Estimated:** ~52 hours

---

## 🔗 Integration Points with P0/P1

| Feature | P0 Integration | P1 Integration | P2 Dependency |
|---------|---|---|---|
| Environment | Theme System (§17) | Voice Twin (§22) | Emotion Engine |
| Soundscape | Audio Permission (§24) | TTS (§22) | Audio Ducking |
| Future Self | Personal Model (§7) | Badge System (§30) | Pattern History |
| Decision | Memory System (§13) | Daily Brief (§25) | Personal Context |
| Twin States | Twin Synthesis (§3-6) | Voice Twin (§22) | All above |

---

## 📋 Database Schema Updates

### 1. environments table
```sql
CREATE TABLE environments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,
  name text,
  environment_type text, -- 'morning', 'afternoon', 'evening', 'night', 'custom'
  visual jsonb,          -- theme, colors, patterns
  audio jsonb,           -- soundscape, layers
  motion jsonb,          -- animation, particle settings
  twin_state text,       -- twin state type
  created_at timestamp DEFAULT now(),
  last_used_at timestamp,
  is_active boolean DEFAULT true
);
```

### 2. predictions table
```sql
CREATE TABLE behavioral_predictions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,
  timeframe integer,     -- 30, 60, 90, 180, 365
  trajectory text,       -- 'improving', 'declining', 'stagnant'
  confidence numeric,
  scenarios jsonb,       -- conservative, optimistic, risky
  guidance jsonb,
  created_at timestamp DEFAULT now()
);
```

### 3. decision_history table
```sql
CREATE TABLE decision_history (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,
  title text,
  description text,
  options jsonb,
  chosen_option text,
  outcome text,
  created_at timestamp,
  decided_at timestamp,
  indexed_patterns text[] -- Tags for pattern matching
);
```

---

## 🧪 Testing Strategy

### Unit Tests
- `EnvironmentEngine.test.ts` — Time resolution, context application
- `TimeOfDayResolver.test.ts` — Time→environment mapping
- `SoundscapeEngine.test.ts` — Layer mixing logic
- `FutureSelfForecaster.test.ts` — Prediction accuracy vs mock data
- `DecisionIntelligence.test.ts` — Alignment scoring, risk assessment
- `TwinStateOrchestrator.test.ts` — State transitions, mood detection

### E2E Tests
- User opens app at different times → environment changes
- User changes activity → soundscape adapts
- User views Future Self prediction → matches historical pattern
- User asks for decision help → gets contextual recommendations
- Twin switches states as context changes

### Accessibility
- [ ] Audio alternatives for soundscape (visual indicators)
- [ ] Reduced-motion safe animations (§ 24)
- [ ] Voice settings override automatic adaptation
- [ ] Color contrast checks (environment themes)
- [ ] Screen reader friendly decision display

---

## ✅ Definition of Done (P2)

P2 is **complete** when:

1. ✅ All 7 subsystems (§ 46.1-46.7) implemented
2. ✅ TypeScript strict mode: `npx tsc -b --noEmit` exits 0
3. ✅ All routes work (`/future-self`, `/decisions`, `/settings/environment`)
4. ✅ Environment transitions smoothly without lag
5. ✅ Soundscape plays with audio ducking working
6. ✅ Future Self predictions show with confidence scores
7. ✅ Decision Helper provides context-aware recommendations
8. ✅ Twin exhibits new states (Mentor, Explorer, etc.) appropriately
9. ✅ E2E tests pass (all user flows)
10. ✅ Accessibility audit: no critical issues
11. ✅ Mobile responsive (PWA ready)
12. ✅ Comprehensive handoff documentation
13. ✅ No production errors in Vercel logs

---

## 📌 Quick Reference: What NOT to Do

❌ Don't create new Themes — use existing 66-72 library  
❌ Don't autoplay audio without user consent  
❌ Don't pretend AI knows what it doesn't (show confidence)  
❌ Don't make UI changes without user preference check  
❌ Don't lock basic features behind paywall (keep P2 basic features free)  
❌ Don't hardcode colors — use `var(--...)`  
❌ Don't use localStorage for sensitive data  
❌ Don't skip accessibility checks (audio alternatives!)  

---

## 🚀 Next Steps

1. ✅ Approve this design doc
2. → Start Phase 1: Environment Resolver (8 hours)
3. → Proceed through phases sequentially
4. → Integrate with P0/P1 systems at each phase
5. → Test comprehensively before proceeding

---

**Status:** Ready for Phase 1 Implementation  
**Estimated Start:** After P2 Architecture approval  
**Expected Completion:** ~52 hours  
**Target:** Production-ready P2 by next major release
