import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: false,
  },
  test: {
    globals: true,
    environment: 'node',
    root: resolve(__dirname),
    include: ['tests/**/*.test.js'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
  },
});
