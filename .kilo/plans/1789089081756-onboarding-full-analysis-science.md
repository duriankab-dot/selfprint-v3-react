# SELFPRINT Onboarding Full Analysis — Scientific Disciplines & 12 SICE Engines

## สรุปวัตถุประสงค์

อธิบายว่า **หน้า Onboarding → Full Analysis** ของ SELFPRINT ใช้ศาสตร์อะไรบ้าง และ 12 SICE (Scientific Intelligence Core Engines) มีบทบาทอย่างไรในขั้นตอนนี้ พร้อมข้อมูล data flow, จุดเสี่ยง, และ open questions สำหรับการพัฒนาต่อไป

---

## 1. ขั้นตอน Onboarding (8 ขั้นตอน)

`src/pages/Onboarding.tsx` จัดการ flow 8 ขั้นตอนผ่าน `useState<OnboardingStep>` ส่วน UI:

| ลำดับ | `OnboardingStep` | Component | วิทยาศาสตร์/สานงาน |
|------|-------------------|-----------|----------------------|
| 1 | `'emotion'` | `EmotionSelector` | Affective Psychology (mood ปัจจุบัน) |
| 2 | `'nova-conversation'` | `NovaConversation` | Conversational AI + เก็บ birth data |
| 3 | `'ai-creation'` | `AICreationSequence` | Procedural generation (deterministic animation) |
| 4 | `'birthdate'` | `BirthdateInput` (legacy fallback) | Astronomical data entry |
| 5 | `'sice-result'` | `InitialBlueprint` | 12 SICE Engines + Numerology/Zodiac baseline |
| 6 | `'fine-tune'` | `FinetuningQuestions` | Behavioral psychology (5 คำถามปรับปรุง) |
| **7** | `'complete'` | `FullAnalysis` | **12 SICE synthesis รวมกับ Numerology/Astrology** |
| 8 | `'claim-account'` | `ClaimAccount` | Identity persistence + lifecycle transition |

> **Lifecycle state machine**: `Onboarding.tsx:206` อ่าน `status` จาก `lifecycleStore` (`ONBOARDING → ANALYSIS → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE`)

---

## 2. 12 SICE Engines — ศาสตร์ในแต่ละตัว

`src/services/sice/SICEOrchestrator.ts:55-68` ลงทะเบียน 12 engines แบบ parallel

### A. Behavioral Psychology / Social Psychology

| # | Engine | File | หน้าที่ |
|---|--------|------|-------|
| 1 | `PersonalContextBuilder` | `engines/PersonalContextBuilder.ts` | สร้างบริบทส่วนตัว (emotionalState, goals, strengthAreas) จากข้อมูลผู้ใช้ + world-specific personality |
| 2 | `PatternDetector` | `engines/PatternDetector.ts` | ตรวจจับ behavioral patterns (frequency, impact, examples) |
| 4 | `AIFeedbackLoop` | `engines/AIFeedbackLoop.ts` | ลูปย้อนกลับ: ปรับ engine accuracy จาก feedback ย้อนหลัง |

### B. Cognitive Science / Cognitive AI

| # | Engine | File | หน้าที่ |
|---|--------|------|-------|
| 3 | `InsightEngine` | `engines/InsightEngine.ts` | สร้าง insights จาก patterns (title, description, actionable) |
| 11 | `MemoryManagerEngine` | `engines/MemoryManagerEngine.ts` | จัดการและสังเคราะห์ความจำ (primaryThemes, emotionalTone) |

### C. Agent Systems / Multi-Agent Architecture

| # | Engine | File | หน้าที่ |
|---|--------|------|-------|
| 5 | `TwinStateEngine` | `engines/TwinStateEngine.ts` | กำหนดสถานะ Twin (mood, energy, responseStyle) |
| 6 | `ExperienceEngine` | `engines/ExperienceEngine.ts` | ติดตามการเรียนรู้สะสม (masteredAreas, growthAreas) |

### D. Decision Science / Future Modeling

| # | Engine | File | หน้าที่ |
|---|--------|------|-------|
| 7 | `EnvironmentEngine` | `engines/EnvironmentEngine.ts` | วิเคราะห์บริบทแวดล้อม (timeOfDay, season, stressLevel) |
| 8 | `BadgeEngine` | `engines/BadgeEngine.ts` | สร้าง achievement badges (gamification) |
| 9 | `BehavioralForecastEngine` | `engines/BehavioralForecastEngine.ts` | คาดการณ์พฤติกรรม (likelyNextAction, opportunitiesAhead) |
| 10 | `FutureSelfEngine` | `engines/FutureSelfEngine.ts` | ฉายภาพอนาคต (vision, pathToReach, barriers) |
| 12 | `DecisionIntelligenceEngineAdapter` | `engines/DecisionIntelligenceEngineAdapter.ts` | วิเคราะห์การตัดสินใจ (successProbability, riskLevel) |

### อ้างอิง verification

- `src/services/sice/__tests__/SICEEngines.test.ts:40` — ทดสอบ 12/12 engines
- `src/services/sice/__tests__/SICEEngines.test.ts:295` — ยืนยัน `getEngineStatus()` คืน 12 ตัว
- `supabase/migrations/028_consolidate_phase_a_schema.sql:94-95` — `twin_sice_scores` table เก็บ baseline ของทุก engine

---

## 3. Deterministic Science (src/lib/astrology.ts)

### สาขาวิชา + วิธีคำนวณ

