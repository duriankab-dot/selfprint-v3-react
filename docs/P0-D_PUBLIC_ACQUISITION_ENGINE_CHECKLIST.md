# P0-D: PUBLIC ACQUISITION ENGINE (SEO/GEO) CHECKLIST

**Date:** 2026-08-17  
**Status:** PARTIAL → Target: VERIFIED  
**Effort:** 8-10 hours  
**Blocker Level:** CRITICAL (Release Gate)

---

## 📋 OVERVIEW

Selfprint needs a production-grade public acquisition engine to:
1. Be discovered in Google, Bing, ChatGPT, Claude, Perplexity
2. Appear in rich snippets and knowledge panels
3. Support multiple languages (English, Thai)
4. Convert searchers into signups

**Current State (from 2026-08-17 audit):**
- ✅ Landing page exists
- ✅ Basic metadata present (title, description, OG tags)
- ✅ Blog structure exists
- ❌ Missing: Canonical URLs, hreflang, sitemap, structured data
- ❌ Missing: Localized metadata for /th/
- ❌ Missing: Featured images, author bios, internal linking
- ❌ Missing: Global crawl strategy

**Target:** All 15 items below IMPLEMENTED and VERIFIED

---

## 1. CANONICAL URLS

### Current State
- ❌ No canonical tags on pages

### Implementation Checklist

#### 1.1 Setup Canonical Generation

**Goal:** Every page has `<link rel="canonical" href="https://selfprint.ai/en/page-slug" />`

**Files to update:**
- `src/App.tsx` — Add canonical in Helmet
- `vite.config.ts` — Ensure correct base URL
- `.env` — Set `VITE_APP_URL=https://selfprint.ai`

**Implementation:**

```typescript
// src/App.tsx
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export function App() {
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://selfprint.ai';
  const canonicalUrl = `${baseUrl}${location.pathname}`;
  
  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      {/* Rest of app */}
    </>
  );
}
```

#### 1.2 Page-Specific Canonicals

**Pattern for dynamic pages:**

```typescript
// src/pages/BlogPost.tsx
export function BlogPost({ slug }: { slug: string }) {
  const canonicalUrl = `${baseUrl}/en/blog/${slug}`;
  
  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      {/* Content */}
    </>
  );
}
```

#### 1.3 Verify Canonicals

```bash
# Test: Curl any page and look for canonical tag
curl https://selfprint.ai/en/blog/ai-twins | grep canonical

# Expected output:
# <link rel="canonical" href="https://selfprint.ai/en/blog/ai-twins" />
```

---

## 2. HREFLANG (MULTILINGUAL)

### Current State
- ❌ No hreflang tags

### Implementation Checklist

#### 2.1 Setup Language Routes

**Route structure:**
```
/ → Redirect to /en/
/en/ → English homepage
/en/blog → English blog
/en/blog/[slug] → English article

/th/ → Thai homepage
/th/blog → Thai blog
/th/blog/[slug] → Thai article
```

**Files to update:**
- `src/App.tsx` — Language-aware routing
- `.env` — Add `VITE_SUPPORTED_LANGUAGES=en,th`

#### 2.2 Add Hreflang Tags

**Goal:** Each page links to its translations

```html
<!-- /en/blog/ai-twins page -->
<link rel="alternate" hreflang="en" href="https://selfprint.ai/en/blog/ai-twins" />
<link rel="alternate" hreflang="th" href="https://selfprint.ai/th/blog/ai-twins" />
<link rel="alternate" hreflang="x-default" href="https://selfprint.ai/en/blog/ai-twins" />
```

**Implementation in React:**

```typescript
// src/App.tsx
const languages = ['en', 'th'];
const supportedLangs = ['en', 'th'];

<Helmet>
  {supportedLangs.map(lang => (
    <link
      key={lang}
      rel="alternate"
      hreflang={lang}
      href={`${baseUrl}/${lang}${pathname.replace(/^\/(en|th)/, '')}`}
    />
  ))}
  <link
    rel="alternate"
    hreflang="x-default"
    href={`${baseUrl}/en${pathname.replace(/^\/(en|th)/, '')}`}
  />
</Helmet>
```

