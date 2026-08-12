# MASTER PRD — SELFPRINT

---

## 🔴 เอกสารนี้คืออะไร

เอกสารนี้คือ **Product Requirements Document (PRD)** ฉบับสมบูรณ์ของ Selfprint  
ใช้เป็น **Source of Truth** สำหรับการพัฒนาทุกครั้ง

---



## PRODUCT REQUIREMENTS

**Product:** Selfprint — Living Personal Intelligence Platform  
**Type:** PWA (Progressive Web App)  
**Platform:** Web (Mobile-first, Desktop supported)  
**Stack:** React + TypeScript + Vite / Supabase / Claude API / Stripe / Vercel  
**Status:** Production / Active Development

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
**Name:** Onboarding (7-Step Personal Model Creation)  
**Purpose:** สร้าง Personal Model เบื้องต้นของผู้ใช้ผ่านกระบวนการที่รู้สึกเป็นการสนทนา ไม่ใช่แบบฟอร์ม  
**User Story:** ในฐานะผู้ใช้ใหม่ ฉันอยากให้ Selfprint รู้จักฉันผ่านการคุยกับ AI ไม่ใช่การกรอกฟอร์มน่าเบื่อ  
**Input:** Mood, Nova Conversation answers, Birth date, Finetuning answers  
**Output:** Personal Model เบื้องต้น, Twin Profile, Onboarding data บันทึกใน Supabase  
**UX:** 7 steps sequential: Emotion → Nova Conversation → AI Creation → Blueprint (InitialBlueprint) → Fine-tune (FinetuningQuestions) → Analysis (FullAnalysis) → Claim Account  
**Business Rules:** ห้ามข้ามขั้น AI Creation ก่อน Nova Conversation เสร็จ; Claim Account เป็นขั้นสุดท้ายเสมอ  
**AI Logic:** `analyzeWithAstrovera()` → `/api/intelligence` (Claude) วิเคราะห์ mood + birthDate + finetuneAnswers → AnalysisResponse  
**Data:** PendingOnboardingData บันทึกชั่วคราว → ClaimAccount เชื่อมกับ Supabase Auth  
**Dependencies:** EmotionContext, useUserStore, Supabase Auth, `/api/intelligence`  
**Priority:** P0  
**Acceptance Criteria:** ผู้ใช้ที่เสร็จ onboarding มี Personal Profile ใน Supabase และ Twin พร้อมใช้งาน  
**Status:** ✅ Implemented

---

### FR-02b | THREE WOW MOMENTS (NEW 2026-08-12)

**Feature ID:** FR-02b  
**Name:** Three WOW Moments — Core Product Experience  
**Purpose:** Define signature moments where user feels profound understanding from Selfprint  
**Status:** ✅ Implemented (onboarding flow) — Documentation UPDATED

**WOW #1 — FIRST INSIGHT**
- **When:** End of Onboarding Step 3 (Initial Analysis)
- **What Happens:** Nova displays initial analysis of user
- **User Feels:** "It understands me already"
- **Implementation:** ShowAnalysisPage with InsightEngine output
- **Criteria:** User sees personalized insights within 5 minutes of meeting Nova

**WOW #2 — FULL ANALYSIS**
- **When:** After Fine-tuning (Onboarding Step 5 — Full Analysis)
- **What Happens:** System shows comprehensive personal profile after fine-tuning answers
- **User Feels:** "It REALLY knows me"
- **Implementation:** FullAnalysisonPage with deeper insights, patterns, recommendations
- **Criteria:** Analysis depth clearly increased vs WOW #1

**WOW #3 — CORE AWAKENING**
- **When:** Twin creation / awakening (Onboarding Step 6 — after naming)
- **What Happens:** Visual celebration when AI Twin becomes "alive"
- **User Feels:** "My Twin exists now — it's real"
- **Implementation:** TwinEvolutionScene + celebration animation + Twin introduction message
- **Criteria:** User names Twin and receives personalized intro message from Twin