| สาขาวิชา | ฟังก์ชัน | สูตร/วิธี |
|----------|----------|------------|
| Numerology | `calculateLifePathNumber()` | Digit-sum reduction จาก YYYYMMDD (master numbers 11/22/33) |
| Western Astrology | `calculateWesternZodiac()` | Date-range lookup (12 signs) |
| Chinese/Thai Zodiac | `calculateChineseZodiac()` | Sexagenary cycle (1984 = Jia-Zi anchor) |
| Bazi Element | `calculateBaziYearElement()` | 10 Heavenly Stems → Wood/Fire/Earth/Metal/Water |
| Natal Chart | `calculateNatalChartInline()` | VSOP low-precision วาคุม planet positions จาก J2000 |
| I Ching | `calculateHexagramInline()` | `(year + month*7 + day*13) % 64` |
| Jungian Archetypes | `getPrototypeCore()` | Life Path → 12 archetype (Hero, Lover, Jester, Everyman, Explorer, Caregiver, Sage, Magician, Ruler, Creator, Innocent, Outlaw) |

### InitialDisciplines (type)

```typescript
// src/lib/astrology.ts:19-51, 88-104
interface InitialDisciplines {
  lifePathNumber: number;        // Numerology
  westernZodiac: string;         // Western Astrology
  chineseZodiac: string;         // Chinese/Thai Zodiac
  baziYearElement: string;       // Bazi Element
  prototypeCore: string;         // Jungian Archetype
  natalDominantElement?: string;  // Fire/Earth/Air/Water
  moonSign?: string;             // Moon sign
  mercurySign?: string;          // Cognitive style
  venusSign?: string;            // Values
  marsSign?: string;             // Drive
  jupiterSign?: string;          // Growth
  saturnSign?: string;           // Structure
  hexagramNumber?: number;       // I Ching
  hexagramThai?: string;         // I Ching (Thai)
  hexagramTheme?: string;        // I Ching theme
}
```

---

## 4. Data Flow — ตั้งแต่ Onboarding สู่ Full Analysis

```
[EmotionSelector] → mood: Mood (src/context/EmotionContext.ts)
      ↓
[NovaConversation] → birthData {dob, time, place} + profile.birthDate
      ↓
[AICreationSequence] → เรียก calculateInitialDisciplines(birthData.dob)
      ↓               → buildFallbackResponse({mood, birthDate, finetuneAnswers: {}})
[Step 5: sice-result] → setSiceResult({accuracy: 60, disciplines})
                       → setAnalysisProfile(AnalysisResponse)
      ↓
[FinetuningQuestions] → answers (5 questions)
      ↓
[Step 6: handleFinetuneSubmit] 
  - analyzeWithAstrovera(answers, mood, birthDate) → null (backend retired 2026-08-22)
  - buildFallbackResponse({mood, birthDate, finetuneAnswers: answers})
  - accuracy = max(80, round(confidence * 100)) → minimum 80%
  - setSiceResult({...prev, accuracy, finetuned: true})
      ↓
[Step 7: FullAnalysis.tsx]
  Props: profile: AnalysisData (decisionStyle, strengths, insights, blindSpots, opportunities)
         prototypeCore: string
         accuracy: number
  - Phase 1: Scanning (2.5s) — NOVA eye + 4 messages
  - Phase 2: Reveal — 7 cards ปรากฏ sequential (stagger 420ms)
  → onHome → setStep('claim-account')
      ↓
[Step 8: ClaimAccount] → pendingOnboardingData → handleComplete()
  - transitionTo(session.user.id, 'ANALYSIS') via lifecycleStore
  - เขียน onboarding_checkpoints.current_step = 'complete'
  → navigate('/core-awakening')
```

### ประเภทข้อมูลสำคัญ

```typescript
// AnalysisResponse (src/lib/types/astrovera.ts:82-95)
interface AnalysisResponse {
  decisionStyle: string;
  strengths: string[];
  insights: string[];
  opportunities: string[];
  blindSpots: string[];
  confidence: number;    // 0-1
  sources: string[];
}

// PendingOnboardingData (src/components/onboarding/ClaimAccount.tsx)
interface PendingOnboardingData {
  profile: { dateOfBirth, timeOfBirth, placeOfBirth, initialMood };
  blueprint: {
    accuracyLevel: number;
    decisionStyle: string;
    strengths: string[];
    insights: string[];
    opportunities: string[];
    blindSpots: string[];
    prototypeCore: string;
    source: 'refined' | 'initial';
  };
}
```

---

## 5. Accuracy / Confidence Logic

| ขั้นตอน | วิธีคำนวณ accuracy | ค่าเริ่มต้น |
|--------|----------------------|-------------|
| Step 5 (sice-result) | `calculateInitialDisciplines()` → accuracy 60 | `Onboarding.tsx:440` |
| Step 6 (fine-tune) | `max(80, round(result.confidence * 100))` | `Onboarding.tsx:491` |
| Step 6 (skip) | `siceResult.prev` หรือ fallback accuracy 70 | `Onboarding.tsx:877` |
| Step 7 (complete) | `siceResult.accuracy \|\| 85` | `Onboarding.tsx:891` |

> **Note**: `analyzeWithAstrovera()` ใน `Onboarding.tsx:52-58` คืนค่า `null` เสมอ (backend Phase 2 ยังไม่พัฒนา) ทั้งหมดใช้ `buildFallbackResponse()` ซึ่งให้ `confidence = 0.6` (valid วันเกิด) หรือ `0.3` (invalid/empty)

---

## 6. การบูรณากระบุข้อมูลระหว่าง 12 SICE กับ Astrology

```
calculateInitialDisciplines(birthDate)     ← src/lib/astrology.ts
  → lifePathNumber, prototypeCore, zodiac...   (Astrology)
  → getLifePathProfile(lifePathNumber)       (Life Path profile)
  → prototypeCore (Jungian Archetype)

SICEOrchestrator.orchestrate(SICEInput)    ← src/services/sice/SICEOrchestrator.ts
  → 12 engines ทำงาน parallel
  → synthesis (themes, conflicts, agreements)
  → personalIntelligence (insights, confidence, recommendedAction)

astrovera-adapter.ts:buildFallbackResponse(request)
  = ใช้ calculateInitialDisciplines + getLifePathProfile
  → สร้าง AnalysisResponse (decisionStyle, strengths, insights, etc.)
  → confidence = 0.6 / 0.3  (จาก isValidBirthDate)

Onboarding.tsx:handleFinetuneSubmit(answers)
  = analyzeWithAstrovera() → null
  + buildFallbackResponse({mood, birthDate, finetuneAnswers: answers})
  → ตั้ง accuracy = max(80, round(confidence * 100))
```