#### 2.3 Sitemap with Hreflang

**Create:** `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Homepage -->
  <url>
    <loc>https://selfprint.ai/en/</loc>
    <lastmod>2026-08-17</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://selfprint.ai/en/" />
    <xhtml:link rel="alternate" hreflang="th" href="https://selfprint.ai/th/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://selfprint.ai/en/" />
  </url>
  
  <!-- Blog posts -->
  <url>
    <loc>https://selfprint.ai/en/blog/ai-twins</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://selfprint.ai/en/blog/ai-twins" />
    <xhtml:link rel="alternate" hreflang="th" href="https://selfprint.ai/th/blog/ai-twins" />
  </url>
  
  <!-- ... more URLs ... -->
  
</urlset>
```

**Make sitemap dynamic:**

```typescript
// api/sitemap.ts
export async function GET() {
  const pages = [
    { url: '/en/', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/th/', lastmod: new Date().toISOString().split('T')[0] },
    // ... fetch blog posts from DB
  ];
  
  const xml = generateSitemapXml(pages);
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
```

#### 2.4 Submit Sitemap to Google/Bing

- [ ] Login to Google Search Console
- [ ] Add `https://selfprint.ai/sitemap.xml`
- [ ] Submit and wait for crawl
- [ ] Check coverage (should see all URLs indexed)

---

## 3. STRUCTURED DATA (SCHEMA.ORG)

### Current State
- ❌ No structured data

### Implementation Checklist

#### 3.1 Homepage Schema

**Add:** `Organization` schema to homepage

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Selfprint",
  "description": "Living Personal Intelligence Platform",
  "url": "https://selfprint.ai",
  "logo": "https://selfprint.ai/logo.png",
  "sameAs": [
    "https://twitter.com/selfprint",
    "https://linkedin.com/company/selfprint"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@selfprint.ai"
  }
}
</script>
```

**Implementation:**

```typescript
// src/pages/Home.tsx
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Selfprint",
      // ... rest of schema
    })}
  </script>
</Helmet>
```

#### 3.2 Product/SoftwareApplication Schema

**Add to:** Product/Pricing pages

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Selfprint",
  "description": "AI that learns and understands you",
  "url": "https://selfprint.ai",
  "applicationCategory": "Artificial Intelligence",
  "downloadUrl": "https://selfprint.ai/download",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "9.99",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1240"
  }
}
</script>
```

#### 3.3 BlogPosting Schema

**Add to:** Blog post pages

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "How AI Twins Learn Your Decision Style",
  "description": "Understanding how personal AI adapts to you...",
  "image": "https://selfprint.ai/blog/ai-twins-cover.jpg",
  "datePublished": "2026-08-15",
  "dateModified": "2026-08-16",
  "author": {
    "@type": "Person",
    "name": "Sarah Chen",
    "url": "https://selfprint.ai/authors/sarah"
  },
  "articleBody": "...",
  "wordCount": 1200
}
</script>
```

#### 3.4 FAQPage Schema

**Add to:** FAQ page

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Selfprint?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Selfprint is a personal AI platform that..."
      }
    },
    // ... more FAQs
  ]
}
</script>
```

#### 3.5 Test Structured Data

```bash
# Use Google's Rich Results Test
curl -X POST https://www.google.com/webmasters/tools/rich-results-test?hl=en \
  -d "html=$(curl https://selfprint.ai/en)"

# Should show:
# ✅ Organization schema detected
# ✅ No errors or warnings
```

---

## 4. ROBOTS & CRAWL RULES

### Current State
- ❌ No robots.txt

### Implementation Checklist

#### 4.1 Create robots.txt

**Create:** `public/robots.txt`

```
User-agent: *
Allow: /
Allow: /en/
Allow: /th/

# Disallow private areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /settings/

# Disallow duplicate content
Disallow: /search?
Disallow: /*?sort=

# Allow search engines to crawl sitemaps
Sitemap: https://selfprint.ai/sitemap.xml

# Crawl delay (polite)
Crawl-delay: 1

# Block bad bots
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10
```

