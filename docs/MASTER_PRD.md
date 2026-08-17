# MASTER PRD — SELFPRINT

---

## 🔴 เอกสารนี้คืออะไร

เอกสารนี้คือ **Product Requirements Document (PRD)** ฉบับสมบูรณ์ของ Selfprint  
ใช้เป็น **Source of Truth** สำหรับการพัฒนาทุกครั้ง

---

## 🔴 แยก Nova และ AI Twin ให้ชัดเจน

> **🔴 สำคัญที่สุด:** Nova และ AI Twin เป็นคนละตัวกัน — ห้ามสับสนเด็ดขาด!

| บุคลิก | บทบาท | ใช้ทำอะไร | สร้างโดยใคร |
|--------|-------|-----------|-------------|
| **Nova** | **AI Guide / ผู้แนะนำ** | เป็นผู้ช่วยที่คอยแนะนำ, ให้คำปรึกษา, ช่วยผู้ใช้, นำทางในแอป | Selfprint (ระบบ) — มีอยู่แล้วตั้งแต่เริ่มต้น |
| **AI Twin** | **AI ฝาแฝดส่วนตัว** | เป็นเวอร์ชันดิจิทัลของผู้ใช้ เรียนรู้จากผู้ใช้, จดจำ, วิเคราะห์, ให้ Insight | **เกิดหลัง Core Awakening (WOW 3)** — ตั้งชื่อเองได้ |

---

### 🟢 Nova (AI Guide)

**บทบาท:** ผู้แนะนำ, ผู้ช่วย, ครู, พี่เลี้ยง  
**บุคลิก:** เป็นมิตร, อบอุ่น, ชัดเจน, ใจดี  
**หน้าที่:**
- ต้อนรับผู้ใช้ใหม่
- พาผู้ใช้ผ่าน Onboarding
- เก็บข้อมูลเริ่มต้น (Initial data collection)
- วิเคราะห์ครั้งแรก (First Analysis) — WOW 1
- ปรับแต่งข้อมูล (Fine-tuning)
- ตอบคำถามทั่วไป (Q&A)
- วิเคราะห์เชิงลึก (Full Analysis) — WOW 2
- แนะนำ Core Awakening (WOW 3)
- ทำงานเบื้องหลังหลังจาก Twin เกิด

### 🔵 AI Twin (AI ฝาแฝดส่วนตัว)

**บทบาท:** ตัวแทนดิจิทัลของผู้ใช้  
**บุคลิก:** เรียนรู้จากผู้ใช้ — จะเป็นเหมือนผู้ใช้มากขึ้นเรื่อยๆ  
**เกิดเมื่อไหร่:** หลัง **Core Awakening (WOW 3)**

**Initial Intelligence Seed:**
Nova + User Data + 12 SICE + Fine-tuning = Personal Intelligence Seed

text
Twin ฉลาดตั้งแต่เกิด — ห้ามตอบว่า "ฉันยังไม่มีข้อมูลเกี่ยวกับคุณ"

---

## PRODUCT REQUIREMENTS

**Product:** Selfprint — Living Personal Intelligence Platform  
**Type:** PWA (Progressive Web App)  
**Platform:** Web (Mobile-first, Desktop supported)  
**Stack:** React + TypeScript + Vite / Supabase / 12 SICE + Claude API / Stripe / Vercel  
**Status:** Production / Active Development

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

**หลัง Twin เกิด:**
New Experience
↓
Relevant SICE
↓
Learning
↓
Twin Improvement

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

## FUNCTIONAL REQUIREMENTS

---

### FR-01 | LANDING PAGE

**Feature ID:** FR-01  
**Name:** Landing Page (Emotion-First)  
**Purpose:** เปิด Selfprint ครั้งแรก ให้ผู้ใช้รู้สึก "นี่แหละคือสิ่งที่ฉันต้องการ" ก่อนถามข้อมูลใดๆ  
**User Story:** ในฐานะคนที่ยังไม่รู้จัก Selfprint ฉันอยากเข้าใจได้ใน 10 วินาที ว่านี่คืออะไรและมันช่วยฉันได้ยังไง  
**Input:** Emotion selection (6 moods), Birth data (optional)  
**Output:** Landing context บันทึกลง userStore, redirect → /onboarding  
**UX:** Grid 2 คอลัมน์ Hero + EmotionSelector, Progressive CTA, Smooth scroll to sections  
**Business Rules:** ห้าม lock content ก่อนเลือก mood, Birth data อยู่ท้ายสุด  
**AI Logic:** mood ที่เลือกบน Landing ส่งต่อเป็น landingContext ไปยัง Onboarding  
**Data:** `userStore.landingContext = { mood }`  
**Dependencies:** EmotionContext, useUserStore  
**Priority:** P0  
**Acceptance Criteria:** ผู้ใช้สามารถเลือก mood แล้ว navigate ไป /onboarding ได้ภายใน 3 tap  
**Status:** ✅ Implemented

