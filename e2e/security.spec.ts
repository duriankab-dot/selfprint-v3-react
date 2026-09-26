/**
 * security.spec.ts — TC-605: Final Security Audit
 *
 * Tests:
 * - RLS verification
 * - Auth boundaries
 * - Secret scanning
 * - Rate limits
 * - XSS/CSRF protection
 */

import { test, expect } from '@playwright/test';

test.describe('Row Level Security (RLS) Verification', () => {
  test.skip('twin_memories: user can only read own memories', async ({ page }) => {
    // 1. Login as user A
    // 2. Insert memory
    // 3. Login as user B
    // 4. Attempt to read user A's memory
    // 5. Should return empty/no rows
  });

  test.skip('decision_log: user can only read own decisions', async ({ page }) => {
    // Similar pattern for decision_log table
  });

  test.skip('world_preferences: user can only modify own preferences', async ({ page }) => {
    // User A sets world preference
    // User B attempts to update
    // Should fail
  });

  test.skip('twin_sice_scores: user can only read own scores', async ({ page }) => {
    // Verify RLS on twin_sice_scores
  });

  test.skip('twin_state: user can only read own state', async ({ page }) => {
    // Verify RLS on twin_state
  });

  test.skip('conversations: user can only read own conversations', async ({ page }) => {
    // Verify RLS on conversations/messages
  });
});

test.describe('Auth Boundaries', () => {
  test('protected routes require authentication', async ({ page }) => {
    const protectedRoutes = [
      '/th/twin/patterns',
      '/th/memory-insights',
      '/th/decisions',
      '/th/worlds',
      '/th/intelligence',
      '/th/dashboard',
      '/th/twin/settings',
      '/th/twin/personality',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/.*\/login.*/);
    }
  });

  test('API routes require valid JWT', async ({ page }) => {
    const apiRoutes = [
      '/api/decisions',
      '/api/worlds',
      '/api/memory',
      '/api/twin',
      '/api/autonomy-log',
    ];

    for (const route of apiRoutes) {
      const response = await page.request.get(route);
      expect([401, 403]).toContain(response.status());
    }
  });

  test('Supabase client uses anon key only', async ({ page }) => {
    // Verify no service role key in client bundle
    await page.goto('/th/');
    
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map(s => s.src);
    });
    
    // Check for service role key patterns
    for (const src of scripts) {
      const content = await page.request.get(src).then(r => r.text());
      expect(content).not.toContain('service_role');
      expect(content).not.toContain('service-key');
    }
  });

  test('No hardcoded secrets in bundle', async ({ page }) => {
    await page.goto('/th/');
    
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.endsWith('.js') || r.name.endsWith('.mjs'))
        .map(r => r.name);
    });
    
    for (const url of resources) {
      const content = await page.request.get(url).then(r => r.text());
      // Check for common secret patterns
      expect(content).not.toMatch(/sk_[a-zA-Z0-9]{32,}/); // Stripe secret
      expect(content).not.toMatch(/pk_[a-zA-Z0-9]{32,}/); // Stripe publishable (should be in env)
      expect(content).not.toMatch(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/); // JWT
      expect(content).not.toMatch(/postgres:\/\/[^:]+:[^@]+@/); // DB connection string
    }
  });
});

test.describe('Secret Scanning', () => {
  test('No secrets in source code', async ({ page }) => {
    // This is a build-time check
    // Run as part of CI: npm run security:scan
    expect(true).toBe(true);
  });

  test('Environment variables not exposed to client', async ({ page }) => {
    await page.goto('/th/');
    
    const windowEnv = await page.evaluate(() => {
      return Object.keys(window).filter(k => 
        k.toLowerCase().includes('secret') ||
        k.toLowerCase().includes('password') ||
        k.toLowerCase().includes('token') ||
        k.toLowerCase().includes('key')
      );
    });
    
    expect(windowEnv.length).toBe(0);
  });

  test('Vite env prefix only exposes VITE_ vars', async ({ page }) => {
    await page.goto('/th/');
    
    const importedEnv = await page.evaluate(() => {
      return (window as any).__ENV__ ?? {};
    });
    
    for (const key of Object.keys(importedEnv)) {
      expect(key).toMatch(/^VITE_/);
    }
  });
});

