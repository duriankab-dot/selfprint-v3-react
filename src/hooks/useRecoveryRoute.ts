import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLifecycleStore } from '@/store/lifecycleStore';

/**
 * After user authenticates, redirect to appropriate page based on lifecycle
 *
 * LIFECYCLE STATES → ROUTES:
 * - ONBOARDING → /onboarding
 * - ANALYSIS → /analysis
 * - AWAKENING → /core-awakening
 * - TWIN_ALIVE → /dashboard
 * - WORLD_ACTIVE → /worlds
 */
export function useRecoveryRoute() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const status = useLifecycleStore((state) => state.status);
  const isLoading = useLifecycleStore((state) => state.isLoading);
  const recoveredForUserId = useRef<string | null>(null);

  useEffect(() => {
    // Wait for auth and lifecycle to load
    if (authLoading || isLoading) return;
    if (!session?.user?.id) {
      recoveredForUserId.current = null; // logged out — re-arm for next login
      return;
    }

    // LOOP-002 FIX: this used to re-run on every `status` change, not just
    // once after login. This component is mounted once for the whole app
    // (never unmounts between routes), so once ROUTELOOP-001 was fixed and
    // navigate() actually worked, every legitimate in-session status
    // transition (finishing onboarding -> ANALYSIS, Twin birth ->
    // TWIN_ALIVE, etc.) ALSO re-fired this "send the user to their resume
    // point" redirect — fighting with whatever navigate() the current
    // page's own step logic had just called, and producing a visible
    // back-and-forth loop between pages (e.g. onboarding <-> analysis).
    // This hook's job is to send a RETURNING user to their resume point
    // once, right after login — not to keep overriding navigation for the
    // rest of the session as status advances normally.
    if (recoveredForUserId.current === session.user.id) return;
    recoveredForUserId.current = session.user.id;

    // Route based on lifecycle status
    const routeMap: Record<string, string> = {
      ONBOARDING: '/onboarding',
      ANALYSIS: '/analysis',
      AWAKENING: '/core-awakening',
      TWIN_ALIVE: '/dashboard',
      WORLD_ACTIVE: '/worlds',
    };

    const targetRoute = routeMap[status] || '/dashboard';
    const currentPath = window.location.pathname;

    // ROUTELOOP-001 FIX: every real route in App.tsx is registered under a
    // /en or /th language prefix — there is no bare "/dashboard" route.
    // navigate('/dashboard') with no prefix hit the catch-all
    // (<Route path="*" element={<Navigate to="/en/" replace />} />), which
    // sent the user to /en/ -> HomeRoute saw an active session and
    // redirected straight back to /dashboard -> catch-all again, forever.
    // This is what Chrome's "Throttling navigation to prevent the browser
    // from hanging" warning was catching, and why the page rendered blank.
    const langPrefix = currentPath.startsWith('/th') ? '/th' : '/en';
    const prefixedTarget = `${langPrefix}${targetRoute}`;

    // Only navigate if not already on target page
    if (!currentPath.includes(targetRoute)) {
      navigate(prefixedTarget, { replace: true });
    }
  }, [session, authLoading, status, isLoading, navigate]);
}
