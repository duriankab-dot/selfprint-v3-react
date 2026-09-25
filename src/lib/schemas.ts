// src/lib/schemas.ts
// Type-safe Schema.org builders for SELFPRINT

type JsonLd = Record<string, unknown>;

// ─── Base Helpers ─────────────────────────────────────────────────────

const base = (type: string): JsonLd => ({ '@context': 'https://schema.org', '@type': type });

// ─── Core Types ───────────────────────────────────────────────────────

export interface BilingualText {
  th: string;
  en: string;
}

export interface LinkRef {
  lang: string;
  url: string;
}

export interface SEOBase {
  name: BilingualText;
  description: BilingualText;
  url: string;
  inLanguage: 'th-TH' | 'en-US';
  alternateLanguages: LinkRef[];
}

// ─── Schema Builders ──────────────────────────────────────────────────

/** SoftwareApplication — for LandingPage, Dashboard */
export function SoftwareApplication(opts: {
  name: BilingualText;
  description: BilingualText;
  url: string;
  inLanguage: 'th-TH' | 'en-US';
  alternateLanguages: LinkRef[];
  features: string[];
  price?: string;
  priceCurrency?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: { price: string; priceCurrency: string; availability: string }[];
}): JsonLd {
  const schema: JsonLd = {
    ...base('SoftwareApplication'),
    name: opts.name[opts.inLanguage === 'th-TH' ? 'th' : 'en'],
    description: opts.description[opts.inLanguage === 'th-TH' ? 'th' : 'en'],
    url: opts.url,
    inLanguage: opts.inLanguage,
    applicationCategory: opts.applicationCategory ?? 'BusinessApplication',
    operatingSystem: opts.operatingSystem ?? 'Web',
    featureList: opts.features,
  };

  if (opts.price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price: opts.price,
      priceCurrency: opts.priceCurrency ?? 'THB',
      availability: 'https://schema.org/InStock',
    };
  }

  if (opts.offers) {
    schema.offers = opts.offers.map(o => ({
      '@type': 'Offer',
      price: o.price,
      priceCurrency: o.priceCurrency,
      availability: o.availability,
    }));
  }

  // Add hreflang alternates
  if (opts.alternateLanguages.length > 0) {
    (schema as any).alternateName = opts.alternateLanguages.map(a => a.lang);
  }

  return schema;
}

/** BlogPosting — for BlogArticle */
export function BlogPosting(opts: {
  headline: BilingualText;
  description: BilingualText;
  image: string;
  datePublished: string;
  dateModified: string;
  author: { name: string; url: string };
  publisher: { name: string; logo: string };
  tags: string[];
  citations: { title: string; url: string }[];
  inLanguage: 'th-TH' | 'en-US';
  url: string;
}): JsonLd {
  return {
    ...base('BlogPosting'),
    headline: opts.headline[opts.inLanguage === 'th-TH' ? 'th' : 'en'],
    description: opts.description[opts.inLanguage === 'th-TH' ? 'th' : 'en'],
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      '@type': 'Person',
      name: opts.author.name,
      url: opts.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: opts.publisher.name,
      logo: { '@type': 'ImageObject', url: opts.publisher.logo },
    },
    keywords: opts.tags.join(', '),
    citation: opts.citations.map(c => ({
      '@type': 'CreativeWork',
      name: c.title,
      url: c.url,
    })),
    inLanguage: opts.inLanguage,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
  };
}

/** FAQPage — for FAQ pages */
export function FAQPage(opts: {
  questions: { q: BilingualText; a: BilingualText }[];
  inLanguage: 'th-TH' | 'en-US';
}): JsonLd {
  const lang = opts.inLanguage === 'th-TH' ? 'th' : 'en';
  return {
    ...base('FAQPage'),
    mainEntity: opts.questions.map(({ q, a }) => ({
      '@type': 'Question',
      name: q[lang],
      acceptedAnswer: {
        '@type': 'Answer',
        text: a[lang],
      },
    })),
    inLanguage: opts.inLanguage,
  };
}

