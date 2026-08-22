/**
 * ProtectedRoute.tsx
 * Wrapper component to protect routes requiring authentication
 * Redirects to /login if user is not authenticated
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback = null }: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return fallback;
  }

  if (!session) {
    // ROUTELOOP-002 FIX: bare "/login" isn't a real route (every route
    // lives under /en or /th) — it hit the catch-all and landed on the
    // landing page instead of the login form.
    const langPrefix = window.location.pathname.startsWith('/th') ? '/th' : '/en';
    return <Navigate to={`${langPrefix}/login`} replace />;
  }

  return <>{children}</>;
}
