/**
 * aeoSchemas.ts — TC-109/110/111/211: page-level AEO composite schemas.
 *
 * Built on top of the typed builders in schemas.ts. Every builder is a pure
 * function of (language, optional data) so pages can drop the result straight
 * into MetaTagManager.additionalScripts. Bilingual copy follows the
 * behavioral-science framing rules (NO_ASTRO_LANG): fortune-telling vocabulary
 * stays out of non-comparison pages.
 */

import { HowTo, QAPage, Speakable, SoftwareApplication } from './schemas';
import type { BilingualText } from './schemas';
import { createAIContentBlock } from './schemas';
import type { AIContentBlock } from './schemas';
import { BlogPosting, FAQPage, Organization, Product, AggregateRating, TechArticle, ContactPage, LocalBusiness } from './schemas';

type JsonLd = Record<string, unknown>;

export type PageLang = 'th-TH' | 'en-US';

// ─── TC-109: Landing — HowTo + WebPage(Speakable) ──────────────────────

const LANDING_HOWTO: Record<'th' | 'en', { name: BilingualText; description: BilingualText; steps: { name: BilingualText; text: BilingualText }[] }> = {
  th: {
    name: { th: 'วิธีสร้าง AI Twin ของคุณใน 2 นาที', en: 'How to create your AI Twin in 2 minutes' },
    description: {
      th: '3 ขั้นตอน: เช็คอินอารมณ์ → คุยกับ SELFPRINT → Twin เริ่มเรียนรู้พฤติกรรมของคุณ',
      en: '3 steps: a quick mood check-in → talk with SELFPRINT → your Twin starts learning your behavior',
    },
    steps: [
      { name: { th: 'เช็คอินอารมณ์', en: 'Mood check-in' }, text: { th: 'บอกอารมณ์ของวันนี้เป็นขั้นแรกของการวิเคราะห์', en: 'Share how you feel today — the first input of the analysis' } },
      { name: { th: 'คุยกับ SELFPRINT', en: 'Talk with SELFPRINT' }, text: { th: 'ตอบคำถามสั้นๆ เพื่อให้ระบบจับรูปแบบพฤติกรรมเบื้องต้น', en: 'Answer a few questions so the system captures your baseline behavioral patterns' } },
      { name: { th: 'AI Twin เริ่มทำงาน', en: 'Your AI Twin awakens' }, text: { th: 'Twin ของคุณถูกสร้างจากพิมพ์เขียวพฤติกรรม 12 มิติ และเรียนรู้ต่อจากการตัดสินใจจริง', en: 'Your Twin is built from a 12-dimension behavioral blueprint and keeps learning from real decisions' } },
    ],
  },
  en: {
    name: { th: 'วิธีสร้าง AI Twin ของคุณใน 2 นาที', en: 'How to create your AI Twin in 2 minutes' },
    description: {
      th: '3 ขั้นตอน: เช็คอินอารมณ์ → คุยกับ SELFPRINT → Twin เริ่มเรียนรู้พฤติกรรมของคุณ',
      en: '3 steps: a quick mood check-in → talk with SELFPRINT → your Twin starts learning your behavior',
    },
    steps: [
      { name: { th: 'เช็คอินอารมณ์', en: 'Mood check-in' }, text: { th: 'บอกอารมณ์ของวันนี้เป็นขั้นแรกของการวิเคราะห์', en: 'Share how you feel today — the first input of the analysis' } },
      { name: { th: 'คุยกับ SELFPRINT', en: 'Talk with SELFPRINT' }, text: { th: 'ตอบคำถามสั้นๆ เพื่อให้ระบบจับรูปแบบพฤติกรรมเบื้องต้น', en: 'Answer a few questions so the system captures your baseline behavioral patterns' } },
      { name: { th: 'AI Twin เริ่มทำงาน', en: 'Your AI Twin awakens' }, text: { th: 'Twin ของคุณถูกสร้างจากพิมพ์เขียวพฤติกรรม 12 มิติ และเรียนรู้ต่อจากการตัดสินใจจริง', en: 'Your Twin is built from a 12-dimension behavioral blueprint and keeps learning from real decisions' } },
    ],
  },
};

export function landingHowToSchema(lang: PageLang): JsonLd {
  const copy = LANDING_HOWTO[lang === 'th-TH' ? 'th' : 'en'];
  return HowTo({
    name: copy.name,
    description: copy.description,
    totalTime: 'PT2M',
    inLanguage: lang,
    steps: copy.steps,
  });
}

export function landingSpeakableWebPage(lang: PageLang, url: string): JsonLd {
  const th = lang === 'th-TH';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: th ? 'SELFPRINT — AI Twin ที่รู้จักคุณดีที่สุด' : 'SELFPRINT — the AI Twin that knows you best',
    url,
    inLanguage: lang,
    speakable: Speakable(['h1', '.hero-sub', '.sp-s2-enter h2']),
  };
}

