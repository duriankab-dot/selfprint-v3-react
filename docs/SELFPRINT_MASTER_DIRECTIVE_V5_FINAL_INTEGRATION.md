# SELFPRINT V3 — MASTER INTEGRATION DIRECTIVE (เอกสารภาษาไทยตัวเดียวกันที่ต้องอัพเดทตาม)
## FINAL AUTHORITATIVE PRODUCTION DIRECTIVE — TWIN / CORE AWAKENING / WORLD ROUTING / NOVA / i18n / SEO-GEO
**Version:** 5.0  
**Status:** AUTHORITATIVE — SUPERSEDES CONFLICTING LEGACY DOCUMENTS  
**Project Root:**D:\selfprint-v3-react
**Repository:** `duriankab-dot/selfprint-v3-react`  
**Current audit reference:** `6d093e7`  
**Date:** 19 August 2026

---

# 0. AUTHORITY / SOURCE OF TRUTH

This document is the **single authoritative development directive** for SELFPRINT V3.

It consolidates the intent of:

1. `SELFPRINT_MASTER_DIRECTIVE_TH_FINAL.md`
2. `SELFPRINT — 12 HUB WORLDS VISUAL & EXPERIENCE DIRECTIVE.txt`
3. The Prompt Injection / LLM architecture specification
4. The current production-gap findings from commit `6d093e7`
5. The final architecture decisions made after the latest audit:
   - Login → Onboarding → Full Analysis → Core Awakening → Twin Birth → World Routing
   - Existing-user recovery / resume
   - Twin is intelligent at birth
   - NOVA and Twin are separate responsibilities
   - World Routing is a full-screen experience
   - 12 Worlds affect intelligence context, not only visuals
   - Shared World State drives both AI prompting and visual rendering

## 0.1 Evidence hierarchy

When any document conflicts with reality, use this order:

```text
1. Actual Production Code
        ↓
2. Database Schema / Migrations / RLS
        ↓
3. API / Edge implementation
        ↓
4. Automated Tests / E2E / Test Runner output
        ↓
5. Production verification / smoke tests
        ↓
6. Documentation
```

Documentation is **not evidence of implementation**.

Therefore:

```text
"Complete" in a document ≠ Complete
"PASS" in a document ≠ PASS
File exists ≠ Feature exists
Component renders ≠ Feature complete
Commit exists ≠ Implementation verified
Architecture exists ≠ Production ready
```

Any legacy document that conflicts with this directive is **OBSOLETE** and must not be used to justify implementation status.

Do not rewrite code to satisfy an obsolete document.

---

# 1. FINAL PRODUCT DEFINITION

SELFPRINT is a:

> **Living Personal Intelligence Platform**

It is not:

- a horoscope product
- a fortune-telling product
- a game
- a generic AI chatbot
- a static personality test
- a simple AI companion

Core principle:

```text
SELFPRINT does not merely talk to the user.
SELFPRINT understands the user.
```

The product loop is:

```text
Understand
→ Remember
→ Reflect
→ Detect Patterns
→ Analyze
→ Recommend
→ Learn
→ Adapt
→ Evolve
```

The final experience must connect:

```text
USER
→ SELFPRINT / NOVA
→ FULL ANALYSIS
→ CORE AWAKENING
→ TWIN BIRTH
→ WORLD ROUTING
→ 12 INTELLIGENCE WORLDS
→ NOVA + TWIN
→ MEMORY
→ DECISION INTELLIGENCE
→ LEARNING
→ TWIN EVOLUTION
```

---

# 2. NON-NEGOTIABLE ARCHITECTURE CONSTRAINTS

## 2.1 API count is LOCKED

```text
12 APIs maximum.
```

There must never be an API #13.

New capabilities must use:

```text
Existing API
+
Supabase Edge orchestration
+
Shared services
+
SICE
+
Database
```

Do not create one API per feature.

---

# 3. THE CORE USER LIFECYCLE — MUST BE RESTORED

The current critical UX problem is that the user can complete Full Analysis and then lose the intended transition into Core Awakening / Twin Birth / World Routing.

This is a P0 integration defect.

## 3.1 New user canonical flow

```text
LANDING
   ↓
SIGN UP / LOGIN
   ↓
ONBOARDING
   ↓
FULL ANALYSIS
   ↓
CORE AWAKENING
   ↓
TWIN BIRTH
   ↓
WORLD ROUTING — FULL SCREEN
   ↓
12 INTELLIGENCE WORLDS
   ↓
NOVA + TWIN
```

