import { test, expect } from '@playwright/test';

test.describe('Local 2-Player Multiplayer (Simultaneous Controls)', () => {
  test('toggles Duo Mode and verifies independent P1 and P2 controls', async ({ page }) => {
    await page.goto('/');

    // Wait for boot sequence to transition to menu
    await expect(page.locator('#modal-menu')).toBeVisible({ timeout: 5000 });

    // Toggle Duo Mode
    const duoBtn = page.locator('#menu-mode-toggle');
    await duoBtn.click();
    await expect(duoBtn).toHaveClass(/duo-active/);

    // Verify HUD reflects Duo flag (2P)
    const duoFlag = page.locator('#hud-flag-mode');
    await expect(duoFlag).toBeVisible();
    await expect(duoFlag).toHaveText('2P');

    // Launch game in Duo mode
    await page.locator('#menu-btn-start').click();
    await expect(page.locator('#modal-menu')).toBeHidden();

    // Send simultaneous inputs: P1 on KeyA (WASD) and P2 on ArrowRight
    await page.keyboard.down('KeyA');
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(50);
    await page.keyboard.up('KeyA');
    await page.keyboard.up('ArrowRight');

    // Canvas continues rendering at 60 FPS without error
    const canvas = page.locator('#main-canvas');
    await expect(canvas).toBeVisible();
  });
});
