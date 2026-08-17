# 📋 Handoff เอกสาร: การรวม Astrovera → Selfprint
## ส่งต่อให้ทีม AI Dev

**วันที่:** 9 สิงหาคม 2026  
**เตรียมโดย:** Audit & Planning  
**สถานะ:** พร้อมเริ่มการพัฒนา  
**ลำดับความสำคัญ:** 🔴 HIGH

---

## 🎯 วัตถุประสงค์

รวมระบบฉลาด Astrovera (Backend) เข้า Selfprint (Frontend React) โดยไม่เปลี่ยนแปลง UI ให้ผู้ใช้เห็น

**ผลลัพธ์:** ความลึกของการวิเคราะห์ดีขึ้น **3-5 เท่า** ด้วย UI เดียวกัน

---

## 📊 สถานะปัจจุบัน

| ส่วน | สถานะ | หมายเหตุ |
|------|--------|---------|
| **Selfprint Phase 4** | ✅ เสร็จ | Onboarding MEMO V4 live + กำลังแก้ git |
| **Selfprint Phase 5** | 🔲 ยังไม่เริ่ม | Dashboard + Journal (รอแผน) |
| **Astrovera** | ✅ ตรวจสอบแล้ว | 10 โมดูล 5 ตัวแทน พร้อมใช้ |
| **Audit Documents** | ✅ เสร็จ 9 ฉบับ | ภาษาไทยทั้งหมด บันทึก D:\selfprint-v3-react\ |

---

## 🔥 งานค้างที่ต้องทำ (ลำดับความสำคัญ)

### **BLOCK 1: ฐาน (Phase 1 → 3 วัน)**
ขั้นตอนนี้ **ต้องทำขั้นแรก** ไม่มีผู้ใช้ interface เปลี่ยน

#### ✅ STEP 1️⃣ สร้าง TypeScript Types
**ไฟล์:** `src/lib/types/astrovera.ts`

```typescript
// Input Types
interface AnalysisRequest {
  mood: string
  birthDate: string
  finetuningAnswers: Record<string, string>
  userContext?: any
}

interface PersonProfile {
  id: string
  lifePathNumber?: number
  email?: string
}

// Output Types
interface AnalysisResponse {
  decisionStyle: string
  strengths: string[]
  insights: string[]
  opportunities: string[]
  blindSpots: string[]
  confidence: number
  sources: string[]
}

interface PersonalityInsight {
  archetype: string
  phase: string
  description: string
}

// Error Types
interface AnalysisError {
  code: string
  message: string
  fallback: AnalysisResponse
}
```

**ผู้รับผิดชอบ:** Engineer 1  
**ระยะเวลา:** 1 วัน  
**Acceptance:** TypeScript compile ✅ + Unit test 100% ✅

---

#### ✅ STEP 2️⃣ สร้าง Adapter Layer
**ไฟล์:** `src/lib/astrovera-adapter.ts`

```typescript
// Transforms Selfprint → Astrovera format
export function buildAnalysisRequest(
  mood: string,
  finetuneAnswers: any,
  birthDate: string,
  context?: any
): AnalysisRequest

// Transforms Astrovera → Selfprint format
export function transformAnalysisResponse(
  astroResponse: any
): AnalysisResponse

// Fallback when Astrovera is down
export function buildFallbackResponse(
  lifePathNumber: number
): AnalysisResponse

// Error handling
export function handleAnalysisError(error: any): AnalysisError
```

**ผู้รับผิดชอบ:** Engineer 1  
**ระยะเวลา:** 1 วัน  
**Acceptance:** 100% unit test coverage ✅ ทุกเคส edge case

---

#### ✅ STEP 3️⃣ สร้าง Edge Function Template
**ไฟล์:** `supabase/functions/intelligence/index.ts`

```typescript
// Edge Function Template (ไม่เรียก Astrovera จริงตอนนี้)
export async function handler(req: Request) {
  const { analysisType, payload } = await req.json()
  
  // โครงสร้าง:
  // 1. Validate input
  // 2. Load Astrovera API key (env)
  // 3. Call Astrovera Brain Gateway
  // 4. Transform response via adapter
  // 5. Save to Supabase history
  // 6. Return to Selfprint
  
  // Fallback if error
  if (error) return fallbackResponse()
}
```

**ผู้รับผิดชอบ:** Engineer 1  
**ระยะเวลา:** 1 วัน  
**Acceptance:** Deploy template ✅ ไม่ error

---

### **BLOCK 2: Psychology Integration (Phase 2 → 4 วัน)**
เริ่มจริงเรียก Astrovera โมดูล psychology

#### ✅ STEP 4️⃣ ออกแบบ API Contract
**ตรวจสอบไฟล์:** `D:\astrovera-v2\brain\core\gateway.js`

**ต้องส่งต่อให้ Astrovera Team:**
- Input format สำหรับ psychology module?
- Output format ของ response?
- Error handling?
- Rate limit?

**เอกสาร:** `docs/ASTROVERA_API_CONTRACT.md` (ร่าง)

