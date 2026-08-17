# P0-D: PUBLIC ACQUISITION ENGINE (SEO/GEO)

**สถานะ:** 🟡 Ready for Implementation  
**ลำดับ:** หลังจาก P0-C ✅  
**ระยะเวลา:** 4-5 ชั่วโมง  

---

## 🎯 **OBJECTIVE**

Make Selfprint discoverable through search engines and organic growth:
1. Google Search visibility (SEO)
2. Google Local visibility (GEO)
3. Content optimization for AI engines (AEO)
4. Organic traffic growth
5. Acquisition cost reduction

---

## 📋 **25 SUCCESS CRITERIA**

### **SEO Layer (10 criteria)**

1. ✅ **Homepage Title Tag** (< 60 chars)
   - Primary keyword: "AI Twin Chat for Personal Decisions"
   - Current: To be verified
   
2. ✅ **Homepage Meta Description** (< 160 chars)
   - Must include CTA + primary value prop
   - Current: To be verified

3. ✅ **H1 Optimization** (1 per page)
   - Matches primary keyword
   - Clear value prop
   
4. ✅ **Internal Linking** (3+ links per page)
   - Proper anchor text
   - Hierarchical structure
   - No orphan pages

5. ✅ **Keyword Distribution**
   - Primary keywords in title, H1, first 100 words
   - No keyword stuffing
   - Natural language flow

6. ✅ **Page Speed (Core Web Vitals)**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

7. ✅ **Mobile Responsive**
   - Passes Google Mobile-Friendly Test
   - Touch-friendly buttons (48px+)
   - Readable text (16px+)

8. ✅ **Structured Data (JSON-LD)**
   - Organization schema
   - FAQPage schema
   - BreadcrumbList schema
   - Article schema (if blog)

9. ✅ **Sitemap & Robots.txt**
   - XML sitemap at /sitemap.xml
   - robots.txt properly configured
   - No critical pages blocked

10. ✅ **Canonical Tags**
    - Self-referencing canonicals
    - No duplicate content issues
    - Proper URL parameter handling

---

### **GEO Layer (8 criteria)**

11. ✅ **Google Business Profile**
    - Claimed and verified
    - Accurate name, address, phone
    - Business category (correct)
    - Service area defined

12. ✅ **Local NAP Consistency**
    - Name: Selfprint
    - Address: [To be defined]
    - Phone: [To be defined]
    - Consistent across web

13. ✅ **Local Content**
    - Local landing pages (if multiple locations)
    - Local keywords in H1, meta description
    - Local call-to-action

14. ✅ **Local Structured Data**
    - LocalBusiness schema
    - Address + Phone + Hours
    - Service radius or area served

15. ✅ **Local Citations**
    - NAP directories (Google Maps, Yelp, etc.)
    - Quality local business listings
    - Consistent information

16. ✅ **Local Reviews Strategy**
    - Review management process
    - Response template ready
    - Positive review solicitation (ethical)

17. ✅ **Local Link Building**
    - Local business associations
    - Industry local directories
    - Community mentions

18. ✅ **Local Schema Markup**
    - Opening hours structured data
    - Service area defined
    - Contact methods specified

---

### **Content & Technical (5 criteria)**

19. ✅ **Content Strategy** (3+ pillar topics)
    - Topic 1: "Making Better Decisions with AI"
    - Topic 2: "Twin Chat for Personal Growth"
    - Topic 3: "Digital Companion Benefits"
    - Supporting blog content (3+ articles)

20. ✅ **Blog/Content Indexation**
    - > 5 indexed content pieces
    - No noindex tags on content
    - Proper content freshness indicators

21. ✅ **Technical SEO Audit Passing**
    - No crawl errors
    - No broken internal links
    - No redirect chains (2+ hops)
    - Proper SSL/HTTPS

22. ✅ **Security & Trust Signals**
    - SSL certificate valid (green lock)
    - Privacy policy linked (footer)
    - Terms of service accessible
    - GDPR compliance shown

23. ✅ **Schema Markup Coverage**
    - 3+ schema types implemented
    - JSON-LD format used
    - No schema validation errors
    - Rich snippets appearing in SERP

24. ✅ **Analytics Implementation**
    - Google Analytics 4 installed
    - Conversion tracking active
    - UTM parameters standardized
    - Goal tracking configured

25. ✅ **Accessibility Compliance**
    - WCAG 2.1 AA compliance
    - Keyboard navigation working
    - Screen reader compatible
    - Color contrast adequate

---

## 📁 **FILES TO CREATE**

