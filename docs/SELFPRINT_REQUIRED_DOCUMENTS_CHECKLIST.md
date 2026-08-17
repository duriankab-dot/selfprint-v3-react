# 📋 SELFPRINT — REQUIRED DOCUMENTATION FOR AI TEAM ALIGNMENT
**Purpose:** รวมและระบุเอกสารทั้งหมดที่ต้องอัพเดท/สร้างเพื่อให้ AI devs ทำงานไปในทางเดียวกัน  
**Status:** 🔴 CRITICAL  
**Date:** 2026-08-15

---

## 📚 DOCUMENT CATEGORIES & STATUS

### CATEGORY A: SINGLE SOURCE OF TRUTH (ต้องมี)

#### ✅ A1: PROJECT CODEX (ยังไม่มี — ต้องสร้าง)
**Purpose:** Single master document รวมทั้งหมด (Vision + Architecture + Execution)  
**Content Should Include:**
- Executive Summary (1 page)
- Product Vision + Positioning
- Master Visual Architecture (3 Acts)
- 12 Worlds Overview + Expertise Mapping
- Core Technical Decisions (Nova ≠ Twin, 12 SICE, etc.)
- 7 P0 Critical Features
- Development Roadmap (high-level)
- Links to detailed documents

**File:** `SELFPRINT_PROJECT_CODEX.md`  
**Audience:** All developers (read first)  
**Effort:** 4-6 hours (extract + consolidate)  
**Status:** 🔴 MISSING

---

#### ✅ A2: ARCHITECTURE DECISION RECORDS (ADRs) (ยังไม่มี — ต้องสร้าง)
**Purpose:** Document WHY each major decision was made (not just WHAT)  
**Decisions to Document:**
- ADR-01: Why Nova ≠ Twin (not one entity)
- ADR-02: Why 2D/2.5D Twin (not 3D)
- ADR-03: Why 12 SICE orchestration (not monolithic AI)
- ADR-04: Why Decision Tracking 30/90/180/365 (USP)
- ADR-05: Why 12 Worlds contexts (not categories)
- ADR-06: Why Emotion-First Landing
- ADR-07: Why Core Awakening as WOW #3
- ADR-08: Technology stack choices (React, Supabase, etc.)
- ADR-09: Why not Replika-style companion
- ADR-10: Memory/Learning architecture

**File:** `docs/adr/README.md` + `adr-*.md`  
**Audience:** Architects + Senior Developers  
**Effort:** 8-10 hours  
**Status:** 🔴 MISSING

---

### CATEGORY B: DEVELOPER ONBOARDING (ต้องมี)

#### ✅ B1: AI DEVELOPER ONBOARDING GUIDE (ยังไม่มี — ต้องสร้าง)
**Purpose:** First document ALL devs read before starting  
**Content Should Include:**
- Welcome message + project mission
- Required reading order (with time estimates)
- Setup instructions (env, npm, git)
- First 30 minutes checklist
- Communication channels + decision-making
- Code discipline rules (non-negotiable)
- How to ask for help
- Success criteria for your first week

**File:** `SELFPRINT_DEVELOPER_ONBOARDING.md`  
**Audience:** New AI developers  
**Effort:** 3-4 hours  
**Status:** 🔴 MISSING

---

#### ✅ B2: READING LIST + PRIORITY ORDER (ยังไม่มี — ต้องสร้าง)
**Purpose:** Tell developer what to read, in what order, and why  
**Reading List:**
1. **Day 0 — Onboarding (30 min)**
   - This document
   - Project mission statement

2. **Day 0 — Foundation (2-3 hours)**
   - SELFPRINT_PROJECT_CODEX.md
   - MASTER_PRD.md (MASTER section only)

3. **Day 0-1 — Vision (2 hours)**
   - MASTER VISUAL EXPERIENCE ARCHITECTURE
   - 12 HUB WORLDS VISUAL & EXPERIENCE DIRECTIVE

