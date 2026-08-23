/**
 * entryResolver.ts
 * Pure (no React, no side-effects) entry-path classifier.
 *
 * Entry paths:
 *  - pwa           → opened from homescreen (standalone display mode)
 *  - returning_user → lifecycle already past ONBOARDING
 *  - quick_analysis → ?mode=quick in URL (external link / marketing shortcut)
 *  - full_journey   → default new-user path
 *
 * §ENTRY-RESOLVER-001
 */

import type { LifecycleStatus } from '@/store/lifecycleStore';

export type EntryPath =
  | 'full_journey'
  | 'quick_analysis'
  | 'returning_user'
  | 'pwa';

export interface EntryContext {
  lifecycleStatus: LifecycleStatus;
  search: string; // window.location.search
  isPwa?: boolean; // injected for testability; auto-detected if omitted
}

/**
 * Detect if running as installed PWA (standalone display mode).
 * Works on both iOS (navigator.standalone) and Android/desktop (matchMedia).
 */
export function detectPwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Classify the current session's entry path.
 * Call this once per login, after lifecycleStatus is known.
 */
export function classifyEntryPath(ctx: EntryContext): EntryPath {
  const { lifecycleStatus, search } = ctx;
  const isPwa = ctx.isPwa ?? detectPwa();

  // PWA takes precedence — can be combined with returning user but log as pwa
  if (isPwa) return 'pwa';

  // Returning user: already has meaningful lifecycle progress
  if (lifecycleStatus !== 'ONBOARDING') return 'returning_user';

  // Quick-analysis shortcut: external link / marketing CTA with ?mode=quick
  const params = new URLSearchParams(search);
  if (params.get('mode') === 'quick') return 'quick_analysis';

  // Default: brand-new user, full guided journey
  return 'full_journey';
}

/**
 * Map entry path → initial route (relative, no lang prefix).
 * For returning_user the caller should use lifecycleStatus → routeMap instead.
 */
export const ENTRY_PATH_ROUTES: Record<EntryPath, string | null> = {
  pwa: null,           // use lifecycleStatus route (returning context)
  returning_user: null, // use lifecycleStatus route
  quick_analysis: '/analysis',
  full_journey: '/onboarding',
};
