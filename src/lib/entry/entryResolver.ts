/**
 * entryResolver.ts
 * Pure (no React, no side-effects) entry-path classifier + route resolver.
 *
 * Entry paths:
 *  - pwa           → opened from homescreen (standalone display mode)
 *  - returning_user → lifecycle already past ONBOARDING
 *  - quick_analysis → ?mode=quick in URL (external link / marketing shortcut)
 *  - full_journey   → default new-user path
 *
 * Smart Entry Strategy:
 *  1. Classify entry path (entry context: PWA, URL params, lifecycle status)
 *  2. Resolve initial route (entry path or lifecycle status → route)
 *  3. Enable resuming users, handling PWA, and marketing shortcuts in one place
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
 * Map entry path → direct route (no lifecycle dependency).
 * Returns null for paths that need lifecycle status to resolve.
 */
export const ENTRY_PATH_ROUTES: Record<EntryPath, string | null> = {
  pwa: null,            // resolve via lifecycle status
  returning_user: null, // resolve via lifecycle status
  quick_analysis: '/analysis',
  full_journey: '/onboarding',
};

/**
 * Map lifecycle status → initial route.
 * Used for PWA (continuing session) and returning users (resuming journey).
 *
 * Each status has a "resume point":
 *  - ONBOARDING  → back to onboarding (should not happen with returning_user)
 *  - ANALYSIS    → back to analysis (user was analyzing)
 *  - AWAKENING   → to twin intro (Twin is being initialized)
 *  - TWIN_ALIVE  → to main Twin interface (Twin ready, first interaction)
 *  - WORLD_ACTIVE → to world hub (Multiple worlds unlocked, choose world)
 */
export const LIFECYCLE_ROUTE_MAP: Record<LifecycleStatus, string> = {
  ONBOARDING: '/onboarding',
  ANALYSIS: '/analysis',
  AWAKENING: '/twin-awakening',
  TWIN_ALIVE: '/twin',
  WORLD_ACTIVE: '/worlds',
};

/**
 * Resolve the final initial route based on entry path + lifecycle status.
 *
 * Smart routing logic:
 *  - quick_analysis → always go to quick analysis flow
 *  - full_journey → always go to onboarding
 *  - returning_user (PWA or resume) → use lifecycle status to resume progress
 *  - unknown entry → fallback to lifecycle status (safe default)
 *
 * @param entryPath - classified entry path
 * @param lifecycleStatus - user's current lifecycle position
 * @returns initial route (relative, e.g. '/onboarding', '/twin', no lang prefix)
 */
export function resolveEntryRoute(entryPath: EntryPath, lifecycleStatus: LifecycleStatus): string {
  // Direct routes (independent of lifecycle)
  const directRoute = ENTRY_PATH_ROUTES[entryPath];
  if (directRoute !== null) {
    return directRoute;
  }

  // Lifecycle-dependent routes (pwa, returning_user)
  const lifecycleRoute = LIFECYCLE_ROUTE_MAP[lifecycleStatus];
  if (lifecycleRoute) {
    return lifecycleRoute;
  }

  // Fallback (should not reach here if LifecycleStatus enum is complete)
  console.warn(
    `[entryResolver] Unknown lifecycle status: ${lifecycleStatus}, falling back to /onboarding`
  );
  return '/onboarding';
}

/**
 * Smart Entry: Complete entry-path classification + route resolution.
 *
 * Usage:
 *  const entryPath = classifyEntryPath(ctx);
 *  const route = resolveEntryRoute(entryPath, ctx.lifecycleStatus);
 *  // Navigate to route with language prefix: `/${lang}${route}`
 *
 * Or as a one-liner:
 *  const route = resolveEntryRoute(
 *    classifyEntryPath(ctx),
 *    ctx.lifecycleStatus
 *  );
 */
export function smartEntry(ctx: EntryContext): string {
  const entryPath = classifyEntryPath(ctx);
  return resolveEntryRoute(entryPath, ctx.lifecycleStatus);
}
