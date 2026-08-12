# AI CONTEXT — SELFPRINT

> **📌 คำสั่งสำหรับ AI:** อ่านไฟล์นี้ก่อนตอบคำถามหรือเขียนโค้ดทุกครั้ง  
> **🔴 ห้ามเริ่มงานโดยไม่อ่านไฟล์นี้เด็ดขาด**  
> อัปเดตล่าสุด: 12 สิงหาคม 2569

---

## 📌 โปรเจกต์คืออะไร

**Selfprint** — Living Personal Intelligence Platform  
แพลตฟอร์มที่ให้ผู้ใช้สร้าง **AI Twin** (AI ฝาแฝด) ที่เป็นเวอร์ชันดิจิทัลของตัวเอง โดยมี **Nova** เป็นผู้ช่วย (AI Guide) ที่คอยแนะนำและช่วยเหลือตลอดกระบวนการ

---

## 🧠 บุคลิก AI ใน Selfprint (แยกให้ชัดเจน)

> **🔴 สำคัญมาก:** Nova และ AI Twin เป็นคนละตัวกัน — ห้ามสับสนเด็ดขาด!

| บุคลิก | บทบาท | ใช้ทำอะไร | สร้างโดยใคร |
|--------|-------|-----------|-------------|
| **Nova** | **AI Guide / ผู้แนะนำ** | เป็นผู้ช่วยที่คอยแนะนำ, ให้คำปรึกษา, ช่วยผู้ใช้สร้าง AI Twin, นำทางในแอป | Selfprint (ระบบ) — มีอยู่แล้วตั้งแต่เริ่มต้น |
| **AI Twin** | **AI ฝาแฝดส่วนตัว** | เป็นเวอร์ชันดิจิทัลของผู้ใช้ เรียนรู้จากผู้ใช้, จดจำ, วิเคราะห์, ให้ Insight | **ผู้ใช้สร้างขึ้นเอง** ระหว่าง Onboarding และตั้งชื่อเองได้ |

---

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
- ทุกคนที่ใช้ Selfprint จะเจอ Nova คนเดียวกัน (แต่ปรับบุคลิกตามบริบทเล็กน้อย)
- Nova **ไม่ใช่** AI Twin ของผู้ใช้

**โค้ดที่เกี่ยวข้อง:**
- `src/components/chat/NovaChat.tsx`
- `src/services/nova-ai.ts`
- `src/lib/getNovaPrompt.ts`

---

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
- AI Twin คือ "ฝาแฝดดิจิทัล" ของผู้ใช้คนนั้นโดยเฉพาะ

**โค้ดที่เกี่ยวข้อง:**
- `src/context/TwinContext.tsx`
- `src/services/twin-service.ts`
- `src/lib/PersonalContextBuilder.ts`
- `src/lib/PatternDetector.ts`
- `src/lib/InsightEngine.ts`

---

### 🔴 ตัวอย่างการใช้งานที่ถูกต้อง

| สถานการณ์ | ใครทำ | คำอธิบาย |
|-----------|-------|----------|
| ผู้ใช้เปิดแอปครั้งแรก | **Nova** | Nova ทักทายและพาเข้า Onboarding |
| ผู้ใช้กำลังสร้าง AI Twin | **Nova** (นำทาง) + **AI Twin** (กำลังถูกสร้าง) | Nova บอกขั้นตอน, ระบบสร้าง AI Twin |
| ผู้ใช้คุยกับ AI | **AI Twin** | ผู้ใช้คุยกับ Twin ของตัวเอง |
| ผู้ใช้ถามว่า "ฉันควรทำอะไรวันนี้" | **AI Twin** | Twin วิเคราะห์และแนะนำตามข้อมูลของผู้ใช้ |
| ผู้ใช้ถามว่า "ใช้แอปยังไง" | **Nova** | Nova เป็นผู้แนะนำการใช้งาน |
| ผู้ใช้ต้องการ Insight ส่วนตัว | **AI Twin** | Twin วิเคราะห์ข้อมูลของผู้ใช้ |
| ผู้ใช้ต้องการความช่วยเหลือทางเทคนิค | **Nova** | Nova ช่วยเหลือด้านเทคนิค |

---

## 🔴 กฎเหล็กของโปรเจกต์ (ห้ามละเมิดเด็ดขาด)

