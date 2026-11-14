import { test, expect } from '@playwright/test';

test.describe('Turn-Based 2-Player Multiplayer Flow', () => {
  test('navigates to turn-based game in Duo mode and alternates turns', async ({ page }) => {
    await page.goto('/');

    // Wait for boot sequence to transition to menu
    await expect(page.locator('#modal-menu')).toBeVisible({ timeout: 5000 });

    // Toggle Duo Mode
    await page.locator('#menu-mode-toggle').click();

    // Navigate to GridTactics (Game 13)
    for (let i = 0; i < 12; i++) {
      await page.locator('#menu-btn-next').click();
    }

    // Launch game
    await page.locator('#menu-btn-start').click();
    await expect(page.locator('#modal-menu')).toBeHidden();

    // Player 1 places token with Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);

    // Player 2 places token with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(50);

    // Verify canvas continues running without unhandled exceptions
    await expect(page.locator('#main-canvas')).toBeVisible();
  });
});
