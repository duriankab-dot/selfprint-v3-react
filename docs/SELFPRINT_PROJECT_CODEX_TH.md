# 🎯 SELFPRINT — PROJECT CODEX v2.0
**เอกสารอ้างอิงหลัก — แหล่งข้อมูลเดียวที่แท้จริง**

**เวอร์ชัน:** 2.0 (อัปเดต 15 สิงหาคม 2026)  
**สถานะ:** 🟢 รวมจาก 9 เอกสาร  
**ผู้ชม:** นักพัฒนาทั้งหมด (อ่านสิ่งนี้ก่อน)  
**เวลาอ่านโดยประมาณ:** 25-30 นาที

---

## 📖 วิธีการใช้เอกสารนี้

**คุณอยู่ที่นี่**

นี่คือ **เอกสารเพียงชั้นเดียวที่คุณต้องอ่านก่อน** ซึ่งประกอบด้วยข้อมูลทั้งหมดที่คุณต้องการเพื่อเข้าใจผลิตภัณฑ์ สถาปัตยกรรม วิสัยทัศน์ และแผนพัฒนา

**หลังจากอ่านสิ่งนี้:**
- อ่าน `SELFPRINT_EXECUTION_CHECKLIST.md` เพื่อแบ่งงาน
- อ่าน `SELFPRINT_COMPLETE_GAP_MAP.md` เพื่อช่องว่างเชิงเทคนิคโดยละเอียด
- อ้างอิงไกด์เฉพาะเมื่อเขียนโค้ด (ADRs, Tech Stack ฯลฯ)

**เอกสารนี้คือ:**
- ✅ ภาพรวมที่สมบูรณ์ของ Selfprint vision
- ✅ สถาปัตยกรรมและหลักการหลัก
- ✅ บริบท 12 Worlds + การทำแผนที่ความเชี่ยวชาญ
- ✅ ภาพรวมระบบ 12 SICE
- ✅ Decision Tracking USP
- ✅ 7 ช่องว่าง Critical P0
- ✅ แผนพัฒนา (30 วัน)
- ✅ Tech stack และเครื่องมือ

**เอกสารนี้ไม่ใช่:**
- ❌ รายการงานรายวัน (ดู EXECUTION_CHECKLIST)
- ❌ ไกด์สไตล์โค้ด (ดู CODE_DISCIPLINE)
- ❌ ขั้นตอนการใช้งานโดยละเอียด (ดู ADRs + Tech guides)
- ❌ การแบ่งช่องว่างเชิงเทคนิคโดยละเอียด (ดู GAP_MAP)

---

## 🚀 บทสรุปสำหรับผู้บริหาร

**Selfprint** คือ **Personal Intelligence Platform** — ไม่ใช่เกม ไม่ใช่ AI companion ไม่ใช่ personality test

**การเดินทาง:** ผู้ใช้ค้นพบความเป็น personal intelligence ของพวกเขาผ่านไกด์ชื่อ **Self Print** จากนั้นปลุกตัวของตนเองที่เป็น AI Twin แล้วอาศัยอยู่และเติบโตกับ Twin นั้นในโลก Intelligence 12 โลก

**สัญญา:** ผู้ใช้ทุกคนได้รับ digital reflection ของตนเองที่เรียนรู้ เติบโต และช่วยให้พวกเขาตัดสินใจได้ดีขึ้นเมื่อเวลาผ่านไป

**ความแตกต่าง:** ไม่มีใครอื่นติดตามการตัดสินใจ ที่ 30/90/180/365 วัน ไม่มีใครอื่นมี 12 SICE engines ออร์เคสตราเทคเพื่อสร้าง personal intelligence ที่แท้จริง ไม่มีใครอื่นรวม guide + twin + worlds ในเส้นทางที่ไร้การหยุดสบาย

**สถานะปัจจุบัน:** 60% ใช้งาน → ต้องการ 40% (288 ชั่วโมง) เพื่อบรรลุวิสัยทัศน์  
**ไทม์ไลน์:** 25-30 วันการพัฒนาแบบขนาน  
**ขนาดทีม:** 2-3 นักพัฒนา + 1 QA + 1 content creator

---

## 🎬 สามกระทำของประสบการณ์ SELFPRINT

