/**
 * BlogListPage — คลังบทความ SELFPRINT
 * 3 static + 25 dynamic articles (ฟรีอ่านทั้งหมด)
 * ดักคำค้นหา: สายมู → สายวิทยาศาสตร์, AI Twin, พัฒนาตัวเอง
 */

import { useState, useEffect } from 'react';
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLangNavigate as useNavigate } from '@/hooks/useLangNavigate';

interface Article {
  slug: string;
  emoji?: string;
  category: string;
  readTime?: string;
  title: string;
  excerpt: string;
  content?: string[];
  featured?: boolean;
  world?: string;
}

interface DynamicArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  world: string;
  publishedAt: string;
  featured: boolean;
}

// Icon mapping for scientific categories
const ICON_MAP: Record<string, string> = {
  'Self-Discovery': '🧬',
  'Features': '🤖',
  'Problem-Solving': '⚡',
  'Advanced': '🔬',
  'วิทยาศาสตร์พฤติกรรม': '🧬',
  'AI Twin': '🤖',
  'พัฒนาตัวเอง': '🔬',
};

// 3 Static articles (launch SEO content)
const STATIC_ARTICLES: Article[] = [
  {
    slug: 'rahu-or-blindspot',
    emoji: '🧬',
    category: 'วิทยาศาสตร์พฤติกรรม',
    readTime: '5 นาที',
    title: 'ราหูย้าย หรือ นิสัยเปลี่ยน?',
    excerpt: 'เจาะลึกทำไมบางช่วงชีวิตทำอะไรก็ติดขัด และวิธีแก้ด้วยดาต้าพฤติกรรมแทนการดูดวง',
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
    content: [
      'ความเครียดไม่ได้เกิดขึ้นเพราะโชคร้าย แต่เกิดจากช่องว่างระหว่างสิ่งที่คุณเป็นกับสิ่งที่สถานการณ์ต้องการ ยิ่งช่องว่างนั้นกว้างเท่าไร ความเครียดยิ่งรุนแรงขึ้นเท่านั้น',
      'ระบบ 12 SICE Engines ของ SELFPRINT วิเคราะห์พฤติกรรมของคุณในทุกมิติที่สำคัญ ตั้งแต่วิธีที่คุณตัดสินใจ (SICE-09) ไปจนถึงรูปแบบการรับมือความเครียด (SICE-11) และความสัมพันธ์กับเงินและความมั่งคั่ง (SICE-06)',
      'เมื่อ SELFPRINT วิเคราะห์ครบทั้ง 12 มิติแล้ว คุณจะได้ "พิมพ์เขียวพฤติกรรม" เฉพาะตัว ที่บอกว่าคุณจะเครียดมากสุดในสถานการณ์แบบไหน และทางออกที่เหมาะกับบุคลิกของคุณโดยเฉพาะคืออะไร',
      'ไม่มีใครสองคนที่มีพิมพ์เขียวพฤติกรรมเหมือนกันทุกประการ นั่นคือเหตุผลที่คำแนะนำแบบ "ใช้ได้กับทุกคน" มักไม่ได้ผลสำหรับคุณ — และทำไม SELFPRINT จึงสร้าง AI Twin เฉพาะคุณคนเดียว',
    ],
  },
];

