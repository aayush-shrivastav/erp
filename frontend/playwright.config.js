import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Data-flow tests mutate shared state across roles; keep execution deterministic.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  // Global setup - runs once before all tests
  globalSetup: './playwright/setup.js',
  
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // Add environment variables for tests
    processEnv: {
        ADMIN_EMAIL: 'admin@eduerp.com',
        ADMIN_PASSWORD: 'admin123',
        STUDENT_EMAIL: 'student@test.com',
        STUDENT_PASSWORD: 'pass123',
        FACULTY_EMAIL: 'teacher@test.com',
        FACULTY_PASSWORD: 'pass123',
        ACCOUNTANT_EMAIL: 'accountant@test.com',
        ACCOUNTANT_PASSWORD: 'pass123',
    }
  },

  // Each project runs ONLY its specific test folder
  projects: [
    // Unauthenticated tests - Login and Protected Routes
    {
      name: 'chromium',
      testMatch: '**/tests/auth/**/*.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    // Data Flow E2E Tests - handles its own authentication
    {
      name: 'dataflow',
      testMatch: '**/tests/dataflow.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    // Admin tests
    {
      name: 'admin',
      testMatch: '**/tests/admin/**/*.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/admin.json',
      },
    },
    // Student tests
    {
      name: 'student',
      testMatch: '**/tests/student/**/*.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/student.json',
      },
    },
    // Faculty tests
    {
      name: 'faculty',
      testMatch: '**/tests/faculty/**/*.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/faculty.json',
      },
    },
    // Accountant tests
    {
      name: 'accountant',
      testMatch: '**/tests/accountant/**/*.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/accountant.json',
      },
    },
  ],

  webServer: [
    {
      // Backend API required for login in global auth setup and auth specs.
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://127.0.0.1:5001',
      reuseExistingServer: true,
      timeout: 180 * 1000,
    },
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: true,
      timeout: 180 * 1000,
    },
  ],
});