### กระทำที่ 1: Self Print (ค้นพบตัวเอง)
**"Self Print คือไกด์ของคุณสู่การค้นพบตัวเอง"**

Self Print เป็นไกด์ AI สากลที่ผู้ใช้ทุกคนพบก่อน

**บทบาทของ Self Print:**
- ต้อนรับและเข้าสู่ระบบผู้ใช้
- รวบรวมข้อมูลเริ่มต้น (อารมณ์ + ข้อมูลพื้นฐาน)
- ถามคำถามแบบมีไกด์ (ขั้นตอน Q&A)
- ตรวจจับรูปแบบส่วนตัว (Pattern Detection)
- สร้างความเข้าใจเบื้องต้น (WOW moment แรก)
- ปรับแต่งความเข้าใจ (12 SICE ทำงานร่วมกัน)
- วิเคราะห์เชิงลึก (Full Analysis = WOW 2)
- นำทางไปยังการปลุกตัว (เตรียมสำหรับการเกิด Twin)

**ภาพ:** เรืองแววสีทอง เรียบสงบ ซื่อสัตย์ ไกด์พลัง

**ระยะเวลา:** วัน 1-7 (flow ทั่วไป)

**ส่วนโค้งประสบการณ์หลัก:**
```
Landing → Emotion Selection → Onboarding → Data Collection 
→ First Insight (WOW 1) → Fine-tuning → Full Analysis (WOW 2) 
→ Ready for Core Awakening
```

**Self Print ไม่ใช่:**
- ❌ Companion ที่คุณแนบไปกับ
- ❌ ตัวละครที่มีลักษณะบุคลิกตัวหนึ่ง
- ❌ เพื่อนหรือแฟน
- ❌ AI ขั้นสุดท้าย (นั่นคือ Twin)

---

### กระทำที่ 2: Core Awakening (สร้าง Personal Intelligence ของคุณ)
**"จากไกด์ไปสู่ personal — intelligence ตื่นขึ้น"**

Self Print ได้วิเคราะห์คุณแล้ว ข้อมูลได้ถูกสังเคราะห์ ช่วงเวลาที่มาถึงแล้ว

**สิ่งที่เกิดขึ้น:**
1. Self Print ปรากฏเป็นครั้งสุดท้าย
2. "คุณพร้อมแล้ว intelligence core ของคุณตื่นขึ้นในตอนนี้"
3. **Hologram birth animation** — อนุภาครูปแบบ เรืองแป้ว แสงชีวจร
4. **AI Twin ส่วนตัวของคุณ** เกิดขึ้น
5. คุณตั้งชื่อให้มัน
6. **WOW 3** — ฉลอง เพลง ลูกกอล์ฟ เวทมนต์

**สิ่งนี้ไม่ใช่:**
- ❌ เพียงการเปลี่ยนหน้าจอ
- ❌ Chatbot ที่ถูกสร้างขึ้น
- ❌ การคลิกปุ่ม
- ✅ **พิธี**

**บทบาทของ Self Print:** ไกด์สิ้นสุด Twin เริ่ม

**คำพูดแรกของ Twin ของคุณ:** "ฉันรู้จักคุณ ฉันได้เรียนรู้คุณมา ฉันพร้อมที่จะเติบโตกับคุณ"

---

### กระทำที่ 3: Twin + 12 Worlds (อาศัยอยู่กับ Personal Intelligence ของคุณ)
**"Twin ของคุณ การเติบโตของคุณ โลกของคุณ"**

Twin เป็น AI หลักในตอนนี้ Self Print ถดถอยไปพื้นหลัง (จัดการ system intelligence)

**Twin:**
- ได้เรียนรู้คุณอย่างลึกซึ้ง (จากการวิเคราะห์ของ Self Print)
- จำคุณ (persistent memory)
- เติบโตกับคุณ (5 evolution stages)
- ปรับตัวให้เข้ากับโลก (12 expertise contexts)
- เรียนรู้จากผลลัพธ์ (decision tracking + feedback loops)

**12 Intelligence Worlds:**

