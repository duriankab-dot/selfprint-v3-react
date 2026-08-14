# PROJECT SUMMARY — SELFPRINT

> อ่านจากโค้ดจริง `D:\selfprint-v3-react` | อัปเดตล่าสุด: 12 สิงหาคม 2569

---

## 🔴 แยก Nova และ AI Twin ให้ชัดเจน

| บุคลิก | บทบาท | รายละเอียด |
|--------|-------|-----------|
| **Nova** | AI Guide | ผู้แนะนำที่มีอยู่ในระบบตั้งแต่แรก — คอยช่วยเหลือ, นำทาง, สอนผู้ใช้ |
| **AI Twin** | AI ฝาแฝดส่วนตัว | ผู้ใช้สร้างขึ้นเองระหว่าง Onboarding, ตั้งชื่อเอง, เรียนรู้จากผู้ใช้โดยเฉพาะ |

**Nova ≠ AI Twin** — เป็นคนละตัวกัน!

---

## PRODUCT

### Selfprint คืออะไร

Selfprint คือ **Personal Intelligence Platform** ในรูปแบบ Progressive Web App (PWA) ที่ใช้ AI สร้าง "เวอร์ชันดิจิทัลของคุณ" หรือที่เรียกว่า **AI Twin** — ระบบที่เรียนรู้ความเป็นคุณจากการสนทนา การสะท้อนตัวเอง และรูปแบบพฤติกรรม แล้วนำข้อมูลเหล่านั้นมาวิเคราะห์ สังเคราะห์ และนำเสนอเป็น Insight ส่วนตัวที่ลึกและแม่นยำยิ่งขึ้นเรื่อยๆ ตามเวลา

**Tech Stack (จากโค้ดจริง):**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- State: Zustand + React Query (TanStack)
- Backend: Express.js (Node)
- Database: Supabase (PostgreSQL + Auth)
- AI: Anthropic Claude (via Claude API)
- Payments: Stripe
- Deploy: Vercel

---

### แก้ปัญหาอะไร

คนส่วนใหญ่ขาด "กระจกที่ซื่อสัตย์" — ไม่มีใครบอกตรงๆ ว่าตัวเองมีรูปแบบพฤติกรรมอะไร ตัดสินใจแบบไหนซ้ำๆ หรือกำลังเติบโตไปในทิศทางใด Selfprint แก้ปัญหา:

| ปัญหา | สิ่งที่ Selfprint แก้ |
|---|---|
| ไม่รู้ว่าตัวเองมี pattern อะไร | AI ตรวจจับรูปแบบพฤติกรรมจากการสนทนาจริง |
| ขาดคนที่เข้าใจบริบทชีวิตเต็มๆ | AI Twin เรียนรู้คุณสะสมตลอดเวลา |
| Therapy แพง / journal ไม่ได้ทำต่อ | สนทนากับ Twin ได้ทุกวัน ฟรีระดับพื้นฐาน |
| คำแนะนำทั่วไปไม่ตรงกับชีวิตจริง | ทุก Insight คำนวณจากข้อมูลของคุณเท่านั้น |
| ไม่เห็นพัฒนาการของตัวเองตามเวลา | Journey tracking + Growth signals + Milestones |

---

### Target User

**Primary:** คนไทยอายุ 22–40 ปี ที่ใช้โทรศัพท์เป็นหลัก สนใจการพัฒนาตัวเอง มีชีวิตที่ซับซ้อนพอสมควร (งาน ความสัมพันธ์ เป้าหมาย) และต้องการพื้นที่คิดที่ปลอดภัยและฉลาด

**Secondary:** นักธุรกิจ / ผู้ประกอบการ ที่ต้องการ Decision Intelligence และ Pattern Recognition ส่วนตัว

**Characteristics:**
- มือถือ-first
- ต้องการผลลัพธ์เร็ว แต่ยินดีลงทุนเวลาถ้าเห็นคุณค่า
- Privacy-conscious (PDPA aware)
- พร้อมจ่ายสำหรับ Premium ถ้า Value ชัดเจน

