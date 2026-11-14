import { test, expect } from '@playwright/test';

test.describe('High Scores & Persistence Modal', () => {
  test('persists high scores across page reload', async ({ page }) => {
    await page.goto('/');

    // Seed a score directly in versioned localStorage
    await page.evaluate(() => {
      const scores = { 'brick-stacker': 3200 };
      localStorage.setItem('RETRO_BRICK_V1_HIGHSCORES', JSON.stringify(scores));
    });

    // Reload page
    await page.reload();

    // Verify score retained in localStorage
    const saved = await page.evaluate(() => {
      const data = localStorage.getItem('RETRO_BRICK_V1_HIGHSCORES');
      return JSON.parse(data);
    });

    expect(saved['brick-stacker']).toBe(3200);

    // Wait for boot to finish to menu
    await expect(page.locator('#modal-menu')).toBeVisible({ timeout: 5000 });

    // Open high scores modal via #menu-link-scores
    await page.locator('#menu-link-scores').click();
    await expect(page.locator('#modal-highscores')).toBeVisible();

    // Close high scores modal via #scores-btn-close
    await page.locator('#scores-btn-close').click();
    await expect(page.locator('#modal-highscores')).toBeHidden();
  });
});