/** QAPage — for conversational content (Nova chat) */
export function QAPage(opts: {
  conversation: { user: BilingualText; assistant: BilingualText }[];
  inLanguage: 'th-TH' | 'en-US';
}): JsonLd {
  const lang = opts.inLanguage === 'th-TH' ? 'th' : 'en';
  return {
    ...base('QAPage'),
    mainEntity: opts.conversation.map(({ user, assistant }) => ({
      '@type': 'Question',
      name: user[lang],
      acceptedAnswer: {
        '@type': 'Answer',
        text: assistant[lang],
      },
    })),
    inLanguage: opts.inLanguage,
  };
}

/** HowTo — for step-by-step guides (onboarding) */
export function HowTo(opts: {
  name: BilingualText;
  description: BilingualText;
  steps: { name: BilingualText; text: BilingualText }[];
  totalTime?: string;
  inLanguage: 'th-TH' | 'en-US';
}): JsonLd {
  const lang = opts.inLanguage === 'th-TH' ? 'th' : 'en';
  return {
    ...base('HowTo'),
    name: opts.name[lang],
    description: opts.description[lang],
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name[lang],
      text: s.text[lang],
    })),
    totalTime: opts.totalTime,
    inLanguage: opts.inLanguage,
  };
}

/** Speakable — for voice assistants (AEO) */
export function Speakable(cssSelectors: string[]): JsonLd {
  return {
    '@type': 'SpeakableSpecification',
    cssSelector: cssSelectors,
  };
}

/** Organization — for AboutPage, footer */
export function Organization(opts: {
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  knowsAbout: string[];
  address?: { street: string; city: string; postalCode: string; country: string };
  telephone?: string;
  email?: string;
}): JsonLd {
  const schema: JsonLd = {
    ...base('Organization'),
    name: opts.name,
    url: opts.url,
    logo: opts.logo,
    sameAs: opts.sameAs,
    knowsAbout: opts.knowsAbout,
  };

  if (opts.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: opts.address.street,
      addressLocality: opts.address.city,
      postalCode: opts.address.postalCode,
      addressCountry: opts.address.country,
    };
  }

  if (opts.telephone) schema.telephone = opts.telephone;
  if (opts.email) schema.email = opts.email;

  return schema;
}

/** Product + Offer — for PricingPage */
export function Product(opts: {
  name: BilingualText;
  description: BilingualText;
  brand: string;
  offers: { price: string; priceCurrency: string; availability: string; name: BilingualText; description: BilingualText }[];
  inLanguage: 'th-TH' | 'en-US';
  url: string;
}): JsonLd {
  const lang = opts.inLanguage === 'th-TH' ? 'th' : 'en';
  return {
    ...base('Product'),
    name: opts.name[lang],
    description: opts.description[lang],
    brand: { '@type': 'Brand', name: opts.brand },
    offers: opts.offers.map(o => ({
      '@type': 'Offer',
      name: o.name[lang],
      description: o.description[lang],
      price: o.price,
      priceCurrency: o.priceCurrency,
      availability: o.availability,
    })),
    inLanguage: opts.inLanguage,
    url: opts.url,
  };
}

/** AggregateRating — for reviews/testimonials */
export function AggregateRating(opts: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}): JsonLd {
  return {
    ...base('AggregateRating'),
    ratingValue: opts.ratingValue,
    reviewCount: opts.reviewCount,
    bestRating: opts.bestRating ?? 5,
    worstRating: opts.worstRating ?? 1,
  };
}

/** Article — for SciencePage, content pages */
export function Article(opts: {
  headline: BilingualText;
  description: BilingualText;
  image: string;
  datePublished: string;
  dateModified: string;
  author: { name: string; url: string };
  publisher: { name: string; logo: string };
  about: { '@type': 'DefinedTerm'; name: string }[];
  citations: { '@type': 'ScholarlyArticle'; name: string; url: string }[];
  inLanguage: 'th-TH' | 'en-US';
  url: string;
}): JsonLd {
  const lang = opts.inLanguage === 'th-TH' ? 'th' : 'en';
  return {
    ...base('Article'),
    headline: opts.headline[lang],
    description: opts.description[lang],
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      '@type': 'Organization',
      name: opts.author.name,
      url: opts.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: opts.publisher.name,
      logo: { '@type': 'ImageObject', url: opts.publisher.logo },
    },
    about: opts.about,
    citation: opts.citations,
    inLanguage: opts.inLanguage,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
  };
}

