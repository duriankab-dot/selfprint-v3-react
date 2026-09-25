# TC-007: Schema.org library
**Phase**: 0 | **Priority**: P1 | **Estimate**: 3 ชม.
**Assignee**: AI-SEO | **Depends On**: TC-001
**Feature Flag**: N/A

## 🎯 OBJECTIVE
สร้าง TypeScript library ของ Schema.org builders แบบ type-safe สำหรับใช้ในทุกหน้า (SoftwareApplication, BlogPosting, FAQPage, QAPage, HowTo, Speakable, Organization, Product, Offer, etc.)

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `src/lib/schemas.ts` — typed builders สำหรับทุก schema ที่ต้องใช้
- [ ] Unit tests สำหรับแต่ละ builder
- [ ] Export helpers: `withSpeakable`, `withHreflang`, `withGeo`
- [ ] **Docs updated**: MASTER_PLAN.md, docs/SEO_AEO_GEO_SPEC.md
- [ ] **All tests pass**: `npm test -- schemas`
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```typescript
// src/lib/schemas.ts
type JsonLd = Record<string, unknown>;

const base = (type: string) => ({ '@context': 'https://schema.org', '@type': type });

export const SoftwareApplication = (opts: {
  name: string; description: string; url: string; features: string[];
  price?: string; currency?: string;
}) => base('SoftwareApplication');

export const BlogPosting = (opts: {
  headline: string; description: string; image: string;
  datePublished: string; dateModified: string;
  author: { name: string; url: string };
  publisher: { name: string; logo: string };
  tags: string[]; citations: { title: string; url: string }[];
}) => base('BlogPosting');

export const FAQPage = (questions: { q: string; a: string }[]) => ({
  ...base('FAQPage'),
  mainEntity: questions.map(({ q, a }) => ({
    '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a }
  }))
});

export const QAPage = (conversation: { user: string; assistant: string }[]) => ({
  ...base('QAPage'),
  mainEntity: conversation.map(({ user, assistant }) => ({
    '@type': 'Question', name: user, acceptedAnswer: { '@type': 'Answer', text: assistant }
  }))
});

export const HowTo = (steps: { name: string; text: string }[]) => ({
  ...base('HowTo'), step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, ...s }))
});

export const Speakable = (cssSelectors: string[]) => ({
  '@type': 'SpeakableSpecification', cssSelector: cssSelectors
});

export const Organization = (opts: {
  name: string; url: string; logo: string; sameAs: string[];
  knowsAbout: string[];
}) => base('Organization');

export const Product = (opts: {
  name: string; description: string; brand: string;
  offers: { price: string; currency: string; availability: string }[];
}) => base('Product');

export const withSpeakable = (schema: JsonLd, selectors: string[]) => ({
  ...schema, speakable: Speakable(selectors)
});

export const withHreflang = (schema: JsonLd, alternates: { lang: string; url: string }[]) => ({
  ...schema, alternateName: alternates.map(a => a.lang), // custom extension
});

export const withGeo = (schema: JsonLd, region: string, place: string) => ({
  ...schema, areaServed: { '@type': 'GeoShape', name: place, identifier: region }
});
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- src/lib/schemas.ts
- .ai/context-pack/session-XXX-context.json