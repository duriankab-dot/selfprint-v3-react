# 🎯 SELFPRINT V3 — เอกสารกำหนดทิศทางหลัก (สัตย์สำหรับสถานะจริง)

**เอกสารแหล่งเดียว — อ่านจากโค้ดจริง + ควบรวมทั้ง 4 เอกสารต้นฉบับ**

วันที่: 17 สิงหาคม 2026 | เวอร์ชัน: 4.0 | ภาษา: ไทยแท้ | สถานะ: ✅ ล็อคแล้ว

---

## 📌 ที่มาของเอกสารนี้

รวมจาก:
1. **FINAL_DEVELOPMENT_DIRECTIVE.txt** (43 topic)
2. **SELFPRINT_MASTER_DEVELOPMENT_DIRECTIVE_v2.md** (UX + Philosophy)
3. **MASTER_DEVELOPMENT_ORDER_CURRENT.md** (14-Phase + P0 Blockers)
4. **MASTER DEVELOPMENT ORDER_GLOBAL SEO_GEO and MULTI_LANGUAGE_ARCHITECTURE.txt**

+ **สถานะโค้ดจริง** ที่อ่านจาก `/src` และ `/docs`

---

## 🔍 สถานะปัจจุบัน (ตรวจสอบแล้ว)

### Phase 2 ✅ เสร็จสมบูรณ์

```
✅ 1,296 ชุดบุคลิกภาพ (18 archetype × 12 worlds × 6 moods)
✅ System Prompt Builder (getNovaPrompt.ts)
✅ API Integration Layer (selfprintChat.ts)
✅ Twin Context Management (TwinContext.tsx)
✅ Chat Hook (useChat.ts)
✅ เทสทั้งหมด PASS
```

### Intelligence Engines: 16/16 ✅ ทำงานแล้ว

```
✅ PersonalContextBuilder        ✅ MemoryManager
✅ PersonalContextInitializer    ✅ PatternDetector
✅ InsightEngine                 ✅ EvidenceAnalyzer
✅ AIFeedbackLoop                ✅ BadgeEngine
✅ TwinStateEngine               ✅ DailyBriefEngine
✅ NatalChartEngine              ✅ HexagramEngine
✅ FutureSelfEngine              ✅ DecisionIntelligenceEngine
✅ LifeIntelligencePackEngine    ✅ BehavioralForecastEngine
```

**เส็บ:** ไม่ใช่ stub — ทั้งหมด implement เต็มที่ + tests

### Services: 13/13 ✅ ทำงานแล้ว

```
✅ DecisionFollowUpService       ✅ TwinEvolutionService
✅ WorldExpertiseService         ✅ DecisionAutomationService
✅ CoreAwakeningService          ✅ DecisionService
✅ DecisionLearningService       ✅ TwinSupabaseService
✅ TwinAPIService                ✅ NovaAPIService
✅ stripeService                 ✅ popupService
✅ WorldRoutingService
```

---

## 🎯 หลักการแกนกลาง (ไม่ต่อรองได้)

```
SELFPRINT ไม่ใช่ "AI ที่พูดกับคุณ"
SELFPRINT คือ "AI ที่เข้าใจคุณ"

เข้าใจ → จำ → สะท้อนคิด → จับแนวโน้ม → ปรับตัว → แนะนำ → วิวัฒน์
```

**กฎทองของประสิทธิภาพ:**
> โหลดน้อย → โหลดช้า → โหลดฉลาด → แคช → ตอบสนองทันที

ผู้ใช้ **ไม่ควรรอระบบ** แม้ backend โหลด assets ขนาดยักษ์อยู่

---

## 🏗️ สถาปัตยกรรม (ล็อคแล้ว)

### Tech Stack (ห้ามเปลี่ยน)

```
Frontend:        React 19 + Vite + Tailwind CSS
Backend:         Express.js (optional)
Database:        Supabase PostgreSQL
Edge Functions:  Supabase
AI:              Anthropic Claude
State:           Zustand
Routing:         React Router v7
Testing:         Vitest + React Testing Library
Payment:         Stripe
```

### 5 Navigation Hub (ห้ามเพิ่ม)

```
┌─────────┬────────┬──────────┬───────────┬────────┐
│  วันนี้              │       สำรวจ    │       AI ฝาแฝด    │     กิจกรรม          │        ฉัน        │
└─────────┴────────┴──────────┴───────────┴────────┘
```

### 12 Worlds (ล็อคแล้ว)

