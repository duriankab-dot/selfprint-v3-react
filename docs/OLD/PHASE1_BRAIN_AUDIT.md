# 🧠 Phase 1 Audit: Astrovera v2 Brain Capabilities

**Status:** IN PROGRESS  
**Date:** 2026-08-07

---

## 📋 What We Found

### Architecture: Brain Layer

Astrovera's brain is a **routing + orchestration layer** (not a large language model):

```
Request → Gateway (decide) → Router (route) → Orchestrator (execute)
  ↓
  Persona selection (based on plan/tier)
  ↓
  Worker selection (coach, insight, planner, reflector, research)
  ↓
  Knowledge modules invoked (psychology, numerology, bazi, astrology, etc.)
  ↓
  Response
```

---

## 🎭 Persona System (Current)

**3 Personas by Subscription Plan:**

| Persona | Tier | Model | Style | Purpose |
|---------|------|-------|-------|---------|
| **Astra** | free | Haiku | Short | Insight + Observation |
| **Nova** | plus/pro | Sonnet | Medium | Coaching + Empathy |
| **Astra&Nova** | elite | Multi-Agent | Long | Expert Analysis |

**Key finding:** Personas are **plan-based**, NOT **hub × mood based**

---

## 🔍 Current Capabilities

### ✅ What Exists

1. **5 Agent Modules:**
   - coach.js (coaching logic)
   - insight.js (insight generation)
   - planner.js (planning)
   - reflector.js (reflection)
   - research.js (research)

2. **10 Knowledge Modules:**
   - Psychology (archetype, phase, strengths, blindspot)
   - Numerology (life path number)
   - Bazi (day master, dominant/missing elements)
   - Astrology (sun sign, moon sign)
   - Blood Type (blood type insights)
   - Human Design (type, profile)
   - Kua (feng shui compass)
   - Gene Keys (genetic expression)
   - Vedic (nakshatra)
   - Thai Astrology (zodiac year, planet)

3. **Memory System:**
   - Followup context tracking
   - Last result storage
   - Memory context building

4. **Routing:**
   - Action-based routing (coach, insight, planner, reflector, research)
   - Question-based routing
   - Plan-based flow control

### ❌ What DOES NOT Exist

1. **Hub System:**
   - ❌ NO "identity", "decision", "relationship", etc. contexts
   - ❌ NO hub-specific personality variations
   - ❌ NO hub-specific knowledge selection

2. **Mood System:**
   - ❌ NO "stressed", "confident", "ready", etc. mood states
   - ❌ NO mood-based tone adjustments
   - ❌ NO mood-specific response generation

3. **72-Combination Personalization:**
   - ❌ NO 12-hub × 6-mood personality matrix
   - ❌ NO dynamic personality switching
   - ❌ NO combination-based prompt selection

---

## 🧠 12 SICE CORES (Self-Intelligent Core Engine)

### Knowledge Modules Foundation

**SICE 1-10** (Existing in Astrovera):
1. Psychology (archetype + phase + strengths + blindspot)
2. Numerology (life path number + meaning)
3. Bazi (day master + dominant/missing elements)
4. Astrology (sun sign + moon sign)
5. Blood Type (blood type insights)
6. Human Design (type + profile + gates + lines)
7. Kua (feng shui compass + directions)
8. Gene Keys (genetic expression + codon profiles)
9. Vedic Astrology (nakshatra + planetary positions)
10. Thai Astrology (zodiac year + planet associations)

**SICE 11-12** (NEW - extracted from Astrovera v2 codebase):
11. **Nathan Chart** (node-based decision modeling + consequence mapping)
12. **Hexagram** (I Ching patterns + life situation interpretation)

**Status**: Nathan Chart + Hexagram already have data + logic in Astrovera v2; need to extract + integrate into SelfPrint layers.

---

## 📊 Gateway Request/Response Interface

### Current Request Format

```javascript
{
  action:      'coach' | 'insight' | 'planner' | 'reflector' | 'research',
  plan:        'free' | 'basic' | 'pro' | 'founder' | 'trial',
  question:    string,
  userId:      string,
  workerUrls:  { ... },
  fetchImpl:    function,
  sharedSecret: string
}
```