The Full Analysis completion state must explicitly route to Core Awakening.

There must be no dead-end dashboard transition between Full Analysis and Awakening.

---

# 4. EXISTING USER RECOVERY / RESUME

Users who have already logged in, completed analysis, or already have a Twin must not be forced through the journey again.

On authenticated entry, the application must resolve the persisted lifecycle state.

Minimum state resolution:

```text
AUTHENTICATED
   ↓
Resolve persisted user state
   ↓
Determine next valid state
```

Examples:

```text
Analysis incomplete
→ continue Analysis

Analysis complete + Awakening incomplete
→ Core Awakening

Awakening complete + Twin absent
→ Twin Birth

Twin exists + World Routing incomplete
→ World Routing

Twin exists + World Routing complete
→ last active / default World
```

## 4.1 Existing-user entry point

Dashboard must provide an explicit entry such as:

```text
ENTER YOUR TWIN
```

or

```text
CONTINUE TO YOUR WORLDS
```

The exact label may be optimized by UX, but the capability is mandatory.

It must never disappear merely because the user has already logged in previously.

---

# 5. PERSISTED LIFECYCLE STATE

Do not use `sessionStorage` or local state as the source of truth for critical lifecycle state.

Critical state must persist in Supabase / backend-authoritative storage.

Minimum state model:

```text
AUTHENTICATED
ONBOARDING_REQUIRED
ONBOARDING_COMPLETE
ANALYSIS_READY
ANALYSIS_COMPLETE
AWAKENING_REQUIRED
AWAKENING_COMPLETE
TWIN_BIRTH_REQUIRED
TWIN_ALIVE
WORLD_ROUTING_READY
WORLD_ACTIVE
```

The implementation may use an equivalent schema, but it must provide deterministic state resolution.

Refresh, logout/login, browser restart, and returning users must resume correctly.

---

# 6. CORE AWAKENING

Core Awakening is not a decorative screen.

It is the bridge between:

```text
SELFPRINT's understanding of the user
```

and

```text
the user's personal AI Twin
```

The existing product concept defines Core Awakening as a ceremony rather than a simple transition.

Required sequence:

```text
FULL ANALYSIS COMPLETE
        ↓
SELFPRINT / NOVA FINAL GUIDE MOMENT
        ↓
"Your intelligence core is ready."
        ↓
CORE AWAKENING
        ↓
TWIN BIRTH
        ↓
INITIAL INTELLIGENCE STATE
        ↓
WORLD ROUTING
```

---

# 7. TWIN BIRTH — "BORN INTELLIGENT"

This is a critical change.

The Twin must **not** be born as an empty avatar or empty chatbot.

Twin Birth must synthesize available user intelligence before the Twin becomes active.

Minimum inputs:

```text
Onboarding data
+
Full Analysis
+
Initial Personal Intelligence
+
Relevant SICE outputs
+
Initial personal context
+
Initial memory/context
+
Twin identity configuration
+
Visual DNA
```

Result:

```text
TWIN BIRTH
   ↓
Twin Identity
+
Initial State
+
Initial Memory / Context
+
Initial Expertise Baseline
+
Visual DNA
+
Evolution State
+
Ready-to-interact Twin
```

The Twin's first active state must already contain enough grounded context to demonstrate:

> "I know you."

It must not hallucinate knowledge that was never provided or inferred from valid system data.

---

# 8. TWIN IDENTITY MUST BE PERSISTENT

Twin identity is created once and persists across all Worlds.

Changing World must never create a new Twin.

Architecture:

```text
TWIN IDENTITY
├── twin_id
├── user_id
├── name
├── archetype / identity data
├── visual_dna
├── personality_state
├── evolution_state
├── learning_state
└── timestamps
```

The exact DB schema may differ, but the semantic contract is mandatory.

---

# 9. TWIN VISUAL DNA

Twin Visual DNA must be created/persisted at or immediately after Core Awakening / Twin Birth.

It must not be regenerated randomly whenever a World opens.

Concept:

```text
USER
+
PERSONAL INTELLIGENCE
+
ARCHETYPE / PROFILE
+
PREFERENCES
+
TWIN STATE
        ↓
UNIQUE TWIN
```