#### 4.2 Test robots.txt

```bash
curl https://selfprint.ai/robots.txt

# Should show public URLs allowed
```

---

## 5. PAGE METADATA (PER-ROUTE)

### Current State
- ✅ Basic metadata exists
- ❌ Not complete for all pages

### Implementation Checklist

#### 5.1 Title Tags

**Pattern:** `Page Name - Selfprint`

```
Homepage: Selfprint — Living Personal Intelligence Platform
Blog Index: Blog - AI Insights & Updates - Selfprint
Blog Post: How AI Twins Learn Your Decision Style - Selfprint
Pricing: Pricing - Choose Your Selfprint Plan
FAQ: FAQ - Common Questions About Selfprint
```

**Max 60 characters** (Google displays ~60)

#### 5.2 Meta Descriptions

**Pattern:** 155 characters max, action-oriented

```
Homepage: 
"AI that learns and understands you. Your personal intelligence companion for smarter decisions and deeper self-knowledge. Try Selfprint free today."

Blog Post:
"Discover how Selfprint's AI adapts to your unique decision-making style. Learn practical insights to improve your daily choices and achieve your goals."

Pricing:
"Simple, transparent pricing for Selfprint. Free trial, $9.99/month basic plan, $29.99/month pro. Find the perfect plan for your AI journey."
```

#### 5.3 OG Tags (Social Sharing)

```html
<meta property="og:title" content="Selfprint — Living Personal Intelligence" />
<meta property="og:description" content="AI that learns and understands you" />
<meta property="og:image" content="https://selfprint.ai/og-image.jpg" />
<meta property="og:url" content="https://selfprint.ai/en/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Selfprint" />

<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content="Selfprint — Personal AI" />
<meta property="twitter:description" content="AI that learns and understands you" />
<meta property="twitter:image" content="https://selfprint.ai/twitter-image.jpg" />
<meta property="twitter:creator" content="@selfprint" />
```

**Files to update:**
- `index.html` — Global defaults
- `src/pages/*/index.tsx` — Per-page overrides

#### 5.4 Dynamic OG Images

**For blog posts, create dynamic OG images:**

```typescript
// api/og-image.ts
export async function GET(req: Request) {
  const { title, author, image } = new URL(req.url).searchParams;
  
  // Generate image with canvas or similar
  const ogImage = generateOGImage(title, author, image);
  
  return new Response(ogImage, {
    headers: { 'Content-Type': 'image/png' },
  });
}

// Usage in blog post:
<meta property="og:image" 
      content={`/api/og-image?title=${encodeURIComponent(blogTitle)}&author=${author}`} />
```

---

## 6. BLOG & CONTENT

### Current State
- ✅ Blog structure exists
- ✅ Articles have routing
- ❌ Missing: Featured images, author bios, related articles, proper metadata

### Implementation Checklist

#### 6.1 Featured Images

**Every blog post needs:**
- Featured image (1200x630px recommended)
- Alt text (descriptive)
- Optimized (WebP + JPEG fallback)

```typescript
// src/components/BlogPost.tsx
export function BlogPost({ post }: { post: BlogPost }) {
  return (
    <>
      <img
        src={post.featuredImage}
        alt={post.featuredImageAlt}
        width={1200}
        height={630}
      />
      {/* Article content */}
    </>
  );
}
```

#### 6.2 Author Bios

**Create:** `src/data/authors.ts`

```typescript
export const authors = {
  'sarah-chen': {
    name: 'Sarah Chen',
    bio: 'AI researcher and Selfprint co-founder...',
    image: '/authors/sarah.jpg',
    social: {
      twitter: '@sarahchen',
      linkedin: '/in/sarahchen',
    },
  },
};
```

**Display on:** Every blog post

```html
<div class="author-bio">
  <img src={author.image} alt={author.name} />
  <div>
    <h3>{author.name}</h3>
    <p>{author.bio}</p>
    <a href={author.social.twitter}>Twitter</a>
  </div>
</div>
```