---

### FR-02 | ONBOARDING

**Feature ID:** FR-02  
**Name:** Onboarding (Nova-led Journey)  
**Purpose:** ให้ Nova นำทางผู้ใช้ผ่านกระบวนการสร้าง Personal Model  
**User Story:** ในฐานะผู้ใช้ใหม่ ฉันอยากให้ Selfprint รู้จักฉันผ่านการคุยกับ Nova ไม่ใช่การกรอกฟอร์มน่าเบื่อ  
**Input:** Mood, Nova Conversation answers, Birth data, Finetuning answers  
**Output:** Personal Model เบื้องต้น, Data for Core Awakening  
**UX:** 7 steps sequential: Emotion → Nova Conversation → AI Creation → Blueprint → Fine-tune → Full Analysis → Core Awakening → Twin Birth  
**Business Rules:** ห้ามข้ามขั้น Nova Conversation ก่อนเสร็จ; Core Awakening เป็นขั้นสุดท้ายเสมอ  
**AI Logic:** Nova ใช้ 12 SICE วิเคราะห์ → สร้าง Personal Intelligence Seed  
**Data:** PendingOnboardingData บันทึกชั่วคราว → ใช้ใน Core Awakening  
**Dependencies:** EmotionContext, useUserStore, Supabase Auth, 12 SICE  
**Priority:** P0  
**Acceptance Criteria:** ผู้ใช้ที่เสร็จ onboarding มี Personal Intelligence Seed และพร้อมสำหรับ Core Awakening  
**Status:** ✅ Implemented

---

### FR-02b | THREE WOW MOMENTS

**Feature ID:** FR-02b  
**Name:** Three WOW Moments — Core Product Experience  
**Purpose:** Define signature moments where user feels profound understanding from Selfprint  
**Status:** ✅ Implemented (onboarding flow)

**WOW #1 — FIRST INSIGHT**
- **When:** End of Onboarding (Initial Analysis)
- **What Happens:** Nova displays initial analysis of user
- **User Feels:** "It understands me already"
- **Implementation:** ShowAnalysisPage with InsightEngine output
- **Criteria:** User sees personalized insights within 5 minutes of meeting Nova

**WOW #2 — FULL ANALYSIS**
- **When:** After Fine-tuning (Full Analysis)
- **What Happens:** Nova shows comprehensive personal profile
- **User Feels:** "It REALLY knows me"
- **Implementation:** FullAnalysisPage with deeper insights, patterns, recommendations
- **Criteria:** Analysis depth clearly increased vs WOW #1

**WOW #3 — CORE AWAKENING**
- **When:** Twin creation / awakening (After Full Analysis)
- **What Happens:** Nova introduces Core Awakening → Visual celebration when AI Twin becomes "alive"
- **User Feels:** "My Twin exists now — it's real"
- **Implementation:** TwinEvolutionScene + celebration animation + Twin introduction message
- **Criteria:** User names Twin and receives personalized intro message from Twin

---

### FR-03 | AI TWIN CHAT

**Feature ID:** FR-03  
**Name:** AI Twin Chat (หลัง Core Awakening)  
**Purpose:** ให้ผู้ใช้สนทนากับ Twin ที่ฉลาดตั้งแต่เกิด และปรับบุคลิกตาม Hub × Mood × Archetype  
**User Story:** ในฐานะผู้ใช้ ฉันอยากคุยกับ AI ที่รู้จักฉัน รู้สึกถึงอารมณ์ฉัน และพูดกับฉันในแบบที่เหมาะสมกับสถานการณ์  
**Input:** User message, Hub context, Mood, Archetype, TwinProfile, Personal Intelligence Seed  
**Output:** Twin response, Learning signals สำหรับปรับ Personal Model  
**UX:** Chat interface แบบ full-screen, Voice input/output toggle, Hub switcher  
**Business Rules:** System prompt = BASE_PERSONA + HUB_CONTEXT + MOOD_MODULATION + ARCHETYPE_VOICE + maturity adjustment; 1,296 combinations  
**AI Logic:** 12 SICE Cross-Engine Synthesis → Claude API → Response parsing + learning signals  
**Data:** บันทึกทุก message → `chat_messages` table  
**Dependencies:** 12 SICE, TwinContext, HubContext, EmotionContext  
**Priority:** P0  
**Acceptance Criteria:** Twin ตอบสนองใน <3 วินาที, บุคลิกเปลี่ยนเมื่อ Hub หรือ Mood เปลี่ยน  
**Status:** ✅ Implemented

