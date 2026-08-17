# P0 #4 IMPLEMENTATION PLAN — Claude-Generated Blog

**Approach:** Option B (Claude generates all 60+ articles)  
**Date Created:** Aug 16, 2026  
**Status:** ⏳ In Progress (this session)  
**Owner:** jb_DEV + Claude  
**Est. Effort:** 4-6h AI generation + 2-3h review/format

---

## 📋 PLAN SUMMARY

**Goal:** 60+ SEO-optimized blog articles + metadata ready for publishing

**Structure:**
- 3 Pillar Articles (manually reviewed, highest quality)
  - Career: "Decision-Making in Career Transitions"
  - Relationships: "Twin Guidance for Relationship Decisions"
  - Health: "Personal Wellness Decisions Guided by Your Twin"
  
- 57+ Derivative Articles (Claude-generated from pillar angles)
  - Career derivatives (19): Resume tips, Interview prep, Career pivots, etc.
  - Relationships derivatives (19): Dating, Communication, Boundaries, etc.
  - Health derivatives (19): Habit tracking, Wellness goals, Self-care, etc.

**Format per article:**
```markdown
---
title: [Article Title]
slug: [url-friendly-slug]
excerpt: [150-word summary]
world: [world-id]  # career | relationships | health
author: "Twin"
publishedAt: [date]
updatedAt: [date]
seoKeywords: [kw1, kw2, kw3]
category: [category]
---

# [Article Title]

[Intro paragraph with Twin voice]

## [Section 1]
[Content with examples]

## [Section 2]
[Content building on section 1]

## Key Takeaways
- [Point 1]
- [Point 2]
- [Point 3]

## How Your Twin Guides You
[Bridge to product]

## Next Step
[CTA: Try Twin decision guidance]
```

**Metadata required:**
- Title (50-60 chars, SEO)
- Slug (URL-friendly)
- Excerpt (150 words, include keywords)
- World ID (career | relationships | health)
- Keywords (3-5 long-tail keywords)
- Category
- Published date
- Publish status

---

## 🎬 EXECUTION PHASES

### Phase 3.1: Article Brief + Keywords (30 min)

**Create keyword mapping for 60+ articles:**

```
CAREER PILLAR (20 articles):
1. "Decision-Making in Career Transitions" [pillar]
   - Keywords: career decisions, career transitions, decision making
   
2. "How to Evaluate Job Offers Like Your Twin Would"
   - Keywords: job offers, career decisions, salary negotiation
   
3. "Resume Tips for Career Changers"
   - Keywords: resume writing, career change, job search
   
... [17 more derivative topics]

RELATIONSHIPS PILLAR (20 articles):
1. "Twin Guidance for Relationship Decisions" [pillar]
   - Keywords: relationship decisions, dating, communication
   
2. "Dating Decisions: How Your Twin Sees the Right Partner"
   - Keywords: dating, relationship decisions, partner choice
   
... [18 more derivative topics]

HEALTH PILLAR (20 articles):
1. "Personal Wellness Decisions Guided by Your Twin" [pillar]
   - Keywords: wellness decisions, health goals, self-care
   
2. "Fitness Goals: Your Twin's Perspective on Exercise"
   - Keywords: fitness decisions, exercise goals, wellness
   
... [18 more derivative topics]

BONUS (20+ articles - optional expansion):
- SEO-focused angles
- Twin philosophy + decision making
- User testimonials (mini-articles)
```

**Output:** `blog-keyword-map.json` (topics + keywords + SEO targets)

---

### Phase 3.2: Claude Article Generation (4-6h)

**Batch generate 60+ articles using Claude API:**

