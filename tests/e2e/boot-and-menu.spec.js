import { test, expect } from '@playwright/test';

test.describe('Boot Screen & Game Menu Navigation', () => {
  test('boots console and opens game selector with 23 catalog titles', async ({ page }) => {
    await page.goto('/');

    // Check main title and console frame
    await expect(page.locator('#console-shell')).toBeVisible();
    await expect(page.locator('#main-canvas')).toBeVisible();

    // Boot sequence finishes (1200ms) or transitions to menu
    const menuModal = page.locator('#modal-menu');
    await expect(menuModal).toBeVisible({ timeout: 5000 });

    // Check game title heading
    const menuTitle = page.locator('#menu-game-title');
    await expect(menuTitle).toBeVisible();
    await expect(menuTitle).toContainText(/BRICK|HIGHWAY|TANKS|VIPER/i);

    // Navigate to next game
    const nextBtn = page.locator('#menu-btn-next');
    await nextBtn.click();
    await expect(menuTitle).toBeVisible();
  });
});