The same Twin must remain recognizable across all 12 Worlds.

World changes:

```text
Environment
Mood
Lighting
Motion
Expert Role
Context
```

but does not change:

```text
Twin Identity
Twin Core Identity
Core Visual DNA
```

The 12 Worlds visual directive explicitly requires a unique Twin Visual DNA and states that Hub changes must preserve Twin Identity.

---

# 10. NOVA vs TWIN — STRICT SEPARATION

SELFPRINT must not treat NOVA and the user's Twin as the same entity.

## 10.1 NOVA

NOVA is the **system intelligence / orchestration layer**.

Responsibilities:

```text
Analyze
Synthesize
Orchestrate
Guide
Generate system-level insights
Coordinate SICE
Build context
Route intelligence
Support the user journey
```

NOVA is not the user's personal identity.

## 10.2 TWIN

Twin is the user's:

> **Personalized AI Intelligence Entity**

Responsibilities:

```text
Personalize
Reflect
Remember
Interact
Learn
Adapt
Evolve
Support decisions
Operate within Worlds
```

Twin uses:

```text
Twin Identity
+
Twin State
+
Memory
+
User Context
+
Active World
+
Relevant Intelligence
```

## 10.3 Relationship

```text
NOVA
  ↓
System Intelligence / Orchestration
  ↓
SICE / Context / Prompt
  ↓
TWIN
  ↓
Personalized interaction
```

NOVA must not impersonate the user's Twin.

Twin must not claim system capabilities it does not possess.

---

# 11. 12 WORLDS — INTELLIGENCE WORLDS

The 12 Worlds are locked:

```text
01 SELF
02 MIND
03 RELATIONSHIP
04 LOVE
05 CAREER
06 WEALTH
07 LIFE
08 GROWTH
09 DECISION
10 PURPOSE
11 WELLBEING
12 FUTURE
```

They are not:

```text
12 tabs
12 categories
12 backgrounds
12 static pages
```

They are:

> **12 Intelligence Worlds in which the same Twin operates under different expertise and contextual rules.**

Each World must have at minimum:

```text
Environment
+
Expertise
+
Conversation Context
+
Learning Context
+
Insight Context
+
Twin Role
+
Visual State
```

The existing visual directive explicitly requires World → Visual → Twin → Expertise → Conversation → Learning → Insight → Growth to operate as one experience.

---

# 12. WORLD ROUTING — FULL-SCREEN EXPERIENCE

World Routing must be implemented as a full-screen experience, not merely route navigation.

Canonical flow:

```text
USER SELECTS WORLD
        ↓
WORLD ROUTER
        ↓
WORLD CONTEXT RESOLUTION
        ↓
FULL-SCREEN WORLD ENVIRONMENT
        ↓
TWIN APPEARS
        ↓
WORLD-SPECIFIC VISUAL STATE
        ↓
TWIN BECOMES EXPERT IN THAT CONTEXT
        ↓
NOVA / TWIN ACTIVE
        ↓
CONVERSATION
        ↓
INSIGHT
        ↓
LEARNING
```

When a user enters a World:

```text
World A
→ Environment A
→ Expertise A
→ Context A
→ Mood A
→ Twin in A
```

Switching:

```text
World B
→ Environment B
→ Expertise B
→ Context B
→ Mood B
→ SAME TWIN in B
```

Twin Identity must remain unchanged.

---

# 13. WORLD REGISTRY — SINGLE SOURCE OF WORLD CONTEXT

Do not hardcode 12 separate prompt implementations.

Create/use a centralized World Registry / World Context configuration.

Conceptual structure:

```json
{
  "world_id": "world_06",
  "name": "WEALTH",
  "role": "Wealth Intelligence Expert",
  "objective": "Understand money, wealth, assets, risk and financial behavior.",
  "rules": [],
  "tone": "Strategic / Precise",
  "visual": {
    "environment": "quantum_exchange",
    "accent": "gold",
    "motion": "data_network"
  },
  "learning_targets": [],
  "insight_targets": []
}
```

This is an architectural example, not a requirement to copy the exact JSON.

Configuration must be data-driven and provider-independent.

---

# 14. PROMPT INJECTION ARCHITECTURE

Prompt composition must be separated from application logic and LLM provider implementation.

Minimum conceptual structure:

```text
LLM SYSTEM PROMPT

CORE_IDENTITY
+
NOVA_SYSTEM_CONTEXT
+
TWIN_IDENTITY
+
TWIN_STATE
+
ACTIVE_WORLD
+
USER_CONTEXT
+
RELEVANT_MEMORY
+
SICE_CONTEXT
+
SYSTEM_RULES

        ↓

LLM USER PROMPT

USER_INPUT
```

Do not mix database records, UI strings, world rules, and model-specific code into one hardcoded prompt.

---

# 15. ACTIVE WORLD ONLY BY DEFAULT

For small / fast models:

```text
CORE
+
TWIN
+
ACTIVE WORLD
+
RELEVANT CONTEXT
+
RELEVANT MEMORY
+
USER INPUT
```

Do not send all 12 World instructions on every request.

This reduces:

- token cost
- latency
- prompt confusion
- irrelevant context

---

# 16. CROSS-WORLD CONTEXT

Cross-World reasoning must be explicit and controlled.

Do not allow the model to silently load arbitrary World instructions.

Default:

```text
ACTIVE WORLD ONLY
```

Cross-World mode:

```text
ACTIVE WORLD
+
EXPLICIT / SYSTEM-AUTHORIZED SECONDARY WORLDS
```

Example:

```json
{
  "active_world": "decision",
  "secondary_worlds": [
    "wealth",
    "career"
  ]
}
```

Only relevant context should be injected.

---

# 17. LLM PROVIDER INDEPENDENCE

Prompt architecture must not depend on one specific model.

Today the system may use Anthropic Claude.

Future models may include other providers.

The following must remain provider-independent:

```text
Twin Identity
World Registry
World Rules
User Context
Memory
SICE outputs
Decision intelligence
Prompt composition contract
```

Changing the LLM must not require rewriting the 12 World intelligence system.

Provider-specific adapters may optimize:

```text
token budget
verbosity
reasoning depth
format
latency
```

but must not alter the underlying product intelligence model.

---

# 18. DATA-DRIVEN OPPORTUNITY INTELLIGENCE

SELFPRINT must not use random prediction or supernatural claims.

Use:

```text
Observed behavior
+
Activities
+
Do / Reflect / Practice
+
Decision history
+
Outcomes
+
Personal patterns
+
Current context
+
Relevant SICE signals
```

to derive:

```text
Patterns
→ Evidence
→ Confidence
→ Opportunity signals
→ Possible future windows
```

Use terminology such as:

> **Opportunity Intelligence**
> or
> **Predictive Opportunity Analysis**

Do not position this as fortune-telling.

Never claim deterministic knowledge of the future.

DECISION World must analyze:

```text
Options
Risks
Trade-offs
Scenarios
Potential outcomes
```

not guarantee outcomes.

---

# 19. MEMORY — TWIN CONTINUITY

Memory is not complete merely because a memory table/service exists.

Verify:

```text
Create
Retrieve
Relevance
Update
Persistence
Delete
User Isolation
World Context
Twin Context
Decision Context
```

Memory must survive:

```text
Refresh
Logout/Login
New session
World switching
```

Only user-authorized / system-grounded context may be injected into the Twin.

---

# 20. TWIN LEARNING LOOP

Twin must learn from real interactions and outcomes.

Required conceptual loop:

```text
USER ACTION
↓
OBSERVATION
↓
INSIGHT
↓
MEMORY
↓
LEARNING
↓
TWIN STATE UPDATE
↓
FUTURE CONTEXT
```

For decisions:

```text
Decision
↓
Prediction / Confidence
↓
Follow-up
↓
30d
↓
90d
↓
180d
↓
365d
↓
Actual Outcome
↓
Outcome Score
↓
Pattern
↓
Learning
↓
Twin / SICE update
```

The existing product vision explicitly treats follow-up and learning as a core differentiator.

---

# 21. 12 WORLD VISUAL SYSTEM

All Worlds share the Selfprint visual DNA:

```text
Deep Intelligent Blue
+
Holographic Intelligence
+
Energy
+
Light
+
Data Structures
+
Glass / Crystal
+
Volumetric Light
+
Cinematic Depth
+
Premium Minimalism
```

Avoid:

```text
Game-like UI
Excessive neon
Cartoon
Fantasy game aesthetics
Opaque backgrounds that hide Twin
Text embedded in World assets
UI embedded in World assets
```

