# SEO_AEO_GEO_SPEC.md — สเปคการค้นหาและ AI-Readiness
**VERSION: 1.0 | LAST_UPDATED: 2026-09-25**  
**เกี่ยวข้อง: TC-109, TC-110, TC-111, TC-206, TC-207, TC-209, TC-210, TC-211**  
**สถานะ: IMPLEMENTED เสร็จสมบูรณ์ (เฟส 1-2)**

---

## 🎯 วัตถุประสงค์

ให้ SELFPRINT ถูกค้นพบและ**ถูกอ้างอิง**โดย:
1. **SEO** — Google/ค้นหาทั่วไป (sitemap + hreflang + meta ต่อหน้า)
2. **AEO** — Answer Engines (Google Rich Results, ผู้ช่วยเสียง) ผ่าน structured data
3. **GEO** — AI engines (Gemini/ChatGPT/Perplexity) อ้างอิงข้อความของเราได้ (citable facts + entity dictionary)

---

## 🧱 ชั้น Library — `src/lib/schemas.ts` (TC-007, เฟส 0)

Typed builders ทั้งหมด (pure, bilingual {th,en}): `SoftwareApplication`, `BlogPosting`, `FAQPage`, `QAPage`, `HowTo`, `Speakable`, `Organization`, `Product`, `AggregateRating`, `Article`, `TechArticle`, `ContactPage`, `LocalBusiness`, `DefinedTermSet` + composition helpers (`withSpeakable`, `withHreflang`, `withGeo`) + **`ENTITY_DICTIONARY`** + **`createAIContentBlock`**

## 🧱 Page Composites — `src/lib/aeoSchemas.ts` (เฟส 1-2)

Builder ระดับหน้า — pure function ของ (ภาษา, ข้อมูล) เท่านั้น:

| Builder | ใช้ที่ | เนื้อหา |
|---------|--------|---------|
| `landingHowToSchema` (TC-109) | LandingPage | HowTo 3 ขั้น "สร้าง AI Twin ใน 2 นาที" (PT2M) |
| `landingSpeakableWebPage` (TC-109) | LandingPage | WebPage + Speakable selectors (`h1`, `.hero-sub`, `.sp-s2-enter h2`) |
| `onboardingQAPageSchema` (TC-110) | Onboarding | QAPage 3 คู่ถาม-ตอบของ flow Nova (ภาษาตามหน้า) |
| `dashboardSoftwareApplicationSchema` (TC-111) | Dashboard | SoftwareApplication + featureList + Offer THB 0 |
| `dailyBriefSpeakableWebPage` (TC-211) | DailyBriefPage | WebPage + Speakable (`h1`, `[data-brief-headline]`, `[data-brief-insight]`) |
| `briefToAIContentBlocks` (TC-210/211) | DailyBrief | ทุก observation → AIContentBlock JSON-LD (cap 5) — inject ตอน brief โหลด, cleanup on unmount |
| `VS FAQPage` (TC-207) | VsAstrologyPage | FAQ 3 คำถามเปรียบเทียบ (bilingual) |

**การ wire ทั้งหมดผ่าน `MetaTagManager.additionalScripts` (JSON.stringify) หรือ `<script id>` injection (DailyBrief)**

---

## 🧭 GEO — Fact + Entity (TC-209/210)

### `src/lib/geo/Fact.ts`

```ts
interface Fact {
  id: string;                    // deterministic จาก statement
  type: 'Claim' | 'Statement' | 'Recommendation' | 'Observation';
  statement: { th, en };
  evidence?: { engine, value, percentile?, confidence }  // 0..1 clamp
  entities: FactEntity[];        // เชื่อม ENTITY_DICTIONARY อัตโนมัติจาก key
  citations?: { text, url }[];   // citation-ready
  validUntil?: string;           // ความสดของข้อเท็จจริง
  lang: 'th-TH' | 'en-US';
}
```

- `buildFact()` — mint id + resolve entity schema จาก Entity Dictionary
- `factsToCitations(facts)` — แปลง fact ที่มี evidence เป็นรายการ citation ที่ชี้ `/science#<engine>`
- **กฎ TC-210: ทุก insight ของ Twin ต้อง citable** — evidence (engine + confidence) แนบทุกข้อความวิเคราะห์; DailyBrief ปล่อย AIContentBlock JSON-LD ต่อ observation จริงแล้ว

### Entity Dictionary (ใน schemas.ts)

SICE / BlindSpot / AITwin / World / DecisionPattern / GrowthTrajectory — ทุก fact อ้าง entity ผ่าน key เดียวกันทั้งไซต์ → AI engines ได้ความหมายเดียวกันทุกหน้า

---

## 🗣️ กฎภาษา — TC-206 (NO_ASTRO_LANG)

- Production meta keywords ของหน้าแรก **ไม่มีคำชะตา/ดวงอีกต่อไป**: แทนที่ `ดูดวงพฤติกรรม / AI ดูดวง / ทำนายนิสัย` → `วิเคราะห์นิสัย AI / ถอดรหัสนิสัย / Decision Intelligence`
- Gate บังคับ: `.ai/scripts/check-astro-language.cjs` — คำต้องห้าม (ดูดวง/โหราศาสตร์/ดาว/ราศี/โชค/ทำนาย) ห้ามอยู่นอก allow-list (allow-list ครอบเฉพาะหน้าเปรียบเทียบ `/vs-astrology`, engine ภายใน, หน้า segment เจาะจง)
- สถานะ gate: **ผ่าน** (รัน `npm run check:astro`)

## 🧾 Disclaimer — TC-207 (VsAstrologyPage)

- มี **Disclaimer Banner** (`role="note"`, testid `vs-astrology-disclaimer`) ก่อนตารางเปรียบเทียบ: ระบุชัดว่า SELFPRINT คือ Behavioral Science / Decision Intelligence **ไม่ใช่การทำนายโชคชะตา ไม่ใช่คำแนะนำทางการแพทย์/จิตเวช/การเงิน**
- มีตารางเปรียบเทียบ + FAQ schema (Rich Results eligible)

---

## 🧪 การทดสอบ + Gates

- `src/lib/__tests__/geoFact.test.ts` — 8 tests (Fact id/entity/citations + builder ทุกตัว TH/EN)
- `npm run check:astro` — ผ่าน (0 violations นอก allow-list)
- Rich Results: โครง JSON-LD ตรงตาม spec (HowTo/QAPage/FAQPage/SoftwareApplication/WebPage+Speakable) — ตรวจซ้ำได้ด้วย Google Rich Results Test เมื่อ deploy

## 📌 หน้าที่ครอบคลุมแล้ว (เฟส 1-2)

LandingPage (FAQ+HowTo+Speakable+SoftwareApplication), Onboarding (QAPage), Dashboard (SoftwareApplication), DailyBriefPage (Speakable + AIContentBlock ต่อ insight), VsAstrologyPage (Article + FAQPage + disclaimer) — เหลือหน้า content (Blog/Science/Pricing/FAQ/About/Contact) เป็นงานเฟส 3 ตามแผน TC-306..311