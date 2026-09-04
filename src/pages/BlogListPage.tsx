/**
 * BlogListPage — คลังบทความ SELFPRINT
 * 3 static + 25 dynamic articles (ฟรีอ่านทั้งหมด)
 * SEO/GEO/AEO: JSON-LD Article + FAQ schema + speakable + hreflang
 */

import React, { useState, useEffect } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router-dom';
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLangNavigate as useNavigate } from '@/hooks/useLangNavigate';
import { useLanguage } from '@/context/LanguageContext';

/** Serialize an object as JSON-LD, escaping `</` to prevent `</script>` injection. */
const safeJsonLd = (obj: unknown): string =>
  JSON.stringify(obj).replace(/<\//g, '<\\/');

// i18n scope note: article bodies (STATIC_ARTICLES titles/excerpts/content
// below, plus the ~25 dynamic articles fetched from /blog/*.md) are Thai-only
// long-form editorial content — same data-layer gap already flagged for
// WorldDetail.tsx's engine *Thai fields in the i18n handoff doc. Translating
// full articles is a content project, not a UI-string fix; only this page's
// UI chrome (buttons, headings, loading/empty states) is made bilingual here.

interface Article {
  slug: string;
  filePath?: string;
  emoji?: string;
  category: string;
  readTime?: string;
  title: string;
  excerpt: string;
  content?: string[];
  featured?: boolean;
  world?: string;
  keywords?: string[];
  publishedAt?: string;
}

interface DynamicArticle {
  id: string;
  title: string;
  slug: string;
  filePath?: string;
  excerpt: string;
  category: string;
  world: string;
  publishedAt: string;
  featured: boolean;
  keywords?: string[];
}

const ICON_MAP: Record<string, string> = {
  'Self-Discovery': '🧬',
  'Features': '🤖',
  'Problem-Solving': '⚡',
  'Advanced': '🔬',
  'วิทยาศาสตร์พฤติกรรม': '🧬',
  'AI Twin': '🤖',
  'พัฒนาตัวเอง': '🔬',
  // BLOGFRAMEWORK-001: icons for the career/health/relationships article
  // group, now indexed alongside the original 25 in the same list/renderer.
  'Career Development': '💼',
  'Health': '🧘',
  'Health & Wellness': '🧘',
  'Relationships': '🤝',
};

// 3 Static articles (evergreen SEO anchors)
const STATIC_ARTICLES: Article[] = [
  {
    slug: 'rahu-or-blindspot',
    emoji: '🧬',
    category: 'วิทยาศาสตร์พฤติกรรม',
    readTime: '5 นาที',
    title: 'ราหูย้าย หรือ นิสัยเปลี่ยน?',
    excerpt: 'เจาะลึกทำไมบางช่วงชีวิตทำอะไรก็ติดขัด และวิธีแก้ด้วยดาต้าพฤติกรรมแทนการดูดวง',
    keywords: ['ราหูย้าย', 'จุดบอดพฤติกรรม', 'Blind Spot', 'วิทยาศาสตร์พฤติกรรม'],
    publishedAt: '2026-08-01',
    content: [
      'บางช่วงชีวิตรู้สึกว่าทำอะไรก็ไม่ราบรื่น — ธุรกิจสะดุด ความสัมพันธ์ขัดแย้ง การเงินติดปัญหา คนส่วนใหญ่มักโทษดวง "ราหูกลับ" หรือ "ดาวเสาร์แทรก" แต่วิทยาศาสตร์พฤติกรรมมีคำอธิบายที่แม่นยำกว่านั้น',
      'สิ่งที่เราเรียกว่า "ดวงตก" มักเกิดจาก Blind Spots พฤติกรรม — รูปแบบความคิดและการตัดสินใจที่ซ่อนอยู่ในระบบจิตใจของเรา เช่น Confirmation Bias (เชื่อสิ่งที่อยากเชื่อ), Sunk Cost Fallacy (ทนกับสถานการณ์แย่เพราะลงทุนไปแล้ว) หรือ Negativity Bias (โฟกัสที่ปัญหามากกว่าโอกาส)',
      'ระบบ SICE ของ SELFPRINT วิเคราะห์รูปแบบเหล่านี้ใน 12 มิติพร้อมกัน ทำให้เห็นว่า "ช่วงที่ดวงตก" ของคุณมักเกิดจาก Blind Spot มิติไหน — อาชีพ ความสัมพันธ์ หรือการตัดสินใจ',
      'ไม่ต้องรอดาวย้าย แค่รู้ว่าจุดบอดของตัวเองอยู่ที่ไหน คุณแก้ได้ทันที AI Twin ของ SELFPRINT ออกแบบมาเพื่อชี้จุดนั้นโดยเฉพาะ',
    ],
  },
  {
    slug: 'what-is-ai-twin',
    emoji: '🤖',
    category: 'AI Twin',
    readTime: '4 นาที',
    title: 'AI Twin คืออะไร? ทำไมคนรุ่นใหม่ยุค 2026 ต้องมีฝาแฝดดิจิทัล',
    excerpt: 'ทำความรู้จัก AI Twin — ฝาแฝดดิจิทัลที่เกิดจากข้อมูลพฤติกรรมจริง ไม่ใช่ Chatbot ธรรมดา',
    keywords: ['AI Twin', 'ฝาแฝดดิจิทัล', 'Digital Twin', 'AI ส่วนตัว'],
    publishedAt: '2026-08-05',
    content: [
      'ลองนึกภาพว่ามีร่างจำลองตัวเองที่รู้ทุกอย่างเกี่ยวกับคุณ — รู้ว่าคุณตัดสินใจอย่างไรเมื่อตกอยู่ภายใต้ความกดดัน รู้ว่าคุณมีจุดแข็งด้านไหน มีจุดบอดตรงไหน และมักหลงทางเมื่อเจอสถานการณ์แบบไหน นั่นคือ AI Twin',
      'AI Twin ของ SELFPRINT ไม่ใช่ Chatbot ทั่วไปที่ตอบทุกคนเหมือนกัน มันถูกสร้างจากข้อมูลพฤติกรรม 12 มิติของคุณโดยเฉพาะ ทำให้คำแนะนำที่ได้รับตรงกับบริบทชีวิตจริงของคุณ',
      'ในยุคที่ข้อมูลมหาศาลอยู่รอบตัว สิ่งที่ขาดไม่ใช่คำแนะนำ แต่คือคำแนะนำที่ "รู้จักคุณ" พอที่จะบอกว่าอะไรเหมาะกับคุณโดยเฉพาะ',
      'AI Twin เรียนรู้และเติบโตไปพร้อมกับคุณ ยิ่งโต้ตอบมาก ยิ่งแม่น ยิ่งเข้าใจคุณลึกขึ้นในทุกมิติของชีวิต',
    ],
  },
  {
    slug: '12-sice-behavioral-blueprint',
    emoji: '🔬',
    category: 'พัฒนาตัวเอง',
    readTime: '6 นาที',
    title: 'ถอดรหัสพฤติกรรม 12 มิติ: วิธีอ่านใจตัวเองก่อนโดนความเครียดกลืนกิน',
    excerpt: 'ระบบ 12 SICE Engines วิเคราะห์อะไรบ้าง และทำไมการรู้จัก Behavioral Blueprint ของตัวเองจึงเปลี่ยนชีวิตได้',
    keywords: ['SICE Engines', 'Behavioral Blueprint', 'พฤติกรรม 12 มิติ', 'พัฒนาตัวเอง'],
    publishedAt: '2026-08-10',
    content: [
      'ความเครียดไม่ได้เกิดขึ้นเพราะโชคร้าย แต่เกิดจากช่องว่างระหว่างสิ่งที่คุณเป็นกับสิ่งที่สถานการณ์ต้องการ ยิ่งช่องว่างนั้นกว้างเท่าไร ความเครียดยิ่งรุนแรงขึ้นเท่านั้น',
      'ระบบ 12 SICE Engines ของ SELFPRINT วิเคราะห์พฤติกรรมของคุณในทุกมิติที่สำคัญ ตั้งแต่วิธีที่คุณตัดสินใจ (SICE-09) ไปจนถึงรูปแบบการรับมือความเครียด (SICE-11) และความสัมพันธ์กับเงินและความมั่งคั่ง (SICE-06)',
      'เมื่อ SELFPRINT วิเคราะห์ครบทั้ง 12 มิติแล้ว คุณจะได้ "พิมพ์เขียวพฤติกรรม" เฉพาะตัว ที่บอกว่าคุณจะเครียดมากสุดในสถานการณ์แบบไหน และทางออกที่เหมาะกับบุคลิกของคุณโดยเฉพาะคืออะไร',
      'ไม่มีใครสองคนที่มีพิมพ์เขียวพฤติกรรมเหมือนกันทุกประการ นั่นคือเหตุผลที่คำแนะนำแบบ "ใช้ได้กับทุกคน" มักไม่ได้ผลสำหรับคุณ — และทำไม SELFPRINT จึงสร้าง AI Twin เฉพาะคุณคนเดียว',
    ],
  },
];

/** FAQ schema สำหรับ AEO (Answer Engine Optimization) */
function buildFaqSchema(articles: Article[]) {
  const faqs = [
    { q: 'SELFPRINT คืออะไร?', a: 'SELFPRINT คือ Personal Intelligence Platform ที่ใช้ AI วิเคราะห์พฤติกรรมใน 12 มิติ สร้าง AI Twin (ฝาแฝดดิจิทัล) เฉพาะตัวคุณ เพื่อช่วยตัดสินใจและพัฒนาตัวเองได้แม่นยำกว่าการดูดวง' },
    { q: 'AI Twin คืออะไร?', a: 'AI Twin คือฝาแฝดดิจิทัลที่เกิดจากข้อมูลพฤติกรรม 12 มิติของคุณ ต่างจาก Chatbot ทั่วไปตรงที่มันรู้จักคุณเฉพาะตัว ตอบคำถามได้ตรงกับบริบทชีวิตจริงของคุณ' },
    { q: 'SELFPRINT ต่างจากการดูดวงอย่างไร?', a: 'การดูดวงใช้วันเกิดทำนายอนาคต SELFPRINT ใช้วิทยาศาสตร์พฤติกรรม 12 มิติวิเคราะห์รูปแบบการตัดสินใจ จุดแข็ง และจุดบอดของคุณจริงๆ ผลลัพธ์คือคำแนะนำที่ปรับได้และวัดผลได้' },
    { q: 'SELFPRINT ใช้ได้กับใครบ้าง?', a: 'ทุกคนที่ต้องการเข้าใจตัวเองลึกขึ้น — คนที่กำลังตัดสินใจเรื่องสำคัญในชีวิต เช่น อาชีพ ความสัมพันธ์ การเงิน หรือต้องการพัฒนาตัวเองอย่างถูกจุดและมีประสิทธิภาพ' },
    ...articles.slice(0, 5).map(a => ({
      q: a.title,
      a: a.excerpt,
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
    })),
  };
}

/** Article JSON-LD schema สำหรับ GEO/SEO */
function buildArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.excerpt,
    'keywords': (article.keywords || []).join(', '),
    'datePublished': article.publishedAt || '2026-08-27',
    'dateModified': article.publishedAt || '2026-08-27',
    'author': { '@type': 'Organization', 'name': 'SELFPRINT', 'url': 'https://selfprint.one' },
    'publisher': {
      '@type': 'Organization',
      'name': 'SELFPRINT',
      'logo': { '@type': 'ImageObject', 'url': 'https://selfprint.one/logo.png' },
    },
    'inLanguage': 'th',
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['h1', '.article-excerpt'],
    },
  };
}