#### 6.3 Related Articles

**Show:** 3-4 related articles at bottom of each post

```typescript
// Logic: Find posts with similar tags
const relatedPosts = allPosts
  .filter(p => p.id !== currentPost.id)
  .filter(p => p.tags.some(t => currentPost.tags.includes(t)))
  .slice(0, 4);
```

#### 6.4 Internal Linking

**Strategy:**
- Link relevant articles from content
- Add "Further Reading" section
- Link to product pages from blog

**Example:**
```markdown
# Blog Post: "AI Twins Learn Your Decision Style"

...content...

👉 **Next:** [How AI Memory Works →](/en/blog/ai-memory-explained)
👉 **See also:** [Create Your Twin](/en/app)
```

---

## 7. PERFORMANCE & MOBILE

### Current State
- ✅ PWA exists
- ⏳ Performance baseline established
- ❌ Not optimized for SEO

### Implementation Checklist

#### 7.1 Lighthouse Audit

```bash
npm run build && npm run preview

# Visit: https://pagespeed.web.dev
# Test: https://selfprint.ai/en
# Target: All scores ≥ 90
```

**Focus areas:**
- Performance: < 2.5s LCP
- Accessibility: Alt text on all images, proper heading hierarchy
- Best Practices: Secure (HTTPS ✓), no console errors
- SEO: Mobile-friendly ✓, canonical ✓, meta tags ✓

#### 7.2 Mobile Responsiveness

```bash
# Test mobile rendering
curl -I https://selfprint.ai/en \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)"

# Should return 200, same content as desktop
```

#### 7.3 Core Web Vitals

