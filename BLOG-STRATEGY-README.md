# 📚 SELFPRINT Blog Content Strategy

## ภาพรวม

ไฟล์ `blog-content-strategy.json` เป็น **Content Repository** สำหรับ SELFPRINT Blog ที่ออกแบบให้ AI (LLM) เขียนบทความต่อได้ทันที พร้อมคีย์เวิร์ด + outline + prompt ที่เตรียมไว้แล้ว

### จุดประสงค์

- ✅ ครอบคลุม SEO/AEO/GEO จากมุมมองหลากหลาย (3 หมวด 25 บทความ)
- ✅ สามารถให้ AI เขียนบทความได้ทันที (มี aiPrompt พร้อมใช้)
- ✅ ลำดับการโพสต์ตามหลัก Funnel (Awareness → Education → Conversion)
- ✅ เน้นการ Educate ไม่ใช่การโฆษณา

---

## โครงสร้าง 3 หมวด

### 📍 หมวดที่ 1: ชนสายมูโดยตรง (4 บทความ)

**ที่อยู่**: `cat-1` ใน JSON

**ฟังก์ชัน**: ยั่วดังให้ผู้หลงใจในทำนาย/มงคล ค่อยๆ เข้าสู่วิทยาศาสตร์ ≈ **Awareness + Intrigue**

**บทความ**:
1. `article-1-1` — ปีชง vs พฤติกรรมจริง
2. `article-1-2` — สีเสื้อมงคล = จิตวิทยาสี (12 มิติ)
3. `article-1-3` — ราหูเล็ง vs Blind Spots (Johari Window)

---

### 📖 หมวดที่ 2: เจาะลึกฟีเจอร์ความล้ำ (5 บทความ)

**ที่อยู่**: `cat-2` ใน JSON

**ฟังก์ชัน**: อธิบาย SELFPRINT Features (AI Twin, 12 SICE, Initial State Matrix) แบบ Educational ≈ **Education + Expertise**

**บทความ**:
1. `article-2-1` — AI Twin คืออะไร
2. `article-2-2` — 12 มิติพฤติกรรมอธิบายแบบไม่ Heavy Math
3. `article-2-3` — Initial State Matrix (Hunter vs Planner)
4. `article-2-4` — AI Twin ช่วยทดลองตัดสินใจ
5. `article-2-5` — 12 SICE Engines เบื้องหลังอัลกอริทึม

---

### ✨ หมวดที่ 3: แก้ปัญหาชีวิตจริง (8 บทความ)

**ที่อยู่**: `cat-3` ใน JSON

**ฟังก์ชัน**: ตรงต่อความเจ็บปวด + เสนอวิธี SELFPRINT ≈ **Problem-Solving + Conversion**

**บทความ**:
1. `article-3-1` — Decision Fatigue: ทำไมตัดสินใจยาก
2. `article-3-2` — Career Fit: อาชีพไหนเหมาะกับคุณ
3. `article-3-3` — Blind Spots: ปัญหาซ่อน
4. `article-3-4` — Relationship Matrix: เข้าใจคู่รัก
5. `article-3-5` — Personal Development แบบถูกจุด
6. `article-3-6` — Crisis Decision: ตัดสินใจตอนเครียด
7. `article-3-7` — ทำไมอ่านหนังสือไม่เปลี่ยน
8. `article-3-8` — Overthinking → Systems Thinking

---

## วิธีใช้ `blog-content-strategy.json`

### 1️⃣ เลือกบทความ

```json
{
  "articleId": "article-1-1",
  "title": "ปีชงหรือพฤติกรรมชง?...",
  "primaryKeywords": ["ปีชง", "พฤติกรรม", ...],
  "aiPrompt": "เขียนบทความอ่านสนุก ไม่น้อยกว่า 1200 คำ..."
}
```

### 2️⃣ Copy `aiPrompt` + `outline`

```
Prompt:
"เขียนบทความอ่านสนุก ไม่น้อยกว่า 1200 คำ เรื่องความแตกต่างระหว่าง 'ปีชง' กับ 'พฤติกรรมจริง'..."

Outline:
- Headline Hook
- Section 1: ปีชงโปรโตคอล + Barnum Effect
- Section 2: พฤติกรรมจริง
- ...
```

### 3️⃣ Feed เข้า LLM (Claude / ChatGPT)

```
ระบบ: คุณเป็นนักเขียนบล็อก SELFPRINT
ผู้ใช้: [ใส่ aiPrompt + outline ที่ copy มา]
```

### 4️⃣ LLM เขียนบทความ เสร็จ

LLM จะ:
- ติดตาม outline ที่ให้ไป
- ใส่ internal link ไปฟีเจอร์ (เช่น '12 SICE explained')
- เพิ่ม CTA ไปยังหน้า Quiz/Trial
- โครงสร้างแบบ Hook → Body → CTA

