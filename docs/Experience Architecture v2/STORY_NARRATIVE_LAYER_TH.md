# STORY / NARRATIVE LAYER — SELFPRINT V3

> **สถานะเอกสาร:** วางแผน + audit — ไม่มีการแก้โค้ดแม้แต่บรรทัดเดียว
> **วันที่:** 6 กันยายน 2026 · **HEAD:** `da855c5`
> **อ้างอิง:** §51 ของ `docs/Experience Architecture v2.md`
> **หลักการ:** Storytelling คือ LENS ไม่ใช่ feature — ไม่มี DB table ใหม่ · ไม่มี engine ใหม่ · ไม่ bypass SICE

---

## 1. Story Audit — 12 Phase (Landing → SEO)

สำรวจทุก phase ว่า story หายไปตรงไหน ซ้ำซ้อนตรงไหน เปิดเผยเร็วเกินหรือขาด payoff

| Phase | ชื่อ | Story gap / ปัญหา |
|-------|------|--------------------|
| **Phase 1** | Landing | Hook มีอยู่ใน copy แต่ไม่มี narrative continuity ไปยัง Phase 2 — ผู้ใช้ไม่รู้ว่า "สิ่งที่กำลังเกิดขึ้นคืออะไร" |
| **Phase 2** | Onboarding | คำถาม Q&A เป็น form ไม่ใช่เรื่อง — ไม่มี "ทำไมคำถามนี้ถึงสำคัญ" ไม่มี narrative thread เชื่อม Q กับ Q |
| **Phase 3** | Onboarding (cont.) | ผู้ใช้ทำตามขั้นตอนแต่ไม่รู้สึกว่า "กำลังสร้างบางอย่าง" — ขาด Story Beat ที่บอกว่า "Twin กำลัง learn จากคุณ" |
| **Phase 4** | Analysis | Reveal เร็วเกินไป — ผลวิเคราะห์โผล่มาทั้งหมดพร้อมกัน ไม่มี pacing · ขาด sense of discovery |
| **Phase 5** | Core Awakening | มี cinematic moment (HologramBirth) แต่ไม่มี narrative hook ก่อนหน้า — ผู้ใช้ไม่รู้ว่า "กำลังรอดูอะไร" |
| **Phase 6** | Twin Birth | First message generic — ไม่ได้มาจาก real analysis · ขาด "Reveal" ที่ทำให้ผู้ใช้รู้สึกว่า Twin รู้จักตัวเอง |
| **Phase 7** | Twin Chat | Chat ไม่มี narrative arc — ทุก session เริ่มใหม่ไม่มี memory ที่ผู้ใช้รู้สึกได้ · ขาด continuity |
| **Phase 8** | Today | Cards แข่งกัน — ไม่มี "story ของวันนี้" ที่ชัดเจน · ขาด Micro Story ที่ดึงผู้ใช้เข้าลึกกว่า cards |
| **Phase 9** | Worlds | 12 Worlds = grid ของ categories · ไม่มี sense ว่า "โลกนี้เชื่อมกับเรื่องราวของคุณอย่างไร" |
| **Phase 10** | Twin Modes | Mode เปลี่ยนแต่ไม่มี story transition — REFLECT/DECIDE ไม่ reference decisions จริง |
| **Phase 11** | Memory Experience | Memory = list ไม่ใช่ narrative — ไม่มี "What did this memory change?" |
| **Phase 12** | SEO/GEO/AEO | Public layer ไม่มี story hook สำหรับ first-time visitor — content factual ไม่ใช่ narrative |

**สรุป pattern ที่พบ:**
- **Repetitive:** คำถาม "เข้าใจตัวเอง" ปรากฏทุก phase โดยไม่มี progression
- **Jumps:** Awakening → Birth → Chat ไม่มี transition — ผู้ใช้รู้สึก "เด้งข้ามฉาก"
- **Reveals too early:** Analysis dump ทุกอย่างพร้อมกันก่อนที่ผู้ใช้จะ emotionally ready
- **Lacks payoff:** Choices ถูก log แต่ไม่มี Consequence ที่ผู้ใช้เห็นได้

---

## 2. เจ็ด Story Primitives

Map กับ data ที่มีอยู่แล้ว — ไม่ต้องสร้าง DB table ใหม่

