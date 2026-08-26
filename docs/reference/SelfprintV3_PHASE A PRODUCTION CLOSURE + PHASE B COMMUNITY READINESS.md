SELFPRINT V3

PHASE A PRODUCTION CLOSURE & PHASE B COMMUNITY READINESS

AI DEVELOPMENT DIRECTIVE — FINAL EXECUTION ORDER

Project: SELFPRINT V3
Repository: "duriankab-dot/selfprint-v3-react"
Current Objective: Complete and production-verify the existing SELFPRINT product before introducing Community/Social functionality.

---

1. EXECUTIVE DIRECTIVE

AI Developer MUST follow this execution order:

«PHASE A FIRST → FULL VERIFICATION → PRODUCTION RELEASE → ONLY THEN PHASE B»

Do NOT begin implementing Community/Social UI or Community business logic during Phase A.

The current SELFPRINT architecture, business logic, lifecycle, SICE systems, Twin systems, Worlds, Memory, Learning, and existing product flows are the foundation.

Do not redesign the core architecture merely to prepare for Community.

Do not rewrite working logic simply because a future UX concept may be different.

The objective is to make the current product real, complete, stable, persistent, secure, tested, and production-verified first.

---

2. NON-NEGOTIABLE RULE

PRESERVE EXISTING LOGIC

During Phase A:

- Do NOT replace working business logic.
- Do NOT rewrite working services without a demonstrated defect.
- Do NOT replace the existing lifecycle with a new lifecycle.
- Do NOT restructure the repository merely for aesthetics.
- Do NOT introduce a parallel architecture.
- Do NOT create duplicate services/components for future Community.
- Do NOT migrate stable functionality unnecessarily.
- Do NOT change existing API contracts unless required to fix a verified production defect.
- Do NOT break existing database contracts.
- Do NOT remove existing functionality merely to simplify implementation.
- Do NOT introduce speculative abstractions.

Any structural change must have a concrete Phase A production justification.

---

3. CANONICAL EXISTING PRODUCT JOURNEY

The current existing product journey must remain authoritative unless an actual defect requires correction.

The expected journey is conceptually:

LANDING
   ↓
ENTRY / START
   ↓
ONBOARDING
   ↓
EMOTION / NOVA
   ↓
BIRTH DATA
   ↓
INITIAL BLUEPRINT
   ↓
FINE-TUNING
   ↓
FULL ANALYSIS
   ↓
ACCOUNT / PERSISTENCE
   ↓
CORE AWAKENING
   ↓
WOW2
   ↓
WOW3 / TWIN BIRTH
   ↓
TWIN / PERSONAL INTELLIGENCE
   ↓
WORLDS
   ↓
MEMORY / LEARNING / EVOLUTION

The exact implementation already present in the repository must be inspected and preserved.

Do not invent a second onboarding flow.

Do not replace Full Analysis with a new analysis system.

Do not replace WOW2/WOW3/Twin Birth with a new ceremony.

Improve UX continuity only where required, without changing the underlying product logic.

---

4. PHASE A — PRODUCTION CLOSURE

Phase A includes ALL existing product functionality, not only onboarding.

AI Developer must audit and verify:

4.1 Landing

Verify:

- Current LandingPage implementation.
- All CTA paths.
- Quick Analysis path.
- Full Journey path.
- Smart Entry behavior.
- Returning-user behavior.
- UTM/ref handling.
- Language behavior.
- SEO/GEO/AEO implementation.
- Responsive/mobile behavior.
- No broken CTA.
- No dead route.
- No misleading marketing promise versus actual implementation.

Do not redesign the entire Landing yet.

If UX refinement is required, preserve the existing functionality and funnel logic.

---

5. PHASE A — APP TRANSITION

The intended UX direction is:

PUBLIC LANDING
      ↓
USER DECIDES TO START
      ↓
FULLSCREEN APP EXPERIENCE

After entering the actual product journey, the interface should progressively feel like an application rather than a conventional marketing website.

However:

Do NOT rewrite the onboarding engine.

Improve the transition and presentation layer around the existing flow.