Secondary accents are contextual only.

```text
SELF          Cyan
MIND          Electric Violet
RELATIONSHIP  Soft Cyan
LOVE          Violet
CAREER        Silver
WEALTH        Gold
LIFE          Azure
GROWTH        Emerald
DECISION      Ice Blue
PURPOSE       Indigo
WELLBEING     Teal
FUTURE        Blue-White
```

Deep Intelligent Blue remains the brand foundation.

---

# 22. WORLD ASSET RULES

World assets are environment layers, not web pages.

Production target:

```text
PNG
RGBA / 32-bit
4096 × 4096
Transparent alpha
Layer-friendly
High detail
Clean edges
Responsive cropping
Center-safe composition
```

Central negative space must allow:

```text
Twin Core
Twin Body
Interaction
```

World assets must not contain:

```text
Navigation
Buttons
Cards
Text
Logo
UI
Chat bubbles
Character
User avatar
```

UI is a separate layer.

---

# 23. VISUAL STATE CONTRACT

The visual engine and intelligence engine must consume compatible World State.

Conceptually:

```text
WorldState
├── world_id
├── environment
├── mood
├── lighting
├── motion
├── expertise
├── interaction_mode
└── twin_visual_state
```

The same World State must drive:

```text
VISUAL ENGINE
+
PROMPT ENGINE
```

This prevents the UI from showing one World while AI behaves as another.

---

# 24. WORLD-SPECIFIC TWIN BEHAVIOR

When entering a World:

```text
Same Twin Identity
+
World Expertise
+
World Context
+
Relevant Memory
+
SICE Context
```

Example:

```text
WEALTH
→ Wealth Intelligence Expert

CAREER
→ Career Strategist

DECISION
→ Decision Strategist

FUTURE
→ Future & Possibility Strategist
```

The Twin does not become a different character.

It becomes the same Twin operating with a different expert context.

---

# 25. USER OVERRIDE

AI may recommend:

```text
World
Topic
Question
Insight
Learning action
```

but the user always retains control.

AI recommendations must never silently override the user's selected World or user intent.

---

# 26. INTERNATIONALIZATION / LANGUAGE

The Master Directive retains:

```text
selfprint.one/
selfprint.one/en/
selfprint.one/th/
```

with Thai as the primary market language and English as the global language.

Required:

```text
Hreflang
Localized metadata
Localized UI
Localized SEO copy
Localized email templates
Localized notifications
Currency localization
Payment localization
```

Thai and English must be treated as first-class supported locales, not machine-translated afterthoughts.

Do not hardcode language-specific strings into business logic.

---

# 27. LANDING PAGE

Landing must communicate the correct positioning immediately:

> Selfprint is a Personal Intelligence Platform.

Do not lead with:

```text
Horoscope
Astrology
Fortune telling
Cosmic energy
```

Use the product concepts locked by the Master Directive:

```text
Initial State Matrix
Behavioral Pattern Recognition
Living Personal Intelligence
AI Twin
12 Intelligence Worlds
Decision Intelligence
```

Landing must connect naturally into:

```text
Landing
→ Signup/Login
→ Onboarding
→ Full Analysis
→ Core Awakening
```

No landing CTA may lead users into a dead-end route.

---

# 28. SEO / GEO

SEO/GEO is part of production, not optional documentation.

Required verification:

```text
Title
Meta description
Canonical
Open Graph
Twitter/X metadata
Structured data
Organization schema
SoftwareApplication schema
Article schema where appropriate
FAQ schema where appropriate
Hreflang
Sitemap
Robots
Localized URLs
Internal linking
Thai content
English content
Geo-relevant landing content
```

GEO means content must be structured so modern search / AI discovery systems can understand:

```text
What Selfprint is
Who it is for
What the Twin does
What the 12 Worlds are
How it differs from fortune telling
How decision intelligence works
```

Do not claim SEO/GEO is complete from the existence of JSON-LD alone.

It must be crawl-verified.

---

# 29. SECURITY

Security is not PASS until implementation and tests prove it.

Verify:

```text
Authentication
Authorization
RLS
User isolation
API security
Edge security
Input validation
Rate limiting
CSRF / origin protections where applicable
Session handling
Secrets
Error leakage
```

The commit history already introduced rate limiting / validation work, but implementation presence alone is not sufficient for the production gate.