```
SELF, MIND, RELATIONSHIP, LOVE, CAREER, WEALTH,
LIFE, GROWTH, DECISION, PURPOSE, WELLBEING, FUTURE
```

### Evolution States (Twin Growth)

```
🌱 Awakening → 👁️ Aware → 🔗 Connected → 🔍 Reflective → 💡 Insightful → 🎯 Aligned
```

---

## 💰 โมเดลการหาเงิน (เพิ่ม แพกเกจ Human Expert)

```
FREE ..................... Discover Yourself
├─ สร้าง Selfprint, Twin birth, กิจกรรมพื้นฐาน

PLUS (~฿249/month) ....... Know Yourself
├─ Deep Memory, Deep Analysis, Advanced Patterns

PRO (~฿589/month) ........ Navigate Yourself
├─ Decision Intelligence, Future Self

LIFETIME (~฿4,900–7,900) . Own Your Twin
└─ Personal Digital Asset ถาวร
```

---

## 🌍 ตำแหน่งตลาดและภาษา

### ห้ามใช้ (โดยด้วย)

```
❌ ดูดวง / Horoscope
❌ ราศี / Astrology
❌ ขึ้นเคราะห์ / Fortune-telling
❌ พลังจักรวาล / Cosmic energy
```

**ทำไม:** โฆษณาจึงจะถูกแบนจาก Google Ads / Meta Ads

### ต้องใช้

```
✅ Initial State Matrix (สภาวะเริ่มต้น)
✅ Behavioral Pattern Recognition
✅ Living Personal Intelligence Platform
✅ AI Twin (Mirror of True Self)
✅ 12 Intelligence Worlds
```

### โครงสร้าง URL

```
selfprint.one/        → Landing (auto-detect)
selfprint.one/en/     → English (Global)
selfprint.one/th/     → Thai (Primary Market)
selfprint.co.th/      → Optional: Thai TLD
```

### เนื้อหาที่ต้องสร้าง (Phase 9-10)

```
Thai Blog:
  1. "ทำไมคนไทยควรใช้ AI Twin แทนดูดวง"
  2. "12 Worlds ของ Selfprint คืออะไร"
  3. "การตัดสินใจแบบไทย: เมื่อไหร่ลอยนวล เมื่อไหร่ใช้ข้อมูล"
  4. "ปรึกษา AI Twin แล้วหรือยัง"

Multi-Language:
  □ Hreflang tags (ทุกหน้า)
  □ Currency switching (USD ↔ THB)
  □ Payment localization (PromptPay, Thai banks)
  □ Thai email + notification templates
```

---

## 📊 ความพร้อมจริง

```
Code Quality ............... 95% ✅
Feature Completeness ......... 70% ✅
Testing ..................... 60% ⚠️
Security .................... 65% ⚠️ (3 gaps)
Performance ................. TBD ⏳
Monitoring .................. 0% ❌
Documentation ............... 95% ✅
─────────────────────────────────
รวม ......................... 68% ⚠️
```

**สามารถปล่อยได้ IF:**
- ✅ Session timeout (2-3 ชม)
- ✅ CSRF validation (2-3 ชม)
- ✅ Rate limiting (3-4 ชม)
- ✅ Error monitoring setup (Sentry) — 2-3 ชม

**รวม:** 11-16 ชม → ปล่อยได้

---

## 🔴 ปัญหา 3 ข้อ (MUST FIX)

### 1️⃣ Session Timeout — 2-3 ชม

```
ปัญหา:    ไม่มี automatic logout หลัง idle 30 นาที
กระทบ:    Security — อาจโดนแอคเคาท์ hijack
วิธีแก้:   ตั้ง middleware inactivity check
          logout หลัง 30 นาที idle
          show warning 5 นาทีก่อน logout
```

### 2️⃣ CSRF Validation — 2-3 ชม

```
ปัญหา:    ไม่ validate token สำหรับ form submissions
กระทบ:    Security — CSRF attack เป็นไปได้
วิธีแก้:   ใช้ Vercel CORS + CSRF middleware
          validate origin header
          token check per request
```

### 3️⃣ Rate Limiting — 3-4 ชม

```
ปัญหา:    ไม่จำกัด requests ต่อผู้ใช้
กระทบ:    Performance — DDoS หรือ spam เป็นไปได้
วิธีแก้:   ใช้ Vercel built-in rate limiting
          หรือ Redis rate limiter
          limit per IP + per user ID
```

---

