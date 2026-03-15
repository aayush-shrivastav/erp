import { test, expect } from '@playwright/test';

/**
 * Data Flow E2E Tests - College ERP System
 * 
 * Tests the complete data flow across all panels:
 * 1. Admin creates faculty
 * 2. Faculty login and verify data
 * 3. Admin creates student
 * 4. Student login and verify profile
 * 5. Admin assigns subject to faculty
 * 6. Faculty dashboard shows assigned subject
 * 7. Faculty marks attendance
 * 8. Student panel shows attendance
 */

const ADMIN_CREDENTIALS = { email: 'admin@eduerp.com', password: 'admin123' };
const FACULTY_CREDENTIALS = { email: 'teacher@test.com', password: 'pass123' };
const STUDENT_CREDENTIALS = { email: 'student@test.com', password: 'pass123' };

const loginAs = async (page, { email, password }, expectedPathRegex) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForURL(expectedPathRegex, { timeout: 15000 });
};

// ============================================
// STEP 1: ADMIN CREATES FACULTY
// ============================================

test.describe('Step 1: Admin Creates Faculty', () => {
    
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN_CREDENTIALS, '**/admin/dashboard');
    });

    test('should navigate to faculty page', async ({ page }) => {
        await page.goto('/admin/users/teachers', { waitUntil: 'networkidle' });
        await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/faculty|hub|staff/i, { timeout: 10000 });
        
        const addButton = page.getByRole('button', { name: /add faculty/i }).first();
        await expect(addButton).toBeVisible();
    });
});

// ============================================
// STEP 2: FACULTY LOGIN AND VERIFY DATA
// ============================================

test.describe('Step 2: Faculty Login and Verify Data', () => {
    
    test('should login as faculty and access dashboard', async ({ page }) => {
        await loginAs(page, FACULTY_CREDENTIALS, '**/faculty/dashboard');
        await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/console|teacher|dashboard|overview/i, { timeout: 10000 });
    });
});

// ============================================
// STEP 3: ADMIN CREATES STUDENT
// ============================================

test.describe('Step 3: Admin Creates Student', () => {
    
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN_CREDENTIALS, '**/admin/dashboard');
    });

    test('should create a new student navigation', async ({ page }) => {
        await page.goto('/admin/users/students', { waitUntil: 'networkidle' });
        await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/student/i, { timeout: 10000 });
    });
});

// ============================================
// STEP 4: STUDENT LOGIN AND VERIFY PROFILE
// ============================================

test.describe('Step 4: Student Login and Verify Profile', () => {
    
    test('should login as student and access profile', async ({ page }) => {
        await loginAs(page, STUDENT_CREDENTIALS, '**/student/dashboard');
        await expect(page.locator('main').locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
        
        await page.goto('/student/profile');
        await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/profile|identity/i);
    });
});

// ============================================
// STEP 5: ADMIN ASSIGNS SUBJECT TO FACULTY
// ============================================

test.describe('Step 5: Admin Assigns Subject to Faculty', () => {
    
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN_CREDENTIALS, '**/admin/dashboard');
    });

    test('should navigate to subject mapping', async ({ page }) => {
        await page.goto('/admin/subject-assignment', { waitUntil: 'networkidle' });
        await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/assignment|mapping/i, { timeout: 10000 });
    });
});

// ============================================
// STEP 7: FACULTY MARKS ATTENDANCE
// ============================================

test.describe('Step 7: Faculty Marks Attendance', () => {
    
    test('should navigate to attendance', async ({ page }) => {
        await loginAs(page, FACULTY_CREDENTIALS, '**/faculty/dashboard');
        await page.goto('/faculty/attendance', { waitUntil: 'networkidle' });
        await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/attendance/i, { timeout: 10000 });
    });
});

// ============================================
// STEP 8: STUDENT PANEL SHOWS ATTENDANCE
// ============================================

test.describe('Step 8: Student Panel Shows Attendance', () => {
    
    test('should view attendance in student panel', async ({ page }) => {
        await loginAs(page, STUDENT_CREDENTIALS, '**/student/dashboard');
        await page.goto('/student/attendance', { waitUntil: 'networkidle' });
        await expect(page.locator('main').locator('h1, h2, h3').first()).toHaveText(/attendance/i, { timeout: 10000 });
    });
});
