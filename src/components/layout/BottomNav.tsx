/**
 * BottomNav.tsx
 *
 * แถบเมนูด้านล่าง 5 แท็บ ตาม Master Directive §5.1
 *
 * วันนี้ | กิจกรรม | AI ฝาแฝด | สำรวจ | ฉันเอง
 *
 * แสดงเฉพาะจอ <= 760px (mobile) — desktop ใช้ NavBar ด้านบน
 * ใช้ inline SVG icons แทน emoji — ดูเป็น tech/app ไม่ใช่ fortune-telling
 */

import { Link, useLocation } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
  icon: React.ReactNode;
  /** exact match สำหรับ root path */
  exact?: boolean;
}

// --- Inline SVG Icons (tech-style, 22×22) ---

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const IconActivity = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const IconCompass = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

const IconCpu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/>
    <line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/>
    <line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/>
    <line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/>
    <line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);

const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

// ---

const TABS: Tab[] = [
  { to: '/dashboard', label: 'วันนี้',    icon: <IconHome /> },
  { to: '/activities', label: 'กิจกรรม', icon: <IconActivity /> },
  { to: '/explore',    label: 'สำรวจ',    icon: <IconCompass /> },
  { to: '/chat',       label: 'AI ฝาแฝด', icon: <IconCpu /> },
  { to: '/me',         label: 'ฉัน',      icon: <IconUser /> },
];

export function BottomNav() {
  const { pathname } = useLocation();

  const isActive = (tab: Tab) =>
    tab.exact
      ? pathname === tab.to
      : pathname === tab.to || pathname.startsWith(tab.to + '/');

  return (
    <>
      <style>{`
        .sp-bottomnav { display: none; }
        @media (max-width: 760px) {
          .sp-bottomnav { display: flex !important; }
          body { padding-bottom: 68px; }
        }
        .sp-bn-tab:active { transform: scale(0.91); }
      `}</style>

      <nav
        className="sp-bottomnav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 250,
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '6px 4px calc(6px + env(safe-area-inset-bottom))',
          backgroundColor: 'var(--color-bg-primary)',
          background: 'color-mix(in srgb, var(--color-bg-primary) 94%, transparent)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {TABS.map(tab => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="sp-bn-tab"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                flex: 1,
                padding: '6px 2px 4px',
                borderRadius: 12,
                textDecoration: 'none',
                color: active ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                transition: 'transform 0.1s, color 0.15s',
                position: 'relative',
              }}
            >
              <span style={{ lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                lineHeight: 1.2,
                textAlign: 'center',
              }}>
                {tab.label}
              </span>
              {active && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--color-accent-primary)',
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default BottomNav;