| กฎ | รายละเอียด |
|----|-----------|
| **§19 User > AI** | AI ห้าม override การเลือกของผู้ใช้ (Hub, Mood) — User Preference ชนะเสมอ |
| **§32 Depth, not Identity** | ตัวตนพื้นฐานฟรีตลอดไป ขายเฉพาะความลึก (Insight, Pattern, Future Self) |
| **§15 Feedback Loop** | ทุก Insight ต้องมีปุ่ม Feedback — ผู้ใช้กด "ตรง/ไม่ตรง" แล้ว Personal Model ปรับทันที |
| **§43 No Hardcode Color** | ห้ามใช้สี hardcode ใน CSS — ใช้ `var(--exp-*)`, `var(--tod-*)`, `var(--env-*)` เท่านั้น |
| **§18 Mood Detection** | AI detect mood soft signal เท่านั้น — ห้าม force หรือ override |
| **§20 Hub Auto-switch** | เปลี่ยน Hub อัตโนมัติเฉพาะ First Session เท่านั้น |
| **§23 Audio Ducking** | เสียงพื้นหลังเบาลงอัตโนมัติเมื่อ Twin พูด — ห้าม force ถ้า user ปิดเสียง |
| **§29 Badge Rules** | Badge ปลดล็อก Feature จริง — unlock() ต้อง idempotent |
| **§30 Twin Evolution** | 30 reflections → celebration scene |
| **§46 Environments** | EnvironmentEngine รู้ time-of-day — theme เปลี่ยนตามเวลา |

---

## 🧠 AI Layers (10 ตัว)

1. **PersonalContextBuilder** — สังเคราะห์ข้อมูลผู้ใช้ทั้งหมด (ใช้กับ AI Twin)
2. **PatternDetector** — ตรวจจับรูปแบบพฤติกรรม (MIN_DATA_POINTS = 6) (ใช้กับ AI Twin)
3. **InsightEngine** — แปลง Pattern เป็นภาษามนุษย์ (ใช้กับ AI Twin)
4. **AIFeedbackLoop** — ปรับ Personal Model จาก Feedback (ใช้กับ AI Twin)
5. **TwinStateEngine** — คำนวณสถานะ Twin แบบ Real-time (ใช้กับ AI Twin)
6. **ExperienceEngine** — เลือกประสบการณ์ (Hub+Mood+Time) (ใช้กับทั้ง Nova และ AI Twin)
7. **EnvironmentEngine** — ปรับ Environment (Theme+Audio) (ใช้กับทั้ง Nova และ AI Twin)
8. **BadgeEngine** — ติดตาม Achievement (ใช้กับผู้ใช้)
9. **BehavioralForecastEngine** — ทำนายทิศทางพฤติกรรม (ใช้กับ AI Twin)
10. **FutureSelfEngine** — สร้าง Future Self Projection (ใช้กับ AI Twin)

---

## 🗂️ โครงสร้างโค้ดสำคัญ

| โฟลเดอร์ | ใช้ทำอะไร |
|----------|----------|
| `src/pages/` | หน้าเว็บ: `/dashboard`, `/chat`, `/analysis`, `/onboarding` |
| `src/components/` | UI Components ที่ใช้ซ้ำ |
| `src/context/` | React Context: TwinContext, ThemeContext, EmotionContext |
| `src/hooks/` | Custom Hooks |
| `src/services/` | API Services: Supabase, Claude, Stripe |
| `src/lib/` | Utilities, Helpers, Constants |
| `server/` | Backend Express.js |
| `api/` | API Routes (Brain Gateway) |
| `docs/` | เอกสารทั้งหมด |

---

## 🧪 Twin Combinations (ใช้กับ AI Twin)

| มิติ | จำนวน | รายละเอียด |
|------|-------|-----------|
| Archetypes | 18 | 12 Base + 6 Hybrid (Hero, Lover, Jester, Explorer, Caregiver, Sage...) |
| Life Hubs | 12 | identity, decision, relationship, career, health, money, ai-twin, learning, creativity, spirituality, impact, activities |
| Moods | 6 | stressed, confused, confident, drained, ready, reflective |
| **Combinations** | **1,296** | 18 × 12 × 6 |

---