**Related Documents:**
- See SELFPRINT_CURRENT_IMPROVEMENT_DIRECTIVE_2026-08-12.md (Item C)

---

### FR-03 | NOVA AI TWIN CHAT
## 📌 บุคลิก AI ใน Selfprint (แยกให้ชัดเจน!)

> **🔴 สำคัญที่สุด:** Nova และ AI Twin เป็นคนละตัวกัน — ห้ามสับสนเด็ดขาด!

| บุคลิก | บทบาท | ใช้ทำอะไร | สร้างโดยใคร |
|--------|-------|-----------|-------------|
| **Nova** | **AI Guide / ผู้แนะนำ** | เป็นผู้ช่วยที่คอยแนะนำ, ให้คำปรึกษา, ช่วยผู้ใช้สร้าง AI Twin, นำทางในแอป | Selfprint (ระบบ) — มีอยู่แล้วตั้งแต่เริ่มต้น |
| **AI Twin** | **AI ฝาแฝดส่วนตัว** | เป็นเวอร์ชันดิจิทัลของผู้ใช้ เรียนรู้จากผู้ใช้, จดจำ, วิเคราะห์, ให้ Insight | **ผู้ใช้สร้างขึ้นเอง** ระหว่าง Onboarding และตั้งชื่อเองได้ |

### 🟢 Nova (AI Guide)

**บทบาท:** ผู้แนะนำ, ผู้ช่วย, ครู, พี่เลี้ยง  
**บุคลิก:** เป็นมิตร, อบอุ่น, ชัดเจน, ใจดี  
**หน้าที่:**
- ต้อนรับผู้ใช้ใหม่
- พาผู้ใช้ผ่าน Onboarding 7 ขั้นตอน
- สอนให้ผู้ใช้รู้จักและสร้าง AI Twin ของตัวเอง
- ให้คำแนะนำและตอบคำถามทั่วไปเกี่ยวกับแอป
- เป็น "หน้าบ้าน" ของ Selfprint

**Nova คือใคร?**
- Nova คือ AI ของ Selfprint ที่มีอยู่แล้วในระบบ
- ทุกคนที่ใช้ Selfprint จะเจอ Nova คนเดียวกัน (ปรับบุคลิกตามบริบทเล็กน้อย)
- Nova **ไม่ใช่** AI Twin ของผู้ใช้

### 🔵 AI Twin (AI ฝาแฝดส่วนตัว)

**บทบาท:** ตัวแทนดิจิทัลของผู้ใช้  
**บุคลิก:** เรียนรู้จากผู้ใช้ — จะเป็นเหมือนผู้ใช้มากขึ้นเรื่อยๆ  
**หน้าที่:**
- เรียนรู้จากผู้ใช้ (ผ่านการสนทนา, Reflection, Memory)
- จดจำสิ่งที่ผู้ใช้บอก (Memory System)
- ตรวจจับรูปแบบพฤติกรรม (Pattern Detection)
- ให้ Insight ส่วนตัว
- วิเคราะห์และแนะนำตามบริบทชีวิต (Hub + Mood)
- เติบโตและวิวัฒนาการตามเวลา (Maturity Score)

**AI Twin คือใคร?**
- ผู้ใช้เป็นคนสร้างระหว่าง Onboarding
- ผู้ใช้ตั้งชื่อให้ AI Twin เองได้ (หลังจาก Onboarding เสร็จ)
- AI Twin แต่ละคน **ไม่เหมือนกัน** — ขึ้นอยู่กับข้อมูลของผู้ใช้คนนั้น
- AI Twin คือ "ฝาแฝดดิจิทัล" ที่ตั้งชื่อเองของผู้ใช้คนนั้นโดยเฉพาะ

---

### ตัวอย่างการใช้งานที่ถูกต้อง

