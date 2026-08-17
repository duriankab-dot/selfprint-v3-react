# MASTER TASK

## Astrovera → Selfprint Feature Intelligence & Integration Audit

### ROLE

คุณคือ Senior Full-Stack Architect + Product Architect + UX Engineer + AI Engineer + Code Auditor

มีโปรเจกต์ 2 ระบบ:

* **Source Project:** Astrovera
* **Target Project:** Selfprint

เป้าหมายของงานนี้คือ:

> ตรวจสอบ codebase, architecture, database, API, AI system, UX/UI และ feature ของทั้งสองโปรเจกต์แบบลงลึก แล้วคัดเลือกความสามารถจาก Astrovera ที่สามารถนำมาใช้ใน Selfprint ได้จริง โดยเน้นการ REUSE / ADAPT ของระบบเดิม ไม่ใช่การสร้าง feature ใหม่ซ้ำซ้อน

---

# IMPORTANT RULES

### 1. ห้ามเริ่มเขียนโค้ดทันที

ก่อนแก้ไข code ต้อง:

1. Inspect ทั้งสอง codebase
2. Run/build/test ทั้งสองโปรเจกต์
3. ตรวจ architecture
4. ตรวจ feature ที่มีอยู่จริง
5. ตรวจ database/schema
6. ตรวจ API
7. ตรวจ AI prompts / AI pipelines
8. ตรวจ component/UI
9. ตรวจ routing
10. ตรวจ authentication
11. ตรวจ state management
12. ตรวจ storage
13. ตรวจ analytics/event tracking
14. ตรวจ deployment configuration

จากนั้นจึงทำ Integration Plan

---

### 2. ห้ามเดาจากชื่อ feature

ให้ถือว่า:

**Code = Source of Truth**

หาก documentation บอกว่ามี feature แต่ใน code ไม่มี implementation จริง ให้ระบุว่า:

> DOCUMENTED BUT NOT IMPLEMENTED

หาก code มีแต่ไม่ได้ใช้งาน ให้ระบุว่า:

> IMPLEMENTED BUT UNUSED

หากทำงานจริง ให้ระบุว่า:

> VERIFIED IMPLEMENTED

---

### 3. ห้ามทำให้ Selfprint กลายเป็น Astrovera

Selfprint ยังคงเป็น:

> SELF-DISCOVERY / PERSONAL INTELLIGENCE PRODUCT

Astrovera เป็น:

> SOURCE OF INTELLIGENCE ENGINES

ห้ามนำ Astrovera UI/branding/navigation มาแทนที่ Selfprint

ให้ย้ายเฉพาะ:

* intelligence
* algorithms
* analysis engines
* AI capabilities
* data models
* reusable components
* UX patterns
* business logic

ที่เหมาะสม

---

# PHASE 1 — FULL CODEBASE AUDIT

ตรวจ Astrovera และ Selfprint แยกกันก่อน

สร้างรายงาน:

## 1. Technology Stack

ตรวจ:

* Framework
* Language
* Build system
* Package manager
* Database
* ORM
* API
* Authentication
* AI provider
* AI SDK
* State management
* Storage
* Hosting
* PWA
* Analytics
* Payment
* External APIs

---

## 2. Architecture Map

สร้าง architecture diagram ของแต่ละระบบ

ตัวอย่าง:

```text
Frontend
   ↓
Application Layer
   ↓
Business Logic
   ↓
AI / Intelligence Layer
   ↓
API
   ↓
Database
   ↓
External Services
```

ระบุไฟล์จริงของแต่ละ layer

---

# PHASE 2 — FEATURE INVENTORY

สร้าง Feature Inventory ของทั้งสองโปรเจกต์

ห้ามสรุปแบบกว้าง ๆ

ต้องระบุ:

```text
Feature
Location
Files
Components
API
Database
Dependencies
Status
Reusable?
Migration Difficulty
```

Status:

* VERIFIED IMPLEMENTED
* PARTIAL
* UNUSED
* EXPERIMENTAL
* DOCUMENTED ONLY
* BROKEN

---

# PHASE 3 — ASTROVERA INTELLIGENCE EXTRACTION

ค้นหาและวิเคราะห์ความสามารถทั้งหมดของ Astrovera โดยเฉพาะ:

## A. Personal Intelligence

ค้นหา:

* Personal Profile
* User Model
* Personalization
* User Context
* Personal Memory
* User History

---

## B. Archetype System

ตรวจ:

* Archetype engine
* 12 Archetypes
* Hybrid Archetypes
* Archetype scoring
* Archetype classification
* Strength
* Shadow
* Growth
* Archetype transitions
* Archetype → Journey logic

ระบุ:

```text
Input
↓
Scoring
↓
Classification
↓
Output
```

และระบุไฟล์/ฟังก์ชันจริง

---

# C. Journey System

ตรวจ:

* Journey model
* Journey stages
* Current stage
* Transition logic
* Growth logic
* Journey visualization
* Journey recommendations

ตรวจว่า Journey สามารถแยกออกเป็น reusable engine ได้หรือไม่

---

# D. Life Pattern Analysis

ตรวจ:

* Pattern detection
* Recurring patterns
* Life themes
* Behavioral patterns
* Decision patterns
* Relationship patterns
* Career patterns
* Pattern confidence

---

# E. Multi-System Analysis

ตรวจระบบที่ Astrovera มีจริง เช่น:

* Vedic Astrology
* Jaimini
* KP
* Numerology
* Human Design
* Psychological Astrology
* Archetype
* Life Pattern
* Career Analysis
* Wealth Analysis
* Dharma
* Karma
* Leadership

สำหรับแต่ละระบบต้องตอบ:

1. มี implementation จริงหรือไม่?
2. อยู่ที่ไฟล์ไหน?
3. Input คืออะไร?
4. Output คืออะไร?
5. ใช้ร่วมกับระบบอื่นอย่างไร?
6. สามารถแยกเป็น reusable service ได้หรือไม่?
7. Selfprint ควรใช้หรือไม่?

---

# F. AI ENGINE

ตรวจ Astrovera AI ทั้งหมด

ค้นหา:

* System prompts
* Developer prompts
* User prompts
* Prompt templates
* Context builder
* Memory
* RAG
* Structured output
* Function calling
* AI agents
* Analysis pipeline
* AI response validation
* AI scoring

ต้องสร้าง:

```text
USER DATA
↓
CONTEXT BUILDER
↓
PROMPT
↓
AI
↓
STRUCTURED OUTPUT
↓
VALIDATION
↓
UI
```

ระบุ source code จริงของแต่ละขั้นตอน

---

# G. Decision Intelligence

ตรวจระบบที่เกี่ยวข้องกับ:

* Decision analysis
* Timing
* Decision support
* Risk
* Opportunity
* Recommendation
* Scenario
* Action

ประเมินว่าอะไรสามารถนำเข้า Selfprint ได้

---

# H. Journal / Reflection

ตรวจ:

* Journal
* Reflection
* Daily check-in
* Mood
* Questions
* AI reflection
* Historical analysis

โดยเฉพาะ logic ที่สามารถนำไปสร้าง:

```text
Journal
↓
Pattern Detection
↓
Personal Insight
```

---

# I. Confidence / Evidence

ค้นหา logic ที่ใช้:

* Confidence
* Evidence
* Source convergence
* Scoring
* Reliability
* Multiple signals

หากยังไม่มี implementation ให้ระบุว่าเป็น:

PROPOSED ONLY

---

# PHASE 4 — SELFPRINT AUDIT

ทำแบบเดียวกันกับ Selfprint

โดยเน้นตรวจ:

### Current User Experience

```text
Landing
↓
Signup
↓
Onboarding
↓
Assessment
↓
Result
↓
Profile
↓
AI
↓
Journal
↓
Journey
↓
Daily Use
↓
Retention
↓
Premium
```

ต้องตรวจจาก code จริงว่า flow ปัจจุบันทำงานอย่างไร

---

# PHASE 5 — FEATURE GAP ANALYSIS

สร้างตาราง:

| Capability                 | Astrovera | Selfprint | Recommendation |
| -------------------------- | --------- | --------- | -------------- |
| Archetype                  | ?         | ?         | ?              |
| Journey                    | ?         | ?         | ?              |
| Life Pattern               | ?         | ?         | ?              |
| Personal AI                | ?         | ?         | ?              |
| AI Memory                  | ?         | ?         | ?              |
| Journal                    | ?         | ?         | ?              |
| Pattern Detection          | ?         | ?         | ?              |
| Decision Intelligence      | ?         | ?         | ?              |
| Multi-perspective analysis | ?         | ?         | ?              |
| Astrology                  | ?         | ?         | ?              |
| Human Design               | ?         | ?         | ?              |
| Numerology                 | ?         | ?         | ?              |
| Confidence                 | ?         | ?         | ?              |
| Evidence                   | ?         | ?         | ?              |
| Gamification               | ?         | ?         | ?              |

