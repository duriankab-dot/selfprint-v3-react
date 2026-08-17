/**
 * FAQAccordion Component
 * Displays FAQs in an expandable accordion format
 */

import { useState } from 'react';
import type { FAQ } from '../constants/faqs';
import '../styles/faq-accordion.css';

interface FAQAccordionProps {
  faqs: FAQ[];
  defaultOpen?: string | null;
}

export function FAQAccordion({ faqs, defaultOpen }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen || null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="faq-accordion">
      {faqs.map((faq) => (
        <div key={faq.id} className="faq-item">
          <button
            className={`faq-question ${openId === faq.id ? 'active' : ''}`}
            onClick={() => toggleFAQ(faq.id)}
            aria-expanded={openId === faq.id}
            aria-controls={`faq-answer-${faq.id}`}
          >
            <span className="faq-text">{faq.question}</span>
            <span className="faq-icon" aria-hidden="true">
              {openId === faq.id ? '−' : '+'}
            </span>
          </button>

          {openId === faq.id && (
            <div id={`faq-answer-${faq.id}`} className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