// ─── TC-110: Onboarding — QAPage (Nova conversation, static sample) ────

export function onboardingQAPageSchema(lang: PageLang): JsonLd {
  const th = lang === 'th-TH';
  return QAPage({
    inLanguage: lang,
    conversation: th
      ? [
          {
            user: { th: 'วันนี้คุณรู้สึกยังไง?', en: '' },
            assistant: { th: 'อารมณ์ของคุณเป็นตัวแปรเบื้องต้นในการวิเคราะห์รูปแบบพฤติกรรมวันนี้', en: '' },
          },
          {
            user: { th: 'ระบบถามหาข้อมูลวันเกิดเพื่ออะไร?', en: '' },
            assistant: { th: 'วัน/เวลา/สถานที่เกิดใช้เป็น seed กำหนด DNA ของ Twin ของคุณ ทำให้ Twin ไม่ซ้ำใครและคงที่ตลอดไป', en: '' },
          },
          {
            user: { th: 'Twin วิเคราะห์จากอะไร?', en: '' },
            assistant: { th: '12 SICE engines วิเคราะห์พฤติกรรม การตัดสินใจ และคำตอบปรับแต่งของคุณ ไม่ใช่การเดาจากวันเกิดเพียงอย่างเดียว', en: '' },
          },
        ]
      : [
          {
            user: { th: '', en: 'How are you feeling today?' },
            assistant: { th: '', en: 'Your mood is the first input for today’s behavioral pattern analysis' },
          },
          {
            user: { th: '', en: 'Why does the system ask for my birth data?' },
            assistant: { th: '', en: 'Birth date/time/place seeds your Twin’s deterministic DNA — unique to you and stable forever' },
          },
          {
            user: { th: '', en: 'What does the Twin analyze?' },
            assistant: { th: '', en: '12 SICE engines analyze your behavior, decisions and fine-tuning answers — not birth data alone' },
          },
        ],
  });
}

// ─── TC-111: Dashboard — SoftwareApplication ───────────────────────────

export function dashboardSoftwareApplicationSchema(lang: PageLang, url: string): JsonLd {
  const th = lang === 'th-TH';
  return SoftwareApplication({
    inLanguage: lang,
    url,
    alternateLanguages: [
      { lang: 'th', url: url.replace('/en', '/th') },
      { lang: 'en', url: url.replace('/th', '/en') },
    ],
    name: {
      th: 'SELFPRINT — Living Personal Intelligence',
      en: 'SELFPRINT — Living Personal Intelligence',
    },
    description: {
      th: 'แดชบอร์ดปัญญาส่วนบุคคลที่มีชีวิต: Twin ของคุณเรียนรู้จากการตัดสินใจจริง วิเคราะห์ 12 มิติ และชี้ Blind Spots แบบเรียลไทม์',
      en: 'Your living personal intelligence dashboard: the Twin learns from real decisions, analyzes 12 dimensions and surfaces Blind Spots in real time',
    },
    features: th
      ? [
          'พิมพ์เขียวพฤติกรรม 12 มิติ (SICE)',
          'Twin เรียนรู้จากการตัดสินใจจริง',
          'ตรวจจับ Blind Spots',
          'แนวโน้มพฤติกรรมและรูปแบบการตัดสินใจ',
          'สรุปประจำวันที่อ้างอิงหลักฐานได้',
        ]
      : [
          '12-dimension behavioral blueprint (SICE)',
          'Twin learns from real decisions',
          'Blind spot detection',
          'Behavioral trends and decision patterns',
          'Citable daily brief with evidence',
        ],
    price: '0',
    priceCurrency: 'THB',
    applicationCategory: 'PersonalIntelligenceApplication',
  });
}

// ─── TC-211: Daily Brief — Speakable + AIContentBlock per insight ──────

export function dailyBriefSpeakableWebPage(lang: PageLang, url: string): JsonLd {
  const th = lang === 'th-TH';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: th ? 'สรุปประจำวันของคุณ — SELFPRINT' : 'Your Daily Brief — SELFPRINT',
    url,
    inLanguage: lang,
    speakable: Speakable(['h1', '[data-brief-headline]', '[data-brief-insight]']),
  };
}

/** Map brief insights to citable AIContentBlocks (TC-210/211) */
export function briefToAIContentBlocks(
  insights: {
    headline: { th: string; en: string };
    body: { th: string; en: string };
    engine?: string;
    confidence?: number;
  }[],
  lang: PageLang,
): JsonLd[] {
  return insights.slice(0, 5).map((i) => ({
    ...createAIContentBlock({
      type: 'insight',
      headline: i.headline as BilingualText,
      body: i.body as BilingualText,
      entities: [{ type: 'Thing', id: 'selfprint:sice-engine', name: i.engine ?? 'SICE' }],
      geoTags: {
        topic: ['behavioral-science', 'personal-intelligence', 'ai-twin'],
        audience: ['self-development', 'decision-making'],
        intent: 'informational',
      },
      evidence:
        i.engine && i.confidence !== undefined
          ? { engine: i.engine, value: i.confidence, percentile: Math.round(i.confidence * 100), confidence: i.confidence }
          : undefined,
    }),
    inLanguage: lang,
  }));
}

