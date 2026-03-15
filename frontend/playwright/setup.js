import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global setup for Playwright.
 * Creates per-role authenticated storage states and fails fast on any auth issue.
 */
async function globalSetup(config) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseURL = config?.projects?.[0]?.use?.baseURL || 'http://127.0.0.1:5173';

  const users = [
    { email: 'admin@eduerp.com', password: 'admin123', role: 'Admin', filename: 'admin.json', expectedPath: '/admin/dashboard' },
    { email: 'accountant@test.com', password: 'pass123', role: 'Accountant', filename: 'accountant.json', expectedPath: '/accountant/dashboard' },
    { email: 'teacher@test.com', password: 'pass123', role: 'Faculty', filename: 'faculty.json', expectedPath: '/faculty/dashboard' },
    { email: 'student@test.com', password: 'pass123', role: 'Student', filename: 'student.json', expectedPath: '/student/dashboard' }
  ];

  const authDir = path.join(process.cwd(), 'playwright', '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  for (const user of users) {
    const storagePath = path.join(authDir, user.filename);
    if (fs.existsSync(storagePath)) {
      fs.unlinkSync(storagePath);
    }
  }

  console.log('\nStarting Playwright authentication setup...\n');
  const failures = [];

  for (const user of users) {
    const storagePath = path.join(authDir, user.filename);
    let context;

    try {
      console.log(`Authenticating as ${user.role}...`);

      context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      });
      const page = await context.newPage();

      await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('#login-email, input[type="email"]', { timeout: 10000 });

      await page.fill('#login-email, input[type="email"]', user.email);
      await page.fill('#login-password, input[type="password"]', user.password);
      await page.click('button[type="submit"]');

      try {
        await page.waitForURL(`**${user.expectedPath}`, { timeout: 20000 });
      } catch (waitError) {
        const currentUrl = page.url();
        const errorBanner = page.locator('div.bg-red-50').first();
        const hasErrorBanner = await errorBanner.isVisible().catch(() => false);
        const errorText = hasErrorBanner ? (await errorBanner.innerText()).trim() : '';
        const storageKeys = await page.evaluate(() => ({
          hasToken: !!localStorage.getItem('token'),
          hasUser: !!localStorage.getItem('user')
        }));

        throw new Error(
          [
            waitError.message,
            `Current URL: ${currentUrl}`,
            errorText ? `Login error: ${errorText}` : 'Login error: (none rendered on page)',
            `LocalStorage keys - token: ${storageKeys.hasToken}, user: ${storageKeys.hasUser}`
          ].join('\n')
        );
      }
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      const token = await page.evaluate(() => localStorage.getItem('token'));
      const localUser = await page.evaluate(() => localStorage.getItem('user'));
      if (!token || !localUser) {
        throw new Error('Missing token or user in localStorage after login');
      }

      await context.storageState({ path: storagePath });

      const savedState = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
      const origin = savedState.origins?.find((o) => o.origin === baseURL);
      const hasToken = origin?.localStorage?.some((entry) => entry.name === 'token');
      const hasUser = origin?.localStorage?.some((entry) => entry.name === 'user');
      if (!hasToken || !hasUser) {
        throw new Error('Saved storageState is missing token/user keys');
      }

      console.log(`Authenticated as ${user.role}`);
    } catch (error) {
      failures.push(`${user.role}: ${error.message}`);
      console.error(`Failed auth for ${user.role}: ${error.message}`);
    } finally {
      if (context) {
        await context.close();
      }
    }
  }

  await browser.close();

  if (failures.length > 0) {
    const errorMsg = `Global auth setup failed: ${failures.join('\n---\n')}`;
    fs.writeFileSync(path.join(process.cwd(), 'auth-setup-error.log'), errorMsg);
    throw new Error(errorMsg);
  }

  console.log('\nPlaywright authentication setup completed.\n');
}

export default globalSetup;