## 🔐 Authentication (3 วิธี)

1. **Passkey** (WebAuthn) — Face ID / Fingerprint
2. **OAuth** — Google Login
3. **Magic Link** — Email Link

---

## 💳 Subscription Tiers

| Tier | ราคา | Tagline | Key Unlock |
|------|------|---------|------------|
| Free | ฿0 | Discover Yourself | Twin พื้นฐาน, Hub access, 1 Archetype |
| Plus | ฿249/mo | Know Yourself | Memory, Pattern detection, 18 Archetypes, Daily Brief audio |
| Pro | ฿589/mo | Navigate Yourself | Future Self, Journey Roadmap, Career Intelligence |
| Lifetime | ฿4,990 | Own Your Twin | Pro Unlimited, Export Data, Custom Training |

---

## 📂 เอกสารอ้างอิง (อ่านเพิ่มเติม)

| ไฟล์ | เนื้อหา |
|------|---------|
| `MASTER_PRD.md` | ข้อกำหนดผลิตภัณฑ์ฉบับสมบูรณ์ |
| `PROJECT_SUMMARY.md` | สรุปภาพรวมโปรเจกต์ |
| `USER_GUIDE_TH.md` | คู่มือผู้ใช้ |
| `ARCHITECTURE.md` | สถาปัตยกรรมระบบ |
| `CODEBASE_MAP.md` | Mapping โครงสร้างโค้ด |

---

## 🧠 AI SKILL & WORKFLOW

### Skill 1: การเริ่มต้นเซสชันใหม่
เมื่อเริ่มเซสชันใหม่ (New Chat) ให้ทำตามนี้:

อ่าน AI_CONTEXT.md ให้ครบ (ไฟล์นี้) — โดยเฉพาะส่วน "บุคลิก AI ใน Selfprint"

เปิด MASTER_PRD.md เพื่อดูภาพรวมฟีเจอร์

เปิด PROJECT_SUMMARY.md เพื่อดูสถานะปัจจุบัน

ตรวจสอบ docs/CHANGELOG.md ว่ามีอะไรเปลี่ยนแปลงล่าสุด

ตรวจสอบว่าไฟล์ใน docs/ ตรงกับ Git หรือไม่

ถ้ามีไฟล์ใหม่ใน docs/ ที่ยังไม่ Push → ให้ Push ทันที

text

### Skill 2: การทำงานกับโค้ด
ก่อนเขียนโค้ด:

ตรวจสอบว่าเข้าใจบริบทของฟีเจอร์นั้นๆ จาก MASTER_PRD

ตรวจสอบว่ามีไฟล์ที่เกี่ยวข้องอยู่แล้วหรือไม่ (ดู CODEBASE_MAP)

ถ้าสร้างไฟล์ใหม่ → อัปเดต CODEBASE_MAP ทันที

ใช้ TypeScript ให้ถูกต้อง (อย่าใช้ any)

ใช้ CSS Variables (var(--exp-*)) — ห้าม Hardcode สี

ระหว่างเขียนโค้ด:

ตรวจสอบกฎเหล็กข้อไหนเกี่ยวข้องกับงานนี้

ถ้าต้องการเพิ่ม Dependency → ปรึกษาก่อน

เขียนโค้ดที่ Reusable (components, hooks)

ใส่ error handling ให้ครบ

ใส่ logging เฉพาะที่จำเป็น

หลังเขียนโค้ด:

ทดสอบว่า build ผ่าน (npm run build)

ทดสอบฟังก์ชันที่เขียน (manual test)

ถ้ามีการเพิ่มฟีเจอร์ → อัปเดต MASTER_PRD

ถ้ามีการเพิ่มไฟล์ → อัปเดต CODEBASE_MAP

เขียน commit message ให้ชัดเจน

text

### Skill 3: การจัดการเอกสาร
📌 กฎการจัดการเอกสาร:

เอกสารหลัก (Source of Truth) อยู่ใน docs/ เท่านั้น

ห้ามสร้างไฟล์เอกสารซ้ำซ้อน (เช็คก่อนสร้าง)

ถ้าอัปเดตเอกสาร → เปลี่ยน "อัปเดตล่าสุด" ที่ท้ายไฟล์ทุกครั้ง