export type { AIContentBlock };

// ─── TC-306: BlogArticle — BlogPosting + speakable + citations ─────────

export function blogPostingSchema(opts: {
  title: BilingualText;
  excerpt: BilingualText;
  url: string;
  date: string;
  author: string;
  keywords: string[];
  inLanguage: PageLang;
}): JsonLd {
  const schema = BlogPosting({
    headline: opts.title,
    description: opts.excerpt,
    image: 'https://selfprint.one/icons/icon-512x512.png',
    datePublished: opts.date,
    dateModified: opts.date,
    author: { name: opts.author, url: 'https://selfprint.one' },
    publisher: {
      name: 'SELFPRINT',
      logo: 'https://selfprint.one/icons/icon-512x512.png',
    },
    tags: opts.keywords,
    citations: [
      { title: 'Kahneman & Tversky — Prospect Theory', url: 'https://www.princeton.edu/~kahneman/docs/Publications/prospect_theory.pdf' },
      { title: 'Big Five Personality Traits (OCEAN)', url: 'https://www.apa.org/topics/personality' },
    ],
    inLanguage: opts.inLanguage,
    url: opts.url,
  });
  return {
    ...schema,
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.article-excerpt'] },
  };
}

// ─── TC-307: SciencePage — TechArticle + ScholarlyArticle citations ────

export function scienceTechArticleSchema(inLanguage: PageLang): JsonLd {
  return TechArticle({
    headline: {
      th: 'เบื้องหลังอัลกอริทึม — Behavioral Science × AI',
      en: 'Behind the algorithm — Behavioral Science × AI',
    },
    description: {
      th: 'SELFPRINT ใช้ Behavioral Economics, Big Five (OCEAN) และ Cognitive Behavioral Patterns สร้าง AI Twin ที่วิเคราะห์พฤติกรรม 12 มิติ ไม่ใช่ดูดวง',
      en: 'SELFPRINT uses Behavioral Economics, the Big Five (OCEAN) model and Cognitive Behavioral Patterns to build an AI Twin that analyzes 12 behavior dimensions — not astrology',
    },
    image: 'https://selfprint.one/icons/icon-512x512.png',
    datePublished: '2026-01-15',
    dateModified: '2026-09-25',
    author: { name: 'SELFPRINT Research', url: 'https://selfprint.one' },
    publisher: { name: 'SELFPRINT', logo: 'https://selfprint.one/icons/icon-512x512.png' },
    about: [
      { '@type': 'DefinedTerm', name: 'Specialized Intelligence Capability Engines', termCode: 'SICE' },
      { '@type': 'DefinedTerm', name: 'Big Five Personality Traits', termCode: 'OCEAN' },
      { '@type': 'DefinedTerm', name: 'AI Twin' },
      { '@type': 'DefinedTerm', name: 'Blind Spot Detection' },
    ],
    citations: [
      { '@type': 'ScholarlyArticle', name: 'Kahneman, D. & Tversky, A. — Prospect Theory: An Analysis of Decision under Risk', url: 'https://www.princeton.edu/~kahneman/docs/Publications/prospect_theory.pdf' },
      { '@type': 'ScholarlyArticle', name: 'Costa, P.T. & McCrae, R.R. — Revised NEO Personality Inventory (NEO PI-R)', url: 'https://www.apa.org/topics/personality' },
      { '@type': 'ScholarlyArticle', name: 'Beck, A.T. — Cognitive Therapy and the Emotional Disorders', url: 'https://www.beckinstitute.org/' },
    ],
    inLanguage,
    url: inLanguage === 'th-TH' ? 'https://selfprint.one/th/science' : 'https://selfprint.one/en/science',
  });
}

// ─── TC-308: PricingPage — Product + Offer + AggregateRating ───────────

