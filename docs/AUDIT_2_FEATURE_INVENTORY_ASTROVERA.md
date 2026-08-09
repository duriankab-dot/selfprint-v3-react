# AUDIT DOCUMENT 2: Astrovera Feature Inventory

**Complete breakdown of every Astrovera capability**

---

## PART A: KNOWLEDGE MODULES (10 Systems)

### 1. PSYCHOLOGY (Decision Archetype)
- **Location:** `brain/knowledge/psychology/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Analyze decision-making style + life phase
- **Input Schema:** `{ archKey, archetype, archetypeTh, phase, phaseKey, strengths, blindspot, question }`
- **Output:** Decision style interpretation + confidence
- **Evidence Weight:** 25% (quiz-based, not predictive)
- **Reusability:** ⭐⭐⭐⭐⭐ (Core to Selfprint integration)
- **Selfprint Fit:** YES - Replace Life Path fallback

### 2. NUMEROLOGY (Life Path)
- **Location:** `brain/knowledge/numerology/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Life path number interpretation
- **Input:** `{ lifePathNum, lifePathMeaning }`
- **Output:** Life path description + meaning
- **Evidence Weight:** 20% (birth-based calculation)
- **Reusability:** ⭐⭐⭐⭐ (Selfprint already uses Life Path)
- **Selfprint Fit:** YES - Enhance existing numerology

### 3. BAZI (Four Pillars)
- **Location:** `brain/knowledge/bazi/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Chinese astrological analysis
- **Input:** `{ baziDayMaster, baziDesc, dominantEl, missingEl }`
- **Output:** Elemental analysis + balance interpretation
- **Evidence Weight:** 15% (birth-based prediction)
- **Reusability:** ⭐⭐⭐ (Complex, optional enhancement)
- **Selfprint Fit:** MAYBE - Could offer as "Cosmic Perspective"

### 4. ASTROLOGY (Western Zodiac)
- **Location:** `brain/knowledge/astrology/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Sun/Moon sign interpretation
- **Input:** `{ sunSign, moonSign }`
- **Output:** Astrological personality profile
- **Evidence Weight:** 15% (birth-based prediction)
- **Reusability:** ⭐⭐⭐ (Optional, nice-to-have)
- **Selfprint Fit:** OPTIONAL - Gate behind preference toggle

### 5. BLOOD TYPE
- **Location:** `brain/knowledge/blood/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Blood type personality interpretation
- **Input:** `{ bloodType }`
- **Output:** Blood type personality traits + compatibility
- **Evidence Weight:** 5% (minor, cultural)
- **Reusability:** ⭐⭐ (Low priority)
- **Selfprint Fit:** NO - Culturally specific, lower value

### 6. HUMAN DESIGN
- **Location:** `brain/knowledge/human-design/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Human Design system analysis
- **Input:** `{ type, strategy, authority, ... }`
- **Output:** Life strategy + decision-making approach
- **Evidence Weight:** 15% (birth-based system)
- **Reusability:** ⭐⭐⭐⭐ (Complements psychology well)
- **Selfprint Fit:** YES - Rich personality layer

### 7. KUA NUMBER
- **Location:** `brain/knowledge/kua/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Feng Shui Kua number analysis
- **Input:** `{ kua }`
- **Output:** Life direction + elemental balance
- **Evidence Weight:** 10% (birth-based system)
- **Reusability:** ⭐⭐ (Specialized)
- **Selfprint Fit:** NO - Too specialized for MVP

### 8. GENE KEYS
- **Location:** `brain/knowledge/gene-keys/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Gene Keys frequency analysis
- **Input:** `{ geneKeys }`
- **Output:** Holistic operating manual
- **Evidence Weight:** 15% (birth-based system)
- **Reusability:** ⭐⭐⭐ (Deep personality layer)
- **Selfprint Fit:** MAYBE - Advanced feature