The objective is:

«Website → seamless transition → product experience»

not:

«Website → second unrelated application.»

---

6. PHASE A — ONBOARDING

Audit the actual current "Onboarding.tsx" and every component/service it calls.

Verify the complete real flow:

Emotion
   ↓
Nova
   ↓
AI Creation
   ↓
Birth Data
   ↓
Initial Blueprint
   ↓
Fine-Tuning
   ↓
Full Analysis
   ↓
Claim / Save / Persistence
   ↓
Core Awakening

Requirements:

- Every transition must work.
- Refresh/reload behavior must be safe.
- Back navigation must not corrupt state.
- Partial progress must recover correctly where intended.
- User data must persist correctly.
- Error states must be explicit.
- Loading states must be truthful.
- No fake completion.
- No silent failure.
- No dead-end screen.
- Mobile UX must be production quality.

---

7. PHASE A — FULL ANALYSIS

Full Analysis is an existing core product capability.

DO NOT replace it.

Verify:

- Input integrity.
- Analysis execution.
- SICE integration.
- Result persistence.
- Result retrieval.
- Loading state.
- Error state.
- Retry behavior.
- Account/lifecycle transition.
- Correct handoff to Core Awakening.
- No duplicate analysis.
- No stale result.
- No accidental data loss.

The completion of Full Analysis must correctly continue into the existing WOW/Core Awakening lifecycle.

---

8. PHASE A — WOW2 / WOW3 / CORE AWAKENING

Preserve the existing WOW lifecycle.

Verify:

FULL ANALYSIS
     ↓
WOW2
     ↓
CORE AWAKENING
     ↓
WOW3
     ↓
TWIN BIRTH

Verify:

- Correct route/state transitions.
- Correct persistence.
- Correct Twin creation.
- Correct profile/context handoff.
- Correct refresh/re-entry behavior.
- Correct mobile presentation.
- No duplicate Twin creation.
- No broken lifecycle state.
- No route bypass.
- No fake UI-only completion.

The goal is to make the existing WOW journey production-real, not replace it.

---

9. PHASE A — TWIN

Audit the current Twin implementation.

Verify:

- Twin creation.
- Twin persistence.
- Twin retrieval.
- Profile context.
- Analysis context.
- Birth data context.
- Maturity/evolution state.
- Visual evolution.
- Twin chat/context.
- Memory integration where already implemented.
- Error handling.
- Reload behavior.
- Empty state.
- Mobile UI.

Do not redesign Twin architecture.

---

10. PHASE A — WORLDS

Audit all existing Worlds functionality.

Verify:

- World discovery.
- World detail.
- World content.
- User context.
- Twin/context handoff.
- Navigation.
- Persistence where applicable.
- Mobile behavior.
- Empty/error/loading states.

The existing Worlds architecture is important because it may later become the natural foundation for Community.

Do not convert Worlds into Social Community during Phase A.

---

11. PHASE A — MEMORY / LEARNING / EVOLUTION

Verify every existing implementation.

No feature may remain as:

- stub,
- fake data,
- placeholder,
- TODO,
- simulated API,
- fake persistence,
- disconnected UI,
- unreachable route,
- non-functional button.

Where a feature is intentionally deferred, explicitly document it as deferred rather than pretending it is complete.

---

12. PHASE A — API / DATABASE / PERSISTENCE

Verify the complete chain:

UI
 ↓
Service
 ↓
API / Edge
 ↓
Database
 ↓
Persistence
 ↓
Read-back
 ↓
UI

Every production-critical feature must work in both directions:

«WRITE → PERSIST → READ → DISPLAY»

Do not accept UI success as evidence of backend success.

Verify:

- Authentication.
- Authorization.
- Database constraints.
- RLS/security.
- API contracts.
- Edge functions.
- Error handling.
- Retry behavior.
- Idempotency where required.
- User isolation.
- Data integrity.

---

13. PHASE A — TESTING

Production readiness requires more than build success.

Run and stabilize:

Unit

Integration

Full Suite

E2E

Production Verification

