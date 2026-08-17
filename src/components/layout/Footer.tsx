/**
 * Footer.tsx
 *
 * เมนูด้านล่างที่ใช้ร่วมกันทุกหน้า (ยกเว้น Onboarding เหตุผลเดียวกับ NavBar)
 */

import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { to: '/', label: 'หน้าแรก' },
  { to: '/dashboard', label: 'แดชบอร์ด' },
  { to: '/chat', label: 'แชท' },
  { to: '/menu', label: 'เมนูฟีเจอร์' },
  { to: '/onboarding', label: 'เริ่มต้นใช้งาน' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        position: 'relative',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
        padding: '56px 32px 28px',
        marginTop: 'auto',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .sp-footer-link { position: relative; transition: color 0.2s; }
        .sp-footer-link:hover { color: var(--color-accent-primary) !important; }
        @media (max-width: 640px) {
          .sp-footer-inner { flex-direction: column; gap: 28px !important; }
        }
      `}</style>

      {/* subtle accent glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '360px',
          height: '160px',
          background: 'var(--color-accent-primary)',
          opacity: 0.06,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="sp-footer-inner"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '32px',
          marginBottom: '36px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '340px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              fontWeight: 800,
              fontSize: '19px',
              letterSpacing: '-0.01em',
              color: 'var(--color-text-primary)',
              marginBottom: '10px',
            }}
          >
            <img
              src="/favicon.svg"
              alt="SelfPrint"
              width={28}
              height={28}
              style={{ display: 'block' }}
            />
            SelfPrint
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.7 }}>
            AI Twin ที่เข้าใจรูปแบบการตัดสินใจของคุณ ช่วยให้คุณรู้จักตัวเองได้ลึกขึ้นในทุกวัน
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            ลิงก์ด่วน
          </span>
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="sp-footer-link"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          paddingTop: '22px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '12.5px',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <span>© {year} SelfPrint สงวนลิขสิทธิ์</span>
        <span style={{ opacity: 0.7 }}>สร้างด้วย AI Twin Engine</span>
      </div>
    </footer>
  );
}

export default Footer;