**SICE กับ Astrology ผสานที่** `FullAnalysis.tsx` ผ่าน props:
- `profile` (AnalysisResponse) ← จาก `buildFallbackResponse` (Astrology/Numerology)
- `prototypeCore` (Jungian Archetype) ← จาก `siceResult.disciplines.prototypeCore`
- `accuracy` ← จาก `siceResult.accuracy` (SICE + fallback confidence logic)

---

## 7. จุดเสี่ยงและเส้นทางสำรอง (Fallback Chain)

| จุดเสี่ยง | การตอบโต้ | ระดับ | อ้างอิง |
|-----------|-----------|------|---------|
| `analyzeWithAstrovera` return null | ใช้ `buildFallbackResponse()` | Medium | `Onboarding.tsx:52-58` |
| ไม่มี birthDate (skipped) | `calculateInitialDisciplines()` defaults เป็นวันนี้ | Low | `astrology.ts:98-99` |
| `siceResult` null on 'complete' step | defensive fallback: `calculateInitialDisciplines(birthDate)` | High | `Onboarding.tsx:877` |
| `transitionTo('ANALYSIS')` ล้มเหลว | `withLifecycleRetry()` (3 ครั้ง) + visible retry UI | Critical | `Onboarding.tsx:78-84, 537-571` |
| Supabase cold start 504 | retry 3 ครั้ง → แสดง error UI พร้อมปุ่มลองอีกครั้ง | Critical | `Onboarding.tsx:619-668` |
| `analysisProfile` null บน 'complete' | `buildFallbackResponse()` ใช้ `buildFallbackResponse({mood, birthDate, finetuneAnswers:{}})` | High | `Onboarding.tsx:376` |
| SICE engine 1/12 ล้มเหลว | `completionStatus` = 'DEGRADED' แทน 'FAILED' | Medium | `SICEOrchestrator.ts:121-124` |
| ทุก engine ล้มเหล่ | `completionStatus` = 'FAILED' | Critical | `SICEOrchestrator.ts:124` |

---

## 8. งานที่ควรตรวจสอบ /  enhancement opportunities

| Priority | งาน | คำอธิบาย | ไฟล์อ้างอิง |
|---------|-----|---------|------------|
| **P1** | เชื่อมต่อ SICE Orchestrator เข้ากับ Full Analysis | ขณะนี้ 12 SICE engines ยังไม่ได้ใช้ผลลัพธ์ใน Full Analysis (ใช้เฉพาะ astrology fallback) | `SICEOrchestrator.ts`, `Onboarding.tsx:52-58` |
| **P1** | เรียก SICE ขณะ fine-tune submit | `analyzeWithAstrovera` return null เสมอ — ควรเรียก SICE แทนหรือ補償 | `Onboarding.tsx:466-506` |
| **P2** | เก็บ `twin_sice_scores` หลัง onboarding | migration มี table แล้วแต่ CoreAwakening เท่านัยเขียน | `migration 028` |
| **P2** | เพิ่ม `SICEEngineResult` เข้า `AnalysisResponse` | insights จาก SICE synthesis ควรไหลเข้า Full Analysis | `types/sice.ts`, `astrovera.ts` |
| **P3** | Phase 2 Edge Function เรียก Astrovera | `buildFallbackResponse` ควรเป็น fallback เท่านัย ไม่ใช่หลัก | `astrovera-adapter.ts` |
| **P1** | **Quick Summary บน Landing Page** | **After birth data submit → แสดง preliminary analysis as short article → CTA ไป onboarding** | `LandingPage.tsx`, `BirthDataInput.tsx`, `astrology.ts` |

---

## 9. Quick Summary + Social Share — UI/UX Hand-off Spec (Exact)

### 9.1 จุดประสงค์ (Objective)
- เพิ่ม **Intro Summary Article** (บทความสรุปสั้น) ให้ผู้ใช้อ่านก่อนเข้าสู่เนื้อหาเชิงลึกเดิม
- ช่วยเพิ่มความอินและความ "ว้าว"
- เพิ่ม **ฟีเจอร์แชร์** ไปยัง Social Media (Facebook, Line, X) เพื่อสร้าง Viral Loop ดึงคนใหม่ๆ เข้ามาเล่นระบบ

### 9.2 โครงสร้างหน้าเว็บและการวาง Layout (Wireframe & Content Guide)

```
[ Top Header: selfprint.one ]
---------------------------------------------
[ 1. INTRO SUMMARY SECTION ]
- Title: "จิตวิญญาณแห่ง [Core Identity] ในตัวคุณ"
- 3-Paragraph Text (ข้อความจาก AI Prompt 1)
---------------------------------------------
[ 2. EXISTED CONTENT SECTION ]
- (เนื้อหาเดิมที่มีกล่องสีน้ำเงิน/ข้อมูลเชิงลึกในระบบปัจจุบัน)
- Quick Summary Card 6 หัวข้อ: Core Identity, Decision Style, Strengths, Blind Spots, Growth Opportunities, Current Mood
---------------------------------------------
[ 3. SOCIAL SHARE SECTION ]
- Text Header: "ส่งต่อตัวตนที่ใช่ ให้เพื่อนรู้จักคุณมากขึ้น"
- Button 1: [ แชร์ผลลัพธ์ลง Facebook ] (Icon FB)
- Button 2: [ ส่งต่อให้เพื่อนใน Line ] (Icon Line)
---------------------------------------------
```

