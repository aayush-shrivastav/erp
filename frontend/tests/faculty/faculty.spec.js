import { test, expect } from '@playwright/test';

/**
 * Faculty Portal Tests
 * Run with: npx playwright test --project=faculty
 */

const TEST_CREDENTIALS = { email: 'teacher@test.com', password: 'pass123' };

// ============================================
// AUTHENTICATION & SETUP
// ============================================

test.describe('Faculty Login', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(TEST_CREDENTIALS.email);
    await page.getByLabel('Password').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/faculty/dashboard', { timeout: 10000 });
  });

  test('should login successfully and redirect to faculty dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/faculty\/dashboard/);
  });
});

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
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display quick stats', async ({ page }) => {
    await page.waitForTimeout(1000);
    const hasStats = await page.locator('.grid, .stats, [class*="stat"]').first().isVisible().catch(() => false);
    expect(hasStats).toBe(true);
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
    await expect(page.getByRole('heading', { name: 'My Assigned Classes' })).toBeVisible({ timeout: 5000 });
  });

  test('should display assigned subjects', async ({ page }) => {
    await page.waitForTimeout(1000);
    const classesContent = page.locator('table, .classes, [class*="class"]').first();
    await expect(classesContent).toBeVisible();
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

  test('should navigate to Attendance page', async ({ page }) => {
    await expect(page).toHaveURL(/attendance/);
  });

  test('should display attendance management', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 5000 });
  });

  test('should have option to mark attendance', async ({ page }) => {
    const assignmentSelect = page.locator('select').first();
    await expect(assignmentSelect).toBeVisible({ timeout: 5000 });
    const optionCount = await assignmentSelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(1);

    await assignmentSelect.selectOption({ index: 1 });
    await page.waitForTimeout(1000);

    await expect(page.getByRole('button', { name: /submit attendance/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display student list for attendance', async ({ page }) => {
    const assignmentSelect = page.locator('select').first();
    await assignmentSelect.selectOption({ index: 1 });
    await page.waitForTimeout(1000);

    const studentList = page.locator('table').first();
    await expect(studentList).toBeVisible();
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

  test('should navigate to Marks page', async ({ page }) => {
    await expect(page).toHaveURL(/marks/);
  });

  test('should display marks management', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Enter Marks' })).toBeVisible({ timeout: 5000 });
  });

  test('should have option to submit marks', async ({ page }) => {
    const assignmentSelect = page.locator('select').first();
    await expect(assignmentSelect).toBeVisible({ timeout: 5000 });
    const optionCount = await assignmentSelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(1);

    await assignmentSelect.selectOption({ index: 1 });
    await page.waitForTimeout(1000);

    await expect(page.getByRole('button', { name: /publish evaluation/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display exam types', async ({ page }) => {
    const examTypeSelect = page.locator('select').nth(1);
    await expect(examTypeSelect).toBeVisible({ timeout: 5000 });

    const optionTexts = await examTypeSelect.locator('option').allTextContents();
    const normalized = optionTexts.join(' ').toLowerCase();

    expect(normalized).toContain('sessional');
    expect(normalized).toContain('mid semester');
    expect(normalized).toContain('end semester');
  });
});

// ============================================
// TIMETABLE
// ============================================

test.describe('Timetable', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/faculty/timetable');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Timetable page', async ({ page }) => {
    await expect(page).toHaveURL(/timetable/);
  });

  test('should display faculty timetable', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /timetable|schedule/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display timetable schedule', async ({ page }) => {
    await page.waitForTimeout(1000);
    const noClassesMessage = page.getByText(/no classes scheduled for/i);
    const hasNoClassesMessage = await noClassesMessage.isVisible().catch(() => false);

    if (hasNoClassesMessage) {
      await expect(noClassesMessage).toBeVisible();
      return;
    }

    await expect(page.getByText(/Class:\s/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Room:\s/i).first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// SUBJECTS
// ============================================

test.describe('Subjects', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/faculty/subjects');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Subjects page', async ({ page }) => {
    await expect(page).toHaveURL(/subjects/);
  });

  test('should display assigned subjects', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Subjects' })).toBeVisible({ timeout: 5000 });
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
    await expect(page.getByRole('heading', { name: /notice|announcement/i })).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// FACULTY WORKFLOW
// ============================================

test.describe('Faculty Complete Workflow', () => {
  
  test('should navigate through all faculty pages', async ({ page }) => {
    // Dashboard
    await page.goto('/faculty/dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('dashboard');
    
    // Classes
    await page.goto('/faculty/classes');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('classes');
    
    // Attendance
    await page.goto('/faculty/attendance');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('attendance');
    
    // Marks
    await page.goto('/faculty/marks');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('marks');
    
    // Timetable
    await page.goto('/faculty/timetable');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('timetable');
    
    // Subjects
    await page.goto('/faculty/subjects');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('subjects');
  });
});