| สถานการณ์ | ใครทำ | คำอธิบาย |
|-----------|-------|----------|
| ผู้ใช้เปิดแอปครั้งแรก | **Nova** | Nova ทักทายและพาเข้า Onboarding |
| ผู้ใช้กำลังสร้าง AI Twin | **Nova** (นำทาง) + **AI Twin** (กำลังถูกสร้าง) | Nova บอกขั้นตอน, ระบบสร้าง AI Twin |
| ผู้ใช้คุยกับ AI | **AI Twin** | ผู้ใช้คุยกับ Twin ของตัวเอง |
| ผู้ใช้ถามว่า "ฉันควรทำอะไรวันนี้" | **AI Twin** | Twin วิเคราะห์และแนะนำตามข้อมูลของผู้ใช้ |
| ผู้ใช้ถามว่า "ใช้แอปยังไง" | **Nova** | Nova เป็นผู้แนะนำการใช้งาน |
| ผู้ใช้ต้องการ Insight ส่วนตัว | **AI Twin** | Twin วิเคราะห์ข้อมูลของผู้ใช้ |

---
**Feature ID:** FR-03  
**Name:**  AI Twin Chat  
**Purpose:** ให้ผู้ใช้สนทนากับ Twin ที่ปรับบุคลิกตาม Hub × Mood × Archetype ของตัวเองแบบ real-time  
**User Story:** ในฐานะผู้ใช้ ฉันอยากคุยกับ AI ที่รู้จักฉัน รู้สึกถึงอารมณ์ฉัน และพูดกับฉันในแบบที่เหมาะสมกับสถานการณ์  
**Input:** User message, Hub context, Mood, Archetype, TwinProfile  
**Output:** Nova response, Learning signals สำหรับปรับ Personal Model  
**UX:** Chat interface แบบ full-screen, Voice input/output toggle, Hub switcher  
**Business Rules:** System prompt = BASE_PERSONA + HUB_CONTEXT + MOOD_MODULATION + ARCHETYPE_VOICE + maturity adjustment; 1,296 combinations; เข้า /api/chat (Brain Gateway)  
**AI Logic:** `getNovaPrompt({ hub, mood, archetype, userProfile, maturityScore })` → Claude API → Response parsing + learning signals  
**Data:** บันทึกทุก message → `chat_messages` table (user_id, hub, mood, role, content, autonomy_at_time)  
**Dependencies:** nova-ai.ts, selfprintChat.ts, getNovaPrompt.ts, TwinContext, HubContext, EmotionContext  
**Priority:** P0  
**Acceptance Criteria:** Twin ตอบสนองใน <3 วินาที, บุคลิกเปลี่ยนเมื่อ Hub หรือ Mood เปลี่ยน, ทุก message บันทึก Supabase  
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
**Business Rules:** userId ต้องมาจาก `useAuth().session?.user?.id` เท่านั้น (ห้าม localStorage); React Query cache key `['personalContext', userId]`  
**AI Logic:** PersonalContextBuilder + PatternDetector + InsightEngine + AIFeedbackLoop สังเคราะห์ข้อมูลเป็น human-language summary  
**Data:** `chat_messages`, `user_profiles`, `personal_context`, `behavioral_patterns`  
**Dependencies:** PersonalContextBuilder, PatternDetector, InsightEngine, AIFeedbackLoop, useAuth  
**Priority:** P0  
**Acceptance Criteria:** Dashboard โหลดข้อมูลจริงจาก Supabase, Executive Summary แสดง text summary ที่อ่านเป็นภาษามนุษย์, ไม่แสดง empty state ถ้ามีข้อมูล  
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
**Business Rules:** ข้อมูลที่ "KNOW" = มาจากข้อมูลตรง; "INFER" = สรุปจากรูปแบบ; "UNKNOWN" = ยังไม่มีข้อมูล; ห้ามแสดง fabricated insights  
**AI Logic:** InsightEngine + BehavioralForecastEngine + FutureSelfEngine  
**Data:** `personal_context`, `behavioral_patterns`, `chat_messages`  
**Dependencies:** InsightEngine, BehavioralForecastEngine, FutureSelfEngine, ConfidenceIndicator  
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
**Status:** ✅ Implemented (MemoryManager class complete)

