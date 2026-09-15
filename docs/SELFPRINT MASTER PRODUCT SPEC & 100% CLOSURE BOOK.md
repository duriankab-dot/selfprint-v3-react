# SELFPRINT
# MASTER PRODUCT SPECIFICATION & 100% CLOSURE BOOK

**Document ID:** SP-MPSC-001  
**Product:** SELFPRINT — Living Intelligence Platform  
**Repository:** `duriankab-dot/selfprint-v3-react`  
**Baseline Commit:** `11db9bf216101d3d591a8d6e4ade0e3486044988`  
**Status:** ACTIVE MASTER PRODUCT CONTRACT  
**Purpose:** Single Product Source of Truth + Engineering Closure System  
**Closure Target:** 100% CLOSED  
**Rule:** No feature may be considered complete without implementation + integration + test evidence + documentation synchronization.

---

# 0. MASTER LAW

## 0.1 เอกสารนี้คือ Product Contract

เอกสารนี้กำหนดว่า SELFPRINT ต้องมีอะไร ทำงานอย่างไร เชื่อมกันอย่างไร และอะไรจึงจะถือว่า "เสร็จ"

AI Developer ทุกตัว ทุก session ทุก model ต้องถือเอกสารนี้เป็น **Product Contract** ไม่ใช่คำแนะนำที่เลือกทำหรือไม่ทำได้

ลำดับ Source of Truth:

1. Actual Code
2. Database / Migration
3. API / Edge / Backend
4. Automated Tests
5. Product Specification
6. Other Documentation

แต่เมื่อพบความขัดแย้งระหว่าง Code กับ Product Contract:

**ห้ามแก้เอกสารให้ตรงกับ code เพียงเพื่อให้ดู PASS**

ต้อง:

1. ระบุความขัดแย้ง
2. ตรวจ Product Intent
3. ตรวจ Master Directive
4. แก้ implementation หรือขอ decision หาก requirement ยังไม่ชัด
5. ทดสอบใหม่
6. อัปเดตเอกสารหลัง implementation ถูกต้องแล้ว

---

# 1. WHAT SELFPRINT IS

SELFPRINT คือ Living Intelligence Platform ที่สร้างความเข้าใจตัวเองในรูปแบบ AI Twin

Core experience:

```text
USER
  ↓
SMART ENTRY
  ↓
BASELINE / NODE DATA
  ↓
12 DIMENSIONS
  ↓
SICE INTELLIGENCE LAYER
  ↓
BLUEPRINT
  ↓
CORE AWAKENING
  ↓
TWIN BIRTH
  ↓
LIVING TWIN
  ↓
MEMORY
  ↓
EVOLUTION
  ↓
TODAY / DAILY LIVING
  ↓
CHAT / INSIGHT / DECISION / WORLDS
```

SELFPRINT ต้องไม่ถูกสร้างเป็นเพียง dashboard ที่มี AI หลายหน้ามาวางรวมกัน

ทุกระบบต้องมีความสัมพันธ์กับ:

- User identity
- User baseline
- Twin
- Memory
- Evolution
- Intelligence
- World context
- Decision context
- AI interaction

---

# 2. CORE PRODUCT PRINCIPLES

## SP-CORE-001 — One Product, One Intelligence

SELFPRINT ต้องรู้สึกเป็นระบบเดียว

ห้ามสร้าง feature แบบ isolated ที่ไม่เชื่อมกับ Twin / intelligence / memory โดยไม่มีเหตุผล

---

## SP-CORE-002 — User ต้องพบ AI หลักอย่างชัดเจน

AI ที่ผู้ใช้เห็นต้องไม่ซ้ำซ้อนโดยไม่จำเป็น

Backend intelligence / brain / routing / calculations สามารถมีหลาย engine ได้ แต่ต้องไม่สร้าง visible AI character ซ้ำกันเพียงเพราะ architecture แยก service

---

## SP-CORE-003 — Intelligence ≠ UI

Engine สามารถทำงานเบื้องหลังได้

แต่ทุก intelligence capability ที่มีผลต่อ product ต้องมี:

- input
- processing
- output
- persistence เมื่อจำเป็น
- provenance / source
- user-facing consequence

---

## SP-CORE-004 — No Fake Completion

สิ่งต่อไปนี้ไม่ถือว่า COMPLETE:

- route มีแต่หน้าว่าง
- component render ได้แต่ไม่มี behavior
- API ตอบ 200 แต่ไม่มี business logic
- mock data แทน production data
- fallback assertion
- test ถูก skip
- test ถูกลด scope เพื่อให้ผ่าน
- testid ถูกเพิ่มเพื่อให้ test ผ่านโดยไม่มี real behavior
- documentation บอก implemented แต่ feature ไม่มี
- compile ผ่าน
- build ผ่าน
- unit tests ผ่าน feature อื่น

---

# 3. DEFINITION OF DONE

Feature จะเป็น `CLOSED` ได้ต่อเมื่อผ่านทุกข้อ:

### A — Product
- [ ] Requirement ถูกกำหนด
- [ ] User value ชัดเจน
- [ ] UX flow ครบ
- [ ] Edge cases ถูกกำหนด

### B — Frontend
- [ ] UI implemented
- [ ] Responsive
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Success state
- [ ] Auth state
- [ ] Mobile state
- [ ] Accessibility พื้นฐาน

### C — Backend
- [ ] API implemented
- [ ] Validation
- [ ] Authorization
- [ ] User isolation
- [ ] Error handling
- [ ] Rate limiting ตามความเหมาะสม
- [ ] AI failure handling

### D — Database
- [ ] Schema
- [ ] Migration
- [ ] Index
- [ ] Constraints
- [ ] RLS
- [ ] User isolation
- [ ] Migration rerun safety

### E — AI
- [ ] Model routing
- [ ] Prompt / instruction
- [ ] Structured output
- [ ] Failure fallback
- [ ] Cost behavior
- [ ] Latency expectation
- [ ] Hallucination safeguardsตามประเภทงาน

### F — Tests
- [ ] Unit
- [ ] Integration
- [ ] E2E
- [ ] Mobile
- [ ] Critical journey
- [ ] Negative cases
- [ ] Persistence/reload
- [ ] Auth boundary

### G — Evidence
- [ ] Actual command executed
- [ ] Result captured
- [ ] Relevant commit identified
- [ ] No hidden failure
- [ ] No undocumented skip

### H — Documentation
- [ ] This document updated
- [ ] Reality map updated
- [ ] Test matrix updated
- [ ] Route/API/DB documentation synchronized

Only then:

`STATUS = CLOSED`

---

# 4. STATUS SYSTEM

Every item MUST use exactly one status.

| Status | Meaning |
|---|---|
| `MISSING` | ยังไม่มี implementation |
| `PLANNED` | กำหนด requirement แล้วแต่ยังไม่เริ่ม |
| `IN_PROGRESS` | กำลังพัฒนา |
| `PARTIAL` | มี implementation แต่ยังไม่ครบ |
| `BLOCKED` | ทำต่อไม่ได้เพราะ dependency |
| `IMPLEMENTED` | มี code แล้ว แต่ยังไม่มีหลักฐาน closure ครบ |
| `VERIFIED` | implementation + test verified |
| `CLOSED` | ผ่าน Definition of Done ครบ |
| `REGRESSED` | เคย CLOSED แต่ภายหลังพัง |
| `DEPRECATED` | ถูกยกเลิกโดย Product Decision |

### ห้ามใช้:

`PASS = CLOSED`

PASS เป็นผลของ test

CLOSED เป็นผลของ Product Closure

---

# 5. PRIORITY

| Priority | Meaning |
|---|---|
| P0 | Core product / architecture / security / data integrity |
| P1 | Major product capability |
| P2 | UX / quality / optimization |
| P3 | polish / nice-to-have |

P0 และ P1 ต้องปิดก่อนประกาศ Product 100%.

---

# 6. MASTER PRODUCT CHECKLIST

---

# DOMAIN A — LANDING / SMART ENTRY

## SP-A01 Landing Page

**Purpose:** อธิบาย SELFPRINT และนำผู้ใช้เข้าสู่ product experience

Checklist:

- [ ] Hero
- [ ] Product value proposition
- [ ] Living Intelligence explanation
- [ ] Twin concept explanation
- [ ] 12 dimensions explanation
- [ ] Smart Entry CTA
- [ ] Login / signup
- [ ] Mobile layout
- [ ] Footer
- [ ] SEO
- [ ] OG metadata
- [ ] accessibility
- [ ] loading performance
- [ ] no broken links

**Closure evidence required:**
- Desktop E2E
- Mobile E2E
- visual inspection
- link audit
- metadata audit

**Priority:** P0

---

## SP-A02 Smart Entry

ต้องเปลี่ยนจาก landing → onboarding อย่างต่อเนื่อง

Required narrative:

```text
Human Prototype
      ↓
Break Apart
      ↓
Node Data
      ↓
Baseline Signal
      ↓
Twin Core
      ↓
Core Awakening
      ↓
Living Twin
```

Checklist:

- [ ] User prototype visual
- [ ] transformation animation
- [ ] node data representation
- [ ] data transmission
- [ ] twin core formation
- [ ] intelligent growth
- [ ] transition into onboarding
- [ ] reduced-motion fallback
- [ ] mobile equivalent
- [ ] no dead-end

**Priority:** P0

---

# DOMAIN B — ONBOARDING

## SP-B01 User Baseline

Collect and normalize:

- [ ] identity data
- [ ] required profile data
- [ ] birth-related data where required
- [ ] user-entered preferences
- [ ] initial emotional / contextual signals where specified
- [ ] consent
- [ ] privacy state

---

## SP-B02 Node Data

Baseline data must become structured intelligence input.

Checklist:

- [ ] schema
- [ ] normalization
- [ ] persistence
- [ ] validation
- [ ] user ownership
- [ ] downstream consumers
- [ ] provenance

---

## SP-B03 Procedural Twin Visual

Current repository includes procedural visual generation.

Required:

- [ ] deterministic generation
- [ ] same input → same baseline visual
- [ ] meaningful relation to user traits
- [ ] persisted state
- [ ] loading state
- [ ] fallback
- [ ] mobile
- [ ] accessibility

Current implementation must be verified rather than assumed complete.

---

# DOMAIN C — 12 DIMENSIONS

SELFPRINT must support the complete 12-dimension intelligence model.

For each dimension:

- [ ] Definition
- [ ] Input
- [ ] Normalization
- [ ] Engine
- [ ] Output
- [ ] Score / signal model where applicable
- [ ] Interpretation
- [ ] Confidence
- [ ] Persistence
- [ ] Twin integration
- [ ] UI
- [ ] AI integration
- [ ] Test
- [ ] Error handling

Required matrix:

| Dimension | Engine | Input | Output | Persisted | UI | Test | Status |
|---|---|---|---|---|---|---|---|
| D01 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D02 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D03 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D04 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D05 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D06 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D07 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D08 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D09 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D10 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D11 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |
| D12 | TBD/verified | ☐ | ☐ | ☐ | ☐ | ☐ | |

**Important:** AI MUST NOT invent dimension names, formulas, or scientific claims. If the master directive specifies them elsewhere, those exact definitions must be imported here and reconciled against implementation.

**Priority:** P0

---

# DOMAIN D — SICE INTELLIGENCE

SELFPRINT architecture requires the SICE intelligence layer.

Current product constraint:

**SICE = 16 engines**

The number of API endpoints is an independent architectural constraint.

**API limit: 12 APIs — LOCKED**

These must never be confused.

```text
SICE engines = 16
API surface = 12
```

One API may orchestrate multiple engines.

For every SICE engine:

- [ ] engine identity
- [ ] responsibility
- [ ] input contract
- [ ] output contract
- [ ] dependencies
- [ ] persistence requirement
- [ ] API consumer
- [ ] error behavior
- [ ] test
- [ ] observability
- [ ] cost / performance expectation

Required:

| Engine | Responsibility | API | Test | Persist | Status |
|---|---|---|---|---|---|
| S01 | MUST VERIFY FROM DIRECTIVE | | | | |
| S02 | MUST VERIFY FROM DIRECTIVE | | | | |
| S03 | MUST VERIFY FROM DIRECTIVE | | | | |
| S04 | MUST VERIFY FROM DIRECTIVE | | | | |
| S05 | MUST VERIFY FROM DIRECTIVE | | | | |
| S06 | MUST VERIFY FROM DIRECTIVE | | | | |
| S07 | MUST VERIFY FROM DIRECTIVE | | | | |
| S08 | MUST VERIFY FROM DIRECTIVE | | | | |
| S09 | MUST VERIFY FROM DIRECTIVE | | | | |
| S10 | MUST VERIFY FROM DIRECTIVE | | | | |
| S11 | MUST VERIFY FROM DIRECTIVE | | | | |
| S12 | MUST VERIFY FROM DIRECTIVE | | | | |
| S13 | MUST VERIFY FROM DIRECTIVE | | | | |
| S14 | MUST VERIFY FROM DIRECTIVE | | | | |
| S15 | MUST VERIFY FROM DIRECTIVE | | | | |
| S16 | MUST VERIFY FROM DIRECTIVE | | | | |

**No AI may silently reduce SICE from 16 to 12 because there are only 12 APIs.**

---

# DOMAIN E — BLUEPRINT

Blueprint is the normalized intelligence representation before Twin Birth.

Required:

- [ ] aggregate baseline
- [ ] 12-dimension result
- [ ] SICE result
- [ ] patterns
- [ ] signals
- [ ] confidence
- [ ] contradictions
- [ ] user context
- [ ] persistence
- [ ] versioning
- [ ] regeneration behavior

**Priority:** P0

---

# DOMAIN F — CORE AWAKENING

Required experience:

```text
Blueprint
   ↓
Core
   ↓
Activation
   ↓
Identity formation
   ↓
Twin Birth
```

Checklist:

- [ ] initiation
- [ ] progress state
- [ ] intelligence processing
- [ ] core creation
- [ ] persistence
- [ ] resume after interruption
- [ ] failure recovery
- [ ] idempotency
- [ ] completion
- [ ] E2E

**Priority:** P0

---

# DOMAIN G — TWIN BIRTH

This is a P0 product requirement.

Required routes / flows must be verified against actual implementation.

Known current baseline gaps include:

- `/en/twin-birth`
- `/en/twin/:id`
- `/en/twin/patterns`

These must not remain undocumented skips.

Checklist:

- [ ] Twin Birth route
- [ ] birth process
- [ ] Twin identity
- [ ] Twin creation
- [ ] Twin persistence
- [ ] Twin retrieval
- [ ] Twin profile
- [ ] Twin visual
- [ ] Twin metadata
- [ ] Twin patterns
- [ ] error recovery
- [ ] reload persistence
- [ ] E2E creation
- [ ] E2E retrieval

**Current baseline:** NOT CLOSED until verified.

---

# DOMAIN H — LIVING TWIN

The Twin must become a living product object, not merely a visual.

Required:

- [ ] identity
- [ ] visual representation
- [ ] current state
- [ ] memory
- [ ] evolution
- [ ] interaction
- [ ] intelligence context
- [ ] history
- [ ] persistence
- [ ] versioning
- [ ] loading
- [ ] error
- [ ] empty state

Three.js / visual implementation:

- [ ] actual runtime rendering
- [ ] no crash
- [ ] mobile behavior
- [ ] performance
- [ ] fallback
- [ ] accessibility where applicable

---

# DOMAIN I — TWIN PROFILE

Required:

- [ ] profile route
- [ ] Twin summary
- [ ] Twin traits
- [ ] visual
- [ ] patterns
- [ ] intelligence summary
- [ ] evolution
- [ ] memory relationship
- [ ] edit/update where specified
- [ ] upload where specified
- [ ] persistence
- [ ] E2E

---

# DOMAIN J — UPLOAD

Current baseline indicates Upload UI is not implemented.

This is therefore an explicit closure item.

Required:

- [ ] upload UI
- [ ] accepted formats
- [ ] size limits
- [ ] validation
- [ ] preview
- [ ] upload progress
- [ ] failure state
- [ ] retry
- [ ] storage
- [ ] user isolation
- [ ] metadata
- [ ] deletion
- [ ] security
- [ ] E2E

**Priority:** P1 unless master directive elevates it to P0.

---

# DOMAIN K — MEMORY

Memory must support the Living Twin.

Required:

- [ ] memory creation
- [ ] memory retrieval
- [ ] memory update
- [ ] memory relevance
- [ ] user ownership
- [ ] privacy
- [ ] deletion semantics
- [ ] context injection
- [ ] memory limits
- [ ] stale memory handling
- [ ] E2E persistence

Memory must never silently mix users.

---

# DOMAIN L — EVOLUTION

Twin must be capable of changing over time according to defined product rules.

Required:

- [ ] baseline state
- [ ] current state
- [ ] changes
- [ ] event source
- [ ] time
- [ ] evolution logic
- [ ] history
- [ ] visualization
- [ ] persistence
- [ ] deterministic behavior where required

No fake evolution based only on random animation.

---

# DOMAIN M — TODAY

Today is the living entry point.

Current product navigation defines:

```text
Today
Explore
Chat
Dashboard
Menu
```

Required Today:

- [ ] current Twin state
- [ ] relevant insight
- [ ] current context
- [ ] memory-aware presentation
- [ ] actionable entry
- [ ] recent evolution
- [ ] decision/context when relevant
- [ ] responsive experience

---

# DOMAIN N — EXPLORE

Required:

- [ ] dimensions
- [ ] Twin insights
- [ ] patterns
- [ ] worlds
- [ ] history where appropriate
- [ ] navigation
- [ ] deep links
- [ ] empty states
- [ ] mobile

---

# DOMAIN O — TWIN CHAT

Current repo has Immersive Twin Chat implementation.

Required:

- [ ] authenticated access
- [ ] correct Twin context
- [ ] memory context
- [ ] streaming
- [ ] model routing
- [ ] failure handling
- [ ] retry
- [ ] message persistence where required
- [ ] audio feedback where intended
- [ ] immersive UI
- [ ] mobile keyboard behavior
- [ ] scroll behavior
- [ ] accessibility

AI model routing must remain cost-aware and must not silently break product behavior.

---

# DOMAIN P — NOVA / GUIDANCE AI

Nova is a product-facing intelligence / guide layer where specified.

Required:

- [ ] defined responsibility
- [ ] no duplication with Twin Chat
- [ ] model routing
- [ ] context
- [ ] structured output where required
- [ ] cost controls
- [ ] fallback
- [ ] error handling
- [ ] logging
- [ ] test

Important:

**Do not create a second visible AI simply because another API exists.**

---

# DOMAIN Q — DECISION

Current baseline explicitly reports Decision features not fully implemented.

Required:

- [ ] decision entry
- [ ] decision context
- [ ] Twin context
- [ ] decision creation
- [ ] analysis
- [ ] alternatives
- [ ] tradeoffs
- [ ] insight
- [ ] persistence
- [ ] history
- [ ] decision log
- [ ] compare where specified
- [ ] export where specified
- [ ] AI insight SLA where specified
- [ ] authenticated persistence
- [ ] E2E

Known gap categories include:

- `/en/decision-log`
- `/en/decisions`
- decision form
- compare
- export

These remain OPEN until implemented and verified.

---

# DOMAIN R — WORLDS

Worlds are contextual intelligence spaces.

Product requirement:

**12 Worlds**