Verify the critical journey end-to-end:

Landing
 ↓
Start
 ↓
Onboarding
 ↓
Birth Data
 ↓
Full Analysis
 ↓
Claim/Persistence
 ↓
WOW2
 ↓
Core Awakening
 ↓
WOW3
 ↓
Twin
 ↓
World
 ↓
Memory/Learning where applicable

A passing build alone is NOT production verification.

---

14. PHASE A — MOBILE-FIRST VERIFICATION

SELFPRINT must behave like an App on mobile.

Verify:

- No horizontal overflow.
- No clipped controls.
- No keyboard/input collision.
- No CTA hidden behind fixed elements.
- No modal blocking the primary action.
- No unusable form fields.
- Correct viewport behavior.
- Correct scrolling.
- Correct safe-area behavior.
- Correct fullscreen transitions.
- Correct touch targets.
- Correct loading transitions.

---

15. PHASE A — PRODUCTION RELEASE GATE

Phase A is NOT complete until all of the following are verified:

[ ] Build passes
[ ] TypeScript production build passes
[ ] Critical lint issues resolved or explicitly accepted
[ ] Unit tests pass
[ ] Integration tests pass
[ ] Full suite stabilized
[ ] E2E critical journey passes
[ ] Database verified
[ ] Persistence verified
[ ] API verified
[ ] Authentication verified
[ ] Authorization verified
[ ] RLS/security verified
[ ] Error handling verified
[ ] Mobile UX verified
[ ] Landing → App transition verified
[ ] Full Analysis verified
[ ] WOW2 verified
[ ] Core Awakening verified
[ ] WOW3/Twin Birth verified
[ ] Twin verified
[ ] Worlds verified
[ ] Existing Memory/Learning/Evolution verified
[ ] Production deployment verified
[ ] Production smoke test passed

Only after this gate may Phase A be declared complete.

---

16. PHASE B — COMMUNITY

Community/Social is explicitly DEFERRED.

Do NOT implement the Community product during Phase A.

Future Community concept:

«A focused social environment for people interested in self-development, self-understanding, personal growth, and better decision-making.»

Potential future capabilities:

- Community Feed
- Discussions
- Questions
- Experiences
- Reflections
- Threads
- People
- World Communities
- Following
- Public profiles
- Sharing
- Discovery
- Public knowledge
- SEO/GEO/AEO community content

These are Phase B scope.

---

17. PHASE B — PREPARATION ONLY

Although Community is deferred, Phase A implementation must avoid blocking it.

Prepare ONLY lightweight extension points where they naturally fit the existing architecture.

Examples:

Reflection
   ↓
Private
   ↓
Future: Shareable

World
   ↓
Personal Context
   ↓
Future: Community Context

Insight
   ↓
Personal Intelligence
   ↓
Future: User-controlled Sharing

Do NOT implement the Community UI.

Do NOT implement social feed ranking.

Do NOT implement likes/follows/comments unless explicitly authorized under Phase B.

Do NOT create speculative Community tables merely because they might be useful later unless a schema extension is demonstrably safe and documented.

---

18. FUTURE COMMUNITY ARCHITECTURE PRINCIPLE

The future Community should extend SELFPRINT rather than compete with it.

Target concept:

                 SELFPRINT
                     │
          ┌──────────┴──────────┐
          │ │
      PERSONAL COMMUNITY
          │ │
        Twin People
        Memory Stories
        Growth Questions
        Worlds Discussions
        Learning Experiences
          │ │
          └──────────┬──────────┘
                     │
                SELF-DEVELOPMENT

The Community should eventually leverage existing Worlds rather than create a completely separate taxonomy.

Potential future model:

WORLD
 ├── Personal Intelligence
 ├── Explore
 └── Community
       ├── Questions
       ├── Experiences
       ├── Discussions
       └── Insights

This is a future direction only.

Do not implement it during Phase A.

---

19. DO NOT CONFUSE “PREPARATION” WITH “IMPLEMENTATION”

The following are NOT allowed during Phase A:

- Building Community pages.
- Replacing Home with Social Feed.
- Adding social navigation.
- Adding public profiles.
- Adding followers.
- Adding likes.
- Adding comments.
- Adding community moderation systems.
- Adding community ranking.
- Rewriting Worlds as communities.
- Rewriting the database architecture for Community.
- Replacing the existing onboarding flow because of Community.

The only allowed preparation is to ensure that current architecture does not unnecessarily prevent future extension.

---

20. UX DIRECTION AFTER PHASE A

After Phase A reaches production, the next UX transformation can be evaluated as:

LANDING
   ↓
APP TRANSITION
   ↓
PERSONAL INTELLIGENCE JOURNEY
   ↓
TWIN
   ↓
PERSONAL HOME
   ↓
COMMUNITY

The product should ultimately feel like:

«A living personal intelligence application with a focused human community around self-development and better decisions.»

Not:

«A traditional website with a social feed attached.»

---

21. DEVELOPMENT DISCIPLINE

Before changing anything:

1. Inspect current implementation.
2. Identify actual behavior.
3. Identify actual dependency chain.
4. Determine whether the issue is real.
5. Fix the smallest necessary surface.
6. Run relevant tests.
7. Run regression tests.
8. Verify production behavior.

Never assume that an old audit or previous handoff represents the current repository.

Current production code is authoritative.

---

22. REQUIRED REPORTING FORMAT

For every major work cycle, report:

A. What was inspected

B. What was actually broken

C. What was changed

D. What was deliberately NOT changed

E. Tests executed

F. Production verification

G. Remaining gaps

H. Phase A status

Use explicit statuses:

- PASS
- FAIL
- BLOCKED
- DEFERRED
- VERIFIED

Do not report “complete” when only code/build success has been demonstrated.

---

23. FINAL EXECUTION ORDER

AI Developer MUST execute in this order:

STEP 1
Audit current repository

        ↓

STEP 2
Complete ALL existing Phase A functionality

        ↓

STEP 3
Fix actual production defects

        ↓

STEP 4
Verify Landing → Onboarding → Full Analysis

        ↓

STEP 5
Verify Full Analysis → WOW2 → Core Awakening → WOW3/Twin

        ↓

STEP 6
Verify Twin / Worlds / Memory / Learning / Evolution

        ↓

STEP 7
Verify API / Database / Persistence / Security

        ↓

STEP 8
Stabilize Unit / Integration / Full Suite / E2E

        ↓

STEP 9
Perform mobile + production verification

        ↓

STEP 10
PRODUCTION RELEASE

        ↓

STEP 11
ONLY AFTER PRODUCTION:
Begin Phase B Community planning/implementation

---

24. FINAL FOUNDER DIRECTIVE

The current priority is NOT to add more features.

The priority is:

«Make what already exists work completely, reliably, and verifiably in production.»

SELFPRINT must first become a complete Personal Intelligence Product.

Only after that foundation is proven should we expand it into a Personal Intelligence + Human Community Platform.

Therefore:

«PHASE A FIRST.

VERIFY EVERYTHING.

RELEASE TO PRODUCTION.

THEN BUILD PHASE B.»

Do not rush Community.

Do not rewrite the core.

Do not create parallel architecture.

Preserve the existing product logic.

Improve only what is necessary to make the existing product complete, reliable, coherent, and production-ready.

---

DEFINITION OF SUCCESS

At the end of Phase A, a real new user must be able to enter SELFPRINT and complete the intended journey without developer intervention:

LANDING
   ↓
START
   ↓
ONBOARDING
   ↓
BIRTH DATA
   ↓
FULL ANALYSIS
   ↓
WOW2
   ↓
CORE AWAKENING
   ↓
WOW3 / TWIN BIRTH
   ↓
PERSONAL SELFPRINT
   ↓
WORLDS / EXISTING FEATURES

The system must persist the user's state, survive reload/re-entry, handle errors correctly, pass the agreed test gates, and operate correctly in the production environment.

Only then is SELFPRINT V3 Phase A complete.

Phase B Community begins after that production gate — not before.