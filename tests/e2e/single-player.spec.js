import { test, expect } from '@playwright/test';

test.describe('Single Player Game Loop & Lifecycle', () => {
  test('launches game, pauses, resumes, and exits back to menu', async ({ page }) => {
    await page.goto('/');

    // Wait for boot sequence to transition to menu
    const menuModal = page.locator('#modal-menu');
    await expect(menuModal).toBeVisible({ timeout: 5000 });

    // Launch active game via #menu-btn-start
    await page.locator('#menu-btn-start').click();
    await expect(menuModal).toBeHidden();

    // Canvas is active and rendering
    const canvas = page.locator('#main-canvas');
    await expect(canvas).toBeVisible();

    // Pause via hardware Pause button
    await page.locator('#btn-pause').click();
    await expect(page.locator('#modal-pause')).toBeVisible();

    // Resume via resume option button
    await page.locator('#pause-opt-resume').click();
    await expect(page.locator('#modal-pause')).toBeHidden();

    // Open Pause menu again and return to Main Menu
    await page.locator('#btn-pause').click();
    await expect(page.locator('#modal-pause')).toBeVisible();
    await page.locator('#pause-opt-menu').click();
    await expect(page.locator('#modal-menu')).toBeVisible();
  });
});