---

# 30. PERFORMANCE

Targets are not proof.

Verify real measurements for:

```text
Initial load
Dashboard
World transition
Twin render
AI response
Database queries
N+1 behavior
Mobile
Desktop
Core Web Vitals
Lighthouse
```

World switching should feel immediate while large visual assets load progressively.

Use:

```text
Lazy loading
Preloading where justified
Asset compression
Caching
Progressive rendering
```

Do not block the user on unnecessary large assets.

---

# 31. ERROR HANDLING

Every critical flow must have recoverable failure states.

Required:

```text
Network failure
LLM timeout
Edge failure
Database failure
Auth expiration
Missing Twin
Missing World
Invalid state
Incomplete onboarding
Corrupted / missing memory
Asset loading failure
```

Never leave the user at a blank screen.

Every state must provide:

```text
Recovery
Retry
Resume
Safe fallback
```

---

# 32. TESTING — NO CLAIM WITHOUT TEST EVIDENCE

Minimum test layers:

```text
Unit
Integration
Frontend
API / Edge
Database
AI / Prompt
E2E
Regression
```

Critical E2E:

```text
Landing
→ Signup
→ Onboarding
→ Full Analysis
→ Core Awakening
→ Twin Birth
→ World Routing
→ World 01
→ World 06
→ World 12
→ NOVA
→ Twin conversation
→ Memory
→ Decision
→ Follow-up
→ Outcome
→ Reload
→ Logout/Login
→ Resume
```

Existing-user E2E:

```text
Existing user
→ Login
→ Resolve persisted state
→ Continue
→ Twin / World Routing
```

World E2E:

```text
Select World
→ Full-screen environment
→ Correct Twin
→ Correct World context
→ Correct prompt
→ Correct expertise
→ Memory isolation / relevance
→ Switch World
→ Twin identity preserved
```

---

# 33. TEST COVERAGE

Target:

```text
>80%
```

But the reported number must come from the actual test runner.

Never estimate coverage.

Never copy a coverage number from an old document.

---

# 34. PRODUCTION VERIFICATION

Separate:

```text
READY TO DEPLOY
```

from:

```text
PRODUCTION VERIFIED
```

Production Verified requires actual evidence.

Minimum release gate:

```text
TypeScript = 0 errors
Lint = PASS
Build = PASS
Unit = PASS
Integration = PASS
E2E = PASS
Coverage >80%
Security = PASS
Database = PASS
API = PASS
Edge = PASS
AI = PASS
Twin = PASS
Worlds = PASS
Mobile = PASS
Desktop = PASS
Performance = PASS
SEO/GEO = PASS
Production Smoke Test = PASS
Monitoring = ACTIVE
```

---

# 35. DOCUMENTATION GOVERNANCE

The project must have one authoritative status document:

```text
docs/PROJECT_STATUS.md
```

It must report:

```text
Current Version
Current Commit
Architecture
API Count
Edge Count
SICE Count
World Count
Twin Status
NOVA Status
Completed
Partial
Missing
Blocked
Tests
Coverage
Security
Performance
SEO/GEO
i18n
Production Status
Documentation Status
Remaining Work
Last Verified
```

Also maintain:

```text
docs/MASTER_GAP_MATRIX_CURRENT.md
```

Allowed status values:

```text
MISSING
PARTIAL
IMPLEMENTED
VERIFIED
PRODUCTION READY
BLOCKED
```

The Gap Matrix must be generated from the latest code/test/database reality.

Never copy an old audit and rename it "current".

---

# 36. STATUS CLAIM RULE

Never report:

```text
Phase Complete = Product Complete
Architecture Complete = Production Complete
P0 Cleanup = Production Complete
File Exists = Feature Complete
Commit Exists = Verified
UI Rendered = Feature Complete
```

A module is `PRODUCTION READY` only when all relevant layers pass:

```text
UI
Business Logic
API / Edge
Database
AI
Persistence
Security
Error Handling
Unit
Integration
E2E
Mobile
Desktop
Performance
Production Verification
Documentation
```

Missing one critical layer = not Production Ready.

---

# 37. CARRY-FORWARD GAPS FROM 6d093e7 REVIEW

The following must be treated as integration/verification work until proven closed by current code + tests:

1. Full Analysis → Core Awakening transition
2. Existing-user entry / resume path
3. Core Awakening → Twin Birth integration
4. Twin Birth → World Routing integration
5. Full-screen World Routing
6. 12 World runtime context routing
7. World-specific prompt injection
8. Twin identity preservation across Worlds
9. Twin Visual DNA persistence
10. NOVA / Twin responsibility separation
11. Memory persistence and relevance
12. Decision learning loop
13. E2E critical journey
14. Security verification
15. Performance verification
16. SEO/GEO crawl verification
17. Documentation reconciliation

A previously implemented service/component must be re-verified if its end-to-end connection is not proven.

---

# 38. CRITICAL IMPLEMENTATION RULE — DO NOT PATCH AROUND THE ARCHITECTURE

Before creating anything:

```text
Search existing code
→ Identify existing service
→ Identify existing API
→ Identify existing Edge
→ Identify existing DB
→ Identify existing component
→ Reuse / integrate
```

Do not duplicate:

```text
Twin service
World router
Prompt builder
Memory service
NOVA service
API
World registry
```

If an existing component is incomplete, complete it rather than creating a parallel replacement unless there is documented architectural justification.

---

# 39. IMPLEMENTATION ORDER

Do not expand features.

Execute in this order:

## P0-A — Restore lifecycle

```text
Login
→ Onboarding
→ Full Analysis
→ Core Awakening
→ Twin Birth
→ World Routing
```

## P0-B — Existing user recovery

```text
Persisted state resolver
+
Dashboard entry
+
Resume
```

## P0-C — Intelligent Twin Birth

```text
Analysis
+
SICE
+
Context
+
Memory baseline
+
Visual DNA
→
Twin
```

## P0-D — World Registry / Routing

```text
World Registry
→ World Context
→ Full-screen Environment
→ Twin
```

## P0-E — NOVA / Twin architecture

Separate responsibilities and prompt context.

## P0-F — Prompt Builder

Implement:

```text
CORE
+
NOVA
+
TWIN
+
WORLD
+
CONTEXT
+
MEMORY
+
SICE
```

## P0-G — 12 World intelligence

Verify all 12 Worlds end-to-end.

## P0-H — Visual World integration

Connect:

```text
World State
→ Environment
→ Twin Visual State
→ Motion
→ Lighting
→ Interaction
```

## P0-I — Memory / Learning / Decision

Close the learning loop.

## P0-J — Security / Performance / SEO-GEO / i18n

Verify production conditions.

## P0-K — Full E2E / Production Smoke Test

Only after all critical integration is complete.

## P0-L — Documentation lock

Update:

```text
PROJECT_STATUS.md
MASTER_GAP_MATRIX_CURRENT.md
```

Then archive conflicting legacy docs.

---

# 40. DEV EXECUTION METHOD

For every module:

```text
AUDIT
↓
FIND EXISTING IMPLEMENTATION
↓
DEFINE GAP
↓
IMPLEMENT
↓
INTEGRATE
↓
UNIT TEST
↓
INTEGRATION TEST
↓
E2E TEST
↓
VERIFY
↓
DOCUMENT
↓
LOCK
```

Do not jump from:

```text
IMPLEMENT
```

to:

```text
DONE
```

---

# 41. FINAL PRODUCT EXPERIENCE

The intended final experience is:

```text
LANDING
   ↓
LOGIN / SIGNUP
   ↓
ONBOARDING
   ↓
SELFPRINT / NOVA
   ↓
FULL ANALYSIS
   ↓
CORE AWAKENING
   ↓
TWIN BIRTH
   ↓
TWIN IS ALREADY INTELLIGENT
   ↓
FULL-SCREEN WORLD ROUTING
   ↓
USER SELECTS WORLD
   ↓
WORLD ENVIRONMENT OPENS
   ↓
SAME PERSONAL TWIN APPEARS
   ↓
TWIN ADOPTS WORLD EXPERTISE
   ↓
NOVA + SICE PROVIDE SYSTEM INTELLIGENCE
   ↓
TWIN INTERACTS
   ↓
INSIGHT
   ↓
ACTION
   ↓
MEMORY
   ↓
LEARNING
   ↓
TWIN EVOLUTION
```

The desired emotional result:

> **“I am entering this world with my Twin, and in this world my Twin understands this part of my life deeply.”**

---

# 42. FINAL DEFINITION OF DONE

