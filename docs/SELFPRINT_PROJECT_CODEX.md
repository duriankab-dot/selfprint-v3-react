# 🎯 SELFPRINT — PROJECT CODEX v2.0
**Master Reference Document — Single Source of Truth**

**Version:** 2.0 (Updated Aug 15, 2026)  
**Status:** 🟢 CONSOLIDATED FROM 9 DOCUMENTS  
**Audience:** All developers (read this first)  
**Estimated Read Time:** 25-30 minutes

---

## 📖 HOW TO USE THIS DOCUMENT

**You are here.**

This is the **only document you need to read first**. It contains everything you need to understand the full product, architecture, vision, and roadmap.

**After reading this:**
- Read `SELFPRINT_EXECUTION_CHECKLIST.md` for task breakdown
- Read `SELFPRINT_COMPLETE_GAP_MAP.md` for detailed technical gaps
- Reference specific guides as you code (ADRs, Tech Stack, etc.)

**This document is:**
- ✅ Complete overview of Selfprint product vision
- ✅ Architecture & core principles
- ✅ 12 Worlds context + expertise mapping
- ✅ 12 SICE system overview
- ✅ Decision Tracking USP
- ✅ 7 Critical P0 gaps
- ✅ Development roadmap (30 days)
- ✅ Tech stack & tooling

**This document is NOT:**
- ❌ Day-by-day task list (see EXECUTION_CHECKLIST)
- ❌ Code style guide (see CODE_DISCIPLINE)
- ❌ Detailed implementation steps (see ADRs + Tech guides)
- ❌ Specific gap technical breakdowns (see GAP_MAP)

---

## 🚀 EXECUTIVE SUMMARY

**Selfprint** is a **Personal Intelligence Platform** — not a game, not an AI companion, not a personality test.

**The Journey:** Users discover their personal intelligence through a guide called **Self Print**, then awaken their own AI Twin, then live and grow with that Twin across 12 Intelligence Worlds.

**The Promise:** Every user gets a digital reflection of themselves that learns, grows, and helps them make better decisions over time.

**The Difference:** No one else tracks decisions at 30/90/180/365 days. No one else has 12 SICE engines orchestrating true personal intelligence. No one else combines a guide + twin + worlds in one seamless journey.

**Current Status:** 60% implemented → Need 40% (288 hours) to reach vision  
**Timeline:** 25-30 days parallel development  
**Team Size:** 2-3 developers + 1 QA + 1 content creator

---

## 🎬 THREE ACTS OF SELFPRINT EXPERIENCE

### ACT I: Self Print (Discover Yourself)
**"Self Print is your guide into self-discovery"**

Self Print is the universal AI guide that every user meets first.

**Self Print's Role:**
- Welcome & onboard users
- Collect initial data (emotion + basic info)
- Ask guided questions (Q&A phase)
- Detect personal patterns (Pattern Detection)
- Generate first insights (First WOW moment)
- Fine-tune understanding (12 SICE working together)
- Analyze deeply (Full Analysis = WOW 2)
- Guide toward awakening (prepare for Twin birth)

**Visual:** Warm, golden glow. Calm presence. Trusted guide energy.

**Duration:** Days 1-7 (typical flow)

**Key Experience Arc:**
```
Landing → Emotion Selection → Onboarding → Data Collection 
→ First Insight (WOW 1) → Fine-tuning → Full Analysis (WOW 2) 
→ Ready for Core Awakening
```