### 9.3 ข้อมูลคำสั่งระบบ AI (Prompt Spec สำหรับ Backend)

ให้ Backend Setup ชุดคำสั่งนี้ส่งไปที่ AI API โดยผูกตัวแปร (Variables) จากระบบ:

```
text
คุณคือ Content Writer มืออาชีพด้านจิตวิทยาและการวิเคราะห์ตัวตน หน้าที่ของคุณคือสร้างเนื้อหา 2 ส่วนดังนี้

[ส่วนที่ 1: บทความสรุปภาพรวมตัวตนสั้นๆ (Intro Summary)]
- ความยาวไม่เกิน 500-600 ตัวอักษร แบ่งเป็น 3 ย่อหน้าสั้นๆ
- ย่อหน้า 1 (The Hook): เปิดด้วยประโยคคมๆ สรุปแก่นแท้ ทักทายด้วยชื่อ {user_name} และ {core_identity}
- ย่อหน้า 2 (The Deep Dive): นำข้อมูล {decision_style} และ {insight_1} มารวมกันให้อ่านแล้วรู้สึกโดนใจ
- ย่อหน้า 3 (The Bridge): นำข้อมูล {insight_2} มารวม และใช้ประโยคเชิญชวนให้เลื่อนลงไปอ่านข้อมูลด้านล่างต่อ

[ส่วนที่ 2: ข้อความสำหรับปุ่มแชร์ (Share Caption)]
สร้างข้อความสำหรับให้ผู้ใช้นำไปแชร์ลงโซเชียลมีเดีย 2 สไตล์ (คัดสไตล์ที่สละสลวยที่สุดส่งกลับมาให้ระบบ)
- สไตล์ที่ 1 (ภูมิใจในตัวตน): "เพิ่งไปลองอ่านบทวิเคราะห์ตัวตนมา ผลบอกว่าเนื้อแท้ของเราคือ จิตวิญญาณแห่ง {core_identity} เป็น {decision_style} ที่ชอบ {insight_1}! แม่นจนขนลุก ตรงกับตัวเองตอนนี้มากๆ 🔮✨ ใครอยากรู้ลองไปเล่นดูนะ #SelfPrint #ค้นพบตัวตน"
- สไตล์ที่ 2 (ชวนเพื่อนมาเล่น): "คุณเป็นแบบไหนใน 18 ตัวตน? 🤔 ผลวิเคราะห์ของเราออกมาเป็น {core_identity} สาย {decision_style} ลึกลงไประบบบอกว่าเรา {insight_2}! อ่านใจเราขาดมาก มาลองเล่นกันดูครับ 👇 [URL]"
```

### 9.4 เทคนิคัลสำหรับทีมนักพัฒนา (Tech Spec & Tracking)

**A. การตั้งค่า Open Graph (OG Tag) สำหรับการแชร์ลิงก์:**
- `og:title`: ผลวิเคราะห์ตัวตนของฉันคือ [Core Identity] คุณล่ะเป็นแบบไหน?
- `og:description`: ฉันคือ [Decision Style] ที่พร้อมปลดล็อกศักยภาพในตัวเอง มาค้นหาตัวตนของคุณที่ SelfPrint
- `og:image`: ให้ระบบ Render รูปกล่องผลลัพธ์ (เช่น กล่องสีเขียว Sage ในหน้าเว็บ) เป็นรูปภาพขนาด 1200 x 630 px (สัดส่วน 1.91:1) ส่งไปเป็นรูปพรีวิว

**B. พฤติกรรมของปุ่มแชร์ (Button Behavior):**
- **Facebook Share**: ใช้ Facebook Share Dialog API โดยผูก Caption และ [URL] ของหน้าผลลัพธ์นั้นๆ เข้าไปด้วย
- **Line Share**: ใช้ Line ลิงก์ `https://line.me?{text}` โดยนำข้อความ Share Caption ที่ระบบเจนได้ มาผ่านกระบวนการ URL Encode

### 9.5 Quick Input DOB ที่ Landing Section สุดท้าย
- เพิ่มช่องกรอกวันเกิดแบบ **Quick Input** ที่ส่วนล่างสุดของ Landing Page (ก่อน Quick Summary)
- ผู้ใช้กรอกวันเกิดแล้ว → ระบบคำนวณ Preliminary Analysis ทันที → แสดง Quick Summary + Intro Summary Article
- ไม่ต้องกรอกเวลา/สถานที่ (ใช้ค่า default หรือ skip)
- Flow: User enters dob → calculateInitialDisciplines(dob) → buildFallbackResponse → render QuickSummary + Intro Article + Social Share

### 9.6 Component Plan

| Component | Function |
|-----------|-----------|
| `src/components/landing/IntroSummary.tsx` | แสดง Intro Summary Article (3 paragraphs from AI) |
| `src/components/landing/QuickSummary.tsx` | แสดง 6-section Quick Summary Card + Social Share buttons |
| `src/lib/quick-summary.ts` | เรียบเรียง data → narrative text (from Life Path profile) |
| `src/lib/intro-summary.ts` | เรียบเรียง data → 3-paragraph Intro Summary (from AI Prompt 1) |
| `src/components/landing/BirthDataInput.tsx` | เดิม — เพิ่ม `onSummary` callback + Quick Input DOB |
| `src/pages/LandingPage.tsx` | Integrates Intro Summary + Quick Summary + Social Share |

### 9.7 Integration Flow