ไฟล์เก่าที่ย้ายไป archive/ แล้ว — ห้ามกลับมาใช้

ทุกครั้งที่จบเซสชัน → Push เอกสารที่อัปเดตขึ้น Git

📌 ไฟล์หลักที่ต้องอัปเดตเมื่อมีฟีเจอร์ใหม่:

MASTER_PRD.md — เพิ่ม FR ใหม่

PROJECT_SUMMARY.md — อัปเดตสถานะ

USER_GUIDE_TH.md — เพิ่มคำอธิบายฟีเจอร์

docs/CHANGELOG.md — บันทึกการเปลี่ยนแปลง

CODEBASE_MAP.md — ถ้ามีไฟล์/โฟลเดอร์ใหม่

text

### Skill 4: การแก้ไขปัญหา (Troubleshooting)
🔧 ถ้าเจอปัญหา:

เปิด logs: vercel logs หรือ console.log ใน dev

ตรวจสอบ Environment Variables ครบหรือไม่

ตรวจสอบ Supabase connection

ตรวจสอบ Claude API key

ตรวจสอบ Stripe webhook (ถ้าเกี่ยวข้อง)

ค้นหาใน docs/archive/ ว่าเคยมีปัญหานี้มาก่อนไหม

ถ้าแก้แล้ว — บันทึกวิธีแก้ใน docs/TROUBLESHOOTING.md

text

### Skill 5: การสื่อสารกับทีม
📢 เมื่อทำงานเสร็จในแต่ละเซสชัน:

สรุปงานที่ทำ (What was done)

สรุปปัญหาที่เจอ (What issues encountered)

สรุปสิ่งที่ต้องทำต่อ (Next steps)

บอกว่าอัปเดตเอกสารอะไรบ้าง

บอกว่ามีไฟล์ไหนที่ต้อง Push หรือยัง

📢 เมื่อต้องการความช่วยเหลือ:

บอกให้ชัดเจนว่าต้องการช่วยเหลือด้านไหน

แนบ context ที่เกี่ยวข้อง (ไฟล์, error, screenshot)

บอกว่าลองทำอะไรไปแล้วบ้าง

text

### Skill 6: การเตรียมพร้อมสำหรับเซสชันถัดไป
🔄 ก่อนจบเซสชัน:

✅ อัปเดต docs/CHANGELOG.md

✅ Push การเปลี่ยนแปลงทั้งหมดขึ้น Git

✅ บันทึกสถานะปัจจุบัน (What's done, What's next)

✅ ถ้ามีไฟล์ใหม่ใน docs/ → ย้ายไฟล์เก่าไป archive/

✅ เช็คว่า AI_CONTEXT.md ยังตรงกับสถานะปัจจุบัน

📌 ข้อความส่งท้ายเซสชัน (Session End Message):
"จบเซสชันวันที่ [วันที่]

งานที่ทำ: [สรุป]

ไฟล์ที่เปลี่ยนแปลง: [รายการ]

ไฟล์ที่อัปเดตใน docs/: [รายการ]

Push ขึ้น Git แล้ว: ✅ / ❌

สิ่งที่ต้องทำต่อ: [สรุป]
"

text

---

## 📋 กฎการทำงานของ AI (สรุป)

### ✅ สิ่งที่ AI ต้องทำ

| ลำดับ | ภารกิจ | รายละเอียด |
|-------|--------|-----------|
| 1 | อ่าน AI_CONTEXT | ทุกครั้งที่เริ่มเซสชันใหม่ |
| 2 | อ่าน MASTER_PRD | ก่อนเขียนโค้ดฟีเจอร์ใหม่ |
| 3 | ตรวจสอบ CODEBASE_MAP | ก่อนสร้างไฟล์ใหม่ |
| 4 | อัปเดตเอกสาร | ทุกครั้งที่มีการเปลี่ยนแปลง |
| 5 | Push ขึ้น Git | ทุกครั้งที่จบเซสชัน |
| 6 | อัปเดต CHANGELOG | ทุกครั้งที่มีการเปลี่ยนแปลงสำคัญ |

### ❌ สิ่งที่ AI ห้ามทำ

