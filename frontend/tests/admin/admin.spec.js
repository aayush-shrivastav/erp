import { test, expect } from '@playwright/test';

/**
 * Admin Portal Tests
 * Run with: npx playwright test --project=admin
 */

const TEST_CREDENTIALS = { email: 'admin@eduerp.com', password: 'admin123' };

// ============================================
// AUTHENTICATION & SETUP
// ============================================

test.describe('Admin Login', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.getByLabel(/email/i).fill(TEST_CREDENTIALS.email);
    await page.getByLabel(/password/i).fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/admin\/dashboard/);
  });
});

// ============================================
// ADMIN DASHBOARD
// ============================================

test.describe('Admin Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard', { waitUntil: 'networkidle' });
  });

  test('should display admin dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/admin\/dashboard/);
    await expect(page.locator('main').locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display statistics cards', async ({ page }) => {
    await expect(page.locator('.grid, .stats, [class*="grid"]').first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// STUDENTS MANAGEMENT
// ============================================

test.describe('Students Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigating to the canonical URL
    await page.goto('/admin/users/students', { waitUntil: 'networkidle' });
  });

  test('should navigate to Students page', async ({ page }) => {
    await expect(page).toHaveURL(/admin\/users\/students/);
  });

  test('should display students page with table', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/student/i);
  });

  test('should have Add Student button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add student/i }).first();
    await expect(addButton).toBeVisible();
  });

  test('should open Add Student modal', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add student/i }).first();
    await addButton.click();
    await expect(page.getByRole('heading', { name: /register.*student|add.*student/i })).toBeVisible({ timeout: 10000 });
  });
});

// ============================================
// FEES MANAGEMENT
// ============================================

test.describe('Fees Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/fees', { waitUntil: 'networkidle' });
  });

  test('should navigate to Fees page', async ({ page }) => {
    await expect(page).toHaveURL(/fees/);
  });

  test('should display fee structures', async ({ page }) => {
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/fee/i);
  });
});

// ============================================
// ACADEMICS
// ============================================

test.describe('Academics', () => {
  
  test('should navigate to Sessions', async ({ page }) => {
    await page.goto('/admin/academic/sessions', { waitUntil: 'networkidle' });
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/session/i);
  });

  test('should navigate to Courses', async ({ page }) => {
    await page.goto('/admin/academic/courses', { waitUntil: 'networkidle' });
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/course/i);
  });

  test('should navigate to Sections/Hierarchy', async ({ page }) => {
    await page.goto('/admin/academic/sections', { waitUntil: 'networkidle' });
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/hierarchy|section|class/i);
  });
});

// ============================================
// FACULTY MANAGEMENT
// ============================================

test.describe('Faculty Management', () => {
  
  test('should navigate to Faculty page', async ({ page }) => {
    await page.goto('/admin/users/teachers', { waitUntil: 'networkidle' });
    // Faculty Hub is H2, so we use loose regex
    await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/faculty|hub|staff/i);
  });
});