```
LandingPage.tsx (Screen 3 / bottom)
  ↓
Quick Input DOB (last section) → BirthDataInput.tsx (submit)
  ↓
updateProfile({ birthDate, birthTime?, birthPlace? })
  ↓
calculateInitialDisciplines(dob)
  ↓
getLifePathProfile(lifePathNumber)
  ↓
buildFallbackResponse({mood, birthDate, finetuneAnswers:{}})
  ↓
[1. IntroSummary.tsx] — 3-paragraph article (from AI Prompt 1)
[2. QuickSummary.tsx] — 6-section card + Social Share buttons
  ↓
CTA: "ทำ Full Analysis" → navigate('/onboarding')
  (data prefilled → Onboarding.tsx auto-skip emotion step)
```

### 9.8 Open Questions (Resolved)
1. **Mood Source**: ✅ **USE mood from EmotionContext** — confirmed by user
2. **Language Constraint**: Thai astrology terms ("ดวง", "ชะตา", "แนวโน้ม") — **only in Onboarding**, NOT in Landing/Blog/Social Media
3. **Performance**: Ensure QuickSummary rendering is lightweight — use cached `InitialDisciplines` result

---

## 10. Problems noted & closed (ทั้งหมดปิดแล้ว)

| Problem | สถานะ | การตัดสินใจ |
|---------|-------|-------------|
| `analyzeWithAstrovera()` return `null` | **CLOSED** | Backend retired 2026-08-22 → ใช้ `buildFallbackResponse()` (Life Path) |
| SICE engines ไม่ได้เชื่อมกับ Full Analysis | **CLOSED — ต้องเชื่อม** | ผู้ใช้ตัดสินใจ: ต้องเชื่อม SICE → Full Analysis |
| Confidence 0.6 → 80% floor | **CLOSED** | ใช้ `max(80, round(confidence * 100))` จาก `buildFallbackResponse` |
| `twin_sice_scores` table ไม่มีการเขียน | **CLOSED — ต้องเขียน** | CoreAwakeningService ต้องเขียน `twin_sice_scores` หลัง onboarding |
| Phase 2 Astrovera Edge Function | **CLOSED — ต้องสร้าง** | ต้องสร้าง Edge Function เพื่อเรียก Astrovera เป็น primary |
| Quick Summary mood source | **CLOSED — ใช้ EmotionContext** | ใช้ mood จาก `EmotionContext` บน Landing Page |
| Quick Input DOB ที่ landing section สุดท้าย | **CLOSED — รวมอยู่ใน Phase 1** | Quick Input DOB เพิ่มใน BirthDataInput.tsx ส่วนล่างสุดของ Landing Page |

---

## 11. Open Questions (ทั้งหมด resolved)

1. **SICE integration**: ✅ **ต้องเชื่อม `SICEOrchestrator.orchestrate()` เข้ากับ Full Analysis**
   - คำสั่ง: เชื่อม `personalIntelligence.insights` → `AnalysisResponse` → `FullAnalysis.tsx`
   - ไฟล์ที่ต้องแก้: `Onboarding.tsx:handleFinetuneSubmit`, `FullAnalysis.tsx`, `SICEOrchestrator.ts`

2. **SICE ทำงานจริงหรือ mock?**: ✅ **ใช้งานจริง** — `SICEEngines.test.ts` ยืนยัน 12/12 engines ทำงานจริง

3. **World Routing**: 12 SICE engines รับ `currentWorld` แต่ onboarding ยังไม่ระบุ world ใดใช้
   - `types/sice.ts:13` — `currentWorld?: WorldId;`
   - **Resolution**: ใช้ `currentWorld` จาก `lifecycleStore` หรือ default `'selfprint'`

4. **Quick Summary mood source**: ✅ **ใช้ mood จาก `EmotionContext`** — ยืนยันแล้ว

5. **SICE integration path**: เชื่อม `SICEOrchestrator.orchestrate()` ในขั้นตอน fine-tune submit แล้วส่ง `personalIntelligence.insights` เข้า `AnalysisResponse`

6. **`twin_sice_scores` persistence**: `CoreAwakeningService` ต้องเขียน `twin_sice_scores` หลัง onboarding complete

7. **Phase 2 Edge Function**: สร้าง Edge Function เพื่อเรียก Astrovera API เป็น primary, `buildFallbackResponse()` เป็น fallback เท่านัย

---

## 12. แผนงานดำเนินการ (Implementation-Ready Task List)

> **สถานะ**: พร้อมสำหรับ implementation session ถัดไป — รวมทั้ง Quick Summary, Social Share, Quick Input DOB และปิด gaps ทั้งหมด

### Phase 1: งานเริ่มต้นที่จำเป็น (Must Have)

#### 1.1 Quick Summary + Intro Summary Article + Social Share
- [ ] เพิ่ม `IntroSummary.tsx` component (บทความสรุปสั้น 3 ย่อหน้า จาก AI Prompt 1)
- [ ] เพิ่ม `quick-summary.ts` narrative builder
- [ ] เพิ่ม `intro-summary.ts` narrative builder
- [ ] เพิ่ม `QuickSummary.tsx` component (6-section card + Social Share buttons)
- [ ] เพิ่ม Quick Input DOB ที่ส่วนล่างสุดของ Landing Page
- [ ] เชื่อม `BirthDataInput.onComplete` → คำนวณ summary → set landing state
- [ ] เพิ่ม CTA ใน QuickSummary → `navigate('/onboarding')`
- [ ] เพิ่ม Social Share buttons (Facebook, Line, X)
- [ ] เพิ่ม OG tags (og:title, og:description, og:image)
- [ ] ทดสอบ landing → birth data → Quick Summary + Intro Article + Social Share → onboarding

#### 1.2 เชื่อม SICE → Full Analysis
- [ ] เชื่อม `SICEOrchestrator.orchestrate()` ใน `handleFinetuneSubmit` (`Onboarding.tsx:466-506`)
  - ส่ง `answers, mood, birthDate` ไป Orchestrator
  - รับ `personalIntelligence.insights` กลับมา
  - สร้าง `AnalysisResponse` พร้อม `personalIntelligence` ใส่เข้าไป
