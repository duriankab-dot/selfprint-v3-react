# 🧠 SELFPRINT INTELLIGENCE SYSTEM ARCHITECTURE
**Status**: 📘 Complete Code Review  
**Date**: 2026-08-14 (UPDATED)

---

## 🔴 แยก Nova และ AI Twin ใน Architecture

| Layer | Nova (AI Guide) | AI Twin (ฝาแฝดส่วนตัว) |
|-------|-----------------|----------------------|
| บทบาท | Guide / Teacher | Personal Companion |
| เกิดเมื่อ | มีอยู่แล้วในระบบ | หลัง Core Awakening (WOW 3) |
| Intelligence | Generic (ทุกคนเหมือนกัน) | Personal Intelligence Seed |
| การเรียนรู้ | ไม่เรียนรู้จากผู้ใช้ | เรียนรู้จากผู้ใช้ตลอดเวลา |
| 12 SICE | ใช้ SICE เพื่อวิเคราะห์ | ใช้ SICE เพื่อเรียนรู้และเติบโต |

---

## 🧠 12 SICE — Selfprint Intelligence Core Engines

**12 SICE** เป็นแกน proprietary intelligence ของ Selfprint

### Core Flow
User Input
↓
12 SICE
↓
Cross-Engine Synthesis
↓
Fine-Tuning
↓
Personal Intelligence

text

### 12 SICE Engines

| # | Engine | หน้าที่ |
|---|--------|--------|
| 1 | **PersonalContextBuilder** | สังเคราะห์ข้อมูลผู้ใช้ทั้งหมด |
| 2 | **PatternDetector** | ตรวจจับรูปแบบพฤติกรรม |
| 3 | **InsightEngine** | แปลง Pattern เป็นภาษามนุษย์ |
| 4 | **AIFeedbackLoop** | ปรับ Personal Model จาก Feedback |
| 5 | **TwinStateEngine** | คำนวณสถานะ Twin แบบ Real-time |
| 6 | **ExperienceEngine** | เลือกประสบการณ์ (Hub+Mood+Time) |
| 7 | **EnvironmentEngine** | ปรับ Environment (Theme+Audio) |
| 8 | **BadgeEngine** | ติดตาม Achievement |
| 9 | **BehavioralForecastEngine** | ทำนายทิศทางพฤติกรรม |
| 10 | **FutureSelfEngine** | สร้าง Future Self Projection |
| 11 | **MemoryManager** | จัดการความจำ |
| 12 | **DecisionIntelligenceEngine** | วิเคราะห์การตัดสินใจ |

---

## 🔄 Core Flows