For every World:

- [ ] identity
- [ ] purpose
- [ ] data input
- [ ] Twin relationship
- [ ] intelligence
- [ ] UI
- [ ] tile
- [ ] detail view
- [ ] persistence
- [ ] navigation
- [ ] empty state
- [ ] loading
- [ ] error
- [ ] mobile
- [ ] E2E

Required matrix:

| World | Identity | Intelligence | UI | Persistence | E2E | Status |
|---|---|---|---|---|---|---|
| W01 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W02 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W03 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W04 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W05 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W06 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W07 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W08 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W09 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W10 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W11 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| W12 | ☐ | ☐ | ☐ | ☐ | ☐ | |

**Important:** Master Gate PASS is not sufficient evidence that all 12 World product capabilities are complete.

---

# DOMAIN S — DASHBOARD

Required:

- [ ] user overview
- [ ] Twin overview
- [ ] intelligence summary
- [ ] recent evolution
- [ ] memory/activity where specified
- [ ] navigation
- [ ] mobile
- [ ] no unnecessary visual clutter
- [ ] loading
- [ ] error
- [ ] empty state

---

# DOMAIN T — MENU / SETTINGS

Required:

- [ ] profile
- [ ] account
- [ ] preferences
- [ ] privacy
- [ ] AI preferences where specified
- [ ] data controls
- [ ] logout
- [ ] responsive
- [ ] accessibility

---

# DOMAIN U — AUTHENTICATION

Required:

- [ ] signup
- [ ] login
- [ ] logout
- [ ] session restoration
- [ ] refresh
- [ ] protected routes
- [ ] unauthorized redirect
- [ ] password flow if supported
- [ ] user isolation
- [ ] E2E

Current repository has verified authentication pipeline evidence, but every new protected feature must independently respect the same boundary.

---

# DOMAIN V — DATABASE / DATA INTEGRITY

For every table:

- [ ] owner
- [ ] primary key
- [ ] foreign keys
- [ ] indexes
- [ ] constraints
- [ ] RLS
- [ ] insert policy
- [ ] select policy
- [ ] update policy
- [ ] delete policy
- [ ] migration
- [ ] rollback / recovery consideration
- [ ] test

Migration requirements:

- [ ] idempotent where appropriate
- [ ] no duplicate indexes
- [ ] no duplicate triggers
- [ ] no unsafe destructive migration
- [ ] production-safe

---

# DOMAIN W — API / EDGE

## LOCKED ARCHITECTURAL CONSTRAINT

**Maximum API surface = 12 APIs**

This is an architectural constraint.

Do not increase API count merely to implement additional engines.

Use internal orchestration / engine composition when appropriate.

Required for every API:

- [ ] purpose
- [ ] auth
- [ ] input schema
- [ ] validation
- [ ] output schema
- [ ] error schema
- [ ] rate limiting
- [ ] user isolation
- [ ] AI dependency
- [ ] timeout
- [ ] retry
- [ ] observability
- [ ] tests

---

# DOMAIN X — AI / MODEL ROUTING

Current repository includes model routing with cost-aware priority.

Required:

- [ ] model abstraction
- [ ] default model
- [ ] fallback model
- [ ] provider failure
- [ ] rate limit handling
- [ ] timeout
- [ ] structured response
- [ ] cost awareness
- [ ] latency
- [ ] prompt version
- [ ] logging without secrets
- [ ] test

Critical rule:

```text
429 ≠ 500
Provider failure ≠ application failure
```

Do not hide provider errors as application success.

---

# DOMAIN Y — SECURITY / PRIVACY

Required:

- [ ] secrets never committed
- [ ] environment separation
- [ ] auth
- [ ] authorization
- [ ] RLS
- [ ] user isolation
- [ ] API validation
- [ ] file upload security
- [ ] XSS prevention
- [ ] injection protection
- [ ] sensitive logging protection
- [ ] AI prompt/data isolation
- [ ] rate limiting
- [ ] abuse handling

---

# DOMAIN Z — PERFORMANCE

Required:

- [ ] production build
- [ ] bundle review
- [ ] lazy loading where appropriate
- [ ] image optimization
- [ ] Three.js performance
- [ ] mobile performance
- [ ] AI latency
- [ ] API latency
- [ ] DB query performance
- [ ] load test
- [ ] error rate

k6 may be manual, but if performance is claimed as production-ready, evidence must exist.

---

# DOMAIN AA — MOBILE / PWA

Required:

- [ ] responsive layout
- [ ] touch targets
- [ ] safe areas
- [ ] keyboard behavior
- [ ] scroll behavior
- [ ] PWA mode
- [ ] viewport
- [ ] mobile navigation
- [ ] audio behavior
- [ ] Three.js behavior
- [ ] offline/error behavior where required

Current repository already contains mobile/PWA work, but each product capability must still be tested end-to-end.

---

# DOMAIN AB — ACCESSIBILITY

Required:

- [ ] keyboard navigation
- [ ] focus
- [ ] labels
- [ ] contrast
- [ ] semantic elements
- [ ] reduced motion
- [ ] screen reader basics
- [ ] touch target size
- [ ] form errors

---

# DOMAIN AC — SEO / PUBLIC WEB

Required:

- [ ] title
- [ ] meta description
- [ ] canonical
- [ ] OG
- [ ] Twitter/X metadata where relevant
- [ ] robots
- [ ] sitemap
- [ ] H hierarchy
- [ ] alt text
- [ ] public route indexing strategy
- [ ] `/api/og` behavior if required

---

# DOMAIN AD — OBSERVABILITY

Required:

- [ ] errors
- [ ] API failures
- [ ] AI failures
- [ ] latency
- [ ] rate limit
- [ ] deployment status
- [ ] critical workflow failure
- [ ] no sensitive data leakage

---

# DOMAIN AE — TESTING

## Unit

- [ ] business logic
- [ ] engines
- [ ] utilities
- [ ] model router
- [ ] transformations

## Integration

- [ ] DB
- [ ] API
- [ ] auth
- [ ] AI routing
- [ ] persistence

## E2E

- [ ] landing
- [ ] auth
- [ ] onboarding
- [ ] Twin creation
- [ ] Twin retrieval
- [ ] chat
- [ ] dashboard
- [ ] decisions
- [ ] worlds
- [ ] memory
- [ ] evolution
- [ ] upload
- [ ] mobile

## Negative tests

Every critical feature must test:

- [ ] invalid input
- [ ] unauthorized
- [ ] missing data
- [ ] provider failure
- [ ] timeout
- [ ] empty state
- [ ] persistence failure

---

# 7. CURRENT KNOWN OPEN ITEMS

At the baseline represented by commit `11db9bf`, the repository itself documents the following as not implemented / incomplete:

### P0 / P1 OPEN

- [ ] Twin creation E2E / actual Twin Birth implementation
- [ ] `/en/twin-birth`
- [ ] `/en/twin/:id`
- [ ] `/en/twin/patterns`
- [ ] Upload UI
- [ ] Decision feature set
- [ ] Decision form
- [ ] Decision persistence
- [ ] Compare feature
- [ ] Export CSV/JSON
- [ ] AI insight SLA
- [ ] World visual feature coverage
- [ ] World tile/detail testability
- [ ] Session persistence for decision/world routes
- [ ] missing test IDs where they represent real testability requirements
- [ ] staging alias DNS / Cloudflare 525
- [ ] product documentation reconciliation

These are not allowed to remain permanently classified as "SKIP".

The closure objective is:

```text
SKIP
   ↓
IMPLEMENT
   ↓
TEST
   ↓
VERIFY
   ↓
CLOSE
```

or:

```text
SKIP
   ↓
FORMAL PRODUCT DECISION
   ↓
DEPRECATED / REMOVED
```

Never:

```text
SKIP → pretend PASS
```

---

# 8. MASTER GATE ≠ PRODUCT CLOSURE

The following are separate gates:

## Gate 1 — Engineering

- [ ] Build
- [ ] TypeScript
- [ ] Lint
- [ ] Unit

## Gate 2 — Runtime

- [ ] Production E2E
- [ ] Mobile
- [ ] Auth
- [ ] persistence

## Gate 3 — Product

- [ ] every Product Spec item implemented

## Gate 4 — Integration

- [ ] feature relationships work

## Gate 5 — Security

- [ ] auth/RLS/isolation

## Gate 6 — Performance

- [ ] latency
- [ ] error rate
- [ ] load evidence

## Gate 7 — Documentation

- [ ] Reality Map
- [ ] Product Spec
- [ ] tests
- [ ] routes
- [ ] API
- [ ] DB

## Gate 8 — Final Closure

ALL required items:

`CLOSED`

Only then:

# SELFPRINT = 100% CLOSED

---

# 9. AI SESSION OPERATING PROTOCOL

Every AI developer session MUST follow this sequence.

## STEP 1 — READ

Read:

1. this document
2. current Reality Map
3. current test report
4. relevant code
5. relevant DB migrations
6. relevant API
7. relevant tests

Never start coding from memory.

---

## STEP 2 — REALITY CHECK

Before changing anything:

```text
What does Product Spec require?
What does code actually do?
What does database actually support?
What does API actually expose?
What do tests actually prove?
```

Produce:

```text
IMPLEMENTED
PARTIAL
MISSING
BROKEN
REGRESSED
UNKNOWN
```

---

## STEP 3 — SELECT WORK

Choose the highest-priority unresolved item.

Priority:

```text
P0
↓
P1
↓
P2
↓
P3
```

Do not skip P0 because another feature is easier.

---

## STEP 4 — IMPLEMENT

Implement the complete vertical slice when practical:

```text
UI
↓
State
↓
API
↓
AI
↓
DB
↓
Persistence
↓
Test
```

Avoid implementing only visual shells.

---

## STEP 5 — VERIFY