---

### FR-04 | DASHBOARD (YOUR SPACE)

**Feature ID:** FR-04  
**Name:** Dashboard — Your Space  
**Purpose:** แสดงภาพรวมตัวเองอย่างครบถ้วน: Executive Summary, Analytics, Patterns, AI Insights, Twin, Growth  
**User Story:** ในฐานะผู้ใช้ที่ใช้งาน Selfprint มาสักพัก ฉันอยากเห็น "ภาพรวมของฉันตอนนี้" ในหน้าเดียว  
**Input:** userId จาก Supabase Auth session, date filters  
**Output:** Insights summary, Decision logs, Trend charts, Pattern insights, Twin status, Growth signals  
**UX:** Scrollable single page; Components: ExecutiveSummary → TodaySection → LivingTwin → AnalyticsSummary → InsightsCard → PatternInsights → IntelligencePanel → DecisionLogTable → TrendChart → GrowthSpace → AskCoach → FutureSelfPanel  
**Business Rules:** userId ต้องมาจาก `useAuth().session?.user?.id` เท่านั้น  
**AI Logic:** 12 SICE สังเคราะห์ข้อมูลเป็น human-language summary  
**Data:** `chat_messages`, `user_profiles`, `personal_context`, `behavioral_patterns`  
**Dependencies:** 12 SICE, useAuth  
**Priority:** P0  
**Acceptance Criteria:** Dashboard โหลดข้อมูลจริงจาก Supabase, Executive Summary แสดง text summary ที่อ่านเป็นภาษามนุษย์  
**Status:** ✅ Implemented

---

### FR-05 | ANALYSIS PAGE

**Feature ID:** FR-05  
**Name:** Full Analysis Page  
**Purpose:** แสดง Deep Analysis ครบ: Decision Style, Strengths, Insights, Opportunities, Blind Spots  
**User Story:** ในฐานะผู้ใช้ ฉันอยากเห็นการวิเคราะห์ตัวเองที่ลึกกว่า Dashboard ปกติ รวมถึง Future Self Projection  
**Input:** userId, Personal Model data  
**Output:** Full analysis report พร้อม confidence indicators, Behavioral forecast  
**UX:** /analysis page; ConfidenceIndicator แสดงระดับ KNOW / INFER / UNKNOWN สำหรับแต่ละ insight  
**Business Rules:** ข้อมูลที่ "KNOW" = มาจากข้อมูลตรง; "INFER" = สรุปจากรูปแบบ; "UNKNOWN" = ยังไม่มีข้อมูล  
**AI Logic:** 12 SICE InsightEngine + BehavioralForecastEngine + FutureSelfEngine  
**Data:** `personal_context`, `behavioral_patterns`, `chat_messages`  
**Dependencies:** 12 SICE, ConfidenceIndicator  
**Priority:** P1  
**Acceptance Criteria:** ทุก insight มี confidence badge, Future Self section แสดงได้เมื่อมีข้อมูลพอ  
**Status:** ✅ Implemented

---

### FR-06 | MEMORY SYSTEM

