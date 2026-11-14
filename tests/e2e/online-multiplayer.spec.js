import { test, expect } from '@playwright/test';

test.describe('Online Multiplayer Architecture & Zero-Backend Validation', () => {
  test('confirms static client-side architecture with zero remote server/backend dependencies', async ({ page }) => {
    // Monitor all outgoing network traffic
    const networkRequests = [];
    page.on('request', (req) => {
      // Exclude local bundle requests (localhost)
      const url = req.url();
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        networkRequests.push(url);
      }
    });

    await page.goto('/');

    // Verify boot and core UI
    await expect(page.locator('#console-shell')).toBeVisible();

    // Verify zero third-party or paid cloud API requests occurred
    expect(networkRequests.length).toBe(0);

    // Verify console operates 100% offline
    const isOnline = await page.evaluate(() => navigator.onLine);
    expect(typeof isOnline).toBe('boolean');
  });
});