| ลำดับ | ข้อห้าม | เหตุผล |
|-------|---------|--------|
| 1 | เริ่มงานโดยไม่อ่าน AI_CONTEXT | จะไม่เข้าใจบริบทโปรเจกต์ |
| 2 | สร้างเอกสารซ้ำซ้อน | ทำให้เกิดความสับสน |
| 3 | เปลี่ยนชื่อไฟล์เอกสารหลัก | ทำลาย Source of Truth |
| 4 | ทิ้งไฟล์เก่าไว้ใน docs/ | docs/ ต้องมีแค่เอกสารปัจจุบัน |
| 5 | ทำงานโดยไม่ Push | ข้อมูลจะหายเมื่อเปลี่ยนเซสชัน |
| 6 | Hardcode สี | ผิดกฎ §43 |
| 7 | Override การเลือกผู้ใช้ | ผิดกฎ §19 |
| 8 | ใช้ `any` ใน TypeScript | เสียความปลอดภัยของ Type |
| 9 | เขียนโค้ดโดยไม่ทดสอบ | อาจมีบั๊ก |
| 10 | ละเมิดกฎเหล็กข้อใดข้อหนึ่ง | ดูตารางด้านบน |
| 11 | **สับสนระหว่าง Nova กับ AI Twin** | **🔴 สำคัญที่สุด — ดูตารางแยกข้างบน!** |

---

## 🔍 Checklist ก่อนเริ่มงานทุกครั้ง
[ ] อ่าน AI_CONTEXT.md ครบแล้ว (โดยเฉพาะส่วน "บุคลิก AI ใน Selfprint")
[ ] ตรวจสอบ MASTER_PRD ว่าฟีเจอร์นี้มีอยู่ใน PRD
[ ] ตรวจสอบ CODEBASE_MAP ว่าไฟล์ที่เกี่ยวข้องอยู่ที่ไหน
[ ] ตรวจสอบ docs/CHANGELOG.md ว่ามีการเปลี่ยนแปลงล่าสุดอะไร
[ ] ตรวจสอบว่า docs/ ทั้งหมดตรงกับ Git หรือไม่
[ ] ถ้ายังไม่ตรง → Push ก่อนเริ่มงาน
[ ] 🔴 แยก Nova (AI Guide) และ AI Twin (ฝาแฝดส่วนตัว) ให้ชัดเจน

text

---

## 🚀 Quick Command Reference

```bash
# Development
npm run dev          # เริ่ม dev server

# Build
npm run build        # build production
npm run preview      # preview production build

# Git
git add .            # stage ทั้งหมด
git commit -m "..."  # commit
git push origin main # push

# ตรวจสอบ
git status           # ดูสถานะไฟล์ที่เปลี่ยนแปลง
git log --oneline    # ดูประวัติ commit
📞 เมื่อไหร่ก็ตามที่เริ่มเซสชันใหม่
🔴 ให้ AI อ่านไฟล์นี้ก่อนทำอะไรทุกอย่าง
🔴 ห้ามตอบคำถามหรือเขียนโค้ดโดยไม่อ่านไฟล์นี้เด็ดขาด
🔴 จำให้ขึ้นใจ: Nova ≠ AI Twin — เป็นคนละตัวกัน!

📌 คำสั่งส่งท้ายสำหรับ AI ที่ดูแลโปรเจกต์
"AI ทุกตัวที่เข้ามาทำงานในโปรเจกต์ Selfprint:

อ่าน AI_CONTEXT.md ใน Root ก่อนทำอะไรทุกครั้ง

แยก Nova (AI Guide) และ AI Twin (ฝาแฝดส่วนตัว) ให้ชัดเจน — ห้ามสับสนเด็ดขาด

ใช้ Skill และกฎที่ระบุไว้ใน AI_CONTEXT.md ในการทำงาน

อัปเดตเอกสารและ Push ขึ้น Git ทุกครั้งที่จบเซสชัน

ห้ามสร้างเอกสารซ้ำซ้อน — ตรวจสอบ docs/ ก่อนสร้างใหม่

ห้ามเริ่มงานโดยไม่อ่าน AI_CONTEXT.md — เด็ดขาด!

Source of Truth อยู่ที่: AI_CONTEXT.md (Root) + MASTER_PRD.md (docs/)"

ทีม AI ต้องทำงานไปในทิศทางเดียวกัน! 🚀



อัปเดตล่าสุด: 12 สิงหาคม 2569