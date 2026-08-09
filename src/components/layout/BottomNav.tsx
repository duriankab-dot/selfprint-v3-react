/**
 * BottomNav.tsx
 *
 * แถบเมนูด้านล่างแบบมือถือ (mobile tab bar) — แสดงเฉพาะจอเล็ก (<=760px)
 * เสริม NavBar ด้านบนสำหรับ desktop โดยให้ทางลัดไปยังฟีเจอร์หลักที่เข้าถึง
 * บ่อยที่สุด ด้วยตำแหน่งที่นิ้วโป้งแตะถึงง่าย
 *
 * ปุ่ม "แชทกับ AI" เป็นฟีเจอร์หลักของเว็บ จึงยกให้เป็นปุ่มกลมลอยเด่น
 * ตรงกลางแถบ (FAB) แยกจากแท็บปกติซ้าย-ขวา
 */

import { Link, useLocation } from 'react-router-dom';

const SIDE_TABS_LEFT = [
  { to: '/', label: 'หน้าแรก', icon: '🏠' },
  { to: '/dashboard', label: 'แดชบอร์ด', icon: '📊' },
];

const SIDE_TABS_RIGHT = [{ to: '/menu', label: 'เมนู', icon: '⊞' }];

const CHAT_TAB = { to: '/chat', label: 'แชทกับ AI', icon: '💬' };

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const renderTab = (tab: { to: string; label: string; icon: string }) => {
    const active = isActive(tab.to);
    return (
      <Link
        key={tab.to}
        to={tab.to}
        className="sp-bn-item"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          padding: '6px 14px',
          borderRadius: '12px',
          textDecoration: 'none',
          color: active ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
          transition: 'transform 0.1s, color 0.2s',
          minWidth: '52px',
        }}
      >
        <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
        <span style={{ fontSize: '10.5px', fontWeight: active ? 700 : 500 }}>{tab.label}</span>
        {active && (
          <span
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'var(--color-accent-primary)',
              marginTop: '1px',
            }}
          />
        )}
      </Link>
    );
  };

  const chatActive = isActive(CHAT_TAB.to);

  return (
    <>
      <style>{`
        .sp-bottomnav-wrap { display: none; }
        @media (max-width: 760px) {
          .sp-bottomnav-wrap { display: block !important; }
          body { padding-bottom: 70px; }
        }
        .sp-bn-item:active { transform: scale(0.93); }
        .sp-bn-fab:active { transform: translateX(-50%) scale(0.94) !important; }
      `}</style>
      <div className="sp-bottomnav-wrap" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 250 }}>
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 10px calc(6px + env(safe-area-inset-bottom))',
            // สีทึบเป็น fallback หลัก เผื่อ browser ไม่รองรับ color-mix()
            backgroundColor: 'var(--color-bg-primary)',
            background: 'color-mix(in srgb, var(--color-bg-primary) 92%, transparent)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderTop: '1px solid var(--color-border)',
            boxShadow: '0 -2px 14px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>{SIDE_TABS_LEFT.map(renderTab)}</div>
          {/* ช่องว่างตรงกลางให้ปุ่ม FAB ลอยทับ */}
          <div style={{ width: '64px', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: '4px' }}>{SIDE_TABS_RIGHT.map(renderTab)}</div>
        </nav>

        {/* Center FAB: แชทกับ AI */}
        <Link
          to={CHAT_TAB.to}
          className="sp-bn-fab"
          aria-label={CHAT_TAB.label}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '22px',
            transform: 'translateX(-50%)',
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
            background: chatActive
              ? 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--accent-primary, var(--color-accent-primary)) 100%)'
              : 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--accent-primary, var(--color-accent-primary)) 100%)',
            boxShadow: '0 6px 18px color-mix(in srgb, var(--color-accent-primary) 45%, transparent), 0 0 0 4px var(--color-bg-primary)',
            textDecoration: 'none',
            transition: 'transform 0.12s',
          }}
        >
          <span style={{ fontSize: '22px', lineHeight: 1 }}>{CHAT_TAB.icon}</span>
        </Link>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '2px',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--color-accent-primary)',
            pointerEvents: 'none',
          }}
        >
          แชทกับ AI
        </div>
      </div>
    </>
  );
}

export default BottomNav;
