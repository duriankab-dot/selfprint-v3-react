/**
 * intelligence-hub.spec.ts — TC-505: E2E tests for IntelligenceHub dashboard panels
 *
 * Tests:
 * - Dashboard panels section renders with Decision/World/Memory links
 * - Twin Memory & Evolution panels render when twin exists
 * - Navigation links work correctly
 */

import { test, expect } from '@playwright/test';

test.describe('IntelligenceHub Dashboard Panels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/th/intelligence');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test.skip('should show Dashboard Panels section when authenticated', async ({ page }) => {
    // await page.goto('/th/intelligence');
    
    // Check for section title
    const sectionTitle = page.locator('h2:has-text("แผงควบคุม"), h2:has-text("Dashboard Panels")');
    await expect(sectionTitle).toBeVisible();
    
    // Check for three panel cards
    const decisionsCard = page.locator('text=การตัดสินใจ, text=Decisions');
    const worldsCard = page.locator('text=โลก, text=Worlds');
    const memoriesCard = page.locator('text=ความทรงจำ, text=Memories');
    
    await expect(decisionsCard).toBeVisible();
    await expect(worldsCard).toBeVisible();
    await expect(memoriesCard).toBeVisible();
  });

  test.skip('should navigate to Decision Dashboard on click', async ({ page }) => {
    // await page.locator('button:has-text("Decision Dashboard"), button:has-text("แดชบอร์ดการตัดสินใจ")').click();
    // await expect(page).toHaveURL(/.*\/decisions/);
  });

  test.skip('should navigate to Worlds Hub on click', async ({ page }) => {
    // await page.locator('button:has-text("Worlds Hub"), button:has-text("Worlds Hub")').click();
    // await expect(page).toHaveURL(/.*\/worlds/);
  });

  test.skip('should navigate to Memory Insights on click', async ({ page }) => {
    // await page.locator('button:has-text("Memory Insights"), button:has-text("Memory Insights")').click();
    // await expect(page).toHaveURL(/.*\/memory-insights/);
  });

  test.skip('should show Twin Memory & Evolution panels when twin exists', async ({ page }) => {
    // Check for Memory panel
    const memoryPanel = page.locator('[data-testid="memory-list"]');
    await expect(memoryPanel).toBeVisible();
    
    // Check for Evolution panel
    const evolutionPanel = page.locator('[data-testid="evolution-events"]');
    await expect(evolutionPanel).toBeVisible();
  });
});

test.describe('IntelligenceHub Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.skip('should render dashboard panels on mobile', async ({ page }) => {
    // await page.goto('/th/intelligence');
    // Check panel cards stack vertically
  });

  test.skip('should handle Twin panels on mobile', async ({ page }) => {
    // Check EvolutionVisualization renders correctly on mobile
  });
});

test.describe('IntelligenceHub Negative Cases', () => {
  test.skip('should handle missing twin gracefully', async ({ page }) => {
    // Authenticated user without twin
  });

  test.skip('should handle API errors in Twin panels', async ({ page }) => {
    // Mock API errors
  });
});