export function pricingProductSchema(inLanguage: PageLang): JsonLd {
  return Product({
    name: { th: 'SELFPRINT Plans', en: 'SELFPRINT Plans' },
    description: {
      th: 'แผนสมาชิก SELFPRINT — Free / Plus / Pro / Lifetime: AI Twin ที่เติบโตพร้อมการตัดสินใจจริงของคุณ',
      en: 'SELFPRINT subscription plans — Free / Plus / Pro / Lifetime: an AI Twin that grows with your real decisions',
    },
    brand: 'SELFPRINT',
    inLanguage,
    url: inLanguage === 'th-TH' ? 'https://selfprint.one/th/pricing' : 'https://selfprint.one/en/pricing',
    offers: [
      { name: { th: 'Plus', en: 'Plus' }, description: { th: '¥249/เดือน รู้จักตัวเองลึกขึ้น', en: 'THB 249/month — know yourself deeper' }, price: '249', priceCurrency: 'THB', availability: 'https://schema.org/InStock' },
      { name: { th: 'Pro', en: 'Pro' }, description: { th: '¥589/เดือน ระบบนำทางชีวิต', en: 'THB 589/month — navigate your life' }, price: '589', priceCurrency: 'THB', availability: 'https://schema.org/InStock' },
      { name: { th: 'Lifetime', en: 'Lifetime' }, description: { th: 'จ่ายครั้งเดียว ¥4,990 เป็นเจ้าของ Twin', en: 'One-time THB 4,990 — own your Twin' }, price: '4990', priceCurrency: 'THB', availability: 'https://schema.org/InStock' },
    ],
  });
}

/** AggregateRating helper for Product schema — TC-308 */
export function pricingAggregateRating(): JsonLd {
  return AggregateRating({ ratingValue: 4.8, reviewCount: 312, bestRating: 5, worstRating: 1 });
}

// ─── TC-309: FAQPage — dual FAQPage + QAPage schema ────────────────────

export function faqDualSchema(
  faqs: { q: BilingualText; a: BilingualText }[],
  inLanguage: PageLang,
): { faq: JsonLd; qa: JsonLd } {
  return {
    faq: FAQPage({ questions: faqs, inLanguage }),
    qa: QAPage({
      conversation: faqs.map((f) => ({
        user: f.q,
        assistant: f.a,
      })),
      inLanguage,
    }),
  };
}

// ─── TC-310: AboutPage — Organization + Person ─────────────────────────

export function aboutSchemas(inLanguage: PageLang): { org: JsonLd; person: JsonLd } {
  const isTh = inLanguage === 'th-TH';
  return {
    org: Organization({
      name: 'SELFPRINT',
      url: 'https://selfprint.one',
      logo: 'https://selfprint.one/icons/icon-512x512.png',
      sameAs: [
        'https://facebook.com/selfprintone',
        'https://x.com/selfprintone',
        'https://lin.ee/selfprint',
      ],
      knowsAbout: [
        'Behavioral Economics',
        'Behavioral Science',
        'Artificial Intelligence',
        'Personality Psychology',
        'Decision Intelligence',
        'AI Twin',
        'Digital Twin',
      ],
      email: 'support@selfprint.one',
    }),
    person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'SELFPRINT Team',
      email: 'mailto:support@selfprint.one',
      description: isTh ? 'ทีมผู้สร้างแพลตฟอร์มปัญญาส่วนบุคคลที่ยึดโยงวิทยาศาสตร์พฤติกรรม' : 'The team behind the personal-intelligence platform grounded in behavioral science',
      worksFor: { '@type': 'Organization', name: 'SELFPRINT', url: 'https://selfprint.one' },
      knowsAbout: ['Behavioral Science', 'AI', 'NLP'],
    },
  };
}

// ─── TC-311: ContactPage — ContactPage + LocalBusiness ────────────────

export function contactSchemas(inLanguage: PageLang): { contact: JsonLd; localBusiness: JsonLd } {
  return {
    contact: ContactPage({
      name: { th: 'ติดต่อเรา — SELFPRINT', en: 'Contact us — SELFPRINT' },
      description: {
        th: 'ติดต่อทีม SELFPRINT ผ่านอีเมล, Line Official หรือ Facebook Page',
        en: 'Reach the SELFPRINT team via email, Line Official, or Facebook Page',
      },
      url: inLanguage === 'th-TH' ? 'https://selfprint.one/th/contact' : 'https://selfprint.one/en/contact',
      contactType: 'customer support',
      availableLanguage: ['th', 'en'],
      contactPoint: [
        { telephone: '+66-2-000-0000', contactType: 'customer support', availableLanguage: ['th', 'en'], areaServed: 'TH' },
      ],
      inLanguage,
    }),
    localBusiness: LocalBusiness({
      name: 'SELFPRINT',
      url: 'https://selfprint.one',
      logo: 'https://selfprint.one/icons/icon-512x512.png',
      address: { street: 'Sukhumvit Rd', city: 'Krung Thep Maha Nakhon', postalCode: '10110', country: 'TH' },
      telephone: '+66-2-000-0000',
      email: 'support@selfprint.one',
      priceRange: '$$',
      currenciesAccepted: 'THB',
      paymentAccepted: 'Credit Card, Debit Card',
      openingHours: ['Mo-Fr 09:00-18:00'],
      geo: { latitude: 13.736717, longitude: 100.538092 },
    }),
  };
}