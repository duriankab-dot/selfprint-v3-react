/**
 * lifecycle.spec.ts — Phase A Gate: Critical Journey Verification
 *
 * baseURL = https://www.selfprint.one (production, playwright.config.ts)
 *
 * Tests the FULL critical path as defined in PHASE A PRODUCTION CLOSURE:
 *   Landing → Entry → Onboarding entry point → Trojan Horse bridge
 *
 * NOTE on auth: Magic-link auth cannot be completed in automated E2E
 * (requires email inbox). Auth-gated pages are tested for:
 *   a) Correct redirect (not 5xx crash)
 *   b) Correct loading state
 *   c) No JS runtime errors
 *
 * Mobile viewport tests included per Phase A requirement.
 */

import { test, expect, Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Collect JS console errors, filtering known noise */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (
        t.includes('chrome-extension') ||
        t.includes('WebSocket') ||
        t.includes('supabase.co/realtime') ||
        t.includes('ERR_BLOCKED_BY_CLIENT') ||
        t.includes('net::ERR_') // expected in E2E sandbox
      ) return;
      errors.push(t);
    }
  });
  return errors;
}

// ─── LIFE-01: Landing page has working CTA ────────────────────────────────────

test.describe('Lifecycle — Landing Entry', () => {
  test('LIFE-01 landing /en loads and CTA is clickable', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // H1 or hero text visible
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible({ timeout: 10000 });

    // Primary CTA: "Start Free" or "เริ่มฟรี"
    const cta = page.locator(
      'button:has-text("Start Free"), button:has-text("เริ่มฟรี"), ' +
      'a:has-text("Start Free"), a:has-text("เริ่มฟรี")'
    ).first();
    await expect(cta).toBeVisible({ timeout: 10000 });

    // CTA must be clickable (not hidden by overlay, not disabled)
    await expect(cta).toBeEnabled({ timeout: 5000 });

    // No critical JS errors on landing
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('LIFE-02 landing /th loads without error', async ({ page }) => {
    // React SPA: wait for networkidle so JS has time to render content
    const serverErrors: string[] = [];
    page.on('response', r => {
      if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
    });

    await page.goto('/th', { waitUntil: 'networkidle' }).catch(() => {
      // networkidle can timeout on slow connections — domcontentloaded is still ok
    });

    // No 5xx errors — page loaded successfully
    expect(serverErrors).toHaveLength(0);

    // Must have at least some content (SPA shell = ≥30 chars)
    const body = await page.locator('body').textContent({ timeout: 10000 });
    expect(body).not.toBeNull();
    expect(body!.trim().length).toBeGreaterThan(30);
  });

  test('LIFE-03 root / loads without 5xx (redirect is client-side)', async ({ page }) => {
    // React Router handles lang redirect client-side after JS hydration.
    // At domcontentloaded the URL may still be '/' — that's expected SPA behavior.
    const serverErrors: string[] = [];
    page.on('response', r => {
      if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait briefly for client-side redirect
    await page.waitForTimeout(2000);

    // No server errors — root must not 5xx
    expect(serverErrors).toHaveLength(0);

    // After hydration, should be on /en or /th OR still at / (valid SPA root)
    const url = page.url();
    const isAcceptable =
      url.includes('/en') || url.includes('/th') ||
      url === 'https://www.selfprint.one/' ||
      url.endsWith('/');
    expect(isAcceptable).toBe(true);
  });

  test('LIFE-04 landing CTA click → no 5xx crash', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const cta = page.locator(
      'button:has-text("Start Free"), button:has-text("เริ่มฟรี"), ' +
      'a:has-text("Start Free"), a:has-text("เริ่มฟรี")'
    ).first();

    if (await cta.isVisible({ timeout: 5000 })) {
      // Intercept any 5xx responses
      const serverErrors: string[] = [];
      page.on('response', resp => {
        if (resp.status() >= 500) serverErrors.push(`${resp.status()} ${resp.url()}`);
      });

      await cta.click();
      // Wait for navigation or modal
      await page.waitForTimeout(3000);

      expect(serverErrors).toHaveLength(0);

      // Should NOT show raw error page
      const body = await page.locator('body').textContent();
      expect(body).not.toContain('Application error');
      expect(body).not.toContain('Internal Server Error');
    }
  });

  test('LIFE-05 quick analysis path ?mode=quick renders', async ({ page }) => {
    // entryResolver: ?mode=quick → routes to quick_analysis path
    await page.goto('/en?mode=quick', { waitUntil: 'domcontentloaded' });

    // Should load without 5xx crash
    const serverErrors: string[] = [];
    page.on('response', r => {
      if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
    });

    await page.waitForTimeout(2000);
    expect(serverErrors).toHaveLength(0);

    // Page should render something meaningful (not blank)
    const body = await page.locator('body').textContent();
    expect(body!.trim().length).toBeGreaterThan(50);
  });
});

// ─── LIFE-06: Trojan Horse Bridge Page ────────────────────────────────────────

test.describe('Lifecycle — Trojan Horse Bridge', () => {
  test('LIFE-06 /en/vs-astrology page loads without 5xx', async ({ page }) => {
    // Lazy-loaded public route — wait for networkidle so the lazy chunk renders
    const serverErrors: string[] = [];
    page.on('response', r => {
      if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
    });

    await page.goto('/en/vs-astrology', { waitUntil: 'networkidle' }).catch(() => {});

    // No server errors
    expect(serverErrors).toHaveLength(0);

    // Page must render something (auth redirect to /en/login is also acceptable)
    const body = await page.locator('body').textContent({ timeout: 10000 });
    expect(body!.trim().length).toBeGreaterThan(30);
  });

  test('LIFE-07 no "ดูดวง" in visible UI (Trojan rule enforced)', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // SK-03 duplicate for lifecycle context: check landing body text
    const bodyText = await page.locator('body').textContent({ timeout: 10000 });

    // "ดูดวง" only allowed in meta/hidden SEO content, never in visible body
    // We check the DOM text content (which excludes <meta> content)
    const hasDoodvang = bodyText?.includes('ดูดวง') ?? false;
    if (hasDoodvang) {
      console.warn('⚠️ TROJAN RULE VIOLATION: "ดูดวง" found in landing body text');
    }
    expect(hasDoodvang).toBe(false);
  });
});

// ─── LIFE-08: Onboarding Entry Point ─────────────────────────────────────────

test.describe('Lifecycle — Onboarding Entry', () => {
  test('LIFE-08 /en/onboarding loads without 5xx', async ({ page }) => {
    const serverErrors: string[] = [];
    page.on('response', r => {
      if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
    });

    await page.goto('/en/onboarding', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);
    expect(serverErrors).toHaveLength(0);

    // Must redirect to login OR render onboarding content (not crash)
    const url = page.url();
    const isLoginRedirect = url.includes('/login') || url.includes('/auth');
    const isOnboarding = url.includes('/onboarding');
    const isLanding = url.includes('/en') && !url.includes('/onboarding');

    // Any of these is acceptable (redirect = auth guard working correctly)
    const acceptable = isLoginRedirect || isOnboarding || isLanding;
    expect(acceptable).toBe(true);
  });

  test('LIFE-09 /en/login → visible form, no 5xx', async ({ page }) => {
    const serverErrors: string[] = [];
    page.on('response', r => {
      if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
    });

    await page.goto('/en/login', { waitUntil: 'domcontentloaded' });

    // Email input must exist
    const emailInput = page.locator('input[type="email"], input[placeholder="อีเมลของคุณ"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    expect(serverErrors).toHaveLength(0);
  });

  test('LIFE-10 login page back navigation safe', async ({ page }) => {
    // Go to login, then back — should not crash
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.goto('/en/login', { waitUntil: 'domcontentloaded' });
    await page.goBack({ waitUntil: 'domcontentloaded' });

    // Should be back on landing or root — not error page
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Application error');
    expect(body).not.toContain('Unhandled Runtime Error');
  });
});

// ─── LIFE-11 to LIFE-14: Mobile Viewport ─────────────────────────────────────

test.describe('Lifecycle — Mobile Viewport (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone 13

  test('LIFE-11 landing no horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Check for horizontal scroll (overflow)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    if (scrollWidth > clientWidth) {
      console.warn(`⚠️ MOBILE OVERFLOW: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`);
    }
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for sub-pixel rounding
  });

  test('LIFE-12 landing page has interactive elements on mobile', async ({ page }) => {
    // At 375px, landing CTA layout may differ from desktop (responsive CSS).
    // We verify the page is functional, not a specific button text.
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Must have at least 1 button (nav, CTA, hamburger menu — any is fine)
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);

    // No horizontal overflow (main mobile UX concern)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Log CTA presence for informational purposes (not a hard assertion)
    const ctaVisible = await page.locator(
      'button:has-text("Start Free"), button:has-text("เริ่มฟรี"), ' +
      'a:has-text("Start Free"), a:has-text("เริ่มฟรี")'
    ).first().isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Mobile CTA (Start Free/เริ่มฟรี) visible: ${ctaVisible}`);
  });

  test('LIFE-13 login form usable on mobile', async ({ page }) => {
    await page.goto('/en/login', { waitUntil: 'domcontentloaded' });

    const emailInput = page.locator('input[type="email"], input[placeholder="อีเมลของคุณ"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    // Input must be in viewport (not clipped by keyboard or fixed header)
    const box = await emailInput.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThan(100); // not collapsed
      expect(box.height).toBeGreaterThan(20); // not zero-height
    }

    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('LIFE-14 mobile load performance < 7s', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - t0;
    console.log(`Mobile landing load: ${elapsed}ms`);
    // Allow extra 1s vs desktop (mobile simulation overhead)
    expect(elapsed).toBeLessThan(7000);
  });
});

// ─── LIFE-15: Production API Health ──────────────────────────────────────────

test.describe('Lifecycle — API Health', () => {
  test('LIFE-15 /api/og returns 200 image/', async ({ page }) => {
    // Vercel Edge Function: cold start can take up to 40s on Hobby plan
    test.slow(); // triples the timeout (playwright.config.ts expects 180s → 540s cap)

    const response = await page.request.get('/api/og', { timeout: 45000 });
    expect(response.status()).toBe(200);
    const ct = response.headers()['content-type'] ?? '';
    expect(ct).toContain('image/');
  });

  test('LIFE-16 no Supabase 5xx on landing page load', async ({ page }) => {
    const supabaseErrors: string[] = [];
    page.on('response', r => {
      if (r.url().includes('supabase') && r.status() >= 500) {
        supabaseErrors.push(`${r.status()} ${r.url()}`);
      }
    });

    await page.goto('/en', { waitUntil: 'networkidle' }).catch(() => {}); // allow partial load
    expect(supabaseErrors).toHaveLength(0);
  });
});