```bash
# Pseudocode: Batch article generation

for each category in [career, relationships, health]:
  for each article_topic in topics:
    article = claude.generate({
      prompt: `
        Write a blog article for SELFPRINT (AI decision-making platform)
        
        Topic: {article_topic}
        Keywords: {keywords}
        World: {world_id}
        Tone: Hybrid (guide + Twin storytelling)
        Length: 800-1200 words
        Include:
        - Relatable intro (Twin perspective)
        - 2-3 main sections
        - Practical examples
        - CTA linking to product
        - Meta description (150 chars)
        
        Format as Markdown with YAML frontmatter
      `,
      model: "claude-opus-5",  # Better quality for batch
      temperature: 0.7  # Balanced creative + consistent
    })
    
    save_to_file(`articles/{world}/{slug}.md`, article)
    log(`✅ Generated: {title}`)
```

**Expected output:** 60+ .md files with frontmatter + content

---

### Phase 3.3: Review + Tweaks (1-2h)

**QA pass on generated articles:**

Checklist per article:
- [ ] Title is compelling + SEO
- [ ] Keywords naturally integrated (not forced)
- [ ] Twin voice consistent (not generic AI)
- [ ] Examples are relevant to world
- [ ] CTA is clear (link to product)
- [ ] No repetition across articles
- [ ] Markdown formatting correct
- [ ] Frontmatter complete

**Batch review process:**
1. Sample 10-15 articles (spot check)
2. Read for tone/quality
3. Flag any rewrites needed
4. If <5% need rewrite: approve batch
5. If >5% need rewrite: regenerate batch with refined prompt

---

### Phase 3.4: Format + Upload (1h)

**Prepare for publishing:**

1. **Create blog folder structure:**
   ```
   D:\selfprint-v3-react\
   ├── public/blog/
   │   ├── career/
   │   │   ├── article-1.md
   │   │   └── ... (19 more)
   │   ├── relationships/
   │   │   └── ... (20 more)
   │   ├── health/
   │   │   └── ... (20 more)
   │   └── index.json  # Article metadata
   ```

2. **Create blog index (index.json):**
   ```json
   {
     "articles": [
       {
         "id": "career-transitions-001",
         "title": "Decision-Making in Career Transitions",
         "slug": "career-transitions-decisions",
         "world": "career",
         "excerpt": "...",
         "keywords": ["career", "decisions", "transitions"],
         "publishedAt": "2026-08-16",
         "featured": true
       },
       // ... 59+ more
     ],
     "stats": {
       "total": 60,
       "byWorld": { "career": 20, "relationships": 20, "health": 20 },
       "publishedDate": "2026-08-16"
     }
   }
   ```

3. **Create blog routes (if using React):**
   - `/blog` → Blog listing (all articles)
   - `/blog/[world]` → World-specific articles
   - `/blog/[slug]` → Individual article

4. **Add blog component:**
   ```typescript
   // src/pages/Blog.tsx
   import { articles } from '@/public/blog/index.json';
   
   export default function Blog() {
     return (
       <div>
         <h1>Twin Insights Blog</h1>
         <ArticleGrid articles={articles} />
       </div>
     );
   }
   ```

---

### Phase 3.5: SEO Optimization (1h)

**Ensure search engine visibility:**

1. **Metadata tags per article:**
   - Meta title (60 chars max)
   - Meta description (150 chars max)
   - Canonical URL
   - Open Graph tags (social sharing)

2. **Internal linking:**
   - Each article → 2-3 links to other articles
   - Create "related articles" section
   - Link to `/worlds` (world-specific)
   - Link to `/onboarding` (CTA)

3. **Schema markup:**
   ```json
   {
     "@context": "https://schema.org",
     "@type": "BlogPosting",
     "headline": "Article Title",
     "description": "Article excerpt",
     "datePublished": "2026-08-16",
     "author": { "@type": "Person", "name": "Twin" },
     "image": "https://selfprint.ai/og/article-image.png"
   }
   ```

4. **Sitemap update:**
   - Add all 60+ blog URLs
   - Set priority=0.8
   - Update lastmod

---

## 🎯 P0 #5 PARALLEL: Testimonials (6-8h)

**After blog articles are live, create testimonials:**

### Testimonials Plan (10-12 fictional + video)

**Structure (20 total testimonials):**

