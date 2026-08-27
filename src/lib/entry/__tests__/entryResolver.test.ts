/**
 * @vitest-environment jsdom
 * entryResolver.test.ts
 * Unit tests for Smart Entry: classification + route resolution
 *
 * Coverage:
 *  - classifyEntryPath: PWA, returning_user, quick_analysis, full_journey
 *  - resolveEntryRoute: all entry path × lifecycle combinations
 *  - smartEntry: one-liner integration
 *  - Edge cases: unknown status, fallback behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  classifyEntryPath,
  resolveEntryRoute,
  smartEntry,
  detectPwa,
  ENTRY_PATH_ROUTES,
  LIFECYCLE_ROUTE_MAP,
  type EntryPath,
  type EntryContext,
} from '../entryResolver';
import type { LifecycleStatus } from '@/store/lifecycleStore';

describe('entryResolver', () => {
  beforeEach(() => {
    // Setup matchMedia mock for all tests
    if (!window.matchMedia) {
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
    }
  });

  describe('detectPwa', () => {
    it('should detect PWA via navigator.standalone (iOS)', () => {
      // Mock navigator.standalone
      Object.defineProperty(window.navigator, 'standalone', {
        value: true,
        configurable: true,
      });

      expect(detectPwa()).toBe(true);
    });

    it('should detect PWA via matchMedia (Android/desktop)', () => {
      // Mock matchMedia
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
        media: '(display-mode: standalone)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as any);

      expect(detectPwa()).toBe(true);
    });

    it('should return false if not PWA', () => {
      Object.defineProperty(window.navigator, 'standalone', {
        value: false,
        configurable: true,
      });
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: false,
      } as any);

      expect(detectPwa()).toBe(false);
    });
  });

  describe('classifyEntryPath', () => {
    it('should classify as pwa if isPwa=true', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'ONBOARDING',
        search: '',
        isPwa: true,
      };
      expect(classifyEntryPath(ctx)).toBe('pwa');
    });

    it('should classify as returning_user if lifecycle !== ONBOARDING', () => {
      const statuses: LifecycleStatus[] = ['ANALYSIS', 'AWAKENING', 'TWIN_ALIVE', 'WORLD_ACTIVE'];

      statuses.forEach((status) => {
        const ctx: EntryContext = {
          lifecycleStatus: status,
          search: '',
          isPwa: false,
        };
        expect(classifyEntryPath(ctx)).toBe('returning_user');
      });
    });

    it('should classify as quick_analysis if ?mode=quick', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'ONBOARDING',
        search: '?mode=quick',
        isPwa: false,
      };
      expect(classifyEntryPath(ctx)).toBe('quick_analysis');
    });

    it('should classify as quick_analysis with extra params', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'ONBOARDING',
        search: '?ref=email&mode=quick&utm=test',
        isPwa: false,
      };
      expect(classifyEntryPath(ctx)).toBe('quick_analysis');
    });

    it('should classify as full_journey (default)', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'ONBOARDING',
        search: '',
        isPwa: false,
      };
      expect(classifyEntryPath(ctx)).toBe('full_journey');
    });

    it('should prioritize PWA over other signals', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'ONBOARDING',
        search: '?mode=quick',
        isPwa: true,
      };
      expect(classifyEntryPath(ctx)).toBe('pwa'); // PWA takes precedence
    });

    it('should prioritize returning_user over quick_analysis', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'TWIN_ALIVE',
        search: '?mode=quick',
        isPwa: false,
      };
      expect(classifyEntryPath(ctx)).toBe('returning_user'); // Status takes precedence
    });
  });

  describe('resolveEntryRoute', () => {
    describe('direct routes', () => {
      it('should resolve quick_analysis → /analysis', () => {
        expect(resolveEntryRoute('quick_analysis', 'ONBOARDING')).toBe('/analysis');
      });

      it('should resolve full_journey → /onboarding', () => {
        expect(resolveEntryRoute('full_journey', 'ANALYSIS')).toBe('/onboarding');
      });
    });

    describe('lifecycle-dependent routes', () => {
      it.each<[LifecycleStatus, string]>([
        ['ONBOARDING', '/onboarding'],
        ['ANALYSIS', '/analysis'],
        ['AWAKENING', '/twin-awakening'],
        ['TWIN_ALIVE', '/twin'],
        ['WORLD_ACTIVE', '/worlds'],
      ])('should resolve %s → %s', (status, expected) => {
        expect(resolveEntryRoute('returning_user', status)).toBe(expected);
        expect(resolveEntryRoute('pwa', status)).toBe(expected);
      });
    });

    describe('edge cases', () => {
      it('should handle unknown lifecycle status gracefully', () => {
        // Type assertion to bypass TypeScript—testing runtime safety
        const result = resolveEntryRoute('pwa', 'UNKNOWN' as LifecycleStatus);
        expect(result).toBe('/onboarding'); // Should fallback
      });

      it('should match LIFECYCLE_ROUTE_MAP for all statuses', () => {
        const statuses: LifecycleStatus[] = ['ONBOARDING', 'ANALYSIS', 'AWAKENING', 'TWIN_ALIVE', 'WORLD_ACTIVE'];

        statuses.forEach((status) => {
          const expected = LIFECYCLE_ROUTE_MAP[status];
          expect(resolveEntryRoute('returning_user', status)).toBe(expected);
          expect(resolveEntryRoute('pwa', status)).toBe(expected);
        });
      });

      it('should match ENTRY_PATH_ROUTES for direct routes', () => {
        const entryPaths: EntryPath[] = ['quick_analysis', 'full_journey'];

        entryPaths.forEach((path) => {
          const expected = ENTRY_PATH_ROUTES[path];
          if (expected !== null) {
            expect(resolveEntryRoute(path, 'ONBOARDING')).toBe(expected);
          }
        });
      });
    });
  });

  describe('smartEntry', () => {
    it('should resolve entry path + route in one call', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'ONBOARDING',
        search: '?mode=quick',
        isPwa: false,
      };
      // classifyEntryPath('quick_analysis') → resolveEntryRoute('quick_analysis', 'ONBOARDING')
      expect(smartEntry(ctx)).toBe('/analysis');
    });

    it('should handle returning PWA user', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'TWIN_ALIVE',
        search: '',
        isPwa: true,
      };
      // classifyEntryPath('pwa') → resolveEntryRoute('pwa', 'TWIN_ALIVE')
      expect(smartEntry(ctx)).toBe('/twin');
    });

    it('should handle new full-journey user', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'ONBOARDING',
        search: '',
        isPwa: false,
      };
      // classifyEntryPath('full_journey') → resolveEntryRoute('full_journey', 'ONBOARDING')
      expect(smartEntry(ctx)).toBe('/onboarding');
    });

    it('should handle returning user (non-PWA)', () => {
      const ctx: EntryContext = {
        lifecycleStatus: 'ANALYSIS',
        search: '',
        isPwa: false,
      };
      // classifyEntryPath('returning_user') → resolveEntryRoute('returning_user', 'ANALYSIS')
      expect(smartEntry(ctx)).toBe('/analysis');
    });
  });

  describe('invariants', () => {
    it('should not have conflicts between ENTRY_PATH_ROUTES and LIFECYCLE_ROUTE_MAP', () => {
      // quick_analysis and full_journey have fixed routes
      expect(ENTRY_PATH_ROUTES['quick_analysis']).not.toBeNull();
      expect(ENTRY_PATH_ROUTES['full_journey']).not.toBeNull();

      // pwa and returning_user should resolve via lifecycle
      expect(ENTRY_PATH_ROUTES['pwa']).toBeNull();
      expect(ENTRY_PATH_ROUTES['returning_user']).toBeNull();
    });

    it('should have all lifecycle statuses in LIFECYCLE_ROUTE_MAP', () => {
      const statuses: LifecycleStatus[] = ['ONBOARDING', 'ANALYSIS', 'AWAKENING', 'TWIN_ALIVE', 'WORLD_ACTIVE'];

      statuses.forEach((status) => {
        expect(LIFECYCLE_ROUTE_MAP[status]).toBeDefined();
        expect(LIFECYCLE_ROUTE_MAP[status]).toMatch(/^\//); // starts with /
      });
    });
  });
});