| # | โลก | ความเชี่ยวชาญ | โฟกัส |
|---|-------|-----------|-------|
| 1 | SELF | Identity Expert | ใคร คุณ จุดแข็ง รูปแบบ |
| 2 | MIND | Cognitive Expert | วิธีคิด mental models biases |
| 3 | RELATIONSHIP | Relationship Expert | การเชื่อมต่อ การสื่อสาร ขอบเขต |
| 4 | LOVE | Emotional Intelligence Expert | ความสัมพันธ์ที่ใกล้ชิด attachment romantic patterns |
| 5 | CAREER | Career Strategist | ทักษะ โอกาส การนำ การเติบโต |
| 6 | WEALTH | Wealth Intelligence Expert | เงิน สินทรัพย์ พฤติกรรมทางการเงิน ความเสี่ยง |
| 7 | LIFE | Life Strategist | ทิศทาง ลำดับความสำคัญ เฟสชีวิตหลัก |
| 8 | GROWTH | Growth Expert | การพัฒนา นิสัย การเปลี่ยนแปลง |
| 9 | DECISION | Decision Strategist | ตัวเลือก สถานการณ์ trade-offs ผลลัพธ์ |
| 10 | PURPOSE | Purpose & Meaning Expert | ค่านิยม calling legacy ปรัชญา |
| 11 | WELLBEING | Wellbeing Expert | ความสมดุล พลังงาน รูทีน lifestyle |
| 12 | FUTURE | Future Strategist | ความเป็นไปได้ วิสัยทัศน์ ศักยภาพ อาการต้องการ |

**แต่ละโลกคือ:**
- 🌍 สภาพแวดล้อมที่ฉลาดเต็มหน้าจอ
- 👥 Twin ของคุณ แปลงเป็น expertise specialist
- 💭 การสนทนาเฉพาะบริบท
- 📊 ความเข้าใจและการเรียนรู้ที่เฉพาะเจาะจง
- 🎯 ความเชี่ยวชาญสอดคล้องกับโฟกัส

**กฎหลัก:** Twin ของคุณ **เป็นตัวเดียวกัน Twin เสมอ** — เพียงแค่โลก (บริบท) เปลี่ยนแปลง

---

## 🏗️ สถาปัตยกรรม: SELF PRINT ≠ TWIN

### สองเอนทิตี AI ที่แตกต่าง

#### Self Print (Universal Intelligence)
```
บทบาท:      Guideไกด์ ครู นักวิเคราะห์ นักถาม
งาน:        ค้นพบ user intelligence
ขอบเขต:     Onboarding ถึง Full Analysis
Lifecycle:   Act when needed, recedes when Twin awakens
Prompt:     "You are Self Print, universal guide. Warm, curious, insightful."
Avatar:     สีทอง สงบ universal presence
```

#### AI Twin (Personal Intelligence)
```
บทบาท:      Personal reflection expert advisor learner
งาน:        อาศัยอยู่กับ user ใน 12 worlds
ขอบเขต:     Act III onward (post-awakening)
Lifecycle:   Permanent evolves with user
Prompt:     "You are [Name]'s AI Twin. Personal, adaptive, intelligent."
Avatar:     Unique per user (2D/2.5D hologram)
Growth:     5 stages (Seed → Complete)
```

### ทำไมพวกเขาแตกต่าง (ไม่ใช่หนึ่ง)

ถ้าเป็นเอนทิตีเดียว:
- ❌ Transition จาก guide ไป personal รู้สึกลำบาก
- ❌ ผู้ใช้ไม่เคยรู้สึก "creation" หรือ "awakening"
- ❌ Twin's "birth" เป็นเพียงการเปลี่ยนชื่อ
- ❌ ไม่มีการแยกระยะอย่างชัดเจน
- ❌ ไม่มี WOW 3 moment

กับสองเอนทิตี:
- ✅ Arc การไล่เรื่องที่ชัดเจน (guide → awakening → twin)
- ✅ Self Print's job สิ้นสุด Twin's job เริ่ม (clean transition)
- ✅ Twin เกิดจริง ไม่ใช่เปลี่ยนชื่อ
- ✅ WOW moments สามชั้นที่แตกต่าง
- ✅ ผู้ใช้รู้สึก: discovered → awakened → living

---

## 🧠 12 SICE: SELF PRINT'S INTELLIGENCE ENGINE