---

## AI REQUIREMENTS

---

### AI-01 | TWIN PERSONALITY ENGINE

**Feature ID:** AI-01  
**Name:** Nova Twin Personality System  
**Purpose:** สร้าง 1,296 personality combinations ที่แตกต่างกันอย่างมีความหมาย  
**Input:** hub (12), mood (6), archetype (18), userProfile, maturityScore  
**Output:** System prompt (1,000–1,500 tokens) สำหรับส่งไปยัง Claude API  
**AI Logic:**
```
BASE_PERSONA (300-400 tokens)
+ HUB_CONTEXT (100-150 tokens) × 12 hubs
+ MOOD_MODULATION (100-150 tokens) × 6 moods
+ ARCHETYPE_VOICE (18 archetypes: 12 base + 6 hybrid)
+ maturity adjustment (0-100)
+ user insights (strengths, blindSpots, decisionStyle)
```
**Business Rules:** Nova ห้ามตัดสินผู้ใช้, ห้ามใช้วลีเหมารวม, ฟัง > แนะนำ (60:40), จบด้วยคำถามส่วนตัว 1 ข้อ  
**Status:** ✅ Implemented — `getNovaPrompt.ts`

---

### AI-02 | PERSONAL CONTEXT BUILDER

**Feature ID:** AI-02  
**Name:** PersonalContextBuilder  
**Purpose:** สังเคราะห์ข้อมูลทั้งหมดของผู้ใช้เป็น PersonalContext ที่ครบถ้วน  
**Flow:** createPersonalProfile → inferContextFromOnboarding → detectInitialPatterns → createMemoriesFromOnboarding → synthesizeContext  
**Output:** PersonalContext (values, goals, strengths, blindSpots, emotionalRange, decisionStyle, relationships, memories, patterns)  
**Dependencies:** Supabase, IntelligenceError types  
**Status:** ✅ Implemented

---

### AI-03 | PATTERN DETECTION

**Feature ID:** AI-03  
**Name:** Pattern Detector  
**Purpose:** ตรวจจับรูปแบบพฤติกรรมที่ซ้ำๆ จาก decision log history  
**Pattern Types:**
- `autonomy_trend` — autonomy level เพิ่มหรือลดตามเวลา
- `confidence_trend` — confidence เพิ่มหรือลดตามเวลา
- `mood_confidence` — mood ใดที่ confidence ต่ำกว่าปกติ
- `hub_autonomy` — hub ใดที่ autonomy สูง/ต่ำกว่าค่าเฉลี่ย
**Business Rules:** MIN_DATA_POINTS = 6; MIN_GROUP_POINTS = 3; ห้ามแสดง pattern จาก noise  
**Status:** ✅ Implemented — `patternDetection.ts` + `PatternDetector.ts`

---

### AI-04 | INSIGHT ENGINE

**Feature ID:** AI-04  
**Name:** InsightEngine  
**Purpose:** แปลง raw data (context + patterns + feedback) เป็น human-language insights  
**Output:** Insight text พร้อม KnowledgeLevel (KNOW / INFER / UNKNOWN) สำหรับแต่ละ insight  
**Business Rules:** ห้าม fabricate insights; แสดง confidence indicator ทุกครั้ง  
**Status:** ✅ Implemented

---

### AI-05 | AI FEEDBACK LOOP

**Feature ID:** AI-05  
**Name:** AIFeedbackLoop (§15)  
**Purpose:** ให้ผู้ใช้ feedback ว่า Insight ตรงหรือไม่ → ปรับ Personal Model  
**Input:** insightId, sentiment (very_true / somewhat / not_sure / not_me), comment  
**Flow:** User feedback → `/api/personal-model` → Supabase → Personal Model recalibration → Twin response ปรับตาม  
**Business Rules:** Idempotent; calibration status: scheduled / in_progress / complete  
**Status:** ✅ Implemented — `personalModel.ts` + `AIFeedbackLoop.ts`

