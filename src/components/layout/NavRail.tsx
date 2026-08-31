/**
 * NavRail.tsx
 *
 * APPSHELL-005 FIX: desktop navigation for the app-shell redesign.
 *
 * Per the redesign brief: "ผม ไม่อยากเอา bottom nav ไปขยายเป็น desktop
 * website" — desktop should not get BottomNav's 5 tabs stretched into a
 * wide bar. Instead it gets a left sidebar nav rail, same 5 destinations
 * (วันนี้ | Worlds | AI ฝาแฝด | สำรวจ | ฉัน), Android-nav-rail style:
 * icon + label, vertical stack, fixed to the left edge.
 *
 * Shown only at desktop widths (>=1024px) — BottomNav still owns mobile/
 * tablet. The two never show at the same time. NavRail pushes page content
 * right via `body { padding-left }`, the same scoped-<style> + body-padding
 * pattern BottomNav already uses for its own breakpoint.
 */

import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface RailTab {
  to: string;
  label: string;
  icon: React.ReactNode;
}

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

function getRailTabs(isTh: boolean): RailTab[] {
  return [
    { to: '/dashboard', label: isTh ? 'วันนี้' : 'Today',    icon: <IconHome /> },
    { to: '/worlds',    label: isTh ? 'โลก' : 'Worlds',      icon: <IconWorlds /> },
    { to: '/chat/twin', label: isTh ? 'AI ฝาแฝด' : 'AI Twin', icon: <IconCpu /> },
    { to: '/explore',   label: isTh ? 'สำรวจ' : 'Explore',   icon: <IconCompass /> },
    { to: '/me',        label: isTh ? 'ฉัน' : 'Me',          icon: <IconUser /> },
  ];
}

export function NavRail() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const TABS = getRailTabs(language === 'th');

  const langPrefix = pathname.startsWith('/th') ? '/th' : '/en';
  const prefixedTo = (to: string) => `${langPrefix}${to}`;

  const isActive = (tab: RailTab) => {
    const to = prefixedTo(tab.to);
    return pathname === to || pathname.startsWith(to + '/');
  };

  return (
    <>
      <style>{`
        .sp-navrail { display: none; }
        @media (min-width: 1024px) {
          .sp-navrail { display: flex !important; }
          body { padding-left: 88px; }
        }
        .sp-nr-tab:hover { background: color-mix(in srgb, var(--color-accent-primary) 8%, transparent); }
      `}</style>

      <nav
        className="sp-navrail"
        aria-label={language === 'th' ? 'เมนูหลัก' : 'Main navigation'}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '88px',
          zIndex: 250,
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '4px',
          padding: '16px 8px',
          backgroundColor: 'var(--color-bg-primary)',
          background: 'color-mix(in srgb, var(--color-bg-primary) 94%, transparent)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.to}
              to={prefixedTo(tab.to)}
              className="sp-nr-tab"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 4px',
                borderRadius: 12,
                textDecoration: 'none',
                color: active ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                background: active
                  ? 'color-mix(in srgb, var(--color-accent-primary) 12%, transparent)'
                  : 'transparent',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ lineHeight: 1 }}>{tab.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, textAlign: 'center' }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default NavRail;
