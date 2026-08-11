/**
 * BottomNav.tsx
 *
 * แถบเมนูด้านล่าง 5 แท็บ ตาม Master Directive §5.1
 *
 * วันนี้ | สำรวจ | กิจกรรม | AI ฝาแฝด | ฉัน
 *
 * แสดงเฉพาะจอ <= 760px (mobile) — desktop ใช้ NavBar ด้านบน
 */

import { Link, useLocation } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
  icon: string;
  /** exact match สำหรับ root path */
  exact?: boolean;
}

const TABS: Tab[] = [
  { to: '/dashboard', label: 'วันนี้', icon: '☀️' },
  { to: '/explore', label: 'สำรวจ', icon: '🧭' },
  { to: '/activities', label: 'กิจกรรม', icon: '✨' },
  { to: '/chat', label: 'AI ฝาแฝด', icon: '💬' },
  { to: '/me', label: 'ฉัน', icon: '👤' },
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
              <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.icon}</span>
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
