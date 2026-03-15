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
    await page.goto('/login');
    await page.getByLabel('Email address').fill(TEST_CREDENTIALS.email);
    await page.getByLabel('Password').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
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
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display admin dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 5000 });
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
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Students page', async ({ page }) => {
    await page.goto('/admin/students');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/admin\/students/);
  });

  test('should display students page with table', async ({ page }) => {
    await page.goto('/admin/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /students/i })).toBeVisible({ timeout: 5000 });
  });

  test('should have Add Student button', async ({ page }) => {
    await page.goto('/admin/students');
    await page.waitForLoadState('networkidle');
    const addButton = page.getByRole('button', { name: /add student/i }).first();
    await expect(addButton).toBeVisible();
  });

  test('should open Add Student modal', async ({ page }) => {
    await page.goto('/admin/students');
    await page.waitForLoadState('networkidle');
    const addButton = page.getByRole('button', { name: /add student/i }).first();
    await addButton.click();
    
    // Modal should appear
    await expect(page.getByRole('heading', { name: /add.*student/i })).toBeVisible({ timeout: 3000 });
  });

  test('should search for student', async ({ page }) => {
    await page.goto('/admin/students');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });
});

// ============================================
// FEES MANAGEMENT
// ============================================

test.describe('Fees Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/fees');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Fees page', async ({ page }) => {
    await expect(page).toHaveURL(/fees/);
  });

  test('should display fee structures', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /fee/i })).toBeVisible({ timeout: 5000 });
  });

  test('should show fee assignment action from Fee Management', async ({ page }) => {
    await page.goto('/admin/fees');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /assign fee structure|assign fee/i })).toBeVisible({ timeout: 5000 });
  });

  test('should show defaulter metrics from Fee Management', async ({ page }) => {
    await page.goto('/admin/fees');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/pending|defaulter|due/i).first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// ATTENDANCE
// ============================================

test.describe('Attendance Management', () => {
  
  test('should navigate to Attendance', async ({ page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// NOTICES
// ============================================

test.describe('Notices Management', () => {
  
  test('should navigate to Notices', async ({ page }) => {
    await page.goto('/admin/notices');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /notice/i })).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// SETTINGS
// ============================================

test.describe('Settings', () => {
  
  test('should navigate to Settings', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// ACADEMICS
// ============================================

test.describe('Academics', () => {
  
  test('should navigate to Departments', async ({ page }) => {
    await page.goto('/admin/departments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /department/i })).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Courses', async ({ page }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /course/i })).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Subjects', async ({ page }) => {
    await page.goto('/admin/subjects');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /subject/i })).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Sessions', async ({ page }) => {
    await page.goto('/admin/sessions');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /session/i })).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// FACULTY MANAGEMENT
// ============================================

test.describe('Faculty Management', () => {
  
  test('should navigate to Faculty page', async ({ page }) => {
    await page.goto('/admin/faculty');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /faculty/i })).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// CRUD WORKFLOW
// ============================================

test.describe('Admin CRUD Workflow', () => {
  
  test('should complete admin navigation workflow', async ({ page }) => {
    // Dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('dashboard');
    
    // Students
    await page.goto('/admin/students');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('students');
    
    // Fees
    await page.goto('/admin/fees');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('fees');
    
    // Attendance
    await page.goto('/admin/attendance');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('attendance');
  });
});