**Targets (Google's requirements):**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Check:** Google Search Console → Core Web Vitals

---

## 8. LOCALIZATION (THAI)

### Current State
- ⏳ Language routing planned
- ❌ Thai translation incomplete
- ❌ Thai-specific SEO not done

### Implementation Checklist

#### 8.1 Thai Content Translation

**Files to translate:**
- [ ] Homepage
- [ ] Landing pages
- [ ] Blog posts (priority: top 5)
- [ ] FAQ
- [ ] Pricing page
- [ ] Privacy/Terms

**Tools:** Translation + native speaker review

#### 8.2 Thai Keywords

**Research:** Thai search terms for:
- "AI assistant" — ผู้ช่วย AI
- "Personal intelligence" — ความฉลาดส่วนบุคคล
- "Decision making" — การตัดสินใจ

**Target:**
- 10-15 primary keywords
- 50+ secondary keywords
- Content around each keyword

#### 8.3 Thai Metadata

```html
<!-- /th/ pages -->
<html lang="th">
<meta charset="UTF-8" />
<meta name="description" content="Selfprint คือ... [Thai description]" />
<meta property="og:locale" content="th_TH" />
```

---

## 9. SEARCH CONSOLE SETUP

### Current State
- ❌ Not setup

### Implementation Checklist

#### 9.1 Setup Google Search Console

- [ ] Login to Google Search Console
- [ ] Add property: `https://selfprint.ai`
- [ ] Verify ownership (DNS or HTML tag)
- [ ] Submit sitemap

#### 9.2 Setup Bing Webmaster Tools

- [ ] Login to Bing Webmaster Tools
- [ ] Add site: `https://selfprint.ai`
- [ ] Verify ownership
- [ ] Submit sitemap

#### 9.3 Monitor Search Performance

**Weekly:**
- [ ] Check impressions vs clicks
- [ ] Identify low-ranking queries
- [ ] Fix broken links (404s)

**Monthly:**
- [ ] Review new page indexing
- [ ] Analyze traffic by page
- [ ] Identify content gaps

---

## 10. GENERATIVE AI VISIBILITY (AEO)

### Current State
- ❌ Not optimized for AI models

### Implementation Checklist

#### 10.1 Make Content AI-Readable

**Principles:**
- Clear structure (H1 → H2 → H3)
- Fact-rich (numbers, quotes, citations)
- Authoritative (author info, sources)
- Unique angle (not just copy-paste)

#### 10.2 Citation & Authority Signals

**Add to content:**
- Author name + bio
- Publication date
- Last updated date
- Source links
- Expert quotes

**Example:**
```html
<article>
  <h1>How AI Twins Learn Your Decision Style</h1>
  
  <div class="article-meta">
    <span class="author">By Sarah Chen</span>
    <time datetime="2026-08-15">August 15, 2026</time>
    <span class="updated">Updated: August 16, 2026</span>
  </div>
  
  <p>According to research by Stanford AI Lab, personal AI assistants...</p>
  <blockquote>
    <p>"AI systems can learn decision patterns in just a few interactions."</p>
    <cite>— Dr. John Smith, MIT</cite>
  </blockquote>
</article>
```

#### 10.3 Test Generative Results

```
Queries to test:
- "What is Selfprint?"
- "Best personal AI assistant"
- "AI that learns your style"
- "Decision making AI"

Expected: Selfprint mentioned in ChatGPT, Claude, Google SGE results
```

---

## 🎯 SUCCESS CRITERIA

**ALL of these must be TRUE:**

1. ✅ Canonical URLs on every page
2. ✅ Hreflang tags for EN/TH
3. ✅ Sitemap.xml with all URLs (en + th)
4. ✅ Robots.txt configured
5. ✅ Organization schema on homepage
6. ✅ BlogPosting schema on all articles
7. ✅ Product/SoftwareApplication schema
8. ✅ FAQ schema on FAQ page
9. ✅ Title tags: 50-60 characters, unique per page
10. ✅ Meta descriptions: 150-160 characters, unique per page
11. ✅ OG tags for social sharing (image, title, description)
12. ✅ Featured images on all blog posts (1200x630px)
13. ✅ Author bios on blog posts
14. ✅ Related articles (3-4) on each post
15. ✅ Internal linking between related content
16. ✅ Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)
17. ✅ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
18. ✅ Mobile responsive (tested on iPhone + Android)
19. ✅ Thai content translated (homepage + 5 blog posts)
20. ✅ Thai metadata (lang="th", locale="th_TH")
21. ✅ Google Search Console: Site verified + indexed
22. ✅ Bing Webmaster Tools: Site verified
23. ✅ Google Search Console: Sitemap submitted + crawled
24. ✅ No 404s or redirect chains
25. ✅ Mentioned in ChatGPT/Claude/Google SGE results (test)

**Status:** ⏳ Not yet complete

---

## IMPLEMENTATION PHASES

### Phase 1: Core SEO (2-3 hours)
- [ ] Canonical URLs
- [ ] Hreflang tags
- [ ] Sitemap + robots.txt
- [ ] Title/description per page
- [ ] OG tags

### Phase 2: Structured Data (1-2 hours)
- [ ] Organization schema
- [ ] BlogPosting schema
- [ ] Product schema
- [ ] FAQ schema
- [ ] Test with Google's tool

### Phase 3: Content Enhancement (2-3 hours)
- [ ] Featured images on all posts
- [ ] Author bios
- [ ] Related articles
- [ ] Internal linking
- [ ] Keyword research & optimization

### Phase 4: Verification (1-2 hours)
- [ ] Google Search Console setup
- [ ] Bing Webmaster Tools setup
- [ ] Submit sitemap
- [ ] Lighthouse audit
- [ ] Mobile testing

### Phase 5: Localization (2-3 hours)
- [ ] Thai content translation
- [ ] Thai metadata
- [ ] Thai keyword research
- [ ] Hreflang verification

---

## NEXT SESSION HANDOFF

When P0-D is VERIFIED:
- Create `HANDOFF_2026-08-18_P0-D_PUBLIC_ACQUISITION_VERIFIED.md`
- Update task status to COMPLETED
- All 4 P0 blockers now VERIFIED
- Selfprint ready for production deployment

**Estimated Timeline:** 8-10 hours of focused work

**Sign-off:** When all 25 success criteria are met + tested