4. **Day 1 — Technical (2-3 hours)**
   - SELFPRINT_COMPLETE_GAP_MAP_v1.0.md
   - AI DEVELOPMENT EXECUTION ORDER

5. **Day 1-2 — Execution (2-3 hours)**
   - SELFPRINT_EXECUTION_CHECKLIST_v1.0.md
   - Code Structure Overview

6. **Ongoing — Reference**
   - SELFPRINT_CODE_DISCIPLINE_CHECKLIST.md (before EVERY commit)
   - ADRs (as needed)

**File:** `SELFPRINT_READING_LIST.md`  
**Audience:** All developers  
**Effort:** 2 hours  
**Status:** 🔴 MISSING

---

### CATEGORY C: ALIGNMENT & DISCIPLINE (ต้องมี)

#### ✅ C1: AI DEVELOPER ALIGNMENT AGREEMENT (ยังไม่มี — ต้องสร้าง)
**Purpose:** "Contract" that all devs sign off on (mentally) before starting  
**Content Should Include:**
- 10 Commandments of SELFPRINT Development
- What you WILL do
- What you WON'T do
- Non-negotiable rules (scope, testing, documentation)
- How decisions get made
- Escalation path if blocked
- Code review expectations
- Commit message standards
- Definition of "done"

**Example Commitments:**
```
1. I will read SELFPRINT_PROJECT_CODEX.md before writing any code
2. I will NOT add features outside the 7 P0 gaps
3. I will NOT refactor existing code unless it blocks my task
4. I will test before pushing (npm run test)
5. I will document changes in CHANGELOG.md
6. I will ask before deviating from the plan
7. I will keep tests > 80% coverage
8. I will respect existing Vision (Nova ≠ Twin, 12 SICE, etc.)
```

**File:** `SELFPRINT_DEVELOPER_ALIGNMENT_AGREEMENT.md`  
**Audience:** All developers (required before Day 1)  
**Effort:** 2-3 hours  
**Status:** 🔴 MISSING

---

#### ✅ C2: CODE DISCIPLINE CHECKLIST (ยังไม่มี — ต้องสร้าง)
**Purpose:** Pre-commit checklist — short version devs run before EVERY push  
**Content:**
- [ ] npm run lint → 0 errors
- [ ] npm run test → all pass
- [ ] npm run build → success
- [ ] Tests > 80% coverage?
- [ ] TypeScript 0 errors?
- [ ] CHANGELOG.md updated?
- [ ] Commit message follows format?
- [ ] Code follows discipline rules?
- [ ] No breaking changes?
- [ ] Respects existing architecture?

**File:** `SELFPRINT_CODE_DISCIPLINE_CHECKLIST.md`  
**Audience:** All developers (use before every commit)  
**Effort:** 1-2 hours  
**Status:** 🔴 MISSING

---

### CATEGORY D: TECHNICAL REFERENCE (ต้องมี)

#### ✅ D1: CODEBASE STRUCTURE GUIDE (ยังไม่มี — ต้องสร้าง)
**Purpose:** Map of where each component/service lives  
**Content Should Include:**
```
src/
├── pages/
│   ├── LandingPage.tsx [STABLE]
│   ├── NovaChat.tsx [NEW]
│   ├── TwinChat.tsx [REFACTOR]
│   ├── CoreAwakening.tsx [NEW]
│   ├── World.tsx [NEW]
│   ├── Blog.tsx [NEW]
│   └── ...
├── components/
│   ├── features/
│   │   ├── NovaAvatar.tsx [NEW]
│   │   ├── TwinAvatar.tsx [NEW]
│   │   ├── TwinHologramBirth.tsx [NEW]
│   │   └── ...
├── services/
│   ├── sice/ [NEW FOLDER]
│   │   ├── SICEBase.ts [NEW]
│   │   ├── SICEOrchestrator.ts [NEW]
│   │   └── engines/ [NEW FOLDER]
│   ├── DecisionService.ts [REFACTOR]
│   ├── TwinEvolutionService.ts [NEW]
│   └── ...
├── contexts/
│   ├── AIContext.tsx [NEW]
│   ├── WorldContext.tsx [NEW]
│   └── ...
├── types/
│   ├── sice.ts [NEW]
│   ├── world.ts [NEW]
│   ├── decision.ts [REFACTOR]
│   └── ...
├── store/
│   ├── evolutionStore.ts [NEW]
│   ├── assetStore.ts [NEW]
│   └── ...
└── content/
    ├── worlds/ [NEW FOLDER]
    └── faq.ts [NEW]
```

