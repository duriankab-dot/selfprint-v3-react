/**
 * AboutPage — เกี่ยวกับ SELFPRINT
 * SEO: E-E-A-T signal — ใครสร้าง ทำไม mission คืออะไร
 */

import { MetaTagManager } from '@/components/MetaTagManager';
import { useLangNavigate as useNavigate } from '@/hooks/useLangNavigate';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';

  const VALUES = isTh ? [
    { icon: '🔬', title: 'วิทยาศาสตร์จริง', desc: 'ทุกการวิเคราะห์อ้างอิงจากทฤษฎีพฤติกรรมศาสตร์ที่ผ่านการพิสูจน์ ไม่ใช่ความเชื่อหรือสถิติวันเดือนปีเกิด' },
    { icon: '🔒', title: 'ความเป็นส่วนตัวก่อน', desc: 'ข้อมูลของคุณเป็นของคุณ เข้ารหัสทั้งหมด ไม่ขาย ไม่แชร์ ลบได้ทุกเมื่อ' },
    { icon: '🌱', title: 'เติบโตต่อเนื่อง', desc: 'AI Twin เรียนรู้และเติบโตไปพร้อมคุณ ไม่ใช่ snapshot เดียวที่ตายตัว' },
    { icon: '🤝', title: 'เข้าถึงได้ทุกคน', desc: 'ฟีเจอร์หลักฟรีตลอด ไม่มีกำแพงเงินที่บล็อกการรู้จักตัวเอง' },
  ] : [
    { icon: '🔬', title: 'Real science', desc: 'Every analysis is grounded in validated behavioral-science theory — not belief or birth-date statistics' },
    { icon: '🔒', title: 'Privacy first', desc: 'Your data is yours. Fully encrypted, never sold, never shared, deletable anytime' },
    { icon: '🌱', title: 'Continuous growth', desc: 'Your AI Twin learns and grows with you — not a single frozen snapshot' },
    { icon: '🤝', title: 'Accessible to everyone', desc: 'Core features are free forever — no paywall blocking self-understanding' },
  ];

  return (
    <>
      <MetaTagManager
        title={isTh ? 'เกี่ยวกับ SELFPRINT — แพลตฟอร์ม AI วิเคราะห์พฤติกรรมเพื่อคนไทย' : 'About SELFPRINT — AI behavioral analysis platform'}
        description={isTh
          ? 'SELFPRINT คือแพลตฟอร์มวิทยาศาสตร์พฤติกรรมที่สร้าง AI Twin เฉพาะบุคคล โดยอ้างอิงจาก 12 มิติพฤติกรรม ไม่ใช่ดวงชะตา'
          : 'SELFPRINT is a behavioral-science platform that builds a personalized AI Twin from 12 behavioral dimensions — not astrology'}
        canonicalUrl={isTh ? '/th/about' : '/en/about'}
      />
      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 80px' }}>
        <style>{`
          .about-hero { background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%); padding: 80px 24px 60px; text-align: center; border-bottom: 1px solid var(--color-border); }
          .about-hero h1 { font-size: clamp(28px,5vw,48px); font-weight: 900; letter-spacing: -0.02em; margin: 0 0 16px; }
          .about-hero p { font-size: 18px; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; line-height: 1.7; }
          .about-section { max-width: 800px; margin: 0 auto; padding: 56px 24px 0; }
          .about-section h2 { font-size: 24px; font-weight: 800; margin: 0 0 16px; color: var(--color-accent-primary); }
          .about-section p { font-size: 16px; line-height: 1.8; color: var(--color-text-secondary); margin: 0 0 16px; }
          .about-values { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 20px; margin-top: 32px; }
          .about-value-card { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 16px; padding: 24px; }
          .about-value-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 8px; }
          .about-value-card p { font-size: 14px; line-height: 1.6; color: var(--color-text-secondary); margin: 0; }
          .about-cta { text-align: center; margin-top: 60px; padding: 0 24px; }
          .about-cta-btn { display: inline-block; padding: 16px 36px; background: var(--color-accent-primary); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; transition: opacity 0.2s; }
          .about-cta-btn:hover { opacity: 0.88; }
        `}</style>

        <div className="about-hero">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧬</div>
          <h1>{isTh ? 'รู้จัก SELFPRINT' : 'Meet SELFPRINT'}</h1>
          <p>{isTh
            ? 'แพลตฟอร์มวิทยาศาสตร์พฤติกรรมที่เชื่อว่า ทุกคนสมควรเข้าใจตัวเองด้วยข้อมูล ไม่ใช่ดวงชะตา'
            : 'A behavioral-science platform built on the belief that everyone deserves to understand themselves through data — not astrology'}</p>
        </div>

        <div className="about-section">
          <h2>{isTh ? 'เราคือใคร' : 'Who we are'}</h2>
          <p>{isTh
            ? 'SELFPRINT เกิดจากคำถามง่ายๆ ว่า "ทำไมคนส่วนใหญ่ถึงไม่รู้จักตัวเองจริงๆ?" เราเชื่อว่าปัญหานี้ไม่ได้เกิดจากการขาดความฉลาด แต่เกิดจากการขาดเครื่องมือที่แม่นยำพอ'
            : 'SELFPRINT started from a simple question: "Why don\'t most people really know themselves?" We believe the problem isn\'t a lack of intelligence — it\'s a lack of accurate-enough tools.'}</p>
          <p>{isTh
            ? 'เราจึงสร้างระบบ SICE (Specialized Intelligence Capability Engines) 12 โมดูล ที่วิเคราะห์พฤติกรรมมนุษย์อย่างลึกซึ้ง และแปรผลลัพธ์ออกมาเป็น AI Twin — ฝาแฝดดิจิทัลที่รู้จักคุณดีกว่าตัวเอง'
            : 'So we built SICE — Specialized Intelligence Capability Engines — 12 modules that analyze human behavior in depth and translate the results into an AI Twin: a digital twin that knows you better than you know yourself.'}</p>
        </div>

        <div className="about-section">
          <h2>{isTh ? 'พันธกิจของเรา' : 'Our mission'}</h2>
          <p>{isTh
            ? 'ทำให้วิทยาศาสตร์พฤติกรรมระดับสากลเข้าถึงได้ง่าย เข้าใจได้จริง และมีประโยชน์ต่อการตัดสินใจในชีวิตประจำวัน สำหรับทุกคน ไม่ใช่แค่นักจิตวิทยา'
            : 'To make world-class behavioral science accessible, genuinely understandable, and useful for everyday decisions — for everyone, not just psychologists.'}</p>
        </div>

        <div className="about-section">
          <h2>{isTh ? 'ค่านิยมของเรา' : 'Our values'}</h2>
          <div className="about-values">
            {VALUES.map((v) => (
              <div key={v.title} className="about-value-card">
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about-cta">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px', fontSize: '16px' }}>
            {isTh ? 'พร้อมพบกับฝาแฝดดิจิทัลของคุณแล้วหรือยัง?' : 'Ready to meet your digital twin?'}
          </p>
          <button className="about-cta-btn" onClick={() => navigate('/onboarding')}>
            {isTh ? 'ให้กำเนิด AI Twin ของฉัน →' : 'Create my AI Twin →'}
          </button>
        </div>
      </main>
    </>
  );
}
