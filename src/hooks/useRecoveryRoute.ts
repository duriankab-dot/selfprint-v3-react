import { useEffect } from 'react';
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

  useEffect(() => {
    // Wait for auth and lifecycle to load
    if (authLoading || isLoading) return;
    if (!session?.user?.id) return;

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

    // Only navigate if not already on target page
    if (!currentPath.includes(targetRoute)) {
      navigate(targetRoute, { replace: true });
    }
  }, [session, authLoading, status, isLoading, navigate]);
}