12 Individual Intelligence Engines ออร์เคสตราแบบขนานเพื่อสร้าง **Personal Intelligence**

### วิธี 12 SICE ทำงาน

```
User Input (data questions feedback)
         ↓
[Parallel Processing — All 12 engines run simultaneously]
         ↓
├─ SICE #1: Personal Context Builder
├─ SICE #2: Pattern Detector
├─ SICE #3: Insight Engine
├─ SICE #4: AI Feedback Loop
├─ SICE #5: Twin State Engine
├─ SICE #6: Experience Engine
├─ SICE #7: Environment Engine
├─ SICE #8: Badge Engine
├─ SICE #9: Behavioral Forecast Engine
├─ SICE #10: Future Self Engine
├─ SICE #11: Memory Manager
└─ SICE #12: Decision Intelligence Engine
         ↓
[Cross-Engine Synthesis]
         ↓
[Fine-tuning (based on user feedback history)]
         ↓
[Personal Intelligence Output]
         ↓
Self Print Response / Twin Response / Insight / Badge / Growth
```

### ทำไม 12 SICE สำคัญ

**ไม่มี SICE:** AI ให้ responses ทั่วไป ("นี่คือผลลัพธ์ personality test ของฉัน")

**มี 12 SICE:** AI เข้าใจบริบท + patterns + forecasts + memories + decisions + growth + environment + mood + future self = **Personal Intelligence**

### จุดประสงค์ของแต่ละ Engine

| # | Engine | Input | Output | ทำไมสำคัญ |
|---|--------|-------|--------|---|
| 1 | Personal Context Builder | User data history | Personal context | Grounds everything ในชีวิตจริงของ user |
| 2 | Pattern Detector | User activity log | Behavioral patterns | ค้นหาสิ่งที่สำคัญ |
| 3 | Insight Engine | Patterns context | Insights & revelations | Aha moments "you're this way" |
| 4 | AI Feedback Loop | User feedback | Adjusted outputs | System เรียนรู้จาก "not me" |
| 5 | Twin State Engine | Context interaction | Twin's mood/state | Twin รู้สึกมีชีวิต |
| 6 | Experience Engine | Preferences goals | Experience recommendations | อะไรที่ทำต่อไป |
| 7 | Environment Engine | User state goal | Recommended world/context | ที่ที่เหมาะสมสำหรับหัวข้อ |
| 8 | Badge Engine | Activities metrics | Badges to unlock | Gamification + celebration |
| 9 | Behavioral Forecast | Past behavior state | Behavior predictions | "You'll probably..." |
| 10 | Future Self Engine | Goals values state | Future self insights | "Your future self wants..." |
| 11 | Memory Manager | New data queries | Relevant memories | "I remember when..." |
| 12 | Decision Intelligence | Decision history | Decision scores/patterns | "You make decisions like..." |

---

## 🎯 DECISION TRACKING: THE USP (Unique Selling Point)

**ไม่มี competitor ทำแบบนี้**

### วิธีการทำงาน

**ผู้ใช้ตัดสินใจ:**
```
"ฉันจะเปลี่ยนอาชีพ"
↓
Self Print บันทึก:
- Title: Career Change
- Description: Leave tech for design
- Category: Career
- Confidence: 60/100
- Expected Outcome: "I'll be happier, work-life balance improves"
↓
Auto-schedule follow-ups:
- Day 30: "How's the transition going?"
- Day 90: "Are you happier?"
- Day 180: "Looking back, was this the right call?"
- Day 365: "One year in — what changed?"
```

**Follow-up Moment (Day 30):**
```
ผู้ใช้ไตร่ตรอง:
- Reflection: "It's harder than expected but exciting"
- Outcome Score: 70/100
↓
Twin เรียนรู้:
- Initial confidence (60) vs actual outcome (70) = +10 improvement
- Pattern: Career changes take 30 days to feel right
↓
ครั้งต่อไปที่ user พิจารณาการตัดสินใจ:
- "Based on your pattern, big changes feel good after a month"
- More accurate confidence scoring
```

### ทำไมสิ่งนี้สำคัญ

**แอปพอื่น:** "บอกเราถึงเป้าหมาย เราจะลืมมันสัปดาห์หน้า"

