import { test, expect } from '@playwright/test';

/**
 * Student Portal Tests
 * Run with: npx playwright test --project=student
 */

test.use({ storageState: 'playwright/.auth/student.json' });

// ============================================
// STUDENT DASHBOARD
// ============================================

test.describe('Student Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display student dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/student\/dashboard/);
    await expect(page.locator('main').locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.getByText(/welcome|howdy|hi/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ============================================
// PROFILE
// ============================================

test.describe('Profile', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/profile');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Profile page', async ({ page }) => {
    await expect(page).toHaveURL(/profile/);
  });

  test('should display profile information', async ({ page }) => {
    // Matches "Academic Identity" or "Profile"
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/profile|identity/i);
  });
});

// ============================================
// FEES
// ============================================

test.describe('Fees', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/fees');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Fees page', async ({ page }) => {
    await expect(page).toHaveURL(/fees/);
  });

  test('should display fee information', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/fee|finance/i);
  });
});

// ============================================
// MARKS
// ============================================

test.describe('Marks', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/marks');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Marks page', async ({ page }) => {
    await expect(page).toHaveURL(/marks/);
  });

  test('should display marks information', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/marks|grade|result/i);
  });
});

// ============================================
// ATTENDANCE
// ============================================

test.describe('Attendance', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/attendance');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Attendance page', async ({ page }) => {
    await expect(page).toHaveURL(/attendance/);
  });

  test('should display attendance information', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/attendance/i);
  });
});

// ============================================
// NOTICES
// ============================================

test.describe('Notices', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/notices');
    await page.waitForLoadState('networkidle');
  });

  test('should display notices', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/notice|announcement/i);
  });
});
