# MARKET ANALYSIS — ตลาดไทย (SELFPRINT)

> **สถานะเอกสาร:** บทวิเคราะห์เชิงกลยุทธ์ บันทึกจาก consultation session 7 ก.ย. 2026
> **หลักการ:** **honest — ไม่อวย** · ไม่อ้างตัวเลขภายนอกที่ไม่ได้ verify · ทุกข้อที่อ้าง "มีจริง" ตรวจจากซอร์สโค้ด (file:line)
> **ไม่ใช่รายงานตลาดเชิงปริมาณ** — เป็นกรอบวิธีคิด (strategic framing) ต่อจาก asset ที่มีอยู่ในโค้ดจริง
> **แหล่งอ้างอิง:** [`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](../FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md) · [`docs/Experience Architecture v2.md`](Experience%20Architecture%20v2.md) · [`docs/PLAN_TRACKS_TH.md`](PLAN_TRACKS_TH.md)

---

## 1. บริบท — สิ่งที่ SELFPRINT มีจริงจากโค้ด (ไม่ใช่แผนในอนาคต)

SELFPRINT มี **Trojan-horse content** อยู่จริงในโค้ดแล้ว — หน้า/ฟีเจอร์ที่ตั้งใจ "รับผู้ใช้จากตลาดดูดวง
แล้ว redirect ไป behavioral science":

| Asset | หลักฐาน (file:line) | กลไก |
|-------|---------------------|------|
| **`/vs-astrology`** | `src/pages/VsAstrologyPage.tsx:6` "Trojan Horse strategy: meet their intent → redirect to behavioral science" | ตารางเปรียบเทียบ SELFPRINT vs Co-Star/ดูดวง AI — ใช้ภาษาเดียวกันกับผู้ใช้ที่ค้นหา "AI ดูดวง" |
| **Tarot** | `src/pages/TarotPage.tsx:33,39` — 22 Major Arcana map กับ SELFPRINT psychological themes | "สะท้อนความคิดผ่านสัญลักษณ์ทางจิตวิทยา" — ไม่ใช่ทำนาย แต่เป็น mirror |
| **Palmistry** | `src/pages/PalmistryPage.tsx:6,211` — ลักษณะมือ → map เป็น behavioral traits ตาม SELFPRINT framing | เปลี่ยน input "ดูลายมือ" เป็น behavioral read |
| **Birth-chart bridge** | `src/lib/astrology.ts` — numerology/zodiac คำนวณจาก `dob` (deterministic, ไม่ใช้ AI) + `src/lib/ArchetypeScoreEngine.ts` (port จาก astro-calc.js) | ใช้ birth data เป็น **entry point** นำเข้า behavioral archetype |
| **Blog awareness** | `src/App.tsx:191,206` — `/blog` + `/blog/:slug` (`BlogListPage` / `BlogArticle`) | บทความ awareness (รวม `blog-astrology-vs-behavioral` ที่เคยมี) |
| **FAQ "not astrology"** | `src/constants/faqs.ts:28,65` — "grounded in 12 dimensions of behavioral data — not astrology" | เป็นการวาง position ตั้งแต่ public layer |

> **จุดร่วม:** ทุก asset ข้างต้น **ไม่สร้าง data/intelligence ใหม่** — เป็นแค่ framing/entry ที่ชี้ไป
> SICE + behavioral analysis ที่มีอยู่แล้ว (ตรงกับ §51 guardrail "NO NEW INTELLIGENCE ENGINE")

**Core promise ที่ใช้ปิดการขาย:** *"Understand yourself. Meet your Twin. Keep evolving."* (§1)
**คำ positioning หลัก:** "12 dimensions of behavior — not astrology" (Footer.tsx:83, faqs.ts:28)

---

## 2. ตลาดดูดวงไทย — ทำไมกลุ่มนี้ใหญ่

> เนื้อหาส่วนนี้เป็น **การอ่านตลาดเชิงคุณภาพ** ตามที่ปรึกษา — ไม่อ้างตัวเลขยอด/รายได้ที่ไม่ได้ verify

ผู้ใช้ตลาดดูดวง/ฮอโรสโคปในไทยถูกดึงดูดด้วย 4 สิ่ง (ซึ่ง SELFPRINT ควรเข้าใจก่อน "แย่ง" ผู้ใช้):

1. **ความแน่นอน + closure** — ดูดวงให้คำตอบที่ "จบ" ได้ทันที ("เดือนนี้ดี/ไม่ดี") ไม่ต้องคิดต่อ
2. **Ritual** — พิธีกรรม/ความสม่ำเสมอ (เช็คดวงประจำวัน/สัปดาห์) ให้ความรู้สึก "มีระบบ"
3. **Decision reassurance** — ก่อนตัดสินใจเรื่องใหญ่ ผู้ใช้อยากได้ "external confirmation" ว่าทำถูกทาง
4. **Emotional contract** — รู้สึกว่า "มีบางอย่างเข้าใจฉัน" ผ่านภาษาที่พูดกับความรู้สึก

**จุดที่ดูดวงแข็งแกร่ง:** ตอบสนองทุกข้อข้างต้น**ทันที** ภายในนาทีแรก

---

## 3. โจทย์จริง — ตารางเปรียบเทียบ

| มิติ | ดูดวง (astrology/horoscope) | SELFPRINT |
|------|------------------------------|-----------|
| **สิ่งที่ให้** | ความแน่นอน + closure (คำตอบจบในตัว) | insight ที่ต้องเรียนรู้ (ต้องเปิดใจรับ) |
| **ความเร็ว** | ทันที — ได้คำตอบในนาทีแรก | ช้ากว่า — ต้องผ่าน analysis → Twin birth |
| **Personalization** | ข้อมูลเดียวสำหรับทุกคนที่เกิดวันเดียวกัน | เรียนรู้จากพฤติกรรมจริงของคุณ (personalized) |
| **พื้นฐาน** | ดาว/โชคชะตา (ไม่เปลี่ยนตามพฤติกรรม) | พฤติกรรมจริง (เปลี่ยนตามที่คุณเติบโต) |
| **ความน่าเชื่อถือระยะยาว** | รู้สึก "แม่น" เพราะตีความได้หลายแบบ | ต้องพิสูจน์ด้วยการสะสมข้อมูล |

**ข้อได้เปรียบของ SELFPRINT (honest):**
- ✅ **Real behavior** — อ้างอิงจากสิ่งที่ผู้ใช้ทำจริง (feedback / decisions / memories) ไม่ใช่ star chart
- ✅ **Personalize จริง** — ข้อมูลเฉพาะบุคคล แม่นขึ้นเรื่อย ๆ (ไม่ใช่ template เดียวสำหรับทุกคน)
- ✅ **ต่อยอดได้** — เมื่อมี Twin + memory แล้ว สร้างความสัมพันธ์ระยะยาว (evolution) ที่ดูดวงทำไม่ได้

**ข้อจำกัดของ SELFPRINT (honest):**
- ⛔ **ผู้ใช้อาจไม่รู้สึก "closure" ใน first minute** — ดูดวงให้คำตอบจบทันที แต่ SELFPRINT บอกว่า
  "ต้องเรียนรู้ไปด้วยกัน" ซึ่งเป็นเส้นทางที่ต้องใช้เวลา
- ⛔ **ต้องผ่าน onboarding ก่อนจะ "ได้อะไร"** — friction สูงกว่าการเช็คดวง 2 นาที

---

## 4. สองกลุ่มเป้าหมาย

### กลุ่ม A — Skeptic ที่มาจากตลาดดูดวง (active search "AI ดูดวง")

- กำลังค้นหาด้วยคำอย่าง "AI ดูดวง" / "horoscope AI" — **มี intent ชัดเจน**
- เข้าผ่าน `/vs-astrology` หรือ blog awareness → เห็นตารางเทียบ → ถูก redirect ไป behavioral science
- **ความเสี่ยง:** อยากได้ closure เร็ว · อาจรู้สึกว่า SELFPRINT "ไม่ตอบตรงๆ"

### กลุ่ม B — Self-development ที่อยากได้ science-based

- ไม่ได้มาจากตลาดดูดวง แต่อยากเข้าใจตัวเองด้วยวิธีที่ "มีหลักฐาน"
- สนใจเรื่อง behavioral pattern / decision science / personal growth
- เข้าผ่าน content เกี่ยวกับ self-discovery / science page (`/science`) / worlds
- **จุดแข็ง:** พร้อมที่จะ "เรียนรู้" ไม่ใช่แค่ "ได้คำตอบ" — เหมาะกับ insight-based journey

---

## 5. ข้อควรระวัง (caution)

1. **อย่าไปแข่งตรง ๆ กับความเร็ว/closure ของดูดวง** — ถ้าพยายาม "ให้คำตอบทันทีเหมือนดูดวง"
   จะเสียจุดแข็ง (personalized + real behavior) และยังแพ้เรื่องความเร็ว
2. **Subscription WTP ไทยต่ำ** — ผู้ใช้ไทยส่วนใหญ่คุ้นเคยกับฟรี/แพ็กเกจถูก · ต้องมี "คุณค่าที่จับต้องได้"
   ก่อนถึง paywall (เช่น first insight / Twin Birth) ไม่ใช่ขึ้น paywall ตั้งแต่ต้น
3. **อย่า fake story** — ตรงกับ §51 guardrail "NO FAKE STORY" — ห้ามสร้าง Narrative Hook /
   insight ที่ไม่มีข้อมูลจริงรองรับ เพราะจะทำลายความน่าเชื่อถือ (trust) ที่เป็น asset หลัก
4. **อย่าไปอ้าง "แม่นกว่า" ในเชิงตัวเลข** — ถ้าไม่มีหลักฐาน ควรใช้ภาษาแบบ "อิงจากพฤติกรรมจริงของคุณ"
   แทนการอ้าง accuracy ที่พิสูจน์ไม่ได้

---

## 6. Verdict (honest)

### ✅ สิ่งที่เป็น asset จริง

- **Trojan funnel ที่สร้างไว้แล้ว** — `/vs-astrology` + Tarot + Palmistry + blog + FAQ เป็น "ประตูรับ"
  จากตลาดดูดวงโดยไม่ต้อง compete ตรง ๆ
- **"Not astrology แต่ตรงกว่า"** — positioning ที่ใช้ได้จริง (ไม่ใช่ของปลอม เพราะพฤติกรรมจริง
  + personalized + เรียนรู้ได้)
- **Self-discovery ที่วัดผลได้** — มี SICE + analysis + Twin birth เป็น "สินค้า" ที่จับต้องได้

### ⛔ ความเสี่ยงที่ต้องระวัง

- **First-punch insight ต้องไม่ generic** — ถ้า insight แรก (Twin Birth / Today) เป็นเรื่องทั่ว ๆ ไป
  ผู้ใช้จะรู้สึกว่า "เหมือนดูดวง" ทันที · ต้องมาจาก real analysis (G6)
- **Pricing** — ต้องออกแบบให้มีคุณค่าเห็นก่อน paywall
- **คู่แข่ง self-help ราคาถูก** — มีแอป/คอร์ส self-help มากมายในไทยที่ราคาต่ำ · SELFPRINT ต้องชู
  "ความสัมพันธ์กับ Twin ที่เรียนรู้คุณ" ไม่ใช่ "คอร์สอีกตัว"

---

## 7. คำแนะนำ — Dual-funnel

### Funnel A — ดูดวง → Premium insight (ระยะสั้น)

```
ค้นหา "AI ดูดวง" → /vs-astrology / Tarot / Palmistry (Trojan) → free 2-min analysis
→ first insight (จาก real data) → free trial → subscription
```
- ใช้ภาษาที่ผู้ใช้ตลาดดูดวงคุ้นเคย (แต่ redirect ไป behavioral science)
- **เป้าหมาย:** เปลี่ยน "อยากรู้ดวง" → "อยากรู้ตัวเอง" แล้วพาเข้าสู่ Twin journey

### Funnel B — Self-development → Relationship/Evolution (ระยะยาว)

```
Search self-discovery / /science / /blog → onboarding → analysis → Twin Birth
→ Twin + memory + evolution (ความสัมพันธ์ระยะยาว) → subscription
```
- ใช้ insight / evolution / "Twin จำฉันได้" เป็นคุณค่าหลัก
- **เป้าหมาย:** สร้าง retention ระยะยาว ไม่ใช่แค่ first-purchase

### Metrics ที่ควรติดตาม (trackable ภายในแอป)

- **First-visit → first-named-Twin rate** (วัดว่า Trojan funnel / onboarding พาไปถึง Twin Birth ได้จริงไหม)
- **Day-7 retention** (วัดว่าความสัมพันธ์กับ Twin "ติด" จริงไหม — ไม่ใช่แค่ลองเล่น)

---

## 8. เชื่อมโยงกับ Track C

ข้อเสนอที่ปรึกษานี้สอดคล้องกับ phase เหล่านี้ของ Track C
(`docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`):

| Track C phase | สิ่งที่เกี่ยวข้องกับ market analysis |
|---------------|-------------------------------------|
| **Phase 2 (Landing)** | ต้องสื่อ category "Living Intelligence" (ไม่ใช่ "AI website อีกตัว") + เผื่อช่อง SMART ENTRY (§35) |
| **Phase 4 (Analysis)** | First insight ต้องไม่ generic — ต้องมาจาก real analysis (SICE invisible, §19) |
| **Phase 6 (Twin Birth)** | **G6** — first message จาก real analysis เสมอ (ห้าม "Hi! Nice to meet you") — ตรงกับ "first-punch insight ต้องไม่ generic" |
| **Phase 8 (Today)** | **§6** — one primary insight (ไม่ใช่หลาย cards แข่งกัน) — ช่วยให้ผู้ใช้รู้สึก "Twin มองเห็นฉัน" ตั้งแต่กลับมาครั้งแรก |
| **Phase 11 (Memory)** | **§16** — "What Twin Knows" แสดงข้อมูลจริง (ไม่ใช่ fake precision) — รองรับ Funnel B (relationship/evolution) |
| **Tarot/Palmistry restyle** | ข้อเสนอ addendum (Phase 2a/4) — restyle ด้วย CSS atmosphere §14 + เน้น "psychological framing" copy ที่มีอยู่แล้ว · **รักษา Trojan funnel** |

> **หมายเหตุ:** บทวิเคราะห์นี้เป็น **ข้อเสนอเชิงกลยุทธ์** ไม่ใช่คำสั่ง implement —
> ทุกการเปลี่ยนต้องผ่าน §44 safety rule (RECOMPOSE ไม่ใช่ REBUILD) และ do-not-touch zones

---

> **หลักการของเอกสารนี้:** ไม่อวย · ไม่อ้างตัวเลขที่ไม่ได้ verify · ทุกข้อที่อ้าง "มีจริง" ตรวจจากโค้ด ·
> ระบุทั้งข้อได้เปรียบและข้อจำกัด · ไม่ขัด §44 (RECOMPOSE ไม่ใช่ REBUILD) · ไม่แตะ do-not-touch zones