Run appropriate tests.

Minimum:

```bash
npm run typecheck
npm run lint
npm test
```

Then feature-specific tests.

Critical product features require E2E.

---

## STEP 6 — INSPECT

Do not trust green output blindly.

Inspect:

- screenshots
- console
- network
- DB result
- API response
- persistence after reload
- mobile behavior

---

## STEP 7 — UPDATE THIS DOCUMENT

Every completed session MUST update:

- Status
- Evidence
- Commit
- Remaining issues
- Test result

Example:

```text
SP-G01 Twin Birth

Before:
MISSING

After:
CLOSED

Evidence:
- route implemented
- DB persistence verified
- E2E passed
- reload verified
- mobile verified

Commit:
<commit>

Tests:
<npm command>
<result>
```

---

# 10. SESSION HANDOFF CONTRACT

At the end of EVERY AI session, output:

```text
SELFPRINT SESSION CLOSURE

Session:
<date/session>

Worked on:
<IDs>

Completed:
<IDs>

Implemented:
<IDs>

Verified:
<IDs>

Closed:
<IDs>

Still Open:
<IDs>

Regressions:
<none / list>

Tests Run:
<commands>

Results:
<results>

Files Changed:
<files>

Commit:
<hash>

Product Spec Updated:
YES / NO

Reality Map Updated:
YES / NO

Next Highest Priority:
<ID>
```

If `Product Spec Updated = NO`, the session is NOT considered administratively closed.

---

# 11. NO-CLAIM POLICY

AI MUST NOT say:

- "100% complete"
- "production ready"
- "fully implemented"
- "all features done"
- "all tests pass"
- "Master Gate passed"

unless the exact evidence supports the claim.

Examples:

### WRONG

> Twin system is complete because master-gate.spec.ts passes.

### CORRECT

> Master Gate passed, but Twin Birth remains OPEN because the product route and real Twin creation E2E are not implemented.

---

# 12. SKIP POLICY

A skipped test is never automatically a pass.

Every skip must have:

```text
SKIP ID
Reason
Affected feature
Priority
Owner
Next action
```

Allowed reasons:

1. Feature not implemented
2. Environment unavailable
3. Explicitly deprecated
4. Product decision pending

A skip may be removed only by:

```text
IMPLEMENT → TEST → VERIFY
```

or:

```text
PRODUCT DECISION → DEPRECATE
```

---

# 13. REGRESSION POLICY

If a previously CLOSED item fails:

```text
CLOSED
  ↓
REGRESSED
```

Immediately.

Do not preserve the old CLOSED status because the feature worked in an older commit.

A new commit must restore:

```text
REGRESSED → VERIFIED → CLOSED
```

---

# 14. DOCUMENT UPDATE LAW

Whenever code changes any of the following:

- route
- API
- database
- feature
- AI behavior
- navigation
- product flow
- user-visible behavior
- test contract

the Product Spec must be reviewed.

If affected:

```text
CODE CHANGE
    ↓
SPEC REVIEW
    ↓
SPEC UPDATE
    ↓
TEST
```

No silent architecture drift.

---

# 15. CHANGE CONTROL

New feature request:

```text
REQUEST
↓
PRODUCT VALUE
↓
DUPLICATE CHECK
↓
ARCHITECTURE IMPACT
↓
API COUNT IMPACT
↓
DB IMPACT
↓
AI IMPACT
↓
TEST IMPACT
↓
PRIORITY
↓
APPROVAL
↓
IMPLEMENT
```

Before adding a new API:

**STOP.**

Check the 12 API limit.

Before adding a new AI:

**STOP.**

Check whether the capability can use existing intelligence / brain / routing architecture.

Before adding a new visible AI character:

**STOP.**

Check product character architecture first.

---

# 16. ARCHITECTURE CONSTRAINTS

These are LOCKED unless explicitly changed by Product Owner.

### Locked

- API surface: **12 APIs**
- SICE: **16 engines**
- Worlds: **12**
- Product identity: SELFPRINT
- Living Twin is core product
- AI backend may use multiple models
- visible AI must not be duplicated unnecessarily
- user data isolation is mandatory

---

# 17. PRODUCTION RELEASE GATE

Release is allowed only when:

### Code

- [ ] TypeScript 0 errors
- [ ] Lint 0 errors
- [ ] Build PASS

### Tests

- [ ] Unit PASS
- [ ] Integration PASS
- [ ] E2E PASS
- [ ] Mobile PASS
- [ ] Critical journeys PASS
- [ ] No unexplained skips

### Product

- [ ] P0 = 100% CLOSED
- [ ] P1 = 100% CLOSED
- [ ] No core feature MISSING
- [ ] No core feature PARTIAL

### Data

- [ ] DB migrations safe
- [ ] RLS PASS
- [ ] authorization PASS
- [ ] user isolation PASS

### AI

- [ ] routing PASS
- [ ] fallback PASS
- [ ] rate-limit handling PASS
- [ ] latency acceptable
- [ ] no secret leakage