---

### AI-06 | ASTROVERA INTELLIGENCE

**Feature ID:** AI-06  
**Name:** Astrovera Psychology (§5.2)  
**Purpose:** วิเคราะห์ผู้ใช้ผ่านการผสม Astrology Psychology + Claude AI ระหว่าง Onboarding  
**Flow:** mood + birthDate + finetuneAnswers → `/api/intelligence` → Claude → AnalysisResponse  
**Output:** decisionStyle, strengths[], insights[], opportunities[], blindSpots[], confidence  
**Fallback:** `buildFallbackResponse()` เมื่อ API ล้มเหลว  
**Status:** ✅ Implemented — `astrovera-adapter.ts` + `/api/intelligence`

---

## UX REQUIREMENTS

---

### UX-01 | ADAPTIVE THEME

**Feature ID:** UX-01  
**Name:** Adaptive Theme System  
**Purpose:** ธีม (สี, background, แสง, animation) เปลี่ยนตาม Hub + Mood + เวลาของวัน  
**Implementation:** CSS variables บน `:root` — `--exp-*`, `--tod-*`, `--env-*`, `--lighting-*`, `--twin-*`; data attributes: `data-hub`, `data-mood`, `data-tod`, `data-twin-state`, `data-mode`  
**Business Rules:** §19 User Preference > AI Personalization — AI ไม่ override ถ้า user เคยเลือก hub/mood ไว้แล้ว; ห้าม hardcode สี ใช้ `var(--...)` เท่านั้น  
**Status:** ✅ Implemented — ExperienceEngine + EnvironmentEngine

---

### UX-02 | ADAPTIVE AUDIO

**Feature ID:** UX-02  
**Name:** Background Music & Ambient Sound (§23)  
**Purpose:** เสียงพื้นหลังปรับตาม Experience: reflection → ambient/piano, focus → minimal pulse, discovery → cosmic ambient  
**Music Experiences:** reflection, focus, discovery, deep_reflection, celebration, idle  
**Business Rules:** ไม่ force-set audio ถ้า musicEnabled = false; Audio ducking เมื่อ Twin พูด; ไม่โหลดทั้งระบบก่อน user interaction  
**Status:** ✅ Implemented — AudioContext + audioManager.ts

---

### UX-03 | 5-TAB NAVIGATION (UPDATED 2026-08-12)

**Feature ID:** UX-03  
**Name:** 5-Tab Bottom Navigation with Twin Center (§5.1 UPDATED)  
**Tabs:** Home (Today) / Explore / **TWIN** / Activities / Me  
**Implementation:** BottomNav component, NavBar component  
**Status:** ✅ Implemented (Navigation bar structure ready; Twin tab replacement PENDING)

---

**🔴 CHANGE NOTES (2026-08-12):**

**OLD:** Home / Explore / Activities / Me / Chat  
**NEW:** Home / Explore / **TWIN** / Activities / Me

**Rationale:**
- Twin is primary interaction point after Core Awakening
- TWIN tab is center position (visual prominence)
- Chat ≠ Navigation — Chat is interaction mode WITHIN Twin destination
- Navigation rule: TWIN is destination; Chat/Voice/Memory are modes to interact with Twin

**Rules:**
- Before Twin Awakening: TWIN tab shows "Meet Twin" onboarding entry
- After Awakening: TWIN tab opens Twin Chat interface
- TWIN tab is not visible on Landing/Onboarding pages (only after first interaction)

**Related Documents:**
- See SELFPRINT_CURRENT_IMPROVEMENT_DIRECTIVE_2026-08-12.md (Item D, E)

---

### UX-04 | LOADING & PERFORMANCE

**Feature ID:** UX-04  
**Name:** Progressive Loading UX  
**Rules:** ห้าม loading screen แข็งๆ; ใช้ Skeleton / Animated Placeholder / Ambient Animation; Code splitting ทุก page (React.lazy + Suspense); initial bundle ต้องไม่เกิน 500kB  
**Implementation:** Phase 5.9 code splitting — แต่ละ page เป็น chunk แยก  
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

