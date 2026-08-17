/**
 * seoMetadata.ts
 *
 * SEO metadata สำหรับทุกหน้า
 * - Meta title, description, keywords
 * - Open Graph tags
 * - Canonical URLs
 * - Hreflang tags (managed by MetaTagManager)
 */

export type Language = 'en' | 'th';

export interface PageMetadata {
  en: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
  th: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
}

/**
 * SEO metadata สำหรับทุกหน้า
 * Format: { en: {...}, th: {...} }
 *
 * Rules:
 * - Title: max 60 chars (search engine shows ~60)
 * - Description: 120-160 chars (optimal for CTR)
 * - Keywords: 3-5 keywords per page
 */
export const SEO_METADATA: Record<string, PageMetadata> = {
  // Home Page
  home: {
    en: {
      title: 'SelfPrint — Discover Your Future Self',
      description: 'Meet your AI Twin and explore multiple life scenarios. Make better decisions with confidence-rated insights from your future selves.',
      keywords: ['AI twin', 'future self', 'decision making', 'personal growth', 'self-discovery'],
      ogImage: '/og-home-en.jpg',
    },
    th: {
      title: 'SelfPrint — ค้นพบตัวตนของคุณในอนาคต',
      description: 'พบกับ AI Twin ของคุณและสำรวจสถานการณ์ชีวิตต่างๆ ตัดสินใจได้ดีขึ้นด้วยข้อมูลเชิงลึก',
      keywords: ['AI Twin', 'อนาคต', 'ตัดสินใจ', 'พัฒนาตัวเอง', 'ค้นหาตัวตน'],
      ogImage: '/og-home-th.jpg',
    },
  },

  // Pricing Page
  pricing: {
    en: {
      title: 'SelfPrint Pricing — Plans for Every Explorer',
      description: 'Flexible pricing plans starting at free. Get access to your AI Twin and personalized insights. No credit card required.',
      keywords: ['pricing', 'plans', 'subscription', 'AI twin', 'affordable'],
      ogImage: '/og-pricing-en.jpg',
    },
    th: {
      title: 'ราคา SelfPrint — แพ็คเกจสำหรับสำรวจเชิงลึก',
      description: 'ราคาที่ยืดหยุ่น เริ่มต้นฟรี เข้าถึง AI Twin และข้อมูลเชิงลึกส่วนบุคคล ไม่ต้องบัตรเครดิต',
      keywords: ['ราคา', 'แพ็คเกจ', 'สมาชิก', 'AI Twin', 'ราคาถูก'],
      ogImage: '/og-pricing-th.jpg',
    },
  },

  // FAQ Page
  faq: {
    en: {
      title: 'FAQ — SelfPrint Q&A',
      description: 'Frequently asked questions about SelfPrint, your AI Twin, and how to get the most from your explorations.',
      keywords: ['FAQ', 'questions', 'help', 'how to', 'support'],
      ogImage: '/og-faq-en.jpg',
    },
    th: {
      title: 'คำถามที่พบบ่อย — SelfPrint',
      description: 'คำถามที่พบบ่อยเกี่ยวกับ SelfPrint AI Twin และวิธีใช้งานให้เต็มที่',
      keywords: ['คำถาม', 'ช่วยเหลือ', 'วิธีใช้', 'เคล็ดลับ', 'FAQ'],
      ogImage: '/og-faq-th.jpg',
    },
  },

  // Privacy Center
  privacy: {
    en: {
      title: 'Privacy & Security — SelfPrint',
      description: 'Learn how SelfPrint protects your data. Our commitment to privacy, security practices, and your control over personal information.',
      keywords: ['privacy', 'security', 'data protection', 'GDPR', 'personal data'],
      ogImage: '/og-privacy-en.jpg',
    },
    th: {
      title: 'ความเป็นส่วนตัวและความปลอดภัย — SelfPrint',
      description: 'วิธีที่ SelfPrint ปกป้องข้อมูลของคุณ นโยบายความเป็นส่วนตัว การรักษาความปลอดภัย และการควบคุมข้อมูลส่วนบุคคล',
      keywords: ['ความเป็นส่วนตัว', 'ความปลอดภัย', 'คุ้มครองข้อมูล', 'PDPA', 'ข้อมูลส่วนบุคคล'],
      ogImage: '/og-privacy-th.jpg',
    },
  },

  // Worlds Hub (Protected route - still public SEO)
  worlds: {
    en: {
      title: 'Worlds — Explore Your Future Selves | SelfPrint',
      description: 'Explore 12 unique worlds representing different versions of your future. Meet your alternative selves and their perspectives.',
      keywords: ['worlds', 'future scenarios', 'alternative selves', 'perspectives', 'exploration'],
      ogImage: '/og-worlds-en.jpg',
    },
    th: {
      title: 'โลก — สำรวจตัวตนอนาคตของคุณ | SelfPrint',
      description: 'สำรวจ 12 โลกที่แตกต่างกัน แทนตัวตนอนาคตของคุณในสถานการณ์ต่างๆ พบกับมุมมองทางเลือก',
      keywords: ['โลก', 'สถานการณ์อนาคต', 'ตัวตนทางเลือก', 'มุมมอง', 'สำรวจ'],
      ogImage: '/og-worlds-th.jpg',
    },
  },

  // Dashboard (Protected - no indexing, still has meta for share)
  dashboard: {
    en: {
      title: 'Dashboard — My SelfPrint Insights',
      description: 'Your personalized dashboard with insights from your AI Twin and recorded decisions.',
      keywords: ['dashboard', 'insights', 'analytics', 'decisions', 'AI Twin'],
      ogImage: '/og-dashboard-en.jpg',
    },
    th: {
      title: 'แดชบอร์ด — ข้อมูลเชิงลึก SelfPrint ของฉัน',
      description: 'แดชบอร์ดส่วนบุคคลของคุณ ข้อมูลเชิงลึกจาก AI Twin และการตัดสินใจที่บันทึกไว้',
      keywords: ['แดชบอร์ด', 'ข้อมูลเชิงลึก', 'วิเคราะห์', 'การตัดสินใจ', 'AI Twin'],
      ogImage: '/og-dashboard-th.jpg',
    },
  },
};

/**
 * ตรวจสอบว่า metadata มีค่าทั้ง en และ th
 */
export function validateSeoMetadata(): void {
  Object.entries(SEO_METADATA).forEach(([page, metadata]) => {
    if (!metadata.en || !metadata.th) {
      console.warn(`SEO metadata missing for page: ${page}`);
    }
    if ((metadata.en.description || '').length > 160) {
      console.warn(`Description too long for ${page} EN: ${metadata.en.description.length} chars`);
    }
    if ((metadata.th.description || '').length > 160) {
      console.warn(`Description too long for ${page} TH: ${metadata.th.description.length} chars`);
    }
  });
}

/**
 * รับ metadata สำหรับหน้าและภาษา
 */
export function getSeoMetadata(page: string, language: Language) {
  const metadata = SEO_METADATA[page];
  if (!metadata) {
    console.warn(`SEO metadata not found for page: ${page}`);
    return null;
  }
  return metadata[language];
}