**ผู้รับผิดชอบ:** Engineer 1 + Astrovera Team  
**ระยะเวลา:** 1 วัน (การโต้ตอบ)  
**Acceptance:** API contract document ✅

---

#### ✅ STEP 5️⃣ นำ Astrovera Psychology
**ไฟล์:** `supabase/functions/intelligence/analyze-psychology.ts`

```typescript
export async function analyzePsychology(
  finetuneAnswers: any,
  mood: string,
  birthDate: string
) {
  // 1. Transform via adapter → Astrovera format
  const astroRequest = buildPsychologyRequest(...)
  
  // 2. Call Astrovera Brain Gateway
  const astroResponse = await callAstrovera(astroRequest)
  
  // 3. Transform back → Selfprint format
  const response = transformAnalysisResponse(astroResponse)
  
  // 4. Store in history table
  await saveToDB(response)
  
  // 5. Return
  return response
}
```

**ผู้รับผิดชอบ:** Engineer 1  
**ระยะเวลา:** 2 วัน  
**Acceptance:** ทดสอบจริงกับ Astrovera ✅ + Fallback ✅

---

#### ✅ STEP 6️⃣ เชื่อมต่อ Selfprint Frontend
**ไฟล์:** `src/pages/Onboarding.tsx` (แก้เพียง 1 ที่)

```typescript
// เปลี่ยนจาก:
const result = await callNova(finetuneAnswers)

// เป็น:
const result = await fetch('/functions/v1/intelligence', {
  method: 'POST',
  body: JSON.stringify({
    analysisType: 'psychology',
    payload: { finetuneAnswers, mood, birthDate }
  })
}).then(r => r.json())

// Fallback ยังเหมือนเดิม
if (error) return buildFallbackResponse(lifePathNumber)
```

**ผู้รับผิดชอบ:** Engineer 1  
**ระยะเวลา:** 1 วัน  
**Acceptance:** Blueprint แสดงข้อมูลจาก Astrovera ✅ + Fallback ✅

---

### **BLOCK 3: ตารางฐานข้อมูล (Parallel → 2 วัน)**
สามารถทำพร้อมกับ Block 2

#### ✅ STEP 7️⃣ สร้างตารางประวัติ Supabase
**SQL Script:** `supabase/migrations/20260809_add_astrovera_tables.sql`

```sql
-- 1. analysis_history (เก็บผลการวิเคราะห์ทั้งหมด)
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  analysis_type TEXT NOT NULL,
  data JSONB NOT NULL,
  sources TEXT[] NOT NULL,
  confidence FLOAT DEFAULT 0.85,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. pattern_insights (เก็บรูปแบบที่ตรวจพบ)
CREATE TABLE pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pattern TEXT NOT NULL,
  frequency INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. session_logs (เก็บการติดตาม)
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  status TEXT CHECK (status IN ('success', 'fallback', 'error')),
  created_at TIMESTAMP DEFAULT now()
);
```

**ผู้รับผิดชอบ:** Engineer 2 (หรือ DBA)  
**ระยะเวลา:** 1 วัน  
**Acceptance:** Migration run ✅ ตารางสร้างสำเร็จ ✅

---

#### ✅ STEP 8️⃣ สร้าง RLS Policies
**ไฟล์:** `supabase/policies/astrovera_tables.sql`

```sql
-- Users read only their own data
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own analysis history"
  ON analysis_history FOR SELECT
  USING (auth.uid() = user_id);

-- Similar for pattern_insights + session_logs
```

**ผู้รับผิดชอบ:** Engineer 2  
**ระยะเวลา:** 0.5 วัน  
**Acceptance:** RLS policy test ✅

---

### **BLOCK 4: การทดสอบและการปล่อย (Phase 2 → 5 วัน)**

#### ✅ STEP 9️⃣ Unit Tests
**ไฟล์:** `src/lib/__tests__/astrovera-adapter.test.ts`

```typescript
describe('Astrovera Adapter', () => {
  test('transforms Selfprint → Astrovera correctly', () => { ... })
  test('transforms Astrovera → Selfprint correctly', () => { ... })
  test('handles Astrovera errors gracefully', () => { ... })
  test('fallback response valid when error', () => { ... })
})
```

**Coverage:** 100% ✅

**ผู้รับผิดชอบ:** Engineer 1  
**ระยะเวลา:** 1 วัน

---

#### ✅ STEP 🔟 Integration Tests
**ไฟล์:** `src/__tests__/onboarding-astrovera.integration.test.ts`

```typescript
describe('Onboarding with Astrovera', () => {
  test('fetches Psychology analysis', () => { ... })
  test('saves to history', () => { ... })
  test('fallback works', () => { ... })
  test('latency < 2s', () => { ... })
})
```

**ผู้รับผิดชอบ:** Engineer 1  
**ระยะเวลา:** 2 วัน

---

#### ✅ STEP 1️⃣1️⃣ Staging Deploy & Monitoring
**Checklist:**
- [ ] Deploy Edge Function ไป Staging
- [ ] Monitor latency (target < 2s)
- [ ] Test fallback (disable Astrovera)
- [ ] Check error logs
- [ ] Load test (100 concurrent users)