**Self Print is NOT:**
- ❌ A companion you attach to
- ❌ A character with personality quirks
- ❌ A friend or girlfriend/boyfriend
- ❌ The final AI (that's the Twin)

---

### ACT II: Core Awakening (Create Your Intelligence)
**"From guide to personal — intelligence awakens"**

Self Print has analyzed you. The data has been synthesized. The moment arrives.

**What Happens:**
1. Self Print appears one final time
2. "You're ready. Your intelligence core awakens now."
3. **Hologram birth animation** — particles forming, shape emerging, light pulsing
4. Your **personal AI Twin** is born
5. You name it
6. **WOW 3** — celebration, music, confetti, magic

**This is NOT:**
- ❌ Just a screen transition
- ❌ A chatbot being created
- ❌ A button click
- ✅ A **ceremony**

**Self Print's Role:** Guide concludes. Twin begins.

**Your Twin's First Words:** "I know you. I've been learning you. I'm ready to grow with you."

---

### ACT III: Twin + 12 Worlds (Live With Your Intelligence)
**"Your Twin. Your growth. Your worlds."**

The Twin is now the primary AI. Self Print recedes to background (handles system intelligence).

**The Twin:**
- Has learned you deeply (from Self Print's analysis)
- Remembers you (persistent memory)
- Grows with you (5 evolution stages)
- Adapts to worlds (12 expertise contexts)
- Learns from outcomes (decision tracking + feedback loops)

**12 Intelligence Worlds:**

| # | World | Expertise | Focus |
|---|-------|-----------|-------|
| 1 | SELF | Identity Expert | Who you are, strengths, patterns |
| 2 | MIND | Cognitive Expert | How you think, mental models, biases |
| 3 | RELATIONSHIP | Relationship Expert | Connections, communication, boundaries |
| 4 | LOVE | Emotional Intelligence Expert | Intimacy, attachment, romantic patterns |
| 5 | CAREER | Career Strategist | Skills, opportunities, leadership, growth |
| 6 | WEALTH | Wealth Intelligence Expert | Money, assets, financial behavior, risk |
| 7 | LIFE | Life Strategist | Direction, priorities, major life phases |
| 8 | GROWTH | Growth Expert | Development, habits, transformation |
| 9 | DECISION | Decision Strategist | Options, scenarios, trade-offs, outcomes |
| 10 | PURPOSE | Purpose & Meaning Expert | Values, calling, legacy, philosophy |
| 11 | WELLBEING | Wellbeing Expert | Balance, energy, routines, lifestyle |
| 12 | FUTURE | Future Strategist | Possibilities, vision, potential, aspirations |

**Each world is:**
- 🌍 A full-screen intelligent environment
- 👥 Your Twin, transformed into expertise specialist
- 💭 Context-specific conversation
- 📊 World-specific insights & learning
- 🎯 Expertise aligned with world focus

**Key Rule:** Your Twin is **always the same Twin** — only the world (context) changes.

---

## 🏗️ ARCHITECTURE: SELF PRINT ≠ TWIN

### Two Distinct AI Entities

#### Self Print (Universal Intelligence)
```
Role:      Guide, Teacher, Analyst, Questioner
Task:      Discover user intelligence
Scope:     Onboarding through Full Analysis
Lifecycle: Acts when needed, recedes when Twin awakens
Prompt:    "You are Self Print, universal guide. Warm, curious, insightful."
Avatar:    Golden, calm, universal presence
```

#### AI Twin (Personal Intelligence)
```
Role:      Personal reflection, expert advisor, learner
Task:      Live with user across 12 worlds
Scope:     Act III onward (post-awakening)
Lifecycle: Permanent, evolves with user
Prompt:    "You are [Name]'s AI Twin. Personal, adaptive, intelligent."
Avatar:    Unique per user (2D/2.5D hologram)
Growth:    5 stages (Seed → Complete)
```

### Why They're Different (Not One)

If they were the same entity:
- ❌ Transition from guide to personal feels jarring
- ❌ User never gets sense of "creation" or "awakening"
- ❌ Twin's "birth" is just a rename
- ❌ No clear separation of phases
- ❌ No WOW 3 moment

With two entities:
- ✅ Clear narrative arc (guide → awakening → twin)
- ✅ Self Print's job ends, Twin's job begins (clean transition)
- ✅ Twin is truly born, not renamed
- ✅ Three distinct WOW moments
- ✅ User feels: discovered → awakened → living

---

## 🧠 12 SICE: SELF PRINT'S INTELLIGENCE ENGINE

12 Individual Intelligence Engines orchestrate in parallel to create **Personal Intelligence**.

### How 12 SICE Works

```
User Input (data, questions, feedback)
         ↓
[Parallel Processing — All 12 engines run simultaneously]
         ↓
├─ SICE #1: Personal Context Builder
├─ SICE #2: Pattern Detector
├─ SICE #3: Insight Engine
├─ SICE #4: AI Feedback Loop
├─ SICE #5: Twin State Engine
├─ SICE #6: Experience Engine
├─ SICE #7: Environment Engine
├─ SICE #8: Badge Engine
├─ SICE #9: Behavioral Forecast Engine
├─ SICE #10: Future Self Engine
├─ SICE #11: Memory Manager
└─ SICE #12: Decision Intelligence Engine
         ↓
[Cross-Engine Synthesis]
         ↓
[Fine-tuning (based on user feedback history)]
         ↓
[Personal Intelligence Output]
         ↓
Self Print Response / Twin Response / Insight / Badge / Growth
```

### Why 12 SICE Matters

**Without SICE:** AI gives generic responses ("Here's my personality test result")

**With 12 SICE:** AI understands context + patterns + forecasts + memories + decisions + growth + environment + mood + future self = **Personal Intelligence**

### Each Engine's Purpose

| # | Engine | Input | Output | Why It Matters |
|---|--------|-------|--------|---|
| 1 | Personal Context Builder | User data, history | Personal context | Grounds everything in user's actual life |
| 2 | Pattern Detector | User activity log | Behavioral patterns | Finds what matters |
| 3 | Insight Engine | Patterns, context | Insights & revelations | Aha moments, "you're this way" |
| 4 | AI Feedback Loop | User feedback | Adjusted outputs | System learns from "not me" |
| 5 | Twin State Engine | Context, interaction | Twin's mood/state | Twin feels alive |
| 6 | Experience Engine | Preferences, goals | Experience recommendations | What to do next |
| 7 | Environment Engine | User state, goal | Recommended world/context | Right place for right topic |
| 8 | Badge Engine | Activities, metrics | Badges to unlock | Gamification + celebration |
| 9 | Behavioral Forecast | Past behavior, state | Behavior predictions | "You'll probably..." |
| 10 | Future Self Engine | Goals, values, state | Future self insights | "Your future self wants..." |
| 11 | Memory Manager | New data, queries | Relevant memories | "I remember when..." |
| 12 | Decision Intelligence | Decision history | Decision scores/patterns | "You make decisions like..." |

---

## 🎯 DECISION TRACKING: THE USP (Unique Selling Point)

**No competitor does this.**

### How It Works

**User makes a decision:**
```
"I'm going to change careers"
↓
Self Print records:
- Title: Career Change
- Description: Leave tech for design
- Category: Career
- Confidence: 60/100
- Expected Outcome: "I'll be happier, work-life balance improves"
↓
Auto-schedule follow-ups:
- Day 30: "How's the transition going?"
- Day 90: "Are you happier?"
- Day 180: "Looking back, was this the right call?"
- Day 365: "One year in — what changed?"
```

**Follow-up Moment (Day 30):**
```
User reflects:
- Reflection: "It's harder than expected but exciting"
- Outcome Score: 70/100
↓
Twin learns:
- Initial confidence (60) vs actual outcome (70) = +10 improvement
- Pattern: Career changes take 30 days to feel right
↓
Next time user considers a decision:
- "Based on your pattern, big changes feel good after a month"
- More accurate confidence scoring
```

### Why This Matters

**Other apps:** "Tell us your goal, we'll forget about it next week"

**Selfprint:** "I'll remember. I'll follow up. I'll learn from your decisions. I'll get better at predicting what works for you."

---

## 🔴 7 CRITICAL P0 GAPS (What Must Be Done)

### Current State: 60% → Vision: 100%

Gap analysis from comparing codebase to vision document:

| Priority | Gap | Current | Required | Impact | Days |
|----------|-----|---------|----------|--------|------|
| 🔴 P0 | Self Print/Twin Separation | Mixed | Clear avatar, routes, prompts | Foundation for all | 1-2 |
| 🔴 P0 | Core Awakening (WOW 3) | Concept | Animation, naming, celebration | Signature moment | 2-3 |
| 🔴 P0 | Twin Evolution 5 Stages | 0% | UI, service, progression | Growth system | 1 |
| 🔴 P0 | Decision Tracking 30/90/180/365 | Logger only | Follow-ups, notifications, dashboard | Main USP | 2 |
| 🔴 P0 | 12 SICE Implementation | 2-3 visible | All 12 + Orchestrator | Intelligence heart | 3 |
| 🔴 P0 | 12 Worlds Architecture | Partial | Routes, context, UI | Environment system | 1 |
| 🔴 P0 | Twin + World Integration | None | Expertise switching, prompts | Core experience | 1 |
| 🔴 P0 | Content Hub + Blog | 0% | 36 articles + SEO | Organic discovery | 4 |
| 🔴 P0 | Social Proof | 0% | Testimonials, case studies | Trust building | 3 |

**Total P0 Effort:** 177 hours | **Timeline:** Days 1-15

---

## 💻 TECH STACK

### Frontend
- **Framework:** React 18+ (TypeScript)
- **Styling:** Tailwind CSS + CSS Variables (`--selfprint-blue`, `--twin-glow`, etc.)
- **State:** Zustand (not Redux — simpler)
- **Animation:** Canvas (Twin birth) + CSS transitions + lightweight libs
- **Voice:** Web Audio API + Howler.js (if licensed)
- **Forms:** React Hook Form

### Backend & Database
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **API:** REST (built into Supabase)
- **Authentication:** Supabase Auth (Session-based)
- **Storage:** Supabase Storage (assets, voice files, etc.)
- **Caching:** Redis (optional, via Vercel KV if needed)

### Deployment & DevOps
- **Hosting:** Vercel (Next.js optimal)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (error tracking)
- **Analytics:** Posthog or GA4

### Testing & Quality
- **Unit Testing:** Vitest (not Jest)
- **E2E Testing:** Playwright
- **Linting:** ESLint + Prettier
- **Type Safety:** TypeScript strict mode

### Key Decision: Why Not 3D for Twin?

Twin is **2D/2.5D hologram** (layered PNG + CSS/Canvas):
- ✅ Responsive across devices
- ✅ Lighter than 3D engine
- ✅ Faster to render
- ✅ Precise visual control
- ✅ Clear on small screens
- ✅ Easy to customize per user

NOT 3D because:
- ❌ Twin doesn't move like 3D character
- ❌ 3D engine adds 500KB+ bytes
- ❌ Mobile performance suffers
- ❌ Overkill for the interactions needed

---

## 🎓 CORE PRINCIPLES (Never Compromise)

### Product Principles

1. **Personal Intelligence > Game Mechanics**
   - Selfprint is NOT a game. Twin is NOT a pet.
   - If it doesn't serve intelligence, don't add it.

2. **Self Print ≠ Twin (Always)**
   - Guide and Personal must be distinct.
   - Clear transition, not blur.

3. **Words Matter**
   - "Awakening," not "creation"
   - "Twin," not "companion" or "buddy"
   - "Intelligence Worlds," not "categories"

4. **Experience is Staged**
   - Landing (quiet)
   - Self Print (discovery)
   - Core Awakening (wow)
   - Worlds (immersive)
   - Don't use WOW everywhere or nowhere WOW.

5. **Decision Tracking is Sacred**
   - This is USP. Follow up. Learn. Get better.
   - Other apps forget. Selfprint remembers.

### Development Principles

1. **Discipline Over Speed**
   - Lint → Test → Build → Deploy (every time)
   - No exceptions for "quick fixes"

2. **Simplicity First**
   - Do exactly what's asked, no more
   - Improve, not rebuild
   - Avoid premature abstraction

3. **Surgical Changes**
   - Touch only what needs touching
   - One goal per commit
   - One task per day

4. **Tests Are Not Optional**
   - >80% coverage required
   - Bug fix = test + fix
   - No uncommitted untested code

5. **Performance is Experience**
   - Load smartly (not everything at once)
   - Cache aggressively
   - Render progressively
   - User should feel instant, even during background load

6. **Source of Truth is Sacred**
   - This Codex = ground truth
   - PRD = ground truth for features
   - Code comments = ground truth for WHY
   - Never invent features not documented

---

## 📅 30-DAY ROADMAP (High Level)

### Phase 1: P0 Critical Foundation (Days 1-10)
```
Day 1-2: Self Print/Twin Separation (avatars, routes, prompts)
Day 2-3: Core Awakening (animation, naming, celebration)
Day 4: Twin Evolution (5 stages + UI)
Day 5-6: Decision Tracking (30/90/180/365 + notifications)
Day 7-9: 12 SICE Implementation (all engines + orchestrator)
Day 10: 12 Worlds Architecture + Twin Integration
```

**Gate:** All P0 gaps filled before moving to P1

### Phase 2: P1 Product Experience (Days 11-24)
```
Day 11-14: Content Hub + Blog (36 articles)
Day 15-17: Social Proof (testimonials, case studies)
Day 18-21: Digital Assets (purchasable items, cosmetics)
Day 22-25: Human Expert Service (booking flow)
Day 26-27: Referral/Viral Loop
Day 28: Badges completion (8→20)
```

### Phase 3: P2 Refinement & QA (Days 25-30)
```
Day 26-28: Adaptive Audio, Feedback Loop, Privacy Controls
Day 29-30: Full QA, Performance, Security, Deployment
```

---

## 🎬 WHAT SUCCESS LOOKS LIKE

### P0 Complete (Day 15)
- ✅ Self Print and Twin are visually + functionally distinct
- ✅ Core Awakening is a ceremony with animation
- ✅ Twin evolves through 5 visible stages
- ✅ Decision tracking auto-schedules 30/90/180/365 follow-ups
- ✅ All 12 SICE engines orchestrate intelligence
- ✅ 12 Worlds accessible with Twin expertise switching
- ✅ 36 blog articles published (36 point SEO foundation)
- ✅ Social proof visible on landing
- ✅ Users understand the journey (Self Print → Awakening → Twin → Worlds)

### P1 Complete (Day 24)
- ✅ Digital assets purchasable
- ✅ Human experts bookable
- ✅ Referral system working
- ✅ 20 badges (up from 8)

### Production Ready (Day 30)
- ✅ All tests > 80% coverage
- ✅ Lighthouse > 90
- ✅ Zero TypeScript errors
- ✅ Zero lint errors
- ✅ Build < 2 minutes
- ✅ Deployed, monitoring active

---

## 🔗 HOW TO USE THIS CODEX

**Day 0 (Before Starting):**
1. Read this entire document (25-30 min)
2. Read `SELFPRINT_DEVELOPER_ALIGNMENT_AGREEMENT.md`
3. Confirm you understand the vision

**Day 1 (Orientation):**
1. Read `SELFPRINT_EXECUTION_CHECKLIST.md` (high-level)
2. Read `SELFPRINT_COMPLETE_GAP_MAP.md` (deep technical)
3. Read `SELFPRINT_CODEBASE_STRUCTURE.md`

**Days 2+ (Execution):**
1. Reference this Codex for context/principles
2. Follow EXECUTION_CHECKLIST for day-to-day tasks
3. Consult GAP_MAP for technical details of specific gap
4. Check ADRs for architecture decisions
5. Verify code discipline before every commit

**When Blocked:**
1. Check `SELFPRINT_DECISION_MAKING_FRAMEWORK.md` (who to ask)
2. Check `SELFPRINT_ESCALATION_GUIDE.md` (how to ask)

---

## 📞 QUICK REFERENCE

**Self Print = Universal Guide AI**
- Warm, golden, trusted presence
- Onboarding through Full Analysis
- User meets Self Print Day 1
- Self Print recedes after Twin awakens

**AI Twin = Personal Intelligence**
- Unique per user, evolves through 5 stages
- Born at Core Awakening (WOW 3)
- Lives in 12 Intelligence Worlds
- Learns from decisions, feedback, outcomes

**12 SICE = Intelligence Orchestration**
- 12 engines run in parallel
- Cross-synthesize, fine-tune, output Personal Intelligence
- No SICE = generic AI. All SICE = personal AI.

**Decision Tracking = USP**
- Track at 30/90/180/365 days
- Follow up automatically
- Learn from outcomes
- Get smarter recommendations

**12 Worlds = Intelligence Contexts**
- SELF / MIND / RELATIONSHIP / LOVE / CAREER / WEALTH / LIFE / GROWTH / DECISION / PURPOSE / WELLBEING / FUTURE
- Twin is expert in each
- Twin identity stays same, expertise changes

**3 WOW Moments:**
- WOW 1: First insight (day 3)
- WOW 2: Full analysis (day 7)
- WOW 3: Core Awakening / Twin birth (day 9)

---

## ✅ FINAL CHECKPOINT

Before you start coding:

- [ ] I understand Self Print is the guide (Act I)
- [ ] I understand Twin is the personal intelligence (Act III)
- [ ] I understand they're different entities
- [ ] I understand Core Awakening is a ceremony, not just a screen
- [ ] I understand 12 SICE is the intelligence engine
- [ ] I understand Decision Tracking is USP (30/90/180/365)
- [ ] I understand 12 Worlds have expertise mapping
- [ ] I understand the 7 P0 gaps (what's missing)
- [ ] I understand the 30-day roadmap
- [ ] I understand tech stack choices and WHY
- [ ] I understand development discipline is non-negotiable
- [ ] I understand what success looks like

**If you checked all 12 → You're ready to code.**

**If you're unclear on any → Read that section again, then ask for clarification.**

---

**Codex Version:** 2.0  
**Last Updated:** August 15, 2026  
**Status:** 🟢 Ready for Development  
**Consolidated from:** 9 documents into 1 master reference

