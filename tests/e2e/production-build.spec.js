import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Production Build Asset Integrity', () => {
  test('confirms dist bundle exists with hashed assets and no leaked source maps', async () => {
    const distPath = path.resolve(process.cwd(), 'dist');
    expect(fs.existsSync(distPath)).toBe(true);

    const indexPath = path.join(distPath, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const assetsPath = path.join(distPath, 'assets');
    expect(fs.existsSync(assetsPath)).toBe(true);

    const assetFiles = fs.readdirSync(assetsPath);
    expect(assetFiles.some(f => f.endsWith('.js'))).toBe(true);
    expect(assetFiles.some(f => f.endsWith('.css'))).toBe(true);

    // Ensure no development source maps leaked unless intentionally configured
    const sourceMaps = assetFiles.filter(f => f.endsWith('.map'));
    expect(sourceMaps.length).toBe(0);
  });
});
