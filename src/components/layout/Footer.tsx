/**
 * Footer.tsx — SELFPRINT
 * 4-column layout: เกี่ยวกับเรา | แหล่งความรู้ | ความปลอดภัย | ติดตามเรา
 * SEO: ให้ Search Engine Bot วิ่งเก็บข้อมูล + E-E-A-T signal
 */

import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

interface FooterLinkGroup {
  heading: string;
  links: { label: string; to: string; external?: boolean }[];
}

export function Footer() {
  const year = new Date().getFullYear();
  const { language } = useLanguage();
  const p = (to: string) => (to === '/' ? '/' : `/${language}${to}`);

  const GROUPS: FooterLinkGroup[] = [
    {
      heading: 'เกี่ยวกับเรา',
      links: [
        { label: 'About SELFPRINT', to: '/about' },
        { label: 'วิทยาศาสตร์ & วิธีการ', to: '/science' },
        { label: 'Pricing & Plans', to: '/pricing' },
        { label: 'ติดต่อเรา', to: '/contact' },
      ],
    },
    {
      heading: 'แหล่งความรู้',
      links: [
        { label: 'คลังบทความ (Blog)', to: '/blog' },
        { label: 'คำถามที่พบบ่อย (FAQ)', to: '/faq' },
        { label: 'AI คืออะไร? vs ดูดวง', to: '/vs-astrology' },
        { label: '12 Hub Worlds', to: '/worlds' },
      ],
    },
    {
      heading: 'ความปลอดภัย',
      links: [
        { label: 'Privacy Center', to: '/privacy' },
        { label: 'นโยบายความเป็นส่วนตัว', to: '/privacy' },
        { label: 'ข้อตกลงการใช้งาน', to: '/terms' },
      ],
    },
    {
      heading: 'ติดตามเรา',
      links: [
        { label: 'Facebook', to: 'https://facebook.com/selfprintone', external: true },
        { label: 'Line Official @selfprint', to: 'https://lin.ee/selfprint', external: true },
        { label: 'Email Support', to: 'mailto:support@selfprint.one', external: true },
      ],
    },
  ];

  return (
    <footer style={{ position: 'relative', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', padding: '56px 24px 28px', marginTop: 'auto', overflow: 'hidden' }}>
      <style>{`
        .sp-footer-link { transition: color 0.2s; }
        .sp-footer-link:hover { color: var(--color-accent-primary) !important; }
        .sp-footer-grid { display: grid; grid-template-columns: 1.6fr repeat(3,1fr); gap: 32px; max-width: 1100px; margin: 0 auto 40px; }
        @media (max-width: 860px) { .sp-footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .sp-footer-grid { grid-template-columns: 1fr; } }
        .sp-footer-col-heading { font-size: 11.5px; font-weight: 700; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px; }
        .sp-footer-col a, .sp-footer-col span { display: block; font-size: 13.5px; font-weight: 500; color: var(--color-text-secondary); text-decoration: none; margin-bottom: 10px; }
      `}</style>

      {/* subtle glow */}
      <div aria-hidden style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '360px', height: '160px', background: 'var(--color-accent-primary)', opacity: 0.05, filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="sp-footer-grid">
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 800, fontSize: '19px', letterSpacing: '-0.01em', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            <img src="/favicon.svg" alt="SELFPRINT" width={26} height={26} />
            SELFPRINT
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.75, maxWidth: '240px' }}>
            แพลตฟอร์ม AI วิเคราะห์พฤติกรรม 12 มิติ สร้าง AI Twin เฉพาะบุคคล ไม่ใช่ดวงชะตา
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.6 }}>
            🔬 อ้างอิงจาก Behavioral Science<br />
            🔒 ข้อมูลเข้ารหัส RLS<br />
            ⚡ ฟรี ไม่ต้องผูกบัตร
          </p>
        </div>

        {/* Link groups */}
        {GROUPS.map((group) => (
          <div key={group.heading} className="sp-footer-col">
            <div className="sp-footer-col-heading">{group.heading}</div>
            {group.links.map((link) =>
              link.external ? (
                <a key={link.label} href={link.to} target="_blank" rel="noreferrer" className="sp-footer-link">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={p(link.to)} className="sp-footer-link">
                  {link.label}
                </Link>
              )
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
        <span>© {year} SELFPRINT · สงวนลิขสิทธิ์ · ขับเคลื่อนด้วย AI Behavioral Science</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to={p('/privacy')} className="sp-footer-link" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', textDecoration: 'none' }}>Privacy</Link>
          <Link to={p('/terms')} className="sp-footer-link" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', textDecoration: 'none' }}>Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
