/**
 * FAQPage
 * Frequently Asked Questions page with categorized accordion
 */

import { useState } from 'react';
import { FAQAccordion } from '../components/FAQAccordion';
import { CATEGORY_LABELS, CATEGORY_LABELS_EN, getFAQsByCategory, getFAQCategories } from '../constants/faqs';
import type { FAQ } from '../constants/faqs';
import { MetaTagManager } from '../components/MetaTagManager';
import { useLanguage } from '../context/LanguageContext';
import { getSeoMetadata } from '../constants/seoMetadata';
// TC-309: dual FAQPage + QAPage schema (AEO/GEO)
import { faqDualSchema } from '../lib/aeoSchemas';
import '../styles/faq-page.css';

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<FAQ['category']>('general');
  const categories = getFAQCategories();
  const displayedFAQs = getFAQsByCategory(selectedCategory);
  const { language } = useLanguage();
  const isTh = language === 'th';
  const seoData = getSeoMetadata('faq', language);
  const categoryLabels = isTh ? CATEGORY_LABELS : CATEGORY_LABELS_EN;

  // Localize FAQ question/answer for display + schema
  const localizedFAQs = displayedFAQs.map((faq) => ({
    ...faq,
    question: isTh ? faq.question : faq.questionEn,
    answer: isTh ? faq.answer : faq.answerEn,
  }));

  // TC-309: dual schema (FAQPage + QAPage) using bilingual Q&A pairs —
  // ทั้ง 5 ข้อแรก (Rich Results eligible) ผ่าน MetaTagManager.additionalScripts
  const bilingualFAQs = displayedFAQs.slice(0, 5).map((faq) => ({
    q: { th: faq.question, en: faq.questionEn },
    a: { th: faq.answer, en: faq.answerEn },
  }));
  const dualSchemas = faqDualSchema(bilingualFAQs, isTh ? 'th-TH' : 'en-US');

  return (
    <>
      {seoData && (
        <MetaTagManager
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords?.join(', ')}
          ogImage={seoData.ogImage}
          canonicalUrl={`/${language}/faq`}
          additionalScripts={[
            { type: 'application/ld+json', content: JSON.stringify(dualSchemas.faq) },
            { type: 'application/ld+json', content: JSON.stringify(dualSchemas.qa) },
          ]}
        />
      )}
      <div className="faq-page">
      <div className="faq-header">
        <h1>{isTh ? 'บ่อยถามบ่อยตอบ' : 'Frequently asked questions'}</h1>
        <p>{isTh
          ? 'หาคำตอบสำหรับคำถามทั่วไปเกี่ยวกับ Selfprint และ AI Twin ของคุณ'
          : 'Find answers to common questions about Selfprint and your AI Twin'}</p>
      </div>

      {/* Category Filter */}
      <div className="faq-categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`faq-category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      {/* FAQs Accordion */}
      <div className="faq-content">
        <FAQAccordion faqs={localizedFAQs} />
      </div>

      {/* Contact Section */}
      <div className="faq-footer">
        <h2>{isTh ? 'ยังคงมีคำถาม?' : 'Still have questions?'}</h2>
        <p>{isTh ? 'หากคุณไม่พบคำตอบ โปรดติดต่อเรา' : "If you couldn't find your answer, get in touch"}</p>
        <a href="mailto:support@selfprint.one" className="btn-primary">
          {isTh ? 'ส่งอีเมล' : 'Send an email'}
        </a>
      </div>
      </div>
    </>
  );
}