/** TechArticle — for methodology pages */
export function TechArticle(opts: {
  headline: BilingualText;
  description: BilingualText;
  image: string;
  datePublished: string;
  dateModified: string;
  author: { name: string; url: string };
  publisher: { name: string; logo: string };
  about: { '@type': 'DefinedTerm'; name: string; termCode?: string }[];
  citations: { '@type': 'ScholarlyArticle'; name: string; url: string }[];
  inLanguage: 'th-TH' | 'en-US';
  url: string;
}): JsonLd {
  const lang = opts.inLanguage === 'th-TH' ? 'th' : 'en';
  return {
    ...base('TechArticle'),
    headline: opts.headline[lang],
    description: opts.description[lang],
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      '@type': 'Organization',
      name: opts.author.name,
      url: opts.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: opts.publisher.name,
      logo: { '@type': 'ImageObject', url: opts.publisher.logo },
    },
    about: opts.about,
    citation: opts.citations,
    inLanguage: opts.inLanguage,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
  };
}

/** ContactPage — for ContactPage */
export function ContactPage(opts: {
  name: BilingualText;
  description: BilingualText;
  url: string;
  contactType: string;
  availableLanguage: string[];
  contactPoint: {
    telephone: string;
    contactType: string;
    availableLanguage: string[];
    areaServed: string;
  }[];
  inLanguage: 'th-TH' | 'en-US';
}): JsonLd {
  const lang = opts.inLanguage === 'th-TH' ? 'th' : 'en';
  return {
    ...base('ContactPage'),
    name: opts.name[lang],
    description: opts.description[lang],
    url: opts.url,
    contactType: opts.contactType,
    availableLanguage: opts.availableLanguage,
    contactPoint: opts.contactPoint.map(cp => ({
      '@type': 'ContactPoint',
      telephone: cp.telephone,
      contactType: cp.contactType,
      availableLanguage: cp.availableLanguage,
      areaServed: cp.areaServed,
    })),
    inLanguage: opts.inLanguage,
  };
}

/** LocalBusiness — for physical location (if applicable) */
export function LocalBusiness(opts: {
  name: string;
  url: string;
  logo: string;
  address: { street: string; city: string; postalCode: string; country: string };
  telephone: string;
  email: string;
  priceRange: string;
  currenciesAccepted: string;
  paymentAccepted: string;
  openingHours: string[];
  geo: { latitude: number; longitude: number };
}): JsonLd {
  return {
    ...base('LocalBusiness'),
    name: opts.name,
    url: opts.url,
    logo: opts.logo,
    address: {
      '@type': 'PostalAddress',
      streetAddress: opts.address.street,
      addressLocality: opts.address.city,
      postalCode: opts.address.postalCode,
      addressCountry: opts.address.country,
    },
    telephone: opts.telephone,
    email: opts.email,
    priceRange: opts.priceRange,
    currenciesAccepted: opts.currenciesAccepted,
    paymentAccepted: opts.paymentAccepted,
    openingHoursSpecification: opts.openingHours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.split(' ')[0],
      opens: h.split(' ')[1].split('-')[0],
      closes: h.split(' ')[1].split('-')[1],
    })),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: opts.geo.latitude,
      longitude: opts.geo.longitude,
    },
  };
}

/** DefinedTermSet — for methodology glossary (SciencePage) */
export function DefinedTermSet(opts: {
  name: BilingualText;
  terms: { name: BilingualText; termCode?: string; description: BilingualText }[];
  inLanguage: 'th-TH' | 'en-US';
}): JsonLd {
  const lang = opts.inLanguage === 'th-TH' ? 'th' : 'en';
  return {
    ...base('DefinedTermSet'),
    name: opts.name[lang],
    hasDefinedTerm: opts.terms.map(t => ({
      '@type': 'DefinedTerm',
      name: t.name[lang],
      termCode: t.termCode,
      description: t.description[lang],
      inDefinedTermSet: { '@type': 'DefinedTermSet', name: opts.name[lang] },
    })),
    inLanguage: opts.inLanguage,
  };
}

