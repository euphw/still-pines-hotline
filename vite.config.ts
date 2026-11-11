/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on GitHub Pages sub-paths.
  base: './',
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