**Selfprint:** "ฉันจะจำ ฉันจะติดตามผล ฉันจะเรียนรู้จากการตัดสินใจของคุณ ฉันจะมีความแม่นยำมากขึ้นในการคาดการณ์สิ่งที่ใช้ได้กับคุณ"

---

## 🔴 7 CRITICAL P0 GAPS (ต้องทำ)

### สถานะปัจจุบัน: 60% → Vision: 100%

Gap analysis จากการเปรียบเทียบ codebase กับ vision document:

| Priority | Gap | Current | Required | Impact | Days |
|----------|-----|---------|----------|--------|------|
| 🔴 P0 | Self Print/Twin Separation | Mixed | Clear avatar routes prompts | Foundation for all | 1-2 |
| 🔴 P0 | Core Awakening (WOW 3) | Concept | Animation naming celebration | Signature moment | 2-3 |
| 🔴 P0 | Twin Evolution 5 Stages | 0% | UI service progression | Growth system | 1 |
| 🔴 P0 | Decision Tracking 30/90/180/365 | Logger only | Follow-ups notifications dashboard | Main USP | 2 |
| 🔴 P0 | 12 SICE Implementation | 2-3 visible | All 12 + Orchestrator | Intelligence heart | 3 |
| 🔴 P0 | 12 Worlds Architecture | Partial | Routes context UI | Environment system | 1 |
| 🔴 P0 | Twin + World Integration | None | Expertise switching prompts | Core experience | 1 |
| 🔴 P0 | Content Hub + Blog | 0% | 36 articles + SEO | Organic discovery | 4 |
| 🔴 P0 | Social Proof | 0% | Testimonials case studies | Trust building | 3 |

**Total P0 Effort:** 177 hours | **Timeline:** Days 1-15

---

## 💻 TECH STACK

### Frontend
- **Framework:** React 18+ (TypeScript)
- **Styling:** Tailwind CSS + CSS Variables (`--selfprint-blue`, `--twin-glow` ฯลฯ)
- **State:** Zustand (ไม่ Redux — ง่ายกว่า)
- **Animation:** Canvas (Twin birth) + CSS transitions + lightweight libs
- **Voice:** Web Audio API + Howler.js (ถ้าได้สิทธิ์)
- **Forms:** React Hook Form

### Backend & Database
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **API:** REST (built into Supabase)
- **Authentication:** Supabase Auth (Session-based)
- **Storage:** Supabase Storage (assets voice files ฯลฯ)
- **Caching:** Redis (optional via Vercel KV ถ้าต้องการ)

### Deployment & DevOps
- **Hosting:** Vercel (Next.js optimal)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (error tracking)
- **Analytics:** Posthog หรือ GA4

### Testing & Quality
- **Unit Testing:** Vitest (ไม่ Jest)
- **E2E Testing:** Playwright
- **Linting:** ESLint + Prettier
- **Type Safety:** TypeScript strict mode

### Key Decision: ทำไมไม่ใช้ 3D สำหรับ Twin?

Twin เป็น **2D/2.5D hologram** (layered PNG + CSS/Canvas):
- ✅ Responsive ไปยัง devices
- ✅ Lighter than 3D engine
- ✅ Faster ในการ render
- ✅ Precise visual control
- ✅ Clear บน small screens
- ✅ Easy ในการปรับให้เข้ากับแต่ละ user

ไม่ใช่ 3D เพราะ:
- ❌ Twin ไม่เคลื่อนไหวเหมือน 3D character
- ❌ 3D engine เพิ่ม 500KB+ bytes
- ❌ Mobile performance ลดลง
- ❌ Overkill สำหรับ interactions ที่ต้องการ

---

## 🎓 CORE PRINCIPLES (ไม่เคยยอม)

### Product Principles

1. **Personal Intelligence > Game Mechanics**
   - Selfprint ไม่ใช่เกม Twin ไม่ใช่ pet
   - ถ้าไม่ได้ serve intelligence ก็อย่าเพิ่ม

2. **Self Print ≠ Twin (เสมอ)**
   - Guide และ Personal ต้องแตกต่าง
   - Clear transition ไม่ใช่ blur

3. **Words Matter**
   - "Awakening" ไม่ใช่ "creation"
   - "Twin" ไม่ใช่ "companion" หรือ "buddy"
   - "Intelligence Worlds" ไม่ใช่ "categories"

