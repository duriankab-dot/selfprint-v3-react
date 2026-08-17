# P0-D Phase 3: Content Strategy & Blog Setup

**สถานะ:** IN PROGRESS
**วันที่:** 2026-08-17
**ลำดับ:** Phase 3 / 5

---

## 🎯 **3 Pillar Topics for Selfprint**

### **Pillar 1: "Making Better Decisions with AI"**
**Primary Keyword:** AI-powered decision making | ตัดสินใจด้วย AI  
**Target Audience:** Career changers, life planners  
**Keyword Volume:** 5k-10k/mo  

#### Supporting Content:
1. **Blog Article:** "5 Decision-Making Patterns That Hold You Back"
   - URL: `/blog/decisions/patterns-holding-back`
   - Word count: 1,500-2,000
   - Internal links: 3-5 to /worlds/decision, /pricing
   - Keywords: decision patterns, blind spots, AI insights

2. **Blog Article:** "How AI Predicts Your Future Decisions Better Than Intuition"
   - URL: `/blog/decisions/ai-prediction-accuracy`
   - Word count: 1,500-2,000
   - Internal links: 3-5 to /worlds/career, /faq
   - Keywords: AI prediction, confidence-rated decisions, future scenarios

3. **Pillar Page:** (Homepage extension)
   - Link from homepage H2: "ทำไมต้องใช้ SELFPRINT?"
   - 3+ internal links to blog articles

---

### **Pillar 2: "Twin Chat for Personal Growth"**
**Primary Keyword:** AI Twin chat | พูดคุยกับ AI Twin ของคุณ  
**Target Audience:** Self-improvement seekers, life explorers  
**Keyword Volume:** 3k-8k/mo  

#### Supporting Content:
1. **Blog Article:** "Your AI Twin Knows You Better Than Anyone Else"
   - URL: `/blog/ai-twin/understand-yourself`
   - Word count: 1,500-2,000
   - Internal links: 3-5 to /worlds/self, /worlds/growth
   - Keywords: AI twin, self-understanding, personal insights

2. **Blog Article:** "From Confusion to Clarity: How Twin Chat Accelerates Personal Growth"
   - URL: `/blog/growth/twin-chat-acceleration`
   - Word count: 1,500-2,000
   - Internal links: 3-5 to /worlds/mind, /worlds/wellbeing
   - Keywords: personal growth, AI conversation, clarity

3. **Pillar Page:** (Dedicated page)
   - New route: `/growth-twin-chat`
   - Video + CTA
   - Internal links to blog articles + worlds pages

---

### **Pillar 3: "Digital Companion Benefits"**
**Primary Keyword:** Digital companion | เพื่อนดิจิทัล AI  
**Target Audience:** Isolated individuals, busy professionals  
**Keyword Volume:** 2k-5k/mo  

#### Supporting Content:
1. **Blog Article:** "Why Modern Thailand Needs a Digital Companion"
   - URL: `/blog/companion/thailand-modern-life`
   - Word count: 1,200-1,500
   - Internal links: 3-5 to /pricing, /compare
   - Keywords: digital companion, mental health support, Thai culture

2. **Blog Article:** "AI Companion vs. Human Coach: Which One Should You Choose?"
   - URL: `/blog/companion/ai-vs-human-coach`
   - Word count: 1,500-2,000
   - Internal links: 3-5 to FAQ, /compare, /pricing
   - Keywords: AI companion, life coaching, personal support

---

## 📅 **Content Calendar (3 Months)**

### **Month 1: August-September 2026**
**Focus:** Pillar 1 + Initial blog launch

| Week | Article | Pillar | Status |
|------|---------|--------|--------|
| W1 (Aug 17-23) | 5 Decision Patterns | Pillar 1 | DRAFT |
| W2 (Aug 24-30) | AI Prediction Accuracy | Pillar 1 | DRAFT |
| W3 (Sep 1-6) | Your AI Twin Knows You | Pillar 2 | PLAN |
| W4 (Sep 7-13) | Twin Chat Acceleration | Pillar 2 | PLAN |

### **Month 2: September-October 2026**
**Focus:** Pillar 2 + Pillar 3 launch

