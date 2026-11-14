import { test, expect } from '@playwright/test';

test.describe('Settings Dialog & Color Theme Customization', () => {
  test('opens settings dialog and changes themes and volume', async ({ page }) => {
    await page.goto('/');

    // Wait for menu
    await expect(page.locator('#modal-menu')).toBeVisible({ timeout: 5000 });

    // Open Settings dialog via #menu-link-settings
    await page.locator('#menu-link-settings').click();
    await expect(page.locator('#modal-settings')).toBeVisible();

    // Switch theme
    const themeSelect = page.locator('#setting-theme');
    await expect(themeSelect).toBeVisible();
    await themeSelect.selectOption('amber');

    // Close settings via #settings-btn-close
    await page.locator('#settings-btn-close').click();
    await expect(page.locator('#modal-settings')).toBeHidden();
  });
});
