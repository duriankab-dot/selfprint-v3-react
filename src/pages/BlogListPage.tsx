/**
 * BlogListPage — คลังบทความ SELFPRINT
 * 3 launch articles สร้างเป็น static เพื่อ SEO ที่แม่นยำ
 * ดักคำค้นหา: สายมู → สายวิทยาศาสตร์, AI Twin, พัฒนาตัวเอง
 */

import { useState } from 'react';
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLangNavigate as useNavigate } from '@/hooks/useLangNavigate';

interface Article {
  slug: string;
  emoji: string;
  category: string;
  readTime: string;
  title: string;
  excerpt: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    slug: 'rahu-or-blindspot',
    emoji: '🌑',
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
    emoji: '🧬',
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

  if (active) {
    return (
      <>
        <MetaTagManager title={`${active.title} — SELFPRINT Blog`} description={active.excerpt} canonicalUrl={`/th/blog/${active.slug}`} />
        <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 80px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 0' }}>
            <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', color: 'var(--color-accent-primary)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '32px', padding: 0 }}>
              ← กลับไปดูบทความทั้งหมด
            </button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', background: 'color-mix(in srgb,var(--color-accent-primary) 12%,transparent)', color: 'var(--color-accent-primary)', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>{active.category}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>⏱ {active.readTime}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, lineHeight: 1.3, marginBottom: '24px' }}>{active.title}</h1>
            {active.content.map((para, i) => (
              <p key={i} style={{ fontSize: '16px', lineHeight: 1.85, color: 'var(--color-text-secondary)', marginBottom: '20px' }}>{para}</p>
            ))}
            <div style={{ marginTop: '48px', padding: '28px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>อยากรู้จักตัวเองในแบบที่บทความนี้พูดถึง?</p>
              <button onClick={() => navigate('/onboarding')} style={{ padding: '12px 28px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
                ให้กำเนิด AI Twin ของฉัน →
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
        description="อ่านบทความเกี่ยวกับวิทยาศาสตร์พฤติกรรม AI Twin ฝาแฝดดิจิทัล และวิธีเข้าใจตัวเองด้วยข้อมูล ไม่ใช่ดวงชะตา"
        canonicalUrl="/th/blog"
      />
      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 80px' }}>
        <style>{`
          .blog-card { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 18px; padding: 28px; cursor: pointer; transition: border-color 0.2s, transform 0.2s; }
          .blog-card:hover { border-color: var(--color-accent-primary); transform: translateY(-3px); }
          .blog-cat { display: inline-block; background: color-mix(in srgb,var(--color-accent-primary) 12%,transparent); color: var(--color-accent-primary); border-radius: 20px; padding: 3px 10px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        `}</style>

        <div style={{ background: 'var(--color-bg-secondary)', padding: '72px 24px 48px', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📖</div>
          <h1 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, margin: '0 0 12px' }}>คลังบทความ</h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>วิทยาศาสตร์พฤติกรรม AI Twin และวิธีเข้าใจตัวเองอย่างแท้จริง</p>
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '24px' }}>
          {ARTICLES.map((a) => (
            <div key={a.slug} className="blog-card" onClick={() => setActive(a)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActive(a)}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{a.emoji}</div>
              <div className="blog-cat">{a.category}</div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, lineHeight: 1.4, margin: '0 0 10px' }}>{a.title}</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 16px' }}>{a.excerpt}</p>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>⏱ {a.readTime} · อ่านต่อ →</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
