/**
 * NavBar.tsx
 *
 * เมนูด้านบนที่ใช้ร่วมกันทุกหน้า (ยกเว้น Onboarding ที่ตั้งใจให้เป็น
 * flow เต็มจอไม่มีทางออกกลางคัน) เชื่อมลิงก์หลักของเว็บเข้าด้วยกัน:
 * หน้าแรก, แดชบอร์ด, แชท และปุ่มเข้าสู่ระบบ/ออกจากระบบตามสถานะ session จริง
 *
 * `rightSlot` ให้หน้าที่มีปุ่ม CTA เฉพาะทาง (เช่น LandingPage ที่มี
 * ProgressiveCTA ติด tracking อยู่แล้ว) ใส่ปุ่มของตัวเองแทนปุ่ม default ได้
 *
 * ดีไซน์: glass-morphism translucent bar ที่ปรับตาม mood theme, active-link
 * pill indicator, hover state, และเมนูมือถือแบบ hamburger สำหรับจอเล็ก
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { AudioSettingsButton } from '../AudioSettingsButton';
import { BackButton } from '../common/BackButton';

interface NavBarProps {
  rightSlot?: React.ReactNode;
  /** LandingPage ใช้ 'fixed' เพื่อคงพฤติกรรมเดิม (ลอยทับเนื้อหา hero) ส่วนหน้าอื่นใช้ 'sticky' (default) */
  position?: 'sticky' | 'fixed';
}

interface NavLink {
  path: string; // Base path without language prefix
  label: string;
  requiresAuth?: boolean;
}

function getNavLinks(language: 'en' | 'th'): NavLink[] {
  const isTh = language === 'th';
  return [
    { path: '/dashboard', label: isTh ? 'แดชบอร์ด' : 'Dashboard' },
    // BOTTOMNAV-001 FIX: '/chat' redirects to /chat/nova (the pre-Twin
    // guide) — for a user already past onboarding (who sees this nav),
    // that's the wrong assistant. Point straight at the Twin.
    { path: '/chat/twin', label: isTh ? 'แชท' : 'Chat' },
    { path: '/worlds', label: '🌍 Worlds', requiresAuth: true },
    { path: '/menu', label: isTh ? 'เมนู' : 'Menu' },
  ];
}

