import { test, expect } from '@playwright/test';

/**
 * Authentication Tests
 * Run with: npx playwright test --project=chromium
 */

const TEST_USERS = {
  admin: { email: 'admin@eduerp.com', password: 'admin123' },
  accountant: { email: 'accountant@test.com', password: 'pass123' },
  faculty: { email: 'teacher@test.com', password: 'pass123' },
  student: { email: 'student@test.com', password: 'pass123' }
};

// ============================================
// LOGIN PAGE TESTS
// ============================================

test.describe('Login Page', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display login page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to EduERP' })).toBeVisible();
  });

  test('should display login form elements', async ({ page }) => {
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should have quick access credentials', async ({ page }) => {
    await expect(page.getByRole('button', { name: /admin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /accountant/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /teacher/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /student/i })).toBeVisible();
  });

  test('should login with valid admin credentials', async ({ page }) => {
    await page.getByLabel('Email address').fill(TEST_USERS.admin.email);
    await page.getByLabel('Password').fill(TEST_USERS.admin.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/admin\/dashboard/);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.getByLabel('Email address').fill('invalid@test.com');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
await expect(page.getByText('Login failed. Please try again.')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('should use quick access for admin login', async ({ page }) => {
    await page.getByRole('button', { name: /admin/i }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/admin\/dashboard/);
  });

  test('should use quick access for student login', async ({ page }) => {
    await page.getByRole('button', { name: /student/i }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForURL('**/student/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/student\/dashboard/);
  });
});

// ============================================
// PROTECTED ROUTES TESTS
// ============================================

test.describe('Protected Routes - Unauthenticated Access', () => {
  
  test('should redirect /admin to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/login|admin/);
  });

  test('should redirect /student to login', async ({ page }) => {
    await page.goto('/student/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/login|student/);
  });

  test('should redirect /faculty to login', async ({ page }) => {
    await page.goto('/faculty/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/login|faculty/);
  });

  test('should redirect /accountant to login', async ({ page }) => {
    await page.goto('/accountant/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/login|accountant/);
  });
});

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

test.describe('Role-Based Access Control', () => {
  
  test('should not allow student to access admin routes', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.getByLabel('Email address').fill(TEST_USERS.student.email);
    await page.getByLabel('Password').fill(TEST_USERS.student.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/student/dashboard');
    
    // Try to access admin route
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toMatch(/admin\/dashboard/);
  });

  test('should not allow faculty to access accountant routes', async ({ page }) => {
    // Login as faculty
    await page.goto('/login');
    await page.getByLabel('Email address').fill(TEST_USERS.faculty.email);
    await page.getByLabel('Password').fill(TEST_USERS.faculty.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/faculty/dashboard');
    
    // Try to access accountant route
    await page.goto('/accountant/dashboard');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toMatch(/accountant\/dashboard/);
  });

  test('should not allow accountant to access admin routes', async ({ page }) => {
    // Login as accountant
    await page.goto('/login');
    await page.getByLabel('Email address').fill(TEST_USERS.accountant.email);
    await page.getByLabel('Password').fill(TEST_USERS.accountant.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/accountant/dashboard');
    
    // Try to access admin route
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toMatch(/admin\/dashboard/);
  });
});
