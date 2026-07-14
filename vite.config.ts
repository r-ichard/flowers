/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Flowers are loaded from the repo-root `flowers/` folder via import.meta.glob
// (see src/flowers/loader.ts). Base is relative so the built site works under
// any host path (Netlify root, PR preview subpaths, etc.).
export default defineConfig({
  base: './',
  plugins: [react()],
  // Keep `npm run mutation` (Stryker's sandbox) from triggering dev-server reloads.
  server: { watch: { ignored: ['**/.stryker-tmp/**', '**/reports/**', '**/coverage/**'] } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
});
