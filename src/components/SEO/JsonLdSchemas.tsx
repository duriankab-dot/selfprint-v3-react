/**
 * JsonLdSchemas.tsx
 * JSON-LD structured data components for SEO
 * Insert into page <head> via React Helmet or direct script injection
 *
 * Usage:
 *   <OrganizationSchema />          — home page
 *   <SoftwareApplicationSchema />   — app / landing
 *   <ArticleSchema {...} />         — blog / FAQ pages
 */

import type { FC } from 'react';

/** Serialize an object as JSON-LD, escaping `</` to prevent `</script>` injection. */
const safeJsonLd = (obj: unknown): string =>
  JSON.stringify(obj).replace(/<\//g, '<\\/');

// ─── Organization ────────────────────────────────────────────────────────────

export const OrganizationSchema: FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Selfprint',
    url: 'https://selfprint.one',
    logo: 'https://selfprint.one/logo.png',
    description:
      'Selfprint — AI Twin that knows you deeply. Personalised life intelligence across 12 worlds.',
    sameAs: [
      'https://twitter.com/selfprintapp',
      'https://www.instagram.com/selfprintapp',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@selfprint.one',
      availableLanguage: ['Thai', 'English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
};

// ─── SoftwareApplication ─────────────────────────────────────────────────────

export const SoftwareApplicationSchema: FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Selfprint',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web, iOS, Android',
    url: 'https://selfprint.one',
    description:
      'Your AI Twin — a personalised intelligence system that understands your personality, decisions, and life across 12 worlds.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
      description: 'Free to start. Premium plans available.',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '120',
    },
    inLanguage: ['th', 'en'],
    author: {
      '@type': 'Organization',
      name: 'Selfprint',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
};

// ─── Article / FAQ page ───────────────────────────────────────────────────────

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  datePublished: string;         // ISO 8601, e.g. "2026-08-19"
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
}

export const ArticleSchema: FC<ArticleSchemaProps> = ({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName = 'Selfprint Team',
  imageUrl,
}) => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Selfprint',
      logo: {
        '@type': 'ImageObject',
        url: 'https://selfprint.one/logo.png',
      },
    },
    inLanguage: ['th', 'en'],
  };

  if (imageUrl) {
    schema.image = {
      '@type': 'ImageObject',
      url: imageUrl,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
};

// ─── FAQ Page ─────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export const FAQSchema: FC<FAQSchemaProps> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
};

// ─── hreflang helper (inject into <head>) ────────────────────────────────────

interface HreflangLinksProps {
  thUrl: string;   // Thai URL, e.g. https://selfprint.one/th/pricing
  enUrl: string;   // English URL
}

/**
 * Renders <link rel="alternate"> hreflang tags.
 * Place inside <Helmet> or a custom Head component.
 */
export const HreflangLinks: FC<HreflangLinksProps> = ({ thUrl, enUrl }) => (
  <>
    <link rel="alternate" hrefLang="th" href={thUrl} />
    <link rel="alternate" hrefLang="en" href={enUrl} />
    <link rel="alternate" hrefLang="x-default" href={enUrl} />
  </>
);