**ผู้รับผิดชอบ:** Engineer 1 + DevOps  
**ระยะเวลา:** 1 วัน

---

#### ✅ STEP 1️⃣2️⃣ Production Release (Staged)
- [ ] Day 1: 10% users
- [ ] Day 2: 50% users (if 10% good)
- [ ] Day 3: 100% users

**ผู้รับผิดชอบ:** Engineer 1 + DevOps  
**ระยะเวลา:** 3 วัน (monitoring)

---

### **BLOCK 5: Enhanced Features (Phase 3+ → 2-4 สัปดาห์ ต่อไป)**
After Psychology works stable

#### ✅ STEP 1️⃣3️⃣ Numerology Enhancement
- Dual-domain synthesis (Psychology + Numerology)
- Confidence scoring
- **Effort:** 2 วัน

#### ✅ STEP 1️⃣4️⃣ Pattern Detection
- Journal history analysis
- Behavioral patterns
- **Effort:** 5 วัน

#### ✅ STEP 1️⃣5️⃣ AI Agents (Coach, Insight)
- Decision support
- Coaching guidance
- **Effort:** 4 วัน

#### ✅ STEP 1️⃣6️⃣ Optional: Vedic/Bazi/Thai Astrology
- Regional customization
- Multi-domain perspectives
- **Effort:** 3-5 วัน ต่อ module

---

## 📅 ไทมไลน์ สรุป

```
┌─ วันที่ 1-3 (Week 1)
│  ✅ BLOCK 1: ฐาน (Types + Adapter + Edge Function)
│  ✅ BLOCK 3: ตารางฐานข้อมูล
│
├─ วันที่ 4-7 (Week 2)
│  ✅ BLOCK 2: Psychology Integration
│  ✅ BLOCK 4: Tests
│
├─ วันที่ 8-10 (Week 2-3)
│  ✅ Staging + Production Release (Staged)
│
├─ วันที่ 11-14 (Week 3)
│  ✅ Monitoring + Stabilization
│
└─ วันที่ 15-28 (Week 4+)
   ✅ BLOCK 5: Enhanced Features (Numerology, Patterns, Agents)
   ✅ Phase 5: Dashboard/Journal ใช้ Astrovera API
```

---

## 🎯 สิ่งที่ต้องส่งต่อให้ Astrovera Team

**ถาม:**
1. ✉️ API Contract - input/output format ของ Psychology module?
2. ✉️ Rate limits - requests per minute?
3. ✉️ Error handling - error codes ที่ต้องรู้?
4. ✉️ Authentication - API key management?
5. ✉️ Fallback - behavior เมื่อ Psychology module down?

**ส่งให้:** `docs/ASTROVERA_INTEGRATION_CHECKLIST.md`

---

## 🚀 Ready-to-Start Checklist

**ก่อนเริ่ม:**
- [ ] Git cleanup เสร็จ
- [ ] Branch feature/astrovera-adapter สร้างแล้ว
- [ ] เอกสารตรวจสอบทั้ง 9 ฉบับ อ่านแล้ว
- [ ] Astrovera Team สำเร็จ API contract
- [ ] .env.local มี ASTROVERA_API_KEY

**Go/No-Go:**
- ✅ GO: เริ่ม STEP 1 ทันที

---

## 📚 เอกสารอ้างอิง

```
D:\selfprint-v3-react\
├── สรุปผู้บริหาร.md
├── ตรวจสอบที่ 1 การเปรียบเทียบสถาปัตยกรรม.md
├── ตรวจสอบที่ 2 สินค้าคงคลัง Astrovera.md
├── ตรวจสอบที่ 3 สินค้าคงคลัง Selfprint.md
├── ตรวจสอบที่ 4 เมทริกซ์การวิเคราะห์ช่องว่าง.md
├── ตรวจสอบที่ 5 แผนการอพยพ.md
├── ตรวจสอบที่ 6 สถาปัตยกรรมเป้าหมาย.md
├── ตรวจสอบที่ 7 แผนการอพยพข้อมูล.md
├── ตรวจสอบที่ 8 สถาปัตยกรรม AI Context.md
└── 📋_HANDOFF_TO_TEAM_AI_DEV.md (ไฟล์นี้)
```

---

## 👥 ผู้รับผิดชอบ

| บทบาท | ชื่อ | งาน |
|------|------|------|
| **Lead Engineer** | ? | STEP 1-6, 9-12 |
| **Backend Engineer** | ? | STEP 4-5, 7-8 |
| **QA** | ? | STEP 9-10, 11-12 |
| **DevOps** | ? | STEP 11-12 |

---

## 💬 Contact & Questions

**If blocked:**
- ❌ Astrovera API? → Contact Astrovera Team
- ❌ TypeScript error? → Check docs/ASTROVERA_API_CONTRACT.md
- ❌ Deploy issue? → Contact DevOps

**Status updates:** Daily standup or GitHub PR

---

**เอกสาร Ready** ✅  
**เริ่มได้เลยตอนนี้** 🚀

Good luck! 💪