export default function BlogListPage() {
  const navigate = useNavigate();
  // BLOG-CODE-001 FIX: the /blog/:slug route (BlogArticle.tsx) has no
  // language prefix, but useLangNavigate would force-prefix it with
  // /en or /th and 404 into the catch-all redirect. Use the raw router
  // navigate for that one link.
  const routerNavigate = useRouterNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [active, setActive] = useState<Article | null>(null);
  const [dynamicArticles, setDynamicArticles] = useState<DynamicArticle[]>([]);
  const savedScrollY = React.useRef<number>(0);

  // BLOGRACE-001: abort + guard เพื่อไม่ setState หลัง unmount
  // (ผู้ใช้กดออกจากหน้า blog ก่อน index.json โหลดเสร็จ)
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadArticles = async () => {
      try {
        const response = await fetch('/blog/index.json', { signal: controller.signal });
        if (response.ok) {
          const ct = response.headers.get('content-type') ?? '';
          if (!ct.includes('application/json')) return;
          const data = await response.json();
          if (!cancelled) setDynamicArticles(data.articles || []);
        }
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
        console.error('Error loading dynamic articles:', err);
      }
    };
    loadArticles();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const allArticles: Article[] = [
    ...STATIC_ARTICLES,
    ...dynamicArticles.map(da => ({
      slug: da.slug,
      filePath: da.filePath,
      emoji: ICON_MAP[da.category] || '📄',
      category: da.category,
      title: da.title,
      excerpt: da.excerpt,
      featured: da.featured,
      world: da.world,
      keywords: da.keywords,
      publishedAt: da.publishedAt,
    })),
  ];

  const handleArticleClick = (a: Article) => {
    // Static articles (built-in content array) render in-place below.
    if (a.content) {
      savedScrollY.current = window.scrollY;
      window.scrollTo({ top: 0, behavior: 'instant' });
      setActive(a);
      return;
    }
    // BLOG-CODE-001 FIX: dynamic (.md-sourced) articles used to be fetched
    // and hand-parsed here with a naive line-splitter that didn't understand
    // most real Markdown (numbered lists, links, tables, nested formatting,
    // etc.) — any article using those showed raw Markdown syntax as literal
    // text ("กลายเป็นโค้ด"). BlogArticle.tsx already renders these correctly
    // via react-markdown, so send dynamic articles there instead of
    // duplicating a second, broken renderer.
    routerNavigate(`/blog/${a.slug}`);
  };

  const handleBackToList = () => {
    setActive(null);
    // Restore scroll ไปตำแหน่งหัวข้อบทความเดิม
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' });
    });
  };

  // ───── Article detail view ─────
  if (active) {
    const articleSchema = buildArticleSchema(active);
    return (
      <>
        <MetaTagManager
          title={`${active.title} — SELFPRINT Blog`}
          description={active.excerpt}
          canonicalUrl={`/th/blog/${active.slug}`}
        />
        {/* JSON-LD Article schema for GEO/AEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
        />
        <main
          style={{
            minHeight: '100vh',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            padding: '0 0 80px',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 0' }}>
            <button
              onClick={handleBackToList}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '32px',
                padding: 0,
              }}
            >
              {isTh ? '← กลับไปดูบทความทั้งหมด' : '← Back to all articles'}
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <span
                style={{
                  fontSize: '12px',
                  background: 'color-mix(in srgb,var(--color-accent-primary) 12%,transparent)',
                  color: 'var(--color-accent-primary)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontWeight: 700,
                }}
              >
                {active.category}
              </span>
              {active.readTime && (
                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  ⏱ {active.readTime}
                </span>
              )}
            </div>

            <h1
              style={{ fontSize: 'clamp(24px,5vw,40px)', fontWeight: 900, lineHeight: 1.3, marginBottom: '12px' }}
            >
              {active.title}
            </h1>
            {/* AEO: speakable excerpt */}
            <p
              className="article-excerpt"
              style={{ fontSize: '17px', color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: 1.7 }}
            >
              {active.excerpt}
            </p>

            <div
              style={{
                fontSize: '16px',
                lineHeight: 1.85,
                color: 'var(--color-text-secondary)',
                marginBottom: '48px',
              }}
            >
              {/* Static article content */}
              {active.content &&
                active.content.map((para, i) => (
                  <p key={i} style={{ marginBottom: '20px' }}>
                    {para}
                  </p>
                ))}
            </div>

            {/* CTA */}
            <div
              style={{
                marginTop: '60px',
                padding: '32px',
                background: 'var(--color-bg-secondary)',
                border: '2px solid var(--color-accent-primary)',
                borderRadius: '20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>🚀</div>
              <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                {isTh ? 'อยากเข้าใจตัวเองอย่างลึกซึ้ง?' : 'Want to understand yourself more deeply?'}
              </p>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                {isTh
                  ? 'ให้ AI Twin ของคุณวิเคราะห์พฤติกรรม 12 มิติและค้นพบตัวเองที่แท้จริง'
                  : 'Let your AI Twin analyze 12 dimensions of behavior and discover who you really are'}
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                style={{
                  padding: '14px 32px',
                  background: 'var(--color-accent-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {isTh ? 'สร้าง SELFPRINT ของฉัน →' : 'Create my SELFPRINT →'}
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ───── Blog index view ─────
  const faqSchema = buildFaqSchema(allArticles);
  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'คลังบทความ SELFPRINT',
    'description': 'วิทยาศาสตร์พฤติกรรม AI Twin และวิธีเข้าใจตัวเองอย่างแท้จริง',
    'url': 'https://selfprint.one/th/blog',
    'inLanguage': 'th',
    'publisher': { '@type': 'Organization', 'name': 'SELFPRINT', 'url': 'https://selfprint.one' },
    'blogPost': allArticles.slice(0, 10).map(a => ({
      '@type': 'BlogPosting',
      'headline': a.title,
      'description': a.excerpt,
      'datePublished': a.publishedAt || '2026-08-27',
      'url': `https://selfprint.one/th/blog/${a.slug}`,
      'keywords': (a.keywords || []).join(', '),
    })),
  };

  return (
    <>
      <MetaTagManager
        title={isTh
          ? 'คลังบทความ SELFPRINT — วิทยาศาสตร์พฤติกรรม AI Twin และการพัฒนาตัวเอง'
          : 'SELFPRINT Blog — Behavioral Science, AI Twin, and Self-Development'}
        description={isTh
          ? 'อ่านบทความฟรีเกี่ยวกับวิทยาศาสตร์พฤติกรรม AI Twin ฝาแฝดดิจิทัล และวิธีเข้าใจตัวเองด้วยข้อมูล ไม่ใช่ดวงชะตา'
          : 'Free articles on behavioral science, AI Twins, and understanding yourself through data — not horoscopes'}
        canonicalUrl={isTh ? '/th/blog' : '/en/blog'}
      />
      {/* JSON-LD Blog + FAQ schema (AEO: ติดใน AI Overview / Featured Snippet) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />

      <main
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          padding: '0 0 80px',
        }}
      >
        <style>{`
          .blog-card { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 18px; padding: 28px; cursor: pointer; transition: all 0.2s; }
          .blog-card:hover { border-color: var(--color-accent-primary); transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
          .blog-cat { display: inline-block; background: color-mix(in srgb,var(--color-accent-primary) 12%,transparent); color: var(--color-accent-primary); border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        `}</style>

        {/* Hero */}
        <div
          style={{
            background: 'var(--color-bg-secondary)',
            padding: '80px 24px 56px',
            textAlign: 'center',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Production QA (2026-08-28): คลังบทความไม่มีทางออกกลับหน้าหลักเลย
              ผู้ใช้ติดอยู่ในหน้านี้ ต้องกด back ของเบราว์เซอร์เท่านั้น */}
          <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto 24px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent-primary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isTh ? '← กลับหน้าหลัก' : '← Back to home'}
            </button>
          </div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, margin: '0 0 16px' }}>
            {isTh ? 'คลังบทความ SELFPRINT' : 'SELFPRINT Blog'}
          </h1>
          <p
            style={{
              fontSize: '17px',
              color: 'var(--color-text-secondary)',
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            {isTh ? 'วิทยาศาสตร์พฤติกรรม · AI Twin · พัฒนาตัวเอง' : 'Behavioral Science · AI Twin · Self-Development'}
            <br />
            <span style={{ fontSize: '14px' }}>
              {isTh ? `${allArticles.length} บทความ (อ่านฟรีทุกบทความ)` : `${allArticles.length} articles (all free to read)`}
            </span>
          </p>
        </div>

        {/* Article grid */}
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            padding: '56px 24px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
            gap: '28px',
          }}
        >
          {allArticles.map((a, idx) => (
            <article
              key={`${a.slug}-${idx}`}
              className="blog-card"
              onClick={() => handleArticleClick(a)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleArticleClick(a)}
              aria-label={a.title}
            >
              <div style={{ fontSize: '44px', marginBottom: '16px', lineHeight: 1 }}>
                {a.emoji || '📄'}
              </div>
              <div className="blog-cat">{a.category}</div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.4, margin: '0 0 12px' }}>
                {a.title}
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.65,
                  margin: '0 0 16px',
                  minHeight: '42px',
                }}
              >
                {a.excerpt}
              </p>
              <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                {isTh ? 'อ่านเลย →' : 'Read now →'}
              </span>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
