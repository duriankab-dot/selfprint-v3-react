/**
 * FAQPage
 * Frequently Asked Questions page with categorized accordion
 */

import { useState } from 'react';
import { FAQAccordion } from '../components/FAQAccordion';
import { CATEGORY_LABELS, getFAQsByCategory, getFAQCategories } from '../constants/faqs';
import type { FAQ } from '../constants/faqs';
import { MetaTagManager } from '../components/MetaTagManager';
import { useLanguage } from '../context/LanguageContext';
import { getSeoMetadata } from '../constants/seoMetadata';
import { generateFAQSchema } from '../lib/structuredData';
import '../styles/faq-page.css';

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<FAQ['category']>('general');
  const categories = getFAQCategories();
  const displayedFAQs = getFAQsByCategory(selectedCategory);
  const { language } = useLanguage();
  const seoData = getSeoMetadata('faq', language);

  // Prepare FAQ data for schema (first 5 FAQs for rich results)
  const faqSchemaData = displayedFAQs.slice(0, 5).map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));
  const faqSchema = faqSchemaData.length > 0 ? generateFAQSchema(faqSchemaData) : undefined;

  return (
    <>
      {seoData && (
        <MetaTagManager
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords?.join(', ')}
          ogImage={seoData.ogImage}
          canonicalUrl={`/${language}/faq`}
          schema={faqSchema}
        />
      )}
      <div className="faq-page">
      <div className="faq-header">
        <h1>บ่อยถามบ่อยตอบ</h1>
        <p>หาคำตอบสำหรับคำถามทั่วไปเกี่ยวกับ Selfprint และ AI Twin ของคุณ</p>
      </div>

      {/* Category Filter */}
      <div className="faq-categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`faq-category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* FAQs Accordion */}
      <div className="faq-content">
        <FAQAccordion faqs={displayedFAQs} />
      </div>

      {/* Contact Section */}
      <div className="faq-footer">
        <h2>ยังคงมีคำถาม?</h2>
        <p>หากคุณไม่พบคำตอบ โปรดติดต่อเรา</p>
        <a href="mailto:support@selfprint.one" className="btn-primary">
          ส่งอีเมล
        </a>
      </div>
      </div>
    </>
  );
}