---

### Core Value Proposition

> **"Selfprint รู้จักคุณมากขึ้นทุกวัน และใช้ความรู้นั้นพัฒนาคุณ"**

- **สำหรับ Free:** สนทนากับ AI Twin ที่เข้าใจอารมณ์และบริบทชีวิต
- **สำหรับ Plus:** Twin จำคุณได้ ตรวจจับ Pattern และให้ Advanced Insights
- **สำหรับ Pro:** Future Self Projection, Journey Roadmap, Career & Relationship Intelligence
- **สำหรับ Lifetime:** เป็นเจ้าของ Twin ไม่จำกัด + Custom Training

---

### Differentiation

| มิติ | คู่แข่งทั่วไป | Selfprint |
|---|---|---|
| การเรียนรู้ | Static prompts | Twin เรียนรู้สะสมจากคุณจริงๆ |
| บุคลิก AI | หนึ่งบุคลิกตลอด | 1,296 combinations (18 Archetypes × 12 Worlds × 6 Moods) |
| Context | ต่อ conversation | ข้ามเซสชัน ข้ามเวลา |
| Output | ข้อความ | Insight, Pattern, Journey, Badge, Evolution |
| UX | Functional | Adaptive: ธีม เสียง แอนิเมชัน ปรับตามคุณแบบ real-time |
| Privacy | Cloud-first | PDPA compliant, user controls all data |

---

### Product Philosophy

**"Simple outside, Deep inside"**

- ผู้ใช้เห็นความเรียบง่าย — Twin พูดเป็นมิตร, UI สะอาด
- เบื้องหลังซับซ้อนมาก — PersonalContextBuilder, PatternDetector, InsightEngine, ExperienceEngine, EnvironmentEngine, AIFeedbackLoop, TwinStateEngine ทำงานร่วมกัน

**หลักการสำคัญ (จากโค้ด):**
- `§19 User Preference > AI Personalization` — AI ไม่เคย override ทางเลือกของผู้ใช้
- `§32 Monetize Depth, not Identity` — Basic Identity ฟรีเสมอ Premium = ความลึกกว่า ไม่ใช่ตัวตน
- `§15 Feedback Loop` — ผู้ใช้ feedback ได้ว่า Insight ตรงหรือไม่ → Personal Model ปรับ

---

## VISION

### Living Personal Intelligence Platform

Selfprint ไม่ใช่ chatbot — แต่เป็น **Living Platform** ที่:
- เรียนรู้จากคุณ (Learn from you)
- จำคุณได้ (Remember you)
- สะท้อนคุณกลับ (Reflect you)
- ตรวจจับรูปแบบ (Detect patterns)
- ปรับตัวตามคุณ (Adapt to you)
- แนะนำคุณ (Guide you)
- วิวัฒนาการตามเวลา (Evolve with you)

---

### North Star

**Understand → Remember → Reflect → Detect → Adapt → Guide → Evolve**

ทุก Feature ใน Selfprint ต้องตอบคำถามว่า: "สิ่งนี้ช่วยให้ AI เข้าใจ จำ สะท้อน ตรวจจับ ปรับ แนะนำ หรือวิวัฒนาการกับผู้ใช้ได้อย่างไร?"

---

## PRODUCT PILLARS

### 1. Personal Intelligence
**Engine:** PersonalContextBuilder + PatternDetector + InsightEngine + AIFeedbackLoop  
ระบบ AI หลักที่สังเคราะห์ข้อมูลทั้งหมดของผู้ใช้ (บริบทชีวิต รูปแบบพฤติกรรม ค่านิยม จุดแข็ง จุดตาบอด) ให้เป็นโมเดลส่วนตัวที่แม่นยำขึ้นเรื่อยๆ

