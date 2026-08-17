import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook to access auth state and methods
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { session, loading, signOut } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!session) return <div>Not authenticated</div>;
 *
 *   return <div>Welcome {session.user.email}</div>;
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