**File:** `SELFPRINT_CODEBASE_STRUCTURE.md`  
**Audience:** All developers  
**Effort:** 2-3 hours  
**Status:** 🔴 MISSING

---

#### ✅ D2: TECH STACK & TOOL DECISIONS (ยังไม่มี — ต้องสร้าง)
**Purpose:** Document why each tool was chosen and how to use it  
**Content Should Include:**
- Frontend: React + TypeScript + Tailwind
- State: Zustand (why not Redux?)
- Backend: Supabase (why not Firebase?)
- Styling: Tailwind + CSS Variables (why not Styled Components?)
- Testing: Vitest (why not Jest?)
- Animation: Canvas + CSS (why not Three.js for Twin?)
- Voice: Web Audio API (which library?)
- Audio: Howler.js or native?
- Form validation: (which library?)
- HTTP client: (fetch or axios?)

**File:** `SELFPRINT_TECH_STACK_DECISIONS.md`  
**Audience:** All developers  
**Effort:** 2-3 hours  
**Status:** 🔴 MISSING

---

### CATEGORY E: EXISTING DOCUMENTS (need update)

#### 🟡 E1: MASTER_PRD.md (already exists)
**What to update:**
- Add explicit mention of 12 Worlds implementation (Section UX-02)
- Add Twin + World Integration requirements
- Cross-reference new documents

**Priority:** High  
**Effort:** 1-2 hours

---

#### 🟡 E2: README.md (at repo root)
**What to add/update:**
- Link to SELFPRINT_PROJECT_CODEX.md (first thing to read)
- Link to SELFPRINT_DEVELOPER_ONBOARDING.md
- Tech stack quick overview
- Setup instructions
- Contributing guidelines (link to CODE_DISCIPLINE_CHECKLIST)
- Links to all critical docs

**Priority:** High  
**Effort:** 1-2 hours

---

#### 🟡 E3: .env.example
**What to verify/add:**
- All required env vars documented
- Example values shown
- Comments for what each var does

**Priority:** Medium  
**Effort:** 30 min

---

#### 🟡 E4: CONTRIBUTING.md (if exists, or create)
**What should include:**
- Code style guidelines
- PR process
- Testing requirements
- Commit message format
- When/how to ask for help
- Breaking change policy

**Priority:** Medium  
**Effort:** 2 hours

---

### CATEGORY F: OPERATIONAL DOCUMENTS (ต้องมี)

#### ✅ F1: GIT WORKFLOW STANDARD (ยังไม่มี — ต้องสร้าง)
**Purpose:** Every dev commits the same way  
**Content Should Include:**
```
Branch naming:
- feature/[task-id]-[description]
- bugfix/[issue-id]-[description]
- docs/[description]

Commit message format:
Day X: [Feature] Short description
- Specific changes
- Link to task/PR if applicable

Example:
Day 1: Nova/Twin Separation - Avatar components created
- Created NovaAvatar.tsx and TwinAvatar.tsx
- Separated routes /chat/nova vs /chat/twin
- Updated AIContext for state management
```

**File:** `SELFPRINT_GIT_WORKFLOW.md`  
**Audience:** All developers  
**Effort:** 1-2 hours  
**Status:** 🔴 MISSING

---