export function NavBar({ rightSlot, position = 'sticky' }: NavBarProps) {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * สร้าง URL พร้อม language prefix
   */
  const getLangUrl = (basePath: string) => `/${language}${basePath}`;

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
    navigate(getLangUrl('/'));
  };

  const isActive = (basePath: string) => {
    const currentPath = location.pathname;
    // ตรวจสอบ /en/path หรือ /th/path
    return currentPath === getLangUrl(basePath) || currentPath === basePath;
  };

  // Filter nav links based on auth status
  const visibleLinks = getNavLinks(language).filter(link => !link.requiresAuth || session);
  const isTh = language === 'th';

  // BACKBUTTON-002 FIX: a back button on a tab-root page is meaningless —
  // there's nothing to "come back from," the bottom nav / nav rail IS the
  // navigation there. Originally only /dashboard was excluded; extended to
  // all 5 BottomNav/NavRail root destinations (exact-path match only, so
  // sub-pages like /explore/palmistry or /me/settings still get a real
  // back button).
  // BACKBUTTON-003 FIX: the landing page ('/') was never in this list, so
  // isActive('/') was always false and showBackButton stayed true on the
  // very first page a visitor sees — verified live on selfprint.one
  // (path "/th/"), confirmed by getLangUrl('/') === '/th/' matching
  // location.pathname exactly. Added '/' so the home page is excluded too.
  const ROOT_TAB_PATHS = ['/', '/dashboard', '/worlds', '/chat/twin', '/explore', '/me'];
  const showBackButton = !ROOT_TAB_PATHS.some(isActive);

  const authAction = session ? (
    <button
      type="button"
      onClick={handleSignOut}
      className="sp-nav-signout"
      style={{
        padding: '10px 20px',
        borderRadius: '10px',
        border: '1.5px solid var(--color-border)',
        background: 'transparent',
        color: 'var(--color-text-primary)',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {isTh ? 'ออกจากระบบ' : 'Sign out'}
    </button>
  ) : (
    <Link
      to={getLangUrl('/onboarding')}
      onClick={() => setMobileOpen(false)}
      className="sp-nav-cta"
      style={{
        padding: '10px 22px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--accent-primary, var(--color-accent-primary)) 100%)',
        color: 'white',
        fontWeight: 700,
        fontSize: '14px',
        textDecoration: 'none',
        boxShadow: '0 2px 10px color-mix(in srgb, var(--color-accent-primary) 35%, transparent)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'inline-block',
      }}
    >
      {isTh ? 'เริ่มต้นใช้งาน' : 'Get Started'}
    </Link>
  );

  return (
    <>
      <style>{`
        .sp-navbar-links { display: flex; }
        .sp-navbar-hamburger { display: none; }
        .sp-nav-link:hover { background: color-mix(in srgb, var(--color-accent-primary) 10%, transparent) !important; }
        .sp-nav-signout:hover { border-color: var(--color-accent-primary) !important; background: color-mix(in srgb, var(--color-accent-primary) 8%, transparent) !important; }
        .sp-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 16px color-mix(in srgb, var(--color-accent-primary) 45%, transparent); }
        .sp-theme-toggle { background: none; border: 1px solid var(--color-border); border-radius: 8px; width: 36px; height: 36px; cursor: pointer; font-size: 17px; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s, background 0.2s; color: var(--color-text-primary); }
        .sp-theme-toggle:hover { border-color: var(--color-accent-primary); background: color-mix(in srgb, var(--color-accent-primary) 8%, transparent); }
        @media (max-width: 760px) {
          .sp-navbar-links { display: none !important; }
          .sp-navbar-hamburger { display: flex !important; }
          .sp-navbar-desktop-action { display: none !important; }
        }
      `}</style>
      <nav
        style={{
          position,
          top: 0,
          left: position === 'fixed' ? 0 : undefined,
          right: position === 'fixed' ? 0 : undefined,
          zIndex: 200,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 32px',
          // สีทึบเป็น fallback หลัก ถ้า browser รองรับ color-mix() ค่อย override เป็นแบบโปร่งใส
          // (inline style เขียนได้ค่าเดียวต่อ property เลยแยกสองบรรทัดผ่าน backgroundColor + background)
          backgroundColor: 'var(--color-bg-primary)',
          background: 'color-mix(in srgb, var(--color-bg-primary) 82%, transparent)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          {showBackButton && <BackButton fallbackTo="/dashboard" />}
          <Link
            to={getLangUrl('/')}
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '-0.01em',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
            }}
          >
            <img
              src="/favicon.svg"
              alt="SelfPrint"
              width={30}
              height={30}
              style={{ display: 'block' }}
            />
            SelfPrint
          </Link>
          <div className="sp-navbar-links" style={{ gap: '4px', alignItems: 'center' }}>
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={getLangUrl(link.path)}
                className="sp-nav-link"
                style={{
                  position: 'relative',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isActive(link.path) ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                  background: isActive(link.path)
                    ? 'color-mix(in srgb, var(--color-accent-primary) 12%, transparent)'
                    : 'transparent',
                  textDecoration: 'none',
                  transition: 'color 0.2s, background 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* NAVBUTTONS-001 FIX: theme toggle + audio button used to live only
            inside .sp-navbar-desktop-action (hidden below 760px) and the
            mobile hamburger dropdown — a user on a narrow viewport who
            never opened the hamburger had no visible way to find them at
            all. Now always visible in the top bar at every width, right
            before the hamburger; removed from the mobile dropdown below to
            avoid showing them twice. */}
        <div className="sp-navbar-always-action" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="sp-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? (isTh ? 'เปลี่ยนเป็นโหมดสว่าง' : 'Switch to light mode') : (isTh ? 'เปลี่ยนเป็นโหมดมืด' : 'Switch to dark mode')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <AudioSettingsButton />
        </div>

        <div className="sp-navbar-desktop-action" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <LanguageSwitcher />
          {rightSlot || authAction}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={isTh ? 'เปิดเมนู' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
          className="sp-navbar-hamburger"
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '5px',
            width: '38px',
            height: '38px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span style={{ display: 'block', width: '18px', height: '2px', margin: '0 auto', background: 'var(--color-text-primary)', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: '18px', height: '2px', margin: '0 auto', background: 'var(--color-text-primary)', opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <span style={{ display: 'block', width: '18px', height: '2px', margin: '0 auto', background: 'var(--color-text-primary)', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div
          style={{
            position: position === 'fixed' ? 'fixed' : 'sticky',
            top: position === 'fixed' ? '60px' : 0,
            left: 0,
            right: 0,
            zIndex: 199,
            background: 'var(--color-bg-primary)',
            borderBottom: '1px solid var(--color-border)',
            padding: '16px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          }}
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.path}
              to={getLangUrl(link.path)}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                color: isActive(link.path) ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                background: isActive(link.path)
                  ? 'color-mix(in srgb, var(--color-accent-primary) 12%, transparent)'
                  : 'transparent',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
          {/* NAVBUTTONS-001: theme + audio rows removed from here — both
              now live as always-visible icon buttons in the top bar
              (.sp-navbar-always-action) so they no longer need the
              hamburger open to be found. */}
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <LanguageSwitcher />
            {rightSlot || authAction}
          </div>
        </div>
      )}
    </>
  );
}

export default NavBar;