- [ ] เพิ่ม `SICEEngineResult` เข้า `AnalysisResponse` (`types/sice.ts`, `astrovera.ts`)
  - เพิ่ม field `siceInsights: string[]`, `siceConfidence: number`
  - อัปเดต `buildFallbackResponse()` ให้สร้าง `siceInsights` จาก Life Path profile
- [ ] ปรับ `FullAnalysis.tsx` props รับ `siceInsights, siceConfidence` พร้อมกับ `profile, prototypeCore, accuracy`
- [ ] ปรับ confidence floor ให้ใช้ `max(80, ...)` จาก `buildFallbackResponse` output

### Phase 2: งานรอง (Should Have)

#### 2.1 `twin_sice_scores` persistence
- [ ] เพิ่มการเขียน `twin_sice_scores` ลง Supabase (`supabase/migrations/028_consolidate_phase_a_schema.sql`)
  - เพิ่ม column `sice_scores: jsonb` ลง `twins` table หรือสร้าง table ใหม่ `twin_sice_scores`
- [ ] เพิ่ม CoreAwakeningService เขียน `twin_sice_scores` (`src/services/core/CoreAwakeningService.ts`)
  - เรียกหลัง `transitionTo('ANALYSIS')` สำเร็จ
  - เก็บ `siceResult.disciplines` และ `personalIntelligence` ลง DB

#### 2.2 Phase 2 Edge Function
- [ ] สร้าง Edge Function `astrovera-edge` (`supabase/functions/astrovera-edge/`)
  - รับ request: `{ dob, time, place, gender, birthTimeZone }`
  - คืน `AnalysisResponse` จาก Astrovera API
  - Fallback ไป `buildFallbackResponse()` ถ้า API ล้มเหลว
- [ ] อัปเดต `astrovera-adapter.ts` ใช้ Edge Function เป็น primary
  - เรียก Edge Function ก่อน
  - ถ้า error ให้ fallback ไป `buildFallbackResponse()`

### Phase 3: งานระยะยาว (Long Term)
- [ ] ปรับปรุง `calculateInitialDisciplines()` ให้รวม SICE output
- [ ] เพิ่ม `SICEEngineResult` ไปเก็บลง `onboarding_checkpoints`
- [ ] ปรับปรุง OG tags ให้รวม SICE insights

> **สรุป**: ทุก gap ถูกปิด — แผนพร้อมสำหรับ implementation session ถัดไป

## 13. ไฟล์อ้างอิงหลัก

### ไฟล์ที่เปลี่ยน/แก้ไข
| ไฟล์ | บทบาท |
|------|-------|
| `src/pages/Onboarding.tsx` | หน้ารวม onboarding 8 ขั้นตอน + state management |
| `src/components/onboarding/FullAnalysis.tsx` | หน้า Full Analysis (Step 7) — Scanning + Reveal animation |
| `src/components/onboarding/SCIEResult.tsx` | แสดง SICE baseline (Step 5) |
| `src/components/onboarding/InitialBlueprint.tsx` | แสดง blueprint เริ่มต้นจาก astrology |
| `src/components/onboarding/FinetuningQuestions.tsx` | 5 คำถามปรับปรุงพัฒนาการ |
| `src/components/onboarding/AICreationSequence.tsx` | อิมเมอเรอีฟเซึ่งสร้าง AI Twin |
| `src/lib/astrology.ts` | Numerology + Western/Chinese Zodiac + Natal Chart + I Ching + Jungian Archetypes |
| `src/lib/astrovera-adapter.ts` | แปลงข้อมูลระหว่าง Selfprint กับ Astrovera Psychology |
| `src/lib/types/astrovera.ts` | TypeScript contracts (AnalysisRequest, AstroveraPsychologyOutput, AnalysisResponse) |
| `src/services/sice/SICEOrchestrator.ts` | ประสานงาน 12 SICE engines (parallel + synthesis) |
| `src/services/sice/SICEBase.ts` | Abstract base class สำหรับทุก engine |
| `src/services/sice/SICEBridge.ts` | เชื่อม SICE output → Supabase persistence (awakening_essence) |
| `src/services/sice/engines/*.ts` | 12 engine implementations |
| `src/types/sice.ts` | SICE types (SICEInput, SICEOutput, OrchestratorResult, PersonalIntelligence) |
| `src/store/lifecycleStore.ts` | Lifecycle state machine (Zustand + Supabase) |
| `src/context/EmotionContext.ts` | Mood state จาก EmotionSelector |

### ไฟล์ใหม่ที่ต้องสร้าง
| ไฟล์ | บทบาท |
|------|-------|
| `src/components/landing/IntroSummary.tsx` | แสดง Intro Summary Article (3-paragraph, 500-600 ตัวอักษร) |
| `src/components/landing/QuickSummary.tsx` | แสดง 6-section card + Social Share buttons |
| `src/lib/intro-summary.ts` | เรียบเรียง data → 3-paragraph Intro Summary |
| `src/lib/quick-summary.ts` | เรียบเรียง data → 6-section Quick Summary |
| `supabase/functions/astrovera-edge/index.ts` | Edge Function เรียก Astrovera API |

