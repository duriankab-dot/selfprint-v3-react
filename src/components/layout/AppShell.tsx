/**
 * AppShell.tsx
 *
 * SELFPRINT = MOBILE-FIRST PWA APP ARCHITECTURE
 * NOT a responsive website.
 *
 * Primary design target: 320–430px viewport on mobile devices.
 * Tablet/desktop = progressive enhancements layered ON TOP of the mobile base.
 *
 * AppShell owns ALL layout concerns:
 *   1. Viewport height (100dvh — dynamic viewport, handles mobile browser chrome)
 *   2. Safe area insets (env(safe-area-inset-*), notches, home indicators)
 *   3. Header region (optional NavBar for public/SEO pages)
 *   4. Main content region (scrollable, properly padded)
 *   5. Bottom navigation (mobile/tablet ≤1023px)
 *   6. Desktop nav rail (desktop ≥1024px)
 *   7. Scroll behavior (no horizontal overflow, natural vertical scroll)
 *   8. Page transitions (smooth slide-fade on mobile)
 *
 * Pages MUST wrap their content in <AppShell>.
 * Pages MUST NOT independently import BottomNav, NavRail, or modify body styles.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { NavRail } from './NavRail';
import './AppShell.css';

interface AppShellProps {
  /** Page content to render inside the shell */
  children: React.ReactNode;
  /** Show NavBar header at top (for SEO/public pages like LandingPage) */
  showHeader?: boolean;
  /** Custom header component (replaces default NavBar when showHeader=true) */
  header?: React.ReactNode;
  /** Hide bottom nav entirely (for full-screen flows like Onboarding) */
  hideNav?: boolean;
  /** Force nav visibility regardless of breakpoint (use sparingly) */
  forceShowNav?: boolean;
}

export function AppShell({
  children,
  showHeader = false,
  header,
  hideNav = false,
  forceShowNav = false,
}: AppShellProps) {
  const location = useLocation();
  const [isStandalone, setIsStandalone] = useState(false);

  // Detect standalone/PWA mode (C-07)
  useEffect(() => {
    const checkStandalone = () => {
      setIsStandalone(
        (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator as any).standalone === true
      );
    };
    checkStandalone();
    const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
    const handler = () => checkStandalone();
    mediaQuery?.addEventListener?.('change', handler);
    return () => mediaQuery?.removeEventListener?.('change', handler);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`sp-appshell${isStandalone ? ' sp-appshell--standalone' : ''}`}>
      {/* Desktop nav rail — ≥1024px only */}
      {!hideNav && <NavRail />}

      {/* Optional header region */}
      {showHeader && (
        <div className="sp-appshell-header">
          {header || null}
        </div>
      )}

      {/* Main scrollable content region */}
      <div className="sp-appshell-main" data-hide-nav={hideNav}>
        {children}
      </div>

      {/* Bottom navigation — ≤1023px mobile/tablet */}
      {!hideNav && (
        <div className="sp-appshell-footer" data-force-show={forceShowNav}>
          <BottomNav />
        </div>
      )}
    </div>
  );
}

export default AppShell;
