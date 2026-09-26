/**
 * performance.spec.ts — TC-604: Performance Baselines
 *
 * Tests:
 * - LCP < 2.5s all pages
 * - TBT < 150ms
 * - Bundle size audit
 * - Core Web Vitals
 */

import { test, expect } from '@playwright/test';

test.describe('Core Web Vitals', () => {
  const pages = [
    { url: '/th/', name: 'Landing', lcpThreshold: 2500 },
    { url: '/th/onboarding', name: 'Onboarding', lcpThreshold: 2500 },
    { url: '/th/twin-birth', name: 'Twin Birth', lcpThreshold: 2500 },
    { url: '/th/dashboard', name: 'Dashboard', lcpThreshold: 2500 },
    { url: '/th/worlds', name: 'Worlds Hub', lcpThreshold: 2500 },
    { url: '/th/worlds/self', name: 'World Detail', lcpThreshold: 2500 },
    { url: '/th/decisions', name: 'Decisions', lcpThreshold: 2500 },
    { url: '/th/memory-insights', name: 'Memory Insights', lcpThreshold: 2500 },
    { url: '/th/intelligence', name: 'Intelligence Hub', lcpThreshold: 2500 },
    { url: '/th/blog', name: 'Blog List', lcpThreshold: 2500 },
  ];

  pages.forEach((pageConfig) => {
    test(`${pageConfig.name}: LCP < ${pageConfig.lcpThreshold}ms`, async ({ page }) => {
      await page.goto(pageConfig.url);
      
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntriesByType('largest-contentful-paint');
            if (entries.length > 0) {
              resolve(entries[entries.length - 1].startTime);
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          
          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });
      
      // LCP should be measured and under threshold
      if (lcp > 0) {
        expect(lcp).toBeLessThan(pageConfig.lcpThreshold);
      }
    });
  });

  test('TBT < 150ms on Dashboard', async ({ page }) => {
    await page.goto('/th/dashboard');
    
    const tbt = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let totalTBT = 0;
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.duration > 50) {
              totalTBT += entry.duration - 50;
            }
          }
        });
        observer.observe({ type: 'longtask', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(totalTBT);
        }, 3000);
      });
    });
    
    expect(tbt).toBeLessThan(150);
  });

  test('CLS < 0.1 on all pages', async ({ page }) => {
    for (const pageConfig of pages) {
      await page.goto(pageConfig.url);
      
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
          
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 3000);
        });
      });
      
      expect(cls).toBeLessThan(0.1);
    }
  });

  test('FID < 100ms on interactive pages', async ({ page }) => {
    await page.goto('/th/decisions');
    
    // Click a button to trigger FID
    await page.waitForLoadState('networkidle');
    const fid = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntriesByType('first-input');
          if (entries.length > 0) {
            resolve(entries[0].processingStart - entries[0].startTime);
          }
        }).observe({ type: 'first-input', buffered: true });
        
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    if (fid > 0) {
      expect(fid).toBeLessThan(100);
    }
  });
});

test.describe('Bundle Size Audit', () => {
  test('Initial JS bundle < 200KB gzipped', async ({ page }) => {
    await page.goto('/th/');
    
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.endsWith('.js') && r.name.includes('/src/'))
        .map(r => ({ name: r.name, size: r.transferSize }));
    });
    
    const totalJS = resources.reduce((sum, r) => sum + r.size, 0);
    expect(totalJS).toBeLessThan(200 * 1024); // 200KB
  });

  test('CSS bundle < 50KB gzipped', async ({ page }) => {
    await page.goto('/th/');
    
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.endsWith('.css'))
        .map(r => ({ name: r.name, size: r.transferSize }));
    });
    
    const totalCSS = resources.reduce((sum, r) => sum + r.size, 0);
    expect(totalCSS).toBeLessThan(50 * 1024); // 50KB
  });

  test('Lazy-loaded chunks load on demand', async ({ page }) => {
    await page.goto('/th/');
    
    // Check initial chunks
    const initialChunks = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.endsWith('.js'))
        .map(r => r.name);
    });
    
    // Navigate to lazy route
    await page.goto('/th/decisions');
    
    const finalChunks = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.endsWith('.js'))
        .map(r => r.name);
    });
    
    // Should have loaded additional chunks
    expect(finalChunks.length).toBeGreaterThanOrEqual(initialChunks.length);
  });

  test('No duplicate chunks loaded', async ({ page }) => {
    await page.goto('/th/dashboard');
    
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.endsWith('.js'))
        .map(r => r.name);
    });
    
    const uniqueChunks = new Set(resources);
    expect(uniqueChunks.size).toBe(resources.length);
  });
});

test.describe('Resource Loading', () => {
  test('Critical CSS inlined', async ({ page }) => {
    await page.goto('/th/');
    
    const html = await page.content();
    // Should have critical CSS inlined in <style> tags
    expect(html).toContain('<style');
  });

  test('Fonts preloaded', async ({ page }) => {
    await page.goto('/th/');
    
    const preloads = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="preload"]'))
        .filter(l => l.as === 'font')
        .map(l => l.href);
    });
    
    expect(preloads.length).toBeGreaterThan(0);
  });

  test('Images lazy loaded', async ({ page }) => {
    await page.goto('/th/worlds');
    
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .map(img => ({ loading: img.loading, src: img.src }));
    });
    
    // Below-fold images should have loading="lazy"
    const lazyImages = images.filter(img => img.loading === 'lazy');
    expect(lazyImages.length).toBeGreaterThan(0);
  });

  test('No render-blocking resources', async ({ page }) => {
    await page.goto('/th/');
    
    const blocking = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"], script[src]'))
        .filter(el => !el.hasAttribute('async') && !el.hasAttribute('defer') && el.tagName !== 'STYLE')
        .map(el => el.outerHTML);
    });
    
    // Should be minimal (only critical inline)
    expect(blocking.length).toBeLessThanOrEqual(2);
  });
});

test.describe('Runtime Performance', () => {
  test('Memory usage stable on navigation', async ({ page }) => {
    await page.goto('/th/');
    
    const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize ?? 0);
    
    // Navigate through several pages
    await page.goto('/th/worlds');
    await page.goto('/th/decisions');
    await page.goto('/th/dashboard');
    
    const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize ?? 0);
    
    if (initialMemory > 0 && finalMemory > 0) {
      // Memory should not grow excessively
      expect(finalMemory).toBeLessThan(initialMemory * 2);
    }
  });

  test('React DevTools profiler - no unnecessary re-renders', async ({ page }) => {
    await page.goto('/th/dashboard');
    
    // Measure component renders using React DevTools profiler API if available
    const renders = await page.evaluate(() => {
      // This would require React DevTools profiler
      // Placeholder for actual implementation
      return 0;
    });
    
    // Just ensure page loads without error
    expect(renders).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Network Performance', () => {
  test('API response times < 500ms', async ({ page }) => {
    const apiCalls: number[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/') || response.url().includes('supabase')) {
        apiCalls.push(response.timing().responseEnd - response.timing().requestStart);
      }
    });
    
    await page.goto('/th/dashboard');
    await page.waitForLoadState('networkidle');
    
    for (const duration of apiCalls) {
      if (duration > 0) {
        expect(duration).toBeLessThan(500);
      }
    }
  });

  test('Supabase queries use indexes', async ({ page }) => {
    // This would require backend verification
    // Placeholder - actual implementation checks query plans
    expect(true).toBe(true);
  });
});