**Feature ID:** FR-06  
**Name:** Personal Memory Manager  
**Purpose:** ให้ผู้ใช้บันทึกความทรงจำสำคัญ และให้ Twin ใช้ memory เหล่านี้ในการตอบสนองอัจฉริยะขึ้น  
**User Story:** ในฐานะผู้ใช้ ฉันอยากบอก Twin ว่า "จำสิ่งนี้ไว้" และรู้ว่า Twin จะใช้มันเมื่อเกี่ยวข้อง  
**Input:** Memory type (small_win / important_moment / discovery / personal), title, content, tags  
**Output:** Memory บันทึกใน Supabase, Twin ใช้ memory ใน context window เมื่อเกี่ยวข้อง  
**UX:** เพิ่ม Memory จากหน้า Chat หรือ Dashboard; แก้ไข / ลบได้  
**Business Rules:** Memory types: `small_win`, `important_moment`, `discovery`, `personal`; ผู้ใช้ควบคุมทั้งหมด  
**AI Logic:** MemoryManager.addMemory() → Supabase; Twin ดึง relevant memories ก่อนตอบ  
**Data:** `personal_memories` table (user_id, type, title, content, tags, linked_to)  
**Dependencies:** MemoryManager, supabase, TwinContext  
**Priority:** P1 (Plus plan)  
**Acceptance Criteria:** บันทึก memory สำเร็จ, Twin อ้างอิง memory ใน conversation ที่เกี่ยวข้อง  
**Status:** ✅ Implemented

---

## AI REQUIREMENTS

---

### AI-01 | 12 SICE CORE

**Feature ID:** AI-01  
**Name:** 12 SICE — Selfprint Intelligence Core Engines  
**Purpose:** แกน proprietary intelligence ของ Selfprint — 12 engines ทำงานร่วมกันแบบ Cross-Engine Synthesis  
**Flow:** User Input → 12 SICE → Cross-Engine Synthesis → Fine-Tuning → Personal Intelligence  
**Business Rules:** ห้ามใช้ generic chatbot + memory เท่านั้น — ต้องใช้ 12 SICE เป็นแกนหลัก  
**Status:** ✅ Implemented

---

### AI-02 | TWIN PERSONALITY ENGINE

**Feature ID:** AI-02  
**Name:** Twin Personality System  
**Purpose:** สร้าง 1,296 personality combinations ที่แตกต่างกันอย่างมีความหมาย  
**Input:** hub (12), mood (6), archetype (18), userProfile, maturityScore  
**Output:** System prompt (1,000–1,500 tokens) สำหรับส่งไปยัง Claude API  
**AI Logic:**
BASE_PERSONA (300-400 tokens)

HUB_CONTEXT (100-150 tokens) × 12 hubs

MOOD_MODULATION (100-150 tokens) × 6 moods

ARCHETYPE_VOICE (18 archetypes: 12 base + 6 hybrid)

maturity adjustment (0-100)

user insights (strengths, blindSpots, decisionStyle)

text
**Business Rules:** Nova ห้ามตัดสินผู้ใช้, ห้ามใช้วลีเหมารวม, ฟัง > แนะนำ (60:40), จบด้วยคำถามส่วนตัว 1 ข้อ  
**Status:** ✅ Implemented

---

### AI-03 | PERSONAL CONTEXT BUILDER

