import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLifecycleStore } from '@/store/lifecycleStore';
import { classifyEntryPath, ENTRY_PATH_ROUTES } from '@/lib/entry/entryResolver';
import type { EntryPath } from '@/lib/entry/entryResolver';
import { supabase } from '@/services/supabase-service';

/**
 * useRecoveryRoute (enhanced as Entry Resolver — §ENTRY-RESOLVER-001)
 *
 * Fires ONCE per login. Classifies the session's entry_path, logs it to
 * user_lifecycle, then routes the user to the correct page.
 *
 * Entry paths:
 *  - pwa           → opened from homescreen → resume lifecycle route
 *  - returning_user → lifecycle > ONBOARDING → resume lifecycle route
 *  - quick_analysis → ?mode=quick → /analysis (skip onboarding)
 *  - full_journey   → new user → /onboarding
 *
 * LIFECYCLE STATES → ROUTES (returning_user / pwa):
 *  ONBOARDING   → /onboarding
 *  ANALYSIS     → /analysis
 *  AWAKENING    → /core-awakening
 *  TWIN_ALIVE   → /dashboard
 *  WORLD_ACTIVE → /worlds
 */

const LIFECYCLE_ROUTES: Record<string, string> = {
  ONBOARDING: '/onboarding',
  ANALYSIS: '/analysis',
  AWAKENING: '/core-awakening',
  TWIN_ALIVE: '/dashboard',
  WORLD_ACTIVE: '/worlds',
};

export function useRecoveryRoute() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const status = useLifecycleStore((state) => state.status);
  const isLoading = useLifecycleStore((state) => state.isLoading);
  const setEntryPath = useLifecycleStore((state) => state.setEntryPath);
  const recoveredForUserId = useRef<string | null>(null);

  useEffect(() => {
    // Wait for auth and lifecycle to load
    if (authLoading || isLoading) return;
    if (!session?.user?.id) {
      recoveredForUserId.current = null; // logged out — re-arm
      return;
    }

    // LOOP-002 FIX: fire once per login only, not on every status change
    if (recoveredForUserId.current === session.user.id) return;
    recoveredForUserId.current = session.user.id;

    // 1. Classify entry path
    const entryPath: EntryPath = classifyEntryPath({
      lifecycleStatus: status,
      search: window.location.search,
    });

    // 2. Persist to store + DB (non-blocking, non-critical)
    setEntryPath(session.user.id, entryPath);

    // 3. Determine target route
    let targetRoute: string;
    const fixedRoute = ENTRY_PATH_ROUTES[entryPath];
    if (fixedRoute) {
      // quick_analysis → /analysis
      targetRoute = fixedRoute;
    } else {
      // pwa / returning_user → use lifecycle status
      targetRoute = LIFECYCLE_ROUTES[status] ?? '/dashboard';
    }

    // 4. Apply lang prefix (ROUTELOOP-001 fix: bare routes hit catch-all)
    const currentPath = window.location.pathname;
    const langPrefix = currentPath.startsWith('/th') ? '/th' : '/en';
    const prefixedTarget = `${langPrefix}${targetRoute}`;

    // Only navigate if not already on target page
    if (!currentPath.includes(targetRoute)) {
      navigate(prefixedTarget, { replace: true });
    }
  }, [session, authLoading, status, isLoading, navigate, setEntryPath]);
}

/**
 * Standalone helper to write entry_path to DB without going through the store.
 * Used only as fallback if store action is unavailable.
 */
export async function persistEntryPath(
  userId: string,
  entryPath: EntryPath
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase
      .from('user_lifecycle')
      .update({ entry_path: entryPath })
      .eq('user_id', userId);
  } catch {
    // Non-critical
  }
}