---

# PHASE 6 — MIGRATION CLASSIFICATION

ทุก Astrovera feature ต้องถูกจัดประเภทเป็นหนึ่งใน 5 กลุ่ม:

### A — MIGRATE DIRECTLY

สามารถนำ code/logic มาใช้ได้เกือบตรง ๆ

### B — ADAPT

ต้องปรับ architecture หรือ UX ก่อน

### C — REBUILD USING ASTROVERA LOGIC

แนวคิดดี แต่ implementation ไม่เหมาะกับ Selfprint

### D — DO NOT MIGRATE

ไม่เหมาะกับ Selfprint

### E — FUTURE

ดีแต่ยังไม่ควรทำตอนนี้

---

# PHASE 7 — PRIORITY SCORE

ให้คะแนนแต่ละ feature:

```text
User Value       1–10
Business Value   1–10
Reuse Value      1–10
Technical Risk   1–10
UX Risk          1–10
Development Cost 1–10
```

แล้วคำนวณ Priority

จัด:

### P0

ต้องทำก่อน

### P1

ควรทำ

### P2

ทำภายหลัง

### P3

ไม่ต้องทำ

---

# PHASE 8 — TARGET ARCHITECTURE

ออกแบบ architecture ของ Selfprint หลัง migration

เป้าหมาย:

```text
                     SELFPRINT
                         │
                         ▼
                PERSONAL MODEL
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Identity        Patterns        Journey
          │              │              │
          ▼              ▼              ▼
     Archetype       Behavior        Life Phase
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  INTELLIGENCE LAYER
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
   Psychology        Astro Engine      AI Engine
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ▼
                  PERSONAL AI
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Journal    Decision    Action
              │          │          │
              └──────────┼──────────┘
                         ▼
                  PATTERN MEMORY
                         │
                         ▼
                     EVOLUTION
```

ปรับ architecture ตาม codebase จริง ห้ามยึด diagram นี้ถ้าขัดกับระบบจริง

---

# PHASE 9 — DATA MODEL

ตรวจ database ของทั้งสองระบบ

ระบุ:

* User
* Profile
* Assessment
* Archetype
* Journey
* Journal
* Insight
* Pattern
* Decision
* AI Memory
* Goals
* Events
* Analytics

ออกแบบ migration:

```text
ASTROVERA DATA
       ↓
TRANSFORMATION
       ↓
SELFPRINT DATA MODEL
```

ห้าม duplicate data หากไม่จำเป็น

---

# PHASE 10 — AI CONTEXT ARCHITECTURE

สร้าง Personal Context ของ Selfprint

AI ควรสามารถเข้าถึงเฉพาะข้อมูลที่เหมาะสม เช่น:

```text
USER PROFILE
+
ASSESSMENT
+
ARCHETYPE
+
JOURNEY
+
PATTERNS
+
JOURNAL
+
GOALS
+
DECISION HISTORY
+
OPTIONAL ASTROLOGY
```

แล้วสร้าง:

```text
Personal Context Builder
```

เป็น reusable service

ห้ามใส่ข้อมูลทั้งหมดลง prompt ทุกครั้ง

ให้ใช้ context selection ตาม task

---

# PHASE 11 — ASTROLOGY INTEGRATION

สำคัญ:

ห้ามทำให้ Selfprint กลายเป็น Astrology App

Astrology ต้องเป็น:

> OPTIONAL INTELLIGENCE PERSPECTIVE

Architecture:

```text
Selfprint
│
├── Psychology
├── Behavior
├── Archetype
├── Goals
├── Journal
└── Astrology
          ↓
   Personal Intelligence
```

ผู้ใช้ที่ไม่สนใจ Astrology ต้องสามารถใช้ Selfprint ได้เต็มระบบ

ผู้ใช้ที่สนใจสามารถเปิด:

### Cosmic Perspective

---

# PHASE 12 — UX INTEGRATION

ห้าม copy Astrovera UI มาใส่ Selfprint

ให้รักษา:

* Selfprint branding
* typography
* colors
* navigation
* visual language
* interaction model

สิ่งที่เอามาจาก Astrovera คือ:

**logic + intelligence + useful interaction patterns**

---

# PHASE 13 — IMPLEMENTATION PLAN

หลังจาก audit เสร็จ ห้ามแก้ code ทันที

สร้าง Implementation Plan:

```text
Phase 1
Foundation

Phase 2
Personal Model

Phase 3
Archetype

Phase 4
Journey

Phase 5
Pattern Engine

Phase 6
AI Context / Memory

Phase 7
Decision Intelligence

Phase 8
Journal Intelligence

Phase 9
Optional Astrology

Phase 10
Testing
```

สำหรับแต่ละ Phase ระบุ:

* Files to create
* Files to modify
* Files to delete
* Database changes
* API changes
* Dependencies
* Migration
* Tests
* Rollback strategy

---

# PHASE 14 — CODE REUSE

หากสามารถ reuse Astrovera code ได้:

ห้าม copy/paste แบบ uncontrolled

ให้เลือก:

### Shared Package

หรือ

### Shared Service

หรือ

### Extracted Library

ตัวอย่าง:

```text
/packages
    /intelligence-core
        /archetype
        /journey
        /patterns
        /decision
        /context
```

Selfprint และ Astrovera สามารถใช้ engine เดียวกันได้ในอนาคต หาก architecture เหมาะสม

---

# PHASE 15 — TESTING

ต้องทดสอบ:

### Functional

* Existing Selfprint features
* Migrated features
* AI
* Assessment
* Archetype
* Journey
* Pattern
* Journal
* Decision

### Regression

ต้องแน่ใจว่า:

> ฟีเจอร์เดิมของ Selfprint ไม่พัง

### UX

ตรวจ:

* onboarding
* loading
* empty states
* errors
* mobile
* responsive
* accessibility

### AI

ทดสอบ:

* context accuracy
* hallucination
* contradictory signals
* missing data
* insufficient evidence
* privacy

---

# PHASE 16 — PERFORMANCE

ตรวจผลกระทบจาก Astrovera integration:

* Bundle size
* API latency
* AI latency
* Database queries
* Initial load
* Lazy loading
* Code splitting

ห้ามโหลด astrology / heavy analysis engine หากผู้ใช้ไม่ได้ใช้

---

# PHASE 17 — SECURITY & PRIVACY

ข้อมูล Selfprint มีความเป็นส่วนตัวสูง

ตรวจ:

* Authentication
* Authorization
* Data isolation
* API exposure
* Prompt injection
* AI data leakage
* Sensitive data
* Logs
* Analytics
* Database permissions

ห้ามให้ user A สามารถอ่านข้อมูลของ user B

---

# PHASE 18 — FINAL DELIVERABLE

ก่อนเขียน code ให้สร้างไฟล์:

```text
ASTROVERA_TO_SELFPRINT_AUDIT.md
ASTROVERA_FEATURE_INVENTORY.md
SELFPRINT_FEATURE_INVENTORY.md
FEATURE_GAP_MATRIX.md
MIGRATION_PLAN.md
TARGET_ARCHITECTURE.md
DATA_MIGRATION_PLAN.md
AI_CONTEXT_ARCHITECTURE.md
```

และสรุป Executive Summary:

## 1. What Astrovera has that Selfprint needs

## 2. What Selfprint already has

## 3. What should NOT be duplicated

## 4. What should be migrated

## 5. What should be rebuilt

## 6. What should remain Astrovera-only

## 7. P0 / P1 / P2 roadmap

## 8. Estimated implementation complexity

---

# CRITICAL PRODUCT PRINCIPLE

เป้าหมายไม่ใช่:

> “เอา Astrovera มาใส่ Selfprint”

แต่คือ:

> **“ใช้สิ่งที่ Astrovera สร้างไว้แล้ว เพื่อทำให้ Selfprint มี Personal Intelligence ที่ลึกขึ้น โดยผู้ใช้ไม่รู้สึกว่ากำลังใช้ Astrovera”**

Selfprint ต้องยังรู้สึกเป็น Selfprint

แต่ภายในมี Intelligence Engine ที่แข็งแรงขึ้นอย่างมาก

---

# FINAL COMMAND

เริ่มจาก:

### STEP 1

Inspect ทั้งสอง repository

### STEP 2

Run ทั้งสองระบบ

### STEP 3

สร้าง Feature Inventory

### STEP 4

ค้นหา Astrovera Intelligence Engine ที่ reusable

### STEP 5

Map เข้ากับ Selfprint architecture

### STEP 6

สร้าง Gap Matrix

### STEP 7

เสนอ Migration Plan

### STEP 8

**หยุดและรายงานผลก่อน**

ห้ามแก้ production code จนกว่าจะสร้าง audit + migration plan เสร็จ

หลังจากรายงานแล้ว ให้รอคำสั่ง:

> `APPROVE MIGRATION`

จึงเริ่ม implementation