### Current Response Format

```javascript
{
  ok:              boolean,
  reason:          string | null,
  persona:         { id, label, tier, voice },
  style:           { wordBudget, domains },
  routing:         { action, domains },
  memory:          { ... },
  targetWorkerUrl: string | null
}
```

**Observation:** NO `hub` or `mood` fields

---

## 🚪 Integration Points Found

### 1. Gateway (`brain/core/gateway.js`)
- **Entry point** for all requests
- Decision logic for: persona, style, routing, memory
- Returns structured plan

### 2. Orchestrator (`brain/core/orchestrator.js`)
- **Executes** the gateway decision
- Calls appropriate worker
- Manages response synthesis

### 3. Router (`brain/router/router.js`)
- **Routes** based on action + plan + question
- Determines which worker(s) to call
- Selects domains/knowledge modules

### 4. Persona (`brain/core/persona.js`)
- **Defines** personality voice for each tier
- Maps plan → persona
- Provides `moodForContext()` (but for UI emoji, not chat)

### 5. Memory (`brain/memory/memory.js`)
- **Tracks** user conversation history
- Provides context for followup questions
- NOT hub/mood aware

---

## ❓ Critical Questions

### For SelfPrint Integration:

1. **Hub + Mood Personalization:**
   - Should we ADD hub/mood parameters to gateway?
   - Or is this a SelfPrint layer concern (keep Brain generic)?

2. **Personality Selection:**
   - Current: Plan → Persona (1:1 mapping)
   - Proposed: Hub × Mood → Persona (72:1 mapping)
   - How should routing change?

3. **Knowledge Selection:**
   - Should hub context affect which knowledge modules are used?
   - E.g., "decision" hub → prioritize coach agent?
   - "spirituality" hub → prioritize astrology knowledge?

4. **Memory Management:**
   - Current: Stores last Q&A
   - Needed: Hub/mood history + impact on responses

5. **Chat API Contract:**
   - What's the expected request format for SelfPrint → Brain?
   - Does Brain expect hub/mood in every message?
   - Or should SelfPrint handle mood-based prompt injection?

---

## 🏗️ Architecture Decision Point

### Option A: Hub/Mood in Brain (Recommended for HYBRID)
```
SelfPrint Frontend
  ├─ mood: "confident"
  ├─ hub: "decision"
  └─ question: "I need to decide..."
        ↓
  Gateway enriches with mood + hub context
        ↓
  Selects Nova personality (plan-based)
  + Injects hub-specific prompt system
  + Mood-adjusts tone
        ↓
  Response
```

**Pros:**
- Brain layer handles all personalization
- Simpler SelfPrint integration
- Reusable for other frontends

**Cons:**
- Requires Brain API changes
- Tighter coupling

### Option B: Hub/Mood in SelfPrint (Current Design)
```
SelfPrint Frontend
  ├─ mood: "confident"
  ├─ hub: "decision"
  ├─ getNovaPrompt(hub, mood)  ← SelfPrint logic
  │   └─ Injects system prompt
        ↓
  Calls Brain Gateway (generic)
        ↓
  Brain returns Nova response
        ↓
  Response
```

**Pros:**
- Brain stays generic
- SelfPrint owns personalization
- Faster to implement

**Cons:**
- Brain doesn't "know" about hub/mood
- Harder to leverage Brain's knowledge for hub-specific logic

---

## 📝 Recommendations for Phase 2 (API Design)

### Minimum for Phase 4 Integration

**Option B (SelfPrint owns personalization):**
1. Gateway stays unchanged
2. Add `system` parameter to gateway request
3. SelfPrint injects hub/mood-based system prompt
4. Brain just calls Claude with mood-tuned system

**Example:**
```javascript
// SelfPrint builds this
const systemPrompt = getNovaPrompt('decision', 'confident');

// Sends to Brain
gateway.decide({
  action: 'coach',
  plan: 'pro',
  question: userMessage,
  system: systemPrompt,  // ← NEW
  userId, workerUrls, fetchImpl, sharedSecret
});
```

### Longer term (Phase 5+)

**Option A (Brain owns personalization):**
1. Extend gateway to accept hub/mood
2. Brain routes to hub-specific knowledge modules
3. Brain's router selects agents based on hub
4. Brain applies mood tone adjustments

