// Playwright E2E: Admin Student Workflow
import { test, expect } from '@playwright/test';

test.describe('Student Management Workflow', () => {
  test('Admin login and create student', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="admin@eduerp.com"]', 'admin@eduerp.com');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/dashboard/);

    // Navigate to students
    await page.click('[data-testid="students-link"]');
    await expect(page).toHaveURL(/students/);

    // Create student
    await page.click('[data-testid="add-student"]');
    await page.fill('[data-testid="student-name"]', 'John Doe');
    await page.fill('[data-testid="student-email"]', 'john@example.com');
    await page.selectOption('[data-testid="student-department"]', 'Computer Science');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('Faculty marks entry', async ({ page }) => {
    // Login as faculty
    await page.goto('/login');
    await page.fill('input[placeholder="admin@eduerp.com"]', 'teacher@test.com');
    await page.fill('input[placeholder="••••••••"]', 'pass123');
    await page.click('button:has-text("Sign In")');

    // Navigate to marks
    await page.click('[data-testid="marks-link"]');
    await expect(page).toHaveURL(/marks/);

    // Enter marks
    await page.fill('[data-testid="mst1"]', '20');
    await page.click('button:has-text("Save Marks")');
    await expect(page.locator('text=Saved')).toBeVisible();
  });
});