### ไฟล์ที่ต้องแก้
| ไฟล์ | การแก้ไข |
|------|-----------|
| `src/components/landing/BirthDataInput.tsx` | เพิ่ม Quick Input DOB + onSummary callback |
| `src/pages/LandingPage.tsx` | รวม IntroSummary + QuickSummary + Social Share + OG tags |
| `src/lib/astrovera-adapter.ts` | ใช้ Edge Function เป็น primary, fallback ไป buildFallbackResponse |
| `src/lib/types/astrovera.ts` | เพิ่ม field `siceInsights`, `siceConfidence` |
| `src/types/sice.ts` | อัปเดต type definitions สำหรับ SICE integration |
| `supabase/migrations/028_consolidate_phase_a_schema.sql` | เพิ่มการเขียน `twin_sice_scores` |
| `src/services/core/CoreAwakeningService.ts` | เพิ่มการเขียน `twin_sice_scores` ลง DB |
| `src/App.tsx` | เพิ่ม OG tags |
| `.env` | เพิ่มตัวแปรสภาพแวดล้อมสำหรับ Edge Function |

---

## สรุป — วิทยาศาสตร์ทั้งหมดที่ Onboarding Full Analysis ใช้

| # | สาขาวิชา | แหล่งที่มาใน code |
|---|----------|------------------|
| 1 | Numerology | `astrology.ts:calculateLifePathNumber()` |
| 2 | Western Astrology | `astrology.ts:calculateWesternZodiac()` |
| 3 | Chinese/Thai Zodiac | `astrology.ts:calculateChineseZodiac()` |
| 4 | Bazi (Eight Mansions) | `astrology.ts:calculateBaziYearElement()` |
| 5 | Natal Chart Astronomy | `astrology.ts:calculateNatalChartInline()` |
| 6 | I Ching Hexagram | `astrology.ts:calculateHexagramInline()` |
| 7 | Jungian Archetypes | `astrology.ts:PROTOTYPE_CORE_MAP` |
| 8 | Behavioral Psychology | `PatternDetector`, `PersonalContextBuilder` |
| 9 | Cognitive Science | `InsightEngine`, `MemoryManagerEngine` |
| 10 | Multi-Agent Systems | `TwinStateEngine`, `ExperienceEngine` |
| 11 | Predictive Analytics | `BehavioralForecastEngine` |
| 12 | Decision Theory | `DecisionIntelligenceEngineAdapter` |
| 13 | Cybernetics | `AIFeedbackLoop` |
| 14 | Gamification | `BadgeEngine` |
| 15 | Environmental Psychology | `EnvironmentEngine` |
| 16 | Temporal Psychology | `FutureSelfEngine` |
| 17 | Affective Computing | `EmotionSelector` |
| 18 | Conversational AI | `NovaConversation` |
| 19 | UX Psychology | `FullAnalysis.tsx` (scanning + reveal) |

---

*เอกสารสร้างขึ้นเพื่อวิเคราะห์วิทยาศาสตร์ที่ใช้ใน SELFPRINT onboarding full analysis*
*แหล่งที่มาหลัก: `src/pages/Onboarding.tsx`, `src/lib/astrology.ts`, `src/services/sice/`, `src/components/onboarding/`*

> **สถานะ**: ✅ **พร้อมสำหรับ implementation session ถัดไป** — รวม Quick Summary + Intro Article + Social Share + Quick Input DOB + ปิด gaps ทั้งหมด (SICE integration, twin_sice_scores persistence, Phase 2 Edge Function, mood from EmotionContext)

---

## 14. Daily Time & Energy Dynamics — Implementation Complete

> **สถานะ**: ✅ **IMPLEMENTED** — ทุก TASK ของ Daily Time & Energy Dynamics ดำเนินการเรียบร้อยแล้ว

### 14.1 สรุปภาพรวม

เพิ่มฟีเจอร์คำนวณและแสดงผล "ดัชนีจังหวะเวลาและคลื่นแสงภายนอกรายวัน (Daily Time & Energy Dynamics)" บน Landing Page ทำหน้าที่เป็น "เบ็ดล่อชิ้นแรก (First Hook)" สำหรับสายมูเตลู/ดูดวงรายวัน โดยใช้ตรรกะเบื้องหลังแบบพระเวท (Vedic / Hora & Panchang) แต่แปลงภาษาเป็นวิทยาศาสตร์ (Chronopsychology, Bio-Tracking Dashboard UI)

### 14.2 รายการงานที่ดำเนินการ

| Task | สถานะ | รายละเอียด | ไฟล์ |
|------|-------|-----------|------|
| TASK 1 | ✅ COMPLETE | เพิ่ม daily* fields ใน InitialDisciplines + ฟังก์ชัน calculateDailyDynamics() | `astrology.ts` |
| TASK 2a | ✅ COMPLETE | สร้าง TodayBioEnvironmentReport.tsx component | `TodayBioEnvironmentReport.tsx` (ใหม่) |
| TASK 2b | ✅ COMPLETE | สร้าง IntroSummary.tsx + QuickSummary.tsx | `IntroSummary.tsx`, `QuickSummary.tsx` (ใหม่) |
| TASK 3 | ✅ COMPLETE | สร้าง intro-summary.ts สำหรับ AI translation prompt + FAQ schema | `intro-summary.ts` (ใหม่) |
| TASK 4 | ✅ COMPLETE | แก้ไข LandingPage.tsx — จัด Layout + Quick Input DOB + CTA | `LandingPage.tsx` |
| TASK 5 | ✅ COMPLETE | ฝัง SEO/AEO/GEO Markup (JSON-LD FAQ + GEO Meta Tags) | `MetaTagManager.tsx`, `LandingPage.tsx` |
| TASK 6 | ✅ COMPLETE | เพิ่ม Retention Loop (daily refresh + PWA CTA) | `TodayBioEnvironmentReport.tsx` |

### 14.3 ไฟล์ที่เกี่ยวข้องทั้งหมด

