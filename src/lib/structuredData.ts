/**
 * structuredData.ts
 *
 * JSON-LD Schema generators for SEO
 * - Organization
 * - FAQPage
 * - BlogPosting
 * - BreadcrumbList
 */

const BASE_URL = 'https://selfprint.one';
const ORGANIZATION_NAME = 'Selfprint';
const ORGANIZATION_LOGO = `${BASE_URL}/logo.png`;
const ORGANIZATION_EMAIL = 'hello@selfprint.app';

/**
 * Organization Schema
 * Used on all pages to establish brand entity
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION_NAME,
    url: BASE_URL,
    logo: ORGANIZATION_LOGO,
    description: 'Personal intelligence platform powered by AI Twin',
    sameAs: [
      'https://twitter.com/selfprintai',
      'https://linkedin.com/company/selfprint',
      'https://facebook.com/selfprint',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: ORGANIZATION_EMAIL,
    },
    founder: {
      '@type': 'Person',
      name: 'SelfPrint Team',
    },
  };
}

/**
 * FAQPage Schema
 * For rich results in Google Search
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * BlogPosting Schema
 * For blog articles (future use)
 */
export function generateBlogPostingSchema({
  title,
  description,
  datePublished,
  dateModified,
  author,
  image,
  url,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
    },
    image: image || ORGANIZATION_LOGO,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      logo: {
        '@type': 'ImageObject',
        url: ORGANIZATION_LOGO,
      },
    },
  };
}

/**
 * BreadcrumbList Schema
 * For navigation hierarchy
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * SoftwareApplication Schema
 * Main app schema (in MetaTagManager)
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: ORGANIZATION_NAME,
    description: 'Personal intelligence platform powered by AI Twin',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    url: BASE_URL,
    image: ORGANIZATION_LOGO,
    author: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      url: BASE_URL,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      highPrice: '589',
      lowPrice: '0',
      offerCount: '4',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    features: [
      'AI Twin conversation',
      'Decision logging',
      'Personal insights',
      'World exploration',
      'Voice interaction',
      'Analytics dashboard',
    ],
  };
}

/**
 * LocalBusiness Schema
 * For local search visibility (GEO)
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: ORGANIZATION_NAME,
    url: BASE_URL,
    logo: ORGANIZATION_LOGO,
    description: 'Personal intelligence platform powered by AI Twin',
    telephone: '+66-XX-XXXX-XXXX', // เปลี่ยนตามเบอร์จริง
    email: ORGANIZATION_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bangkok, Thailand', // เปลี่ยนตามที่อยู่จริง
      addressLocality: 'Bangkok',
      addressRegion: 'Bangkok',
      postalCode: '10110',
      addressCountry: 'TH',
    },
    sameAs: [
      'https://twitter.com/selfprintai',
      'https://linkedin.com/company/selfprint',
      'https://facebook.com/selfprint',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: ORGANIZATION_EMAIL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Thailand',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  };
}

/**
 * Pricing/Offer Schema
 * For pricing page rich results
 */
export interface PricingPlan {
  name: string;
  price: number;
  priceCurrency: string;
  billingDuration: string; // P1M for monthly, P1Y for yearly
  description: string;
}

export function generatePricingSchema(plans: PricingPlan[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: ORGANIZATION_NAME,
    description: 'SelfPrint Pricing Plans',
    offers: plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      price: plan.price,
      priceCurrency: plan.priceCurrency,
      billingDuration: plan.billingDuration,
      url: `${BASE_URL}/en/pricing`,
      availability: 'https://schema.org/InStock',
    })),
  };
}
