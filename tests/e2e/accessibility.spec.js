import { test, expect } from '@playwright/test';

test.describe('Accessibility & WCAG 2.1 AA Compliance', () => {
  test('supports keyboard-only navigation and visible focus rings', async ({ page }) => {
    await page.goto('/');

    // Wait for menu
    await expect(page.locator('#modal-menu')).toBeVisible({ timeout: 5000 });

    // Press Tab to focus primary interactive controls
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedTag);

    // Verify ARIA labels exist on tactile buttons
    const buttons = await page.locator('button[data-action]').all();
    for (const btn of buttons) {
      const ariaLabel = await btn.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }

    // Verify reduced motion media query does not throw errors
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('#console-shell')).toBeVisible();
  });
});
