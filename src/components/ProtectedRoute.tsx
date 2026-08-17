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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