| Week | Article | Pillar | Status |
|------|---------|--------|--------|
| W5 (Sep 14-20) | Thailand Needs Digital Companion | Pillar 3 | PLAN |
| W6 (Sep 21-27) | AI vs Human Coach | Pillar 3 | PLAN |
| W7 (Oct 1-4) | Publish Pillar 1 Hub | Pillar 1 | PLAN |

### **Month 3: October-November 2026**
**Focus:** Guest posts + In-depth guides

| Week | Article | Type | Status |
|------|---------|------|--------|
| W8-9 | Extended guides | LONG-FORM | PLAN |
| W10-12 | Guest collaborations | EXTERNAL | PLAN |

---

## 🔗 **Internal Linking Strategy**

### **Linking Hierarchy**
```
Homepage (/)
├── /pricing (2 internal links)
├── /faq (2 internal links)
├── /worlds/* (linking hub, 8-10 pages)
│   ├── /worlds/decision (link to blog/decisions/*)
│   ├── /worlds/self (link to blog/ai-twin/*)
│   ├── /worlds/growth (link to blog/growth/*)
│   ├── /worlds/career (link to blog/decisions/*)
│   └── ... (other worlds)
└── /blog/* (content hub)
    ├── /blog/decisions/* (link to /worlds/decision, /worlds/career)
    ├── /blog/ai-twin/* (link to /worlds/self, /worlds/growth)
    ├── /blog/companion/* (link to /pricing, /worlds/wellbeing)
    └── Blog list page (link to all articles)
```

### **Linking Guidelines**
1. **Homepage** links to:
   - `/blog` (blog hub)
   - Top 2-3 pillar articles (in CTA section)
   - `/pricing` (conversion)

2. **Each Blog Article** links to:
   - 3+ internal pages (worlds, other articles, pricing)
   - Use contextual anchor text (not "click here")
   - Avoid over-linking (max 5% of content)

3. **Worlds Pages** link to:
   - Related blog articles (contextual)
   - Other worlds (thematic connection)
   - `/blog` hub

4. **Pillar Pages** link to:
   - Related blog articles (cluster)
   - FAQ section
   - `/pricing` CTA

---

## 📊 **SEO Metrics Target (3 Months)**

| Metric | Current | Target (Month 3) |
|--------|---------|------------------|
| Indexed pages | 10 | 25+ |
| Organic visitors/day | 0 | 15+ |
| Blog articles | 0 | 6+ |
| Avg engagement time | N/A | 2:30+ |
| Click-through rate | N/A | 3-5% |
| Internal link clicks | N/A | 20+ |

---

## 🛠️ **Implementation Files to Create**

### **Blog Component**
```typescript
// src/components/BlogList.tsx
- Display article cards (title, excerpt, date, tags)
- Pagination (3-5 articles per page)
- Filtering by category
- Related articles sidebar
```

### **Blog Template**
```typescript
// src/pages/blog/[slug].tsx
- Article layout
- Author info + date + reading time
- Table of contents (for >1500 word articles)
- Internal links CTA
- Related articles section
```

### **Blog Metadata**
```typescript
// src/lib/blogArticles.ts
- List of all articles (title, slug, category, date, etc.)
- Schema markup generator for BlogPosting
- Excerpt extraction
```

### **Sitemap Update**
```xml
// public/sitemap.xml (add)
<url>
  <loc>https://selfprint.one/en/blog</loc>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://selfprint.one/en/blog/decisions/patterns-holding-back</loc>
  <priority>0.7</priority>
</url>
```

---

## ✅ **Content Quality Checklist**

Each article must have:
- ✅ Primary keyword in title (< 60 chars)
- ✅ Secondary keywords in H2s
- ✅ 3+ internal links (contextual)
- ✅ 1+ image with alt text
- ✅ 150-160 char meta description
- ✅ Table of contents (if > 1500 words)
- ✅ CTA at end (link to /pricing or related article)
- ✅ Schema markup (BlogPosting + FAQPage if applicable)
- ✅ Mobile-friendly formatting (short paragraphs, bullet points)
- ✅ Proofreading (Thai + English versions if bilingual)

---

## 🚀 **Next Steps (Phase 4)**

1. Create blog components (BlogList, blog template)
2. Write first 6 blog articles
3. Verify schema markup
4. Test internal linking
5. Submit updated sitemap to GSC

---

**Status:** Ready for implementation  
**Priority:** HIGH (Pillar 1 articles first)  
**Timeline:** Start Week 1 of September