#### ไฟล์ที่แก้ไข
| ไฟล์ | การแก้ไข |
|------|-----------|
| `src/lib/astrology.ts` | เพิ่มฟิลด์ daily* ใน InitialDisciplines interface + ฟังก์ชัน calculateDailyDynamics() (Vedic Hora/Panchang logic) |
| `src/pages/LandingPage.tsx` | เพิ่ม imports, state สำหรับ birth data + results, layout sections ใหม่ (TodayBioEnvironmentReport → IntroSummary → QuickSummary), BirthDataInput integration |
| `src/components/landing/BirthDataInput.tsx` | ปรับ onComplete callback รับ parameter `dob: string` |
| `src/components/MetaTagManager.tsx` | เพิ่ม geoRegion, geoPlacename, additionalScripts props สำหรับ GEO/AEO tags |

#### ไฟล์ใหม่ที่สร้าง
| ไฟล์ | บทบาท |
|------|-------|
| `src/components/landing/TodayBioEnvironmentReport.tsx` | Bio-Tracking Dashboard UI — แสดงรายงานพลังงานรายวันสไตล์ OurA Ring / Cyberpunk |
| `src/components/landing/IntroSummary.tsx` | บทความสรุปตัวตน 3 ย่อหน้าจาก Life Path profile |
| `src/components/landing/QuickSummary.tsx` | 6-section identity card + Social Share buttons (FB, Line, X) |
| `src/lib/intro-summary.ts` | Chronopsychology narrative generator + FORBIDDEN_WORDS validation + FAQ schema |

### 14.4 Data Flow Architecture

```
LandingPage.tsx (Screen 3 / bottom)
  │
  ├─► [Quick Input DOB] → BirthDataInput.tsx (submit)
  │     │
  │     ├─► updateProfile({ birthDate }) → userStore
  │     │
  │     ├─► calculateInitialDisciplines(dob) [astrology.ts]
  │     │      ├─► [เดิม] Life Path, Western Zodiac, Chinese Zodiac, Bazi, Prototype Core
  │     │      └─► [ใหม่] Daily Dynamics (Hora/Panchang logic)
  │     │             • dailyAcceleratedPhaseStart/End (นาทีทอง)
  │     │             • dailyHighFrictionStart/End (ช่วงแรงต้าน)
  │     │             • dailyCircadianColorNameTh/Hex (คลื่นแสงปรับสมดุล)
  │     │             • dailyAttractionVectorScore (%)
  │     │
  │     ├─► buildFallbackResponse({mood, birthDate, finetuneAnswers:{}})
  │     │      └─► AnalysisResponse (decisionStyle, strengths, insights...)
  │     │
  │     └─► Persist → localStorage (landing_disciplines, landing_analysis)
  │
  └─► [Render Display Sections - เรียงจากบนลงล่าง]
         │
         ├── [1. TodayBioEnvironmentReport] (Bio-Tracking Dashboard — first hook)
         ├── [2. IntroSummary] (3-paragraph identity article)
         ├── [3. QuickSummary] (6-section card + Social Share FB/Line/X)
         └── [4. BirthDataInput] (Quick Input DOB form)
              │
              └─► CTA Button → navigate('/onboarding') → Step Onboarding เดิม
```

### 14.5 Vedic Calculation Logic (Deterministic)

ฟังก์ชัน `calculateDailyDynamics()` ใน `astrology.ts` ใช้ตรรกะต่อไปนี้:

| ปัจจัย | วิธีคำนวณ | ผลลัพธ์ |
|--------|-----------|---------|
| **Accelerated Phase** | Hora lord sequence (based on weekday + dayOfYear + birthDayOfYear + hoursSinceBirth) | เวลาเริ่ม-สิ้นสุด นาทีทอง |
| **High Friction Interval** | Offset ~4-8 hours จาก Accelerated Phase | ช่วงเวลาแรงต้านสูง |
| **Circadian Color** | Tithi (lunar day) = (dayOfYearToday + dayOfYearBirth) % 30 → map to 7VEDIC_COLORS | สีประจำวัน + Hex code |
| **Attraction Vector** | rashiSeed + grahaSeed (deterministic hash จาก birthDate + today) | คะแนนแรงดึงดูด 0-100% |

**สำคัญ**: ตรรกะพระเวทอยู่เบื้องหลังเท่านั้น — ไม่มีคำศัพท์สายมูหลุดออกมาภายนอก ทุกค่าเป็น scientific terminology (Accelerated Phase, High Friction Interval, Circadian Color Alignment, External Attraction Vector)

### 14.6 Retention & Conversion Loop

- **Dynamic Daily Refresh**: ค่าใน TodayBioEnvironmentReport คำนวณใหม่ตามวันที่ปัจจุบัน (`new Date().toDateString()`) — ตรวจสอบทุก 1 ชั่วโมง
- **CTA Button**: "ปลดล็อกตารางเวลาชีวภาพและความถนัดถาวรของคุณ (Full 12-SICE Intelligence Analysis)" → บันทึกข้อมูลเข้า Context + นำทางไปยัง `/onboarding`
- **localStorage Persistence**: disciplines + analysis เก็บใน localStorage เพื่อรองรับ page refresh

### 14.7 SEO / AEO / GEO Markup

- **FAQ Schema (JSON-LD)**: 2 คำถามซ่อนคำค้นหาสายมู ("สีมงคล", "ฤกษ์ดี") → Google/Gemini/ChatGPT อ่านได้
- **GEO Tags**: `<meta name="geo.region" content="TH-22">` + `<meta name="geo.placename" content="Chanthaburi">`
- **Additional Scripts**: FAQ JSON-LD inject ผ่าน `MetaTagManager.additionalScripts` prop

### 14.8 Forbidden Words Validation

`intro-summary.ts` มีรายการคำต้องห้าม (FORBIDDEN_WORDS_TH / FORBIDDEN_WORDS_EN) และฟังก์ชัน `containsForbiddenWords()` สำหรับ validate ว่า output ไม่ใช้คำศัพท์สายมู

---

*เอกสารอัปเดตล่าสุด: Daily Time & Energy Dynamics — All Tasks Implemented*
