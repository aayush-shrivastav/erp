import { test, expect } from '@playwright/test';

/**
 * Student Portal Tests
 * Run with: npx playwright test --project=student
 */

const TEST_CREDENTIALS = { email: 'student@test.com', password: 'pass123' };

// ============================================
// AUTHENTICATION & SETUP
// ============================================

test.describe('Student Login', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(TEST_CREDENTIALS.email);
    await page.getByLabel('Password').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/student/dashboard', { timeout: 10000 });
  });

  test('should login successfully and redirect to student dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/student\/dashboard/);
  });
});

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
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display quick stats', async ({ page }) => {
    // Check for any stats/quick stats elements
    await page.waitForTimeout(1000);
    const hasStats = await page.locator('.grid, .stats, [class*="stat"]').first().isVisible().catch(() => false);
    expect(hasStats).toBe(true);
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
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible({ timeout: 5000 });
  });

  test('should display student details', async ({ page }) => {
    // Should show student name, enrollment number, etc.
    await page.waitForTimeout(1000);
    const profileContent = page.locator('main, .content, [class*="profile"]').first();
    await expect(profileContent).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'My Fees' })).toBeVisible({ timeout: 5000 });
  });

  test('should display fee status', async ({ page }) => {
    await page.waitForTimeout(1000);
    const hasFeeCard = await page.getByText(/fee assignment|balance due|total payable/i).first().isVisible().catch(() => false);
    expect(hasFeeCard).toBe(true);
  });

  test('should display pending balance', async ({ page }) => {
    await page.waitForTimeout(1000);
    const hasBalance = await page.getByText(/pending|balance|due/i).first().isVisible().catch(() => false);
    expect(hasBalance).toBe(true);
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
    await expect(page.getByRole('heading', { name: 'My Exam Marks' })).toBeVisible({ timeout: 5000 });
  });

  test('should display marks table', async ({ page }) => {
    await page.waitForTimeout(1000);
    const noGradesHeading = page.getByRole('heading', { name: 'No Grades Published' });
    const hasNoGradesMessage = await noGradesHeading.isVisible().catch(() => false);

    if (hasNoGradesMessage) {
      await expect(noGradesHeading).toBeVisible();
      return;
    }

    await expect(page.locator('table').first()).toBeVisible({ timeout: 5000 });
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
    await expect(page.getByRole('heading', { name: 'My Attendance' })).toBeVisible({ timeout: 5000 });
  });

  test('should display attendance records', async ({ page }) => {
    await page.waitForTimeout(1000);
    const attendanceTable = page.locator('table, .attendance, [class*="attendance"]').first();
    await expect(attendanceTable).toBeVisible();
  });

  test('should display attendance percentage', async ({ page }) => {
    await page.waitForTimeout(1000);
    const hasPercentage = await page.getByText(/%|percentage|present/i).first().isVisible().catch(() => false);
    expect(hasPercentage).toBe(true);
  });
});

// ============================================
// TIMETABLE
// ============================================

test.describe('Timetable', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/timetable');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Timetable page', async ({ page }) => {
    await expect(page).toHaveURL(/timetable/);
  });

  test('should display timetable', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /timetable|schedule/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display timetable table or grid', async ({ page }) => {
    await page.waitForTimeout(1000);
    const timetable = page.locator('table, .timetable, [class*="timetable"]').first();
    await expect(timetable).toBeVisible();
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

  test('should navigate to Notices page', async ({ page }) => {
    await expect(page).toHaveURL(/notices/);
  });

  test('should display notices', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /notice|announcement/i })).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// STUDENT WORKFLOW
// ============================================

test.describe('Student Complete Workflow', () => {
  
  test('should navigate through all student pages', async ({ page }) => {
    // Dashboard
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('dashboard');
    
    // Profile
    await page.goto('/student/profile');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('profile');
    
    // Fees
    await page.goto('/student/fees');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('fees');
    
    // Marks
    await page.goto('/student/marks');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('marks');
    
    // Attendance
    await page.goto('/student/attendance');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('attendance');
    
    // Timetable
    await page.goto('/student/timetable');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('timetable');
  });
});