### 5️⃣ Human Editor

- ✅ ตรวจข้อเท็จจริง (Fact-check)
- ✅ ปรับ SEO (Meta description, Alt text images)
- ✅ ใส่ Schema markup (FAQ schema, Article schema)
- ✅ Internal link ที่ LLM ลืม
- ✅ Publish

---

## คีย์เวิร์ดกลยุทธ์

### Tier 1: Brand Keywords
- `SELFPRINT`
- `12 SICE`
- `AI Twin`
- `พฤติกรรม AI`

### Tier 2: Problem Keywords
- `ทายใจ`
- `พัฒนาตัวเอง`
- `การตัดสินใจ`
- `ความรัก`
- `อาชีพ`

### Tier 3: Long-Tail Keywords
- `ทำนายดวง 2025`
- `จิตวิทยาสี`
- `Decision Fatigue`
- `Blind Spots พฤติกรรม`
- `Attachment Style`

**Strategy**: ใส่ Tier 1 ทุกบทความ + Tier 2 ตามหมวด + Tier 3 ตาม LSI

---

## Publishing Funnel

### Phase 1: Awareness (หมวด 1)
**อาการ**: ผู้คนหลงไหล ทำนาย  
**บทความ**: ปีชง, สีมงคล, ราหู  
**CTA**: "อ่านต่อ SELFPRINT คืออะไร"

### Phase 2: Education (หมวด 2)
**อาการ**: ผู้คนเข้าใจ Features  
**บทความ**: AI Twin, 12 SICE, Matrix  
**CTA**: "ลองสแกนของคุณ"

### Phase 3: Conversion (หมวด 3)
**อาการ**: ผู้คนเจออะไรที่ตรงกับปัญหา  
**บทความ**: Career, Relationship, Decision  
**CTA**: "ทำการสแกน SELFPRINT ตอนนี้"

---

## SEO Checklist (ต่อ Editor)

- [ ] Meta description (150-160 chars)
- [ ] Title tag (50-60 chars)
- [ ] H1 (หนึ่งตัวเท่านั้น)
- [ ] LSI keywords (ถูกซ้ำ 5-8 ครั้ง)
- [ ] Internal link (3-5 ที่ดี)
- [ ] Image alt text
- [ ] Schema markup (Article + FAQ)
- [ ] URL slug (keyword-based)
- [ ] Reading time visible
- [ ] Mobile-friendly preview

---

## Internal Link Targets

**ควร link ไปหน้าเหล่านี้:**
- `/features/ai-twin` (AI Twin Explanation)
- `/quiz/personality` (12 SICE Quiz)
- `/matrix/initial-state` (Initial State Matrix)
- `/features/blind-spots` (Blind Spots Scanner)
- `/pricing` (ทีหลัง)

---

## Article Formatting Template

```markdown
# [Title]

[Engaging Lead Paragraph]

## [Section 1]
...

## [Section 2]
...

> **Key Insight**: [Memorable takeaway]

## [Section 3]
...

---

## How SELFPRINT Helps

[1-2 paragraph เชื่อมกับ SELFPRINT]

---

## Next Step

[CTA to quiz/scan/trial]
```

---

## Content Tone Guidelines

### ✅ DO:
- Educate first, promote later
- Use storytelling + data
- Be relatable (use 'you', 'your')
- Empathetic (&ne; ที่โกหก)
- Question-driven structure

### ❌ DON'T:
- Marketing-heavy opening
- Jargon-heavy without explanation
- Condescending tone
- Clickbait titles
- Make claims without evidence

---

## Example: Full Workflow

```
1. Editor picks: article-3-1 (Decision Fatigue)
2. Copies aiPrompt + outline
3. Feeds to Claude:
   "Please write a 1300+ word article about Decision Fatigue...
    Follow this outline: Hook, Section 1, Section 2..."
4. Claude writes 1400 words
5. Editor:
   - Fact-checks claims
   - Adds meta description
   - Inserts 4 internal links
   - Adds FAQ schema
   - Uploads images
   - Publishes
6. Result: Article ranks for "Decision Fatigue", "Choice Overload", "Decision Paralysis"
```

---

## Metrics to Track

```
Per Article:
- Organic traffic (first month)
- Time on page (avg)
- Scroll depth
- Click-through rate to quiz/trial
- Bounce rate
- Ranking position (primary keyword)

Overall Blog:
- Monthly organic sessions
- Conversion rate (article → trial)
- Backlink growth
- Domain authority trend
```

---

## Questions?

**Contact**: [Dev Team / Content Lead]

**Repository Location**: `D:\selfprint-v3-react\blog-content-strategy.json`

---

**Last Updated**: 2026-08-27  
**Next Review**: 2026-09-27 (Monthly review of performance)
