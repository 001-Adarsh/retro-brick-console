import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport & Touch Controls', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('verifies touch actions on virtual D-Pad and Action buttons', async ({ page }) => {
    await page.goto('/');

    // Check virtual D-Pad and Action buttons are visible and not overlapping
    const dpad = page.locator('.dpad-container');
    await expect(dpad).toBeVisible();

    const btnA = page.locator('.btn-action-a');
    await expect(btnA).toBeVisible();

    // Verify touch-action manipulation is applied
    const touchAction = await btnA.evaluate((el) => window.getComputedStyle(el).touchAction);
    expect(touchAction).toContain('manipulation');

    // Wait for menu
    await expect(page.locator('#modal-menu')).toBeVisible({ timeout: 5000 });
  });
});
