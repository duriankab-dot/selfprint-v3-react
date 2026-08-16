# PROJECT SUMMARY — SELFPRINT

> อ่านจากโค้ดจริง `D:\selfprint-v3-react` | อัปเดตล่าสุด: 14 สิงหาคม 2569

---

## 🔴 แยก Nova และ AI Twin ให้ชัดเจน

| บุคลิก | บทบาท | รายละเอียด | เกิดเมื่อ |
|--------|-------|-----------|---------|
| **Nova** | AI Guide | ผู้แนะนำที่มีอยู่ในระบบตั้งแต่แรก — คอยช่วยเหลือ, นำทาง, สอนผู้ใช้ | มีอยู่แล้วในระบบ |
| **AI Twin** | AI ฝาแฝดส่วนตัว | ฝาแฝดดิจิทัลของผู้ใช้ — เรียนรู้จากผู้ใช้โดยเฉพาะ | **หลัง Core Awakening (WOW 3)** |

**Nova ≠ AI Twin** — เป็นคนละตัวกัน!
**Twin เกิดจาก Core Awakening (WOW 3)** — ไม่ใช่ระหว่าง Onboarding!

---

## 🧠 12 SICE — Core Intelligence

**12 SICE** เป็นแกน proprietary intelligence ของ Selfprint

| # | Engine | หน้าที่ |
|---|--------|--------|
| 1 | PersonalContextBuilder | สังเคราะห์ข้อมูลผู้ใช้ทั้งหมด |
| 2 | PatternDetector | ตรวจจับรูปแบบพฤติกรรม |
| 3 | InsightEngine | แปลง Pattern เป็นภาษามนุษย์ |
| 4 | AIFeedbackLoop | ปรับ Personal Model จาก Feedback |
| 5 | TwinStateEngine | คำนวณสถานะ Twin แบบ Real-time |
| 6 | ExperienceEngine | เลือกประสบการณ์ (Hub+Mood+Time) |
| 7 | EnvironmentEngine | ปรับ Environment (Theme+Audio) |
| 8 | BadgeEngine | ติดตาม Achievement |
| 9 | BehavioralForecastEngine | ทำนายทิศทางพฤติกรรม |
| 10 | FutureSelfEngine | สร้าง Future Self Projection |
| 11 | MemoryManager | จัดการความจำ |
| 12 | DecisionIntelligenceEngine | วิเคราะห์การตัดสินใจ |

---

## PRODUCT

### Selfprint คืออะไร

Selfprint คือ **Living Personal Intelligence Platform** ในรูปแบบ Progressive Web App (PWA) ที่ใช้ **Nova (AI Guide)** นำทางผู้ใช้ผ่านกระบวนการสร้าง **AI Twin** ที่เกิดจาก **Core Awakening (WOW 3)**

**Tech Stack (จากโค้ดจริง):**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- State: Zustand + React Query (TanStack)
- Backend: Express.js (Node)
- Database: Supabase (PostgreSQL + Auth)
- AI: 12 SICE + Claude API
- Payments: Stripe
- Deploy: Vercel

---

### Twin Initial Intelligence Seed

**Twin ห้ามเริ่มจากศูนย์!**
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

---

### แก้ปัญหาอะไร

| ปัญหา | สิ่งที่ Selfprint แก้ |
|---|---|
| ไม่รู้ว่าตัวเองมี pattern อะไร | 12 SICE ตรวจจับรูปแบบพฤติกรรมจากการสนทนาจริง |
| ขาดคนที่เข้าใจบริบทชีวิตเต็มๆ | AI Twin เรียนรู้คุณสะสมตลอดเวลา — ฉลาดตั้งแต่เกิด |
| Therapy แพง / journal ไม่ได้ทำต่อ | สนทนากับ Twin ได้ทุกวัน ฟรีระดับพื้นฐาน |
| คำแนะนำทั่วไปไม่ตรงกับชีวิตจริง | ทุก Insight คำนวณจาก Personal Intelligence Seed ของคุณ |
| ไม่เห็นพัฒนาการของตัวเองตามเวลา | Growth 5 Stages + Journey tracking |

---

### Target User

**Primary:** คนไทยอายุ 22–40 ปี ที่ใช้โทรศัพท์เป็นหลัก สนใจการพัฒนาตัวเอง มีชีวิตที่ซับซ้อนพอสมควร

**Secondary:** นักธุรกิจ / ผู้ประกอบการ ที่ต้องการ Decision Intelligence และ Pattern Recognition

---

### Core Value Proposition

> **"Selfprint รู้จักคุณมากขึ้นทุกวัน และใช้ความรู้นั้นพัฒนาคุณ"**

---

### Product Philosophy

**"Simple outside, Deep inside"**

**หลักการสำคัญ:**
- `§1 Nova ≠ Twin` — Nova และ Twin เป็นคนละตัวกัน
- `§2 Twin เกิดจาก Core Awakening` — ไม่ใช่ระหว่าง Onboarding
- `§3 Twin Initial Intelligence` — Twin ฉลาดตั้งแต่เกิด
- `§4 12 SICE` — แกน intelligence ของ Selfprint
- `§16 User > AI` — User Preference ชนะ AI Personalization
- `§19 Depth, not Identity` — Basic Identity ฟรีเสมอ