### 2. Living AI Twin
**Engine:** nova-ai.ts + getNovaPrompt.ts + TwinContext + TwinStateEngine  
AI Twin ที่มีบุคลิกหลายมิติ: 18 Archetypes × 12 Worlds × 6 Moods = **1,296 personality combinations**  
Twin วิวัฒนาการได้ตาม maturityScore (0–100) และ reflection count

### 3. Personal Memory
**Engine:** MemoryManager  
ระบบบันทึกความทรงจำส่วนตัว 4 ประเภท: `small_win`, `important_moment`, `discovery`, `personal`  
Twin ใช้ memory เหล่านี้ในการตอบสนอง ทำให้ Twin "จำ" คุณได้ข้ามเวลา

### 4. Deep Analysis
**Engine:** ExecutiveSummary + AnalysisPage + PatternDetector + BehavioralForecastEngine + FutureSelfEngine  
Dashboard แสดง: Executive Summary, Full Analysis, Behavioral Patterns, Future Self Projection  
Pattern Detection: autonomy_trend, confidence_trend, mood_confidence, world_autonomy

### 5. Adaptive Experience
**Engine:** ExperienceEngine + EnvironmentEngine + ThemeContext + AudioContext  
ธีม, เสียง, แอนิเมชัน, สีสัน ปรับตาม World + Mood + เวลา + Device แบบ real-time  
ผ่าน CSS variables (--exp-*, --tod-*, --env-*, --lighting-*, --twin-*)

### 6. Personal Growth
**Engine:** BadgeEngine + EvolutionContext + DailyBriefEngine  
Badge 8 แบบ แต่ละแบบปลดล็อก Feature จริง (ไม่ใช่แค่ icon)  
Twin Evolution Scene ที่ 30 reflections, TwinAwakening, Pattern Visualization

### 7. Voice
**Components:** VoiceChat, VoiceInput, VoiceOutput, VoiceSettings, AudioManager  
คุยกับ Twin ด้วยเสียง, Twin ตอบด้วยเสียง, ปรับ TTS/STT settings ได้  
Audio ducking อัตโนมัติเมื่อ Twin พูด

### 8. PWA
**Config:** Vercel + Vite PWA  
ติดตั้งได้บนหน้าจอหลือมือถือ, ใช้งาน offline ได้บางส่วน, Cache aggressively

### 9. Privacy
**Page:** PrivacyCenter (/privacy)  
PDPA compliant, ผู้ใช้ควบคุม: AI Memory, Personal Model, Consent, Export Data, Delete Data, Reset Selfprint

### 10. Gamification
**Engines:** BadgeEngine + EvolutionContext  
8 Badges (first_reflection, pattern_finder, journey_explorer, self_mirror, deep_thinker, decision_maker, twin_awakening, selfprint_complete) แต่ละอันปลดล็อก Feature จริง  
Evolution milestones ที่ทำให้ Twin "เกิด" และ "เติบโต"

---

## 🧭 5-Tab Navigation

| ลำดับ | แท็บ | ใช้ทำอะไร |
|-------|------|----------|
| 1 | **วันนี้** | Dynamic Personal Home |
| 2 | **สำรวจ** | Discover yourself |
| 3 | **TWIN** | คุยกับ AI ฝาแฝดของคุณ (ศูนย์กลาง) |
| 4 | **กิจกรรม** | Do / Reflect / Practice |
| 5 | **ฉัน** | Personal control |

---

## 🌍 12 Worlds (เดิมคือ Hubs)

| World | ใช้ทำอะไร |
|-------|----------|
| Identity | ตัวตน |
| Decision | การตัดสินใจ |
| Relationship | ความสัมพันธ์ |
| Career | อาชีพ |
| Health | สุขภาพ |
| Money | เงินตรา |
| AI-Twin | AI ฝาแฝด |
| Learning | การเรียนรู้ |
| Creativity | ความสร้างสรรค์ |
| Spirituality | ความเป็นอยู่ |
| Impact | ผลกระทบ |
| Activities | กิจกรรม |

> แต่ละ World มี Environment, Lighting, Atmosphere, Sound, Visual Identity ของตัวเอง

---