| Primitive | Data ที่ map (existing) | คำอธิบาย |
|-----------|------------------------|-----------|
| **Chapter** | `lifecycleStage` / `evolution_stage` | ช่วงเวลาที่มีชื่อในการเดินทางของผู้ใช้กับ Twin |
| **Story Beat** | `daily_brief` / `twin_memories` | ช่วงเวลาเดียวที่มีความหมายและควรจำ |
| **Narrative Hook** | SICE patterns + `decision_logs` | คำถามเปิดที่ดึงผู้ใช้เข้าสู่การสำรวจที่ลึกขึ้น |
| **Question** | onboarding responses + SICE patterns | คำถามที่ Twin ยังถือไว้ — มีเพียงผู้ใช้เท่านั้นที่ตอบได้ |
| **Choice** | `decision_logs` | จุดแยกทางที่ผู้ใช้เคยถึง — และเส้นทางที่เลือก |
| **Consequence** | follow-up results + evolution delta | สิ่งที่เกิดขึ้นหลัง Choice — แสดงเมื่อมีข้อมูลจริงเท่านั้น |
| **Reveal** | analysis + blueprint | ความจริงที่ Twin นำเสนอเมื่อรวบรวมข้อมูลได้เพียงพอ |

---

## 3. สาม Narrative Layers

### Layer 1 — BIG STORY (ตลอดการเดินทาง)
- "จากไหน → ตอนนี้ → กำลังไปไหน"
- ครอบคลุมจาก onboarding → evolution stage ปัจจุบัน
- Render ใน: Twin Chat REVIEW mode · ME page · JOURNEY surface (G2 §15)

### Layer 2 — CURRENT CHAPTER (สัปดาห์นี้ / phase นี้)
- Theme ของช่วงเวลาปัจจุบัน — ตั้งชื่อจาก dominant SICE patterns
- Render ใน: Today P0.2 · World detail Insight section

### Layer 3 — MICRO STORY (วันนี้)
- Story Beat เดียวที่สำคัญที่สุดของวันนี้
- Render ใน: Today header · Twin greeting

---

## 4. Rhythm Table — 7 Moments × Story Function

| Moment | Story Function | ข้อมูลที่ต้องมีก่อน |
|--------|---------------|-------------------|
| Landing (first visit) | Hook: "What if you could finally understand why you make the decisions you do?" | ไม่ต้องการข้อมูล — แค่ copy |
| Onboarding Q&A | Collection: รวบรวม raw material สำหรับ Reveal แรก | ไม่ต้องการข้อมูลก่อนหน้า |
| Core Awakening | Birth: Twin ถือทุกอย่างที่รวบรวมมา | blueprint complete |
| Twin Birth (first message) | First Reveal: **ห้าม** "Hi!" — ต้อง reference real analysis | SICE analysis + blueprint |
| Today (returning user) | Micro Story: สิ่งที่เกิดขึ้นนับจาก session ที่แล้ว | twin_memories / daily_brief |
| World entry | Chapter frame: World นี้เชื่อมกับ pattern ปัจจุบันอย่างไร | SICE patterns confirmed |
| Evolution stage change | Chapter close / open: บทเก่าถูกตั้งชื่อ บทใหม่เปิดขึ้น | evolution_stage delta |

---

## 5. ห้า Story Modes (map กับ §8 TWIN MODES)

| Mode | Trigger | Twin พูด |
|------|---------|----------|
| **REVEAL** | Blueprint complete / major pattern confirmed | "I've noticed something consistent about how you handle [X]..." |
| **EXPLORE** | ผู้ใช้เข้า World | "This world connects to [pattern]. Want to see how?" |
| **CHOICE** | Decision logged | "You had a real choice here. Here's what I saw..." |
| **CONSEQUENCE** | Follow-up due / evolution delta significant | "Since [choice/date], here's what changed..." |
| **EVOLUTION** | New evolution stage reached | "Something has shifted. You're entering a new chapter." |

---

## 6. Guardrails (กฎเหล็ก — §44 safety rule ใช้บังคับ)

```
1. NO FAKE STORY
   ถ้าไม่มีข้อมูลจริง → ไม่แสดง
   ห้าม "Your Twin sensed..." โดยไม่มี SICE output จริง

2. NO GAMIFICATION
   Narrative Hook ไม่ใช่ badge / streak / point
   เป็นคำถามที่จริงใจ ไม่ใช่ reward mechanism

3. NO PARALLEL MEMORY
   Storytelling Layer อ่านจาก twin_memories / decision_logs / daily_briefs
   ห้ามสร้าง memory system คู่ขนาน

4. NO NEW INTELLIGENCE ENGINE
   SICE generate patterns ทั้งหมด
   Storytelling Layer แค่ name + sequence — ไม่ generate เอง

5. ONLY SHOW HOOK WHEN REAL DATA EXISTS
   Narrative Hook ที่อ้าง pattern ต้องการ pattern ที่ SICE confirm แล้ว
   ไม่ใช่ assume
```