### Infrastructure

- [ ] Production deployment PASS
- [ ] staging PASS
- [ ] domain PASS
- [ ] DNS PASS
- [ ] environment variables PASS

### UX

- [ ] Desktop
- [ ] Mobile
- [ ] accessibility
- [ ] loading
- [ ] empty
- [ ] error
- [ ] success

### Documentation

- [ ] Product Spec updated
- [ ] Reality Map updated
- [ ] Test report updated
- [ ] release evidence recorded

---

# 18. 100% CLOSURE FORMULA

Product percentage MUST NOT be calculated from test pass rate alone.

Recommended:

```text
PRODUCT CLOSURE =
CLOSED REQUIRED ITEMS
---------------------
TOTAL REQUIRED ITEMS
```

A test suite can be:

```text
100% PASS
```

while Product Closure is:

```text
75%
```

This is valid.

The target is:

```text
Required Items = 100%
Closed Items = 100%
Unresolved P0 = 0
Unresolved P1 = 0
Unexplained Skip = 0
Known Regression = 0
```

Then:

# PRODUCT = 100% CLOSED

---

# 19. MASTER CLOSURE BOARD

This section must be maintained continuously.

| ID | Domain | Priority | Status | Evidence | Commit | Remaining |
|---|---|---:|---|---|---|---|
| SP-A01 | Landing | P0 | | | | |
| SP-A02 | Smart Entry | P0 | | | | |
| SP-B01 | Baseline | P0 | | | | |
| SP-B02 | Node Data | P0 | | | | |
| SP-B03 | Twin Visual | P0 | | | | |
| SP-C01–C12 | Dimensions | P0 | | | | |
| SP-D01–D16 | SICE | P0 | | | | |
| SP-E01 | Blueprint | P0 | | | | |
| SP-F01 | Core Awakening | P0 | | | | |
| SP-G01 | Twin Birth | P0 | | | | |
| SP-H01 | Living Twin | P0 | | | | |
| SP-I01 | Twin Profile | P0 | | | | |
| SP-J01 | Upload | P1 | | | | |
| SP-K01 | Memory | P0 | | | | |
| SP-L01 | Evolution | P0 | | | | |
| SP-M01 | Today | P0 | | | | |
| SP-N01 | Explore | P1 | | | | |
| SP-O01 | Twin Chat | P0 | | | | |
| SP-P01 | Nova | P0 | | | | |
| SP-Q01 | Decision | P1 | | | | |
| SP-R01–R12 | Worlds | P1 | | | | |
| SP-S01 | Dashboard | P1 | | | | |
| SP-T01 | Menu/Settings | P1 | | | | |
| SP-U01 | Auth | P0 | | | | |
| SP-V01 | Database | P0 | | | | |
| SP-W01 | API | P0 | | | | |
| SP-X01 | AI | P0 | | | | |
| SP-Y01 | Security | P0 | | | | |
| SP-Z01 | Performance | P1 | | | | |
| SP-AA01 | Mobile/PWA | P0 | | | | |
| SP-AB01 | Accessibility | P1 | | | | |
| SP-AC01 | SEO | P1 | | | | |
| SP-AD01 | Observability | P1 | | | | |
| SP-AE01 | Testing | P0 | | | | |

---

# 20. FINAL PRODUCT OWNER SIGN-OFF

SELFPRINT may only be declared:

# 100% PRODUCTION READY

when:

```text
[ ] All P0 CLOSED
[ ] All P1 CLOSED
[ ] All required P2 CLOSED or formally deferred
[ ] No unexplained SKIP
[ ] No MISSING core feature
[ ] No PARTIAL core feature
[ ] No REGRESSION
[ ] All critical E2E PASS
[ ] Database integrity PASS
[ ] Security PASS
[ ] User isolation PASS
[ ] AI integration PASS
[ ] Mobile PASS
[ ] Production deployment PASS
[ ] Documentation synchronized
[ ] Product Owner accepts final closure
```

Final status:

```text
SELFPRINT
=========
PRODUCT CLOSURE: ____ %
P0 OPEN: ______
P1 OPEN: ______
P2 OPEN: ______
REGRESSIONS: ______
UNEXPLAINED SKIPS: ______

FINAL STATUS:
[ ] NOT READY
[ ] RELEASE CANDIDATE
[ ] PRODUCTION READY
[ ] 100% CLOSED
```

---

# 21. ABSOLUTE RULE FOR ALL FUTURE AI SESSIONS

> **DO NOT START BY CODING.**
>
> Read this document.
>
> Inspect the actual repository.
>
> Identify the current OPEN item.
>
> Verify reality.
>
> Implement the highest-priority unresolved requirement.
>
> Test it.
>
> Prove it.
>
> Update this document.
>
> Only then declare the session closed.

The AI's job is not to make the report look green.

The AI's job is to make the PRODUCT actually complete.

---

# END OF MASTER PRODUCT SPECIFICATION & 100% CLOSURE BOOK