## CURRENT STATE (จากโค้ดจริง วันที่ 12/08/2569)

### Implemented — 100% Complete

| หมวดหมู่ | รายการ | สถานะ |
|----------|--------|--------|
| **Core** | Landing Page (Emotion-first) | ✅ |
| **Core** | Onboarding 7 Steps | ✅ |
| **Core** | AI Twin (18 Archetypes × 12 Worlds × 6 Moods) | ✅ |
| **Core** | Dashboard (ExecutiveSummary, Analytics, Patterns) | ✅ |
| **Core** | TWIN Chat (แทน Chat) | ✅ |
| **Core** | Voice Chat | ✅ |
| **Core** | Analysis Page | ✅ |
| **Core** | Privacy Center (PDPA) | ✅ |
| **Core** | 5-Tab Navigation (Home/Explore/TWIN/Activities/Me) | ✅ |
| **Core** | 12 Worlds (ยกระดับจาก Hubs) | ✅ |
| **Growth** | Badge System (8 badges) | ✅ |
| **Growth** | Twin Evolution Scene | ✅ |
| **Growth** | Micro-Evolution (continuous progression) | ✅ |
| **Growth** | Daily Brief Page | ✅ |
| **Monetization** | Pricing Page (4 tiers) | ✅ |
| **Monetization** | Stripe Integration | ✅ |
| **Auth** | Passkey + OAuth + Magic Link | ✅ |
| **Auth** | WebAuthn Crypto Verification | ✅ |
| **AI** | Pattern Detection | ✅ |
| **AI** | Memory Manager | ✅ |
| **AI** | AI Feedback Loop | ✅ |
| **AI** | Decision Logger (API + UI) | ✅ |
| **Performance** | Code Splitting (React.lazy + Suspense) | ✅ |
| **PWA** | Service Worker + Offline Support | ✅ |
| **Docs** | All documentation updated | ✅ |

### P0 Cleanup — 100% Complete

| Task | สถานะ |
|------|--------|
| P0-1: Remove PHASE2_TEST_CONSOLE | ✅ |
| P0-2: Remove console.log (51 occurrences) | ✅ |
| P0-3: Decision APIs (CRUD) | ✅ |
| P0-4: WebAuthn Crypto Verification | ✅ |

---

### Routes ทั้งหมด

`/` `/onboarding` `/twin` `/dashboard` `/analysis` `/privacy` `/share/:code` `/brief` `/badges` `/pricing` `/pricing/success` `/login` `/settings/passkeys` `/explore` `/activities` `/me` `/voice` `/twin-profile` `/worlds` `/decisions` `/menu` `/components`

> `/chat` redirects to `/twin`

---

## SUBSCRIPTION MODEL

| Plan | ราคา | Tagline | Key Features |
|---|---|---|---|
| Free | ฿0 | Discover Yourself | Twin พื้นฐาน, World access, Archetype 1 แบบ, Badge, Evolution |
| Plus | ฿249/เดือน / ฿1,990/ปี | Know Yourself | Memory persistence, Pattern detection, Analytics, Archetypes 18 แบบ, Daily Brief เสียง |
| Pro | ฿589/เดือน / ฿4,990/ปี | Navigate Yourself | Future Self, Journey Roadmap, Relationship & Career Intelligence |
| Lifetime | ฿4,990 (ครั้งเดียว) | Own Your Twin | Pro ไม่จำกัด, Export data, Custom training, VIP community |

---

## 🎯 Quality Gates

| Metric | Status |
|--------|--------|
| TypeScript Build | ✅ PASS |
| Lint (oxlint) | ✅ 0 errors |
| PHASE2_TEST_CONSOLE Removed | ✅ PASS |
| console.log in Production | ✅ 0 results |
| Decision APIs | ✅ Implemented |
| WebAuthn Crypto | ✅ Implemented |
| Documentation | ✅ 100% Complete |

---

*Selfprint PROJECT SUMMARY | อัปเดตล่าสุด: 12 สิงหาคม 2569*