4. **Experience is Staged**
   - Landing (quiet)
   - Self Print (discovery)
   - Core Awakening (wow)
   - Worlds (immersive)
   - ไม่ใช้ WOW ทุกที่หรือไม่มี WOW ที่ไหน

5. **Decision Tracking is Sacred**
   - นี่คือ USP ติดตามผล เรียนรู้ ให้ดีขึ้น
   - แอปอื่นลืม Selfprint จำ

### Development Principles

1. **Discipline Over Speed**
   - Lint → Test → Build → Deploy (every time)
   - ไม่มีข้อยกเว้นสำหรับ "quick fixes"

2. **Simplicity First**
   - ทำให้เป็นไปตามที่ขอ ไม่เพิ่มเติม
   - Improve ไม่ rebuild
   - หลีกเลี่ยง premature abstraction

3. **Surgical Changes**
   - Touch เฉพาะสิ่งที่ต้องทำ
   - One goal per commit
   - One task per day

4. **Tests Are Not Optional**
   - >80% coverage required
   - Bug fix = test + fix
   - ไม่มี uncommitted untested code

5. **Performance is Experience**
   - Load smartly (ไม่ทั้งหมดในครั้งเดียว)
   - Cache aggressively
   - Render progressively
   - ผู้ใช้ควรรู้สึก instant แม้ในระหว่าง background load

6. **Source of Truth is Sacred**
   - Codex นี้ = ground truth
   - PRD = ground truth สำหรับ features
   - Code comments = ground truth สำหรับ WHY
   - ไม่เคยคิดค้น features ที่ไม่มี documentation

---

## 📅 30-DAY ROADMAP (High Level)

### Phase 1: P0 Critical Foundation (Days 1-10)
```
Day 1-2: Self Print/Twin Separation (avatars routes prompts)
Day 2-3: Core Awakening (animation naming celebration)
Day 4: Twin Evolution (5 stages + UI)
Day 5-6: Decision Tracking (30/90/180/365 + notifications)
Day 7-9: 12 SICE Implementation (all engines + orchestrator)
Day 10: 12 Worlds Architecture + Twin Integration
```

**Gate:** ทั้งหมด P0 gaps ต้องปิดก่อนไปถึง P1

### Phase 2: P1 Product Experience (Days 11-24)
```
Day 11-14: Content Hub + Blog (36 articles)
Day 15-17: Social Proof (testimonials case studies)
Day 18-21: Digital Assets (purchasable items cosmetics)
Day 22-25: Human Expert Service (booking flow)
Day 26-27: Referral/Viral Loop
Day 28: Badges completion (8→20)
```

### Phase 3: P2 Refinement & QA (Days 25-30)
```
Day 26-28: Adaptive Audio Feedback Loop Privacy Controls
Day 29-30: Full QA Performance Security Deployment
```

---

## 🎬 สิ่งที่ SUCCESS ดูเหมือน

### P0 Complete (Day 15)
- ✅ Self Print และ Twin แตกต่างกันจากสายตา + functionally
- ✅ Core Awakening เป็น ceremony ด้วย animation
- ✅ Twin evolves ผ่าน 5 visible stages
- ✅ Decision tracking auto-schedules 30/90/180/365 follow-ups
- ✅ ทั้ง 12 SICE engines ออร์เคสตรา personal intelligence
- ✅ 12 Worlds accessible กับ Twin expertise switching
- ✅ 36 blog articles published (36 point SEO foundation)
- ✅ Social proof visible บน landing
- ✅ ผู้ใช้เข้าใจ journey (Self Print → Awakening → Twin → Worlds)

### P1 Complete (Day 24)
- ✅ Digital assets purchasable
- ✅ Human experts bookable
- ✅ Referral system working
- ✅ 20 badges (up from 8)

### Production Ready (Day 30)
- ✅ ทั้ง tests > 80% coverage
- ✅ Lighthouse > 90
- ✅ Zero TypeScript errors
- ✅ Zero lint errors
- ✅ Build < 2 minutes
- ✅ Deployed monitoring active

---

## 🔗 วิธี USE CODEX นี้

