import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  type BreadcrumbItem,
} from '../lib/structuredData';

interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  schema?: Record<string, any>; // Additional JSON-LD schema
  breadcrumbs?: BreadcrumbItem[]; // For BreadcrumbList schema
}

export function MetaTagManager({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  schema,
  breadcrumbs,
}: MetaTagsProps) {
  const { language } = useLanguage();
  const baseUrl = 'https://selfprint.one';
  const fullTitle = `${title} | Selfprint`;
  const fullUrl = canonicalUrl || baseUrl;

  // Generate breadcrumb schema if provided
  const breadcrumbSchema = breadcrumbs ? generateBreadcrumbSchema(breadcrumbs) : null;

  // Generate organization schema (present on all pages)
  const orgSchema = generateOrganizationSchema();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="language" content={language === 'th' ? 'Thai' : 'English'} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Hreflang Tags (Multi-language) */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${canonicalUrl?.replace(/^\/(en|th)/, '') || ''}`} />
      <link rel="alternate" hrefLang="th" href={`${baseUrl}/th${canonicalUrl?.replace(/^\/(en|th)/, '') || ''}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en${canonicalUrl?.replace(/^\/(en|th)/, '') || ''}`} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={`${baseUrl}${canonicalUrl}`} />}

      {/* JSON-LD Schemas */}
      {/* Organization Schema (always present) */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>

      {/* SoftwareApplication Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Selfprint',
          description: 'Personal intelligence platform powered by AI Twin',
          applicationCategory: 'ProductivityApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          url: baseUrl,
          image: `${baseUrl}/og-image.png`,
          author: {
            '@type': 'Organization',
            name: 'Selfprint',
            url: baseUrl,
          },
        })}
      </script>

      {/* Breadcrumb Schema (if provided) */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Custom Schema (if provided) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
