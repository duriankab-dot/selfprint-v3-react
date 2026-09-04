/**
 * BottomNav.tsx
 *
 * แถบเมนูด้านล่าง 5 แท็บ — App Shell redesign (APPSHELL-001)
 *
 * วันนี้ | โลก (Worlds) | AI ฝาแฝด | สำรวจ (รวมกิจกรรมเดิม) | ฉันเอง
 *
 * แสดงเฉพาะจอ <= 760px (mobile) — desktop ใช้ NavBar ด้านบน
 * ใช้ inline SVG icons แทน emoji — ดูเป็น tech/app ไม่ใช่ fortune-telling
 */

import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

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

const IconWorlds = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
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

// BOTTOMNAV-001 FIX: "AI ฝาแฝด" tab used to point at /chat, which
// LangRedirect sends to /chat/nova (NovaChat.tsx = the pre-Twin guide,
// gated on isNovaActive). For any user whose Twin already exists (the
// common case once this tab is visible in normal use), isNovaActive is
// false and NovaChat just shows a dead-end "Your Twin has awakened..."
// stub with no way forward — the tab is literally named "AI Twin" but
// opened the wrong assistant. Point it straight at /chat/twin
// (TwinChat.tsx), which has its own correct guard for the rare case a
// Twin doesn't exist yet ("Complete Core Awakening first").
//
// APPSHELL-001 FIX: per the app-shell redesign, the 5 destinations are now
// วันนี้ | Worlds | AI ฝาแฝด | สำรวจ | ฉัน — "กิจกรรม" was its own tab with a
// catalog that overlapped ExplorePage.tsx; that catalog is now a section of
// Explore (see ExplorePage.tsx / ActivitiesPage.tsx), freeing this slot for
// Worlds, which previously had no top-level nav entry at all despite being
// a full first-class destination (WorldsHub.tsx + WorldDetail.tsx).
function getTabs(isTh: boolean): Tab[] {
  return [
    { to: '/dashboard', label: isTh ? 'วันนี้' : 'Today',    icon: <IconHome /> },
    { to: '/worlds',    label: isTh ? 'โลก' : 'Worlds',      icon: <IconWorlds /> },
    { to: '/chat/twin', label: isTh ? 'AI ฝาแฝด' : 'AI Twin', icon: <IconCpu /> },
    { to: '/explore',   label: isTh ? 'สำรวจ' : 'Explore',   icon: <IconCompass /> },
    { to: '/me',        label: isTh ? 'ฉัน' : 'Me',          icon: <IconUser /> },
  ];
}

export function BottomNav() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const TABS = getTabs(language === 'th');

  // ROUTELOOP-002 FIX: every real route lives under /en or /th (see
  // App.tsx) — these tabs used bare paths, which hit the app's catch-all
  // route and bounced every tap to /en/ -> dashboard, making all 5 tabs
  // behave identically instead of going to their own destination.
  const langPrefix = pathname.startsWith('/th') ? '/th' : '/en';
  const prefixedTo = (to: string) => `${langPrefix}${to}`;

  const isActive = (tab: Tab) => {
    const to = prefixedTo(tab.to);
    return tab.exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');
  };

  return (
    <>
      <style>{`
        .sp-bottomnav { display: none; }
        /* NAVGAP-001 FIX (4 ก.ย. 2026): BottomNav ตัดที่ 760px แต่ NavRail
           เริ่มที่ 1024px → ช่วง 761–1023 px (แท็บเล็ตแนวตั้ง iPad 768,
           iPad Air 820, Surface 912) **ไม่มี navigation เลยสักตัว**
           ผู้ใช้ในช่วงนั้นไปไหนไม่ได้นอกจากกด back ของเบราว์เซอร์
           ขยายขอบบนของ BottomNav ให้ชนกับขอบล่างของ NavRail พอดี */
        @media (max-width: 1023px) {
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
              to={prefixedTo(tab.to)}
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