### **Landing Page Optimization**
```
src/pages/landing.tsx (UPDATED)
  - Optimized title tag
  - Meta description
  - H1 with primary keyword
  - Value prop copy
  - CTA prominently placed
  - Schema markup embedded
```

### **SEO Configuration**
```
public/sitemap.xml
  - Auto-generated from routes
  - Lastmod dates
  - Priority values
  - <lastmod> ISO 8601 format

public/robots.txt
  - User-agent: *
  - Allow/Disallow rules
  - Sitemap location

src/utils/seo.ts
  - generateMetaTags(page)
  - generateStructuredData(type, data)
  - getCanonicalURL(route)
```

### **Content Hub**
```
docs/CONTENT_STRATEGY.md
  - Pillar topics (3)
  - Content calendar (3 months)
  - Keyword targets per page
  - Link building opportunities

src/components/BlogList.tsx (NEW)
  - Blog article cards
  - Pagination
  - Category filtering
  - Related articles

src/pages/blog/[slug].tsx
  - Article template
  - Author info
  - Publication date
  - Table of contents
  - Internal links
  - CTA at bottom
```

### **Local SEO**
```
docs/LOCAL_SEO_SETUP.md
  - Google Business Profile checklist
  - NAP consistency audit
  - Local citation list (50+ directories)
  - Review management process
  - Local landing pages (if applicable)
```

### **Analytics & Monitoring**
```
src/utils/analytics.ts (UPDATED)
  - GA4 event tracking
  - Conversion tracking
  - UTM parameter handling
  - Goal tracking setup
```

---

## 🔧 **IMPLEMENTATION STEPS**

### **Phase 1: Landing Page (2 hours)**
1. Optimize homepage title & meta
2. Refactor H1 + primary content
3. Add schema markup (Organization, LocalBusiness)
4. Implement internal linking structure
5. Run Lighthouse audit
6. Verify Core Web Vitals

### **Phase 2: Technical SEO (1.5 hours)**
1. Generate sitemap.xml
2. Create robots.txt
3. Add canonical tags
4. Setup 404 handling
5. Verify indexation in GSC
6. Check mobile responsiveness

### **Phase 3: Content Strategy (1 hour)**
1. Define 3 pillar topics
2. Create 5+ supporting articles
3. Setup internal linking
4. Write blog index page
5. Add breadcrumb navigation

### **Phase 4: Local SEO (1 hour)**
1. Claim Google Business Profile
2. Add service areas + hours
3. Create local schema
4. Setup review management
5. Verify NAP consistency

### **Phase 5: Verification (30 min)**
1. Run SEO audit tool
2. Test all 25 criteria
3. Submit to Search Console
4. Monitor for issues
5. Mark P0-D VERIFIED

---

## 📊 **EXPECTED OUTCOMES**

**After P0-D Implementation:**

- ✅ Homepage appears in Google for primary keywords (week 2-4)
- ✅ >3 organic landing page visitors daily (week 3-4)
- ✅ >10 pieces of indexed content
- ✅ 0 SEO errors or warnings
- ✅ Google Business Profile fully optimized
- ✅ All 25 success criteria met
- ✅ Analytics tracking 100% active

**Long-term (3-6 months):**
- First-page ranking for primary keyword
- 100+ organic monthly visitors
- 20+ indexed pages
- Natural referral backlinks

---

## ⚠️ **CONSTRAINTS & RULES**

Following SELFPRINT discipline:

1. **Scope:** SEO/GEO optimization only
   - No paid advertising
   - No link manipulation
   - No black-hat tactics

2. **Surgical Changes:**
   - Update landing page carefully
   - Don't break existing functionality
   - Verify all changes work

3. **No Premature Optimization:**
   - Only optimize what's needed for 25 criteria
   - Don't add unnecessary complexity
   - Content-first approach

4. **Verification Required:**
   - Test all changes before committing
   - Run audit tools (Lighthouse, GSC)
   - Verify 25 success criteria met

---

## 🚀 **READY TO START?**

When you're ready, run:

```bash
# Start P0-D implementation
# 1. Open docs/P0-D_SETUP.md (this file)
# 2. Review 25 success criteria
# 3. Begin Phase 1: Landing Page optimization
```

**Timeline:** ~4-5 hours start to finish  
**Dependencies:** P0-C ✅ (error tracking active)  
**Blocker Check:** None identified  

---

**สถานะ:** 🟡 Ready to implement  
**ผลลัพธ์ที่คาดหวัง:** Organic traffic acquisition pathway ✅