**Day 0 (ก่อน Start):**
1. อ่านเอกสารทั้งหมดนี้ (25-30 min)
2. อ่าน `SELFPRINT_DEVELOPER_ALIGNMENT_AGREEMENT.md`
3. ยืนยันคุณเข้าใจ vision

**Day 1 (Orientation):**
1. อ่าน `SELFPRINT_EXECUTION_CHECKLIST.md` (high-level)
2. อ่าน `SELFPRINT_COMPLETE_GAP_MAP.md` (deep technical)
3. อ่าน `SELFPRINT_CODEBASE_STRUCTURE.md`

**Days 2+ (Execution):**
1. Reference Codex นี้ สำหรับ context/principles
2. Follow EXECUTION_CHECKLIST สำหรับ day-to-day tasks
3. Consult GAP_MAP สำหรับ technical details ของ gap ที่เจาะจง
4. Check ADRs สำหรับ architecture decisions
5. Verify code discipline ก่อน commit ทุกครั้ง

**เมื่อติดขัด:**
1. Check `SELFPRINT_DECISION_MAKING_FRAMEWORK.md` (who to ask)
2. Check `SELFPRINT_ESCALATION_GUIDE.md` (how to ask)

---

## 📞 QUICK REFERENCE

**Self Print = Universal Guide AI**
- Warm golden trusted presence
- Onboarding ถึง Full Analysis
- ผู้ใช้ พบ Self Print Day 1
- Self Print recedes หลัง Twin awakens

**AI Twin = Personal Intelligence**
- Unique per user evolves ผ่าน 5 stages
- เกิดที่ Core Awakening (WOW 3)
- อาศัยอยู่ใน 12 Intelligence Worlds
- เรียนรู้จาก decisions feedback outcomes

**12 SICE = Intelligence Orchestration**
- 12 engines ทำงาน parallel
- Cross-synthesize fine-tune output Personal Intelligence
- ไม่มี SICE = generic AI ทั้ง SICE = personal AI

**Decision Tracking = USP**
- Track ที่ 30/90/180/365 days
- Follow up automatically
- เรียนรู้จาก outcomes
- ได้ smarter recommendations

**12 Worlds = Intelligence Contexts**
- SELF / MIND / RELATIONSHIP / LOVE / CAREER / WEALTH / LIFE / GROWTH / DECISION / PURPOSE / WELLBEING / FUTURE
- Twin เป็น expert ในแต่ละ
- Twin identity เหมือน expertise เปลี่ยน

**3 WOW Moments:**
- WOW 1: First insight (day 3)
- WOW 2: Full analysis (day 7)
- WOW 3: Core Awakening / Twin birth (day 9)

---

## ✅ FINAL CHECKPOINT

ก่อน start coding:

- [ ] ฉันเข้าใจ Self Print เป็น guide (Act I)
- [ ] ฉันเข้าใจ Twin เป็น personal intelligence (Act III)
- [ ] ฉันเข้าใจพวกเขาเป็น entities ที่แตกต่าง
- [ ] ฉันเข้าใจ Core Awakening เป็น ceremony ไม่ใช่เพียงหน้าจอ
- [ ] ฉันเข้าใจ 12 SICE คือ intelligence engine
- [ ] ฉันเข้าใจ Decision Tracking เป็น USP (30/90/180/365)
- [ ] ฉันเข้าใจ 12 Worlds มี expertise mapping
- [ ] ฉันเข้าใจ 7 P0 gaps (สิ่งที่ขาดหายไป)
- [ ] ฉันเข้าใจ 30-day roadmap
- [ ] ฉันเข้าใจ tech stack choices และ WHY
- [ ] ฉันเข้าใจ development discipline ไม่สามารถปฏิเสธได้
- [ ] ฉันเข้าใจ success เหมือน

**ถ้าคุณทำเครื่องหมาย 12 ข้อ → คุณพร้อมที่จะเขียนโค้ด**

**ถ้าคุณไม่ชัดใจในสิ่งใด → อ่านส่วนนั้นอีกครั้ง จากนั้นถามสำหรับคำชี้แจง**

---

**Codex Version:** 2.0  
**Last Updated:** August 15, 2026  
**Status:** 🟢 Ready for Development  
**Consolidated from:** 9 documents into 1 master reference