#### ✅ F2: DAILY STANDUP TEMPLATE (ยังไม่มี — ต้องสร้าง)
**Purpose:** Standardized reporting (from Checklist but formalized)  
**Content:** Template that devs copy/paste each day

**File:** `SELFPRINT_STANDUP_TEMPLATE.md`  
**Audience:** All developers  
**Effort:** 30 min  
**Status:** 🔴 MISSING

---

#### ✅ F3: TESTING STRATEGY & STANDARDS (ยังไม่มี — ต้องสร้าง)
**Purpose:** What tests are required, what to test, how to write them  
**Content Should Include:**
- Unit test expectations (80% coverage requirement)
- E2E test scenarios (happy path + edge cases)
- Component test patterns
- Mock strategy (Supabase, APIs)
- Test file naming conventions
- When to write tests (before code? after?)

**File:** `SELFPRINT_TESTING_STRATEGY.md`  
**Audience:** All developers  
**Effort:** 2-3 hours  
**Status:** 🔴 MISSING

---

### CATEGORY G: COMMUNICATION (ต้องมี)

#### ✅ G1: DECISION-MAKING FRAMEWORK (ยังไม่มี — ต้องสร้าง)
**Purpose:** How decisions are made, when to ask for approval, what's auto-approved  
**Content Should Include:**

**Auto-Approved (just do it):**
- Bug fixes
- Code style improvements
- Documentation updates
- Adding tests
- Performance optimizations (no breaking changes)

**Need Review (ask before doing):**
- Any scope change
- Architecture decisions
- New dependencies
- Breaking changes
- Refactoring existing code
- Deviations from the plan

**Need Executive Sign-Off:**
- Technology stack changes
- Dropping features
- Major pivots
- Timeline changes

**File:** `SELFPRINT_DECISION_MAKING_FRAMEWORK.md`  
**Audience:** All developers  
**Effort:** 1 hour  
**Status:** 🔴 MISSING

---

#### ✅ G2: ISSUE ESCALATION GUIDE (ยังไม่มี — ต้องสร้าง)
**Purpose:** Who to ask, how to ask, expected response time  
**Content:**
- Critical blocker? Ask in channel immediately
- Technical question? Check docs first, then ask
- Scope question? Post thread before proceeding
- Performance issue? File issue with numbers
- Security concern? Direct message immediately

**File:** `SELFPRINT_ESCALATION_GUIDE.md`  
**Audience:** All developers  
**Effort:** 1 hour  
**Status:** 🔴 MISSING

---

## 📊 IMPLEMENTATION PRIORITY

### CRITICAL (ต้องทำ Day 0)
```
1. SELFPRINT_DEVELOPER_ALIGNMENT_AGREEMENT.md (all devs sign off)
2. SELFPRINT_PROJECT_CODEX.md (first thing to read)
3. SELFPRINT_READING_LIST.md (guides what to read next)
4. README.md update (points to above 3)
```

**Effort:** 10-12 hours  
**Timeline:** Do BEFORE developers start

---

### HIGH (ต้องทำ Day 1-2)
```
5. SELFPRINT_DEVELOPER_ONBOARDING.md
6. SELFPRINT_CODE_DISCIPLINE_CHECKLIST.md
7. SELFPRINT_CODEBASE_STRUCTURE.md
8. SELFPRINT_GIT_WORKFLOW.md
9. CONTRIBUTING.md update
10. SELFPRINT_TESTING_STRATEGY.md
11. SELFPRINT_DECISION_MAKING_FRAMEWORK.md
12. SELFPRINT_ESCALATION_GUIDE.md
```

**Effort:** 18-22 hours  
**Timeline:** Complete before major development starts

---

### MEDIUM (ต้องทำ before Day 3)
```
13. ADRs (adr-01 through adr-10)
14. SELFPRINT_TECH_STACK_DECISIONS.md
15. SELFPRINT_STANDUP_TEMPLATE.md
16. MASTER_PRD.md update
17. .env.example review
```