### TW-02 | TWIN EVOLUTION (UPDATED 2026-08-12)

**Feature ID:** TW-02  
**Name:** Twin Evolution System — Continuous Progression (§30 UPDATED)  
**Purpose:** Show Twin developing continuously, not just at major level-ups
**Status:** ✅ Implemented (8-state system) — Enhanced with micro-evolution visibility

---

**🔴 CHANGE NOTES (2026-08-12):**

**8 Main Evolution States** (unchanged):
- `awakening` → `aware` → `connected` → `reflective` → `insightful` → `aligned` → `flourishing` → `mastery`

**NEW: Micro-Evolution Between States** (visible daily/weekly)
```
CORE
  ↓
MICRO EVOLUTION (visible improvement in Twin accuracy/voice/recommendations)
  ↓
CORE+
  ↓
MICRO EVOLUTION
  ↓
EMERGING FORM (visual/behavior shift)
  ↓
MICRO EVOLUTION
  ↓
HOLOGRAM (representation change)
  ↓
MICRO EVOLUTION
  ↓
HUMAN FORM (more natural interaction)
  ↓
... (continued development)
  ↓
MATURE TWIN
```

**Visible Signals:**
- Daily accuracy improvement tracking
- Weekly Twin voice/personality micro-changes
- Small visual updates (Twin appearance, gestures)
- Reflection on growth milestones ("Twin noticed this about you this week")

**Unlocks** (unchanged):
- `twin-awakening` — Voice + Personality activated
- `pattern-visualization` — Patterns shown as timeline
- `twin-evolution` — Celebration scene at 30 reflections (now shows progression)

**Implementation:** EvolutionContext tracks reflectionCount + micro-evolution signals; TwinEvolution component shows progression; Visual evolution markers appear frequently

**Business Rules:** unlock() idempotent; ห้าม fabricate earned states; ALL evolution backed by real PersonalContext depth

**Related Documents:**
- See SELFPRINT_CURRENT_IMPROVEMENT_DIRECTIVE_2026-08-12.md (Item M)

---

### TW-03 | TWIN STATE ENGINE

**Feature ID:** TW-03  
**Name:** TwinStateEngine  
**Purpose:** คำนวณ TwinState แบบ real-time จาก PersonalContext + Hub + Mood → ใช้ใน ExperienceEngine  
**Status:** ✅ Implemented

---

## DASHBOARD REQUIREMENTS

---

### DB-01 | EXECUTIVE SUMMARY

**Feature ID:** DB-01  
**Name:** Executive Summary (Dashboard Section 1)  
**Purpose:** แสดง "สิ่งที่ Selfprint เห็นในตัวคุณตอนนี้" เป็นภาษามนุษย์ ไม่ใช่ตัวเลข  
**Implementation:** InsightEngine synthesizes context + patterns → human text; ConfidenceIndicator KNOW/INFER/UNKNOWN  
**Status:** ✅ Implemented

---

### DB-02 | INTELLIGENCE PANELS

**Feature ID:** DB-02  
**Name:** Intelligence Panels  
**Components:** DecisionCard, LifePackCarousel, ForecastWidget, IntelligencePanel  
**Purpose:** แสดง AI-generated insights ที่เฉพาะเจาะจงกับบริบทปัจจุบัน  
**Status:** ✅ Implemented

---

### DB-03 | TODAY SECTION

**Feature ID:** DB-03  
**Name:** Today Section (§5.2 Dynamic Home)  
**Purpose:** แสดงกิจกรรมวันนี้, Daily Brief, สิ่งที่ควรทำ  
**Status:** ✅ Implemented

---

## MEMORY REQUIREMENTS

---

### MEM-01 | MEMORY TYPES