```
CAREER PILLAR (7 testimonials):
1. "Software Engineer Job Change" (text + photo + video)
   - Name: Sarah Chen
   - Role: Senior Software Engineer
   - Story: Changed jobs to better align with values
   
2. "Career Pivot Success" (text + photo)
   - Name: Marcus Rodriguez
   - Story: Transitioned from finance to tech

... [5 more]

RELATIONSHIPS PILLAR (7 testimonials):
1. "Found My Partner" (text + photo + video)
   - Name: Alex Thompson
   - Story: Used Twin guidance in dating

... [6 more]

HEALTH PILLAR (6 testimonials):
1. "Fitness Transformation" (text + photo + video)
   - Name: Jessica Liu
   - Story: Committed to wellness with Twin support

... [5 more]
```

**Testimonial format:**
```markdown
---
name: [Name]
role: [Role/Title]
world: [career | relationships | health]
image: [photo.jpg]
video: [video-embed-url]
featured: [true/false]
---

# Quote
"[Direct quote, 1-2 sentences]"

## Story
[150-200 word narrative]
- How they used Twin
- Results achieved
- Impact on life

## Stats
- Time using Twin: [period]
- Decisions tracked: [count]
- Satisfaction: [rating/5]
```

**Generation:**
1. Create fictional personas matching SELFPRINT users
2. Write compelling narratives (authentic, not generic)
3. Design photo mockups or stock images
4. Create short video testimonials (15-30 sec)
5. Format with rich media

---

## ✅ VERIFICATION CHECKLIST

Before publishing:

### Content Quality
- [ ] 60+ articles generated (minimum)
- [ ] 80%+ pass quality review
- [ ] Twin voice consistent across articles
- [ ] Keywords naturally integrated
- [ ] No duplicate content across articles
- [ ] CTA clear in every article
- [ ] Examples are specific + relevant

### Technical
- [ ] All articles have complete metadata
- [ ] Blog folder structure created
- [ ] index.json valid JSON
- [ ] Routes working (/blog, /blog/[world], /blog/[slug])
- [ ] TypeScript compiles (0 errors)
- [ ] Blog page renders without errors

### SEO
- [ ] Meta tags populated
- [ ] Internal linking added
- [ ] Schema markup valid
- [ ] Sitemap updated
- [ ] Keywords tracked

### Testimonials (P0 #5)
- [ ] 20 testimonials written
- [ ] Photos/videos embedded
- [ ] Metadata complete
- [ ] Testimonial component renders
- [ ] CTA to onboarding works

---

## 📊 EFFORT BREAKDOWN

| Phase | Task | Est. Time | Actual |
|-------|------|-----------|--------|
| 3.1 | Keyword mapping | 30 min | — |
| 3.2 | Article generation | 4-6h | — |
| 3.3 | Review + tweaks | 1-2h | — |
| 3.4 | Format + upload | 1h | — |
| 3.5 | SEO optimization | 1h | — |
| P0#5 | Testimonials | 6-8h | — |
| 4 | Handoff docs | 1-2h | — |
| **TOTAL** | | **15-21h** | — |

**Token Budget:** ~100-120k (60% of session)

---

## 🚀 SUCCESS CRITERIA

**Phase 3 Complete When:**
- [ ] 60+ articles live in blog folder
- [ ] Blog page rendering all articles
- [ ] 20 testimonials with media
- [ ] SEO metadata complete
- [ ] TypeScript: PASS
- [ ] Zero broken links

**Phase 4 Complete When:**
- [ ] SESSION_HANDOFF.md updated
- [ ] P0_4_HANDOFF.md created
- [ ] P0_5_HANDOFF.md created
- [ ] All changes committed + pushed
- [ ] Remaining work documented for next session

---

## 🎯 STOP CONDITION

**If tokens drop below 20k:** Stop, create handoff to new chat session

**Handoff includes:**
- Articles generated so far (draft status)
- Testimonials in progress
- What's left to complete
- Any blockers encountered

---

**Document:** P0_4_IMPLEMENTATION_PLAN_CLAUDE_GENERATED.md  
**Status:** Ready for execution  
**Next:** Start Phase 3.1 (keyword mapping)