**Effort:** 15-18 hours  
**Timeline:** Complete by end of Day 2

---

## 🎯 SUMMARY BY DOCUMENT TYPE

| Category | Count | Status | Effort | Priority |
|----------|-------|--------|--------|----------|
| Source of Truth | 2 | 🔴 Missing | 12 hrs | P0 |
| Onboarding | 2 | 🔴 Missing | 5 hrs | P0 |
| Alignment | 2 | 🔴 Missing | 5 hrs | P0 |
| Technical Reference | 2 | 🔴 Missing | 5 hrs | P1 |
| Existing (updates) | 5 | 🟡 Partial | 7 hrs | P0 |
| Operational | 3 | 🔴 Missing | 4 hrs | P1 |
| Communication | 2 | 🔴 Missing | 2 hrs | P1 |
| ADRs | 10 | 🔴 Missing | 10 hrs | P1 |
| **TOTAL** | **28** | **🔴 18 Missing** | **~55 hrs** | **35 hrs Critical** |

---

## ✅ CURRENT STATE vs REQUIRED

### Currently Have (8 documents):
1. MASTER_PRD.md ✅
2. MASTER VISUAL EXPERIENCE ARCHITECTURE ✅
3. 12 HUB WORLDS DIRECTIVE ✅
4. MASTER DEVELOPMENT ROADMAP ✅
5. Gap Analysis (vs 17 competitors) ✅
6. AI DEVELOPMENT EXECUTION ORDER ✅
7. SELFPRINT_COMPLETE_GAP_MAP_v1.0.md ✅
8. SELFPRINT_EXECUTION_CHECKLIST_v1.0.md ✅

### Still Need (20 documents):
1. SELFPRINT_PROJECT_CODEX.md 🔴
2. ADRs (10 files) 🔴
3. SELFPRINT_DEVELOPER_ONBOARDING.md 🔴
4. SELFPRINT_READING_LIST.md 🔴
5. SELFPRINT_DEVELOPER_ALIGNMENT_AGREEMENT.md 🔴
6. SELFPRINT_CODE_DISCIPLINE_CHECKLIST.md 🔴
7. SELFPRINT_CODEBASE_STRUCTURE.md 🔴
8. SELFPRINT_TECH_STACK_DECISIONS.md 🔴
9. SELFPRINT_GIT_WORKFLOW.md 🔴
10. SELFPRINT_STANDUP_TEMPLATE.md 🔴
11. SELFPRINT_TESTING_STRATEGY.md 🔴
12. SELFPRINT_DECISION_MAKING_FRAMEWORK.md 🔴
13. SELFPRINT_ESCALATION_GUIDE.md 🔴
14. README.md update 🟡
15. CONTRIBUTING.md 🔴
16. .env.example review 🟡
17. MASTER_PRD.md update 🟡

---

## 🚀 NEXT STEPS

### Day 0 Prep (4-5 hours)
1. Create SELFPRINT_PROJECT_CODEX.md (consolidate vision)
2. Create SELFPRINT_DEVELOPER_ALIGNMENT_AGREEMENT.md
3. Create SELFPRINT_READING_LIST.md
4. Update README.md to point to above 3

### Day 1 Prep (8-10 hours)
5. Create SELFPRINT_DEVELOPER_ONBOARDING.md
6. Create SELFPRINT_CODE_DISCIPLINE_CHECKLIST.md
7. Create SELFPRINT_GIT_WORKFLOW.md
8. Create SELFPRINT_CODEBASE_STRUCTURE.md
9. Create SELFPRINT_TESTING_STRATEGY.md
10. Update CONTRIBUTING.md

### Day 2 Prep (8-10 hours)
11-17. Create remaining docs + ADRs

---

**Document Status:** 🔴 **CRITICAL — 20 DOCUMENTS MISSING**  
**Estimated Timeline:** 35 hours critical docs + 20 hours nice-to-have  
**Recommendation:** Create 4 critical docs Day 0, rest before development starts