### 9. VEDIC ASTROLOGY (Nakshatra)
- **Location:** `brain/knowledge/vedic/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Vedic nakshatra + rashi analysis
- **Input:** `{ nakshatra }`
- **Output:** Vedic personality profile + spiritual path
- **Evidence Weight:** 15% (birth-based prediction)
- **Reusability:** ⭐⭐⭐⭐ (Rich tradition, useful)
- **Selfprint Fit:** YES - Optional cosmic perspective

### 10. THAI ASTROLOGY
- **Location:** `brain/knowledge/thai-astrology/`
- **Status:** ✅ VERIFIED IMPLEMENTED
- **Purpose:** Thai zodiac + planetary analysis
- **Input:** `{ thaiZodiacYear, thaiPlanet }`
- **Output:** Thai zodiac personality + fortune
- **Evidence Weight:** 10% (culturally specific)
- **Reusability:** ⭐⭐⭐ (Useful for Thai users)
- **Selfprint Fit:** YES - Regional personalization

---

## PART B: AI AGENTS (Conversational & Analysis)

### Core Agents (in brain/agents/)

| Agent | Purpose | Input | Output | Status |
|-------|---------|-------|--------|--------|
| **coach.js** | Life guidance & support | Profile + question | Coaching advice | ✅ VERIFIED |
| **insight.js** | Deep analysis & discovery | Context + data | Actionable insights | ✅ VERIFIED |
| **planner.js** | Strategic planning | Goals + timeline | Action plan | ✅ VERIFIED |
| **reflector.js** | Self-reflection prompts | Journal + history | Reflection questions | ✅ VERIFIED |
| **research.js** | Topic investigation | Query | Research summary | ✅ VERIFIED |

### Supporting Agents

| Agent | Purpose | Location |
|-------|---------|----------|
| **narrator.js** | Conversational narration | brain/agents/ |
| **synthesizer.js** | Multi-source synthesis | brain/agents/ |

**Reusability:** ⭐⭐⭐⭐ (Excellent for decision support)  
**Selfprint Fit:** YES - Replace simple Nova with coached guidance

---

## PART C: CORE INFRASTRUCTURE

### Gateway (brain/core/gateway.js)
- **Purpose:** Decision layer — routes requests to workers
- **Function:** `decide(action, plan, question, userId, ...)`
- **Returns:** Routing decision + persona + style + memory
- **Reusability:** ⭐⭐⭐⭐ (Critical router)
- **Integration:** Required for Selfprint adapter

### Orchestrator (brain/core/orchestrator.js)
- **Purpose:** Executes gateway decision, calls knowledge modules
- **Workflow:** Gateway decision → Call modules → Synthesize → Return
- **Reusability:** ⭐⭐⭐⭐⭐ (Core engine)
- **Integration:** Must understand for API design

### Persona (brain/core/persona.js)
- **Purpose:** Select speaking voice/persona based on plan
- **Options:** Free, Pro, Elite, Founder
- **Reusability:** ⭐⭐⭐ (Nice-to-have, can skip initially)
- **Selfprint Fit:** MAYBE - After MVP

### Memory System (brain/memory/)
- **followupContext.js:** Tracks multi-turn conversations
- **memory.js:** Builds contextual memory from history
- **Reusability:** ⭐⭐⭐⭐ (Sophisticated, valuable)
- **Selfprint Fit:** YES - Enhance journal insights

### Safety & Governance
- **safety.js:** Content safety checks
- **truth.js:** Factual accuracy validation
- **errorHandler.js:** Graceful error handling
- **failSafe.js:** System resilience
- **featureFlags.js:** Feature control
- **promptRegistry.js:** Centralized prompt management
- **rateLimit.js:** Request throttling
- **entitlement.js:** Plan-based feature access

**Reusability:** ⭐⭐⭐ (Important for production)  
**Selfprint Fit:** YES - Inherit safety practices

---

## PART D: KNOWLEDGE MODULE STRUCTURE (Template)

Each module (e.g., `psychology/`) contains:

```
psychology/
├── system.js         # System prompt (what this module does)
├── instruction.js    # Detailed instructions for AI
├── schema.js         # Input/output TypeScript schema
├── examples.js       # Sample input/output pairs
├── version.js        # Version tracking
└── index.js          # Exports buildPrompt(), SCHEMA, validate()
```

**Example Usage:**
```javascript
import * as Psychology from 'brain/knowledge/psychology/index.js'
const prompt = Psychology.buildPrompt({ exampleCount: 2 })
const result = await callClaude(prompt, input)
const validated = Psychology.validate(result)
```

**Reusability Pattern:** ✅ Highly reusable, minimal modifications needed

---

## PART E: CLOUDFLARE WORKERS (Deployment)

### 5 Active Workers (from orchestrator.js)

| Worker | Purpose | Input | Output |
|--------|---------|-------|--------|
| **analyze** | General analysis | User profile + context | Multi-domain insight |
| **life-copilot** | Life coaching | Life questions | Personalized advice |
| **advisor-deep** | Deep guidance | Complex question | Nuanced perspective |
| **natal-chart** | Birth chart analysis | Birth data | Astrological profile |
| **save-data** | Data persistence | User result | Stored profile |

**Infrastructure:** Cloudflare Workers + D1 database  
**Authentication:** Shared secret token  
**Reusability:** ⭐⭐ (Architecture-specific, not portable)  
**Selfprint Fit:** Can be re-architected for Vercel/Supabase

---

## PART F: PROMPT SYSTEM (brain/prompts/)

### Tiered Prompts
- **free.js:** Basic prompt + style budget
- **pro.js:** Enhanced prompt + longer responses
- **elite.js:** Premium prompt + full features

**Structure:** Word budget + example count + detail level  
**Reusability:** ⭐⭐⭐ (Adapt for Selfprint tier system)  
**Selfprint Fit:** YES - Selfprint users all get "pro" experience

---

## PART G: INTEGRATION READINESS MATRIX

| Component | Readiness | Effort | Risk | Priority |
|-----------|-----------|--------|------|----------|
| Psychology module | ✅ Ready | Low | Low | P0 |
| Numerology module | ✅ Ready | Low | Low | P0 |
| Memory system | ✅ Ready | Medium | Low | P1 |
| Coach agent | ✅ Ready | Medium | Medium | P1 |
| Insight agent | ✅ Ready | Medium | Medium | P1 |
| Human Design module | ✅ Ready | Low | Low | P2 |
| Vedic module | ✅ Ready | Low | Low | P2 |
| Thai Astrology | ✅ Ready | Low | Low | P2 |
| Bazi module | ✅ Ready | Low | Medium | P3 |
| Blood Type module | ✅ Ready | Low | Low | P3 |
| Gateway + Orchestrator | ✅ Ready | High | High | P0 |
| Worker architecture | ⚠️ Partial | High | High | REDESIGN |

---

## SUMMARY: What Astrovera Brings to Selfprint

### Must-Have (P0)
1. Psychology knowledge module (Decision archetype analysis)
2. Gateway + Orchestrator (Routing & multi-domain synthesis)
3. Memory context building (Sophisticated context)

### Should-Have (P1)
4. Coach + Insight agents (Decision guidance)
5. Numerology module (Life Path enhancement)

### Nice-to-Have (P2+)
6. Optional astrology modules (Cosmic perspective)
7. Persona system (Speaking voice)
8. Confidence scoring (Multi-source synthesis)

### Don't Need
- Astra/Nova UI components
- Astrovera's entire frontend
- Astrovera's worker architecture (redesign for Vercel/Supabase)
- Blood type module (too niche)

---

**Document Complete** ✅  
**Status:** Ready for API Design (STEP 12)