---

> 📌 **หมายเหตุ:** เอกสารนี้เป็นแผน — ยังไม่ใช่โค้ดที่ ship
> Implementation จะเกิดขึ้นใน Track C Phase 3/6/8/9/10/11/G2 ตามลำดับ
> ทุก phase ต้องอ้าง §51 + ตาราง mapping ในเอกสารนี้
> ก่อน implement ให้ถามก่อนว่า: "ข้อมูลนี้มาจาก SICE จริงไหม?" — ถ้าไม่ใช่ → ไม่ทำ

---

## ตรวจสถานะจริงซ้ำเทียบโค๊ด — 8 ก.ย. 2026

> ตรวจหลัง Track C Phase 1-12 ทำเสร็จรอบก่อน — คำถามคือ "Story Layer ถูก implement จริงแค่ไหน"

**สรุปตรง ๆ: Story/Narrative Layer ไม่เคยถูกสร้างเป็นระบบ** (ไม่มี Chapter/Story Beat/Narrative
Hook/Choice/Consequence/Reveal เป็น component หรือ data model จริง ไม่มี 3 Narrative Layers,
ไม่มี Rhythm Table logic, ไม่มี 5 Story Modes ที่ทำงานจริง) สิ่งที่เกิดขึ้นจริงในรอบที่ผ่านมาคือการแก้
**จุดที่ละเมิด guardrail "NO FAKE STORY" (ข้อ 1)** เป็นจุด ๆ ไม่ใช่การสร้างประสบการณ์เล่าเรื่องตามตาราง
mapping ด้านบน:

| Phase | ตารางนี้ขอ | สิ่งที่ทำจริง | ครบไหม |
|-------|-----------|---------------|--------|
| 1 (Landing) | narrative continuity ไป Onboarding | ไม่ได้แตะ — นอก scope ที่ระบุไว้ท้ายเอกสารอยู่แล้ว | ❌ ยังไม่ทำ |
| 2-3 (Onboarding) | Story Beat ต่อเนื่องทุกขั้นตอนว่า "Twin กำลังเรียนรู้จากคุณ" | มีประโยคเดียว (`Onboarding.tsx:638` ขั้นเลือกอารมณ์) ไม่ใช่ thread ต่อเนื่อง | 🟡 บางส่วน |
| 4 (Analysis) | reveal มี pacing ทางอารมณ์ | ไม่ได้แตะ — นอก scope ที่ระบุไว้ท้ายเอกสารอยู่แล้ว | ❌ ยังไม่ทำ |
| 6 (Twin Birth) | First message จาก real analysis เสมอ | ✅ `groundedInsight` จาก `personalIntel.insights[0]` จริง + ProvenanceStrip แสดงที่มา | ✅ ทำแล้ว |
| 8 (Today) | Narrative Hook จากข้อมูลจริงเท่านั้น | ✅ DailyBrief ใช้ confidence/evidenceCount จริงแล้ว (เดิม hardcode) | 🟡 guardrail ผ่าน แต่ไม่มี "hook" แบบเรื่องเล่าจริง |
| 9 (Worlds) | World = scene ในเรื่อง มี Story/Pattern/Reflection/Decision | มี Twin visual แล้ว แต่ยังไม่มี 4 ส่วนนี้แยกชัดต่อ World | 🟡 บางส่วน |
| 10 (Twin Modes) | Choice → Consequence surfacing | ยังไม่มี — Reflect/Decide ยัง disabled (ต้องมี data หนุนตามที่เอกสารกำหนดไว้เอง) | ❌ รอ P1.8 |
| 11 (Memory) | Memory Questions จาก choice/pattern ที่ยังไม่ตอบ | ✅ เพิ่มแล้ว — คำถามจาก decision ที่ยังไม่มี outcome (ข้อมูลจริง ไม่ปั้น) | ✅ ทำแล้วบางส่วนของ scope |

**ทำไมยังไม่ทำเต็ม:** Track C Phase 1-12 ที่อนุมัติไปเป็น "recompose ของจริงที่มีอยู่ + ปิด gap เชิง
โครงสร้าง/ความถูกต้องของข้อมูล" ไม่ใช่ "สร้าง storytelling engine ตามเอกสารนี้" สอง scope นี้ทับซ้อนกัน
บางจุดเท่านั้น (Twin Birth, Memory Questions) — ถ้าต้องการ Story Layer เต็มรูปแบบ ต้องเปิดเป็น
งานใหม่ที่มี change budget ของตัวเอง ไม่ใช่ผลพลอยได้จาก Track C