export default function BlogListPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Article | null>(null);
  const [activeContent, setActiveContent] = useState<string>('');
  const [dynamicArticles, setDynamicArticles] = useState<DynamicArticle[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Load 25 dynamic articles from index.json
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch('/blog/index.json');
        if (response.ok) {
          const data = await response.json();
          setDynamicArticles(data.articles || []);
        }
      } catch (err) {
        console.error('Error loading dynamic articles:', err);
      }
    };
    loadArticles();
  }, []);

  // Load markdown content for dynamic articles
  const loadMarkdownContent = async (world: string, category: string, slug: string) => {
    setLoadingContent(true);
    try {
      const path = `/blog/${world}/${category}/${slug}.md`;
      const response = await fetch(path);
      if (response.ok) {
        const markdown = await response.text();
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);
        if (match) {
          const [, , content] = match;
          setActiveContent(content);
        }
      }
    } catch (err) {
      console.error('Error loading content:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  // Combine static + dynamic articles
  const allArticles: Article[] = [
    ...STATIC_ARTICLES,
    ...dynamicArticles.map(da => ({
      slug: da.slug,
      emoji: ICON_MAP[da.category] || '📄',
      category: da.category,
      title: da.title,
      excerpt: da.excerpt,
      featured: da.featured,
      world: da.world,
    }))
  ];

  const handleArticleClick = async (a: Article) => {
    setActive(a);
    setActiveContent('');

    if (a.content) {
      // Static article - use built-in content
      return;
    }

    // Dynamic article - load markdown
    if (a.world) {
      await loadMarkdownContent(a.world, a.category.toLowerCase(), a.slug);
    }
  };

  if (active) {
    return (
      <>
        <MetaTagManager title={`${active.title} — SELFPRINT Blog`} description={active.excerpt} canonicalUrl={`/th/blog/${active.slug}`} />
        <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 80px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 0' }}>
            <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '32px', padding: 0 }}>
              ← กลับไปดูบทความทั้งหมด
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', background: 'color-mix(in srgb,var(--color-accent-primary) 12%,transparent)', color: 'var(--color-accent-primary)', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>{active.category}</span>
              {active.readTime && <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>⏱ {active.readTime}</span>}
            </div>

            <h1 style={{ fontSize: 'clamp(24px,5vw,40px)', fontWeight: 900, lineHeight: 1.3, marginBottom: '32px' }}>{active.title}</h1>

            <div style={{ fontSize: '16px', lineHeight: 1.85, color: 'var(--color-text-secondary)', marginBottom: '48px' }}>
              {active.content && active.content.map((para, i) => (
                <p key={i} style={{ marginBottom: '20px' }}>{para}</p>
              ))}

              {!active.content && (
                <>
                  {loadingContent && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>กำลังโหลดบทความ...</p>}
                  {activeContent && (
                    <div>
                      {activeContent.split('\n\n').map((para, i) =>
                        para.trim() && <p key={i} style={{ marginBottom: '20px' }}>{para}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ marginTop: '60px', padding: '32px', background: 'var(--color-bg-secondary)', border: '2px solid var(--color-accent-primary)', borderRadius: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>🚀</div>
              <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>อยากเข้าใจตัวเองอย่างลึกซึ้ง?</p>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>ให้ AI Twin ของคุณวิเคราะห์พฤติกรรม 12 มิติและค้นพบตัวเองที่แท้จริง</p>
              <button onClick={() => navigate('/onboarding')} style={{ padding: '14px 32px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>
                สร้าง SELFPRINT ของฉัน →
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <MetaTagManager
        title="คลังบทความ SELFPRINT — วิทยาศาสตร์พฤติกรรม AI Twin และการพัฒนาตัวเอง"
        description="อ่านบทความฟรีเกี่ยวกับวิทยาศาสตร์พฤติกรรม AI Twin ฝาแฝดดิจิทัล และวิธีเข้าใจตัวเองด้วยข้อมูล ไม่ใช่ดวงชะตา"
        canonicalUrl="/th/blog"
      />
      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 80px' }}>
        <style>{`
          .blog-card { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 18px; padding: 28px; cursor: pointer; transition: all 0.2s; }
          .blog-card:hover { border-color: var(--color-accent-primary); transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
          .blog-cat { display: inline-block; background: color-mix(in srgb,var(--color-accent-primary) 12%,transparent); color: var(--color-accent-primary); border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        `}</style>

        <div style={{ background: 'var(--color-bg-secondary)', padding: '80px 24px 56px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, margin: '0 0 16px' }}>คลังบทความ SELFPRINT</h1>
          <p style={{ fontSize: '17px', color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>วิทยาศาสตร์พฤติกรรม AI Twin และวิธีเข้าใจตัวเองอย่างแท้จริง — {allArticles.length} บทความ (อ่านฟรี)</p>
        </div>

        <div style={{ maxWidth: '920px', margin: '0 auto', padding: '56px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '28px' }}>
          {allArticles.map((a, idx) => (
            <div key={`${a.slug}-${idx}`} className="blog-card" onClick={() => handleArticleClick(a)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleArticleClick(a)}>
              <div style={{ fontSize: '44px', marginBottom: '16px', lineHeight: 1 }}>{a.emoji || '📄'}</div>
              <div className="blog-cat">{a.category}</div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.4, margin: '0 0 12px' }}>{a.title}</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 16px', minHeight: '42px' }}>{a.excerpt}</p>
              <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>อ่านเลย →</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