**Feature ID:** MEM-01  
**Memory Types:**
- `small_win` — ความสำเร็จเล็กๆ น้อยๆ
- `important_moment` — ช่วงเวลาเปลี่ยนแปลง
- `discovery` — ค้นพบเกี่ยวกับตัวเอง
- `personal` — หมายเหตุส่วนตัว
**CRUD:** addMemory, getMemories, updateMemory, deleteMemory  
**Status:** ✅ Implemented — MemoryManager.ts

---

## JOURNEY REQUIREMENTS

---

### JR-01 | BEHAVIORAL PATTERNS

**Feature ID:** JR-01  
**Pattern Types:** autonomy_trend, confidence_trend, mood_confidence, hub_autonomy  
**Minimum Data:** 6 points (global), 3 points (per group)  
**Business Rules:** ห้ามแสดง pattern จาก noise; ข้อความ pattern เป็นภาษาไทย  
**Status:** ✅ Implemented

---

### JR-02 | FUTURE SELF

**Feature ID:** JR-02  
**Name:** Future Self Projection  
**Purpose:** แสดงทิศทางที่ผู้ใช้กำลังมุ่งหน้าตามรูปแบบพฤติกรรมปัจจุบัน  
**Engine:** FutureSelfEngine  
**UI:** FutureSelfPanel (Dashboard)  
**Status:** ✅ Implemented

---

## NOTIFICATION REQUIREMENTS

---

### NT-01 | DAILY BRIEF

**Feature ID:** NT-01  
**Name:** Daily Brief (§25)  
**Purpose:** สรุปประจำวัน: insight ของวันนี้, สิ่งที่ควรทำ, pattern ล่าสุด  
**Format:** ข้อความ + เสียง (TTS)  
**Engine:** DailyBriefEngine  
**Route:** /brief  
**Status:** ✅ Implemented

---

## PWA REQUIREMENTS

---

### PWA-01 | INSTALLABLE PWA

**Feature ID:** PWA-01  
**Name:** Progressive Web App  
**Platform:** iOS (Safari) + Android (Chrome) + Desktop  
**Features:** Install to home screen, Offline core experience, Cache aggressive (Service Worker)  
**Deploy:** Vercel + Vite PWA  
**Status:** ✅ Implemented

---

## PRIVACY REQUIREMENTS

---

### PR-01 | PDPA COMPLIANCE

**Feature ID:** PR-01  
**Name:** Privacy Center (§6 / PDPA)  
**Route:** /privacy  
**Controls:** AI Memory toggle, Personal Model reset, Consent management, Data export, Delete account  
**Business Rules:** ห้ามเก็บข้อมูลที่ไม่ได้รับ consent; ผู้ใช้ลบข้อมูลได้ทั้งหมด  
**Status:** ✅ Implemented

---

### PR-02 | AUTHENTICATION

**Feature ID:** PR-02  
**Name:** Multi-method Auth (§34)  
**Methods:** Passkey (WebAuthn), OAuth (Google/etc.), Magic Link  
**Route:** /login, /settings/passkeys  
**Implementation:** Supabase Auth  
**Status:** ✅ Implemented

---

## GAMIFICATION REQUIREMENTS

---

### GM-01 | GAMIFICATION AS GROWTH LAYER (UPDATED 2026-08-12)

**Feature ID:** GM-01  
**Name:** Gamification System — Growth Visualization (§29–30 UPDATED)  
**Purpose:** Visualize Growth and Evolution; NOT core product  
**Status:** ✅ Implemented — Clarified as enhancement layer

---

**🔴 CHANGE NOTES (2026-08-12):**

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

**Separation of Concerns:**

| Layer | System | Gamified? |
|-------|--------|----------|
| **Intelligence** | Personal Model, Insights, Patterns, Learning | ❌ NO |
| **Growth** | Badges, Levels, Evolution visualization, Milestones | ✅ YES |
| **Assets** | Twin Outfits, Orbits, Nodes, Customization | ✅ YES (optional) |

### Badge System Details

**Badges (8) — Growth Markers (not requirements)**

