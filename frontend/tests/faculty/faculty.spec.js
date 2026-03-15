import { test, expect } from '@playwright/test';

/**
 * Faculty Portal Tests
 * Run with: npx playwright test --project=faculty
 */

test.use({ storageState: 'playwright/.auth/faculty.json' });

// ============================================
// FACULTY DASHBOARD
// ============================================

test.describe('Faculty Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/faculty/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display faculty dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/faculty\/dashboard/);
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/console|teacher|dashboard|overview/i);
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.getByText(/teacher|console|howdy|hi/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ============================================
// CLASSES
// ============================================

test.describe('Classes', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/faculty/classes');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Classes page', async ({ page }) => {
    await expect(page).toHaveURL(/classes/);
  });

  test('should display classes list', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/assigned|classes|sections/i);
  });
});

// ============================================
// ATTENDANCE
// ============================================

test.describe('Attendance Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/faculty/attendance');
    await page.waitForLoadState('networkidle');
  });

  test('should display attendance management', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/attendance/i);
  });
});

// ============================================
// MARKS
// ============================================

test.describe('Marks Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/faculty/marks');
    await page.waitForLoadState('networkidle');
  });

  test('should display marks management', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/marks|registry|assessment/i);
  });
});

// ============================================
// NOTICES
// ============================================

test.describe('Notices', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/faculty/notices');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Notices page', async ({ page }) => {
    await expect(page).toHaveURL(/notices/);
  });

  test('should display notices', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/notice|announcement/i);
  });
});
