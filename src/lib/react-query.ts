/**
 * Shared React Query client singleton.
 * 
 * Defined here so both main.tsx (provider) and non-React code
 * (e.g., DecisionService.recordOutcome cache invalidation) share
 * the same QueryClient instance.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,   // 30s — avoid refetch on every focus
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