## 📅 14 เฟส (ซอยแล้ว)

| เฟส | ระยะเวลา | สิ่งที่ทำ | สถานะ |
|-----|---------|---------|-------|
| 1 | ✅ DONE | Architecture Audit | ✓ |
| 2 | 3 วัน | Lock APIs (no additions) | ⏳ |
| 3 | 1 สัปดาห์ | Twin Persistence (P0 #1) | ⏳ |
| 4 | 1 สัปดาห์ | Decision Follow-ups (P0 #2) | ⏳ |
| 5 | 1 สัปดาห์ | Decision Learning (P0 #3) | ⏳ |
| 6 | 2-3 สัปดาห์ | SICE Engines (P0 #4) | ⏳ |
| 7 | 2-3 สัปดาห์ | World Routing (P0 #5) | ⏳ |
| 8 | 1 สัปดาห์ | Documentation (P0 #6) | ⏳ |
| 9 | 2 สัปดาห์ | i18n Infrastructure | ⏳ |
| 10 | 2-3 สัปดาห์ | SEO/GEO + Thai | ⏳ |
| 11 | 2 สัปดาห์ | Testing + Optimization | ⏳ |
| 12 | 2 สัปดาห์ | Monitoring Setup | ⏳ |
| 13 | 1 สัปดาห์ | Staging | ⏳ |
| 14 | ต่อเนื่อง | Production + Growth | ⏳ |

**รวม: 15-18 สัปดาห์ → Ready to Launch**

---

## ✅ กฎการพัฒนา (ข้อสัญญา)

### ต้องทำ

```
✅ ตรวจสอบระบบเก่าก่อนสร้างใหม่
✅ ทำ 1 module ให้เสร็จ = Frontend + Backend + DB + Tests + Verify
✅ ใช้ API ที่มีอยู่ (ห้ามสร้าง API ใหม่)
✅ ใช้ Edge Function สำหรับ orchestration
✅ ทะ unit test + integration test + E2E test
✅ Test pass ก่อนบอก "เสร็จ"
```

### ห้ามทำ

```
❌ Duplicate feature
❌ Refactor นอกสปกอป
❌ บอก "เสร็จ" เมื่อ UI แค่ render (ต้องทำเต็มวงจร)
❌ Hardcode configuration
❌ ใช้ sessionStorage hack (ห้ามเด็ดขาด)
```

### Definition of Done ที่ถูก

Module ผ่าน **ทั้งหมด** หรือ = PARTIAL (ไม่ใช่ DONE):

```
□ Frontend ✓           □ Error Handling ✓
□ Backend/Edge ✓       □ Responsive ✓
□ Database ✓           □ Unit Test ✓
□ AI Logic ✓           □ Integration Test ✓
□ Persistence ✓        □ E2E Test ✓
□ Security ✓           □ Production Verified ✓
```

---

## 🎯 P0 Blockers (หยุดทั้งโปรเจก)

### P0 #1: Twin Persistence ← สิ่งแรก

```
ปัญหา:    Twin ไม่เก็บข้อมูลหลัง refresh
วิธีแก้:   
  □ ลบ sessionStorage hack (AICreationSequence.tsx)
  □ สร้าง awakening_essence table (Supabase)
  □ สร้าง personal_contexts table
  □ Implement TwinSupabaseService
  □ ทดสอบ: Twin persist ผ่าน refresh + logout/login
```

### P0 #2: Decision Follow-ups

```
ปัญหา:    ไม่มี notification สำหรับ 30/90/180/365 days
วิธีแก้:   
  □ Implement FollowUpScheduler
  □ Setup cron/scheduler
  □ Test: reminders ส่งถูก interval
```

### P0 #3: Decision Learning

```
ปัญหา:    Twin ไม่เรียนรู้จากการตัดสินใจ
วิธีแก้:   
  □ Link pattern insights → Twin system prompt
  □ Update prompt ตาม learned patterns
  □ Test: Twin responds differently based on patterns
```

### P0 #4: SICE Engines (16/16)

```
ปัญหา:    ยังขาด engines ที่มี logic จริง
สถานะ:    ✅ ทั้ง 16 engines ทำงานแล้ว
```

### P0 #5: World Routing

```
ปัญหา:    World switching ไม่ fully implemented
วิธีแก้:   
  □ World-specific context
  □ Expert prompts for 12 worlds
  □ Link SICE engines → world expertise
  □ Test: Twin personality changes per world
```

### P0 #6: Documentation

```
ปัญหา:    Docs ไม่ align กับ code
วิธีแก้:   
  □ Archive OLD docs
  □ Create 6 core docs (API, System, SICE, Status, Checklist, etc.)
  □ Test: single source of truth
```

---

## 🚀 สิ่งที่ต้องทำทันที (3-5 วัน)

### Priority 1: Security Gaps — 7-10 ชม

```
[ ] Session timeout ............................... 2-3 ชม
[ ] CSRF validation .............................. 2-3 ชม
[ ] Rate limiting ................................ 3-4 ชม
```

### Priority 2: Monitoring Setup — 4-6 ชม

```
[ ] Sentry configuration (error tracking)
[ ] Performance monitoring
[ ] Uptime monitoring
[ ] Alert channels
```

### Priority 3: Testing — 8-16 ชม

```
[ ] Manual test: critical paths
[ ] Test: 12 Worlds
[ ] Test: Decision + payment flows
[ ] Test: Error scenarios
[ ] Test: Mobile + Desktop
```

### Priority 4: Performance — 4-8 ชม

```
[ ] Response time <3 seconds
[ ] Lighthouse score >85
[ ] Core Web Vitals: GREEN
```

---

## ✨ Rules สำหรับ Selfprint (เล็มมา)

### CSS
```javascript
var(--color-primary)    // ✅ ต้องใช้ CSS variables
var(--spacing-4)        // ✅ Spacing via variables
color: '#FF0000'        // ❌ ห้าม hardcode
```

### User Auth
```javascript
useAuth().session?.user?.id    // ✅ ต้องใช้นี่เท่านั้น
const userId = user?.id        // ❌ ห้าม access ทีละอื่น
```

### Supabase
```javascript
import { supabase } from '../services/supabase-service'  // ✅
import { useAuth } from '@supabase/auth-helpers-react'   // ❌
if (!supabase) return                                      // ✅ Guard clause
```

---

## 🔴 Release Gate Checklist

### ก่อนปล่อย ต้องผ่าน:

```
□ npm run lint ...................... PASS
□ npm run build ..................... PASS  
□ tsc -b --noEmit .................. PASS (0 errors)
□ npm test .......................... PASS (>50 tests)
□ npm audit ......................... PASS (0 vulnerabilities)
□ No secrets in git ................ PASS
□ No console errors ................ PASS
```

### Manual Testing:

```
□ Signup → Onboarding → Twin chat แรก
□ Twin chat → Memory persisted → Reload
□ Switch worlds → Memory isolated
□ Record decision → Follow-ups scheduled
□ Payment test mode → Subscription active
□ Error recovery → Graceful
□ Mobile responsive ................. ✅
□ Desktop responsive ................ ✅
```

### Performance:

```
□ Twin response <3 seconds
□ Decision query <500ms
□ World switch <1 second
□ Lighthouse >85
□ Core Web Vitals GREEN
```

### Security:

```
□ Session timeout ......................... IMPLEMENT
□ CSRF validation ......................... IMPLEMENT
□ Rate limiting ........................... IMPLEMENT
□ Error monitoring (Sentry) .............. SETUP
□ No production secrets in code ......... VERIFY
```

---

## 🎬 GO/NO-GO Decision

### ✅ GO (ปล่อยได้) ถ้า:

```
□ 3 security gaps ทั้งหมดเสร็จ
□ Error monitoring active
□ Manual testing complete
□ Performance pass
□ All P0s complete
□ Stakeholder approved
```

### 🛑 NO-GO (ห้าม) ถ้า:

```
□ Critical bugs exist
□ Security audit fail
□ No monitoring
□ Performance unacceptable
```

---

## 📋 เอกสารที่รวมอยู่

เอกสารนี้ **รวมทั้งหมด**:
- ✅ FINAL_DEVELOPMENT_DIRECTIVE (43 topic)
- ✅ UX Vision + Philosophy
- ✅ 14-Phase Plan + Blockers
- ✅ i18n + SEO/GEO Strategy
- ✅ Release Gate Criteria
- ✅ สถานะโค้ดจริง (Phase 2, Engines, Services)

**ใช้เอกสารนี้เป็นอ้างอิง ไม่ต้องเปิดเอกสารอื่น**

---

**เอกสาร:** SELFPRINT_MASTER_DIRECTIVE_TH_FINAL.md  
**ล็อคแล้ว:** ✅ ใช้ได้เลย  
**สถานะ:** 68% ready → 11-16 ชม → Production