### 1. Nova → Twin Journey (Canonical User Flow)
User enters Selfprint
↓
Nova greets (WOW #1: First Insight)
↓
Onboarding: Initial Data Collection
↓
Nova analyzes (WOW #1 moment)
↓
Fine-tuning phase
↓
Full Analysis (WOW #2 moment)
↓
Core Awakening begins (WOW #3)
↓
Twin is born with Initial Intelligence Seed
↓
User names their Twin
↓
Twin becomes primary AI
↓
Nova works behind scenes (Dashboard, recommendations)

text

**Key Rule:** Twin เกิดจาก Core Awakening (WOW 3) — **ไม่ใช่ระหว่าง Onboarding**

### 2. Twin Initial Intelligence Seed
**Twin ห้ามเริ่มจากศูนย์**
Nova
+
User Data
+
12 SICE
+
Fine-tuning
+
Full Analysis
=
Personal Intelligence Seed
↓
Twin ฉลาดตั้งแต่เกิด

text

**ห้ามตอบผู้ใช้ว่า:** "ฉันยังไม่มีข้อมูลเกี่ยวกับคุณ"

### 3. Daily Twin Chat Flow (After Awakening)
User enters Twin chat
↓
Twin loads:
├─ Personal Intelligence Seed
├─ Personal Context (values, goals, patterns)
├─ Recent Memories (last 5 interactions)
├─ Behavioral Patterns (autonomy, confidence trends)
└─ Mood/World context
↓
User sends message
↓
Twin analyzes with 12 SICE
↓
Twin responds (personalized + contextual)
↓
Message saved as Reflection
↓
Personal Model updates (learning signal)
↓
Twin becomes slightly more understanding

text

### 4. 12 SICE Learning Pipeline
New Experience
↓
Relevant SICE
↓
Cross-Engine Synthesis
↓
Learning
↓
Twin Improvement

text

### 5. Nova Behind Scenes (Orchestration)
Nova (via AI Orchestrator) periodically:
• Reviews user state → selects dashboard sections
• Suggests topics/questions based on patterns
• Recommends World/Mood based on user profile
• BUT: Does not directly chat (Twin does)

text

---

## 📊 System Architecture Overview
┌─────────────────────────────────────────────────────────────┐
│ USER INTERACTION LAYER │
│ (Pages: Dashboard, Twin, Onboarding, Analysis, etc.) │
└──────────────────────┬──────────────────────────────────────┘
│
┌──────────────────────▼──────────────────────────────────────┐
│ CONTEXT LAYER │
│ ├─ AuthContext (Passkey/OAuth/MagicLink) │
│ ├─ TwinContext (18 Archetypes, maturityScore) │
│ ├─ EmotionContext (6 moods + history) │
│ ├─ HubContext (12 life hubs) │
│ ├─ AudioContext (music ducking) │
│ ├─ EvolutionContext (reflection tracking) │
│ └─ PopupContext (contextual messages) │
└──────────────────────┬──────────────────────────────────────┘
│
┌──────────────────────▼──────────────────────────────────────┐
│ STATE MANAGEMENT (Zustand) │
│ ├─ userStore (profile, SICE scores, landing context) │
│ └─ twinStore (messages, autonomy, patterns, feedback) │
└──────────────────────┬──────────────────────────────────────┘
│
┌──────────────────────▼──────────────────────────────────────┐
│ 12 SICE — INTELLIGENCE CORE ENGINES │
│ │
│ 🔹 PersonalContextBuilder │
│ → Synthesizes user data into PersonalContext │
│ → Extracts: values, goals, strengths, blindspots │
│ → Input: onboarding answers, reflections, decisions │
│ │
│ 🔹 AIFeedbackLoop │
│ → Learns from user feedback (very_true/somewhat/not_me) │
│ → Calibrates pattern confidence │
│ → Algorithm: >70% true → +0.1, >40% "not me" → -0.15 │
│ → Tracks accuracy trend │
│ │
│ 🔹 PatternDetector │
│ → Identifies behavioral, decision, lifestyle patterns │
│ → Features: pattern confidence, emerging patterns │
│ │
│ 🔹 InsightEngine │
│ → Generates human-language summaries from raw data │
│ → KNOW / INFER / UNKNOWN confidence levels │
│ │
│ 🔹 MemoryManager │
│ → Manages personal memories (CRUD operations) │
│ → 4 memory types: small_win, important_moment, discovery,│
│ personal │
│ │
│ 🔹 TwinStateEngine │
│ → 8 states: awakening→aware→connected→reflective │
│ →insightful→aligned→flourishing→mastery │
│ │
│ 🔹 DecisionIntelligenceEngine │
│ → 8 decision frameworks (pros_cons, 2nd order, etc.) │
│ → Detects bias risks (personalized) │
│ → 100% Thai UI content │
│ │
│ 🔹 Additional Engines (6 more) │
│ ├─ BadgeEngine (achievement tracking) │
│ ├─ DailyBriefEngine (morning/evening briefings) │
│ ├─ FutureSelfEngine (projection scenarios) │
│ ├─ BehavioralForecastEngine (predict patterns) │
│ ├─ ExperienceEngine (select experience) │
│ └─ EnvironmentEngine (adjust theme/audio) │
│ │
└──────────────────────┬──────────────────────────────────────┘
│
┌──────────────────────▼──────────────────────────────────────┐
│ SERVICES LAYER │
│ ├─ nova-ai (callNova, getSystemPrompt, getStarterMessage) │
│ ├─ personalModel (submitFeedback, getStatus) │
│ ├─ supabase-service (message persistence, history) │
│ └─ selfprintChat API (system prompt injection) │
└──────────────────────┬──────────────────────────────────────┘
│
┌──────────────────────▼──────────────────────────────────────┐
│ EXTERNAL SERVICES │
│ ├─ Claude AI (via Brain Gateway + system prompt) │
│ ├─ Supabase (PostgreSQL + Auth) │
│ ├─ Service Worker (PWA offline support) │
│ └─ localStorage (client-side persistence) │
└──────────────────────────────────────────────────────────────┘

text

---

## 🧠 Twin Learning System

**Core Principle:** Twin doesn't just remember text; it learns patterns and synthesizes understanding

**Twin learns from (6 sources):**
1. **Conversation** — Direct messages in Chat
2. **Reflection** — Journal entries, analyses, self-assessments
3. **Activities** — Tracked behaviors, completed tasks, engagement patterns
4. **Journal** — User-recorded notes and thoughts
5. **Journey** — Progression over time, milestones reached
6. **Feedback** — Accuracy ratings on insights (very_true / somewhat / not_sure / not_me)

**Learning Pipeline:**
Conversation + Reflection + Activities + Journal + Journey + Feedback
↓
12 SICE Cross-Engine Synthesis
↓
Personal Learning (synthesis)
↓
Twin understands more deeply
↓
Next insights are more accurate
↓
Cycle repeats at deeper level

text

**NOT:** Chatbot that memorizes text  
**YES:** AI that synthesizes behavior, detects patterns, offers personalized guidance

---

## 🧬 Core Data Types (types.ts)

```typescript
PersonalContext (Complete User Model)
├─ values: Value[]            // Core values (confidence 0-1)
├─ goals: Goal[]              // Objectives (timeframe, hub)
├─ strengths: Strength[]      // Capabilities
├─ blindSpots: BlindSpot[]    // Unaware aspects (sensitivityLevel)
├─ emotionalRange             // Mood profile + triggers
├─ decisionStyle              // analytical/intuitive/collaborative
└─ relationships: Relationship[] // Important people

PersonalMemory (Important moments)
├─ memoryType: small_win | important_moment | discovery | personal
└─ linkedTo: decision_id or journal_id

BehavioralPattern (Repeating behaviors)
├─ patternType: repeating | emerging | changing
├─ evidencePoints: EvidencePoint[] // (source, date, confidence)
├─ frequency: "weekly" | "every 3 days"
└─ confidence: 0-1

InsightFeedback (User validation)
├─ feedbackType: very_true | somewhat | not_sure | not_me
└─ comment: optional user note
🔄 Core Flows (Detailed)
1. Onboarding → Personal Context Initialization
text
Onboarding (answers)
  ↓
Nova collects data
  ↓
12 SICE Analysis
  ↓
PersonalContextInitializer.validateOnboardingData()
  ↓
PersonalContextBuilder.initialize()
  ├─ createPersonalProfile()
  ├─ inferContextFromOnboarding()
  ├─ detectInitialPatterns()
  ├─ createMemoriesFromOnboarding()
  └─ synthesizeContext()
  ↓
PersonalContext + BehavioralPatterns + Memories stored
  ↓
WOW 1: First Insight
  ↓
Fine-tuning
  ↓
WOW 2: Full Analysis
  ↓
WOW 3: Core Awakening → Twin เกิด
2. Twin State Engine: Evolution States
State	Label (Thai)	Description	Data Requirement
awakening	กำลังตื่น	Twin begins awareness	Initial Intelligence Seed
aware	เตรียมรับรู้	Starting to understand patterns	5+ reflections
connected	เชื่อมต่อแล้ว	Recognizes recurring themes	20+ data points
reflective	งานทบทวนแบบ	Can reflect with depth	Deep patterns + goals
insightful	ลึกลับแล้ว	Generates meaningful insights	High confidence model
aligned	สอดคล้องแล้ว	Values align with actions	Consistent behavior data
flourishing	พัฒนาขึ้น	Optimal understanding	Continuous growth
mastery	ความเชี่ยวชาญ	Deep wisdom	Mature model
3. Growth Stages (5 Stages)
Stage	Description
Stage 1	Core Formation — Twin เริ่มรู้จักผู้ใช้
Stage 2	Pattern Recognition — Twin เริ่มเห็นรูปแบบ
Stage 3	Deep Understanding — Twin เข้าใจผู้ใช้อย่างลึกซึ้ง
Stage 4	Wisdom Stage — Twin ให้คำแนะนำที่มีคุณค่า
Stage 5	Full Holographic Human Form — Twin สมบูรณ์
🧪 Personality Architecture: 1,296 Combinations
18 Archetypes
Base 12: Innocent, Explorer, Sage, Everyman, Lover, Jester, Hero, Outlaw, Magician, Caregiver, Creator, Ruler
Hybrid 6: Alchemist, Dreamer, Maverick, Strategist, Diplomat, Artisan

12 Hub Worlds (Life Areas)
Identity, Decision, Relationship, Career, Health, Money, AI-Twin, Learning, Creativity, Spirituality, Impact, Activities

6 Moods (Emotional Context)
stressed, confused, confident, drained, ready, reflective

Result: 18 × 12 × 6 = 1,296 personality variations
🎯 Architecture Strengths
✅ 12 SICE Core Intelligence — Proprietary intelligence engines
✅ Twin Initial Intelligence Seed — Twin ฉลาดตั้งแต่เกิด
✅ Core Awakening (WOW 3) — Twin เกิดจาก moment ที่มีความหมาย
✅ Type-safe (TypeScript strict mode)
✅ Modular engines (12 SICE + supporting engines)
✅ Feedback loop (learns from user validation)
✅ Personality architecture (1,296 combinations)
✅ Thai-first UX (all UI text in Thai)
✅ Privacy-first (biometric fingerprint handling)
✅ PWA-ready (offline support + service worker)

Generated: 2026-08-14 (UPDATED)
Reviewed: Full codebase scan (234 files)
Status: Ready for implementation phase ✅