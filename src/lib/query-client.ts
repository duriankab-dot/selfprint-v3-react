/**
 * QueryClient singleton — shared between main.tsx and non-React code.
 * 
 * Re-exports from lib/react-query.ts (the source of truth) so existing
 * imports continue to work without change.
 */
export { queryClient } from './react-query';