---

## 🔗 Files to Reference

**Core Brain Files:**
- `brain/core/gateway.js` — decision logic
- `brain/core/orchestrator.js` — execution
- `brain/core/persona.js` — persona definitions
- `brain/router/router.js` — routing logic
- `brain/prompts/system.js` — system prompts (Astra, Nova, Astra&Nova)

**Knowledge Modules:**
- `brain/knowledge/psychology/index.js` — archetype-based
- `brain/knowledge/astrology/index.js` — sun/moon sign

**Memory:**
- `brain/memory/memory.js` — user conversation history
- `brain/memory/followupContext.js` — context building

---

## 🎯 12 HUBS × 6 MOODS = 72 COMBINATIONS

### SelfPrint Content Archetypes (Hub Personalities)

| # | Hub | Archetype | Purpose | Nova Behavior |
|---|---|---|---|---|
| 1 | **Identity** | The Mirror | Self-understanding | Introspective, values-seeking, reflection |
| 2 | **Decision** | The Navigator | Path-finding, clarity | Analytical, structured, frameworks |
| 3 | **Relationship** | The Bridge | Connection, empathy | Empathetic, both-perspective, boundaries |
| 4 | **Career** | The Mentor | Growth, opportunity | Growth-oriented, coaching, milestones |
| 5 | **Health** | The Care Partner | Wellness, no-shame | Supportive, body-wisdom, gentle |
| 6 | **Money** | The Strategist | Financial clarity | No-shame, values-aligned, data-driven |
| 7 | **AI Twin** | The Twin | Meta-awareness, evolution | Honest, self-aware, transparent |
| 8 | **Learning** | The Teacher | Discovery, skill-building | Curious, scaffolding, aha-moments |
| 9 | **Creativity** | The Muse | Expression, liberation | Permission-giving, liberating, protective |
| 10 | **Spirituality** | The Witness | Meaning, sacred | Contemplative, sacred-aware, reverent |
| 11 | **Impact** | The Catalyst | Influence, legacy | Visionary, empowering, systems-aware |
| 12 | **Activities** | The Activator | Engagement, habits, momentum | Action-focused, habit-aware, rhythm |

### 6 Mood Modulations (Emotional States)
- **Stressed** 😰 (calming, simplified, step-by-step)
- **Confused** 🤔 (clarifying, structured, frameworks)
- **Confident** 💪 (energized, challenging, action-forward)
- **Drained** 😴 (gentle, protective, permission-giving)
- **Ready** ⚡ (action-oriented, momentum-building, bold)
- **Reflective** 🧘 (contemplative, pattern-seeking, wisdom)

### Result
**72 Personality Matrices** (12 hubs × 6 moods) = Unique Nova voice for every context

---

## ✅ Audit Sign-off

| Item | Found? | Notes |
|------|--------|-------|
| Chat API | ✅ | Gateway + Orchestrator |
| Personality system | ✅ | 3-tier plan-based (Astra/Nova) |
| 12 SICE Cores | ✅ | 10 existing + Nathan Chart + Hexagram (need extraction) |
| 12-hub system | ✅ | Defined in SelfPrint (not in Brain) |
| 6-mood system | ✅ | Defined in SelfPrint (not in Brain) |
| 72 combinations | ✅ | Implemented via CSS variables + React Context |
| Memory management | ✅ | Followup context + user history |
| Knowledge modules | ✅ | 12 SICE cores (psychology, astrology, numerology, bazi, blood, human design, kua, gene keys, vedic, thai astrology, nathan chart, hexagram) |
| Agents | ✅ | 5 agents (coach, insight, planner, reflector, research) |
| Router | ✅ | Action-based routing |

---

## 🚀 Next Steps (Phase 2)

1. **Decision:** Option A or Option B for hub/mood integration?
2. **Design:** REST API spec for Brain endpoint
3. **Document:** Integration requirements for SelfPrint
4. **Prepare:** Gateway changes (if Option A)

---

**Audit Status:** ✅ PHASE 1 COMPLETE

Need to confirm architecture choice (Option A vs B) before Phase 2.