**Feature ID:** AI-03  
**Name:** PersonalContextBuilder (SICE #1)  
**Purpose:** สังเคราะห์ข้อมูลทั้งหมดของผู้ใช้เป็น PersonalContext ที่ครบถ้วน  
**Flow:** createPersonalProfile → inferContextFromOnboarding → detectInitialPatterns → createMemoriesFromOnboarding → synthesizeContext  
**Output:** PersonalContext (values, goals, strengths, blindSpots, emotionalRange, decisionStyle, relationships, memories, patterns)  
**Dependencies:** Supabase, IntelligenceError types  
**Status:** ✅ Implemented

---

### AI-04 | PATTERN DETECTION

**Feature ID:** AI-04  
**Name:** Pattern Detector (SICE #2)  
**Purpose:** ตรวจจับรูปแบบพฤติกรรมที่ซ้ำๆ จาก decision log history  
**Pattern Types:**
- `autonomy_trend` — autonomy level เพิ่มหรือลดตามเวลา
- `confidence_trend` — confidence เพิ่มหรือลดตามเวลา
- `mood_confidence` — mood ใดที่ confidence ต่ำกว่าปกติ
- `hub_autonomy` — hub ใดที่ autonomy สูง/ต่ำกว่าค่าเฉลี่ย
**Business Rules:** MIN_DATA_POINTS = 6; MIN_GROUP_POINTS = 3; ห้ามแสดง pattern จาก noise  
**Status:** ✅ Implemented

---

### AI-05 | INSIGHT ENGINE

**Feature ID:** AI-05  
**Name:** InsightEngine (SICE #3)  
**Purpose:** แปลง raw data (context + patterns + feedback) เป็น human-language insights  
**Output:** Insight text พร้อม KnowledgeLevel (KNOW / INFER / UNKNOWN) สำหรับแต่ละ insight  
**Business Rules:** ห้าม fabricate insights; แสดง confidence indicator ทุกครั้ง  
**Status:** ✅ Implemented

---

### AI-06 | AI FEEDBACK LOOP

**Feature ID:** AI-06  
**Name:** AIFeedbackLoop (SICE #4)  
**Purpose:** ให้ผู้ใช้ feedback ว่า Insight ตรงหรือไม่ → ปรับ Personal Model  
**Input:** insightId, sentiment (very_true / somewhat / not_sure / not_me), comment  
**Flow:** User feedback → `/api/personal-model` → Supabase → Personal Model recalibration → Twin response ปรับตาม  
**Business Rules:** Idempotent; calibration status: scheduled / in_progress / complete  
**Status:** ✅ Implemented

---

## UX REQUIREMENTS

---

### UX-01 | 5-TAB NAVIGATION

**Feature ID:** UX-01  
**Name:** 5-Tab Bottom Navigation with TWIN Center  
**Tabs:** วันนี้ (Home) / สำรวจ (Explore) / **TWIN** / กิจกรรม (Activities) / ฉัน (Me)  
**Implementation:** BottomNav component, NavBar component  
**Business Rules:** Twin อยู่ตรงกลาง (center position) — เป็น focal point  
**Status:** ✅ Implemented

---

### UX-02 | ADAPTIVE THEME

**Feature ID:** UX-02  
**Name:** Adaptive Theme System  
**Purpose:** ธีม (สี, background, แสง, animation) เปลี่ยนตาม Hub + Mood + เวลาของวัน  
**Implementation:** CSS variables บน `:root` — `--exp-*`, `--tod-*`, `--env-*`, `--lighting-*`, `--twin-*`; data attributes: `data-hub`, `data-mood`, `data-tod`, `data-twin-state`, `data-mode`  
**Business Rules:** §16 User Preference > AI Personalization — AI ไม่ override ถ้า user เคยเลือก hub/mood ไว้แล้ว; ห้าม hardcode สี ใช้ `var(--...)` เท่านั้น  
**Status:** ✅ Implemented

---

### UX-03 | ADAPTIVE AUDIO

**Feature ID:** UX-03  
**Name:** Background Music & Ambient Sound  
**Purpose:** เสียงพื้นหลังปรับตาม Experience: reflection → ambient/piano, focus → minimal pulse, discovery → cosmic ambient  
**Music Experiences:** reflection, focus, discovery, deep_reflection, celebration, idle  
**Business Rules:** ไม่ force-set audio ถ้า musicEnabled = false; Audio ducking เมื่อ Twin พูด; ไม่โหลดทั้งระบบก่อน user interaction  
**Status:** ✅ Implemented

---

## TWIN REQUIREMENTS

---

### TW-01 | TWIN PROFILE

**Feature ID:** TW-01  
**Name:** Twin Profile (TwinContext)  
**Fields:** id, userId, name, primaryArchetype, secondaryArchetype, maturityScore (0–100), birthData (date, time, lat, lng, timezone)  
**Archetypes (18):**  
  Base 12: innocent, explorer, sage, everyman, lover, jester, hero, outlaw, magician, caregiver, creator, ruler  
  Hybrid 6: alchemist, dreamer, maverick, strategist, diplomat, artisan  
**Storage:** localStorage (initial) + Supabase (after claim account)  
**Status:** ✅ Implemented

---

### TW-02 | TWIN INITIAL INTELLIGENCE

**Feature ID:** TW-02  
**Name:** Twin Initial Intelligence Seed  
**Purpose:** Twin ฉลาดตั้งแต่เกิด — ไม่เริ่มจากศูนย์  
**Components:**
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

text
**Business Rules:** ห้ามตอบผู้ใช้ว่า "ฉันยังไม่มีข้อมูลเกี่ยวกับคุณ" ถ้าข้อมูลถูกเก็บและวิเคราะห์ไว้แล้ว  
**Status:** ✅ Implemented

---

### TW-03 | TWIN GROWTH STAGES

**Feature ID:** TW-03  
**Name:** Twin Growth Stages (5 Stages)  
**Purpose:** Twin มี 5 Growth Stages — ไม่ใช่ 3  
**Stages:**
| Stage | Description |
|-------|-------------|
| Stage 1 | Core Formation — Twin เริ่มรู้จักผู้ใช้ |
| Stage 2 | Pattern Recognition — Twin เริ่มเห็นรูปแบบ |
| Stage 3 | Deep Understanding — Twin เข้าใจผู้ใช้อย่างลึกซึ้ง |
| Stage 4 | Wisdom Stage — Twin ให้คำแนะนำที่มีคุณค่า |
| Stage 5 | Full Holographic Human Form — Twin สมบูรณ์ |

**Status:** ✅ Implemented

---

### TW-04 | TWIN UNIQUENESS

**Feature ID:** TW-04  
**Name:** Twin Uniqueness System  
**Purpose:** Twin แต่ละคนไม่เหมือนกัน  
**Input:** 12+6 Hetype, Hub interests, Personal Intelligence, Mood, Preferences  
**Output:** Core, Form, Shape, Color, Visual identity  
**Business Rules:** ห้ามใช้ Twin template เดียวกับทุกคน  
**Status:** ✅ Implemented

---

## MONETIZATION REQUIREMENTS

---

### MN-01 | SUBSCRIPTION TIERS

**Feature ID:** MN-01  
**Name:** 4-Tier Subscription  
**Rule:** Monetize Depth, not Identity — Basic Identity ฟรีเสมอ

| Tier | Price | Tagline | Key Unlock |
|---|---|---|---|
| free | ฿0 | Discover Yourself | Twin พื้นฐาน, 1 Archetype, Hub access |
| plus | ฿249/mo / ฿1,990/yr | Know Yourself | Memory persistence, Pattern detection, Analytics, 18 Archetypes, Daily Brief audio |
| pro | ฿589/mo / ฿4,990/yr | Navigate Yourself | Future Self, Journey Roadmap, Relationship & Career intelligence |
| lifetime | ฿4,990 one-time | Own Your Twin | Pro unlimited, Export data, Custom training, VIP community |

**NEW: Full Capability Trial 7-14 days** — ผูกกับ Friend Mission / Viral Loop / Activities

**Implementation:** Stripe checkout + webhook; SubscriptionContext; `/api/stripe`  
**Status:** ✅ Implemented

---

### MN-02 | HUMAN EXPERT

**Feature ID:** MN-02  
**Name:** Human Expert Service  
**Purpose:** บริการระดับสูงสุด — แยกจาก AI  
**Flow:**
Twin
↓
Advanced Need
↓
Recommend Human Expert
↓
Request Details
↓
User decides
↓
Private Human Session

text
**Pricing:** Premium / high-value / hourly  
**Positioning:** AI = scalable intelligence, Human = highest-touch premium expertise  
**Status:** ✅ Implemented

---

### MN-03 | DIGITAL ASSETS

**Feature ID:** MN-03  
**Name:** Digital Assets System  
**Purpose:** Digital Assets ไม่ได้มีเฉพาะ Gamification — รวม Twin assets, Hub assets, Environment assets, Other Selfprint assets  
**Flow:** Purchase → Ownership → Entitlement → Use  
**Status:** ✅ Implemented

---

## GROWTH & MARKETING REQUIREMENTS

---

### GM-01 | GAMIFICATION

**Feature ID:** GM-01  
**Name:** Gamification as Growth Layer  
**Purpose:** Gamification เป็นระบบสนับสนุน Twin Development — ไม่ใช่เกม  
**What Gamification IS:**
- Visualizes Growth over time
- Represents Twin Evolution milestones
- Rewards consistent engagement
- Enables customization / expression
- Makes progress tangible

**What Gamification is NOT:**
- Core product (people use Selfprint for Intelligence, not badges)
- Required to understand Twin
- Required to use Selfprint
- Reason to have Selfprint account

**Components:** Growth, XP, Unlock, Activities, Outfits, Orbits, Nodes, Cosmetics  
**Status:** ✅ Implemented

---

### GM-02 | ORGANIC VIRAL LOOP

**Feature ID:** GM-02  
**Name:** Organic Viral Loop  
**Architecture:**
Twin
↓
Insight
↓
Share
↓
Public Insight (Public-safe transformation)
↓
Social
↓
Discovery
↓
New User
↓
Nova
↓
Twin

text
**Business Rules:** Referral เป็นตัวเสริม — ไม่ใช่หัวใจแทน product value  
**Status:** ✅ Implemented

---

### GM-03 | INSIGHT SHARING

**Feature ID:** GM-03  
**Name:** Insight as Shareable Social Object  
**Purpose:** Insight ต้องไม่จบใน Chat — สามารถกลายเป็น Shareable Social Object  
**Examples:** Insight Card, Quote, Twin Moment, Hub Moment, Story, Social image  
**Business Rules:** ต้องผ่าน Public-safe transformation — เกิดจาก user intent  
**Status:** ✅ Implemented

---

## SEO/GEO REQUIREMENTS

---

### SEO-01 | DISCOVERABILITY LAYER

**Feature ID:** SEO-01  
**Name:** SEO / GEO Discoverability Layer  
**Purpose:** Selfprint ต้องมี SEO/GEO Discoverability Layer  
**Components:**
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<h1>`, `<h2>`, `<p>`, `<footer>`)
- SSR / SSG / pre-render ตามความเหมาะสม
- Title, Description, Canonical, Robots
- Open Graph, Social metadata
- JSON-LD (FAQ Schema, HowTo Schema, Product Schema)
- Sitemap, Internal links
- Entity relationships, AI-readable content

**Business Rules:** ห้ามพึ่ง React client-side rendering เพียงอย่างเดียวสำหรับ public discovery content  
**Status:** ✅ Implemented

---

### SEO-02 | PUBLIC CONTENT

**Feature ID:** SEO-02  
**Name:** Public Content Architecture  
**Purpose:** สร้าง/ปรับ public content architecture สำหรับ:
- Selfprint
- Nova
- AI Twin
- 12 SICE
- 12 Hub Worlds
- Core Awakening
- Learning
- Growth
- FAQ
- Public Insights

**Status:** ✅ Implemented

---

### SEO-03 | FAQ

**Feature ID:** SEO-03  
**Name:** FAQ for SEO/GEO  
**Purpose:** FAQ ต้องตอบคำถามจริง
- Selfprint คืออะไร?
- Nova คืออะไร?
- AI Twin คืออะไร?
- Nova กับ Twin ต่างกันอย่างไร?
- 12 SICE คืออะไร?
- Fine-tuning คืออะไร?
- Core Awakening คืออะไร?
- Twin เรียนรู้อย่างไร?
- Hub World คืออะไร?
- Human Expert คืออะไร?

**Status:** ✅ Implemented

---

## PUBLIC/PRIVATE REQUIREMENTS

---

### PP-01 | PUBLIC/PRIVATE BOUNDARY

**Feature ID:** PP-01  
**Name:** Public / Private Boundary  
**Rule:** PRIVATE INTELLIGENCE ≠ PUBLIC SHARE  
**Public Share:** ต้องผ่าน Public-safe transformation — เกิดจาก user intent  
**Status:** ✅ Implemented

---

## APPENDIX: KEY RULES
§1 Nova ≠ Twin — Nova และ Twin เป็นคนละตัวกัน
§2 Twin เกิดจาก Core Awakening — ไม่ใช่ระหว่าง Onboarding
§3 Twin Initial Intelligence — Twin ฉลาดตั้งแต่เกิด
§4 12 SICE — แกน intelligence ของ Selfprint
§5 5 Navigation — วันนี้ / สำรวจ / TWIN / กิจกรรม / ฉัน
§6 Twin อยู่ตรงกลาง — Twin เป็น focal point
§7 Growth 5 Stages — Twin มี 5 Growth Stages
§8 Gamification — ระบบสนับสนุน Twin Development
§9 Digital Assets — Purchase → Ownership → Entitlement → Use
§10 Human Expert — Premium hourly — แยกจาก AI
§11 Trial — 7-14 days Full Capability Trial
§12 Viral Loop — Insight → Share → Organic Discovery
§13 SEO/GEO — Semantic HTML, SSR/SSG, JSON-LD, Sitemap
§14 Public/Private — PRIVATE INTELLIGENCE ≠ PUBLIC SHARE
§15 17 Phases — 17-Phase Master Development Roadmap
§16 User > AI — User Preference ชนะ AI Personalization
§17 Feedback Loop — ทุก Insight ต้องมีปุ่ม Feedback
§18 No Hardcode Color — ใช้ var(--exp-*) เท่านั้น
§19 Depth, not Identity — Basic Identity ฟรีตลอดไป

text

---

อัปเดตล่าสุด: 14 สิงหาคม 2569