/**
 * useSessionPersistence.ts — TC-506: Auth session persistence for decision/world routes
 *
 * Handles:
 * - Supabase auth state restoration on page load
 * - Custom route state restoration (scroll, form data, filters)
 * - Automatic redirect with state recovery
 * - Cross-tab session sync
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

const ROUTE_STATE_KEY = 'sp_route_state';
const AUTH_RESTORED_KEY = 'sp_auth_restored';

interface RouteState {
  pathname: string;
  search: string;
  scrollPosition?: number;
  formData?: Record<string, any>;
  filters?: Record<string, any>;
  timestamp: number;
}

interface UseSessionPersistenceReturn {
  isRestoring: boolean;
  saveRouteState: (state: Partial<RouteState>) => void;
  getRouteState: (pathname: string) => RouteState | null;
  clearRouteState: (pathname?: string) => void;
  restoreAuth: () => Promise<boolean>;
}

export function useSessionPersistence(): UseSessionPersistenceReturn {
  const { session } = useAuth();
  const location = useLocation();
  const [isRestoring, setIsRestoring] = useState(true);
  const restorationAttempted = useRef(false);

  // Save current route state to localStorage
  const saveRouteState = useCallback((state: Partial<RouteState>) => {
    try {
      const existing = JSON.parse(localStorage.getItem(ROUTE_STATE_KEY) || '{}');
      const newState: RouteState = {
        pathname: location.pathname,
        search: location.search,
        scrollPosition: window.scrollY,
        timestamp: Date.now(),
        ...existing[location.pathname],
        ...state,
      };
      existing[location.pathname] = newState;
      localStorage.setItem(ROUTE_STATE_KEY, JSON.stringify(existing));
    } catch {
      // non-fatal
    }
  }, [location.pathname, location.search]);

  // Get saved route state
  const getRouteState = useCallback((pathname: string): RouteState | null => {
    try {
      const existing = JSON.parse(localStorage.getItem(ROUTE_STATE_KEY) || '{}');
      const state = existing[pathname];
      if (!state) return null;
      // Expire after 24 hours
      if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
        delete existing[pathname];
        localStorage.setItem(ROUTE_STATE_KEY, JSON.stringify(existing));
        return null;
      }
      return state;
    } catch {
      return null;
    }
  }, []);

  // Clear route state
  const clearRouteState = useCallback((pathname?: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem(ROUTE_STATE_KEY) || '{}');
      if (pathname) {
        delete existing[pathname];
      } else {
        // Clear all
        localStorage.removeItem(ROUTE_STATE_KEY);
      }
      localStorage.setItem(ROUTE_STATE_KEY, JSON.stringify(existing));
    } catch {
      // non-fatal
    }
  }, []);

  // Restore Supabase auth session on mount
  const restoreAuth = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    if (restorationAttempted.current) return !!session;

    restorationAttempted.current = true;
    setIsRestoring(true);

    try {
      const { data: { session: restoredSession }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (restoredSession && !session) {
        // Session restored but not in context yet - context will pick it up via onAuthStateChange
        // Mark as restored
        localStorage.setItem(AUTH_RESTORED_KEY, 'true');
        return true;
      }

      return !!session;
    } catch (err) {
      console.error('Auth restoration failed:', err);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [session, supabase]);

  // On mount: restore auth and route state for protected routes
  useEffect(() => {
    const isProtectedRoute = location.pathname.startsWith('/th/') && (
      location.pathname.includes('/worlds') ||
      location.pathname.includes('/decisions') ||
      location.pathname.includes('/twin/patterns') ||
      location.pathname.includes('/twin/settings') ||
      location.pathname.includes('/twin/personality')
    );

    if (isProtectedRoute) {
      restoreAuth().then(() => {
        // After auth restored, restore route-specific state
        const saved = getRouteState(location.pathname);
        if (saved) {
          // Restore scroll position
          const scrollPos = saved.scrollPosition ?? 0;
          setTimeout(() => window.scrollTo(0, scrollPos), 0);
        }
      });
    } else {
      setIsRestoring(false);
    }
  }, [location.pathname, restoreAuth, getRouteState]);

  // Save scroll position on scroll (throttled)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          saveRouteState({ scrollPosition: window.scrollY });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [saveRouteState]);

  // Cross-tab session sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_RESTORED_KEY && e.newValue === 'true') {
        // Another tab restored auth - reload to pick up session
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    isRestoring,
    saveRouteState,
    getRouteState,
    clearRouteState,
    restoreAuth,
  };
}

// Hook for form-specific persistence
export function useFormPersistence(formId: string) {
  const { saveRouteState, getRouteState, clearRouteState } = useSessionPersistence();
  const location = useLocation();

  const save = useCallback((data: Record<string, any>) => {
    saveRouteState({ formData: { [formId]: data } });
  }, [saveRouteState, formId]);

  const load = useCallback((): Record<string, any> | null => {
    const state = getRouteState(location.pathname);
    return state?.formData?.[formId] ?? null;
  }, [getRouteState, location.pathname]);

  const clear = useCallback(() => {
    clearRouteState(location.pathname);
  }, [clearRouteState, location.pathname]);

  return { save, load, clear };
}

export default useSessionPersistence;