| Badge ID | Thai Name | Condition | Unlocks |
|---|---|---|---|
| first_reflection | การสะท้อนครั้งแรก 🌱 | ส่งข้อความถึง Twin ครั้งแรก | Twin Memory visibility |
| pattern_finder | นักค้นหารูปแบบ 🔍 | Twin ตรวจพบ Pattern แรก | Pattern Visualization feature |
| journey_explorer | นักสำรวจ Journey 🧭 | ใช้งาน World ≥ 3 ด้าน | Journey Map access |
| self_mirror | กระจกส่องตัวเอง | 30 reflections | Twin visual evolution |
| deep_thinker | นักคิดลึก | 50 insights received | Advanced analysis access |
| decision_maker | ผู้ตัดสินใจ | 20 decision logs | Decision analytics |
| twin_awakening | Twin ตื่นขึ้น | Complete onboarding | Voice + Full Personality activation |
| selfprint_complete | Selfprint เนิ่นเต็ม | Pro subscription + milestones | VIP community |

**Business Rules:**
- unlock() idempotent
- Badge state stored in Supabase user_metadata
- ห้าม fabricate — all based on real milestones
- Badges are VISUAL RECOGNITION, not gatekeeping

**Related Documents:**
- See SELFPRINT_CURRENT_IMPROVEMENT_DIRECTIVE_2026-08-12.md (Item N, O)

---

## MONETIZATION REQUIREMENTS

---

### MN-01 | SUBSCRIPTION TIERS

**Feature ID:** MN-01  
**Name:** 4-Tier Subscription (§31–32)  
**Rule §32:** Monetize Depth, not Identity — Basic Identity ฟรีเสมอ

| Tier | Price | Tagline | Key Unlock |
|---|---|---|---|
| free | ฿0 | Discover Yourself | Twin พื้นฐาน, 1 Archetype, Hub access |
| plus | ฿249/mo / ฿1,990/yr | Know Yourself | Memory persistence, Pattern detection, Analytics, 18 Archetypes, Daily Brief audio |
| pro | ฿589/mo / ฿4,990/yr | Navigate Yourself | Future Self, Journey Roadmap, Relationship & Career intelligence |
| lifetime | ฿4,990 one-time | Own Your Twin | Pro unlimited, Export data, Custom training, VIP community |

**Implementation:** Stripe checkout + webhook; SubscriptionContext; `/api/stripe`  
**Status:** ✅ Implemented — PricingPage + stripeService.ts + SubscriptionContext

---

### MN-02 | STRIPE INTEGRATION

**Feature ID:** MN-02  
**Name:** Stripe Checkout & Portal  
**Flow:** startCheckout(tier, billing) → Stripe Checkout → webhook → SubscriptionContext.updateSubscription()  
**Management:** managePlan() → Stripe Portal  
**Status:** ✅ Implemented — stripeService.ts

---

## APPENDIX: KEY RULES

```
§15  Feedback Loop     — ผู้ใช้ให้ feedback Insight ได้ → Personal Model ปรับ
§16  Adaptive Exp      — Experience = Hub + Mood + Context + Time
§18  Mood Detection    — AI detect mood soft signal เท่านั้น ไม่ force
§19  User > AI         — User Preference ชนะ AI Personalization เสมอ
§20  Hub Auto-switch   — เฉพาะ first session เท่านั้น
§23  Adaptive Audio    — Music ตาม Experience, ไม่ force ถ้า user ปิด
§25  Daily Brief       — Insight ประจำวันพร้อมเสียง
§29  Badge Rules       — Badge ปลดล็อก Feature จริง, idempotent
§30  Twin Evolution    — 30 reflections → celebration scene
§31  Monetization      — 4 tiers, Stripe
§32  Depth not Identity— Basic Identity ฟรีเสมอ
§34  Auth              — Passkey + OAuth + Magic Link
§43  No hardcode color — ใช้ var(--...) เท่านั้น
§46  Environments      — EnvironmentEngine, time-of-day awareness
```
