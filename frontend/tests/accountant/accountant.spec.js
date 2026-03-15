import { test, expect } from '@playwright/test';

/**
 * Accountant Portal Tests
 * Run with: npx playwright test --project=accountant
 */

test.use({ storageState: 'playwright/.auth/accountant.json' });

test.describe('Accountant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display accounts dashboard', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/finance|command|accounts|dashboard|overview/i);
  });
});

test.describe('Fee Structures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/fee-structures');
    await page.waitForLoadState('networkidle');
  });

  test('should display fee structure page', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/fee structure|finance/i);
  });
});

test.describe('Fee Assignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/fee-assignment');
    await page.waitForLoadState('networkidle');
  });

  test('should display fee assignment page', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/assign fee|fee assignment/i);
  });
});

test.describe('Payments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/payments');
    await page.waitForLoadState('networkidle');
  });

  test('should display payment processing page', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/process payments|payment/i);
  });
});

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/reports');
    await page.waitForLoadState('networkidle');
  });

  test('should display reports page', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/financial reports|reports/i);
  });
});

test.describe('Defaulters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/defaulters');
    await page.waitForLoadState('networkidle');
  });

  test('should display defaulters list page', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/defaulter|due/i);
  });
});