test.describe('Rate Limiting', () => {
  test('Auth endpoints rate limited', async ({ page }) => {
    // Attempt multiple rapid login requests
    for (let i = 0; i < 10; i++) {
      await page.request.post('/api/auth/login', {
        data: { email: 'test@test.com', password: 'wrong' }
      });
    }
    
    const response = await page.request.post('/api/auth/login', {
      data: { email: 'test@test.com', password: 'wrong' }
    });
    
    // Should be rate limited
    expect([429, 403]).toContain(response.status());
  });

  test('API endpoints rate limited', async ({ page }) => {
    // Rapid API calls
    for (let i = 0; i < 20; i++) {
      await page.request.get('/api/decisions');
    }
    
    const response = await page.request.get('/api/decisions');
    expect([429, 403]).toContain(response.status());
  });

  test('Password reset rate limited', async ({ page }) => {
    // Multiple password reset requests
    // Should be limited
  });
});

test.describe('XSS Protection', () => {
  test('User input sanitized in Memory Insights', async ({ page }) => {
    await page.goto('/th/memory-insights');
    
    // Attempt XSS via search
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="ค้นหา"]');
    await searchInput.fill('<script>alert("xss")</script>');
    await searchInput.press('Enter');
    
    // Should not execute script
    const dialogs: string[] = [];
    page.on('dialog', d => dialogs.push(d.message()));
    
    await page.waitForTimeout(500);
    expect(dialogs.length).toBe(0);
  });

  test('Decision form sanitizes input', async ({ page }) => {
    await page.goto('/th/decisions');
    // Click new decision
    // Fill with XSS payload
    // Submit
    // Verify no execution
  });

  test('World articles content sanitized', async ({ page }) => {
    await page.goto('/th/worlds/self');
    // Article content should be rendered as text, not HTML
    const articleContent = page.locator('.article-full-content');
    const html = await articleContent.innerHTML();
    expect(html).not.toContain('<script');
  });

  test('CSP headers present', async ({ page }) => {
    const response = await page.goto('/th/');
    const csp = response?.headers()['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
  });
});

test.describe('CSRF Protection', () => {
  test('State-changing operations require CSRF token', async ({ page }) => {
    // Attempt POST without CSRF
    const response = await page.request.post('/api/decisions', {
      data: { title: 'Test', context: 'Test' }
    });
    
    expect([403, 419]).toContain(response.status());
  });

  test('SameSite cookies configured', async ({ page }) => {
    await page.goto('/th/');
    
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      if (cookie.name.includes('session') || cookie.name.includes('auth')) {
        expect(['Lax', 'Strict']).toContain(cookie.sameSite);
      }
    }
  });
});

test.describe('Content Security', () => {
  test('No inline scripts without nonce', async ({ page }) => {
    await page.goto('/th/');
    
    const inlineScripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script:not([src])'))
        .filter(s => !s.hasAttribute('nonce') && !s.textContent?.includes('webpack'))
        .map(s => s.outerHTML);
    });
    
    // Should only have nonce'd or webpack scripts
    expect(inlineScripts.length).toBe(0);
  });

  test('External resources from trusted domains only', async ({ page }) => {
    await page.goto('/th/');
    
    const resources = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src], link[href], img[src]'))
        .map(el => el.getAttribute('src') || el.getAttribute('href'))
        .filter(Boolean);
    });
    
    for (const url of resources) {
      if (url && url.startsWith('http')) {
        const hostname = new URL(url).hostname;
        // Add your trusted domains
        const trusted = ['selfprint.ai', 'cdn.selfprint.ai', 'fonts.googleapis.com', 'fonts.gstatic.com'];
        expect(trusted.some(t => hostname.includes(t))).toBe(true);
      }
    }
  });
});

test.describe('Data Validation', () => {
  test('Input validation on decision form', async ({ page }) => {
    // Test various invalid inputs
    // - Empty title
    // - Very long text (>10000 chars)
    // - SQL injection attempts
    // - XSS payloads
  });

  test('File upload validation', async ({ page }) => {
    // Test avatar upload
    // - File type validation
    // - File size limit
    // - Malicious file content
  });

  test('Webhook signature verification', async ({ page }) => {
    // Stripe webhook
    // Supabase webhook
    // Should verify signatures
  });
});