// ─── Composition Helpers ──────────────────────────────────────────────

export function withSpeakable(schema: JsonLd, selectors: string[]): JsonLd {
  return { ...schema, speakable: Speakable(selectors) };
}

export function withHreflang(schema: JsonLd, alternates: LinkRef[]): JsonLd {
  return { ...schema, alternateName: alternates.map(a => a.lang) };
}

export function withGeo(schema: JsonLd, region: string, place: string): JsonLd {
  return {
    ...schema,
    areaServed: { '@type': 'GeoShape', name: place, identifier: region },
  };
}

export function withAggregateRating(schema: JsonLd, rating: { ratingValue: number; reviewCount: number }): JsonLd {
  return { ...schema, aggregateRating: AggregateRating(rating) };
}

// ─── Entity Dictionary (GEO) ──────────────────────────────────────────

export const ENTITY_DICTIONARY = {
  SICE: {
    schema: 'https://schema.selfprint.one/SICE',
    description: '12 behavioral intelligence engines',
    type: 'DefinedTerm',
  },
  BlindSpot: {
    schema: 'https://schema.selfprint.one/BlindSpot',
    description: 'Systematic behavioral pattern limiting decision quality',
    type: 'DefinedTerm',
  },
  AITwin: {
    schema: 'https://schema.selfprint.one/AITwin',
    description: 'Living digital twin evolving from user behavioral data',
    type: 'Thing',
  },
  World: {
    schema: 'https://schema.selfprint.one/World',
    description: 'Specialized decision lens on core Twin',
    type: 'Thing',
  },
  DecisionPattern: {
    schema: 'https://schema.selfprint.one/DecisionPattern',
    description: 'Recurring decision behavior pattern',
    type: 'DefinedTerm',
  },
  GrowthTrajectory: {
    schema: 'https://schema.selfprint.one/GrowthTrajectory',
    description: 'Projected behavioral evolution path',
    type: 'DefinedTerm',
  },
} as const;

// ─── AI Content Block (GEO-ready) ─────────────────────────────────────

export interface AIContentBlock {
  type: 'definition' | 'insight' | 'recommendation' | 'warning';
  headline: BilingualText;
  body: BilingualText;
  entities: Array<{ type: string; id: string; name: string }>;
  geoTags: {
    topic: string[];
    audience: string[];
    intent: 'informational' | 'transactional' | 'navigational';
  };
  evidence?: { engine: string; value: number; percentile: number; confidence: number };
  citations?: { text: string; url: string }[];
}

export function createAIContentBlock(block: AIContentBlock): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: block.headline,
    description: block.body,
    about: block.entities.map(e => ({ '@type': e.type, name: e.name })),
    keywords: block.geoTags.topic.join(', '),
    audience: { '@type': 'Audience', audienceType: block.geoTags.audience.join(', ') },
    ...(block.evidence && {
      citation: [{
        '@type': 'CreativeWork',
        name: `SICE ${block.evidence.engine}`,
        description: `Percentile: ${block.evidence.percentile}, Confidence: ${block.evidence.confidence}`,
      }],
    }),
    ...(block.citations && {
      citation: block.citations.map(c => ({
        '@type': 'CreativeWork',
        name: c.text,
        url: c.url,
      })),
    }),
  };
}

export default {
  SoftwareApplication,
  BlogPosting,
  FAQPage,
  QAPage,
  HowTo,
  Speakable,
  Organization,
  Product,
  AggregateRating,
  Article,
  TechArticle,
  ContactPage,
  LocalBusiness,
  DefinedTermSet,
  withSpeakable,
  withHreflang,
  withGeo,
  withAggregateRating,
  ENTITY_DICTIONARY,
  createAIContentBlock,
};