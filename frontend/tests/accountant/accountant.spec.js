import { test, expect } from '@playwright/test';

/**
 * Accountant Portal Tests
 * Run with: npx playwright test --project=accountant
 */

const TEST_CREDENTIALS = { email: 'accountant@test.com', password: 'pass123' };

test.describe('Accountant Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(TEST_CREDENTIALS.email);
    await page.getByLabel('Password').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/accountant/dashboard', { timeout: 15000 });
  });

  test('should login successfully and redirect to accountant dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/accountant\/dashboard/);
  });
});

test.describe('Accountant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display accounts dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /accounts.*dashboard/i })).toBeVisible({ timeout: 10001 });
  });

  test('should display financial metric cards', async ({ page }) => {
    await expect(page.getByText(/total revenue/i)).toBeVisible({ timeout: 10001 });
    await expect(page.getByText(/total collected/i)).toBeVisible({ timeout: 10001 });
    await expect(page.getByText(/total pending/i)).toBeVisible({ timeout: 10001 });
  });
});

test.describe('Fee Structures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/fee-structures');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Fee Structures page', async ({ page }) => {
    await expect(page).toHaveURL(/fee-structures/);
    await expect(page.getByRole('heading', { name: /fee structures/i })).toBeVisible({ timeout: 10001 });
  });

  test('should have create fee structure action', async ({ page }) => {
    await expect(page.getByRole('button', { name: /new fee structure|create fee structure/i })).toBeVisible();
  });

  test('should render structures table area', async ({ page }) => {
    await expect(page.locator('table').first()).toBeVisible();
  });
});

test.describe('Fee Assignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/fee-assignment');
    await page.waitForLoadState('networkidle');
  });

  test('should display fee assignment page', async ({ page }) => {
    await expect(page).toHaveURL(/fee-assignment/);
    await expect(page.getByRole('heading', { name: /assign fee structure/i })).toBeVisible({ timeout: 10001 });
  });

  test('should show assignment form controls', async ({ page }) => {
    await expect(page.locator('select[name="course"]')).toBeVisible();
    await expect(page.locator('select[name="semester"]')).toBeVisible();
    await expect(page.locator('select[name="feeStructureId"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /assign fees to students/i })).toBeVisible();
  });
});

test.describe('Payments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/payments');
    await page.waitForLoadState('networkidle');
  });

  test('should display payment processing page', async ({ page }) => {
    await expect(page).toHaveURL(/payments/);
    await expect(page.getByRole('heading', { name: /process payments/i })).toBeVisible({ timeout: 10001 });
  });

  test('should show student search form', async ({ page }) => {
    await expect(page.getByPlaceholder(/search by student name or enrollment/i)).toBeVisible();
    await expect(page.locator('form button[type="submit"]')).toBeVisible();
  });
});

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/reports');
    await page.waitForLoadState('networkidle');
  });

  test('should display reports page', async ({ page }) => {
    await expect(page).toHaveURL(/reports/);
    await expect(page.getByRole('heading', { name: /financial reports/i })).toBeVisible({ timeout: 10001 });
  });
});

test.describe('Defaulters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant/defaulters');
    await page.waitForLoadState('networkidle');
  });

  test('should display defaulters list page', async ({ page }) => {
    await expect(page).toHaveURL(/defaulters/);
    await expect(page.getByRole('heading', { name: /defaulters/i })).toBeVisible({ timeout: 10001 });
  });

  test('should display defaulter table section', async ({ page }) => {
    await expect(page.locator('table').first()).toBeVisible();
  });
});

test.describe('Accountant Navigation Workflow', () => {
  test('should navigate through accountant pages', async ({ page }) => {
    await page.goto('/accountant/dashboard');
    await expect(page).toHaveURL(/dashboard/);

    await page.goto('/accountant/fee-structures');
    await expect(page).toHaveURL(/fee-structures/);

    await page.goto('/accountant/fee-assignment');
    await expect(page).toHaveURL(/fee-assignment/);

    await page.goto('/accountant/payments');
    await expect(page).toHaveURL(/payments/);

    await page.goto('/accountant/reports');
    await expect(page).toHaveURL(/reports/);

    await page.goto('/accountant/defaulters');
    await expect(page).toHaveURL(/defaulters/);
  });
});