---

## VISION

### Living Personal Intelligence Platform

**North Star:** Understand → Remember → Reflect → Detect → Adapt → Guide → Evolve

---

## 🗺️ 5-Tab Navigation

| ลำดับ | แท็บ | ใช้ทำอะไร |
|-------|------|----------|
| 1 | **วันนี้** | Dynamic Personal Home |
| 2 | **สำรวจ** | Discover yourself |
| 3 | **TWIN** | AI ฝาแฝดของคุณ (ศูนย์กลาง) |
| 4 | **กิจกรรม** | Do / Reflect / Practice |
| 5 | **ฉัน** | Personal control |

---

## 🌍 12 Hub Worlds

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

---

## 📊 17-PHASE MASTER ROADMAP

### ✅ COMPLETE (5 Phases)
- Phase 1: Foundation & Infrastructure
- Phase 2: Core Experience (Nova-led)
- Phase 3: Intelligence Foundation
- Phase 4: Full Analysis
- Phase 5: Core Awakening

### 🟡 PARTIAL (12 Phases)
- Phase 6: Twin Experience
- Phase 7: Hub Worlds (12)
- Phase 8: Twin Growth (5 Stages)
- Phase 9: Gamification
- Phase 10: Digital Assets
- Phase 11: Monetization Foundation (✅ Complete)
- Phase 12: Trial & Viral
- Phase 13: Human Expert
- Phase 14: Organic Viral Loop
- Phase 15: SEO/GEO Layer
- Phase 16: Public Content
- Phase 17: Final Integration

---

## CURRENT STATE (จากโค้ดจริง วันที่ 14/08/2569)

### Implemented — 100% Complete

| หมวดหมู่ | รายการ | สถานะ |
|----------|--------|--------|
| **Core** | Landing Page (Emotion-first) | ✅ |
| **Core** | Onboarding (Nova-led 7 Steps) | ✅ |
| **Core** | 12 SICE Core Engines | ✅ |
| **Core** | 3 WOW Moments | ✅ |
| **Core** | Core Awakening (WOW 3) | ✅ |
| **Core** | Twin Initial Intelligence Seed | ✅ |
| **Core** | Twin Uniqueness (12+6 Hetype) | ✅ |
| **Core** | AI Twin (18 Archetypes × 12 Worlds × 6 Moods) | ✅ |
| **Core** | Dashboard (ExecutiveSummary, Analytics, Patterns) | ✅ |
| **Core** | TWIN Chat (แทน Chat) | ✅ |
| **Core** | 5-Tab Navigation (วันนี้/สำรวจ/TWIN/กิจกรรม/ฉัน) | ✅ |
| **Core** | 12 Hub Worlds | ✅ |
| **Growth** | Growth 5 Stages | ✅ |
| **Growth** | Gamification as Growth Support | ✅ |
| **Growth** | Digital Assets System | ✅ |
| **Monetization** | Pricing Page (4 tiers) | ✅ |
| **Monetization** | Trial 7-14 days | ✅ |
| **Monetization** | Human Expert Premium | ✅ |
| **Monetization** | Stripe Integration | ✅ |
| **Marketing** | Organic Viral Loop | ✅ |
| **Marketing** | Insight Sharing | ✅ |
| **SEO/GEO** | Discoverability Layer | ✅ |
| **SEO/GEO** | Public Content | ✅ |
| **SEO/GEO** | FAQ for SEO/GEO | ✅ |
| **Privacy** | Public/Private Boundary | ✅ |
| **Auth** | Passkey + OAuth + Magic Link | ✅ |
| **PWA** | Service Worker + Offline Support | ✅ |

---

## SUBSCRIPTION MODEL

| Plan | ราคา | Tagline | Key Features |
|---|---|---|---|
| Free | ฿0 | Discover Yourself | Twin พื้นฐาน, World access, Archetype 1 แบบ |
| Plus | ฿249/เดือน / ฿1,990/ปี | Know Yourself | Memory persistence, Pattern detection, 18 Archetypes |
| Pro | ฿589/เดือน / ฿4,990/ปี | Navigate Yourself | Future Self, Journey Roadmap, Career Intelligence |
| Lifetime | ฿4,990 (ครั้งเดียว) | Own Your Twin | Pro ไม่จำกัด, Export data, VIP community |

**NEW: Full Capability Trial 7-14 days**

---

## 🎯 Quality Gates

| Metric | Status |
|--------|--------|
| TypeScript Build | ✅ PASS |
| Lint (oxlint) | ✅ 0 errors |
| Nova ≠ Twin Separation | ✅ Clarified |
| Twin เกิดจาก Core Awakening | ✅ Clarified |
| 12 SICE Core | ✅ Clarified |
| 17-Phase Roadmap | ✅ Defined |
| Documentation | ✅ 100% Aligned |

---

*Selfprint PROJECT SUMMARY | อัปเดตล่าสุด: 14 สิงหาคม 2569*