SELFPRINT V3 is not Production Ready until:

```text
[ ] Login → Onboarding works
[ ] Full Analysis → Core Awakening works
[ ] Core Awakening → Twin Birth works
[ ] Twin is intelligent at birth
[ ] Twin persists
[ ] Twin Visual DNA persists
[ ] Existing user can resume
[ ] World Routing exists
[ ] World Routing is full-screen
[ ] All 12 Worlds route correctly
[ ] World context affects AI
[ ] World context affects visuals
[ ] Twin identity persists across Worlds
[ ] NOVA and Twin responsibilities are separated
[ ] Prompt injection is provider-independent
[ ] Active World is the default context
[ ] Cross-World context is controlled
[ ] Memory persists and is relevant
[ ] Decision learning loop works
[ ] Security verified
[ ] Performance verified
[ ] i18n verified
[ ] SEO/GEO verified
[ ] Unit tests pass
[ ] Integration tests pass
[ ] E2E tests pass
[ ] Coverage >80%
[ ] Mobile verified
[ ] Desktop verified
[ ] Production smoke test passes
[ ] Monitoring active
[ ] PROJECT_STATUS.md synchronized
[ ] MASTER_GAP_MATRIX_CURRENT.md synchronized
```

One missing critical item means:

```text
NOT PRODUCTION READY
```

---

# 43. FINAL COMMAND TO AI DEV / CODEX

> **STOP FEATURE EXPANSION.**
>
> Do not add new product features.
>
> Your task is to integrate and production-verify the existing SELFPRINT V3 system.
>
> Start by auditing the current repository and database state. Do not trust old documentation, previous completion claims, or commit messages without implementation/test evidence.
>
> Restore and verify the complete lifecycle:
>
> **Login → Onboarding → Full Analysis → Core Awakening → Intelligent Twin Birth → Full-Screen World Routing → 12 Intelligence Worlds → NOVA + Twin → Memory → Decision Intelligence → Learning → Twin Evolution.**
>
> Existing authenticated users must have a persistent entry point to continue into their Twin / Worlds without repeating completed onboarding.
>
> Twin must be intelligent at birth using grounded user analysis/context. Twin identity and Visual DNA must persist across all 12 Worlds.
>
> World Routing must be a full-screen experience. Switching Worlds changes environment, expertise, context, mood and AI behavior, while preserving the same Twin identity.
>
> NOVA and Twin must be architecturally separated.
>
> Prompt construction must use modular system variables:
>
> `CORE_IDENTITY + NOVA_CONTEXT + TWIN_IDENTITY + TWIN_STATE + ACTIVE_WORLD + USER_CONTEXT + RELEVANT_MEMORY + SICE_CONTEXT + SYSTEM_RULES`
>
> with user input supplied separately.
>
> Load only the active World by default. Cross-World context must be explicit and controlled.
>
> Do not create API #13.
>
> Reuse existing APIs, Edge orchestration, services, SICE and database architecture.
>
> Do not use sessionStorage as a source of truth for critical lifecycle data.
>
> Complete the implementation, integration, tests, E2E, security, performance, SEO/GEO, i18n and production verification.
>
> Then update `docs/PROJECT_STATUS.md` and `docs/MASTER_GAP_MATRIX_CURRENT.md` from actual evidence.
>
> **Do not report a module as complete unless implementation + integration + tests + verification prove it.**
>
> **Do not report SELFPRINT V3 as 100% Production Ready until every production gate passes.**

---

# 44. RELEASE PRINCIPLE

The final target is:

```text
ONE CODEBASE
ONE SOURCE OF TRUTH
12 APIs — LOCKED
EDGE-ORCHESTRATED
NOVA + TWIN — CLEARLY SEPARATED
12 SICE / INTELLIGENCE ENGINES
12 WORLDS
FULL CORE AWAKENING
INTELLIGENT TWIN BIRTH
FULL TWIN PERSISTENCE
FULL MEMORY
FULL DECISION INTELLIGENCE
FULL WORLD ROUTING
FULL VISUAL WORLD EXPERIENCE
FULL SECURITY
FULL TESTING
FULL i18n
FULL SEO/GEO
FULL PRODUCTION VERIFICATION
DOCUMENTATION SYNCHRONIZED
```

**Only then:**

```text
SELFPRINT V3 = 100% PRODUCTION READY
```
